
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { DASH_TEXT } from './constants';

export const AppHeaderLogo = () => {
  const [videoError, setVideoError] = useState(false);

  if (videoError) {
    // Fallback Design
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden 
          border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.5)] 
          bg-gradient-to-br from-emerald-500 via-cyan-600 to-blue-600 
          group shrink-0 hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] 
          transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-60" />
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <span className="text-2xl font-black text-white drop-shadow-2xl 
              animate-pulse">AI</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-black text-white leading-none tracking-tight 
            flex items-center gap-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r 
              from-emerald-300 via-cyan-400 to-blue-400 animate-[gradientShift_3s_ease_infinite]">
              KRUSHI
            </span>
          </h1>
          <span className="text-xs font-bold bg-gradient-to-r from-slate-400 to-slate-500 
            bg-clip-text text-transparent uppercase tracking-[0.35em] ml-1">Mitra</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-14 md:h-16 w-48 md:w-64 rounded-full overflow-hidden 
      border-2 border-emerald-400/40 shadow-[0_0_35px_rgba(16,185,129,0.3)] 
      bg-black/50 group shrink-0 cursor-pointer hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] 
      transition-all duration-500 hover:border-emerald-400/60">
      <video 
        src="/header.mp4" 
        className="w-full h-full object-cover transform scale-105 
          group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        autoPlay loop muted playsInline
        onError={() => setVideoError(true)}
      />
      {/* Glass Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
        pointer-events-none" />
    </div>
  );
};

export const DynamicGreeting = ({ user, lang }: { user: UserProfile, lang: Language }) => {
  const hour = new Date().getHours();
  let timeGreeting = '';
  
  if (lang === 'mr') {
    if (hour >= 21 || hour < 5) timeGreeting = 'शुभ रात्री';
    else if (hour < 12) timeGreeting = 'शुभ सकाळ';
    else if (hour < 17) timeGreeting = 'शुभ दुपार';
    else timeGreeting = 'शुभ संध्याकाळ';
  } else if (lang === 'hi') {
    if (hour >= 21 || hour < 5) timeGreeting = 'शुभ रात्रि';
    else if (hour < 12) timeGreeting = 'शुभ प्रभात';
    else if (hour < 17) timeGreeting = 'शुभ दोपहर';
    else timeGreeting = 'शुभ संध्या';
  } else {
    if (hour >= 21 || hour < 5) timeGreeting = 'Good Night';
    else if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 17) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';
  }

  return (
    <div className="flex flex-col z-10 relative">
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-60 
            animate-[float_3s_ease-in-out_infinite]"
          style={{ 
            left: `${i * 20 + Math.random() * 10}px`,
            top: `${-5 + Math.random() * 10}px`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
      
      <h1 className="text-3xl md:text-4xl font-black text-white leading-tight 
        drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] tracking-tight">
        {timeGreeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r 
          from-amber-200 via-yellow-400 to-orange-500 animate-[gradientShift_3s_ease_infinite]">
          {user.name.split(' ')[0]}
        </span>
      </h1>
      <div className="flex items-center gap-2 mt-2.5">
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 
          border border-emerald-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]
          hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={13} className="animate-pulse" />
            {DASH_TEXT[lang].welcome_back}
          </p>
        </div>
      </div>
    </div>
  );
};
