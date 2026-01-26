
import React, { useEffect, useState, useRef } from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon, Sparkles, Zap, Crown, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);
  const containerRef = useRef<EventTarget | null>(null);
  
  // Smart Scroll Detection Logic that works with internal scroll containers
  useEffect(() => {
    // Reset visibility on view change
    setIsVisible(true);

    const findScrollContainer = () => {
        // Most views in this app use 'overflow-y-auto' on a container div
        const containers = document.querySelectorAll('.overflow-y-auto');
        // Return the last one found as it's likely the active view's container
        if (containers.length > 0) return containers[containers.length - 1] as HTMLElement;
        // Fallback to window/body if no internal container found
        return window;
    };

    const handleScroll = (e: Event) => {
        let currentY = 0;
        let maxY = 0;
        
        if (e.target === window || e.target === document) {
            currentY = window.scrollY;
            maxY = document.documentElement.scrollHeight - window.innerHeight;
        } else {
            const el = e.target as HTMLElement;
            currentY = el.scrollTop;
            maxY = el.scrollHeight - el.clientHeight;
        }

        // Prevent negative scroll values (iOS bounce)
        currentY = Math.max(0, currentY);

        const isAtTop = currentY < 60;
        const isAtBottom = currentY >= maxY - 60;
        
        const isScrollingUp = currentY < lastScrollY.current;
        const isScrollingDown = currentY > lastScrollY.current;
        const scrollDiff = Math.abs(currentY - lastScrollY.current);

        // Logic: 
        // 1. Always show at top or bottom for accessibility
        // 2. Hide when scrolling down significantly
        // 3. Show immediately when scrolling up
        if (isAtTop || isAtBottom) {
             setIsVisible(true);
        } else if (isScrollingUp && scrollDiff > 5) {
             setIsVisible(true);
        } else if (isScrollingDown && scrollDiff > 20) { 
             setIsVisible(false);
        }
        
        lastScrollY.current = currentY;
    };

    // Small delay to allow new view to mount and layout to settle
    const timeoutId = setTimeout(() => {
        const el = findScrollContainer();
        if (el) {
            // Clean up old listener if exists (though effect cleanup handles this)
            if (containerRef.current) containerRef.current.removeEventListener('scroll', handleScroll);
            
            el.addEventListener('scroll', handleScroll, { passive: true });
            containerRef.current = el;
            
            // Initialize lastScrollY
            lastScrollY.current = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
        }
    }, 300);

    return () => {
        clearTimeout(timeoutId);
        if (containerRef.current) {
            containerRef.current.removeEventListener('scroll', handleScroll);
        }
    };
  }, [view]);

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home', color: 'emerald', gradient: 'from-emerald-400 to-teal-500' },
    { id: 'MARKET', icon: Store, label: 'Market', color: 'violet', gradient: 'from-violet-400 to-purple-500' },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true, label: 'Voice', color: 'cyan', gradient: 'from-cyan-400 to-blue-600' },
    { id: 'SCHEMES', icon: Landmark, label: 'Schemes', color: 'sky', gradient: 'from-sky-400 to-indigo-500' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: 'Area', color: 'amber', gradient: 'from-amber-400 to-orange-500' },
  ];

  // Track active index
  useEffect(() => {
    const index = navItems.findIndex(item => item.id === view);
    if (index !== -1) setActiveIndex(index);
  }, [view]);

  return (
    <>
      <style>{`
        /* === FAB ANIMATIONS === */
        @keyframes fab-pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; border-width: 3px; }
          100% { transform: scale(2.2); opacity: 0; border-width: 0px; }
        }
        @keyframes fab-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fab-rotate-glow {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
        }
        
        /* === NAV ANIMATIONS === */
        @keyframes nav-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .nav-curve-bg {
            filter: drop-shadow(0 -5px 20px rgba(0,0,0,0.5));
        }
      `}</style>

      {/* Main Container - Floating Pill */}
      <div className={clsx(
          "lg:hidden fixed bottom-6 inset-x-4 z-[200] flex justify-center pointer-events-none transition-all duration-500 cubic-bezier(0.33, 1, 0.68, 1)",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"
      )}>
        
        {/* The Navigation Pill */}
        <div className="relative w-full max-w-[400px] h-[4.5rem] pointer-events-auto group/nav">
          
          {/* 1. SVG Background with Curve */}
          <div className="absolute inset-0 nav-curve-bg">
             <svg viewBox="0 0 400 72" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0f172a" /> {/* Slate 900 */}
                        <stop offset="100%" stopColor="#020617" /> {/* Slate 950 */}
                    </linearGradient>
                    <linearGradient id="navBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                    </linearGradient>
                </defs>
                
                {/* 
                   Custom Path: Rounded rectangle with a central Bezier curve dip for the FAB.
                   M0,24: Start left, radius 24
                   The central dip is between x=140 and x=260 (centered at 200).
                   Q200,55 is the control point for depth.
                */}
                <path 
                    d="M0,24 Q0,0 24,0 L135,0 C155,0 160,45 200,45 C240,45 245,0 265,0 L376,0 Q400,0 400,24 L400,72 L0,72 Z" 
                    fill="url(#navGradient)" 
                    stroke="url(#navBorder)"
                    strokeWidth="1"
                />
             </svg>
             
             {/* Shimmer Overlay */}
             <div className="absolute inset-0 rounded-[2rem] overflow-hidden opacity-20 pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[nav-shimmer_3s_infinite_linear]"></div>
             </div>
          </div>

          {/* 2. Navigation Items */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pb-1">
            {/* Left Items */}
            <div className="flex-1 flex justify-evenly items-center pr-4">
                {navItems.slice(0, 2).map((item) => {
                    const isActive = view === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                            className="flex flex-col items-center justify-center gap-1 w-14 h-full group active:scale-95 transition-transform"
                        >
                            <div className={clsx(
                                "p-1.5 rounded-xl transition-all duration-300 relative",
                                isActive ? "text-emerald-400 -translate-y-1" : "text-slate-500 group-hover:text-slate-300"
                            )}>
                                {isActive && <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-sm"></div>}
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                            </div>
                            <span className={clsx(
                                "text-[9px] font-bold tracking-wide transition-colors duration-300",
                                isActive ? "text-emerald-400" : "text-slate-500"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Spacer for FAB */}
            <div className="w-16 shrink-0" />

            {/* Right Items */}
            <div className="flex-1 flex justify-evenly items-center pl-4">
                {navItems.slice(3, 5).map((item) => {
                    const isActive = view === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                            className="flex flex-col items-center justify-center gap-1 w-14 h-full group active:scale-95 transition-transform"
                        >
                            <div className={clsx(
                                "p-1.5 rounded-xl transition-all duration-300 relative",
                                isActive ? "text-emerald-400 -translate-y-1" : "text-slate-500 group-hover:text-slate-300"
                            )}>
                                {isActive && <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-sm"></div>}
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                            </div>
                            <span className={clsx(
                                "text-[9px] font-bold tracking-wide transition-colors duration-300",
                                isActive ? "text-emerald-400" : "text-slate-500"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
          </div>

          {/* 3. Floating Action Button (Voice) - Positioned Absolutely to float above curve */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] w-16 h-16 z-30">
             <button
                onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }}
                className="relative w-full h-full flex items-center justify-center group focus:outline-none"
             >
                {/* Pulse Rings - Unclipped because parent has no overflow-hidden */}
                <div className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-[fab-pulse-ring_3s_infinite] pointer-events-none"></div>
                <div className="absolute -inset-2 rounded-full border border-cyan-400/20 animate-[fab-pulse-ring_3s_infinite_0.5s] pointer-events-none"></div>
                
                {/* Main Button Body */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 shadow-[0_8px_25px_rgba(16,185,129,0.5)] border-[3px] border-[#020617] group-active:scale-90 transition-transform duration-200 overflow-hidden">
                    
                    {/* Inner Shine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                    
                    {/* Rotating Glow */}
                    <div className="absolute inset-0 opacity-50 animate-[fab-rotate-glow_4s_linear_infinite]">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-md"></div>
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Mic size={28} className="text-white drop-shadow-md animate-[fab-float_3s_ease-in-out_infinite]" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Decorative Badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#020617] shadow-sm z-40 animate-bounce">
                    <Crown size={12} className="text-yellow-900" strokeWidth={3} />
                </div>
                
                <Sparkles size={14} className="absolute -top-2 -left-2 text-emerald-300 animate-pulse pointer-events-none" />
             </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default MobileNav;
