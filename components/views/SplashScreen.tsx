
import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Tractor, Wheat, Cloud, Star, Sparkles, Moon } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  // Animation Loop
  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const runtime = time - startTimeRef.current;
    const duration = 4000; // 4 seconds total duration for premium feel

    const p = Math.min(runtime / duration, 1);
    
    // Ease out quart for smooth finish
    const ease = 1 - Math.pow(1 - p, 4);
    
    setProgress(p * 100);

    if (p < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 800);
      }, 500);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className={clsx(
        'fixed inset-0 z-[9999] bg-[#020617] overflow-hidden flex flex-col items-center justify-center transition-all duration-1000',
        isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
      )}
    >
      <style>{`
        @keyframes wheel-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes chassis-bounce { 
            0%, 100% { transform: translateY(0) rotate(0deg); } 
            25% { transform: translateY(-1px) rotate(0.5deg); }
            75% { transform: translateY(1px) rotate(-0.5deg); }
        }
        @keyframes exhaust-puff { 
            0% { transform: translate(0,0) scale(0.5); opacity: 0.8; } 
            100% { transform: translate(-60px, -40px) scale(3); opacity: 0; } 
        }
        @keyframes grow-wheat { 
            0% { transform: scaleY(0); opacity: 0; } 
            60% { transform: scaleY(1.2); opacity: 1; }
            100% { transform: scaleY(1); opacity: 1; } 
        }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>

      {/* 1. PARALLAX BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,#020617_60%)]">
          {/* Stars */}
          {[...Array(40)].map((_, i) => (
             <Star key={i} size={Math.random() * 3 + 1} 
                   className="absolute text-white/40" 
                   style={{ 
                       top: `${Math.random() * 60}%`, 
                       left: `${Math.random() * 100}%`,
                       animation: `twinkle ${Math.random() * 3 + 1}s infinite ease-in-out`
                   }} 
             />
          ))}
          
          {/* Moon */}
          <div className="absolute top-10 right-10 text-slate-400 opacity-20 transform rotate-12">
               <Moon size={64} fill="currentColor" />
          </div>

          {/* Silhouette Mountains (CSS Shapes) */}
          <div className="absolute bottom-48 left-0 right-0 h-32 opacity-20">
               <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                   <path fill="#0f172a" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,213.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
               </svg>
          </div>
      </div>

      {/* 2. MAIN STAGE */}
      <div className="relative w-full max-w-5xl h-80 flex items-end justify-center z-10 px-4 mb-20 overflow-visible">
          
          {/* === LOGO REVEAL (Behind Tractor) === */}
          <div className="absolute top-20 left-0 right-0 text-center z-0">
               {/* Background/Dim Text */}
               <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-800/50 absolute left-0 right-0 mx-auto">
                   AI KRUSHI
               </h1>
               
               {/* Foreground/Lit Text (Masked by Progress) */}
               <div className="absolute left-0 right-0 mx-auto overflow-hidden transition-all duration-75"
                    style={{ 
                        clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`
                    }}
               >
                   <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-200 to-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                       AI KRUSHI
                   </h1>
               </div>

               {/* Subtitle */}
               <div className="absolute top-16 md:top-24 left-0 right-0 mt-2 flex justify-center">
                    <span className={clsx(
                        "text-sm md:text-lg font-bold uppercase tracking-[0.5em] text-emerald-500/80 transition-opacity duration-1000",
                        progress > 60 ? "opacity-100" : "opacity-0"
                    )}>
                        Mitra
                    </span>
               </div>
          </div>

          {/* === CROP FIELD (Bottom Layer) === */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-between px-2 md:px-10 pointer-events-none z-10">
              {[...Array(24)].map((_, i) => {
                  const trigger = (i / 24) * 100;
                  const isGrown = progress > trigger;
                  return (
                      <div key={i} className="relative w-6 md:w-10 h-10 md:h-16 flex items-end justify-center">
                          <Wheat 
                             size={40} 
                             strokeWidth={1.5}
                             className={clsx(
                                 "text-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] origin-bottom transition-all duration-300",
                                 isGrown ? "animate-[grow-wheat_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" : "opacity-0 scale-y-0"
                             )}
                          />
                      </div>
                  )
              })}
          </div>

          {/* === SOIL TRACK === */}
          <div className="absolute bottom-5 left-0 right-0 h-[2px] bg-white/5 z-0">
               <div className="h-full bg-gradient-to-r from-transparent via-emerald-600 to-cyan-500 shadow-[0_0_20px_#22d3ee] transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
               ></div>
          </div>

          {/* === THE TRACTOR RIG === */}
          <div 
             className="absolute bottom-5 z-20 transition-transform duration-75 ease-linear will-change-transform"
             style={{ 
                 left: `${progress}%`,
                 transform: 'translateX(-65%)' // Anchor point
             }}
          >
              {/* 1. Headlight Beam */}
              <div className="absolute bottom-8 left-10 w-[300px] h-[120px] bg-gradient-to-r from-cyan-100/30 via-cyan-400/5 to-transparent origin-bottom-left transform rotate-[-5deg] opacity-0 animate-[beam-flicker_0.1s_infinite]"
                   style={{ 
                       clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 100%)',
                       opacity: progress < 98 ? 1 : 0
                   }}
              ></div>
              
              {/* 2. Exhaust Smoke */}
              <div className="absolute -top-12 right-0">
                 {[...Array(5)].map((_, i) => (
                     <div key={i} 
                          className="absolute w-2 h-2 bg-slate-400/30 rounded-full blur-sm"
                          style={{ 
                              animation: `exhaust-puff 2s infinite linear`,
                              animationDelay: `${i * 0.4}s`
                          }}
                     ></div>
                 ))}
              </div>

              {/* 3. Tractor Body */}
              <div className="relative animate-[chassis-bounce_0.3s_infinite_linear]">
                  {/* Main Icon */}
                  <div className="relative text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                     <Tractor size={96} strokeWidth={1} className="fill-[#020617]" />
                     
                     {/* Cabin Glow */}
                     <div className="absolute top-[28px] left-[32px] w-[24px] h-[20px] bg-cyan-300/10 rounded-sm blur-[1px]"></div>
                  </div>

                  {/* Rear Wheel (Big) */}
                  <div className="absolute bottom-2 right-4 w-11 h-11 bg-[#020617] rounded-full border-[3px] border-emerald-400 border-dashed animate-[wheel-spin_1.5s_linear_infinite] shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <div className="absolute inset-0 m-auto w-4 h-4 bg-emerald-900/50 rounded-full"></div>
                  </div>
                  
                  {/* Front Wheel (Small) */}
                  <div className="absolute bottom-2 left-3 w-8 h-8 bg-[#020617] rounded-full border-[3px] border-emerald-400 border-dashed animate-[wheel-spin_0.8s_linear_infinite] shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <div className="absolute inset-0 m-auto w-2 h-2 bg-emerald-900/50 rounded-full"></div>
                  </div>
              </div>
          </div>

      </div>

      {/* 3. LOADING STATUS (Bottom) */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 z-30">
          <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400 animate-spin-slow" />
              <p className="text-emerald-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">
                  {progress < 30 ? "Initializing AI..." : progress < 60 ? "Loading Market Data..." : progress < 90 ? "Calibrating Sensors..." : "Ready"}
              </p>
          </div>
          
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_#22d3ee] transition-all duration-100 ease-out" 
                   style={{ width: `${progress}%` }}
              ></div>
          </div>
      </div>

    </div>
  );
};
