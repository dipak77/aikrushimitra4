
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { MapPin, Wind, Droplets, Mic, ArrowUpRight, ScanLine, FlaskConical, Map as MapIcon, Landmark, Store, Sun, Moon, CloudSun, CloudMoon, CloudRain, CloudLightning, TrendingUp, Calendar, AlertTriangle, ChevronRight, BellRing, Sprout, Languages, Leaf, Wheat, ThermometerSun, Clock } from 'lucide-react';
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
      0: "निरभ्र आकाश आणि लख्ख ऊन.",
      1: "अंशतः ढगाळ आणि मंद वारा.",
      2: "अंशतः ढगाळ आणि मंद वारा.",
      3: "अंशतः ढगाळ आणि मंद वारा.",
      45: "धुके पडले आहे, दृश्यमानता कमी आहे.",
      48: "धुके पडले आहे, दृश्यमानता कमी आहे.",
      51: "आज हलक्या पावसाची शक्यता.",
      53: "आज हलक्या पावसाची शक्यता.",
      55: "आज हलक्या पावसाची शक्यता.",
      61: "मध्यम पाऊस, छत्री सोबत ठेवा.",
      63: "मध्यम पाऊस, छत्री सोबत ठेवा.",
      65: "जोराचा पाऊस पडू शकतो.",
      80: "दुपारी पावसाच्या सरी येतील.",
      81: "दुपारी पावसाच्या सरी येतील.",
      82: "दुपारी पावसाच्या सरी येतील.",
      95: "मेघगर्जनेसह पाऊस! सुरक्षित रहा."
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
      0: "साफ आसमान और तेज धूप।",
      1: "आंशिक रूप से बादल और हल्की हवा।",
      2: "आंशिक रूप से बादल और हल्की हवा।",
      3: "आंशिक रूप से बादल और हल्की हवा।",
      45: "कोहरा है, दृश्यता कम है।",
      48: "कोहरा है, दृश्यता कम है।",
      51: "आज हल्की बूंदाबांदी की उम्मीद है।",
      53: "आज हल्की बूंदाबांदी की उम्मीद है।",
      55: "आज हल्की बूंदाबांदी की उम्मीद है।",
      61: "मध्यम बारिश, छाता साथ रखें।",
      63: "मध्यम बारिश, छाता साथ रखें।",
      65: "भारी बारिश हो सकती है।",
      80: "दोपहर में बारिश की बौछारें।",
      81: "दोपहर में बारिश की बौछारें।",
      82: "दोपहर में बारिश की बौछारें।",
      95: "गरज के साथ बारिश! सुरक्षित रहें।"
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
      0: "Clear sky with bright sunshine.",
      1: "Partly cloudy with gentle breeze.",
      2: "Partly cloudy with gentle breeze.",
      3: "Partly cloudy with gentle breeze.",
      45: "Foggy conditions, visibility low.",
      48: "Foggy conditions, visibility low.",
      51: "Light drizzle expected today.",
      53: "Light drizzle expected today.",
      55: "Light drizzle expected today.",
      61: "Moderate rain, carry an umbrella.",
      63: "Moderate rain, carry an umbrella.",
      65: "Heavy rain expected.",
      80: "Rain showers likely in afternoon.",
      81: "Rain showers likely in afternoon.",
      82: "Rain showers likely in afternoon.",
      95: "Thunderstorm alert! Stay safe."
    },
    crops: {
      'Soyabean': 'Soyabean', 'Cotton': 'Cotton', 'Onion': 'Onion', 'Tur': 'Tur', 'Wheat': 'Wheat', 'Maize': 'Maize', 'Gram': 'Gram', 'Tomato': 'Tomato', 'Potato': 'Potato', 'Rice': 'Rice'
    }
  }
};

// --- 2. VISUAL HELPERS ---

const GoldText = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <span className={clsx("text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-sm", className)}>
        {children}
    </span>
);

const GlassTile = ({ children, className, onClick, delay = 0 }: any) => (
    <div 
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={clsx(
            "relative overflow-hidden rounded-[2rem] border border-white/10 shadow-xl transition-all duration-300 group cursor-pointer animate-enter",
            "bg-[#0f172a]/40 backdrop-blur-xl hover:bg-[#0f172a]/60 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]",
            className
        )}
    >
        {/* Inner Spotlight Effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-[50px] group-hover:bg-white/10 transition-colors pointer-events-none"></div>
        {children}
    </div>
);

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <span className="font-mono tabular-nums tracking-wide">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
    );
};

// --- 3. COMPONENT WIDGETS ---

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
                {timeGreeting}, <GoldText>{user.name.split(' ')[0]}</GoldText>
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

// Enhanced Weather Widget with Live Data and Sun Clock
const WeatherWidget = ({ weather, loading, location, lang }: any) => {
    const isDay = weather?.current?.is_day !== 0;
    const code = weather?.current?.weather_code || 0;
    const txt = DASH_TEXT[lang];

    const getWeatherDescription = (c: number) => {
        return txt.weather_desc[c] || txt.weather_desc[0];
    };

    return (
        <GlassTile className="h-full p-0 overflow-hidden group relative">
             {/* 1. Dynamic Atmosphere Background */}
             <div className={clsx("absolute inset-0 transition-all duration-1000", 
                 isDay ? "bg-gradient-to-br from-blue-500/30 via-sky-400/20 to-amber-400/10" : "bg-gradient-to-br from-indigo-950/80 via-purple-900/40 to-slate-900/60"
             )}></div>
             
             {/* 2. Particle Effects (Subtle) */}
             <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

             <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                 
                 {/* Top Section: Layout Split */}
                 <div className="flex justify-between items-start">
                     
                     {/* Left: Weather Info (Big Temp) */}
                     <div className="flex flex-col pt-1">
                         <div className="flex items-start">
                             <GoldText className="text-[3.5rem] leading-none font-black tracking-tighter drop-shadow-2xl">
                                 {loading ? "--" : Math.round(weather.current.temperature_2m)}°
                             </GoldText>
                         </div>
                         <p className="text-sm font-bold text-slate-200 mt-2 leading-tight opacity-90 line-clamp-3 max-w-[120px] shadow-black/50 drop-shadow-md">
                             {loading ? txt.fetching : getWeatherDescription(code)}
                         </p>
                     </div>

                     {/* Right: The Sun-Clock Orb & Location */}
                     <div className="flex flex-col items-center relative -mt-2 -mr-2">
                        
                        {/* THE ORB CONTAINER */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            
                            {/* Ambient Glow */}
                            <div className={clsx("absolute inset-0 rounded-full blur-[30px] opacity-50 animate-pulse transition-colors duration-1000", 
                                isDay ? "bg-amber-500" : "bg-blue-600"
                            )}></div>

                            {/* Rotating Rays / Rings */}
                            <div className={clsx("absolute inset-0 flex items-center justify-center transition-opacity duration-1000", 
                                isDay ? "opacity-100" : "opacity-0"
                            )}>
                                 {/* SVG Sun Rays animating */}
                                 <Sun size={110} strokeWidth={0.5} className="text-amber-300 animate-[spin_20s_linear_infinite]" />
                                 <Sun size={90} strokeWidth={1} className="absolute text-orange-400/50 animate-[spin_15s_linear_infinite_reverse]" />
                            </div>
                            
                            {/* Moon Elements */}
                            <div className={clsx("absolute inset-0 flex items-center justify-center transition-opacity duration-1000", 
                                !isDay ? "opacity-100" : "opacity-0"
                            )}>
                                 <div className="w-24 h-24 rounded-full border border-blue-300/20 bg-blue-900/20 backdrop-blur-sm"></div>
                                 <Moon size={90} strokeWidth={0.5} className="absolute text-blue-200/50" />
                            </div>

                            {/* CORE: The Glass Clock Orb */}
                            <div className={clsx("relative w-16 h-16 rounded-full flex items-center justify-center border shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] backdrop-blur-md z-10 transition-colors duration-1000",
                                isDay ? "bg-amber-500/10 border-amber-200/40 shadow-amber-500/20" : "bg-indigo-900/40 border-indigo-300/30 shadow-blue-500/20"
                            )}>
                                {/* Glass Shine */}
                                <div className="absolute top-1 left-3 w-6 h-3 bg-white/30 rounded-full blur-[2px]"></div>
                                
                                {/* Digital Clock Text */}
                                <div className="flex flex-col items-center justify-center leading-none">
                                    <span className={clsx("text-[9px] font-black tracking-widest uppercase mb-[1px]", isDay ? "text-amber-100" : "text-blue-200")}>
                                        {loading ? "--" : (isDay ? "DAY" : "NIGHT")}
                                    </span>
                                    <span className="text-sm font-bold tracking-tighter font-mono tabular-nums text-white drop-shadow-md">
                                        <LiveClock />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location Pill (Below Sun) */}
                        <div className="relative z-20 -mt-2 bg-black/40 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center gap-1.5 transform hover:scale-105 transition-transform cursor-pointer">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider max-w-[80px] truncate">
                                {location}
                            </span>
                        </div>

                     </div>
                 </div>
                 
                 {/* Bottom: Metrics Pill */}
                 <div className="grid grid-cols-2 gap-2 mt-auto">
                     <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2 border border-white/5 hover:bg-white/5 transition-colors">
                         <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                             <Wind size={16}/>
                         </div>
                         <div className="leading-none">
                             <p className="text-xs font-bold text-white mb-0.5">{loading ? "-" : weather.current.wind_speed_10m} <span className="text-[8px] text-slate-400">km/h</span></p>
                             <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{txt.wind}</p>
                         </div>
                     </div>
                     <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2 border border-white/5 hover:bg-white/5 transition-colors">
                         <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                             <Droplets size={16}/>
                         </div>
                         <div className="leading-none">
                             <p className="text-xs font-bold text-white mb-0.5">45<span className="text-[8px] text-slate-400">%</span></p>
                             <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{txt.humidity}</p>
                         </div>
                     </div>
                 </div>

             </div>
        </GlassTile>
    );
};

// Visual Market Cards
const MarketWidget = ({ onNavigate, lang }: any) => {
    const txt = DASH_TEXT[lang];
    
    return (
        <GlassTile onClick={() => onNavigate('MARKET')} className="h-full p-5 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0f172a]/60 to-[#1e293b]/60">
            <div className="flex justify-between items-center mb-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Store size={16} />
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">{txt.market_rates}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    {txt.live}
                </div>
            </div>

            {/* Horizontal Scroll Snap for Mobile / Grid for Desktop */}
            <div className="flex-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-hidden hide-scrollbar snap-x z-10">
                {MOCK_MARKET.slice(0, 2).map((m, i) => (
                    <div key={i} className="min-w-[85%] md:min-w-full snap-center bg-black/20 border border-white/5 rounded-2xl p-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", m.bg)}>
                                <m.icon size={18} className={m.color} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{txt.crops[m.name] || m.name}</p>
                                <p className={clsx("text-[10px] font-bold", m.trend.includes('+') ? "text-emerald-400" : "text-red-400")}>
                                    {m.trend} {txt.this_week}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <GoldText className="text-lg font-black block">₹{m.price}</GoldText>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">{txt.quintal}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Background Chart Effect */}
            <svg className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none text-emerald-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 20 L0 10 Q 25 5 50 15 T 100 10 L 100 20 Z" fill="currentColor" />
            </svg>
        </GlassTile>
    );
};

// Timeline Style Calendar
const CalendarWidget = ({ lang }: { lang: Language }) => {
    const txt = DASH_TEXT[lang];
    return (
        <GlassTile className="h-full p-5 bg-gradient-to-br from-[#0f172a]/60 to-[#1e293b]/60">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Calendar size={16} />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">{txt.crop_schedule}</span>
            </div>

            <div className="relative pl-2 space-y-0">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/10 rounded-full"></div>

                {/* Item 1 (Active) */}
                <div className="relative pl-8 pb-4 group">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] border-[#020617] bg-indigo-500 shadow-[0_0_10px_#6366f1] z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                        <p className="text-[10px] font-bold text-indigo-300 uppercase mb-0.5">{txt.today_urgent}</p>
                        <h4 className="text-sm font-bold text-white">{txt.irrigation}</h4>
                        <p className="text-xs text-slate-400">{txt.cotton_field}</p>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="relative pl-8 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-slate-600 border-2 border-[#020617] z-10"></div>
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

// Visual Quick Action Tile
const QuickActionTile = ({ icon: Icon, label, colorClass, onClick, delay }: any) => (
    <GlassTile onClick={() => { onClick(); triggerHaptic(); }} delay={delay} className="p-4 flex flex-col items-center justify-center gap-3 text-center group bg-[#1e293b]/40 hover:bg-[#1e293b]/60">
        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300 border border-white/10", colorClass)}>
            <Icon size={24} className="text-white drop-shadow-sm" />
        </div>
        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </GlassTile>
);

// Illustrative Banner
const IllustrativeBanner = ({ title, subtitle, icon: Icon, gradient, pattern, onClick }: any) => (
    <div onClick={onClick} className="relative h-40 rounded-[2rem] overflow-hidden cursor-pointer group shadow-lg border border-white/10">
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
            <div className="pt-4 px-6 pb-2 flex items-start justify-between">
                 <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('PROFILE')}>
                     <div className="relative group">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                             <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                 {/* Initials or Avatar */}
                                 <span className="text-xl font-black text-white">{user.name.charAt(0)}</span>
                             </div>
                         </div>
                         <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#020617] animate-pulse"></div>
                     </div>
                     <DynamicGreeting user={user} lang={lang} />
                 </div>

                 <div className="flex items-center gap-3 mt-1.5">
                     <button onClick={toggleLang} className="h-10 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
                         <Languages size={16} className="text-slate-300"/>
                         <span className="text-xs font-bold uppercase text-white tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'ENG'}</span>
                     </button>
                     <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center relative">
                         <BellRing size={18} className="text-white"/>
                         <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></span>
                     </button>
                 </div>
            </div>

            {/* 3. BENTO GRID */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 pb-32 max-w-7xl mx-auto w-full">
                
                {/* Weather (MD: Col 1-4) - Immersive Scene */}
                <div className="col-span-1 md:col-span-4 h-56 md:h-64">
                    <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} />
                </div>

                {/* Market Trends (MD: Col 5-8) - Trading Cards */}
                <div className="col-span-1 md:col-span-4 h-56 md:h-64">
                    <MarketWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Crop Calendar (MD: Col 9-12) - Timeline */}
                <div className="col-span-1 md:col-span-4 h-56 md:h-64">
                    <CalendarWidget lang={lang} />
                </div>

                {/* --- Row 2 --- */}

                {/* Voice Widget (Desktop Only) - Glowing Orb */}
                <div className="hidden md:block col-span-1 md:col-span-3 h-44">
                    <VoiceWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Quick Actions Grid - Glass Tiles */}
                <div className="col-span-1 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionTile 
                        icon={ScanLine} 
                        label={t.quick_action_doctor} 
                        colorClass="bg-emerald-500 text-white shadow-emerald-500/30" 
                        onClick={() => onNavigate('DISEASE_DETECTOR')} 
                        delay={100}
                    />
                    <QuickActionTile 
                        icon={FlaskConical} 
                        label={t.quick_action_soil} 
                        colorClass="bg-amber-500 text-white shadow-amber-500/30" 
                        onClick={() => onNavigate('SOIL')} 
                        delay={150}
                    />
                    <QuickActionTile 
                        icon={TrendingUp} 
                        label={t.menu_yield} 
                        colorClass="bg-purple-500 text-white shadow-purple-500/30" 
                        onClick={() => onNavigate('YIELD')} 
                        delay={200}
                    />
                    <QuickActionTile 
                        icon={MapIcon} 
                        label={t.menu_area} 
                        colorClass="bg-blue-500 text-white shadow-blue-500/30" 
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
