
import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { MOCK_MARKET } from '../../data/mock';
import { triggerHaptic } from '../../utils/common';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const MARKET_TEXT: Record<Language, any> = {
    mr: {
        status: "बाजार स्थिती",
        apmc_open: "बाजार समिती उघडी आहे",
        last_updated: "शेवटचे अपडेट",
        today: "आज",
        arrival: "आवक",
        crops: {
            'Soyabean': 'सोयाबीन', 'Cotton': 'कापूस', 'Onion': 'कांदा', 'Tur': 'तूर', 'Wheat': 'गहू', 'Maize': 'मका', 'Gram': 'हरभरा', 'Tomato': 'टोमॅटो', 'Potato': 'बटाटा', 'Rice': 'तांदूळ'
        }
    },
    hi: {
        status: "बाजार की स्थिति",
        apmc_open: "मंडी खुली है",
        last_updated: "अंतिम अपडेट",
        today: "आज",
        arrival: "आवक",
        crops: {
            'Soyabean': 'सोयाबीन', 'Cotton': 'कपास', 'Onion': 'प्याज', 'Tur': 'तूर', 'Wheat': 'गेहूं', 'Maize': 'मक्का', 'Gram': 'चना', 'Tomato': 'टमाटर', 'Potato': 'आलू', 'Rice': 'चावल'
        }
    },
    en: {
        status: "Market Status",
        apmc_open: "APMC Market Open",
        last_updated: "Last Updated",
        today: "Today",
        arrival: "Arrival",
        crops: {
            'Soyabean': 'Soyabean', 'Cotton': 'Cotton', 'Onion': 'Onion', 'Tur': 'Tur', 'Wheat': 'Wheat', 'Maize': 'Maize', 'Gram': 'Gram', 'Tomato': 'Tomato', 'Potato': 'Potato', 'Rice': 'Rice'
        }
    }
};

// Simple SVG Sparkline Component
const Sparkline = ({ data, trend }: { data: number[], trend: string }) => {
    const width = 120;
    const height = 40;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Create points string for SVG polyline
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      // Normalize Y (invert because SVG Y is top-down)
      const y = height - ((d - min) / range) * (height - 10) - 5; 
      return `${x},${y}`;
    }).join(' ');
  
    const colorClass = trend.includes('+') ? 'text-green-500' : 'text-red-500';
    const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;
  
    return (
      <div className="w-full h-10 relative">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className={colorClass}/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={colorClass}/>
                </linearGradient>
            </defs>
            <path 
                d={`M0,${height} L0,${height - ((data[0]-min)/range)*(height-10)-5} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L${width},${height} Z`} 
                fill={`url(#${gradientId})`} 
                className={colorClass}
            />
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={colorClass} 
            />
            <circle 
                cx={width} 
                cy={height - ((data[data.length - 1] - min) / range) * (height - 10) - 5} 
                r="3" 
                fill="currentColor" 
                className={colorClass} 
            />
        </svg>
      </div>
    );
  };

const MarketView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const mt = MARKET_TEXT[lang];

    return (
        <SimpleView title={t.market_title} onBack={onBack}>
            <div className="space-y-4 pb-20 animate-enter">
                 <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-white/10 flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{mt.status}</p>
                        <p className="text-white font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {mt.apmc_open}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{mt.last_updated}</p>
                        <p className="text-white font-mono">{mt.today}, 10:30 AM</p>
                    </div>
                 </div>

                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {MOCK_MARKET.map((m,i) => (
                    <div key={i} onClick={() => triggerHaptic()} className="glass-panel p-5 rounded-2xl flex flex-col gap-4 animate-enter active:scale-[0.98] transition-all bg-white/5 hover:border-cyan-500/30 shadow-lg group" style={{animationDelay: `${i*50}ms`}}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e293b] border border-white/5", m.color)}>
                                    <m.icon size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{mt.crops[m.name] || m.name}</h3>
                                    <p className="text-slate-400 text-xs font-bold">{mt.arrival}: {m.arrival}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-xl text-white block">₹{m.price}</span>
                                <span className={clsx("text-xs font-bold flex items-center justify-end gap-1", m.trend.includes('+') ? 'text-green-400' : 'text-red-400')}>
                                    {m.trend.includes('+') ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                    {m.trend}
                                </span>
                            </div>
                        </div>
                        
                        <div className="w-full pt-2 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                             <Sparkline data={m.history} trend={m.trend} />
                        </div>
                    </div>
                    ))}
                </div>
            </div>
         </SimpleView>
    );
};

export default MarketView;
