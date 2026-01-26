import React, { useState, useEffect } from 'react';
import { CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, Flag, Heart, Sparkles, Star, Sun, Moon, Wind, Zap, Crown, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { clsx } from 'clsx';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';

export const SmartBanner = ({ lang, className, weather, user }: { lang: Language, className?: string, weather?: any, user?: UserProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const txt = DASH_TEXT[lang];
  
  const today = new Date();
  const isRepublicDay = today.getMonth() === 0 && today.getDate() === 26;

  // Calendar Data
  const dayNames = {
    mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };
  
  const monthNames = {
    mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const currentDay = dayNames[lang][today.getDay()];
  const currentDate = today.getDate();
  const currentMonth = monthNames[lang][today.getMonth()];
  const currentYear = today.getFullYear();
  const currentTime = today.toLocaleTimeString(lang === 'en' ? 'en-US' : 'hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Dynamic Data
  const temp = weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--';
  const wCode = weather?.current?.weather_code || 0;
  const isDay = weather?.current?.is_day !== 0;
  const wDesc = txt.weather_desc[wCode] || txt.weather_desc[0];
  const isRainy = wCode >= 51;

  const userCropName = user?.crop || 'Soyabean';
  const marketData = MOCK_MARKET.find(m => m.name.toLowerCase().includes(userCropName.toLowerCase())) || MOCK_MARKET[0];
  const displayCropName = txt.crops[marketData.name] || marketData.name;
  const isPositiveTrend = marketData.trend.includes('+');

  const messages = [
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
      // ENHANCED COLORS
      bgBase: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 33%, #FFFFFF 66%, #138808 100%)',
      bgOverlay: 'linear-gradient(160deg, rgba(255,153,51,0.95) 0%, rgba(255,255,255,0.98) 50%, rgba(19,136,8,0.95) 100%)',
      accentGlow: 'rgba(255, 153, 51, 0.8)',
      secondaryGlow: 'rgba(19, 136, 8, 0.8)',
      particleColors: ['#FF9933', '#FFFFFF', '#138808', '#FF6B1F', '#0FA851'],
      icon: Flag,
      badges: [
        { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-gradient-to-r from-orange-600 to-orange-500', glow: 'shadow-[0_0_25px_rgba(255,103,31,1)]' },
        { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-gradient-to-r from-green-700 to-green-600', glow: 'shadow-[0_0_25px_rgba(19,136,8,1)]' }
      ],
      isSpecial: true
    }] : []),
    
    {
      id: 'calendar',
      category: { mr: 'आजचा दिवस', hi: 'आज का दिन', en: 'Today\'s Date' },
      title: { 
        mr: `${currentDay}, ${currentDate} ${currentMonth}`, 
        hi: `${currentDay}, ${currentDate} ${currentMonth}`, 
        en: `${currentDay}, ${currentMonth} ${currentDate}` 
      },
      subtitle: { 
        mr: `${currentYear} • ${currentTime} • पिकांची काळजी घ्या`, 
        hi: `${currentYear} • ${currentTime} • फसल की देखभाल करें`, 
        en: `${currentYear} • ${currentTime} • Perfect day for farming` 
      },
      cta: { mr: 'कॅलेंडर उघडा', hi: 'कैलेंडर खोलें', en: 'Open Calendar' },
      // ENHANCED PURPLE/VIOLET
      bgBase: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
      bgOverlay: 'linear-gradient(140deg, rgba(124,58,237,0.95) 0%, rgba(168,85,247,0.98) 50%, rgba(236,72,153,0.95) 100%)',
      accentGlow: 'rgba(168, 85, 247, 0.8)',
      secondaryGlow: 'rgba(236, 72, 153, 0.7)',
      particleColors: ['#7C3AED', '#A855F7', '#EC4899', '#D946EF', '#9333EA'],
      icon: CalendarIcon,
      badges: [
        { text: { mr: currentDay, hi: currentDay, en: currentDay }, color: 'bg-gradient-to-r from-violet-600 to-violet-500', glow: 'shadow-[0_0_25px_rgba(124,58,237,1)]' },
        { text: { mr: `${currentDate}`, hi: `${currentDate}`, en: `${currentDate}` }, color: 'bg-gradient-to-r from-fuchsia-600 to-pink-500', glow: 'shadow-[0_0_25px_rgba(236,72,153,1)]' }
      ]
    },
    
    { 
      id: 'weather',
      category: { mr: 'हवामान अपडेट', hi: 'मौसम अपडेट', en: 'Weather Update' },
      title: isRainy ? { 
        mr: 'पावसाची शक्यता', 
        hi: 'बारिश की संभावना', 
        en: 'Rain Expected' 
      } : { 
        mr: `${wDesc} • ${temp}°C`, 
        hi: `${wDesc} • ${temp}°C`, 
        en: `${wDesc} • ${temp}°C` 
      },
      subtitle: isRainy ? { 
        mr: `पुढील काही तासात पावसाचा अंदाज आहे. पिकांची काळजी घ्या.`, 
        hi: `अगले कुछ घंटों में बारिश का अनुमान है। फसल की सुरक्षा करें।`, 
        en: `Rain expected in next few hours. Protect harvested crops.` 
      } : {
        mr: `सध्याचे तापमान ${temp}°C आहे. शेतातील कामांसाठी हवामान ${isDay ? 'चांगले' : 'शांत'} आहे.`,
        hi: `वर्तमान तापमान ${temp}°C है। खेत के काम के लिए मौसम ${isDay ? 'अच्छा' : 'शांत'} है।`,
        en: `Current temp is ${temp}°C. Weather is ${isDay ? 'good' : 'calm'} for field activities.`
      },
      cta: { mr: 'तपशील पहा', hi: 'विवरण देखें', en: 'View Forecast' },
      // ENHANCED WEATHER COLORS
      bgBase: isRainy 
        ? 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #6366F1 100%)' 
        : isDay 
          ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 30%, #3B82F6 70%, #2563EB 100%)'
          : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #1E293B 100%)',
      bgOverlay: isRainy 
        ? 'linear-gradient(140deg, rgba(14,165,233,0.95) 0%, rgba(59,130,246,0.98) 50%, rgba(99,102,241,0.92) 100%)' 
        : isDay 
          ? 'linear-gradient(140deg, rgba(245,158,11,0.95) 0%, rgba(249,115,22,0.95) 30%, rgba(59,130,246,0.93) 70%, rgba(37,99,235,0.95) 100%)'
          : 'linear-gradient(140deg, rgba(79,70,229,0.95) 0%, rgba(124,58,237,0.95) 50%, rgba(30,41,59,0.98) 100%)',
      accentGlow: isRainy ? 'rgba(59, 130, 246, 0.8)' : isDay ? 'rgba(251, 146, 60, 0.8)' : 'rgba(139, 92, 246, 0.8)',
      secondaryGlow: isRainy ? 'rgba(14, 165, 233, 0.7)' : isDay ? 'rgba(249, 115, 22, 0.7)' : 'rgba(79, 70, 229, 0.7)',
      particleColors: isRainy ? ['#0EA5E9', '#3B82F6', '#6366F1', '#0284C7'] : isDay ? ['#F59E0B', '#F97316', '#FB923C', '#FDE047', '#3B82F6'] : ['#4F46E5', '#7C3AED', '#A855F7', '#6366F1'],
      icon: isRainy ? CloudRain : isDay ? Sun : Moon,
      badges: [
        { text: { mr: isDay ? 'दिवस' : 'रात्र', hi: isDay ? 'दिन' : 'रात', en: isDay ? 'Day' : 'Night' }, color: isDay ? 'bg-gradient-to-r from-orange-600 to-orange-500' : 'bg-gradient-to-r from-indigo-700 to-indigo-600', glow: isDay ? 'shadow-[0_0_25px_rgba(249,115,22,1)]' : 'shadow-[0_0_25px_rgba(79,70,229,1)]' },
        { text: { mr: `${temp}°C`, hi: `${temp}°C`, en: `${temp}°C` }, color: isRainy ? 'bg-gradient-to-r from-sky-600 to-blue-600' : isDay ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-purple-600 to-violet-600', glow: 'shadow-[0_0_20px_currentColor]' }
      ]
    },

    { 
      id: 'market',
      category: { mr: 'बाजार अपडेट', hi: 'मार्केट अपडेट', en: 'Market Update' },
      title: { 
        mr: `${displayCropName} भाव: ₹${marketData.price}`, 
        hi: `${displayCropName} भाव: ₹${marketData.price}`, 
        en: `${displayCropName}: ₹${marketData.price}` 
      },
      subtitle: { 
        mr: `आवक: ${marketData.arrival} • कल: ${marketData.trend} (${isPositiveTrend ? 'तेजीत' : 'घसरण'})`, 
        hi: `आवक: ${marketData.arrival} • रुझान: ${marketData.trend} (${isPositiveTrend ? 'तेजी' : 'गिरावट'})`, 
        en: `Arrival: ${marketData.arrival} • Trend: ${marketData.trend}` 
      },
      cta: { mr: 'भाव पहा', hi: 'कीमत देखें', en: 'View Rates' },
      // ENHANCED MARKET COLORS
      bgBase: isPositiveTrend 
        ? 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)' 
        : 'linear-gradient(135deg, #EF4444 0%, #F43F5E 50%, #FB7185 100%)',
      bgOverlay: isPositiveTrend 
        ? 'linear-gradient(140deg, rgba(16,185,129,0.95) 0%, rgba(20,184,166,0.97) 50%, rgba(6,182,212,0.95) 100%)' 
        : 'linear-gradient(140deg, rgba(239,68,68,0.95) 0%, rgba(244,63,94,0.97) 50%, rgba(251,113,133,0.92) 100%)',
      accentGlow: isPositiveTrend ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
      secondaryGlow: isPositiveTrend ? 'rgba(6, 182, 212, 0.7)' : 'rgba(244, 63, 94, 0.7)',
      particleColors: isPositiveTrend ? ['#10B981', '#14B8A6', '#06B6D4', '#0D9488', '#059669'] : ['#EF4444', '#F43F5E', '#FB7185', '#DC2626', '#E11D48'],
      icon: TrendingUp,
      badges: [
        { text: { mr: isPositiveTrend ? 'तेजी' : 'मंदी', hi: isPositiveTrend ? 'बढ़त' : 'गिरावट', en: isPositiveTrend ? 'Bullish' : 'Bearish' }, color: isPositiveTrend ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-rose-500', glow: isPositiveTrend ? 'shadow-[0_0_25px_rgba(16,185,129,1)]' : 'shadow-[0_0_25px_rgba(239,68,68,1)]' },
        { text: { mr: marketData.trend, hi: marketData.trend, en: marketData.trend }, color: 'bg-white/30 backdrop-blur-xl border-2 border-white/40', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.6)]' }
      ]
    },

    { 
      id: 'tip',
      category: { mr: 'स्मार्ट टीप', hi: 'स्मार्ट टिप', en: 'Smart Tip' },
      title: isDay ? { 
        mr: 'फवारणीसाठी योग्य वेळ', 
        hi: 'छिड़काव के लिए सही समय', 
        en: 'Good Time to Spray' 
      } : {
        mr: 'पिकांना थंडीपासून वाचवा',
        hi: 'फसलों को ठंड से बचाएं',
        en: 'Protect from Cold'
      },
      subtitle: isDay ? { 
        mr: 'वारा कमी आहे, फवारणी प्रभावी ठरेल. (दुपारी ४ पर्यंत)', 
        hi: 'हवा कम है, छिड़काव प्रभावी होगा। (शाम 4 बजे तक)', 
        en: 'Low wind speed, spraying will be effective. (Before 4 PM)' 
      } : {
        mr: 'रात्री तापमान कमी होऊ शकते, पाणी देऊन पिकांचे रक्षण करा.',
        hi: 'रात में तापमान गिर सकता है, सिंचाई करके फसलों को बचाएं।',
        en: 'Temp may drop tonight, irrigate to protect crops.'
      },
      cta: { mr: 'सल्ला वाचा', hi: 'सलाह पढ़ें', en: 'Read Tip' },
      // ENHANCED AMBER/GOLD
      bgBase: 'linear-gradient(135deg, #F59E0B 0%, #FB923C 50%, #FBBF24 100%)',
      bgOverlay: 'linear-gradient(140deg, rgba(245,158,11,0.95) 0%, rgba(251,146,60,0.97) 50%, rgba(251,191,36,0.95) 100%)',
      accentGlow: 'rgba(251, 146, 60, 0.8)',
      secondaryGlow: 'rgba(251, 191, 36, 0.7)',
      particleColors: ['#F59E0B', '#FB923C', '#FBBF24', '#F97316', '#EAB308'],
      icon: Lightbulb,
      badges: [
        { text: { mr: 'AI सुचवलेले', hi: 'AI सुझाव', en: 'AI Suggested' }, color: 'bg-gradient-to-r from-amber-600 to-amber-500', glow: 'shadow-[0_0_25px_rgba(245,158,11,1)]' },
        { text: { mr: '100% उपयुक्त', hi: '100% उपयोगी', en: '100% Useful' }, color: 'bg-gradient-to-r from-yellow-600 to-yellow-500', glow: 'shadow-[0_0_25px_rgba(234,179,8,1)]' }
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
    }, 8000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const msg = messages[currentIndex];
  const Icon = msg.icon;

  return (
    <div className={clsx("flex flex-1 lg:max-w-5xl lg:mx-6 h-auto min-h-[5rem] lg:h-28 relative group/banner rounded-2xl", className)}>
      <style>{`
        @keyframes slide-in {
          0% { transform: translateX(-100%) scale(0.95); opacity: 0; filter: blur(8px); }
          60% { transform: translateX(3%) scale(1.01); filter: blur(1px); }
          100% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
        }
        
        @keyframes slide-out {
          0% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
          100% { transform: translateX(100%) scale(0.95); opacity: 0; filter: blur(8px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(250%) skewX(-20deg); opacity: 0; }
        }
        
        @keyframes badge-glow {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.15); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 40px var(--glow-main),
              0 0 80px var(--glow-main),
              0 15px 50px rgba(0,0,0,0.6),
              inset 0 2px 0 rgba(255,255,255,0.2);
          }
          50% { 
            box-shadow: 
              0 0 60px var(--glow-main),
              0 0 120px var(--glow-main),
              0 0 180px var(--glow-secondary),
              0 20px 70px rgba(0,0,0,0.8),
              inset 0 3px 0 rgba(255,255,255,0.3);
          }
        }
        
        @keyframes particles {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          25% { transform: translate(15px, -20px) scale(1.3); opacity: 1; }
          50% { transform: translate(-10px, -35px) scale(0.9); opacity: 0.6; }
          75% { transform: translate(20px, -15px) scale(1.1); opacity: 0.8; }
        }
        
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes tricolor-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* ENHANCED Background Container */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          '--glow-main': msg.accentGlow,
          '--glow-secondary': msg.secondaryGlow,
          animation: 'glow-pulse 4s ease-in-out infinite'
        } as React.CSSProperties}
      >
        {/* Base Layer - Solid Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: msg.bgBase,
            backgroundSize: '200% 200%',
            animation: 'gradient-flow 8s ease infinite'
          }}
        />
        
        {/* Overlay Layer - Enhanced Transparency */}
        <div 
          className="absolute inset-0"
          style={{
            background: msg.bgOverlay,
            backgroundSize: '200% 200%',
            animation: 'gradient-flow 10s ease-in-out infinite reverse'
          }}
        />
        
        {/* Enhanced Particles */}
        <div className="absolute inset-0">
          {[...Array(msg.isSpecial ? 25 : 15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: msg.particleColors[i % msg.particleColors.length],
                animation: `particles ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                boxShadow: `0 0 20px ${msg.particleColors[i % msg.particleColors.length]}`,
                filter: 'blur(2px)',
                opacity: 0.7
              }}
            />
          ))}
        </div>
        
        {/* Republic Day Special Effects */}
        {msg.isSpecial && (
          <>
            {/* Ashoka Chakra */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '40s' }}>
                <circle cx="50" cy="50" r="48" fill="none" stroke="#003893" strokeWidth="4" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#003893" strokeWidth="3" />
                {[...Array(24)].map((_, i) => (
                  <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)} y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)} stroke="#003893" strokeWidth="2" />
                ))}
              </svg>
            </div>
            
            {/* Flag Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-600/30 via-transparent to-green-600/30" />
            </div>
          </>
        )}
        
        {/* Radial Overlay for Depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(0,0,0,0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 80%)
            `
          }}
        />
        
        {/* Glass Effect */}
        <div className="absolute inset-0 backdrop-blur-[0.5px] bg-white/5" />
        
        {/* Shine Sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ animation: 'shine 5s ease-in-out infinite' }}
          />
        </div>
        
        {/* Enhanced Border */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="50%" stopColor="rgba(255,255,255,1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
            </linearGradient>
          </defs>
          <rect 
            x="1" 
            y="1" 
            width="calc(100% - 2px)" 
            height="calc(100% - 2px)" 
            rx="16" 
            ry="16" 
            fill="none" 
            stroke="url(#borderGrad)" 
            strokeWidth="2"
            className="opacity-60"
          />
        </svg>
        
        {/* Bottom Accent Line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
            boxShadow: `0 0 25px ${msg.accentGlow}, 0 0 40px ${msg.secondaryGlow}`
          }}
        />
        
        {/* Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-sm" />
      </div>

      {/* Content */}
      <div 
        className={`relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 lg:px-7 gap-3 lg:gap-0 ${
          isAnimating ? 'animate-[slide-out_0.6s_ease-out_forwards]' : 'animate-[slide-in_0.7s_ease-out_forwards]'
        }`}
      >
        {/* Left: Icon + Content */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-6 flex-1 min-w-0 w-full">
          
          {/* Enhanced Icon */}
          <div className="relative shrink-0 group/icon">
            {/* Multi-layer Glow */}
            <div 
              className="absolute -inset-4 rounded-2xl blur-2xl opacity-60 group-hover/icon:opacity-80 transition-opacity"
              style={{ background: msg.accentGlow }}
            />
            <div 
              className="absolute -inset-2 rounded-2xl blur-lg opacity-50"
              style={{ background: msg.secondaryGlow }}
            />
            
            {/* Icon Container */}
            <div className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl backdrop-blur-2xl flex items-center justify-center shadow-2xl group-hover/icon:scale-110 transition-transform overflow-hidden ${
              msg.isSpecial ? 'bg-white/98 border-4 border-orange-500' : 'bg-white/20 border-3 border-white/60'
            }`}>
              
              {/* Inner Gradient */}
              <div className={`absolute inset-0 ${
                msg.isSpecial ? 'bg-gradient-to-br from-orange-100 via-white to-green-100' : 'bg-gradient-to-br from-white/50 via-white/30 to-transparent'
              }`} />
              
              {/* Top Shine */}
              <div className="absolute top-1 inset-x-4 h-1 bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-full blur-sm shadow-lg" />
              
              {/* Icon */}
              <Icon 
                size={32} 
                className={`relative z-10 lg:w-10 lg:h-10 drop-shadow-xl animate-[float_4s_ease-in-out_infinite] ${
                  msg.isSpecial ? 'text-orange-600' : 'text-white'
                }`}
                strokeWidth={2.5} 
              />
              
              {/* Corner Accents */}
              <div className={`absolute top-1 right-1 w-6 h-6 border-t-3 border-r-3 rounded-tr-xl ${
                msg.isSpecial ? 'border-green-600' : 'border-white/70'
              }`} />
              
              {/* Special Effects */}
              {msg.isSpecial && (
                <>
                  <Star size={12} className="absolute -top-2 -left-2 text-orange-500 animate-pulse" fill="currentColor" />
                  <Star size={12} className="absolute -bottom-2 -right-2 text-green-600 animate-pulse" fill="currentColor" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            
            {/* Category + Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs lg:text-sm font-black uppercase tracking-wider drop-shadow-lg ${
                msg.isSpecial ? 'text-orange-900' : 'text-white'
              }`}>
                {msg.category[lang] || msg.category['en']}
              </span>
              
              <div className="hidden lg:block h-5 w-0.5 bg-white/60 rounded-full" />
              
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {msg.badges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg ${badge.color} ${badge.glow} text-white text-xs font-black uppercase tracking-wide border-2 border-white/50 backdrop-blur-xl shadow-xl animate-[badge-glow_3s_ease-in-out_infinite]`}
                    style={{ animationDelay: `${idx * 0.5}s` }}
                  >
                    {badge.text[lang] || badge.text['en']}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Title */}
            <h2 className={`text-2xl lg:text-3xl font-black leading-tight tracking-tight truncate w-full drop-shadow-2xl ${
              msg.isSpecial 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-slate-900 to-green-700 bg-[length:200%_auto] animate-[gradient-flow_6s_ease_infinite]' 
                : 'text-white'
            }`}
            style={{
              textShadow: msg.isSpecial ? 'none' : '3px 3px 8px rgba(0,0,0,0.5), 0 0 30px currentColor'
            }}>
              {msg.title[lang] || msg.title['en']}
            </h2>
            
            {/* Subtitle */}
            <p className={`text-sm lg:text-base font-bold leading-snug truncate w-full drop-shadow-lg ${
              msg.isSpecial ? 'text-slate-900' : 'text-white/95'
            }`}
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.4)' }}>
              {msg.subtitle[lang] || msg.subtitle['en']}
            </p>
          </div>
        </div>

        {/* Right: CTA + Status */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-6 shrink-0">
          
          {/* Separator */}
          <div className="hidden lg:block h-20 w-0.5 bg-white/50 rounded-full shadow-lg" />
          
          {/* CTA Button */}
          <button className={`group/cta relative px-6 py-3 rounded-xl backdrop-blur-2xl border-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden ${
            msg.isSpecial 
              ? 'bg-gradient-to-r from-orange-600 via-yellow-500 to-green-700 border-white/80 text-white' 
              : 'bg-white/95 hover:bg-white border-white/80'
          }`}>
            {/* Button Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-200%] group-hover/cta:translate-x-[200%] transition-transform duration-1000" />
            <div className="absolute top-0 inset-x-4 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm" />
            
            {/* Button Content */}
            <div className="relative flex items-center gap-2.5">
              <span className={`text-base font-black tracking-wide drop-shadow-lg ${
                msg.isSpecial ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r'
              }`}
              style={msg.isSpecial ? {} : {
                backgroundImage: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`
              }}>
                {msg.cta[lang] || msg.cta['en']}
              </span>
              <ArrowRight size={18} className="group-hover/cta:translate-x-2 transition-transform" strokeWidth={3} />
            </div>
            
            {/* Special Decorations */}
            {msg.isSpecial && (
              <>
                <Heart size={14} className="absolute -top-2 -right-2 text-red-500 animate-pulse" fill="currentColor" />
                <Sparkles size={12} className="absolute -bottom-1 -left-1 text-yellow-400 animate-bounce" />
              </>
            )}
          </button>
          
          {/* Live Indicator */}
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-2xl border-2 shadow-xl ${
              msg.isSpecial ? 'bg-orange-700/95 border-orange-400' : 'bg-white/25 border-white/50'
            }`}>
              <Activity size={14} className="text-white" strokeWidth={3} />
              <span className="text-xs font-black text-white uppercase tracking-wide">Live</span>
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-white animate-ping" />
                <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_20px_white]" />
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="flex gap-2">
              {messages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    idx === currentIndex 
                      ? msg.isSpecial ? 'w-8 bg-gradient-to-r from-orange-600 via-yellow-500 to-green-700' : 'w-8 bg-white'
                      : msg.isSpecial ? 'w-2 bg-orange-300/60' : 'w-2 bg-white/60'
                  }`}
                  style={{
                    boxShadow: idx === currentIndex ? `0 0 20px ${msg.accentGlow}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-7 flex gap-2 opacity-60 pointer-events-none">
        {msg.isSpecial ? (
          <>
            <div className="w-3 h-3 rounded-full bg-orange-600 shadow-[0_0_20px_#FF9933] animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_20px_white] animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-3 h-3 rounded-full bg-green-600 shadow-[0_0_20px_#138808] animate-pulse" style={{ animationDelay: '0.6s' }} />
          </>
        ) : (
          <>
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_white] animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-white/70 shadow-[0_0_12px_white] animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-3 h-3 rounded-full bg-white/50 shadow-[0_0_10px_white] animate-pulse" style={{ animationDelay: '0.6s' }} />
          </>
        )}
      </div>
      
      {/* Special Corner Sparkles */}
      {msg.isSpecial && (
        <>
          <Sparkles size={22} className="absolute top-4 right-7 text-yellow-400 animate-pulse pointer-events-none drop-shadow-2xl" strokeWidth={3} />
          <Zap size={18} className="absolute bottom-4 right-7 text-green-400 animate-bounce pointer-events-none drop-shadow-2xl" fill="currentColor" />
        </>
      )}
    </div>
  );
};
