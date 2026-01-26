
import React, { useState, useEffect } from 'react';
import { ViewState, Language, UserProfile } from './types';
import { logActivity } from './services/analyticsService';

// Layout
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import NotificationSystem from './components/NotificationSystem';

// Views
import Dashboard from './components/views/Dashboard';
import VoiceAssistant from './components/views/VoiceAssistant';
import DiseaseDetector from './components/views/DiseaseDetector';
import SoilAnalysis from './components/views/SoilAnalysis';
import YieldPredictor from './components/views/YieldPredictor';
import AreaCalculator from './components/views/AreaCalculator';
import SchemesView from './components/views/SchemesView';
import SchemeDetailView from './components/views/SchemeDetailView';
import MarketView from './components/views/MarketView';
import WeatherView from './components/views/WeatherView';
import ProfileView from './components/views/ProfileView';
import CropCalendarView from './components/views/CropCalendarView';
import AdminDashboard from './components/views/AdminDashboard';
import { SplashScreen } from './components/views/SplashScreen';

const App = () => {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [lang, setLang] = useState<Language>('mr');
  
  const [user, setUser] = useState<UserProfile>({ 
    name: "Patil", 
    village: "Haveli", 
    district: "Pune", 
    landSize: "5 Acres", 
    crop: "Soyabean" 
  });
  
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  // --- ANALYTICS TRACKING ---
  useEffect(() => {
    if (view !== 'SPLASH') {
       // Try to get cached location or default to user profile village
       const location = localStorage.getItem('last_known_loc') || user.village;
       logActivity(view, location);
    }
  }, [view, user.village]);

  const getView = () => {
    switch(view) {
       case 'SPLASH': return <SplashScreen onComplete={() => setView('DASHBOARD')} />;
       case 'DASHBOARD': return <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} />;
       case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SOIL': return <SoilAnalysis lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'YIELD': return <YieldPredictor lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'AREA_CALCULATOR': return <AreaCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'CALENDAR': return <CropCalendarView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'ADMIN': return <AdminDashboard onBack={() => setView('DASHBOARD')} />;
       case 'SCHEMES': 
          if(selectedScheme) {
             return <SchemeDetailView scheme={selectedScheme} lang={lang} onBack={() => setSelectedScheme(null)} />;
          }
          return <SchemesView lang={lang} onBack={() => setView('DASHBOARD')} onSelect={(s) => setSelectedScheme(s)} />;
       case 'MARKET': 
         return <MarketView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'WEATHER':
         return <WeatherView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'PROFILE':
         return <ProfileView lang={lang} currentUser={user} onSave={(u) => { setUser(u); setView('DASHBOARD'); }} onBack={() => setView('DASHBOARD')} />;
       default: return <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} />;
    }
  };

  // Fullscreen views hide the standard nav but may implement their own internal nav
  const isFullScreen = view === 'VOICE_ASSISTANT' || view === 'AREA_CALCULATOR' || view === 'SPLASH' || view === 'ADMIN';

  return (
    <div className="relative w-full h-[100dvh] bg-transparent overflow-hidden text-slate-100 font-jakarta">
       
       {/* 1. Global Background Layers (Fixed, z-0) */}
       <div className="premium-bg">
          <div className="planet-orb-main"></div>
          <div className="planet-ring"></div>
          <div className="planet-orb-secondary"></div>
          <div className="star-field"></div>
       </div>

       {/* 2. Notification System (Highest z-index for alerts) */}
       {!isFullScreen && <NotificationSystem lang={lang} onNavigate={setView} />}

       {/* 3. Navigation Sidebar (Desktop) - Fixed Left, High Z-Index */}
       {!isFullScreen && <Sidebar view={view} setView={setView} lang={lang} />}

       {/* 4. Main Content Area */}
       <main className="relative w-full h-full z-10">
          {getView()}
       </main>

       {/* 5. Mobile Navigation (Floating Bottom, High Z-Index) */}
       {!isFullScreen && <MobileNav view={view} setView={setView} />}
    </div>
  );
};

export default App;
