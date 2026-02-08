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

  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const transcriptsRef = useRef<{ role: 'user' | 'model'; text: string }[]>([]);
  const shouldStayConnectedRef = useRef(false);
  const activeSocketRef = useRef<WebSocket | null>(null);

  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const nextStartTimeRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringWrapperRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lightningRef = useRef<Lightning[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const isGuest = user.email === 'guest@aikrushimitra.in' || user.email?.includes('guest');

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

  if (isGuest) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6 animate-enter">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

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

  // ---- Visualize (unchanged from your attached code) ----
  const visualize = (() => {
    let inTimeBuf: Uint8Array | null = null;
    let outTimeBuf: Uint8Array | null = null;
    let inFreqBuf: Uint8Array | null = null;
    let outFreqBuf: Uint8Array | null = null;

    let inEnv = 0;
    let outEnv = 0;
    let bassEnv = 0;
    let midEnv = 0;
    let trebleEnv = 0;
    let peakEnv = 0;
    let peakVel = 0;

    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

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
      if (Math.random() < 0.12 + energy * 0.35) {
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

        if (Math.random() < 0.4) {
          const midIdx = Math.floor(Math.random() * 6) + 3;
          const midPoint = lightningRef.current[lightningRef.current.length - 1].segments[midIdx];
          if (midPoint) {
            const branchAngle = Math.random() * Math.PI * 2;
            const branchEndX = midPoint.x + Math.cos(branchAngle) * (20 + Math.random() * 30);
            const branchEndY = midPoint.y + Math.sin(branchAngle) * (20 + Math.random() * 30);

            lightningRef.current.push({
              segments: createBranchingLightning(midPoint.x, midPoint.y, branchEndX, branchEndY, 4, 6),
              life: 0.1 + Math.random() * 0.15,
              intensity: 0.5 + energy * 0.3,
              thickness: 1 + Math.random() * 1.5,
            });
          }
        }
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

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep + timeRef.current * 0.3;
        const noise = Math.sin(angle * 4 + timeRef.current * 3) * (3 + bass * 6);
        const r = radius + noise;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const midGlow = ctx.createRadialGradient(centerX, centerY, radius - 15, centerX, centerY, radius + 30);
      midGlow.addColorStop(0, 'rgba(34, 197, 94, 0)');
      midGlow.addColorStop(0.5, `rgba(52, 211, 153, ${0.5 + energy * 0.4})`);
      midGlow.addColorStop(0.8, `rgba(110, 231, 183, ${0.7 + energy * 0.3})`);
      midGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = midGlow;
      ctx.lineWidth = 10 + energy * 15;
      ctx.shadowBlur = 35 + energy * 45;
      ctx.shadowColor = `rgba(52, 211, 153, 0.8)`;
      ctx.stroke();

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

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1 + energy * 2;
      ctx.shadowBlur = 20;
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
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.stroke();
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      particlesRef.current.forEach((p) => {
        const alpha = p.life;
        const size = p.size * (0.5 + p.life * 0.5);

        if (p.type === 'ember') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
          grad.addColorStop(0, `rgba(250, 204, 21, ${alpha * 0.8})`);
          grad.addColorStop(0.4, `rgba(251, 146, 60, ${alpha * 0.5})`);
          grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const color = p.color === 'emerald' ? '52, 211, 153' : '255, 255, 255';
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
          grad.addColorStop(0, `rgba(${color}, ${alpha})`);
          grad.addColorStop(0.5, `rgba(${color}, ${alpha * 0.6})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255, 255, 255, 1)';
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;
    };

    return (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      timeRef.current += 0.016;

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
      const midTarget = Math.max(getBandEnergy(inFreqBuf, 32, 256), getBandEnergy(outFreqBuf, 32, 256));
      const trebleTarget = Math.max(
        getBandEnergy(inFreqBuf, 256, Math.min(1024, binCount - 1)),
        getBandEnergy(outFreqBuf, 256, Math.min(1024, binCount - 1))
      );

      bassEnv += (bassTarget - bassEnv) * 0.28;
      midEnv += (midTarget - midEnv) * 0.32;
      trebleEnv += (trebleTarget - trebleEnv) * 0.38;

      const energy = Math.max(inEnv, outEnv);

      const peakTarget = Math.max(peakEnv, energy);
      peakVel += (peakTarget - peakEnv) * 0.3;
      peakVel *= 0.75;
      peakEnv += peakVel;
      peakEnv *= 0.982;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) * 0.42;

      if (Math.random() < 0.4 + energy * 0.6) spawnParticles(centerX, centerY, radius, Math.floor(2 + energy * 5), energy);
      spawnLightning(centerX, centerY, radius, energy);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.016 / p.maxLife;
        return p.life > 0;
      });

      lightningRef.current = lightningRef.current.filter((l) => {
        l.life -= 0.06;
        return l.life > 0;
      });

      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, w, h);

      drawEnhancedRing(ctx, centerX, centerY, radius, energy, bassEnv, trebleEnv, peakEnv);
      lightningRef.current.forEach((l) => drawLightning(ctx, l));
      drawParticles(ctx);

      animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
    };
  })();

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/live`;
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

      visualize(inputAnalyser, outputAnalyser);

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
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.role === 'user' && lastMsg?.text === userTranscript) return prev;
              return [...prev, { role: 'user', text: userTranscript }];
            });
          }

          const modelTranscript = msg.serverContent?.modelTurn?.parts?.[0]?.text;
          if (modelTranscript) {
            setTranscripts((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.role === 'model' && lastMsg?.text === modelTranscript) return prev;
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
          return;
        }

        if (shouldStayConnectedRef.current && e.code !== 1000) {
          handleAutoReconnect();
        } else {
          setStatus('idle');
          shouldStayConnectedRef.current = false;
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error', err);
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

  // Canvas resize (keep)
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = ringWrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);

      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = size * dpr;
      canvas.height = size * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const isIdleScreen = status === 'idle' && transcripts.length === 0;

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col h-[100dvh] w-full overflow-hidden" ref={containerRef}>
      {/* Styles */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .brand-shimmer {
          background: linear-gradient(
            90deg,
            rgba(52, 211, 153, 0.4) 0%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(52, 211, 153, 0.4) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
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

      {/* ✅ Top bar is now sticky (NOT absolute) */}
      <div className="sticky top-0 z-[220] px-4 pt-safe-top pb-3 flex justify-between items-center bg-gradient-to-b from-[#020617]/90 via-[#020617]/60 to-transparent">
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

      {/* ✅ Main area centers content INSIDE padding (so orb never crosses top) */}
      <div
        className={clsx(
          'relative z-10 flex-1 w-full px-4',
          // Top padding guarantees orb stays below top margin even when centered
          'pt-6 pb-10'
        )}
      >
        <div className={clsx('w-full flex flex-col items-center', isIdleScreen ? 'my-auto' : 'mt-2')}>
          {/* Orb */}
          <div
            ref={ringWrapperRef}
            className="w-full flex items-center justify-center"
            style={{
              // Responsive height prevents giant orb from pushing into top area
              height: isIdleScreen ? 'clamp(260px, 34vh, 320px)' : 'clamp(240px, 30vh, 280px)',
              maxWidth: 420,
            }}
          >
            <div
              className="relative flex items-center justify-center cursor-pointer select-none w-full"
              onClick={handleToggle}
            >
              <canvas ref={canvasRef} className="drop-shadow-2xl block" />

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
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-600/10 backdrop-blur-md border-2 border-emerald-400/50 flex items-center justify-center mb-5 shadow-[0_0_60px_rgba(16,185,129,0.5)] relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-500/20 animate-spin"
                          style={{ animationDuration: '8s' }}
                        />
                        <div className="relative">
                          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-200 via-white to-cyan-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                            AI
                          </div>
                        </div>
                      </div>

                      <h1 className="text-3xl font-black leading-tight mb-2 brand-shimmer drop-shadow-[0_0_30px_rgba(16,185,129,0.9)]">
                        कृषी मित्र
                      </h1>

                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80 drop-shadow-lg">
                        Voice Assistant
                      </p>

                      <div className="flex items-center gap-1 mt-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-6 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                            style={{
                              animation: 'pulse-glow 1.2s ease-in-out infinite',
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text + hints */}
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
        </div>
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
  );
};

export default VoiceAssistant;
