
import React from 'react';
import { ViewState, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { LayoutDashboard, Store, CloudSun, Landmark, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Sprout, Mic } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t.menu_dashboard },
    { id: 'MARKET', icon: Store, label: t.menu_market },
    { id: 'WEATHER', icon: CloudSun, label: t.menu_weather },
    { id: 'SCHEMES', icon: Landmark, label: t.menu_schemes },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.menu_crop_doctor },
    { id: 'SOIL', icon: FlaskConical, label: t.menu_soil },
    { id: 'YIELD', icon: TrendingUp, label: t.menu_yield },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: t.menu_area },
  ];

  return (
    <div className="hidden lg:flex fixed left-6 top-6 bottom-6 w-24 flex-col z-50">
       <div className="glass-panel h-full rounded-[2.5rem] flex flex-col items-center py-8 shadow-[0_0_40px_rgba(16,185,129,0.05)] bg-[#020617]/90 backdrop-blur-2xl border border-white/5 relative overflow-hidden">
          
          {/* Background Ambient Glow (Emerald/Gold) */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl"></div>
          
          {/* --- NEW BRANDING: ORB OF INTELLIGENT GROWTH (ICON VERSION) --- */}
          <div className="relative w-16 h-16 mb-10 cursor-pointer group" onClick={() => setView('DASHBOARD')}>
             
             {/* 1. Volumetric Glow */}
             <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-400/30 transition-all duration-500"></div>

             {/* 2. Saffron Gold Ring (Trust/Ethos) - Slow Spin */}
             <div className="absolute inset-0 rounded-full border border-amber-500/20 border-t-amber-400 animate-[spin_6s_linear_infinite]"></div>
             
             {/* 3. AI Blue Ring (Technology) - Fast Reverse Spin */}
             <div className="absolute inset-1.5 rounded-full border border-cyan-500/20 border-b-cyan-400 animate-[spin_3s_linear_infinite_reverse]"></div>

             {/* 4. Emerald Pulse Ring (Growth) */}
             <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-pulse"></div>

             {/* 5. The Core */}
             <div className="absolute inset-3 bg-[#020617] rounded-full border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(16,185,129,0.3)] overflow-hidden group-hover:scale-95 transition-transform duration-500">
                
                {/* Internal Organic Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-transparent to-cyan-900/40"></div>
                
                {/* The Sprout Icon */}
                <Sprout size={22} className="relative z-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] group-hover:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
                
                {/* Specular Glint */}
                <div className="absolute top-2 left-3 w-4 h-2 bg-white/30 blur-sm rounded-full rotate-[-45deg]"></div>
             </div>
          </div>
          {/* ------------------------------------------- */}

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto hide-scrollbar z-20">
             {items.map(item => {
               const active = view === item.id;
               return (
                 <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                   className={clsx(
                     "w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group relative shrink-0",
                     active ? "bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
                   )}>
                    
                    {/* Active Glow behind Icon */}
                    {active && <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl"></div>}
                    
                    <item.icon size={22} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform group-hover:scale-110 duration-300 relative z-10", active && "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
                    
                    <span className={clsx("text-[9px] font-bold tracking-tight text-center leading-none relative z-10", active ? "text-emerald-100" : "text-slate-500 group-hover:text-slate-300")}>
                        {item.label.split(' ')[0]}
                    </span>
                    
                    {/* Active Left Indicator */}
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r-full shadow-[0_0_10px_#34d399]"></div>}
                 </button>
               );
             })}
          </div>

          {/* AI Voice Assistant Orb Button (Desktop) */}
          <div className="mt-6 px-3 w-full shrink-0 z-20">
              <button 
                  onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} 
                  className="relative w-full aspect-square flex items-center justify-center group"
              >
                  {/* Outer Spin Ring */}
                  <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 border-l-transparent animate-[spin_4s_linear_infinite] group-hover:border-t-cyan-300 transition-colors"></div>
                  
                  {/* Inner Spin Ring (Reverse) */}
                  <div className="absolute inset-2 rounded-full border border-amber-500/30 border-b-amber-400 border-r-transparent animate-[spin_3s_linear_infinite_reverse]"></div>

                  {/* Core Orb */}
                  <div className="absolute inset-3 bg-gradient-to-br from-emerald-600 to-cyan-700 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center group-hover:scale-95 transition-transform duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                      <Mic size={20} className="text-white relative z-10 drop-shadow-md" />
                  </div>
              </button>
          </div>
       </div>
    </div>
  );
};

export default Sidebar;
