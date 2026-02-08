
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, MessageSquare, Lock } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { clsx } from 'clsx';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { logActivity } from '../../services/analyticsService';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'ember' | 'glow';
}

interface Lightning {
  segments: { x: number; y: number }[];
  life: number;
  intensity: number;
  thickness: number;
}

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';

const VoiceAssistant = ({
  lang,
  user,
  onUserUpdate,
  onBack,
}: {
  lang: Language;
  user: UserProfile;
  onUserUpdate: (u: UserProfile) => void;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  // ---- Layout tuning (change these) ----
  const TOP_GUARD_PT_CLASS = 'pt-10'; // increase to pt-12 / pt-14 if you want more top space
  const ORB_HEIGHT_IDLE = 'clamp(240px, 36vh, 360px)';
  const ORB_HEIGHT_ACTIVE = 'clamp(220px, 32vh, 320px)';

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const statusRef = useRef<Status>('idle');
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const transcriptsRef = useRef<{ role: 'user' | 'model'; text: string }[]>([]);
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const isGuest = user.email === 'guest@aikrushimitra.in' || user.email?.includes('guest');

  // ---- WS / Session ----
  const shouldStayConnectedRef = useRef(false);
  const activeSocketRef = useRef<WebSocket | null>(null);

  // ---- Audio ----
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const nextStartTimeRef = useRef<number>(0);

  // ---- Canvas / Animation ----
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringWrapperRef = useRef<HTMLDivElement>(null);

  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lightningRef = useRef<Lightning[]>([]);
  const timeRef = useRef(0);

  const handleGoogleUpgrade = (credentialResponse: any) => {
    try {
      triggerHaptic('medium');
      const decoded: any = jwtDecode(credentialResponse.credential);

      const upgradedUser: UserProfile = {
        ...user,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        lastLogin: Date.now(),
      };

      localStorage.setItem('user_session', JSON.stringify(upgradedUser));
      logActivity('UPGRADE_SUCCESS', user.village, upgradedUser);
      onUserUpdate(upgradedUser);
    } catch (err) {
      console.error('Upgrade Error', err);
      setErrorMessage('Login failed. Please try again.');
    }
  };

  // ----- Guest screen -----
  if (isGuest) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6 animate-enter">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="glass-panel p-8 rounded-[2rem] border border-red-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-red-500/20 animate-pulse">
              <Lock size={32} className="text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-3">Feature Locked</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Voice Assistant requires a verified Google account for security and personalization.
            </p>

            <div className="w-full flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleUpgrade}
                onError={() => setErrorMessage('Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
                width="280"
              />
            </div>

            <button
              onClick={onBack}
              className="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Return to Dashboard
            </button>

            {errorMessage && <p className="text-red-400 text-xs mt-4">{errorMessage}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Canvas sizing (with ResizeObserver) ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = ringWrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));

      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    window.addEventListener('resize', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ---------- Orb rendering helpers ----------
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

  const createBranchingLightning = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    segments: number,
    jitter: number
  ): { x: number; y: number }[] => {
    const points = [{ x: startX, y: startY }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * jitter;
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * jitter;
      points.push({ x, y });
    }
    points.push({ x: endX, y: endY });
    return points;
  };

  const spawnParticles = (centerX: number, centerY: number, radius: number, count: number, energy: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2 + energy * 3;
      const distance = radius + Math.random() * 20;

      particlesRef.current.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.8,
        size: 1 + Math.random() * 3 + energy * 2,
        color: Math.random() > 0.5 ? 'emerald' : 'white',
        type: Math.random() > 0.7 ? 'ember' : 'spark',
      });
    }
  };

  const spawnLightning = (centerX: number, centerY: number, radius: number, energy: number) => {
    if (Math.random() < 0.10 + energy * 0.25) {
      const startAngle = Math.random() * Math.PI * 2;
      const endAngle = startAngle + (Math.random() - 0.5) * Math.PI * 0.8;

      const startX = centerX + Math.cos(startAngle) * radius;
      const startY = centerY + Math.sin(startAngle) * radius;
      const endX = centerX + Math.cos(endAngle) * (radius + 20 + Math.random() * 40);
      const endY = centerY + Math.sin(endAngle) * (radius + 20 + Math.random() * 40);

      lightningRef.current.push({
        segments: createBranchingLightning(startX, startY, endX, endY, 8 + Math.floor(Math.random() * 6), 8 + energy * 15),
        life: 0.15 + Math.random() * 0.2,
        intensity: 0.7 + energy * 0.3,
        thickness: 1.5 + Math.random() * 2 + energy * 2,
      });
    }
  };

  const drawEnhancedRing = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    energy: number,
    bass: number,
    treble: number,
    peak: number
  ) => {
    const segments = 150;
    const angleStep = (Math.PI * 2) / segments;

    // Outer glow
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep + timeRef.current * 0.3;
      const noise = Math.sin(angle * 4 + timeRef.current * 3) * (4 + bass * 8);
      const r = radius + noise;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const outerGlow = ctx.createRadialGradient(centerX, centerY, radius - 30, centerX, centerY, radius + 60);
    outerGlow.addColorStop(0, 'rgba(16, 185, 129, 0)');
    outerGlow.addColorStop(0.4, `rgba(16, 185, 129, ${0.15 + energy * 0.3})`);
    outerGlow.addColorStop(0.7, `rgba(52, 211, 153, ${0.35 + energy * 0.4})`);
    outerGlow.addColorStop(1, `rgba(167, 243, 208, ${0.05 + peak * 0.15})`);

    ctx.strokeStyle = outerGlow;
    ctx.lineWidth = 18 + energy * 25;
    ctx.shadowBlur = 50 + energy * 60;
    ctx.shadowColor = `rgba(16, 185, 129, ${0.6 + energy * 0.4})`;
    ctx.stroke();

    // Inner bright line
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep + timeRef.current * 0.3;
      const noise = Math.sin(angle * 4 + timeRef.current * 3) * (2 + treble * 5);
      const r = radius + noise;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.strokeStyle = `rgba(220, 252, 231, ${0.85 + energy * 0.15})`;
    ctx.lineWidth = 3 + energy * 6;
    ctx.shadowBlur = 25 + energy * 35;
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.stroke();

    ctx.shadowBlur = 0;
  };

  const drawLightning = (ctx: CanvasRenderingContext2D, lightning: Lightning) => {
    ctx.beginPath();
    ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
    for (let i = 1; i < lightning.segments.length; i++) ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);

    ctx.strokeStyle = `rgba(52, 211, 153, ${lightning.life * lightning.intensity * 0.4})`;
    ctx.lineWidth = lightning.thickness * 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `rgba(52, 211, 153, ${lightning.life * 0.8})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
    for (let i = 1; i < lightning.segments.length; i++) ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);

    ctx.strokeStyle = `rgba(255, 255, 255, ${lightning.life * lightning.intensity})`;
    ctx.lineWidth = lightning.thickness;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.stroke();

    ctx.shadowBlur = 0;
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (const p of particlesRef.current) {
      const alpha = p.life;
      const size = p.size * (0.5 + p.life * 0.5);

      const color = p.color === 'emerald' ? '52, 211, 153' : '255, 255, 255';
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
      grad.addColorStop(0, `rgba(${color}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${color}, ${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderOrbFrame = (energy: number, bass: number, treble: number, peak: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    timeRef.current += 0.016;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w < 2 || h < 2) return;

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.42;

    if (Math.random() < 0.22 + energy * 0.35) spawnParticles(centerX, centerY, radius, Math.floor(1 + energy * 4), energy);
    spawnLightning(centerX, centerY, radius, energy);

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.016 / p.maxLife;
      return p.life > 0;
    });

    lightningRef.current = lightningRef.current.filter((l) => {
      l.life -= 0.06;
      return l.life > 0;
    });

    ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
    ctx.fillRect(0, 0, w, h);

    drawEnhancedRing(ctx, centerX, centerY, radius, energy, bass, treble, peak);
    for (const l of lightningRef.current) drawLightning(ctx, l);
    drawParticles(ctx);
  };

  // ---------- Idle loop (so orb is visible on load) ----------
  const startIdleLoop = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const tick = () => {
      const s = statusRef.current;
      if (s === 'connected') return; // audio loop takes over

      const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const energy = 0.10 + pulse * 0.08;
      renderOrbFrame(energy, energy * 0.65, energy * 0.45, energy * 0.8);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startIdleLoop();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Cleanup ----------
  const cleanup = (fullyStop: boolean = false) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }

    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }

    if (activeSocketRef.current) {
      activeSocketRef.current.close();
      activeSocketRef.current = null;
    }

    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;

    if (fullyStop) {
      shouldStayConnectedRef.current = false;
      setStatus('idle');
      startIdleLoop();
    }
  };

  const handleAutoReconnect = () => {
    if (!shouldStayConnectedRef.current) return;

    if (retryCountRef.current >= 5) {
      setStatus('error');
      setErrorMessage('Network unstable. Stopped.');
      shouldStayConnectedRef.current = false;
      return;
    }

    setStatus('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);

    reconnectTimeoutRef.current = setTimeout(() => {
      retryCountRef.current++;
      connect();
    }, delay);
  };

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/live`;
  };

  // ---------- Audio visualize loop (same behavior as your file) ----------
  const startAudioLoop = (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    let inTimeBuf: Uint8Array | null = null;
    let outTimeBuf: Uint8Array | null = null;
    let inFreqBuf: Uint8Array | null = null;
    let outFreqBuf: Uint8Array | null = null;

    let inEnv = 0;
    let outEnv = 0;
    let bassEnv = 0;
    let trebleEnv = 0;
    let peakEnv = 0;
    let peakVel = 0;

    const rmsByteTime = (arr: Uint8Array) => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        const x = (arr[i] - 128) / 128;
        sum += x * x;
      }
      return Math.sqrt(sum / arr.length);
    };

    const getBandEnergy = (freqData: Uint8Array, startBin: number, endBin: number) => {
      let sum = 0;
      for (let i = startBin; i <= endBin; i++) sum += freqData[i];
      return (sum / (endBin - startBin + 1)) / 255;
    };

    const tick = () => {
      const s = statusRef.current;
      if (s === 'idle') {
        startIdleLoop();
        return;
      }

      const fftSize = inputAnalyser.fftSize;
      const binCount = inputAnalyser.frequencyBinCount;

      if (!inTimeBuf || inTimeBuf.length !== fftSize) inTimeBuf = new Uint8Array(fftSize);
      if (!outTimeBuf || outTimeBuf.length !== fftSize) outTimeBuf = new Uint8Array(fftSize);
      if (!inFreqBuf || inFreqBuf.length !== binCount) inFreqBuf = new Uint8Array(binCount);
      if (!outFreqBuf || outFreqBuf.length !== binCount) outFreqBuf = new Uint8Array(binCount);

      inputAnalyser.getByteTimeDomainData(inTimeBuf);
      outputAnalyser.getByteTimeDomainData(outTimeBuf);
      inputAnalyser.getByteFrequencyData(inFreqBuf);
      outputAnalyser.getByteFrequencyData(outFreqBuf);

      const inRMS = clamp01(rmsByteTime(inTimeBuf) * 3.5);
      const outRMS = clamp01(rmsByteTime(outTimeBuf) * 3.9);

      const attack = 0.45;
      const release = 0.13;

      inEnv += (inRMS - inEnv) * (inRMS > inEnv ? attack : release);
      outEnv += (outRMS - outEnv) * (outRMS > outEnv ? attack : release);

      const bassTarget = Math.max(getBandEnergy(inFreqBuf, 3, 32), getBandEnergy(outFreqBuf, 3, 32));
      const trebleTarget = Math.max(
        getBandEnergy(inFreqBuf, 256, Math.min(1024, binCount - 1)),
        getBandEnergy(outFreqBuf, 256, Math.min(1024, binCount - 1))
      );

      bassEnv += (bassTarget - bassEnv) * 0.28;
      trebleEnv += (trebleTarget - trebleEnv) * 0.38;

      const energy = Math.max(inEnv, outEnv);

      const peakTarget = Math.max(peakEnv, energy);
      peakVel += (peakTarget - peakEnv) * 0.3;
      peakVel *= 0.75;
      peakEnv += peakVel;
      peakEnv *= 0.982;

      renderOrbFrame(energy, bassEnv, trebleEnv, peakEnv);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const connect = async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    cleanup(false);
    shouldStayConnectedRef.current = true;
    setErrorMessage('');
    setStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      await inputCtx.resume();
      inputContextRef.current = inputCtx;

      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      await outputCtx.resume();
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 2048;
      inputAnalyser.smoothingTimeConstant = 0.82;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 2048;
      outputAnalyser.smoothingTimeConstant = 0.82;
      outputAnalyserRef.current = outputAnalyser;

      source.connect(inputAnalyser);
      source.connect(processor);
      processor.connect(inputCtx.destination);

      // Start audio-driven visuals immediately (during connecting too)
      startAudioLoop(inputAnalyser, outputAnalyser);

      const ws = new WebSocket(getWebSocketUrl());
      activeSocketRef.current = ws;

      ws.onopen = () => {
        const history = transcriptsRef.current.slice(-8);
        let contextStr = '';
        if (history.length > 0) {
          contextStr = '\n\n[PREVIOUS CONVERSATION CONTEXT - Resume from here]:';
          history.forEach((h) => {
            contextStr += `\n${h.role === 'user' ? 'User' : 'You'}: ${h.text}`;
          });
        }

        const languageName = lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English';
        const baseInstruction = `You are AI Krushi Mitra (AI कृषी मित्र), a helpful agricultural assistant for farmers in Maharashtra, India.

Your role:
- Provide farming advice primarily in ${languageName}, but understand and respond in Marathi, Hindi, or English based on user's language
- Help with crop management, pest control, weather guidance, market prices, government schemes
- Be concise, practical, and encouraging
- Use simple language that farmers can understand
- Speak naturally in a conversational, warm tone

Keep responses short (2-3 sentences) unless asked for detailed information.`;

        const fullInstruction = history.length > 0 ? `${baseInstruction}${contextStr}` : baseInstruction;

        ws.send(
          JSON.stringify({
            type: 'setup',
            config: {
              language: lang,
              systemInstruction: fullInstruction,
              voiceName: 'Puck',
              enableInputTranscription: true,
              enableOutputTranscription: true,
            },
          })
        );
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.setupComplete || msg.type === 'setup_complete') {
            retryCountRef.current = 0;
            setStatus('connected');
            triggerHaptic();
            return;
          }

          if (msg.error) {
            setErrorMessage(msg.message || 'Server Error');
            setStatus('error');
            return;
          }

          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && outputContextRef.current && outputAnalyserRef.current) {
            const buffer = await decodeAudioData(decode(audioData), outputContextRef.current, 24000, 1);
            const sourceNode = outputContextRef.current.createBufferSource();
            sourceNode.buffer = buffer;
            sourceNode.connect(outputAnalyserRef.current);
            sourceNode.connect(outputContextRef.current.destination);

            const currentTime = outputContextRef.current.currentTime;
            if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
            sourceNode.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }

          const userTranscript = msg.serverContent?.inputTranscription?.text;
          if (userTranscript) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'user' && last?.text === userTranscript) return prev;
              return [...prev, { role: 'user', text: userTranscript }];
            });
          }

          const modelTranscript = msg.serverContent?.modelTurn?.parts?.[0]?.text;
          if (modelTranscript) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'model' && last?.text === modelTranscript) return prev;
              return [...prev, { role: 'model', text: modelTranscript }];
            });
          }
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };

      ws.onclose = (e) => {
        if (e.code === 1008 || e.reason?.includes('API_KEY')) {
          setErrorMessage('Server API Key Error.');
          setStatus('error');
          shouldStayConnectedRef.current = false;
          startIdleLoop();
          return;
        }

        if (shouldStayConnectedRef.current && e.code !== 1000) {
          handleAutoReconnect();
        } else {
          setStatus('idle');
          shouldStayConnectedRef.current = false;
          startIdleLoop();
        }
      };

      ws.onerror = () => {
        if (shouldStayConnectedRef.current) handleAutoReconnect();
      };

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const blob = createPCMChunk(inputData, inputCtx.sampleRate);

        if (
          activeSocketRef.current &&
          activeSocketRef.current.readyState === WebSocket.OPEN &&
          shouldStayConnectedRef.current
        ) {
          activeSocketRef.current.send(
            JSON.stringify({
              realtimeInput: {
                media: {
                  mimeType: 'audio/pcm;rate=16000',
                  data: blob.data,
                },
              },
            })
          );
        }
      };
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to connect microphone');
      setStatus('error');
      startIdleLoop();
    }
  };

  const handleToggle = () => {
    triggerHaptic();
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect();
    } else {
      cleanup(true);
    }
  };

  const handleBack = () => {
    cleanup(true);
    onBack();
  };

  const isIdleLayout = transcripts.length === 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[#020617] h-[100dvh] w-full overflow-hidden grid grid-rows-[auto_1fr]"
    >
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .idle-pulse { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#020617]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-emerald-900/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Header row (reserves space) */}
      <div className="relative z-[220] px-4 pt-safe-top pb-3 flex justify-between items-center bg-gradient-to-b from-[#020617]/90 via-[#020617]/60 to-transparent">
        <button
          onClick={handleBack}
          className="flex items-center gap-2.5 pl-2 pr-5 py-2.5 rounded-full bg-slate-900/70 backdrop-blur-xl border border-emerald-500/30 text-white hover:border-emerald-400/50 active:scale-95 transition-all shadow-2xl group"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold text-sm tracking-wide">Back</span>
        </button>

        <div
          className={clsx(
            'px-4 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-500 shadow-2xl',
            status === 'connected'
              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
              : status === 'error'
              ? 'border-red-400/50 bg-red-500/20 text-red-200'
              : status === 'offline'
              ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-200'
              : 'border-emerald-500/20 bg-white/5 text-slate-300'
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            {status === 'connected' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
            )}
            {status === 'idle' ? 'AI Ready' : status}
          </span>
        </div>
      </div>

      {/* Main row (centering + top guard padding) */}
      <div
        className={clsx(
          'relative z-10 min-h-0 flex flex-col items-center px-4 pb-10 overflow-hidden',
          TOP_GUARD_PT_CLASS,
          isIdleLayout ? 'justify-center' : 'justify-start'
        )}
      >
        {/* Orb wrapper */}
        <div
          ref={ringWrapperRef}
          className="w-full flex items-center justify-center"
          style={{
            height: isIdleLayout ? ORB_HEIGHT_IDLE : ORB_HEIGHT_ACTIVE,
            maxWidth: 420,
          }}
        >
          <div className="relative w-full flex items-center justify-center cursor-pointer select-none" onClick={handleToggle}>
            <canvas ref={canvasRef} className="drop-shadow-2xl block" />

            {/* Center overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center flex flex-col items-center justify-center">
                {status === 'idle' ? (
                  <div className="flex flex-col items-center idle-pulse">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-600/20 backdrop-blur-md border-2 border-emerald-400/40 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                      <Mic size={40} className="text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200/90 drop-shadow-lg">
                      Tap to Start
                    </span>
                  </div>
                ) : status === 'connecting' || status === 'reconnecting' ? (
                  <RefreshCw size={52} className="text-emerald-400 animate-spin drop-shadow-[0_0_30px_rgba(16,185,129,0.7)]" />
                ) : status === 'offline' ? (
                  <span className="text-sm font-bold uppercase tracking-widest text-yellow-200">Offline</span>
                ) : (
                  <span className="text-sm font-bold uppercase tracking-widest text-emerald-200">Listening…</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title & hints */}
        <div className="mt-7 w-full flex flex-col items-center">
          <h2 className="text-2xl font-black text-emerald-100 tracking-tight mb-3 drop-shadow-[0_2px_30px_rgba(16,185,129,0.7)]">
            {status === 'connected'
              ? 'मी ऐकतोय...'
              : status === 'idle'
              ? t.voice_title
              : status === 'error'
              ? 'Connection Error'
              : status === 'offline'
              ? 'No Internet'
              : 'Connecting...'}
          </h2>

          {status === 'error' && errorMessage && (
            <div className="text-xs text-red-200/95 bg-red-500/15 border border-red-400/30 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-lg">
              {errorMessage}
            </div>
          )}

          {(status === 'idle' || (status === 'connected' && transcripts.length < 2)) && (
            <div className="w-full max-w-[320px] flex flex-col gap-3 mt-5">
              {t.voice_hints.slice(0, 3).map((hint: string, i: number) => (
                <div
                  key={i}
                  className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/8 border border-emerald-400/25 backdrop-blur-xl text-sm font-medium text-emerald-50 shadow-2xl flex items-center gap-3 hover:from-emerald-500/20 hover:to-cyan-500/12 transition-all cursor-pointer active:scale-[0.97]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <MessageSquare size={14} className="text-emerald-300" />
                  </div>
                  <span className="truncate">{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transcript overlay */}
        <div
          className={clsx(
            'absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-20 pb-safe-bottom px-6 z-20 transition-all duration-700 flex flex-col justify-end',
            transcripts.length === 0 ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          )}
          style={{ minHeight: '32vh', maxHeight: '45vh' }}
        >
          <div
            className="flex flex-col gap-3.5 max-h-full overflow-y-auto pb-5"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
            }}
          >
            {transcripts.slice(-6).map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'p-4 rounded-2xl backdrop-blur-xl border max-w-[85%] text-sm font-medium shadow-2xl',
                  msg.role === 'user'
                    ? 'self-end bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 text-emerald-50 border-emerald-400/40 rounded-tr-md shadow-[0_4px_20px_rgba(16,185,129,0.3)]'
                    : 'self-start bg-gradient-to-br from-white/15 to-white/8 text-slate-100 border-white/20 rounded-tl-md'
                )}
              >
                {msg.text}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
