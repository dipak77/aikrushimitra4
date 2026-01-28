
import React, { useEffect, useRef, useState } from "react";
import { Sprout, Zap, Hexagon, Cpu } from "lucide-react";

const DURATION = 4500; // Slightly longer for cinematic feel

const easeOutExpo = (x: number) =>
  x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

export default function SplashScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [exit, setExit] = useState(false);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);

  useEffect(() => {
    const animate = (t: number) => {
      if (!start.current) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(elapsed / DURATION, 1);
      
      // Non-linear progress for realism
      const easedProgress = easeOutExpo(p) * 100;
      setProgress(easedProgress);

      if (p < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setIsReady(true);
        setTimeout(() => {
          setExit(true);
          setTimeout(onComplete, 800); // Wait for exit animation
        }, 600);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617] overflow-hidden`}
    >
      {/* --- CSS & KEYFRAMES --- */}
      <style>{`
        @keyframes drift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); filter: blur(40px); }
          50% { opacity: 0.8; transform: scale(1.2); filter: blur(50px); }
        }
        @keyframes text-reveal {
          0% { opacity: 0; transform: translateY(20px); letter-spacing: 0em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.1em; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes warp-out {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(20); opacity: 0; }
        }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. Animated Grid Floor (Cyber Farm) */}
      <div 
        className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ${exit ? 'opacity-0' : ''}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px)',
          transformOrigin: 'center 80%',
          animation: 'drift 20s linear infinite'
        }}
      />

      {/* 2. Ambient Nebula Orbs */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${exit ? 'opacity-0' : ''}`}>
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] animate-[pulse-glow_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] animate-[pulse-glow_10s_ease-in-out_infinite_reverse]" />
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center transform transition-all duration-700 ease-in-out ${exit ? 'scale-[5] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}
      >
        
        {/* CENTERPIECE: THE AI SEED */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          
          {/* Outer Rotating Ring (Data Stream) */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 border-dashed animate-[spin-slow_20s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/20 border-dashed animate-[spin-reverse_15s_linear_infinite]" />
          
          {/* Progress Circle (SVG) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
             <circle cx="128" cy="128" r="120" fill="none" stroke="#0f172a" strokeWidth="2" />
             <circle 
                cx="128" cy="128" r="120" 
                fill="none" 
                stroke="url(#splash-grad)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="754"
                strokeDashoffset={754 - (754 * (progress / 100))}
                className="transition-all duration-75 ease-linear"
             />
             <defs>
               <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#10b981" />
                 <stop offset="50%" stopColor="#22d3ee" />
                 <stop offset="100%" stopColor="#10b981" />
               </linearGradient>
             </defs>
          </svg>

          {/* Hexagon Core */}
          <div className="relative w-32 h-32 flex items-center justify-center">
             {/* Glow Behind */}
             <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
             
             {/* Hexagon Shape */}
             <div className="relative z-10 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
               <Hexagon size={100} strokeWidth={1} fill="rgba(6, 78, 59, 0.3)" className="animate-[pulse_3s_ease-in-out_infinite]" />
             </div>

             {/* Inner Icon Swapping */}
             <div className="absolute inset-0 flex items-center justify-center z-20">
               {progress < 40 && <Cpu size={40} className="text-cyan-300 animate-pulse" />}
               {progress >= 40 && progress < 80 && <Zap size={40} className="text-yellow-300 animate-bounce" />}
               {progress >= 80 && <Sprout size={48} className="text-emerald-300 animate-[bounce_1s_infinite]" strokeWidth={2.5} />}
             </div>
          </div>

          {/* Floating Particles */}
          <div className="absolute w-full h-full animate-[spin-slow_10s_linear_infinite]">
             <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[1px] shadow-[0_0_10px_white]" />
             <div className="absolute bottom-10 right-10 w-1 h-1 bg-cyan-400 rounded-full blur-[1px]" />
          </div>
        </div>

        {/* BRANDING TEXT */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight flex items-center gap-4">
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-white to-cyan-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              style={{ animation: 'text-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
            >
              AI
            </span>
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-slate-400"
              style={{ 
                animation: 'text-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                animationDelay: '0.2s',
                opacity: 0
              }}
            >
              KRUSHI
            </span>
          </h1>
          
          <div 
            className="flex items-center gap-3 overflow-hidden"
            style={{ 
              animation: 'text-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              animationDelay: '0.5s',
              opacity: 0
            }}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <span className="text-sm font-bold text-emerald-400 tracking-[0.5em] uppercase">
              Mitra
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          </div>
        </div>

        {/* STATUS INDICATOR */}
        <div className="mt-12 flex flex-col items-center gap-2 h-10">
           {!isReady ? (
             <div className="flex items-center gap-3 text-cyan-400/80 font-mono text-xs uppercase tracking-widest">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
               </span>
               <span>
                 {progress < 30 ? "Initializing Neural Net..." : 
                  progress < 60 ? "Syncing Satellite Data..." : 
                  progress < 90 ? "Calibrating Sensors..." : "Finalizing..."}
               </span>
               <span className="font-bold text-white">{Math.round(progress)}%</span>
             </div>
           ) : (
             <div className="text-emerald-400 font-bold text-sm tracking-[0.2em] animate-pulse">
               SYSTEM READY
             </div>
           )}
        </div>

      </div>
      
      {/* FINAL FLASH OVERLAY */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-700 ease-out ${exit ? 'opacity-10' : 'opacity-0'}`} />
    </div>
  );
}
