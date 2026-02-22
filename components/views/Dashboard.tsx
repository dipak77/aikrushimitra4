import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ScanLine, FlaskConical, Map as MapIcon, Landmark, Languages, Leaf, Shield, ShoppingCart, BookOpen } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

import { fetchWeather, getPlaceName, DEFAULT_COORDS, MOCK_WEATHER } from '../../services/weatherService';
import { DASH_TEXT } from '../dashboard/constants';
import { NewsTicker } from '../dashboard/NewsTicker';
import { AppHeaderLogo } from '../dashboard/AppHeaderLogo';
import { DynamicGreeting } from '../dashboard/DynamicGreeting';
import { SmartBanner } from '../dashboard/SmartBanner';
import { WeatherWidget } from '../dashboard/WeatherWidget';
import { MarketWidget } from '../dashboard/MarketWidget';
import { CalendarWidget } from '../dashboard/CalendarWidget';
import { VoiceWidget } from '../dashboard/VoiceWidget';
import { FeatureCard, IllustrativeBanner } from '../dashboard/ActionCards';

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
    const t = TRANSLATIONS[lang];
    const txt = DASH_TEXT[lang];
    const [weather, setWeather] = useState<any>(MOCK_WEATHER);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [liveLocation, setLiveLocation] = useState<string>(user.village || "Locating...");

    useEffect(() => {
        const loadWeather = async () => {
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
                lat = coords.lat;
                lng = coords.lng;

                // Parallel fetch for speed
                const [weatherData, name] = await Promise.all([
                    fetchWeather(lat, lng),
                    getPlaceName(lat, lng, lang)
                ]);

                setWeather(weatherData);
                setLiveLocation(name);
            } catch (e) {
                console.error("Weather load error", e);
                // Fallback to default if everything fails
                try {
                    const fallback = await fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
                    setWeather(fallback);
                } catch (err) {
                    console.error("Critical weather failure");
                }
            } finally {
                setLoadingWeather(false);
            }
        };

        loadWeather();
    }, [lang]);

    const toggleLang = () => {
        const next = lang === 'mr' ? 'hi' : lang === 'hi' ? 'en' : 'mr';
        setLang(next);
        triggerHaptic();
    };

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-transparent text-slate-100 lg:pl-24 selection:bg-yellow-500/30 flex flex-col relative">
            
            {/* --- INJECT KEYFRAMES FOR PREMIUM ANIMATIONS --- */}
            <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-100%); }
                }
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes orbPulse {
                  0%, 100% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(1.1); opacity: 0.9; }
                }
                @keyframes floatSlow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes sunRays {
                  0%, 100% { opacity: 0.5; height: 16px; }
                  50% { opacity: 1; height: 24px; }
                }
                @keyframes rainDrop {
                  0% { transform: translateY(-10px) rotate(15deg); opacity: 0; }
                  50% { opacity: 1; }
                  100% { transform: translateY(20px) rotate(15deg); opacity: 0; }
                }
                @keyframes twinkle {
                  0%, 100% { opacity: 0.2; transform: scale(0.8); }
                  50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes lightning {
                  0%, 90%, 100% { opacity: 0; }
                  92%, 94% { opacity: 1; filter: brightness(2); }
                }
            `}</style>

            {/* 1. NEWS TICKER (Top) */}
            <NewsTicker lang={lang} />
            
            {/* 2. HEADER (Slim & Sticky) */}
            <div className="pt-4 px-4 md:px-6 pb-3 flex items-center justify-between z-50 gap-4 sticky top-0 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 transition-all">
                 {/* LEFT: Branding */}
                 <AppHeaderLogo />

                 {/* RIGHT: Actions */}
                 <div className="flex items-center gap-3">
                     <button onClick={toggleLang} className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
                         <Languages size={16} className="text-slate-300"/>
                         <span className="hidden md:block text-[10px] font-bold uppercase text-white tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'ENG'}</span>
                     </button>

                     {/* Analytics / Admin */}
                     <button 
                        onClick={() => onNavigate('ADMIN')} 
                        className="hidden sm:flex w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all items-center justify-center backdrop-blur-md group"
                        title="Analytics"
                     >
                         <Shield size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors"/>
                     </button>
                     
                     {/* User Profile */}
                     <div onClick={() => onNavigate('PROFILE')} className="relative cursor-pointer group shrink-0 ml-1">
                         <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[1.5px] shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
                              <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                  {user.picture ? (
                                      <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                      <span className="text-sm font-black text-white">{user.name?.charAt(0) || 'U'}</span>
                                  )}
                              </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* 3. HERO SECTION (Greeting & Smart Banner Side-by-Side on Desktop) */}
            <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    {/* Left: Greeting */}
                    <div className="flex-1 min-w-0">
                        <DynamicGreeting user={user} lang={lang} />
                    </div>
                    
                    {/* Right: Smart Banner (Adjusted for Hero context) */}
                    <div className="w-full lg:w-[60%] xl:w-[50%] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                         <SmartBanner lang={lang} className="w-full !max-w-none !mx-0 shadow-2xl" weather={weather} user={user} />
                    </div>
                </div>
            </div>

            {/* 4. BENTO GRID */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-5 pb-32 max-w-7xl mx-auto w-full">
                
                {/* Weather (MD: Col 1-4) */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} onNavigate={onNavigate} />
                </div>

                {/* Market Trends (MD: Col 5-8) */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <MarketWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Crop Calendar (MD: Col 9-12) */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <CalendarWidget lang={lang} onNavigate={onNavigate} />
                </div>

                {/* --- Row 2 --- */}

                {/* Voice Widget (Desktop Only) */}
                <div className="hidden md:block col-span-1 md:col-span-3 h-44">
                    <VoiceWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Quick Actions Grid */}
                <div className="col-span-1 md:col-span-9 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <FeatureCard 
                        icon={ShoppingCart} 
                        title={t.quick_action_mandi}
                        variant="disease"
                        onClick={() => onNavigate('SABJI_MANDI')} 
                        delay={100}
                    />
                    <FeatureCard 
                        icon={ScanLine} 
                        title={t.quick_action_doctor}
                        variant="disease"
                        onClick={() => onNavigate('DISEASE_DETECTOR')} 
                        delay={150}
                    />
                    <FeatureCard 
                        icon={FlaskConical} 
                        title={t.quick_action_soil}
                        variant="soil"
                        onClick={() => onNavigate('SOIL')} 
                        delay={200}
                    />
                    <FeatureCard 
                        icon={MapIcon} 
                        title={t.menu_area} 
                        variant="area"
                        onClick={() => onNavigate('AREA_CALCULATOR')} 
                        delay={250}
                    />
                    <FeatureCard 
                        icon={BookOpen} 
                        title={t.menu_knowledge} 
                        variant="yield"
                        onClick={() => onNavigate('AGRI_KNOWLEDGE')} 
                        delay={275}
                    />
                </div>
                
                {/* Government Schemes */}
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

                {/* Agri-Doctor Promo */}
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
