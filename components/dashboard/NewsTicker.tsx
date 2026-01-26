
import React from 'react';
import { Language } from '../../types';
import { DASH_TEXT } from './constants';

export const NewsTicker = ({ lang }: { lang: Language }) => {
    return (
        <div className="w-full bg-[#020617]/50 backdrop-blur-md border-b border-white/5 h-9 flex items-center relative overflow-hidden z-40">
            <div className="absolute inset-y-0 left-0 bg-[#020617]/80 z-10 px-4 flex items-center gap-2 border-r border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
            <div className="whitespace-nowrap animate-marquee pl-4">
                <span className="text-xs font-semibold text-slate-200 tracking-wide">{DASH_TEXT[lang].news}</span>
            </div>
        </div>
    );
};
