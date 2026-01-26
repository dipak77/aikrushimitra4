
import React from 'react';
import { GlassTile } from './GlassTile';
import { DASH_TEXT } from './constants';
import { Mic } from 'lucide-react';

export const VoiceWidget = ({ lang, onNavigate }: any) => {
  const txt = DASH_TEXT[lang];
  
  return (
    <GlassTile onClick={() => onNavigate('VOICE_ASSISTANT')} 
      className="h-48 p-0 flex items-center justify-center relative overflow-hidden 
      bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 group">
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 
        animate-[spin_12s_linear_infinite] opacity-50" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      
      <div className="text-center relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full 
          bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 
          shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center 
          group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(6,182,212,0.7)] 
          transition-all duration-500 border-2 border-white/30 relative">
          
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent" />
          <Mic size={28} className="text-white drop-shadow-2xl relative z-10"/>
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400/50 animate-ping opacity-50" />
        </div>
        <h3 className="text-lg font-black text-white drop-shadow-lg">{txt.ai_assistant}</h3>
        <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1.5 
          bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent group-hover:text-cyan-200 transition-colors">
          {txt.tap_to_ask}
        </p>
      </div>
    </GlassTile>
  );
};
