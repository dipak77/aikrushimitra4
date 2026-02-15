import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense, memo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Sparkles, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      planeGeometry: any;
      ringGeometry: any;
      circleGeometry: any;
      shaderMaterial: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      bufferGeometry: any;
      bufferAttribute: any;
      points: any;
      pointsMaterial: any;
      lineBasicMaterial: any;
      line: any;
    }
  }
}

export interface EmotionOrbProps {
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isListening: boolean;
  status: string;
  mode?: 'cinematic' | 'minimal';
  onFaceData?: (data: FaceTrackingData | null) => void;
  onEmotionData?: (data: EmotionData) => void;
  onVoiceData?: (data: VoiceData) => void;
}

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted';

type AIState = 'idle' | 'listening' | 'processing' | 'speaking';

interface FaceTrackingData {
  rotX: number;
  rotY: number;
  smile: number;
  eyeOpenLeft: number;
  eyeOpenRight: number;
  mouthOpen: number;
  detected: boolean;
}

interface EmotionData {
  emotion: Emotion;
  confidence: number;
  valence: number;
  arousal: number;
  scores: Record<Emotion, number>;
}

interface VoiceData {
  level: number;
  isActive: boolean;
  rms: number;
}

// ═══════════════════════════════════════════════════════════════
// EMOTION COLOR SYSTEM
// ═══════════════════════════════════════════════════════════════

const EMOTION_COLORS: Record<Emotion, { core: string; glow: string; accent: string }> = {
  neutral:   { core: '#00ffff', glow: '#0088ff', accent: '#ffffff' },
  happy:     { core: '#ffdd00', glow: '#ff8800', accent: '#ffcc00' },
  sad:       { core: '#6666ff', glow: '#3333aa', accent: '#9999ff' },
  angry:     { core: '#ff3333', glow: '#aa0000', accent: '#ff6666' },
  surprised: { core: '#ff88ff', glow: '#cc44cc', accent: '#ffaaff' },
  fearful:   { core: '#88ff88', glow: '#44aa44', accent: '#aaffaa' },
  disgusted: { core: '#88aa44', glow: '#667722', accent: '#aacc66' },
};

const EMOTION_EMOJIS: Record<Emotion, string> = {
  neutral: '😐', happy: '😊', sad: '😢', angry: '😠',
  surprised: '😮', fearful: '😨', disgusted: '🤢',
};

// ═══════════════════════════════════════════════════════════════
// CUSTOM GLSL SHADERS
// ═══════════════════════════════════════════════════════════════

const OrbVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uDistort;
  uniform float uAudioLevel;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;

    // Multi-layered noise for organic distortion
    float noise1 = snoise(vec3(pos.x * 2.0 + uTime * 0.5, pos.y * 2.0 + uTime * 0.3, pos.z * 2.0));
    float noise2 = snoise(vec3(pos.x * 4.0 - uTime * 0.7, pos.y * 4.0, pos.z * 4.0 + uTime * 0.4)) * 0.5;
    float noise3 = snoise(vec3(pos.x * 8.0, pos.y * 8.0 + uTime * 1.2, pos.z * 8.0)) * 0.25;

    float totalNoise = noise1 + noise2 + noise3;

    // Audio-reactive distortion
    float audioDistort = uAudioLevel * sin(pos.y * 10.0 + uTime * 5.0) * 0.3;

    pos += normal * totalNoise * uDistort;
    pos += normal * audioDistort;

    // Breathing animation
    float breath = sin(uTime * 1.5) * 0.02;
    pos *= 1.0 + breath;

    vPosition = pos;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const OrbFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  uniform vec3 uColorCore;
  uniform vec3 uColorGlow;
  uniform vec3 uColorAccent;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uAudioLevel;
  uniform float uAIState; // 0=idle, 1=listening, 2=processing, 3=speaking

  void main() {
    // Fresnel Effect (edge glow)
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);

    // Circuit Pattern
    float circuitX = sin(vPosition.x * 25.0 + uTime * 2.0);
    float circuitY = sin(vPosition.y * 25.0 - uTime * 1.5);
    float circuitZ = sin(vPosition.z * 25.0 + uTime * 0.8);
    float circuit = step(0.97, abs(circuitX * circuitY)) + step(0.98, abs(circuitY * circuitZ));

    // Neural network wave pattern
    float wave1 = sin(vPosition.y * 15.0 + uTime * 3.0) * 0.5 + 0.5;
    float wave2 = sin(vPosition.x * 12.0 - uTime * 2.0 + 1.57) * 0.5 + 0.5;
    float neuralWave = wave1 * wave2;
    float neuralLine = step(0.92, neuralWave);

    // Energy lines (horizontal bands)
    float energyBand = sin(vPosition.y * 40.0 + uTime * 5.0);
    float energy = smoothstep(0.95, 1.0, energyBand) * uAudioLevel * 2.0;

    // Sparkle effect
    float sparkle = snoise3D(vPosition * 50.0 + uTime * 2.0);
    sparkle = step(0.95, sparkle) * uIntensity;

    // Combine colors
    vec3 baseColor = mix(uColorCore, uColorGlow, fresnel * 0.7);
    vec3 circuitColor = uColorAccent * circuit * uIntensity * 0.8;
    vec3 neuralColor = uColorGlow * neuralLine * 0.5;
    vec3 energyColor = uColorCore * energy;
    vec3 sparkleColor = vec3(1.0) * sparkle * 0.3;

    // Processing state: orange pulsing
    float processingPulse = 0.0;
    if (uAIState > 1.5 && uAIState < 2.5) {
      processingPulse = sin(uTime * 8.0) * 0.5 + 0.5;
      baseColor = mix(baseColor, vec3(1.0, 0.5, 0.0), processingPulse * 0.3);
    }

    vec3 finalColor = baseColor + circuitColor + neuralColor + energyColor + sparkleColor;

    // Glass-like transparency
    float alpha = 0.3 + fresnel * 0.6 + circuit * 0.1 + energy * 0.2;
    alpha = clamp(alpha, 0.2, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }

  // Simple 3D noise for sparkle
  float snoise3D(vec3 v) {
    return fract(sin(dot(v, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
`;

// Simplified fragment without the forward-declared function issue:
const OrbFragmentShaderFixed = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  uniform vec3 uColorCore;
  uniform vec3 uColorGlow;
  uniform vec3 uColorAccent;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uAudioLevel;
  uniform float uAIState;

  float hash3D(vec3 v) {
    return fract(sin(dot(v, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);

    // Circuit Pattern
    float circuitX = sin(vPosition.x * 25.0 + uTime * 2.0);
    float circuitY = sin(vPosition.y * 25.0 - uTime * 1.5);
    float circuitZ = sin(vPosition.z * 25.0 + uTime * 0.8);
    float circuit = step(0.97, abs(circuitX * circuitY)) + step(0.98, abs(circuitY * circuitZ));

    // Neural network waves
    float wave1 = sin(vPosition.y * 15.0 + uTime * 3.0) * 0.5 + 0.5;
    float wave2 = sin(vPosition.x * 12.0 - uTime * 2.0 + 1.57) * 0.5 + 0.5;
    float neuralLine = step(0.92, wave1 * wave2);

    // Energy lines
    float energyBand = sin(vPosition.y * 40.0 + uTime * 5.0);
    float energy = smoothstep(0.95, 1.0, energyBand) * uAudioLevel * 2.0;

    // Sparkle
    float sparkle = step(0.95, hash3D(vPosition * 50.0 + uTime * 2.0)) * uIntensity;

    // Color composition
    vec3 baseColor = mix(uColorCore, uColorGlow, fresnel * 0.7);
    vec3 circuitColor = uColorAccent * circuit * uIntensity * 0.8;
    vec3 neuralColor = uColorGlow * neuralLine * 0.5;
    vec3 energyColor = uColorCore * energy;
    vec3 sparkleColor = vec3(1.0) * sparkle * 0.3;

    // Processing state: orange pulsing
    if (uAIState > 1.5 && uAIState < 2.5) {
      float processingPulse = sin(uTime * 8.0) * 0.5 + 0.5;
      baseColor = mix(baseColor, vec3(1.0, 0.5, 0.0), processingPulse * 0.3);
    }

    vec3 finalColor = baseColor + circuitColor + neuralColor + energyColor + sparkleColor;

    float alpha = 0.3 + fresnel * 0.6 + circuit * 0.1 + energy * 0.2;
    alpha = clamp(alpha, 0.2, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════
// NEON EYES COMPONENT
// ═══════════════════════════════════════════════════════════════

const NeonEye = memo(({ 
  position, 
  lookTarget, 
  eyeOpen, 
  color,
  blinkPhase
}: { 
  position: [number, number, number];
  lookTarget: { x: number; y: number };
  eyeOpen: number;
  color: string;
  blinkPhase: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const currentOpen = useRef(1);

  useFrame((state) => {
    if (!groupRef.current || !pupilRef.current) return;
    const t = state.clock.getElapsedTime();

    // Smooth blink
    const blinkValue = eyeOpen < 0.3 ? 0.1 : 1.0;
    currentOpen.current = THREE.MathUtils.lerp(currentOpen.current, blinkValue, 0.2);
    groupRef.current.scale.y = currentOpen.current;

    // Pupil tracks face position
    const targetX = THREE.MathUtils.clamp(lookTarget.x * 0.15, -0.15, 0.15);
    const targetY = THREE.MathUtils.clamp(lookTarget.y * 0.1, -0.1, 0.1);
    pupilRef.current.position.x = THREE.MathUtils.lerp(pupilRef.current.position.x, targetX, 0.1);
    pupilRef.current.position.y = THREE.MathUtils.lerp(pupilRef.current.position.y, targetY, 0.1);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Eye outline glow */}
      <mesh>
        <circleGeometry args={[0.18, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Eye iris */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.13, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Pupil */}
      <mesh ref={pupilRef} position={[0, 0, 0.02]}>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
      {/* Pupil highlight */}
      <mesh position={[0.03, 0.03, 0.03]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
});

const NeonEyes = memo(({
  faceData,
  emotion,
}: {
  faceData: FaceTrackingData | null;
  emotion: Emotion;
}) => {
  const color = EMOTION_COLORS[emotion].core;
  const lookTarget = useMemo(() => ({
    x: faceData?.rotY || 0,
    y: faceData?.rotX || 0,
  }), [faceData]);

  const eyeOpenLeft = faceData?.eyeOpenLeft ?? 1;
  const eyeOpenRight = faceData?.eyeOpenRight ?? 1;

  return (
    <group position={[0, 0.3, 1.45]}>
      <NeonEye
        position={[-0.3, 0, 0]}
        lookTarget={lookTarget}
        eyeOpen={eyeOpenLeft}
        color={color}
        blinkPhase={0}
      />
      <NeonEye
        position={[0.3, 0, 0]}
        lookTarget={lookTarget}
        eyeOpen={eyeOpenRight}
        color={color}
        blinkPhase={0.1}
      />
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// NEURAL PARTICLES SYSTEM (100 orbiting particles)
// ═══════════════════════════════════════════════════════════════

const NeuralParticles = memo(({ emotion, audioLevel, isSpeaking }: {
  emotion: Emotion;
  audioLevel: number;
  isSpeaking: boolean;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 100;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    const speed = isSpeaking ? 0.03 + audioLevel * 0.05 : 0.01;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Orbit around center
      const x = posArray[idx];
      const z = posArray[idx + 2];
      const angle = Math.atan2(z, x) + speed;
      const radius = Math.sqrt(x * x + z * z);

      posArray[idx] = Math.cos(angle) * radius;
      posArray[idx + 1] += Math.sin(t * 2 + i) * 0.003;
      posArray[idx + 2] = Math.sin(angle) * radius;

      // Keep within bounds
      const dist = Math.sqrt(
        posArray[idx] ** 2 + posArray[idx + 1] ** 2 + posArray[idx + 2] ** 2
      );
      if (dist > 4.0 || dist < 1.8) {
        const scale = 2.5 / dist;
        posArray[idx] *= scale;
        posArray[idx + 1] *= scale;
        posArray[idx + 2] *= scale;
      }
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={EMOTION_COLORS[emotion].core}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
});

// ═══════════════════════════════════════════════════════════════
// HOLOGRAPHIC WING PARTICLES (50 each side)
// ═══════════════════════════════════════════════════════════════

const WingParticles = memo(({ side, emotion, audioLevel, isSpeaking }: {
  side: 'left' | 'right';
  emotion: Emotion;
  audioLevel: number;
  isSpeaking: boolean;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;
  const dir = side === 'left' ? -1 : 1;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const spread = t * 2.5;
      const height = Math.sin(t * Math.PI) * 1.5;
      pos[i * 3] = dir * (1.5 + spread + Math.random() * 0.5);
      pos[i * 3 + 1] = (Math.random() - 0.5) * height;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return pos;
  }, [dir]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    const flap = isSpeaking ? Math.sin(t * 4) * 0.3 : Math.sin(t * 1.5) * 0.1;
    const reactivity = isSpeaking ? 1.0 + audioLevel * 2.0 : 1.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const progress = i / count;

      // Flow outward like code stream
      posArray[idx] += dir * 0.01 * reactivity;
      posArray[idx + 1] += Math.sin(t * 3 + i * 0.5) * 0.005;
      posArray[idx + 1] += flap * progress;
      posArray[idx + 2] += Math.cos(t * 2 + i) * 0.003;

      // Reset when too far
      const distFromCenter = Math.abs(posArray[idx]);
      if (distFromCenter > 4.0) {
        posArray[idx] = dir * (1.5 + Math.random() * 0.3);
        posArray[idx + 1] = (Math.random() - 0.5) * 0.5;
        posArray[idx + 2] = (Math.random() - 0.5) * 0.3;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={EMOTION_COLORS[emotion].accent}
        transparent
        opacity={isSpeaking ? 0.9 : 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
});

// ═══════════════════════════════════════════════════════════════
// PROCESSING RINGS
// ═══════════════════════════════════════════════════════════════

const ProcessingRings = memo(({ aiState, emotion }: { aiState: AIState; emotion: Emotion }) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isProcessing = aiState === 'processing';
    const targetOpacity = isProcessing ? 0.6 : (aiState === 'speaking' ? 0.3 : 0);

    [ring1Ref, ring2Ref, ring3Ref].forEach((ref, i) => {
      if (!ref.current) return;
      const mat = ref.current.material as THREE.MeshBasicMaterial;

      ref.current.rotation.x = t * (0.5 + i * 0.3);
      ref.current.rotation.y = t * (0.3 + i * 0.2);
      ref.current.rotation.z = t * (0.2 + i * 0.4);

      const scale = isProcessing ? 1.0 + Math.sin(t * 4 + i * 2) * 0.1 : 1.0;
      ref.current.scale.setScalar(scale);

      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);
    });
  });

  const ringColor = aiState === 'processing' ? '#ff8800' : EMOTION_COLORS[emotion].core;

  return (
    <group>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.9, 2.0, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[2.2, 2.3, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring3Ref}>
        <ringGeometry args={[2.5, 2.55, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// SPEAKING TRAIL EFFECT
// ═══════════════════════════════════════════════════════════════

const SpeakingTrails = memo(({ isSpeaking, emotion, audioLevel }: {
  isSpeaking: boolean;
  emotion: Emotion;
  audioLevel: number;
}) => {
  const trailsRef = useRef<THREE.Points>(null);
  const count = 60;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.6;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = 0;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!trailsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = trailsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    const expansion = isSpeaking ? 1.0 + audioLevel * 1.5 : 0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const angle = (i / count) * Math.PI * 2 + t * 2;
      const r = 1.6 + Math.sin(t * 5 + i * 0.5) * 0.3 * expansion;

      posArray[idx] = Math.cos(angle) * r;
      posArray[idx + 1] = Math.sin(angle) * r;
      posArray[idx + 2] = Math.sin(t * 3 + i * 0.3) * 0.5 * expansion;
    }
    posAttr.needsUpdate = true;

    const mat = trailsRef.current.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, isSpeaking ? 0.8 : 0.1, 0.1);
  });

  return (
    <points ref={trailsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={EMOTION_COLORS[emotion].glow}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN ORB MESH WITH SHADER
// ═══════════════════════════════════════════════════════════════

const OrbMesh = memo(({
  emotion,
  audioLevel,
  isSpeaking,
  aiState,
  faceData,
}: {
  emotion: Emotion;
  audioLevel: number;
  isSpeaking: boolean;
  aiState: AIState;
  faceData: FaceTrackingData | null;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const colors = EMOTION_COLORS[emotion];

  const coreColor = useMemo(() => new THREE.Color(colors.core), [colors.core]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors.glow]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
  const currentCore = useRef(new THREE.Color(colors.core));
  const currentGlow = useRef(new THREE.Color(colors.glow));
  const currentAccent = useRef(new THREE.Color(colors.accent));

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorCore: { value: new THREE.Color(colors.core) },
    uColorGlow: { value: new THREE.Color(colors.glow) },
    uColorAccent: { value: new THREE.Color(colors.accent) },
    uDistort: { value: 0 },
    uIntensity: { value: 1 },
    uAudioLevel: { value: 0 },
    uAIState: { value: 0 },
  }), []);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Smooth color interpolation
    currentCore.current.lerp(coreColor, 0.03);
    currentGlow.current.lerp(glowColor, 0.03);
    currentAccent.current.lerp(accentColor, 0.03);

    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uColorCore.value.copy(currentCore.current);
    materialRef.current.uniforms.uColorGlow.value.copy(currentGlow.current);
    materialRef.current.uniforms.uColorAccent.value.copy(currentAccent.current);
    materialRef.current.uniforms.uAudioLevel.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uAudioLevel.value, audioLevel, 0.15
    );

    // AI State mapping
    const stateMap: Record<AIState, number> = { idle: 0, listening: 1, processing: 2, speaking: 3 };
    materialRef.current.uniforms.uAIState.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uAIState.value, stateMap[aiState], 0.05
    );

    // Distortion based on state
    let targetDistort = 0.05; // idle breathing
    if (aiState === 'listening') targetDistort = 0.1;
    if (aiState === 'processing') targetDistort = 0.15 + Math.sin(time * 6) * 0.05;
    if (aiState === 'speaking') targetDistort = 0.2 + audioLevel * 0.4;

    materialRef.current.uniforms.uDistort.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uDistort.value, targetDistort, 0.08
    );

    // Intensity
    let targetIntensity = 0.5;
    if (aiState === 'listening') targetIntensity = 1.0;
    if (aiState === 'processing') targetIntensity = 1.5;
    if (aiState === 'speaking') targetIntensity = 1.5 + audioLevel * 2.0;

    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uIntensity.value, targetIntensity, 0.08
    );

    // Rotation
    const baseRotY = time * 0.15;
    const baseRotZ = time * 0.08;
    const faceRotY = faceData ? faceData.rotY * 0.3 : 0;
    const faceRotX = faceData ? faceData.rotX * 0.2 : 0;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, baseRotY + faceRotY, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, faceRotX, 0.05);
    meshRef.current.rotation.z = baseRotZ;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={OrbVertexShader}
        fragmentShader={OrbFragmentShaderFixed}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

// ═══════════════════════════════════════════════════════════════
// CAMERA FOLLOW (tracks user head movement)
// ═══════════════════════════════════════════════════════════════

const CameraFollow = ({ faceData }: { faceData: FaceTrackingData | null }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    if (faceData && faceData.detected) {
      targetPos.current.x = faceData.rotY * -0.5;
      targetPos.current.y = faceData.rotX * 0.3;
      targetPos.current.z = 5;
    } else {
      targetPos.current.set(0, 0, 5);
    }

    camera.position.lerp(targetPos.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ═══════════════════════════════════════════════════════════════
// FACE TRACKER (MediaPipe FaceMesh)
// ═══════════════════════════════════════════════════════════════

const FaceTracker = memo(({
  stream,
  onEmotionChange,
  onFaceData,
}: {
  stream: MediaStream | null;
  onEmotionChange: (data: EmotionData) => void;
  onFaceData: (data: FaceTrackingData | null) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const emotionSmoothing = useRef<Record<Emotion, number>>({
    neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0
  });

  useEffect(() => {
    // Create video element
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.muted = true;
    video.width = 320;
    video.height = 240;
    videoRef.current = video;

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
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
      }
    };
    initMediaPipe();

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useFrame(() => {
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
    if (videoRef.current.readyState < 2) return;

    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;

      try {
        const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());

        if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
          const shapes = result.faceBlendshapes[0].categories;
          const getScore = (name: string) => shapes.find(s => s.categoryName === name)?.score || 0;

          // Face tracking data
          const eyeBlinkLeft = getScore('eyeBlinkLeft');
          const eyeBlinkRight = getScore('eyeBlinkRight');
          const jawOpen = getScore('jawOpen');
          const smile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
          const frown = (getScore('mouthFrownLeft') + getScore('mouthFrownRight')) / 2;
          const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
          const browInnerUp = getScore('browInnerUp');
          const eyeWide = (getScore('eyeWideLeft') + getScore('eyeWideRight')) / 2;
          const mouthPucker = getScore('mouthPucker');
          const noseSneer = (getScore('noseSneerLeft') + getScore('noseSneerRight')) / 2;

          // Compute emotion scores
          const scores: Record<Emotion, number> = {
            neutral: 0.3,
            happy: smile * 1.5,
            sad: frown * 1.2 + browInnerUp * 0.5,
            angry: browDown * 1.5 + noseSneer * 0.5,
            surprised: eyeWide * 1.2 + jawOpen * 0.8,
            fearful: eyeWide * 0.8 + browInnerUp * 0.8,
            disgusted: noseSneer * 1.5 + mouthPucker * 0.3,
          };

          // Smooth scores
          const smoothFactor = 0.15;
          for (const key of Object.keys(scores) as Emotion[]) {
            emotionSmoothing.current[key] = THREE.MathUtils.lerp(
              emotionSmoothing.current[key], scores[key], smoothFactor
            );
          }

          // Determine dominant emotion
          let maxScore = 0;
          let detected: Emotion = 'neutral';
          for (const [key, value] of Object.entries(emotionSmoothing.current)) {
            if (value > maxScore) {
              maxScore = value;
              detected = key as Emotion;
            }
          }

          // Calculate valence and arousal
          const valence = (emotionSmoothing.current.happy - emotionSmoothing.current.sad - emotionSmoothing.current.angry) / 2;
          const arousal = (emotionSmoothing.current.surprised + emotionSmoothing.current.angry + emotionSmoothing.current.happy) / 3;

          // Head rotation from transformation matrix
          let rotX = 0, rotY = 0;
          if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
            const matrix = result.facialTransformationMatrixes[0].data;
            if (matrix && matrix.length >= 16) {
              rotX = -(matrix as any)[9] || 0;
              rotY = -(matrix as any)[8] || 0;
            }
          }

          const faceTrackingData: FaceTrackingData = {
            rotX: THREE.MathUtils.clamp(rotX, -1, 1),
            rotY: THREE.MathUtils.clamp(rotY, -1, 1),
            smile,
            eyeOpenLeft: 1 - eyeBlinkLeft,
            eyeOpenRight: 1 - eyeBlinkRight,
            mouthOpen: jawOpen,
            detected: true,
          };

          onFaceData(faceTrackingData);
          onEmotionChange({
            emotion: detected,
            confidence: maxScore,
            valence: THREE.MathUtils.clamp(valence, -1, 1),
            arousal: THREE.MathUtils.clamp(arousal, 0, 1),
            scores: { ...emotionSmoothing.current },
          });
        } else {
          onFaceData(null);
        }
      } catch (err) {
        // Silently handle detection errors to keep running
      }
    }
  });

  return null;
});

// ═══════════════════════════════════════════════════════════════
// POST-PROCESSING EFFECTS
// ═══════════════════════════════════════════════════════════════

const PostProcessing = memo(({ emotion, isSpeaking }: { emotion: Emotion; isSpeaking: boolean }) => {
  return (
    <EffectComposer>
      <Bloom
        intensity={isSpeaking ? 2.5 : 1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(isSpeaking ? 0.003 : 0.001, isSpeaking ? 0.003 : 0.001)}
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.15}
      />
    </EffectComposer>
  );
});

// ═══════════════════════════════════════════════════════════════
// HUD UI PANELS
// ═══════════════════════════════════════════════════════════════

const EmotionPanel = memo(({ emotionData, mode }: { emotionData: EmotionData | null; mode: string }) => {
  if (!emotionData || mode === 'minimal') return null;

  const emotion = emotionData.emotion;
  const colors = EMOTION_COLORS[emotion];

  return (
    <div className="absolute top-20 left-4 z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-56 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{EMOTION_EMOJIS[emotion]}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.core }}>
              {emotion}
            </div>
            <div className="text-[10px] text-white/50">
              {(emotionData.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        </div>

        {/* Emotion bars */}
        <div className="space-y-1.5 mb-3">
          {(Object.entries(emotionData.scores) as [Emotion, number][])
            .filter(([key]) => key !== 'neutral')
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[9px] text-white/40 w-16 uppercase">{key}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(value * 100, 100)}%`,
                      backgroundColor: EMOTION_COLORS[key].core,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Valence & Arousal */}
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-[9px] text-white/40 mb-1">VALENCE</div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 h-full w-1 bg-white rounded-full transition-all"
                style={{ left: `${(emotionData.valence + 1) * 50}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-white/30 mt-0.5">
              <span>−</span><span>+</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[9px] text-white/40 mb-1">AROUSAL</div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${emotionData.arousal * 100}%`,
                  backgroundColor: colors.accent,
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-white/30 mt-0.5">
              <span>Calm</span><span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const VoicePanel = memo(({ voiceData, mode }: { voiceData: VoiceData | null; mode: string }) => {
  if (!voiceData || mode === 'minimal') return null;

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="absolute top-20 right-4 z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-44 shadow-2xl">
        <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">🎤 Voice Activity</div>

        {/* Level bars */}
        <div className="flex items-end justify-center gap-1.5 h-12 mb-2">
          {levels.map((threshold, i) => (
            <div
              key={i}
              className="w-3 rounded-sm transition-all duration-150"
              style={{
                height: `${(i + 1) * 20}%`,
                backgroundColor: voiceData.level > threshold ? '#00ffff' : 'rgba(255,255,255,0.1)',
                boxShadow: voiceData.level > threshold ? '0 0 8px #00ffff' : 'none',
              }}
            />
          ))}
        </div>

        {/* Level meter */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${voiceData.level * 100}%`,
              backgroundColor: voiceData.isActive ? '#00ff88' : '#666',
            }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${voiceData.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[10px] text-white/60">{voiceData.isActive ? 'ACTIVE' : 'SILENT'}</span>
        </div>
      </div>
    </div>
  );
});

const FaceTrackingPanel = memo(({ faceData, mode }: { faceData: FaceTrackingData | null; mode: string }) => {
  if (mode === 'minimal') return null;

  return (
    <div className="absolute bottom-32 left-4 z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-52 shadow-2xl">
        <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">👤 Face Tracking</div>

        {faceData && faceData.detected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-mono">FACE LOCKED</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div>
                <span className="text-white/40">Eye L</span>
                <div className="h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${faceData.eyeOpenLeft * 100}%` }} />
                </div>
              </div>
              <div>
                <span className="text-white/40">Eye R</span>
                <div className="h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${faceData.eyeOpenRight * 100}%` }} />
                </div>
              </div>
              <div>
                <span className="text-white/40">Mouth</span>
                <div className="h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-pink-400 rounded-full" style={{ width: `${faceData.mouthOpen * 100}%` }} />
                </div>
              </div>
              <div>
                <span className="text-white/40">Smile</span>
                <div className="h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${faceData.smile * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 text-[9px] text-white/50 mt-1 font-mono">
              <span>X: {faceData.rotX.toFixed(2)}</span>
              <span>Y: {faceData.rotY.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-red-400 font-mono animate-pulse">SEARCHING...</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// 3D SCENE CONTAINER
// ═══════════════════════════════════════════════════════════════

const EmotionAwareOrbScene = memo(({
  stream,
  analyser,
  isSpeaking,
  isListening,
  status,
  mode = 'cinematic',
  onFaceData: onFaceDataCb,
  onEmotionData: onEmotionDataCb,
  onVoiceData: onVoiceDataCb,
}: EmotionOrbProps) => {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null);
  const [voiceData, setVoiceData] = useState<VoiceData | null>(null);
  const audioDataRef = useRef(new Uint8Array(128));

  // Determine AI state
  const aiState: AIState = useMemo(() => {
    if (isSpeaking) return 'speaking';
    if (status === 'connecting' || status === 'reconnecting') return 'processing';
    if (isListening && status === 'connected') return 'listening';
    return 'idle';
  }, [isSpeaking, isListening, status]);

  // Audio analysis in frame loop
  useFrame(() => {
    if (analyser) {
      if (audioDataRef.current.length !== analyser.frequencyBinCount) {
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(audioDataRef.current);

      let sum = 0;
      for (let i = 0; i < audioDataRef.current.length; i++) {
        sum += audioDataRef.current[i];
      }
      const avg = sum / audioDataRef.current.length;
      const normalizedLevel = avg / 255;

      // RMS calculation
      let rmsSum = 0;
      for (let i = 0; i < audioDataRef.current.length; i++) {
        const normalized = audioDataRef.current[i] / 255;
        rmsSum += normalized * normalized;
      }
      const rms = Math.sqrt(rmsSum / audioDataRef.current.length);

      setAudioLevel(normalizedLevel);
      const newVoiceData: VoiceData = {
        level: normalizedLevel,
        isActive: normalizedLevel > 0.05,
        rms,
      };
      setVoiceData(newVoiceData);
      onVoiceDataCb?.(newVoiceData);
    } else {
      if (audioLevel !== 0) setAudioLevel(0);
    }
  });

  // Emotion change handler
  const handleEmotionChange = useCallback((data: EmotionData) => {
    setEmotion(data.emotion);
    setEmotionData(data);
    onEmotionDataCb?.(data);
  }, [onEmotionDataCb]);

  // Face data handler
  const handleFaceData = useCallback((data: FaceTrackingData | null) => {
    setFaceData(data);
    onFaceDataCb?.(data);
  }, [onFaceDataCb]);

  const isCinematic = mode === 'cinematic';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight
        position={[10, 10, 10]}
        intensity={1.5}
        color={EMOTION_COLORS[emotion].core}
        distance={20}
      />
      <pointLight
        position={[-10, -10, -10]}
        intensity={0.8}
        color={EMOTION_COLORS[emotion].glow}
        distance={20}
      />
      <pointLight
        position={[0, 5, -5]}
        intensity={0.5}
        color={EMOTION_COLORS[emotion].accent}
        distance={15}
      />

      {/* Camera follow */}
      <CameraFollow faceData={faceData} />

      {/* Main Orb with Float animation */}
      <Float
        speed={aiState === 'idle' ? 1.5 : aiState === 'listening' ? 2.5 : 3}
        rotationIntensity={aiState === 'speaking' ? 0.8 : 0.3}
        floatIntensity={aiState === 'idle' ? 0.3 : 0.6}
      >
        <group>
          {/* Core Orb */}
          <OrbMesh
            emotion={emotion}
            audioLevel={audioLevel}
            isSpeaking={isSpeaking}
            aiState={aiState}
            faceData={faceData}
          />

          {/* Neon Eyes */}
          <NeonEyes faceData={faceData} emotion={emotion} />

          {/* Inner energy core */}
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshBasicMaterial
              color={EMOTION_COLORS[emotion].core}
              transparent
              opacity={0.4 + audioLevel * 0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </Float>

      {/* Processing Rings */}
      <ProcessingRings aiState={aiState} emotion={emotion} />

      {/* Speaking Trails */}
      <SpeakingTrails isSpeaking={isSpeaking} emotion={emotion} audioLevel={audioLevel} />

      {/* Neural Particles */}
      <NeuralParticles emotion={emotion} audioLevel={audioLevel} isSpeaking={isSpeaking} />

      {/* Holographic Wings */}
      {isCinematic && (
        <>
          <WingParticles side="left" emotion={emotion} audioLevel={audioLevel} isSpeaking={isSpeaking} />
          <WingParticles side="right" emotion={emotion} audioLevel={audioLevel} isSpeaking={isSpeaking} />
        </>
      )}

      {/* Sparkles */}
      <Sparkles
        count={isCinematic ? 80 : 30}
        scale={5}
        size={isSpeaking ? 6 : 3}
        speed={isSpeaking ? 0.8 : 0.3}
        opacity={0.5}
        color={EMOTION_COLORS[emotion].glow}
      />

      {/* Face Tracker (runs in frame loop) */}
      <FaceTracker
        stream={stream}
        onEmotionChange={handleEmotionChange}
        onFaceData={handleFaceData}
      />

      {/* 3D HUD Label */}
      <Html position={[0, -2.8, 0]} center transform sprite>
        <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
          <div className={`
            px-4 py-1.5 rounded-full backdrop-blur-md border
            flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]
            ${status === 'error' ? 'bg-red-500/20 border-red-500/30' : 'bg-black/40 border-white/20'}
          `}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-400 animate-pulse' :
              status === 'connecting' || status === 'reconnecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-gray-400'
            }`} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/90">
              {aiState}
            </span>
          </div>

          {faceData?.detected ? (
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="text-[9px] text-cyan-400 font-mono">FACE: LOCKED</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="text-[9px] font-mono text-white/80">
                  {EMOTION_EMOJIS[emotion]}{' '}
                  <span style={{ color: EMOTION_COLORS[emotion].core }}>{emotion.toUpperCase()}</span>
                </span>
              </div>
            </div>
          ) : stream ? (
            <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="text-[9px] text-yellow-400 font-mono animate-pulse">FACE: SEARCHING...</span>
            </div>
          ) : null}
        </div>
      </Html>

      {/* Post-Processing */}
      {isCinematic && <PostProcessing emotion={emotion} isSpeaking={isSpeaking} />}
    </>
  );
});

// ═══════════════════════════════════════════════════════════════
// EXPORTED WRAPPER COMPONENT
// ═══════════════════════════════════════════════════════════════

const EmotionAwareOrb = memo((props: EmotionOrbProps) => {
  const mode = props.mode || 'cinematic';

  // State for UI panels (lifted from scene)
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [voiceData, setVoiceData] = useState<VoiceData | null>(null);
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null);

  const handleEmotionData = useCallback((data: EmotionData) => {
    setEmotionData(data);
    props.onEmotionData?.(data);
  }, [props.onEmotionData]);

  const handleVoiceData = useCallback((data: VoiceData) => {
    setVoiceData(data);
    props.onVoiceData?.(data);
  }, [props.onVoiceData]);

  const handleFaceData = useCallback((data: FaceTrackingData | null) => {
    setFaceData(data);
    props.onFaceData?.(data);
  }, [props.onFaceData]);

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <EmotionAwareOrbScene
            {...props}
            mode={mode}
            onEmotionData={handleEmotionData}
            onVoiceData={handleVoiceData}
            onFaceData={handleFaceData}
          />
        </Suspense>
      </Canvas>

      {/* 2D UI Overlay Panels */}
      <EmotionPanel emotionData={emotionData} mode={mode} />
      <VoicePanel voiceData={voiceData} mode={mode} />
      <FaceTrackingPanel faceData={faceData} mode={mode} />
    </div>
  );
});

export default EmotionAwareOrb;

// ═══════════════════════════════════════════════════════════════
// WIDGET VARIANT (standalone usage)
// ═══════════════════════════════════════════════════════════════

export const EmotionAwareOrbWidget = ({
  mode = 'cinematic',
  onFaceData,
  onEmotionData,
  onVoiceData,
}: {
  mode?: 'cinematic' | 'minimal';
  onFaceData?: (data: FaceTrackingData | null) => void;
  onEmotionData?: (data: EmotionData) => void;
  onVoiceData?: (data: VoiceData) => void;
}) => {
  const [active, setActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activate = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: 320, height: 240, facingMode: 'user' },
      });

      const ACClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new (ACClass as any)({ sampleRate: 16000 });
      await ctx.resume();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(mediaStream);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);

      setStream(mediaStream);
      setAnalyser(analyserNode);
      setActive(true);
    } catch (e) {
      console.error('Failed to activate:', e);
    }
  }, []);

  const deactivate = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAnalyser(null);
    setActive(false);
  }, [stream]);

  useEffect(() => () => deactivate(), []);

  return (
    <div className="w-full h-full relative bg-[#020617]">
      {active ? (
        <>
          <EmotionAwareOrb
            stream={stream}
            analyser={analyser}
            isSpeaking={false}
            isListening={true}
            status="connected"
            mode={mode}
            onFaceData={onFaceData}
            onEmotionData={onEmotionData}
            onVoiceData={onVoiceData}
          />
          <button
            onClick={deactivate}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-bold backdrop-blur-md hover:bg-red-500/30 transition-all"
          >
            Deactivate
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={activate}
            className="w-32 h-32 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 backdrop-blur-md flex flex-col items-center justify-center text-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.3)] hover:scale-105 transition-all animate-pulse"
          >
            <span className="text-4xl mb-1">🔮</span>
            <span className="text-xs font-bold">ACTIVATE</span>
          </button>
        </div>
      )}
    </div>
  );
};