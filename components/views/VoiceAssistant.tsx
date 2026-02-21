
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, Mic, MicOff, Activity, Zap, Cpu, Sparkles, ChevronDown, AlertOctagon, RefreshCw, Radio } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunkBase64 } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import clsx from 'clsx';
import { MOCK_MARKET } from '../../data/mock';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string; id: string };

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_RETRIES = 5;
const RECONNECT_BASE_DELAY = 1000;
const uid = () => crypto.randomUUID().slice(0, 8);

const TOOLS = [
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
        if (ch?.length) {
          this.port.postMessage(ch);
        }
        return true;
      }
    }
    registerProcessor('pcm-forwarder', PCMForwarder);
  `;
  workletUrlCache = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return workletUrlCache;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const VoiceAssistant = ({
  lang,
  user,
  onBack,
}: {
  lang: Language;
  user: UserProfile;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  // ─── State ───
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscripts, setShowTranscripts] = useState(true);
  const [activeTool, setActiveTool] = useState<{name: string, result: string} | null>(null);

  // ─── Refs ───
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldStayRef = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const connectRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const setupDone = useRef(false);

  // Audio Refs
  const streamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  // Audio Processing Refs
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextPlayTime = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualizerRafRef = useRef<number>(0);

  // Scroll
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, showTranscripts]);

  // ═══════════════════════════════════════════════════════════════
  // VISUALIZER LOOP
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const inData = new Uint8Array(128);
    const outData = new Uint8Array(128);
    let currentUVol = 0;
    let currentAVol = 0;

    const updateVisuals = () => {
      let targetU = 0;
      let targetA = 0;

      if (inputAnalyserRef.current) {
        inputAnalyserRef.current.getByteFrequencyData(inData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += inData[i];
        targetU = (sum / 32) / 255;
      }

      if (outputAnalyserRef.current) {
        outputAnalyserRef.current.getByteFrequencyData(outData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += outData[i];
        targetA = (sum / 32) / 255;
      }

      // Smooth interpolation
      currentUVol += (targetU - currentUVol) * 0.15;
      currentAVol += (targetA - currentAVol) * 0.25;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--u-vol', currentUVol.toFixed(4));
        containerRef.current.style.setProperty('--a-vol', currentAVol.toFixed(4));
        const glowIntensity = Math.min(1, currentAVol * 1.5 + 0.2);
        containerRef.current.style.setProperty('--ai-glow-opacity', glowIntensity.toFixed(2));
      }

      visualizerRafRef.current = requestAnimationFrame(updateVisuals);
    };

    visualizerRafRef.current = requestAnimationFrame(updateVisuals);
    return () => cancelAnimationFrame(visualizerRafRef.current);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP & RECONNECT
  // ═══════════════════════════════════════════════════════════════

  const cleanup = useCallback((fullyStop = false) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);

    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch { /* ignore */ }
      sessionRef.current = null;
    }

    setupDone.current = false;

    [workletRef, muteGainRef, compressorRef].forEach(ref => {
      if (ref.current) {
        try { (ref.current as AudioNode).disconnect(); } catch { /* ignore */ }
        (ref as any).current = null;
      }
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    [inputCtxRef, outputCtxRef].forEach(ref => {
      if (ref.current) {
        ref.current.close().catch(() => {});
        (ref as any).current = null;
      }
    });

    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;

    if (fullyStop) {
      shouldStayRef.current = false;
      setStatus('idle');
      setIsSpeaking(false);
      setActiveTool(null);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--u-vol', '0');
        containerRef.current.style.setProperty('--a-vol', '0');
        containerRef.current.style.setProperty('--ai-glow-opacity', '0.2');
      }
    }
  }, []);

  useEffect(() => () => cleanup(true), [cleanup]);

  const handleReconnect = useCallback(() => {
    if (!shouldStayRef.current) return;
    if (retryCount.current >= MAX_RETRIES) {
      setStatus('error');
      setErrorMessage(lang === 'mr' ? 'कनेक्शन तुटले. पुन्हा प्रयत्न करा.' : 'Connection lost. Network Error.');
      shouldStayRef.current = false;
      return;
    }
    setStatus('reconnecting');
    const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, retryCount.current), 10000);
    reconnectTimer.current = setTimeout(() => {
      retryCount.current++;
      connectRef.current?.(true);
    }, delay);
  }, [lang]);

  // ═══════════════════════════════════════════════════════════════
  // TOOL CALLS
  // ═══════════════════════════════════════════════════════════════

  const handleToolCall = async (functionCalls: any[]) => {
    if (!functionCalls?.length) return [];
    const responses = [];
    
    for (const call of functionCalls) {
      let result = {};
      let displayText = "";

      if (call.name === "get_weather_forecast") {
        result = { condition: "Partly Cloudy", temp: "28°C", forecast: "Chance of light rain." };
        displayText = "🌤️ Fetching Weather Data...";
      } 
      else if (call.name === "get_mandi_price") {
        const crop = call.args.crop;
        const m = MOCK_MARKET.find(x => x.name.toLowerCase().includes(crop.toLowerCase()));
        result = m ? { price: m.price, trend: m.trend } : { price: "4500", trend: "Stable" }; 
        displayText = `💰 Analyzing ${crop} Market...`;
      }

      setActiveTool({ name: displayText, result: JSON.stringify(result) });
      setTimeout(() => setActiveTool(null), 3500);

      responses.push({ id: call.id, name: call.name, response: { result } });
    }
    return responses;
  };

  // ═══════════════════════════════════════════════════════════════
  // CONNECT LOGIC
  // ═══════════════════════════════════════════════════════════════

  const connect = useCallback(async (isRetry?: boolean) => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    cleanup(false);
    shouldStayRef.current = true;
    setErrorMessage('');
    setStatus(retryCount.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const ACClass = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new ACClass({ sampleRate: 16000 });
      await inCtx.resume();
      inputCtxRef.current = inCtx;

      const outCtx = new ACClass({ sampleRate: 24000 });
      await outCtx.resume();
      outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;

      const inAnalyser = inCtx.createAnalyser();
      inAnalyser.fftSize = 256;
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;

      const outAnalyser = outCtx.createAnalyser();
      outAnalyser.fftSize = 256;
      outAnalyser.smoothingTimeConstant = 0.8;
      outputAnalyserRef.current = outAnalyser;

      const comp = outCtx.createDynamicsCompressor();
      comp.connect(outAnalyser);
      outAnalyser.connect(outCtx.destination);
      compressorRef.current = comp;

      await inCtx.audioWorklet.addModule(getWorkletUrl());
      const worklet = new AudioWorkletNode(inCtx, 'pcm-forwarder');
      workletRef.current = worklet;

      const mute = inCtx.createGain();
      mute.gain.value = 0;
      muteGainRef.current = mute;

      // ── Mute/Silent Fallback if Mic is denied ──
      let source: AudioNode;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        if (!shouldStayRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        source = inCtx.createMediaStreamSource(stream);
      } catch (err) {
        console.warn("Microphone permission denied or unavailable. Using silent fallback.");
        const osc = inCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 0; // Pure silence
        osc.start();
        source = osc;
      }

      source.connect(inAnalyser);
      source.connect(worklet);
      worklet.connect(mute).connect(inCtx.destination);

      const apiKey = getGenAIKey();
      if (!apiKey) throw new Error("API Key missing or Invalid");
      
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
      You are KRUSHI MITRA AI, a highly advanced agricultural robotic assistant.
      ROLE: Friendly, expert agronomist speaking ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.
      STYLE: Concise, natural spoken voice. Act like a knowledgeable field companion.
      `;

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
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
            setupDone.current = true;
            retryCount.current = 0;
            setStatus('connected');
            triggerHaptic('heavy');
            
            // Send initial greeting if fallback is used to trigger AI speech
            if (!streamRef.current) {
                // Trigger AI to speak without user audio input
                sessionRef.current?.sendToolResponse({
                    functionResponses: []
                });
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
                const responses = await handleToolCall(message.toolCall.functionCalls);
                if (responses.length > 0 && sessionRef.current) {
                    sessionRef.current.sendToolResponse({ functionResponses: responses });
                }
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtxRef.current && compressorRef.current) {
              const ctx = outputCtxRef.current;
              const buffer = await decodeAudioData(decode(audioData as string), ctx, 24000, 1);
              const src = ctx.createBufferSource();
              src.buffer = buffer;
              src.connect(compressorRef.current);

              const now = ctx.currentTime;
              if (nextPlayTime.current < now) nextPlayTime.current = now;
              src.start(nextPlayTime.current);
              nextPlayTime.current += buffer.duration;

              setIsSpeaking(true);
              if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
              src.onended = () => {
                speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 200);
              };
            }

            const userText = message.serverContent?.inputTranscription?.text;
            if (userText?.trim()) setTranscripts(p => [...p, { role: 'user', text: userText.trim(), id: uid() }]);

            const modelText = message.serverContent?.outputTranscription?.text;
            if (modelText?.trim()) setTranscripts(p => [...p, { role: 'model', text: modelText.trim(), id: uid() }]);
          },
          onclose: () => {
            setupDone.current = false;
            if (shouldStayRef.current) handleReconnect();
            else setStatus('idle');
          },
          onerror: (e: any) => {
            console.error('Session Error:', e);
            setStatus('error');
            setErrorMessage('Network Interrupted. Connection Lost.');
          },
        },
      });

      sessionRef.current = session;

      worklet.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !setupDone.current || !sessionRef.current) return;
        try {
          const b64 = createPCMChunkBase64(chunk, inputCtxRef.current?.sampleRate || 16000);
          session.sendRealtimeInput({
            media: { mimeType: 'audio/pcm;rate=16000', data: b64 },
          });
        } catch (e) { console.error(e); }
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Connection Failed. System Reboot Required.');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, lang]);

  useEffect(() => { connectRef.current = connect; }, [connect]);

  const handleToggle = useCallback(() => {
    triggerHaptic('medium');
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect(false);
    } else {
      cleanup(true);
    }
  }, [status, connect, cleanup]);

  // Determine active theme colors based on state
  const aiTheme = useMemo(() => {
    if (status === 'error') return { color: '239,68,68', name: 'error', hex: '#ef4444' };
    if (status === 'connecting' || status === 'reconnecting') return { color: '245,158,11', name: 'processing', hex: '#f59e0b' };
    if (status === 'connected') {
      if (isSpeaking) return { color: '6,182,212', name: 'speaking', hex: '#06b6d4' }; 
      return { color: '16,185,129', name: 'listening', hex: '#10b981' }; 
    }
    return { color: '99,102,241', name: 'idle', hex: '#6366f1' }; 
  }, [status, isSpeaking]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden bg-[#020617] font-sans selection:bg-cyan-500/30"
      style={{ 
          '--u-vol': 0, 
          '--a-vol': 0, 
          '--ai-glow-opacity': 0.2,
          '--theme-color': aiTheme.color,
          '--theme-hex': aiTheme.hex
      } as React.CSSProperties}
    >
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a1128] via-[#020617] to-black pointer-events-none" />
      
      {/* Reactive Core Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] pointer-events-none mix-blend-screen transition-colors duration-700"
        style={{ 
            background: `radial-gradient(circle, rgba(var(--theme-color), var(--ai-glow-opacity)), transparent 70%)`,
            transform: 'scale(calc(1 + var(--a-vol) * 0.5 + var(--u-vol) * 0.2))'
        }} 
      />

      {/* Cyber Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"
           style={{ transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)', transformOrigin: 'top' }} />

      {/* ─── HEADER (Top Layer, Always Accessible) ─── */}
      <header className="absolute top-0 inset-x-0 z-[1000] flex items-center justify-between px-6 pt-safe-top mt-4 pb-2 pointer-events-none">
        <button
          onClick={() => { cleanup(true); onBack(); }}
          className="pointer-events-auto w-12 h-12 rounded-2xl bg-[#0a1128]/80 border border-white/10 flex items-center justify-center text-white backdrop-blur-2xl hover:bg-white/10 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Status Badge */}
          <div className="px-4 py-2 rounded-2xl bg-[#0a1128]/80 backdrop-blur-2xl border border-white/10 flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors duration-500"
               style={{ borderColor: `rgba(var(--theme-color), 0.3)` }}>
            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse"
                 style={{ backgroundColor: `rgb(var(--theme-color))`, color: `rgb(var(--theme-color))` }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90" style={{ textShadow: `0 0 10px rgba(var(--theme-color), 0.5)` }}>
              {status === 'error' ? 'SYS FAIL' : status === 'connected' ? 'LIVE SYNC' : status === 'connecting' ? 'BOOTING' : status}
            </span>
          </div>
        </div>
      </header>

      {/* ─── HOLOGRAPHIC AVATAR SCENE (ABSOLUTELY CENTERED) ─── */}
      <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-10 pt-10">
        
        {/* ─── THE EAGLE AVATAR (Ultra Premium SVG) ─── */}
        <div className={clsx(
            "relative flex items-center justify-center transition-all duration-700",
            aiTheme.name === 'error' ? "animate-[glitch_0.2s_ease-in-out_infinite]" : "animate-[float_6s_ease-in-out_infinite]"
        )}>
            
            {/* Holographic Platform / Data Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                {/* User Voice Ring */}
                <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-white/20 transition-transform duration-100 ease-out"
                     style={{ transform: 'rotateX(70deg) scale(calc(1 + var(--u-vol) * 0.8))', boxShadow: '0 0 20px rgba(255,255,255,0.1) inset' }}></div>
                
                {/* AI Voice Ring */}
                <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border-[3px] border-dashed transition-all duration-75 ease-out animate-[spin_20s_linear_infinite]"
                     style={{ borderColor: 'var(--theme-hex)', opacity: 0.4, transform: 'rotateX(70deg) scale(calc(1 + var(--a-vol) * 0.6))', filter: 'drop-shadow(0 0 10px var(--theme-hex))' }}></div>
                
                {/* Base Projector Glow */}
                <div className="absolute top-[80px] md:top-[120px] w-[150px] h-[40px] rounded-[100%] blur-xl transition-colors duration-700"
                     style={{ background: 'var(--theme-hex)', opacity: 0.5 }}></div>
            </div>

            {/* Premium Eagle SVG */}
            <div className={clsx(
                "relative z-10 w-64 h-64 md:w-80 md:h-80 transition-all duration-700",
                status === 'idle' ? "opacity-60 saturate-0" : "opacity-100 saturate-100"
            )}>
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                  <defs>
                    <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="70%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </radialGradient>
                    <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--theme-hex)" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="var(--theme-hex)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="dropShadow">
                      <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="var(--theme-hex)" floodOpacity="0.3"/>
                    </filter>
                  </defs>

                  {/* Wings (Reactive to User Volume & Status) */}
                  <g style={{ 
                      transformOrigin: '200px 200px', 
                      transform: status === 'idle' ? 'scaleX(0.8) translateY(10px)' : 'scaleX(calc(1 + var(--u-vol)*0.15)) translateY(calc(var(--u-vol)*-15px))', 
                      transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}>
                      {/* Left Wing */}
                      <path d="M120 180 C50 130, 10 90, 30 70 C60 40, 110 70, 140 130 Z" fill="url(#armorGrad)" filter="url(#dropShadow)" stroke="var(--theme-hex)" strokeWidth="2"/>
                      <path d="M110 160 C60 120, 30 90, 45 75 C70 50, 105 80, 130 130" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
                      
                      {/* Right Wing */}
                      <path d="M280 180 C350 130, 390 90, 370 70 C340 40, 290 70, 260 130 Z" fill="url(#armorGrad)" filter="url(#dropShadow)" stroke="var(--theme-hex)" strokeWidth="2"/>
                      <path d="M290 160 C340 120, 370 90, 355 75 C330 50, 295 80, 270 130" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
                  </g>

                  {/* Main Body */}
                  <path d="M160 120 Q200 80 240 120 L260 220 Q200 280 140 220 Z" fill="url(#bodyGrad)" stroke="var(--theme-hex)" strokeWidth="1.5" filter="url(#dropShadow)"/>
                  
                  {/* Cybernetic Panel Lines */}
                  <path d="M180 140 L200 160 L220 140 M170 180 L200 210 L230 180" fill="none" stroke="var(--theme-hex)" strokeWidth="1" strokeOpacity="0.6"/>

                  {/* Chest Reactor Core (Reactive to AI Volume) */}
                  <g style={{ 
                      transformOrigin: '200px 180px', 
                      transform: 'scale(calc(1 + var(--a-vol)*0.6 + var(--u-vol)*0.2))', 
                      transition: 'transform 0.05s' 
                  }}>
                      <circle cx="200" cy="180" r="24" fill="#020617" stroke="var(--theme-hex)" strokeWidth="3"/>
                      <circle cx="200" cy="180" r="14" fill="var(--theme-hex)" filter="url(#neonGlow)"/>
                      <circle cx="200" cy="180" r="6" fill="#ffffff" filter="url(#neonGlow)"/>
                      
                      {/* Spinning Reactor Elements */}
                      <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '200px 180px' }}>
                          <path d="M200 150 L205 160 L195 160 Z" fill="var(--theme-hex)"/>
                          <path d="M200 210 L205 200 L195 200 Z" fill="var(--theme-hex)"/>
                          <path d="M170 180 L180 175 L180 185 Z" fill="var(--theme-hex)"/>
                          <path d="M230 180 L220 175 L220 185 Z" fill="var(--theme-hex)"/>
                      </g>
                  </g>

                  {/* Head & Neck (Reactive Tilt) */}
                  <g style={{ 
                      transformOrigin: '200px 150px', 
                      transform: 'rotate(calc(var(--u-vol) * 12deg))', 
                      transition: 'transform 0.1s ease-out' 
                  }}>
                      <path d="M175 110 Q200 60 225 110 L200 140 Z" fill="url(#armorGrad)" stroke="var(--theme-hex)" strokeWidth="2"/>
                      
                      {/* Eyes */}
                      <path d="M185 95 L195 100 L188 105 Z" fill="#ffffff" filter="url(#neonGlow)"/>
                      <path d="M215 95 L205 100 L212 105 Z" fill="#ffffff" filter="url(#neonGlow)"/>
                      
                      {/* Beak (Reactive to AI Voice) */}
                      <g style={{ 
                          transformOrigin: '200px 105px', 
                          transform: 'scaleY(calc(1 + var(--a-vol)*1.2))', 
                          transition: 'transform 0.05s' 
                      }}>
                          <path d="M195 105 L200 125 L205 105 Z" fill="var(--theme-hex)" filter="url(#neonGlow)"/>
                      </g>
                  </g>

                  {/* Tech Base/Tail */}
                  <path d="M180 230 L200 280 L220 230 Z" fill="url(#armorGrad)" stroke="var(--theme-hex)" strokeWidth="1.5"/>
              </svg>
            </div>
        </div>

        {/* Start Button Overlay */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out] pointer-events-auto">
            <button
              onClick={handleToggle}
              className="relative group flex flex-col items-center justify-center w-40 h-40 rounded-full border border-indigo-400/50 bg-indigo-950/40 backdrop-blur-2xl shadow-[0_0_60px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent"></div>
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-400/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
              <Mic size={48} className="text-indigo-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] mb-2 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black tracking-[0.3em] text-indigo-200 relative z-10">INITIALIZE</span>
            </button>
          </div>
        )}

        {/* Error / Reboot Overlay */}
        {status === 'error' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-[900] bg-red-950/90 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] pointer-events-auto">
              <AlertOctagon size={64} className="text-red-500 mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" strokeWidth={1.5} />
              <div className="bg-black/50 border border-red-500/50 px-8 py-6 rounded-3xl text-center max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  <h3 className="text-xl font-black text-red-400 tracking-widest mb-2 font-mono">SYSTEM ERROR</h3>
                  <p className="text-red-200/80 text-sm mb-8 font-mono">{errorMessage}</p>
                  <button 
                      onClick={handleToggle}
                      className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500 text-red-400 font-bold tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                      <RefreshCw size={18} /> REBOOT SYSTEM
                  </button>
              </div>
           </div>
        )}

        {/* Active Tool Chip */}
        {activeTool && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                <div className="bg-[#0a1128]/90 backdrop-blur-2xl border border-[rgba(var(--theme-color),0.5)] pl-2 pr-6 py-2 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(var(--theme-color),0.3)] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(var(--theme-color),0.2)] flex items-center justify-center border border-[rgba(var(--theme-color),0.4)]">
                        <Cpu size={18} className="text-[rgb(var(--theme-color))] animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">PROCESSING QUERY</span>
                        <span className="text-white text-sm font-black tracking-wide">{activeTool.name}</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* ─── TRANSCRIPT & CONTROLS HUD ─── */}
      <div className={clsx(
          "absolute bottom-0 inset-x-0 z-40 w-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none",
          showTranscripts ? "h-[45vh]" : "h-[14vh]"
      )}>
          {/* Advanced Glass Base */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#060b1e]/95 to-transparent backdrop-blur-[20px] border-t border-white/10"
               style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}></div>

          {/* Transcripts Area */}
          <div className={clsx(
              "relative h-full flex flex-col pt-6 pb-36 px-4 md:px-8 overflow-y-auto hide-scrollbar scroll-smooth transition-opacity duration-500 pointer-events-auto",
              showTranscripts ? "opacity-100" : "opacity-0"
          )}>
            {transcripts.length === 0 && status === 'connected' && (
              <div className="m-auto flex flex-col items-center opacity-50 pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-[rgba(var(--theme-color),0.4)] bg-[rgba(var(--theme-color),0.1)] flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--theme-color))] border-t-transparent animate-spin"></div>
                    <Radio size={24} className="text-[rgb(var(--theme-color))] animate-pulse" />
                </div>
                <p className="text-xs font-mono font-bold tracking-[0.25em] text-[rgb(var(--theme-color))] text-center leading-relaxed">
                  AWAITING VOICE INPUT
                </p>
              </div>
            )}

            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className={clsx(
                  'max-w-[88%] md:max-w-[75%] p-4 rounded-[1.5rem] text-[15px] font-medium mb-4 shadow-xl backdrop-blur-md border animate-[slideUpFade_0.4s_ease-out_forwards]',
                  transcript.role === 'user'
                    ? 'self-end bg-white/5 border-white/10 text-white rounded-br-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                    : 'self-start bg-[rgba(var(--theme-color),0.1)] border-[rgba(var(--theme-color),0.3)] text-[rgb(var(--theme-color))] rounded-bl-sm shadow-[0_10px_30px_rgba(var(--theme-color),0.1)] filter brightness-125'
                )}
              >
                {transcript.role === 'model' && (
                    <div className="flex items-center gap-2 mb-2 opacity-70">
                        <Sparkles size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Krushi Mitra AI</span>
                    </div>
                )}
                <span className="leading-relaxed">{transcript.text}</span>
              </div>
            ))}
            <div ref={transcriptEndRef} className="h-4 shrink-0" />
          </div>

          {/* Floating Controls Bar */}
          <div className="absolute bottom-8 inset-x-6 md:max-w-2xl md:mx-auto flex items-center justify-between z-50 pointer-events-auto">
             
             {/* Left: Transcript Toggle */}
             <button
                onClick={() => setShowTranscripts(!showTranscripts)}
                className="w-14 h-14 rounded-2xl bg-[#0a1128]/80 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-2xl transition-all active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <ChevronDown size={24} className={clsx("transition-transform duration-500", !showTranscripts && "rotate-180")} />
             </button>

             {/* Center: Main Action Mic */}
             {status !== 'idle' && status !== 'error' && (
                 <div className="relative group/mic">
                     {/* Outer Pulsing Rings */}
                     {status === 'connected' && (
                         <>
                            <div className="absolute inset-[-20px] rounded-full border border-[rgb(var(--theme-color))] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30 pointer-events-none"></div>
                            <div className="absolute inset-[-10px] rounded-full border-[2px] border-[rgb(var(--theme-color))] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] opacity-20 pointer-events-none"></div>
                         </>
                     )}
                     
                     <button
                        onClick={handleToggle}
                        className={clsx(
                            "relative w-20 h-20 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl border-2 transition-all duration-300 active:scale-90 shadow-[0_15px_50px_rgba(0,0,0,0.6)] group-hover/mic:shadow-[0_20px_60px_rgba(var(--theme-color),0.4)]",
                            status === 'connected' 
                                ? "bg-[rgba(var(--theme-color),0.15)] border-[rgba(var(--theme-color),0.5)] text-[rgb(var(--theme-color))]" 
                                : "bg-amber-500/20 border-amber-500/50 text-amber-400"
                        )}
                      >
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                        {status === 'connected' ? (
                            <Activity size={32} className="relative z-10 drop-shadow-[0_0_10px_currentColor]" strokeWidth={2.5}/>
                        ) : (
                            <RefreshCw size={32} className="relative z-10 animate-spin" strokeWidth={2.5}/>
                        )}
                      </button>
                 </div>
             )}

             {/* Right: Audio Visualizer */}
             <div className="w-14 h-14 rounded-2xl bg-[#0a1128]/80 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden px-3">
                 {isSpeaking ? (
                     <div className="flex items-end justify-center gap-[3px] h-6 w-full">
                         {[1,2,3,4,5].map(i => (
                             <div 
                                key={i} 
                                className="w-1.5 bg-[rgb(var(--theme-color))] rounded-t-sm animate-[waveform_0.4s_ease-in-out_infinite_alternate] shadow-[0_0_8px_currentColor]" 
                                style={{ animationDelay: `${i*0.1}s`, height: '2px' }}
                             ></div>
                         ))}
                     </div>
                 ) : (
                     <div className="w-8 h-[2px] bg-white/20 rounded-full"></div>
                 )}
             </div>
          </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(8px); }
            to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-40px) translateX(-50%) scale(0.9); }
            to { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
        }
        @keyframes fadeIn {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes waveform {
            0% { height: 2px; opacity: 0.5; }
            100% { height: 24px; opacity: 1; }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-4px, 2px); filter: hue-rotate(90deg) drop-shadow(0 0 20px red); }
            40% { transform: translate(4px, -2px); }
            60% { transform: translate(-2px, -4px); filter: hue-rotate(-90deg) drop-shadow(0 0 20px red); }
            80% { transform: translate(2px, 4px); }
            100% { transform: translate(0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
