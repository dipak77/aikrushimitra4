
import React from 'react';
import { ViewState, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { LayoutDashboard, Store, CloudSun, Landmark, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Mic } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { id: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'MARKET', icon: Store },
    { id: 'WEATHER', icon: CloudSun },
    { id: 'SCHEMES', icon: Landmark },
    { id: 'DISEASE_DETECTOR', icon: ScanLine },
    { id: 'SOIL', icon: FlaskConical },
    { id: 'YIELD', icon: TrendingUp },
    { id: 'AREA_CALCULATOR', icon: MapIcon },
  ];

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col z-50 bg-[#051108] border-r border-white/5 items-center py-8">
       
       {/* Premium Orbital Logo */}
       <div className="mb-10 cursor-pointer group relative w-12 h-12 flex items-center justify-center" onClick={() => setView('DASHBOARD')}>
           <div className="absolute inset-0 bg-jungle-500/20 blur-[20px] rounded-full group-hover:bg-jungle-400/30 transition-all"></div>
           {/* Rings */}
           <div className="absolute inset-0 rounded-full border border-jungle-400/50 animate-[spin_8s_linear_infinite]"></div>
           <div className="absolute inset-1 rounded-full border border-electric-400/30 animate-[spin_12s_linear_infinite_reverse]"></div>
           
           {/* Core */}
           <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-jungle-400 to-electric-700 shadow-lg flex items-center justify-center">
                <span className="font-black text-[8px] text-white tracking-tighter">AI</span>
           </div>
       </div>

       {/* Navigation Items */}
       <div className="flex-1 flex flex-col gap-6 w-full items-center overflow-y-auto hide-scrollbar">
          {items.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                className="group relative w-12 h-12 flex items-center justify-center transition-all duration-300">
                 
                 {/* Active Indicator (Neon Bar) */}
                 <div className={clsx(
                     "absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-jungle-500 shadow-[0_0_10px_#4ade80] transition-all duration-300",
                     active ? "opacity-100" : "opacity-0"
                 )}></div>

                 <div className={clsx(
                     "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                     active ? "bg-jungle-500/10 text-jungle-400" : "text-slate-500 group-hover:text-slate-200 group-hover:bg-white/5"
                 )}>
                     <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                 </div>
                 
                 {/* Tooltip */}
                 <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1e293b] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-50 border border-white/10">
                    {item.id.replace('_', ' ')}
                 </div>
              </button>
            );
          })}
       </div>

       {/* Bottom Action */}
       <div className="mt-4">
           <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} 
               className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
           >
               <Mic size={22} className="text-white" />
           </button>
       </div>

    </div>
  );
};

export default Sidebar;
