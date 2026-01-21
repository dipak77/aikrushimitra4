
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, MoreVertical, MapPin, Wind, Droplets, Sun, Calendar, Clock, CloudRain, ThermometerSun, Eye, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// --- PREMIUM 3D ICONS (High Res) ---

const WeatherIcon3D = ({ type, isDay, size = "lg" }: { type: string, isDay: boolean, size?: "sm" | "md" | "lg" }) => {
    const scale = size === "lg" ? "scale-150" : size === "md" ? "scale-100" : "scale-75";
    
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-2xl ${scale}`}>
         {/* SUN/MOON Layer (Behind) */}
         {isDay && type !== 'rain' && type !== 'storm' && (
           <div className={clsx("absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-[0_0_60px_rgba(251,191,36,0.6)] animate-[pulse_4s_infinite]", 
               type === 'clear' ? "scale-100" : "top-2 right-4 scale-75"
           )}></div>
         )}
         {!isDay && type !== 'rain' && type !== 'storm' && (
            <div className={clsx("absolute w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 shadow-[0_0_40px_rgba(255,255,255,0.3)]",
                 type === 'clear' ? "scale-100" : "top-2 right-4 scale-75"
            )}>
               <div className="absolute top-4 left-3 w-4 h-4 bg-slate-400/20 rounded-full"></div>
               <div className="absolute bottom-4 right-5 w-2 h-2 bg-slate-400/20 rounded-full"></div>
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
                 
                 {/* Cloud Base */}
                 <path d="M50,90 Q25,90 25,65 Q25,35 55,35 Q65,15 95,15 Q120,15 130,45 Q150,45 150,70 Q150,90 130,90 Z" 
                       fill="url(#cloudBody)" />
                 
                 {/* Highlight/Gloss (Simulated 3D reflection) */}
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

// --- ORB BACKGROUND ANIMATION ---
const OrbBackground = ({ weatherCode, isDay }: { weatherCode: number, isDay: boolean }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
             <style>{`
                @keyframes orb-float {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes orb-breathe {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.2); }
                }
             `}</style>

             {/* Base Gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>

             {/* Orb 1: Warm/Sun (Yellow/Red) */}
             <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-40 animate-[orb-float_10s_ease-in-out_infinite]"
                  style={{ background: isDay ? 'radial-gradient(circle, #f59e0b, #ef4444)' : 'radial-gradient(circle, #1e293b, #0f172a)' }}></div>
             
             {/* Orb 2: Cool/Secondary (Blue/Purple) */}
             <div className="absolute bottom-[10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-30 animate-[orb-float_15s_ease-in-out_infinite_reverse]"
                  style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)' }}></div>

             {/* Orb 3: Accent (Red/Pink for that 'Yellow Red' request) */}
             <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full blur-[90px] opacity-20 animate-[orb-breathe_8s_ease-in-out_infinite]"
                  style={{ background: 'radial-gradient(circle, #f43f5e, #fbbf24)' }}></div>

             {/* Noise Texture for Realism */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             
             {/* Rain/Particles Overlay if needed */}
             {weatherCode >= 51 && (
                 <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/animation/2023/06/25/20/38/20-38-23-441_512.gif')] opacity-10 bg-cover mix-blend-screen"></div>
             )}
        </div>
    );
};

const WeatherView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [selectedDay, setSelectedDay] = useState(0);

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

    // Chart Data (Smoothed)
    const chartData = weather?.hourly.time.slice(0, 8).map((time: string, i: number) => ({
        time: new Date(time).getHours() + ':00',
        temp: Math.round(weather.hourly.temperature_2m[i]),
    })) || [];

    return (
        <div className="h-full w-full flex flex-col animate-enter lg:pl-32 relative overflow-hidden bg-slate-950 text-white selection:bg-orange-500/30">
            
            {/* 1. Immersive Background */}
            <OrbBackground weatherCode={weather?.current?.weather_code || 0} isDay={isDay} />
            
            {/* 2. Header */}
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20">
                <button onClick={() => { onBack(); triggerHaptic(); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-xl shadow-lg">
                    <ArrowLeft size={20}/>
                </button>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                    <MapPin size={14} className="text-orange-400"/>
                    <span className="text-white font-bold text-sm tracking-wide">{locationName}</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-xl shadow-lg">
                    <MoreVertical size={20}/>
                </button>
            </div>

            {/* 3. Main Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-20 z-20 relative">
                
                {/* Date/Time Pill */}
                <div className="flex justify-center mb-8">
                     <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </span>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center mb-10 relative">
                    <div className="absolute top-0 w-64 h-64 bg-gradient-to-tr from-yellow-500/10 to-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    {/* Big 3D Icon */}
                    <div className="mb-4 transform scale-110">
                        <WeatherIcon3D type={weatherType} isDay={isDay} size="lg" />
                    </div>
                    
                    {/* Temperature with requested Yellow-Red Gradient */}
                    <div className="text-center relative -mt-4">
                        <h1 className="text-[7rem] leading-[0.8] font-black tracking-tighter drop-shadow-2xl">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600">
                                {Math.round(weather.current.temperature_2m)}°
                            </span>
                        </h1>
                        <p className="text-slate-300 text-lg font-medium mt-2 flex items-center justify-center gap-2">
                            <span className="capitalize">{weatherType}</span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                            <span>H:{Math.round(weather.daily.temperature_2m_max[0])}° L:{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                        </p>
                    </div>
                </div>

                {/* Hourly Forecast Chart - Glass Card */}
                <div className="glass-panel rounded-[2rem] p-5 mb-6 border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                <Clock size={12} className="text-orange-300"/>
                            </div>
                            <h3 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Hourly Forecast</h3>
                        </div>
                    </div>
                    
                    <div className="h-28 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(255,255,255,0.2)" 
                                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} 
                                    tickLine={false} 
                                    axisLine={false}
                                    interval={1}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="temp" 
                                    stroke="#fbbf24" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorTemp)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Tool / Insight Placeholder (Requested) */}
                <div className="glass-panel rounded-[2rem] p-5 mb-6 border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 blur-2xl rounded-full"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shrink-0">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm mb-1">AI Agri-Insight</h3>
                            <p className="text-emerald-100/80 text-xs leading-relaxed">
                                Conditions are optimal for spraying fertilizer. Wind speed is low ({weather.current.wind_speed_10m} km/h). Ensure completion before 4 PM.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Grid (Feature Card Placeholders) */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Card 1: Wind */}
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                                 <Wind size={12}/>
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">Wind</span>
                         </div>
                         <p className="text-xl font-black text-white">{weather.current.wind_speed_10m} <span className="text-xs font-medium text-slate-400">km/h</span></p>
                    </div>

                    {/* Card 2: Humidity */}
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                                 <Droplets size={12}/>
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
                         </div>
                         <p className="text-xl font-black text-white">{weather.current.relative_humidity_2m}<span className="text-xs font-medium text-slate-400">%</span></p>
                    </div>

                    {/* Card 3: UV Index (Simulated) */}
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300">
                                 <Sun size={12}/>
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">UV Index</span>
                         </div>
                         <p className="text-xl font-black text-white">{weather.current.uv_index || 4} <span className="text-xs font-medium text-slate-400">Mod</span></p>
                    </div>

                    {/* Card 4: Visibility (Simulated) */}
                    <div className="glass-panel p-4 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                                 <Eye size={12}/>
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">Visibility</span>
                         </div>
                         <p className="text-xl font-black text-white">10 <span className="text-xs font-medium text-slate-400">km</span></p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WeatherView;
