
import React from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS, SCHEMES_DATA } from '../../constants';
import { Clock, UserCircle, MapPin, Sun, Wind, Droplets, Mic, ArrowUpRight, ScanLine, FlaskConical, TrendingUp, Map as MapIcon, Landmark } from 'lucide-react';
import { formatDate, triggerHaptic } from '../../utils/common';

const Dashboard = ({ lang, user, onNavigate }: { lang: Language, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
  const t = TRANSLATIONS[lang];
  const schemes = SCHEMES_DATA[lang as Language] || SCHEMES_DATA['en'];

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar pb-32 lg:pl-32 lg:pt-6 lg:pr-6 overscroll-y-contain scroll-smooth">
      <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6 pt-safe-top">
        
        {/* Header */}
        <header className="flex justify-between items-start animate-enter mt-2">
           <div>
              <div className="flex items-center gap-2 mb-2 glass-panel w-fit px-3 py-1 rounded-full bg-slate-800/50">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                 <p className="text-green-400 font-bold text-[10px] uppercase tracking-widest">{t.live_system}</p>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm leading-tight mt-1">
                 {t.welcome_title} <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs mt-2 flex items-center gap-1.5">
                 <Clock size={12}/> {formatDate()}
              </p>
           </div>
           
           <button onClick={() => { onNavigate('PROFILE'); triggerHaptic(); }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-12 h-12 rounded-full glass-panel border border-white/20 flex items-center justify-center relative overflow-hidden">
                  <UserCircle className="text-slate-200 w-full h-full p-1" strokeWidth={1.5}/>
              </div>
           </button>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
           
           {/* Weather Card */}
           <div onClick={() => { onNavigate('WEATHER'); triggerHaptic(); }} className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10 text-white shadow-2xl shadow-purple-900/20 animate-enter delay-100 transition-all active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-800 to-indigo-900 backdrop-blur-xl"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/30 rounded-full blur-[60px] animate-pulse"></div>
              <div className="absolute top-4 right-4 float-3d">
                  <Sun size={64} className="text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" fill="rgba(251,191,36,0.5)"/>
              </div>
              <div className="relative p-6 z-10 min-h-[180px] flex flex-col justify-between h-full">
                 <div className="glass-panel w-fit px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-black/20 border-white/10">
                    <MapPin size={10} className="text-cyan-300"/> {user.village}
                 </div>
                 <div className="mt-4">
                    <h2 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg">28°</h2>
                    <p className="text-lg font-medium text-indigo-200 -mt-2 mb-4">Sunny & Clear</p>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="glass-panel p-2 rounded-xl flex items-center gap-2 bg-white/5">
                          <Wind size={16} className="text-cyan-300"/> 
                          <span className="font-bold text-sm">12 km/h</span>
                       </div>
                       <div className="glass-panel p-2 rounded-xl flex items-center gap-2 bg-white/5">
                          <Droplets size={16} className="text-blue-300"/> 
                          <span className="font-bold text-sm">45%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Voice Assistant Promo */}
           <div onClick={() => { onNavigate('VOICE_ASSISTANT'); triggerHaptic(); }} className="col-span-1 md:col-span-1 row-span-2 glass-panel rounded-[2.5rem] p-6 relative overflow-hidden cursor-pointer group animate-enter delay-200 active:scale-[0.98] transition-all border border-white/10 bg-slate-900/40">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
                    <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-[spin_4s_linear_infinite]"></div>
                    <Mic size={32} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"/>
                 </div>
                 <h3 className="text-lg font-black mb-1">{t.menu_voice}</h3>
                 <p className="text-slate-400 text-xs leading-relaxed mb-4 px-2">Ask about crops or market in your language.</p>
                 <button className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 w-full flex items-center justify-center gap-2">
                    Start Talk <ArrowUpRight size={14}/>
                 </button>
              </div>
           </div>

           {/* Crop Doctor */}
           <div onClick={() => { onNavigate('DISEASE_DETECTOR'); triggerHaptic(); }} className="col-span-1 row-span-1 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden cursor-pointer group animate-enter delay-300 active:scale-[0.98] transition-all bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 flex items-center justify-between">
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full"></div>
              <div className="flex flex-col justify-center pl-1 z-10">
                 <h3 className="text-lg font-black text-white tracking-tight">{t.quick_action_doctor}</h3>
                 <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    AI READY
                 </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 z-10 group-hover:rotate-6 transition-transform">
                 <ScanLine size={24}/>
              </div>
           </div>

            {/* Soil Health */}
            <div onClick={() => { onNavigate('SOIL'); triggerHaptic(); }} className="col-span-1 row-span-1 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden cursor-pointer group animate-enter delay-300 active:scale-[0.98] transition-all bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-500/20 flex items-center justify-between">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full"></div>
              <div className="flex flex-col justify-center pl-1 z-10">
                 <h3 className="text-lg font-black text-white tracking-tight">{t.quick_action_soil}</h3>
                 <p className="text-orange-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <FlaskConical size={10} className="text-orange-400" />
                    CHECK NPK
                 </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 z-10 group-hover:-rotate-6 transition-transform">
                 <FlaskConical size={24}/>
              </div>
           </div>

           {/* Smart Tools Group */}
           <div className="col-span-1 md:col-span-2 row-span-1 flex gap-4">
              {/* Yield Predictor */}
              <div onClick={() => { onNavigate('YIELD'); triggerHaptic(); }} className="flex-1 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden cursor-pointer group animate-enter delay-300 active:scale-[0.98] transition-all bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/20 flex items-center justify-between">
                 <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full"></div>
                 <div className="flex flex-col justify-center pl-1 z-10">
                    <h3 className="text-base font-black text-white tracking-tight">{t.menu_yield}</h3>
                    <p className="text-blue-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">AI FORECAST</p>
                 </div>
                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 z-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={20}/>
                 </div>
              </div>

              {/* Area Calculator */}
              <div onClick={() => { onNavigate('AREA_CALCULATOR'); triggerHaptic(); }} className="flex-1 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden cursor-pointer group animate-enter delay-300 active:scale-[0.98] transition-all bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 border border-purple-500/20 flex items-center justify-between">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full"></div>
                 <div className="flex flex-col justify-center pl-1 z-10">
                    <h3 className="text-base font-black text-white tracking-tight">{t.menu_area}</h3>
                    <p className="text-purple-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">SATELLITE</p>
                 </div>
                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 z-10 group-hover:scale-110 transition-transform">
                    <MapIcon size={20}/>
                 </div>
              </div>
           </div>

        </div>

        {/* Schemes Carousel */}
        <div className="animate-enter delay-300 pb-24">
           <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Landmark size={20} className="text-fuchsia-400"/> 
                  {t.govt_schemes}
              </h3>
              <button onClick={() => { onNavigate('SCHEMES'); triggerHaptic(); }} className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all">{t.view_all}</button>
           </div>
           
           <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x snap-mandatory px-2 -mx-2">
              {schemes.slice(0,3).map((s: any) => (
                 <div onClick={() => { onNavigate('SCHEMES'); triggerHaptic(); }} key={s.id} className="snap-center shrink-0 w-[85vw] md:w-[280px] h-36 rounded-[2.5rem] relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all shadow-lg shadow-black/30 border border-white/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-90`}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                       <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                              <Landmark size={20} className="text-white"/>
                          </div>
                          <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/10 shadow-sm">{s.status}</span>
                       </div>
                       <div>
                          <h4 className="text-xl font-black leading-tight tracking-tight">{s.title.substring(0, 20)}...</h4>
                          <p className="text-white/80 font-medium text-xs mt-1">{s.subtitle}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
