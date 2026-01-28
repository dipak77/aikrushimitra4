
import React, { useEffect, useState, useRef } from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon, Sparkles, Zap, Crown, Star } from 'lucide-react';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);
  const containerRef = useRef<EventTarget | null>(null);
  
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

        if (isAtTop || isAtBottom) setIsVisible(true);
        else if (isScrollingUp && scrollDiff > 5) setIsVisible(true);
        else if (isScrollingDown && scrollDiff > 20) setIsVisible(false);
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
        if (containerRef.current) containerRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [view]);

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home', color: 'emerald', gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(16, 185, 129, 0.4)' },
    { id: 'MARKET', icon: Store, label: 'Market', color: 'violet', gradient: 'from-violet-400 to-purple-500', glow: 'rgba(139, 92, 246, 0.4)' },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true, label: 'Voice', color: 'cyan', gradient: 'from-cyan-400 to-blue-600', glow: 'rgba(6, 182, 212, 0.4)' },
    { id: 'SCHEMES', icon: Landmark, label: 'Schemes', color: 'sky', gradient: 'from-sky-400 to-indigo-500', glow: 'rgba(56, 189, 248, 0.4)' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: 'Area', color: 'amber', gradient: 'from-amber-400 to-orange-500', glow: 'rgba(251, 191, 36, 0.4)' },
  ];

  useEffect(() => {
    const index = navItems.findIndex(item => item.id === view);
    if (index !== -1) setActiveIndex(index);
  }, [view]);

  return (
    <>
      <style>{`
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
          0%, 100% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.6); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.9); }
        }
        @keyframes fab-float-smooth {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes nav-shimmer-flow {
          0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(150%) skewX(-20deg); opacity: 0; }
        }
        @keyframes nav-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(16,185,129,0.15)); }
          50% { filter: drop-shadow(0 0 30px rgba(16,185,129,0.25)); }
        }
        @keyframes nav-float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes icon-pop-bounce {
          0% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.15) translateY(-5px); }
          100% { transform: scale(1) translateY(-4px); }
        }
        @keyframes icon-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px currentColor; }
          50% { box-shadow: 0 0 20px currentColor; }
        }
        @keyframes label-slide-fade {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes star-twinkle-float {
          0%, 100% { opacity: 0.3; transform: scale(0.8) translateY(0); }
          50% { opacity: 1; transform: scale(1.3) translateY(-8px); }
        }
        @keyframes gradient-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes badge-bounce-glow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div className={clsx(
          "lg:hidden fixed bottom-6 inset-x-4 z-[200] flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-[160%] opacity-0 scale-95"
      )}>
        <div className="relative w-full max-w-[420px] h-[5rem] pointer-events-auto group/nav animate-[nav-float-gentle_4s_ease-in-out_infinite]">
          <div className="absolute inset-0 -inset-x-6 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-emerald-500/15 blur-3xl opacity-50 group-hover/nav:opacity-70 transition-opacity duration-700 rounded-full bg-[length:200%_200%] animate-[gradient-wave_6s_ease_infinite]"></div>
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400" style={{ top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%`, animation: `star-twinkle-float ${3 + Math.random() * 3}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s`, opacity: 0.3 }}></div>
            ))}
          </div>
          
          <div className="absolute inset-0 animate-[nav-glow-pulse_4s_ease-in-out_infinite]">
             <svg viewBox="0 0 420 80" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="navGradientPremium" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(15, 23, 42, 0.98)" />
                        <stop offset="40%" stopColor="rgba(10, 37, 45, 0.96)" />
                        <stop offset="100%" stopColor="rgba(2, 6, 23, 1)" />
                    </linearGradient>
                    <linearGradient id="navBorderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)"><animate attributeName="stop-color" values="rgba(16, 185, 129, 0.3);rgba(6, 182, 212, 0.5);rgba(16, 185, 129, 0.3)" dur="3s" repeatCount="indefinite" /></stop>
                        <stop offset="50%" stopColor="rgba(6, 182, 212, 0.6)"><animate attributeName="stop-color" values="rgba(6, 182, 212, 0.6);rgba(16, 185, 129, 0.8);rgba(6, 182, 212, 0.6)" dur="3s" repeatCount="indefinite" /></stop>
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)"><animate attributeName="stop-color" values="rgba(16, 185, 129, 0.3);rgba(6, 182, 212, 0.5);rgba(16, 185, 129, 0.3)" dur="3s" repeatCount="indefinite" /></stop>
                    </linearGradient>
                    <radialGradient id="navRadialDepth" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.12)" />
                        <stop offset="70%" stopColor="rgba(6, 182, 212, 0.06)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
                <path d="M0,28 Q0,0 28,0 L150,0 C165,0 175,10 185,22 Q200,48 210,48 Q220,48 235,22 C245,10 255,0 270,0 L392,0 Q420,0 420,28 L420,80 L0,80 Z" fill="url(#navGradientPremium)" stroke="url(#navBorderGlow)" strokeWidth="2" />
                <path d="M0,28 Q0,0 28,0 L150,0 C165,0 175,10 185,22 Q200,48 210,48 Q220,48 235,22 C245,10 255,0 270,0 L392,0 Q420,0 420,28 L420,80 L0,80 Z" fill="url(#navRadialDepth)" />
                <path d="M28,2 L150,2 C165,2 175,12 185,24 Q200,50 210,50 Q220,50 235,24 C245,12 255,2 270,2 L392,2" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" opacity="0.7" />
             </svg>
             <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[nav-shimmer-flow_4s_ease-in-out_infinite]"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-[nav-shimmer-flow_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
             </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-3 pb-2">
            <div className="flex-1 flex justify-evenly items-center pr-6">
                {navItems.slice(0, 2).map((item, idx) => {
                    const isActive = view === item.id;
                    return (
                        <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} className="relative flex flex-col items-center justify-center gap-1.5 w-16 h-full group/item active:scale-90 transition-all duration-300">
                            {isActive && <div className="absolute inset-0 rounded-2xl opacity-20 blur-2xl" style={{ background: `linear-gradient(135deg, ${item.glow}, transparent)` }}></div>}
                            <div className={clsx("relative p-2.5 rounded-[1.125rem] transition-all duration-500 overflow-hidden backdrop-blur-xl border-2", isActive ? `bg-gradient-to-br ${item.gradient} bg-opacity-15 border-${item.color}-400/40 shadow-[0_0_20px_currentColor] animate-[icon-pop-bounce_0.6s_ease-out] animate-[icon-glow-pulse_2s_ease-in-out_infinite]` : "bg-white/5 border-transparent text-slate-500 group-hover/item:bg-white/10 group-hover/item:border-white/20 group-hover/item:text-slate-300")}>
                                {isActive && <><div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-15 blur-lg`}></div><div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full blur-[1px]"></div></>}
                                <item.icon size={24} strokeWidth={isActive ? 2.8 : 2.2} className={clsx("relative z-10 transition-all duration-500", isActive && `text-${item.color}-400 drop-shadow-[0_0_10px_currentColor]`)} />
                                {isActive && <><div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/50 blur-[1px] animate-pulse"></div><div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-white/40 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }}></div></>}
                            </div>
                            <span className={clsx("text-[10px] font-black tracking-wider uppercase transition-all duration-500 relative", isActive ? `text-${item.color}-400 scale-105 animate-[label-slide-fade_0.4s_ease-out]` : "text-slate-500 group-hover/item:text-slate-300")}>{item.label}{isActive && <div className={`absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${item.color}-400 to-transparent rounded-full shadow-[0_0_8px_currentColor]`}></div>}</span>
                            {isActive && <Star size={10} className={`absolute -top-1 -right-1 text-${item.color}-300 animate-pulse`} fill="currentColor" />}
                        </button>
                    );
                })}
            </div>
            <div className="w-20 shrink-0" />
            <div className="flex-1 flex justify-evenly items-center pl-6">
                {navItems.slice(3, 5).map((item, idx) => {
                    const isActive = view === item.id;
                    return (
                        <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} className="relative flex flex-col items-center justify-center gap-1.5 w-16 h-full group/item active:scale-90 transition-all duration-300">
                            {isActive && <div className="absolute inset-0 rounded-2xl opacity-20 blur-2xl" style={{ background: `linear-gradient(135deg, ${item.glow}, transparent)` }}></div>}
                            <div className={clsx("relative p-2.5 rounded-[1.125rem] transition-all duration-500 overflow-hidden backdrop-blur-xl border-2", isActive ? `bg-gradient-to-br ${item.gradient} bg-opacity-15 border-${item.color}-400/40 shadow-[0_0_20px_currentColor] animate-[icon-pop-bounce_0.6s_ease-out] animate-[icon-glow-pulse_2s_ease-in-out_infinite]` : "bg-white/5 border-transparent text-slate-500 group-hover/item:bg-white/10 group-hover/item:border-white/20 group-hover/item:text-slate-300")}>
                                {isActive && <><div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-15 blur-lg`}></div><div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full blur-[1px]"></div></>}
                                <item.icon size={24} strokeWidth={isActive ? 2.8 : 2.2} className={clsx("relative z-10 transition-all duration-500", isActive && `text-${item.color}-400 drop-shadow-[0_0_10px_currentColor]`)} />
                                {isActive && <><div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/50 blur-[1px] animate-pulse"></div><div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-white/40 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }}></div></>}
                            </div>
                            <span className={clsx("text-[10px] font-black tracking-wider uppercase transition-all duration-500 relative", isActive ? `text-${item.color}-400 scale-105 animate-[label-slide-fade_0.4s_ease-out]` : "text-slate-500 group-hover/item:text-slate-300")}>{item.label}{isActive && <div className={`absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${item.color}-400 to-transparent rounded-full shadow-[0_0_8px_currentColor]`}></div>}</span>
                            {isActive && <Star size={10} className={`absolute -top-1 -right-1 text-${item.color}-300 animate-pulse`} fill="currentColor" />}
                        </button>
                    );
                })}
            </div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] w-[4.5rem] h-[4.5rem] z-30">
             <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} className="relative w-full h-full flex items-center justify-center group/fab focus:outline-none">
                <div className="absolute -inset-6 rounded-full border-2 border-emerald-400/40 animate-[fab-mega-pulse_3s_ease-out_infinite] pointer-events-none"></div>
                <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/30 animate-[fab-mega-pulse_3s_ease-out_infinite] pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -inset-2 rounded-full border border-teal-400/20 animate-[fab-mega-pulse_3s_ease-out_infinite] pointer-events-none" style={{ animationDelay: '1s' }}></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ animation: `fab-orbit-particle ${8 + i * 2}s linear infinite`, animationDelay: `${i * 2}s` }}>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 shadow-[0_0_12px_currentColor]"></div>
                  </div>
                ))}
                <div className="relative w-full h-full rounded-[1.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center animate-[fab-glow-intense_3s_ease-in-out_infinite] group-active/fab:scale-90 transition-all duration-300 border-[4px] border-[#020617] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/25"></div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent blur-sm rounded-t-[1.5rem]"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover/fab:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="absolute inset-0 opacity-40"><div className="absolute inset-0 bg-gradient-to-r from-emerald-300/50 via-cyan-300/50 to-emerald-300/50 bg-[length:200%_200%] animate-[gradient-wave_4s_ease_infinite] blur-md"></div></div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/40 blur-sm animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-emerald-200/40 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <Mic size={32} className={clsx("relative z-30 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)] transition-all duration-300", view === 'VOICE_ASSISTANT' && "animate-[fab-float-smooth_3s_ease-in-out_infinite]")} strokeWidth={3} />
                    {view === 'VOICE_ASSISTANT' && <div className="absolute inset-0 rounded-[1.5rem] border-2 border-white/60 animate-ping"></div>}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] border-2 border-[#020617] animate-[badge-bounce-glow_3s_ease-in-out_infinite] pointer-events-none">
                    <Crown size={14} className="text-amber-900" strokeWidth={2.8} />
                </div>
                <Sparkles size={14} className="absolute -top-2 -left-2 text-emerald-300 animate-pulse drop-shadow-[0_0_10px_currentColor] pointer-events-none" strokeWidth={2.5} />
                <Zap size={12} className="absolute -bottom-1 -right-1 text-cyan-300 animate-bounce drop-shadow-[0_0_8px_currentColor] pointer-events-none" strokeWidth={2.5} fill="currentColor" />
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
    