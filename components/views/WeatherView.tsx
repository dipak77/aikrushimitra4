
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// --- IMMERSIVE WEATHER BACKGROUND ANIMATIONS ---
const WeatherEffects = ({ type }: { type: 'clear' | 'cloudy' | 'rain' | 'storm' }) => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* SUNNY EFFECT */}
            {type === 'clear' && (
                <>
                    <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-amber-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute top-[10%] right-[10%] w-40 h-40 bg-yellow-400/30 rounded-full blur-[60px] animate-[pulse_4s_ease-in-out_infinite]"></div>
                    {/* Sun Rays */}
                    <div className="absolute top-0 right-0 w-[100vw] h-[100vw] bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.1),transparent)] animate-[spin_20s_linear_infinite] opacity-50"></div>
                </>
            )}

            {/* CLOUDY EFFECT */}
            {(type === 'cloudy' || type === 'rain' || type === 'storm') && (
                <>
                    <style>{`
                        @keyframes float-cloud-bg {
                            0% { transform: translateX(-100%) translateY(0); opacity: 0; }
                            10% { opacity: 0.4; }
                            90% { opacity: 0.4; }
                            100% { transform: translateX(100vw) translateY(0); opacity: 0; }
                        }
                    `}</style>
                    <div className="absolute top-20 left-0 w-64 h-24 bg-white/5 rounded-full blur-2xl animate-[float-cloud-bg_20s_linear_infinite]"></div>
                    <div className="absolute top-40 left-0 w-80 h-32 bg-white/5 rounded-full blur-3xl animate-[float-cloud-bg_25s_linear_infinite]" style={{animationDelay: '5s'}}></div>
                    <div className="absolute top-10 left-0 w-48 h-16 bg-white/5 rounded-full blur-xl animate-[float-cloud-bg_15s_linear_infinite]" style={{animationDelay: '10s'}}></div>
                </>
            )}

            {/* RAIN EFFECT */}
            {(type === 'rain' || type === 'storm') && (
                <div className="absolute inset-0 z-10 opacity-30">
                     <style>{`
                        @keyframes rain-fall {
                            0% { transform: translateY(-10vh); }
                            100% { transform: translateY(100vh); }
                        }
                     `}</style>
                     {[...Array(20)].map((_, i) => (
                         <div 
                            key={i} 
                            className="absolute bg-blue-400/50 w-[1px] h-10"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * -20}%`,
                                animation: `rain-fall ${0.5 + Math.random()}s linear infinite`,
                                animationDelay: `${Math.random()}s`
                            }}
                         ></div>
                     ))}
                </div>
            )}

            {/* STORM EFFECT */}
            {type === 'storm' && (
                <>
                    <div className="absolute inset-0 bg-black/40 z-0"></div>
                    <div className="absolute inset-0 bg-white z-20 animate-[flash_5s_ease-in-out_infinite_alternate] opacity-0 mix-blend-overlay"></div>
                    <style>{`
                        @keyframes flash {
                            0%, 90% { opacity: 0; }
                            92% { opacity: 0.3; }
                            94% { opacity: 0; }
                            96% { opacity: 0.1; }
                            100% { opacity: 0; }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
};

// CSS-Only 3D Icon
const WeatherIcon3D = ({ type, isDay, size = "large" }: { type: 'clear' | 'cloudy' | 'rain' | 'storm', isDay: number, size?: "small" | "large" }) => {
    const scale = size === 'small' ? 'scale-50' : 'scale-100';
    return (
      <div className={`relative w-32 h-32 transform ${scale} transition-transform z-10`}>
         <style>{`
           .cloud-shape {
              background: linear-gradient(to bottom, #ffffff 0%, #e2e8f0 100%);
              box-shadow: inset 0 0 20px rgba(255,255,255,0.8), 0 15px 30px rgba(0,0,0,0.2);
           }
           .sun-shape {
              background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
              box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
           }
           .rain-drop {
              background: linear-gradient(180deg, #67e8f9 0%, #06b6d4 100%);
              box-shadow: 0 5px 10px rgba(6, 182, 212, 0.3);
           }
           @keyframes float-cloud {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
           }
         `}</style>
  
         {isDay === 1 && (type === 'clear' || type === 'cloudy') && (
           <div className="absolute top-0 right-2 w-16 h-16 rounded-full sun-shape animate-pulse z-0"></div>
         )}
  
         <div className="absolute top-8 left-4 z-10 animate-[float-cloud_6s_ease-in-out_infinite]">
            <div className="relative">
               <div className="w-20 h-20 rounded-full cloud-shape absolute -top-8 -left-2"></div>
               <div className="w-16 h-16 rounded-full cloud-shape absolute -top-4 left-10"></div>
               <div className="w-28 h-12 rounded-full cloud-shape absolute top-4 left-0"></div>
            </div>
         </div>
  
         {(type === 'rain' || type === 'storm') && (
            <div className="absolute bottom-4 left-8 z-0 flex gap-3">
               <div className="w-3 h-5 rounded-full rain-drop animate-[bounce_1s_infinite]"></div>
               <div className="w-3 h-5 rounded-full rain-drop animate-[bounce_1.2s_infinite] delay-100"></div>
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
    const [error, setError] = useState('');
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
            setError('Failed to fetch weather');
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

    // Format Data for Chart
    const chartData = weather?.hourly.time.slice(0, 8).map((time: string, i: number) => ({
        time: new Date(time).getHours() + ':00',
        temp: Math.round(weather.hourly.temperature_2m[i]),
    })) || [];

    const getWeatherType = (code: number) => {
        if (code >= 95) return 'storm';
        if (code >= 51) return 'rain';
        if (code >= 1 && code <= 3) return 'cloudy';
        return 'clear';
    }

    if (loading) return (
        <div className="h-full w-full flex items-center justify-center bg-[#020617]">
             <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
    );

    const weatherType = getWeatherType(weather.current.weather_code);

    return (
        <div className="h-full w-full bg-[#1e1b4b] flex flex-col animate-enter lg:pl-32 relative overflow-hidden">
            
            {/* Immersive Background */}
            <WeatherEffects type={weatherType} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1e1b4b]/50 to-[#1e1b4b] z-0 pointer-events-none"></div>
            
            {/* 1. Header */}
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20">
                <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <ArrowLeft size={20}/>
                </button>
                <span className="text-white font-bold text-lg drop-shadow-md">Temperature</span>
                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <MoreVertical size={20}/>
                </button>
            </div>

            {/* 2. Main Weather Display */}
            {weather && (
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-20 z-20 relative">
                    
                    {/* Day Selector Pill */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-[#2e2b5e]/80 backdrop-blur-md p-1 rounded-full border border-white/10">
                            {['Today', 'Tomorrow', 'Next 7 Days'].map((day, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => { setSelectedDay(i); triggerHaptic(); }}
                                    className={clsx(
                                        "px-6 py-2 rounded-full text-sm font-bold transition-all",
                                        selectedDay === i ? "bg-[#7c3aed] text-white shadow-lg" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Icon & Temp */}
                    <div className="flex flex-col items-center justify-center mb-8 relative">
                        {/* Glow behind icon */}
                        <div className="absolute top-0 w-40 h-40 bg-purple-600/20 blur-[60px] rounded-full animate-pulse"></div>
                        
                        <WeatherIcon3D 
                            type={weatherType} 
                            isDay={weather.current.is_day} 
                        />
                        
                        <h1 className="text-8xl font-bold text-white tracking-tighter mt-4 drop-shadow-2xl">
                            {Math.round(weather.current.temperature_2m)}°
                        </h1>
                        <p className="text-purple-200 text-lg font-medium drop-shadow-md">
                            {locationName}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-slate-300 font-bold bg-white/5 px-4 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                             <span>H:{Math.round(weather.daily.temperature_2m_max[0])}°</span>
                             <span>L:{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                        </div>
                    </div>

                    {/* Hourly Chart Card */}
                    <div className="glass-panel bg-[#2e2b5e]/40 border border-white/10 rounded-[2.5rem] p-6 shadow-xl mb-6 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold">Hourly Forecast</h3>
                            <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">Today</span>
                        </div>
                        
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <XAxis dataKey="time" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} tickLine={false} axisLine={false} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="temp" 
                                        stroke="#a78bfa" 
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
                        <div className="bg-[#2e2b5e]/40 p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 backdrop-blur-md">
                             <span className="text-xs text-slate-400 uppercase font-bold">Wind</span>
                             <span className="text-xl font-bold text-white">{weather.current.wind_speed_10m} km/h</span>
                        </div>
                        <div className="bg-[#2e2b5e]/40 p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 backdrop-blur-md">
                             <span className="text-xs text-slate-400 uppercase font-bold">Humidity</span>
                             <span className="text-xl font-bold text-white">{weather.current.relative_humidity_2m}%</span>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default WeatherView;
