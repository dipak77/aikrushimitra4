
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
      {/* Bottom Gradient Fade for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent h-[150%] bottom-0 -z-10"></div>
      
      {/* Main Nav Bar */}
      <div className="glass-panel !overflow-visible pointer-events-auto p-1.5 rounded-[2.5rem] flex items-center gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-[350px] justify-between h-[4.5rem] bg-[#0f172a]/80 backdrop-blur-2xl mb-4 relative z-50">
        {navItems.map((item) => {
           const isActive = view === item.id;
           
           if (item.main) {
             return (
               <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
                 className="relative -top-10 group"
               >
                  {/* AI Orb Animation Container */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                      
                      {/* 1. Outer Glow Pulse */}
                      <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-2xl animate-pulse group-hover:bg-cyan-400/50 transition-colors duration-500"></div>
                      
                      {/* 2. Rotating Energy Ring (Conic Gradient) */}
                      <div className="absolute inset-1 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 animate-[spin_3s_linear_infinite]"></div>
                      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-70 animate-[spin_3s_linear_infinite_reverse]"></div>

                      {/* 3. The Physical Button */}
                      <div className="relative w-16 h-16 rounded-full bg-[#020617] flex items-center justify-center border-2 border-white/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.4)] overflow-hidden z-10 active:scale-95 transition-transform duration-200">
                          
                          {/* Inner Plasma Effect */}
                          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,1),transparent_70%)] animate-pulse"></div>
                          
                          {/* Icon */}
                          <Mic size={28} className="relative z-20 text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-110 transition-transform duration-300" />
                          
                          {/* Shine Glint */}
                          <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/20 blur-xl rotate-45 group-hover:translate-x-10 group-hover:translate-y-10 transition-transform duration-700"></div>
                      </div>

                  </div>
               </button>
             );
           }

           return (
             <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
               className={clsx(
                 "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative shrink-0 overflow-hidden group",
                 isActive ? "text-cyan-300" : "text-slate-400 hover:text-slate-200"
               )}>
               
               {/* Active Background Glow */}
               {isActive && (
                   <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent animate-enter"></div>
               )}
               
               {/* Active Indicator Dot (Top) */}
               {isActive && (
                   <div className="absolute top-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
               )}

               <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx("relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]")} />
             </button>
           );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
