
import React, { useState, useEffect } from 'react';
import { CloudRain, TrendingUp, Lightbulb, AlertTriangle, Activity, Radio } from 'lucide-react';
import { Language } from '../../types';
import { clsx } from 'clsx';

export const SmartBanner = ({ lang, className }: { lang: Language, className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  
  const messages = [
    { 
      id: 'alert', 
      type: 'critical',
      icon: CloudRain, 
      text: { 
        mr: 'पुढील २ तासात जोरदार पावसाची शक्यता', 
        hi: 'अगले 2 घंटों में भारी बारिश की संभावना', 
        en: 'Heavy rain expected in next 2 hours' 
      },
      label: { mr: 'हवामान सूचना', hi: 'मौसम सूचना', en: 'Weather Alert' },
      primary: 'from-red-500 to-rose-600',
      accent: 'from-red-400 to-rose-500',
      glow: 'rgba(239, 68, 68, 0.4)',
      particle: 'bg-red-400'
    },
    { 
      id: 'market', 
      type: 'trend',
      icon: TrendingUp, 
      text: { 
        mr: 'सोयाबीन भाव: ₹४,८५० (+₹१२०) - तेजीत!', 
        hi: 'सोयाबीन भाव: ₹४,८५० (+₹१२०) - तेजी!', 
        en: 'Soyabean Rate: ₹4,850 (+₹120) - Bullish!' 
      },
      label: { mr: 'बाजार अपडेट', hi: 'बाजार अपडेट', en: 'Market Update' },
      primary: 'from-emerald-500 to-teal-600',
      accent: 'from-emerald-400 to-teal-500',
      glow: 'rgba(16, 185, 129, 0.4)',
      particle: 'bg-emerald-400'
    },
    { 
      id: 'tip', 
      type: 'info',
      icon: Lightbulb, 
      text: { 
        mr: 'टीप: पिकावर दुपारी १:०० वा. फवारणी करा', 
        hi: 'टिप: फसल पर दोपहर 1:00 बजे स्प्रे करें', 
        en: 'Tip: Spray crops at 1:00 PM today' 
      },
      label: { mr: 'स्मार्ट टीप', hi: 'स्मार्ट टिप', en: 'Smart Tip' },
      primary: 'from-amber-500 to-orange-600',
      accent: 'from-amber-400 to-orange-500',
      glow: 'rgba(245, 158, 11, 0.4)',
      particle: 'bg-amber-400'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setDirection(Math.random() > 0.5 ? 'left' : 'right');
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setTimeout(() => setIsAnimating(false), 100);
      }, 600);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const msg = messages[currentIndex];
  const Icon = msg.icon;

  return (
    <div className={clsx("flex flex-1 w-full lg:max-w-4xl mx-2 lg:mx-6 h-12 lg:h-16 relative group/banner perspective-[1000px] min-w-0", className)}>
      <style>{`
        @keyframes hologram-scan {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          10%, 90% { opacity: 0.3; }
          50% { transform: translateY(100%); opacity: 0.5; }
        }
        
        @keyframes data-stream {
          0% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
        }
        
        @keyframes slide-in-left {
          0% { 
            transform: translateX(-150%) rotateY(-25deg) scale(0.9); 
            opacity: 0;
            filter: blur(8px);
          }
          60% { 
            transform: translateX(10px) rotateY(5deg) scale(1.02); 
            filter: blur(0);
          }
          100% { 
            transform: translateX(0) rotateY(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
        }
        
        @keyframes slide-in-right {
          0% { 
            transform: translateX(150%) rotateY(25deg) scale(0.9); 
            opacity: 0;
            filter: blur(8px);
          }
          60% { 
            transform: translateX(-10px) rotateY(-5deg) scale(1.02); 
            filter: blur(0);
          }
          100% { 
            transform: translateX(0) rotateY(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
        }
        
        @keyframes slide-out-left {
          0% { 
            transform: translateX(0) rotateY(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: translateX(-150%) rotateY(-25deg) scale(0.9); 
            opacity: 0;
            filter: blur(8px);
          }
        }
        
        @keyframes slide-out-right {
          0% { 
            transform: translateX(0) rotateY(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: translateX(150%) rotateY(25deg) scale(0.9); 
            opacity: 0;
            filter: blur(8px);
          }
        }
        
        @keyframes text-3d-pop {
          0%, 100% { 
            transform: translateZ(0) scale(1); 
            text-shadow: 
              1px 1px 0 rgba(0,0,0,0.3),
              2px 2px 0 rgba(0,0,0,0.2);
          }
          50% { 
            transform: translateZ(8px) scale(1.02); 
            text-shadow: 
              2px 2px 0 rgba(0,0,0,0.4),
              4px 4px 0 rgba(0,0,0,0.3),
              6px 6px 0 rgba(0,0,0,0.2),
              8px 8px 0 rgba(0,0,0,0.1);
          }
        }
        
        @keyframes particle-float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translate(var(--tx), var(--ty)) scale(1.5); 
            opacity: 0.8; 
          }
        }
        
        @keyframes border-glow-pulse {
          0%, 100% { 
            box-shadow: 
              inset 0 0 20px var(--glow-color),
              0 0 20px var(--glow-color),
              0 0 40px var(--glow-color);
          }
          50% { 
            box-shadow: 
              inset 0 0 30px var(--glow-color),
              0 0 30px var(--glow-color),
              0 0 60px var(--glow-color),
              0 0 80px var(--glow-color);
          }
        }
        
        @keyframes depth-layer-1 {
          0%, 100% { transform: translateZ(0px); }
          50% { transform: translateZ(4px); }
        }
        
        @keyframes depth-layer-2 {
          0%, 100% { transform: translateZ(0px); }
          50% { transform: translateZ(8px); }
        }
        
        @keyframes depth-layer-3 {
          0%, 100% { transform: translateZ(0px); }
          50% { transform: translateZ(12px); }
        }
        
        .perspective-1000 { perspective: 1000px; }
        .transform-3d { transform-style: preserve-3d; }
        
        .animate-slide-in-left { animation: slide-in-left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-slide-out-left { animation: slide-out-left 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }
      `}</style>

      {/* Multi-Layer Background System */}
      <div className="absolute inset-0 rounded-xl lg:rounded-2xl overflow-hidden transform-3d">
        
        {/* Layer 1: Deep Background with Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl animate-[depth-layer-1_4s_ease-in-out_infinite]"></div>
        
        {/* Layer 2: Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-10 animate-[depth-layer-2_4s_ease-in-out_infinite]"
          style={{ 
            backgroundImage: `linear-gradient(90deg, ${msg.glow}, transparent, ${msg.glow})`,
            backgroundSize: '200% 100%',
            animation: 'data-stream 3s ease-in-out infinite'
          }}
        ></div>
        
        {/* Layer 3: Holographic Scanline */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 h-full w-full opacity-20"
            style={{
              background: `linear-gradient(to bottom, transparent 48%, ${msg.glow} 50%, transparent 52%)`,
              animation: 'hologram-scan 4s linear infinite'
            }}
          ></div>
        </div>
        
        {/* Layer 4: Noise Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-30 mix-blend-overlay"></div>
        
        {/* Layer 5: Border System */}
        <div className="absolute inset-0 rounded-xl lg:rounded-2xl border-2 border-white/10 group-hover/banner:border-white/20 transition-colors duration-500"></div>
        
        {/* Layer 6: Animated Glow Border */}
        <div 
          className="absolute inset-0 rounded-xl lg:rounded-2xl opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500"
          style={{
            '--glow-color': msg.glow,
            animation: 'border-glow-pulse 2s ease-in-out infinite'
          } as React.CSSProperties}
        ></div>
        
        {/* Layer 7: Corner Accents */}
        <div className="absolute top-0 left-0 w-8 lg:w-16 h-8 lg:h-16 border-t-2 border-l-2 border-white/20 rounded-tl-xl lg:rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 lg:w-16 h-8 lg:h-16 border-t-2 border-r-2 border-white/20 rounded-tr-xl lg:rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 lg:w-16 h-8 lg:h-16 border-b-2 border-l-2 border-white/20 rounded-bl-xl lg:rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 lg:w-16 h-8 lg:h-16 border-b-2 border-r-2 border-white/20 rounded-br-xl lg:rounded-br-2xl"></div>
        
        {/* Layer 8: Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${msg.accent} opacity-60`}
            style={{ animation: 'data-stream 2s ease-in-out infinite' }}
          ></div>
        </div>
      </div>

      {/* Content Container with 3D Transform */}
      <div className="relative z-10 w-full h-full flex items-center px-2 lg:px-4 transform-3d overflow-hidden">
        
        {/* Left Section: Icon + Label (3D Layer 1) */}
        <div 
          className={`flex items-center gap-2 lg:gap-3 shrink-0 ${
            isAnimating 
              ? direction === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right'
              : direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'
          }`}
          style={{ animationDelay: '0ms' }}
        >
          {/* Premium Icon Container with 3D Depth */}
          <div className="relative w-9 h-9 lg:w-12 lg:h-12 shrink-0 animate-[depth-layer-3_4s_ease-in-out_infinite]">
            {/* Outer Glow Ring */}
            <div 
              className="absolute inset-0 rounded-xl opacity-60 blur-xl"
              style={{ background: `linear-gradient(135deg, ${msg.glow}, transparent)` }}
            ></div>
            
            {/* Main Icon Container */}
            <div className={`relative w-full h-full rounded-lg lg:rounded-xl bg-gradient-to-br ${msg.primary} flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/20 overflow-hidden group/icon hover:scale-110 transition-transform duration-300`}>
              {/* Inner Shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              
              {/* Icon */}
              <Icon className="relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
              
              {/* Particle Effect */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full ${msg.particle} opacity-0 group-hover/icon:opacity-100`}
                  style={{
                    animation: `particle-float 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    '--tx': `${(Math.random() - 0.5) * 20}px`,
                    '--ty': `${(Math.random() - 0.5) * 20}px`,
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Category Label with 3D Text - Hidden on mobile for space */}
          <div className="hidden sm:flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 drop-shadow-sm">
              {msg.label[lang] || msg.label['en']}
            </span>
            <div className="h-[1px] w-8 lg:w-12 bg-gradient-to-r from-slate-600 to-transparent"></div>
          </div>
        </div>

        {/* Center Section: Main Message (3D Layer 2) */}
        <div 
          className={`flex-1 mx-2 lg:mx-4 overflow-hidden ${
            isAnimating 
              ? direction === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right'
              : direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'
          }`}
          style={{ animationDelay: '100ms' }}
        >
          <div className="animate-[depth-layer-2_4s_ease-in-out_infinite]">
            {/* 3D/5D Text with Multiple Shadow Layers */}
            <p 
              className="text-xs sm:text-sm lg:text-base font-black text-white tracking-wide truncate"
              style={{
                textShadow: `
                  2px 2px 0 rgba(0,0,0,0.5),
                  4px 4px 0 rgba(0,0,0,0.4),
                  6px 6px 0 rgba(0,0,0,0.3),
                  8px 8px 0 rgba(0,0,0,0.2),
                  10px 10px 0 rgba(0,0,0,0.1),
                  0 0 20px ${msg.glow}
                `,
                animation: 'text-3d-pop 4s ease-in-out infinite'
              }}
            >
              {msg.type === 'critical' && (
                <AlertTriangle size={14} className="inline-block mr-1 lg:mr-2 animate-pulse text-red-400 align-text-bottom lg:align-middle" />
              )}
              {msg.text[lang] || msg.text['en']}
            </p>
            
            {/* Subtitle Underline with Gradient */}
            <div 
              className={`h-[2px] w-full mt-1 bg-gradient-to-r ${msg.accent} opacity-50 rounded-full`}
              style={{ 
                boxShadow: `0 0 8px ${msg.glow}`,
              }}
            ></div>
          </div>
        </div>

        {/* Right Section: Status Indicators (3D Layer 3) */}
        <div 
          className={`flex items-center gap-2 lg:gap-3 shrink-0 ${
            isAnimating 
              ? direction === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right'
              : direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          {/* Separator Line */}
          <div className="hidden sm:block h-8 lg:h-10 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          
          {/* Live Status Badge */}
          <div className="relative flex items-center gap-1.5 lg:gap-2 px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden group/live animate-[depth-layer-3_4s_ease-in-out_infinite]">
            {/* Background Pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover/live:opacity-100 transition-opacity"></div>
            
            {/* Radio Waves Icon */}
            <Radio className="text-emerald-400 animate-pulse relative z-10 w-3 h-3 lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
            
            {/* Text */}
            <span className="hidden sm:inline text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] relative z-10">
              Live
            </span>
            
            {/* Animated Dot */}
            <div className="relative w-1.5 h-1.5 lg:w-2 lg:h-2 z-10">
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
            </div>
          </div>
          
          {/* Progress Dots - Hidden on very small screens */}
          <div className="hidden sm:flex gap-1.5">
            {messages.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex 
                    ? `${msg.particle} shadow-[0_0_8px_currentColor] scale-125` 
                    : 'bg-slate-600'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl lg:rounded-2xl">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${msg.particle} opacity-30`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `particle-float 4s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              '--tx': `${(Math.random() - 0.5) * 30}px`,
              '--ty': `${(Math.random() - 0.5) * 30}px`,
            } as React.CSSProperties}
          ></div>
        ))}
      </div>
    </div>
  );
};
