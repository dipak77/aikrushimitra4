
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS, SCHEMES_DATA } from '../../constants';
import { UserCircle, MapPin, Wind, Droplets, Mic, ArrowUpRight, ScanLine, FlaskConical, Map as MapIcon, Landmark, Loader2, Sprout, Languages, Store, Sun, Leaf, ChevronRight, BellRing } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { MOCK_MARKET } from '../../data/mock';
import { clsx } from 'clsx';

// --- 1. AMBIENT BACKGROUND SYSTEM ---
const PlanetaryGlobe = () => {
    return (
        <div className="absolute top-[-10%] right-[-30%] md:right-0 md:left-1/2 md:-translate-x-1/2 w-[120vw] md:w-[60vw] aspect-square z-0 pointer-events-none opacity-60 md:opacity-80">
            <style>{`
                @keyframes globe-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .globe-grid {
                    background-image: radial-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px);
                    background-size: 30px 30px;
                    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
                }
            `}</style>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent blur-3xl"></div>
            <div className="absolute inset-10 rounded-full border border-white/5 bg-[#020617]/30 backdrop-blur-sm overflow-hidden shadow-[inset_0_0_60px_rgba(139,92,246,0.2)]">
                <div className="absolute inset-[-50%] globe-grid animate-[globe-spin_120s_linear_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-full mix-blend-overlay"></div>
            </div>
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-[globe-spin_60s_linear_infinite_reverse]"></div>
        </div>
    );
};

// --- 2. CROP VITALITY ORBIT (Advanced Visual) ---
const CropOrbitCard = ({ crop }: { crop: string }) => {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-[2.5rem] overflow-hidden group border border-white/5 bg-[#0f172a]/80 shadow-2xl">
            {/* Dark Void Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-[#020617] to-slate-950 z-0"></div>
            
            {/* --- ORBITAL ANIMATION CSS --- */}
            <style>{`
                @keyframes orbit { from { transform: rotate(0deg) translateX(80px) rotate(0deg); } to { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }
                @keyframes orbit-rev { from { transform: rotate(360deg) translateX(60px) rotate(-360deg); } to { transform: rotate(0deg) translateX(60px) rotate(0deg); } }
                @keyframes pulse-core { 0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); transform: scale(1); } 50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.6); transform: scale(1.05); } }
            `}</style>

            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Monitoring</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">{crop}</h3>
                        <p className="text-sm text-slate-400">Growth Stage: <span className="text-white font-bold">Flowering</span></p>
                    </div>
                </div>

                {/* CENTRAL ORB VISUALIZATION */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                    
                    {/* Orbit Ring 1 */}
                    <div className="absolute w-[220px] h-[220px] border border-white/5 rounded-full"></div>
                    {/* Orbit Ring 2 */}
                    <div className="absolute w-[160px] h-[160px] border border-dashed border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>

                    {/* The Core (Crop Soul) */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-[pulse-core_3s_ease-in-out_infinite] z-20">
                         <Sprout size={40} className="text-white drop-shadow-lg" />
                         <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
                    </div>

                    {/* Satellite: Water */}
                    <div className="absolute w-10 h-10 rounded-full bg-[#0f172a] border border-blue-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] z-30"
                         style={{ animation: 'orbit 8s linear infinite' }}>
                         <Droplets size={16} className="text-blue-400" />
                    </div>

                    {/* Satellite: Sun */}
                    <div className="absolute w-8 h-8 rounded-full bg-[#0f172a] border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] z-30"
                         style={{ animation: 'orbit-rev 12s linear infinite' }}>
                         <Sun size={14} className="text-amber-400" />
                    </div>

                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-2 gap-3 relative z-20">
                    <div className="bg-[#020617]/60 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Leaf size={16}/></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Health</p>
                            <p className="text-sm font-bold text-white">98% Good</p>
                        </div>
                    </div>
                    <div className="bg-[#020617]/60 backdrop-blur-md rounded-xl p-3 border border-blue-500/20 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Droplets size={16}/></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Water</p>
                            <p className="text-sm font-bold text-white">Optimal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. IMPRESSIVE ORB ACTION GRID ---
const OrbActionGrid = ({ t, onNavigate }: { t: any, onNavigate: (v: ViewState) => void }) => {
    const actions = [
         { 
             id: 'DISEASE_DETECTOR', 
             icon: ScanLine, 
             label: t.quick_action_doctor, 
             color: 'text-emerald-300', 
             bg: 'bg-emerald-500/20',
             orbColor: 'bg-emerald-500',
             gradient: 'from-emerald-500/10 via-emerald-500/5 to-slate-900/60'
         },
         { 
             id: 'SOIL', 
             icon: FlaskConical, 
             label: t.quick_action_soil, 
             color: 'text-amber-300', 
             bg: 'bg-amber-500/20',
             orbColor: 'bg-amber-500',
             gradient: 'from-amber-500/10 via-amber-500/5 to-slate-900/60'
         },
         { 
             id: 'AREA_CALCULATOR', 
             icon: MapIcon, 
             label: t.menu_area, 
             color: 'text-cyan-300', 
             bg: 'bg-cyan-500/20',
             orbColor: 'bg-cyan-500',
             gradient: 'from-cyan-500/10 via-cyan-500/5 to-slate-900/60'
         },
         { 
             id: 'VOICE_ASSISTANT', 
             icon: Mic, 
             label: t.menu_voice, 
             color: 'text-fuchsia-300', 
             bg: 'bg-fuchsia-500/20',
             orbColor: 'bg-fuchsia-500',
             gradient: 'from-fuchsia-500/10 via-fuchsia-500/5 to-slate-900/60'
         },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-24">
            <style>{`
                @keyframes scan-line {
                    0% { transform: translateY(-40px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(40px); opacity: 0; }
                }
                @keyframes bubble-rise {
                    0% { transform: translateY(20px) scale(0.5); opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
                }
            `}</style>
            
            {actions.map((item, i) => (
                <div key={item.id} onClick={() => { onNavigate(item.id as ViewState); triggerHaptic(); }} 
                     className={`relative h-44 rounded-[2.5rem] bg-gradient-to-br ${item.gradient} border border-white/5 overflow-hidden group cursor-pointer hover:border-white/20 transition-all active:scale-[0.98] shadow-lg flex flex-col items-center justify-center animate-enter backdrop-blur-sm`}
                     style={{animationDelay: `${300 + i * 50}ms`}}
                >
                    {/* Dynamic Orb Animation Background */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 ${item.orbColor}/20 rounded-full blur-[40px] group-hover:blur-[50px] transition-all duration-700`}></div>
                    
                    {/* Unique Animations per ID */}
                    {item.id === 'DISEASE_DETECTOR' && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                             <div className="w-full h-[2px] bg-emerald-400 absolute top-1/2 -translate-y-1/2 animate-[scan-line_3s_ease-in-out_infinite] shadow-[0_0_10px_#34d399]"></div>
                         </div>
                    )}
                    
                    {item.id === 'SOIL' && (
                         <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
                             <div className="absolute bottom-1/2 left-[40%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-[bubble-rise_4s_linear_infinite]"></div>
                             <div className="absolute bottom-1/2 left-[60%] w-2.5 h-2.5 bg-amber-400 rounded-full animate-[bubble-rise_5s_linear_infinite_1s]"></div>
                         </div>
                    )}

                    {item.id === 'AREA_CALCULATOR' && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                             <div className="w-24 h-24 border border-dashed border-cyan-400/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                             <div className="absolute w-full h-[1px] bg-cyan-400/30 rotate-45"></div>
                             <div className="absolute w-full h-[1px] bg-cyan-400/30 -rotate-45"></div>
                         </div>
                    )}

                    {item.id === 'VOICE_ASSISTANT' && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                             <div className="w-20 h-20 border border-fuchsia-400/50 rounded-full animate-[ping_3s_linear_infinite]"></div>
                             <div className="w-16 h-16 border border-fuchsia-400/30 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
                         </div>
                    )}
                    
                    {/* Icon Container with Glass Effect */}
                    <div className={`relative z-10 w-16 h-16 rounded-3xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10 backdrop-blur-md ring-1 ring-white/5`}>
                        <item.icon size={28} className={item.color} strokeWidth={2} />
                    </div>
                    
                    {/* Label */}
                    <span className="relative z-10 text-sm font-bold text-slate-200 group-hover:text-white transition-colors tracking-wide">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

// --- 4. GOVERNMENT SCHEMES BANNER (Holographic Gold) ---
const SchemesBanner = ({ count, onClick, t }: { count: number, onClick: () => void, t: any }) => {
    return (
        <div onClick={() => { onClick(); triggerHaptic(); }} className="relative w-full overflow-hidden rounded-[2rem] cursor-pointer group animate-enter delay-200 shadow-2xl shadow-orange-900/20 border border-white/5">
             {/* Background Gradient */}
             <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
             
             {/* Holographic Shine Effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>

             <div className="relative z-10 p-6 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                         <Landmark size={32} className="text-white drop-shadow-md" />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-white leading-none mb-2">{t.govt_schemes}</h3>
                         <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm w-fit border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-amber-100 text-xs font-bold uppercase tracking-wide">{count} Active Schemes</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/10 shadow-lg">
                     <ChevronRight size={28} className="text-white" />
                 </div>
             </div>
        </div>
    );
};

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
  const t = TRANSLATIONS[lang];
  const schemesCount = (SCHEMES_DATA[lang as Language] || []).length;

  const [weatherData, setWeatherData] = useState<any>(null);
  const [locationName, setLocationName] = useState<string>(user.village);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const cycleLanguage = () => {
      triggerHaptic();
      if (lang === 'mr') setLang('hi');
      else if (lang === 'hi') setLang('en');
      else setLang('mr');
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number) => {
        try {
            try {
                const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const locData = await locRes.json();
                const city = locData.locality || locData.city || locData.principalSubdivision || user.village;
                setLocationName(city);
            } catch(e) {}

            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            const wData = await wRes.json();
            setWeatherData(wData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingWeather(false);
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(19.75, 75.71)
        );
    } else {
        fetchWeather(19.75, 75.71);
    }
  }, [user.village]);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar pb-32 lg:pl-28 lg:pr-6 overscroll-y-contain scroll-smooth relative bg-[#020617]">
      
      {/* BACKGROUND LAYERS */}
      <div className="fixed inset-0 bg-[#020617] z-[-1]"></div>
      <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-[#0f172a] to-transparent opacity-50 z-[-1]"></div>
      <PlanetaryGlobe />

      <div className="w-full max-w-7xl mx-auto px-4 py-6 pt-safe-top relative z-10 space-y-6">
        
        {/* PREMIUM HEADER BRANDING */}
        <header className="flex justify-between items-center animate-enter py-2">
           <div className="flex items-center gap-4">
              {/* 3D ORBITAL LOGO */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 perspective-1000 group">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[30px] rounded-full group-hover:bg-cyan-400/30 transition-all duration-700"></div>

                  {/* Rotating Rings */}
                  <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-2 rounded-full border border-blue-400/30 animate-[spin_15s_linear_infinite_reverse]"></div>

                  {/* Central Core Sphere */}
                  <div className="absolute inset-0 m-auto w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center overflow-hidden border border-white/20">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                      <span className="font-black text-[10px] md:text-xs text-white z-10 tracking-tighter">AI</span>
                  </div>

                  {/* Orbiting Satellite */}
                  <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                  </div>
              </div>

              {/* CINEMATIC TYPOGRAPHY */}
              <div>
                 <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] filter">
                    AI <span className="text-white">KRUSHI</span>
                 </h1>
                 <p className="text-[9px] md:text-[10px] font-bold text-cyan-400 uppercase tracking-[0.25em] md:tracking-[0.3em] ml-1 mt-1 drop-shadow-md">
                    Smart Farming
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
               <button onClick={cycleLanguage} className="h-9 px-3 rounded-lg bg-[#1e293b]/80 border border-white/10 flex items-center gap-2 hover:bg-[#334155] transition-all">
                  <Languages size={14} className="text-slate-300" />
                  <span className="text-xs font-bold text-white uppercase">{lang === 'mr' ? 'मराठी' : 'ENG'}</span>
               </button>
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] cursor-pointer shadow-lg shadow-cyan-500/20" onClick={() => onNavigate('PROFILE')}>
                   <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                       <UserCircle size={20} className="text-white" />
                   </div>
               </div>
           </div>
        </header>

        {/* HERO: WEATHER PRISM */}
        <div className="animate-enter delay-100">
             <div onClick={() => { onNavigate('WEATHER'); triggerHaptic(); }} className="w-full p-8 rounded-[2.5rem] bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-2xl cursor-pointer hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    {/* Dynamic Ambient Background based on temperature */}
                    <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-start gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-white/5 backdrop-blur-md">
                                <Wind size={32} />
                             </div>
                             <div>
                                 <div className="flex items-center gap-2">
                                     <h2 className="text-xl font-black text-white leading-none">Weather</h2>
                                     <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/50">LIVE</span>
                                 </div>
                                 <p className="text-sm text-slate-400 font-medium mt-1 flex items-center gap-1">
                                    <MapPin size={12}/> {locationName}
                                 </p>
                             </div>
                        </div>

                        {loadingWeather ? <Loader2 className="animate-spin text-white/50"/> : (
                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div>
                                    <h3 className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                                        {Math.round(weatherData?.current?.temperature_2m || 0)}°
                                    </h3>
                                    <p className="text-xs text-blue-300 font-bold mt-1 text-center uppercase tracking-widest">
                                       {weatherData?.current?.weather_code <= 3 ? 'Sunny' : weatherData?.current?.weather_code < 50 ? 'Cloudy' : 'Rainy'}
                                    </p>
                                </div>
                                <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Wind size={14}/>
                                        <span className="text-sm font-bold">{weatherData?.current?.wind_speed_10m} km/h</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Droplets size={14}/>
                                        <span className="text-sm font-bold">{weatherData?.current?.relative_humidity_2m}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
             </div>
        </div>

        {/* ROW 2: CROP ORB & MARKET PULSE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter delay-200">
            
            {/* 1. Crop Vitality Orb (Centerpiece) */}
            <div className="lg:col-span-2">
                <CropOrbitCard crop={user.crop} />
            </div>

            {/* 2. Market Pulse & Schemes Short */}
            <div className="flex flex-col gap-6">
                
                {/* Market Ticker */}
                <div onClick={() => { onNavigate('MARKET'); triggerHaptic(); }} className="flex-1 p-6 rounded-[2.5rem] bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 shadow-lg cursor-pointer hover:border-amber-500/30 transition-all group relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start relative z-10 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <Store size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors"/>
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-3">{t.menu_market}</h3>
                        <div className="space-y-2">
                            {MOCK_MARKET.slice(0, 2).map((m, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-200">{m.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono font-bold text-white">₹{m.price}</span>
                                        <span className={`text-[10px] ${m.trend.includes('+')?'text-green-400':'text-red-400'}`}>{m.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- SCHEMES BANNER --- */}
                <SchemesBanner count={schemesCount} onClick={() => onNavigate('SCHEMES')} t={t} />

            </div>
        </div>

        {/* ROW 3: IMPRESSIVE ACTION GRID */}
        <OrbActionGrid t={t} onNavigate={onNavigate} />

      </div>
    </div>
  );
};

export default Dashboard;
