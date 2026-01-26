import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Leaf, TrendingUp, Droplets, Sun, Award, Star } from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { DASH_TEXT } from './constants';

export const AppHeaderLogo = () => {
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Professional Canvas Globe Animation
  useEffect(() => {
    if (videoError && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frame = 0;
      const particles: Array<{x: number, y: number, angle: number, radius: number, speed: number, opacity: number}> = [];
      
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: 50,
          y: 50,
          angle: Math.random() * Math.PI * 2,
          radius: 15 + Math.random() * 25,
          speed: 0.001 + Math.random() * 0.002,
          opacity: 0.2 + Math.random() * 0.5
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Globe grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 0.8;
        
        // Vertical lines
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const offset = (frame * 0.3) % 50;
          for (let j = 0; j <= 100; j++) {
            const angle = (i / 6) * Math.PI * 2;
            const y = (j - 50) + offset;
            const scale = Math.cos((y / 50) * Math.PI * 0.5);
            const x = 50 + Math.cos(angle) * 20 * scale;
            const yPos = 50 + y * 0.4;
            
            if (j === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
          }
          ctx.stroke();
        }
        
        // Particles
        particles.forEach(p => {
          p.angle += p.speed;
          const x = 50 + Math.cos(p.angle) * p.radius * Math.cos(frame * 0.015);
          const y = 50 + Math.sin(p.angle) * p.radius * Math.sin(frame * 0.01);
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 1.5);
          gradient.addColorStop(0, `rgba(16, 185, 129, ${p.opacity})`);
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        frame++;
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [videoError]);

  return (
    <>
      <style>{`
        @keyframes globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes circuit-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes icon-hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes glow-soft {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)); 
          }
          50% { 
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.6)); 
          }
        }
        
        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 10px currentColor; }
          50% { box-shadow: 0 0 20px currentColor; }
        }
      `}</style>

      <div className="relative flex items-center gap-4 md:gap-5 group/logo">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 -inset-x-8 bg-gradient-to-r from-emerald-500/10 via-yellow-500/8 to-cyan-500/10 blur-3xl opacity-40 group-hover/logo:opacity-60 transition-opacity duration-700 rounded-full"></div>
        
        {/* Professional Globe Container */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0">
          
          {/* Soft Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 via-yellow-400/15 to-cyan-500/20 blur-xl animate-[glow-soft_3s_ease-in-out_infinite]"></div>
          
          {/* Rotating Ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-[globe-spin_30s_linear_infinite]">
            <div className="absolute top-0 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
          
          {/* Main Globe */}
          <div className="relative w-full h-full rounded-full overflow-hidden border border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.3),0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-cyan-950/80 backdrop-blur-xl group-hover/logo:border-emerald-400/50 group-hover/logo:shadow-[0_0_35px_rgba(16,185,129,0.4)] transition-all duration-500">
            
            {videoError ? (
              <>
                <canvas 
                  ref={canvasRef}
                  width="100"
                  height="100"
                  className="absolute inset-0 w-full h-full opacity-70"
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-yellow-300 to-cyan-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                    AI
                  </span>
                </div>
              </>
            ) : (
              <video 
                src="/header.mp4" 
                className="w-full h-full object-cover opacity-85 group-hover/logo:opacity-100 transition-opacity"
                autoPlay 
                loop 
                muted 
                playsInline
                onError={() => setVideoError(true)}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          </div>
          
          {/* Small Icon Badges */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-300/20 animate-[icon-hover_2.5s_ease-in-out_infinite]">
            <Leaf size={11} className="text-white" strokeWidth={2.5} />
          </div>
          
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.5)] border border-yellow-300/20 animate-[icon-hover_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.8s' }}>
            <TrendingUp size={11} className="text-white" strokeWidth={2.5} />
          </div>
          
          {/* Minimal Circuit Lines */}
          <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 opacity-40 pointer-events-none" viewBox="0 0 96 32">
            <path 
              d="M0,16 L20,16 L28,8 L40,8 L48,16 L96,16" 
              stroke="url(#circuit1)" 
              strokeWidth="1" 
              fill="none"
              className="animate-[circuit-pulse_3s_ease-in-out_infinite]"
            />
            <defs>
              <linearGradient id="circuit1" x1="0%" x2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                <stop offset="50%" stopColor="rgba(251, 191, 36, 0.4)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
              </linearGradient>
            </defs>
            <circle cx="48" cy="16" r="1.5" fill="#10b981" className="animate-pulse" />
          </svg>
        </div>
        
        {/* Clean Brand Typography */}
        <div className="flex flex-col gap-1.5">
          {/* Main Title - Professional Size */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-none tracking-tight flex items-center gap-2 md:gap-2.5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)]">
              AI
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.5)]">
              Krushi
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-400 drop-shadow-[0_2px_12px_rgba(6,182,212,0.5)]">
              Mitra
            </span>
          </h1>
          
          {/* Refined Subtitle */}
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-emerald-400/50 to-transparent"></div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              AI Powered Agricultorm
            </p>
          </div>
          
          {/* Compact Feature Badges */}
          <div className="flex items-center gap-1.5 mt-1">
            {[
              { icon: Leaf, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10' },
              { icon: TrendingUp, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10' },
              { icon: Droplets, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10' },
            ].map((badge, i) => (
              <div
                key={i}
                className={`w-6 h-6 md:w-7 md:h-7 rounded-lg ${badge.bg} backdrop-blur-sm border border-white/10 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer group/icon`}
              >
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-[0_0_8px_currentColor] group-hover/icon:shadow-[0_0_12px_currentColor] transition-shadow`}>
                  <badge.icon size={10} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const DynamicGreeting = ({ user, lang }: { user: UserProfile, lang: Language }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const hour = currentTime.getHours();
  let timeGreeting = '';
  let greetingIcon: React.ReactNode = null;
  let greetingColor = 'from-amber-300 to-orange-400';
  
  if (lang === 'mr') {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'शुभ रात्री';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-300 to-purple-400';
    } else if (hour < 12) {
      timeGreeting = 'शुभ सकाळ';
      greetingIcon = <Sun size={16} className="text-orange-300" />;
      greetingColor = 'from-orange-300 to-amber-400';
    } else if (hour < 17) {
      timeGreeting = 'शुभ दुपार';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-300 to-amber-400';
    } else {
      timeGreeting = 'शुभ संध्याकाळ';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-300 to-pink-400';
    }
  } else if (lang === 'hi') {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'शुभ रात्रि';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-300 to-purple-400';
    } else if (hour < 12) {
      timeGreeting = 'शुभ प्रभात';
      greetingIcon = <Sun size={16} className="text-orange-300" />;
      greetingColor = 'from-orange-300 to-amber-400';
    } else if (hour < 17) {
      timeGreeting = 'शुभ दोपहर';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-300 to-amber-400';
    } else {
      timeGreeting = 'शुभ संध्या';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-300 to-pink-400';
    }
  } else {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'Good Night';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-300 to-purple-400';
    } else if (hour < 12) {
      timeGreeting = 'Good Morning';
      greetingIcon = <Sun size={16} className="text-orange-300" />;
      greetingColor = 'from-orange-300 to-amber-400';
    } else if (hour < 17) {
      timeGreeting = 'Good Afternoon';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-300 to-amber-400';
    } else {
      timeGreeting = 'Good Evening';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-300 to-pink-400';
    }
  }

  return (
    <>
      <style>{`
        @keyframes greeting-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes particle-drift {
          0% { 
            transform: translate(0, 0); 
            opacity: 0; 
          }
          20% { opacity: 0.6; }
          100% { 
            transform: translate(var(--tx), -60px); 
            opacity: 0; 
          }
        }
        
        @keyframes name-shine {
          0%, 100% { 
            text-shadow: 0 0 10px currentColor;
          }
          50% { 
            text-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
      `}</style>
      
      <div className="relative flex flex-col z-10 group/greeting">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 -inset-x-8 -inset-y-4 bg-gradient-to-r from-current/5 via-current/3 to-transparent blur-2xl opacity-0 group-hover/greeting:opacity-100 transition-opacity duration-700"></div>
        
        {/* Refined Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ 
              left: `${i * 12 + Math.random() * 10}px`,
              top: `${-5 + Math.random() * 10}px`,
              background: `linear-gradient(135deg, ${hour < 12 ? 'rgb(251, 191, 36)' : hour < 17 ? 'rgb(250, 204, 21)' : hour < 21 ? 'rgb(244, 114, 182)' : 'rgb(165, 180, 252)'}, ${hour < 12 ? 'rgb(249, 115, 22)' : hour < 17 ? 'rgb(251, 146, 60)' : hour < 21 ? 'rgb(236, 72, 153)' : 'rgb(129, 140, 248)'})`,
              animation: `particle-drift ${3 + Math.random() * 2}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
              '--tx': `${(Math.random() - 0.5) * 20}px`,
              opacity: 0.5,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Professional Greeting Text */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] tracking-tight flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-2 text-white">
            <span className="animate-[icon-hover_2.5s_ease-in-out_infinite]">
              {greetingIcon}
            </span>
            {timeGreeting},
          </span>
          
          <span 
            className={`text-transparent bg-clip-text bg-gradient-to-r ${greetingColor} bg-[length:200%_auto] animate-[greeting-flow_4s_ease_infinite]`}
            style={{ animation: 'name-shine 2.5s ease-in-out infinite' }}
          >
            {user.name.split(' ')[0]}
          </span>
        </h1>
        
        {/* Refined Welcome Badge */}
        <div className="flex items-center gap-3 mt-3">
          <div className="group/badge px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/30 backdrop-blur-xl shadow-[0_0_15px_rgba(16,185,129,0.2),0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:border-emerald-400/50 transition-all duration-500 hover:scale-105 cursor-pointer">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={13} className="animate-pulse" strokeWidth={2.5} />
              <span>{DASH_TEXT[lang].welcome_back}</span>
            </p>
          </div>
          
          {/* Status Dots */}
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse shadow-[0_0_6px_currentColor]"
                style={{ 
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};