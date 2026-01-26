
import React, { useState, useEffect } from 'react';
import { CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { clsx } from 'clsx';

export const SmartBanner = ({ lang, className }: { lang: Language, className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const messages = [
    { 
      id: 'alert',
      category: { mr: 'हवामान सूचना', hi: 'मौसम अलर्ट', en: 'Weather Alert' },
      title: { 
        mr: 'जोरदार पावसाचा इशारा', 
        hi: 'भारी बारिश की चेतावनी', 
        en: 'Heavy Rain Warning' 
      },
      subtitle: { 
        mr: 'पुढील २ तासात जोरदार पावसाची शक्यता • सुरक्षित रहा', 
        hi: 'अगले 2 घंटों में भारी बारिश संभव • सुरक्षित रहें', 
        en: 'Heavy rainfall expected in next 2 hours • Stay Safe' 
      },
      cta: { mr: 'सूचना पहा', hi: 'विवरण देखें', en: 'View Details' },
      gradient: 'from-red-600 via-rose-600 to-pink-600',
      accentGradient: 'from-red-400 to-rose-500',
      icon: CloudRain,
      badges: [
        { text: { mr: 'तत्काळ', hi: 'तुरंत', en: 'Urgent' }, color: 'bg-red-500' },
        { text: { mr: 'उच्च प्राधान्यता', hi: 'उच्च प्राथमिकता', en: 'High Priority' }, color: 'bg-orange-500' }
      ]
    },
    { 
      id: 'market',
      category: { mr: 'बाजार अपडेट', hi: 'मार्केट अपडेट', en: 'Market Update' },
      title: { 
        mr: 'सोयाबीन भाव वाढ', 
        hi: 'सोयाबीन दाम बढ़ोतरी', 
        en: 'Soyabean Price Surge' 
      },
      subtitle: { 
        mr: '₹4,850 (+₹120) • आजच्या तेजीमध्ये विक्री करा', 
        hi: '₹4,850 (+₹120) • आज की तेजी में बेचें', 
        en: '₹4,850 (+₹120) • Sell in Today\'s Bullish Market' 
      },
      cta: { mr: 'भाव पहा', hi: 'कीमत देखें', en: 'View Rates' },
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      accentGradient: 'from-emerald-400 to-teal-500',
      icon: TrendingUp,
      badges: [
        { text: { mr: 'तेजी', hi: 'बुलिश', en: 'Bullish' }, color: 'bg-emerald-500' },
        { text: { mr: '+2.5%', hi: '+2.5%', en: '+2.5%' }, color: 'bg-teal-500' }
      ]
    },
    { 
      id: 'tip',
      category: { mr: 'स्मार्ट टीप', hi: 'स्मार्ट टिप', en: 'Smart Tip' },
      title: { 
        mr: 'आज फवारणी करा', 
        hi: 'आज स्प्रे करें', 
        en: 'Spray Crops Today' 
      },
      subtitle: { 
        mr: 'आदर्श परिस्थिती • दुपारी 1:00 PM वा. • 85% यश दर', 
        hi: 'आदर्श स्थिति • दोपहर 1:00 बजे • 85% सफलता दर', 
        en: 'Ideal Conditions • 1:00 PM Today • 85% Success Rate' 
      },
      cta: { mr: 'रिमाइंडर सेट करा', hi: 'रिमाइंडर सेट करें', en: 'Set Reminder' },
      gradient: 'from-amber-600 via-orange-600 to-yellow-600',
      accentGradient: 'from-amber-400 to-orange-500',
      icon: Lightbulb,
      badges: [
        { text: { mr: 'AI सुचवलेले', hi: 'AI सुझाव', en: 'AI Suggested' }, color: 'bg-amber-500' },
        { text: { mr: 'सर्वोत्तम वेळ', hi: 'बेस्ट टाइम', en: 'Best Time' }, color: 'bg-yellow-500' }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 600);
    }, 7000);
    
    return () => clearInterval(interval);
  }, []);

  const msg = messages[currentIndex];
  const Icon = msg.icon;

  return (
    <div className={clsx("flex flex-1 lg:max-w-5xl lg:mx-6 h-auto min-h-[5rem] lg:h-20 relative group/banner rounded-2xl", className)}>
      <style>{`
        @keyframes professional-slide-in {
          0% { 
            transform: translateX(-100%) scale(0.95); 
            opacity: 0;
            filter: blur(10px);
          }
          100% { 
            transform: translateX(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
        }
        
        @keyframes professional-slide-out {
          0% { 
            transform: translateX(0) scale(1); 
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: translateX(100%) scale(0.95); 
            opacity: 0;
            filter: blur(10px);
          }
        }
        
        @keyframes shine-sweep {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glow-pulse-soft {
          0%, 100% { 
            box-shadow: 0 0 30px var(--glow-color), 0 0 60px var(--glow-color);
          }
          50% { 
            box-shadow: 0 0 40px var(--glow-color), 0 0 80px var(--glow-color);
          }
        }
      `}</style>

      {/* Premium Container with Gradient Background */}
      <div 
        className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700 shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
        style={{
          '--glow-color': msg.gradient.includes('red') ? 'rgba(239, 68, 68, 0.3)' : msg.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
          animation: 'glow-pulse-soft 3s ease-in-out infinite'
        } as React.CSSProperties}
      >
        {/* Main Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${msg.gradient}`}></div>
        
        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
        }}></div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine-sweep_4s_ease-in-out_infinite]"></div>
        </div>
        
        {/* Bottom Accent Strip */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${msg.accentGradient} opacity-80`}></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Content Container */}
      <div 
        className={`relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:px-6 ${
          isAnimating ? 'animate-[professional-slide-out_0.6s_ease-in-out_forwards]' : 'animate-[professional-slide-in_0.7s_ease-out_forwards]'
        }`}
      >
        {/* Left Section: Icon + Content */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-5 flex-1 min-w-0 w-full">
          
          {/* Premium Icon Container */}
          <div className="relative shrink-0 group/icon">
            {/* Glow Ring */}
            <div className="absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/20 blur-xl"></div>
            
            {/* Icon Box */}
            <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)] group-hover/icon:scale-110 transition-transform duration-300 overflow-hidden">
              {/* Inner Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              
              {/* Icon */}
              <Icon size={24} className="relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] lg:w-7 lg:h-7" strokeWidth={2.5} />
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-xl"></div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Category Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] text-white/70 drop-shadow-sm">
                {msg.category[lang] || msg.category['en']}
              </span>
              <div className="hidden lg:block h-3 w-[1px] bg-white/30"></div>
              
              {/* Status Badges - Hidden on very small screens if overflowing, or wrapped */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {msg.badges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded-md ${badge.color} text-white text-[8px] lg:text-[9px] font-bold uppercase tracking-wide shadow-lg animate-[badge-pulse_2s_ease-in-out_infinite]`}
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  >
                    {badge.text[lang] || badge.text['en']}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Title */}
            <h2 className="text-lg lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] truncate w-full">
              {msg.title[lang] || msg.title['en']}
            </h2>
            
            {/* Subtitle */}
            <p className="text-xs lg:text-sm font-semibold text-white/90 leading-snug drop-shadow-sm truncate w-full">
              {msg.subtitle[lang] || msg.subtitle['en']}
            </p>
          </div>
        </div>

        {/* Right Section: CTA + Status */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-4 shrink-0 mt-3 lg:mt-0 lg:ml-6">
          
          {/* Vertical Separator (Desktop Only) */}
          <div className="hidden lg:block h-14 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          
          {/* Call to Action Button */}
          <button className="group/cta relative px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm border-2 border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 overflow-hidden">
            {/* Button Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover/cta:translate-x-[200%] transition-transform duration-700"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center gap-2">
              <span className={`text-xs lg:text-sm font-black bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`}>
                {msg.cta[lang] || msg.cta['en']}
              </span>
              <ArrowRight size={14} className={`bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent group-hover/cta:translate-x-1 transition-transform lg:w-4 lg:h-4`} strokeWidth={3} />
            </div>
          </button>
          
          {/* Live Indicator */}
          <div className="flex flex-col items-end lg:items-center gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Activity size={10} className="text-white lg:w-3 lg:h-3" strokeWidth={2.5} />
              <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-wider">Live</span>
              <div className="relative w-1.5 h-1.5">
                <div className="absolute inset-0 rounded-full bg-white animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-white"></div>
              </div>
            </div>
            
            {/* Progress Indicators */}
            <div className="flex gap-1">
              {messages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIndex 
                      ? 'w-4 lg:w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                      : 'w-1 bg-white/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-2 left-6 flex items-center gap-1.5 opacity-30 pointer-events-none">
        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
      </div>
    </div>
  );
};
