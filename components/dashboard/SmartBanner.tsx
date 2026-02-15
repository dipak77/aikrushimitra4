import React, { useEffect, useMemo, useState } from 'react';
import {
  CloudRain, TrendingUp, Activity, AlertTriangle, ShieldCheck,
  Cpu, Globe, Timer, Leaf, ChevronRight, Clock, Sprout, Landmark, Sun, Crown, Sparkles, Calendar
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import clsx from 'clsx';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';
import { getLiveAgriUpdates } from '../../services/geminiService';

type Theme = {
  primaryGlow: string;
  gradient: string;
  bgStyle: React.CSSProperties;
  tag: {
    bg: string;
    border: string;
    text: string;
  };
};

type Slide = {
  id: string;
  theme: Theme;
  icon: React.ComponentType<any>;
  tag: { text: string; icon?: React.ComponentType<any> };
  title: string;
  description: string;
  badges: Array<{ icon?: React.ComponentType<any>; text: string; highlight?: boolean }>;
  action: string;
  timestamp?: string;
};

const THEMES: Record<string, Theme> = {
  purple: {
    primaryGlow: 'rgba(139, 92, 246, 0.3)',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
    bgStyle: { background: 'radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(at 0% 0%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)' },
    tag: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' }
  },
  green: {
    primaryGlow: 'rgba(16, 185, 129, 0.3)',
    gradient: 'from-emerald-600 via-green-500 to-teal-400',
    bgStyle: { background: 'radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(at 0% 0%, rgba(52, 211, 153, 0.1) 0%, transparent 50%)' },
    tag: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' }
  },
  blue: {
    primaryGlow: 'rgba(59, 130, 246, 0.3)',
    gradient: 'from-blue-600 via-cyan-500 to-sky-400',
    bgStyle: { background: 'radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)' },
    tag: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' }
  },
  orange: {
    primaryGlow: 'rgba(245, 158, 11, 0.3)',
    gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    bgStyle: { background: 'radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)' },
    tag: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' }
  },
  red: {
    primaryGlow: 'rgba(239, 68, 68, 0.3)',
    gradient: 'from-red-600 via-rose-500 to-pink-400',
    bgStyle: { background: 'radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.15) 0%, transparent 50%), radial-gradient(at 0% 0%, rgba(244, 63, 94, 0.1) 0%, transparent 50%)' },
    tag: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400' }
  }
};

const SLIDE_DURATION = 6000;

export const SmartBanner = ({
  lang, className, weather, user,
}: {
  lang: Language;
  className?: string;
  weather?: any;
  user?: UserProfile;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);
  const [, setAiSync] = useState(true);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const txt = DASH_TEXT[lang];
  const loc = (mr: string, hi: string, en: string) => lang === 'mr' ? mr : lang === 'hi' ? hi : en;

  useEffect(() => {
    let mounted = true;
    const fetchUpdates = async () => {
      try {
        setAiSync(true);
        await new Promise<void>(r => setTimeout(() => r(undefined), 1200)); 
        const updates = await getLiveAgriUpdates(lang);
        if (mounted && updates?.length) setLiveUpdates(updates);
      } catch (e) { console.error(e); } 
      finally { if (mounted) setAiSync(false); }
    };
    fetchUpdates();
    const t = setInterval(fetchUpdates, 15 * 60000);
    return () => { mounted = false; clearInterval(t); };
  }, [lang]);

  const wCode = weather?.current?.weather_code || 0;
  const temp = Math.round(weather?.current?.temperature_2m || 0);
  const wind = weather?.current?.wind_speed_10m || 0;
  const humidity = weather?.current?.relative_humidity_2m || 0;
  const isStormy = wCode >= 95;
  const isRainy = wCode >= 51;
  const isHighWind = wind > 20;
  
  const crop = user?.crop || 'Soyabean';
  const mkt = MOCK_MARKET.find(m => m.name.toLowerCase().includes(crop.toLowerCase())) || MOCK_MARKET[0];
  const isBullish = mkt.trend.includes('+');

  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];

    if (isStormy || (isRainy && isHighWind)) {
      s.push({
        id: 'alert',
        theme: THEMES.red,
        icon: AlertTriangle,
        tag: { text: loc('हवामान इशारा', 'मौसम चेतावनी', 'Weather Alert'), icon: ShieldCheck },
        title: loc(isStormy ? 'वादळी पाऊस' : 'जोराचा वारा', isStormy ? 'तूफानी बारिश' : 'तेज हवा', isStormy ? 'Heavy Storm' : 'High Winds'),
        description: loc(`वेग: ${wind} किमी/तास. पिकांची काळजी घ्या.`, `गति: ${wind} किमी/घंटा. फसल बचाएं.`, `Speed: ${wind} km/h. Secure crops.`),
        badges: [{ text: `${wind} km/h`, highlight: true }, { text: loc('तातडीचे', 'अत्यावश्यक', 'Urgent') }],
        action: 'View Tips',
        timestamp: loc('आत्ताच', 'अभी', 'Just now')
      });
    }

    s.push({
      id: 'crop_action',
      theme: THEMES.orange,
      icon: Sprout,
      tag: { text: loc(`${crop} नियोजन`, `${crop} नियोजन`, `${crop} Plan`), icon: Calendar },
      title: loc('पिक फुलोरा अवस्थेत', 'फसल फूलने की अवस्था', 'Flowering Stage Active'),
      description: loc(
        'सध्या १२:६१:०० विद्राव्य खताची फवारणी करणे फायदेशीर ठरेल.',
        'अभी 12:61:00 घुलनशील उर्वरक का छिड़काव करना फायदेमंद होगा।',
        'Applying 12:61:00 soluble fertilizer now will boost flowering.'
      ),
      badges: [{ text: 'Day 48', highlight: true }, { icon: Leaf, text: '+15% Yield' }],
      action: 'View Schedule',
      timestamp: loc('आज', 'आज', 'Today')
    });

    liveUpdates.slice(0, 1).forEach((u, i) => {
      const isScheme = u.type === 'scheme';
      s.push({
        id: `ai-${i}`,
        theme: isScheme ? THEMES.blue : THEMES.purple,
        icon: isScheme ? Globe : Cpu,
        tag: { text: isScheme ? 'Scheme v2.0' : 'AI Engine v3', icon: isScheme ? Crown : Sparkles },
        title: u.title,
        description: u.subtitle,
        badges: [{ text: u.badge || (isScheme ? 'Govt' : 'Trend'), highlight: true }, { icon: Timer, text: 'AI-Powered' }],
        action: 'Details',
        timestamp: loc('१ मि.', '1 मि.', '1m ago')
      });
    });

    if (humidity > 70) {
      s.push({
        id: 'disease_risk',
        theme: THEMES.purple,
        icon: Activity,
        tag: { text: loc('रोग अंदाज', 'रोग पूर्वानुमान', 'Disease Risk'), icon: ShieldCheck },
        title: loc('बुरशीजन्य रोगाचा धोका', 'फंगल रोग का खतरा', 'Fungal Blight Risk'),
        description: loc(
          `आद्रता ${humidity}% आहे. पिकावर बुरशीनाशकाची फवारणी करा.`,
          `नमी ${humidity}% है। फसल पर फफूंदनाशक का छिड़काव करें।`,
          `Humidity is ${humidity}%. Recommended preventive fungicide spray.`
        ),
        badges: [{ text: `${humidity}% Humidity`, highlight: true }, { text: 'High Risk' }],
        action: 'Crop Doctor',
        timestamp: 'AI Analysis'
      });
    }

    s.push({
      id: 'scheme_reminder',
      theme: THEMES.green,
      icon: Landmark,
      tag: { text: 'Govt. Scheme', icon: Crown },
      title: loc('पीएम किसान e-KYC', 'पीएम किसान e-KYC', 'PM Kisan e-KYC'),
      description: loc(
        'पुढील हप्ता मिळवण्यासाठी ३१ तारखेपूर्वी e-KYC पूर्ण करा.',
        'अगली किस्त पाने के लिए 31 तारीख से पहले e-KYC पूरा करें।',
        'Complete e-KYC before 31st to receive next installment.'
      ),
      badges: [{ text: '₹2000 Credit', highlight: true }, { text: 'Deadline Soon' }],
      action: 'Check Status',
      timestamp: 'Reminder'
    });

    s.push({
      id: 'market',
      theme: isBullish ? THEMES.green : THEMES.red,
      icon: TrendingUp,
      tag: { text: 'Market Pulse', icon: Leaf },
      title: loc(`${mkt.name}: ₹${mkt.price}`, `${mkt.name}: ₹${mkt.price}`, `${mkt.name}: ₹${mkt.price}`),
      description: loc(`आवक: ${mkt.arrival}. भाव ${isBullish ? 'वाधरले' : 'कमी झाले'}.`, `आवक: ${mkt.arrival}. भाव ${isBullish ? 'बढ़े' : 'घटे'}.`, `Arrival: ${mkt.arrival}. Prices ${isBullish ? 'up' : 'down'}.`),
      badges: [{ text: mkt.trend, highlight: true }, { text: 'Live APMC' }],
      action: 'Check Rates',
      timestamp: 'Live'
    });

    return s;
  }, [wCode, temp, wind, humidity, isStormy, isRainy, isHighWind, crop, mkt, isBullish, liveUpdates, lang, txt]);

  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [slides.length, isHovered]);

  const S = slides[currentIndex];
  const T = S.theme;
  const Icon = S.icon;

  return (
    <div 
      className={clsx("group relative overflow-hidden rounded-2xl cursor-pointer w-full lg:max-w-5xl lg:mx-auto select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="absolute inset-0 bg-[#0d0a1a]"></div>
      <div className="absolute inset-0" style={T.bgStyle}></div>
      <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-500"></div>
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        style={{ 
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${T.primaryGlow}, transparent 40%)` 
        }}
      ></div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 animate-[wave_2s_linear_infinite]">
           <div className="absolute inset-0 w-[200%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)' }}></div>
        </div>
      </div>
      <style>{`@keyframes wave { 0% { transform: translateX(-100%); } 100% { transform: translateX(50%); } }`}</style>

      <div className="relative z-10 p-5 md:p-6 flex items-start gap-5">
        <div className="flex-shrink-0">
          <div 
            className={clsx("w-14 h-14 rounded-2xl p-[1px] shadow-lg bg-gradient-to-br", T.gradient)}
            style={{ 
              boxShadow: `${T.primaryGlow} 0px 8px 32px`, 
              transform: 'rotate(3.95deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <div className="w-full h-full rounded-2xl bg-[#0d0a1a]/80 flex items-center justify-center backdrop-blur-sm">
              <Icon size={24} className="text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 animate-[fadeIn_0.4s_ease-out]" key={S.id}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          
          <div className="flex items-center gap-3 mb-2">
            <span 
              className={clsx("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border", T.tag.bg, T.tag.border, T.tag.text)}
            >
              {S.tag.text}
            </span>
            {S.timestamp && (
              <span className="text-[10px] text-white/30 flex items-center gap-1 font-medium">
                <Clock size={12} /> {S.timestamp}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/90 transition-colors leading-tight">
            {S.title}
          </h3>
          
          <p className="text-sm text-white/40 leading-relaxed line-clamp-2 max-w-xl">
            {S.description}
          </p>

          <div className="flex items-center gap-4 mt-4">
            {S.badges.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {b.highlight ? (
                  <div className="flex items-center gap-1.5">
                    {b.icon ? <b.icon size={14} className={clsx(T.tag.text)} /> : <TrendingUp size={14} className={clsx(T.tag.text)} />}
                    <span className="text-xs font-semibold text-white/60">{b.text}</span>
                  </div>
                ) : (
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r text-white/90", T.gradient)}>
                    {b.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-shrink-0 self-center">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300 backdrop-blur-md">
            <ChevronRight 
              size={20} 
              className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" 
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0d0a1a]">
        <div 
          key={currentIndex}
          className={clsx("h-full bg-gradient-to-r", T.gradient)}
          style={{ 
            width: '100%',
            animation: `progress ${SLIDE_DURATION}ms linear forwards`,
            opacity: 0.8
          }}
        ></div>
      </div>
      <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
};