
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, MoreVertical, MapPin, Wind, Droplets, Sun, Calendar, Clock } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// --- PREMIUM ANIMATED ICONS ---

const SunIcon = () => (
  <div className="relative w-48 h-48 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
    {/* Glow */}
    <div className="absolute inset-0 bg-orange-500/30 blur-[60px] rounded-full animate-pulse"></div>
    {/* Rotating Rays */}
    <svg className="absolute w-full h-full animate-[spin_25s_linear_infinite] text-amber-400 opacity-80" viewBox="0 0 100 100">
        {[...Array(12)].map((_, i) => (
            <rect key={i} x="48" y="0" width="4" height="12" rx="2" transform={`rotate(${i * 30} 50 50)`} fill="currentColor" />
        ))}
    </svg>
    <svg className="absolute w-[80%] h-[80%] animate-[spin_20s_linear_infinite_reverse] text-orange-400/50" viewBox="0 0 100 100">
        {[...Array(8)].map((_, i) => (
            <rect key={i} x="48" y="0" width="4" height="16" rx="2" transform={`rotate(${i * 45} 50 50)`} fill="currentColor" />
        ))}
    </svg>
    {/* Core Sun */}
    <div className="relative w-24 h-24 bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 rounded-full shadow-[inset_-4px_-4px_10px_rgba(255,0,0,0.2),0_0_40px_rgba(251,191,36,0.6)]"></div>
  </div>
);

const MoonIcon = () => (
   <div className="relative w-48 h-48 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
      <div className="absolute inset-0 bg-blue-100/10 blur-[50px] rounded-full"></div>
      {/* Moon Body */}
      <div className="relative w-28 h-28 bg-gradient-to-tr from-slate-100 to-slate-300 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
          {/* Craters */}
          <div className="absolute top-5 left-6 w-5 h-5 bg-slate-400/20 rounded-full shadow-inner"></div>
          <div className="absolute bottom-8 right-8 w-8 h-8 bg-slate-400/20 rounded-full shadow-inner"></div>
          <div className="absolute top-12 right-4 w-3 h-3 bg-slate-400/20 rounded-full shadow-inner"></div>
      </div>
      {/* Stars */}
      <div className="absolute top-4 right-8 text-white animate-pulse">✦</div>
      <div className="absolute bottom-4 left-6 text-white animate-pulse delay-700">✦</div>
      <div className="absolute top-0 left-10 text-white/50 text-xs animate-pulse delay-300">✦</div>
   </div>
);

const CloudIcon = ({ type, isDay }: { type: 'cloudy' | 'rain' | 'storm', isDay: boolean }) => (
    <div className="relative w-48 h-48 flex items-center justify-center">
        
        {/* Sun/Moon peeking behind if partly cloudy */}
        {isDay && type === 'cloudy' && (
            <div className="absolute top-6 right-6 w-16 h-16 bg-amber-400 rounded-full blur-md animate-[pulse_4s_infinite]"></div>
        )}
        
        {/* Back Cloud Layer */}
        <div className="absolute top-12 left-6 w-24 h-24 bg-white/20 rounded-full blur-xl animate-[float_7s_ease-in-out_infinite]"></div>
        <div className="absolute top-16 right-4 w-20 h-20 bg-white/20 rounded-full blur-xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        
        {/* Main Cloud Group */}
        <div className="relative z-10 animate-[float_6s_ease-in-out_infinite] filter drop-shadow-2xl">
             <svg width="180" height="110" viewBox="0 0 160 100">
                 <path d="M40,80 Q20,80 20,60 Q20,30 50,30 Q60,10 90,10 Q120,10 130,40 Q150,40 150,70 Q150,80 130,80 Z" fill="url(#cloudGrad)" />
                 <defs>
                     <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" stopColor="#ffffff" />
                         <stop offset="100%" stopColor={type === 'storm' || type === 'rain' ? '#94a3b8' : '#e2e8f0'} />
                     </linearGradient>
                 </defs>
             </svg>

             {/* Rain Drops */}
             {type === 'rain' && (
                 <div className="absolute bottom-2 left-10 flex gap-4 z-0">
                     {[1,2,3].map(i => (
                         <div key={i} className="w-1.5 h-6 bg-blue-400 rounded-full animate-[rain_0.8s_linear_infinite]" style={{animationDelay: `${i*0.2}s`}}></div>
                     ))}
                 </div>
             )}
             
             {/* Storm Lightning */}
             {type === 'storm' && (
                 <svg className="absolute -bottom-8 left-16 w-10 h-16 text-yellow-300 animate-[flash_2s_infinite] drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                 </svg>
             )}
        </div>
    </div>
);

const WeatherEffects = ({ type, isDay }: { type: 'clear' | 'cloudy' | 'rain' | 'storm', isDay: boolean }) => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            
            {/* 1. STARRY NIGHT (Background) */}
            {!isDay && (
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="absolute bg-white rounded-full animate-pulse"
                            style={{
                                width: Math.random() < 0.5 ? '1px' : '2px',
                                height: Math.random() < 0.5 ? '1px' : '2px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.8,
                                animationDuration: (2 + Math.random() * 3) + 's'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* 2. SUNNY DAY (Background) */}
            {isDay && type === 'clear' && (
                <>
                    <div className="absolute top-[-20%] right-[-20%] w-[100vw] h-[100vw] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute top-[20%] left-[10%] w-[60vw] h-[60vw] bg-sky-400/20 rounded-full blur-[100px]"></div>
                </>
            )}

            {/* 3. CLOUDS (Layered Animation) */}
            {(type === 'cloudy' || type === 'rain' || type === 'storm') && (
                <>
                    <style>{`
                        @keyframes float-cloud {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100vw); }
                        }
                    `}</style>
                    <div className="absolute top-10 left-[-20%] w-[80%] h-32 bg-white/5 rounded-full blur-[80px] animate-[float-cloud_35s_linear_infinite]"></div>
                    <div className="absolute top-40 left-[-40%] w-[90%] h-40 bg-white/5 rounded-full blur-[60px] animate-[float-cloud_50s_linear_infinite]" style={{animationDelay: '-20s'}}></div>
                </>
            )}

            {/* 4. RAIN ENGINE */}
            {(type === 'rain' || type === 'storm') && (
                <div className="absolute inset-0 z-10 opacity-60">
                     <style>{`
                        @keyframes rain-drop {
                            0% { transform: translateY(-20vh) scaleY(1); opacity: 0; }
                            10% { opacity: 0.8; }
                            90% { opacity: 0.8; }
                            100% { transform: translateY(110vh) scaleY(1.5); opacity: 0; }
                        }
                     `}</style>
                     {[...Array(30)].map((_, i) => (
                         <div 
                            key={i} 
                            className="absolute bg-blue-300 w-[1px] rounded-full"
                            style={{
                                height: (10 + Math.random() * 20) + 'px',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * -20}%`,
                                animation: `rain-drop ${0.5 + Math.random() * 0.3}s linear infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.5
                            }}
                         ></div>
                     ))}
                </div>
            )}
            
            {/* 5. LIGHTNING */}
            {type === 'storm' && (
                <div className="absolute inset-0 bg-white z-20 animate-[lightning-flash_8s_infinite] opacity-0 mix-blend-overlay pointer-events-none"></div>
            )}
            <style>{`
                @keyframes lightning-flash {
                    0%, 92%, 95%, 100% { opacity: 0; }
                    93% { opacity: 0.2; }
                    94% { opacity: 0.05; }
                }
                @keyframes rain {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(20px); opacity: 0; }
                }
                @keyframes flash {
                    0%, 90%, 100% { opacity: 0; }
                    92% { opacity: 1; }
                    94% { opacity: 0.5; }
                    96% { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
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
            setLocationName(locData.locality || locData.city || 'My Location');

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
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
             <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
    );

    const weatherType = getWeatherType(weather?.current?.weather_code || 0);
    const isDay = weather?.current?.is_day !== 0;

    // Dynamic Background Gradient
    const bgClass = isDay 
        ? (weatherType === 'rain' || weatherType === 'storm' ? 'bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900' : 'bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600')
        : 'bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]';

    // Chart Data
    const chartData = weather?.hourly.time.slice(0, 8).map((time: string, i: number) => ({
        time: new Date(time).getHours() + ':00',
        temp: Math.round(weather.hourly.temperature_2m[i]),
    })) || [];

    return (
        <div className={clsx("h-full w-full flex flex-col animate-enter lg:pl-32 relative overflow-hidden transition-colors duration-1000", bgClass)}>
            
            {/* Immersive Background Effects */}
            <WeatherEffects type={weatherType} isDay={isDay} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-0 pointer-events-none"></div>
            
            {/* 1. Header */}
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20">
                <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <ArrowLeft size={20}/>
                </button>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    <MapPin size={14} className="text-white"/>
                    <span className="text-white font-bold text-sm">{locationName}</span>
                </div>
                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <MoreVertical size={20}/>
                </button>
            </div>

            {/* 2. Main Weather Display */}
            {weather && (
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-20 z-20 relative">
                    
                    {/* Day Selector Pill */}
                    <div className="flex justify-center mb-6">
                        <div className="flex bg-black/20 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-lg">
                            {['Today', 'Tomorrow', '7 Days'].map((day, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => { setSelectedDay(i); triggerHaptic(); }}
                                    className={clsx(
                                        "px-5 py-2 rounded-full text-xs font-bold transition-all",
                                        selectedDay === i ? "bg-white text-blue-900 shadow-md scale-105" : "text-white/70 hover:text-white"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Icon & Temp */}
                    <div className="flex flex-col items-center justify-center mb-8 relative">
                        <div className="transform scale-110 mb-2">
                            {weatherType === 'clear' ? (isDay ? <SunIcon/> : <MoonIcon/>) : <CloudIcon type={weatherType} isDay={isDay}/>}
                        </div>
                        
                        <div className="text-center relative">
                            <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl relative z-10">
                                {Math.round(weather.current.temperature_2m)}°
                            </h1>
                            <p className="text-white/90 text-xl font-medium drop-shadow-md -mt-2">
                                {weatherType === 'clear' ? (isDay ? 'Sunny' : 'Clear Night') : weatherType.charAt(0).toUpperCase() + weatherType.slice(1)}
                            </p>
                        </div>
                        
                        <div className="flex gap-6 mt-6">
                             <div className="flex flex-col items-center">
                                 <span className="text-xs font-bold text-white/60 uppercase">High</span>
                                 <span className="text-lg font-bold text-white">{Math.round(weather.daily.temperature_2m_max[0])}°</span>
                             </div>
                             <div className="w-[1px] h-10 bg-white/20"></div>
                             <div className="flex flex-col items-center">
                                 <span className="text-xs font-bold text-white/60 uppercase">Low</span>
                                 <span className="text-lg font-bold text-white">{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                             </div>
                        </div>
                    </div>

                    {/* Hourly Chart Card */}
                    <div className="glass-panel bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-xl mb-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-white/60"/>
                                <h3 className="text-white font-bold text-sm">Hourly Forecast</h3>
                            </div>
                        </div>
                        
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="rgba(255,255,255,0.3)" 
                                        tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="temp" 
                                        stroke="#ffffff" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorTemp)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                             <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                                 <Wind size={20}/>
                             </div>
                             <div>
                                 <span className="text-xs text-white/60 uppercase font-bold tracking-wider block">Wind</span>
                                 <span className="text-lg font-bold text-white">{weather.current.wind_speed_10m} <span className="text-xs">km/h</span></span>
                             </div>
                        </div>
                        <div className="glass-panel bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                             <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                                 <Droplets size={20}/>
                             </div>
                             <div>
                                 <span className="text-xs text-white/60 uppercase font-bold tracking-wider block">Humidity</span>
                                 <span className="text-lg font-bold text-white">{weather.current.relative_humidity_2m}%</span>
                             </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default WeatherView;
