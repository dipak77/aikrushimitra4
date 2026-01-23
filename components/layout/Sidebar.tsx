
import React from 'react';
import { ViewState, Language } from '../../types';
import { LayoutDashboard, Store, CloudSun, Landmark, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Mic, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
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
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col z-50 bg-[#020617]/40 border-r border-white/5 items-center py-6 backdrop-blur-xl">
       
       {/* Logo */}
       <div 
         className="mb-8 w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform" 
         onClick={() => setView('DASHBOARD')}
       >
           <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-black text-[10px]">
               AI
           </div>
       </div>

       {/* Navigation Items */}
       <div className="flex-1 flex flex-col gap-4 w-full items-center overflow-y-auto hide-scrollbar py-2">
          {items.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                className="group relative w-12 h-12 flex items-center justify-center transition-all duration-300">
                 
                 {/* Active Indicator (Pill) */}
                 <div className={clsx(
                     "absolute left-[-10px] top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-lg bg-emerald-400 shadow-[0_0_10px_#34d399] transition-all duration-300",
                     active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                 )}></div>

                 <div className={clsx(
                     "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                     active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500 group-hover:text-slate-200 group-hover:bg-white/5"
                 )}>
                     <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                 </div>
                 
                 {/* Tooltip */}
                 <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl whitespace-nowrap z-50 translate-x-[-5px] group-hover:translate-x-0">
                    {item.id.replace('_', ' ')}
                 </div>
              </button>
            );
          })}
       </div>

       {/* Bottom Voice Action */}
       <div className="mt-4 pb-4">
           <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} 
               className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 transition-transform duration-300 border border-white/20 group"
           >
               <Mic size={20} className="text-white drop-shadow-md group-hover:animate-pulse" />
           </button>
       </div>

    </div>
  );
};

export default Sidebar;
