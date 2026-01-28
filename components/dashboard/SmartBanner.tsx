
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

  // Tick for real-time clock (keeps calendar card “live”)
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
        await new Promise(resolve => setTimeout(resolve, 900)); // quicker + less “feels stuck”
        const updates = await getLiveAgriUpdates(lang);
        if (mounted && updates && updates.length > 0) setLiveUpdates(updates);
      } catch {
        // silent fail; UI will fallback
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

  // --- Stable particle seeds (NO Math.random inside render loop) ---
  const particleSeeds = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 4 + Math.random() * 6,
      driftX: -18 + Math.random() * 36,
      driftY: -28 - Math.random() * 26,
      dur: 4.8 + Math.random() * 3.2,
      delay: Math.random() * 2.5,
      alpha: 0.35 + Math.random() * 0.45,
    }));
  }, []);

  // --- Message Queue (memoized so effects don’t thrash) ---
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

        // Premium: tricolor on deep midnight (looks less “flat”)
        bgBase: 'radial-gradient(circle at 20% 30%, rgba(255,153,51,0.95) 0%, rgba(15,23,42,1) 55%, rgba(19,136,8,0.95) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.58) 55%, rgba(255,255,255,0.10) 100%)',
        accentGlow: 'rgba(255, 153, 51, 0.75)',
        secondaryGlow: 'rgba(19, 136, 8, 0.70)',
        particleColors: ['#FF9933', '#FFFFFF', '#138808', '#0ea5e9'],
        icon: Flag,
        badges: [
          { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-gradient-to-r from-orange-600/90 to-orange-500/90', glow: 'shadow-[0_0_25px_rgba(255,153,51,0.65)]' },
          { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-gradient-to-r from-green-700/90 to-green-600/90', glow: 'shadow-[0_0_25px_rgba(19,136,8,0.6)]' }
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

        bgBase: 'radial-gradient(circle at 30% 20%, rgba(59,130,246,0.85) 0%, rgba(15,23,42,1) 55%, rgba(79,70,229,0.85) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.70) 60%, rgba(255,255,255,0.06) 100%)',
        accentGlow: 'rgba(59, 130, 246, 0.75)',
        secondaryGlow: 'rgba(99, 102, 241, 0.65)',
        particleColors: ['#60a5fa', '#3b82f6', '#818cf8', '#38bdf8'],
        icon: AlertTriangle,
        badges: [
          { text: { mr: 'तातडीचे', hi: 'अत्यावश्यक', en: 'Urgent' }, color: 'bg-gradient-to-r from-red-700/90 to-red-600/90', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]' },
          { text: { mr: `${windSpeed} किमी`, hi: `${windSpeed} किमी`, en: `${windSpeed} km/h` }, color: 'bg-white/10 border border-white/20', glow: 'shadow-[0_0_18px_rgba(255,255,255,0.25)]' }
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
            ? 'radial-gradient(circle at 25% 30%, rgba(16,185,129,0.85) 0%, rgba(2,6,23,1) 60%, rgba(20,184,166,0.8) 100%)'
            : 'radial-gradient(circle at 70% 25%, rgba(168,85,247,0.85) 0%, rgba(2,6,23,1) 60%, rgba(236,72,153,0.75) 100%)',
          bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.72) 60%, rgba(255,255,255,0.06) 100%)',
          accentGlow: isScheme ? 'rgba(16, 185, 129, 0.75)' : 'rgba(168, 85, 247, 0.75)',
          secondaryGlow: isScheme ? 'rgba(20, 184, 166, 0.65)' : 'rgba(236, 72, 153, 0.65)',
          particleColors: isScheme ? ['#10b981', '#34d399', '#2dd4bf'] : ['#a855f7', '#c084fc', '#ec4899'],
          icon: isScheme ? Crown : TrendingUp,
          badges: [
            {
              text: { mr: update.badge || 'नवीन', hi: update.badge || 'नया', en: update.badge || 'New' },
              color: 'bg-white/10 border border-white/20',
              glow: 'shadow-[0_0_18px_rgba(255,255,255,0.25)]'
            },
            {
              text: { mr: 'AI', hi: 'AI', en: 'AI' },
              color: 'bg-gradient-to-r from-cyan-600/90 to-blue-500/90',
              glow: 'shadow-[0_0_22px_rgba(6,182,212,0.55)]'
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

        bgBase: 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.9) 0%, rgba(2,6,23,1) 60%, rgba(236,72,153,0.8) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.72) 60%, rgba(255,255,255,0.06) 100%)',
        accentGlow: 'rgba(168, 85, 247, 0.75)',
        secondaryGlow: 'rgba(236, 72, 153, 0.65)',
        particleColors: ['#a855f7', '#ec4899', '#d946ef'],
        icon: CalendarIcon,
        badges: [
          { text: { mr: currentDay, hi: currentDay, en: currentDay }, color: 'bg-white/10 border border-white/20' },
          { text: { mr: `${currentDate}`, hi: `${currentDate}`, en: `${currentDate}` }, color: 'bg-white/10 border border-white/20' }
        ]
      });
    }

    // 5) Standard weather (only if no alert already)
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
          ? 'radial-gradient(circle at 25% 20%, rgba(245,158,11,0.85) 0%, rgba(2,6,23,1) 62%, rgba(59,130,246,0.8) 100%)'
          : 'radial-gradient(circle at 75% 20%, rgba(99,102,241,0.85) 0%, rgba(2,6,23,1) 62%, rgba(168,85,247,0.75) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.72) 60%, rgba(255,255,255,0.06) 100%)',
        accentGlow: isDay ? 'rgba(245, 158, 11, 0.75)' : 'rgba(99, 102, 241, 0.75)',
        secondaryGlow: isDay ? 'rgba(59, 130, 246, 0.65)' : 'rgba(168, 85, 247, 0.65)',
        particleColors: isDay ? ['#f59e0b', '#3b82f6', '#60a5fa'] : ['#6366f1', '#a855f7', '#818cf8'],
        icon: isRainy ? CloudRain : isDay ? Sun : Moon,
        badges: [
          { text: { mr: isDay ? 'Day' : 'Night', hi: isDay ? 'Day' : 'Night', en: isDay ? 'Day' : 'Night' }, color: 'bg-white/10 border border-white/20' },
          { text: { mr: `${temp}°C`, hi: `${temp}°C`, en: `${temp}°C` }, color: 'bg-white/10 border border-white/20' }
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
          ? 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.88) 0%, rgba(2,6,23,1) 62%, rgba(6,182,212,0.75) 100%)'
          : 'radial-gradient(circle at 30% 20%, rgba(239,68,68,0.88) 0%, rgba(2,6,23,1) 62%, rgba(249,115,22,0.75) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.72) 60%, rgba(255,255,255,0.06) 100%)',
        accentGlow: isPositiveTrend ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)',
        secondaryGlow: isPositiveTrend ? 'rgba(6, 182, 212, 0.65)' : 'rgba(249, 115, 22, 0.65)',
        particleColors: isPositiveTrend ? ['#10b981', '#06b6d4', '#34d399'] : ['#ef4444', '#f97316', '#fb7185'],
        icon: TrendingUp,
        badges: [
          { text: { mr: isPositiveTrend ? 'Bullish' : 'Bearish', hi: isPositiveTrend ? 'Bullish' : 'Bearish', en: isPositiveTrend ? 'Bullish' : 'Bearish' }, color: 'bg-white/10 border border-white/20' },
          { text: { mr: marketData.trend, hi: marketData.trend, en: marketData.trend }, color: 'bg-white/10 border border-white/20' }
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

        bgBase: 'radial-gradient(circle at 35% 20%, rgba(251,191,36,0.85) 0%, rgba(2,6,23,1) 62%, rgba(251,146,60,0.75) 100%)',
        bgOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.72) 60%, rgba(255,255,255,0.06) 100%)',
        accentGlow: 'rgba(251, 191, 36, 0.75)',
        secondaryGlow: 'rgba(251, 146, 60, 0.65)',
        particleColors: ['#fbbf24', '#fb923c', '#f59e0b'],
        icon: Lightbulb,
        badges: [
          { text: { mr: 'AI', hi: 'AI', en: 'AI' }, color: 'bg-white/10 border border-white/20' },
          { text: { mr: 'Tip', hi: 'Tip', en: 'Tip' }, color: 'bg-white/10 border border-white/20' }
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
      }, 520);
    }, 7600);

    return () => clearInterval(interval);
  }, [messages.length]);

  const safeIndex = currentIndex >= messages.length ? 0 : currentIndex;
  const msg = messages[safeIndex];
  const Icon = msg?.icon || Lightbulb;

  if (!msg) return null;

  const particleCount = msg.isSpecial ? 16 : 12;

  return (
    <div className={clsx("relative flex flex-1 lg:max-w-5xl lg:mx-6 min-h-[5.25rem] lg:h-28 rounded-3xl overflow-hidden", className)}>
      <style>{`
        .sb-gpu { transform: translate3d(0,0,0); backface-visibility: hidden; }
        .sb-will { will-change: transform, opacity; }

        @keyframes sb-slide-in {
          0%   { transform: translate3d(-18px, 10px, 0) scale(0.985); opacity: 0; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }

        @keyframes sb-slide-out {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
          100% { transform: translate3d(18px, -10px, 0) scale(0.985); opacity: 0; }
        }

        @keyframes sb-bg-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes sb-shine {
          0% { transform: translate3d(-140%,0,0) skewX(-18deg); opacity: 0; }
          45% { opacity: 0.55; }
          100% { transform: translate3d(240%,0,0) skewX(-18deg); opacity: 0; }
        }

        @keyframes sb-float {
          0%,100% { transform: translate3d(0,0,0); opacity: var(--a); }
          50% { transform: translate3d(var(--dx), var(--dy), 0); opacity: calc(var(--a) * 0.7); }
        }

        @keyframes sb-badge {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,0,0) scale(1.04); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-anim, .sb-anim * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 sb-gpu sb-anim"
        style={{
          background: msg.bgBase,
          backgroundSize: '220% 220%',
          animation: 'sb-bg-flow 14s ease-in-out infinite',
        }}
      />

      {/* Overlay + vignette */}
      <div
        className="absolute inset-0 sb-gpu pointer-events-none"
        style={{
          background: msg.bgOverlay,
          boxShadow: 'inset 0 -60px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      />

      {/* Soft highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.10) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.35) 0%, transparent 55%)'
        }}
      />

      {/* Particles (stable seeds, transform-only animation) */}
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

      {/* Shine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent sb-gpu"
          style={{ animation: 'sb-shine 6.5s ease-in-out infinite' }}
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
          "relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 lg:px-7 gap-3 lg:gap-0 sb-anim",
          isAnimating ? "sb-will sb-gpu animate-[sb-slide-out_0.52s_ease-out_forwards]" : "sb-will sb-gpu animate-[sb-slide-in_0.55s_ease-out_forwards]"
        )}
      >
        {/* Left */}
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
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
              <div className="absolute top-1 inset-x-5 h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon size={34} className="text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]" strokeWidth={2.6} />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] lg:text-xs font-black uppercase tracking-[0.18em] text-white/80 bg-black/25 border border-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                {msg.category[lang] || msg.category.en}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {msg.badges?.slice(0, 2).map((b, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide text-white border border-white/15 backdrop-blur-xl sb-gpu sb-will",
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

            <h2 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight truncate text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
              {msg.title[lang] || msg.title.en}
            </h2>

            <p className="text-sm lg:text-base font-semibold truncate text-white/90 drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]">
              {msg.subtitle[lang] || msg.subtitle.en}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-6 shrink-0">
          <div className="hidden lg:block h-20 w-px bg-white/20" />

          <button className="group/cta relative px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03] sb-gpu sb-will">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            <div className="relative flex items-center gap-2.5">
              <span className="text-sm lg:text-base font-black text-white">
                {msg.cta[lang] || msg.cta.en}
              </span>
              <ArrowRight size={18} className="text-white group-hover/cta:translate-x-1 transition-transform" strokeWidth={3} />
            </div>

            {msg.isSpecial && (
              <>
                <Heart size={14} className="absolute -top-2 -right-2 text-red-400 animate-pulse" fill="currentColor" />
                <Sparkles size={12} className="absolute -bottom-1 -left-1 text-yellow-300 animate-bounce" />
              </>
            )}
          </button>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xl">
              <Activity size={14} className="text-white" strokeWidth={3} />
              <span className="text-[11px] font-black text-white uppercase tracking-wide">
                {isLoadingAI ? 'Loading' : 'Live'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            </div>

            <div className="flex gap-2">
              {messages.map((m, idx) => (
                <span
                  key={m.id}
                  className={clsx(
                    "h-2 rounded-full transition-all duration-500",
                    idx === safeIndex ? "w-8" : "w-2 bg-white/35"
                  )}
                  style={idx === safeIndex ? {
                    background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
                    boxShadow: `0 0 18px ${msg.accentGlow}`
                  } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle corner dots */}
      <div className="absolute top-4 left-6 flex gap-2 opacity-60 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/55" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/35" />
      </div>

      {/* Special sparkles */}
      {msg.isSpecial && (
        <>
          <Sparkles size={20} className="absolute top-4 right-6 text-yellow-300 pointer-events-none drop-shadow-[0_0_18px_rgba(253,224,71,0.7)]" strokeWidth={3} />
          <Zap size={16} className="absolute bottom-4 right-6 text-green-300 pointer-events-none drop-shadow-[0_0_18px_rgba(134,239,172,0.7)]" fill="currentColor" />
        </>
      )}
    </div>
  );
};
    