import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Float, Html, ContactShadows, Environment, Trail, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, GodRays } from '@react-three/postprocessing';
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
      boxGeometry: any;
      capsuleGeometry: any;
      coneGeometry: any;
      cylinderGeometry: any;
      torusGeometry: any;
      ringGeometry: any;
      planeGeometry: any;
      circleGeometry: any;
      dodecahedronGeometry: any;
      icosahedronGeometry: any;
      octahedronGeometry: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      shaderMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      directionalLight: any;
      hemisphereLight: any;
      rectAreaLight: any;
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
  cameraEnabled?: boolean;
  onFaceData?: (data: FaceTrackingData | null) => void;
  onEmotionData?: (data: EmotionData) => void;
  onVoiceData?: (data: VoiceData) => void;
}

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted';
type AIState = 'idle' | 'listening' | 'processing' | 'speaking';

interface FaceTrackingData {
  rotX: number;
  rotY: number;
  detected: boolean;
}

interface EmotionData {
  emotion: Emotion;
}

interface VoiceData {
  level: number;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM SHADERS
// ═══════════════════════════════════════════════════════════════

const eyeGlowVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const eyeGlowFragmentShader = `
  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
    
    float pulse = sin(uTime * 3.0) * 0.15 + 0.85;
    pulse *= (1.0 + uPulse * 0.5);
    
    float ring = smoothstep(0.3, 0.35, length(vUv - 0.5)) * 
                 smoothstep(0.5, 0.45, length(vUv - 0.5));
    
    float innerGlow = smoothstep(0.35, 0.0, length(vUv - 0.5));
    
    vec3 color = uColor * (innerGlow * 2.0 + ring * 3.0 + fresnel * 1.5) * pulse * uIntensity;
    
    float alpha = (innerGlow + ring * 0.8 + fresnel * 0.5) * pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const scannerVertexShader = `
  varying vec2 vUv;
  varying float vY;
  void main() {
    vUv = uv;
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const scannerFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vY;
  
  void main() {
    float scanLine = sin(vY * 40.0 - uTime * 8.0) * 0.5 + 0.5;
    scanLine = pow(scanLine, 8.0);
    
    float fadeOut = smoothstep(1.0, 0.0, vUv.y);
    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    
    float gridX = step(0.98, fract(vUv.x * 20.0));
    float gridY = step(0.98, fract(vUv.y * 20.0 - uTime * 2.0));
    float grid = max(gridX, gridY) * 0.3;
    
    vec3 color = vec3(0.0, 1.0, 1.0);
    float alpha = (fadeOut * 0.15 + scanLine * 0.3 + grid) * edgeFade * uOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const holoRingVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const holoRingFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  
  void main() {
    float dist = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.8, 0.85, dist) * smoothstep(1.0, 0.95, dist);
    float innerRing = smoothstep(0.5, 0.55, dist) * smoothstep(0.7, 0.65, dist);
    
    float pulse = sin(uTime * 2.0 + dist * 10.0) * 0.3 + 0.7;
    float rotation = sin(atan(vUv.y - 0.5, vUv.x - 0.5) * 6.0 + uTime * 3.0) * 0.5 + 0.5;
    
    vec3 color = uColor * (ring + innerRing * 0.5) * pulse * rotation * uIntensity;
    float alpha = (ring + innerRing * 0.3) * pulse * uIntensity * 0.6;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const energyCoreFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uAudioLevel;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
    
    float pulse = sin(uTime * 4.0) * 0.2 + 0.8;
    float audioPulse = 1.0 + uAudioLevel * 2.0;
    
    float pattern = sin(vUv.x * 20.0 + uTime * 3.0) * sin(vUv.y * 20.0 - uTime * 2.0);
    pattern = smoothstep(0.3, 0.7, pattern);
    
    vec3 coreColor = vec3(0.0, 1.0, 1.0);
    vec3 accentColor = vec3(0.0, 0.5, 1.0);
    vec3 color = mix(coreColor, accentColor, pattern) * (pulse * audioPulse + fresnel * 2.0) * uIntensity;
    
    float alpha = (0.8 + fresnel * 0.5 + pattern * 0.2) * uIntensity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const smoothDamp = (current: number, target: number, velocity: { value: number }, smoothTime: number, deltaTime: number): number => {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocity.value + omega * change) * deltaTime;
  velocity.value = (velocity.value - omega * temp) * exp;
  return target + (change + temp) * exp;
};

const easeOutElastic = (t: number): number => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};

// ═══════════════════════════════════════════════════════════════
// PROCEDURAL FEATHER COMPONENT
// ═══════════════════════════════════════════════════════════════

const ProceduralFeather = memo(({ 
  position, 
  rotation, 
  scale, 
  color, 
  metalness = 0.3 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  scale: [number, number, number]; 
  color: string; 
  metalness?: number;
}) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.15, 0.3, 0.1, 0.7, 0, 1);
    s.bezierCurveTo(-0.1, 0.7, -0.15, 0.3, 0, 0);
    return s;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    geo.computeVertexNormals();
    return geo;
  }, [shape]);

  return (
    <mesh position={position} rotation={rotation} scale={scale} geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.3}
        metalness={metalness}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

// ═══════════════════════════════════════════════════════════════
// BIRD EYE COMPONENT (Enhanced)
// ═══════════════════════════════════════════════════════════════

const BirdEye = memo(({ 
  side, 
  lookAt, 
  aiState, 
  audioLevel 
}: { 
  side: 'left' | 'right'; 
  lookAt: React.MutableRefObject<THREE.Vector2>; 
  aiState: AIState; 
  audioLevel: number;
}) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const baseX = side === 'left' ? -0.28 : 0.28;
  const baseY = 0.12;
  const baseZ = 0.38;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uColor: { value: new THREE.Color('#00FFFF') },
    uIntensity: { value: 1.5 },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
      
      let pulseTarget = 0;
      if (aiState === 'listening') {
        pulseTarget = Math.sin(t * 4) * 0.5 + 0.5;
        shaderRef.current.uniforms.uColor.value.setStyle('#00FFCC');
      } else if (aiState === 'speaking') {
        pulseTarget = audioLevel * 2;
        shaderRef.current.uniforms.uColor.value.setStyle('#00DDFF');
      } else if (aiState === 'processing') {
        pulseTarget = Math.sin(t * 8) * 0.8;
        shaderRef.current.uniforms.uColor.value.setStyle('#FF8800');
      } else {
        shaderRef.current.uniforms.uColor.value.setStyle('#00FFFF');
      }
      shaderRef.current.uniforms.uPulse.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uPulse.value, pulseTarget, 0.1
      );
    }

    // Eye tracking with micro-saccades
    if (glowRef.current) {
      const saccadeX = Math.sin(t * 12 + (side === 'left' ? 0 : Math.PI)) * 0.005;
      const saccadeY = Math.cos(t * 15) * 0.003;
      
      const targetX = baseX + lookAt.current.x * 0.06 + saccadeX;
      const targetY = baseY + lookAt.current.y * 0.06 + saccadeY;
      
      glowRef.current.position.x = THREE.MathUtils.lerp(glowRef.current.position.x, targetX, 0.12);
      glowRef.current.position.y = THREE.MathUtils.lerp(glowRef.current.position.y, targetY, 0.12);
      
      // Pupil dilation based on state
      const baseScale = aiState === 'listening' ? 1.2 : aiState === 'speaking' ? 0.9 + audioLevel * 0.5 : 1.0;
      const s = baseScale + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.setScalar(s);
    }

    // Outer glow pulsation
    if (outerGlowRef.current) {
      const glowScale = 1.0 + Math.sin(t * 3) * 0.1 + audioLevel * 0.3;
      outerGlowRef.current.scale.setScalar(glowScale);
      (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 
        0.15 + Math.sin(t * 5) * 0.05 + audioLevel * 0.1;
    }
  });

  return (
    <group position={[baseX, baseY, baseZ - 0.03]}>
      {/* Eye Socket (Deep mechanical ring) */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.025, 12, 24]} />
        <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
      </mesh>
      
      {/* Inner Socket Ring */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.01]}>
        <torusGeometry args={[0.075, 0.01, 8, 24]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Eye Background (Dark) */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#000011" />
      </mesh>

      {/* Outer Glow Sphere */}
      <mesh ref={outerGlowRef} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.15} toneMapped={false} />
      </mesh>

      {/* Main Glowing Iris */}
      <mesh ref={glowRef} position={[0, 0, 0.03]}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={eyeGlowVertexShader}
          fragmentShader={eyeGlowFragmentShader}
          uniforms={uniforms}
          transparent
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Iris Detail Ring */}
      <mesh ref={irisRef} position={[0, 0, 0.035]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.03, 0.05, 32]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Pupil */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// SCANNER BEAM COMPONENT
// ═══════════════════════════════════════════════════════════════

const ScannerBeam = memo(({ active, aiState }: { active: boolean; aiState: AIState }) => {
  const beamRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const targetOpacity = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    targetOpacity.current = active ? 1 : 0;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        targetOpacity.current,
        0.05
      );
    }

    if (beamRef.current) {
      beamRef.current.visible = materialRef.current 
        ? materialRef.current.uniforms.uOpacity.value > 0.01 
        : false;
        
      if (active) {
        beamRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
        beamRef.current.rotation.x = Math.sin(t * 0.7) * 0.1;
      }
    }

    // Animate scanner rings
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        const offset = i * 0.5;
        const progress = ((t * 2 + offset) % 3) / 3;
        ring.position.z = 0.5 + progress * 4;
        ring.scale.setScalar(0.2 + progress * 1.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = active 
          ? (1 - progress) * 0.4 
          : THREE.MathUtils.lerp((ring.material as THREE.MeshBasicMaterial).opacity, 0, 0.05);
      }
    });
  });

  return (
    <group ref={beamRef} position={[0, 0.12, 0.5]} visible={false}>
      {/* Main Cone Beam */}
      <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.5, 5, 32, 1, true]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={scannerVertexShader}
          fragmentShader={scannerFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Scanning Rings */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el; }}
          position={[0, 0, 1 + i * 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.5 + i * 0.2, 0.01, 8, 32]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Center Laser Line */}
      <mesh position={[0, 0, 2.5]}>
        <cylinderGeometry args={[0.005, 0.005, 5, 8]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={active ? 0.8 : 0} toneMapped={false} />
      </mesh>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// HOLOGRAPHIC RINGS
// ═══════════════════════════════════════════════════════════════

const HolographicRings = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const shader1Ref = useRef<THREE.ShaderMaterial>(null);
  const shader2Ref = useRef<THREE.ShaderMaterial>(null);

  const uniforms1 = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.5 },
    uColor: { value: new THREE.Color('#00FFFF') },
  }), []);

  const uniforms2 = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.3 },
    uColor: { value: new THREE.Color('#FFD700') },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.3;
      ring1Ref.current.rotation.z = Math.sin(t * 0.5) * 0.2;
      const s = 1 + audioLevel * 0.3;
      ring1Ref.current.scale.setScalar(s);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.4;
      ring2Ref.current.rotation.x = Math.cos(t * 0.3) * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.2;
      ring3Ref.current.rotation.y = Math.sin(t * 0.7) * 0.15;
    }

    const intensity = aiState === 'speaking' ? 0.8 + audioLevel : 
                      aiState === 'listening' ? 0.6 : 
                      aiState === 'processing' ? 1.0 : 0.3;

    if (shader1Ref.current) {
      shader1Ref.current.uniforms.uTime.value = t;
      shader1Ref.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        shader1Ref.current.uniforms.uIntensity.value, intensity, 0.05
      );
    }
    if (shader2Ref.current) {
      shader2Ref.current.uniforms.uTime.value = t;
      shader2Ref.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        shader2Ref.current.uniforms.uIntensity.value, intensity * 0.6, 0.05
      );
    }
  });

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.015, 8, 64]} />
        <shaderMaterial
          ref={shader1Ref}
          vertexShader={holoRingVertexShader}
          fragmentShader={holoRingFragmentShader}
          uniforms={uniforms1}
          transparent
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.1, 0.01, 8, 48]} />
        <shaderMaterial
          ref={shader2Ref}
          vertexShader={holoRingVertexShader}
          fragmentShader={holoRingFragmentShader}
          uniforms={uniforms2}
          transparent
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.5, 0.008, 8, 64]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// ENERGY CORE
// ═══════════════════════════════════════════════════════════════

const EnergyCore = memo(({ audioLevel, aiState }: { audioLevel: number; aiState: AIState }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uAudioLevel: { value: 0 },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    coreUniforms.uTime.value = t;
    coreUniforms.uAudioLevel.value = THREE.MathUtils.lerp(coreUniforms.uAudioLevel.value, audioLevel, 0.1);

    if (coreRef.current) {
      const pulseScale = 1 + Math.sin(t * 4) * 0.05 + audioLevel * 0.2;
      coreRef.current.scale.setScalar(pulseScale);
      coreRef.current.rotation.y = t * 0.5;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 1.5;
      innerRef.current.rotation.x = t * 0.8;
      const s = 0.6 + audioLevel * 0.4 + Math.sin(t * 6) * 0.05;
      innerRef.current.scale.setScalar(s);
    }

    // Energy rays
    if (raysRef.current) {
      raysRef.current.children.forEach((ray, i) => {
        const phase = (i / raysRef.current!.children.length) * Math.PI * 2;
        const rayScale = 0.5 + audioLevel * 2 + Math.sin(t * 3 + phase) * 0.3;
        ray.scale.y = Math.max(0.1, rayScale);
        (ray as THREE.Mesh).material = ray.userData.material;
        ((ray as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 
          0.1 + audioLevel * 0.3 + Math.sin(t * 5 + phase) * 0.05;
      });
    }
  });

  return (
    <group position={[0, 0.05, 0.42]}>
      {/* Outer Core Ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.02, 8, 24]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.9} />
      </mesh>
      
      {/* Inner Spinning Element */}
      <mesh ref={innerRef} position={[0, 0, 0.02]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshBasicMaterial color="#00FFFF" toneMapped={false} />
      </mesh>

      {/* Glowing Core */}
      <mesh ref={coreRef} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <shaderMaterial
          vertexShader={eyeGlowVertexShader}
          fragmentShader={energyCoreFragmentShader}
          uniforms={coreUniforms}
          transparent
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Energy Rays */}
      <group ref={raysRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const mat = new THREE.MeshBasicMaterial({
            color: '#00FFFF',
            transparent: true,
            opacity: 0.1,
            toneMapped: false,
            blending: THREE.AdditiveBlending,
          });
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0.01]}
              rotation={[0, 0, angle + Math.PI / 2]}
              userData={{ material: mat }}
            >
              <boxGeometry args={[0.005, 0.3, 0.005]} />
              <primitive object={mat} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// MECHANICAL WING COMPONENT
// ═══════════════════════════════════════════════════════════════

const MechanicalWing = memo(({ 
  side, 
  flapAngle, 
  secondaryAngle 
}: { 
  side: 'left' | 'right'; 
  flapAngle: number; 
  secondaryAngle: number;
}) => {
  const mirror = side === 'left' ? -1 : 1;
  
  return (
    <group position={[mirror * 0.45, 0.15, -0.1]}>
      {/* Shoulder Joint */}
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* Gold Shoulder Cap */}
      <mesh position={[mirror * 0.02, 0.05, 0]}>
        <sphereGeometry args={[0.06, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
      </mesh>

      {/* Primary Wing Segment */}
      <group rotation={[0, 0, mirror * flapAngle]}>
        {/* Upper Arm */}
        <mesh position={[mirror * 0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.35]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.15}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Gold Stripe */}
        <mesh position={[mirror * 0.4, 0.035, 0]}>
          <boxGeometry args={[0.6, 0.01, 0.25]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1.0} />
        </mesh>

        {/* Wing Edge Glow */}
        <mesh position={[mirror * 0.8, 0, 0.05]}>
          <boxGeometry args={[0.02, 0.02, 0.3]} />
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.4} toneMapped={false} />
        </mesh>

        {/* Elbow Joint */}
        <group position={[mirror * 0.8, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
          </mesh>

          {/* Secondary Wing Segment */}
          <group rotation={[0, 0, mirror * secondaryAngle]}>
            <mesh position={[mirror * 0.35, 0, 0]}>
              <boxGeometry args={[0.7, 0.04, 0.25]} />
              <meshPhysicalMaterial
                color="#E8E8E8"
                roughness={0.2}
                metalness={0.15}
                clearcoat={0.8}
              />
            </mesh>
            
            {/* Wing Tip Feathers */}
            {[0, 1, 2, 3, 4].map((i) => (
              <ProceduralFeather
                key={i}
                position={[mirror * (0.5 + i * 0.08), -0.02, -0.1 + i * 0.05]}
                rotation={[0.2, mirror * 0.3, mirror * (0.1 + i * 0.15)]}
                scale={[0.08, 0.15 + i * 0.02, 0.08]}
                color={i % 2 === 0 ? '#FFD700' : '#FFFFFF'}
                metalness={i % 2 === 0 ? 0.9 : 0.2}
              />
            ))}

            {/* Tip Glow */}
            <mesh position={[mirror * 0.7, 0, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#00FFFF" transparent opacity={0.5} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// TAIL COMPONENT
// ═══════════════════════════════════════════════════════════════

const BirdTail = memo(({ swayAmount }: { swayAmount: number }) => {
  const tailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.x = -0.3 + Math.sin(t * 2) * 0.05 + swayAmount * 0.1;
      tailRef.current.rotation.y = Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group ref={tailRef} position={[0, -0.1, -0.55]}>
      {/* Tail Base */}
      <mesh>
        <boxGeometry args={[0.25, 0.06, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.7} />
      </mesh>
      
      {/* Tail Feathers */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <group key={i} position={[i * 0.06, 0, -0.1]} rotation={[0.2, i * 0.05, 0]}>
          <mesh position={[0, 0, -0.25]}>
            <boxGeometry args={[0.04, 0.01, 0.5]} />
            <meshPhysicalMaterial
              color={Math.abs(i) === 2 ? '#FFD700' : '#FFFFFF'}
              roughness={0.2}
              metalness={Math.abs(i) === 2 ? 0.9 : 0.1}
              clearcoat={0.8}
            />
          </mesh>
          {/* Tail feather glow tips */}
          <mesh position={[0, 0, -0.5]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial 
              color="#00FFFF" 
              transparent 
              opacity={0.4} 
              toneMapped={false} 
            />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// MECHANICAL LEGS
// ═══════════════════════════════════════════════════════════════

const MechanicalLegs = memo(({ isHovering }: { isHovering: boolean }) => {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (leftLegRef.current) {
      const tuckAngle = isHovering ? 0.8 : 0;
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
        leftLegRef.current.rotation.x, tuckAngle + Math.sin(t * 2) * 0.05, 0.05
      );
    }
    if (rightLegRef.current) {
      const tuckAngle = isHovering ? 0.8 : 0;
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
        rightLegRef.current.rotation.x, tuckAngle + Math.sin(t * 2 + Math.PI) * 0.05, 0.05
      );
    }
  });

  const Leg = ({ ref: legRef, xPos }: { ref: React.RefObject<THREE.Group>; xPos: number }) => (
    <group ref={legRef} position={[xPos, -0.55, 0]}>
      {/* Hip Joint */}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* Upper Leg */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.025, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Knee Joint */}
      <group position={[0, -0.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
        </mesh>

        {/* Lower Leg */}
        <mesh position={[0, -0.15, 0.05]}>
          <cylinderGeometry args={[0.025, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Foot */}
        <group position={[0, -0.3, 0.05]}>
          {/* Toes */}
          {[-1, 0, 1].map((toe) => (
            <mesh key={toe} position={[toe * 0.04, 0, 0.06]} rotation={[0.3, toe * 0.2, 0]}>
              <boxGeometry args={[0.02, 0.01, 0.12]} />
              <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
            </mesh>
          ))}
          {/* Back toe */}
          <mesh position={[0, 0, -0.04]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.02, 0.01, 0.08]} />
            <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
          </mesh>
        </group>
      </group>
    </group>
  );

  return (
    <group>
      <Leg ref={leftLegRef} xPos={-0.15} />
      <Leg ref={rightLegRef} xPos={0.15} />
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// PARTICLE EFFECTS
// ═══════════════════════════════════════════════════════════════

const FloatingParticles = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 3;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Cyan to gold gradient
      const t = Math.random();
      colors[i * 3] = THREE.MathUtils.lerp(0, 1, t);
      colors[i * 3 + 1] = THREE.MathUtils.lerp(1, 0.84, t);
      colors[i * 3 + 2] = THREE.MathUtils.lerp(1, 0, t);
    }
    
    return { positions, velocities, colors };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    const speed = aiState === 'speaking' ? 1 + audioLevel * 3 : 
                  aiState === 'processing' ? 2 : 1;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Orbital motion
      const x = posArray[i3];
      const z = posArray[i3 + 2];
      const angle = Math.atan2(z, x) + 0.002 * speed;
      const r = Math.sqrt(x * x + z * z);
      
      posArray[i3] = r * Math.cos(angle) + velocities[i3] * speed;
      posArray[i3 + 1] += velocities[i3 + 1] * speed + Math.sin(t + i) * 0.002;
      posArray[i3 + 2] = r * Math.sin(angle) + velocities[i3 + 2] * speed;
      
      // Boundary check
      const dist = Math.sqrt(posArray[i3] ** 2 + posArray[i3 + 1] ** 2 + posArray[i3 + 2] ** 2);
      if (dist > 5 || dist < 1.5) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const newR = 2 + Math.random() * 2;
        posArray[i3] = newR * Math.sin(phi) * Math.cos(theta);
        posArray[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta);
        posArray[i3 + 2] = newR * Math.cos(phi);
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
});

// ═══════════════════════════════════════════════════════════════
// STATUS INDICATOR HUD
// ═══════════════════════════════════════════════════════════════

const StatusHUD = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const stateLabel = aiState === 'speaking' ? '🔊 SPEAKING' 
    : aiState === 'listening' ? '🎤 LISTENING' 
    : aiState === 'processing' ? '⚡ PROCESSING' 
    : '💤 IDLE';
    
  const stateColor = aiState === 'speaking' ? '#00FFFF' 
    : aiState === 'listening' ? '#00FF88' 
    : aiState === 'processing' ? '#FF8800' 
    : '#888888';

  return (
    <Html position={[0, -2.2, 0]} center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {/* Status Badge */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${stateColor}40`,
          borderRadius: '20px',
          padding: '6px 16px',
          color: stateColor,
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: `0 0 20px ${stateColor}20`,
        }}>
          {stateLabel}
        </div>
        
        {/* Audio Level Bar */}
        <div style={{
          width: '120px',
          height: '3px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(audioLevel * 100, 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${stateColor}, #FFD700)`,
            transition: 'width 0.05s ease',
            borderRadius: '2px',
            boxShadow: `0 0 8px ${stateColor}`,
          }} />
        </div>
      </div>
    </Html>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN ROBOTIC BIRD MODEL
// ═══════════════════════════════════════════════════════════════

const RoboticBirdModel = memo(({ 
  aiState, 
  audioLevel, 
  faceData, 
  isScanning 
}: { 
  aiState: AIState; 
  audioLevel: number; 
  faceData: FaceTrackingData | null;
  isScanning: boolean;
}) => {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);
  
  // Smooth animation state refs
  const targetHeadRot = useRef(new THREE.Vector2(0, 0));
  const headVelX = useRef({ value: 0 });
  const headVelY = useRef({ value: 0 });
  const jawAngle = useRef(0);
  const jawVel = useRef({ value: 0 });
  const leftWingAngle = useRef(0.3);
  const rightWingAngle = useRef(0.3);
  const leftWingVel = useRef({ value: 0 });
  const rightWingVel = useRef({ value: 0 });
  const leftSecondaryAngle = useRef(0.2);
  const rightSecondaryAngle = useRef(0.2);
  const bodyBreath = useRef(0);
  const blinkTimer = useRef(Math.random() * 5 + 2);
  const isBlinking = useRef(false);
  const lastIdleAction = useRef(0);
  const idleLookTarget = useRef(new THREE.Vector2(0, 0));

  // Wing angle state for passing to MechanicalWing
  const [wingAngles, setWingAngles] = useState({
    leftFlap: 0.3,
    rightFlap: 0.3,
    leftSecondary: 0.2,
    rightSecondary: 0.2,
  });

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05); // Cap delta

    // ════════════════════════════
    // IDLE BEHAVIOR SYSTEM
    // ════════════════════════════
    if (aiState === 'idle' && !faceData?.detected) {
      // Periodic look-around
      if (t - lastIdleAction.current > 3 + Math.random() * 4) {
        lastIdleAction.current = t;
        idleLookTarget.current.set(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2
        );
      }
      
      targetHeadRot.current.x = idleLookTarget.current.y + Math.sin(t * 0.5) * 0.03;
      targetHeadRot.current.y = idleLookTarget.current.x + Math.cos(t * 0.3) * 0.05;
    }

    // ════════════════════════════
    // HEAD TRACKING / ANIMATION
    // ════════════════════════════
    if (headRef.current) {
      // Face tracking
      if (faceData?.detected) {
        targetHeadRot.current.x = -faceData.rotX * 0.6;
        targetHeadRot.current.y = faceData.rotY * 0.8;
      } else if (aiState === 'listening') {
        // Attentive head tilt
        targetHeadRot.current.x = Math.sin(t * 1.5) * 0.08 + 0.05;
        targetHeadRot.current.y = Math.sin(t * 0.8) * 0.15;
      } else if (aiState === 'speaking') {
        // Emphatic head movements synced to audio
        targetHeadRot.current.x = Math.sin(t * 3) * 0.05 * (1 + audioLevel);
        targetHeadRot.current.y = Math.sin(t * 2) * 0.1 * (1 + audioLevel * 0.5);
      }

      // Smooth damp head rotation
      headRef.current.rotation.x = smoothDamp(
        headRef.current.rotation.x, targetHeadRot.current.x, headVelX.current, 0.15, dt
      );
      headRef.current.rotation.y = smoothDamp(
        headRef.current.rotation.y, targetHeadRot.current.y, headVelY.current, 0.12, dt
      );

      // Head bob during speaking
      if (aiState === 'speaking') {
        headRef.current.position.y = 0.75 + Math.sin(t * 8) * 0.015 * audioLevel;
      } else {
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 0.75, 0.05);
      }
    }

    // ════════════════════════════
    // JAW / BEAK ANIMATION
    // ════════════════════════════
    if (jawRef.current) {
      let targetJaw = 0;
      if (aiState === 'speaking') {
        // Multi-frequency jaw movement for realistic speech
        targetJaw = Math.max(0,
          audioLevel * 0.5 +
          Math.sin(t * 20) * 0.08 * audioLevel +
          Math.sin(t * 35) * 0.04 * audioLevel +
          Math.sin(t * 12) * 0.06 * audioLevel
        );
        targetJaw = Math.min(targetJaw, 0.5);
      }
      
      jawAngle.current = smoothDamp(jawAngle.current, targetJaw, jawVel.current, 0.04, dt);
      jawRef.current.rotation.x = jawAngle.current;
    }

    // ════════════════════════════
    // WING ANIMATION
    // ════════════════════════════
    let leftTarget = 0.3;
    let rightTarget = 0.3;
    let leftSecTarget = 0.2;
    let rightSecTarget = 0.2;

    if (aiState === 'idle') {
      // Gentle folded position with subtle movement
      const breathWing = Math.sin(t * 2) * 0.02;
      leftTarget = 0.25 + breathWing;
      rightTarget = 0.25 + breathWing;
      leftSecTarget = 0.15;
      rightSecTarget = 0.15;
    } else if (aiState === 'speaking') {
      // Emphatic gesturing - asymmetric for naturalness
      const gesture = audioLevel * 0.6;
      leftTarget = 0.5 + Math.sin(t * 3) * gesture * 0.3;
      rightTarget = 0.5 + Math.cos(t * 3.5) * gesture * 0.3;
      leftSecTarget = 0.3 + Math.sin(t * 4) * gesture * 0.2;
      rightSecTarget = 0.3 + Math.cos(t * 4.5) * gesture * 0.2;
    } else if (aiState === 'processing') {
      // Nervous flutter
      leftTarget = 0.4 + Math.sin(t * 15) * 0.1;
      rightTarget = 0.4 + Math.sin(t * 15 + Math.PI) * 0.1;
      leftSecTarget = 0.3 + Math.sin(t * 20) * 0.05;
      rightSecTarget = 0.3 + Math.sin(t * 20 + Math.PI) * 0.05;
    } else if (aiState === 'listening') {
      // Slightly open, attentive
      leftTarget = 0.35;
      rightTarget = 0.35;
      leftSecTarget = 0.2;
      rightSecTarget = 0.2;
    }

    if (isScanning) {
      // Spread wings wide during scanning
      leftTarget = Math.max(leftTarget, 1.0 + Math.sin(t * 2) * 0.1);
      rightTarget = Math.max(rightTarget, 1.0 + Math.sin(t * 2 + Math.PI) * 0.1);
      leftSecTarget = 0.5;
      rightSecTarget = 0.5;
    }

    leftWingAngle.current = smoothDamp(leftWingAngle.current, leftTarget, leftWingVel.current, 0.2, dt);
    rightWingAngle.current = smoothDamp(rightWingAngle.current, rightTarget, rightWingVel.current, 0.2, dt);
    leftSecondaryAngle.current = THREE.MathUtils.lerp(leftSecondaryAngle.current, leftSecTarget, 0.08);
    rightSecondaryAngle.current = THREE.MathUtils.lerp(rightSecondaryAngle.current, rightSecTarget, 0.08);

    // Update wing angles state (throttled)
    setWingAngles({
      leftFlap: leftWingAngle.current,
      rightFlap: rightWingAngle.current,
      leftSecondary: leftSecondaryAngle.current,
      rightSecondary: rightSecondaryAngle.current,
    });

    // ════════════════════════════
    // BODY ANIMATION
    // ════════════════════════════
    if (bodyRef.current) {
      // Breathing
      bodyBreath.current = Math.sin(t * 2) * 0.008;
      bodyRef.current.scale.set(
        1 + bodyBreath.current,
        1 + bodyBreath.current * 0.5,
        1 + bodyBreath.current
      );

      // Body reactions
      if (isScanning) {
        bodyRef.current.rotation.z = Math.sin(t * 3) * 0.03;
      } else if (aiState === 'speaking') {
        bodyRef.current.rotation.z = Math.sin(t * 4) * 0.02 * audioLevel;
      } else {
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.05);
      }
    }

    // Crown animation
    if (crownRef.current) {
      crownRef.current.rotation.y = t * 0.5;
      if (aiState === 'processing') {
        crownRef.current.rotation.y = t * 3;
      }
    }
  });

  return (
    <group>
      {/* ═══ BODY ═══ */}
      <group ref={bodyRef}>
        {/* Main Torso */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.38, 0.6, 8, 20]} />
          <meshPhysicalMaterial
            color="#FAFAFA"
            roughness={0.12}
            metalness={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Chest Armor Plate */}
        <mesh position={[0, 0.2, 0.32]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.45, 0.35, 0.08]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1.0} />
        </mesh>

        {/* Side Armor Accents */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.35, 0.1, 0.1]} rotation={[0, side * 0.3, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.15]} />
            <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={0.95} />
          </mesh>
        ))}

        {/* Belly Panel */}
        <mesh position={[0, -0.15, 0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.25, 0.06]} />
          <meshStandardMaterial color="#E0E0E0" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Energy Core */}
        <EnergyCore audioLevel={audioLevel} aiState={aiState} />

        {/* Back Panel */}
        <mesh position={[0, 0.1, -0.35]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.06]} />
          <meshStandardMaterial color="#2a2a3e" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Mechanical Spine Detail */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.3 - i * 0.15, -0.38]}>
            <boxGeometry args={[0.08, 0.08, 0.04]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ═══ HEAD ═══ */}
      <group ref={headRef} position={[0, 0.75, 0]}>
        {/* Neck Joint */}
        <group position={[0, -0.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.12, 0.15, 12]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Neck Rings */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, -0.05 + i * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.11, 0.008, 6, 16]} />
              <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={1.0} />
            </mesh>
          ))}
        </group>

        {/* Main Skull */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshPhysicalMaterial
            color="#FAFAFA"
            roughness={0.1}
            metalness={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
          />
        </mesh>

        {/* Gold Crown / Helmet Crest */}
        <group ref={crownRef} position={[0, 0.22, 0]}>
          <mesh>
            <sphereGeometry args={[0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
            <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1.0} />
          </mesh>
          {/* Crest Fin */}
          <mesh position={[0, 0.15, -0.1]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.25]} />
            <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1.0} />
          </mesh>
        </group>

        {/* Cheek Plates */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.3, -0.05, 0.15]} rotation={[0, side * 0.3, 0]}>
            <boxGeometry args={[0.08, 0.15, 0.12]} />
            <meshStandardMaterial color="#FFD700" roughness={0.15} metalness={0.95} />
          </mesh>
        ))}

        {/* Antenna Nubs */}
        {[-1, 1].map((side) => (
          <group key={`ant-${side}`} position={[side * 0.2, 0.35, -0.05]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.01, 0.12, 6]} />
              <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#00FFFF" toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* Eyes */}
        <BirdEye side="left" lookAt={targetHeadRot} aiState={aiState} audioLevel={audioLevel} />
        <BirdEye side="right" lookAt={targetHeadRot} aiState={aiState} audioLevel={audioLevel} />

        {/* Brow Ridge */}
        <mesh position={[0, 0.22, 0.28]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.08]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Upper Beak */}
        <group position={[0, -0.02, 0.3]}>
          <mesh rotation={[Math.PI / 2 + 0.1, 0, 0]} position={[0, 0, 0.15]}>
            <coneGeometry args={[0.1, 0.35, 4]} />
            <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1.0} />
          </mesh>
          {/* Beak Ridge */}
          <mesh position={[0, 0.04, 0.15]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.3]} />
            <meshStandardMaterial color="#E0A800" roughness={0.15} metalness={0.9} />
          </mesh>
        </group>

        {/* Lower Beak (Jaw) */}
        <group ref={jawRef} position={[0, -0.12, 0.3]}>
          <mesh rotation={[-Math.PI / 2 - 0.1, 0, 0]} position={[0, 0, 0.1]}>
            <coneGeometry args={[0.07, 0.25, 4]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Interior mouth glow */}
          <mesh position={[0, 0.03, 0.08]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial
              color={aiState === 'speaking' ? '#00FFFF' : '#001122'}
              transparent
              opacity={aiState === 'speaking' ? 0.6 + audioLevel * 0.4 : 0.1}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Scanner Beam */}
        <ScannerBeam active={isScanning} aiState={aiState} />
      </group>

      {/* ═══ WINGS ═══ */}
      <MechanicalWing
        side="left"
        flapAngle={wingAngles.leftFlap}
        secondaryAngle={wingAngles.leftSecondary}
      />
      <MechanicalWing
        side="right"
        flapAngle={wingAngles.rightFlap}
        secondaryAngle={wingAngles.rightSecondary}
      />

      {/* ═══ TAIL ═══ */}
      <BirdTail swayAmount={aiState === 'speaking' ? audioLevel : 0} />

      {/* ═══ LEGS ═══ */}
      <MechanicalLegs isHovering={true} />

      {/* ═══ STATUS HUD ═══ */}
      <StatusHUD aiState={aiState} audioLevel={audioLevel} />
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// FACE TRACKER LOGIC
// ═══════════════════════════════════════════════════════════════

const FaceTracker = memo(({ stream, onFaceData }: { stream: MediaStream | null; onFaceData: (data: FaceTrackingData) => void }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const frameCount = useRef(0);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.width = 320;
    video.height = 240;
    video.playsInline = true;
    videoRef.current = video;

    const init = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch (e) {
        console.error('FaceLandmarker init error:', e);
      }
    };
    init();

    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useFrame(() => {
    frameCount.current++;
    // Process every 2nd frame for performance
    if (frameCount.current % 2 !== 0) return;
    
    if (!landmarkerRef.current || !videoRef.current || videoRef.current.paused) return;
    if (videoRef.current.currentTime === lastVideoTimeRef.current) return;
    
    lastVideoTimeRef.current = videoRef.current.currentTime;
    
    try {
      const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      if (result.facialTransformationMatrixes?.length > 0) {
        const matrix = result.facialTransformationMatrixes[0].data as Float32Array;
        const rotX = -(matrix[9] || 0);
        const rotY = -(matrix[8] || 0);
        onFaceData({ rotX, rotY, detected: true });
      } else {
        onFaceData({ rotX: 0, rotY: 0, detected: false });
      }
    } catch (e) {
      // Silently handle detection errors
    }
  });

  return null;
});

// ═══════════════════════════════════════════════════════════════
// DYNAMIC LIGHTING
// ═══════════════════════════════════════════════════════════════

const DynamicLighting = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (keyLightRef.current) {
      // Dynamic key light intensity
      const baseIntensity = aiState === 'speaking' ? 2 + audioLevel * 2 : 
                            aiState === 'processing' ? 1.5 + Math.sin(t * 5) * 0.5 : 1.5;
      keyLightRef.current.intensity = THREE.MathUtils.lerp(keyLightRef.current.intensity, baseIntensity, 0.05);
    }

    if (rimLightRef.current) {
      // Cyan rim light that pulses
      rimLightRef.current.intensity = 0.5 + Math.sin(t * 3) * 0.2 + audioLevel * 0.5;
      rimLightRef.current.position.x = Math.sin(t * 0.5) * 5;
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.3 + audioLevel * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} color="#1a1a3e" />
      <hemisphereLight color="#87CEEB" groundColor="#1a1a2e" intensity={0.3} />
      
      {/* Key Light */}
      <spotLight
        ref={keyLightRef}
        position={[5, 8, 8]}
        angle={0.2}
        penumbra={0.8}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        color="#FFFFFF"
      />
      
      {/* Rim Light (Cyan) */}
      <pointLight
        ref={rimLightRef}
        position={[-5, 3, -5]}
        intensity={0.5}
        color="#00FFFF"
        distance={15}
      />
      
      {/* Fill Light (Warm Gold) */}
      <pointLight
        ref={fillLightRef}
        position={[3, -2, 5]}
        intensity={0.3}
        color="#FFD700"
        distance={10}
      />

      {/* Under-glow */}
      <pointLight position={[0, -3, 0]} intensity={0.2} color="#00FFFF" distance={5} />
    </>
  );
});

// ═══════════════════════════════════════════════════════════════
// POST PROCESSING (Enhanced)
// ═══════════════════════════════════════════════════════════════

const PostProcessing = memo(({ isSpeaking, isScanning, audioLevel }: { 
  isSpeaking: boolean; 
  isScanning: boolean; 
  audioLevel: number;
}) => (
  <EffectComposer multisampling={4}>
    <Bloom
      intensity={isScanning ? 2.5 : isSpeaking ? 1.8 + audioLevel * 0.5 : 1.0}
      luminanceThreshold={0.5}
      luminanceSmoothing={0.9}
      mipmapBlur
      radius={0.8}
    />
    <ChromaticAberration
      blendFunction={BlendFunction.NORMAL}
      offset={new THREE.Vector2(
        isScanning ? 0.003 : isSpeaking ? 0.001 + audioLevel * 0.002 : 0.0005,
        isScanning ? 0.003 : 0.0005
      )}
    />
    <Vignette offset={0.25} darkness={0.6} />
    <Noise opacity={0.03} blendFunction={BlendFunction.SOFT_LIGHT} />
  </EffectComposer>
));

// ═══════════════════════════════════════════════════════════════
// GROUND EFFECTS
// ═══════════════════════════════════════════════════════════════

const GroundEffects = memo(({ aiState, audioLevel }: { aiState: AIState; audioLevel: number }) => {
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gridRef.current) {
      (gridRef.current.material as THREE.MeshBasicMaterial).opacity = 
        0.05 + Math.sin(t * 2) * 0.02 + audioLevel * 0.05;
    }
  });

  return (
    <group position={[0, -2.5, 0]}>
      <ContactShadows
        opacity={0.5}
        scale={12}
        blur={3}
        far={5}
        resolution={256}
        color="#001020"
      />
      
      {/* Ground reflection circle */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.05}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
});

// ═══════════════════════════════════════════════════════════════
// 3D SCENE COMPOSITION
// ═══════════════════════════════════════════════════════════════

const EmotionAwareOrbScene = memo(({ 
  stream, analyser, isSpeaking, isListening, status, cameraEnabled, 
  onFaceData, onEmotionData, onVoiceData 
}: EmotionOrbProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null);
  const audioDataRef = useRef(new Uint8Array(128));
  const smoothAudioLevel = useRef(0);

  const aiState: AIState = useMemo(() => {
    if (isSpeaking) return 'speaking';
    if (status === 'connecting' || status === 'reconnecting') return 'processing';
    if (isListening && status === 'connected') return 'listening';
    return 'idle';
  }, [isSpeaking, isListening, status]);

  useFrame(() => {
    if (analyser) {
      if (audioDataRef.current.length !== analyser.frequencyBinCount) {
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(audioDataRef.current);
      
      // Weighted frequency analysis (emphasize speech frequencies)
      let sum = 0;
      let weightSum = 0;
      for (let i = 0; i < audioDataRef.current.length; i++) {
        // Weight towards speech frequencies (300-3000 Hz range)
        const freq = (i / audioDataRef.current.length) * (analyser.context.sampleRate / 2);
        const weight = freq > 200 && freq < 4000 ? 2.0 : 0.5;
        sum += audioDataRef.current[i] * weight;
        weightSum += weight;
      }
      
      const rawLevel = sum / weightSum / 255;
      smoothAudioLevel.current = THREE.MathUtils.lerp(smoothAudioLevel.current, rawLevel, 0.3);
      setAudioLevel(smoothAudioLevel.current);
      
      onVoiceData?.({ level: smoothAudioLevel.current });
    }
  });

  const handleFaceData = useCallback((data: FaceTrackingData) => {
    setFaceData(data);
    onFaceData?.(data);
  }, [onFaceData]);

  return (
    <>
      {/* Dynamic Lighting */}
      <DynamicLighting aiState={aiState} audioLevel={audioLevel} />
      
      {/* Environment */}
      <Environment preset="night" />

      {/* Main Bird with Float Animation */}
      <Float
        speed={aiState === 'idle' ? 1.5 : aiState === 'processing' ? 4 : 2.5}
        rotationIntensity={aiState === 'processing' ? 0.3 : 0.1}
        floatIntensity={aiState === 'idle' ? 0.8 : 0.4}
        floatingRange={[-0.1, 0.1]}
      >
        <RoboticBirdModel
          aiState={aiState}
          audioLevel={audioLevel}
          faceData={faceData}
          isScanning={!!cameraEnabled}
        />
      </Float>

      {/* Holographic Rings */}
      <HolographicRings aiState={aiState} audioLevel={audioLevel} />

      {/* Floating Particles */}
      <FloatingParticles aiState={aiState} audioLevel={audioLevel} />

      {/* Sparkles */}
      <Sparkles
        count={cameraEnabled ? 150 : 50}
        scale={10}
        size={3}
        speed={0.3}
        opacity={0.4}
        color={cameraEnabled ? '#00FFFF' : '#FFD700'}
      />

      {/* Ground Effects */}
      <GroundEffects aiState={aiState} audioLevel={audioLevel} />

      {/* Face Tracker */}
      {stream && (
        <FaceTracker stream={stream} onFaceData={handleFaceData} />
      )}

      {/* Post Processing */}
      <PostProcessing isSpeaking={isSpeaking} isScanning={!!cameraEnabled} audioLevel={audioLevel} />
    </>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT COMPONENT
// ═══════════════════════════════════════════════════════════════

const EmotionAwareOrb = memo((props: EmotionOrbProps) => {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      {/* Background Gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 70%, #000000 100%)',
          zIndex: 0,
        }}
      />
      
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 42 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Suspense fallback={null}>
          <EmotionAwareOrbScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
});

EmotionAwareOrb.displayName = 'EmotionAwareOrb';

export default EmotionAwareOrb;