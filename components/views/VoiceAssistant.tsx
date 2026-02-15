import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, Mic, MicOff, RefreshCw, Video, VideoOff, Eye, EyeOff } from 'lucide-react';
import { decode, decodeAudioData } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import clsx from 'clsx';
import EmotionAwareOrb from '../EmotionAwareOrb';

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
        video: cameraEnabled ? { width: 320, height: 240, facingMode: 'user' } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!shouldStayRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      // Separate video stream for face tracking
      if (cameraEnabled) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          setVideoStream(new MediaStream([videoTrack]));
        }
      }

      // ── 2. Audio Context Setup ──
      const ACClass = window.AudioContext || (window as any).webkitAudioContext;

      const inCtx = new ACClass({ sampleRate: 16000 });
      await inCtx.resume();
      inputCtxRef.current = inCtx;

      const outCtx = new ACClass({ sampleRate: 24000 });
      await outCtx.resume();
      outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;

      // Input Analyser (shared with Orb)
      const inAnalyser = inCtx.createAnalyser();
      inAnalyser.fftSize = 256;
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;
      setAnalyserState(inAnalyser);

      // Output Compressor
      const comp = outCtx.createDynamicsCompressor();
      comp.connect(outCtx.destination);
      compressorRef.current = comp;

      // Microphone Source → Analyser → Worklet
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

      // ── 3. Initialize Gemini Live ──
      const apiKey = getGenAIKey();
      const ai = new GoogleGenAI({ apiKey });

      const history = transcripts.slice(-4);
      let contextStr = '';
      if (history.length > 0) {
        contextStr = '\n[CONTEXT]: ' + history.map(h => `${h.role}: ${h.text}`).join('; ');
      }

      const systemPrompt = `You are AI Krushi Mitra (कृषी मित्र), a friendly agricultural expert. Speak ${
        lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'
      }. Keep answers concise and helpful for farmers. You can see the user's facial expressions and emotions through the camera - acknowledge their emotional state naturally and respond empathetically.${contextStr}`;

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
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

              // Clear any existing timeout
              if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);

              src.onended = () => {
                // Delay setting isSpeaking to false to handle rapid successive audio chunks
                speakingTimeoutRef.current = setTimeout(() => {
                  setIsSpeaking(false);
                }, 200);
              };
            }

            // Transcripts
            const userText = message.serverContent?.inputTranscription?.text;
            if (userText?.trim()) {
              setTranscripts(p => [...p, { role: 'user', text: userText.trim(), id: uid() }]);
            }

            const modelText = message.serverContent?.outputTranscription?.text;
            if (modelText?.trim()) {
              setTranscripts(p => [...p, { role: 'model', text: modelText.trim(), id: uid() }]);
            }
          },
          onclose: () => {
            setupDone.current = false;
            if (shouldStayRef.current) handleReconnect();
            else setStatus('idle');
          },
          onerror: (e: any) => {
            console.error('Session Error:', e);
            setErrorMessage('Connection error');
            setStatus('error');
          },
        },
      });

      sessionRef.current = session;

      // ── 4. Stream Audio to Gemini ──
      worklet.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !setupDone.current || !sessionRef.current) return;
        try {
          session.sendRealtimeInput({
            media: { mimeType: 'audio/pcm', data: float32ToBase64(chunk) },
          });
        } catch {
          /* ignore send errors */
        }
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to connect');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, transcripts, lang, cameraEnabled]);

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
  // CALLBACK HANDLERS FOR ORB DATA
  // ═══════════════════════════════════════════════════════════════

  const handleFaceData = useCallback((data: any) => {
    // Can be used for additional logic like auto-adjusting camera
  }, []);

  const handleEmotionData = useCallback((data: any) => {
    // Can be used to send emotion context to Gemini
  }, []);

  const handleVoiceData = useCallback((data: any) => {
    // Can be used for voice activity detection UI
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden bg-[#020617]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-[#020617] to-black pointer-events-none" />

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
      <div className="flex-1 relative z-10 w-full">
        <EmotionAwareOrb
          stream={videoStream}
          analyser={analyserState}
          isSpeaking={isSpeaking}
          isListening={status === 'connected'}
          status={status}
          mode={orbMode}
          onFaceData={handleFaceData}
          onEmotionData={handleEmotionData}
          onVoiceData={handleVoiceData}
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
              <div className="self-center text-white/30 text-xs font-mono py-8 animate-pulse">
                🎤 Listening... Speak to begin
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
                <button
                  onClick={handleToggle}
                  className="ml-2 px-2 py-0.5 bg-red-500/30 rounded text-red-200 hover:bg-red-500/40 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* ═══════ Bottom Controls ═══════ */}
      {status === 'connected' && (
        <div className="absolute bottom-safe-bottom mb-6 left-0 right-0 flex justify-center items-center gap-4 z-50 pointer-events-none">
          {/* Toggle transcript visibility */}
          <button
            onClick={() => setShowTranscripts(!showTranscripts)}
            className={clsx(
              'pointer-events-auto w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all active:scale-95',
              showTranscripts
                ? 'bg-white/10 border-white/20 text-white/60'
                : 'bg-white/5 border-white/10 text-white/30'
            )}
          >
            <span className="text-lg">{showTranscripts ? '💬' : '🔇'}</span>
          </button>

          {/* Stop Button */}
          <button
            onClick={handleToggle}
            className="pointer-events-auto w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          >
            <MicOff size={28} />
          </button>

          {/* Speaking indicator */}
          <div
            className={clsx(
              'w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all',
              isSpeaking
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 text-white/20'
            )}
          >
            <span className={clsx('text-lg', isSpeaking && 'animate-bounce')}>
              {isSpeaking ? '🗣️' : '🤫'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;