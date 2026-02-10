import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { clsx } from 'clsx';

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string };

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
  onUserUpdate?: (u: UserProfile) => void;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const transcriptsRef = useRef<Transcript[]>([]);
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const shouldStayConnectedRef = useRef(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSessionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const workletUrlRef = useRef<string | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringWrapperRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lightningRef = useRef<Lightning[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const onOffline = () => {
      if (shouldStayConnectedRef.current) setStatus('offline');
    };
    const onOnline = () => {
      if (shouldStayConnectedRef.current && (status === 'offline' || status === 'error')) connect();
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [status]);

  const cleanup = (fullyStop: boolean = false) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.port.onmessage = null;
        workletNodeRef.current.disconnect();
      } catch {}
      workletNodeRef.current = null;
    }

    if (muteGainRef.current) {
      try { muteGainRef.current.disconnect(); } catch {}
      muteGainRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputContextRef.current) {
      inputContextRef.current.close().catch(() => {});
      inputContextRef.current = null;
    }

    if (outputContextRef.current) {
      outputContextRef.current.close().catch(() => {});
      outputContextRef.current = null;
    }

    if (workletUrlRef.current) {
      try { URL.revokeObjectURL(workletUrlRef.current); } catch {}
      workletUrlRef.current = null;
    }

    if (activeSessionRef.current) {
      try { activeSessionRef.current.close(); } catch {}
      activeSessionRef.current = null;
    }

    sessionPromiseRef.current = null;
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
      for (let i = startBin; i <= endBin; i++) {
        sum += freqData[i];
      }
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
          color: Math.random() > 0.5 ? 'cyan' : 'white',
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
      outerGlow.addColorStop(0, 'rgba(0, 100, 200, 0)');
      outerGlow.addColorStop(0.4, `rgba(0, 180, 255, ${0.15 + energy * 0.3})`);
      outerGlow.addColorStop(0.7, `rgba(100, 220, 255, ${0.35 + energy * 0.4})`);
      outerGlow.addColorStop(1, `rgba(200, 240, 255, ${0.05 + peak * 0.15})`);

      ctx.strokeStyle = outerGlow;
      ctx.lineWidth = 18 + energy * 25;
      ctx.shadowBlur = 50 + energy * 60;
      ctx.shadowColor = `rgba(0, 200, 255, ${0.6 + energy * 0.4})`;
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
      midGlow.addColorStop(0, 'rgba(50, 150, 255, 0)');
      midGlow.addColorStop(0.5, `rgba(100, 200, 255, ${0.5 + energy * 0.4})`);
      midGlow.addColorStop(0.8, `rgba(150, 230, 255, ${0.7 + energy * 0.3})`);
      midGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = midGlow;
      ctx.lineWidth = 10 + energy * 15;
      ctx.shadowBlur = 35 + energy * 45;
      ctx.shadowColor = `rgba(100, 220, 255, ${0.8})`;
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

      ctx.strokeStyle = `rgba(220, 245, 255, ${0.85 + energy * 0.15})`;
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
      for (let i = 1; i < lightning.segments.length; i++) {
        ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
      }
      ctx.strokeStyle = `rgba(100, 220, 255, ${lightning.life * lightning.intensity * 0.4})`;
      ctx.lineWidth = lightning.thickness * 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(100, 220, 255, ${lightning.life * 0.8})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
      for (let i = 1; i < lightning.segments.length; i++) {
        ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
      }
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
          grad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.8})`);
          grad.addColorStop(0.4, `rgba(255, 150, 50, ${alpha * 0.5})`);
          grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const color = p.color === 'cyan' ? '100, 220, 255' : '255, 255, 255';
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
      peakVel += (peakTarget - peakEnv) * 0.30;
      peakVel *= 0.75;
      peakEnv += peakVel;
      peakEnv *= 0.982;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) * 0.42;

      if (Math.random() < 0.4 + energy * 0.6) {
        spawnParticles(centerX, centerY, radius, Math.floor(2 + energy * 5), energy);
      }
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

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, w, h);

      drawEnhancedRing(ctx, centerX, centerY, radius, energy, bassEnv, trebleEnv, peakEnv);
      lightningRef.current.forEach((l) => drawLightning(ctx, l));
      drawParticles(ctx);

      animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
    };
  })();

  const createPCMForwarderWorkletUrl = () => {
    const code = `
      class PCMForwarder extends AudioWorkletProcessor {
        process(inputs) {
          const input = inputs && inputs[0] && inputs[0][0];
          if (input && input.length) {
            const copy = new Float32Array(input.length);
            copy.set(input);
            this.port.postMessage(copy, [copy.buffer]);
          }
          return true;
        }
      }
      registerProcessor('pcm-forwarder', PCMForwarder);
    `;
    const blob = new Blob([code], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  };

  const connect = async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    const apiKey = getGenAIKey();
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('API Key Not Found.');
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

      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 2048;
      inputAnalyser.smoothingTimeConstant = 0.82;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 2048;
      outputAnalyser.smoothingTimeConstant = 0.82;
      outputAnalyserRef.current = outputAnalyser;

      const source = inputCtx.createMediaStreamSource(stream);
      const mute = inputCtx.createGain();
      mute.gain.value = 0;
      muteGainRef.current = mute;

      const workletUrl = createPCMForwarderWorkletUrl();
      workletUrlRef.current = workletUrl;
      await inputCtx.audioWorklet.addModule(workletUrl);
      const workletNode = new AudioWorkletNode(inputCtx, 'pcm-forwarder');
      workletNodeRef.current = workletNode;

      source.connect(inputAnalyser);
      source.connect(workletNode);
      workletNode.connect(mute).connect(inputCtx.destination);

      visualize(inputAnalyser, outputAnalyser);

      const ai = new GoogleGenAI({ apiKey });
      const history = transcriptsRef.current.slice(-8);
      let contextStr = '';
      if (history.length > 0) {
        contextStr = '\n\n[PREVIOUS CONVERSATION CONTEXT - Resume from here]:';
        history.forEach((h) => {
          contextStr += `\n${h.role === 'user' ? 'User' : 'You'}: ${h.text}`;
        });
      }

      const baseInstruction =
        "You are AI Krushi Mitra, a helpful agricultural expert assistant for Indian farmers. Speak naturally in Marathi, Hindi or English as per the user's language preference. Keep responses concise, practical, and encouraging.";
      const fullInstruction = history.length > 0 ? `${baseInstruction}${contextStr}` : baseInstruction;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: fullInstruction,
        },
        callbacks: {
          onopen: () => {
            retryCountRef.current = 0;
            setStatus('connected');
            triggerHaptic();
          },
          onmessage: async (msg: any) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current && outputAnalyserRef.current) {
              const ctx = outputContextRef.current;
              const analyser = outputAnalyserRef.current;
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(analyser);
              sourceNode.connect(ctx.destination);
              const now = ctx.currentTime;
              if (nextStartTimeRef.current < now) nextStartTimeRef.current = now;
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
            }

            const userTranscript = msg.serverContent?.inputTranscription?.text;
            if (userTranscript) setTranscripts((prev) => [...prev, { role: 'user', text: userTranscript }]);

            const modelTranscript = msg.serverContent?.outputTranscription?.text;
            if (modelTranscript) setTranscripts((prev) => [...prev, { role: 'model', text: modelTranscript }]);
          },
          onclose: (e: any) => {
            if (e.code === 1008 || e.reason?.includes('leaked')) {
              setErrorMessage('API Key Revoked.');
              setStatus('error');
              shouldStayConnectedRef.current = false;
              return;
            }
            if (shouldStayConnectedRef.current && e.code !== 1000) handleAutoReconnect();
            else {
              setStatus('idle');
              shouldStayConnectedRef.current = false;
            }
          },
          onerror: () => {
            if (shouldStayConnectedRef.current) handleAutoReconnect();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionPromise.then((sess) => { activeSessionRef.current = sess; }).catch(() => handleAutoReconnect());

      workletNode.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        const ctx = inputContextRef.current;
        if (!ctx || !chunk) return;
        const blob = createPCMChunk(chunk, ctx.sampleRate);
        if (sessionPromiseRef.current) {
          sessionPromiseRef.current
            .then((session) => {
              if (session === activeSessionRef.current && shouldStayConnectedRef.current) {
                session.sendRealtimeInput({ media: blob });
              }
            })
            .catch(() => {});
        }
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to connect microphone');
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

  return (
    <div className="fixed inset-0 z-[200] bg-[#000000] flex flex-col h-[100dvh] w-full overflow-hidden" ref={containerRef}>
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
            rgba(100, 220, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(100, 220, 255, 0.4) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .idle-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-[#001a33] via-[#000510] to-[#000000]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0, 180, 255, 0.15) 1px, transparent 0)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-[220] bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <button
          onClick={handleBack}
          className="flex items-center gap-2.5 pl-2 pr-5 py-2.5 rounded-full bg-slate-900/70 backdrop-blur-xl border border-cyan-500/30 text-white hover:border-cyan-400/50 active:scale-95 transition-all shadow-2xl group"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold text-sm tracking-wide">Back</span>
        </button>

        <div
          className={clsx(
            'px-4 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-500 shadow-2xl',
            status === 'connected'
              ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100'
              : status === 'error'
              ? 'border-red-400/50 bg-red-500/20 text-red-200'
              : status === 'offline'
              ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-200'
              : 'border-cyan-500/20 bg-white/5 text-slate-300'
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            {status === 'connected' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#22d3ee]" />
            )}
            {status === 'idle' ? 'AI Ready' : status}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center w-full relative z-10 pt-2">
        <div
          ref={ringWrapperRef}
          className="w-full flex items-center justify-center"
          style={{ height: '280px' }}
        >
          <div
            className="relative flex items-center justify-center cursor-pointer select-none"
            onClick={handleToggle}
            style={{ width: '100%', maxWidth: 360 }}
          >
            <canvas ref={canvasRef} className="drop-shadow-2xl" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center flex flex-col items-center justify-center">
                {status === 'idle' ? (
                  <div className="flex flex-col items-center idle-pulse">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/20 backdrop-blur-md border-2 border-cyan-400/40 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                      <Mic size={40} className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-200/90 drop-shadow-lg">
                      Tap to Start
                    </span>
                  </div>
                ) : status === 'connecting' || status === 'reconnecting' ? (
                  <RefreshCw size={52} className="text-cyan-400 animate-spin drop-shadow-[0_0_30px_rgba(34,211,238,0.7)]" />
                ) : status === 'offline' ? (
                  <span className="text-sm font-bold uppercase tracking-widest text-yellow-200">
                    Offline
                  </span>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/10 backdrop-blur-md border-2 border-cyan-400/50 flex items-center justify-center mb-5 shadow-[0_0_60px_rgba(34,211,238,0.5)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="relative">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 via-white to-blue-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                          AI
                        </div>
                      </div>
                    </div>

                    <h1 className="text-3xl font-black leading-tight mb-2 brand-shimmer drop-shadow-[0_0_30px_rgba(34,211,238,0.9)]">
                      कृषी मित्र
                    </h1>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80 drop-shadow-lg">
                      Voice Assistant
                    </p>

                    <div className="flex items-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-6 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]"
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

        <div className="mt-8 w-full px-6 flex flex-col items-center z-40">
          <h2 className="text-2xl font-black text-cyan-100 tracking-tight mb-3 drop-shadow-[0_2px_30px_rgba(34,211,238,0.7)]">
            {status === 'connected'
              ? "मी ऐकतोय..."
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
            <div className="w-full max-w-[320px] flex flex-col gap-3 mt-7">
              {t.voice_hints.slice(0, 3).map((hint: string, i: number) => (
                <div
                  key={i}
                  className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/8 border border-cyan-400/25 backdrop-blur-xl text-sm font-medium text-cyan-50 shadow-2xl flex items-center gap-3 hover:from-cyan-500/20 hover:to-blue-500/12 transition-all cursor-pointer active:scale-[0.97]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <MessageSquare size={14} className="text-cyan-300" />
                  </div>
                  <span className="truncate">{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  ? 'self-end bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 text-cyan-50 border-cyan-400/40 rounded-tr-md shadow-[0_4px_20px_rgba(34,211,238,0.3)]'
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