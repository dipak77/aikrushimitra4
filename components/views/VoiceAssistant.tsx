import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, Mic, MicOff, RefreshCw, Video, VideoOff, Eye, EyeOff, Scan } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunkBase64 } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import clsx from 'clsx';
import EmotionAwareOrb from '../EmotionAwareOrb';
import { MOCK_MARKET } from '../../data/mock';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string; id: string };
type OrbMode = 'cinematic' | 'minimal';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_RETRIES = 5;
const RECONNECT_BASE_DELAY = 1000;
const uid = () => crypto.randomUUID().slice(0, 8);

// Tools Definition
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
  workletUrlCache = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return workletUrlCache;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Video Frame Capture
// ═══════════════════════════════════════════════════════════════

async function captureFrame(video: HTMLVideoElement): Promise<string | null> {
  if (!video.videoWidth) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 480; // Optimized size for bandwidth
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
  const [orbMode, setOrbMode] = useState<OrbMode>('cinematic');
  const [showTranscripts, setShowTranscripts] = useState(true);
  
  // Tool State Visualization
  const [activeTool, setActiveTool] = useState<{name: string, result: string} | null>(null);

  // ─── Refs ───
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
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null);

  // Audio Processing Refs
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextPlayTime = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Scroll to latest transcript ───
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════

  const cleanup = useCallback((fullyStop = false) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

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
      setVideoStream(null);
    }

    [inputCtxRef, outputCtxRef].forEach(ref => {
      if (ref.current) {
        ref.current.close().catch(() => {});
        (ref as any).current = null;
      }
    });

    inputAnalyserRef.current = null;
    setAnalyserState(null);

    if (fullyStop) {
      shouldStayRef.current = false;
      setStatus('idle');
      setIsSpeaking(false);
      setActiveTool(null);
    }
  }, []);

  useEffect(() => () => cleanup(true), [cleanup]);

  // ═══════════════════════════════════════════════════════════════
  // RECONNECT LOGIC
  // ═══════════════════════════════════════════════════════════════

  const handleReconnect = useCallback(() => {
    if (!shouldStayRef.current) return;
    if (retryCount.current >= MAX_RETRIES) {
      setStatus('error');
      setErrorMessage(lang === 'mr' ? 'नेटवर्क अस्थिर' : 'Network unstable');
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
  // TOOL IMPLEMENTATIONS
  // ═══════════════════════════════════════════════════════════════

  const handleToolCall = async (functionCalls: any[]) => {
    if (!functionCalls?.length) return [];
    
    const responses = [];
    
    for (const call of functionCalls) {
      console.log("🛠️ Tool Called:", call.name, call.args);
      let result = {};
      let displayText = "";

      if (call.name === "get_weather_forecast") {
        result = { 
          condition: "Partly Cloudy",
          temp: "28°C",
          humidity: "65%",
          forecast: "Chance of light rain in evening.",
          advisory: "Good time for spraying before 4 PM."
        };
        displayText = "🌤️ Weather Check";
      } 
      else if (call.name === "get_mandi_price") {
        const crop = call.args.crop;
        const m = MOCK_MARKET.find(x => x.name.toLowerCase().includes(crop.toLowerCase()));
        if (m) {
          result = { price: m.price, trend: m.trend, arrival: m.arrival };
        } else {
          result = { price: "4500", trend: "Stable", arrival: "Medium" }; 
        }
        displayText = `💰 Market Rate: ${crop}`;
      }

      setActiveTool({ name: displayText, result: JSON.stringify(result) });
      setTimeout(() => setActiveTool(null), 4000);

      responses.push({
        id: call.id,
        name: call.name,
        response: { result }
      });
    }
    
    return responses;
  };

  // ═══════════════════════════════════════════════════════════════
  // CONNECT (Gemini + Audio + Video)
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
      // ── 1. Get User Media ──
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: cameraEnabled ? { width: 640, height: 480, facingMode: 'environment' } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!shouldStayRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      // Video Stream Logic
      if (cameraEnabled) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const videoStreamOnly = new MediaStream([videoTrack]);
          setVideoStream(videoStreamOnly);
          
          // Setup hidden video for frame capture
          if (hiddenVideoRef.current) {
            hiddenVideoRef.current.srcObject = videoStreamOnly;
            hiddenVideoRef.current.play().catch(e => console.error("Video play err", e));
          }
        }
      }

      // ── 2. Audio Context Setup ──
      const ACClass = window.AudioContext || (window as any).webkitAudioContext;

      // Input Context - Prefer 16kHz for Gemini
      const inCtx = new ACClass({ sampleRate: 16000 });
      await inCtx.resume();
      inputCtxRef.current = inCtx;

      // Output Context - Higher Quality
      const outCtx = new ACClass({ sampleRate: 24000 });
      await outCtx.resume();
      outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;

      const inAnalyser = inCtx.createAnalyser();
      inAnalyser.fftSize = 256;
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;
      setAnalyserState(inAnalyser);

      const comp = outCtx.createDynamicsCompressor();
      comp.connect(outCtx.destination);
      compressorRef.current = comp;

      const source = inCtx.createMediaStreamSource(stream);
      await inCtx.audioWorklet.addModule(getWorkletUrl());
      const worklet = new AudioWorkletNode(inCtx, 'pcm-forwarder');
      workletRef.current = worklet;

      const mute = inCtx.createGain();
      mute.gain.value = 0;
      muteGainRef.current = mute;

      // Chain: Source -> Analyser -> Worklet -> Mute -> Dest
      source.connect(inAnalyser);
      source.connect(worklet);
      worklet.connect(mute).connect(inCtx.destination);

      // ── 3. Initialize Gemini Live ──
      const apiKey = getGenAIKey();
      if (!apiKey) throw new Error("API Key missing");
      
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
      You are KRUSHI MITRA AI, an experienced field agriculture supervisor and robotic assistant.
      
      ROLE & PERSONA:
      - You act as a highly advanced "Field Robot" helping the farmer.
      - Voice: Helpful, authoritative but friendly, like a seasoned expert.
      - Capabilities: Visual analysis, crop diagnosis, market data, weather advice.
      
      VISUAL ANALYSIS:
      - If video is active, analyze crops/pests visible.
      - If image is blurry, ask the farmer to hold steady.
      
      CONVERSATION:
      - Speak simple ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.
      - Keep responses concise (spoken word style).
      `;

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: TOOLS,
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setupDone.current = true;
            retryCount.current = 0;
            setStatus('connected');
            triggerHaptic('medium');
            
            // Video Loop
            if (cameraEnabled && hiddenVideoRef.current) {
               if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
               videoIntervalRef.current = setInterval(async () => {
                  if (!setupDone.current || !sessionRef.current || !hiddenVideoRef.current) return;
                  const base64Data = await captureFrame(hiddenVideoRef.current);
                  if (base64Data) {
                     sessionRef.current.sendRealtimeInput({
                        media: { mimeType: 'image/jpeg', data: base64Data }
                     });
                  }
               }, 2000); // 2s interval for frames
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
              // Decode audio
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
                // Approximate "speaking" end
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
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
            if (shouldStayRef.current) handleReconnect();
            else setStatus('idle');
          },
          onerror: (e: any) => {
            console.error('Session Error:', e);
            setStatus('error');
            setErrorMessage('Connection failed.');
          },
        },
      });

      sessionRef.current = session;

      // ── 4. Stream Audio to Gemini ──
      worklet.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !setupDone.current || !sessionRef.current) return;
        try {
          // IMPORTANT: Must specify rate=16000 for Gemini Live
          const b64 = createPCMChunkBase64(chunk, inputCtxRef.current?.sampleRate || 16000);
          session.sendRealtimeInput({
            media: { mimeType: 'audio/pcm;rate=16000', data: b64 },
          });
        } catch (e) { console.error(e); }
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to connect');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, transcripts, lang, cameraEnabled, user]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleToggle = useCallback(() => {
    triggerHaptic('medium');
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect(false);
    } else {
      cleanup(true);
    }
  }, [status, connect, cleanup]);

  const toggleCamera = useCallback(() => {
    setCameraEnabled(prev => {
      const next = !prev;
      // Reconnect to update stream tracks if needed, or just handle logic
      if (status === 'connected' || status === 'connecting') {
        cleanup(false);
        setTimeout(() => connect(false), 200);
      }
      return next;
    });
  }, [status, cleanup, connect]);

  const toggleOrbMode = useCallback(() => {
    setOrbMode(prev => prev === 'cinematic' ? 'minimal' : 'cinematic');
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden bg-[#020617]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-[#020617] to-black pointer-events-none" />

      {/* Hidden Video for Frame Capture */}
      <video ref={hiddenVideoRef} className="hidden" muted playsInline autoPlay width={640} height={480} />

      {/* ═══════ Header ═══════ */}
      <header className="relative z-50 flex items-center justify-between px-4 pt-safe-top mt-4 pb-2">
        <button
          onClick={() => { cleanup(true); onBack(); }}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={clsx(
              'w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md transition-all active:scale-95',
              cameraEnabled
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 border-white/10 text-white/40'
            )}
          >
            {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          {/* Mode Toggle */}
          <button
            onClick={toggleOrbMode}
            className={clsx(
              'w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md transition-all active:scale-95',
              orbMode === 'cinematic'
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                : 'bg-white/5 border-white/10 text-white/40'
            )}
          >
            {orbMode === 'cinematic' ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          {/* Status */}
          <div
            className={clsx(
              'px-4 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2',
              status === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : status === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-white/5 border-white/10 text-white/60'
            )}
          >
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                status === 'connected' ? 'bg-emerald-400 animate-pulse' :
                status === 'connecting' || status === 'reconnecting' ? 'bg-yellow-400 animate-pulse' :
                status === 'error' ? 'bg-red-400' : 'bg-white/40'
              )}
            />
            <span className="text-xs font-bold uppercase">{status}</span>
          </div>
        </div>
      </header>

      {/* ═══════ 3D Scene ═══════ */}
      <div className="flex-1 relative z-10 w-full flex flex-col justify-center items-center">
        
        {/* HUD Overlay for Camera */}
        {cameraEnabled && status === 'connected' && (
            <div className="absolute inset-4 border-2 border-cyan-500/30 rounded-3xl pointer-events-none z-20 animate-pulse">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
                
                {/* Scanning Text */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1 rounded-full border border-cyan-500/50 flex items-center gap-2">
                    <Scan size={14} className="text-cyan-400 animate-spin-slow"/>
                    <span className="text-xs font-mono text-cyan-300 tracking-widest">LIVE ANALYSIS</span>
                </div>
            </div>
        )}

        <EmotionAwareOrb
          stream={videoStream}
          analyser={analyserState}
          isSpeaking={isSpeaking}
          isListening={status === 'connected'}
          status={status}
          mode={orbMode}
          cameraEnabled={cameraEnabled}
        />

        {/* Start Button (idle state) */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleToggle}
              className="pointer-events-auto w-28 h-28 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 backdrop-blur-md flex flex-col items-center justify-center text-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.3)] hover:scale-105 transition-all animate-pulse"
            >
              <Mic size={36} />
              <span className="text-[10px] font-bold mt-1 tracking-wider">START</span>
            </button>
          </div>
        )}

        {/* Active Tool Visual */}
        {activeTool && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-enter">
                <div className="bg-black/60 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                        <p className="text-white text-sm font-bold">{activeTool.name}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Connecting Indicator */}
        {(status === 'connecting' || status === 'reconnecting') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={36} className="text-cyan-400 animate-spin" />
              <span className="text-xs font-bold text-cyan-400 tracking-wider animate-pulse">
                {status === 'reconnecting' ? 'RECONNECTING...' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ Transcript Area ═══════ */}
      {showTranscripts && (
        <div className="h-1/3 bg-gradient-to-t from-black via-black/90 to-transparent relative z-20 px-6 pb-safe-bottom overflow-y-auto">
          {/* Fade mask at top */}
          <div className="sticky top-0 h-12 bg-gradient-to-b from-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col gap-3 pt-4">
            {transcripts.length === 0 && status === 'connected' && (
              <div className="self-center text-white/30 text-xs font-mono py-8 animate-pulse text-center">
                🌾 KRUSHI MITRA AI READY<br/>
                Speak or show crops to camera
              </div>
            )}

            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className={clsx(
                  'max-w-[85%] p-3 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300',
                  transcript.role === 'user'
                    ? 'self-end bg-cyan-950/40 text-cyan-100 border border-cyan-500/20 rounded-br-none'
                    : 'self-start bg-white/10 text-white border border-white/10 rounded-bl-none'
                )}
              >
                {transcript.text}
              </div>
            ))}

            {status === 'error' && (
              <div className="self-center bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-xs border border-red-500/30 flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
                <button onClick={handleToggle} className="ml-2 px-2 py-0.5 bg-red-500/30 rounded text-red-200">Retry</button>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* ═══════ Bottom Controls ═══════ */}
      {status === 'connected' && (
        <div className="absolute bottom-safe-bottom mb-6 left-0 right-0 flex justify-center items-center gap-4 z-50 pointer-events-none">
          <button
            onClick={() => setShowTranscripts(!showTranscripts)}
            className={clsx(
              'pointer-events-auto w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all active:scale-95',
              showTranscripts ? 'bg-white/10 border-white/20 text-white/60' : 'bg-white/5 border-white/10 text-white/30'
            )}
          >
            <span className="text-lg">{showTranscripts ? '💬' : '🔇'}</span>
          </button>

          <button
            onClick={handleToggle}
            className="pointer-events-auto w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          >
            <MicOff size={28} />
          </button>

          <div
            className={clsx(
              'w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all',
              isSpeaking ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/20'
            )}
          >
            <span className={clsx('text-lg', isSpeaking && 'animate-bounce')}>{isSpeaking ? '🗣️' : '🤫'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;