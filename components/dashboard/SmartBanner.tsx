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
      gradient: 'from-orange-600 via-white to-green-600',
      deepGradient: 'from-orange-700 via-slate-100 to-green-700',
      meshGradient: 'from-orange-500/30 via-white/20 to-green-500/30',
      accentGradient: 'from-orange-500 to-green-600',
      glowColor: 'rgba(255, 103, 31, 0.5)',
      particleColors: ['#FF671F', '#FFFFFF', '#138808'],
      icon: Flag,
      badges: [
        { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(255,103,31,0.8)]' },
        { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-green-600', glow: 'shadow-[0_0_20px_rgba(19,136,8,0.8)]' }
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
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      deepGradient: 'from-violet-800 via-purple-900 to-fuchsia-950',
      meshGradient: 'from-violet-500/30 via-purple-500/20 to-fuchsia-500/30',
      accentGradient: 'from-violet-400 to-fuchsia-500',
      glowColor: 'rgba(139, 92, 246, 0.5)',
      particleColors: ['#8B5CF6', '#A855F7', '#D946EF'],
      icon: CalendarIcon,
      badges: [
        { text: { mr: currentDay, hi: currentDay, en: currentDay }, color: 'bg-violet-500', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.8)]' },
        { text: { mr: `${currentDate}`, hi: `${currentDate}`, en: `${currentDate}` }, color: 'bg-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.8)]' }
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
      gradient: isRainy ? 'from-slate-600 via-blue-700 to-indigo-800' : isDay ? 'from-sky-500 via-blue-600 to-indigo-700' : 'from-indigo-800 via-purple-900 to-slate-900',
      deepGradient: isRainy ? 'from-slate-800 via-blue-900 to-slate-950' : isDay ? 'from-orange-400 via-sky-600 to-blue-800' : 'from-indigo-950 via-purple-950 to-black',
      meshGradient: isRainy ? 'from-blue-500/30 via-cyan-500/20 to-slate-500/30' : isDay ? 'from-yellow-500/30 via-blue-500/20 to-indigo-500/30' : 'from-indigo-500/30 via-purple-500/20 to-slate-500/30',
      accentGradient: isRainy ? 'from-blue-400 to-cyan-500' : isDay ? 'from-yellow-400 to-orange-500' : 'from-indigo-400 to-purple-500',
      glowColor: isRainy ? 'rgba(59, 130, 246, 0.5)' : isDay ? 'rgba(251, 191, 36, 0.5)' : 'rgba(139, 92, 246, 0.5)',
      particleColors: isRainy ? ['#3B82F6', '#06B6D4', '#64748B'] : isDay ? ['#FBBF24', '#F59E0B', '#3B82F6'] : ['#6366F1', '#A855F7', '#64748B'],
      icon: isRainy ? CloudRain : isDay ? Sun : Moon,
      badges: [
        { text: { mr: isDay ? 'दिवस' : 'रात्र', hi: isDay ? 'दिन' : 'रात', en: isDay ? 'Day' : 'Night' }, color: isDay ? 'bg-orange-500' : 'bg-indigo-600', glow: isDay ? 'shadow-[0_0_20px_rgba(251,146,60,0.8)]' : 'shadow-[0_0_20px_rgba(99,102,241,0.8)]' },
        { text: { mr: `${temp}°C`, hi: `${temp}°C`, en: `${temp}°C` }, color: isRainy ? 'bg-blue-500' : isDay ? 'bg-yellow-500' : 'bg-purple-500', glow: 'shadow-[0_0_15px_currentColor]' }
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
      gradient: isPositiveTrend ? 'from-emerald-600 via-teal-600 to-cyan-600' : 'from-rose-600 via-red-600 to-orange-600',
      deepGradient: isPositiveTrend ? 'from-emerald-700 via-teal-800 to-cyan-900' : 'from-rose-700 via-red-800 to-orange-900',
      meshGradient: isPositiveTrend ? 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30' : 'from-rose-500/30 via-red-500/20 to-orange-500/30',
      accentGradient: isPositiveTrend ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-orange-500',
      glowColor: isPositiveTrend ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)',
      particleColors: isPositiveTrend ? ['#10B981', '#14B8A6', '#06B6D4'] : ['#F43F5E', '#EF4444', '#FB923C'],
      icon: TrendingUp,
      badges: [
        { text: { mr: isPositiveTrend ? 'तेजी' : 'मंदी', hi: isPositiveTrend ? 'बढ़त' : 'गिरावट', en: isPositiveTrend ? 'Bullish' : 'Bearish' }, color: isPositiveTrend ? 'bg-emerald-500' : 'bg-red-500', glow: isPositiveTrend ? 'shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.8)]' },
        { text: { mr: marketData.trend, hi: marketData.trend, en: marketData.trend }, color: 'bg-white/20', glow: 'shadow-[0_0_12px_rgba(255,255,255,0.4)]' }
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
      gradient: 'from-amber-600 via-orange-600 to-yellow-600',
      deepGradient: 'from-amber-700 via-orange-700 to-yellow-700',
      meshGradient: 'from-amber-500/30 via-orange-500/20 to-yellow-500/30',
      accentGradient: 'from-amber-400 to-orange-500',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      particleColors: ['#F59E0B', '#FB923C', '#FBBF24'],
      icon: Lightbulb,
      badges: [
        { text: { mr: 'AI सुचवलेले', hi: 'AI सुझाव', en: 'AI Suggested' }, color: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.8)]' },
        { text: { mr: '100% उपयुक्त', hi: '100% उपयोगी', en: '100% Useful' }, color: 'bg-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.8)]' }
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
        @keyframes professional-slide-in {
          0% { 
            transform: translateX(-120%) scale(0.9) rotateY(-15deg); 
            opacity: 0;
            filter: blur(12px);
          }
          60% {
            transform: translateX(5%) scale(1.02) rotateY(2deg);
            filter: blur(2px);
          }
          100% { 
            transform: translateX(0) scale(1) rotateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }
        
        @keyframes professional-slide-out {
          0% { 
            transform: translateX(0) scale(1) rotateY(0);
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: translateX(120%) scale(0.9) rotateY(15deg);
            opacity: 0;
            filter: blur(12px);
          }
        }
        
        @keyframes shine-sweep-premium {
          0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
          50% { opacity: 0.7; }
          100% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
        }
        
        @keyframes badge-pulse-glow {
          0%, 100% { 
            transform: scale(1); 
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.08); 
            filter: brightness(1.2);
          }
        }
        
        @keyframes glow-pulse-cinematic {
          0%, 100% { 
            box-shadow: 
              0 0 30px var(--glow-color), 
              0 0 60px var(--glow-color),
              0 10px 40px rgba(0,0,0,0.5),
              inset 0 2px 0 rgba(255,255,255,0.15);
          }
          50% { 
            box-shadow: 
              0 0 50px var(--glow-color), 
              0 0 100px var(--glow-color),
              0 0 150px var(--glow-color),
              0 15px 60px rgba(0,0,0,0.7),
              inset 0 3px 0 rgba(255,255,255,0.25);
          }
        }
        
        @keyframes tricolor-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes flag-flutter {
          0%, 100% { transform: rotateY(0deg) scale(1); }
          25% { transform: rotateY(-8deg) scale(1.05); }
          75% { transform: rotateY(8deg) scale(1.05); }
        }
        
        @keyframes sparkle-burst {
          0%, 100% { 
            transform: scale(0) rotate(0deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(2) rotate(180deg); 
            opacity: 1; 
          }
        }
        
        @keyframes ashoka-chakra-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes patriotic-glow-deep {
          0%, 100% { 
            text-shadow: 
              2px 2px 0 rgba(0,0,0,0.3),
              0 0 15px rgba(255, 103, 31, 0.6), 
              0 0 30px rgba(19, 136, 8, 0.6); 
          }
          50% { 
            text-shadow: 
              3px 3px 0 rgba(0,0,0,0.4),
              0 0 25px rgba(255, 103, 31, 0.9), 
              0 0 50px rgba(19, 136, 8, 0.9), 
              0 0 75px rgba(255, 255, 255, 0.7); 
          }
        }
        
        @keyframes text-3d-cinematic {
          0%, 100% {
            text-shadow: 
              1px 1px 0 rgba(0,0,0,0.5),
              2px 2px 0 rgba(0,0,0,0.4),
              3px 3px 0 rgba(0,0,0,0.3),
              4px 4px 0 rgba(0,0,0,0.2),
              0 0 25px currentColor,
              0 0 40px currentColor;
          }
          50% {
            text-shadow: 
              2px 2px 0 rgba(0,0,0,0.6),
              4px 4px 0 rgba(0,0,0,0.5),
              6px 6px 0 rgba(0,0,0,0.4),
              8px 8px 0 rgba(0,0,0,0.3),
              10px 10px 0 rgba(0,0,0,0.2),
              0 0 40px currentColor,
              0 0 70px currentColor,
              0 0 100px currentColor;
          }
        }
        
        @keyframes gradient-shift-cinematic {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes icon-float-3d {
          0%, 100% { 
            transform: translateY(0) translateZ(0) rotateZ(0deg); 
          }
          33% { 
            transform: translateY(-3px) translateZ(5px) rotateZ(-3deg); 
          }
          66% { 
            transform: translateY(-1px) translateZ(3px) rotateZ(3deg); 
          }
        }
        
        @keyframes particles-float {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: translate(var(--float-x), var(--float-y)) scale(1.5);
            opacity: 0.4;
          }
        }
        
        @keyframes mesh-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        @keyframes glass-shimmer {
          0% { 
            background-position: -200% 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            background-position: 200% 0;
            opacity: 0;
          }
        }
      `}</style>

      {/* Ultra-Premium Cinematic Container */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700"
        style={{
          '--glow-color': msg.glowColor,
          animation: 'glow-pulse-cinematic 5s ease-in-out infinite'
        } as React.CSSProperties}
      >
        {/* Layer 1: Deep Cinematic Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${msg.deepGradient} opacity-95`}></div>
        
        {/* Layer 2: Main Gradient with Enhanced Animation */}
        {msg.isSpecial ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-white to-green-600 bg-[length:400%_400%] animate-[tricolor-wave_10s_ease-in-out_infinite]"></div>
            
            {/* Rangoli Patterns */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <radialGradient id="orangeGlow" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="rgba(255, 103, 31, 0.8)" />
                    <stop offset="100%" stopColor="rgba(255, 103, 31, 0)" />
                  </radialGradient>
                  <radialGradient id="greenGlow" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="rgba(19, 136, 8, 0.8)" />
                    <stop offset="100%" stopColor="rgba(19, 136, 8, 0)" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#orangeGlow)" />
                <circle cx="750" cy="50" r="40" fill="url(#greenGlow)" />
                <circle cx="50" cy="150" r="40" fill="url(#greenGlow)" />
                <circle cx="750" cy="150" r="40" fill="url(#orangeGlow)" />
                <path d="M0,100 Q200,60 400,100 T800,100" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="4" fill="none" />
                <path d="M0,100 Q200,140 400,100 T800,100" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="4" fill="none" />
              </svg>
            </div>
            
            {/* Ashoka Chakra */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-28 h-28 opacity-15">
              <div className="w-full h-full animate-[ashoka-chakra-spin_30s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,56,147,0.8)]">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#003893" strokeWidth="4" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#003893" strokeWidth="3" />
                  {[...Array(24)].map((_, i) => (
                    <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)} y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)} stroke="#003893" strokeWidth="2" />
                  ))}
                </svg>
              </div>
            </div>
            
            {/* Enhanced Tricolor Particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: msg.particleColors[i % 3],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  animation: `particles-float ${3 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '--float-x': `${(Math.random() - 0.5) * 50}px`,
                  '--float-y': `${(Math.random() - 0.5) * 50}px`,
                  boxShadow: `0 0 15px ${msg.particleColors[i % 3]}, 0 0 30px ${msg.particleColors[i % 3]}`,
                  filter: 'blur(1px)'
                } as React.CSSProperties}
              ></div>
            ))}
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-r ${msg.gradient} bg-[length:300%_300%] animate-[gradient-shift-cinematic_8s_ease_infinite]`}></div>
            
            {/* Cinematic Mesh Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${msg.meshGradient} bg-[length:200%_200%] animate-[mesh-flow_15s_linear_infinite] opacity-60`}></div>
            
            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: msg.particleColors[i % msg.particleColors.length],
                  animation: `particles-float ${4 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '--float-x': `${(Math.random() - 0.5) * 80}px`,
                  '--float-y': `${(Math.random() - 0.5) * 80}px`,
                  boxShadow: `0 0 20px ${msg.particleColors[i % msg.particleColors.length]}`,
                  filter: 'blur(1.5px)'
                } as React.CSSProperties}
              ></div>
            ))}
            
            {/* Radial Cinematic Overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                radial-gradient(circle at 15% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
                radial-gradient(circle at 85% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 80%)
              `
            }}></div>
          </>
        )}
        
        {/* Layer 3: Glass Morphism Effect */}
        <div className="absolute inset-0 backdrop-blur-[0.5px] bg-white/[0.02]"></div>
        
        {/* Layer 4: Advanced Mesh Grid */}
        <div className="absolute inset-0 opacity-15" style={{
          background: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.05) 0px,
              transparent 1px,
              transparent 3px,
              rgba(255,255,255,0.05) 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.05) 0px,
              transparent 1px,
              transparent 3px,
              rgba(255,255,255,0.05) 4px
            )
          `
        }}></div>
        
        {/* Layer 5: Ultra-Premium Shine Sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine-sweep-premium_6s_ease-in-out_infinite]"></div>
        </div>
        
        {/* Layer 6: Glass Shimmer Effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            backgroundSize: '200% 100%',
            animation: 'glass-shimmer 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* Layer 7: Animated Border with Enhanced SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect 
            x="1" 
            y="1" 
            width="calc(100% - 2px)" 
            height="calc(100% - 2px)" 
            rx="16" 
            ry="16" 
            fill="none" 
            stroke="url(#borderGradient)" 
            strokeWidth="2"
            strokeDasharray="15 5"
            className="opacity-40"
            filter="url(#glow)"
          />
        </svg>
        
        {/* Layer 8: Multi-Layer Bottom Accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${msg.accentGradient} opacity-80 blur-[2px]`}></div>
        <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${msg.accentGradient} shadow-[0_0_20px_currentColor]`}></div>
        
        {/* Layer 9: Enhanced Noise Texture */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
        
        {/* Layer 10: Top Cinematic Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>

      {/* Content Container with Enhanced 3D Transform */}
      <div 
        className={`relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 lg:px-7 gap-3 lg:gap-0 ${
          isAnimating ? 'animate-[professional-slide-out_0.7s_cubic-bezier(0.6,0,0.8,0.2)_forwards]' : 'animate-[professional-slide-in_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]'
        }`}
        style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
      >
        {/* Left Section: Icon + Content */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-6 flex-1 min-w-0 w-full">
          
          {/* Ultra-Premium Icon Container */}
          <div className="relative shrink-0 group/icon" style={{ transform: 'translateZ(25px)' }}>
            {/* Multi-Layer Cinematic Glow */}
            <div className={`absolute -inset-3 rounded-2xl blur-3xl transition-all duration-500 group-hover/icon:blur-[40px] ${
              msg.isSpecial 
                ? 'bg-gradient-to-br from-orange-400 via-white to-green-400 animate-[tricolor-wave_5s_ease-in-out_infinite] opacity-70' 
                : 'bg-white/40 opacity-50 group-hover/icon:opacity-70'
            }`}></div>
            
            <div className={`absolute -inset-1.5 rounded-2xl blur-xl ${
              msg.isSpecial 
                ? 'bg-gradient-to-br from-orange-500 to-green-500 opacity-60' 
                : 'bg-white/30 opacity-40'
            }`}></div>
            
            <div className={`absolute -inset-0.5 rounded-2xl blur-md ${
              msg.isSpecial 
                ? 'bg-gradient-to-br from-orange-600 to-green-600 opacity-40' 
                : 'bg-white/20 opacity-30'
            }`}></div>
            
            {/* Icon Box with Deep Cinematic Effects */}
            <div className={`relative w-14 h-14 lg:w-[4.5rem] lg:h-[4.5rem] rounded-[1.125rem] lg:rounded-[1.375rem] backdrop-blur-3xl flex items-center justify-center shadow-[0_15px_50px_rgba(0,0,0,0.6)] group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-500 overflow-hidden ${
              msg.isSpecial 
                ? 'bg-white/98 border-[3px] border-orange-500 animate-[flag-flutter_4s_ease-in-out_infinite]' 
                : 'bg-white/15 border-[2.5px] border-white/50'
            }`}>
              
              {/* Multi-Layer Inner Gradients */}
              <div className={`absolute inset-0 ${
                msg.isSpecial 
                  ? 'bg-gradient-to-br from-orange-100 via-white to-green-100' 
                  : 'bg-gradient-to-br from-white/40 via-white/20 to-transparent'
              }`}></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10"></div>
              
              {/* Enhanced Top Shine Bar */}
              <div className="absolute top-1 inset-x-3 lg:inset-x-4 h-[4px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full blur-[3px] shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              
              {/* Icon with Enhanced 3D Float */}
              <Icon 
                size={28} 
                className={`relative z-10 drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)] lg:w-8 lg:h-8 transition-all duration-500 ${
                  msg.isSpecial 
                    ? 'text-orange-600 animate-[icon-float-3d_4s_ease-in-out_infinite]' 
                    : 'text-white animate-[icon-float-3d_5s_ease-in-out_infinite]'
                }`}
                strokeWidth={3} 
              />
              
              {/* Enhanced Corner Accents */}
              <div className={`absolute top-0.5 right-0.5 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-xl ${
                msg.isSpecial ? 'border-green-600 shadow-[0_0_10px_rgba(19,136,8,0.6)]' : 'border-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              }`}></div>
              
              <div className={`absolute bottom-0.5 left-0.5 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl-lg ${
                msg.isSpecial ? 'border-orange-500/60 shadow-[0_0_8px_rgba(255,103,31,0.5)]' : 'border-white/40 shadow-[0_0_6px_rgba(255,255,255,0.3)]'
              }`}></div>
              
              {/* Special Effects for Republic Day */}
              {msg.isSpecial && (
                <>
                  <Star size={11} className="absolute -top-1.5 -left-1.5 text-orange-500 animate-pulse drop-shadow-[0_0_12px_rgba(255,103,31,0.9)]" fill="currentColor" />
                  <Star size={11} className="absolute -bottom-1.5 -right-1.5 text-green-600 animate-pulse drop-shadow-[0_0_12px_rgba(19,136,8,0.9)]" fill="currentColor" style={{ animationDelay: '0.5s' }} />
                  <Crown size={13} className="absolute -top-2 -right-1 text-yellow-500 animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,1)]" />
                </>
              )}
              
              {/* Enhanced Particle Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0 group-hover/icon:opacity-100 transition-opacity">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/90"
                    style={{
                      top: `${15 + i * 12}%`,
                      left: `${15 + i * 12}%`,
                      animation: `sparkle-burst 1.8s ease-out infinite`,
                      animationDelay: `${i * 0.25}s`,
                      boxShadow: '0 0 12px currentColor'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Text Content with Enhanced 3D Depth */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0" style={{ transform: 'translateZ(15px)' }}>
            
            {/* Category Badge Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-lg transition-all duration-300 ${
                msg.isSpecial ? 'text-orange-900' : 'text-white/90'
              }`}>
                {msg.category[lang] || msg.category['en']}
              </span>
              
              <div className="hidden lg:block h-4 w-[2px] bg-gradient-to-b from-transparent via-white/50 to-transparent rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
              
              {/* Enhanced Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {msg.badges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-2.5 py-1 lg:px-3 lg:py-1 rounded-lg ${badge.color} ${badge.glow} text-white text-[9px] lg:text-[10px] font-black uppercase tracking-wider border-2 border-white/40 backdrop-blur-xl animate-[badge-pulse-glow_3s_ease-in-out_infinite]`}
                    style={{ 
                      animationDelay: `${idx * 0.4}s`,
                      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4), ${badge.glow}`
                    }}
                  >
                    {badge.text[lang] || badge.text['en']}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Title with Ultra-Premium Cinematic 3D Text */}
            <h2 className={`text-xl lg:text-[1.75rem] font-black leading-tight tracking-tight truncate w-full transition-all duration-500 ${
              msg.isSpecial 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-slate-900 to-green-600 bg-[length:200%_auto] animate-[gradient-shift-cinematic_5s_ease_infinite,patriotic-glow-deep_5s_ease-in-out_infinite]' 
                : 'text-white animate-[text-3d-cinematic_5s_ease-in-out_infinite]'
            }`}>
              {msg.title[lang] || msg.title['en']}
            </h2>
            
            {/* Subtitle with Enhanced Depth */}
            <p className={`text-sm lg:text-[0.9375rem] font-bold leading-snug truncate w-full transition-all duration-300 ${
              msg.isSpecial 
                ? 'text-slate-800 drop-shadow-md' 
                : 'text-white/95 drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)]'
            }`} style={{
              textShadow: msg.isSpecial ? 'none' : '2px 2px 4px rgba(0,0,0,0.4)'
            }}>
              {msg.subtitle[lang] || msg.subtitle['en']}
            </p>
          </div>
        </div>

        {/* Right Section: CTA + Status */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-5 shrink-0 mt-1 lg:mt-0 lg:ml-6" style={{ transform: 'translateZ(20px)' }}>
          
          {/* Vertical Separator with Enhanced Glow */}
          <div className="hidden lg:block relative h-16 w-[2px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent blur-md"></div>
          </div>
          
          {/* Ultra-Premium CTA Button */}
          <button className={`group/cta relative px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl backdrop-blur-2xl border-[2.5px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-110 hover:-translate-y-1 overflow-hidden ${
            msg.isSpecial 
              ? 'bg-gradient-to-r from-orange-500 via-yellow-500 to-green-600 border-white/70 text-white' 
              : 'bg-white/95 hover:bg-white border-white/70'
          }`}
          style={{
            boxShadow: msg.isSpecial 
              ? '0 12px 40px rgba(0,0,0,0.5), inset 0 3px 0 rgba(255,255,255,0.4)' 
              : '0 12px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.5)'
          }}
          >
            {/* Multi-Layer Button Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-250%] group-hover/cta:translate-x-[250%] transition-transform duration-1200"></div>
            <div className="absolute top-0 inset-x-3 h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[2px] shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center gap-2.5">
              <span className={`text-sm lg:text-[0.9375rem] font-black tracking-wide drop-shadow-lg ${
                msg.isSpecial 
                  ? 'text-white' 
                  : `bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`
              }`}>
                {msg.cta[lang] || msg.cta['en']}
              </span>
              <ArrowRight 
                size={16} 
                className={`group-hover/cta:translate-x-2 transition-all duration-300 lg:w-[1.125rem] lg:h-[1.125rem] drop-shadow-lg ${
                  msg.isSpecial 
                    ? 'text-white' 
                    : `bg-gradient-to-r ${msg.accentGradient} bg-clip-text text-transparent`
                }`}
                strokeWidth={3.5} 
              />
            </div>
            
            {/* Special Effects */}
            {msg.isSpecial && (
              <>
                <Heart size={13} className="absolute -top-2 -right-1.5 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,1)]" fill="currentColor" />
                <Sparkles size={11} className="absolute -bottom-1 -left-1 text-yellow-400 animate-bounce drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]" />
              </>
            )}
            
            {/* Enhanced Hover Particles */}
            <div className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/90"
                  style={{
                    top: `${25 + i * 18}%`,
                    right: `${8 + i * 25}%`,
                    animation: `sparkle-burst 1.2s ease-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: '0 0 10px currentColor'
                  }}
                ></div>
              ))}
            </div>
          </button>
          
          {/* Enhanced Live Indicator */}
          <div className="flex flex-col items-end lg:items-center gap-1.5">
            <div className={`flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl backdrop-blur-2xl border-2 shadow-xl ${
              msg.isSpecial 
                ? 'bg-orange-600/95 border-orange-400/70' 
                : 'bg-white/20 border-white/40'
            }`}
            style={{
              boxShadow: msg.isSpecial 
                ? '0 6px 20px rgba(255,103,31,0.5), inset 0 2px 0 rgba(255,255,255,0.3)' 
                : '0 6px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)'
            }}
            >
              <Activity size={12} className="text-white lg:w-[0.875rem] lg:h-[0.875rem] drop-shadow-lg" strokeWidth={3} />
              <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.15em] drop-shadow-md">Live</span>
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-white animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
              </div>
            </div>
            
            {/* Premium Progress Indicators */}
            <div className="flex gap-1.5">
              {messages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                    idx === currentIndex 
                      ? msg.isSpecial 
                        ? 'w-6 lg:w-8 bg-gradient-to-r from-orange-500 via-yellow-400 to-green-600'
                        : 'w-5 lg:w-7 bg-white'
                      : msg.isSpecial
                        ? 'w-1.5 bg-orange-300/50'
                        : 'w-1.5 bg-white/50'
                  }`}
                  style={{
                    boxShadow: idx === currentIndex 
                      ? msg.isSpecial 
                        ? '0 0 15px rgba(255,103,31,1), inset 0 1px 0 rgba(255,255,255,0.5)' 
                        : '0 0 12px rgba(255,255,255,1), inset 0 1px 0 rgba(255,255,255,0.5)'
                      : 'none'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Corner Elements */}
      <div className="absolute top-3 left-7 flex items-center gap-2 opacity-50 pointer-events-none">
        {msg.isSpecial ? (
          <>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-orange-600 shadow-[0_0_15px_rgba(255,103,31,1)] animate-pulse"></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-green-600 shadow-[0_0_15px_rgba(19,136,8,1)] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </>
        ) : (
          <>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse"></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </>
        )}
      </div>
      
      {/* Premium Corner Sparkles */}
      {msg.isSpecial && (
        <>
          <Sparkles size={20} className="absolute top-3 right-7 text-yellow-400 animate-pulse pointer-events-none drop-shadow-[0_0_20px_rgba(234,179,8,1)]" strokeWidth={3} />
          <Sparkles size={18} className="absolute bottom-3 left-7 text-orange-400 animate-pulse pointer-events-none drop-shadow-[0_0_18px_rgba(251,146,60,1)]" strokeWidth={3} style={{ animationDelay: '0.7s' }} />
          <Zap size={16} className="absolute bottom-3 right-7 text-green-400 animate-bounce pointer-events-none drop-shadow-[0_0_18px_rgba(74,222,128,1)]" fill="currentColor" style={{ animationDelay: '0.4s' }} />
        </>
      )}
    </div>
  );
};
