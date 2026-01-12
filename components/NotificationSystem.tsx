
import React, { useState, useEffect } from 'react';
import { Language, ViewState } from '../types';
import { PROMO_NOTIFICATIONS } from '../constants';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../utils/common';

interface NotificationSystemProps {
  lang: Language;
  onNavigate: (view: ViewState) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ lang, onNavigate }) => {
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Timer Logic: Show an alert every 5 minutes (300,000 ms)
    // Initial delay: 10 seconds for first impression
    
    const showRandomAlert = () => {
       const alerts = PROMO_NOTIFICATIONS[lang] || PROMO_NOTIFICATIONS['en'];
       if (!alerts || alerts.length === 0) return;

       const random = alerts[Math.floor(Math.random() * alerts.length)];
       setCurrentAlert(random);
       setIsVisible(true);
       triggerHaptic();

       // Auto-dismiss after 8 seconds
       setTimeout(() => {
          setIsVisible(false);
       }, 8000);
    };

    const initialTimer = setTimeout(showRandomAlert, 10000); // First one after 10s
    const intervalTimer = setInterval(showRandomAlert, 300000); // Every 5 mins

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [lang]);

  if (!currentAlert) return null;

  return (
    <div className={clsx(
        "fixed top-4 left-4 right-4 z-[9999] flex justify-center transition-all duration-700 pointer-events-none",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"
    )}>
        <div className="pointer-events-auto relative max-w-sm w-full glass-panel rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/20 bg-slate-900/90 backdrop-blur-xl overflow-hidden group cursor-pointer"
             onClick={() => {
                 onNavigate(currentAlert.view as ViewState);
                 setIsVisible(false);
                 triggerHaptic();
             }}
        >
            {/* Animated Glow Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-cyan-500 to-emerald-500 blur-2xl rounded-full opacity-30 animate-pulse"></div>

            <div className="flex items-start gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                    <currentAlert.icon size={20} className={currentAlert.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles size={12} className="text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">New Feature</span>
                    </div>
                    <h3 className="text-sm font-black text-white leading-tight mb-1">{currentAlert.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{currentAlert.desc}</p>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>
            
            <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Try Now <ArrowRight size={10} />
            </div>
        </div>
    </div>
  );
};

export default NotificationSystem;
