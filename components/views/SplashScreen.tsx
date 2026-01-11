
import React, { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Animation Timeline
    const timer1 = setTimeout(() => setStage(1), 100);   // Start: Fade in, Orb silhouette
    const timer2 = setTimeout(() => setStage(2), 800);   // Ignite: Orb pulse, colors
    const timer3 = setTimeout(() => setStage(3), 2200);  // Text Reveal
    const timer4 = setTimeout(() => setStage(4), 4500);  // Exit Trigger
    const timer5 = setTimeout(onComplete, 5300);         // Unmount after fade out

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#020617] transition-opacity duration-[800ms] ease-in-out ${stage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
       
       {/* 1. Cinematic Background & Atmosphere */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#020617_70%)] opacity-40 transition-opacity duration-[2000ms]" style={{ opacity: stage >= 2 ? 0.4 : 0 }}></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay"></div>
       
       {/* Floating Digital Particles (Pollen/Data) */}
       <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          {[...Array(20)].map((_, i) => (
             <div key={i} 
                  className="absolute rounded-full bg-emerald-400/30 blur-[1px]"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 1}px`,
                    height: `${Math.random() * 4 + 1}px`,
                    animation: `float-particle ${5 + Math.random() * 10}s linear infinite`
                  }}
             />
          ))}
       </div>

       {/* 2. The Orb of Intelligent Growth */}
       <div className="relative w-[300px] h-[300px] flex items-center justify-center">
           
           {/* Outer Glow Halo */}
           <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-[60px] transition-all duration-[2000ms] ${stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
           
           {/* Saffron Gold Ring (Trust/Ethos) */}
           <div className={`absolute inset-0 rounded-full border border-amber-500/30 border-t-amber-400/80 border-b-transparent transition-all duration-[1500ms] ease-out ${stage >= 2 ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-[-90deg] scale-90'}`} style={{ animation: stage >= 2 ? 'spin-slow 15s linear infinite' : 'none' }}></div>
           
           {/* AI Blue Neural Network Ring */}
           <div className={`absolute inset-4 rounded-full border border-cyan-400/20 border-r-cyan-400/60 border-l-transparent transition-all duration-[1500ms] delay-200 ease-out ${stage >= 2 ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-[90deg] scale-90'}`} style={{ animation: stage >= 2 ? 'spin-reverse-slow 12s linear infinite' : 'none' }}></div>

           {/* Core Orb Structure */}
           <div className={`relative w-40 h-40 rounded-full transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
               
               {/* Emerald Core Gradient */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-900 opacity-90 shadow-[0_0_50px_rgba(16,185,129,0.5)]"></div>
               
               {/* Organic Vein Texture overlay */}
               <div className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay" 
                    style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 40%, #000 100%), repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.1) 10deg 20deg)' }}></div>
               
               {/* Inner Light Pulse (Breathing) */}
               <div className="absolute inset-0 rounded-full bg-emerald-300/20 blur-md animate-pulse-slow"></div>
               
               {/* Specular Highlight (Glass effect) */}
               <div className="absolute top-4 left-6 w-12 h-6 bg-white/20 blur-lg rounded-[100%] rotate-[-45deg]"></div>
           </div>
       </div>

       {/* 3. Typography & Branding */}
       <div className={`mt-8 text-center z-10 transition-all duration-[1000ms] transform ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
           <h1 className="text-4xl md:text-5xl font-black tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-amber-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] font-sans">
               AI KRUSHI MITRA
           </h1>
           <div className="flex items-center justify-center gap-3 mt-4">
               <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/80"></div>
               <p className="text-emerald-400/90 text-xs md:text-sm tracking-[0.3em] font-bold uppercase font-sans">
                   Smart Farming Companion
               </p>
               <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/80"></div>
           </div>
       </div>

       {/* CSS Animations */}
       <style>{`
          @keyframes float-particle {
             0% { transform: translateY(0px) translateX(0px); opacity: 0; }
             50% { opacity: 0.6; }
             100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
          }
          @keyframes spin-slow {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse-slow {
             from { transform: rotate(360deg); }
             to { transform: rotate(0deg); }
          }
          @keyframes pulse-slow {
             0%, 100% { transform: scale(1); opacity: 0.2; }
             50% { transform: scale(1.05); opacity: 0.5; }
          }
          .animate-pulse-slow {
             animation: pulse-slow 4s ease-in-out infinite;
          }
       `}</style>
    </div>
  );
};
