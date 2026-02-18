
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { UserProfile, Language } from '../../types';
import { Sprout, ShieldCheck, MapPin, Globe, AlertTriangle, ChevronRight, HelpCircle, User, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { logActivity } from '../../services/analyticsService';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  lang: Language;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, lang }) => {
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showDevOptions, setShowDevOptions] = useState(false);

  // Check for Client ID safely
  const hasClientId = !!process.env.VITE_GOOGLE_CLIENT_ID && process.env.VITE_GOOGLE_CLIENT_ID.length > 5;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      triggerHaptic('medium');
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      setIsLocating(true);
      
      let location = "Unknown";
      try {
          if (navigator.geolocation) {
              await new Promise<void>((resolve) => {
                  navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                          try {
                              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
                              const data = await res.json();
                              location = data.locality || data.city || data.town || "Maharashtra";
                          } catch (e) {}
                          resolve();
                      },
                      () => resolve(),
                      { timeout: 3000 }
                  );
              });
          }
      } catch (e) {
          console.log("Location skip");
      }

      const userProfile: UserProfile = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        village: location !== "Unknown" ? location : "Maharashtra",
        district: "Pune",
        landSize: "0 Acres",
        crop: "Not Selected",
        joinedAt: Date.now(),
        lastLogin: Date.now()
      };

      // ── LOG GOOGLE LOGIN ──
      logActivity('LOGIN_SUCCESS', location, userProfile, 'GOOGLE_AUTH');
      
      localStorage.setItem('user_session', JSON.stringify(userProfile));
      setIsLocating(false);
      onLoginSuccess(userProfile);

    } catch (err) {
      console.error("Login Error", err);
      setError("Authentication Failed. Try Guest Mode.");
      setIsLocating(false);
    }
  };

  const handleGuestLogin = () => {
        triggerHaptic('medium');
        setIsLocating(true); // Simulate loading
        
        setTimeout(() => {
            const guestUser: UserProfile = {
                name: "Guest Farmer",
                email: `guest_${Date.now().toString().slice(-4)}@aikrushimitra.in`,
                village: "Maharashtra",
                district: "Pune",
                landSize: "0 Acres",
                crop: "Select Crop",
                joinedAt: Date.now()
            };
            
            try {
                // ── LOG GUEST LOGIN ──
                logActivity('LOGIN_SUCCESS', "Guest Location", guestUser, 'GUEST_AUTH');
                localStorage.setItem('user_session', JSON.stringify(guestUser));
            } catch(e) {
                console.error("Storage error", e);
            }
            
            setIsLocating(false);
            onLoginSuccess(guestUser);
        }, 800);
  };

  const handleGoogleError = () => {
      // Common in preview environments due to origin mismatch
      setError("Google Login unavailable in Preview.");
      setShowDevOptions(true);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#020617] to-[#020617]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="relative z-10 w-full max-w-md animate-enter">
            
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-3xl rotate-6 blur-lg opacity-60"></div>
                    <div className="relative w-full h-full bg-[#0f172a] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Sprout size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Globe size={16} className="text-blue-600" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-cyan-300 tracking-tight text-center mb-2">
                    AI Krushi Mitra
                </h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Smart Farming Assistant</p>
            </div>

            {/* Login Card */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-2 text-center">Welcome Farmer / शेतकरी</h2>
                <p className="text-slate-400 text-sm text-center mb-8">
                    Sign in to access AI crop doctor, market rates, and personalized advice.
                </p>

                {isLocating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 size={32} className="text-emerald-400 animate-spin mb-4" />
                        <div className="text-emerald-400 text-xs font-bold animate-pulse flex items-center gap-2">
                            <MapPin size={12} /> Setting up your profile...
                        </div>
                    </div>
                ) : hasClientId ? (
                    <div className="flex flex-col items-center gap-4">
                        {/* Standard Google Button */}
                        <div className="w-full flex justify-center h-[44px]">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                                size="large"
                                width="300"
                                text="continue_with"
                                useOneTap
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 w-full px-4">
                            <div className="h-[1px] bg-white/10 flex-1"></div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">OR</span>
                            <div className="h-[1px] bg-white/10 flex-1"></div>
                        </div>

                        {/* Guest Bypass Button */}
                        <button 
                            onClick={handleGuestLogin}
                            className="w-full h-[44px] rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-bold text-slate-300 hover:text-white group"
                        >
                            <User size={16} className="group-hover:text-emerald-400 transition-colors"/> Continue as Guest
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <div className="flex justify-center mb-2">
                            <AlertTriangle size={24} className="text-amber-400" />
                        </div>
                        <p className="text-amber-200 text-sm font-bold mb-1">Setup Required</p>
                        <p className="text-amber-400/80 text-xs px-2">
                            Google Client ID is missing. Please add VITE_GOOGLE_CLIENT_ID to your .env file.
                        </p>
                        <button onClick={handleGuestLogin} className="mt-4 w-full py-2 bg-amber-500/20 rounded-lg text-amber-200 font-bold text-xs hover:bg-amber-500/30 transition-colors">
                            Bypass & Continue (Guest)
                        </button>
                    </div>
                )}

                {error && !isLocating && (
                    <div className="text-red-400 text-xs text-center mt-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-enter flex flex-col gap-1">
                        <p className="font-bold">{error}</p>
                        <p className="opacity-70 text-[10px]">Use "Continue as Guest" below.</p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <ShieldCheck size={12} />
                        <span>Secure Environment</span>
                    </div>
                </div>
            </div>
            
            {/* Troubleshoot Trigger */}
            <div className="mt-6 text-center animate-enter" style={{animationDelay: '0.2s'}}>
                <button 
                    onClick={() => setShowDevOptions(!showDevOptions)}
                    className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 w-full py-2"
                >
                    <HelpCircle size={12} /> Having trouble?
                </button>
                
                {showDevOptions && (
                    <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-400">
                        <p className="mb-2">If Google Sign-In pop-up closes immediately, the domain might not be authorized in Google Cloud Console.</p>
                        <p className="font-bold text-emerald-400">Click "Continue as Guest" to skip.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default LoginView;
