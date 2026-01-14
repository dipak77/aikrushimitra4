
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { UserCircle, MapPin, Wind, Droplets, Mic, ArrowUpRight, ScanLine, FlaskConical, Map as MapIcon, Landmark, Loader2, Sprout, Languages, Store, Sun, Moon, CloudSun, CloudMoon, CloudRain, CloudLightning, Leaf, ChevronRight, BellRing, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { MOCK_MARKET } from '../../data/mock';
import { clsx } from 'clsx';

// --- 1. AMBIENT BACKGROUND SYSTEM ---
const PlanetaryAmbient = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
            <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
    );
};

// --- 2. WEATHER VISUALS ---
const DashboardWeatherEffects = ({ code, isDay }: { code: number, isDay: boolean }) => {
    let type: 'clear' | 'cloudy' | 'rain' | 'storm' = 'clear';
    if (code >= 95) type = 'storm';
    else if (code >= 51) type = 'rain';
    else if (code >= 1) type = 'cloudy';

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[2rem]">
            {/* Starry Night */}
            {!isDay && (
                <div className="absolute inset-0">
                    {[...Array(30)].map((_, i) => (
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
                    {type === 'clear' && <div className="absolute top-8 right-8 w-24 h-24 bg-blue-100/10 rounded-full blur-[40px]"></div>}
                </div>
            )}

            {/* Sunny Day */}
            {isDay && type === 'clear' && (
                <>
                    <div className="absolute top-[-30%] right-[-30%] w-[120%] h-[120%] bg-amber-500/20 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.2),transparent)] animate-[spin_60s_linear_infinite] opacity-40"></div>
                </>
            )}

            {/* Rain/Storm */}
            {(type === 'rain' || type === 'storm') && (
                <div className="absolute inset-0 z-10 opacity-40">
                     <style>{`@keyframes rain-fall { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
                     {[...Array(15)].map((_, i) => (
                         <div key={i} className="absolute bg-blue-200 w-[1px] h-10 rounded-full"
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
        </div>
    );
};

const WeatherIconOrb = ({ code, isDay }: { code: number, isDay: boolean }) => {
    let Icon = Sun;
    let themeClass = 'from-amber-400 to-orange-500';
    
    if (code >= 95) { Icon = CloudLightning; themeClass = 'from-purple-500 to-indigo-600'; }
    else if (code >= 51) { Icon = CloudRain; themeClass = 'from-blue-500 to-cyan-500'; }
    else if (code > 3) { Icon = isDay ? CloudSun : CloudMoon; themeClass = isDay ? 'from-orange-400 to-blue-400' : 'from-slate-500 to-indigo-500'; }
    else { Icon = isDay ? Sun : Moon; themeClass = isDay ? 'from-amber-400 to-yellow-500' : 'from-slate-400 to-slate-600'; }

    return (
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0 group">
             <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${themeClass} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700`}></div>
             
             {/* Orbital Rings */}
             <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
             <div className="absolute inset-2 border border-dashed border-white/20 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>

             <div className={`relative z-10 w-14 h-14 rounded-full bg-gradient-to-br ${themeClass} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)] text-white ring-2 ring-white/10`}>
                 <Icon size={28} strokeWidth={2.5} />
             </div>
        </div>
    );
};

// --- 3. UI COMPONENTS ---

const GlassCard = ({ children, className, onClick, delay = 0, noHover = false }: any) => (
    <div 
        onClick={onClick}
        className={clsx(
            "relative overflow-hidden rounded-[2rem] bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] animate-enter",
            !noHover && "cursor-pointer transition-all duration-300 hover:bg-[#0f172a]/60 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] active:scale-[0.98]",
            className
        )}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Inner Highlight Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
        {children}
    </div>
);

const BentoAction = ({ icon: Icon, label, desc, color, onClick, delay }: any) => (
    <GlassCard onClick={() => { onClick(); triggerHaptic(); }} delay={delay} className="p-5 flex flex-col justify-between h-full min-h-[160px] group border-t border-white/10">
        <div className="flex justify-between items-start">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500 ring-1 ring-white/10", color)}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={16} className="text-white/70" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-cyan-200 transition-colors">{label}</h3>
            <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
    </GlassCard>
);

// --- 4. MAIN DASHBOARD ---

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
    const t = TRANSLATIONS[lang];
    const [weather, setWeather] = useState<any>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
             try {
                // Simulating coordinates for Satara
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.75&longitude=75.71&current=temperature_2m,weather_code,is_day,wind_speed_10m');
                const data = await res.json();
                setWeather(data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoadingWeather(false);
             }
        };
        fetchWeather();
    }, []);

    const toggleLang = () => {
        const next = lang === 'mr' ? 'hi' : lang === 'hi' ? 'en' : 'mr';
        setLang(next);
        triggerHaptic();
    };

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-[#020617] text-slate-100 lg:pl-28 selection:bg-cyan-500/30">
            <PlanetaryAmbient />
            
            {/* --- PREMIUM HEADER --- */}
            <header className="sticky top-0 z-50 pt-safe-top px-6 pb-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between transition-all duration-300">
                 
                 {/* BRANDING: LOGO + APP NAME */}
                 <div className="flex items-center gap-4">
                     {/* 3D Animated Logo */}
                     <div className="relative w-12 h-12 flex-shrink-0 group cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
                         <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-all duration-500"></div>
                         <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-1.5 rounded-full border border-blue-400/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                         <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center ring-2 ring-black/50">
                             <Sprout size={16} className="text-white drop-shadow-md" fill="currentColor" />
                         </div>
                     </div>

                     {/* Text Branding */}
                     <div className="hidden min-[360px]:block">
                         <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                            AI KRUSHI
                         </h1>
                         <p className="text-[9px] md:text-[10px] font-bold text-cyan-500 uppercase tracking-[0.25em] ml-0.5">
                            Mitra • {lang === 'mr' ? 'स्मार्ट शेती' : 'Smart Farming'}
                         </p>
                     </div>
                 </div>

                 {/* RIGHT ACTIONS */}
                 <div className="flex items-center gap-3">
                     <button onClick={toggleLang} className="h-10 px-4 rounded-full bg-[#1e293b]/50 border border-white/10 hover:bg-[#334155] active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
                         <Languages size={16} className="text-slate-300"/>
                         <span className="text-xs font-bold uppercase text-white tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'ENG'}</span>
                     </button>
                     
                     {/* User Profile Avatar */}
                     <div onClick={() => onNavigate('PROFILE')} className="relative cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
                             <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                                 <span className="text-sm font-black text-white">{user.name.charAt(0)}</span>
                             </div>
                         </div>
                         <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#020617] animate-pulse"></div>
                     </div>
                 </div>
            </header>

            {/* --- BENTO GRID LAYOUT --- */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 pb-32 max-w-7xl mx-auto">
                
                {/* 1. WEATHER WIDGET (Hero - Large) */}
                <div className="col-span-1 md:col-span-12 lg:col-span-8">
                    <GlassCard 
                        onClick={() => { onNavigate('WEATHER'); triggerHaptic(); }}
                        className={clsx(
                            "w-full h-full min-h-[260px] p-0 relative group border-t border-white/20",
                            weather?.current?.is_day === 0 ? "bg-slate-900/60" : "bg-blue-600/20"
                        )}
                    >
                        {/* Dynamic Background */}
                        <div className={clsx("absolute inset-0 transition-opacity duration-1000", weather?.current?.is_day === 0 ? "opacity-100" : "opacity-30")}>
                           <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black"></div>
                        </div>
                        {weather?.current?.is_day !== 0 && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 opacity-100"></div>
                        )}
                        
                        <DashboardWeatherEffects code={weather?.current?.weather_code || 0} isDay={weather?.current?.is_day !== 0} />

                        <div className="absolute inset-0 p-8 flex justify-between items-center z-20">
                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 mb-4 shadow-lg">
                                        <MapPin size={12} className="text-cyan-300"/>
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">{user.village}, {user.district}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <h2 className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                                            {loadingWeather ? "--" : Math.round(weather.current.temperature_2m)}°
                                        </h2>
                                    </div>
                                    <p className="text-lg text-white/90 font-medium mt-1 pl-2 tracking-wide drop-shadow-md">{t.weather_subtitle}</p>
                                </div>
                                <div className="flex gap-6 pl-2">
                                    <div className="flex items-center gap-2 text-white/80 bg-black/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                                        <Wind size={16} className="text-cyan-200"/>
                                        <span className="text-sm font-bold">{loadingWeather ? "-" : weather.current.wind_speed_10m} km/h</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80 bg-black/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                                        <Droplets size={16} className="text-blue-200"/>
                                        <span className="text-sm font-bold">45%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-full flex flex-col justify-center items-center relative z-10">
                                <div className="scale-125 hover:scale-150 transition-transform duration-500">
                                    <WeatherIconOrb code={weather?.current?.weather_code || 0} isDay={weather?.current?.is_day !== 0} />
                                </div>
                                <div className="mt-8 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider group-hover:bg-white/20 transition-colors shadow-xl">
                                    View Forecast
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 2. VOICE ASSISTANT (Tall) */}
                <div className="col-span-1 md:col-span-6 lg:col-span-4">
                     <GlassCard 
                        onClick={() => { onNavigate('VOICE_ASSISTANT'); triggerHaptic(); }}
                        className="h-full min-h-[260px] relative overflow-hidden group border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20"
                        delay={100}
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-700/10 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                            <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-5 relative group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 animate-pulse"></div>
                                <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                                <Mic size={40} className="text-cyan-300 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"/>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{t.voice_title}</h3>
                            <p className="text-sm text-cyan-100/70 leading-relaxed max-w-[200px] mb-4">{t.voice_desc}</p>
                            
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/50 px-5 py-2.5 rounded-full border border-cyan-500/30 shadow-lg group-hover:bg-cyan-900/50 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                Tap to Speak
                            </div>
                        </div>
                     </GlassCard>
                </div>

                {/* 3. QUICK ACTIONS (2x2 Grid) */}
                <div className="col-span-1 md:col-span-6 lg:col-span-4 grid grid-cols-2 gap-4">
                    <BentoAction 
                        icon={ScanLine} 
                        label={t.quick_action_doctor} 
                        desc={t.quick_action_doctor_desc} 
                        color="bg-emerald-500" 
                        onClick={() => onNavigate('DISEASE_DETECTOR')} 
                        delay={200}
                    />
                    <BentoAction 
                        icon={Store} 
                        label={t.quick_action_market} 
                        desc={t.quick_action_market_desc} 
                        color="bg-amber-500" 
                        onClick={() => onNavigate('MARKET')} 
                        delay={250}
                    />
                    <BentoAction 
                        icon={FlaskConical} 
                        label={t.quick_action_soil} 
                        desc="Health Card" 
                        color="bg-blue-500" 
                        onClick={() => onNavigate('SOIL')} 
                        delay={300}
                    />
                    <BentoAction 
                        icon={TrendingUp} 
                        label={t.menu_yield} 
                        desc="Predict" 
                        color="bg-purple-500" 
                        onClick={() => onNavigate('YIELD')} 
                        delay={350}
                    />
                </div>

                {/* 4. MARKET TICKER (Wide) */}
                <div className="col-span-1 md:col-span-6 lg:col-span-8">
                    <GlassCard onClick={() => onNavigate('MARKET')} className="p-6 h-full flex flex-col justify-center bg-gradient-to-r from-amber-900/10 to-orange-900/10" delay={400}>
                         <div className="flex justify-between items-center mb-5">
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                     <Store size={24}/>
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-white text-lg">{t.market_title}</h3>
                                     <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider">Live Updates • APMC Satara</p>
                                 </div>
                             </div>
                             <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-bold hover:bg-white/10 transition-colors flex items-center gap-1 group/btn">
                                 View All <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform"/>
                             </div>
                         </div>
                         
                         <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 mask-image-gradient-right">
                             {MOCK_MARKET.slice(0, 5).map((m, i) => (
                                 <div key={i} className="min-w-[150px] p-4 rounded-2xl bg-[#0f172a]/40 border border-white/5 hover:bg-white/5 transition-colors group/card">
                                     <div className="flex justify-between items-start mb-3">
                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.name}</span>
                                         <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", m.trend.includes('+') ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                                             {m.trend}
                                         </span>
                                     </div>
                                     <div className="text-2xl font-mono font-bold text-white group-hover/card:text-amber-400 transition-colors">₹{m.price}</div>
                                 </div>
                             ))}
                         </div>
                    </GlassCard>
                </div>

                {/* 5. SCHEMES (Wide) */}
                <div className="col-span-1 md:col-span-6 lg:col-span-4">
                    <GlassCard onClick={() => onNavigate('SCHEMES')} className="p-6 h-full relative overflow-hidden group bg-gradient-to-br from-emerald-900/20 to-teal-900/20" delay={450}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Landmark size={24}/>
                                 </div>
                                 <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase border border-white/5">Active</span>
                             </div>
                             
                             <div>
                                 <h3 className="text-xl font-black text-white mb-1 leading-none group-hover:text-emerald-300 transition-colors">{t.govt_schemes}</h3>
                                 <p className="text-sm text-emerald-100/60 mb-4">4 New schemes available</p>
                                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full w-2/3 bg-emerald-500 rounded-full"></div>
                                 </div>
                             </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 6. AREA CALC (Wide) */}
                <div className="col-span-1 md:col-span-12 lg:col-span-4">
                     <GlassCard onClick={() => onNavigate('AREA_CALCULATOR')} className="p-5 h-full flex items-center gap-5 group border-indigo-500/20" delay={500}>
                         <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                             <MapIcon size={32}/>
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{t.menu_area}</h3>
                             <p className="text-sm text-slate-400">Satellite Measurement</p>
                         </div>
                         <div className="ml-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                             <ChevronRight size={20} className="text-white/50 group-hover:text-white"/>
                         </div>
                     </GlassCard>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
