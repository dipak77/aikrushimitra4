
import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// --- Type Augmentation for R3F Intrinsic Elements ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      shaderMaterial: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

// --- Types ---
interface EmotionOrbProps {
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isListening: boolean;
  status: string;
}

type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful';

// --- Config ---
const EMOTION_COLORS: Record<Emotion, { core: string; glow: string }> = {
  neutral:   { core: '#00ffff', glow: '#0088ff' }, // Cyan
  happy:     { core: '#ffdd00', glow: '#ff8800' }, // Gold
  sad:       { core: '#6666ff', glow: '#3333aa' }, // Blue
  angry:     { core: '#ff3333', glow: '#aa0000' }, // Red
  surprised: { core: '#ff88ff', glow: '#cc44cc' }, // Pink
  fearful:   { core: '#88ff88', glow: '#44aa44' }, // Green
};

// --- Shaders ---
const OrbShader = {
  vertex: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uDistort;
    
    // Simplex noise (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) { 
      const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      vec3 pos = position;
      float noise = snoise(vec3(pos.x * 2.0 + uTime, pos.y * 2.0 + uTime, pos.z * 2.0));
      pos += normal * noise * uDistort;
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragment: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColorCore;
    uniform vec3 uColorGlow;
    uniform float uTime;
    uniform float uIntensity;

    void main() {
      // Fresnel Effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
      
      // Circuit Pattern (Procedural)
      float circuit = sin(vPosition.y * 20.0 + uTime * 2.0) * sin(vPosition.x * 20.0);
      float lines = step(0.98, abs(circuit));
      
      vec3 baseColor = mix(uColorCore, uColorGlow, fresnel);
      vec3 finalColor = baseColor + (uColorGlow * lines * uIntensity);
      
      // Alpha glow for edges
      float alpha = fresnel * 0.8 + 0.2;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// --- Main Orb Component ---
const OrbMesh = ({ emotion, audioLevel, isSpeaking }: { emotion: Emotion, audioLevel: number, isSpeaking: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const colors = EMOTION_COLORS[emotion];
  
  // Smoothly interpolate colors
  const coreColor = useMemo(() => new THREE.Color(colors.core), [colors]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors]);
  const currentCore = useRef(new THREE.Color(colors.core));
  const currentGlow = useRef(new THREE.Color(colors.glow));

  useFrame((state) => {
    if (materialRef.current && meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Lerp colors
      currentCore.current.lerp(coreColor, 0.05);
      currentGlow.current.lerp(glowColor, 0.05);
      
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uColorCore.value = currentCore.current;
      materialRef.current.uniforms.uColorGlow.value = currentGlow.current;
      
      // Reactivity
      const targetDistort = isSpeaking ? 0.3 + (audioLevel * 0.5) : 0.1;
      const targetIntensity = isSpeaking ? 1.5 + (audioLevel * 2.0) : 0.5;
      
      materialRef.current.uniforms.uDistort.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uDistort.value,
        targetDistort,
        0.1
      );
      
      materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        0.1
      );

      // Rotate
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.z = time * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={OrbShader.vertex}
        fragmentShader={OrbShader.fragment}
        uniforms={{
          uTime: { value: 0 },
          uColorCore: { value: coreColor },
          uColorGlow: { value: glowColor },
          uDistort: { value: 0 },
          uIntensity: { value: 1 }
        }}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// --- Face & Emotion Logic ---
const FaceTracker = ({ 
  stream, 
  onEmotionChange, 
  onFaceData 
}: { 
  stream: MediaStream | null, 
  onEmotionChange: (e: Emotion) => void,
  onFaceData: (data: any) => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
      }
    };
    initMediaPipe();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useFrame(() => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());

      if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
        const shapes = result.faceBlendshapes[0].categories;
        const getScore = (name: string) => shapes.find(s => s.categoryName === name)?.score || 0;

        // --- Emotion Logic ---
        const smile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
        const frown = (getScore('mouthFrownLeft') + getScore('mouthFrownRight')) / 2;
        const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
        const eyeWide = (getScore('eyeWideLeft') + getScore('eyeWideRight')) / 2;
        const jawOpen = getScore('jawOpen');

        let detected: Emotion = 'neutral';
        if (smile > 0.5) detected = 'happy';
        else if (browDown > 0.5) detected = 'angry';
        else if (eyeWide > 0.5 && jawOpen > 0.3) detected = 'surprised';
        else if (frown > 0.5) detected = 'sad';

        onEmotionChange(detected);
        
        // Pass tracking data for visual feedback (e.g. eyes following)
        if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
             const matrix = result.facialTransformationMatrixes[0].data;
             // Simplified head rotation logic from matrix
             // Rotation around Y (Yaw) ~ matrix[8], X (Pitch) ~ matrix[9]
             onFaceData({
                 rotX: -matrix[9], // Pitch
                 rotY: -matrix[8], // Yaw
                 smile,
                 eyeOpen: 1 - ((getScore('eyeBlinkLeft') + getScore('eyeBlinkRight')) / 2)
             });
        }
      } else {
          // No face
          onFaceData(null);
      }
    }
  });

  return null;
};

// --- Scene Container ---
const EmotionAwareOrbScene = ({ stream, analyser, isSpeaking, status }: EmotionOrbProps) => {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [audioLevel, setAudioLevel] = useState(0);
  const [faceData, setFaceData] = useState<any>(null);
  
  // Audio Analysis Loop
  useFrame(() => {
    if (analyser) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      setAudioLevel(avg / 255); // Normalize 0-1
    } else {
        setAudioLevel(0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={EMOTION_COLORS[emotion].core} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={EMOTION_COLORS[emotion].glow} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <OrbMesh emotion={emotion} audioLevel={audioLevel} isSpeaking={isSpeaking} />
      </Float>

      <Sparkles 
        count={50} 
        scale={4} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color={EMOTION_COLORS[emotion].glow} 
      />

      <FaceTracker 
        stream={stream} 
        onEmotionChange={setEmotion}
        onFaceData={setFaceData}
      />

      {/* Holographic UI Panel in 3D Space */}
      <Html position={[0, -2.5, 0]} center transform sprite>
         <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
            {/* Status Pill */}
            <div className={`
                px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 
                flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]
                ${status === 'error' ? 'bg-red-500/20' : 'bg-black/40'}
            `}>
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">{status}</span>
            </div>

            {/* Face Tracking HUD */}
            {faceData ? (
                <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] text-cyan-400 font-mono">FACE: LOCKED</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-mono text-white/80">EMOTION: <span style={{ color: EMOTION_COLORS[emotion].core }}>{emotion.toUpperCase()}</span></span>
                    </div>
                </div>
            ) : (
                <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[9px] text-red-400 font-mono animate-pulse">FACE: SEARCHING...</span>
                </div>
            )}
         </div>
      </Html>
    </>
  );
};

// --- Exported Wrapper ---
export default function EmotionAwareOrb(props: EmotionOrbProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
           <EmotionAwareOrbScene {...props} />
        </Suspense>
      </Canvas>
      {/* Loading Overlay if needed, or fallback */}
    </div>
  );
}
