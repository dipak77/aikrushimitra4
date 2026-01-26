
import React from 'react';
import { GlassTile } from './GlassTile';
import { DASH_TEXT } from './constants';
import { Language, ViewState } from '../../types';
import { Calendar, Clock } from 'lucide-react';

export const CalendarWidget = ({ lang, onNavigate }: { lang: Language, onNavigate: (v: ViewState) => void }) => {
  const txt = DASH_TEXT[lang];
  
  return (
    <GlassTile onClick={() => onNavigate('CALENDAR')} 
      className="h-full p-6 bg-gradient-to-br from-slate-900/80 via-indigo-900/40 to-purple-900/50 
      relative overflow-hidden hover:from-slate-900/90 hover:via-indigo-900/50 hover:to-purple-900/60">
      
      <div className="absolute top-[-60px] right-[-60px] w-48 h-48 
        bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-[90px] 
        rounded-full animate-[orbPulse_5s_infinite]" />

      <div className="flex items-center gap-2.5 mb-6 relative z-10">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 
          border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Calendar size={20} className="text-indigo-400" />
        </div>
        <span className="text-base font-black text-slate-100 tracking-wide">{txt.crop_schedule}</span>
      </div>

      <div className="relative pl-4 space-y-6 z-10">
        <div className="absolute left-[22px] top-3 bottom-3 w-[3px] 
          bg-gradient-to-b from-yellow-400 via-orange-500 to-transparent rounded-full opacity-60" />
        
        {/* Today's task - highlighted */}
        <div className="relative pl-10 group">
          <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full border-[3px] border-slate-900 
            bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 
            shadow-[0_0_25px_rgba(251,191,36,0.6)] z-10 flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white shadow-inner" />
          </div>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-2xl 
            border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300
            shadow-lg hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)] group-hover:-translate-y-1">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-black uppercase text-yellow-400 tracking-wider 
                bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                {txt.today_urgent}
              </p>
              <Clock size={12} className="text-slate-500"/>
            </div>
            <h4 className="text-base font-black text-white mb-1 drop-shadow-lg">{txt.irrigation}</h4>
            <p className="text-sm text-slate-400 font-semibold">{txt.cotton_field}</p>
          </div>
        </div>
        
        {/* Future task */}
        <div className="relative pl-10 opacity-70 hover:opacity-100 transition-all duration-300">
          <div className="absolute left-2 top-2.5 w-4 h-4 rounded-full bg-slate-600 
            border-[3px] border-slate-900 z-10 shadow-lg" />
          <div>
            <h4 className="text-sm font-bold text-slate-300">{txt.fertilizer}</h4>
            <p className="text-xs text-slate-500 uppercase font-bold mt-1 tracking-wide">
              {txt.fertilizer_sub}
            </p>
          </div>
        </div>
      </div>
    </GlassTile>
  );
};
