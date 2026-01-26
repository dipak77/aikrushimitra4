
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ScanLine, FlaskConical, Map as MapIcon, Landmark, TrendingUp, Languages, Leaf } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

// Segregated Components
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
    const [weather, setWeather] = useState<any>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [liveLocation, setLiveLocation] = useState<string>(user.village || "Locating...");

    useEffect(() => {
        // Function to fetch weather based on lat/lng
        const getWeatherData = async (lat: number, lng: number) => {
             try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day,wind_speed_10m`);
                const data = await res.json();
                setWeather(data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoadingWeather(false);
             }
        };

        // Function to get place name via Reverse Geocoding
        const getPlaceName = async (lat: number, lng: number) => {
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const data = await res.json();
                // Prioritize locality, then city, then village, then fallback to user profile
                const name = data.locality || data.city || data.town || data.village || user.village;
                setLiveLocation(name);
            } catch (e) {
                console.error("Geocoding error", e);
                setLiveLocation(user.village);
            }
        };

        // Get Live Position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    getWeatherData(latitude, longitude);
                    getPlaceName(latitude, longitude);
                },
                (err) => {
                    console.warn("Location access denied, using default");
                    // Default to Satara if denied
                    getWeatherData(19.75, 75.71); 
                    setLiveLocation(user.village); 
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            // Fallback for no geolocation support
            getWeatherData(19.75, 75.71);
            setLiveLocation(user.village);
        }
    }, [user.village]);

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
            
            {/* 2. HEADER */}
            <div className="pt-4 px-6 pb-2 flex items-center justify-between z-50 gap-4">
                 {/* LEFT: CSS BRANDING LOGO */}
                 <AppHeaderLogo />

                 {/* CENTER: SMART BANNER (Desktop Only - In Header) */}
                 <SmartBanner lang={lang} className="hidden lg:flex" />

                 {/* RIGHT: ACTIONS */}
                 <div className="flex items-center gap-3">
                     <button onClick={toggleLang} className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
                         <Languages size={14} className="text-slate-300"/>
                         <span className="text-[10px] font-bold uppercase text-white tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'ENG'}</span>
                     </button>
                     
                     {/* Profile Icon (Moved to Right) */}
                     <div onClick={() => onNavigate('PROFILE')} className="relative cursor-pointer group">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[1.5px] shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
                              <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                  {/* Initials or Avatar */}
                                  <span className="text-sm font-black text-white">{user.name.charAt(0)}</span>
                              </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* 2.1 GREETING SUB-HEADER */}
            <div className="px-6 py-2">
                <DynamicGreeting user={user} lang={lang} />
            </div>

            {/* 2.2 SMART BANNER (Mobile Only - Above Weather) */}
            <div className="px-4 mb-4 lg:hidden">
                <SmartBanner lang={lang} className="mx-0 w-full" />
            </div>

            {/* 3. BENTO GRID */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-12 gap-5 pb-32 max-w-7xl mx-auto w-full">
                
                {/* Weather (MD: Col 1-4) - Immersive Scene */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} onNavigate={onNavigate} />
                </div>

                {/* Market Trends (MD: Col 5-8) - Trading Cards */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <MarketWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Crop Calendar (MD: Col 9-12) - Timeline */}
                <div className="col-span-1 md:col-span-4 h-64">
                    <CalendarWidget lang={lang} onNavigate={onNavigate} />
                </div>

                {/* --- Row 2 --- */}

                {/* Voice Widget (Desktop Only) - Glowing Orb */}
                <div className="hidden md:block col-span-1 md:col-span-3 h-44">
                    <VoiceWidget onNavigate={onNavigate} lang={lang} />
                </div>

                {/* Quick Actions Grid - Glass Tiles */}
                <div className="col-span-1 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FeatureCard 
                        icon={ScanLine} 
                        title={t.quick_action_doctor}
                        variant="disease"
                        onClick={() => onNavigate('DISEASE_DETECTOR')} 
                        delay={100}
                    />
                    <FeatureCard 
                        icon={FlaskConical} 
                        title={t.quick_action_soil}
                        variant="soil"
                        onClick={() => onNavigate('SOIL')} 
                        delay={150}
                    />
                    <FeatureCard 
                        icon={TrendingUp} 
                        title={t.menu_yield}
                        variant="yield"
                        onClick={() => onNavigate('YIELD')} 
                        delay={200}
                    />
                    <FeatureCard 
                        icon={MapIcon} 
                        title={t.menu_area} 
                        variant="area"
                        onClick={() => onNavigate('AREA_CALCULATOR')} 
                        delay={250}
                    />
                </div>
                
                {/* Government Schemes (Wide Banner) - Wealth Theme */}
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

                {/* Agri-Doctor Promo (Wide Banner) - Tech Theme */}
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
