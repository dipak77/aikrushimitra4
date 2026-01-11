
import React from 'react';
import { ViewState, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { LayoutDashboard, Store, CloudSun, Landmark, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Sprout, Mic } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t.menu_dashboard },
    { id: 'MARKET', icon: Store, label: t.menu_market },
    { id: 'WEATHER', icon: CloudSun, label: t.menu_weather },
    { id: 'SCHEMES', icon: Landmark, label: t.menu_schemes },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.menu_crop_doctor },
    { id: 'SOIL', icon: FlaskConical, label: t.menu_soil },
    { id: 'YIELD', icon: TrendingUp, label: t.menu_yield },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: t.menu_area },
  ];

  return (
    <div className="hidden lg:flex fixed left-6 top-6 bottom-6 w-24 flex-col z-50">
       <div className="glass-panel h-full rounded-[2.5rem] flex flex-col items-center py-8 shadow-[0_0_40px_rgba(79,70,229,0.2)] bg-slate-900/60 border border-white/10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 mb-12 float-3d">
             <Sprout size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full px-2 overflow-y-auto hide-scrollbar">
             {items.map(item => {
               const active = view === item.id;
               return (
                 <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                   className={clsx(
                     "w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group relative shrink-0",
                     active ? "bg-gradient-to-br from-white/10 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] border border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"
                   )}>
                    <item.icon size={24} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform group-hover:scale-110 duration-300", active && "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                    <span className="text-[10px] font-bold tracking-tight text-center leading-none">{item.label.split(' ')[0]}</span>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_15px_#22d3ee]"></div>}
                 </button>
               );
             })}
          </div>
          <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative overflow-hidden mt-4 shrink-0">
             <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-0 group-hover:opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
             <Mic size={24} className="relative z-10" />
          </button>
       </div>
    </div>
  );
};

export default Sidebar;
