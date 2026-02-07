
import React, { useEffect, useMemo, useState } from 'react';
import {
  CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, Flag, Heart, Sparkles,
  Sun, Moon, Zap, Crown, Calendar as CalendarIcon, AlertTriangle
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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const temp = weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--';
  const wCode = weather?.current?.weather_code || 0;
  const isDay = weather?.current?.is_day !== 0;
  const windSpeed = weather?.current?.wind_speed_10m || 0;
  const wDesc = txt.weather_desc[wCode] || txt.weather_desc[0];
  const isRainy = wCode >= 51;
  const isStormy = wCode >= 95;
  const isHighWind = windSpeed > 20;

  const userCropName = user?.crop || 'Soyabean';
  const marketData =
    MOCK_MARKET.find(m => m.name.toLowerCase().includes(userCropName.toLowerCase())) || MOCK_MARKET[0];
  const displayCropName = txt.crops[marketData.name] || marketData.name;
  const isPositiveTrend = marketData.trend.includes('+');

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

  useEffect(() => {
    let mounted = true;
    const fetchAIUpdates = async () => {
      try {
        setIsLoadingAI(true);
        await new Promise(resolve => setTimeout(resolve, 900));
        const updates = await getLiveAgriUpdates(lang);
        if (mounted && updates && updates.length > 0) setLiveUpdates(updates);
      } catch {
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

  const messages: Msg[] = useMemo(() => {
    const list: Msg[] = [];

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
          { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-gradient-to-r from-orange-600/90 to-orange-500/90' },
          { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-gradient-to-r from-green-700/90 to-green-600/90' }
        ],
        isSpecial: true
      });
    }

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
          { text: { mr: 'तातडीचे', hi: 'अत्यावश्यक', en: 'Urgent' }, color: 'bg-gradient-to-r from-red-700/90 to-red-600/90' },
          { text: { mr: `${windSpeed} किमी`, hi: `${windSpeed} किमी`, en: `${windSpeed} km/h` }, color: 'bg-white/12 border border-white/25' }
        ],
      });
    }

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
            { text: { mr: update.badge || 'नवीन', hi: update.badge || 'नया', en: update.badge || 'New' }, color: 'bg-white/12 border border-white/25' },
            { text: { mr: 'AI', hi: 'AI', en: 'AI' }, color: 'bg-gradient-to-r from-cyan-600/90 to-blue-500/90' }
          ]
        });
      });
    }

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

    if (!isStormy && !isHighWind && list.length < 3 && temp !== '--') {
      list.push({
        id: 'weather',
        category: { mr: '🌤️ हवामान', hi: '🌤️ मौसम', en: '🌤️ Weather' },
        title: isRainy
          ? { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना', en: 'Rain Expected' }
          : { mr: `${wDesc} • ${temp}°C`, hi: `${wDesc} • ${temp}°C`, en: `${wDesc} • ${temp}°C` },
        subtitle: isRainy
          ? { mr: 'पुढील काही तासात पाऊस. पिकांची काळजी घ्या.', hi: 'अगले कुछ घंटों में बारिश। फसल सुरक्षा करें।', en: 'Rain in a few hours. Protect crops.' }
          : { mr: `तापमान ${temp}°C • शेतीसाठी ${isDay ? 'चांगले' : 'शांत'} हवामान`, hi: `तापमान ${temp}°C • खेती के लिए ${isDay ? 'अच्छा' : 'शांत'} मौसम`, en: `Temp ${temp}°C • Weather is ${isDay ? 'good' : 'calm'} for farming` },
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
    isRepublicDay, isStormy, isRainy, isHighWind, windSpeed, temp, wDesc, isDay,
    currentDay, currentDate, currentMonth, currentYear, currentTime, liveUpdates,
    lang, displayCropName, marketData.price, marketData.arrival, marketData.trend, isPositiveTrend
  ]);

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
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out" style={{ background: msg.bgBase, backgroundSize: '200% 200%' }} />
      <div className="absolute inset-0" style={{ background: msg.bgOverlay }} />
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60 bg-[radial-gradient(circle_400px_at_20%_25%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />

      {/* Content */}
      <div className={clsx("relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 lg:px-8 gap-4 lg:gap-6 transition-all duration-500", isAnimating ? "opacity-0 translate-y-2 blur-sm" : "opacity-100 translate-y-0 blur-0")}>
        
        {/* Left */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-6 flex-1 min-w-0 w-full">
          <div className="relative shrink-0">
            <div className="w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-[18px] overflow-hidden border border-white/25 bg-white/12 backdrop-blur-xl shadow-2xl flex items-center justify-center">
              <Icon size={32} className="text-white drop-shadow-md" strokeWidth={2.8} />
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-white/85 bg-black/30 border border-white/15 px-3 py-1 rounded-lg">
                {msg.category[lang] || msg.category.en}
              </span>
              {msg.badges?.map((b, idx) => (
                <span key={idx} className={clsx("px-2 py-1 rounded-md text-[9px] font-black uppercase text-white border", b.color)}>
                  {b.text[lang] || b.text.en}
                </span>
              ))}
            </div>
            <h2 className="text-[22px] lg:text-[28px] font-black leading-none text-white drop-shadow-lg line-clamp-1">
              {msg.title[lang] || msg.title.en}
            </h2>
            <p className="text-xs lg:text-sm font-semibold text-white/90 drop-shadow-md line-clamp-1">
              {msg.subtitle[lang] || msg.subtitle.en}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-6 shrink-0">
          <button className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all active:scale-95">
            {msg.cta[lang] || msg.cta.en} <ArrowRight size={16} />
          </button>
          
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 backdrop-blur-md">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-[9px] font-bold text-white uppercase">{isLoadingAI ? '...' : 'Live'}</span>
             </div>
             <div className="flex gap-1.5">
               {messages.map((m, idx) => (
                 <div key={m.id} className={clsx("h-1 rounded-full transition-all duration-300", idx === safeIndex ? "w-6 bg-white" : "w-1.5 bg-white/30")} />
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
