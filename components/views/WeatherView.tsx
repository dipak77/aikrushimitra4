import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { 
  ArrowLeft, 
  MapPin, 
  Wind, 
  Droplets, 
  Sun, 
  Clock, 
  Eye, 
  Sparkles, 
  Moon, 
  Thermometer, 
  Sunrise, 
  Sunset,
  Navigation,
  CloudLightning,
  CloudRain,
  Cloud,
  CloudFog,
  Snowflake,
  Calendar
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { fetchWeather, getPlaceName, DEFAULT_COORDS, WeatherData, MOCK_WEATHER } from '../../services/weatherService';
import { DASH_TEXT, wxTypeFrom, mapToAtmosphericIconKind } from '../dashboard/weather/utils';
import { WeatherAtmosphericIcon } from '../dashboard/weather/WeatherIcons';

const WEATHER_V_TEXT: Record<Language, any> = {
    mr: {
        hourly: "तासाभराचा अंदाज",
        daily: "७ दिवसांचा अंदाज",
        insight_title: "AI कृषी सल्ला",
        visibility: "दृश्यमानता",
        uv: "UV इंडेक्स",
        moon: "चंद्राची कला",
        km: "किमी",
        high: "उच्च",
        low: "कमी",
        waxing: "शुक्ल पक्ष",
        spraying_tip: "फवारणीसाठी योग्य वेळ आहे. दुपारी ४ वाजेपर्यंत काम उरका.",
        night_tip: "रात्रीची वेळ आहे. थंडी वाढू शकते, पिकांची काळजी घ्या.",
        sunrise: "सूर्योदय",
        sunset: "सूर्यास्त",
        feels_like: "जाणवणारे तापमान",
        humidity: "आद्रता",
        wind: "वारा",
        pressure: "दाब"
    },
    hi: {
        hourly: "घंटेवार पूर्वानुमान",
        daily: "7 दिनों का पूर्वानुमान",
        insight_title: "AI कृषि सलाह",
        visibility: "दृश्यता",
        uv: "UV इंडेक्स",
        moon: "चंद्रमा की स्थिति",
        km: "किमी",
        high: "अधिक",
        low: "कम",
        waxing: "शुक्ल पक्ष",
        spraying_tip: "छिड़काव के लिए अच्छा समय है। शाम 4 बजे तक काम पूरा करें।",
        night_tip: "रात का समय है। ठंड बढ़ सकती है, फसलों का ध्यान रखें।",
        sunrise: "सूर्योदय",
        sunset: "सूर्यास्त",
        feels_like: "महसूस होने वाला तापमान",
        humidity: "नमी",
        wind: "हवा",
        pressure: "दबाव"
    },
    en: {
        hourly: "Hourly Forecast",
        daily: "7-Day Forecast",
        insight_title: "AI Agri-Insight",
        visibility: "Visibility",
        uv: "UV Index",
        moon: "Moon Phase",
        km: "km",
        high: "H",
        low: "L",
        waxing: "Waxing",
        spraying_tip: "Good conditions for spraying. Finish tasks before 4 PM.",
        night_tip: "Night time. Temp may drop, protect young crops.",
        sunrise: "Sunrise",
        sunset: "Sunset",
        feels_like: "Feels Like",
        humidity: "Humidity",
        wind: "Wind",
        pressure: "Pressure"
    }
};

const MetricCard = ({ icon: Icon, label, value, unit, color }: { icon: any, label: string, value: string | number, unit?: string, color: string }) => (
    <div className="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all group">
        <div className="flex items-center gap-2 mb-2">
            <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                <Icon size={16} />
            </div>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-xl font-black text-white">
            {value} {unit && <span className="text-xs font-medium text-white/40">{unit}</span>}
        </p>
    </div>
);

const WeatherView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const vt = WEATHER_V_TEXT[lang];
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(MOCK_WEATHER);
    const [locationName, setLocationName] = useState('Locating...');

    useEffect(() => {
        const load = async () => {
            let lat = DEFAULT_COORDS.lat;
            let lng = DEFAULT_COORDS.lng;

            const getCoords = (): Promise<{lat: number, lng: number}> => {
                return new Promise((resolve) => {
                    if (!navigator.geolocation) return resolve(DEFAULT_COORDS);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => resolve(DEFAULT_COORDS),
                        { timeout: 5000 }
                    );
                });
            };

            try {
                const coords = await getCoords();
                const [data, name] = await Promise.all([
                    fetchWeather(coords.lat, coords.lng),
                    getPlaceName(coords.lat, coords.lng, lang)
                ]);
                setWeather(data);
                setLocationName(name);
            } catch (err) {
                console.error('Failed to fetch weather', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [lang]);

    const isDay = weather?.current?.is_day !== 0;
    const code = weather?.current?.weather_code || 0;
    const wind = weather?.current?.wind_speed_10m || 0;
    
    const iconKind = mapToAtmosphericIconKind({ code, isDay, windKmh: wind });
    const weatherDesc = DASH_TEXT[lang]?.weather_desc?.[code] || "Weather";

    const chartData = useMemo(() => {
        if (!weather) return [];
        return weather.hourly.time.slice(0, 12).map((time, i) => ({
            time: new Date(time).getHours() + ':00',
            temp: Math.round(weather.hourly.temperature_2m[i]),
        }));
    }, [weather]);

    if (loading) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#020617] gap-4">
             <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin-slow"></div>
             </div>
             <p className="text-emerald-500/70 text-xs font-bold tracking-widest uppercase animate-pulse">Syncing Atmosphere...</p>
        </div>
    );

    if (!weather) return null;

    return (
        <div className="h-full w-full flex flex-col lg:pl-32 relative overflow-hidden text-white bg-[#020617]">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <div className={clsx(
                    "absolute inset-0 transition-all duration-1000",
                    isDay 
                        ? "bg-gradient-to-b from-blue-600/20 via-indigo-900/40 to-[#020617]" 
                        : "bg-gradient-to-b from-indigo-950/30 via-slate-900/50 to-[#020617]"
                )} />
                
                {/* Animated Orbs */}
                <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <div className="pt-safe-top px-6 py-4 flex items-center justify-between z-20 relative">
                <button 
                    onClick={() => { onBack(); triggerHaptic(); }} 
                    className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 backdrop-blur-xl shadow-lg"
                >
                    <ArrowLeft size={22}/>
                </button>
                
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <MapPin size={14} className="text-emerald-400"/>
                        <span className="text-white font-bold text-sm tracking-wide">{locationName}</span>
                    </div>
                </div>

                <div className="w-11 h-11" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32 z-20 relative">
                {/* Current Weather Hero */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
                        <WeatherAtmosphericIcon kind={iconKind} size={220} animated={true} />
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-start justify-center">
                            <h1 className="text-[8rem] leading-none font-extralight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
                                {Math.round(weather.current.temperature_2m)}
                            </h1>
                            <span className="text-4xl font-light text-emerald-400 mt-6">°</span>
                        </div>
                        
                        <p className="text-emerald-400 text-xl font-bold tracking-wide uppercase -mt-2">
                            {weatherDesc}
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Sunrise size={14} className="text-amber-400" />
                                <span className="text-xs font-bold text-white/70">{new Date(weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Sunset size={14} className="text-orange-400" />
                                <span className="text-xs font-bold text-white/70">{new Date(weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insight Section */}
                <div className="glass-panel rounded-[2.5rem] p-6 mb-8 border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-1">{vt.insight_title}</h3>
                            <p className="text-white/80 text-sm leading-relaxed font-medium">
                                {isDay ? vt.spraying_tip : vt.night_tip}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hourly Chart */}
                <div className="glass-panel rounded-[2.5rem] p-6 mb-8 border border-white/5 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                <Clock size={16} className="text-emerald-400"/>
                            </div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider">{vt.hourly}</h3>
                        </div>
                    </div>
                    
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(255,255,255,0.1)" 
                                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700}} 
                                    tickLine={false} 
                                    axisLine={false}
                                    interval={2}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="temp" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorTemp)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <MetricCard 
                        icon={Wind} 
                        label={vt.wind} 
                        value={Math.round(weather.current.wind_speed_10m)} 
                        unit="km/h" 
                        color="bg-blue-500/20 text-blue-400" 
                    />
                    <MetricCard 
                        icon={Droplets} 
                        label={vt.humidity} 
                        value={weather.current.relative_humidity_2m} 
                        unit="%" 
                        color="bg-cyan-500/20 text-cyan-400" 
                    />
                    <MetricCard 
                        icon={Thermometer} 
                        label={vt.feels_like} 
                        value={Math.round(weather.current.apparent_temperature)} 
                        unit="°" 
                        color="bg-orange-500/20 text-orange-400" 
                    />
                    <MetricCard 
                        icon={Sun} 
                        label={vt.uv} 
                        value={weather.current.uv_index || 0} 
                        color="bg-yellow-500/20 text-yellow-400" 
                    />
                    <MetricCard 
                        icon={Eye} 
                        label={vt.visibility} 
                        value={Math.round(weather.current.visibility / 1000)} 
                        unit="km" 
                        color="bg-purple-500/20 text-purple-400" 
                    />
                    <MetricCard 
                        icon={Navigation} 
                        label={vt.pressure} 
                        value="1012" 
                        unit="hPa" 
                        color="bg-emerald-500/20 text-emerald-400" 
                    />
                </div>

                {/* 7-Day Forecast */}
                <div className="glass-panel rounded-[2.5rem] p-6 mb-8 border border-white/5 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Calendar size={16} className="text-emerald-400"/>
                        </div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">{vt.daily}</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {weather.daily.time.slice(1, 7).map((date, i) => {
                            const dayCode = weather.daily.weather_code[i+1];
                            const dayType = wxTypeFrom(dayCode);
                            const dayName = new Date(date).toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
                            
                            return (
                                <div key={date} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-12 text-sm font-bold text-white/70">{dayName}</span>
                                    
                                    <div className="flex items-center gap-3">
                                        {dayType === 'storm' && <CloudLightning size={20} className="text-purple-400" />}
                                        {dayType === 'rain' && <CloudRain size={20} className="text-blue-400" />}
                                        {dayType === 'cloudy' && <Cloud size={20} className="text-slate-400" />}
                                        {dayType === 'clear' && <Sun size={20} className="text-amber-400" />}
                                        {dayType === 'fog' && <CloudFog size={20} className="text-slate-300" />}
                                        {dayType === 'snow' && <Snowflake size={20} className="text-cyan-200" />}
                                        <span className="text-xs font-bold text-white/50 capitalize">{DASH_TEXT[lang]?.weather_desc?.[dayCode] || "Weather"}</span>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-[60px] justify-end">
                                        <span className="text-sm font-black text-white">{Math.round(weather.daily.temperature_2m_max[i+1])}°</span>
                                        <span className="text-sm font-bold text-white/30">{Math.round(weather.daily.temperature_2m_min[i+1])}°</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherView;
