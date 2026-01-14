
import React, { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence Logic
    // Phase 1: Start Animation (Enter)
    const t1 = setTimeout(() => setPhase(1), 100);
    
    // Phase 2: Loading Complete (Bar full)
    const t2 = setTimeout(() => setPhase(2), 2500);
    
    // Phase 3: Exit Animation & Navigate
    const t3 = setTimeout(() => {
        setPhase(3);
        setTimeout(onComplete, 600); // Wait for exit fade out
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    }
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* CSS Animations */}
        <style>{`
            @keyframes orbit-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0; } }
            @keyframes scan-vertical { 
                0% { top: -20%; opacity: 0; } 
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { top: 120%; opacity: 0; } 
            }
        `}</style>

        {/* --- LOGO ASSEMBLY --- */}
        <div className="relative w-36 h-36 mb-10">
            {/* 1. Ambient Background Glow */}
            <div className={`absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full transition-all duration-1000 ${phase >= 1 ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
            
            {/* 2. Outer Rotating Ring (Cyan) */}
            <div className={`absolute inset-0 border-[3px] border-cyan-400/50 rounded-full animate-[orbit-spin_4s_linear_infinite] transition-all duration-700 ease-out ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
            
            {/* 3. Inner Counter-Rotating Ring (Blue Dashed) */}
            <div className={`absolute inset-3 border-[2px] border-dashed border-blue-500/60 rounded-full animate-[orbit-spin_6s_linear_infinite_reverse] transition-all duration-700 delay-100 ease-out ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>

            {/* 4. Central Core */}
            <div className={`absolute inset-0 m-auto w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500 delay-200 cubic-bezier(0.34, 1.56, 0.64, 1) ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                
                {/* Core Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay rounded-full"></div>
                
                {/* Icon */}
                <Sprout size={48} className="text-white drop-shadow-lg relative z-10" />
                
                {/* Inner Highlight */}
                <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full blur-md"></div>
            </div>
            
            {/* 5. Scanning Light Effect */}
             <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
                 <div className="absolute left-0 right-0 h-[2px] bg-white/80 blur-[1px] shadow-[0_0_10px_white] animate-[scan-vertical_2s_ease-in-out_infinite]"></div>
             </div>
        </div>

        {/* --- TEXT REVEAL --- */}
        <div className={`text-center flex flex-col items-center transition-all duration-700 delay-300 transform ${phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Title */}
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 tracking-tighter mb-4 drop-shadow-lg leading-none">
                AI KRUSHI
            </h1>
            
            {/* Loading Bar Container */}
            <div className="h-1.5 w-48 bg-slate-800/80 rounded-full overflow-hidden relative mb-3 border border-white/5">
                {/* Animated Fill */}
                <div 
                    className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all ease-out`}
                    style={{ 
                        width: phase >= 2 ? '100%' : phase >= 1 ? '70%' : '0%',
                        transitionDuration: phase >= 2 ? '500ms' : '2000ms'
                    }}
                ></div>
            </div>

            {/* Status Text */}
            <div className="h-6 overflow-hidden relative">
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
                    {phase === 0 ? "Initializing..." : phase === 1 ? "Loading Modules..." : "System Ready"}
                </p>
            </div>
        </div>

    </div>
  );
};
