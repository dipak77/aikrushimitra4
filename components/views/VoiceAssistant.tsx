
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, WifiOff, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { getGenAIKey } from '../../services/geminiService';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';

const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  // Extended state for robustness
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<{role: 'user'|'model', text: string}[]>([]);
  
  // Ref to keep track of transcripts for reconnection context without dependency loops
  const transcriptsRef = useRef<{role: 'user'|'model', text: string}[]>([]);

  // Robust Session Management
  const shouldStayConnectedRef = useRef(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSessionRef = useRef<any>(null); 
  
  // Audio Nodes
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  
  const nextStartTimeRef = useRef<number>(0);
  
  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVolumeRef = useRef(0); 
  const phaseRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  // Auto-scroll for transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup Function
  const cleanup = (fullyStop: boolean = false) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
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

    if (activeSessionRef.current) {
        try { activeSessionRef.current.close(); } catch(e) {}
        activeSessionRef.current = null;
    }
    sessionPromiseRef.current = null;
    
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

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

  // Advanced Visualizer
  const visualize = (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
      if(!containerRef.current) return;
      
      // 1. Get Audio Levels
      const inputData = new Uint8Array(inputAnalyser.frequencyBinCount);
      inputAnalyser.getByteFrequencyData(inputData);
      let inputSum = 0;
      for(let i = 0; i < inputData.length; i++) inputSum += inputData[i];
      const inputAvg = inputSum / inputData.length;

      const outputData = new Uint8Array(outputAnalyser.frequencyBinCount);
      outputAnalyser.getByteFrequencyData(outputData);
      let outputSum = 0;
      for(let i = 0; i < outputData.length; i++) outputSum += outputData[i];
      const outputAvg = outputSum / outputData.length;

      // 2. Smooth the volume value (Linear Interpolation)
      const maxAvg = Math.max(inputAvg, outputAvg);
      const targetVolume = maxAvg / 255;
      lastVolumeRef.current += (targetVolume - lastVolumeRef.current) * 0.15; // Smooth transition
      const vol = lastVolumeRef.current;

      // 3. Update CSS Variables for high-performance animation
      // We control scale, glow intensity, and morph speed via CSS vars
      containerRef.current.style.setProperty('--audio-level', vol.toString());
      containerRef.current.style.setProperty('--glow-opacity', (0.3 + vol * 0.7).toString());
      
      // Phase determines the rotation/morph offset
      phaseRef.current += 0.02 + (vol * 0.1); // Spin faster on higher volume
      containerRef.current.style.setProperty('--phase', phaseRef.current.toString());

      animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
  };

  const connect = async () => {
    if (!navigator.onLine) {
        setStatus('offline');
        return;
    }

    const apiKey = getGenAIKey();
    if (!apiKey) {
      setStatus('error');
      setErrorMessage("API Key Not Found.");
      return;
    }

    cleanup(false); 
    shouldStayConnectedRef.current = true; 
    setErrorMessage('');
    setStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
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
      inputAnalyser.fftSize = 512; 
      inputAnalyser.smoothingTimeConstant = 0.8;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 512;
      outputAnalyser.smoothingTimeConstant = 0.8;

      source.connect(inputAnalyser);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      visualize(inputAnalyser, outputAnalyser);

      const ai = new GoogleGenAI({ apiKey });

      // --- CONTEXT RETENTION LOGIC ---
      // We inject previous turns into system instruction to "restore" context
      const history = transcriptsRef.current.slice(-8); // Keep last ~8 turns
      let contextStr = "";
      if (history.length > 0) {
        contextStr = "\n\n[PREVIOUS CONVERSATION CONTEXT - Resume from here]:";
        history.forEach(h => {
            contextStr += `\n${h.role === 'user' ? 'User' : 'You'}: ${h.text}`;
        });
      }
      
      const baseInstruction = "You are AI Krushi Mitra, a helpful agricultural expert assistant for Indian farmers. Speak naturally in Marathi, Hindi or English as per the user's language preference. Keep responses concise, practical, and encouraging.";
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
              if (audioData) {
                 const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                 const sourceNode = outputCtx.createBufferSource();
                 sourceNode.buffer = buffer;
                 sourceNode.connect(outputAnalyser);
                 sourceNode.connect(outputCtx.destination);
                 
                 const currentTime = outputCtx.currentTime;
                 if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
                 sourceNode.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += buffer.duration;
              }

              const userTranscript = msg.serverContent?.inputTranscription?.text;
              if (userTranscript) {
                  setTranscripts(prev => [...prev, { role: 'user', text: userTranscript }]);
              }
           },
           onclose: (e) => {
               if (e.code === 1008 || e.reason?.includes("leaked")) {
                   setErrorMessage("API Key Revoked.");
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
           },
           onerror: (err) => {
               if (shouldStayConnectedRef.current) handleAutoReconnect();
           }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      sessionPromise.then(sess => {
          activeSessionRef.current = sess;
      }).catch(e => {
          handleAutoReconnect();
      });
      
      processor.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         const blob = createPCMChunk(inputData, inputCtx.sampleRate); 
         if (sessionPromiseRef.current) {
             sessionPromiseRef.current.then(session => {
                 if (session === activeSessionRef.current && shouldStayConnectedRef.current) {
                    session.sendRealtimeInput({ media: blob });
                 }
             }).catch(() => {});
         }
      };

    } catch(e: any) { 
        setErrorMessage(e.message || "Failed to connect microphone");
        setStatus('error');
    }
  };

  const handleToggle = () => {
      triggerHaptic();
      if (status === 'idle' || status === 'error') {
          // Only clear if explicitly starting fresh, not retrying
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

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col h-[100dvh] w-full" ref={containerRef} style={{'--audio-level': 0, '--phase': 0} as React.CSSProperties}>
       
       {/* --- Advanced Animation CSS --- */}
       <style>{`
          @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          
          .orb-container {
            perspective: 1000px;
          }
          
          .orb-core {
            box-shadow: 0 0 calc(30px + var(--audio-level) * 50px) rgba(34, 197, 94, 0.4);
            transform: scale(calc(1 + var(--audio-level) * 0.2));
            transition: transform 0.1s linear;
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
            transform: rotate(calc(var(--phase) * 50deg));
          }

          .plasma-2 {
            background: linear-gradient(90deg, rgba(250, 204, 21, 0.6), rgba(34, 211, 238, 0.6));
            animation: liquid-spin 12s linear infinite reverse;
            transform: rotate(calc(var(--phase) * -30deg)) scale(1.1);
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
            0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
            33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
            66% { border-radius: 30% 70% 70% 30% / 80% 20% 80% 20%; }
            100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
          }

          @keyframes ring-spin {
            0% { transform: rotate3d(0, 0, 1, 0deg); }
            100% { transform: rotate3d(0, 0, 1, 360deg); }
          }
          
          @keyframes text-shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          
          .text-shimmer {
            background-size: 200% auto;
            animation: text-shimmer 3s linear infinite;
          }
       `}</style>

       {/* 1. Deep Space Background with Grid */}
       <div className="absolute inset-0 bg-[#020617] pointer-events-none">
            <div className="absolute inset-0 opacity-20" 
                 style={{backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-emerald-900/20 blur-[100px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] bg-cyan-900/20 blur-[120px] rounded-full"></div>
       </div>

       {/* 2. Top Navigation Bar */}
       <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-[220] bg-gradient-to-b from-[#020617]/80 to-transparent">
          <button 
             onClick={handleBack} 
             className="flex items-center gap-2 pl-2 pr-5 py-2.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/20 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg group"
          >
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                <ArrowLeft size={18} />
             </div>
             <span className="font-bold text-sm tracking-wide">Back to Dashboard</span>
          </button>
          
          <div className={clsx("px-4 py-1.5 rounded-full border backdrop-blur-md transition-colors duration-500 shadow-lg", 
             status === 'connected' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : 
             status === 'error' ? "border-red-500/30 bg-red-500/10 text-red-300" : 
             "border-white/10 bg-white/5 text-slate-300"
          )}>
             <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 {status === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#4ade80]"/>}
                 {status === 'idle' ? 'AI Ready' : status}
             </span>
          </div>
       </div>

       {/* 3. Main Centered Content */}
       <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 orb-container">
          
          {/* The Orb */}
          <div 
            className="relative w-[320px] h-[320px] flex items-center justify-center cursor-pointer tap-highlight-transparent group"
            onClick={handleToggle}
          >
             {status === 'connected' && (
                 <>
                    <div className="absolute inset-[-40px] orb-ring opacity-30 border-emerald-500/50"></div>
                    <div className="absolute inset-[-20px] orb-ring-inner opacity-50"></div>
                 </>
             )}

             <div className={clsx("absolute inset-0 plasma-1 orb-plasma transition-opacity duration-700", status === 'idle' ? "opacity-30 scale-90" : "opacity-100")}></div>
             <div className={clsx("absolute inset-4 plasma-2 orb-plasma opacity-80 transition-opacity duration-700", status === 'idle' ? "opacity-20 scale-90" : "opacity-80")}></div>

             <div className={clsx("absolute inset-0 m-auto w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500",
                 status === 'connected' ? "bg-black/60 orb-core border border-emerald-400/30 backdrop-blur-sm" : "bg-black/40 border border-white/10 backdrop-blur-sm"
             )}>
                 <div className="text-center z-50 flex flex-col items-center justify-center p-4">
                     {status === 'idle' ? (
                         <>
                            <Mic size={36} className="text-white/90 mb-2 drop-shadow-md animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Tap to Start</span>
                         </>
                     ) : status === 'connecting' || status === 'reconnecting' ? (
                         <RefreshCw size={40} className="text-emerald-400 animate-spin" />
                     ) : (
                         <div className="flex flex-col items-center">
                            <h1 className="text-xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-cyan-200 text-shimmer drop-shadow-lg">
                                AI<br/>कृषी मित्र
                            </h1>
                            <div className="flex items-center justify-center gap-1 mt-2 h-4">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" 
                                         style={{
                                             height: `${Math.max(4, Math.random() * 16)}px`, 
                                             animationDuration: `${0.5 + Math.random() * 0.5}s`
                                         }} 
                                    />
                                ))}
                            </div>
                         </div>
                     )}
                 </div>
             </div>
          </div>
          
          {/* Status Text & Suggestions */}
          <div className="mt-8 w-full px-6 flex flex-col items-center z-40">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                 {status === 'connected' ? (
                    transcripts.length > 0 && transcripts[transcripts.length-1].role === 'user' ? "Listening..." : "I'm Listening..."
                 ) : status === 'idle' ? t.voice_title : status === 'error' ? "Connection Error" : "Connecting..."}
              </h2>

              {/* Suggestions Chips (Vertical List) */}
              {(status === 'idle' || (status === 'connected' && transcripts.length < 2)) && (
                 <div className="w-full max-w-[280px] flex flex-col gap-3 mt-6 animate-enter delay-100">
                    {t.voice_hints.map((hint: string, i: number) => (
                        <div key={i} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-emerald-100 shadow-lg flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer active:scale-[0.98]">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <MessageSquare size={12} className="text-emerald-400"/>
                            </div>
                            <span className="truncate">{hint}</span>
                        </div>
                    ))}
                 </div>
              )}
          </div>
       </div>

       {/* 4. Live Transcription Overlay */}
       <div className={clsx("absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-16 pb-safe-bottom px-6 z-20 transition-transform duration-500 flex flex-col justify-end min-h-[30vh]", 
           transcripts.length === 0 && "translate-y-full opacity-0"
       )}>
           <div className="flex flex-col gap-3 max-h-[35vh] overflow-y-auto hide-scrollbar mask-image-gradient pb-4">
                {transcripts.slice(-6).map((msg, i) => (
                   <div key={i} className={clsx("p-4 rounded-2xl backdrop-blur-md border max-w-[90%] text-sm font-medium shadow-lg animate-enter", 
                       msg.role === 'user' ? "self-end bg-emerald-500/20 text-emerald-100 border-emerald-500/30 rounded-tr-sm" : "self-start bg-white/10 text-slate-200 border-white/10 rounded-tl-sm"
                   )}>
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
