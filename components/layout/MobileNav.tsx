
import React from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'MARKET', icon: Store },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true },
    { id: 'SCHEMES', icon: Landmark },
    { id: 'AREA_CALCULATOR', icon: MapIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[150] flex justify-center pointer-events-none px-4 pb-safe-bottom">
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent h-[150%] bottom-0 -z-10"></div>
      
      <div className="glass-panel !overflow-visible pointer-events-auto p-1.5 rounded-[2.5rem] flex items-center gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10 w-full max-w-[350px] justify-between h-[4.5rem] bg-[#0f172a]/90 backdrop-blur-2xl mb-4 relative">
        {navItems.map((item) => {
           const isActive = view === item.id;
           if (item.main) {
             return (
               <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
                 className="relative -top-9 w-16 h-16 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full text-white flex items-center justify-center shadow-[0_10px_25px_rgba(192,38,211,0.5)] border-4 border-[#020617] active:scale-95 transition-all group overflow-hidden shrink-0 z-50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)]"></div>
                  <Mic size={28} className="relative z-10 drop-shadow-md" />
                  <div className="absolute inset-0 bg-white/30 rounded-full scale-0 group-active:scale-150 transition-transform opacity-50"></div>
               </button>
             );
           }
           return (
             <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
               className={clsx(
                 "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative shrink-0",
                 isActive ? "text-cyan-300 bg-white/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-400 active:text-slate-200 active:scale-95"
               )}>
               <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx(isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
             </button>
           );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
