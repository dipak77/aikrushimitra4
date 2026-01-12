
import React, { useState } from 'react';
import { ViewState, Language, UserProfile } from './types';

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
import { SplashScreen } from './components/views/SplashScreen';

const App = () => {
  // Initialize with SPLASH screen
  const [view, setView] = useState<ViewState>('SPLASH');
  const [lang, setLang] = useState<Language>('mr');
  
  // Changed default name from 'Suresh Patil' to 'Patil' as requested
  const [user, setUser] = useState<UserProfile>({ 
    name: "Patil", 
    village: "Satara", 
    district: "Satara", 
    landSize: "5 Acres", 
    crop: "Soyabean" 
  });
  
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  const getView = () => {
    switch(view) {
       case 'SPLASH': return <SplashScreen onComplete={() => setView('DASHBOARD')} />;
       case 'DASHBOARD': return <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} />;
       case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SOIL': return <SoilAnalysis lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'YIELD': return <YieldPredictor lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'AREA_CALCULATOR': return <AreaCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
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

  // Hide Sidebar/Nav for specific full-screen views (including SPLASH)
  const isFullScreen = view === 'VOICE_ASSISTANT' || view === 'AREA_CALCULATOR' || view === 'SPLASH';

  return (
    <div className="flex h-[100dvh] w-full font-sans bg-transparent text-slate-100 selection:bg-cyan-500/30">
       
       {/* Feature Notification System (Global) */}
       {!isFullScreen && <NotificationSystem lang={lang} onNavigate={setView} />}

       {!isFullScreen && <Sidebar view={view} setView={setView} lang={lang} />}
       <main className="flex-1 h-full relative z-0 w-full max-w-[100vw] overflow-hidden">
          {getView()}
       </main>
       {!isFullScreen && <MobileNav view={view} setView={setView} />}
    </div>
  );
};

export default App;
