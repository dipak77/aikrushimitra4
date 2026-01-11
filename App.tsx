
import React, { useState } from 'react';
import { ViewState, Language, UserProfile } from './types';

// Layout
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

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

const App = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [lang, setLang] = useState<Language>('mr');
  const [user] = useState<UserProfile>({ name: "Suresh Patil", village: "Satara", district: "Satara", landSize: "5 Acres", crop: "Soyabean" });
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  const getView = () => {
    switch(view) {
       case 'DASHBOARD': return <Dashboard lang={lang} user={user} onNavigate={setView} />;
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
       default: return <Dashboard lang={lang} user={user} onNavigate={setView} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full font-sans bg-transparent text-slate-100 selection:bg-cyan-500/30">
       {view !== 'VOICE_ASSISTANT' && <Sidebar view={view} setView={setView} lang={lang} />}
       <main className="flex-1 h-full relative z-0 w-full max-w-[100vw] overflow-hidden">
          {getView()}
       </main>
       {view !== 'VOICE_ASSISTANT' && <MobileNav view={view} setView={setView} />}
    </div>
  );
};

export default App;
