
import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
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

interface Ring {
  z: number;
  radius: number;
  opacity: number;
  hue: number;
  rotationOffset: number;
}

interface LightLine {
  angle: number;
  speed: number;
  length: number;
  width: number;
  hue: number;
  brightness: number;
  radialPos: number;
  radialSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  hue: number;
  brightness: number;
  angle: number;
  radius: number;
}

/* ─── HELPER: FACE TRACKER HOOK ─── */
const useFaceTracker = (
  stream: MediaStream | null, 
  onFaceData?: (data: FaceTrackingData | null) => void
) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);

  useEffect(() => {
    if (!videoRef.current) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.width = 320;
      video.height = 240;
      videoRef.current = video;
    }
  }, []);

  useEffect(() => {
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
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    const loop = () => {
      if (landmarkerRef.current && videoRef.current && !videoRef.current.paused) {
        if (videoRef.current.currentTime !== lastTimeRef.current) {
          lastTimeRef.current = videoRef.current.currentTime;
          try {
            const now = performance.now();
            const result = landmarkerRef.current.detectForVideo(videoRef.current, now);
            
            if (result.facialTransformationMatrixes?.length > 0) {
              const matrix = result.facialTransformationMatrixes[0].data;
              onFaceData?.({
                rotX: -(matrix as any)[9] || 0,
                rotY: -(matrix as any)[8] || 0,
                mouthOpen: 0,
                leftEyeOpen: 1,
                rightEyeOpen: 1,
                detected: true
              });
            } else {
              onFaceData?.({ rotX: 0, rotY: 0, mouthOpen: 0, leftEyeOpen: 1, rightEyeOpen: 1, detected: false });
            }
          } catch (e) {
            // ignore
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [stream, onFaceData]);
};

/* ─── STATUS INDICATOR ─── */

const StatusIndicator = memo(({ aiState, isSpeaking, isListening, cameraEnabled }: {
  aiState: AIState;
  isSpeaking: boolean;
  isListening: boolean;
  cameraEnabled?: boolean;
}) => {
  const getStatusColor = () => {
    if (isSpeaking) return 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]';
    if (isListening) return 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]';
    return 'bg-slate-500';
  };

  const getStatusText = () => {
    if (isSpeaking) return 'AI SPEAKING';
    if (isListening) return 'LISTENING';
    return 'STANDBY';
  };

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-30 transition-opacity duration-500">
      <div className={`
        px-6 py-2 rounded-full backdrop-blur-2xl border border-white/10
        flex items-center gap-3 transition-all duration-300
        bg-[#020617]/80 shadow-[0_10px_40px_rgba(0,0,0,0.8)]
      `}>
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-[11px] font-black tracking-[0.3em] text-white/90">
          {getStatusText()}
        </span>
      </div>
      
      {cameraEnabled && (
        <div className="text-[10px] font-mono font-bold text-cyan-400/80 tracking-[0.4em] animate-pulse bg-black/40 px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md">
          VISION ACTIVE
        </div>
      )}
    </div>
  );
});

/* ─── MAIN COMPONENT: HYPER WORMHOLE TUNNEL ─── */

export default function EmotionAwareOrb(props: EmotionOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);
  
  // Data Refs for Animation Loop (Avoids re-renders)
  const audioLevelRef = useRef(0);
  const facePosRef = useRef({ x: 0, y: 0 });
  const aiStateRef = useRef<AIState>('idle');

  // Determine AI State
  const aiState: AIState = useMemo(() => {
    if (props.isSpeaking) return 'speaking';
    if (props.status === 'connecting' || props.status === 'reconnecting') return 'processing';
    if (props.isListening) return 'listening';
    return 'idle';
  }, [props.isSpeaking, props.isListening, props.status]);

  // Sync State to Refs
  useEffect(() => { aiStateRef.current = aiState; }, [aiState]);

  // Audio Analysis Hook
  useEffect(() => {
    const dataArray = new Uint8Array(128);
    const updateAudio = () => {
      if (props.analyser) {
        try {
          props.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          const bins = Math.min(dataArray.length, 32); 
          for(let i=0; i<bins; i++) sum += dataArray[i];
          const avg = sum / bins / 255;
          // Smooth interpolation
          audioLevelRef.current += (avg - audioLevelRef.current) * 0.15;
        } catch (e) {}
      } else {
        audioLevelRef.current += (0 - audioLevelRef.current) * 0.1;
      }
      requestAnimationFrame(updateAudio);
    };
    const handle = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(handle);
  }, [props.analyser]);

  // Face Tracking Hook
  useFaceTracker(props.stream, (data) => {
    if (props.onFaceData) props.onFaceData(data);
    if (data?.detected) {
      const targetX = Math.max(-1, Math.min(1, data.rotY)); 
      const targetY = Math.max(-1, Math.min(1, data.rotX));
      facePosRef.current = { x: targetX, y: targetY };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION LOOP (Ultra Premium Tuning)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Resize Handler
    const handleResize = () => {
      if (container) {
        width = container.clientWidth;
        height = container.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    handleResize();

    // Init Objects
    const NUM_RINGS = 120; // Increased density
    const rings: Ring[] = [];
    for (let i = 0; i < NUM_RINGS; i++) {
      rings.push({
        z: i * 12 + Math.random() * 5,
        radius: 40 + Math.random() * 30,
        opacity: 1,
        hue: (i * 3) % 360,
        rotationOffset: Math.random() * Math.PI * 2,
      });
    }

    const NUM_LINES = 100; // More light streaks
    const lightLines: LightLine[] = [];
    for (let i = 0; i < NUM_LINES; i++) {
      lightLines.push({
        angle: (Math.PI * 2 * i) / NUM_LINES + Math.random() * 0.3,
        speed: 3 + Math.random() * 5,
        length: 100 + Math.random() * 250,
        width: 1 + Math.random() * 3,
        hue: Math.random() * 360,
        brightness: 60 + Math.random() * 40,
        radialPos: 0.2 + Math.random() * 0.8,
        radialSpeed: 0.002 + Math.random() * 0.004,
      });
    }

    let time = 0;
    const tunnelDepth = 1500;
    const fov = 350;
    
    let currentLookX = 0;
    let currentLookY = 0;

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
        if (!props.cameraEnabled) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / width;
            const y = (e.clientY - rect.top) / height;
            facePosRef.current = { x: (x - 0.5) * 2, y: (y - 0.5) * 2 };
        }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- DRAW FUNCTIONS ---

    function drawTunnelRing(ring: Ring, _time: number, cx: number, cy: number, hueShift: number, audio: number) {
      const z = ring.z;
      const perspective = fov / (fov + z);
      const screenRadius = ring.radius * perspective * 5 * (1 + audio * 0.25);
      const x = cx + currentLookX * 120 * perspective;
      const y = cy + currentLookY * 120 * perspective;

      if (screenRadius < 1) return;

      const alpha = Math.max(0, Math.min(1, (1 - z / tunnelDepth) * 0.9));
      if (alpha <= 0) return;

      const hue = (ring.hue + hueShift) % 360;

      // Glow Layer 1
      ctx!.beginPath();
      ctx!.arc(x, y, screenRadius, 0, Math.PI * 2);
      ctx!.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.8})`;
      ctx!.lineWidth = Math.max(1, 4 * perspective * (1 + audio * 1.5));
      ctx!.stroke();

      // Glow Layer 2 (Core)
      ctx!.beginPath();
      ctx!.arc(x, y, screenRadius, 0, Math.PI * 2);
      ctx!.strokeStyle = `hsla(${hue}, 100%, 80%, ${alpha * 0.4})`;
      ctx!.lineWidth = Math.max(0.5, 8 * perspective * (1 + audio));
      ctx!.stroke();

      // Cyber Dashes
      const segments = 16;
      const segAngle = (Math.PI * 2) / segments;
      const rotation = ring.rotationOffset + _time * 0.3 * perspective;

      for (let s = 0; s < segments; s++) {
        const startAngle = s * segAngle + rotation;
        const endAngle = startAngle + segAngle * 0.3;
        ctx!.beginPath();
        ctx!.arc(x, y, screenRadius * 1.05, startAngle, endAngle);
        ctx!.strokeStyle = `hsla(${(hue + 45) % 360}, 100%, 90%, ${alpha * 0.9})`;
        ctx!.lineWidth = Math.max(1, 3 * perspective);
        ctx!.stroke();
      }
    }

    function drawLightStreaks(_time: number, cx: number, cy: number, hueShift: number, speedMult: number) {
      for (const line of lightLines) {
        const angle = line.angle + _time * 0.15;
        line.radialPos += line.radialSpeed * speedMult;
        if (line.radialPos > 1) line.radialPos = 0.1;

        const tunnelRadius = 250 * line.radialPos;
        const numSegments = 10;
        const segLen = line.length / numSegments;

        ctx!.beginPath();
        let started = false;

        for (let s = 0; s <= numSegments; s++) {
          const z = ((_time * line.speed * 60 * speedMult + s * segLen) % tunnelDepth);
          const perspective = fov / (fov + z);
          const px = cx + Math.cos(angle) * tunnelRadius * perspective + currentLookX * 120 * perspective;
          const py = cy + Math.sin(angle) * tunnelRadius * perspective + currentLookY * 120 * perspective;

          if (!started) {
            ctx!.moveTo(px, py);
            started = true;
          } else {
            ctx!.lineTo(px, py);
          }
        }

        const hue = (line.hue + hueShift) % 360;
        const gradient = ctx!.createLinearGradient(cx - 100, cy - 100, cx + 100, cy + 100);
        gradient.addColorStop(0, `hsla(${hue}, 100%, ${line.brightness}%, 0)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, ${line.brightness}%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, ${line.brightness}%, 0)`);

        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = line.width * (1 + audioLevelRef.current);
        ctx!.stroke();
      }
    }

    function drawCenterGlow(_time: number, cx: number, cy: number, hueShift: number, audio: number) {
      const pulse = Math.sin(_time * 0.8) * 0.2 + 0.8 + (audio * 0.8);
      const hue1 = (200 + hueShift) % 360;
      const hue2 = (280 + hueShift) % 360;

      const grd = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 200 * pulse);
      grd.addColorStop(0, `hsla(${hue1}, 100%, 95%, 0.8)`);
      grd.addColorStop(0.2, `hsla(${hue1}, 100%, 70%, 0.4)`);
      grd.addColorStop(0.5, `hsla(${hue2}, 100%, 50%, 0.1)`);
      grd.addColorStop(1, `hsla(${hue2}, 100%, 20%, 0)`);

      ctx!.beginPath();
      ctx!.arc(cx, cy, 200 * pulse, 0, Math.PI * 2);
      ctx!.fillStyle = grd;
      ctx!.fill();
    }

    function animate() {
      const audio = audioLevelRef.current;
      const state = aiStateRef.current;
      
      let speedMult = 1.0;
      let hueOffset = 0;
      
      if (state === 'listening') {
        speedMult = 0.4;
        hueOffset = 140; // Deep Green
      } else if (state === 'speaking') {
        speedMult = 3.5; // Hyper speed
        hueOffset = 190; // Cyan/Blue
      } else if (state === 'processing') {
        speedMult = 0.1;
        hueOffset = 30; // Amber
      }

      time += 0.016 * speedMult;
      const hueShift = time * 20 + hueOffset;
      
      // Smooth look interpolation
      currentLookX += (facePosRef.current.x - currentLookX) * 0.08;
      currentLookY += (facePosRef.current.y - currentLookY) * 0.08;

      const cx = width / 2;
      const cy = height / 2;

      // Clear with deeper trail
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = `rgba(2, 6, 23, 0.25)`;
      ctx!.fillRect(0, 0, width, height);

      ctx!.globalCompositeOperation = "screen";
      for (const ring of rings) {
        ring.z -= 3.0 * speedMult;
        ring.hue = (ring.hue + 0.5) % 360;
        if (ring.z < -10) {
          ring.z = tunnelDepth;
          ring.rotationOffset = Math.random() * Math.PI * 2;
        }
      }
      
      const sortedRings = [...rings].sort((a, b) => b.z - a.z);
      for (const ring of sortedRings) {
        drawTunnelRing(ring, time, cx, cy, hueShift, audio);
      }

      ctx!.globalCompositeOperation = "lighter";
      drawLightStreaks(time, cx, cy, hueShift, speedMult);

      ctx!.globalCompositeOperation = "screen";
      drawCenterGlow(time, cx, cy, hueShift, audio);

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    setIsReady(true);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [props.cameraEnabled]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#020617]">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block touch-none transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <StatusIndicator 
        aiState={aiState}
        isSpeaking={props.isSpeaking}
        isListening={props.isListening}
        cameraEnabled={props.cameraEnabled}
      />
    </div>
  );
}
