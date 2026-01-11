
import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { MOCK_MARKET } from '../../data/mock';
import { triggerHaptic } from '../../utils/common';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];

    return (
        <SimpleView title={t.market_title} onBack={onBack}>
            <div className="space-y-4">
                 <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-white/10 flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Market Status</p>
                        <p className="text-white font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> APMC Satara Open</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Updated</p>
                        <p className="text-white font-mono">Today, 10:30 AM</p>
                    </div>
                 </div>

                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {MOCK_MARKET.map((m,i) => (
                    <div key={i} onClick={triggerHaptic} className="glass-panel p-4 rounded-2xl flex flex-col gap-3 animate-enter active:scale-[0.98] transition-all bg-white/5 hover:border-cyan-500/30 shadow-lg" style={{animationDelay: `${i*100}ms`}}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shadow-inner`}><m.icon size={24} className={m.color}/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{m.name}</h3>
                                    <p className="text-slate-400 text-xs font-bold">Arrival: {m.arrival}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-xl text-white block">₹{m.price}</span>
                                <span className={`text-xs font-bold ${m.trend.includes('+') ? 'text-green-400' : 'text-red-400'} flex items-center justify-end gap-1`}>
                                    {m.trend.includes('+') ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                    {m.trend}
                                </span>
                            </div>
                        </div>
                        {/* Mock Mini Chart */}
                        <div className="h-10 w-full flex items-end justify-between gap-1 pt-2 border-t border-white/5 opacity-50">
                            {m.history.map((h, idx) => (
                                <div key={idx} className={`w-full rounded-t-sm ${m.trend.includes('+') ? 'bg-green-500' : 'bg-red-500'}`} style={{height: `${(h/10000)*100}%`}}></div>
                            ))}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
         </SimpleView>
    );
};

export default MarketView;
