import React, { useEffect, useState, useRef } from 'react';
import { ViewState } from '../../types';
import { LayoutDashboard, Store, Mic, Landmark, Map as MapIcon, Sparkles, Zap, Crown, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastScrollY = useRef(0);
  const fabRef = useRef<HTMLDivElement>(null);
  
  // Smart Scroll Detection with Enhanced Logic
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        const isAtTop = currentScrollY < 50;
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
        const isScrollingUp = currentScrollY < lastScrollY.current;
        const isScrollingDown = currentScrollY > lastScrollY.current;
        const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);

        if (isAtTop || isAtBottom || (isScrollingUp && scrollDiff > 5)) {
            setIsVisible(true);
        } else if (isScrollingDown && scrollDiff > 10 && !isAtTop) {
            setIsVisible(false);
        }
        
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home', color: 'emerald', gradient: 'from-emerald-400 to-teal-500' },
    { id: 'MARKET', icon: Store, label: 'Market', color: 'violet', gradient: 'from-violet-400 to-purple-500' },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true, label: 'Voice', color: 'cyan', gradient: 'from-cyan-400 to-blue-600' },
    { id: 'SCHEMES', icon: Landmark, label: 'Schemes', color: 'sky', gradient: 'from-sky-400 to-indigo-500' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: 'Area', color: 'amber', gradient: 'from-amber-400 to-orange-500' },
  ];

  // Track active index for pill animation
  useEffect(() => {
    const index = navItems.findIndex(item => item.id === view);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [view]);

  return (
    <>
      {/* Ultra-Premium Animation & Effects Stylesheet */}
      <style>{`
        /* === FAB ANIMATIONS === */
        @keyframes fab-mega-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
            border-width: 3px; 
          }
          50% { 
            transform: scale(1.8); 
            opacity: 0.2; 
          }
          100% { 
            transform: scale(2.5); 
            opacity: 0; 
            border-width: 0px; 
          }
        }
        
        @keyframes fab-ripple-wave {
          0% { 
            transform: scale(0.85); 
            opacity: 0.8; 
            border-width: 2px; 
          }
          100% { 
            transform: scale(2.2); 
            opacity: 0; 
            border-width: 0px; 
          }
        }
        
        @keyframes fab-glow-intense {
          0%, 100% { 
            box-shadow: 
              0 0 30px rgba(6, 182, 212, 0.6),
              0 0 60px rgba(16, 185, 129, 0.4),
              0 12px 48px rgba(0, 0, 0, 0.8),
              inset 0 2px 0 rgba(255, 255, 255, 0.3),
              inset 0 -2px 8px rgba(0, 0, 0, 0.4);
          }
          50% { 
            box-shadow: 
              0 0 50px rgba(6, 182, 212, 0.9),
              0 0 100px rgba(16, 185, 129, 0.6),
              0 16px 64px rgba(0, 0, 0, 0.9),
              inset 0 2px 0 rgba(255, 255, 255, 0.4),
              inset 0 -2px 8px rgba(0, 0, 0, 0.5);
          }
        }
        
        @keyframes particle-orbit-fab {
          0% { 
            transform: rotate(0deg) translateX(50px) rotate(0deg); 
            opacity: 0.8; 
          }
          100% { 
            transform: rotate(360deg) translateX(50px) rotate(-360deg); 
            opacity: 0.8; 
          }
        }
        
        @keyframes float-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
        }
        
        /* === NAVIGATION BAR ANIMATIONS === */
        @keyframes nav-backdrop-glow {
          0%, 100% { 
            filter: drop-shadow(0 10px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 20px rgba(16,185,129,0.15)); 
          }
          50% { 
            filter: drop-shadow(0 12px 50px rgba(0,0,0,0.7)) drop-shadow(0 0 30px rgba(16,185,129,0.25)); 
          }
        }
        
        @keyframes glass-shimmer {
          0% { 
            transform: translateX(-100%) skewX(-20deg); 
            opacity: 0; 
          }
          50% { 
            opacity: 0.5; 
          }
          100% { 
            transform: translateX(200%) skewX(-20deg); 
            opacity: 0; 
          }
        }
        
        @keyframes border-flow {
          0%, 100% { 
            stroke-dashoffset: 0; 
          }
          50% { 
            stroke-dashoffset: 100; 
          }
        }
        
        /* === ICON & LABEL ANIMATIONS === */
        @keyframes icon-pop-scale {
          0% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.15) translateY(-4px); }
          100% { transform: scale(1) translateY(-3px); }
        }
        
        @keyframes label-glow-pulse {
          0%, 100% { 
            text-shadow: 0 0 8px currentColor; 
            opacity: 1; 
          }
          50% { 
            text-shadow: 0 0 15px currentColor, 0 0 25px currentColor; 
            opacity: 0.9; 
          }
        }
        
        @keyframes active-indicator-expand {
          0% { 
            transform: scale(0) rotate(0deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.2) rotate(180deg); 
            opacity: 1; 
          }
          100% { 
            transform: scale(1) rotate(360deg); 
            opacity: 1; 
          }
        }
        
        /* === PARTICLE & AMBIENT EFFECTS === */
        @keyframes star-twinkle-mobile {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(0.8) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.3) rotate(180deg); 
          }
        }
        
        @keyframes energy-pulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.5); 
          }
        }
        
        @keyframes gradient-wave {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        /* === APPLY ANIMATIONS === */
        .nav-backdrop { animation: nav-backdrop-glow 4s ease-in-out infinite; }
        .animate-fab-mega-pulse { animation: fab-mega-pulse 3s ease-out infinite; }
        .animate-fab-ripple-wave { animation: fab-ripple-wave 2.5s ease-out infinite; }
        .animate-fab-glow-intense { animation: fab-glow-intense 3s ease-in-out infinite; }
        .animate-particle-orbit-fab { animation: particle-orbit-fab 10s linear infinite; }
        .animate-float-bounce { animation: float-bounce 3s ease-in-out infinite; }
        .animate-glass-shimmer { animation: glass-shimmer 3s ease-in-out infinite; }
        .animate-icon-pop-scale { animation: icon-pop-scale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-label-glow-pulse { animation: label-glow-pulse 2s ease-in-out infinite; }
        .animate-active-indicator-expand { animation: active-indicator-expand 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-star-twinkle-mobile { animation: star-twinkle-mobile 3s ease-in-out infinite; }
        .animate-energy-pulse { animation: energy-pulse 2s ease-in-out infinite; }
        .animate-gradient-wave { animation: gradient-wave 5s ease infinite; }
        
        /* === CUSTOM BEZIER TRANSITIONS === */
        .transition-bounce-smooth { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .transition-liquid { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* Main Floating Container with Enhanced Transitions */}
      <div className={clsx(
          "lg:hidden fixed bottom-5 inset-x-3 z-[200] flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-[180%] opacity-0 scale-95"
      )}>
        
        {/* Ultra-Premium Navigation Pill Container */}
        <div className="relative w-full max-w-[440px] h-[5rem] pointer-events-auto group/nav">
          
          {/* Ambient Glow Layer */}
          <div className="absolute inset-0 -inset-x-4 h-full rounded-[2.75rem] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 blur-3xl opacity-60 animate-gradient-wave bg-[length:200%_200%] group-hover/nav:opacity-80 transition-opacity duration-700"></div>
          
          {/* Background Particles */}
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/30 animate-star-twinkle-mobile"
                style={{
                  top: `${-10 + Math.random() * 120}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* SVG Curved Background - iOS 26 Liquid Glass Style */}
          <div className="absolute inset-0 nav-backdrop">
            <svg viewBox="0 0 440 80" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                {/* Premium Gradient Definitions */}
                <linearGradient id="navGradientPremium" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(15, 23, 42, 0.98)" />
                  <stop offset="40%" stopColor="rgba(10, 37, 45, 0.96)" />
                  <stop offset="100%" stopColor="rgba(2, 6, 23, 1)" />
                </linearGradient>
                
                {/* Radial Gradient for Depth */}
                <radialGradient id="navRadialGlow" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                  <stop offset="70%" stopColor="rgba(6, 182, 212, 0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                
                {/* Animated Border Gradient */}
                <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                  <stop offset="50%" stopColor="rgba(6, 182, 212, 0.5)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
                </linearGradient>
                
                {/* Glass Blur Filter */}
                <filter id="glassBlur">
                  <feGaussianBlur stdDeviation="2" />
                  <feComponentTransfer>
                    <feFuncA type="discrete" tableValues="1 1" />
                  </feComponentTransfer>
                </filter>
              </defs>
              
              {/* Main Shape Path - Enhanced Curve */}
              <path 
                d="M0,28 Q0,0 28,0 L152,0 C162,0 172,8 180,20 Q195,42 220,42 Q245,42 260,20 C268,8 278,0 288,0 L412,0 Q440,0 440,28 L440,80 L0,80 Z" 
                fill="url(#navGradientPremium)" 
                stroke="url(#borderGradient)"
                strokeWidth="1.5"
              />
              
              {/* Radial Glow Overlay */}
              <path 
                d="M0,28 Q0,0 28,0 L152,0 C162,0 172,8 180,20 Q195,42 220,42 Q245,42 260,20 C268,8 278,0 288,0 L412,0 Q440,0 440,28 L440,80 L0,80 Z" 
                fill="url(#navRadialGlow)" 
                opacity="0.8"
              />
              
              {/* Top Accent Line */}
              <path 
                d="M28,1 L152,1 C162,1 172,9 180,21 Q195,43 220,43 Q245,43 260,21 C268,9 278,1 288,1 L412,1" 
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
            </svg>
            
            {/* Glass Shimmer Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-[2.75rem]">
              <div className="absolute w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-glass-shimmer"></div>
            </div>
          </div>

          {/* Navigation Items Grid */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pb-2">
            
            {/* Left Navigation Group */}
            <div className="flex-1 flex justify-around items-center">
              {navItems.slice(0, 2).map((item, index) => {
                const isActive = view === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => { 
                      setView(item.id as ViewState); 
                      triggerHaptic(); 
                      setActiveIndex(index);
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 w-20 h-full group/item active:scale-90 transition-bounce-smooth relative"
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-10 blur-xl animate-energy-pulse`}></div>
                    )}
                    
                    {/* Icon Container with Premium Glass */}
                    <div className={clsx(
                      "relative p-2.5 rounded-[1.125rem] transition-all duration-500 overflow-hidden backdrop-blur-xl border-2",
                      isActive 
                        ? `${item.color === 'emerald' ? 'text-emerald-400 bg-emerald-500/15 border-emerald-400/40' : 'text-violet-400 bg-violet-500/15 border-violet-400/40'} -translate-y-1.5 shadow-[0_0_20px_currentColor,0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] animate-icon-pop-scale` 
                        : "text-slate-400 bg-white/5 border-transparent group-hover/item:text-slate-200 group-hover/item:bg-white/10 group-hover/item:border-white/20"
                    )}>
                      {/* Icon Glow Background */}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 blur-lg`}></div>
                      )}
                      
                      {/* Top Highlight Bar */}
                      {isActive && (
                        <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-[1px]"></div>
                      )}
                      
                      {/* Icon */}
                      <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.8 : 2.2} 
                        className={clsx(
                          "relative z-10 transition-all duration-500",
                          isActive && "drop-shadow-[0_0_8px_currentColor]"
                        )}
                      />
                      
                      {/* Corner Accent Dots */}
                      {isActive && (
                        <>
                          <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/40 blur-[1px] animate-pulse"></div>
                          <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-white/30 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                    
                    {/* Label with Enhanced Typography */}
                    <span className={clsx(
                      "text-[10px] font-black tracking-wider uppercase transition-all duration-500 relative",
                      isActive 
                        ? `${item.color === 'emerald' ? 'text-emerald-400' : 'text-violet-400'} scale-105 animate-label-glow-pulse` 
                        : "text-slate-500 group-hover/item:text-slate-300"
                    )}>
                      {item.label}
                      
                      {/* Active Underline */}
                      {isActive && (
                        <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent rounded-full animate-active-indicator-expand"></div>
                      )}
                    </span>
                    
                    {/* Floating Star Accent */}
                    {isActive && (
                      <Star 
                        size={10} 
                        className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
                        fill="currentColor"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Center Spacer for FAB */}
            <div className="w-24 shrink-0" />

            {/* Right Navigation Group */}
            <div className="flex-1 flex justify-around items-center">
              {navItems.slice(3, 5).map((item, index) => {
                const isActive = view === item.id;
                const actualIndex = index + 3;
                return (
                  <button 
                    key={item.id}
                    onClick={() => { 
                      setView(item.id as ViewState); 
                      triggerHaptic(); 
                      setActiveIndex(actualIndex);
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 w-20 h-full group/item active:scale-90 transition-bounce-smooth relative"
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-10 blur-xl animate-energy-pulse`}></div>
                    )}
                    
                    {/* Icon Container */}
                    <div className={clsx(
                      "relative p-2.5 rounded-[1.125rem] transition-all duration-500 overflow-hidden backdrop-blur-xl border-2",
                      isActive 
                        ? `${item.color === 'sky' ? 'text-sky-400 bg-sky-500/15 border-sky-400/40' : 'text-amber-400 bg-amber-500/15 border-amber-400/40'} -translate-y-1.5 shadow-[0_0_20px_currentColor,0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] animate-icon-pop-scale` 
                        : "text-slate-400 bg-white/5 border-transparent group-hover/item:text-slate-200 group-hover/item:bg-white/10 group-hover/item:border-white/20"
                    )}>
                      {isActive && (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 blur-lg`}></div>
                          <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-[1px]"></div>
                        </>
                      )}
                      
                      <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.8 : 2.2} 
                        className={clsx(
                          "relative z-10 transition-all duration-500",
                          isActive && "drop-shadow-[0_0_8px_currentColor]"
                        )}
                      />
                      
                      {isActive && (
                        <>
                          <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/40 blur-[1px] animate-pulse"></div>
                          <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-white/30 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                    
                    <span className={clsx(
                      "text-[10px] font-black tracking-wider uppercase transition-all duration-500 relative",
                      isActive 
                        ? `${item.color === 'sky' ? 'text-sky-400' : 'text-amber-400'} scale-105 animate-label-glow-pulse` 
                        : "text-slate-500 group-hover/item:text-slate-300"
                    )}>
                      {item.label}
                      {isActive && (
                        <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent rounded-full animate-active-indicator-expand"></div>
                      )}
                    </span>
                    
                    {isActive && (
                      <Star 
                        size={10} 
                        className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
                        fill="currentColor"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ultra-Premium Floating Action Button (Voice) */}
          <div 
            ref={fabRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[45%] w-20 h-20 z-30"
          >
            <button
              onClick={() => { 
                setView('VOICE_ASSISTANT'); 
                triggerHaptic(); 
              }}
              className="relative w-full h-full flex items-center justify-center group/fab focus:outline-none"
            >
              {/* Multi-Layer Ripple System */}
              <div className="absolute -inset-6 rounded-full border-2 border-emerald-400/50 opacity-0 group-hover/fab:opacity-100 animate-fab-mega-pulse pointer-events-none"></div>
              <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/40 opacity-0 group-hover/fab:opacity-100 animate-fab-ripple-wave pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -inset-2 rounded-full border border-teal-400/30 opacity-0 group-hover/fab:opacity-100 animate-fab-ripple-wave pointer-events-none" style={{ animationDelay: '1s' }}></div>
              
              {/* Orbiting Energy Particles */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_12px_currentColor] animate-particle-orbit-fab pointer-events-none"
                  style={{ 
                    animationDelay: `${i * 2.5}s`,
                    animationDuration: `${10 + i * 2}s`
                  }}
                ></div>
              ))}
              
              {/* Main FAB Core - iOS 26 Style */}
              <div className="relative w-[4.5rem] h-[4.5rem] rounded-[1.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center animate-fab-glow-intense group-active/fab:scale-90 transition-all duration-300 border-[4px] border-[#020617] overflow-hidden shadow-[0_12px_48px_rgba(16,185,129,0.6)] group-hover/fab:shadow-[0_16px_64px_rgba(16,185,129,0.8)]">
                
                {/* Inner Gradient Layers */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/25"></div>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent blur-sm rounded-t-[1.5rem]"></div>
                
                {/* Dynamic Light Sweep */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover/fab:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                
                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover/fab:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-emerald-400/60 via-cyan-400/60 to-emerald-400/60 blur-md animate-gradient-wave bg-[length:200%_200%]"></div>
                </div>
                
                {/* Corner Highlights */}
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/40 blur-sm animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-emerald-200/40 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Micro Icon with Enhanced Animation */}
                <Mic 
                  size={32} 
                  className={clsx(
                    "relative z-30 text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover/fab:scale-110",
                    view === 'VOICE_ASSISTANT' && "animate-float-bounce"
                  )}
                  strokeWidth={3}
                />
                
                {/* Active Pulse Ring */}
                {view === 'VOICE_ASSISTANT' && (
                  <div className="absolute inset-0 rounded-[1.5rem] border-2 border-white/60 animate-ping"></div>
                )}
              </div>
              
              {/* Premium Badge Icons */}
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] border-2 border-[#020617] animate-bounce pointer-events-none">
                <Crown size={14} className="text-amber-900" strokeWidth={2.8} />
              </div>
              
              <Sparkles 
                size={14} 
                className="absolute -top-2 -left-2 text-emerald-300 animate-pulse drop-shadow-[0_0_10px_currentColor] pointer-events-none"
                strokeWidth={2.5}
              />
              
              <Zap 
                size={12} 
                className="absolute -bottom-1 -right-1 text-cyan-300 animate-bounce drop-shadow-[0_0_8px_currentColor] pointer-events-none"
                strokeWidth={2.5}
                fill="currentColor"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
