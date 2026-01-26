
import React, { useEffect, useState, useRef } from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon, Sparkles, Zap, Crown, Star, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);
  const containerRef = useRef<EventTarget | null>(null);
  
  // Smart Scroll Detection
  useEffect(() => {
    setIsVisible(true);

    const findScrollContainer = () => {
        const containers = document.querySelectorAll('.overflow-y-auto');
        if (containers.length > 0) return containers[containers.length - 1] as HTMLElement;
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

        currentY = Math.max(0, currentY);
        const isAtTop = currentY < 60;
        const isAtBottom = currentY >= maxY - 60;
        const isScrollingUp = currentY < lastScrollY.current;
        const isScrollingDown = currentY > lastScrollY.current;
        const scrollDiff = Math.abs(currentY - lastScrollY.current);

        if (isAtTop || isAtBottom) {
             setIsVisible(true);
        } else if (isScrollingUp && scrollDiff > 5) {
             setIsVisible(true);
        } else if (isScrollingDown && scrollDiff > 20) { 
             setIsVisible(false);
        }
        
        lastScrollY.current = currentY;
    };

    const timeoutId = setTimeout(() => {
        const el = findScrollContainer();
        if (el) {
            if (containerRef.current) containerRef.current.removeEventListener('scroll', handleScroll);
            el.addEventListener('scroll', handleScroll, { passive: true });
            containerRef.current = el;
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
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home', color: 'emerald', gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(16, 185, 129, 0.4)' },
    { id: 'MARKET', icon: Store, label: 'Market', color: 'violet', gradient: 'from-violet-400 to-purple-500', glow: 'rgba(139, 92, 246, 0.4)' },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true, label: 'Voice', color: 'cyan', gradient: 'from-cyan-400 to-blue-600', glow: 'rgba(6, 182, 212, 0.4)' },
    { id: 'SCHEMES', icon: Landmark, label: 'Schemes', color: 'sky', gradient: 'from-sky-400 to-indigo-500', glow: 'rgba(56, 189, 248, 0.4)' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: 'Area', color: 'amber', gradient: 'from-amber-400 to-orange-500', glow: 'rgba(251, 191, 36, 0.4)' },
    { id: 'ADMIN', icon: Shield, label: 'Logs', color: 'slate', gradient: 'from-slate-400 to-gray-500', glow: 'rgba(148, 163, 184, 0.4)' },
  ];

  useEffect(() => {
    const index = navItems.findIndex(item => item.id === view);
    if (index !== -1) setActiveIndex(index);
  }, [view]);

  return (
    <>
      <style>{`
        /* === ULTRA-PREMIUM ANIMATIONS === */
        @keyframes fab-mega-pulse {
          0% { transform: scale(1); opacity: 0.6; border-width: 3px; }
          50% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
        @keyframes fab-orbit-particle {
          0% { transform: rotate(0deg) translateX(35px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
        }
        @keyframes fab-glow-intense {
          0%, 100% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.4), 0 8px 32px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.9), 0 0 80px rgba(16, 185, 129, 0.6), 0 12px 48px rgba(0, 0, 0, 0.9), inset 0 2px 0 rgba(255, 255, 255, 0.4); }
        }
        @keyframes nav-glow-pulse {
          0%, 100% { filter: drop-shadow(0 -8px 24px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(16,185,129,0.15)); }
          50% { filter: drop-shadow(0 -12px 32px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(16,185,129,0.25)); }
        }
        @keyframes icon-pop-bounce {
          0% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.15) translateY(-5px); }
          60% { transform: scale(0.95) translateY(-2px); }
          100% { transform: scale(1) translateY(-4px); }
        }
      `}</style>

      {/* Main Container */}
      <div className={clsx(
          "lg:hidden fixed bottom-6 inset-x-4 z-[200] flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-[160%] opacity-0 scale-95"
      )}>
        
        {/* Navigation Pill */}
        <div className="relative w-full max-w-[440px] h-[5rem] pointer-events-auto group/nav">
          
          {/* Background Layer */}
          <div className="absolute inset-0 animate-[nav-glow-pulse_4s_ease-in-out_infinite]">
             <svg viewBox="0 0 420 80" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="navGradientPremium" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(15, 23, 42, 0.98)" />
                        <stop offset="100%" stopColor="rgba(2, 6, 23, 1)" />
                    </linearGradient>
                    <linearGradient id="navBorderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                        <stop offset="50%" stopColor="rgba(6, 182, 212, 0.6)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
                    </linearGradient>
                </defs>
                <path 
                    d="M0,28 Q0,0 28,0 L150,0 C165,0 175,10 185,22 Q200,48 210,48 Q220,48 235,22 C245,10 255,0 270,0 L392,0 Q420,0 420,28 L420,80 L0,80 Z" 
                    fill="url(#navGradientPremium)" 
                    stroke="url(#navBorderGlow)"
                    strokeWidth="2"
                />
             </svg>
          </div>

          {/* Navigation Items */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pb-2">
            
            {/* Left Group (2 Items) */}
            <div className="flex-[2] flex justify-evenly items-center pr-4">
                {navItems.slice(0, 2).map((item) => {
                    const isActive = view === item.id;
                    return (
                        <NavItem key={item.id} item={item} isActive={isActive} onClick={() => setView(item.id as ViewState)} />
                    );
                })}
            </div>

            {/* Center Spacer */}
            <div className="w-20 shrink-0" />

            {/* Right Group (3 Items) */}
            <div className="flex-[3] flex justify-evenly items-center pl-2">
                {navItems.slice(3, 6).map((item) => {
                    const isActive = view === item.id;
                    return (
                        <NavItem key={item.id} item={item} isActive={isActive} onClick={() => setView(item.id as ViewState)} />
                    );
                })}
            </div>
          </div>

          {/* Ultra-Premium FAB */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] w-[4.5rem] h-[4.5rem] z-30">
             <button
                onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }}
                className="relative w-full h-full flex items-center justify-center group/fab focus:outline-none"
             >
                <div className="absolute -inset-6 rounded-full border-2 border-emerald-400/40 animate-[fab-mega-pulse_3s_ease-out_infinite] pointer-events-none"></div>
                <div className="relative w-full h-full rounded-[1.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center animate-[fab-glow-intense_3s_ease-in-out_infinite] group-active/fab:scale-90 transition-all duration-300 border-[4px] border-[#020617] overflow-hidden">
                    <Mic size={32} className={clsx("relative z-30 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)]", view === 'VOICE_ASSISTANT' && "animate-pulse")} strokeWidth={3} />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-[#020617]">
                    <Crown size={14} className="text-amber-900" strokeWidth={2.8} />
                </div>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ item, isActive, onClick }: any) => (
    <button 
        onClick={() => { onClick(); triggerHaptic(); }}
        className="relative flex flex-col items-center justify-center gap-1 w-12 h-full group/item active:scale-90 transition-all duration-300"
    >
        <div className={clsx(
            "relative p-2 rounded-xl transition-all duration-500 backdrop-blur-xl border-2",
            isActive 
                ? `bg-gradient-to-br ${item.gradient} bg-opacity-15 border-${item.color}-400/40 shadow-[0_0_15px_currentColor] animate-[icon-pop-bounce_0.6s_ease-out]`
                : "bg-white/5 border-transparent text-slate-500"
        )}>
            <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.8 : 2.2} 
                className={clsx("relative z-10 transition-all duration-500", isActive && `text-${item.color}-400`)}
            />
        </div>
        <span className={clsx(
            "text-[9px] font-black tracking-wider uppercase transition-all duration-500",
            isActive ? `text-${item.color}-400` : "text-slate-500"
        )}>
            {item.label}
        </span>
    </button>
);

export default MobileNav;
