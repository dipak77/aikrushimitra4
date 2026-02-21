import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, Scan, Shield, Activity, Zap, Cpu,
  Sparkles, ChevronDown, AlertOctagon, RefreshCw, Radio
} from 'lucide-react';
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
          properties: {
            location: { type: Type.STRING, description: "Village or city name" }
          },
          required: ["location"]
        }
      },
      {
        name: "get_mandi_price",
        description: "Get live market prices (bajar bhav) for crops.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: "Crop name (e.g. Soyabean, Cotton)" }
          },
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
  workletUrlCache = URL.createObjectURL(
    new Blob([code], { type: 'application/javascript' })
  );
  return workletUrlCache;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Video Frame Capture
// ═══════════════════════════════════════════════════════════════

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
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showTranscripts, setShowTranscripts] = useState(true);
  const [activeTool, setActiveTool] = useState<{
    name: string;
    result: string;
  } | null>(null);

  // ─── Refs ───
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldStayRef = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const connectRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const setupDone = useRef(false);

  // Audio/Video Refs
  const streamRef = useRef<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        targetU = sum / 32 / 255;
      }

      if (outputAnalyserRef.current) {
        outputAnalyserRef.current.getByteFrequencyData(outData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += outData[i];
        targetA = sum / 32 / 255;
      }

      currentUVol += (targetU - currentUVol) * 0.15;
      currentAVol += (targetA - currentAVol) * 0.25;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--u-vol', currentUVol.toFixed(4));
        containerRef.current.style.setProperty('--a-vol', currentAVol.toFixed(4));
        const glowIntensity = Math.min(1, currentAVol * 1.5 + 0.2);
        containerRef.current.style.setProperty(
          '--ai-glow-opacity',
          glowIntensity.toFixed(2)
        );
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
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {
        /* ignore */
      }
      sessionRef.current = null;
    }

    setupDone.current = false;

    [workletRef, muteGainRef, compressorRef].forEach((ref) => {
      if (ref.current) {
        try {
          (ref.current as AudioNode).disconnect();
        } catch {
          /* ignore */
        }
        (ref as any).current = null;
      }
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setVideoStream(null);
    }

    [inputCtxRef, outputCtxRef].forEach((ref) => {
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
      setErrorMessage(
        lang === 'mr'
          ? 'कनेक्शन तुटले. पुन्हा प्रयत्न करा.'
          : 'Connection lost. Permission Denied or Network Error.'
      );
      shouldStayRef.current = false;
      return;
    }
    setStatus('reconnecting');
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, retryCount.current),
      10000
    );
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
      let displayText = '';

      if (call.name === 'get_weather_forecast') {
        result = {
          condition: 'Partly Cloudy',
          temp: '28°C',
          forecast: 'Chance of light rain.',
        };
        displayText = '🌤️ Fetching Weather Data...';
      } else if (call.name === 'get_mandi_price') {
        const crop = call.args.crop;
        const m = MOCK_MARKET.find((x) =>
          x.name.toLowerCase().includes(crop.toLowerCase())
        );
        result = m
          ? { price: m.price, trend: m.trend }
          : { price: '4500', trend: 'Stable' };
        displayText = `💰 Analyzing ${crop} Market...`;
      }

      setActiveTool({ name: displayText, result: JSON.stringify(result) });
      setTimeout(() => setActiveTool(null), 3500);

      responses.push({
        id: call.id,
        name: call.name,
        response: { result },
      });
    }
    return responses;
  };

  // ═══════════════════════════════════════════════════════════════
  // CONNECT LOGIC
  // ═══════════════════════════════════════════════════════════════

  const connect = useCallback(
    async (isRetry?: boolean) => {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      cleanup(false);
      shouldStayRef.current = true;
      setErrorMessage('');
      setStatus(retryCount.current > 0 ? 'reconnecting' : 'connecting');

      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: cameraEnabled
            ? { width: 640, height: 480, facingMode: 'environment' }
            : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!shouldStayRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (cameraEnabled) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            const videoStreamOnly = new MediaStream([videoTrack]);
            setVideoStream(videoStreamOnly);
            if (hiddenVideoRef.current) {
              hiddenVideoRef.current.srcObject = videoStreamOnly;
              hiddenVideoRef.current.play().catch(() => {});
            }
          }
        }

        const ACClass =
          window.AudioContext || (window as any).webkitAudioContext;
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

        const source = inCtx.createMediaStreamSource(stream);
        await inCtx.audioWorklet.addModule(getWorkletUrl());
        const worklet = new AudioWorkletNode(inCtx, 'pcm-forwarder');
        workletRef.current = worklet;

        const mute = inCtx.createGain();
        mute.gain.value = 0;
        muteGainRef.current = mute;

        source.connect(inAnalyser);
        source.connect(worklet);
        worklet.connect(mute).connect(inCtx.destination);

        // --- WEBSOCKET CONNECTION ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/live`;
        const ws = new WebSocket(wsUrl);
        sessionRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WS Connected');
          // Send Setup Message
          const systemPrompt = `
          You are KRUSHI MITRA AI, a highly advanced agricultural robotic assistant.
          ROLE: Friendly, expert agronomist speaking ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.
          STYLE: Concise, natural spoken voice. Act like a knowledgeable field companion.
          `;
          
          ws.send(JSON.stringify({
            type: 'setup',
            config: {
              voiceName: 'Puck',
              systemInstruction: systemPrompt,
              enableInputTranscription: true,
              enableOutputTranscription: true
            }
          }));
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'setup_complete') {
              setupDone.current = true;
              retryCount.current = 0;
              setStatus('connected');
              triggerHaptic('heavy');

              // Start Video Loop
              if (cameraEnabled && hiddenVideoRef.current) {
                if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
                videoIntervalRef.current = setInterval(async () => {
                  if (!setupDone.current || !sessionRef.current || !hiddenVideoRef.current) return;
                  const base64Data = await captureFrame(hiddenVideoRef.current);
                  if (base64Data) {
                    ws.send(JSON.stringify({
                      realtimeInput: {
                        media: { mimeType: 'image/jpeg', data: base64Data }
                      }
                    }));
                  }
                }, 2000);
              }
              return;
            }

            if (message.type === 'error') {
              console.error('WS Error:', message);
              setStatus('error');
              setErrorMessage(message.message || 'Server Error');
              return;
            }

            // Handle Gemini Messages (forwarded from server)
            const geminiMsg = message as LiveServerMessage;

            if (geminiMsg.toolCall) {
              const responses = await handleToolCall(geminiMsg.toolCall.functionCalls);
              if (responses.length > 0) {
                 ws.send(JSON.stringify({
                   toolResponse: { functionResponses: responses }
                 }));
              }
            }

            const audioData = geminiMsg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtxRef.current && compressorRef.current) {
              const ctx = outputCtxRef.current;
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
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

            const userText = geminiMsg.serverContent?.inputTranscription?.text;
            if (userText?.trim()) {
              setTranscripts((p) => [...p, { role: 'user', text: userText.trim(), id: uid() }]);
            }

            const modelText = geminiMsg.serverContent?.outputTranscription?.text;
            if (modelText?.trim()) {
              setTranscripts((p) => [...p, { role: 'model', text: modelText.trim(), id: uid() }]);
            }

          } catch (e) {
            console.error('WS Message Parse Error:', e);
          }
        };

        ws.onclose = (event) => {
          console.log('WS Closed:', event.code, event.reason);
          setupDone.current = false;
          if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
          if (shouldStayRef.current) handleReconnect();
          else setStatus('idle');
        };

        ws.onerror = (error) => {
          console.error('WS Error:', error);
          setStatus('error');
          setErrorMessage('Connection Error');
        };

        worklet.port.onmessage = (evt: MessageEvent) => {
          const chunk = evt.data as Float32Array;
          if (!chunk || !setupDone.current || !sessionRef.current) return;
          try {
             // Send raw PCM via WebSocket
             const b64 = createPCMChunkBase64(chunk, inputCtxRef.current?.sampleRate || 16000);
             ws.send(JSON.stringify({
               realtimeInput: {
                 media: { mimeType: 'audio/pcm;rate=16000', data: b64 }
               }
             }));
          } catch (e) {
            console.error(e);
          }
        };

      } catch (e: any) {
        setErrorMessage(
          e?.message || 'Permission Denied. System Reboot Required.'
        );
        setStatus('error');
      }
    },
    [cleanup, handleReconnect, lang, cameraEnabled]
  );

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const handleToggle = useCallback(() => {
    triggerHaptic('medium');
    if (
      status === 'idle' ||
      status === 'error' ||
      status === 'offline'
    ) {
      if (status !== 'error') setTranscripts([]);
      connect(false);
    } else {
      cleanup(true);
    }
  }, [status, connect, cleanup]);

  const toggleCamera = useCallback(() => {
    setCameraEnabled((prev) => {
      const next = !prev;
      if (status === 'connected' || status === 'connecting') {
        cleanup(false);
        setTimeout(() => connect(false), 200);
      }
      return next;
    });
  }, [status, cleanup, connect]);

  // Theme colors based on state
  const aiTheme = useMemo(() => {
    if (status === 'error')
      return { color: '239,68,68', name: 'error', hex: '#ef4444' };
    if (status === 'connecting' || status === 'reconnecting')
      return { color: '245,158,11', name: 'processing', hex: '#f59e0b' };
    if (status === 'connected') {
      if (isSpeaking)
        return { color: '6,182,212', name: 'speaking', hex: '#06b6d4' };
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
      style={
        {
          '--u-vol': 0,
          '--a-vol': 0,
          '--ai-glow-opacity': 0.2,
          '--theme-color': aiTheme.color,
          '--theme-hex': aiTheme.hex,
        } as React.CSSProperties
      }
    >
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a1128] via-[#020617] to-black pointer-events-none" />

      {/* Reactive Core Glow — centered in avatar zone, not the whole page */}
      <div
        className="absolute pointer-events-none mix-blend-screen transition-colors duration-700"
        style={{
          top: '28%',
          left: '50%',
          width: 'min(70vw, 500px)',
          height: 'min(70vw, 500px)',
          transform:
            'translate(-50%, -50%) scale(calc(1 + var(--a-vol) * 0.5 + var(--u-vol) * 0.2))',
          background: `radial-gradient(circle, rgba(var(--theme-color), var(--ai-glow-opacity)), transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"
        style={{
          transform:
            'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
          transformOrigin: 'top',
        }}
      />

      <video
        ref={hiddenVideoRef}
        className="hidden"
        muted
        playsInline
        autoPlay
        width={640}
        height={480}
      />

      {/* ─── HEADER ─── */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 shrink-0">
        <button
          onClick={() => {
            cleanup(true);
            onBack();
          }}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-2xl hover:bg-white/10 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        </button>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className="px-3 py-1.5 rounded-xl bg-[#0a1128]/80 backdrop-blur-2xl border border-white/10 flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors duration-500"
            style={{
              borderColor: `rgba(var(--theme-color), 0.3)`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
              style={{
                backgroundColor: `rgb(var(--theme-color))`,
                color: `rgb(var(--theme-color))`,
              }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.15em] text-white/90"
              style={{
                textShadow: `0 0 8px rgba(var(--theme-color), 0.5)`,
              }}
            >
              {status === 'error'
                ? 'SYS FAIL'
                : status === 'connected'
                ? 'LIVE SYNC'
                : status === 'connecting'
                ? 'BOOTING'
                : status === 'reconnecting'
                ? 'RETRY'
                : status === 'offline'
                ? 'OFFLINE'
                : 'STANDBY'}
            </span>
          </div>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={clsx(
              'w-11 h-11 rounded-2xl border flex items-center justify-center backdrop-blur-2xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
              cameraEnabled
                ? 'bg-[rgba(var(--theme-color),0.15)] border-[rgba(var(--theme-color),0.4)] text-[rgb(var(--theme-color))]'
                : 'bg-white/5 border-white/10 text-white/40'
            )}
          >
            {cameraEnabled ? <Scan size={18} /> : <VideoOff size={18} />}
          </button>
        </div>
      </header>

      {/* ─── AVATAR SCENE (true center of remaining space) ─── */}
      <div className="flex-1 relative z-10 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
        {/* Camera Feed Background — contained inside avatar area */}
        {cameraEnabled && status === 'connected' && videoStream && (
          <div className="absolute inset-4 sm:inset-8 md:inset-12 rounded-3xl overflow-hidden border border-[rgba(var(--theme-color),0.2)] opacity-30 pointer-events-none shadow-[0_0_40px_rgba(var(--theme-color),0.08)_inset]">
            <video
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover filter contrast-110 saturate-50 opacity-50 mix-blend-screen"
              ref={(v) => {
                if (v) v.srcObject = videoStream;
              }}
            />
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none" />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[rgb(var(--theme-color))] opacity-60" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[rgb(var(--theme-color))] opacity-60" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[rgb(var(--theme-color))] opacity-60" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[rgb(var(--theme-color))] opacity-60" />
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-px bg-[rgb(var(--theme-color))] opacity-10" />
            <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px bg-[rgb(var(--theme-color))] opacity-10" />
          </div>
        )}

        {/* ─── EAGLE AVATAR + RINGS container ─── */}
        <div
          className={clsx(
            'relative flex items-center justify-center transition-all duration-700',
            aiTheme.name === 'error'
              ? 'animate-[glitch_0.2s_ease-in-out_infinite]'
              : 'animate-[float_6s_ease-in-out_infinite]'
          )}
        >
          {/* Holographic Rings — centered on the avatar */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* User Voice Ring */}
            <div
              className="absolute rounded-full border border-white/15 transition-transform duration-100 ease-out"
              style={{
                width: 'clamp(200px, 60vw, 340px)',
                height: 'clamp(200px, 60vw, 340px)',
                transform:
                  'rotateX(70deg) scale(calc(1 + var(--u-vol) * 0.8))',
                boxShadow: '0 0 15px rgba(255,255,255,0.08) inset',
              }}
            />

            {/* AI Voice Ring */}
            <div
              className="absolute rounded-full border-[2.5px] border-dashed transition-all duration-75 ease-out animate-[spin_20s_linear_infinite]"
              style={{
                width: 'clamp(240px, 72vw, 400px)',
                height: 'clamp(240px, 72vw, 400px)',
                borderColor: 'var(--theme-hex)',
                opacity: 0.35,
                transform:
                  'rotateX(70deg) scale(calc(1 + var(--a-vol) * 0.6))',
                filter: 'drop-shadow(0 0 8px var(--theme-hex))',
              }}
            />

            {/* Base Projector Glow */}
            <div
              className="absolute rounded-[100%] blur-xl transition-colors duration-700"
              style={{
                bottom: '-40px',
                width: '120px',
                height: '30px',
                background: 'var(--theme-hex)',
                opacity: 0.4,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </div>

          {/* Eagle SVG */}
          <div
            className={clsx(
              'relative z-10 transition-all duration-700',
              status === 'idle'
                ? 'opacity-50 saturate-0'
                : 'opacity-100 saturate-100'
            )}
            style={{
              width: 'clamp(180px, 50vw, 300px)',
              height: 'clamp(180px, 50vw, 300px)',
            }}
          >
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                <linearGradient
                  id="armorGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--theme-hex)"
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="50%"
                    stopColor="var(--theme-hex)"
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor="#020617"
                    stopOpacity="0.9"
                  />
                </linearGradient>
                <filter
                  id="neonGlow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="dropShadow">
                  <feDropShadow
                    dx="0"
                    dy="10"
                    stdDeviation="15"
                    floodColor="var(--theme-hex)"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>

              {/* Wings */}
              <g
                style={{
                  transformOrigin: '200px 200px',
                  transform:
                    status === 'idle'
                      ? 'scaleX(0.8) translateY(10px)'
                      : 'scaleX(calc(1 + var(--u-vol)*0.15)) translateY(calc(var(--u-vol)*-15px))',
                  transition:
                    'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <path
                  d="M120 180 C50 130, 10 90, 30 70 C60 40, 110 70, 140 130 Z"
                  fill="url(#armorGrad)"
                  filter="url(#dropShadow)"
                  stroke="var(--theme-hex)"
                  strokeWidth="2"
                />
                <path
                  d="M110 160 C60 120, 30 90, 45 75 C70 50, 105 80, 130 130"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <path
                  d="M280 180 C350 130, 390 90, 370 70 C340 40, 290 70, 260 130 Z"
                  fill="url(#armorGrad)"
                  filter="url(#dropShadow)"
                  stroke="var(--theme-hex)"
                  strokeWidth="2"
                />
                <path
                  d="M290 160 C340 120, 370 90, 355 75 C330 50, 295 80, 270 130"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </g>

              {/* Body */}
              <path
                d="M160 120 Q200 80 240 120 L260 220 Q200 280 140 220 Z"
                fill="url(#bodyGrad)"
                stroke="var(--theme-hex)"
                strokeWidth="1.5"
                filter="url(#dropShadow)"
              />

              {/* Panel Lines */}
              <path
                d="M180 140 L200 160 L220 140 M170 180 L200 210 L230 180"
                fill="none"
                stroke="var(--theme-hex)"
                strokeWidth="1"
                strokeOpacity="0.6"
              />

              {/* Chest Reactor */}
              <g
                style={{
                  transformOrigin: '200px 180px',
                  transform:
                    'scale(calc(1 + var(--a-vol)*0.6 + var(--u-vol)*0.2))',
                  transition: 'transform 0.05s',
                }}
              >
                <circle
                  cx="200"
                  cy="180"
                  r="24"
                  fill="#020617"
                  stroke="var(--theme-hex)"
                  strokeWidth="3"
                />
                <circle
                  cx="200"
                  cy="180"
                  r="14"
                  fill="var(--theme-hex)"
                  filter="url(#neonGlow)"
                />
                <circle
                  cx="200"
                  cy="180"
                  r="6"
                  fill="#ffffff"
                  filter="url(#neonGlow)"
                />
                <g
                  className="animate-[spin_4s_linear_infinite]"
                  style={{ transformOrigin: '200px 180px' }}
                >
                  <path
                    d="M200 150 L205 160 L195 160 Z"
                    fill="var(--theme-hex)"
                  />
                  <path
                    d="M200 210 L205 200 L195 200 Z"
                    fill="var(--theme-hex)"
                  />
                  <path
                    d="M170 180 L180 175 L180 185 Z"
                    fill="var(--theme-hex)"
                  />
                  <path
                    d="M230 180 L220 175 L220 185 Z"
                    fill="var(--theme-hex)"
                  />
                </g>
              </g>

              {/* Head */}
              <g
                style={{
                  transformOrigin: '200px 150px',
                  transform: 'rotate(calc(var(--u-vol) * 12deg))',
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <path
                  d="M175 110 Q200 60 225 110 L200 140 Z"
                  fill="url(#armorGrad)"
                  stroke="var(--theme-hex)"
                  strokeWidth="2"
                />
                <path
                  d="M185 95 L195 100 L188 105 Z"
                  fill="#ffffff"
                  filter="url(#neonGlow)"
                />
                <path
                  d="M215 95 L205 100 L212 105 Z"
                  fill="#ffffff"
                  filter="url(#neonGlow)"
                />
                <g
                  style={{
                    transformOrigin: '200px 105px',
                    transform: 'scaleY(calc(1 + var(--a-vol)*1.2))',
                    transition: 'transform 0.05s',
                  }}
                >
                  <path
                    d="M195 105 L200 125 L205 105 Z"
                    fill="var(--theme-hex)"
                    filter="url(#neonGlow)"
                  />
                </g>
              </g>

              {/* Tail */}
              <path
                d="M180 230 L200 280 L220 230 Z"
                fill="url(#armorGrad)"
                stroke="var(--theme-hex)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* ─── IDLE START OVERLAY ─── */}
        {status === 'idle' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
            <button
              onClick={handleToggle}
              className="relative group flex flex-col items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-indigo-400/50 bg-indigo-950/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-400/30 border-dashed animate-[spin_10s_linear_infinite]" />
              <Mic
                size={44}
                className="text-indigo-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] mb-2 relative z-10 group-hover:scale-110 transition-transform"
              />
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-indigo-200 relative z-10">
                INITIALIZE
              </span>
            </button>
          </div>
        )}

        {/* ─── ERROR OVERLAY ─── */}
        {status === 'error' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] p-6">
            <AlertOctagon
              size={56}
              className="text-red-500 mb-5 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              strokeWidth={1.5}
            />
            <div className="bg-black/50 border border-red-500/50 px-6 py-5 rounded-3xl text-center max-w-xs w-full shadow-[0_0_40px_rgba(239,68,68,0.15)]">
              <h3 className="text-lg font-black text-red-400 tracking-widest mb-1.5 font-mono">
                SYSTEM FAILURE
              </h3>
              <p className="text-red-200/80 text-xs sm:text-sm mb-6 font-mono leading-relaxed">
                {errorMessage}
              </p>
              <button
                onClick={handleToggle}
                className="w-full py-3.5 rounded-xl bg-red-500/20 border border-red-500 text-red-400 font-bold tracking-widest flex items-center justify-center gap-2.5 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-sm"
              >
                <RefreshCw size={16} /> REBOOT SYSTEM
              </button>
            </div>
          </div>
        )}

        {/* Active Tool Chip — positioned relative to the avatar area top */}
        {activeTool && (
          <div className="absolute top-4 left-1/2 z-40 -translate-x-1/2 animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="bg-[#0a1128]/90 backdrop-blur-2xl border border-[rgba(var(--theme-color),0.5)] pl-2 pr-5 py-2 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(var(--theme-color),0.2)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[rgba(var(--theme-color),0.2)] flex items-center justify-center border border-[rgba(var(--theme-color),0.4)] shrink-0">
                <Cpu
                  size={16}
                  className="text-[rgb(var(--theme-color))] animate-pulse"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  PROCESSING
                </span>
                <span className="text-white text-xs sm:text-sm font-black tracking-wide truncate">
                  {activeTool.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── TRANSCRIPT & CONTROLS PANEL ─── */}
      <div
        className={clsx(
          'relative z-40 w-full shrink-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
          showTranscripts ? 'h-[42vh]' : 'h-[100px]'
        )}
      >
        {/* Glass background */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#060b1e]/95 to-transparent backdrop-blur-xl border-t border-white/[0.08]"
          style={{ boxShadow: '0 -15px 50px rgba(0,0,0,0.4)' }}
        />

        {/* Transcripts scroll area — padding-bottom accounts for floating controls */}
        <div
          className={clsx(
            'relative h-full flex flex-col px-4 sm:px-6 md:px-8 overflow-y-auto hide-scrollbar scroll-smooth transition-opacity duration-500',
            showTranscripts
              ? 'opacity-100 pt-4 pb-28'
              : 'opacity-0 pointer-events-none pt-4 pb-28'
          )}
        >
          {transcripts.length === 0 && status === 'connected' && (
            <div className="m-auto flex flex-col items-center opacity-50 py-6">
              <div className="w-14 h-14 rounded-full border border-[rgba(var(--theme-color),0.4)] bg-[rgba(var(--theme-color),0.1)] flex items-center justify-center mb-3 relative">
                <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--theme-color))] border-t-transparent animate-spin" />
                <Radio
                  size={20}
                  className="text-[rgb(var(--theme-color))] animate-pulse"
                />
              </div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[rgb(var(--theme-color))] text-center leading-relaxed">
                AWAITING VOICE INPUT
                <br />
                OR VISUAL SCAN
              </p>
            </div>
          )}

          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className={clsx(
                'max-w-[85%] sm:max-w-[75%] p-3.5 rounded-[1.25rem] text-sm sm:text-[15px] font-medium mb-3 shadow-lg backdrop-blur-md border animate-[slideUpFade_0.4s_ease-out_forwards]',
                transcript.role === 'user'
                  ? 'self-end bg-white/5 border-white/10 text-white rounded-br-sm shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
                  : 'self-start bg-[rgba(var(--theme-color),0.1)] border-[rgba(var(--theme-color),0.25)] text-[rgb(var(--theme-color))] rounded-bl-sm shadow-[0_8px_24px_rgba(var(--theme-color),0.08)] brightness-125'
              )}
            >
              {transcript.role === 'model' && (
                <div className="flex items-center gap-1.5 mb-1.5 opacity-70">
                  <Sparkles size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    Krushi Mitra AI
                  </span>
                </div>
              )}
              <span className="leading-relaxed">{transcript.text}</span>
            </div>
          ))}
          <div ref={transcriptEndRef} className="h-2 shrink-0" />
        </div>

        {/* ─── Floating Controls Bar ─── */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 md:max-w-xl md:left-1/2 md:-translate-x-1/2 md:w-full flex items-center justify-between z-50">
          {/* Left: Transcript Toggle */}
          <button
            onClick={() => setShowTranscripts(!showTranscripts)}
            className="w-12 h-12 rounded-2xl bg-[#0a1128]/80 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-2xl transition-all active:scale-95 shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
          >
            <ChevronDown
              size={22}
              className={clsx(
                'transition-transform duration-500',
                !showTranscripts && 'rotate-180'
              )}
            />
          </button>

          {/* Center: Main Action Button */}
          {status !== 'idle' && status !== 'error' && (
            <div className="relative group/mic">
              {/* Pulse rings */}
              {status === 'connected' && (
                <>
                  <div className="absolute -inset-5 rounded-full border border-[rgb(var(--theme-color))] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-25 pointer-events-none" />
                  <div className="absolute -inset-3 rounded-full border-[1.5px] border-[rgb(var(--theme-color))] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] opacity-15 pointer-events-none" />
                </>
              )}

              <button
                onClick={handleToggle}
                className={clsx(
                  'relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center backdrop-blur-3xl border-2 transition-all duration-300 active:scale-90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-hover/mic:shadow-[0_16px_50px_rgba(var(--theme-color),0.35)]',
                  status === 'connected'
                    ? 'bg-[rgba(var(--theme-color),0.15)] border-[rgba(var(--theme-color),0.5)] text-[rgb(var(--theme-color))]'
                    : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                )}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                {status === 'connected' ? (
                  <Activity
                    size={28}
                    className="relative z-10 drop-shadow-[0_0_8px_currentColor]"
                    strokeWidth={2.5}
                  />
                ) : (
                  <RefreshCw
                    size={28}
                    className="relative z-10 animate-spin"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          )}

          {/* Spacer when mic not shown to keep layout balanced */}
          {(status === 'idle' || status === 'error') && (
            <div className="w-16 h-16" />
          )}

          {/* Right: Audio Visualizer indicator */}
          <div className="w-12 h-12 rounded-2xl bg-[#0a1128]/80 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-[0_6px_24px_rgba(0,0,0,0.4)] overflow-hidden px-2.5">
            {isSpeaking ? (
              <div className="flex items-end justify-center gap-[2.5px] h-5 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-[rgb(var(--theme-color))] rounded-t-sm animate-[waveform_0.4s_ease-in-out_infinite_alternate] shadow-[0_0_6px_currentColor]"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: '2px',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-7 h-[2px] bg-white/15 rounded-full" />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) translateX(-50%) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }
        @keyframes waveform {
          0% {
            height: 2px;
            opacity: 0.5;
          }
          100% {
            height: 20px;
            opacity: 1;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(0.5deg);
          }
        }
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, 2px);
            filter: hue-rotate(90deg) drop-shadow(0 0 15px red);
          }
          40% {
            transform: translate(3px, -2px);
          }
          60% {
            transform: translate(-2px, -3px);
            filter: hue-rotate(-90deg) drop-shadow(0 0 15px red);
          }
          80% {
            transform: translate(2px, 3px);
          }
          100% {
            transform: translate(0);
          }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
