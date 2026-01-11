
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { triggerHaptic } from '../../utils/common';
import { Sun, Wind, Droplets, Clock, Calendar, CloudSun, CloudRain, CloudLightning, Snowflake, Cloud, MapPin, Loader2, Navigation, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

// WMO Weather Code Mapping
const getWeatherInfo = (code: number, isDay: number) => {
    // 0: Clear
    // 1,2,3: Cloudy
    // 45,48: Fog
    // 51-67: Rain
    // 71-77: Snow
    // 95-99: Thunderstorm
    
    if (code === 0) return { icon: isDay ? Sun : CloudSun, label: isDay ? 'Sunny' : 'Clear', color: isDay ? 'text-amber-400' : 'text-indigo-300', gradient: isDay ? 'from-amber-400/20 to-orange-500/20' : 'from-indigo-400/20 to-purple-500/20', orb: isDay ? 'bg-amber-400/40' : 'bg-indigo-400/40' };
    if (code >= 1 && code <= 3) return { icon: Cloud, label: 'Partly Cloudy', color: 'text-blue-300', gradient: 'from-blue-400/20 to-cyan-500/20', orb: 'bg-blue-400/40' };
    if (code >= 45 && code <= 48) return { icon: Cloud, label: 'Foggy', color: 'text-slate-300', gradient: 'from-slate-400/20 to-gray-500/20', orb: 'bg-slate-400/40' };
    if (code >= 51 && code <= 67) return { icon: CloudRain, label: 'Rainy', color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-600/20', orb: 'bg-cyan-400/40' };
    if (code >= 71 && code <= 77) return { icon: Snowflake, label: 'Snow', color: 'text-white', gradient: 'from-white/20 to-slate-300/20', orb: 'bg-white/40' };
    if (code >= 95) return { icon: CloudLightning, label: 'Thunderstorm', color: 'text-yellow-400', gradient: 'from-purple-600/20 to-yellow-500/20', orb: 'bg-purple-500/40' };
    
    return { icon: Sun, label: 'Unknown', color: 'text-white', gradient: 'from-slate-500/20', orb: 'bg-white/20' };
};

const WeatherView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState('');

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchWeather = async (lat: number, lng: number) => {
        try {
            // 1. Get Location Name (Reverse Geocoding - Free API)
            try {
                const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const locData = await locRes.json();
                setLocationName(`${locData.locality || locData.city || 'Village'}, ${locData.principalSubdivisionCode || ''}`);
            } catch (e) {
                setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
            }

            // 2. Get Weather Data (Open-Meteo - Free API)
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`);
            const data = await weatherRes.json();
            
            setWeather(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch weather');
            setLoading(false);
        }
    };

    const getLocation = () => {
        setLoading(true);
        setError('');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError('Location permission denied');
                    setLoading(false);
                    // Fallback to default (Satara, MH)
                    fetchWeather(17.68, 74.01);
                }
            );
        } else {
            setError('Geolocation not supported');
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const currentInfo = weather ? getWeatherInfo(weather.current.weather_code, weather.current.is_day) : null;

    return (
        <SimpleView title={t.weather_title} onBack={onBack}>
            {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center animate-enter">
                    <Loader2 size={48} className="text-cyan-400 animate-spin mb-4"/>
                    <p className="text-slate-400 animate-pulse">Detecting location & weather...</p>
                </div>
            ) : error && !weather ? (
                <div className="h-[60vh] flex flex-col items-center justify-center animate-enter text-center px-6">
                    <CloudLightning size={48} className="text-red-400 mb-4"/>
                    <p className="text-red-300 font-bold mb-2">{error}</p>
                    <button onClick={getLocation} className="px-6 py-2 bg-white/10 rounded-full text-sm font-bold mt-4 flex items-center gap-2">
                        <RefreshCw size={14}/> Retry
                    </button>
                </div>
            ) : weather && currentInfo ? (
                <div className="space-y-6 animate-enter pb-24">
                    
                    {/* Main Weather Orb Card */}
                    <div onClick={triggerHaptic} className="relative w-full aspect-[4/5] md:aspect-[2/1] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl">
                        
                        {/* Background & Orb Animation */}
                        <div className="absolute inset-0 bg-[#0f172a]"></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${currentInfo.gradient} opacity-20`}></div>
                        
                        {/* The ORB */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] flex items-center justify-center pointer-events-none">
                            <div className={clsx(
                                "w-[200px] h-[200px] rounded-full blur-[80px] animate-pulse transition-all duration-1000",
                                currentInfo.orb
                            )}></div>
                             <div className={clsx(
                                "absolute w-[120px] h-[120px] rounded-full blur-[50px] animate-pulse transition-all duration-1000 delay-75",
                                "bg-white/20"
                            )}></div>
                        </div>

                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-8">
                            
                            {/* Top Row */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-300 mb-1">
                                        <MapPin size={14} className="text-cyan-400"/>
                                        <span className="text-sm font-bold tracking-wide">{locationName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                                        <Clock size={12}/>
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                                <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2 bg-white/5 border border-white/10">
                                    <currentInfo.icon size={16} className={currentInfo.color}/>
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">{currentInfo.label}</span>
                                </div>
                            </div>

                            {/* Center Temp */}
                            <div className="flex flex-col items-center justify-center py-4">
                                <currentInfo.icon size={80} className={clsx("mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-float", currentInfo.color)}/>
                                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter drop-shadow-lg">
                                    {Math.round(weather.current.temperature_2m)}°
                                </h1>
                            </div>

                            {/* Bottom Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <WeatherStat icon={Wind} label="Wind" value={`${weather.current.wind_speed_10m} km/h`} color="text-cyan-300" />
                                <WeatherStat icon={Droplets} label="Humidity" value={`${weather.current.relative_humidity_2m}%`} color="text-blue-300" />
                                <WeatherStat icon={Navigation} label="Gusts" value={`${(weather.current.wind_speed_10m * 1.5).toFixed(1)} km`} color="text-indigo-300" />
                            </div>
                        </div>
                    </div>

                    {/* Hourly Forecast */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2 px-2"><Clock size={16} className="text-cyan-400"/> Hourly Forecast</h3>
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 px-2 -mx-2">
                            {weather.hourly.time.slice(0, 24).map((time: string, i: number) => {
                                const date = new Date(time);
                                const isCurrentHour = date.getHours() === new Date().getHours();
                                // Take every 2nd hour to save space or slice as needed
                                if (i % 2 !== 0) return null;
                                const hInfo = getWeatherInfo(weather.hourly.weather_code[i], weather.hourly.is_day[i]);
                                
                                return (
                                    <div key={i} className={clsx(
                                        "min-w-[70px] p-3 rounded-2xl flex flex-col items-center justify-center border transition-all shrink-0",
                                        isCurrentHour ? "bg-white/10 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "glass-panel bg-white/5 border-white/5"
                                    )}>
                                        <span className={clsx("text-xs font-bold mb-2", isCurrentHour ? "text-cyan-300" : "text-slate-400")}>
                                            {date.toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                                        </span>
                                        <hInfo.icon size={20} className={clsx("mb-2", hInfo.color)} />
                                        <span className="font-bold text-white">{Math.round(weather.hourly.temperature_2m[i])}°</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                
                    {/* Daily Forecast */}
                    <div className="glass-panel rounded-[2rem] p-5 border border-white/10">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar size={16} className="text-fuchsia-400"/> 3-Day Forecast</h3>
                        <div className="space-y-4">
                            {weather.daily.time.slice(0, 3).map((time: string, i: number) => {
                                const dInfo = getWeatherInfo(weather.daily.weather_code[i], 1); // Assume day icon for list
                                const date = new Date(time);
                                return (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl px-2 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`}>
                                                <dInfo.icon size={20} className={dInfo.color}/>
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">
                                                    {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString([], { weekday: 'long' })}
                                                </p>
                                                <p className="text-slate-500 text-xs font-medium">{dInfo.label}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-mono font-bold text-lg">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                                            <span className="text-slate-500 font-mono text-sm">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </SimpleView>
    );
};

const WeatherStat = ({ icon: Icon, label, value, color }: any) => (
    <div className="glass-panel p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
        <Icon size={16} className={clsx("opacity-80", color)} />
        <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
        <span className="text-sm font-bold text-white tracking-tight">{value}</span>
    </div>
);

export default WeatherView;
