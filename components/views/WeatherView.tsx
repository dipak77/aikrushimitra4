
import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { WEATHER_HOURLY } from '../../data/mock';
import { triggerHaptic } from '../../utils/common';
import { Sun, Wind, Droplets, Clock, Calendar, CloudSun, CloudRain } from 'lucide-react';

const WeatherView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];

    return (
        <SimpleView title={t.weather_title} onBack={onBack}>
            <div className="space-y-6 animate-enter">
                <div onClick={triggerHaptic} className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-[2.5rem] text-center shadow-2xl shadow-indigo-500/30 relative overflow-hidden border border-white/10 active:scale-[0.99] transition-transform">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/30 blur-3xl rounded-full"></div>
                   <Sun size={80} className="mx-auto mb-4 text-amber-300 animate-[spin_20s_linear_infinite] drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]"/>
                   <h2 className="text-8xl font-black mb-1 tracking-tighter">28°</h2>
                   <p className="text-xl font-bold opacity-90 mb-6">Sunny Day • Satara</p>
                   
                   <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Wind</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Wind size={16}/> 12 km/h</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Humidity</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Droplets size={16}/> 45%</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">UV Index</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Sun size={16}/> High</p>
                        </div>
                   </div>
                </div>

                {/* Hourly Forecast Strip */}
                <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Clock size={16} className="text-cyan-400"/> Hourly Forecast</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                        {WEATHER_HOURLY.map((w, i) => (
                            <div key={i} className="glass-panel min-w-[80px] p-3 rounded-2xl flex flex-col items-center justify-center bg-white/5">
                                <span className="text-slate-400 text-xs font-bold mb-2">{w.time}</span>
                                <w.icon size={24} className="text-white mb-2" />
                                <span className="font-bold text-white">{w.temp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            
                {/* 3 Day Forecast List */}
                <div className="glass-panel rounded-[2rem] p-5 border border-white/10">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar size={16} className="text-fuchsia-400"/> 3-Day Forecast</h3>
                     <div className="space-y-4">
                        {[
                            { day: 'Tomorrow', icon: CloudSun, temp: '27° / 18°', desc: 'Partly Cloudy' },
                            { day: 'Wednesday', icon: CloudRain, temp: '24° / 19°', desc: 'Light Rain' },
                            { day: 'Thursday', icon: Sun, temp: '29° / 20°', desc: 'Sunny' },
                        ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <d.icon size={20} className="text-slate-300"/>
                                    <div>
                                        <p className="text-white font-bold text-sm">{d.day}</p>
                                        <p className="text-slate-500 text-xs">{d.desc}</p>
                                    </div>
                                </div>
                                <span className="text-white font-mono font-bold">{d.temp}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
         </SimpleView>
    );
};

export default WeatherView;
