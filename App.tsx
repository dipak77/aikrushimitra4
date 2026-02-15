import React, { useState, useEffect } from 'react';
import { ViewState, Language, UserProfile } from './types';
import { logActivity } from './services/analyticsService';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
import SplashScreen from './components/views/SplashScreen';
import SabjiMandiView from './components/views/SabjiMandiView';
import LoginView from './components/views/LoginView';
import AgriKnowledgeView from './components/views/AgriKnowledgeView';
import KnowledgeDetailView from './components/views/KnowledgeDetailView';

const App = () => {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [lang, setLang] = useState<Language>('mr');
  
  // Default user state is null until login/guest selection
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState<any>(null);

  // --- GOOGLE CLIENT ID ---
  const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "";

  // --- ANALYTICS TRACKING ---
  useEffect(() => {
    if (view !== 'SPLASH' && view !== 'LOGIN' && user) {
       const location = localStorage.getItem('last_known_loc') || user.village;
       logActivity(view, location, user);
    }
  }, [view, user]);

  // --- AUTH CHECK ---
  const handleSplashComplete = () => {
      // Check for existing session
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
          try {
              const parsedUser = JSON.parse(savedSession);
              setUser(parsedUser);
              setView('DASHBOARD');
          } catch (e) {
              setView('LOGIN');
          }
      } else {
          // Navigate to Login Screen so user can CHOOSE (Google or Guest)
          setView('LOGIN');
      }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
      setUser(loggedInUser);
      setView('DASHBOARD');
  };

  const getView = () => {
    // If no user is set (and not on Splash), force Login View
    if (!user && view !== 'SPLASH') {
        return <LoginView onLoginSuccess={handleLoginSuccess} lang={lang} />;
    }

    switch(view) {
       case 'SPLASH': return <SplashScreen onComplete={handleSplashComplete} />;
       case 'LOGIN': return <LoginView onLoginSuccess={handleLoginSuccess} lang={lang} />;
       case 'DASHBOARD': return user ? <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} /> : null;
       case 'VOICE_ASSISTANT': return user ? <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SOIL': return <SoilAnalysis lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'YIELD': return <YieldPredictor lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'AREA_CALCULATOR': return <AreaCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'CALENDAR': return <CropCalendarView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'ADMIN': return <AdminDashboard onBack={() => setView('DASHBOARD')} />;
       case 'SABJI_MANDI': return user ? <SabjiMandiView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'SCHEMES': 
          if(selectedScheme) {
             return <SchemeDetailView scheme={selectedScheme} lang={lang} onBack={() => setSelectedScheme(null)} />;
          }
          return <SchemesView lang={lang} onBack={() => setView('DASHBOARD')} onSelect={(s) => setSelectedScheme(s)} />;
       case 'AGRI_KNOWLEDGE':
          if (selectedKnowledgeItem) {
             return <KnowledgeDetailView item={selectedKnowledgeItem} lang={lang} onBack={() => setSelectedKnowledgeItem(null)} />;
          }
          return <AgriKnowledgeView lang={lang} onBack={() => setView('DASHBOARD')} onSelect={(item) => setSelectedKnowledgeItem(item)} />;
       case 'MARKET': 
         return <MarketView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'WEATHER':
         return <WeatherView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'PROFILE':
         return user ? <ProfileView lang={lang} currentUser={user} onSave={(u) => { setUser(u); localStorage.setItem('user_session', JSON.stringify(u)); setView('DASHBOARD'); }} onBack={() => setView('DASHBOARD')} /> : null;
       default: return user ? <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} /> : null;
    }
  };

  const isFullScreen = view === 'VOICE_ASSISTANT' || view === 'AREA_CALCULATOR' || view === 'SPLASH' || view === 'ADMIN' || view === 'LOGIN';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="relative w-full h-[100dvh] bg-transparent overflow-hidden text-slate-100 font-jakarta">
        
        {/* 1. Global Background Layers */}
        <div className="premium-bg">
            <div className="planet-orb-main"></div>
            <div className="planet-ring"></div>
            <div className="planet-orb-secondary"></div>
            <div className="star-field"></div>
        </div>

        {/* 2. Notification System */}
        {!isFullScreen && <NotificationSystem lang={lang} onNavigate={setView} />}

        {/* 3. Navigation Sidebar */}
        {!isFullScreen && <Sidebar view={view} setView={setView} lang={lang} />}

        {/* 4. Main Content Area */}
        <main className="relative w-full h-full z-10">
            {getView()}
        </main>

        {/* 5. Mobile Navigation */}
        {view === 'DASHBOARD' && <MobileNav view={view} setView={setView} />}
        </div>
    </GoogleOAuthProvider>
  );
};

export default App;