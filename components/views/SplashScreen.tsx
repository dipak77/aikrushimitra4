import React, { useEffect, useRef, useState, useMemo } from "react";
import { Tractor, Wheat, Sparkles, Leaf, TrendingUp, Droplets, ScanLine, Cpu, Satellite } from "lucide-react";

// --- Configuration ---
const DURATION = 4000; // Slightly longer for cinematic feel

// Custom Easing (Expo Out for snap, Linear for loaders)
const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Animation Refs
  const raf = useRef<number>(0);
  const start = useRef<number>(0);
  const completedRef = useRef(false);

  // Initialize
  useEffect(() => {
    setMounted(true);
    
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setExit(true);
      setTimeout(onComplete, 800);
    };

    const animate = (t: number) => {
      if (!start.current) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(elapsed / DURATION, 1);
      
      // Non-linear progress for realism (fast start, slow finish)
      const easedProgress = easeOutExpo(p);
      setProgress(Math.round(easedProgress * 100));

      if (p < 1) raf.current = requestAnimationFrame(animate);
      else setTimeout(finish, 400);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [onComplete]);

  // Dynamic Status Text based on progress
  const status = useMemo(() => {
    if (progress < 25) return { text: "INITIALIZING SATELLITE UPLINK", color: "text-cyan-400", icon: Satellite };
    if (progress < 50) return { text: "CALIBRATING SOIL SENSORS", color: "text-emerald-400", icon: ScanLine };
    if (progress < 75) return { text: "PROCESSING CROP MODELS", color: "text-amber-400", icon: Cpu };
    if (progress < 95) return { text: "OPTIMIZING NEURAL YIELD", color: "text-indigo-400", icon: Sparkles };
    return { text: "SYSTEM READY", color: "text-white", icon: Leaf };
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#020617] transition-all duration-1000 ${
        exit ? "opacity-0 scale-110 blur-xl" : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* =========================================
          BACKGROUND LAYERS
      ========================================= */}
      
      {/* 1. Deep Void Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,#020617_60%)]" />

      {/* 2. Moving Perspective Grid (The "Cyber Field") */}
      <div className="absolute inset-0 perspective-grid-container opacity-30">
        <div className="perspective-grid" />
      </div>

      {/* 3. Volumetric Fog / Smoke */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        <div className="fog-layer fog-1" />
        <div className="fog-layer fog-2" />
      </div>

      {/* 4. Neural Network Constellations (CSS dots) */}
      <div className="absolute inset-0 opacity-30 stars-container" />

      {/* 5. Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,#020617_90%)] pointer-events-none" />

      
      {/* =========================================
          MAIN CONTENT STAGE
      ========================================= */}
      <div className="relative w-full max-w-4xl px-4 flex flex-col items-center z-10">
        
        {/* BRAND HEADER */}
        <div className={`transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
          
          {/* Floating Icons Ring */}
          <div className="flex justify-center gap-8 mb-12">
            <FloatingBadge icon={Leaf} color="emerald" delay={0} />
            <FloatingBadge icon={TrendingUp} color="amber" delay={200} />
            <FloatingBadge icon={Droplets} color="cyan" delay={400} />
          </div>

          {/* Cinematic Title */}
          <div className="relative group">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 pb-2 drop-shadow-2xl logo-text">
              AI KRUSHI MITRA
            </h1>
            {/* Holographic Glitch Overlay */}
            <h1 className="absolute inset-0 text-6xl md:text-8xl font-black tracking-tighter text-emerald-500/20 blur-sm animate-pulse pb-2 pointer-events-none" aria-hidden="true">
              AI KRUSHI MITRA
            </h1>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 opacity-80">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-500" />
            <p className="text-sm font-bold tracking-[0.4em] text-emerald-100/70 uppercase">Next Gen Farming</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-500" />
          </div>
        </div>


        {/* HOLOGRAPHIC SCENE AREA */}
        <div className="relative w-full h-[220px] mt-12 flex items-end justify-center perspective-1000">
          
          {/* The Scanner Beam */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
             <div className="scanner-beam" />
          </div>

          {/* Wheat Field */}
          <div className="absolute bottom-4 flex items-end justify-center gap-1 md:gap-3 px-10 w-full opacity-90">
             {Array.from({ length: 15 }).map((_, i) => (
               <WheatStalk key={i} index={i} progress={progress} />
             ))}
          </div>

          {/* The Tractor (Central Hero) */}
          <div 
             className="relative z-10 mb-6 transition-all duration-700 ease-out"
             style={{ 
               transform: `translateX(${(progress - 50) * 0.5}%) scale(${mounted ? 1 : 0.8})`,
               opacity: mounted ? 1 : 0
             }}
          >
            <div className="relative tractor-float">
               <Tractor size={80} className="text-cyan-200 drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]" strokeWidth={1.2} />
               {/* Engine Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyan-500/30 blur-2xl rounded-full -z-10" />
            </div>
          </div>
          
          {/* Ground Platform */}
          <div className="absolute bottom-0 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-[2px]" />
        </div>


        {/* HUD / LOADING BAR */}
        <div className="w-full max-w-md mt-6 relative">
            {/* Status Text */}
            <div className="flex items-center justify-between mb-2 text-xs font-mono font-bold tracking-widest">
                <div className={`flex items-center gap-2 ${status.color} transition-colors duration-300`}>
                    <status.icon size={14} className="animate-spin-slow" />
                    <span>{status.text}</span>
                </div>
                <span className="text-slate-500">{progress}%</span>
            </div>

            {/* The Bar */}
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50 relative">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 via-cyan-500 to-emerald-400 relative"
                  style={{ width: `${progress}%`, transition: 'width 0.2s linear' }}
                >
                    {/* Leading Edge Glow */}
                    <div className="absolute right-0 top-0 bottom-0 w-[40px] bg-gradient-to-r from-transparent to-white/80 blur-[2px]" />
                    {/* Animated Striping */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20" />
                </div>
            </div>
            
            {/* Reflection under bar */}
            <div 
                className="h-1.5 w-full mt-1 rounded-full opacity-20 blur-sm"
                style={{ 
                    background: `linear-gradient(90deg, transparent, ${status.color.replace('text-', 'bg-')}, transparent)`,
                    width: `${progress}%`,
                    transition: 'width 0.2s linear'
                }} 
            />
        </div>

      </div>

      {/* =========================================
          STYLES & ANIMATIONS
      ========================================= */}
      <style>{`
        /* 1. Perspective Grid (The Floor) */
        .perspective-grid-container {
            perspective: 800px;
            overflow: hidden;
            mask-image: linear-gradient(to bottom, transparent 20%, black 100%);
        }
        .perspective-grid {
            position: absolute;
            bottom: -50%;
            left: -50%;
            width: 200%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px);
            background-size: 60px 60px;
            transform: rotateX(70deg);
            animation: gridMove 20s linear infinite;
        }

        /* 2. Scanner Beam */
        .scanner-beam {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, transparent, #22d3ee, transparent);
            box-shadow: 0 0 20px #22d3ee;
            opacity: 0.5;
            animation: scanX 3s ease-in-out infinite alternate;
            z-index: 50;
        }
        .scanner-beam::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 100px;
            background: linear-gradient(90deg, rgba(34,211,238,0.2), transparent);
            transform: skewX(-20deg);
        }

        /* 3. Fog Layers */
        .fog-layer {
            position: absolute;
            inset: -50%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
            animation: fogFlow 40s linear infinite;
        }
        .fog-2 { animation-direction: reverse; animation-duration: 30s; opacity: 0.2; }

        /* Animations */
        @keyframes gridMove {
            0% { transform: rotateX(70deg) translateY(0); }
            100% { transform: rotateX(70deg) translateY(60px); }
        }

        @keyframes scanX {
            0% { left: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 90%; opacity: 0; }
        }

        @keyframes fogFlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .tractor-float {
            animation: float 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Stars / Dust */
        .stars-container {
            background-image: radial-gradient(white 1px, transparent 1px);
            background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

// --- Sub Components ---

const FloatingBadge = ({ icon: Icon, color, delay }: { icon: any, color: string, delay: number }) => {
    // Map colors to tailwind classes safely
    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        amber: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    };

    return (
        <div 
            className={`p-4 rounded-2xl border backdrop-blur-md ${colorMap[color]} animate-float`}
            style={{ animationDelay: `${delay}ms`, animationDuration: '4s' }}
        >
            <Icon size={32} strokeWidth={1.5} />
            <style>{`
                .animate-float { animation: float 5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

const WheatStalk = ({ index, progress }: { index: number, progress: number }) => {
    // Calculate reveal trigger based on progress
    const isVisible = progress > (index * 3);
    const delay = index * 50;

    return (
        <div 
            className={`transition-all duration-700 origin-bottom flex flex-col items-center justify-end`}
            style={{
                transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${delay}ms`,
                height: `${40 + (index % 3) * 15}px` // varied heights
            }}
        >
            <Wheat 
                size={index % 2 === 0 ? 32 : 24} 
                className={`${index % 3 === 0 ? 'text-amber-300' : 'text-emerald-400'} drop-shadow-lg`}
                strokeWidth={1.5}
            />
        </div>
    );
};
