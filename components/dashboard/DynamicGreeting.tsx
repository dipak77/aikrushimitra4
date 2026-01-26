
import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Zap, Star } from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { DASH_TEXT } from './constants';

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
