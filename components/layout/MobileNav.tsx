
import React, { useEffect, useState, useRef } from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Smart Scroll Detection
  useEffect(() => {
    const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        const currentScrollY = target.scrollTop || window.scrollY;
        
        if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home' },
    { id: 'MARKET', icon: Store, label: 'Market' },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true, label: 'Voice' },
    { id: 'SCHEMES', icon: Landmark, label: 'Schemes' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: 'Area' },
  ];

  return (
    <>
    {/* CSS for Wave and Lighting Effects */}
    <style>{`
        @keyframes wave-ripple {
            0% { transform: scale(1); opacity: 0.6; border-width: 2px; }
            100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
        @keyframes neon-glow {
            0%, 100% { box-shadow: 0 0 10px #22d3ee, 0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.2); }
            50% { box-shadow: 0 0 20px #22d3ee, 0 0 30px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.4); }
        }
        @keyframes rotate-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}</style>

    <div className={clsx(
        "lg:hidden fixed bottom-6 inset-x-4 z-[150] flex justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
    )}>
      
      {/* Container: Premium Glass Floating Island */}
      <div className="w-full max-w-[420px] h-[4.5rem] rounded-[2.5rem] bg-[#020617]/90 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex items-center justify-between px-2 relative z-50 ring-1 ring-white/5">
        
        {/* Dynamic Horizon Glow Line at Top */}
        <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent shadow-[0_0_10px_#22d3ee]"></div>

        {navItems.map((item) => {
           const isActive = view === item.id;
           
           // --- CENTRAL POWER ORB (Voice) ---
           if (item.main) {
             return (
               <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
                 className="relative -top-8 group"
               >
                  <div className="relative w-20 h-20 flex items-center justify-center">
                      
                      {/* 1. Expanding Wave Ripples */}
                      <div className="absolute inset-0 rounded-full border border-cyan-400 opacity-0 animate-[wave-ripple_2s_infinite]"></div>
                      <div className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 animate-[wave-ripple_2s_infinite_0.6s]"></div>
                      
                      {/* 2. Rotating Energy Ring */}
                      <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-cyan-500/30 animate-[rotate-ring_10s_linear_infinite]"></div>

                      {/* 3. The Core Orb Button */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] z-20 overflow-hidden ring-4 ring-[#020617] group-active:scale-95 transition-transform duration-200">
                          
                          {/* Inner Plasma */}
                          <div className="absolute inset-0 bg-white/20 blur-md animate-pulse"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                          <Mic size={28} className="relative z-30 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
                      </div>

                  </div>
               </button>
             );
           }

           // --- STANDARD NAV ITEMS ---
           return (
             <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
               className="relative w-16 h-full flex flex-col items-center justify-center gap-1 group"
             >
                <div className={clsx(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                    isActive ? "bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-400/30 translate-y-[-4px]" : "bg-transparent hover:bg-white/5"
                )}>
                    {/* Active Background Glow */}
                    {isActive && <div className="absolute inset-0 bg-cyan-400/10 blur-sm animate-pulse"></div>}

                    <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={clsx(
                            "relative z-10 transition-colors duration-300", 
                            isActive ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "text-slate-500 group-hover:text-slate-300"
                        )} 
                    />
                </div>
                
                {/* Active Indicator Dot */}
                <div className={clsx(
                    "w-1 h-1 rounded-full transition-all duration-300",
                    isActive ? "bg-cyan-400 shadow-[0_0_5px_#22d3ee] scale-100" : "bg-transparent scale-0"
                )}></div>
             </button>
           );
        })}
      </div>
    </div>
    </>
  );
};

export default MobileNav;
