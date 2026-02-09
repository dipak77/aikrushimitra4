
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, MessageSquare } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { clsx } from 'clsx';

const VoiceAssistant = ({ lang, user, onUserUpdate, onBack }: { lang: Language, user: UserProfile, onUserUpdate: (u: UserProfile) => void, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<{role: 'user'|'model', text: string}[]>([]);
  
  const transcriptsRef = useRef<{role: 'user'|'model', text: string}[]>([]);
  const shouldStayConnectedRef = useRef(false);
  const activeSocketRef = useRef<WebSocket | null>(null); 
  
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const nextStartTimeRef = useRef<number>(0);
  
  // Enhanced Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVolumeRef = useRef(0); 
  const phaseRef = useRef(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);


  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);


  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        cleanup(true);
    };
  }, []);

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

    if (activeSocketRef.current) {
        activeSocketRef.current.close();
        activeSocketRef.current = null;
    }
    
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


  // Premium Audio Visualizer with Particle System
  const visualize = (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
      if(!containerRef.current) return;
      
      timeRef.current += 0.016; // ~60fps
      
      // Get frequency data for more sophisticated visuals
      const inputData = new Uint8Array(inputAnalyser.frequencyBinCount);
      inputAnalyser.getByteFrequencyData(inputData);
      
      const outputData = new Uint8Array(outputAnalyser.frequencyBinCount);
      outputAnalyser.getByteFrequencyData(outputData);
      
      // Calculate different frequency bands
      const bass = Array.from(inputData.slice(0, 8)).reduce((a, b) => a + b, 0) / (8 * 255);
      const mid = Array.from(inputData.slice(8, 32)).reduce((a, b) => a + b, 0) / (24 * 255);
      const treble = Array.from(inputData.slice(32, 64)).reduce((a, b) => a + b, 0) / (32 * 255);
      
      const outputBass = Array.from(outputData.slice(0, 8)).reduce((a, b) => a + b, 0) / (8 * 255);
      const outputMid = Array.from(outputData.slice(8, 32)).reduce((a, b) => a + b, 0) / (24 * 255);
      
      // Overall volume with smooth interpolation
      const targetVolume = Math.max(bass, mid, treble, outputBass, outputMid);
      lastVolumeRef.current += (targetVolume - lastVolumeRef.current) * 0.2;
      const vol = lastVolumeRef.current;

      // Update CSS variables for multi-layer animation
      containerRef.current.style.setProperty('--audio-level', vol.toString());
      containerRef.current.style.setProperty('--bass-level', bass.toString());
      containerRef.current.style.setProperty('--mid-level', mid.toString());
      containerRef.current.style.setProperty('--treble-level', treble.toString());
      containerRef.current.style.setProperty('--glow-intensity', (0.4 + vol * 1.2).toString());
      containerRef.current.style.setProperty('--time', timeRef.current.toString());
      
      // Dynamic phase rotation
      phaseRef.current += 0.015 + (vol * 0.15);
      containerRef.current.style.setProperty('--phase', phaseRef.current.toString());
      
      // Morph intensity
      const morphIntensity = 0.3 + (vol * 0.7);
      containerRef.current.style.setProperty('--morph-intensity', morphIntensity.toString());

      animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
  };


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
      inputAnalyser.smoothingTimeConstant = 0.85;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 512;
      outputAnalyser.smoothingTimeConstant = 0.85;

      source.connect(inputAnalyser);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      visualize(inputAnalyser, outputAnalyser);

      const ws = new WebSocket(getWebSocketUrl());
      activeSocketRef.current = ws;

      ws.onopen = () => {
          console.log('WebSocket connected, sending configuration...');
          
          const history = transcriptsRef.current.slice(-8);
          let contextStr = "";
          if (history.length > 0) {
            contextStr = "\n\n[PREVIOUS CONVERSATION CONTEXT - Resume from here]:";
            history.forEach(h => {
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

          ws.send(JSON.stringify({
              type: 'setup',
              config: {
                  language: lang,
                  systemInstruction: fullInstruction,
                  voiceName: 'Puck',
                  enableInputTranscription: true,
                  enableOutputTranscription: true
              }
          }));
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
                  console.error("Server Error:", msg);
                  setErrorMessage(msg.message || "Server Error");
                  setStatus('error');
                  return;
              }

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
                  setTranscripts(prev => {
                      const lastMsg = prev[prev.length - 1];
                      if (lastMsg?.role === 'user' && lastMsg?.text === userTranscript) {
                          return prev;
                      }
                      return [...prev, { role: 'user', text: userTranscript }];
                  });
              }
              const modelTranscript = msg.serverContent?.modelTurn?.parts?.[0]?.text;
              if (modelTranscript) {
                  setTranscripts(prev => {
                      const lastMsg = prev[prev.length - 1];
                      if (lastMsg?.role === 'model' && lastMsg?.text === modelTranscript) {
                          return prev;
                      }
                      return [...prev, { role: 'model', text: modelTranscript }];
                  });
              }

          } catch (e) {
              console.error("WS Parse Error", e);
          }
      };

      ws.onclose = (e) => {
           if (e.code === 1008 || e.reason?.includes("API_KEY")) {
               setErrorMessage("Server API Key Error.");
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
           console.error("WebSocket Error", err);
           if (shouldStayConnectedRef.current) handleAutoReconnect();
      };
      
      processor.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         const blob = createPCMChunk(inputData, inputCtx.sampleRate);
         
         if (activeSocketRef.current && activeSocketRef.current.readyState === WebSocket.OPEN && shouldStayConnectedRef.current) {
             activeSocketRef.current.send(JSON.stringify({
                 realtimeInput: {
                     media: {
                         mimeType: "audio/pcm;rate=16000",
                         data: blob.data
                     }
                 }
             }));
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
    <div 
      className="fixed inset-0 z-[200] bg-[#020617] h-[100dvh] w-full overflow-hidden" 
      ref={containerRef} 
      style={{
        '--audio-level': 0, 
        '--bass-level': 0,
        '--mid-level': 0,
        '--treble-level': 0,
        '--phase': 0,
        '--time': 0,
        '--glow-intensity': 0.4,
        '--morph-intensity': 0.3
      } as React.CSSProperties}
    >
       
       {/* --- PREMIUM ANIMATION STYLES --- */}
       <style>{`
          @property --gradient-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          
          /* Smooth Scrollbar */
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .mask-image-gradient {
            mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 100%);
          }
          
          /* 3D Perspective Container */
          .orb-container {
            perspective: 1200px;
            transform-style: preserve-3d;
          }
          
          /* Core Orb with Dynamic Shadows */
          .orb-core {
            transform-style: preserve-3d;
            transform: 
              scale(calc(1 + var(--audio-level) * 0.25))
              rotateX(calc(var(--bass-level) * 15deg))
              rotateY(calc(var(--phase) * 2deg));
            box-shadow: 
              0 0 calc(40px * var(--glow-intensity)) rgba(34, 197, 94, 0.6),
              0 0 calc(80px * var(--glow-intensity)) rgba(6, 182, 212, 0.4),
              0 0 calc(120px * var(--glow-intensity)) rgba(34, 197, 94, 0.2),
              inset 0 0 calc(30px * var(--glow-intensity)) rgba(255, 255, 255, 0.1);
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Liquid Plasma Layers */
          .orb-plasma {
            border-radius: 
              calc(40% + var(--morph-intensity) * 20%)
              calc(60% - var(--morph-intensity) * 10%)
              calc(70% - var(--morph-intensity) * 20%)
              calc(30% + var(--morph-intensity) * 15%) /
              calc(40% + var(--morph-intensity) * 15%)
              calc(50% - var(--morph-intensity) * 10%)
              calc(60% + var(--morph-intensity) * 10%)
              calc(50% - var(--morph-intensity) * 5%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            mix-blend-mode: screen;
            filter: blur(calc(6px + var(--audio-level) * 12px));
            opacity: calc(0.7 + var(--audio-level) * 0.3);
          }

          .plasma-1 {
            background: linear-gradient(
              calc(180deg + var(--phase) * 10deg),
              rgba(34, 197, 94, calc(0.9 + var(--bass-level) * 0.3)),
              rgba(6, 182, 212, calc(0.8 + var(--mid-level) * 0.4)),
              rgba(250, 204, 21, calc(0.6 + var(--treble-level) * 0.5))
            );
            animation: plasma-morph-1 6s ease-in-out infinite;
            transform: 
              rotate(calc(var(--phase) * 80deg))
              scale(calc(1 + var(--bass-level) * 0.2));
          }

          .plasma-2 {
            background: linear-gradient(
              calc(90deg - var(--phase) * 8deg),
              rgba(250, 204, 21, calc(0.7 + var(--mid-level) * 0.5)),
              rgba(34, 211, 238, calc(0.8 + var(--bass-level) * 0.4)),
              rgba(167, 139, 250, calc(0.6 + var(--treble-level) * 0.6))
            );
            animation: plasma-morph-2 8s ease-in-out infinite;
            transform: 
              rotate(calc(var(--phase) * -60deg))
              scale(calc(1.15 + var(--mid-level) * 0.25));
          }
          
          .plasma-3 {
            background: radial-gradient(
              circle at calc(50% + var(--bass-level) * 30%) calc(50% + var(--mid-level) * 30%),
              rgba(34, 197, 94, 0.6),
              rgba(6, 182, 212, 0.4),
              transparent 70%
            );
            animation: plasma-morph-3 10s ease-in-out infinite;
            transform: 
              rotate(calc(var(--phase) * 40deg))
              scale(calc(1.2 + var(--treble-level) * 0.3));
            filter: blur(calc(10px + var(--audio-level) * 20px));
          }
          
          /* Orbital Rings */
          .orb-ring {
            border: 2px dashed rgba(255, 255, 255, calc(0.15 + var(--audio-level) * 0.3));
            border-radius: 50%;
            animation: ring-orbit 20s linear infinite;
            transform: 
              rotate3d(1, 0.5, 0, calc(60deg + var(--bass-level) * 30deg))
              scale(calc(1 + var(--audio-level) * 0.15));
          }
          
          .orb-ring-inner {
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-top: 3px solid rgba(34, 197, 94, calc(0.8 + var(--mid-level) * 0.4));
            border-bottom: 3px solid rgba(6, 182, 212, calc(0.8 + var(--bass-level) * 0.4));
            border-radius: 50%;
            animation: ring-orbit-reverse 5s linear infinite;
            box-shadow: 
              0 0 calc(20px * var(--glow-intensity)) rgba(34, 197, 94, 0.4),
              inset 0 0 calc(15px * var(--glow-intensity)) rgba(6, 182, 212, 0.3);
          }
          
          .orb-ring-outer {
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-left: 2px solid rgba(250, 204, 21, calc(0.7 + var(--treble-level) * 0.5));
            border-right: 2px solid rgba(167, 139, 250, calc(0.7 + var(--treble-level) * 0.5));
            border-radius: 50%;
            animation: ring-orbit-tilt 15s linear infinite;
            transform: rotate3d(0.5, 1, 0, calc(45deg + var(--mid-level) * 25deg));
          }

          /* Particle Dots */
          .orb-particles {
            position: absolute;
            inset: -60px;
            pointer-events: none;
          }
          
          .particle-dot {
            position: absolute;
            width: calc(3px + var(--audio-level) * 5px);
            height: calc(3px + var(--audio-level) * 5px);
            background: radial-gradient(circle, rgba(34, 197, 94, 1), transparent 70%);
            border-radius: 50%;
            animation: particle-float 4s ease-in-out infinite;
            opacity: calc(0.4 + var(--audio-level) * 0.8);
            box-shadow: 0 0 calc(10px * var(--glow-intensity)) rgba(34, 197, 94, 0.8);
          }

          /* Keyframe Animations */
          @keyframes plasma-morph-1 {
            0%, 100% { 
              border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            }
            33% { 
              border-radius: 60% 40% 50% 50% / 50% 60% 40% 60%;
            }
            66% { 
              border-radius: 50% 50% 30% 70% / 60% 30% 70% 40%;
            }
          }

          @keyframes plasma-morph-2 {
            0%, 100% { 
              border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
            }
            33% { 
              border-radius: 50% 50% 60% 40% / 40% 70% 30% 60%;
            }
            66% { 
              border-radius: 30% 70% 70% 30% / 50% 50% 50% 50%;
            }
          }
          
          @keyframes plasma-morph-3 {
            0%, 100% { 
              border-radius: 50% 50% 50% 50% / 60% 40% 60% 40%;
            }
            50% { 
              border-radius: 40% 60% 40% 60% / 50% 50% 50% 50%;
            }
          }

          @keyframes ring-orbit {
            0% { transform: rotate3d(1, 0.5, 0, 60deg) rotate(0deg); }
            100% { transform: rotate3d(1, 0.5, 0, 60deg) rotate(360deg); }
          }

          @keyframes ring-orbit-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          
          @keyframes ring-orbit-tilt {
            0% { transform: rotate3d(0.5, 1, 0, 45deg) rotate(0deg); }
            100% { transform: rotate3d(0.5, 1, 0, 45deg) rotate(360deg); }
          }
          
          @keyframes particle-float {
            0%, 100% { 
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-20px) translateX(10px) scale(1.2);
              opacity: 1;
            }
          }
          
          @keyframes text-shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          
          .text-shimmer {
            background: linear-gradient(
              90deg,
              rgba(34, 197, 94, 0.8) 0%,
              rgba(255, 255, 255, 1) 30%,
              rgba(6, 182, 212, 0.8) 60%,
              rgba(34, 197, 94, 0.8) 100%
            );
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: text-shimmer 4s linear infinite;
          }
          
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          @keyframes float-up {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          .animate-enter {
            animation: float-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .delay-100 {
            animation-delay: 100ms;
          }
       `}</style>


       {/* 1. Premium Background with Depth */}
       <div className="absolute inset-0 bg-[#020617] pointer-events-none">
            {/* Animated Grid */}
            <div className="absolute inset-0 opacity-20" 
                 style={{
                   backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(34, 197, 94, 0.15) 1.5px, transparent 1.5px)',
                   backgroundSize: '60px 60px',
                   backgroundPosition: 'center center'
                 }}></div>
            
            {/* Gradient Orbs */}
            <div className="absolute top-[-25%] left-[-25%] w-[100vw] h-[100vw] bg-gradient-radial from-emerald-900/30 via-emerald-900/10 to-transparent blur-[120px] rounded-full animate-pulse" 
                 style={{animationDuration: '8s'}}></div>
            <div className="absolute bottom-[-15%] right-[-15%] w-[110vw] h-[110vw] bg-gradient-radial from-cyan-900/25 via-cyan-900/10 to-transparent blur-[140px] rounded-full"
                 style={{animation: 'pulse-glow 10s ease-in-out infinite'}}></div>
            <div className="absolute top-[40%] left-[50%] w-[60vw] h-[60vw] bg-gradient-radial from-yellow-900/15 via-transparent to-transparent blur-[100px] rounded-full"
                 style={{animation: 'pulse-glow 12s ease-in-out infinite', animationDelay: '2s'}}></div>
            
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                 style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`}}></div>
       </div>


       {/* 2. Enhanced Top Navigation */}
       <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-[220] bg-gradient-to-b from-[#020617]/90 via-[#020617]/60 to-transparent backdrop-blur-sm">
          <button 
             onClick={handleBack} 
             className="flex items-center gap-2.5 pl-2 pr-5 py-2.5 rounded-full bg-slate-800/90 backdrop-blur-xl border border-white/20 text-white hover:bg-slate-700 hover:border-white/30 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
          >
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowLeft size={18} />
             </div>
             <span className="font-bold text-sm tracking-wide">Back</span>
          </button>
          
          <div className={clsx("px-5 py-2 rounded-full border backdrop-blur-xl transition-all duration-500 shadow-lg", 
             status === 'connected' ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : 
             status === 'error' ? "border-red-400/40 bg-red-500/20 text-red-200" : 
             "border-white/15 bg-white/5 text-slate-300"
          )}>
             <span className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2">
                 {status === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_10px_#4ade80]"/>}
                 {status === 'idle' ? '● AI READY' : status.toUpperCase()}
             </span>
          </div>
       </div>


       {/* 3. Premium Orb Visualization (ABSOLUTE CENTERED) */}
       <div className="absolute inset-0 flex flex-col items-center justify-center w-full z-10 orb-container">
          
          <div 
            className="relative w-[340px] h-[340px] flex items-center justify-center cursor-pointer tap-highlight-transparent group"
            onClick={handleToggle}
          >
             {/* Particle System */}
             {status === 'connected' && (
               <div className="orb-particles">
                 {[...Array(8)].map((_, i) => (
                   <div 
                     key={i}
                     className="particle-dot"
                     style={{
                       top: `${50 + 40 * Math.cos((i / 8) * Math.PI * 2)}%`,
                       left: `${50 + 40 * Math.sin((i / 8) * Math.PI * 2)}%`,
                       animationDelay: `${i * 0.2}s`
                     }}
                   />
                 ))}
               </div>
             )}

             {/* Outer Orbital Rings */}
             {status === 'connected' && (
                 <>
                    <div className="absolute inset-[-60px] orb-ring-outer opacity-40"></div>
                    <div className="absolute inset-[-45px] orb-ring opacity-30"></div>
                    <div className="absolute inset-[-25px] orb-ring-inner opacity-60"></div>
                 </>
             )}

             {/* Multi-Layer Plasma */}
             <div className={clsx("absolute inset-0 plasma-1 orb-plasma transition-all duration-700", 
               status === 'idle' ? "opacity-40 scale-90" : "opacity-90")}></div>
             <div className={clsx("absolute inset-2 plasma-2 orb-plasma transition-all duration-700", 
               status === 'idle' ? "opacity-30 scale-85" : "opacity-85")}></div>
             <div className={clsx("absolute inset-6 plasma-3 orb-plasma transition-all duration-700", 
               status === 'idle' ? "opacity-20 scale-80" : "opacity-75")}></div>

             {/* Core Orb with Glass Effect */}
             <div className={clsx("absolute inset-0 m-auto w-44 h-44 rounded-full flex items-center justify-center transition-all duration-500 orb-core",
                 status === 'connected' ? "bg-black/70 border-2 border-emerald-300/40 backdrop-blur-lg" : 
                 status === 'idle' ? "bg-black/50 border border-white/15 backdrop-blur-md" :
                 "bg-black/60 border border-cyan-400/30 backdrop-blur-lg"
             )}>
                 {/* Inner Glow */}
                 <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10"></div>
                 
                 <div className="text-center z-50 flex flex-col items-center justify-center p-6 relative">
                     {status === 'idle' ? (
                         <>
                            <Mic size={42} className="text-white/95 mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] pulse-glow" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">Tap to Start</span>
                         </>
                     ) : status === 'connecting' || status === 'reconnecting' ? (
                         <>
                            <RefreshCw size={44} className="text-cyan-300 animate-spin drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200 mt-3">Connecting...</span>
                         </>
                     ) : (
                         <div className="flex flex-col items-center">
                            <h1 className="text-2xl font-black leading-tight text-shimmer drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] mb-3">
                                AI<br/>कृषी मित्र
                            </h1>
                            {/* Frequency Bars */}
                            <div className="flex items-end justify-center gap-1.5 h-5">
                                {[1,2,3,4,5,6,7].map(i => (
                                    <div 
                                      key={i} 
                                      className="w-1 bg-gradient-to-t from-emerald-400 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" 
                                      style={{
                                        height: `${8 + Math.sin(timeRef.current * 3 + i) * 12}px`,
                                        animation: `pulse-glow ${0.6 + i * 0.1}s ease-in-out infinite`,
                                        animationDelay: `${i * 0.05}s`
                                      }} 
                                    />
                                ))}
                            </div>
                         </div>
                     )}
                 </div>
             </div>
          </div>
          
          {/* Status & Hints */}
          <div className="mt-10 w-full px-6 flex flex-col items-center z-40">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                 {status === 'connected' ? (
                    transcripts.length > 0 && transcripts[transcripts.length-1].role === 'user' ? "Listening..." : "I'm Listening..."
                 ) : status === 'idle' ? t.voice_title : status === 'error' ? "Connection Error" : "Connecting..."}
              </h2>
              
              {status === 'error' && (
                  <p className="text-red-300 text-sm font-bold bg-red-500/20 px-4 py-2 rounded-xl border border-red-400/30 backdrop-blur-md shadow-lg">{errorMessage}</p>
              )}

              {/* Suggestion Pills */}
              {(status === 'idle' || (status === 'connected' && transcripts.length < 2)) && (
                 <div className="w-full max-w-[300px] flex flex-col gap-3 mt-8 animate-enter delay-100">
                    {t.voice_hints.map((hint: string, i: number) => (
                        <div key={i} className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-xl text-sm font-semibold text-emerald-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center gap-3.5 hover:bg-white/[0.12] hover:border-emerald-400/30 transition-all cursor-pointer active:scale-[0.97] group">
                            <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-400/30 transition-colors">
                                <MessageSquare size={14} className="text-emerald-300"/>
                            </div>
                            <span className="truncate">{hint}</span>
                        </div>
                    ))}
                 </div>
              )}
          </div>
       </div>


       {/* 4. Premium Transcript Overlay */}
       <div className={clsx("absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-20 pb-safe-bottom px-6 z-20 transition-all duration-700 flex flex-col justify-end min-h-[32vh]", 
           transcripts.length === 0 && "translate-y-full opacity-0"
       )}>
           <div className="flex flex-col gap-3.5 max-h-[38vh] overflow-y-auto hide-scrollbar mask-image-gradient pb-5">
                {transcripts.slice(-6).map((msg, i) => (
                   <div key={i} className={clsx("p-4 rounded-2xl backdrop-blur-xl border max-w-[85%] text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-enter leading-relaxed", 
                       msg.role === 'user' 
                         ? "self-end bg-emerald-500/25 text-emerald-50 border-emerald-400/40 rounded-tr-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                         : "self-start bg-white/[0.12] text-slate-100 border-white/20 rounded-tl-sm"
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
