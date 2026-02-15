
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, Mic, MicOff, RefreshCw, Video, VideoOff } from 'lucide-react';
import { decode, decodeAudioData } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import clsx from 'clsx';
import EmotionAwareOrb from '../EmotionAwareOrb';

// --- Types ---
type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string; id: string };

// --- Helpers ---
const MAX_RETRIES = 5;
const RECONNECT_BASE_DELAY = 1000;
const uid = () => crypto.randomUUID().slice(0, 8);

let workletUrlCache: string | null = null;
function getWorkletUrl() {
  if (workletUrlCache) return workletUrlCache;
  const code = `
    class PCMForwarder extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs?.[0]?.[0];
        if (ch?.length) {
          const copy = new Float32Array(ch.length);
          copy.set(ch);
          this.port.postMessage(copy, [copy.buffer]);
        }
        return true;
      }
    }
    registerProcessor('pcm-forwarder', PCMForwarder);
  `;
  workletUrlCache = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return workletUrlCache;
}

function float32ToBase64(f32: Float32Array): string {
  const int16 = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// --- Main Component ---
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

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true); // Default to on for face tracking

  // Refs
  const shouldStayRef = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const connectRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const setupDone = useRef(false);

  // Audio/Video Refs
  const streamRef = useRef<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null); // State to pass to Orb
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null); // State to pass to Orb

  // Audio Processing Refs
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextPlayTime = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Clean up function
  const cleanup = useCallback((fullyStop = false) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    if (sessionRef.current) {
        try { sessionRef.current.close(); } catch { /* ignore */ }
        sessionRef.current = null;
    }

    setupDone.current = false;

    [workletRef, muteGainRef, compressorRef].forEach(ref => {
      if (ref.current) {
        try { ref.current.disconnect(); } catch { /* ignore */ }
        ref.current = null;
      }
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setVideoStream(null);
    }

    [inputCtxRef, outputCtxRef].forEach(ref => {
      if (ref.current) {
        ref.current.close().catch(() => {});
        ref.current = null;
      }
    });

    inputAnalyserRef.current = null;
    setAnalyserState(null);

    if (fullyStop) {
      shouldStayRef.current = false;
      setStatus('idle');
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => () => cleanup(true), [cleanup]);

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
      // 1. Get User Media (Audio + Video if enabled)
      const constraints = {
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: cameraEnabled ? { width: 320, height: 240, facingMode: 'user' } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!shouldStayRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      
      streamRef.current = stream;
      
      // Separate Video Stream for Face Tracking
      if (cameraEnabled) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
              const videoStreamOnly = new MediaStream([videoTrack]);
              setVideoStream(videoStreamOnly);
          }
      }

      // 2. Audio Context Setup
      const ACClass = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new (ACClass as any)({ sampleRate: 16000 });
      await inCtx.resume();
      inputCtxRef.current = inCtx;

      const outCtx = new (ACClass as any)({ sampleRate: 24000 });
      await outCtx.resume();
      outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;

      // Input Analyser
      const inAnalyser = inCtx.createAnalyser();
      inAnalyser.fftSize = 256; // Smaller for smoother visual
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;
      setAnalyserState(inAnalyser); // Pass to Orb

      // Output Compressor
      const comp = outCtx.createDynamicsCompressor();
      comp.connect(outCtx.destination);
      compressorRef.current = comp;

      // Microphone Source
      const source = inCtx.createMediaStreamSource(stream);
      await inCtx.audioWorklet.addModule(getWorkletUrl());
      const worklet = new AudioWorkletNode(inCtx, 'pcm-forwarder');
      workletRef.current = worklet;

      // Graph: Mic -> Analyser -> Worklet -> Mute -> Dest
      const mute = inCtx.createGain();
      mute.gain.value = 0;
      muteGainRef.current = mute;
      
      source.connect(inAnalyser);
      source.connect(worklet);
      worklet.connect(mute).connect(inCtx.destination);

      // 3. Initialize Gemini
      // Use helper to support both build-time and runtime (Cloud Run) env vars
      const apiKey = getGenAIKey();
      const ai = new GoogleGenAI({ apiKey });
      
      // Context from previous chats (optional)
      const history = transcripts.slice(-4);
      let contextStr = '';
      if (history.length > 0) {
        contextStr = '\n[CONTEXT]: ' + history.map(h => `${h.role}: ${h.text}`).join('; ');
      }

      const systemPrompt = `You are AI Krushi Mitra (कृषी मित्र), a friendly agricultural expert. Speak ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}. Keep answers concise and helpful for farmers.${contextStr}`;

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            systemInstruction: { parts: [{ text: systemPrompt }] },
            inputAudioTranscription: {}, 
        },
        callbacks: {
            onopen: () => {
                setupDone.current = true;
                retryCount.current = 0;
                setStatus('connected');
                triggerHaptic('medium');
            },
            onmessage: async (message: LiveServerMessage) => {
                // Audio Output
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
                    src.onended = () => setIsSpeaking(false);
                }

                // Transcript
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
            onerror: (e) => {
                console.error("Session Error:", e);
                setErrorMessage('Connection error');
                setStatus('error');
            }
        }
      });
      
      sessionRef.current = session;

      // 4. Stream Audio
      worklet.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !setupDone.current || !sessionRef.current) return;
        try {
          session.sendRealtimeInput({
            media: { mimeType: 'audio/pcm', data: float32ToBase64(chunk) },
          });
        } catch { /* ignore */ }
      };

    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || 'Failed to connect');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, transcripts, lang, cameraEnabled]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const handleToggle = useCallback(() => {
    triggerHaptic('medium');
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect(false);
    } else {
      cleanup(true);
    }
  }, [status, connect, cleanup]);

  const toggleCamera = () => {
      setCameraEnabled(!cameraEnabled);
      if (status === 'connected' || status === 'connecting') {
          // Reconnect to update constraints
          cleanup(false);
          // Wait slightly for cleanup
          setTimeout(() => connect(false), 200);
      }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden bg-[#020617]">
      {/* --- Background Gradient --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-[#020617] to-black pointer-events-none"></div>

      {/* --- Header --- */}
      <header className="relative z-50 flex items-center justify-between px-4 pt-safe-top mt-4 pb-2">
        <button onClick={() => { cleanup(true); onBack(); }} className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-md">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-3">
            <button onClick={toggleCamera} className={clsx("w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md transition-colors", cameraEnabled ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/10 text-white/40")}>
                {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <div className={clsx("px-4 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2", 
                status === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/60")}>
                <div className={clsx("w-2 h-2 rounded-full", status === 'connected' ? "bg-emerald-400 animate-pulse" : "bg-white/40")}></div>
                <span className="text-xs font-bold uppercase">{status}</span>
            </div>
        </div>
      </header>

      {/* --- 3D Scene Container --- */}
      <div className="flex-1 relative z-10 w-full">
          <EmotionAwareOrb 
             stream={videoStream}
             analyser={analyserState}
             isSpeaking={isSpeaking}
             isListening={status === 'connected'}
             status={status}
          />
          
          {/* Main Toggle Button Overlay (if idle) */}
          {status === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={handleToggle}
                    className="pointer-events-auto w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 backdrop-blur-md flex flex-col items-center justify-center text-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-all animate-pulse"
                  >
                      <Mic size={32} />
                      <span className="text-[10px] font-bold mt-1">START</span>
                  </button>
              </div>
          )}

          {/* Loading Indicator */}
          {(status === 'connecting' || status === 'reconnecting') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={32} className="text-cyan-400 animate-spin" />
                      <span className="text-xs font-bold text-cyan-400">Connecting...</span>
                  </div>
              </div>
          )}
      </div>

      {/* --- Transcript Area --- */}
      <div className="h-1/3 bg-gradient-to-t from-black via-black/90 to-transparent relative z-20 px-6 pb-safe-bottom overflow-y-auto mask-top">
         <div className="flex flex-col gap-3 pt-12">
             {transcripts.map((t) => (
                 <div key={t.id} className={clsx("max-w-[85%] p-3 rounded-2xl text-sm font-medium", 
                    t.role === 'user' ? "self-end bg-cyan-950/40 text-cyan-100 border border-cyan-500/20 rounded-br-none" : "self-start bg-white/10 text-white border border-white/10 rounded-bl-none")}>
                     {t.text}
                 </div>
             ))}
             {status === 'error' && (
                 <div className="self-center bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-xs border border-red-500/30">
                     {errorMessage}
                 </div>
             )}
             <div ref={transcriptEndRef} />
         </div>
      </div>

      {/* Controls Overlay */}
      {status === 'connected' && (
          <div className="absolute bottom-safe-bottom mb-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
              <button 
                onClick={handleToggle}
                className="pointer-events-auto w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all active:scale-95"
              >
                  <MicOff size={24} />
              </button>
          </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
