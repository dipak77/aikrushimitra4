
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { MapPin, Wind, Droplets, Mic, ArrowUpRight, ScanLine, FlaskConical, Map as MapIcon, Landmark, Store, Sun, Moon, CloudSun, CloudMoon, CloudRain, CloudLightning, TrendingUp, TrendingDown, Calendar, AlertTriangle, ChevronRight, BellRing, Sprout, Languages, Leaf, Wheat, ThermometerSun, Clock } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { MOCK_MARKET } from '../../data/mock';
import { clsx } from 'clsx';

// --- 1. LOCALIZATION DATA ---
const DASH_TEXT: Record<Language, any> = {
  mr: {
    news: "📢 ताजी बातमी: पीएम किसान योजनेचा १८वा हप्ता जमा झाला आहे. • कापूस भावात ₹२०० ने वाढ. • साताऱ्यात पुढील २ दिवस पावसाचा इशारा.",
    welcome_back: "परत स्वागत आहे",
    current_weather: "सध्याचे हवामान",
    wind: "वारा",
    humidity: "आद्रता",
    fetching: "माहिती घेत आहे...",
    market_rates: "बाजार भाव",
    live: "लाईव्ह",
    this_week: "या आठवड्यात",
    quintal: "/ क्विंटल",
    crop_schedule: "पीक वेळापत्रक",
    today_urgent: "आज • तातडीचे",
    irrigation: "पाणी देणे (सिंचन)",
    cotton_field: "कापूस क्षेत्र • २ तास",
    fertilizer: "खत (NPK)",
    fertilizer_sub: "उद्या • १२ ऑक्टो",
    tomorrow: "उद्या",
    ai_assistant: "AI कृषी मित्र",
    tap_to_ask: "विचारण्यासाठी टॅप करा",
    crop_doctor_title: "पीक डॉक्टर",
    crop_doctor_sub: "झटपट रोग निदान",
    subsidies: "सबसिडी आणि अर्थसहाय्य",
    weather_desc: {
      0: "निरभ्र आकाश",
      1: "अंशतः ढगाळ",
      2: "अंशतः ढगाळ",
      3: "अंशतः ढगाळ",
      45: "धुके",
      48: "धुके",
      51: "हलका पाऊस",
      53: "हलका पाऊस",
      55: "हलका पाऊस",
      61: "मध्यम पाऊस",
      63: "मध्यम पाऊस",
      65: "जोराचा पाऊस",
      80: "पावसाच्या सरी",
      81: "पावसाच्या सरी",
      82: "पावसाच्या सरी",
      95: "मेघगर्जना"
    },
    crops: {
      'Soyabean': 'सोयाबीन', 'Cotton': 'कापूस', 'Onion': 'कांदा', 'Tur': 'तूर', 'Wheat': 'गहू', 'Maize': 'मका', 'Gram': 'हरभरा', 'Tomato': 'टोमॅटो', 'Potato': 'बटाटा', 'Rice': 'तांदूळ'
    }
  },
  hi: {
    news: "📢 ताज़ा खबर: पीएम किसान की 18वीं किस्त जमा हो गई है। • कपास के भाव में ₹200 की बढ़ोतरी। • अगले 2 दिनों तक भारी बारिश का अलर्ट।",
    welcome_back: "वापसी पर स्वागत है",
    current_weather: "वर्तमान मौसम",
    wind: "हवा",
    humidity: "नमी",
    fetching: "जानकारी ले रहा है...",
    market_rates: "मंडी भाव",
    live: "लाइव",
    this_week: "इस सप्ताह",
    quintal: "/ क्विंटल",
    crop_schedule: "फसल अनुसूची",
    today_urgent: "आज • ज़रूरी",
    irrigation: "सिंचाई (पानी देना)",
    cotton_field: "कपास खेत • 2 घंटे",
    fertilizer: "खाद (NPK)",
    fertilizer_sub: "कल • 12 अक्टूबर",
    tomorrow: "कल",
    ai_assistant: "AI कृषि मित्र",
    tap_to_ask: "पूछने के लिए टैप करें",
    crop_doctor_title: "फसल डॉक्टर",
    crop_doctor_sub: "त्वरित रोग निदान",
    subsidies: "सब्सिडी और वित्तीय सहायता",
    weather_desc: {
      0: "साफ आसमान",
      1: "आंशिक बादल",
      2: "आंशिक बादल",
      3: "आंशिक बादल",
      45: "कोहरा",
      48: "कोहरा",
      51: "हल्की बूंदाबांदी",
      53: "हल्की बूंदाबांदी",
      55: "हल्की बूंदाबांदी",
      61: "मध्यम बारिश",
      63: "मध्यम बारिश",
      65: "भारी बारिश",
      80: "बारिश की बौछारें",
      81: "बारिश की बौछारें",
      82: "बारिश की बौछारें",
      95: "गरज के साथ बारिश"
    },
    crops: {
      'Soyabean': 'सोयाबीन', 'Cotton': 'कपास', 'Onion': 'प्याज', 'Tur': 'तूर', 'Wheat': 'गेहूं', 'Maize': 'मक्का', 'Gram': 'चना', 'Tomato': 'टमाटर', 'Potato': 'आलू', 'Rice': 'चावल'
    }
  },
  en: {
    news: "📢 Flash News: PM Kisan 18th Installment credited. • Cotton prices up by ₹200. • Heavy rain alert for Satara next 2 days.",
    welcome_back: "Welcome Back",
    current_weather: "Current Weather",
    wind: "Wind",
    humidity: "Humidity",
    fetching: "Fetching forecast...",
    market_rates: "Market Rates",
    live: "LIVE",
    this_week: "this week",
    quintal: "/ Quintal",
    crop_schedule: "Crop Schedule",
    today_urgent: "Today • Urgent",
    irrigation: "Irrigation (Watering)",
    cotton_field: "Cotton Field • 2 Hours",
    fertilizer: "Fertilizer (NPK)",
    fertilizer_sub: "Tomorrow • 12 Oct",
    tomorrow: "Tomorrow",
    ai_assistant: "AI Assistant",
    tap_to_ask: "Tap to Ask",
    crop_doctor_title: "Crop Doctor AI",
    crop_doctor_sub: "Instant Disease Detection",
    subsidies: "Subsidies & Financial Support",
    weather_desc: {
      0: "Clear Sky",
      1: "Partly Cloudy",
      2: "Partly Cloudy",
      3: "Partly Cloudy",
      45: "Foggy",
      48: "Foggy",
      51: "Light Drizzle",
      53: "Light Drizzle",
      55: "Light Drizzle",
      61: "Moderate Rain",
      63: "Moderate Rain",
      65: "Heavy Rain",
      80: "Rain Showers",
      81: "Rain Showers",
      82: "Rain Showers",
      95: "Thunderstorm"
    },
    crops: {
      'Soyabean': 'Soyabean', 'Cotton': 'Cotton', 'Onion': 'Onion', 'Tur': 'Tur', 'Wheat': 'Wheat', 'Maize': 'Maize', 'Gram': 'Gram', 'Tomato': 'Tomato', 'Potato': 'Potato', 'Rice': 'Rice'
    }
  }
};

// --- 2. VISUAL HELPERS ---

const GlassTile = ({ children, className, onClick, delay = 0 }: any) => (
    <div 
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={clsx(
            "relative overflow-hidden rounded-[2.5rem] border border-white/5 shadow-xl transition-all duration-300 group cursor-pointer animate-enter",
            "bg-[#1e293b]/40 backdrop-blur-xl hover:bg-[#1e293b]/60 hover:border-white/10 hover:scale-[1.01]",
            className
        )}
    >
        {children}
    </div>
);

// --- 3. WIDGETS ---

const NewsTicker = ({ lang }: { lang: Language }) => {
    return (
        <div className="w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/5 h-9 flex items-center relative overflow-hidden z-40">
            <div className="absolute inset-y-0 left-0 bg-[#020617] z-10 px-4 flex items-center gap-2 border-r border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
            <div className="whitespace-nowrap animate-marquee pl-4">
                <span className="text-xs font-semibold text-slate-200 tracking-wide">{DASH_TEXT[lang].news}</span>
            </div>
        </div>
    );
};

const DynamicGreeting = ({ user, lang }: { user: UserProfile, lang: Language }) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    
    if (lang === 'mr') {
        if (hour < 12) timeGreeting = 'शुभ सकाळ';
        else if (hour < 17) timeGreeting = 'शुभ दुपार';
        else timeGreeting = 'शुभ संध्याकाळ';
    } else if (lang === 'hi') {
        if (hour < 12) timeGreeting = 'शुभ प्रभात';
        else if (hour < 17) timeGreeting = 'शुभ दोपहर';
        else timeGreeting = 'शुभ संध्या';
    } else {
        if (hour < 12) timeGreeting = 'Good Morning';
        else if (hour < 17) timeGreeting = 'Good Afternoon';
        else timeGreeting = 'Good Evening';
    }

    return (
        <div className="flex flex-col z-10">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">
                {timeGreeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">{user.name.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
                <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        {DASH_TEXT[lang].welcome_back}
                    </p>
                </div>
            </div>
        </div>
    );
};

const AppHeaderLogo = () => (
    <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full animate-pulse"></div>
            
            {/* Spinning Ring */}
            <div className="absolute inset-0 border border-emerald-500/30 border-t-emerald-400 rounded-full animate-[spin_3s_linear_infinite]"></div>
            
            {/* Inner Core */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center shadow-lg border border-white/10 z-10">
                <Sprout size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-black text-white leading-none tracking-tight drop-shadow-md">AI KRUSHI</span>
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.25em] ml-0.5">Mitra</span>
        </div>
    </div>
);

// --- PREMIUM 3D WEATHER ICONS ---
const WeatherIcon3D = ({ type, isDay }: { type: string, isDay: boolean }) => {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center filter drop-shadow-2xl">
         {/* Background Glow Orb */}
         <div className={clsx(
             "absolute w-28 h-28 rounded-full blur-[40px] opacity-60 animate-pulse",
             isDay ? "bg-amber-500" : "bg-blue-500"
         )}></div>

         {/* SUN/MOON Layer (Behind) */}
         {isDay && type !== 'rain' && type !== 'storm' && (
           <div className={clsx("absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-[0_0_60px_rgba(251,191,36,0.6)] animate-[float_4s_ease-in-out_infinite]", 
               type === 'clear' ? "scale-100" : "top-2 right-4 scale-75"
           )}>
               {/* Internal Glow */}
               <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-20 blur-md"></div>
           </div>
         )}
         {!isDay && type !== 'rain' && type !== 'storm' && (
            <div className={clsx("absolute w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-[float_5s_ease-in-out_infinite]",
                 type === 'clear' ? "scale-100" : "top-2 right-4 scale-75"
            )}>
               <div className="absolute top-4 left-3 w-4 h-4 bg-slate-400/20 rounded-full"></div>
               <div className="absolute bottom-4 right-5 w-2 h-2 bg-slate-400/20 rounded-full"></div>
            </div>
         )}
  
         {/* CLOUD Layer (Front) */}
         {(type !== 'clear') && (
           <div className="relative z-10 transform scale-105">
              {/* Main Cloud Shape */}
              <svg width="150" height="100" viewBox="0 0 150 100" className="drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
                 <defs>
                    <linearGradient id="cloudBody" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#ffffff" />
                       <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <filter id="gloss" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                 </defs>
                 
                 {/* Cloud Base */}
                 <path d="M50,85 Q25,85 25,60 Q25,30 55,30 Q65,10 95,10 Q120,10 130,40 Q150,40 150,65 Q150,85 130,85 Z" 
                       fill="url(#cloudBody)" />
                 
                 {/* Highlight/Gloss (Simulated 3D reflection) */}
                 <path d="M60,35 Q70,20 95,20 Q115,20 125,40" 
                       fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.5" strokeLinecap="round" filter="url(#gloss)" />
              </svg>
              
              {/* Rain / Storm Elements */}
              {(type === 'rain' || type === 'storm') && (
                 <div className="absolute -bottom-2 left-10 flex gap-4 z-0">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-3.5 h-6 bg-gradient-to-b from-cyan-300 to-blue-600 rounded-full shadow-lg animate-[rain_0.8s_ease-in_infinite]" 
                           style={{animationDelay: `${i * 0.25}s`, transform: 'rotate(15deg)'}}></div>
                    ))}
                 </div>
              )}
              
              {type === 'storm' && (
                  <svg className="absolute bottom-[-15px] right-12 w-10 h-14 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-[flash_2.5s_infinite]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
              )}
           </div>
         )}
      </div>
    )
};

// --- UPDATED WEATHER WIDGET ---
const WeatherWidget = ({ weather, loading, location, lang, onNavigate }: any) => {
    const isDay = weather?.current?.is_day !== 0;
    const code = weather?.current?.weather_code || 0;
    const txt = DASH_TEXT[lang];

    const getWeatherDescription = (c: number) => {
        return txt.weather_desc[c] || txt.weather_desc[0];
    };
    
    const getType = (c: number) => {
        if(c >= 95) return 'storm';
        if(c >= 51) return 'rain';
        if(c >= 1 && c <= 3) return 'cloudy';
        return 'clear';
    };
    const type = getType(code);

    return (
        <GlassTile onClick={() => onNavigate('WEATHER')} className="h-full p-6 relative overflow-hidden group bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-white/5 shadow-2xl">
             {/* Dynamic Background Orb */}
             <div className="absolute top-[-30%] right-[-30%] w-[120%] h-[120%] bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-[80px] rounded-full animate-[orb-float_10s_ease-in-out_infinite]"></div>
             
             {/* Background Mesh (Subtle) */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
             
             {/* Main Layout */}
             <div className="flex justify-between items-center h-full relative z-10 px-2">
                 
                 {/* Left: Info Block */}
                 <div className="flex flex-col justify-center h-full">
                     
                     {/* Location */}
                     <h2 className="text-lg font-medium text-slate-300 tracking-wide flex items-center gap-1.5 mb-1">
                         <MapPin size={14} className="text-slate-400"/>
                         {location}
                     </h2>

                     {/* Big Temp - Updated Typography with Yellow-Red Gradient */}
                     <div className="flex items-start -ml-1">
                         <span className="text-[5.5rem] leading-[0.8] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-500 drop-shadow-sm filter">
                             {loading ? "--" : Math.round(weather.current.temperature_2m)}°
                         </span>
                     </div>
                     
                     {/* Description & Wind */}
                     <div className="flex flex-col gap-1 mt-3">
                         <span className="text-base font-medium text-white capitalize">
                             {loading ? "..." : getWeatherDescription(code)}
                         </span>
                         <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                             <Wind size={12}/> {loading ? "-" : weather.current.wind_speed_10m} km/h
                         </span>
                     </div>
                 </div>

                 {/* Right: 3D Icon */}
                 <div className="flex items-center justify-center transform scale-110 -mr-4 -mt-4">
                     <WeatherIcon3D type={type} isDay={isDay} />
                 </div>
             </div>
        </GlassTile>
    );
};

// --- REFACTORED MARKET WIDGET ---
const MarketWidget = ({ onNavigate, lang }: any) => {
    const txt = DASH_TEXT[lang];
    
    return (
        <GlassTile onClick={() => onNavigate('MARKET')} className="h-full p-0 flex flex-col relative overflow-hidden bg-[#0f172a] group">
            {/* Header */}
            <div className="px-5 pt-5 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Store size={18} className="text-amber-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{txt.market_rates}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{txt.live}</span>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-5 flex flex-col gap-3 relative z-10 justify-center">
                 {MOCK_MARKET.slice(0, 2).map((m, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e293b] border border-white/5", m.color)}>
                                <m.icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">{txt.crops[m.name] || m.name}</p>
                                <p className="text-[10px] font-medium text-slate-500">{m.arrival} Vol</p>
                            </div>
                        </div>
                        <div className="text-right">
                             {/* Yellow Gradient Price */}
                             <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                                ₹{m.price}
                             </span>
                             <div className={clsx("text-[10px] font-bold flex items-center justify-end gap-0.5", m.trend.includes('+') ? "text-emerald-400" : "text-red-400")}>
                                 {m.trend.includes('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                 {m.trend}
                             </div>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Background Graph Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10 pointer-events-none">
                 <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-amber-500 fill-current">
                     <path d="M0 40 L0 20 Q 20 10 40 25 T 100 15 L 100 40 Z" />
                 </svg>
            </div>
        </GlassTile>
    );
};

// --- REFACTORED CALENDAR WIDGET ---
const CalendarWidget = ({ lang }: { lang: Language }) => {
    const txt = DASH_TEXT[lang];
    return (
        <GlassTile className="h-full p-5 bg-[#0f172a] relative overflow-hidden group">
            {/* Background Gradient Spot */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full animate-[orb-breathe_6s_infinite]"></div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Calendar size={18} className="text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-slate-200">{txt.crop_schedule}</span>
            </div>

            <div className="relative pl-3 space-y-4 z-10">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-white/5 rounded-full"></div>

                {/* Item 1 (Today - Highlighted) */}
                <div className="relative pl-8 group">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] border-[#0f172a] bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10 flex items-center justify-center animate-pulse">
                         <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-white/5 group-hover:border-yellow-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-0.5">
                            <p className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">{txt.today_urgent}</p>
                            <Clock size={10} className="text-slate-500"/>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{txt.irrigation}</h4>
                        <p className="text-xs text-slate-400">{txt.cotton_field}</p>
                    </div>
                </div>

                {/* Item 2 (Future) */}
                <div className="relative pl-8 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-slate-600 border-2 border-[#0f172a] z-10"></div>
                    <h4 className="text-sm font-bold text-slate-300">{txt.fertilizer}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{txt.fertilizer_sub}</p>
                </div>
            </div>
        </GlassTile>
    );
};

// Compact Voice Orb
const VoiceWidget = ({ onNavigate, lang }: any) => {
    const txt = DASH_TEXT[lang];
    return (
        <GlassTile onClick={() => onNavigate('VOICE_ASSISTANT')} className="h-full p-0 flex items-center justify-center relative overflow-hidden group bg-black/20">
             {/* Animated Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             
             <div className="text-center relative z-10">
                 {/* The Glowing Orb */}
                 <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/20">
                     <Mic size={28} className="text-white drop-shadow-md"/>
                 </div>
                 <h3 className="text-base font-black text-white">{txt.ai_assistant}</h3>
                 <p className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider mt-1 opacity-80">{txt.tap_to_ask}</p>
             </div>
        </GlassTile>
    );
};

// --- NEW FEATURE CARD (Replaces QuickActionTile) ---
const FeatureCard = ({ title, icon: Icon, onClick, delay, variant }: any) => {
    // Variants: 'soil', 'yield', 'area', 'disease'
    const colors = {
        soil: { bg: 'from-orange-500/10 to-amber-500/5', icon: 'text-orange-400', orb: 'bg-orange-500' },
        yield: { bg: 'from-purple-500/10 to-pink-500/5', icon: 'text-purple-400', orb: 'bg-purple-500' },
        area: { bg: 'from-cyan-500/10 to-blue-500/5', icon: 'text-cyan-400', orb: 'bg-cyan-500' },
        disease: { bg: 'from-emerald-500/10 to-green-500/5', icon: 'text-emerald-400', orb: 'bg-emerald-500' },
    };
    
    const c = colors[variant as keyof typeof colors] || colors.soil;

    return (
        <GlassTile onClick={() => { onClick(); triggerHaptic(); }} delay={delay} className="group relative p-5 h-36 flex flex-col justify-between border-white/5 bg-[#111827]/80 hover:bg-[#1e293b] transition-all duration-500 overflow-hidden">
             {/* Hover Gradient Overlay */}
             <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", c.bg)}></div>
             
             {/* Glowing Orb Background */}
             <div className={clsx("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500", c.orb)}></div>
             
             {/* Icon Box */}
             <div className={clsx("w-12 h-12 rounded-2xl bg-[#020617]/50 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 z-10", c.icon)}>
                 <Icon size={24} strokeWidth={1.5} className="drop-shadow-lg" />
             </div>

             {/* Text Content */}
             <div className="relative z-10">
                 <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors leading-tight mb-1">{title}</h3>
                 <div className="w-8 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-60 group-hover:w-16 group-hover:opacity-100 transition-all duration-500"></div>
             </div>
             
             {/* Subtle Arrow */}
             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                 <ArrowUpRight size={16} className="text-slate-400" />
             </div>
        </GlassTile>
    );
};

// Illustrative Banner
const IllustrativeBanner = ({ title, subtitle, icon: Icon, gradient, pattern, onClick }: any) => (
    <div onClick={onClick} className="relative h-40 rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-lg border border-white/10">
        {/* Background Gradient */}
        <div className={clsx("absolute inset-0 bg-gradient-to-r opacity-90 transition-opacity group-hover:opacity-100", gradient)}></div>
        
        {/* Abstract Pattern Overlay */}
        {pattern === 'scan' && (
             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:30px_30px]"></div>
        )}
        {pattern === 'coins' && (
             <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
                 <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                     <circle cx="80" cy="20" r="15" />
                     <circle cx="60" cy="50" r="20" />
                     <circle cx="90" cy="80" r="25" />
                 </svg>
             </div>
        )}

        <div className="absolute inset-0 p-6 flex flex-col justify-center z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/20">
                <Icon size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-white leading-none mb-1 shadow-sm">{title}</h3>
            <p className="text-xs font-bold text-white/80 uppercase tracking-wide">{subtitle}</p>
        </div>

        {/* Floating Action Icon */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowUpRight size={20} strokeWidth={3} />
        </div>
    </div>
);


// --- 4. MAIN DASHBOARD ---

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
    const t = TRANSLATIONS[lang];
    const txt = DASH_TEXT[lang];
    const [weather, setWeather] = useState<any>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [liveLocation, setLiveLocation] = useState<string>(user.village || "Locating...");

    useEffect(() => {
        // Function to fetch weather based on lat/lng
        const getWeatherData = async (lat: number, lng: number) => {
             try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day,wind_speed_10m`);
                const data = await res.json();
                setWeather(data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoadingWeather(false);
             }
        };

        // Function to get place name via Reverse Geocoding
        const getPlaceName = async (lat: number, lng: number) => {
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const data = await res.json();
                // Prioritize locality, then city, then village, then fallback to user profile
                const name = data.locality || data.city || data.town || data.village || user.village;
                setLiveLocation(name);
            } catch (e) {
                console.error("Geocoding error", e);
                setLiveLocation(user.village);
            }
        };

        // Get Live Position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    getWeatherData(latitude, longitude);
                    getPlaceName(latitude, longitude);
                },
                (err) => {
                    console.warn("Location access denied, using default");
                    // Default to Satara if denied
                    getWeatherData(19.75, 75.71); 
                    setLiveLocation(user.village); 
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            // Fallback for no geolocation support
            getWeatherData(19.75, 75.71);
            setLiveLocation(user.village);
        }
    }, [user.village]);

    const toggleLang = () => {
        const next = lang === 'mr' ? 'hi' : lang === 'hi' ? 'en' : 'mr';
        setLang(next);
        triggerHaptic();
    };

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-[#020617] text-slate-100 lg:pl-24 selection:bg-yellow-500/30 flex flex-col">
            
            {/* 1. NEWS TICKER (Top) */}
            <NewsTicker lang={lang} />
            
            {/* 2. HEADER */}
            <div className="pt-4 px-6 pb-2 flex items-center justify-between z-50">
                 {/* LEFT: ORB LOGO */}
                 <AppHeaderLogo />

                 {/* RIGHT: ACTIONS */}
                 <div className="flex items-center gap-3">
                     <button onClick={toggleLang} className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
                         <Languages size={14} className="text-slate-300"/>
                         <span className="text-[10px] font-bold uppercase text-white tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'ENG'}</span>
                     </button>
                     
                     {/* Profile Icon (Moved to Right) */}
                     <div onClick={() => onNavigate('PROFILE')} className="relative cursor-pointer group">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[1.5px] shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
                              <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                  {/* Initials or Avatar */}
                                  <span className="text-sm font-black text-white">{user.name.charAt(0)}</span>
                              </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* 2.1 GREETING SUB-HEADER (New Section) */}
            <div className="px-6 py-2 pb-4">
                <DynamicGreeting user={user} lang={lang} />
            </div>

            {/* 3. BENTO GRID */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 pb-32 max-w-7xl mx-auto w-full">
                
                {/* Weather (MD: Col 1-4) - Immersive Scene */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} onNavigate={onNavigate} />
                </div>

                {/* Market Trends (MD: Col 5-8) - Trading Cards */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <MarketWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Crop Calendar (MD: Col 9-12) - Timeline */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <CalendarWidget lang={lang} />
                </div>

                {/* --- Row 2 --- */}

                {/* Voice Widget (Desktop Only) - Glowing Orb */}
                <div className="hidden md:block col-span-1 md:col-span-3 h-44">
                    <VoiceWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Quick Actions Grid - Glass Tiles */}
                <div className="col-span-1 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FeatureCard 
                        icon={ScanLine} 
                        title={t.quick_action_doctor}
                        variant="disease"
                        onClick={() => onNavigate('DISEASE_DETECTOR')} 
                        delay={100}
                    />
                    <FeatureCard 
                        icon={FlaskConical} 
                        title={t.quick_action_soil}
                        variant="soil"
                        onClick={() => onNavigate('SOIL')} 
                        delay={150}
                    />
                    <FeatureCard 
                        icon={TrendingUp} 
                        title={t.menu_yield}
                        variant="yield"
                        onClick={() => onNavigate('YIELD')} 
                        delay={200}
                    />
                    <FeatureCard 
                        icon={MapIcon} 
                        title={t.menu_area} 
                        variant="area"
                        onClick={() => onNavigate('AREA_CALCULATOR')} 
                        delay={250}
                    />
                </div>
                
                {/* Government Schemes (Wide Banner) - Wealth Theme */}
                <div className="col-span-1 md:col-span-6 animate-enter" style={{animationDelay: '300ms'}}>
                     <IllustrativeBanner 
                        title={t.govt_schemes}
                        subtitle={txt.subsidies}
                        icon={Landmark}
                        gradient="from-emerald-800 to-teal-900"
                        pattern="coins"
                        onClick={() => onNavigate('SCHEMES')}
                     />
                </div>

                {/* Agri-Doctor Promo (Wide Banner) - Tech Theme */}
                <div className="col-span-1 md:col-span-6 animate-enter" style={{animationDelay: '350ms'}}>
                     <IllustrativeBanner 
                        title={txt.crop_doctor_title}
                        subtitle={txt.crop_doctor_sub}
                        icon={Leaf}
                        gradient="from-indigo-900 to-blue-900"
                        pattern="scan"
                        onClick={() => onNavigate('DISEASE_DETECTOR')}
                     />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
