
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Language, UserProfile } from './types';
import { TRANSLATIONS } from './constants';
import { 
  Sprout, CloudSun, ScanLine, Mic, Droplets, ArrowLeft, Home, Store, 
  Wind, Camera, X, Wheat, Sun, MapPin, Clock, ArrowUpRight, 
  Landmark, ChevronRight, CheckCircle2, Loader2,  
  Bell, FileText, Smartphone, CloudRain, Thermometer, UserCircle,
  Share2, Save, MoreHorizontal, LayoutDashboard, WifiOff, RefreshCw,
  Power, MicOff, Activity, LogOut, FlaskConical, TestTube,
  TrendingUp, TrendingDown, Calendar, AlertTriangle, Calculator, Map as MapIcon, RotateCcw, Undo2
} from 'lucide-react';
import { Button } from './components/Button';
import { analyzeCropDisease, getGenAIKey, getSoilAdvice, predictYield } from './services/geminiService';
import { GoogleGenAI, Modality, Blob as GenAIBlob, LiveServerMessage } from '@google/genai';
import { clsx } from 'clsx';

// --- UTILS ---
const formatDate = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15); 
  }
};

// --- HELPERS ---

// High-performance Base64 Encoder to prevent main-thread blocking during audio streaming
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// Resample audio to 16kHz before sending to model
function downsampleTo16k(inputData: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === 16000) {
    const result = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return result;
  }

  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(inputData.length / ratio);
  const result = new Int16Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index1 = Math.floor(originalIndex);
    const index2 = Math.min(index1 + 1, inputData.length - 1);
    const fraction = originalIndex - index1;
    
    // Linear interpolation
    const val = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
    const s = Math.max(-1, Math.min(1, val));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return result;
}

function createPCMChunk(data: Float32Array, sampleRate: number): GenAIBlob {
  const int16 = downsampleTo16k(data, sampleRate);
  return { 
    data: arrayBufferToBase64(int16.buffer), 
    mimeType: "audio/pcm;rate=16000" // Always 16kHz
  };
}

// --- MOCK DATA ---
const MOCK_MARKET = [
  { name: 'Soyabean', price: 4850, trend: '+120', arrival: 'High', color: 'text-amber-300', bg: 'bg-amber-500/20', icon: Wheat, history: [4700, 4750, 4800, 4850] },
  { name: 'Cotton', price: 7200, trend: '-50', arrival: 'Med', color: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: CloudSun, history: [7300, 7250, 7250, 7200] },
  { name: 'Onion', price: 1800, trend: '-200', arrival: 'High', color: 'text-pink-300', bg: 'bg-pink-500/20', icon: Sprout, history: [2000, 1950, 1900, 1800] },
  { name: 'Tur', price: 9200, trend: '+500', arrival: 'Low', color: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: Sprout, history: [8500, 8800, 9000, 9200] },
];
const MOCK_SCHEMES = [
  { id: 1, title: 'PM-Kisan', sub: '₹6000/Yr', status: 'OPEN', grad: 'from-blue-600 to-violet-600' },
  { id: 2, title: 'Fasal Bima', sub: 'Insurance', status: 'OPEN', grad: 'from-fuchsia-600 to-purple-600' },
  { id: 3, title: 'Solar Pump', sub: '90% Off', status: 'OPEN', grad: 'from-cyan-600 to-blue-600' },
];

const WEATHER_HOURLY = [
    { time: '10 AM', temp: '26°', icon: Sun },
    { time: '11 AM', temp: '28°', icon: Sun },
    { time: '12 PM', temp: '30°', icon: CloudSun },
    { time: '1 PM', temp: '31°', icon: CloudSun },
    { time: '2 PM', temp: '32°', icon: Sun },
    { time: '3 PM', temp: '31°', icon: CloudSun },
    { time: '4 PM', temp: '30°', icon: CloudRain },
];

// --- COMPONENTS ---

// 1. Sidebar (Desktop Glass Pill)
const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t.menu_dashboard },
    { id: 'MARKET', icon: Store, label: t.menu_market },
    { id: 'WEATHER', icon: CloudSun, label: t.menu_weather },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.menu_crop_doctor },
    { id: 'SOIL', icon: FlaskConical, label: t.menu_soil },
    { id: 'YIELD', icon: TrendingUp, label: t.menu_yield },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: t.menu_area },
  ];

  return (
    <div className="hidden lg:flex fixed left-6 top-6 bottom-6 w-24 flex-col z-50">
       <div className="glass-panel h-full rounded-[2.5rem] flex flex-col items-center py-8 shadow-[0_0_40px_rgba(79,70,229,0.2)] bg-slate-900/60 border border-white/10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 mb-12 float-3d">
             <Sprout size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full px-2 overflow-y-auto hide-scrollbar">
             {items.map(item => {
               const active = view === item.id;
               return (
                 <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                   className={clsx(
                     "w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group relative shrink-0",
                     active ? "bg-gradient-to-br from-white/10 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] border border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"
                   )}>
                    <item.icon size={24} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform group-hover:scale-110 duration-300", active && "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                    <span className="text-[10px] font-bold tracking-tight text-center leading-none">{item.label.split(' ')[0]}</span>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_15px_#22d3ee]"></div>}
                 </button>
               );
             })}
          </div>
          <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative overflow-hidden mt-4 shrink-0">
             <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-0 group-hover:opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
             <Mic size={24} className="relative z-10" />
          </button>
       </div>
    </div>
  );
};

// 2. Mobile Floating Dock (Premium Glass)
const MobileNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'MARKET', icon: Store },
    { id: 'VOICE_ASSISTANT', icon: Mic, main: true },
    { id: 'YIELD', icon: TrendingUp },
    { id: 'AREA_CALCULATOR', icon: MapIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[150] flex justify-center pointer-events-none px-4 pb-safe-bottom">
      {/* Background scrim for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent h-[150%] bottom-0 -z-10"></div>
      
      <div className="glass-panel !overflow-visible pointer-events-auto p-1.5 rounded-[2.5rem] flex items-center gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10 w-full max-w-[350px] justify-between h-[4.5rem] bg-[#0f172a]/90 backdrop-blur-2xl mb-4 relative">
        {navItems.map((item) => {
           const isActive = view === item.id;
           if (item.main) {
             return (
               <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
                 className="relative -top-9 w-16 h-16 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full text-white flex items-center justify-center shadow-[0_10px_25px_rgba(192,38,211,0.5)] border-4 border-[#020617] active:scale-95 transition-all group overflow-hidden shrink-0 z-50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)]"></div>
                  <Mic size={28} className="relative z-10 drop-shadow-md" />
                  <div className="absolute inset-0 bg-white/30 rounded-full scale-0 group-active:scale-150 transition-transform opacity-50"></div>
               </button>
             );
           }
           return (
             <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }} 
               className={clsx(
                 "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative shrink-0",
                 isActive ? "text-cyan-300 bg-white/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-400 active:text-slate-200 active:scale-95"
               )}>
               <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx(isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
             </button>
           );
        })}
      </div>
    </div>
  );
};

// 3. Main Dashboard
const Dashboard = ({ lang, user, onNavigate }: any) => {
  const t = TRANSLATIONS[lang];
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
              <button onClick={triggerHaptic} className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all">View All</button>
           </div>
           
           <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x snap-mandatory px-2 -mx-2">
              {MOCK_SCHEMES.map(s => (
                 <div onClick={triggerHaptic} key={s.id} className="snap-center shrink-0 w-[85vw] md:w-[280px] h-36 rounded-[2.5rem] relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all shadow-lg shadow-black/30 border border-white/10">
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
                          <h4 className="text-xl font-black leading-tight tracking-tight">{s.title}</h4>
                          <p className="text-white/80 font-medium text-xs mt-1">{s.sub}</p>
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

// SimpleView Component
const SimpleView = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => {
  return (
    <div className="h-full w-full flex flex-col bg-[#020617] animate-enter">
       <div className="flex items-center gap-4 p-6 pt-safe-top z-10 sticky top-0 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
          <button onClick={() => { onBack(); triggerHaptic(); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 active:scale-95 transition-all">
             <ArrowLeft size={20}/>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
       </div>
       <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-32 hide-scrollbar">
          <div className="max-w-3xl mx-auto w-full pt-4">
             {children}
          </div>
       </div>
    </div>
  );
};

// 6. Disease Detector Component
const DiseaseDetector = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
         if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    const res = await analyzeCropDisease(image, lang);
    setResult(res || "Error analyzing image.");
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SimpleView title={t.scan_title} onBack={onBack}>
       <div className="flex flex-col gap-6 animate-enter pb-20">
          {/* Image Area */}
          <div className="aspect-square w-full md:aspect-video rounded-[2.5rem] glass-panel border border-white/10 relative overflow-hidden flex flex-col items-center justify-center bg-slate-900/40 group shadow-2xl">
             {image ? (
               <div className="relative w-full h-full">
                 <img src={image} alt="Crop" className="w-full h-full object-cover" />
                 {!analyzing && !result && (
                     <button onClick={reset} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                        <X size={16} />
                     </button>
                 )}
               </div>
             ) : (
               <div className="text-center p-6 relative z-10">
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 cursor-pointer group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                     <Camera size={36} className="text-cyan-300 relative z-10 drop-shadow-md"/>
                  </div>
                  <p className="text-slate-300 font-bold text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">{t.scan_desc}</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="primary" icon={<Camera size={18}/>} className="shadow-cyan-500/20">
                     {t.take_photo}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} capture="environment" />
               </div>
             )}
          </div>

          {/* Controls / Result */}
          {image && !analyzing && !result && (
             <div className="flex gap-3 animate-enter">
                <Button onClick={reset} variant="secondary" fullWidth className="py-4">Retake</Button>
                <Button onClick={analyze} variant="primary" fullWidth icon={<ScanLine size={18}/>} className="py-4 shadow-emerald-500/20 from-emerald-600 to-teal-600">Analyze Disease</Button>
             </div>
          )}

          {analyzing && (
             <div className="glass-panel p-10 rounded-[2rem] flex flex-col items-center justify-center text-center animate-enter border border-cyan-500/20 bg-cyan-900/5">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 size={48} className="text-cyan-400 animate-spin relative z-10"/>
                </div>
                <p className="font-bold text-xl text-white animate-pulse">{t.analyzing}</p>
                <p className="text-slate-400 text-sm mt-2">Checking for symptoms...</p>
             </div>
          )}

          {result && (
             <div className="glass-panel p-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-900/10 to-transparent animate-enter shadow-2xl shadow-emerald-900/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={24}/>
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-white">{t.analysis_report}</h3>
                       <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">AI Diagnosis Complete</p>
                   </div>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                   <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                   <Button variant="primary" fullWidth icon={<Share2 size={18}/>}>{t.share_expert}</Button>
                   <Button onClick={reset} variant="ghost" fullWidth>Scan Another Crop</Button>
                </div>
             </div>
          )}
       </div>
    </SimpleView>
  );
};

// 7. Soil Analysis Component
const SoilAnalysis = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [n, setN] = useState(50);
    const [p, setP] = useState(30);
    const [k, setK] = useState(20);
    const [crop, setCrop] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!crop) return;
        setLoading(true);
        const advice = await getSoilAdvice({ n, p, k }, crop, lang);
        setResult(advice);
        setLoading(false);
    };

    return (
        <SimpleView title={t.soil_title} onBack={onBack}>
            <div className="space-y-6 pb-20 animate-enter">
                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-1 text-white">{t.soil_subtitle}</h2>
                        <p className="text-slate-400 text-sm mb-6">Adjust sliders based on your soil health card.</p>
                        
                        {/* Sliders */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-green-300">{t.n_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{n}</span>
                                </div>
                                <input type="range" min="0" max="200" value={n} onChange={(e) => setN(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-blue-300">{t.p_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{p}</span>
                                </div>
                                <input type="range" min="0" max="100" value={p} onChange={(e) => setP(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-orange-300">{t.k_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{k}</span>
                                </div>
                                <input type="range" min="0" max="100" value={k} onChange={(e) => setK(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                            </div>
                        </div>

                        {/* Crop Input */}
                        <div className="mt-8">
                            <label className="block text-sm font-bold text-slate-300 mb-2">{t.crop_input}</label>
                            <input 
                                type="text" 
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                placeholder="e.g. Soyabean, Cotton, Rice"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div className="mt-8">
                            <Button 
                                fullWidth 
                                onClick={handleAnalyze} 
                                loading={loading}
                                disabled={!crop}
                                variant="primary"
                                icon={<FlaskConical size={18} />}
                                className="from-orange-600 to-amber-600 shadow-orange-500/20"
                            >
                                {t.analyze_soil_btn}
                            </Button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-cyan-500/20 bg-gradient-to-b from-cyan-900/10 to-transparent animate-enter shadow-2xl">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                                <TestTube size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{t.soil_result_title}</h3>
                                <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">AI Recommendation</p>
                            </div>
                         </div>
                         <div className="prose prose-invert prose-lg max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                         </div>
                    </div>
                )}
            </div>
        </SimpleView>
    );
};

// 8. Yield Predictor Component
const YieldPredictor = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [crop, setCrop] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [soil, setSoil] = useState('');
    const [irrigation, setIrrigation] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handlePredict = async () => {
        if (!crop || !area) return;
        setLoading(true);
        const prediction = await predictYield({ crop, sowingDate, soilType: soil, irrigation, area }, lang);
        setResult(prediction);
        setLoading(false);
    };

    return (
        <SimpleView title={t.yield_title} onBack={onBack}>
            <div className="space-y-6 pb-20 animate-enter">
                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 relative overflow-hidden bg-slate-900/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.crop_input}</label>
                             <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.sowing_date}</label>
                             <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.soil_type}</label>
                             <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50">
                                 <option value="">Select Soil</option>
                                 <option value="Black">Black Soil (काळी)</option>
                                 <option value="Red">Red Soil (तांबडी)</option>
                                 <option value="Sandy">Sandy (रेताड)</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.irrigation_type}</label>
                             <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50">
                                 <option value="">Select Type</option>
                                 <option value="Rainfed">Rainfed (जिरायती)</option>
                                 <option value="Irrigated">Irrigated (बागायती)</option>
                             </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.area_size}</label>
                             <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g. 2.5" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <Button fullWidth onClick={handlePredict} loading={loading} variant="primary" className="from-blue-600 to-cyan-600 shadow-blue-500/20">{t.predict_btn}</Button>
                    </div>
                </div>

                {result && (
                     <div className="glass-panel p-6 rounded-[2rem] border border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent animate-enter shadow-2xl">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <TrendingUp size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{t.yield_result}</h3>
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">AI Forecast</p>
                            </div>
                         </div>
                         <div className="prose prose-invert prose-lg max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                         </div>
                    </div>
                )}
            </div>
        </SimpleView>
    );
};

// 9. Area Calculator Component (Simulated Satellite Map)
const AreaCalculator = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [points, setPoints] = useState<{x: number, y: number}[]>([]);
    const [areaSqM, setAreaSqM] = useState(0);

    const mapRef = useRef<HTMLDivElement>(null);
    const SCALE_FACTOR = 0.5; // 1 pixel = 0.5 meter (Simulated)

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapRef.current) return;
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newPoints = [...points, {x, y}];
        setPoints(newPoints);
        calculateArea(newPoints);
        triggerHaptic();
    };

    const calculateArea = (pts: {x: number, y: number}[]) => {
        if (pts.length < 3) {
            setAreaSqM(0);
            return;
        }
        // Shoelace formula
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            area += pts[i].x * pts[j].y;
            area -= pts[j].x * pts[i].y;
        }
        area = Math.abs(area) / 2;
        // Convert pixels squared to meters squared
        // If 1px = SCALE_FACTOR m, then 1px^2 = SCALE_FACTOR^2 m^2
        const areaInMeters = area * (SCALE_FACTOR * SCALE_FACTOR);
        setAreaSqM(areaInMeters);
    };

    const undo = () => {
        const newPoints = points.slice(0, -1);
        setPoints(newPoints);
        calculateArea(newPoints);
    };

    const reset = () => {
        setPoints([]);
        setAreaSqM(0);
    };

    // Conversions
    const sqMeter = areaSqM;
    const guntha = sqMeter / 101.17;
    const acre = sqMeter / 4046.86;
    const hectare = sqMeter / 10000;
    const bigha = sqMeter / 2500; // Approx

    return (
        <SimpleView title={t.area_title} onBack={onBack}>
            <div className="flex flex-col h-full animate-enter">
                
                {/* Simulated Map Container */}
                <div 
                    ref={mapRef}
                    onClick={handleMapClick}
                    className="relative w-full aspect-square md:aspect-video bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/20 touch-none cursor-crosshair group"
                >
                    {/* Simulated Satellite Image */}
                    <img 
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                        alt="Satellite Map" 
                        className="w-full h-full object-cover opacity-80 group-active:scale-[1.01] transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/10 pointer-events-none">
                        SIMULATION MODE • 1px ≈ 0.5m
                    </div>

                    {/* SVG Overlay for Polygons */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon 
                            points={points.map(p => `${p.x},${p.y}`).join(' ')} 
                            fill="rgba(34, 211, 238, 0.3)" 
                            stroke="#22d3ee" 
                            strokeWidth="2"
                        />
                        {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#22d3ee" strokeWidth="2" />
                        ))}
                    </svg>

                    {/* Instructions Overlay */}
                    {points.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold animate-pulse border border-white/10">
                                {t.area_subtitle}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-4 px-2">
                    <button onClick={undo} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <Undo2 size={18}/> <span className="text-xs font-bold uppercase">{t.undo_point}</span>
                    </button>
                    <button onClick={reset} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                        <RotateCcw size={18}/> <span className="text-xs font-bold uppercase">{t.reset_map}</span>
                    </button>
                </div>

                {/* Results Card */}
                <div className="mt-6 glass-panel rounded-[2rem] p-6 border border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-transparent">
                    <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                        <Calculator size={20} className="text-purple-400"/> {t.total_area}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-400 font-bold uppercase">{t.unit_sqm}</p>
                            <p className="text-2xl font-mono text-white font-bold">{sqMeter.toFixed(1)}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-purple-300 font-bold uppercase">{t.unit_guntha}</p>
                            <p className="text-2xl font-mono text-white font-bold">{guntha.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-blue-300 font-bold uppercase">{t.unit_acre}</p>
                            <p className="text-2xl font-mono text-white font-bold">{acre.toFixed(3)}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-pink-300 font-bold uppercase">{t.unit_hectare}</p>
                            <p className="text-2xl font-mono text-white font-bold">{hectare.toFixed(3)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleView>
    );
}

const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [active, setActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    let mounted = true;
    const init = async () => {
        try {
            const apiKey = getGenAIKey();
            if(!apiKey) throw new Error("API Key Missing");

            const ai = new GoogleGenAI({ apiKey });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            
            // Output Context
            const ctx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            // Input Context
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const config = {
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: lang === 'mr' ? "Speak in Marathi. Keep it short." : "Keep it short."
                }
            };

            const sessionPromise = ai.live.connect({
                model: config.model,
                config: config.config,
                callbacks: {
                    onopen: () => {
                        if(!mounted) return;
                        setActive(true);
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        processor.onaudioprocess = (e) => {
                            if(!mounted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            const blob = createPCMChunk(inputData, inputCtx.sampleRate);
                            sessionPromise.then(s => s.sendRealtimeInput({ media: blob }));
                        };
                        
                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                        
                        sourceRef.current = source;
                        processorRef.current = processor;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                         if(!mounted) return;
                         const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                         if (audioData) {
                             setSpeaking(true);
                             const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                             const source = ctx.createBufferSource();
                             source.buffer = buffer;
                             source.connect(ctx.destination);
                             
                             nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                             source.start(nextStartTimeRef.current);
                             nextStartTimeRef.current += buffer.duration;
                             
                             sourcesRef.current.add(source);
                             source.onended = () => {
                                 sourcesRef.current.delete(source);
                                 if(sourcesRef.current.size === 0) setSpeaking(false);
                             };
                         }
                         if (msg.serverContent?.turnComplete) setSpeaking(false);
                    },
                    onclose: () => { if(mounted) setActive(false); },
                    onerror: (e) => { 
                        console.error(e);
                        if(mounted) setError("Connection Error"); 
                    }
                }
            });
            sessionRef.current = sessionPromise;

        } catch (e) {
            if(mounted) setError("Microphone Error");
        }
    };
    
    init();

    return () => {
        mounted = false;
        sourcesRef.current.forEach(s => s.stop());
        if (sessionRef.current) sessionRef.current.then((s:any) => { try { s.close() } catch(e){} });
        audioContextRef.current?.close();
        streamRef.current?.getTracks().forEach(t => t.stop());
        sourceRef.current?.disconnect();
        processorRef.current?.disconnect();
    };
  }, [lang]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center p-6 animate-enter">
        <button onClick={onBack} className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-50 hover:bg-white/20">
            <X size={24}/>
        </button>
        <div className="relative">
             <div className={clsx("w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all", (active) ? "scale-100 opacity-100" : "scale-50 opacity-0")}></div>
             <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] relative z-10">
                 {speaking ? <Activity size={48} className="text-white animate-bounce"/> : <Mic size={48} className="text-white"/>}
             </div>
        </div>
        <h2 className="text-2xl font-black text-white mt-12 text-center">{error || (active ? (speaking ? "Speaking..." : "Listening...") : "Connecting...")}</h2>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [lang, setLang] = useState<Language>('mr');
  const [user] = useState<UserProfile>({ name: "Suresh Patil", village: "Satara", district: "Satara", landSize: "5 Acres", crop: "Soyabean" });

  const getView = () => {
    switch(view) {
       case 'DASHBOARD': return <Dashboard lang={lang} user={user} onNavigate={setView} />;
       case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SOIL': return <SoilAnalysis lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'YIELD': return <YieldPredictor lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'AREA_CALCULATOR': return <AreaCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'MARKET': 
         return <SimpleView title={TRANSLATIONS[lang].market_title} onBack={() => setView('DASHBOARD')}>
            <div className="space-y-4">
                 <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-white/10 flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Market Status</p>
                        <p className="text-white font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> APMC Satara Open</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Updated</p>
                        <p className="text-white font-mono">Today, 10:30 AM</p>
                    </div>
                 </div>

                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {MOCK_MARKET.map((m,i) => (
                    <div key={i} onClick={triggerHaptic} className="glass-panel p-4 rounded-2xl flex flex-col gap-3 animate-enter active:scale-[0.98] transition-all bg-white/5 hover:border-cyan-500/30 shadow-lg" style={{animationDelay: `${i*100}ms`}}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shadow-inner`}><m.icon size={24} className={m.color}/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{m.name}</h3>
                                    <p className="text-slate-400 text-xs font-bold">Arrival: {m.arrival}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-xl text-white block">₹{m.price}</span>
                                <span className={`text-xs font-bold ${m.trend.includes('+') ? 'text-green-400' : 'text-red-400'} flex items-center justify-end gap-1`}>
                                    {m.trend.includes('+') ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                    {m.trend}
                                </span>
                            </div>
                        </div>
                        {/* Mock Mini Chart */}
                        <div className="h-10 w-full flex items-end justify-between gap-1 pt-2 border-t border-white/5 opacity-50">
                            {m.history.map((h, idx) => (
                                <div key={idx} className={`w-full rounded-t-sm ${m.trend.includes('+') ? 'bg-green-500' : 'bg-red-500'}`} style={{height: `${(h/10000)*100}%`}}></div>
                            ))}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
         </SimpleView>;
       case 'WEATHER':
         return <SimpleView title={TRANSLATIONS[lang].weather_title} onBack={() => setView('DASHBOARD')}>
            <div className="space-y-6 animate-enter">
                <div onClick={triggerHaptic} className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-[2.5rem] text-center shadow-2xl shadow-indigo-500/30 relative overflow-hidden border border-white/10 active:scale-[0.99] transition-transform">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/30 blur-3xl rounded-full"></div>
                   <Sun size={80} className="mx-auto mb-4 text-amber-300 animate-[spin_20s_linear_infinite] drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]"/>
                   <h2 className="text-8xl font-black mb-1 tracking-tighter">28°</h2>
                   <p className="text-xl font-bold opacity-90 mb-6">Sunny Day • Satara</p>
                   
                   <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Wind</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Wind size={16}/> 12 km/h</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Humidity</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Droplets size={16}/> 45%</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">UV Index</p>
                            <p className="font-bold text-lg flex items-center justify-center gap-1"><Sun size={16}/> High</p>
                        </div>
                   </div>
                </div>

                {/* Hourly Forecast Strip */}
                <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Clock size={16} className="text-cyan-400"/> Hourly Forecast</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                        {WEATHER_HOURLY.map((w, i) => (
                            <div key={i} className="glass-panel min-w-[80px] p-3 rounded-2xl flex flex-col items-center justify-center bg-white/5">
                                <span className="text-slate-400 text-xs font-bold mb-2">{w.time}</span>
                                <w.icon size={24} className="text-white mb-2" />
                                <span className="font-bold text-white">{w.temp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            
                {/* 3 Day Forecast List */}
                <div className="glass-panel rounded-[2rem] p-5 border border-white/10">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar size={16} className="text-fuchsia-400"/> 3-Day Forecast</h3>
                     <div className="space-y-4">
                        {[
                            { day: 'Tomorrow', icon: CloudSun, temp: '27° / 18°', desc: 'Partly Cloudy' },
                            { day: 'Wednesday', icon: CloudRain, temp: '24° / 19°', desc: 'Light Rain' },
                            { day: 'Thursday', icon: Sun, temp: '29° / 20°', desc: 'Sunny' },
                        ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <d.icon size={20} className="text-slate-300"/>
                                    <div>
                                        <p className="text-white font-bold text-sm">{d.day}</p>
                                        <p className="text-slate-500 text-xs">{d.desc}</p>
                                    </div>
                                </div>
                                <span className="text-white font-mono font-bold">{d.temp}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
         </SimpleView>;
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
