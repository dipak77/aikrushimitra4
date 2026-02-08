import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const txt = DASH_TEXT[lang];

  // Real-time clock update
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // prefers-reduced-motion (also used to disable JS-driven rotation/parallax)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => setReduceMotion(!!mq.matches);
    apply();

    // Safari fallback: addListener/removeListener
    if (mq.addEventListener) {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }

    // @ts-ignore
    mq.addListener?.(apply);
    // @ts-ignore
    return () => mq.removeListener?.(apply);
  }, []);

  // Pause when tab is hidden (saves GPU/CPU)
  useEffect(() => {
    const onVis = () => setIsPaused(document.visibilityState === 'hidden');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Pointer parallax via CSS variables (no React state updates)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (reduceMotion) return;

    const finePointer = window.matchMedia?.('(pointer:fine)').matches;
    if (!finePointer) return;

    const onMove = (e: PointerEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;   // 0..1
        const y = (e.clientY - r.top) / r.height;  // 0..1
        const mx = (x - 0.5) * 2;                  // -1..1
        const my = (y - 0.5) * 2;                  // -1..1
        el.style.setProperty('--mx', mx.toFixed(4));
        el.style.setProperty('--my', my.toFixed(4));
      });
    };

    const onLeave = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };

    // passive listeners help scroll/perf where applicable
    el.addEventListener('pointermove', onMove, { passive: true } as AddEventListenerOptions);
    el.addEventListener('pointerleave', onLeave, { passive: true } as AddEventListenerOptions);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener('pointermove', onMove as any);
      el.removeEventListener('pointerleave', onLeave as any);
    };
  }, [reduceMotion]);

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

  // --- Stable particle seeds ---
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
      alpha: 0.22 + Math.random() * 0.28,
    }));
  }, []);

  // --- Message Queue (unchanged content, cinematic backgrounds) ---
  const messages: Msg[] = useMemo(() => {
    const list: Msg[] = [];

    // 1) Republic Day - CINEMATIC TRICOLOR
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

        bgBase: `
          radial-gradient(ellipse 140% 110% at 25% 35%, rgba(255,153,51,1) 0%, rgba(255,120,20,0.85) 18%, rgba(0,0,0,1) 42%),
          radial-gradient(ellipse 130% 100% at 75% 65%, rgba(19,136,8,0.95) 0%, rgba(15,100,6,0.75) 20%, rgba(0,0,0,1) 45%),
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(5,8,15,1) 100%)
        `,
        bgOverlay: `
          linear-gradient(135deg, rgba(255,153,51,0.15) 0%, rgba(0,0,0,0.85) 40%, rgba(19,136,8,0.15) 100%),
          linear-gradient(45deg, rgba(255,255,255,0.08) 0%, transparent 50%)
        `,
        accentGlow: 'rgba(255, 153, 51, 0.95)',
        secondaryGlow: 'rgba(19, 136, 8, 0.90)',
        particleColors: ['#FF9933', '#FFFFFF', '#138808', '#FFD700', '#FF6B00'],
        icon: Flag,
        badges: [
          { text: { mr: '77वा', hi: '77वां', en: '77th' }, color: 'bg-gradient-to-r from-orange-600 to-orange-500', glow: 'shadow-[0_0_30px_rgba(255,153,51,0.8)]' },
          { text: { mr: '26 जानेवारी', hi: '26 जनवरी', en: 'Jan 26' }, color: 'bg-gradient-to-r from-green-700 to-green-600', glow: 'shadow-[0_0_30px_rgba(19,136,8,0.75)]' }
        ],
        isSpecial: true
      });
    }

    // 2) Severe Weather Alert - ELECTRIC STORM
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

        bgBase: `
          radial-gradient(ellipse 130% 100% at 20% 20%, rgba(59,130,246,1) 0%, rgba(37,99,235,0.9) 15%, rgba(0,0,0,1) 40%),
          radial-gradient(ellipse 120% 110% at 80% 75%, rgba(109,40,217,0.85) 0%, rgba(79,70,229,0.7) 18%, rgba(0,0,0,1) 42%),
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(3,7,18,1) 100%)
        `,
        bgOverlay: `
          linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0.9) 45%, rgba(109,40,217,0.15) 100%),
          radial-gradient(circle at 30% 30%, rgba(139,92,246,0.25) 0%, transparent 50%)
        `,
        accentGlow: 'rgba(59, 130, 246, 0.95)',
        secondaryGlow: 'rgba(139, 92, 246, 0.85)',
        particleColors: ['#3b82f6', '#8b5cf6', '#6366f1', '#a78bfa', '#60a5fa'],
        icon: AlertTriangle,
        badges: [
          { text: { mr: 'तातडीचे', hi: 'अत्यावश्यक', en: 'Urgent' }, color: 'bg-gradient-to-r from-red-600 to-red-500', glow: 'shadow-[0_0_35px_rgba(239,68,68,0.75)]' },
          { text: { mr: `${windSpeed} किमी`, hi: `${windSpeed} किमी`, en: `${windSpeed} km/h` }, color: 'bg-white/15 border border-white/30', glow: 'shadow-[0_0_25px_rgba(255,255,255,0.4)]' }
        ],
      });
    }

    // 3) AI Updates - SCHEME (Emerald) / MARKET (Purple-Pink)
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
            ? `
              radial-gradient(ellipse 135% 105% at 25% 30%, rgba(16,185,129,1) 0%, rgba(5,150,105,0.9) 16%, rgba(0,0,0,1) 40%),
              radial-gradient(ellipse 125% 100% at 75% 70%, rgba(20,184,166,0.85) 0%, rgba(13,148,136,0.7) 18%, rgba(0,0,0,1) 42%),
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
            `
            : `
              radial-gradient(ellipse 130% 100% at 70% 25%, rgba(168,85,247,1) 0%, rgba(147,51,234,0.9) 15%, rgba(0,0,0,1) 38%),
              radial-gradient(ellipse 125% 110% at 30% 75%, rgba(236,72,153,0.9) 0%, rgba(219,39,119,0.75) 18%, rgba(0,0,0,1) 42%),
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
            `,
          bgOverlay: isScheme
            ? `
              linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(0,0,0,0.88) 45%, rgba(20,184,166,0.12) 100%),
              radial-gradient(circle at 25% 25%, rgba(52,211,153,0.2) 0%, transparent 50%)
            `
            : `
              linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(0,0,0,0.88) 45%, rgba(236,72,153,0.15) 100%),
              radial-gradient(circle at 70% 30%, rgba(192,132,252,0.2) 0%, transparent 50%)
            `,
          accentGlow: isScheme ? 'rgba(16, 185, 129, 0.95)' : 'rgba(168, 85, 247, 0.95)',
          secondaryGlow: isScheme ? 'rgba(20, 184, 166, 0.85)' : 'rgba(236, 72, 153, 0.85)',
          particleColors: isScheme
            ? ['#10b981', '#14b8a6', '#34d399', '#2dd4bf', '#5eead4']
            : ['#a855f7', '#ec4899', '#c084fc', '#f472b6', '#d946ef'],
          icon: isScheme ? Crown : TrendingUp,
          badges: [
            {
              text: { mr: update.badge || 'नवीन', hi: update.badge || 'नया', en: update.badge || 'New' },
              color: 'bg-white/15 border border-white/30',
              glow: 'shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            },
            {
              text: { mr: 'AI', hi: 'AI', en: 'AI' },
              color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
              glow: 'shadow-[0_0_28px_rgba(6,182,212,0.7)]'
            }
          ]
        });
      });
    }

    // 4) Calendar - ROYAL PURPLE-PINK
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

        bgBase: `
          radial-gradient(ellipse 130% 105% at 30% 25%, rgba(147,51,234,1) 0%, rgba(126,34,206,0.9) 15%, rgba(0,0,0,1) 38%),
          radial-gradient(ellipse 125% 100% at 70% 70%, rgba(236,72,153,0.9) 0%, rgba(219,39,119,0.75) 18%, rgba(0,0,0,1) 42%),
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
        `,
        bgOverlay: `
          linear-gradient(135deg, rgba(147,51,234,0.2) 0%, rgba(0,0,0,0.88) 45%, rgba(236,72,153,0.18) 100%),
          radial-gradient(circle at 35% 30%, rgba(168,85,247,0.25) 0%, transparent 50%)
        `,
        accentGlow: 'rgba(168, 85, 247, 0.95)',
        secondaryGlow: 'rgba(236, 72, 153, 0.90)',
        particleColors: ['#a855f7', '#ec4899', '#d946ef', '#f472b6', '#c084fc'],
        icon: CalendarIcon,
        badges: [
          { text: { mr: currentDay, hi: currentDay, en: currentDay }, color: 'bg-white/15 border border-white/30' },
          { text: { mr: `${currentDate}`, hi: `${currentDate}`, en: `${currentDate}` }, color: 'bg-white/15 border border-white/30' }
        ]
      });
    }

    // 5) Weather DAY - GOLDEN SUNRISE / NIGHT - DEEP INDIGO
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
          ? `
            radial-gradient(ellipse 135% 105% at 25% 20%, rgba(251,191,36,1) 0%, rgba(245,158,11,0.95) 15%, rgba(0,0,0,1) 38%),
            radial-gradient(ellipse 125% 100% at 75% 70%, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.7) 18%, rgba(0,0,0,1) 42%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(3,7,18,1) 100%)
          `
          : `
            radial-gradient(ellipse 130% 100% at 70% 25%, rgba(99,102,241,1) 0%, rgba(79,70,229,0.9) 15%, rgba(0,0,0,1) 38%),
            radial-gradient(ellipse 125% 110% at 30% 75%, rgba(139,92,246,0.85) 0%, rgba(124,58,237,0.7) 18%, rgba(0,0,0,1) 42%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(3,7,18,1) 100%)
          `,
        bgOverlay: isDay
          ? `
            linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(0,0,0,0.88) 45%, rgba(59,130,246,0.15) 100%),
            radial-gradient(circle at 25% 25%, rgba(250,204,21,0.25) 0%, transparent 50%)
          `
          : `
            linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0.88) 45%, rgba(139,92,246,0.15) 100%),
            radial-gradient(circle at 70% 30%, rgba(167,139,250,0.2) 0%, transparent 50%)
          `,
        accentGlow: isDay ? 'rgba(251, 191, 36, 0.95)' : 'rgba(99, 102, 241, 0.95)',
        secondaryGlow: isDay ? 'rgba(59, 130, 246, 0.85)' : 'rgba(139, 92, 246, 0.85)',
        particleColors: isDay
          ? ['#fbbf24', '#f59e0b', '#3b82f6', '#60a5fa', '#fcd34d']
          : ['#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed', '#c4b5fd'],
        icon: isRainy ? CloudRain : isDay ? Sun : Moon,
        badges: [
          { text: { mr: isDay ? 'Day' : 'Night', hi: isDay ? 'Day' : 'Night', en: isDay ? 'Day' : 'Night' }, color: 'bg-white/15 border border-white/30' },
          { text: { mr: `${temp}°C`, hi: `${temp}°C`, en: `${temp}°C` }, color: 'bg-white/15 border border-white/30' }
        ],
      });
    }

    // 6) Market - VIBRANT GREEN (Bullish) / INTENSE RED (Bearish)
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
          ? `
            radial-gradient(ellipse 135% 105% at 30% 28%, rgba(16,185,129,1) 0%, rgba(5,150,105,0.95) 15%, rgba(0,0,0,1) 38%),
            radial-gradient(ellipse 125% 100% at 70% 70%, rgba(6,182,212,0.9) 0%, rgba(8,145,178,0.75) 18%, rgba(0,0,0,1) 42%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
          `
          : `
            radial-gradient(ellipse 135% 105% at 30% 28%, rgba(239,68,68,1) 0%, rgba(220,38,38,0.95) 15%, rgba(0,0,0,1) 38%),
            radial-gradient(ellipse 125% 100% at 70% 70%, rgba(249,115,22,0.9) 0%, rgba(234,88,12,0.75) 18%, rgba(0,0,0,1) 42%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
          `,
        bgOverlay: isPositiveTrend
          ? `
            linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0.88) 45%, rgba(6,182,212,0.18) 100%),
            radial-gradient(circle at 30% 30%, rgba(52,211,153,0.25) 0%, transparent 50%)
          `
          : `
            linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0.88) 45%, rgba(249,115,22,0.18) 100%),
            radial-gradient(circle at 30% 30%, rgba(248,113,113,0.25) 0%, transparent 50%)
          `,
        accentGlow: isPositiveTrend ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        secondaryGlow: isPositiveTrend ? 'rgba(6, 182, 212, 0.90)' : 'rgba(249, 115, 22, 0.90)',
        particleColors: isPositiveTrend
          ? ['#10b981', '#06b6d4', '#34d399', '#22d3ee', '#14b8a6']
          : ['#ef4444', '#f97316', '#fb7185', '#f87171', '#ff6b35'],
        icon: TrendingUp,
        badges: [
          { text: { mr: isPositiveTrend ? 'Bullish' : 'Bearish', hi: isPositiveTrend ? 'Bullish' : 'Bearish', en: isPositiveTrend ? 'Bullish' : 'Bearish' }, color: 'bg-white/15 border border-white/30' },
          { text: { mr: marketData.trend, hi: marketData.trend, en: marketData.trend }, color: 'bg-white/15 border border-white/30' }
        ],
      });
    }

    // 7) Smart Tip - AMBER GOLD
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

        bgBase: `
          radial-gradient(ellipse 135% 105% at 32% 28%, rgba(251,191,36,1) 0%, rgba(245,158,11,0.95) 15%, rgba(0,0,0,1) 38%),
          radial-gradient(ellipse 125% 100% at 68% 70%, rgba(251,146,60,0.9) 0%, rgba(249,115,22,0.75) 18%, rgba(0,0,0,1) 42%),
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,1) 0%, rgba(2,6,23,1) 100%)
        `,
        bgOverlay: `
          linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(0,0,0,0.88) 45%, rgba(251,146,60,0.18) 100%),
          radial-gradient(circle at 35% 30%, rgba(250,204,21,0.25) 0%, transparent 50%)
        `,
        accentGlow: 'rgba(251, 191, 36, 0.95)',
        secondaryGlow: 'rgba(251, 146, 60, 0.90)',
        particleColors: ['#fbbf24', '#f59e0b', '#fb923c', '#fcd34d', '#fde047'],
        icon: Lightbulb,
        badges: [
          { text: { mr: 'AI', hi: 'AI', en: 'AI' }, color: 'bg-white/15 border border-white/30' },
          { text: { mr: 'Tip', hi: 'Tip', en: 'Tip' }, color: 'bg-white/15 border border-white/30' }
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

  // --- Rotation animation (paused + reduced motion aware) ---
  useEffect(() => {
    if (messages.length <= 1) return;
    if (reduceMotion || isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      const t = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 520);

      return () => clearTimeout(t);
    }, 8200);

    return () => clearInterval(interval);
  }, [messages.length, reduceMotion, isPaused]);

  const safeIndex = currentIndex >= messages.length ? 0 : currentIndex;
  const msg = messages[safeIndex];
  const Icon = msg?.icon || Lightbulb;

  if (!msg) return null;

  const particleCount = msg.isSpecial ? 14 : 10;

  return (
    <div
      ref={rootRef}
      className={clsx(
        "sb-root relative flex flex-1 lg:max-w-5xl lg:mx-auto min-h-[88px] lg:h-32 rounded-[28px] overflow-hidden",
        "shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
        isPaused && "sb-paused",
        className
      )}
    >
      <style>{`
        .sb-root{
          --mx: 0;
          --my: 0;
          isolation: isolate;
          contain: layout paint;
        }

        .sb-paused, .sb-paused * { animation-play-state: paused !important; }

        /* Use will-change only for big moving layers */
        .sb-will { will-change: transform, opacity; }

        @keyframes sb-slide-in {
          0%   { transform: translate3d(-12px, 8px, 0) scale(0.985); opacity: 0; filter: blur(5px); }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes sb-slide-out {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 1; filter: blur(0); }
          100% { transform: translate3d(12px, -8px, 0) scale(0.985); opacity: 0; filter: blur(5px); }
        }
        @keyframes sb-bg-flow {
          0%,100% { background-position: 0% 45%; }
          50% { background-position: 100% 55%; }
        }
        @keyframes sb-shine {
          0% { transform: translate3d(-140%,0,0) skewX(-16deg); opacity: 0; }
          40% { opacity: 0.7; }
          100% { transform: translate3d(240%,0,0) skewX(-16deg); opacity: 0; }
        }
        @keyframes sb-float {
          0%,100% { transform: translate3d(0,0,0) scale(1); opacity: var(--a); }
          50% { transform: translate3d(var(--dx), var(--dy), 0) scale(0.86); opacity: calc(var(--a) * 0.6); }
        }
        @keyframes sb-badge {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-1px,0) scale(1.05); }
        }
        @keyframes sb-orb {
          0%,100% { transform: translate3d(calc(var(--mx) * 10px), calc(var(--my) * 10px), 0); opacity: .55; }
          50% { transform: translate3d(calc(var(--mx) * -12px), calc(var(--my) * -12px), 0); opacity: .75; }
        }

        .sb-grain{
          background-image:
            radial-gradient(circle at 20% 15%, rgba(255,255,255,.05) 0 1px, transparent 2px),
            radial-gradient(circle at 65% 35%, rgba(255,255,255,.04) 0 1px, transparent 2px),
            radial-gradient(circle at 35% 70%, rgba(255,255,255,.03) 0 1px, transparent 2px),
            radial-gradient(circle at 85% 80%, rgba(255,255,255,.035) 0 1px, transparent 2px);
          background-size: 120px 120px, 140px 140px, 160px 160px, 180px 180px;
          mix-blend-mode: overlay;
          opacity: .28;
        }

        .sb-vignette{
          background:
            radial-gradient(120% 100% at 50% 10%, rgba(255,255,255,.08) 0%, transparent 55%),
            radial-gradient(120% 120% at 50% 90%, rgba(0,0,0,.55) 0%, transparent 55%),
            linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.25) 100%);
          opacity: .95;
        }

        .sb-borderGlow{
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.18),
            inset 0 -1px 0 rgba(0,0,0,.35),
            0 30px 90px rgba(0,0,0,.55);
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-anim, .sb-anim * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Base background */}
      <div
        className="absolute inset-0 sb-anim sb-will"
        style={{
          background: msg.bgBase,
          backgroundSize: '220% 220%',
          animation: 'sb-bg-flow 18s ease-in-out infinite',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Ambient orb light (cinematic depth) */}
      <div
        className="absolute inset-0 pointer-events-none sb-will"
        style={{
          animation: 'sb-orb 7.5s ease-in-out infinite',
          background: `
            radial-gradient(520px 420px at 18% 28%,
              ${msg.accentGlow} 0%,
              rgba(255,255,255,0.08) 25%,
              transparent 62%),
            radial-gradient(520px 420px at 82% 72%,
              ${msg.secondaryGlow} 0%,
              rgba(255,255,255,0.06) 25%,
              transparent 62%)
          `,
          opacity: 0.72,
          mixBlendMode: 'screen',
          transform: 'translate3d(calc(var(--mx) * 6px), calc(var(--my) * 6px), 0)',
        }}
      />

      {/* Overlay tone + border depth */}
      <div
        className="absolute inset-0 pointer-events-none sb-borderGlow"
        style={{ background: msg.bgOverlay }}
      />

      {/* Vignette + grain */}
      <div className="absolute inset-0 pointer-events-none sb-vignette" />
      <div className="absolute inset-0 pointer-events-none sb-grain" />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particleSeeds.slice(0, particleCount).map((p) => {
          const color = msg.particleColors[p.id % msg.particleColors.length];
          return (
            <span
              key={p.id}
              className="absolute rounded-full sb-anim"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: color,
                opacity: p.alpha,
                boxShadow: `0 0 18px ${color}70, 0 0 42px ${color}20`,
                '--dx': `${p.driftX}px`,
                '--dy': `${p.driftY}px`,
                '--a': `${p.alpha}`,
                animation: `sb-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
                transform: 'translate3d(calc(var(--mx) * 2px), calc(var(--my) * 2px), 0)',
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Shine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
        <div
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent sb-will"
          style={{
            animation: 'sb-shine 9s ease-in-out infinite',
            transform: 'translate3d(calc(var(--mx) * 10px), calc(var(--my) * 6px), 0)',
          }}
        />
      </div>

      {/* Accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2.5px]"
        style={{
          background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
          boxShadow: `0 0 28px ${msg.accentGlow}, 0 0 42px ${msg.secondaryGlow}`,
        }}
      />

      {/* Content */}
      <div
        className={clsx(
          "relative z-10 w-full h-full flex flex-col lg:flex-row items-start lg:items-center justify-between",
          "p-6 lg:px-8 gap-4 lg:gap-6",
          isAnimating
            ? "sb-will sb-anim animate-[sb-slide-out_0.52s_ease-out_forwards]"
            : "sb-will sb-anim animate-[sb-slide-in_0.55s_ease-out_forwards]"
        )}
        style={{
          transform: 'translate3d(calc(var(--mx) * 2px), calc(var(--my) * 2px), 0)',
        }}
      >
        {/* Left */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-6 flex-1 min-w-0 w-full">
          {/* Icon */}
          <div className="relative shrink-0">
            <div
              className="absolute -inset-4 rounded-2xl opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${msg.accentGlow} 0%, transparent 65%),
                             radial-gradient(circle at 70% 70%, ${msg.secondaryGlow} 0%, transparent 65%)`
              }}
            />
            <div
              className="relative w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-[18px] overflow-hidden border border-white/30 bg-white/15 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
              style={{
                transform: 'translate3d(calc(var(--mx) * 5px), calc(var(--my) * 5px), 0)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
              <div className="absolute top-0.5 inset-x-4 h-[2.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon size={32} className="text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]" strokeWidth={2.8} />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] lg:text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/90 bg-black/35 border border-white/20 backdrop-blur-lg px-3.5 py-1.5 rounded-[10px] shadow-lg">
                {msg.category[lang] || msg.category.en}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {msg.badges?.slice(0, 2).map((b, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wide text-white border border-white/25 backdrop-blur-xl",
                      b.color,
                      b.glow
                    )}
                    style={{ animation: reduceMotion ? undefined : 'sb-badge 3.2s ease-in-out infinite' }}
                  >
                    {b.text[lang] || b.text.en}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-[22px] lg:text-[28px] font-black leading-[1.15] tracking-[-0.02em] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.8)] line-clamp-1">
              {msg.title[lang] || msg.title.en}
            </h2>

            <p className="text-[13px] lg:text-[15px] font-semibold leading-snug text-white/94 drop-shadow-[0_10px_24px_rgba(0,0,0,0.7)] line-clamp-1">
              {msg.subtitle[lang] || msg.subtitle.en}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-6 shrink-0">
          <div className="hidden lg:block h-20 w-px bg-white/25 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

          <button
            className="group/cta relative px-7 py-3.5 rounded-[18px] bg-white/15 hover:bg-white/22 border border-white/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_70px_rgba(255,255,255,0.2)] active:scale-100"
            aria-label={`${msg.cta[lang] || msg.cta.en} - ${msg.title[lang] || msg.title.en}`}
            role="button"
            tabIndex={0}
            style={{
              transform: 'translate3d(calc(var(--mx) * -3px), calc(var(--my) * -3px), 0)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/8 to-black/25 rounded-[18px]" />
            <div className="absolute top-0 inset-x-6 h-[2.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-sm" />

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

            {msg.isSpecial && (
              <>
                <Heart
                  size={13}
                  className="absolute -top-1.5 -right-1.5 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.9)]"
                  fill="currentColor"
                  style={{ animation: reduceMotion ? undefined : 'sb-badge 2.2s ease-in-out infinite' }}
                />
                <Sparkles
                  size={11}
                  className="absolute -bottom-1 -left-1 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]"
                  style={{ animation: reduceMotion ? undefined : 'sb-badge 2.6s ease-in-out infinite' }}
                />
              </>
            )}
          </button>

          <div className="flex flex-col items-end gap-2.5">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-black/30 border border-white/25 backdrop-blur-xl shadow-lg">
              <Activity size={13} className="text-emerald-300" strokeWidth={3.2} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.12em]">
                {isLoadingAI ? 'Loading' : 'Live'}
              </span>
              <span
                className="relative w-2 h-2 rounded-full bg-emerald-400"
                style={{
                  boxShadow: '0 0 14px rgba(52,211,153,1), 0 0 28px rgba(52,211,153,0.6)',
                }}
              />
            </div>

            <div className="flex gap-2">
              {messages.map((m, idx) => (
                <span
                  key={m.id}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-500",
                    idx === safeIndex ? "w-10" : "w-1.5 bg-white/35"
                  )}
                  style={idx === safeIndex ? {
                    background: `linear-gradient(90deg, ${msg.accentGlow}, ${msg.secondaryGlow})`,
                    boxShadow: `0 0 18px ${msg.accentGlow}, 0 0 10px ${msg.secondaryGlow}`
                  } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corner dots */}
      <div className="absolute top-5 left-7 flex gap-2 opacity-65 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
      </div>

      {/* Special decorations */}
      {msg.isSpecial && (
        <>
          <Sparkles
            size={20}
            className="absolute top-5 right-7 text-yellow-300 pointer-events-none drop-shadow-[0_0_20px_rgba(253,224,71,0.85)]"
            strokeWidth={3}
          />
          <Zap
            size={16}
            className="absolute bottom-5 right-7 text-green-300 pointer-events-none drop-shadow-[0_0_20px_rgba(134,239,172,0.85)]"
            fill="currentColor"
          />
        </>
      )}
    </div>
  );
};
