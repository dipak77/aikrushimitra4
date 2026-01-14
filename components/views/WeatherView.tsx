import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, MoreVertical, MapPin } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// --- REALISTIC WEATHER EFFECTS ---
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
                    {/* Moon Glow */}
                    {type === 'clear' && <div className="absolute top-20 right-10 w-32 h-32 bg-slate-100/10 rounded-full blur-[60px]"></div>}
                </div>
            )}

            {/* 2. SUNNY DAY (Background) */}
            {isDay && type === 'clear' && (
                <>
                    {/* Main Sun Glow */}
                    <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-amber-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    {/* Core Sun */}
                    <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-[80px] opacity-60"></div>
                    {/* Rotating Sun Rays */}
                    <div className="absolute top-[-20%] right-[-20%] w-[120vw] h-[120vw] bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.2),transparent)] animate-[spin_60s_linear_infinite] opacity-40"></div>
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
                    <div className="absolute top-20 left-[-20%] w-[60%] h-32 bg-white/5 rounded-full blur-3xl animate-[float-cloud_40s_linear_infinite]"></div>
                    <div className="absolute top-40 left-[-40%] w-[80%] h-40 bg-white/5 rounded-full blur-[60px] animate-[float-cloud_60s_linear_infinite]" style={{animationDelay: '-20s'}}></div>
                    <div className="absolute top-10 right-[-20%] w-[50%] h-24 bg-white/10 rounded-full blur-2xl animate-[float-cloud_50s_linear_infinite_reverse]" style={{animationDelay: '-10s'}}></div>
                </>
            )}

            {/* 4. RAIN ENGINE (CSS based particles) */}
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
                     {[...Array(40)].map((_, i) => (
                         <div 
                            key={i} 
                            className="absolute bg-blue-300 w-[1px] rounded-full"
                            style={{
                                height: (10 + Math.random() * 20) + 'px',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * -20}%`,
                                animation: `rain-drop ${0.6 + Math.random() * 0.4}s linear infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.6
                            }}
                         ></div>
                     ))}
                </div>
            )}

            {/* 5. STORM LIGHTNING (Flash Overlay) */}
            {type === 'storm' && (
                <>
                    <div className="absolute inset-0 bg-black/30 z-0"></div>
                    <div className="absolute inset-0 bg-white z-20 animate-[lightning-flash_6s_infinite] opacity-0 mix-blend-overlay pointer-events-none"></div>
                    <style>{`
                        @keyframes lightning-flash {
                            0%, 92%, 95%, 100% { opacity: 0; }
                            93% { opacity: 0.3; }
                            94% { opacity: 0.1; }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
};

// CSS-Only 3D Icon with proper Z-indexing
const WeatherIcon3D = ({ type, isDay, size = "large" }: { type: 'clear' | 'cloudy' | 'rain' | 'storm', isDay: boolean, size?: "small" | "large" }) => {
    const scale = size === 'small' ? 'scale-50' : 'scale-100';
    return (
      <div className={`relative w-32 h-32 transform ${scale} transition-transform z-10`}>
         <style>{`
           .cloud-base {
              background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
              box-shadow: inset 0 2px 10px rgba(255,255,255,0.9), 0 10px 20px rgba(0,0,0,0.2);
           }
           .sun-base {
              background: radial-gradient(circle at 30% 30%, #fef3c7 0%, #f59e0b 60%, #d97706 100%);
              box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
           }
           .moon-base {
              background: radial-gradient(circle at 30% 30%, #f8fafc 0%, #94a3b8 100%);
              box-shadow: 0 0 20px rgba(226, 232, 240, 0.4);
           }
           .rain-particle {
              background: linear-gradient(180deg, #67e8f9 0%, #0ea5e9 100%);
           }
         `}</style>
  
         {/* Sun or Moon */}
         {type === 'clear' || type === 'cloudy' ? (
             isDay ? (
                 <div className="absolute top-0 right-2 w-16 h-16 rounded-full sun-base animate-[pulse_4s_infinite]"></div>
             ) : (
                 <div className="absolute top-0 right-2 w-14 h-14 rounded-full moon-base">
                     <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-slate-400/20"></div>
                     <div className="absolute bottom-4 right-3 w-4 h-4 rounded-full bg-slate-400/20"></div>
                 </div>
             )
         ) : null}
  
         {/* Cloud Shape */}
         {(type === 'cloudy' || type === 'rain' || type === 'storm') && (
             <div className="absolute top-8 left-4 z-20 animate-[bounce_3s_infinite] ease-in-out">
                <div className="relative">
                   <div className="w-20 h-20 rounded-full cloud-base absolute -top-8 -left-2 z-10"></div>
                   <div className="w-16 h-16 rounded-full cloud-base absolute -top-4 left-10 z-0"></div>
                   <div className="w-28 h-12 rounded-full cloud-base absolute top-4 left-0 z-20"></div>
                </div>
             </div>
         )}
  
         {/* Rain Drops */}
         {(type === 'rain' || type === 'storm') && (
            <div className="absolute bottom-0 left-10 z-0 flex gap-4">
               <div className="w-2 h-4 rounded-full rain-particle animate-[bounce_0.8s_infinite]"></div>
               <div className="w-2 h-4 rounded-full rain-particle animate-[bounce_1s_infinite] delay-100"></div>
               <div className="w-2 h-4 rounded-full rain-particle animate-[bounce_0.9s_infinite] delay-200"></div>
            </div>
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
        ? (weatherType === 'rain' || weatherType === 'storm' ? 'bg-gradient-to-b from-slate-700 to-slate-900' : 'bg-gradient-to-b from-sky-400 to-blue-600')
        : 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]';

    // Chart Data
    const chartData = weather?.hourly.time.slice(0, 8).map((time: string, i: number) => ({
        time: new Date(time).getHours() + ':00',
        temp: Math.round(weather.hourly.temperature_2m[i]),
    })) || [];

    return (
        <div className={clsx("h-full w-full flex flex-col animate-enter lg:pl-32 relative overflow-hidden transition-colors duration-1000", bgClass)}>
            
            {/* Immersive Background Effects */}
            <WeatherEffects type={weatherType} isDay={isDay} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0 pointer-events-none"></div>
            
            {/* 1. Header */}
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20">
                <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <ArrowLeft size={20}/>
                </button>
                <span className="text-white font-bold text-lg drop-shadow-md">Weather</span>
                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <MoreVertical size={20}/>
                </button>
            </div>

            {/* 2. Main Weather Display */}
            {weather && (
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-20 z-20 relative">
                    
                    {/* Day Selector Pill */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-black/20 backdrop-blur-xl p-1 rounded-full border border-white/10">
                            {['Today', 'Tomorrow', '7 Days'].map((day, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => { setSelectedDay(i); triggerHaptic(); }}
                                    className={clsx(
                                        "px-6 py-2 rounded-full text-sm font-bold transition-all",
                                        selectedDay === i ? "bg-white text-blue-900 shadow-lg" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Icon & Temp */}
                    <div className="flex flex-col items-center justify-center mb-8 relative">
                        <WeatherIcon3D 
                            type={weatherType} 
                            isDay={isDay} 
                        />
                        
                        <h1 className="text-8xl font-black text-white tracking-tighter mt-4 drop-shadow-2xl">
                            {Math.round(weather.current.temperature_2m)}°
                        </h1>
                        <p className="text-white/90 text-lg font-medium drop-shadow-md flex items-center gap-1">
                            <MapPin size={16} className="text-white"/> {locationName}
                        </p>
                        <div className="flex gap-4 mt-4 text-sm text-white font-bold bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                             <span>H:{Math.round(weather.daily.temperature_2m_max[0])}°</span>
                             <span className="w-[1px] h-4 bg-white/30"></span>
                             <span>L:{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                        </div>
                    </div>

                    {/* Hourly Chart Card */}
                    <div className="glass-panel bg-black/20 border border-white/10 rounded-[2.5rem] p-6 shadow-xl mb-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold">Hourly Forecast</h3>
                            <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full border border-white/10">Today</span>
                        </div>
                        
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: 'none', color: 'white' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} tickLine={false} axisLine={false} />
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
                        <div className="bg-black/20 p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 backdrop-blur-md">
                             <span className="text-xs text-white/60 uppercase font-bold tracking-wider">Wind Speed</span>
                             <span className="text-xl font-bold text-white">{weather.current.wind_speed_10m} km/h</span>
                        </div>
                        <div className="bg-black/20 p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 backdrop-blur-md">
                             <span className="text-xs text-white/60 uppercase font-bold tracking-wider">Humidity</span>
                             <span className="text-xl font-bold text-white">{weather.current.relative_humidity_2m}%</span>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default WeatherView;