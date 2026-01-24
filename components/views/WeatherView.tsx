
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, MoreVertical, MapPin, Wind, Droplets, Sun, Clock, CloudRain, Eye, Sparkles, Moon, CloudFog } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const WEATHER_V_TEXT: Record<Language, any> = {
    mr: {
        hourly: "तासाभराचा अंदाज",
        insight_title: "AI कृषी सल्ला",
        visibility: "दृश्यमानता",
        uv: "UV इंडेक्स",
        moon: "चंद्राची कला",
        km: "किमी",
        high: "उच्च",
        low: "कमी",
        waxing: "शुक्ल पक्ष",
        spraying_tip: "फवारणीसाठी योग्य वेळ आहे. दुपारी ४ वाजेपर्यंत काम उरका.",
        night_tip: "रात्रीची वेळ आहे. थंडी वाढू शकते, पिकांची काळजी घ्या."
    },
    hi: {
        hourly: "घंटेवार पूर्वानुमान",
        insight_title: "AI कृषि सलाह",
        visibility: "दृश्यता",
        uv: "UV इंडेक्स",
        moon: "चंद्रमा की स्थिति",
        km: "किमी",
        high: "अधिक",
        low: "कम",
        waxing: "शुक्ल पक्ष",
        spraying_tip: "छिड़काव के लिए अच्छा समय है। शाम 4 बजे तक काम पूरा करें।",
        night_tip: "रात का समय है। ठंड बढ़ सकती है, फसलों का ध्यान रखें।"
    },
    en: {
        hourly: "Hourly Forecast",
        insight_title: "AI Agri-Insight",
        visibility: "Visibility",
        uv: "UV Index",
        moon: "Moon Phase",
        km: "km",
        high: "H",
        low: "L",
        waxing: "Waxing",
        spraying_tip: "Good conditions for spraying. Finish tasks before 4 PM.",
        night_tip: "Night time. Temp may drop, protect young crops."
    }
};

// --- PREMIUM 3D ICONS (High Res) ---
const WeatherIcon3D = ({ type, isDay, size = "lg" }: { type: string, isDay: boolean, size?: "sm" | "md" | "lg" }) => {
    const scale = size === "lg" ? "scale-150" : size === "md" ? "scale-100" : "scale-75";
    
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-2xl ${scale}`}>
         {/* SUN/MOON Layer (Behind) */}
         {type !== 'rain' && type !== 'storm' && (
           <div className={clsx("absolute rounded-full shadow-[0_0_60px_rgba(251,191,36,0.6)] animate-[pulse_4s_infinite] transition-all duration-1000", 
               isDay 
                 ? "w-24 h-24 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-orange-500/50" 
                 : "w-20 h-20 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 shadow-blue-300/30",
               type === 'clear' ? "scale-100" : "top-2 right-4 scale-75"
           )}>
               {!isDay && (
                   <>
                    <div className="absolute top-4 left-3 w-4 h-4 bg-slate-400/20 rounded-full"></div>
                    <div className="absolute bottom-4 right-5 w-2 h-2 bg-slate-400/20 rounded-full"></div>
                   </>
               )}
           </div>
         )}
  
         {/* CLOUD Layer (Front) */}
         {(type !== 'clear') && (
           <div className="relative z-10">
              {/* Main Cloud Shape */}
              <svg width="160" height="110" viewBox="0 0 160 110" className="drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
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
                 
                 <path d="M50,90 Q25,90 25,65 Q25,35 55,35 Q65,15 95,15 Q120,15 130,45 Q150,45 150,70 Q150,90 130,90 Z" 
                       fill="url(#cloudBody)" />
                 
                 <path d="M60,40 Q70,25 95,25 Q115,25 125,45" 
                       fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.6" strokeLinecap="round" filter="url(#gloss)" />
              </svg>
              
              {/* Rain / Storm Elements */}
              {(type === 'rain' || type === 'storm') && (
                 <div className="absolute bottom-0 left-12 flex gap-4 z-0">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-3 h-6 bg-gradient-to-b from-cyan-300 to-blue-600 rounded-full shadow-lg animate-[rain_0.8s_ease-in_infinite]" 
                           style={{animationDelay: `${i * 0.25}s`, transform: 'rotate(10deg)'}}></div>
                    ))}
                 </div>
              )}
              
              {type === 'storm' && (
                  <svg className="absolute bottom-[-10px] right-14 w-10 h-14 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-[flash_2s_infinite]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
              )}
           </div>
         )}
      </div>
    )
};

// --- ORB BACKGROUND ANIMATION ENGINE ---
const OrbBackground = ({ weatherCode, isDay }: { weatherCode: number, isDay: boolean }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-1000 ease-in-out">
             <style>{`
                @keyframes orb-float {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
             `}</style>
             <div className={clsx(
                 "absolute inset-0 transition-colors duration-1000",
                 isDay 
                  ? "bg-gradient-to-b from-blue-400 via-blue-500 to-indigo-900" 
                  : "bg-gradient-to-b from-[#0f172a] via-[#0b1022] to-black"
             )}></div>
             <div 
                className={clsx(
                    "absolute rounded-full blur-[60px] animate-[orb-float_20s_ease-in-out_infinite] transition-all duration-1000",
                    isDay 
                     ? "top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-yellow-500/60 opacity-60" 
                     : "top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-500/40 opacity-40"
                )}
             ></div>
             <div 
                className={clsx(
                    "absolute rounded-full blur-[80px] animate-[orb-float_25s_ease-in-out_infinite_reverse] transition-all duration-1000",
                    isDay
                     ? "bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-400/40 opacity-40" 
                     : "bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-purple-900/30 opacity-30"
                )}
             ></div>
             {!isDay && (
                 <div className="absolute inset-0">
                     {[...Array(20)].map((_, i) => (
                         <div 
                            key={i}
                            className="absolute bg-white rounded-full"
                            style={{
                                top: `${Math.random() * 60}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                         ></div>
                     ))}
                 </div>
             )}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             {weatherCode >= 51 && (
                 <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/animation/2023/06/25/20/38/20-38-23-441_512.gif')] opacity-20 bg-cover mix-blend-screen pointer-events-none"></div>
             )}
        </div>
    );
};

const WeatherView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const vt = WEATHER_V_TEXT[lang];
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [locationName, setLocationName] = useState('Locating...');

    const fetchWeather = async (lat: number, lng: number) => {
        try {
            const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const locData = await locRes.json();
            setLocationName(locData.locality || locData.city || 'Satara');

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,pressure_msl,uv_index&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
            const data = await weatherRes.json();
            setWeather(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch weather');
            setWeather({
                current: { temperature_2m: 28, weather_code: 1, is_day: 1, wind_speed_10m: 12, relative_humidity_2m: 45, uv_index: 6 },
                hourly: { time: Array(24).fill(new Date().toISOString()), temperature_2m: Array(24).fill(28) },
                daily: { temperature_2m_max: [32], temperature_2m_min: [22] }
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(19.75, 75.71)
            );
        } else fetchWeather(19.75, 75.71);
    }, []);

    const getWeatherType = (code: number) => {
        if (code >= 95) return 'storm';
        if (code >= 51) return 'rain';
        if (code >= 1 && code <= 3) return 'cloudy';
        return 'clear';
    }

    if (loading) return (
        <div className="h-full w-full flex items-center justify-center bg-[#020617]">
             <Loader2 className="animate-spin text-orange-400" size={32} />
        </div>
    );

    const weatherType = getWeatherType(weather?.current?.weather_code || 0);
    const isDay = weather?.current?.is_day !== 0;

    const chartData = weather?.hourly?.time.slice(0, 8).map((time: string, i: number) => ({
        time: new Date(time).getHours() + ':00',
        temp: Math.round(weather.hourly.temperature_2m[i]),
    })) || [];

    return (
        <div className="h-full w-full flex flex-col animate-enter lg:pl-32 relative overflow-hidden text-white">
            <OrbBackground weatherCode={weather?.current?.weather_code || 0} isDay={isDay} />
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20">
                <button onClick={() => { onBack(); triggerHaptic(); }} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-xl shadow-lg">
                    <ArrowLeft size={20}/>
                </button>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                    <MapPin size={14} className={isDay ? "text-orange-400" : "text-blue-400"}/>
                    <span className="text-white font-bold text-sm tracking-wide">{locationName}</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-xl shadow-lg">
                    <MoreVertical size={20}/>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-20 z-20 relative">
                <div className="flex justify-center mb-8">
                     <span className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-md shadow-sm">
                        {new Date().toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </span>
                </div>
                <div className="flex flex-col items-center justify-center mb-10 relative">
                    <div className="mb-4 transform scale-110">
                        <WeatherIcon3D type={weatherType} isDay={isDay} size="lg" />
                    </div>
                    <div className="text-center relative -mt-4">
                        <h1 className="text-[7rem] leading-[0.8] font-black tracking-tighter drop-shadow-2xl text-white">
                            {Math.round(weather.current.temperature_2m)}°
                        </h1>
                        <p className="text-white/80 text-lg font-medium mt-2 flex items-center justify-center gap-3">
                            <span className="capitalize">{weatherType}</span>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                            <span>{vt.high}:{Math.round(weather.daily.temperature_2m_max[0])}°</span>
                            <span>{vt.low}:{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                        </p>
                    </div>
                </div>
                <div className="glass-panel rounded-[2rem] p-5 mb-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                <Clock size={12} className={isDay ? "text-orange-200" : "text-blue-200"}/>
                            </div>
                            <h3 className="text-white/90 font-bold text-xs uppercase tracking-wider">{vt.hourly}</h3>
                        </div>
                    </div>
                    <div className="h-28 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDay ? "#fbbf24" : "#60a5fa"} stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor={isDay ? "#fbbf24" : "#60a5fa"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(255,255,255,0.3)" 
                                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} 
                                    tickLine={false} 
                                    axisLine={false}
                                    interval={1}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="temp" 
                                    stroke={isDay ? "#fbbf24" : "#60a5fa"} 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorTemp)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className={clsx(
                    "glass-panel rounded-[2rem] p-5 mb-6 border backdrop-blur-xl shadow-lg relative overflow-hidden transition-colors duration-1000",
                    isDay ? "border-emerald-400/20 bg-emerald-900/10" : "border-indigo-400/20 bg-indigo-900/10"
                )}>
                    <div className={clsx(
                        "absolute -right-4 -top-4 w-20 h-20 blur-2xl rounded-full transition-colors duration-1000",
                        isDay ? "bg-emerald-400/20" : "bg-indigo-400/20"
                    )}></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className={clsx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 bg-gradient-to-br transition-all duration-1000",
                            isDay ? "from-emerald-500 to-teal-600" : "from-indigo-500 to-purple-600"
                        )}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm mb-1">{vt.insight_title}</h3>
                            <p className="text-white/80 text-xs leading-relaxed">
                                {isDay ? vt.spraying_tip : vt.night_tip}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                                 <Wind size={12}/>
                             </div>
                             <span className="text-[10px] text-white/60 font-bold uppercase">{t.wind}</span>
                         </div>
                         <p className="text-xl font-black text-white">{weather.current.wind_speed_10m} <span className="text-xs font-medium text-white/50">{vt.km}/h</span></p>
                    </div>
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                                 <Droplets size={12}/>
                             </div>
                             <span className="text-[10px] text-white/60 font-bold uppercase">{t.humidity}</span>
                         </div>
                         <p className="text-xl font-black text-white">{weather.current.relative_humidity_2m}<span className="text-xs font-medium text-white/50">%</span></p>
                    </div>
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center", isDay ? "bg-orange-500/20 text-orange-300" : "bg-indigo-500/20 text-indigo-300")}>
                                 {isDay ? <Sun size={12}/> : <Moon size={12}/>}
                             </div>
                             <span className="text-[10px] text-white/60 font-bold uppercase">{isDay ? vt.uv : vt.moon}</span>
                         </div>
                         <p className="text-xl font-black text-white">{isDay ? (weather.current.uv_index || 4) : vt.waxing}</p>
                    </div>
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                                 <Eye size={12}/>
                             </div>
                             <span className="text-[10px] text-white/60 font-bold uppercase">{vt.visibility}</span>
                         </div>
                         <p className="text-xl font-black text-white">10 <span className="text-xs font-medium text-white/50">{vt.km}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherView;
