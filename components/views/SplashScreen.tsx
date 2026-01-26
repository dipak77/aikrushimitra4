import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Tractor, Wheat, Star, Sparkles, Moon, Zap } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const runtime = time - startTimeRef.current;
    const duration = 4000;

    const p = Math.min(runtime / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    
    setProgress(ease * 100);

    if (p < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 400);
    }
  };

  useEffect(() => {
    // Trigger logo animation immediately
    setTimeout(() => setLogoVisible(true), 100);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div 
      className={clsx(
        'fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #020617 100%)',
        transition: 'opacity 800ms ease-out'
      }}
    >
      <style>{`
        @keyframes wheel-spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        
        @keyframes chassis-bounce { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-2px); }
        }
        
        @keyframes exhaust { 
          0% { transform: translate(0,0) scale(0.4); opacity: 0.7; } 
          100% { transform: translate(-70px, -50px) scale(3.5); opacity: 0; } 
        }
        
        @keyframes grow-wheat { 
          0% { transform: scaleY(0); opacity: 0; } 
          60% { transform: scaleY(1.1); opacity: 1; }
          100% { transform: scaleY(1); opacity: 1; } 
        }
        
        @keyframes twinkle { 
          0%, 100% { opacity: 0.3; } 
          50% { opacity: 1; } 
        }
        
        @keyframes float-orb { 
          0%, 100% { transform: translate(0, 0); } 
          33% { transform: translate(25px, -35px); }
          66% { transform: translate(-20px, -25px); }
        }
        
        @keyframes pulse-orb { 
          0%, 100% { opacity: 0.5; transform: scale(1); } 
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes particle-float { 
          0% { transform: translateY(0) scale(1); opacity: 0; } 
          10% { opacity: 0.7; }
          100% { transform: translateY(-200px) scale(0); opacity: 0; } 
        }
        
        @keyframes ring-pulse { 
          0% { transform: scale(0.7); opacity: 0; } 
          50% { opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; } 
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(52,211,153,0.4)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 40px rgba(52,211,153,0.7)); }
        }
        
        @keyframes text-reveal {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(10px);
            filter: blur(8px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }
        
        @keyframes text-glow {
          0%, 100% {
            text-shadow: 
              0 0 20px rgba(52,211,153,0.5),
              0 0 40px rgba(6,182,212,0.3),
              0 5px 20px rgba(0,0,0,0.5);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(52,211,153,0.8),
              0 0 60px rgba(6,182,212,0.6),
              0 0 90px rgba(52,211,153,0.4),
              0 5px 30px rgba(0,0,0,0.7);
          }
        }
        
        @keyframes slide-up {
          0% { 
            opacity: 0; 
            transform: translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        .will-change-transform {
          will-change: transform;
        }
        
        .will-change-opacity {
          will-change: opacity;
        }
      `}</style>

      {/* === BACKGROUND LAYER === */}
      <div className="absolute inset-0 z-0">
        
        {/* Gradient Background */}
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(52,211,153,0.12) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(6,182,212,0.12) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)
            `
          }}
        />

        {/* Optimized Floating Orbs - 8 instead of 12 */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => {
            const size = 180 + Math.random() * 140;
            const colors = [
              'rgba(52,211,153,0.25)',
              'rgba(6,182,212,0.25)',
              'rgba(139,92,246,0.2)',
              'rgba(236,72,153,0.2)'
            ];
            
            return (
              <div 
                key={`orb-${i}`}
                className="absolute rounded-full will-change-transform"
                style={{ 
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${Math.random() * 80}%`, 
                  left: `${Math.random() * 100}%`,
                  background: `radial-gradient(circle at 35% 35%, ${colors[i % colors.length]}, transparent 70%)`,
                  filter: 'blur(50px)',
                  animation: `float-orb ${12 + Math.random() * 8}s infinite ease-in-out ${Math.random() * 4}s, pulse-orb ${4 + Math.random() * 2}s infinite ease-in-out`,
                  mixBlendMode: 'screen'
                }}
              />
            );
          })}
        </div>

        {/* Optimized Particles - 30 instead of 50 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const colors = ['#34d399', '#06b6d4', '#8b5cf6', '#ec4899'];
            return (
              <div 
                key={`particle-${i}`}
                className="absolute rounded-full will-change-transform"
                style={{ 
                  width: `${2 + Math.random() * 2}px`,
                  height: `${2 + Math.random() * 2}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: '0%',
                  background: colors[i % colors.length],
                  animation: `particle-float ${5 + Math.random() * 4}s infinite ease-out ${Math.random() * 2}s`,
                  boxShadow: `0 0 6px ${colors[i % colors.length]}`
                }}
              />
            );
          })}
        </div>

        {/* Stars - Optimized */}
        {[...Array(60)].map((_, i) => (
          <Star 
            key={`star-${i}`} 
            size={1 + Math.random() * 2} 
            className="absolute text-white" 
            style={{ 
              top: `${Math.random() * 60}%`, 
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ease-in-out ${Math.random() * 2}s`
            }} 
          />
        ))}
        
        {/* Moon */}
        <div className="absolute top-10 right-10 opacity-20">
          <Moon size={70} fill="currentColor" className="text-slate-300" />
          <div className="absolute inset-0 blur-2xl bg-slate-300/20 rounded-full scale-150" />
        </div>

        {/* Mountain Silhouette */}
        <div className="absolute bottom-56 left-0 right-0 h-32 opacity-20">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path 
              fill="rgba(15,23,42,0.7)" 
              d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,213.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative w-full max-w-6xl h-96 flex items-end justify-center z-10 px-6 mb-20">
        
        {/* === LOGO SECTION === */}
        <div className="absolute top-16 left-0 right-0 text-center">
          
          {/* Animated Rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  width: '400px',
                  height: '400px',
                  borderColor: i % 2 === 0 ? 'rgba(52,211,153,0.15)' : 'rgba(6,182,212,0.15)',
                  animation: `ring-pulse ${3 + i * 0.7}s infinite ease-out ${i * 0.7}s`,
                  boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(52,211,153,0.2)' : 'rgba(6,182,212,0.2)'}`
                }}
              />
            ))}
          </div>

          {/* Background Text (Shadow) */}
          <h1 
            className="text-6xl md:text-9xl font-black tracking-tighter select-none"
            style={{ 
              color: 'rgba(15,23,42,0.5)',
              textShadow: '0 10px 30px rgba(0,0,0,0.6)',
              opacity: logoVisible ? 1 : 0,
              transition: 'opacity 600ms ease-out'
            }}
          >
            AI KRUSHI
          </h1>
          
          {/* Foreground Text (Glowing) - FIXED TEXT REVEAL */}
          <div 
            className="absolute left-0 right-0 top-0"
            style={{
              opacity: logoVisible ? 1 : 0,
              animation: logoVisible ? 'text-reveal 1s ease-out forwards' : 'none'
            }}
          >
            <h1 
              className="text-6xl md:text-9xl font-black tracking-tighter select-none"
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 30%, #8b5cf6 50%, #22d3ee 70%, #34d399 100%)',
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s infinite linear, text-glow 2s infinite ease-in-out',
                filter: 'drop-shadow(0 0 30px rgba(52,211,153,0.6)) drop-shadow(0 0 50px rgba(6,182,212,0.4))'
              }}
            >
              AI KRUSHI
            </h1>
          </div>

          {/* Subtitle MITRA */}
          <div 
            className="absolute top-20 md:top-28 left-0 right-0 flex justify-center"
            style={{
              opacity: progress > 30 ? 1 : 0,
              transform: progress > 30 ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 800ms ease-out'
            }}
          >
            <span 
              className="text-lg md:text-3xl font-black uppercase tracking-[0.5em]"
              style={{
                background: 'linear-gradient(90deg, rgba(52,211,153,0.9), rgba(6,182,212,0.9))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(52,211,153,0.5)',
                filter: 'drop-shadow(0 0 15px rgba(52,211,153,0.4))'
              }}
            >
              MITRA
            </span>
          </div>
          
          {/* Tagline */}
          <div 
            className="absolute top-32 md:top-40 left-0 right-0 flex justify-center"
            style={{
              opacity: progress > 50 ? 1 : 0,
              transform: progress > 50 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 1000ms ease-out 200ms'
            }}
          >
            <span className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
              AI-Powered Agriculture Platform
            </span>
          </div>
        </div>

        {/* === WHEAT FIELD === */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-between px-4 md:px-12 z-10">
          {[...Array(24)].map((_, i) => {
            const trigger = (i / 24) * 100;
            const isGrown = progress > trigger;
            return (
              <div key={i} className="relative w-7 md:w-12 h-14 md:h-20 flex items-end justify-center">
                <Wheat 
                  size={42} 
                  strokeWidth={1.5}
                  className={clsx(
                    "text-emerald-400 origin-bottom will-change-transform",
                    isGrown ? "animate-[grow-wheat_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" : "opacity-0 scale-y-0"
                  )}
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
                {isGrown && (
                  <div 
                    className="absolute bottom-0 w-2 h-2 bg-emerald-400 rounded-full blur-sm"
                    style={{
                      animation: 'pulse-orb 2s infinite ease-in-out',
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* === PROGRESS TRACK === */}
        <div 
          className="absolute bottom-5 left-0 right-0 h-1 bg-slate-800/50 z-0 rounded-full overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          <div 
            className="h-full relative will-change-transform"
            style={{ 
              width: `${progress}%`,
              transition: 'width 100ms linear'
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400"
              style={{
                boxShadow: '0 0 20px #22d3ee, 0 0 40px #34d399'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            
            {/* Leading Spark */}
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"
              style={{
                boxShadow: '0 0 10px #fff, 0 0 20px #22d3ee, 0 0 30px #34d399',
                animation: 'pulse-orb 0.5s infinite ease-in-out'
              }}
            />
          </div>
        </div>

        {/* === TRACTOR === */}
        <div 
          className="absolute bottom-5 z-20 will-change-transform"
          style={{ 
            left: `${progress}%`,
            transform: 'translateX(-50%)',
            transition: 'left 100ms linear',
            filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.6))'
          }}
        >
          {/* Headlight Beam */}
          <div 
            className="absolute bottom-8 left-10 w-[400px] h-[150px] origin-bottom-left"
            style={{ 
              background: 'linear-gradient(90deg, rgba(224,242,254,0.4) 0%, rgba(6,182,212,0.2) 20%, transparent 100%)',
              clipPath: 'polygon(0% 45%, 100% 5%, 100% 95%, 0% 100%)',
              opacity: progress < 98 ? 1 : 0,
              filter: 'blur(8px)',
              mixBlendMode: 'screen',
              transform: 'rotate(-3deg)'
            }}
          />
          
          {/* Exhaust Smoke */}
          <div className="absolute -top-12 right-1">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{ 
                  background: `radial-gradient(circle, rgba(148,163,184,${0.5 - i * 0.05}), transparent 70%)`,
                  animation: `exhaust ${2 + i * 0.2}s infinite linear`,
                  animationDelay: `${i * 0.3}s`,
                  filter: 'blur(3px)'
                }}
              />
            ))}
          </div>

          {/* Energy Rings */}
          <div className="absolute inset-0 -m-8">
            {[0, 1].map((i) => (
              <div 
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: i === 0 ? 'rgba(6,182,212,0.25)' : 'rgba(52,211,153,0.25)',
                  animation: `ring-pulse ${2 + i * 0.5}s infinite ease-out`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Tractor Body */}
          <div className="relative" style={{ animation: 'chassis-bounce 0.3s infinite linear' }}>
            <div 
              className="relative text-cyan-400"
              style={{
                animation: 'glow-pulse 2s infinite ease-in-out'
              }}
            >
              <Tractor size={96} strokeWidth={1} className="fill-[#020617]" />
              
              {/* Cabin Glow */}
              <div 
                className="absolute top-[28px] left-[32px] w-[24px] h-[20px] rounded-sm overflow-hidden"
                style={{
                  boxShadow: '0 0 15px rgba(6,182,212,0.5)'
                }}
              >
                <div className="absolute inset-0 bg-cyan-300/30 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 to-transparent" />
              </div>

              {/* Headlight */}
              <div 
                className="absolute top-[45px] left-[10px] w-2 h-2 bg-cyan-100 rounded-full"
                style={{
                  boxShadow: '0 0 10px #22d3ee, 0 0 20px #06b6d4',
                  animation: 'pulse-orb 1.5s infinite ease-in-out'
                }}
              />
            </div>

            {/* Rear Wheel */}
            <div 
              className="absolute bottom-2 right-4 w-11 h-11 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #1e293b, #020617)',
                animation: 'wheel-spin 1.5s linear infinite',
                boxShadow: '0 0 20px rgba(52,211,153,0.3)'
              }}
            >
              <div 
                className="absolute inset-0 border-[3px] border-emerald-400 border-dashed rounded-full"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(52,211,153,0.3), 0 0 15px rgba(52,211,153,0.4)'
                }}
              />
              <div className="absolute inset-0 m-auto w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
            
            {/* Front Wheel */}
            <div 
              className="absolute bottom-2 left-3 w-8 h-8 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #1e293b, #020617)',
                animation: 'wheel-spin 0.8s linear infinite',
                boxShadow: '0 0 15px rgba(52,211,153,0.3)'
              }}
            >
              <div 
                className="absolute inset-0 border-[3px] border-emerald-400 border-dashed rounded-full"
                style={{
                  boxShadow: 'inset 0 0 8px rgba(52,211,153,0.3), 0 0 12px rgba(52,211,153,0.4)'
                }}
              />
              <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* === LOADING STATUS === */}
      <div className="absolute bottom-14 flex flex-col items-center gap-5 z-30">
        
        {/* Status Text */}
        <div className="flex items-center gap-3 relative">
          <div 
            className="absolute left-0 w-5 h-5 bg-emerald-400 rounded-full blur-lg opacity-50"
            style={{ animation: 'pulse-orb 1.5s infinite ease-in-out' }}
          />
          
          <Sparkles 
            size={18} 
            className="text-emerald-400 relative z-10" 
            style={{
              filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.6))'
            }}
          />
          
          <p 
            className="text-emerald-400 font-mono text-xs md:text-sm uppercase tracking-[0.25em] font-bold"
            style={{
              textShadow: '0 0 10px rgba(52,211,153,0.5)'
            }}
          >
            {progress < 25 ? "Initializing AI..." : 
             progress < 50 ? "Loading Market Data..." : 
             progress < 75 ? "Calibrating Sensors..." : 
             progress < 95 ? "Syncing Farm Data..." : "Ready!"}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-80 md:w-[30rem]">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
          
          <div 
            className="relative w-full h-2 bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/50"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            <div 
              className="h-full relative will-change-transform" 
              style={{ 
                width: `${progress}%`,
                transition: 'width 100ms ease-out'
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                  boxShadow: '0 0 20px rgba(52,211,153,0.6), 0 0 40px rgba(6,182,212,0.4)'
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
              
              {/* Leading Spark */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"
                style={{
                  boxShadow: '0 0 15px #fff, 0 0 25px #22d3ee, 0 0 35px #34d399',
                  animation: 'pulse-orb 0.8s infinite ease-in-out'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-cyan-300 rounded-full animate-spin" />
                <div className="absolute inset-1 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div 
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 font-mono text-sm md:text-base font-black"
            style={{
              textShadow: '0 0 10px rgba(52,211,153,0.6)'
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-5 flex items-center gap-2 text-slate-500 text-xs font-semibold opacity-50">
        <Zap 
          size={12} 
          className="text-emerald-400" 
          style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.5))' }}
        />
        <span>Powered by Advanced AI Technology</span>
      </div>
    </div>
  );
};

export default SplashScreen;
