
import React from 'react';
import { clsx } from 'clsx';
import { Store, TrendingUp, TrendingDown } from 'lucide-react';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';
import { GlassTile } from './GlassTile';
import { Language } from '../../types';

export const MarketWidget = ({ onNavigate, lang }: { onNavigate: (v: string) => void, lang: Language }) => {
    const txt = DASH_TEXT[lang];
    
    return (
        <GlassTile onClick={() => onNavigate('MARKET')} className="h-full p-0 flex flex-col relative overflow-hidden bg-[#0f172a] group">
            {/* Header */}
            <div className="px-5 pt-5 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Store size={18} className="text-amber-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{txt.market_rates}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{txt.live}</span>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-5 flex flex-col gap-3 relative z-10 justify-center">
                 {MOCK_MARKET.slice(0, 2).map((m, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e293b] border border-white/5", m.color)}>
                                <m.icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">{txt.crops[m.name] || m.name}</p>
                                <p className="text-[10px] font-medium text-slate-500">{txt.vol}: {m.arrival}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             {/* Yellow Gradient Price */}
                             <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                                ₹{m.price}
                             </span>
                             <div className={clsx("text-[10px] font-bold flex items-center justify-end gap-0.5", m.trend.includes('+') ? "text-emerald-400" : "text-red-400")}>
                                 {m.trend.includes('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                 {m.trend}
                             </div>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Background Graph Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10 pointer-events-none">
                 <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-amber-500 fill-current">
                     <path d="M0 40 L0 20 Q 20 10 40 25 T 100 15 L 100 40 Z" />
                 </svg>
            </div>
        </GlassTile>
    );
};
