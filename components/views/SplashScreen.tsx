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
        @keyframes orb-float { 
            0%, 100% { transform: translate(0, 0) scale(1); } 
            33% { transform: translate(20px, -30px) scale(1.1); }
            66% { transform: translate(-15px, -20px) scale(0.95); }
        }
        @keyframes orb-pulse { 
            0%, 100% { opacity: 0.6; transform: scale(1); } 
            50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes particle-rise { 
            0% { transform: translateY(0) scale(1); opacity: 0; } 
            20% { opacity: 1; }
            100% { transform: translateY(-200px) scale(0); opacity: 0; } 
        }
        @keyframes ring-expand { 
            0% { transform: scale(0.8); opacity: 0; } 
            50% { opacity: 0.4; }
            100% { transform: scale(2); opacity: 0; } 
        }
        @keyframes depth-wave { 
            0%, 100% { transform: translateZ(0) rotateX(0deg); } 
            50% { transform: translateZ(50px) rotateX(5deg); }
        }
        @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(52,211,153,0.3), 0 0 40px rgba(6,182,212,0.2); }
            50% { box-shadow: 0 0 40px rgba(52,211,153,0.6), 0 0 80px rgba(6,182,212,0.4); }
        }
      `}</style>

      {/* 1. PARALLAX BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,#020617_60%)]" style={{ perspective: '1000px' }}>
          
          {/* Floating Energy Orbs - Premium 3D Effect */}
          <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                  <div key={`orb-${i}`} 
                       className="absolute rounded-full blur-xl"
                       style={{ 
                           width: `${Math.random() * 150 + 100}px`,
                           height: `${Math.random() * 150 + 100}px`,
                           top: `${Math.random() * 80}%`, 
                           left: `${Math.random() * 100}%`,
                           background: `radial-gradient(circle at 30% 30%, ${i % 2 === 0 ? 'rgba(52,211,153,0.3)' : 'rgba(6,182,212,0.3)'}, transparent 70%)`,
                           animation: `orb-float ${Math.random() * 8 + 6}s infinite ease-in-out ${Math.random() * 3}s`,
                           filter: 'blur(40px)',
                           mixBlendMode: 'screen'
                       }}
                  >
                      <div className="absolute inset-0 rounded-full"
                           style={{
                               background: `radial-gradient(circle at 50% 50%, ${i % 2 === 0 ? 'rgba(52,211,153,0.4)' : 'rgba(6,182,212,0.4)'}, transparent 60%)`,
                               animation: `orb-pulse ${Math.random() * 3 + 2}s infinite ease-in-out`
                           }}
                      />
                  </div>
              ))}
          </div>

          {/* Particle System */}
          <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                  <div key={`particle-${i}`}
                       className="absolute w-1 h-1 bg-emerald-400/60 rounded-full"
                       style={{ 
                           left: `${Math.random() * 100}%`,
                           bottom: '0%',
                           animation: `particle-rise ${Math.random() * 4 + 3}s infinite linear ${Math.random() * 2}s`,
                           boxShadow: '0 0 4px rgba(52,211,153,0.8)'
                       }}
                  />
              ))}
          </div>

          {/* Stars with depth */}
          {[...Array(60)].map((_, i) => (
             <Star key={i} size={Math.random() * 4 + 1} 
                   className="absolute text-white/40" 
                   style={{ 
                       top: `${Math.random() * 60}%`, 
                       left: `${Math.random() * 100}%`,
                       animation: `twinkle ${Math.random() * 3 + 1}s infinite ease-in-out`,
                       filter: `blur(${Math.random() * 1}px)`,
                       transform: `translateZ(${Math.random() * 50}px)`
                   }} 
             />
          ))}
          
          {/* Moon with atmospheric glow */}
          <div className="absolute top-10 right-10 text-slate-400 opacity-20 transform rotate-12">
               <div className="relative">
                   <Moon size={64} fill="currentColor" />
                   <div className="absolute inset-0 blur-2xl bg-slate-400/20 rounded-full scale-150"></div>
               </div>
          </div>

          {/* Silhouette Mountains with depth */}
          <div className="absolute bottom-48 left-0 right-0 h-32 opacity-20" style={{ transform: 'translateZ(-100px)' }}>
               <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                   <path fill="#0f172a" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,213.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
               </svg>
          </div>
      </div>

      {/* 2. MAIN STAGE */}
      <div className="relative w-full max-w-5xl h-80 flex items-end justify-center z-10 px-4 mb-20 overflow-visible">
          
          {/* === LOGO REVEAL (Behind Tractor) === */}
          <div className="absolute top-20 left-0 right-0 text-center z-0">
               {/* Animated Rings Behind Logo */}
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                   {[...Array(3)].map((_, i) => (
                       <div key={`ring-${i}`}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-500/20"
                            style={{
                                width: '400px',
                                height: '400px',
                                animation: `ring-expand ${3 + i}s infinite ease-out ${i * 0.8}s`
                            }}
                       />
                   ))}
               </div>

               {/* Background/Dim Text with depth */}
               <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-800/50 absolute left-0 right-0 mx-auto"
                   style={{ 
                       textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                       transform: 'translateZ(-20px)'
                   }}
               >
                   AI KRUSHI
               </h1>
               
               {/* Foreground/Lit Text (Masked by Progress) with shimmer */}
               <div className="absolute left-0 right-0 mx-auto overflow-hidden transition-all duration-75"
                    style={{ 
                        clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                        transform: 'translateZ(10px)'
                    }}
               >
                   <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text relative"
                       style={{
                           backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22d3ee 50%, #34d399 100%)',
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 3s infinite linear',
                           filter: 'drop-shadow(0 0 30px rgba(52,211,153,0.6)) drop-shadow(0 0 60px rgba(6,182,212,0.4))'
                       }}
                   >
                       AI KRUSHI
                   </h1>
               </div>

               {/* Subtitle with entrance */}
               <div className="absolute top-16 md:top-24 left-0 right-0 mt-2 flex justify-center">
                    <span className={clsx(
                        "text-sm md:text-lg font-bold uppercase tracking-[0.5em] text-emerald-500/80 transition-all duration-1000",
                        progress > 60 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{
                        textShadow: '0 0 20px rgba(52,211,153,0.5)'
                    }}
                    >
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
                                 "text-emerald-500 origin-bottom transition-all duration-300",
                                 isGrown ? "animate-[grow-wheat_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" : "opacity-0 scale-y-0"
                             )}
                             style={{
                                 filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                 transform: `translateZ(${i % 2 === 0 ? '5px' : '0px'})`
                             }}
                          />
                          {/* Ground sparkle when wheat grows */}
                          {isGrown && (
                              <div className="absolute bottom-0 w-2 h-2 bg-emerald-400 rounded-full blur-sm"
                                   style={{
                                       animation: 'orb-pulse 2s infinite ease-in-out',
                                       animationDelay: `${i * 0.1}s`
                                   }}
                              />
                          )}
                      </div>
                  )
              })}
          </div>

          {/* === SOIL TRACK === */}
          <div className="absolute bottom-5 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 z-0 overflow-hidden">
               {/* Progress glow track */}
               <div className="h-full relative"
                    style={{ width: `${progress}%` }}
               >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-cyan-500"
                        style={{
                            boxShadow: '0 0 20px #22d3ee, 0 0 40px #34d399',
                            filter: 'blur(1px)'
                        }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400" />
                   
                   {/* Moving light particle on track */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"
                        style={{
                            boxShadow: '0 0 10px #fff, 0 0 20px #22d3ee, 0 0 30px #34d399',
                            animation: 'orb-pulse 0.5s infinite ease-in-out'
                        }}
                   />
               </div>
          </div>

          {/* === THE TRACTOR RIG === */}
          <div 
             className="absolute bottom-5 z-20 transition-transform duration-75 ease-linear will-change-transform"
             style={{ 
                 left: `${progress}%`,
                 transform: 'translateX(-65%)',
                 filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
             }}
          >
              {/* 1. Headlight Beam - Enhanced */}
              <div className="absolute bottom-8 left-10 w-[400px] h-[150px] origin-bottom-left transform rotate-[-5deg]"
                   style={{ 
                       background: 'linear-gradient(90deg, rgba(224,242,254,0.4) 0%, rgba(6,182,212,0.2) 30%, transparent 100%)',
                       clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 100%)',
                       opacity: progress < 98 ? 1 : 0,
                       filter: 'blur(8px)',
                       mixBlendMode: 'screen'
                   }}
              >
                  <div className="absolute inset-0"
                       style={{ 
                           background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(6,182,212,0.3) 20%, transparent 60%)',
                           clipPath: 'polygon(0% 47%, 80% 10%, 80% 90%, 0% 100%)',
                       }}
                  />
              </div>
              
              {/* 2. Exhaust Smoke - Enhanced */}
              <div className="absolute -top-12 right-0">
                 {[...Array(8)].map((_, i) => (
                     <div key={i} 
                          className="absolute w-3 h-3 rounded-full"
                          style={{ 
                              background: `radial-gradient(circle, rgba(148,163,184,${0.5 - i * 0.05}) 0%, transparent 70%)`,
                              animation: `exhaust-puff ${2 + i * 0.2}s infinite linear`,
                              animationDelay: `${i * 0.3}s`,
                              filter: 'blur(3px)'
                          }}
                     ></div>
                 ))}
              </div>

              {/* 3. Energy Field Around Tractor */}
              <div className="absolute inset-0 -m-8">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-[ring-expand_2s_infinite_ease-out]" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-[ring-expand_2s_infinite_ease-out] delay-500" />
              </div>

              {/* 4. Tractor Body */}
              <div className="relative animate-[chassis-bounce_0.3s_infinite_linear]">
                  {/* Main Icon with enhanced glow */}
                  <div className="relative text-cyan-400"
                       style={{
                           filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.6)) drop-shadow(0 0 30px rgba(52,211,153,0.4))'
                       }}
                  >
                     <Tractor size={96} strokeWidth={1} className="fill-[#020617]" />
                     
                     {/* Cabin Glow - Enhanced */}
                     <div className="absolute top-[28px] left-[32px] w-[24px] h-[20px] rounded-sm overflow-hidden">
                         <div className="absolute inset-0 bg-cyan-300/30 blur-sm" />
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 to-transparent" />
                     </div>

                     {/* Headlight glow points */}
                     <div className="absolute top-[45px] left-[10px] w-2 h-2 bg-cyan-100 rounded-full"
                          style={{
                              boxShadow: '0 0 10px #22d3ee, 0 0 20px #06b6d4',
                              animation: 'glow-pulse 2s infinite ease-in-out'
                          }}
                     />
                  </div>

                  {/* Rear Wheel (Big) - Enhanced */}
                  <div className="absolute bottom-2 right-4 w-11 h-11 rounded-full overflow-hidden"
                       style={{
                           background: 'radial-gradient(circle at 30% 30%, #1e293b, #020617)',
                           animation: 'wheel-spin 1.5s linear infinite'
                       }}
                  >
                      <div className="absolute inset-0 border-[3px] border-emerald-400 border-dashed rounded-full"
                           style={{
                               boxShadow: 'inset 0 0 15px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.4)',
                               animation: 'glow-pulse 1.5s infinite ease-in-out'
                           }}
                      />
                      <div className="absolute inset-0 m-auto w-4 h-4 bg-emerald-500/30 rounded-full blur-sm" />
                      <div className="absolute inset-0 m-auto w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>
                  
                  {/* Front Wheel (Small) - Enhanced */}
                  <div className="absolute bottom-2 left-3 w-8 h-8 rounded-full overflow-hidden"
                       style={{
                           background: 'radial-gradient(circle at 30% 30%, #1e293b, #020617)',
                           animation: 'wheel-spin 0.8s linear infinite'
                       }}
                  >
                      <div className="absolute inset-0 border-[3px] border-emerald-400 border-dashed rounded-full"
                           style={{
                               boxShadow: 'inset 0 0 12px rgba(52,211,153,0.3), 0 0 15px rgba(52,211,153,0.4)',
                               animation: 'glow-pulse 1.5s infinite ease-in-out 0.3s'
                           }}
                      />
                      <div className="absolute inset-0 m-auto w-2 h-2 bg-emerald-500/30 rounded-full blur-sm" />
                      <div className="absolute inset-0 m-auto w-1 h-1 bg-emerald-400 rounded-full" />
                  </div>

                  {/* Wheel dust particles */}
                  <div className="absolute bottom-0 right-8">
                      {[...Array(5)].map((_, i) => (
                          <div key={i}
                               className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
                               style={{
                                   animation: `particle-rise ${1 + i * 0.2}s infinite linear ${i * 0.1}s`,
                                   left: `${i * 3}px`
                               }}
                          />
                      ))}
                  </div>
              </div>
          </div>

      </div>

      {/* 3. LOADING STATUS (Bottom) */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 z-30">
          {/* Status indicator with orb */}
          <div className="flex items-center gap-3 relative">
              {/* Pulsing orb background */}
              <div className="absolute left-0 w-5 h-5 bg-emerald-400 rounded-full blur-md opacity-50 animate-[orb-pulse_1.5s_infinite_ease-in-out]" />
              
              <Sparkles size={18} className="text-emerald-400 relative z-10" 
                        style={{
                            filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.6))',
                            animation: 'orb-float 3s infinite ease-in-out'
                        }}
              />
              <p className="text-emerald-400 font-mono text-xs md:text-sm uppercase tracking-[0.25em] font-bold relative"
                 style={{
                     textShadow: '0 0 10px rgba(52,211,153,0.5)'
                 }}
              >
                  {progress < 30 ? "Initializing AI..." : progress < 60 ? "Loading Market Data..." : progress < 90 ? "Calibrating Sensors..." : "Ready"}
              </p>
          </div>
          
          {/* Progress bar with enhanced effects */}
          <div className="relative w-72 md:w-96">
              {/* Glow layer */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
              
              {/* Bar container */}
              <div className="relative w-full h-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full overflow-hidden border border-emerald-500/20"
                   style={{
                       boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                   }}
              >
                  {/* Progress fill */}
                  <div className="h-full relative transition-all duration-100 ease-out" 
                       style={{ width: `${progress}%` }}
                  >
                      {/* Main gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"
                           style={{
                               backgroundSize: '200% 100%',
                               animation: 'shimmer 2s infinite linear'
                           }}
                      />
                      
                      {/* Highlight overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0"
                           style={{
                               boxShadow: '0 0 20px rgba(52,211,153,0.6), 0 0 40px rgba(6,182,212,0.4)',
                               filter: 'blur(2px)'
                           }}
                      />

                      {/* Leading edge spark */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"
                           style={{
                               boxShadow: '0 0 15px #fff, 0 0 30px #22d3ee, 0 0 45px #34d399',
                               animation: 'orb-pulse 0.8s infinite ease-in-out'
                           }}
                      />
                  </div>

                  {/* Shimmer overlay on track */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                       style={{
                           backgroundSize: '200% 100%',
                           animation: 'shimmer 3s infinite linear'
                       }}
                  />
              </div>

              {/* Percentage display */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 font-mono text-xs font-bold"
                   style={{
                       textShadow: '0 0 10px rgba(52,211,153,0.5)'
                   }}
              >
                  {Math.round(progress)}%
              </div>
          </div>
      </div>

    </div>
  );
};

export default SplashScreen;