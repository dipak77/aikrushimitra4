import React, { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/* ─── TYPES ─── */

export interface EmotionOrbProps {
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isListening: boolean;
  status: string;
  mode?: 'cinematic' | 'minimal';
  cameraEnabled?: boolean;
  onFaceData?: (data: FaceTrackingData | null) => void;
  onEmotionData?: (data: EmotionData) => void;
  onVoiceData?: (data: VoiceData) => void;
}

type AIState = 'idle' | 'listening' | 'processing' | 'speaking';

interface FaceTrackingData {
  rotX: number;
  rotY: number;
  mouthOpen: number;
  leftEyeOpen: number;
  rightEyeOpen: number;
  detected: boolean;
}

interface EmotionData {
  emotion: string;
}

interface VoiceData {
  level: number;
}

/* ─── OPTIMIZED SHADERS ─── */

const EyeShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffff') },
    uIntensity: { value: 1.0 },
    uPulse: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uPulse;
    varying vec2 vUv;
    
    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      
      // Outer ring
      float ring = smoothstep(0.4, 0.38, dist) * smoothstep(0.32, 0.34, dist);
      
      // Inner ring
      float innerRing = smoothstep(0.3, 0.28, dist) * smoothstep(0.22, 0.24, dist);
      
      // Pulse effect
      float pulse = sin(uTime * 3.0 + uPulse) * 0.5 + 0.5;
      
      // Combine
      float alpha = (ring + innerRing * 0.6) * uIntensity;
      vec3 finalColor = uColor * (1.0 + pulse * 0.3);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const RingShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffff') },
    uOpacity: { value: 0.3 },
    uSpeed: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uSpeed;
    varying vec2 vUv;
    
    void main() {
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      
      // Rotating segments
      float segments = sin(angle * 12.0 - uTime * uSpeed) * 0.5 + 0.5;
      segments = pow(segments, 3.0);
      
      // Radial lines
      float lines = step(0.98, fract(angle * 30.0 / 3.14159));
      
      float alpha = (segments * 0.8 + lines * 0.2) * uOpacity;
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `
};

/* ─── OPTIMIZED MATERIALS ─── */

const materials = {
  body: new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  }),
  
  head: new THREE.MeshPhysicalMaterial({
    color: '#0a0a0a',
    roughness: 0.15,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }),
  
  accent: new THREE.MeshPhysicalMaterial({
    color: '#e0e0e0',
    roughness: 0.3,
    metalness: 0.2,
  }),
  
  glow: new THREE.MeshBasicMaterial({
    color: '#00ffff',
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  }),
};

/* ─── ANIMATED EYE COMPONENT ─── */

const AnimatedEye = memo(({ 
  position, 
  aiState, 
  audioLevel,
  blinkAmount 
}: { 
  position: [number, number, number];
  aiState: AIState;
  audioLevel: number;
  blinkAmount: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
      shaderRef.current.uniforms.uIntensity.value = 
        aiState === 'speaking' ? 1.5 + audioLevel * 0.5 : 
        aiState === 'listening' ? 1.2 : 1.0;
      shaderRef.current.uniforms.uPulse.value = position[0] > 0 ? 0 : Math.PI;
    }
    
    if (meshRef.current) {
      // Blink animation
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        1 - blinkAmount * 0.9,
        0.3
      );
    }
    
    if (glowRef.current) {
      const pulse = Math.sin(t * 2) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + pulse * 0.15 + audioLevel * 0.2);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + pulse * 0.2 + audioLevel * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Eye shader */}
      <mesh ref={meshRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[0.22, 0.22]} />
        <shaderMaterial
          ref={shaderRef}
          uniforms={THREE.UniformsUtils.clone(EyeShader.uniforms)}
          vertexShader={EyeShader.vertexShader}
          fragmentShader={EyeShader.fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light */}
      <pointLight 
        color="#00ffff" 
        intensity={aiState === 'speaking' ? 2 + audioLevel * 2 : 1.5} 
        distance={1.5}
      />
    </group>
  );
});

/* ─── HOLOGRAPHIC RING ─── */

const HolographicRing = memo(({ 
  radius, 
  speed, 
  aiState,
  audioLevel 
}: { 
  radius: number;
  speed: number;
  aiState: AIState;
  audioLevel: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += speed * 0.01;
    }
    
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uOpacity.value = 
        aiState === 'speaking' ? 0.4 + audioLevel * 0.3 : 
        aiState === 'listening' ? 0.35 : 0.25;
      shaderRef.current.uniforms.uSpeed.value = 
        aiState === 'speaking' ? 3 : aiState === 'listening' ? 2 : 1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[radius, radius]} />
      <shaderMaterial
        ref={shaderRef}
        uniforms={THREE.UniformsUtils.clone(RingShader.uniforms)}
        vertexShader={RingShader.vertexShader}
        fragmentShader={RingShader.fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

/* ─── SIMPLE BIRD HEAD ─── */

const BirdHead = memo(({ 
  aiState, 
  audioLevel, 
  lookTarget,
  blinkAmount 
}: { 
  aiState: AIState;
  audioLevel: number;
  lookTarget: THREE.Vector2;
  blinkAmount: number;
}) => {
  const headRef = useRef<THREE.Group>(null);
  const beakRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (headRef.current) {
      // Head tracking
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        lookTarget.x * 0.5,
        0.1
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        lookTarget.y * 0.3,
        0.1
      );

      // Idle animation
      if (aiState === 'idle') {
        headRef.current.rotation.z = Math.sin(t * 0.8) * 0.08;
      }
    }

    if (beakRef.current) {
      // Talking animation
      if (aiState === 'speaking') {
        const talk = Math.sin(t * 15) * Math.sin(t * 8.5) * audioLevel;
        beakRef.current.rotation.x = Math.max(0, talk * 0.3);
      } else {
        beakRef.current.rotation.x = THREE.MathUtils.lerp(
          beakRef.current.rotation.x,
          0,
          0.2
        );
      }
    }
  });

  return (
    <group ref={headRef} position={[0, 0.5, 0]}>
      {/* Head sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <primitive object={materials.head} />
      </mesh>

      {/* Eyes */}
      <AnimatedEye 
        position={[-0.12, 0.05, 0.32]} 
        aiState={aiState} 
        audioLevel={audioLevel}
        blinkAmount={blinkAmount}
      />
      <AnimatedEye 
        position={[0.12, 0.05, 0.32]} 
        aiState={aiState} 
        audioLevel={audioLevel}
        blinkAmount={blinkAmount}
      />

      {/* Beak */}
      <group ref={beakRef} position={[0, -0.08, 0.32]}>
        <mesh rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshStandardMaterial color="#ff9933" roughness={0.3} />
        </mesh>
      </group>

      {/* Antenna/Ear tufts */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.25, 0.25, 0]} rotation={[0, 0, side * 0.4]}>
          <mesh>
            <coneGeometry args={[0.04, 0.2, 8]} />
            <primitive object={materials.accent} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <primitive object={materials.glow} />
          </mesh>
          <pointLight position={[0, 0.12, 0]} color="#00ffff" intensity={0.5} distance={0.5} />
        </group>
      ))}
    </group>
  );
});

/* ─── SIMPLE BODY ─── */

const BirdBody = memo(({ audioLevel }: { audioLevel: number }) => {
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bodyRef.current) {
      const breathe = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
      bodyRef.current.scale.setScalar(breathe + audioLevel * 0.03);
    }
  });

  return (
    <group ref={bodyRef} position={[0, 0, 0]}>
      {/* Main body */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <primitive object={materials.body} />
      </mesh>

      {/* Chest detail */}
      <mesh position={[0, 0, 0.38]} scale={[0.7, 0.6, 0.3]}>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <primitive object={materials.accent} />
      </mesh>

      {/* Neck ring */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.015, 16, 32]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
});

/* ─── SIMPLE WINGS ─── */

const Wing = memo(({ 
  side, 
  aiState, 
  audioLevel 
}: { 
  side: 'left' | 'right';
  aiState: AIState;
  audioLevel: number;
}) => {
  const wingRef = useRef<THREE.Group>(null);
  const sign = side === 'left' ? -1 : 1;

  useFrame((state) => {
    if (wingRef.current) {
      const t = state.clock.getElapsedTime();
      
      let targetAngle = sign * 0.6;
      
      if (aiState === 'speaking') {
        targetAngle = sign * (0.4 + Math.sin(t * 3) * 0.3 * audioLevel);
      } else if (aiState === 'listening') {
        targetAngle = sign * (0.7 + Math.sin(t * 2) * 0.15);
      }

      wingRef.current.rotation.z = THREE.MathUtils.lerp(
        wingRef.current.rotation.z,
        targetAngle,
        0.1
      );

      wingRef.current.rotation.x = Math.sin(t * 4) * 0.08;
    }
  });

  return (
    <group ref={wingRef} position={[sign * 0.38, 0.1, -0.1]}>
      {/* Upper wing */}
      <mesh position={[sign * 0.15, 0, 0]} rotation={[0, 0, sign * 0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#88ccff" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Lower wing */}
      <mesh position={[sign * 0.25, -0.15, 0]} rotation={[0, 0, sign * 0.3]}>
        <boxGeometry args={[0.25, 0.08, 0.04]} />
        <meshStandardMaterial color="#5599dd" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
});

/* ─── OPTIMIZED PARTICLES ─── */

const FloatingParticles = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.getElapsedTime() + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={aiState === 'speaking' ? 0.03 : 0.02}
        color={aiState === 'listening' ? '#00ff88' : '#00ccff'}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
});

/* ─── MAIN AI BIRD ─── */

const AIBird = memo(({ 
  aiState, 
  audioLevel, 
  faceData 
}: { 
  aiState: AIState;
  audioLevel: number;
  faceData: FaceTrackingData | null;
}) => {
  const [blinkAmount, setBlinkAmount] = useState(0);
  const [lookTarget] = useState(() => new THREE.Vector2(0, 0));
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Blink animation
  useEffect(() => {
    const blink = () => {
      setBlinkAmount(1);
      setTimeout(() => setBlinkAmount(0), 100);
      blinkTimerRef.current = setTimeout(blink, 2000 + Math.random() * 3000);
    };
    blinkTimerRef.current = setTimeout(blink, 2000);
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Look target
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (faceData?.detected) {
      // Smoothed looking at user
      lookTarget.x = THREE.MathUtils.lerp(lookTarget.x, -faceData.rotY * 1.5, 0.08);
      lookTarget.y = THREE.MathUtils.lerp(lookTarget.y, -faceData.rotX * 1.5, 0.08);
    } else {
      // Idle looking around
      lookTarget.x = THREE.MathUtils.lerp(lookTarget.x, Math.sin(t * 0.3) * 0.5, 0.02);
      lookTarget.y = THREE.MathUtils.lerp(lookTarget.y, Math.cos(t * 0.25) * 0.3, 0.02);
    }
  });

  return (
    <>
      <BirdBody audioLevel={audioLevel} />
      <BirdHead 
        aiState={aiState} 
        audioLevel={audioLevel} 
        lookTarget={lookTarget}
        blinkAmount={blinkAmount}
      />
      <Wing side="left" aiState={aiState} audioLevel={audioLevel} />
      <Wing side="right" aiState={aiState} audioLevel={audioLevel} />
    </>
  );
});

/* ─── FACE TRACKER ─── */

const FaceTracker = memo(({ 
  stream, 
  onFaceData 
}: { 
  stream: MediaStream; 
  onFaceData: (data: FaceTrackingData) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const lastTimeRef = useRef(-1);

  // Setup video element
  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    // Set explicit size for Mediapipe
    video.width = 320;
    video.height = 240;
    videoRef.current = video;

    let isMounted = true;

    const init = async () => {
      try {
        const resolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        if (!isMounted) return;

        landmarkerRef.current = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
      } catch (e) {
        console.error('FaceLandmarker init failed:', e);
      }
    };
    init();

    return () => {
      isMounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (landmarkerRef.current) {
        (landmarkerRef.current as any).close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Update video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Detection loop
  useFrame(() => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.paused) return;

    if (videoRef.current.currentTime !== lastTimeRef.current) {
      lastTimeRef.current = videoRef.current.currentTime;
      try {
        const now = performance.now();
        const result = landmarkerRef.current.detectForVideo(videoRef.current, now);
        
        if (result.facialTransformationMatrixes?.length > 0) {
          const matrix = result.facialTransformationMatrixes[0].data;
          // Matrix is 4x4, rotation is roughly encoded.
          // Getting look direction from rotation part of matrix
          onFaceData({
            rotX: -(matrix as any)[9] || 0, // Approx pitch
            rotY: -(matrix as any)[8] || 0, // Approx yaw
            mouthOpen: 0,
            leftEyeOpen: 1,
            rightEyeOpen: 1,
            detected: true
          });
        } else {
          onFaceData({ rotX: 0, rotY: 0, mouthOpen: 0, leftEyeOpen: 1, rightEyeOpen: 1, detected: false });
        }
      } catch (e) {
        // Handle stream resets or sizing errors gracefully
      }
    }
  });

  return null;
});

/* ─── SCENE ─── */

const Scene = memo(({
  stream,
  analyser,
  isSpeaking,
  isListening,
  status,
  onFaceData,
}: EmotionOrbProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null);
  const audioDataRef = useRef(new Uint8Array(128));

  const aiState: AIState = useMemo(() => {
    if (isSpeaking) return 'speaking';
    if (status === 'connecting' || status === 'reconnecting') return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  }, [isSpeaking, isListening, status]);

  const handleFaceData = useCallback((data: FaceTrackingData) => {
    setFaceData(data);
    onFaceData?.(data);
  }, [onFaceData]);

  useFrame(() => {
    if (analyser) {
      try {
        if (audioDataRef.current.length !== analyser.frequencyBinCount) {
          audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(audioDataRef.current);
        
        let sum = 0;
        // Check only lower frequencies for voice activity
        const bins = Math.min(audioDataRef.current.length, 64);
        for(let i=0; i<bins; i++) {
            sum += audioDataRef.current[i];
        }
        const avg = sum / bins / 255;
        
        // Smooth transition
        setAudioLevel(prev => THREE.MathUtils.lerp(prev, avg, 0.2));
      } catch (e) {
        // Analyser might be disconnected
      }
    } else {
      setAudioLevel(0);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 3.5]} fov={45} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#aaccff" />
      <pointLight position={[0, 2, 1]} color="#00ffff" intensity={1} distance={4} />

      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.3}>
        <AIBird aiState={aiState} audioLevel={audioLevel} faceData={faceData} />
      </Float>

      {/* Holographic rings */}
      <HolographicRing radius={3} speed={1} aiState={aiState} audioLevel={audioLevel} />
      <HolographicRing radius={3.8} speed={-0.8} aiState={aiState} audioLevel={audioLevel} />
      <HolographicRing radius={4.5} speed={0.6} aiState={aiState} audioLevel={audioLevel} />

      <FloatingParticles aiState={aiState} audioLevel={audioLevel} />

      {stream && <FaceTracker stream={stream} onFaceData={handleFaceData} />}

      <Environment preset="city" background={false} />

      <EffectComposer multisampling={2}>
        <Bloom
          intensity={aiState === 'speaking' ? 1.5 : 0.8}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.4}
          radius={0.4}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0005, 0.0005)}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
});

/* ─── STATUS INDICATOR ─── */

const StatusIndicator = memo(({ aiState, isSpeaking, isListening, cameraEnabled }: {
  aiState: AIState;
  isSpeaking: boolean;
  isListening: boolean;
  cameraEnabled?: boolean;
}) => {
  const getStatusColor = () => {
    if (isSpeaking) return 'bg-cyan-400 shadow-cyan-400/70';
    if (isListening) return 'bg-emerald-400 shadow-emerald-400/70';
    return 'bg-slate-500';
  };

  const getStatusText = () => {
    if (isSpeaking) return 'AI SPEAKING';
    if (isListening) return 'LISTENING';
    return 'STANDBY';
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
      <div className={`
        px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10
        flex items-center gap-2 transition-all duration-300
        bg-black/40
      `}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse shadow-[0_0_10px_currentColor]`} />
        <span className="text-[10px] font-mono font-bold text-white/80 tracking-widest">
          {getStatusText()}
        </span>
      </div>
      
      {cameraEnabled && (
        <div className="text-[9px] font-mono text-cyan-400/60 tracking-widest animate-pulse">
          VISION ACTIVE
        </div>
      )}
    </div>
  );
});

/* ─── EXPORTED COMPONENT ─── */

export default function EmotionAwareOrb(props: EmotionOrbProps) {
  const aiState: AIState = useMemo(() => {
    if (props.isSpeaking) return 'speaking';
    if (props.status === 'connecting' || props.status === 'reconnecting') return 'processing';
    if (props.isListening) return 'listening';
    return 'idle';
  }, [props.isSpeaking, props.isListening, props.status]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={[1, 2]}
        gl={{ 
          antialias: false, 
          toneMapping: THREE.ReinhardToneMapping,
          toneMappingExposure: 1.5,
          alpha: true 
        }}
      >
        <Scene {...props} />
      </Canvas>
      
      <StatusIndicator 
        aiState={aiState}
        isSpeaking={props.isSpeaking}
        isListening={props.isListening}
        cameraEnabled={props.cameraEnabled}
      />
    </div>
  );
}