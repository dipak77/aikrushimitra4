import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import {
  ArrowLeft, Mic, VideoOff, Scan, Activity, Cpu,
  Sparkles, ChevronUp, AlertTriangle, RefreshCw, Radio,
  Eye, Waves, Signal, Hexagon, CircuitBoard
} from 'lucide-react';
import { decode, decodeAudioData, createPCMChunkBase64 } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import clsx from 'clsx';
import { MOCK_MARKET } from '../../data/mock';

// ═══════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string; id: string; ts: number };

const MAX_RETRIES = 5;
const RECONNECT_BASE_DELAY = 1000;
const uid = () => crypto.randomUUID().slice(0, 8);

const TOOLS: any[] = [
  {
    functionDeclarations: [
      {
        name: "get_weather_forecast",
        description: "Get current weather and forecast for the farm location.",
        parameters: {
          type: Type.OBJECT,
          properties: { location: { type: Type.STRING, description: "Village or city name" } },
          required: ["location"]
        }
      },
      {
        name: "get_mandi_price",
        description: "Get live market prices (bajar bhav) for crops.",
        parameters: {
          type: Type.OBJECT,
          properties: { crop: { type: Type.STRING, description: "Crop name (e.g. Soyabean, Cotton)" } },
          required: ["crop"]
        }
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// AUDIO WORKLET
// ═══════════════════════════════════════════════════════════════

let workletUrlCache: string | null = null;
function getWorkletUrl() {
  if (workletUrlCache) return workletUrlCache;
  const code = `
    class PCMForwarder extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs?.[0]?.[0];
        if (ch?.length) this.port.postMessage(ch);
        return true;
      }
    }
    registerProcessor('pcm-forwarder', PCMForwarder);
  `;
  workletUrlCache = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return workletUrlCache;
}

async function captureFrame(video: HTMLVideoElement): Promise<string | null> {
  if (!video.videoWidth) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
}

// ═══════════════════════════════════════════════════════════════
// PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════

const ParticleField = React.memo(({ active, color }: { active: boolean; color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; decay: number }>>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, w(), h());

      if (active && Math.random() > 0.6) {
        const cx = w() / 2;
        const cy = h() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        particles.current.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.5 - Math.random() * 2,
          size: 1 + Math.random() * 2.5,
          alpha: 0.6 + Math.random() * 0.4,
          decay: 0.005 + Math.random() * 0.015,
        });
      }

      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.15})`;
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[5]" />;
});

// ═══════════════════════════════════════════════════════════════
// WAVEFORM RING COMPONENT (Canvas-based)
// ═══════════════════════════════════════════════════════════════

const WaveformRing = React.memo(({ analyser, color, radius, lineWidth = 2 }: {
  analyser: AnalyserNode | null; color: string; radius: number; lineWidth?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = radius * 2 + 60;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = new Uint8Array(analyser?.frequencyBinCount || 128);
    const cx = size / 2;
    const cy = size / 2;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      if (analyser) {
        analyser.getByteTimeDomainData(data);
      }

      const steps = 128;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
        const dataIndex = Math.floor((i / steps) * data.length);
        const v = analyser ? (data[dataIndex] - 128) / 128 : 0;
        const r = radius + v * 30;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color}, 0.6)`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Inner glow
      ctx.shadowColor = `rgba(${color}, 0.4)`;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, color, radius, lineWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const VoiceAssistant = ({
  lang, user, onBack,
}: {
  lang: Language; user: UserProfile; onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showTranscripts, setShowTranscripts] = useState(false);
  const [activeTool, setActiveTool] = useState<{ name: string; result: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldStayRef = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const connectRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const setupDone = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const [inputAnalyserState, setInputAnalyserState] = useState<AnalyserNode | null>(null);
  const [outputAnalyserState, setOutputAnalyserState] = useState<AnalyserNode | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextPlayTime = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Timer
  useEffect(() => {
    if (status === 'connected') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (status === 'idle') setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, showTranscripts]);

  // ═══════════════════════════════════════════════════════════════
  // VOLUME CSS VARS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const inData = new Uint8Array(128);
    const outData = new Uint8Array(128);
    let uVol = 0, aVol = 0;
    let raf = 0;

    const loop = () => {
      let tU = 0, tA = 0;
      if (inputAnalyserRef.current) {
        inputAnalyserRef.current.getByteFrequencyData(inData);
        let s = 0; for (let i = 0; i < 32; i++) s += inData[i];
        tU = s / 32 / 255;
      }
      if (outputAnalyserRef.current) {
        outputAnalyserRef.current.getByteFrequencyData(outData);
        let s = 0; for (let i = 0; i < 32; i++) s += outData[i];
        tA = s / 32 / 255;
      }
      uVol += (tU - uVol) * 0.15;
      aVol += (tA - aVol) * 0.25;
      if (containerRef.current) {
        containerRef.current.style.setProperty('--u', uVol.toFixed(4));
        containerRef.current.style.setProperty('--a', aVol.toFixed(4));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════

  const cleanup = useCallback((full = false) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch {} sessionRef.current = null; }
    setupDone.current = false;
    [workletRef, muteGainRef, compressorRef].forEach(r => {
      if (r.current) { try { (r.current as AudioNode).disconnect(); } catch {} (r as any).current = null; }
    });
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; setVideoStream(null); }
    [inputCtxRef, outputCtxRef].forEach(r => { if (r.current) { r.current.close().catch(() => {}); (r as any).current = null; } });
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    setInputAnalyserState(null);
    setOutputAnalyserState(null);
    if (full) {
      shouldStayRef.current = false;
      setStatus('idle');
      setIsSpeaking(false);
      setActiveTool(null);
      if (containerRef.current) { containerRef.current.style.setProperty('--u', '0'); containerRef.current.style.setProperty('--a', '0'); }
    }
  }, []);

  useEffect(() => () => cleanup(true), [cleanup]);

  const handleReconnect = useCallback(() => {
    if (!shouldStayRef.current) return;
    if (retryCount.current >= MAX_RETRIES) {
      setStatus('error');
      setErrorMessage(lang === 'mr' ? 'कनेक्शन तुटले.' : 'Connection lost. Try again.');
      shouldStayRef.current = false;
      return;
    }
    setStatus('reconnecting');
    const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, retryCount.current), 10000);
    reconnectTimer.current = setTimeout(() => { retryCount.current++; connectRef.current?.(true); }, delay);
  }, [lang]);

  const handleToolCall = async (functionCalls: any[]) => {
    if (!functionCalls?.length) return [];
    const responses = [];
    for (const call of functionCalls) {
      let result = {};
      let displayText = "";
      if (call.name === "get_weather_forecast") {
        result = { condition: "Partly Cloudy", temp: "28°C", forecast: "Chance of light rain." };
        displayText = "🌤️ Weather Analysis";
      } else if (call.name === "get_mandi_price") {
        const crop = call.args.crop;
        const m = MOCK_MARKET.find(x => x.name.toLowerCase().includes(crop.toLowerCase()));
        result = m ? { price: m.price, trend: m.trend } : { price: "4500", trend: "Stable" };
        displayText = `💰 ${crop} Market Data`;
      }
      setActiveTool({ name: displayText, result: JSON.stringify(result) });
      setTimeout(() => setActiveTool(null), 3500);
      responses.push({ id: call.id, name: call.name, response: { result } });
    }
    return responses;
  };

  // ═══════════════════════════════════════════════════════════════
  // CONNECT
  // ═══════════════════════════════════════════════════════════════

  const connect = useCallback(async (isRetry?: boolean) => {
    if (!navigator.onLine) { setStatus('offline'); return; }
    cleanup(false);
    shouldStayRef.current = true;
    setErrorMessage('');
    setStatus(retryCount.current > 0 ? 'reconnecting' : 'connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: cameraEnabled ? { width: 640, height: 480, facingMode: 'environment' } : false,
      });
      if (!shouldStayRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      if (cameraEnabled) {
        const vt = stream.getVideoTracks()[0];
        if (vt) {
          const vs = new MediaStream([vt]);
          setVideoStream(vs);
          if (hiddenVideoRef.current) { hiddenVideoRef.current.srcObject = vs; hiddenVideoRef.current.play().catch(() => {}); }
        }
      }
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new AC({ sampleRate: 16000 }); await inCtx.resume(); inputCtxRef.current = inCtx;
      const outCtx = new AC({ sampleRate: 24000 }); await outCtx.resume(); outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;
      const inA = inCtx.createAnalyser(); inA.fftSize = 256; inA.smoothingTimeConstant = 0.75; inputAnalyserRef.current = inA; setInputAnalyserState(inA);
      const outA = outCtx.createAnalyser(); outA.fftSize = 256; outA.smoothingTimeConstant = 0.75; outputAnalyserRef.current = outA; setOutputAnalyserState(outA);
      const comp = outCtx.createDynamicsCompressor(); comp.connect(outA); outA.connect(outCtx.destination); compressorRef.current = comp;
      const src = inCtx.createMediaStreamSource(stream);
      await inCtx.audioWorklet.addModule(getWorkletUrl());
      const wk = new AudioWorkletNode(inCtx, 'pcm-forwarder'); workletRef.current = wk;
      const mute = inCtx.createGain(); mute.gain.value = 0; muteGainRef.current = mute;
      src.connect(inA); src.connect(wk); wk.connect(mute).connect(inCtx.destination);
      const apiKey = getGenAIKey(); if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `You are KRUSHI MITRA AI, a highly advanced agricultural robotic assistant. ROLE: Friendly, expert agronomist speaking ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}. STYLE: Concise, natural spoken voice.`;
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: TOOLS,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setupDone.current = true; retryCount.current = 0; setStatus('connected'); triggerHaptic('heavy');
            if (cameraEnabled && hiddenVideoRef.current) {
              if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
              videoIntervalRef.current = setInterval(async () => {
                if (!setupDone.current || !sessionRef.current || !hiddenVideoRef.current) return;
                const b = await captureFrame(hiddenVideoRef.current);
                if (b) sessionRef.current.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: b } });
              }, 2000);
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              const r = await handleToolCall(msg.toolCall.functionCalls || []);
              if (r.length > 0 && sessionRef.current) sessionRef.current.sendToolResponse({ functionResponses: r });
            }
            const ad = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (ad && outputCtxRef.current && compressorRef.current) {
              const c = outputCtxRef.current;
              const buf = await decodeAudioData(decode(ad as string), c, 24000, 1);
              const s = c.createBufferSource(); s.buffer = buf; s.connect(compressorRef.current);
              const now = c.currentTime; if (nextPlayTime.current < now) nextPlayTime.current = now;
              s.start(nextPlayTime.current); nextPlayTime.current += buf.duration;
              setIsSpeaking(true);
              if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
              s.onended = () => { speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 200); };
            }
            const ut = msg.serverContent?.inputTranscription?.text;
            if (ut?.trim()) setTranscripts(p => [...p, { role: 'user', text: ut.trim(), id: uid(), ts: Date.now() }]);
            const mt = msg.serverContent?.outputTranscription?.text;
            if (mt?.trim()) setTranscripts(p => [...p, { role: 'model', text: mt.trim(), id: uid(), ts: Date.now() }]);
          },
          onclose: () => {
            setupDone.current = false;
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
            if (shouldStayRef.current) handleReconnect(); else setStatus('idle');
          },
          onerror: (e: any) => { console.error(e); setStatus('error'); setErrorMessage('Connection interrupted.'); },
        },
      });
      sessionRef.current = session;
      wk.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !setupDone.current || !sessionRef.current) return;
        try {
          const b = createPCMChunkBase64(chunk, inputCtxRef.current?.sampleRate || 16000);
          session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b } });
        } catch {}
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Permission Denied.');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, lang, cameraEnabled]);

  useEffect(() => { connectRef.current = connect; }, [connect]);

  const handleToggle = useCallback(() => {
    triggerHaptic('medium');
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect(false);
    } else { cleanup(true); }
  }, [status, connect, cleanup]);

  const toggleCamera = useCallback(() => {
    setCameraEnabled(prev => {
      if (status === 'connected' || status === 'connecting') { cleanup(false); setTimeout(() => connect(false), 200); }
      return !prev;
    });
  }, [status, cleanup, connect]);

  const theme = useMemo(() => {
    if (status === 'error') return { rgb: '239,68,68', hex: '#ef4444', label: 'CRITICAL' };
    if (status === 'connecting' || status === 'reconnecting') return { rgb: '251,191,36', hex: '#fbbf24', label: 'SYNCING' };
    if (status === 'connected') {
      if (isSpeaking) return { rgb: '56,189,248', hex: '#38bdf8', label: 'SPEAKING' };
      return { rgb: '52,211,153', hex: '#34d399', label: 'LISTENING' };
    }
    return { rgb: '139,92,246', hex: '#8b5cf6', label: 'STANDBY' };
  }, [status, isSpeaking]);

  const isActive = status === 'connected';
  const isLoading = status === 'connecting' || status === 'reconnecting';

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden select-none"
      style={{ '--u': '0', '--a': '0', '--c': theme.rgb, '--ch': theme.hex } as React.CSSProperties}
    >
      {/* ═══ BACKGROUND LAYERS ═══ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a0f1e] to-[#030712]" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />

      {/* Ambient orbs */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[140px] pointer-events-none transition-colors duration-1000 animate-[pulse_8s_ease-in-out_infinite]"
        style={{ background: `rgb(${theme.rgb})` }} />
      <div className="absolute bottom-[15%] right-[0%] w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none transition-colors duration-1000 animate-[pulse_12s_ease-in-out_infinite_reverse]"
        style={{ background: `rgb(${theme.rgb})` }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

      <video ref={hiddenVideoRef} className="hidden" muted playsInline autoPlay width={640} height={480} />

      {/* Particle effects */}
      <ParticleField active={isActive} color={theme.rgb} />

      {/* ═══ HEADER ═══ */}
      <header className="relative z-50 shrink-0 px-4 sm:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {/* Back */}
          <button
            onClick={() => { cleanup(true); onBack(); }}
            className="group w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-95 transition-all backdrop-blur-md"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Center branding */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Hexagon size={24} className="text-white/10" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full transition-colors duration-500 animate-pulse" style={{ background: theme.hex, boxShadow: `0 0 12px ${theme.hex}` }} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-white tracking-[0.3em] leading-none uppercase">KRUSHI MITRA</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: theme.hex }} />
                  <span className="text-[9px] font-bold tracking-[0.2em] leading-none transition-colors duration-500" style={{ color: theme.hex }}>
                    {theme.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {isActive && (
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 animate-[fadeIn_0.5s] backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white/60 tabular-nums tracking-wider">{formatTime(elapsed)}</span>
              </div>
            )}
            <button
              onClick={toggleCamera}
              className={clsx(
                'w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 backdrop-blur-md',
                cameraEnabled
                  ? 'bg-white/[0.06] border-white/[0.15] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                  : 'bg-white/[0.02] border-white/[0.05] text-white/30'
              )}
            >
              {cameraEnabled ? <Eye size={18} /> : <VideoOff size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN SCENE ═══ */}
      <div className="flex-1 relative z-10 min-h-0 flex flex-col items-center justify-center px-4">
        
        {/* Camera feed pip */}
        {cameraEnabled && isActive && videoStream && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 w-28 h-40 sm:w-32 sm:h-44 rounded-[2rem] overflow-hidden border border-white/[0.15] shadow-2xl z-20 animate-[slideInRight_0.6s_cubic-bezier(0.23,1,0.32,1)] group">
            <video
              autoPlay playsInline muted
              className="w-full h-full object-cover"
              ref={v => { if (v) v.srcObject = videoStream; }}
            />
            {/* Scanning line effect */}
            <div className="absolute inset-x-0 h-[2px] bg-emerald-400/50 shadow-[0_0_10px_#34d399] animate-[scan_3s_linear_infinite] z-30" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-1">
              <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <span className="text-[8px] font-black text-white/90 tracking-[0.2em]">VISION LIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── CORE AVATAR AREA ─── */}
        <div className="relative flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ 
            width: 'clamp(300px, 80vw, 520px)', 
            height: 'clamp(300px, 80vw, 520px)',
            transform: showTranscripts ? 'scale(0.8) translateY(-40px)' : 'scale(1) translateY(0)'
          }}
        >
          {/* Advanced Glow Layers */}
          <div className="absolute inset-0 rounded-full opacity-[0.03] border border-white/20 animate-[spin_100s_linear_infinite]" />
          <div className="absolute inset-[-20px] rounded-full opacity-[0.02] border border-white/10 animate-[spin_150s_linear_infinite_reverse]" />

          {/* Waveform rings */}
          <WaveformRing analyser={inputAnalyserState} color="255,255,255" radius={120} lineWidth={1} />
          <WaveformRing analyser={outputAnalyserState} color={theme.rgb} radius={160} lineWidth={3} />

          {/* Rotating dashed orbit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full border border-dashed animate-[spin_40s_linear_infinite] transition-all duration-1000"
              style={{
                width: 'clamp(260px, 70vw, 440px)',
                height: 'clamp(260px, 70vw, 440px)',
                borderColor: `rgba(${theme.rgb}, 0.25)`,
              }}
            />
          </div>

          {/* Secondary orbit with glass nodes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full border animate-[spin_80s_linear_infinite_reverse] transition-all duration-1000"
              style={{
                width: 'clamp(320px, 85vw, 540px)',
                height: 'clamp(320px, 85vw, 540px)',
                borderColor: `rgba(${theme.rgb}, 0.1)`,
              }}
            >
              {/* Orbiting nodes */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-2xl">
                <div className="w-1.5 h-1.5 rounded-full transition-colors duration-500" style={{ background: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black border border-white/10 opacity-40" />
            </div>
          </div>

          {/* Center Avatar Core */}
          <div className={clsx(
            "relative z-10 flex items-center justify-center transition-all duration-1000",
            status === 'idle' && 'opacity-30 scale-90 grayscale-[0.5]',
            isLoading && 'animate-pulse',
            isActive && 'opacity-100 scale-100',
            status === 'error' && 'opacity-80'
          )}>
            {/* Multi-layered Glow */}
            <div
              className="absolute rounded-full blur-[100px] transition-all duration-1000 pointer-events-none"
              style={{
                width: '240px', height: '240px',
                background: `radial-gradient(circle, rgba(${theme.rgb}, 0.3) 0%, transparent 70%)`,
              }}
            />

            {/* Main orb structure */}
            <div className="relative">
              {/* Outer energy ring */}
              <div
                className="absolute -inset-10 rounded-full border-[1.5px] transition-all duration-700"
                style={{
                  borderColor: `rgba(${theme.rgb}, 0.35)`,
                  transform: `scale(calc(1 + var(--a) * 0.25))`,
                  boxShadow: `0 0 50px rgba(${theme.rgb}, 0.15), inset 0 0 50px rgba(${theme.rgb}, 0.1) `,
                }}
              />

              {/* Glass sphere with internal depth */}
              <div
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden transition-all duration-500"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(${theme.rgb}, 0.25), rgba(${theme.rgb}, 0.05) 50%, rgba(0,0,0,0.7))`,
                  boxShadow: `0 0 100px rgba(${theme.rgb}, 0.2), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -6px 20px rgba(0,0,0,0.6)`,
                  border: `2.5px solid rgba(${theme.rgb}, 0.4)`,
                  transform: `scale(calc(1 + var(--a) * 0.12 + var(--u) * 0.06))`,
                }}
              >
                {/* Internal holographic grid */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{
                  backgroundImage: `linear-gradient(rgba(${theme.rgb}, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme.rgb}, 0.5) 1px, transparent 1px)`,
                  backgroundSize: '10px 10px'
                }} />

                {/* Inner glow & pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Animated inner rings */}
                  <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/[0.12] animate-[spin_12s_linear_infinite]" />
                  <div className="absolute w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-white/[0.1] animate-[spin_8s_linear_infinite_reverse]" />

                  {/* Core icon */}
                  <div className="relative z-10 transition-all duration-500" style={{
                    transform: `scale(calc(1 + var(--a) * 0.5))`,
                    filter: `drop-shadow(0 0 20px rgba(${theme.rgb}, 0.9))`,
                  }}>
                    {status === 'error' ? (
                      <AlertTriangle size={44} className="text-red-400" strokeWidth={1} />
                    ) : isLoading ? (
                      <Signal size={40} className="text-amber-300 animate-pulse" strokeWidth={1} />
                    ) : isSpeaking ? (
                      <Waves size={42} className="text-sky-300" strokeWidth={1} />
                    ) : (
                      <CircuitBoard size={40} className="text-emerald-300" strokeWidth={1} />
                    )}
                  </div>
                </div>

                {/* Highlight reflection */}
                <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-gradient-to-b from-white/[0.15] to-transparent rounded-full blur-md" />
              </div>

              {/* Pulse waves (when speaking) */}
              {isSpeaking && (
                <>
                  <div className="absolute -inset-6 rounded-full border border-sky-400/40 animate-[ripple_2.5s_ease-out_infinite]" />
                  <div className="absolute -inset-6 rounded-full border border-sky-400/25 animate-[ripple_2.5s_ease-out_infinite_0.8s]" />
                  <div className="absolute -inset-6 rounded-full border border-sky-400/15 animate-[ripple_2.5s_ease-out_infinite_1.6s]" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status label below avatar */}
        <div className={clsx(
          "mt-10 flex flex-col items-center gap-4 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
          showTranscripts ? "opacity-0 -translate-y-10 scale-90" : "opacity-100 translate-y-0 scale-100"
        )}>
          {isActive && (
            <>
              <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-500 shadow-[0_0_12px_currentColor]" style={{ background: theme.hex, color: theme.hex }} />
                <span className="text-[11px] font-black tracking-[0.4em] uppercase transition-colors duration-500" style={{ color: theme.hex }}>
                  {isSpeaking ? 'AI Speaking' : 'Listening'}
                </span>
              </div>
              {/* Mini waveform bars */}
              <div className="flex items-end justify-center gap-[5px] h-8">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[5px] rounded-full transition-all duration-500 animate-[bar_0.8s_ease-in-out_infinite_alternate]"
                    style={{
                      background: theme.hex,
                      animationDelay: `${i * 0.1}s`,
                      height: isActive ? undefined : '4px',
                      opacity: isActive ? 0.8 : 0.2,
                      boxShadow: `0 0 15px rgba(${theme.rgb}, 0.4)`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── OVERLAYS ─── */}

        {/* IDLE */}
        {status === 'idle' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-[fadeIn_0.4s]">
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleToggle}
                className="group relative w-24 h-24 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full border-2 border-violet-400/30 group-hover:border-violet-400/50 transition-all" />
                <div className="absolute -inset-3 rounded-full border border-violet-400/10 animate-[spin_12s_linear_infinite]" style={{borderStyle: 'dashed'}} />
                
                {/* Glass button */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-900/30 border border-violet-400/20 flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.35)] transition-all">
                  <Mic size={32} className="text-violet-300 group-hover:text-violet-200 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all" />
                </div>
              </button>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-white/60 tracking-[0.25em]">TAP TO START</span>
                <span className="text-[9px] text-white/30 tracking-wider">Voice + Vision AI Assistant</span>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-md animate-[fadeIn_0.3s] p-6">
            <div className="flex flex-col items-center gap-5 max-w-xs w-full">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-400" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-red-300 tracking-wider mb-1">CONNECTION FAILED</h3>
                <p className="text-xs text-white/40 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={handleToggle}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-[0.98] transition-all"
              >
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Tool chip */}
        {activeTool && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="bg-[#0c1425]/90 backdrop-blur-2xl border border-white/[0.08] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500"
                style={{ background: `rgba(${theme.rgb}, 0.15)`, border: `1px solid rgba(${theme.rgb}, 0.25)` }}>
                <Cpu size={14} className="animate-pulse" style={{ color: theme.hex }} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] text-white/30 font-bold tracking-[0.15em] uppercase">Processing</p>
                <p className="text-xs font-semibold text-white/80 truncate">{activeTool.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM PANEL ═══ */}
      <div className={clsx(
        'relative z-40 w-full shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        showTranscripts ? 'h-[48vh] sm:h-[44vh]' : 'h-[88px]'
      )}>
        {/* Glass panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#080d1c]/98 to-[#080d1c]/80 backdrop-blur-2xl border-t border-white/[0.06]" />

        {/* Drag handle + toggle */}
        <button
          onClick={() => setShowTranscripts(!showTranscripts)}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-10 h-5 rounded-full bg-[#0c1425] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.08] active:scale-95 transition-all shadow-lg"
        >
          <ChevronUp size={14} className={clsx('text-white/40 transition-transform duration-500', showTranscripts && 'rotate-180')} />
        </button>

        {/* Transcript area */}
        <div className={clsx(
          'relative h-full flex flex-col px-4 sm:px-6 overflow-y-auto hide-scrollbar scroll-smooth transition-all duration-500',
          showTranscripts ? 'opacity-100 pt-6 pb-24' : 'opacity-0 pointer-events-none pt-6 pb-24'
        )}>
          {transcripts.length === 0 && isActive && (
            <div className="m-auto flex flex-col items-center gap-3 opacity-40">
              <Radio size={20} className="animate-pulse" style={{ color: theme.hex }} />
              <p className="text-[10px] font-mono tracking-[0.2em] text-center" style={{ color: theme.hex }}>
                AWAITING INPUT
              </p>
            </div>
          )}

          {transcripts.map((tx) => (
            <div
              key={tx.id}
              className={clsx(
                'max-w-[82%] sm:max-w-[72%] mb-3 animate-[msgIn_0.35s_ease-out_forwards]',
                tx.role === 'user' ? 'self-end' : 'self-start'
              )}
            >
              {tx.role === 'model' && (
                <div className="flex items-center gap-1.5 mb-1 ml-1">
                  <Sparkles size={9} style={{ color: theme.hex }} />
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: `rgba(${theme.rgb}, 0.6)` }}>
                    Krushi Mitra
                  </span>
                </div>
              )}
              <div className={clsx(
                'px-4 py-3 text-[13px] sm:text-sm leading-relaxed font-medium backdrop-blur-md border',
                tx.role === 'user'
                  ? 'bg-white/[0.05] border-white/[0.08] text-white/90 rounded-2xl rounded-br-md'
                  : 'border-white/[0.06] text-white/85 rounded-2xl rounded-bl-md'
              )}
              style={tx.role === 'model' ? {
                background: `rgba(${theme.rgb}, 0.06)`,
                borderColor: `rgba(${theme.rgb}, 0.12)`,
              } : undefined}
              >
                <span>{tx.text}</span>
              </div>
              <span className={clsx(
                'text-[8px] text-white/20 mt-1 block',
                tx.role === 'user' ? 'text-right mr-1' : 'ml-1'
              )}>
                {new Date(tx.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={transcriptEndRef} className="h-1 shrink-0" />
        </div>

        {/* ─── FLOATING CONTROLS ─── */}
        <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-6 md:max-w-lg md:left-1/2 md:-translate-x-1/2 md:w-full z-50">
          <div className="relative flex items-center justify-center gap-4">
            
            {/* Left: End call (only when active) */}
            {(isActive || isLoading) && (
              <button
                onClick={() => cleanup(true)}
                className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-95 transition-all shadow-lg animate-[fadeIn_0.3s]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12h18M12 3v18" transform="rotate(45 12 12)" />
                </svg>
              </button>
            )}

            {/* Center: Main mic button */}
            <div className="relative">
              {isActive && (
                <>
                  <div className="absolute -inset-4 rounded-full animate-[ripple_3s_ease-out_infinite] pointer-events-none"
                    style={{ border: `1.5px solid rgba(${theme.rgb}, 0.15)` }} />
                  <div className="absolute -inset-4 rounded-full animate-[ripple_3s_ease-out_infinite_1s] pointer-events-none"
                    style={{ border: `1px solid rgba(${theme.rgb}, 0.1)` }} />
                </>
              )}
              <button
                onClick={handleToggle}
                className={clsx(
                  'relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-xl',
                  status === 'idle' || status === 'error'
                    ? 'bg-gradient-to-br from-violet-500/25 to-violet-900/40 border-2 border-violet-400/30 text-violet-300 hover:border-violet-400/50'
                    : isLoading
                    ? 'bg-amber-500/15 border-2 border-amber-400/30 text-amber-300'
                    : 'border-2 transition-colors duration-500'
                )}
                style={isActive ? {
                  background: `rgba(${theme.rgb}, 0.12)`,
                  borderColor: `rgba(${theme.rgb}, 0.35)`,
                  color: theme.hex,
                  boxShadow: `0 0 40px rgba(${theme.rgb}, 0.15)`,
                } : undefined}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                {status === 'idle' || status === 'error' ? (
                  <Mic size={26} className="relative z-10" strokeWidth={2} />
                ) : isLoading ? (
                  <RefreshCw size={24} className="relative z-10 animate-spin" strokeWidth={2} />
                ) : (
                  <Activity size={26} className="relative z-10" strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${theme.hex})` }} />
                )}
              </button>
            </div>

            {/* Right: Transcript toggle */}
            <button
              onClick={() => setShowTranscripts(!showTranscripts)}
              className="relative w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] active:scale-95 transition-all shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {transcripts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{Math.min(transcripts.length, 99)}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STYLES ═══ */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) translateX(-50%) scale(0.95); }
          to { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes bar {
          0% { height: 2px; }
          100% { height: 14px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
