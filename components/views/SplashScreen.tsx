
import React, { useEffect, useState } from 'react';
import { Sprout, Activity, Fingerprint, Zap } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0); // 0=Init, 1=Ignite, 2=Stabilize, 3=Exit

  useEffect(() => {
    // Cinematic Timeline
    const t1 = setTimeout(() => setPhase(1), 100);   // Ignite Orb
    const t2 = setTimeout(() => setPhase(2), 2000);  // Text Reveal
    const t3 = setTimeout(() => {
        setPhase(3); // Exit
        setTimeout(onComplete, 800); // Unmount
    }, 4500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${phase === 3 ? 'opacity-0 scale-125 pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        {/* --- 5D ANIMATION ENGINE --- */}
        <style>{`
            @keyframes gyro-spin-x { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(180deg); } }
            @keyframes gyro-spin-y { 0% { transform: rotateX(0deg) rotateZ(0deg); } 100% { transform: rotateX(-180deg) rotateZ(360deg); } }
            @keyframes gyro-spin-z { 0% { transform: rotateY(0deg) rotateZ(0deg); } 100% { transform: rotateY(360deg) rotateZ(-180deg); } }
            
            @keyframes plasma-morph {
                0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
                50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg); }
                100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg); }
            }

            @keyframes text-cinematic {
                0% { opacity: 0; letter-spacing: -0.5em; filter: blur(12px); transform: scale(0.8); }
                40% { opacity: 0.6; }
                100% { opacity: 1; letter-spacing: 0.15em; filter: blur(0px); transform: scale(1); }
            }
            
            @keyframes scan-beam {
                0% { top: -100%; opacity: 0; }
                50% { opacity: 1; }
                100% { top: 200%; opacity: 0; }
            }

            .orb-glow {
                box-shadow: 0 0 80px rgba(16, 185, 129, 0.3), inset 0 0 40px rgba(6, 182, 212, 0.3);
            }
            
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
        `}</style>

        {/* 1. Deep Space Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_60%,_#000000_100%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        
        {/* Grid Floor */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(500px)_rotateX(60deg)_scale(3)] origin-bottom opacity-20"></div>

        {/* 2. The Quantum Agri-Orb */}
        <div className="relative w-80 h-80 flex items-center justify-center perspective-1000 z-20">
            
            {/* Gyroscope Rings */}
            <div className={`absolute inset-0 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-1000 ease-out preserve-3d ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                 style={{ animation: 'gyro-spin-x 12s linear infinite' }}>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"></div>
            </div>
            
            <div className={`absolute inset-6 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-1000 delay-100 ease-out preserve-3d ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                 style={{ animation: 'gyro-spin-y 15s linear infinite reverse' }}>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
            </div>
            
            <div className={`absolute inset-12 rounded-full border border-white/10 border-dashed transition-all duration-1000 delay-200 ease-out preserve-3d ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                 style={{ animation: 'gyro-spin-z 20s linear infinite' }}>
            </div>

            {/* Core Plasma */}
            <div className={`relative w-40 h-40 orb-glow rounded-full transition-all duration-700 ease-out ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                {/* Liquid Morphing blobs */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-500 opacity-80 mix-blend-screen"
                     style={{ animation: 'plasma-morph 6s ease-in-out infinite' }}></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-cyan-600 to-blue-500 opacity-60 mix-blend-overlay"
                     style={{ animation: 'plasma-morph 8s ease-in-out infinite reverse' }}></div>

                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <div className="relative">
                         <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                         <Sprout size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] relative z-10" strokeWidth={1.5} />
                    </div>
                </div>
                
                {/* Holographic Scan Beam */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-white/20 to-transparent w-full"
                         style={{ animation: 'scan-beam 3s ease-in-out infinite' }}></div>
                </div>
            </div>
        </div>

        {/* 3. Cinematic Typography */}
        <div className="mt-16 text-center z-30 relative">
            <h1 className={`text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-cyan-200 drop-shadow-2xl ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
                style={{ animation: phase >= 2 ? 'text-cinematic 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none' }}>
                AI KRUSHI
            </h1>
            
            {/* Subtitle with Tech Lines */}
            <div className={`mt-6 flex items-center justify-center gap-4 transition-all duration-700 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Fingerprint size={12} className="text-emerald-400 animate-pulse"/>
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.25em]">
                        Quantum Engine 4.0
                    </span>
                </div>
                <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
            </div>
        </div>

        {/* 4. Bottom Loader */}
        <div className={`absolute bottom-12 w-64 flex flex-col items-center gap-3 transition-opacity duration-500 delay-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 w-1/2 animate-[shimmer_1.5s_infinite]"></div>
            </div>
            <div className="flex justify-between w-full text-[9px] font-mono text-slate-500 uppercase">
                <span className="flex items-center gap-1"><Activity size={8} className="text-emerald-500"/> System Check</span>
                <span>100%</span>
            </div>
        </div>

    </div>
  );
};
