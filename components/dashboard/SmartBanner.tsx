import React, { useEffect, useMemo, useState } from 'react';
import {
  CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, Flag, Heart, Sparkles,
  Star, Sun, Moon, Zap, Crown, Calendar as CalendarIcon, AlertTriangle
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import clsx from 'clsx';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';
import { getLiveAgriUpdates } from '../../services/geminiService';

type Badge = { text: Record<string, string>; color: string; glow?: string };
type Msg = {
  id: string;
  category: Record<string, string>;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  cta: Record<string, string>;
  bgBase: string;
  bgOverlay: string;
  accentGlow: string;
  secondaryGlow: string;
  particleColors: string[];
  icon: any;
  badges: Badge[];
  isSpecial?: boolean;
};

export const SmartBanner = ({
  lang,
  className,
  weather,
  user
}: {
  lang: Language;
  className?: string;
  weather?: any;
  user?: UserProfile;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [now, setNow] = useState(() => new Date());

  const txt = DASH_TEXT[lang];

  // Real-time clock update
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // --- Weather (dynamic) ---
  const temp = weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--';
  const wCode = weather?.current?.weather_code || 0;
  const isDay = weather?.current?.is_day !== 0;
  const windSpeed = weather?.current?.wind_speed_10m || 0;
  const wDesc = txt.weather_desc[wCode] || txt.weather_desc[0];
  const isRainy = wCode >= 51;
  const isStormy = wCode >= 95;
  const isHighWind = windSpeed > 20;

  // --- Market (dynamic) ---
  const userCropName = user?.crop || 'Soyabean';
  const marketData =
    MOCK_MARKET.find(m => m.name.toLowerCase().includes(userCropName.toLowerCase())) || MOCK_MARKET[0];
  const displayCropName = txt.crops[marketData.name] || marketData.name;
  const isPositiveTrend = marketData.trend.includes('+');

  // --- Calendar (dynamic) ---
  const dayNames: Record<string, string[]> = {
    mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };

  const monthNames: Record<string, string[]> = {
    mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };

  const currentDay = dayNames[lang]?.[now.getDay()] ?? dayNames.en[now.getDay()];
  const currentDate = now.getDate();
  const currentMonth = monthNames[lang]?.[now.getMonth()] ?? monthNames.en[now.getMonth()];
  const currentYear = now.getFullYear();
  const currentTime = now.toLocaleTimeString(lang === 'en' ? 'en-US' : 'hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const isRepublicDay = now.getMonth() === 0 && now.getDate() === 26;

  // --- Fetch AI updates ---
  useEffect(() => {
    let mounted = true;

    const fetchAIUpdates = async () => {
      try {
        setIsLoadingAI(true);
        await new Promise(resolve => setTimeout(resolve, 900));
        const updates = await getLiveAgriUpdates(lang);
        if (mounted && updates && updates.length > 0) setLiveUpdates(updates);
      } catch {
        // silent fail
      } finally {
        if (mounted) setIsLoadingAI(false);
      }
    };

    fetchAIUpdates();
    const refreshInterval = setInterval(fetchAIUpdates, 10 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [lang]);

  // --- Optimized particle seeds ---
  const particleSeeds = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      top: 5 + Math.random() * 90,
      left: 5 + Math.random() * 90,
      size: 3 + Math.random() * 5,
      driftX: -15 + Math.random() * 30,
      driftY: -22 - Math.random() * 20,
      dur: 5.5 + Math.random() * 2.5,
      delay: Math.random() * 3,
      alpha: 0.25 + Math.random() * 0.35,
    }));
  }, []);

  // --- Message Queue ---
  const messages: Msg[] = useMemo(() => {
    const list: Msg[] = [];

    // 1) Republic Day
    if (isRepublicDay) {
      list.push({
        id: 'republic-day',
        category: { mr: 'राष्ट्रीय सण', hi: 'राष्ट्रीय पर्व', en: 'National Festival' },
        title: {
          mr: '🇮🇳 प्रजासत्ताक दिन शुभेच्छा 🇮🇳',
          hi: '🇮🇳 गणतंत्र दिवस की शुभकामनाएं 🇮🇳',
          en: '🇮🇳 Happy Republic Day 🇮🇳'
        },
        subtitle: {
          mr: 'भारताच्या 77व्या प्रजासत्ताक दिनाच्या हार्दिक शुभेच्छा',
          hi: 'भारत के 77वें गणतंत्र दिवस की हार्दिक शुभकामनाएं',
          en: 'Celebrating 77 years of Indian Democracy & Unity'
        },
        cta: { mr: 'संदेश शेअर करा', hi: 'संदेश शेयर करें', en: 'Share Wishes' },

        bgBase: 'radial-gradient(ellipse 120% 100% at 30% 40%, rgba(255,153,51,0.92) 0%, rgba(10,15,35,1) 48%, rgba(19,136,8,0.88) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.65) 50%, rgba(255,255,255,0.05) 100%)',
        accentGlow: 'rgba(255, 153, 51, 0.80)',
        secondaryGlow: 'rgba(19, 136, 8, 0.75)',
        particleColors: ['#FF9933', '#FFFFFF', '#138808', '#0ea5e9'],
        icon: Flag,
        badges: [
          { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-gradient-to-r from-orange-600/90 to-orange-500/90', glow: 'shadow-[0_0_25px_rgba(255,153,51,0.7)]' },
          { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-gradient-to-r from-green-700/90 to-green-600/90', glow: 'shadow-[0_0_25px_rgba(19,136,8,0.65)]' }
        ],
        isSpecial: true
      });
    }

    // 2) Severe weather
    if (isStormy || (isRainy && isHighWind)) {
      list.push({
        id: 'weather-alert',
        category: { mr: '⚠️ हवामान इशारा', hi: '⚠️ मौसम चेतावनी', en: '⚠️ Weather Alert' },
        title: {
          mr: isStormy ? 'वादळी पावसाची शक्यता!' : 'जोरदार पाऊस अपेक्षित',
          hi: isStormy ? 'तूफानी बारिश संभावित!' : 'तेज बारिश की संभावना',
          en: isStormy ? 'Storm Alert!' : 'Heavy Rain Expected'
        },
        subtitle: {
          mr: `वेग: ${windSpeed} किमी/तास • पिकांची काळजी घ्या`,
          hi: `गति: ${windSpeed} किमी/घंटा • फसल सुरक्षा करें`,
          en: `Wind: ${windSpeed} km/h • Secure your crops now`
        },
        cta: { mr: 'सल्ला पहा', hi: 'सलाह देखें', en: 'View Tips' },

        bgBase: 'radial-gradient(ellipse 110% 100% at 25% 25%, rgba(59,130,246,0.90) 0%, rgba(8,15,38,1) 52%, rgba(79,70,229,0.82) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.70) 55%, rgba(255,255,255,0.05) 100%)',
        accentGlow: 'rgba(59, 130, 246, 0.80)',
        secondaryGlow: 'rgba(99, 102, 241, 0.70)',
        particleColors: ['#60a5fa', '#3b82f6', '#818cf8', '#38bdf8'],
        icon: AlertTriangle,
        badges: [
          { text: { mr: 'तातडीचे', hi: 'अत्यावश्यक', en: 'Urgent' }, color: 'bg-gradient-to-r from-red-700/90 to-red-600/90', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.65)]' },
          { text: { mr: `${windSpeed} किमी`, hi: `${windSpeed} किमी`, en: `${windSpeed} km/h` }, color: 'bg-white/12 border border-white/25', glow: 'shadow-[0_0_18px_rgba(255,255,255,0.3)]' }
        ],
      });
    }

    // 3) AI updates
    if (liveUpdates.length > 0) {
      liveUpdates.slice(0, 4).forEach((update, idx) => {
        const isScheme = update.type === 'scheme';
        list.push({
          id: `ai-update-${idx}`,
          category: isScheme
            ? { mr: '🎯 सरकारी योजना', hi: '🎯 सरकारी योजना', en: '🎯 Govt Scheme' }
            : { mr: '📊 बाजार अपडेट', hi: '📊 बाजार अपडेट', en: '📊 Market Update' },
          title: { mr: update.title, hi: update.title, en: update.title },
          subtitle: { mr: update.subtitle, hi: update.subtitle, en: update.subtitle },
          cta: { mr: 'तपशील', hi: 'विवरण', en: 'Details' },

          bgBase: isScheme
            ? 'radial-gradient(ellipse 115% 100% at 30% 35%, rgba(16,185,129,0.90) 0%, rgba(3,7,18,1) 55%, rgba(20,184,166,0.85) 100%)'
            : 'radial-gradient(ellipse 110% 100% at 65% 30%, rgba(168,85,247,0.88) 0%, rgba(3,7,18,1) 54%, rgba(236,72,153,0.80) 100%)',
          bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.72) 58%, rgba(255,255,255,0.05) 100%)',
          accentGlow: isScheme ? 'rgba(16, 185, 129, 0.80)' : 'rgba(168, 85, 247, 0.80)',
          secondaryGlow: isScheme ? 'rgba(20, 184, 166, 0.70)' : 'rgba(236, 72, 153, 0.70)',
          particleColors: isScheme ? ['#10b981', '#34d399', '#2dd4bf'] : ['#a855f7', '#c084fc', '#ec4899'],
          icon: isScheme ? Crown : TrendingUp,
          badges: [
            {
              text: { mr: update.badge || 'नवीन', hi: update.badge || 'नया', en: update.badge || 'New' },
              color: 'bg-white/12 border border-white/25',
              glow: 'shadow-[0_0_18px_rgba(255,255,255,0.3)]'
            },
            {
              text: { mr: 'AI', hi: 'AI', en: 'AI' },
              color: 'bg-gradient-to-r from-cyan-600/90 to-blue-500/90',
              glow: 'shadow-[0_0_22px_rgba(6,182,212,0.6)]'
            }
          ]
        });
      });
    }

    // 4) Calendar fallback
    if (list.length < 2) {
      list.push({
        id: 'calendar',
        category: { mr: '📅 आजचा दिवस', hi: '📅 आज का दिन', en: '📅 Today' },
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
        cta: { mr: 'कॅलेंडर', hi: 'कैलेंडर', en: 'Calendar' },

        bgBase: 'radial-gradient(ellipse 110% 100% at 30% 30%, rgba(124,58,237,0.90) 0%, rgba(3,7,18,1) 56%, rgba(236,72,153,0.82) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.72) 58%, rgba(255,255,255,0.05) 100%)',
        accentGlow: 'rgba(168, 85, 247, 0.80)',
        secondaryGlow: 'rgba(236, 72, 153, 0.70)',
        particleColors: ['#a855f7', '#ec4899', '#d946ef'],
        icon: CalendarIcon,
        badges: [
          { text: { mr: currentDay, hi: currentDay, en: currentDay }, color: 'bg-white/12 border border-white/25' },
          { text: { mr: `${currentDate}`, hi: `${currentDate}`, en: `${currentDate}` }, color: 'bg-white/12 border border-white/25' }
        ]
      });
    }

    // 5) Standard weather
    if (!isStormy && !isHighWind && list.length < 3 && temp !== '--') {
      list.push({
        id: 'weather',
        category: { mr: '🌤️ हवामान', hi: '🌤️ मौसम', en: '🌤️ Weather' },
        title: isRainy
          ? { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना', en: 'Rain Expected' }
          : { mr: `${wDesc} • ${temp}°C`, hi: `${wDesc} • ${temp}°C`, en: `${wDesc} • ${temp}°C` },
        subtitle: isRainy
          ? {
              mr: 'पुढील काही तासात पाऊस. पिकांची काळजी घ्या.',
              hi: 'अगले कुछ घंटों में बारिश। फसल सुरक्षा करें।',
              en: 'Rain in a few hours. Protect crops.'
            }
          : {
              mr: `तापमान ${temp}°C • शेतीसाठी ${isDay ? 'चांगले' : 'शांत'} हवामान`,
              hi: `तापमान ${temp}°C • खेती के लिए ${isDay ? 'अच्छा' : 'शांत'} मौसम`,
              en: `Temp ${temp}°C • Weather is ${isDay ? 'good' : 'calm'} for farming`
            },
        cta: { mr: 'तपशील', hi: 'विवरण', en: 'Forecast' },

        bgBase: isDay
          ? 'radial-gradient(ellipse 115% 100% at 28% 25%, rgba(245,158,11,0.88) 0%, rgba(3,7,18,1) 58%, rgba(59,130,246,0.78) 100%)'
          : 'radial-gradient(ellipse 110% 100% at 70% 28%, rgba(99,102,241,0.88) 0%, rgba(3,7,18,1) 58%, rgba(139,92,246,0.78) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.72) 58%, rgba(255,255,255,0.05) 100%)',
        accentGlow: isDay ? 'rgba(245, 158, 11, 0.80)' : 'rgba(99, 102, 241, 0.80)',
        secondaryGlow: isDay ? 'rgba(59, 130, 246, 0.70)' : 'rgba(168, 85, 247, 0.70)',
        particleColors: isDay ? ['#f59e0b', '#3b82f6', '#60a5fa'] : ['#6366f1', '#a855f7', '#818cf8'],
        icon: isRainy ? CloudRain : isDay ? Sun : Moon,
        badges: [
          { text: { mr: isDay ? 'Day' : 'Night', hi: isDay ? 'Day' : 'Night', en: isDay ? 'Day' : 'Night' }, color: 'bg-white/12 border border-white/25' },
          { text: { mr: `${temp}°C`, hi: `${temp}°C`, en: `${temp}°C` }, color: 'bg-white/12 border border-white/25' }
        ],
      });
    }

    // 6) Market
    if (list.length < 4) {
      list.push({
        id: 'market',
        category: { mr: '💹 बाजार', hi: '💹 मार्केट', en: '💹 Market' },
        title: { mr: `${displayCropName}: ₹${marketData.price}`, hi: `${displayCropName}: ₹${marketData.price}`, en: `${displayCropName}: ₹${marketData.price}` },
        subtitle: {
          mr: `आवक: ${marketData.arrival} • ${marketData.trend} (${isPositiveTrend ? 'तेजी' : 'घसरण'})`,
          hi: `आवक: ${marketData.arrival} • ${marketData.trend} (${isPositiveTrend ? 'बढ़त' : 'गिरावट'})`,
          en: `Arrival: ${marketData.arrival} • Trend: ${marketData.trend}`
        },
        cta: { mr: 'भाव', hi: 'कीमत', en: 'Rates' },

        bgBase: isPositiveTrend
          ? 'radial-gradient(ellipse 115% 100% at 32% 28%, rgba(16,185,129,0.90) 0%, rgba(3,7,18,1) 58%, rgba(6,182,212,0.82) 100%)'
          : 'radial-gradient(ellipse 115% 100% at 32% 28%, rgba(239,68,68,0.90) 0%, rgba(3,7,18,1) 58%, rgba(249,115,22,0.80) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.72) 58%, rgba(255,255,255,0.05) 100%)',
        accentGlow: isPositiveTrend ? 'rgba(16, 185, 129, 0.80)' : 'rgba(239, 68, 68, 0.80)',
        secondaryGlow: isPositiveTrend ? 'rgba(6, 182, 212, 0.70)' : 'rgba(249, 115, 22, 0.70)',
        particleColors: isPositiveTrend ? ['#10b981', '#06b6d4', '#34d399'] : ['#ef4444', '#f97316', '#fb7185'],
        icon: TrendingUp,
        badges: [
          { text: { mr: isPositiveTrend ? 'Bullish' : 'Bearish', hi: isPositiveTrend ? 'Bullish' : 'Bearish', en: isPositiveTrend ? 'Bullish' : 'Bearish' }, color: 'bg-white/12 border border-white/25' },
          { text: { mr: marketData.trend, hi: marketData.trend, en: marketData.trend }, color: 'bg-white/12 border border-white/25' }
        ],
      });
    }

    // 7) Tip
    if (list.length < 4) {
      list.push({
        id: 'tip',
        category: { mr: '💡 स्मार्ट टीप', hi: '💡 स्मार्ट टिप', en: '💡 Smart Tip' },
        title: isDay
          ? { mr: 'फवारणीसाठी योग्य वेळ', hi: 'छिड़काव का सही समय', en: 'Good Time to Spray' }
          : { mr: 'पिकांना थंडीपासून वाचवा', hi: 'फसलों को ठंड से बचाएं', en: 'Protect Crops from Cold' },
        subtitle: isDay
          ? { mr: 'वारा कमी आहे. फवारणी आता करा (दुपारी ४ पर्यंत)', hi: 'हवा कम है। छिड़काव अभी करें (शाम 4 तक)', en: 'Low wind. Spray now (Before 4 PM)' }
          : { mr: 'रात्री तापमान कमी होऊ शकते. पाणी द्या', hi: 'रात में तापमान गिर सकता है। सिंचाई करें', en: 'Temp may drop tonight. Irrigate crops' },
        cta: { mr: 'सल्ला', hi: 'सलाह', en: 'Read Tip' },

        bgBase: 'radial-gradient(ellipse 112% 100% at 35% 28%, rgba(251,191,36,0.88) 0%, rgba(3,7,18,1) 58%, rgba(251,146,60,0.80) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.72) 58%, rgba(255,255,255,0.05) 100%)',
        accentGlow: 'rgba(251, 191, 36, 0.80)',
        secondaryGlow: 'rgba(251, 146, 60, 0.70)',
        particleColors: ['#fbbf24', '#fb923c', '#f59e0b'],
        icon: Lightbulb,
        badges: [
          { text: { mr: 'AI', hi: 'AI', en: 'AI' }, color: 'bg-white/12 border border-white/25' },
          { text: { mr: 'Tip', hi: 'Tip', en: 'Tip' }, color: 'bg-white/12 border border-white/25' }
        ]
      });
    }

    return list;
  }, [
    isRepublicDay,
    isStormy,
    isRainy,
    isHighWind,
    windSpeed,
    temp,
    wDesc,
    isDay,
    currentDay,
    currentDate,
    currentMonth,
    currentYear,
    currentTime,
    liveUpdates,
    lang,
    displayCropName,
    marketData.price,
    marketData.arrival,
    marketData.trend,
    isPositiveTrend
  ]);

  // --- Rotation animation ---
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 480);
    }, 8500);

    return () => clearInterval(interval);
  }, [messages.length]);

  const safeIndex = currentIndex >= messages.length ? 0 : currentIndex;
  const msg = messages[safeIndex];
  const Icon = msg?.icon || Lightbulb;

  if (!msg) return null;

  const particleCount = msg.isSpecial ? 14 : 10;

  return (
    <div className={clsx("relative flex flex-1 lg:max-w-5xl lg:mx-auto min-h-[88px] lg:h-32 rounded-[28px] overflow-hidden shadow-2xl", className)}>
      <style>{`
        .sb-gpu { transform: translate3d(0,0,0); backface-visibility: hidden; }
        .sb-will { will-change: transform, opacity; }

        @keyframes sb-slide-in {
          0%   { transform: translate3d(-12px, 8px, 0) scale(0.98); opacity: 0; filter: blur(4px); }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; filter: blur(0); }
        }

        @keyframes sb-slide-out {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 1; filter: blur(0); }
          100% { transform: translate3d(12px, -8px, 0) scale(0.98); opacity: 0; filter: blur(4px); }
        }

        @keyframes sb-bg-flow {
          0%, 100% { background-position: 0% 40%; }
          50% { background-position: 100% 60%; }
        }

        @keyframes sb-shine {
          0% { transform: translate3d(-120%,0,0) skewX(-15deg); opacity: 0; }
          40% { opacity: 0.6; }
          100% { transform: translate3d(220%,0,0) skewX(-15deg); opacity: 0; }
        }

        @keyframes sb-float {
          0%,100% { transform: translate3d(0,0,0) scale(1); opacity: var(--a); }
          50% { transform: translate3d(var(--dx), var(--dy), 0) scale(0.85); opacity: calc(var(--a) * 0.6); }
        }

        @keyframes sb-badge {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-1px) scale(1.05); }
        }

        @keyframes sb-glow-pulse {
          0%, 100% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.15); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 sb-gpu sb-anim"
        style={{
          background: msg.bgBase,
          backgroundSize: '200% 200%',
          animation: 'sb-bg-flow 16s ease-in-out infinite',
        }}
      />

      {/* Overlay + vignette */}
      <div
        className="absolute inset-0 sb-gpu pointer-events-none"
        style={{
          background: msg.bgOverlay,
          boxShadow: `
            inset 0 -80px 140px rgba(0,0,0,0.5),
            inset 0 2px 1px rgba(255,255,255,0.15),
            inset 0 -2px 1px rgba(0,0,0,0.3)
          `,
        }}
      />

      {/* Enhanced soft highlights */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
        style={{
          background: `
            radial-gradient(circle 400px at 20% 25%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(circle 350px at 85% 75%, rgba(0,0,0,0.25) 0%, transparent 50%),
            linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%, rgba(0,0,0,0.15) 100%)
          `
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particleSeeds.slice(0, particleCount).map((p) => {
          const color = msg.particleColors[p.id % msg.particleColors.length];
          return (
            <span
              key={p.id}
              className="absolute rounded-full sb-gpu sb-will"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: color,
                opacity: p.alpha,
                boxShadow: `0 0 14px ${color}55`,
                '--dx': `${p.driftX}px`,
                '--dy': `${p.driftY}px`,
                '--a': `${p.alpha}`,
                animation: `sb-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent sb-gpu"
          style={{ animation: 'sb-shine 8s ease-in-out infinite' }}
        />
      </div>

      {/* Accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] sb-gpu"
        style={{
          background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
          boxShadow: `0 0 22px ${msg.accentGlow}, 0 0 34px ${msg.secondaryGlow}`,
        }}
      />

      {/* Content */}
      <div
        className={clsx(
          "relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between",
          "p-6 lg:px-8 gap-4 lg:gap-6 sb-anim",
          isAnimating ? "sb-will sb-gpu animate-[sb-slide-out_0.48s_ease-out_forwards]" : "sb-will sb-gpu animate-[sb-slide-in_0.55s_ease-out_forwards]"
        )}
      >
        {/* Left section */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-6 flex-1 min-w-0 w-full">
          {/* Icon */}
          <div className="relative shrink-0 sb-gpu">
            <div
              className="absolute -inset-3 rounded-2xl opacity-55 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${msg.accentGlow} 0%, transparent 60%),
                             radial-gradient(circle at 70% 70%, ${msg.secondaryGlow} 0%, transparent 60%)`
              }}
            />
            <div className="relative w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-[18px] overflow-hidden border border-white/25 bg-white/12 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/8 to-transparent" />
              <div className="absolute top-0.5 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon size={32} className="text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]" strokeWidth={2.8} />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] lg:text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/85 bg-black/30 border border-white/15 backdrop-blur-lg px-3.5 py-1.5 rounded-[10px] shadow-lg">
                {msg.category[lang] || msg.category.en}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {msg.badges?.slice(0, 2).map((b, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wide text-white border border-white/20 backdrop-blur-xl sb-gpu sb-will",
                      b.color,
                      b.glow
                    )}
                    style={{ animation: 'sb-badge 3.2s ease-in-out infinite' }}
                  >
                    {b.text[lang] || b.text.en}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-[22px] lg:text-[28px] font-black leading-[1.15] tracking-[-0.02em] text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] line-clamp-1">
              {msg.title[lang] || msg.title.en}
            </h2>

            <p className="text-[13px] lg:text-[15px] font-semibold leading-snug text-white/92 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] line-clamp-1">
              {msg.subtitle[lang] || msg.subtitle.en}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-6 shrink-0">
          <div className="hidden lg:block h-20 w-px bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)]" />

          <button 
            className="group/cta relative px-7 py-3.5 rounded-[18px] bg-white/12 hover:bg-white/18 border border-white/25 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)] sb-gpu sb-will active:scale-100"
            aria-label={`${msg.cta[lang]} - ${msg.title[lang]}`}
            role="button"
            tabIndex={0}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-black/20 rounded-[18px]" />
            
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm" />
            
            <div className="relative flex items-center gap-3">
              <span className="text-[13px] lg:text-[15px] font-black text-white tracking-wide">
                {msg.cta[lang] || msg.cta.en}
              </span>
              <ArrowRight 
                size={18} 
                className="text-white group-hover/cta:translate-x-1.5 transition-transform duration-300" 
                strokeWidth={3.2} 
              />
            </div>

            {/* Special decorations */}
            {msg.isSpecial && (
              <>
                <Heart 
                  size={13} 
                  className="absolute -top-1.5 -right-1.5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" 
                  fill="currentColor" 
                  style={{ animation: 'sb-glow-pulse 2s ease-in-out infinite' }}
                />
                <Sparkles 
                  size={11} 
                  className="absolute -bottom-1 -left-1 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                  style={{ animation: 'sb-badge 2.5s ease-in-out infinite' }}
                />
              </>
            )}
          </button>

          <div className="flex flex-col items-end gap-2.5">
            {/* Live indicator */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-black/25 border border-white/20 backdrop-blur-xl shadow-lg">
              <Activity size={13} className="text-emerald-300" strokeWidth={3.2} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.12em]">
                {isLoadingAI ? 'Loading' : 'Live'}
              </span>
              <span 
                className="relative w-2 h-2 rounded-full bg-emerald-400"
                style={{
                  boxShadow: '0 0 12px rgba(52,211,153,0.9), 0 0 24px rgba(52,211,153,0.5)',
                  animation: 'sb-glow-pulse 1.5s ease-in-out infinite'
                }}
              />
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2">
              {messages.map((m, idx) => (
                <span
                  key={m.id}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-500",
                    idx === safeIndex ? "w-10" : "w-1.5 bg-white/30"
                  )}
                  style={idx === safeIndex ? {
                    background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
                    boxShadow: `0 0 16px ${msg.accentGlow}, 0 0 8px ${msg.secondaryGlow}`
                  } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corner dots */}
      <div className="absolute top-5 left-7 flex gap-2 opacity-60 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/35 shadow-[0_0_4px_rgba(255,255,255,0.3)]" />
      </div>

      {/* Special decorations */}
      {msg.isSpecial && (
        <>
          <Sparkles 
            size={20} 
            className="absolute top-5 right-7 text-yellow-300 pointer-events-none drop-shadow-[0_0_18px_rgba(253,224,71,0.7)]" 
            strokeWidth={3}
            style={{ animation: 'sb-glow-pulse 2s ease-in-out infinite' }}
          />
          <Zap 
            size={16} 
            className="absolute bottom-5 right-7 text-green-300 pointer-events-none drop-shadow-[0_0_18px_rgba(134,239,172,0.7)]" 
            fill="currentColor"
            style={{ animation: 'sb-badge 2s ease-in-out infinite' }}
          />
        </>
      )}
    </div>
  );
};
