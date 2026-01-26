import React, { useState, useEffect } from 'react';
import { CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, Flag, Heart, Sparkles, Star, Gift, Crown } from 'lucide-react';
import { Language } from '../../types';
import { clsx } from 'clsx';

export const SmartBanner = ({ lang, className }: { lang: Language, className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check if it's Republic Day (January 26)
  const today = new Date();
  const isRepublicDay = today.getMonth() === 0 && today.getDate() === 26;
  
  const messages = [
    // Special Republic Day Message
    ...(isRepublicDay ? [{
      id: 'republic-day',
      category: { mr: 'राष्ट्रीय सण', hi: 'राष्ट्रीय पर्व', en: 'National Festival' },
      title: { 
        mr: '🇮🇳 प्रजासत्ताक दिन शुभेच्छा 🇮🇳', 
        hi: '🇮🇳 गणतंत्र दिवस की शुभकामनाएं 🇮🇳', 
        en: '🇮🇳 Happy Republic Day 2026 🇮🇳' 
      },
      subtitle: { 
        mr: 'भारताच्या 77व्या प्रजासत्ताक दिनाच्या हार्दिक शुभेच्छा', 
        hi: 'भारत के 77वें गणतंत्र दिवस की हार्दिक शुभकामनाएं', 
        en: 'Celebrating 77 years of Indian Democracy & Unity' 
      },
      cta: { mr: 'संदेश शेअर करा', hi: 'संदेश शेयर करें', en: 'Share Wishes' },
      gradient: 'from-orange-600 via-white to-green-600',
      accentGradient: 'from-orange-500 to-green-600',
      icon: Flag,
      badges: [
        { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-orange-500' },
        { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-green-600' }
      ],
      isSpecial: true
    }] : []),
    
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
        
        @keyframes tricolor-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes flag-flutter {
          0%, 100% { 
            transform: rotateY(0deg) scale(1); 
          }
          25% { 
            transform: rotateY(-5deg) scale(1.05); 
          }
          75% { 
            transform: rotateY(5deg) scale(1.05); 
          }
        }
        
        @keyframes sparkle-burst {
          0%, 100% { 
            transform: scale(0) rotate(0deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.5) rotate(180deg); 
            opacity: 1; 
          }
        }
        
        @keyframes confetti-fall {
          0% { 
            transform: translateY(-100%) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0; 
          }
        }
        
        @keyframes ashoka-chakra-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes patriotic-glow {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(255, 103, 31, 0.5), 0 0 20px rgba(19, 136, 8, 0.5);
          }
          50% { 
            text-shadow: 0 0 20px rgba(255, 103, 31, 0.8), 0 0 40px rgba(19, 136, 8, 0.8), 0 0 60px rgba(255, 255, 255, 0.6);
          }
        }
      `}</style>

      {/* Premium Container with Enhanced Gradient */}
      <div 
        className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700 shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
        style={{
          '--glow-color': msg.gradient.includes('red') ? 'rgba(239, 68, 68, 0.3)' : 
                          msg.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' : 
                          msg.gradient.includes('orange') && msg.gradient.includes('green') ? 'rgba(255, 103, 31, 0.3)' :
                          'rgba(245, 158, 11, 0.3)',
          animation: 'glow-pulse-soft 3s ease-in-out infinite'
        } as React.CSSProperties}
      >
        {/* Special Republic Day Background */}
        {msg.isSpecial ? (
          <>
            {/* Tricolor Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-white to-green-600 bg-[length:200%_200%] animate-[tricolor-wave_6s_ease-in-out_infinite]"></div>
            
            {/* Decorative Patterns (Rangoli-style) */}
            <div className="absolute inset-0 opacity-15">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Corner Decorations */}
                <circle cx="50" cy="50" r="30" fill="rgba(255, 103, 31, 0.4)" />
                <circle cx="750" cy="50" r="30" fill="rgba(19, 136, 8, 0.4)" />
                <circle cx="50" cy="150" r="30" fill="rgba(19, 136, 8, 0.4)" />
                <circle cx="750" cy="150" r="30" fill="rgba(255, 103, 31, 0.4)" />
                
                {/* Decorative Lines */}
                <path d="M0,100 Q200,80 400,100 T800,100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" fill="none" />
                <path d="M0,100 Q200,120 400,100 T800,100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" fill="none" />
              </svg>
            </div>
            
            {/* Ashoka Chakra (Background) */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-10">
              <div className="w-full h-full animate-[ashoka-chakra-spin_20s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#003893" strokeWidth="3" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#003893" strokeWidth="2" />
                  {[...Array(24)].map((_, i) => (
                    <line 
                      key={i}
                      x1="50" 
                      y1="50" 
                      x2={50 + 40 * Math.cos((i * 15 * Math.PI) / 180)}
                      y2={50 + 40 * Math.sin((i * 15 * Math.PI) / 180)}
                      stroke="#003893" 
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              </div>
            </div>
            
            {/* Floating Sparkles/Confetti */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: i % 3 === 0 ? '#FF671F' : i % 3 === 1 ? '#FFFFFF' : '#138808',
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  animation: `sparkle-burst ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              ></div>
            ))}
          </>
        ) : (
          <>
            {/* Regular Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${msg.gradient}`}></div>
            
            {/* Overlay Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            }}></div>
          </>
        )}
        
        {/* Enhanced Shine Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine-sweep_4s_ease-in-out_infinite]"></div>
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
          
          {/* Premium Icon Container with Special Effects */}
          <div className="relative shrink-0 group/icon">
            {/* Enhanced Glow Ring */}
            <div className={`absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl blur-xl ${
              msg.isSpecial 
                ? 'bg-gradient-to-br from-orange-400 via-white to-green-400 animate-[tricolor-wave_3s_ease-in-out_infinite]' 
                : 'bg-white/20'
            }`}></div>
            
            {/* Icon Box with Enhanced Border */}
            <div className={`relative w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)] group-hover/icon:scale-110 transition-all duration-300 overflow-hidden ${
              msg.isSpecial 
                ? 'bg-white/95 border-4 border-orange-500 animate-[flag-flutter_3s_ease-in-out_infinite]' 
                : 'bg-white/10 border-2 border-white/30'
            }`}>
              {/* Inner Gradient */}
              <div className={`absolute inset-0 ${
                msg.isSpecial 
                  ? 'bg-gradient-to-br from-orange-100 via-white to-green-100' 
                  : 'bg-gradient-to-br from-white/20 to-transparent'
              }`}></div>
              
              {/* Icon with Special Animation */}
              <Icon 
                size={24} 
                className={`relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] lg:w-7 lg:h-7 ${
                  msg.isSpecial 
                    ? 'text-orange-600 animate-[flag-flutter_3s_ease-in-out_infinite]' 
                    : 'text-white'
                }`}
                strokeWidth={2.5} 
              />
              
              {/* Corner Accent */}
              <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-xl ${
                msg.isSpecial ? 'border-green-600' : 'border-white/40'
              }`}></div>
              
              {/* Special Republic Day Stars */}
              {msg.isSpecial && (
                <>
                  <Star size={8} className="absolute -top-1 -left-1 text-orange-500 animate-pulse" fill="currentColor" />
                  <Star size={8} className="absolute -bottom-1 -right-1 text-green-600 animate-pulse" fill="currentColor" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
          </div>
          
          {/* Text Content with Enhanced Typography */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Category Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] drop-shadow-sm ${
                msg.isSpecial ? 'text-orange-800' : 'text-white/70'
              }`}>
                {msg.category[lang] || msg.category['en']}
              </span>
              <div className="hidden lg:block h-3 w-[1px] bg-white/30"></div>
              
              {/* Enhanced Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {msg.badges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded-md ${badge.color} text-white text-[8px] lg:text-[9px] font-bold uppercase tracking-wide shadow-lg animate-[badge-pulse_2s_ease-in-out_infinite] border border-white/20`}
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  >
                    {badge.text[lang] || badge.text['en']}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Title with Special Styling */}
            <h2 className={`text-lg lg:text-2xl font-black leading-tight tracking-tight truncate w-full ${
              msg.isSpecial 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-slate-800 to-green-600 animate-[patriotic-glow_3s_ease-in-out_infinite]' 
                : 'text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
            }`}>
              {msg.title[lang] || msg.title['en']}
            </h2>
            
            {/* Subtitle */}
            <p className={`text-xs lg:text-sm font-semibold leading-snug drop-shadow-sm truncate w-full ${
              msg.isSpecial ? 'text-slate-700' : 'text-white/90'
            }`}>
              {msg.subtitle[lang] || msg.subtitle['en']}
            </p>
          </div>
        </div>

        {/* Right Section: CTA + Status */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-4 shrink-0 mt-3 lg:mt-0 lg:ml-6">
          
          {/* Vertical Separator */}
          <div className="hidden lg:block h-14 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          
          {/* Enhanced CTA Button */}
          <button className={`group/cta relative px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl backdrop-blur-sm border-2 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 overflow-hidden ${
            msg.isSpecial 
              ? 'bg-gradient-to-r from-orange-500 to-green-600 border-white/50 text-white' 
              : 'bg-white/90 hover:bg-white border-white/50'
          }`}>
            {/* Button Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover/cta:translate-x-[200%] transition-transform duration-700"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center gap-2">
              <span className={`text-xs lg:text-sm font-black ${
                msg.isSpecial 
                  ? 'text-white drop-shadow-md' 
                  : `bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`
              }`}>
                {msg.cta[lang] || msg.cta['en']}
              </span>
              <ArrowRight 
                size={14} 
                className={`group-hover/cta:translate-x-1 transition-transform lg:w-4 lg:h-4 ${
                  msg.isSpecial 
                    ? 'text-white' 
                    : `bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`
                }`}
                strokeWidth={3} 
              />
            </div>
            
            {/* Special Heart Icon for Republic Day */}
            {msg.isSpecial && (
              <Heart size={10} className="absolute -top-1 -right-1 text-red-500 animate-pulse" fill="currentColor" />
            )}
          </button>
          
          {/* Enhanced Live Indicator */}
          <div className="flex flex-col items-end lg:items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1 rounded-lg backdrop-blur-sm border ${
              msg.isSpecial 
                ? 'bg-orange-600/90 border-orange-400' 
                : 'bg-white/10 border-white/20'
            }`}>
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
                      ? msg.isSpecial 
                        ? 'w-4 lg:w-6 bg-gradient-to-r from-orange-500 to-green-600 shadow-[0_0_8px_rgba(255,103,31,0.8)]'
                        : 'w-4 lg:w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : msg.isSpecial
                        ? 'w-1 bg-orange-300/40'
                        : 'w-1 bg-white/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute top-2 left-6 flex items-center gap-1.5 opacity-30 pointer-events-none">
        {msg.isSpecial ? (
          <>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-orange-600"></div>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-600"></div>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
          </>
        )}
      </div>
      
      {/* Special Corner Sparkles for Republic Day */}
      {msg.isSpecial && (
        <>
          <Sparkles size={16} className="absolute top-2 right-6 text-yellow-400 animate-pulse pointer-events-none" />
          <Sparkles size={14} className="absolute bottom-2 left-6 text-orange-400 animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
};
