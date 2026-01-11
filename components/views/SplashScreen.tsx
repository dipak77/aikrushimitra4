
import React, { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Aggressive timing for a punchy, impressive intro
    const timer1 = setTimeout(() => setStage(1), 100);   // Background Fade In
    const timer2 = setTimeout(() => setStage(2), 600);   // Orb Explosion & Particles
    const timer3 = setTimeout(() => setStage(3), 1600);  // Text Impact
    const timer4 = setTimeout(() => setStage(4), 5000);  // Exit Animation
    const timer5 = setTimeout(onComplete, 5800);         // Unmount

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black transition-opacity duration-700 ease-out ${stage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
       
       {/* === 1. HIGH DYNAMIC RANGE BACKGROUND === */}
       <div className="absolute inset-0 z-0">
           {/* Image Layer with Ken Burns Effect & High Contrast Filters */}
           <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                    // Using a vibrant, high-quality image of Indian farming
                    backgroundImage: `url('https://images.unsplash.com/photo-1627920769843-2d5fb4660724?q=80&w=2548&auto=format&fit=crop')`, 
                    // Boosting contrast and saturation for that "Impressive" look
                    filter: 'brightness(0.7) contrast(1.2) saturate(1.4)', 
                    animation: stage >= 1 ? 'ken-burns 20s linear forwards' : 'none'
                }}
           ></div>
           
           {/* Patriotic Gradient Overlay (Stronger & Vivid) */}
           <div className="absolute inset-0 bg-gradient-to-b from-orange-600/70 via-indigo-900/30 to-emerald-800/70 mix-blend-overlay"></div>
           
           {/* Cinematic Radial Vignette (Focus on Center) */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#000_100%)] opacity-80"></div>
           
           {/* Fine Noise Texture for Film Look */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
       </div>

       {/* === 2. GLOWING PARTICLE SYSTEM === */}
       <div className={`absolute inset-0 z-10 ${stage >= 2 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
           {/* Saffron Embers */}
           {[...Array(12)].map((_, i) => (
               <div key={`s-${i}`} className="particle bg-orange-500 box-shadow-glow-orange" style={getParticleStyle(i)} />
           ))}
           {/* Green Spores */}
           {[...Array(12)].map((_, i) => (
               <div key={`g-${i}`} className="particle bg-emerald-500 box-shadow-glow-green" style={getParticleStyle(i + 12)} />
           ))}
           {/* White/Blue Sparkles */}
           {[...Array(10)].map((_, i) => (
               <div key={`w-${i}`} className="particle bg-cyan-300 box-shadow-glow-cyan" style={getParticleStyle(i + 24)} />
           ))}
       </div>

       {/* === 3. THE "JAI KISAN" 3D REACTOR ORB === */}
       <div className="relative z-20 w-[340px] h-[340px] flex items-center justify-center perspective-1000">
           
           {/* A. God Rays / Volumetric Glow (Pulsing) */}
           <div className={`absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-white/20 to-emerald-500/40 blur-[80px] rounded-full transition-all duration-[1000ms] ${stage >= 2 ? 'opacity-100 scale-125' : 'opacity-0 scale-50'} animate-pulse-slow`}></div>

           {/* B. Outer Ring: Saffron (Rotate X-Axis) - Represents Strength */}
           <div className={`absolute inset-0 rounded-full border-[4px] border-transparent border-t-orange-500 border-l-orange-500/60 shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} 
                style={{ animation: 'spin-3d-x 6s linear infinite' }}></div>

           {/* C. Middle Ring: Emerald (Rotate Y-Axis) - Represents Growth */}
           <div className={`absolute inset-6 rounded-full border-[4px] border-transparent border-b-emerald-500 border-r-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-1000 delay-100 cubic-bezier(0.34, 1.56, 0.64, 1) ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} 
                style={{ animation: 'spin-3d-y 8s linear infinite' }}></div>

           {/* D. Inner Ring: Navy Blue (Rotate Z-Axis) - Represents Chakra/Tech */}
           <div className={`absolute inset-12 rounded-full border-[2px] border-dashed border-blue-400/90 shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 delay-200 ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} 
                style={{ animation: 'spin-z 15s linear infinite' }}></div>

           {/* E. THE CORE REACTOR */}
           <div className={`relative w-36 h-36 rounded-full overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.5)] transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
               
               {/* Tricolor Plasma Mesh */}
               <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-white to-emerald-600 opacity-90 animate-gradient-mesh"></div>
               
               {/* Ashoka Chakra Center (Subtle Overlay) */}
               <div className="absolute inset-0 flex items-center justify-center opacity-70 animate-spin-slow">
                   <div className="w-20 h-20 border-[2px] border-blue-900/50 rounded-full flex items-center justify-center">
                       {[...Array(8)].map((_, i) => (
                           <div key={i} className="absolute w-full h-[1px] bg-blue-900/40" style={{ transform: `rotate(${i * 22.5}deg)` }}></div>
                       ))}
                   </div>
               </div>

               {/* Specular Gloss Overlay */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,1)_0%,transparent_50%)] mix-blend-overlay"></div>
           </div>
       </div>

       {/* === 4. BOLD TYPOGRAPHY === */}
       <div className={`relative z-30 mt-16 text-center transition-all duration-1000 ease-out transform ${stage >= 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
           {/* Main Title - Metallic & Glowing */}
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,1)] relative">
               <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400">
                   AI KRUSHI MITRA
               </span>
               {/* Glow underneath */}
               <span className="absolute inset-0 blur-lg bg-emerald-500/20 mix-blend-screen -z-10"></span>
           </h1>
           
           {/* Tagline Badge */}
           <div className="mt-6 inline-flex items-center gap-4 bg-black/50 backdrop-blur-xl px-8 py-2.5 rounded-full border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-shimmer">
               <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] animate-pulse"></span>
               <span className="text-white font-bold tracking-[0.3em] uppercase text-xs md:text-sm bg-gradient-to-r from-orange-300 via-white to-emerald-300 bg-clip-text text-transparent drop-shadow-sm">
                   Jai Jawan • Jai Kisan
               </span>
               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
           </div>
       </div>

       {/* Global Animations Style */}
       <style>{`
         .particle {
             position: absolute;
             width: 4px;
             height: 4px;
             border-radius: 50%;
             animation: float-up var(--duration) linear infinite;
             opacity: 0;
         }
         @keyframes float-up {
             0% { transform: translateY(110vh) translateX(0) scale(0.5); opacity: 0; }
             20% { opacity: 1; }
             80% { opacity: 0.8; }
             100% { transform: translateY(-10vh) translateX(var(--drift)) scale(1.5); opacity: 0; }
         }
         
         @keyframes spin-3d-x { 0% { transform: rotateX(0deg) rotateY(15deg); } 100% { transform: rotateX(360deg) rotateY(15deg); } }
         @keyframes spin-3d-y { 0% { transform: rotateY(0deg) rotateX(15deg); } 100% { transform: rotateY(360deg) rotateX(15deg); } }
         @keyframes spin-z { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
         
         @keyframes gradient-mesh { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
         
         @keyframes ken-burns { 0% { transform: scale(1.0); } 100% { transform: scale(1.25); } }
         
         @keyframes pulse-slow { 0%, 100% { opacity: 0.5; transform: scale(1.25); } 50% { opacity: 0.8; transform: scale(1.35); } }
         .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

         .box-shadow-glow-orange { box-shadow: 0 0 15px #f97316, 0 0 5px #fff; }
         .box-shadow-glow-green { box-shadow: 0 0 15px #10b981, 0 0 5px #fff; }
         .box-shadow-glow-cyan { box-shadow: 0 0 15px #22d3ee, 0 0 5px #fff; }
       `}</style>
    </div>
  );
};

// Helper for random particle movement
function getParticleStyle(i: number) {
    return {
        left: `${Math.random() * 100}%`,
        '--duration': `${5 + Math.random() * 5}s`,
        '--drift': `${(Math.random() - 0.5) * 150}px`,
        animationDelay: `${Math.random() * 3}s`
    } as React.CSSProperties;
}
