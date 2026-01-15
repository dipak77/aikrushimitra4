
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
    {/* CSS for FAB Ripple */}
    <style>{`
        @keyframes fab-ripple {
            0% { transform: scale(1); opacity: 0.6; border-width: 1px; }
            100% { transform: scale(2.2); opacity: 0; border-width: 0px; }
        }
        @keyframes fab-glow {
            0%, 100% { box-shadow: 0 0 10px #3d5afe, 0 0 20px rgba(61, 90, 254, 0.4); }
            50% { box-shadow: 0 0 25px #3d5afe, 0 0 40px rgba(61, 90, 254, 0.6); }
        }
    `}</style>

    <div className={clsx(
        "lg:hidden fixed bottom-6 inset-x-4 z-[150] flex justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
    )}>
      
      {/* Floating Island Container */}
      <div className="w-full max-w-[420px] h-[4.5rem] rounded-[2.5rem] bg-[#0a250c]/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.9)] flex items-center justify-between px-2 relative z-50 ring-1 ring-white/5">
        
        {/* Dynamic Horizon Glow Line */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-jungle-400/50 to-transparent shadow-[0_0_10px_#4ade80]"></div>

        {navItems.map((item) => {
           const isActive = view === item.id;
           
           // --- CENTRAL FAB (Voice) ---
           if (item.main) {
             return (
               <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
                 className="relative -top-8 group"
               >
                  <div className="relative w-20 h-20 flex items-center justify-center">
                      
                      {/* 1. Electric Ripple */}
                      <div className="absolute inset-0 rounded-full border border-electric-500 opacity-0 animate-[fab-ripple_2s_infinite]"></div>
                      <div className="absolute inset-0 rounded-full border border-electric-400 opacity-0 animate-[fab-ripple_2s_infinite_0.8s]"></div>

                      {/* 2. The Core FAB Button */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center shadow-[0_0_30px_rgba(61,90,254,0.5)] z-20 overflow-hidden ring-4 ring-[#051108] group-active:scale-95 transition-transform duration-200 animate-[fab-glow_3s_infinite]">
                          
                          {/* Inner Shine */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 blur-sm rounded-t-full"></div>

                          <Mic size={28} className="relative z-30 text-white drop-shadow-md" strokeWidth={2.5} />
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
                    isActive ? "bg-jungle-500/20 shadow-[0_0_15px_rgba(74,222,128,0.2)] border border-jungle-500/30 translate-y-[-4px]" : "bg-transparent hover:bg-white/5"
                )}>
                    <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={clsx(
                            "relative z-10 transition-colors duration-300", 
                            isActive ? "text-jungle-400" : "text-slate-500 group-hover:text-slate-300"
                        )} 
                    />
                </div>
                
                {/* Active Dot */}
                <div className={clsx(
                    "w-1 h-1 rounded-full transition-all duration-300",
                    isActive ? "bg-jungle-400 shadow-[0_0_5px_#4ade80] scale-100" : "bg-transparent scale-0"
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
