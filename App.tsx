import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Language, UserProfile } from './types';
import { TRANSLATIONS } from './constants';
import { 
  Sprout, CloudSun, ScanLine, Mic, Droplets, ArrowLeft, Home, Store, 
  Wind, Camera, X, Wheat, Sun, MapPin, Clock, ArrowUpRight, 
  Landmark, ChevronRight, CheckCircle2, Loader2,  
  Bell, FileText, Smartphone, CloudRain, Thermometer, UserCircle,
  Share2, Save, MoreHorizontal, LayoutDashboard, WifiOff, RefreshCw,
  Power, MicOff, Activity, LogOut
} from 'lucide-react';
import { Button } from './components/Button';
import { analyzeCropDisease } from './services/geminiService';
import { GoogleGenAI, Modality, Blob as GenAIBlob } from '@google/genai';
import { clsx } from 'clsx';

// --- UTILS ---
const formatDate = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15); 
  }
};

// --- HELPERS ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
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
    data: encode(new Uint8Array(int16.buffer)), 
    mimeType: "audio/pcm;rate=16000" // Always 16kHz
  };
}

// --- MOCK DATA ---
const MOCK_MARKET = [
  { name: 'Soyabean', price: 4850, trend: '+120', arrival: 'High', color: 'text-amber-300', bg: 'bg-amber-500/20', icon: Wheat },
  { name: 'Cotton', price: 7200, trend: '-50', arrival: 'Med', color: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: CloudSun },
  { name: 'Onion', price: 1800, trend: '-200', arrival: 'High', color: 'text-pink-300', bg: 'bg-pink-500/20', icon: Sprout },
];
const MOCK_SCHEMES = [
  { id: 1, title: 'PM-Kisan', sub: '₹6000/Yr', status: 'OPEN', grad: 'from-blue-600 to-violet-600' },
  { id: 2, title: 'Fasal Bima', sub: 'Insurance', status: 'OPEN', grad: 'from-fuchsia-600 to-purple-600' },
  { id: 3, title: 'Solar Pump', sub: '90% Off', status: 'OPEN', grad: 'from-cyan-600 to-blue-600' },
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
    { id: 'BLOG', icon: FileText, label: t.menu_knowledge },
  ];

  return (
    <div className="hidden lg:flex fixed left-6 top-6 bottom-6 w-24 flex-col z-50">
       <div className="glass-panel h-full rounded-[2.5rem] flex flex-col items-center py-8 shadow-[0_0_40px_rgba(79,70,229,0.2)] bg-slate-900/60 border border-white/10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 mb-12 float-3d">
             <Sprout size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full px-2">
             {items.map(item => {
               const active = view === item.id;
               return (
                 <button key={item.id} onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                   className={clsx(
                     "w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group relative",
                     active ? "bg-gradient-to-br from-white/10 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] border border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"
                   )}>
                    <item.icon size={24} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform group-hover:scale-110 duration-300", active && "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                    <span className="text-[10px] font-bold tracking-tight">{item.label.split(' ')[0]}</span>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_15px_#22d3ee]"></div>}
                 </button>
               );
             })}
          </div>
          <button onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative overflow-hidden">
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
    { id: 'DISEASE_DETECTOR', icon: ScanLine },
    { id: 'WEATHER', icon: CloudSun },
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

            {/* Market */}
            <div onClick={() => { onNavigate('MARKET'); triggerHaptic(); }} className="col-span-1 md:col-span-2 lg:col-span-1 row-span-1 glass-panel rounded-[2.5rem] p-5 relative overflow-hidden cursor-pointer group animate-enter delay-300 active:scale-[0.98] transition-all flex flex-col justify-center bg-slate-900/40 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Store size={18} className="text-purple-400"/>
                    {t.menu_market}
                 </h3>
                 <ChevronRight size={16} className="text-slate-500"/>
              </div>
              <div className="flex gap-3 overflow-hidden">
                 {MOCK_MARKET.slice(0,2).map((m,i) => (
                    <div key={i} className="flex-1 glass-panel rounded-2xl p-2 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors">
                       <span className={`text-[9px] font-bold uppercase mb-1 ${m.color}`}>{m.name}</span>
                       <span className="font-black text-lg text-white">₹{m.price}</span>
                    </div>
                 ))}
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

// 4. Immersive "Orb" Voice Assistant (Fullscreen Mobile 100dvh)
const VoiceAssistant = ({ lang, user, onBack }: any) => {
  const t = TRANSLATIONS[lang];
  // Extended state for robustness
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<{role: 'user'|'model', text: string}[]>([]);
  
  // Robust Session Management & "Intent" Tracking
  const shouldStayConnectedRef = useRef(false); // The user's intent to be in the session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSessionRef = useRef<any>(null); 
  
  // Audio Nodes (Split Contexts)
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  
  const nextStartTimeRef = useRef<number>(0);
  const orbRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVolumeRef = useRef(0); 

  // Auto-scroll for transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup Function
  const cleanup = (fullyStop: boolean = false) => {
    console.log("Cleaning up session...");
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }

    if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
    }

    if (activeSessionRef.current) {
        try { activeSessionRef.current.close(); } catch(e) {}
        activeSessionRef.current = null;
    }
    sessionPromiseRef.current = null;
    
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    if (fullyStop) {
        shouldStayConnectedRef.current = false;
        setStatus('idle');
    }
  };

  const handleAutoReconnect = () => {
      if (!shouldStayConnectedRef.current) return;

      if (retryCountRef.current >= 5) {
          setStatus('error');
          setErrorMessage('Network error. Please try again.');
          shouldStayConnectedRef.current = false; 
          return;
      }
      
      setStatus('reconnecting');
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); 
      
      reconnectTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++;
          connect();
      }, delay);
  };

  // Visualizer handles both Input and Output streams
  const visualize = (inputAnalyser: AnalyserNode, outputAnalyser: AnalyserNode) => {
      if(!orbRef.current) return;
      
      // Get Input Level
      const inputData = new Uint8Array(inputAnalyser.frequencyBinCount);
      inputAnalyser.getByteFrequencyData(inputData);
      let inputSum = 0;
      for(let i = 0; i < inputData.length; i++) inputSum += inputData[i];
      const inputAvg = inputSum / inputData.length;

      // Get Output Level
      const outputData = new Uint8Array(outputAnalyser.frequencyBinCount);
      outputAnalyser.getByteFrequencyData(outputData);
      let outputSum = 0;
      for(let i = 0; i < outputData.length; i++) outputSum += outputData[i];
      const outputAvg = outputSum / outputData.length;

      // Combine for single visual
      const maxAvg = Math.max(inputAvg, outputAvg);
      const normalized = maxAvg / 255;

      // Smooth Animation
      const speed = 0.2; 
      lastVolumeRef.current = lastVolumeRef.current + (normalized - lastVolumeRef.current) * speed;
      const vol = lastVolumeRef.current;

      const scale = 1 + (vol * 0.8); 
      const opacity = 0.3 + (vol * 0.7);
      const glowSize = 20 + (vol * 60);
      const glowAlpha = 0.3 + (vol * 0.5);
      
      orbRef.current.style.transform = `scale(${scale})`;
      orbRef.current.style.opacity = `${opacity}`;
      orbRef.current.style.boxShadow = `
          0 0 ${glowSize}px rgba(34, 211, 238, ${glowAlpha}),
          inset 0 0 ${20 + vol * 20}px rgba(168, 85, 247, ${vol * 0.4})
      `;

      animationFrameRef.current = requestAnimationFrame(() => visualize(inputAnalyser, outputAnalyser));
  };

  const connect = async () => {
    if (!navigator.onLine) {
        setStatus('offline');
        return;
    }

    cleanup(false); 
    shouldStayConnectedRef.current = true; 
    setErrorMessage('');
    setStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      // 1. Setup Audio Input (Microphone) - Prefer 16kHz
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      mediaStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      await inputCtx.resume();
      inputContextRef.current = inputCtx;

      // 2. Setup Audio Output (Speaker) - 24kHz for Model
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      await outputCtx.resume();
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 3. Audio Nodes & Graph
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 256;
      inputAnalyser.smoothingTimeConstant = 0.5;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyser.smoothingTimeConstant = 0.5;

      // Connect Input Graph
      source.connect(inputAnalyser);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      // Start Visualizer
      visualize(inputAnalyser, outputAnalyser);

      // 4. Gemini Connection
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: { 
            responseModalities: [Modality.AUDIO], 
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            // Using empty objects is critical for enabling transcription without model errors
            inputAudioTranscription: {}, 
            outputAudioTranscription: {},
            systemInstruction: { parts: [{ text: "You are AI Krushi Mitra. Speak Marathi or English based on user. Keep answers concise." }] }
        },
        callbacks: {
           onopen: () => { 
              console.log("Session Opened");
              retryCountRef.current = 0; 
              setStatus('connected'); 
              triggerHaptic();
           },
           onmessage: async (msg) => {
              // Handle Audio Output
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                 const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                 const sourceNode = outputCtx.createBufferSource();
                 sourceNode.buffer = buffer;
                 
                 // Connect to Output Graph
                 sourceNode.connect(outputAnalyser);
                 sourceNode.connect(outputCtx.destination);
                 
                 const currentTime = outputCtx.currentTime;
                 if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
                 sourceNode.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += buffer.duration;
              }

              // Handle Transcription
              const userTranscript = msg.serverContent?.inputTranscription?.text;
              if (userTranscript) {
                  setTranscripts(prev => [...prev, { role: 'user', text: userTranscript }]);
              }
              const modelTranscript = msg.serverContent?.outputTranscription?.text;
              if (msg.serverContent?.turnComplete && modelTranscript) {
                   // Can add model transcript logic here if needed
              }
           },
           onclose: () => {
               console.log("Session Closed");
               if (shouldStayConnectedRef.current) handleAutoReconnect();
           },
           onerror: (err) => {
               console.error("Session Error:", err);
               if (shouldStayConnectedRef.current) handleAutoReconnect();
           }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      sessionPromise.then(sess => {
          activeSessionRef.current = sess;
      }).catch(e => {
          console.error("Connection Failed:", e);
          handleAutoReconnect();
      });
      
      // 5. Send Audio Logic
      processor.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         // Use the input context's sample rate to downsample correctly
         const blob = createPCMChunk(inputData, inputCtx.sampleRate); 
         
         if (sessionPromiseRef.current) {
             sessionPromiseRef.current.then(session => {
                 if (session === activeSessionRef.current && shouldStayConnectedRef.current) {
                    session.sendRealtimeInput({ media: blob });
                 }
             }).catch(() => {});
         }
      };

    } catch(e: any) { 
        console.error("Setup Failed", e);
        setErrorMessage(e.message || "Failed to connect microphone");
        setStatus('error');
    }
  };

  const handleToggle = () => {
      triggerHaptic();
      if (status === 'idle' || status === 'error') {
          setTranscripts([]);
          connect();
      } else {
          cleanup(true);
      }
  };

  const handleBack = () => {
      cleanup(true);
      onBack();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden h-[100dvh] w-full">
       {/* Cosmic Background */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black"></div>
       <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 blur-[100px] rounded-full"></div>
       <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-cyan-600/20 blur-[100px] rounded-full"></div>

       {/* Top Bar with Enhanced Back Button */}
       <div className="absolute top-0 w-full p-4 pt-4 pt-safe-top flex justify-between items-center z-[210]">
          <button 
             onClick={handleBack} 
             className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg shadow-black/30"
          >
             <Home size={20} className="text-cyan-300"/>
             <span className="font-bold text-sm tracking-wide">Dashboard</span>
          </button>
          
          {/* Status Badge */}
          {status !== 'idle' && (
              <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-full glass-panel transition-colors duration-500", 
                 status === 'connected' ? "border-cyan-500/30 bg-cyan-900/20" : 
                 status === 'reconnecting' ? "border-yellow-500/30 bg-yellow-900/20" :
                 status === 'offline' ? "border-red-500/30 bg-red-900/20" : 
                 status === 'error' ? "border-red-500/30 bg-red-900/20" : "bg-white/5"
              )}>
                 <div className={clsx("w-2 h-2 rounded-full transition-all", 
                    status === 'connected' ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" : 
                    status === 'reconnecting' ? "bg-yellow-400 animate-ping" : 
                    (status === 'offline' || status === 'error') ? "bg-red-500" : "bg-slate-500"
                 )}></div>
                 <span className="text-xs font-bold text-white uppercase tracking-widest">
                     {status === 'connected' ? 'Live' : status === 'reconnecting' ? 'Reconnecting...' : status}
                 </span>
              </div>
          )}
       </div>

       {/* Contextual Memory / Transcript UI */}
       <div className="absolute top-24 inset-x-0 bottom-1/2 overflow-y-auto hide-scrollbar px-6 z-20 flex flex-col gap-3 mask-image-gradient pb-8">
           {status === 'connected' && transcripts.length === 0 && (
               <div className="text-center text-slate-500 text-sm mt-10 animate-pulse">Start speaking...</div>
           )}
           {transcripts.map((msg, i) => (
               <div key={i} className={clsx("p-3 rounded-2xl backdrop-blur-md border border-white/5 max-w-[85%] text-sm font-medium animate-enter shadow-lg", 
                   msg.role === 'user' ? "self-end bg-cyan-500/10 text-cyan-100 rounded-tr-sm border-cyan-500/20" : "self-start bg-purple-500/10 text-purple-100 rounded-tl-sm border-purple-500/20"
               )}>
                   {msg.text}
               </div>
           ))}
           <div ref={transcriptEndRef} />
       </div>

       {/* The ORB - Central Interaction Area */}
       <div className="relative z-30 flex-1 flex items-center justify-center w-full mt-32">
          <div className="relative w-80 h-80 flex items-center justify-center">
             
             {/* Visualizer Orb (Only when active) */}
             {(status === 'connected' || status === 'reconnecting') && (
                <>
                   <div className="absolute inset-0 rounded-full border border-cyan-500/30 scale-[1.3] animate-[spin_10s_linear_infinite]"></div>
                   <div className="absolute inset-0 rounded-full border border-purple-500/20 scale-[1.6] animate-[spin_15s_linear_infinite_reverse]"></div>
                   <div ref={orbRef} className="absolute inset-0 bg-cyan-500/30 rounded-full blur-3xl transition-transform duration-75 ease-out will-change-transform mix-blend-screen"></div>
                </>
             )}
             
             {/* Main Trigger Button */}
             <button onClick={handleToggle} 
                className={clsx("relative z-40 w-48 h-48 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] transition-all duration-500 active:scale-95 touch-manipulation backdrop-blur-xl border-4",
                   status === 'idle' ? "bg-gradient-to-tr from-cyan-600 to-blue-600 border-white/20 animate-pulse" : 
                   status === 'connected' ? "bg-black/80 border-cyan-500/50" :
                   status === 'reconnecting' ? "bg-black/80 border-yellow-500/50" : "bg-black/50 border-white/10"
                )}>
                
                {status === 'connecting' || status === 'reconnecting' ? (
                    <RefreshCw size={64} className={clsx("animate-spin", status === 'reconnecting' ? "text-yellow-400" : "text-cyan-500")}/>
                ) : status === 'idle' ? (
                    <div className="flex flex-col items-center">
                        <Mic size={64} className="text-white drop-shadow-md mb-2"/>
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">Tap to Start</span>
                    </div>
                ) : (status === 'offline' || status === 'error') ? (
                    <WifiOff size={64} className="text-red-400"/>
                ) : (
                    <div className="flex flex-col items-center">
                        <Mic size={56} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,1)] mb-2"/>
                        <span className="text-[10px] font-bold text-cyan-200">Tap to Stop</span>
                    </div>
                )}
             </button>
          </div>
       </div>

       {/* Status Text & Secondary Exit */}
       <div className="mb-safe-bottom pb-8 text-center z-10 px-8 animate-enter delay-100 h-40 flex flex-col items-center justify-end">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2 tracking-tight">
             {status === 'connected' ? "I'm listening..." : 
              status === 'reconnecting' ? "Signal Weak..." :
              status === 'offline' ? "No Internet" :
              status === 'error' ? "Connection Failed" : 
              status === 'connecting' ? "Connecting..." : t.voice_title}
          </h2>
          <p className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed mb-6">
             {errorMessage ? <span className="text-red-400">{errorMessage}</span> : 
              status === 'reconnecting' ? "Boosting signal..." :
              status === 'offline' ? "Waiting for network..." :
              status === 'connected' ? "Go ahead, ask me anything." : 
              status === 'idle' ? t.voice_desc : "Establishing secure link..."}
          </p>

          {/* Secondary Exit Button */}
          <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95">
             <LogOut size={16} />
             <span className="font-bold text-xs uppercase tracking-wider">Exit Voice Mode</span>
          </button>
       </div>
    </div>
  );
};

// 5. Simple View Wrapper
const SimpleView = ({ title, children, onBack }: { title: string, children?: React.ReactNode, onBack: () => void }) => (
  <div className="h-full w-full overflow-y-auto hide-scrollbar pb-32 lg:pl-32 lg:pt-6 lg:pr-6 overscroll-y-contain scroll-smooth z-10 relative">
     <div className="max-w-3xl mx-auto px-4 pt-safe-top">
        <header className="flex items-center gap-4 py-6 mb-4 sticky top-0 z-50 bg-gradient-to-b from-[#020617] to-transparent">
           <button onClick={() => { onBack(); triggerHaptic(); }} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:bg-white/10 active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
           <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{title}</h1>
        </header>
        {children}
     </div>
  </div>
);

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

const App = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [lang, setLang] = useState<Language>('mr');
  const [user] = useState<UserProfile>({ name: "Suresh Patil", village: "Satara", district: "Satara", landSize: "5 Acres", crop: "Soyabean" });

  const getView = () => {
    switch(view) {
       case 'DASHBOARD': return <Dashboard lang={lang} user={user} onNavigate={setView} />;
       case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'MARKET': 
         return <SimpleView title={TRANSLATIONS[lang].market_title} onBack={() => setView('DASHBOARD')}>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">{MOCK_MARKET.map((m,i) => (
               <div key={i} onClick={triggerHaptic} className="glass-panel p-4 rounded-2xl flex items-center justify-between animate-enter active:scale-[0.98] transition-all bg-white/5 hover:border-cyan-500/30" style={{animationDelay: `${i*100}ms`}}>
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shadow-inner`}><m.icon size={24} className={m.color}/></div>
                     <div><h3 className="font-bold text-lg text-white">{m.name}</h3><p className="text-slate-400 text-xs font-bold">₹{m.price}/qt</p></div>
                  </div>
                  <span className={`font-black text-lg ${m.trend.includes('+') ? 'text-green-400' : 'text-red-400'}`}>{m.trend}</span>
               </div>
            ))}</div></SimpleView>;
       case 'WEATHER':
         return <SimpleView title={TRANSLATIONS[lang].weather_title} onBack={() => setView('DASHBOARD')}>
            <div onClick={triggerHaptic} className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-[2.5rem] text-center mb-6 shadow-2xl shadow-indigo-500/30 animate-enter relative overflow-hidden border border-white/10 active:scale-[0.99] transition-transform">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/30 blur-3xl rounded-full"></div>
               <Sun size={80} className="mx-auto mb-4 text-amber-300 animate-[spin_20s_linear_infinite] drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]"/>
               <h2 className="text-8xl font-black mb-1 tracking-tighter">28°</h2>
               <p className="text-xl font-bold opacity-90">Sunny Day • Satara</p>
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