
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, WifiOff, MessageSquare, Volume2, AlertCircle } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';

const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [transcripts, setTranscripts] = useState<{role: 'user'|'model', text: string, timestamp: number}[]>([]);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  // Audio Nodes
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVolumeRef = useRef(0); 
  const phaseRef = useRef(0);

  // Auto-scroll for transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup Function
  const cleanup = (fullyStop: boolean = false) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(console.error);
      inputContextRef.current = null;
    }

    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close().catch(console.error);
      outputContextRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || 
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setIsModelSpeaking(false);

    if (fullyStop) {
      setStatus('idle');
      reconnectAttemptsRef.current = 0;
      setErrorDetails('');
    }
  };

  // Advanced Visualizer
  const visualize = (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
    if (!containerRef.current) return;
    
    const inputData = new Uint8Array(inputAnalyser.frequencyBinCount);
    inputAnalyser.getByteFrequencyData(inputData);
    let inputSum = 0;
    for (let i = 0; i < inputData.length; i++) inputSum += inputData[i];
    const inputAvg = inputSum / inputData.length;

    const outputData = new Uint8Array(outputAnalyser.frequencyBinCount);
    outputAnalyser.getByteFrequencyData(outputData);
    let outputSum = 0;
    for (let i = 0; i < outputData.length; i++) outputSum += outputData[i];
    const outputAvg = outputSum / outputData.length;

    const maxAvg = Math.max(inputAvg, outputAvg);
    const targetVolume = maxAvg / 255;
    lastVolumeRef.current += (targetVolume - lastVolumeRef.current) * 0.15; 
    const vol = lastVolumeRef.current;

    containerRef.current.style.setProperty('--audio-level', vol.toString());
    containerRef.current.style.setProperty('--glow-opacity', (0.3 + vol * 0.7).toString());
    
    phaseRef.current += 0.02 + (vol * 0.1);
    containerRef.current.style.setProperty('--phase', phaseRef.current.toString());

    animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
  };

  const getWebSocketUrl = () => {
    const loc = window.location;
    let protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = loc.host;

    // Handle blob/preview environments where host might be empty or null
    if (!host && (loc.protocol === 'blob:' || loc.href.startsWith('blob:'))) {
        try {
            const originUrl = new URL(loc.origin !== 'null' ? loc.origin : document.baseURI);
            host = originUrl.host;
            if (originUrl.protocol === 'https:') protocol = 'wss:';
        } catch (e) {
            console.warn("Could not determine host from blob origin, using defaults.");
            host = 'localhost:8080';
        }
    }

    // Fix for local development: If on Vite port 5173, point WS to Server port 8080
    if (host.includes(':5173')) {
        host = host.replace(':5173', ':8080');
    }

    return `${protocol}//${host}/ws/live`;
  };

  const connect = async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      setErrorMessage(t.error_offline || "No Internet");
      return;
    }

    cleanup(false); 
    setErrorMessage('');
    setErrorDetails('');
    setStatus('connecting');

    try {
      // 1. Setup Audio Contexts
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          sampleRate: 16000
        } 
      }).catch((e) => {
        throw new Error(t.error_mic || "Microphone access denied");
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

      // 2. Setup Analyzers
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 512; 
      inputAnalyser.smoothingTimeConstant = 0.8;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 512;
      outputAnalyser.smoothingTimeConstant = 0.8;

      source.connect(inputAnalyser);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      visualize(inputAnalyser, outputAnalyser);

      // 3. Connect to Backend WebSocket
      const wsUrl = getWebSocketUrl();
      console.log(`🔗 Connecting to: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('❌ Connection timeout');
          ws.close();
          setStatus('error');
          setErrorMessage('Connection timeout');
          setErrorDetails('Server took too long to respond. Please try again.');
        }
      }, 15000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          // Handle connection ready messages
          if (msg.type === 'proxy_ready') {
            console.log('✅ Proxy ready');
          }

          if (msg.setupComplete) {
            console.log('✅ AI connected');
            setStatus('connected');
            triggerHaptic();
            reconnectAttemptsRef.current = 0;
          }

          // Handle errors from server
          if (msg.error) {
            console.error('❌ Server error:', msg);
            setErrorMessage(typeof msg.error === 'string' ? msg.error : "Server Error");
            setErrorDetails(msg.message || msg.details || msg.hint || '');
            setStatus('error');
            return;
          }

          // Handle server content
          if (msg.serverContent) {
            const { modelTurn, turnComplete, interrupted, inputTranscription } = msg.serverContent;
            
            // Handle Audio Output
            const audioPart = modelTurn?.parts?.find((p: any) => p.inlineData);
            if (audioPart?.inlineData?.data) {
              setIsModelSpeaking(true);
              const audioData = audioPart.inlineData.data;
              
              try {
                const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                const sourceNode = outputCtx.createBufferSource();
                sourceNode.buffer = buffer;
                sourceNode.connect(outputAnalyser);
                sourceNode.connect(outputCtx.destination);
                
                const currentTime = outputCtx.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                  nextStartTimeRef.current = currentTime;
                }
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                sourceNode.onended = () => {
                  if (outputCtx.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsModelSpeaking(false);
                  }
                };
              } catch (audioError) {
                console.error('❌ Audio decode error:', audioError);
                setIsModelSpeaking(false);
              }
            }

            // Handle Model Text Response
            const textPart = modelTurn?.parts?.find((p: any) => p.text);
            if (textPart?.text && turnComplete) {
              const modelText = textPart.text;
              setTranscripts(prev => {
                if (prev.length > 0 && prev[prev.length - 1].text === modelText) return prev;
                return [...prev, { role: 'model', text: modelText, timestamp: Date.now() }];
              });
            }

            // Handle User Transcription
            if (inputTranscription?.text) {
              const userText = inputTranscription.text;
              setTranscripts(prev => {
                if (prev.length > 0 && prev[prev.length - 1].text === userText) return prev;
                return [...prev, { role: 'user', text: userText, timestamp: Date.now() }];
              });
            }

            if (interrupted) {
              setIsModelSpeaking(false);
              nextStartTimeRef.current = outputCtx.currentTime;
            }
          }
        } catch (e) {
          console.error('❌ Error processing message:', e);
        }
      };

      ws.onclose = (e) => {
        clearTimeout(connectionTimeout);
        console.log('🔌 WebSocket closed:', e.code, e.reason);
        
        if (e.code === 1006) {
          setErrorMessage('Connection lost unexpectedly');
          setErrorDetails('The server closed the connection. Check if API Key is configured on server.');
          setStatus('error');
        } else if (e.code === 1008 || e.code === 1011) {
          if (!errorMessage) setErrorMessage(t.error_connection || "Connection Error");
          setStatus('error');
        } else if (status === 'connected' && reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current++;
          setStatus('reconnecting');
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        } else {
          setStatus('idle');
        }
      };

      ws.onerror = (e) => {
        console.error('❌ WebSocket error event', e);
      };

      // 4. Stream Audio to Server
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmChunk = createPCMChunk(inputData, inputCtx.sampleRate);
        
        wsRef.current.send(JSON.stringify({ 
          realtimeInput: { 
            mediaChunks: [pcmChunk] 
          } 
        }));
      };

    } catch (e: any) { 
      console.error('❌ Connection error:', e);
      setErrorMessage(e.message || t.error_connection || "Connection Failed");
      setStatus('error');
      cleanup(true);
    }
  };

  const handleToggle = () => {
    triggerHaptic();
    if (status === 'idle' || status === 'error') {
      if (status !== 'error') setTranscripts([]); 
      connect();
    } else if (status === 'connected') {
      cleanup(true);
    }
  };

  const handleBack = () => {
    cleanup(true);
    onBack();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col h-[100dvh] w-full overflow-hidden" 
      ref={containerRef} 
      style={{ '--audio-level': '0', '--phase': '0', '--glow-opacity': '0.3' } as React.CSSProperties}
    >
      {/* ... styles ... */}
      <style>{`
        .orb-container { perspective: 1000px; }
        .orb-core {
          box-shadow: 0 0 calc(30px + var(--audio-level, 0) * 50px) rgba(34, 197, 94, calc(var(--glow-opacity, 0.3)));
          transform: scale(calc(1 + var(--audio-level, 0) * 0.2));
          transition: transform 0.1s linear, box-shadow 0.2s ease;
        }
        .orb-plasma {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          transition: all 0.2s ease-out;
          mix-blend-mode: screen;
          filter: blur(8px);
        }
        .plasma-1 {
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.8), rgba(6, 182, 212, 0.8));
          animation: liquid-spin 8s linear infinite;
          transform: rotate(calc(var(--phase, 0) * 50deg));
        }
        .plasma-2 {
          background: linear-gradient(90deg, rgba(250, 204, 21, 0.6), rgba(34, 211, 238, 0.6));
          animation: liquid-spin 12s linear infinite reverse;
          transform: rotate(calc(var(--phase, 0) * -30deg)) scale(1.1);
        }
        .orb-ring {
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 50%;
          animation: ring-spin 20s linear infinite;
        }
        .orb-ring-inner {
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 2px solid rgba(34, 197, 94, 0.8);
          border-bottom: 2px solid rgba(6, 182, 212, 0.8);
          border-radius: 50%;
          animation: ring-spin 4s linear infinite;
        }
        @keyframes liquid-spin {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          66% { border-radius: 30% 70% 70% 30% / 80% 20% 80% 20%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
        @keyframes ring-spin {
          from { transform: rotate3d(0, 0, 1, 0deg); }
          to { transform: rotate3d(0, 0, 1, 360deg); }
        }
        .text-shimmer {
          background: linear-gradient(90deg, #34d399, #fff, #06b6d4, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: text-shimmer 3s linear infinite;
        }
        @keyframes text-shimmer {
          from { background-position: 200% center; }
          to { background-position: -200% center; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-image-gradient {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 100%);
        }
        .animate-enter {
          animation: enter 0.3s ease-out forwards;
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-[#020617] pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', 
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-emerald-900/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-[220] bg-gradient-to-b from-[#020617]/90 via-[#020617]/70 to-transparent backdrop-blur-sm">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 pl-2 pr-5 py-2.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/20 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg group"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold text-sm tracking-wide">Back</span>
        </button>
        
        <div className={clsx(
          "px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 shadow-lg", 
          status === 'connected' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : 
          status === 'error' ? "border-red-500/30 bg-red-500/10 text-red-300" : 
          status === 'offline' ? "border-amber-500/30 bg-amber-500/10 text-amber-300" :
          "border-white/10 bg-white/5 text-slate-300"
        )}>
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            {status === 'connected' && (
              <span 
                className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]" 
                style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
              />
            )}
            {status === 'idle' ? 'AI Ready' : 
             status === 'error' ? 'Error' : 
             status === 'offline' ? 'Offline' :
             status === 'reconnecting' ? 'Reconnecting...' :
             'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Orb */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 orb-container px-4">
        <div 
          className="relative w-[min(320px,80vw)] h-[min(320px,80vw)] flex items-center justify-center cursor-pointer select-none"
          onClick={handleToggle}
        >
          {status === 'connected' && (
            <>
              <div className="absolute inset-[-40px] orb-ring opacity-30 border-emerald-500/50" />
              <div className="absolute inset-[-20px] orb-ring-inner opacity-50" />
            </>
          )}

          <div className={clsx(
            "absolute inset-0 plasma-1 orb-plasma transition-all duration-700 pointer-events-none", 
            status === 'idle' ? "opacity-30 scale-90" : "opacity-100 scale-100"
          )} />
          <div className={clsx(
            "absolute inset-4 plasma-2 orb-plasma transition-all duration-700 pointer-events-none", 
            status === 'idle' ? "opacity-20 scale-90" : "opacity-80 scale-100"
          )} />

          <div className={clsx(
            "absolute inset-0 m-auto w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 pointer-events-none",
            status === 'connected' 
              ? "bg-black/60 orb-core border border-emerald-400/30 backdrop-blur-sm" 
              : "bg-black/40 border border-white/10 backdrop-blur-sm"
          )}>
            <div className="text-center z-50 flex flex-col items-center justify-center p-4">
              {status === 'idle' ? (
                <>
                  <Mic size={36} className="text-white/90 mb-2 drop-shadow-lg animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                    Tap to Start
                  </span>
                </>
              ) : status === 'connecting' || status === 'reconnecting' ? (
                <RefreshCw size={40} className="text-emerald-400 animate-spin" />
              ) : status === 'error' || status === 'offline' ? (
                <WifiOff size={36} className="text-red-400" />
              ) : (
                <div className="flex flex-col items-center">
                  <h1 className="text-xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-cyan-200 text-shimmer drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    AI<br/>कृषी मित्र
                  </h1>
                  <div className="flex items-center justify-center gap-1 mt-2 h-4">
                    {isModelSpeaking ? (
                      <Volume2 size={16} className="text-emerald-400 animate-pulse" />
                    ) : (
                      [1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className="w-1 bg-emerald-400 rounded-full" 
                          style={{
                            height: `${4 + (lastVolumeRef.current * 12)}px`, 
                            animation: 'pulse-glow 1s ease-in-out infinite',
                            animationDelay: `${i * 0.1}s`
                          }} 
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status & Error Messages */}
        <div className="mt-8 w-full max-w-md px-6 flex flex-col items-center z-40">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(0,0,0,0.7)] text-center">
            {status === 'connected' ? (
              isModelSpeaking ? 'Speaking...' : "I'm Listening..."
            ) : status === 'idle' ? t.voice_title : 
              status === 'error' ? 'Connection Error' : 
              status === 'offline' ? 'No Internet' :
              'Connecting...'}
          </h2>
          
          {status === 'error' && errorMessage && (
            <div className="flex flex-col gap-2 w-full max-w-sm animate-enter">
              <div className="text-red-400 text-sm font-bold bg-red-900/20 px-4 py-2 rounded-full border border-red-500/20 text-center flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
              {errorDetails && (
                <p className="text-red-300/80 text-xs bg-red-900/10 px-4 py-2 rounded-lg border border-red-500/10 text-center leading-relaxed">
                  {errorDetails}
                </p>
              )}
            </div>
          )}

          {/* Hints */}
          {(status === 'idle' || (status === 'connected' && transcripts.length === 0)) && (
            <div className="w-full max-w-sm flex flex-col gap-3 mt-6">
              {t.voice_hints.slice(0, 3).map((hint: string, i: number) => (
                <div 
                  key={i} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-emerald-100 shadow-lg flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer active:scale-[0.98] animate-enter"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare size={12} className="text-emerald-400" />
                  </div>
                  <span className="truncate">{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transcriptions */}
      <div className={clsx(
        "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-safe-bottom px-4 z-20 transition-all duration-500 flex flex-col justify-end", 
        transcripts.length === 0 ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
      style={{ minHeight: '30vh', maxHeight: '50vh' }}
      >
        <div className="flex flex-col gap-3 max-h-full overflow-y-auto hide-scrollbar mask-image-gradient pb-4">
          {transcripts.slice(-8).map((msg, i) => (
            <div 
              key={`${msg.timestamp}-${i}`}
              className={clsx(
                "p-4 rounded-2xl backdrop-blur-md border max-w-[85%] text-sm font-medium shadow-xl animate-enter", 
                msg.role === 'user' 
                  ? "self-end bg-emerald-500/20 text-emerald-100 border-emerald-500/30 rounded-tr-sm" 
                  : "self-start bg-white/10 text-slate-200 border-white/10 rounded-tl-sm"
              )}
            >
              <div className="flex items-start gap-2">
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Volume2 size={12} className="text-emerald-400" />
                  </div>
                )}
                <span className="flex-1">{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
