
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Language } from '../../types';
import { LayoutDashboard, Store, CloudSun, Landmark, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Mic, Zap, Sparkles, Crown, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Track mouse movement for interactive orb effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const items = [
    { id: 'DASHBOARD', icon: LayoutDashboard, color: 'emerald', gradient: 'from-emerald-400 to-teal-500' },
    { id: 'MARKET', icon: Store, color: 'violet', gradient: 'from-violet-400 to-purple-500' },
    { id: 'WEATHER', icon: CloudSun, color: 'amber', gradient: 'from-amber-400 to-orange-500' },
    { id: 'SCHEMES', icon: Landmark, color: 'cyan', gradient: 'from-cyan-400 to-blue-500' },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, color: 'rose', gradient: 'from-rose-400 to-pink-500' },
    { id: 'SOIL', icon: FlaskConical, color: 'lime', gradient: 'from-lime-400 to-green-500' },
    { id: 'YIELD', icon: TrendingUp, color: 'fuchsia', gradient: 'from-fuchsia-400 to-purple-500' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, color: 'sky', gradient: 'from-sky-400 to-indigo-500' },
    { id: 'ADMIN', icon: Shield, color: 'slate', gradient: 'from-slate-400 to-gray-500' },
  ];

  return (
    <>
      {/* Ultra-Premium Animation Keyframes */}
      <style>{`
        /* Orb Animations */
        @keyframes orb-float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.4; 
          }
          33% { 
            transform: translate(20px, -30px) scale(1.1); 
            opacity: 0.6; 
          }
          66% { 
            transform: translate(-15px, 20px) scale(0.95); 
            opacity: 0.5; 
          }
        }
        
        @keyframes orb-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.6; 
          }
        }
        
        @keyframes orb-drift {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          50% { 
            transform: translateY(-40px) rotate(180deg); 
          }
        }
        
        /* Logo Animations */
        @keyframes logo-glow-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(16, 185, 129, 0.4),
              0 0 40px rgba(16, 185, 129, 0.2),
              inset 0 0 20px rgba(16, 185, 129, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 35px rgba(16, 185, 129, 0.7),
              0 0 60px rgba(16, 185, 129, 0.4),
              inset 0 0 30px rgba(16, 185, 129, 0.2);
          }
        }
        
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes logo-shine {
          0% { 
            transform: translateX(-100%) translateY(-100%) rotate(45deg); 
            opacity: 0; 
          }
          50% { 
            opacity: 1; 
          }
          100% { 
            transform: translateX(100%) translateY(100%) rotate(45deg); 
            opacity: 0; 
          }
        }
        
        /* Navigation Item Animations */
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.1); }
        }
        
        @keyframes ripple-expand {
          0% { 
            transform: scale(0); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(2.5); 
            opacity: 0; 
          }
        }
        
        @keyframes shimmer-slide {
          0% { 
            transform: translateX(-100%) translateY(-100%); 
            opacity: 0; 
          }
          50% { 
            opacity: 0.5; 
          }
          100% { 
            transform: translateX(100%) translateY(100%); 
            opacity: 0; 
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px currentColor); 
            opacity: 1; 
          }
          50% { 
            filter: drop-shadow(0 0 12px currentColor); 
            opacity: 0.9; 
          }
        }
        
        /* Active Indicator Animations */
        @keyframes indicator-slide-in {
          from { 
            transform: translateX(-20px) scaleY(0); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0) scaleY(1); 
            opacity: 1; 
          }
        }
        
        @keyframes glow-expand {
          0% { 
            box-shadow: 0 0 0px currentColor; 
          }
          100% { 
            box-shadow: 0 0 20px currentColor; 
          }
        }
        
        /* Tooltip Animations */
        @keyframes tooltip-slide {
          from { 
            transform: translateX(-10px); 
            opacity: 0; 
            filter: blur(4px); 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
            filter: blur(0); 
          }
        }
        
        /* Voice Button Animations */
        @keyframes voice-ripple {
          0% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          100% { 
            transform: scale(2); 
            opacity: 0; 
          }
        }
        
        @keyframes voice-glow {
          0%, 100% { 
            box-shadow: 
              0 0 25px rgba(6, 182, 212, 0.5),
              0 0 50px rgba(6, 182, 212, 0.3),
              0 8px 32px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          50% { 
            box-shadow: 
              0 0 40px rgba(6, 182, 212, 0.8),
              0 0 80px rgba(6, 182, 212, 0.5),
              0 12px 48px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        }
        
        /* Particle Animations */
        @keyframes particle-float {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0; 
          }
          10%, 90% { 
            opacity: 1; 
          }
          50% { 
            transform: translate(var(--tx), var(--ty)); 
          }
        }
        
        @keyframes star-twinkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(0.8); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
        }
        
        /* Glass Refraction */
        @keyframes glass-wave {
          0% { 
            transform: translateY(-100%); 
            opacity: 0; 
          }
          50% { 
            opacity: 0.3; 
          }
          100% { 
            transform: translateY(100%); 
            opacity: 0; 
          }
        }
        
        /* Apply Custom Animations */
        .animate-orb-float { animation: orb-float 20s ease-in-out infinite; }
        .animate-orb-pulse { animation: orb-pulse 4s ease-in-out infinite; }
        .animate-orb-drift { animation: orb-drift 15s ease-in-out infinite; }
        .animate-logo-glow-pulse { animation: logo-glow-pulse 3s ease-in-out infinite; }
        .animate-logo-spin { animation: logo-spin 20s linear infinite; }
        .animate-logo-shine { animation: logo-shine 3s ease-in-out infinite; }
        .animate-icon-bounce { animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-ripple-expand { animation: ripple-expand 1s ease-out; }
        .animate-shimmer-slide { animation: shimmer-slide 2s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-indicator-slide-in { animation: indicator-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-glow-expand { animation: glow-expand 0.3s ease-out forwards; }
        .animate-tooltip-slide { animation: tooltip-slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-voice-ripple { animation: voice-ripple 2s ease-out infinite; }
        .animate-voice-glow { animation: voice-glow 3s ease-in-out infinite; }
        .animate-particle-float { animation: particle-float 8s ease-in-out infinite; }
        .animate-star-twinkle { animation: star-twinkle 3s ease-in-out infinite; }
        .animate-glass-wave { animation: glass-wave 8s ease-in-out infinite; }
        
        /* Custom Scrollbar */
        .luxury-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .luxury-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16,185,129,0.4), rgba(6,182,212,0.4));
          border-radius: 10px;
          transition: background 0.3s;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16,185,129,0.7), rgba(6,182,212,0.7));
        }
      `}</style>

      <div 
        ref={sidebarRef}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-28 flex-col z-50 items-center py-8 overflow-hidden group/sidebar"
      >
        {/* Ultra-Premium Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/95 via-[#0f172a]/90 to-[#020617]/95 backdrop-blur-[60px]"></div>
        
        {/* Animated Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-cyan-900/20 opacity-60"></div>
        
        {/* Dynamic Orb Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary Orb - Emerald */}
          <div 
            className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent blur-[60px] animate-orb-float"
            style={{ 
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` 
            }}
          ></div>
          
          {/* Secondary Orb - Cyan */}
          <div 
            className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full bg-gradient-to-tl from-cyan-400/25 via-blue-500/15 to-transparent blur-[50px] animate-orb-pulse"
            style={{ 
              animationDelay: '1s',
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * 0.015}px)` 
            }}
          ></div>
          
          {/* Tertiary Orb - Purple Accent */}
          <div 
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-transparent blur-[45px] animate-orb-drift"
            style={{ 
              animationDelay: '2s',
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)` 
            }}
          ></div>
          
          {/* Ambient Particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/40 animate-star-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Glass Refraction Wave */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent animate-glass-wave"></div>
        </div>
        
        {/* Premium Border System */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent blur-sm"></div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center w-full h-full">
          
          {/* Ultra-Premium Logo with Crown */}
          <div className="relative mb-10 group/logo cursor-pointer" onClick={() => setView('DASHBOARD')}>
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/40 to-cyan-500/40 blur-xl animate-logo-glow-pulse group-hover/logo:scale-110 transition-transform duration-500"></div>
            
            {/* Rotating Border */}
            <div className="absolute inset-0 w-16 h-16 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/60 via-cyan-400/60 to-emerald-400/60 animate-logo-spin blur-sm"></div>
            </div>
            
            {/* Main Logo Container */}
            <div className="relative w-16 h-16 rounded-full border-2 border-emerald-400/40 flex items-center justify-center bg-gradient-to-br from-[#0a250c]/90 to-[#051a08]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] group-hover/logo:scale-105 group-hover/logo:border-emerald-400/60 transition-all duration-500 overflow-hidden">
              
              {/* Inner Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 blur-xl"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent animate-logo-shine"></div>
              </div>
              
              {/* AI Core Badge */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover/logo:shadow-[0_0_30px_rgba(16,185,129,0.8)] transition-shadow duration-500">
                <span className="text-black font-black text-sm tracking-wider drop-shadow-md">AI</span>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-300/60 blur-[1px]"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-cyan-300/60 blur-[1px]"></div>
            </div>
            
            {/* Floating Crown Icon */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-300/30 animate-bounce">
              <Crown size={14} className="text-amber-900" strokeWidth={2.5} />
            </div>
            
            {/* Sparkle Accents */}
            <Sparkles 
              size={12} 
              className="absolute -top-2 -left-2 text-emerald-300 animate-pulse"
              strokeWidth={2}
            />
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col gap-3 w-full items-center overflow-y-auto luxury-scrollbar py-2 px-2">
            {items.map((item, index) => {
              const active = view === item.id;
              
              return (
                <button 
                  key={item.id} 
                  onClick={() => { 
                    setView(item.id as ViewState); 
                    triggerHaptic(); 
                  }}
                  className="group/item relative w-16 h-16 flex items-center justify-center transition-all duration-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Active Indicator - Premium Pill */}
                  <div className={clsx(
                    "absolute left-[-12px] top-1/2 -translate-y-1/2 w-2 h-10 rounded-r-full transition-all duration-500",
                    active 
                      ? `bg-gradient-to-b ${item.gradient} shadow-[0_0_15px_currentColor] opacity-100 scale-y-100 animate-indicator-slide-in` 
                      : "opacity-0 scale-y-0 bg-slate-600"
                  )}></div>
                  
                  {/* Ripple Effect on Click */}
                  {active && (
                    <div className={`absolute inset-0 rounded-2xl bg-${item.color}-400/20 animate-ripple-expand`}></div>
                  )}

                  {/* Icon Container with Luxury Glass Effect */}
                  <div className={clsx(
                    "relative w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 overflow-hidden group-active/item:scale-90",
                    active 
                      ? `bg-gradient-to-br from-${item.color}-500/15 via-${item.color}-400/10 to-transparent border-2 border-${item.color}-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_currentColor,inset_0_1px_0_rgba(255,255,255,0.1)] translate-y-[-4px] backdrop-blur-xl` 
                      : "bg-white/5 border-2 border-transparent hover:border-white/20 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 backdrop-blur-sm hover:translate-y-[-2px]"
                  )}>
                    
                    {/* Background Glow */}
                    {active && (
                      <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-400/20 to-transparent blur-xl`}></div>
                    )}
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-[1.25rem]">
                      <div className={clsx(
                        "absolute w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent skew-x-12 translate-x-[-200%] transition-transform duration-700",
                        "group-hover/item:translate-x-[200%]"
                      )}></div>
                    </div>
                    
                    {/* Icon with Enhanced States */}
                    <item.icon 
                      size={22} 
                      strokeWidth={active ? 2.8 : 2.2} 
                      className={clsx(
                        "relative z-10 transition-all duration-500",
                        active 
                          ? `text-${item.color}-400 animate-icon-bounce filter drop-shadow-[0_0_8px_currentColor]` 
                          : "text-slate-500 group-hover/item:text-slate-200 group-hover/item:scale-110"
                      )} 
                    />
                    
                    {/* Top Highlight Bar */}
                    {active && (
                      <div className={`absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-${item.color}-300/70 to-transparent rounded-full blur-[1px]`}></div>
                    )}
                    
                    {/* Corner Glow Dots */}
                    {active && (
                      <>
                        <div className={`absolute top-1 right-1 w-1 h-1 rounded-full bg-${item.color}-300 blur-[1px] animate-pulse`}></div>
                        <div className={`absolute bottom-1 left-1 w-1 h-1 rounded-full bg-${item.color}-400 blur-[1px] animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                      </>
                    )}
                  </div>
                  
                  {/* Ultra-Premium Tooltip */}
                  <div className="absolute left-full ml-6 px-4 py-2.5 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border-2 border-white/10 text-white text-sm font-bold rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible pointer-events-none transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] whitespace-nowrap z-50 translate-x-[-10px] group-hover/item:translate-x-0 animate-tooltip-slide">
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-20 blur-sm`}></div>
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="tracking-wide">{item.id.replace(/_/g, ' ')}</span>
                      <Zap size={14} className={`text-${item.color}-400 animate-pulse`} strokeWidth={2.5} />
                    </span>
                    
                    {/* Arrow Pointer */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-1px]">
                      <div className="w-3 h-3 bg-slate-900 border-l-2 border-b-2 border-white/10 rotate-45 backdrop-blur-xl"></div>
                    </div>
                    
                    {/* Glow Accent */}
                    <div className={`absolute bottom-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-${item.color}-400/60 to-transparent rounded-full blur-sm`}></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ultra-Premium Voice Assistant FAB */}
          <div className="mt-6 pb-6 relative">
            {/* Ripple Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-16 h-16 rounded-full border-2 border-cyan-400/40 opacity-0 group-hover/voice:opacity-100 animate-voice-ripple"></div>
              <div className="absolute w-16 h-16 rounded-full border-2 border-cyan-500/30 opacity-0 group-hover/voice:opacity-100 animate-voice-ripple" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Main Voice Button */}
            <button 
              onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} 
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center animate-voice-glow hover:scale-110 active:scale-95 transition-all duration-500 border-2 border-cyan-300/30 group/voice overflow-hidden shadow-[0_8px_32px_rgba(6,182,212,0.5)]"
            >
              {/* Inner Gradient Layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20"></div>
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent blur-sm rounded-t-2xl"></div>
              
              {/* Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/voice:translate-x-[200%] transition-transform duration-1000"></div>
              
              {/* Mic Icon with Pulse */}
              <Mic 
                size={24} 
                className="relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/voice:scale-110 transition-transform duration-300" 
                strokeWidth={2.8}
              />
              
              {/* Corner Highlights */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/40 blur-sm animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-200/40 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Active Pulse Ring */}
              {view === 'VOICE_ASSISTANT' && (
                <div className="absolute inset-0 rounded-2xl border-2 border-white/60 animate-ping"></div>
              )}
            </button>
            
            {/* Floating Zap Icon */}
            <Zap 
              size={14} 
              className="absolute -top-1 -right-1 text-yellow-300 animate-bounce drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
              strokeWidth={2.5}
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
