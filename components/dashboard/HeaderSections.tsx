import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Crown, Star, Award, Flame } from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { DASH_TEXT } from './constants';

export const AppHeaderLogo = () => {
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Premium Fallback Design with Ultra Effects
  if (videoError) {
    return (
      <>
        <style>{`
          @keyframes logo-gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes logo-ring-pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.6; 
            }
            50% { 
              transform: scale(1.15); 
              opacity: 0.3; 
            }
          }
          
          @keyframes logo-shine-sweep {
            0% { 
              transform: translateX(-200%) translateY(-200%) rotate(45deg); 
              opacity: 0; 
            }
            50% { 
              opacity: 0.8; 
            }
            100% { 
              transform: translateX(200%) translateY(200%) rotate(45deg); 
              opacity: 0; 
            }
          }
          
          @keyframes logo-sparkle-orbit {
            0% { 
              transform: rotate(0deg) translateX(40px) rotate(0deg); 
            }
            100% { 
              transform: rotate(360deg) translateX(40px) rotate(-360deg); 
            }
          }
        `}</style>
        
        <div className="flex items-center gap-4">
          {/* Ultra-Premium Logo Container */}
          <div className="relative w-16 h-16 group shrink-0">
            {/* Outer Glow Rings */}
            <div className="absolute inset-0 w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-emerald-400/40 to-cyan-500/40 blur-2xl animate-[logo-ring-pulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-[1.25rem] bg-gradient-to-tl from-blue-400/30 to-teal-500/30 blur-xl animate-[logo-ring-pulse_3s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Orbiting Sparkles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ animation: `logo-sparkle-orbit ${8 + i * 2}s linear infinite`, animationDelay: `${i * 2}s` }}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_0_10px_currentColor]"></div>
              </div>
            ))}
            
            {/* Main Logo Container */}
            <div className="relative w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.5),0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-br from-emerald-500 via-cyan-600 to-blue-600 hover:shadow-[0_0_60px_rgba(16,185,129,0.8),0_12px_48px_rgba(0,0,0,0.8)] hover:scale-105 hover:border-emerald-400/80 transition-all duration-500 group-hover:rotate-3 bg-[length:200%_200%] animate-[logo-gradient-shift_4s_ease_infinite]">
              
              {/* Top Gloss Layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-60"></div>
              
              {/* Shine Sweep Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[logo-shine-sweep_3s_ease-in-out_infinite]"></div>
              </div>
              
              {/* AI Text Core */}
              <div className="w-full h-full flex items-center justify-center relative z-10">
                <span className="text-3xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-300">
                  AI
                </span>
              </div>
              
              {/* Bottom Shadow Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Corner Highlights */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/40 blur-sm animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-200/40 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Crown Badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] border-2 border-white/20 animate-bounce opacity-0 group-hover:opacity-100 transition-opacity">
              <Crown size={14} className="text-amber-900" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Brand Text with Premium Typography */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight flex items-center gap-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <span className="relative">
                AI
                {/* Underline Glow */}
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/60 via-cyan-400/60 to-emerald-400/60 blur-sm"></div>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-400 bg-[length:200%_auto] animate-[logo-gradient-shift_3s_ease_infinite] relative">
                KRUSHI
                {/* Glow Layer */}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/50 via-cyan-400/50 to-blue-400/50 blur-lg">KRUSHI</span>
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent uppercase tracking-[0.35em]">
                Mitra
              </span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse shadow-[0_0_6px_currentColor]"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Ultra-Premium Video Logo Design
  return (
    <>
      <style>{`
        @keyframes video-border-flow {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        @keyframes video-glow-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 35px rgba(16, 185, 129, 0.3),
              0 0 70px rgba(16, 185, 129, 0.15),
              0 8px 32px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 50px rgba(16, 185, 129, 0.5),
              0 0 100px rgba(16, 185, 129, 0.25),
              0 12px 48px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }
        }
        
        @keyframes video-particle-float {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0; 
          }
          10%, 90% { 
            opacity: 1; 
          }
          50% { 
            transform: translate(var(--tx), var(--ty)); 
          }
        }
      `}</style>
      
      <div 
        className="relative group shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient Glow Background */}
        <div className="absolute inset-0 -inset-x-4 -inset-y-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 rounded-full bg-[length:200%_200%] animate-[video-border-flow_5s_ease_infinite]"></div>
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `video-particle-float ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              '--tx': `${(Math.random() - 0.5) * 40}px`,
              '--ty': `${(Math.random() - 0.5) * 40}px`,
            } as React.CSSProperties}
          ></div>
        ))}
        
        {/* Main Video Container */}
        <div className="relative h-16 md:h-[4.5rem] w-52 md:w-72 rounded-full overflow-hidden border-2 border-emerald-400/40 bg-black/50 cursor-pointer hover:border-emerald-400/70 transition-all duration-500 group-hover:scale-105 shadow-[0_0_35px_rgba(16,185,129,0.3),0_8px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6),0_12px_48px_rgba(0,0,0,0.8)]">
          
          {/* Video Element */}
          <video 
            ref={videoRef}
            src="/header.mp4" 
            className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            autoPlay 
            loop 
            muted 
            playsInline
            onError={() => setVideoError(true)}
          />
          
          {/* Multi-Layer Glass Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/40 via-cyan-400/40 to-emerald-400/40 blur-md bg-[length:200%_200%] animate-[video-border-flow_3s_ease_infinite]"></div>
          </div>
          
          {/* Top Highlight Bar */}
          <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"></div>
          
          {/* Bottom Shadow */}
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        
        {/* Floating Status Indicators */}
        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.6)] border-2 border-white/20 animate-pulse">
            <Zap size={12} className="text-white" fill="white" strokeWidth={0} />
          </div>
        </div>
        
        {/* Bottom Badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Star size={10} className="animate-pulse" fill="currentColor" />
            Premium
          </span>
        </div>
      </div>
    </>
  );
};

export const DynamicGreeting = ({ user, lang }: { user: UserProfile, lang: Language }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const greetingRef = useRef<HTMLDivElement>(null);
  
  // Update time every minute for dynamic greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const hour = currentTime.getHours();
  let timeGreeting = '';
  let greetingIcon: React.ReactNode = null;
  let greetingColor = 'from-amber-200 via-yellow-400 to-orange-500';
  
  // Determine greeting based on time and language
  if (lang === 'mr') {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'शुभ रात्री';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-200 via-purple-400 to-blue-500';
    } else if (hour < 12) {
      timeGreeting = 'शुभ सकाळ';
      greetingIcon = <Flame size={16} className="text-orange-300" />;
      greetingColor = 'from-amber-200 via-orange-400 to-red-500';
    } else if (hour < 17) {
      timeGreeting = 'शुभ दुपार';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-200 via-amber-400 to-orange-500';
    } else {
      timeGreeting = 'शुभ संध्याकाळ';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-200 via-pink-400 to-rose-500';
    }
  } else if (lang === 'hi') {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'शुभ रात्रि';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-200 via-purple-400 to-blue-500';
    } else if (hour < 12) {
      timeGreeting = 'शुभ प्रभात';
      greetingIcon = <Flame size={16} className="text-orange-300" />;
      greetingColor = 'from-amber-200 via-orange-400 to-red-500';
    } else if (hour < 17) {
      timeGreeting = 'शुभ दोपहर';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-200 via-amber-400 to-orange-500';
    } else {
      timeGreeting = 'शुभ संध्या';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-200 via-pink-400 to-rose-500';
    }
  } else {
    if (hour >= 21 || hour < 5) {
      timeGreeting = 'Good Night';
      greetingIcon = <Sparkles size={16} className="text-indigo-300" />;
      greetingColor = 'from-indigo-200 via-purple-400 to-blue-500';
    } else if (hour < 12) {
      timeGreeting = 'Good Morning';
      greetingIcon = <Flame size={16} className="text-orange-300" />;
      greetingColor = 'from-amber-200 via-orange-400 to-red-500';
    } else if (hour < 17) {
      timeGreeting = 'Good Afternoon';
      greetingIcon = <Zap size={16} className="text-yellow-300" fill="currentColor" />;
      greetingColor = 'from-yellow-200 via-amber-400 to-orange-500';
    } else {
      timeGreeting = 'Good Evening';
      greetingIcon = <Star size={16} className="text-purple-300" fill="currentColor" />;
      greetingColor = 'from-purple-200 via-pink-400 to-rose-500';
    }
  }

  return (
    <>
      <style>{`
        @keyframes greeting-gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes greeting-glow-pulse {
          0%, 100% { 
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            opacity: 1;
          }
          50% { 
            text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 80px currentColor;
            opacity: 0.9;
          }
        }
        
        @keyframes particle-rise {
          0% { 
            transform: translate(0, 0) scale(0); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            transform: translate(var(--tx), -80px) scale(1); 
            opacity: 0; 
          }
        }
        
        @keyframes badge-shimmer {
          0% { 
            transform: translateX(-100%) skewX(-20deg); 
          }
          100% { 
            transform: translateX(200%) skewX(-20deg); 
          }
        }
        
        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          50% { 
            transform: translateY(-8px) rotate(2deg); 
          }
        }
      `}</style>
      
      <div ref={greetingRef} className="flex flex-col z-10 relative group/greeting">
        
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 -inset-x-8 -inset-y-4 bg-gradient-to-r from-current/10 via-current/5 to-transparent blur-3xl opacity-0 group-hover/greeting:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Floating Particles with Dynamic Colors */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-60 pointer-events-none"
            style={{ 
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              left: `${i * 15 + Math.random() * 15}px`,
              top: `${-5 + Math.random() * 15}px`,
              background: `linear-gradient(135deg, ${hour < 12 ? 'rgb(251, 191, 36)' : hour < 17 ? 'rgb(250, 204, 21)' : hour < 21 ? 'rgb(244, 114, 182)' : 'rgb(165, 180, 252)'}, ${hour < 12 ? 'rgb(249, 115, 22)' : hour < 17 ? 'rgb(251, 146, 60)' : hour < 21 ? 'rgb(236, 72, 153)' : 'rgb(129, 140, 248)'})`,
              animation: `particle-rise ${3 + Math.random() * 3}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
              '--tx': `${(Math.random() - 0.5) * 30}px`,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Main Greeting Text */}
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_6px_32px_rgba(0,0,0,0.6)] tracking-tight flex items-center gap-3 flex-wrap">
            {/* Greeting with Icon */}
            <span className="flex items-center gap-2 relative group/text">
              {/* Time-Based Icon */}
              <span className="animate-[float-gentle_3s_ease-in-out_infinite]">
                {greetingIcon}
              </span>
              
              {timeGreeting}
              
              {/* Underline Accent */}
              <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-current/40 via-current/60 to-current/40 blur-sm opacity-0 group-hover/text:opacity-100 transition-opacity"></div>
            </span>
            
            <span className="text-transparent bg-clip-text bg-gradient-to-r bg-[length:200%_auto] animate-[greeting-gradient-flow_4s_ease_infinite] relative" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`, '--tw-gradient-from': greetingColor.split(' ')[0].replace('from-', ''), '--tw-gradient-to': greetingColor.split(' ')[2].replace('to-', '') } as React.CSSProperties}>
              {user.name.split(' ')[0]}
              
              {/* Glow Shadow Layer */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r opacity-40 blur-2xl animate-[greeting-glow-pulse_3s_ease-in-out_infinite]" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`, '--tw-gradient-from': greetingColor.split(' ')[0].replace('from-', ''), '--tw-gradient-to': greetingColor.split(' ')[2].replace('to-', '') } as React.CSSProperties}>
                {user.name.split(' ')[0]}
              </span>
            </span>
            
            {/* Premium Crown Badge */}
            <span className="inline-flex w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] border-2 border-yellow-300/30 animate-bounce opacity-0 group-hover/greeting:opacity-100 transition-opacity">
              <Award size={18} className="text-amber-900" strokeWidth={2.5} />
            </span>
          </h1>
        </div>
        
        {/* Welcome Badge with Premium Glass Design */}
        <div className="flex items-center gap-3 mt-4">
          <div className="group/badge relative px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-emerald-500/20 border-2 border-emerald-400/40 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4),0_6px_24px_rgba(0,0,0,0.6)] hover:border-emerald-400/60 transition-all duration-500 hover:scale-105 overflow-hidden cursor-pointer">
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[badge-shimmer_2s_ease-in-out_infinite]"></div>
            </div>
            
            {/* Content */}
            <p className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2.5 relative z-10">
              <Sparkles size={16} className="animate-pulse drop-shadow-[0_0_8px_currentColor]" strokeWidth={2.5} />
              <span className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                {DASH_TEXT[lang].welcome_back}
              </span>
              <Zap size={14} className="text-yellow-300 animate-bounce" fill="currentColor" strokeWidth={0} />
            </p>
            
            {/* Top Highlight */}
            <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]"></div>
            
            {/* Corner Accents */}
            <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-emerald-300/60 blur-[1px] animate-pulse"></div>
            <div className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-cyan-300/60 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Status Indicator Dots */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse shadow-[0_0_8px_currentColor]"
                style={{ 
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Floating Time Info Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 opacity-0 group-hover/greeting:opacity-100 transition-opacity duration-500 w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_currentColor]"></div>
          <span className="text-xs font-bold text-slate-300 tracking-wide">
            {currentTime.toLocaleTimeString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
      </div>
    </>
  );
};
