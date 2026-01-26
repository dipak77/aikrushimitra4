
import React, { useState, useEffect, useMemo } from 'react';
import { CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, MapPin } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { clsx } from 'clsx';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';

interface SmartBannerProps {
  lang: Language;
  className?: string;
  user?: UserProfile;
  location?: string;
  weather?: any;
}

export const SmartBanner = ({ lang, className, user, location, weather }: SmartBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const txt = DASH_TEXT[lang];
  
  const messages = useMemo(() => {
    const temp = weather?.current?.temperature_2m;
    const weatherCode = weather?.current?.weather_code;
    const condition = txt.weather_desc[weatherCode] || txt.weather_desc[0];
    
    // Find market rate for user's crop
    const cropData = MOCK_MARKET.find(m => m.name.toLowerCase() === (user?.crop || 'Soyabean').toLowerCase()) || MOCK_MARKET[0];
    const cropName = txt.crops[cropData.name] || cropData.name;

    return [
      { 
        id: 'weather-live',
        category: { mr: 'थेट हवामान', hi: 'लाइव मौसम', en: 'Live Weather' },
        title: { 
          mr: `${location || 'तुमचे क्षेत्र'}: ${temp ? Math.round(temp) + '°' : '--'}`, 
          hi: `${location || 'आपका क्षेत्र'}: ${temp ? Math.round(temp) + '°' : '--'}`, 
          en: `${location || 'Your Area'}: ${temp ? Math.round(temp) + '°' : '--'}` 
        },
        subtitle: { 
          mr: `${condition} • आज शेती कामासाठी ${temp && temp > 35 ? 'सावधान रहा' : 'उत्तम वेळ'}`, 
          hi: `${condition} • आज खेती के लिए ${temp && temp > 35 ? 'सावधान रहें' : 'अच्छा समय'}`, 
          en: `${condition} • ${temp && temp > 35 ? 'Be careful' : 'Ideal time'} for field work today` 
        },
        cta: { mr: 'विस्तृत पहा', hi: 'विस्तार से', en: 'See Details' },
        gradient: temp && temp > 32 ? 'from-orange-600 via-red-600 to-rose-600' : 'from-blue-600 via-indigo-600 to-cyan-600',
        accentGradient: 'from-amber-400 to-orange-500',
        icon: CloudRain,
        badges: [
          { text: { mr: 'थेट', hi: 'लाइव', en: 'Live' }, color: 'bg-blue-500' },
          { text: { mr: location || 'GPS', hi: location || 'GPS', en: location || 'GPS' }, color: 'bg-slate-700' }
        ]
      },
      { 
        id: 'market-live',
        category: { mr: 'आजचा बाजार भाव', hi: 'आज का मंडी भाव', en: 'Today\'s Market' },
        title: { 
          mr: `${cropName}: ₹${cropData.price}`, 
          hi: `${cropName}: ₹${cropData.price}`, 
          en: `${cropName}: ₹${cropData.price}` 
        },
        subtitle: { 
          mr: `आज ${cropData.trend.includes('+') ? 'तेजी' : 'मंदी'} आहे (${cropData.trend}) • विक्रीचा सल्ला`, 
          hi: `आज ${cropData.trend.includes('+') ? 'तेजी' : 'मंदी'} है (${cropData.trend}) • बिक्री सलाह`, 
          en: `Market is ${cropData.trend.includes('+') ? 'Bullish' : 'Bearish'} today (${cropData.trend})` 
        },
        cta: { mr: 'भाव तपासा', hi: 'दाम देखें', en: 'Check Rates' },
        gradient: cropData.trend.includes('+') ? 'from-emerald-600 via-teal-600 to-cyan-600' : 'from-rose-600 via-red-600 to-orange-600',
        accentGradient: 'from-emerald-400 to-teal-500',
        icon: TrendingUp,
        badges: [
          { text: { mr: 'तुमचे पीक', hi: 'आपकी फसल', en: 'Your Crop' }, color: 'bg-amber-500' },
          { text: { mr: cropData.trend, hi: cropData.trend, en: cropData.trend }, color: 'bg-white/20' }
        ]
      },
      { 
        id: 'ai-tip',
        category: { mr: 'AI स्मार्ट सल्ला', hi: 'AI स्मार्ट सलाह', en: 'AI Smart Tip' },
        title: { 
          mr: temp && temp > 30 ? 'दुपारी विश्रांती घ्या' : 'फवारणीची वेळ', 
          hi: temp && temp > 30 ? 'दोपहर में आराम करें' : 'छिड़काव का समय', 
          en: temp && temp > 30 ? 'Rest in Afternoon' : 'Time to Spray' 
        },
        subtitle: { 
          mr: `सध्याचे तापमान ${temp || '--'}° आहे • पाणी व्यवस्थापन करा`, 
          hi: `अभी तापमान ${temp || '--'}° है • सिंचाई का ध्यान रखें`, 
          en: `Current temp is ${temp || '--'}° • Monitor soil moisture` 
        },
        cta: { mr: 'सल्ला विचारा', hi: 'सलाह लें', en: 'Ask AI' },
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
        accentGradient: 'from-violet-400 to-purple-500',
        icon: Lightbulb,
        badges: [
          { text: { mr: 'तज्ञ', hi: 'विशेषज्ञ', en: 'Expert' }, color: 'bg-purple-500' },
          { text: { mr: 'AI', hi: 'AI', en: 'AI' }, color: 'bg-indigo-500' }
        ]
      }
    ];
  }, [lang, user, location, weather, txt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 600);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const msg = messages[currentIndex];
  const Icon = msg.icon;

  return (
    <div className={clsx("flex flex-1 lg:max-w-5xl lg:mx-6 h-auto min-h-[5rem] lg:h-20 relative group/banner rounded-2xl", className)}>
      <style>{`
        @keyframes professional-slide-in {
          0% { transform: translateX(-100%) scale(0.95); opacity: 0; filter: blur(10px); }
          100% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes professional-slide-out {
          0% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
          100% { transform: translateX(100%) scale(0.95); opacity: 0; filter: blur(10px); }
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
          0%, 100% { box-shadow: 0 0 30px var(--glow-color), 0 0 60px var(--glow-color); }
          50% { box-shadow: 0 0 40px var(--glow-color), 0 0 80px var(--glow-color); }
        }
      `}</style>

      <div 
        className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700 shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
        style={{
          '--glow-color': msg.gradient.includes('red') || msg.gradient.includes('rose') ? 'rgba(239, 68, 68, 0.3)' : msg.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)',
          animation: 'glow-pulse-soft 3s ease-in-out infinite'
        } as React.CSSProperties}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${msg.gradient}`}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
        }}></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine-sweep_4s_ease-in-out_infinite]"></div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${msg.accentGradient} opacity-80`}></div>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div 
        className={`relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:px-6 ${
          isAnimating ? 'animate-[professional-slide-out_0.6s_ease-in-out_forwards]' : 'animate-[professional-slide-in_0.7s_ease-out_forwards]'
        }`}
      >
        <div className="flex items-start lg:items-center gap-4 lg:gap-5 flex-1 min-w-0 w-full">
          <div className="relative shrink-0 group/icon">
            <div className="absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/20 blur-xl"></div>
            <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)] group-hover/icon:scale-110 transition-transform duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Icon size={24} className="relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] lg:w-7 lg:h-7" strokeWidth={2.5} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-xl"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] text-white/70 drop-shadow-sm">
                {msg.category[lang] || msg.category['en']}
              </span>
              <div className="hidden lg:block h-3 w-[1px] bg-white/30"></div>
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
            
            <h2 className="text-lg lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] truncate w-full">
              {msg.title[lang] || msg.title['en']}
            </h2>
            
            <p className="text-xs lg:text-sm font-semibold text-white/90 leading-snug drop-shadow-sm truncate w-full">
              {msg.subtitle[lang] || msg.subtitle['en']}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-4 shrink-0 mt-3 lg:mt-0 lg:ml-6">
          <div className="hidden lg:block h-14 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          
          <button className="group/cta relative px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm border-2 border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover/cta:translate-x-[200%] transition-transform duration-700"></div>
            <div className="relative flex items-center gap-2">
              <span className={`text-xs lg:text-sm font-black bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`}>
                {msg.cta[lang] || msg.cta['en']}
              </span>
              <ArrowRight size={14} className={`bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent group-hover/cta:translate-x-1 transition-transform lg:w-4 lg:h-4`} strokeWidth={3} />
            </div>
          </button>
          
          <div className="flex flex-col items-end lg:items-center gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Activity size={10} className="text-white lg:w-3 lg:h-3" strokeWidth={2.5} />
              <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-wider">Live</span>
              <div className="relative w-1.5 h-1.5">
                <div className="absolute inset-0 rounded-full bg-white animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-white"></div>
              </div>
            </div>
            
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
    </div>
  );
};
