
import React, { useEffect, useState, useRef } from 'react';
import { Sprout, Fingerprint, Activity, Cpu, SkipForward } from 'lucide-react';
import { clsx } from 'clsx';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  // Mode: 'VIDEO' tries to load video first. If error, switches to 'ORB'.
  const [mode, setMode] = useState<'VIDEO' | 'ORB'>('VIDEO'); 
  const [videoSrc, setVideoSrc] = useState<string>('');
  
  // Animation Phases for ORB Mode
  const [orbPhase, setOrbPhase] = useState(0); // 0=Init, 1=Grow, 2=Text, 3=Exit
  const [isExiting, setIsExiting] = useState(false);

  // --- VIDEO LOGIC ---
  useEffect(() => {
    const handleResize = () => {
        const isMobile = window.innerWidth < 768 || window.innerHeight > window.innerWidth;
        setVideoSrc(isMobile ? '/splash-v.mp4' : '/splash-h.mp4');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleVideoEnd = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  const handleVideoError = () => {
    console.warn("Splash video missing or failed. Switching to 5D Orb Animation.");
    setMode('ORB');
  };

  // --- ORB ANIMATION SEQUENCER ---
  useEffect(() => {
    if (mode === 'ORB') {
        const t1 = setTimeout(() => setOrbPhase(1), 100);    // Orb/Grid Appear
        const t2 = setTimeout(() => setOrbPhase(2), 2000);   // Text Reveal
        const t3 = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800); 
        }, 5000); // Total Orb duration

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
    }
  }, [mode, onComplete]);

  // --- RENDER ---
  return (
    <div className={clsx(
        "fixed inset-0 z-[9999] bg-[#000501] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out",
        isExiting ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
    )}>
        
        {/* =======================
            MODE 1: VIDEO PLAYER 
           ======================= */}
        {mode === 'VIDEO' && videoSrc && (
            <>
                <video
                    key={videoSrc}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    onError={handleVideoError}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
                
                {/* Skip Button */}
                <button 
                    onClick={handleVideoEnd}
                    className="absolute bottom-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group"
                >
                    Skip <SkipForward size={12} className="group-hover:translate-x-0.5 transition-transform"/>
                </button>
            </>
        )}

        {/* =======================
            MODE 2: 5D ORB ENGINE (Fallback)
           ======================= */}
        {mode === 'ORB' && (
            <>
                <style>{`
                    @keyframes grid-move { 
                        0% { background-position: 0 0; } 
                        100% { background-position: 0 40px; } 
                    }
                    @keyframes float-orb {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes plant-grow {
                        0% { transform: scale(0) translateY(20px); opacity: 0; }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                    @keyframes scan-light {
                        0% { top: -20%; opacity: 0; }
                        50% { opacity: 1; box-shadow: 0 0 30px rgba(52, 211, 153, 0.8); }
                        100% { top: 120%; opacity: 0; }
                    }
                    @keyframes gyro-spin-x { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(180deg); } }
                    @keyframes gyro-spin-y { 0% { transform: rotateX(0deg) rotateZ(0deg); } 100% { transform: rotateX(-180deg) rotateZ(360deg); } }
                    
                    .circuit-grid {
                        background-image: 
                            linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px);
                        background-size: 50px 50px;
                        transform: perspective(600px) rotateX(60deg) scale(2);
                        transform-origin: center top;
                        animation: grid-move 3s linear infinite;
                        mask-image: radial-gradient(circle at center top, black 0%, transparent 80%);
                    }
                    .preserve-3d { transform-style: preserve-3d; }
                `}</style>

                {/* 1. Deep Space & Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#020617_60%,_#000000_100%)] opacity-80"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                
                {/* Circuit Floor */}
                <div className={`absolute bottom-0 left-[-50%] right-[-50%] h-[60%] flex justify-center transition-opacity duration-1000 delay-300 ${orbPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full h-full circuit-grid"></div>
                </div>

                {/* 2. The 3D Gyro-Orb */}
                <div className={`relative z-20 w-80 h-80 flex items-center justify-center transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${orbPhase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    
                    {/* Floating Container */}
                    <div className="absolute inset-0 animate-[float-orb_6s_ease-in-out_infinite] preserve-3d">
                        
                        {/* Outer Gyro Rings */}
                        <div className="absolute inset-[-20px] rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-[gyro-spin-x_10s_linear_infinite] preserve-3d">
                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"></div>
                        </div>
                        <div className="absolute inset-0 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] animate-[gyro-spin-y_15s_linear_infinite_reverse] preserve-3d"></div>

                        {/* THE GLASS ORB */}
                        <div className="absolute inset-4 rounded-full bg-gradient-to-b from-white/10 to-emerald-950/60 backdrop-blur-[3px] border border-white/10 shadow-[inset_0_0_40px_rgba(16,185,129,0.2),_0_0_50px_rgba(16,185,129,0.3)] overflow-hidden">
                            
                            {/* Inner Plasma */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 mix-blend-overlay"></div>
                            
                            {/* Specular Highlight */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-md"></div>

                            {/* Holographic Plant */}
                            <div className="absolute inset-0 flex items-center justify-center pt-6">
                                <div style={{ animation: orbPhase >= 1 ? 'plant-grow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none', opacity: 0 }}>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400/30 blur-2xl rounded-full"></div>
                                        <Sprout size={130} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,1)] relative z-10" strokeWidth={1} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Scanning Beam */}
                            <div className="absolute left-0 right-0 h-[2px] bg-emerald-300 shadow-[0_0_30px_#6ee7b7] blur-[1px] opacity-0"
                                style={{ animation: 'scan-light 3s ease-in-out infinite 1.5s' }}></div>
                        </div>
                    </div>
                </div>

                {/* 3. Cinematic Text */}
                <div className={`mt-20 relative z-30 text-center transition-all duration-1000 delay-500 ${orbPhase >= 2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-10 blur-sm'}`}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="px-3 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-900/30 backdrop-blur-md flex items-center gap-2">
                            <Activity size={10} className="text-emerald-400 animate-pulse"/> 
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">System Online</span>
                        </div>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]">
                        AI KRUSHI
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-2">
                         <div className="h-[1px] w-12 bg-emerald-500/50"></div>
                         <span className="text-sm font-bold text-emerald-400 tracking-[0.5em] uppercase">Mitra</span>
                         <div className="h-[1px] w-12 bg-emerald-500/50"></div>
                    </div>
                </div>

                {/* 4. Bottom HUD */}
                <div className={`absolute bottom-10 w-full px-10 flex justify-between items-end transition-opacity duration-1000 delay-700 ${orbPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex flex-col gap-1">
                        <Cpu size={20} className="text-emerald-500/50"/>
                        <div className="h-1 w-12 bg-emerald-500/20 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-emerald-500/50"></div>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-500/50 uppercase">Core: Active</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 items-end">
                        <Fingerprint size={20} className="text-emerald-500/50"/>
                         <span className="text-[8px] font-mono text-emerald-500/50 uppercase">Ver: 4.0.2</span>
                    </div>
                </div>
            </>
        )}

    </div>
  );
};
