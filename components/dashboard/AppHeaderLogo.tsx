import React, { useState, useEffect, useRef } from 'react';
import { Leaf, TrendingUp, Droplets } from 'lucide-react';

export const AppHeaderLogo = () => {
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // GPU-Optimized Canvas Animation
  useEffect(() => {
    if (videoError && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true, // GPU acceleration hint
        willReadFrequently: false // Optimize for animation
      });
      if (!ctx) return;

      // Set high DPI for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 100 * dpr;
      canvas.height = 100 * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);

      let frame = 0;
      const particles: Array<{
        x: number;
        y: number;
        angle: number;
        radius: number;
        speed: number;
        opacity: number;
        size: number;
      }> = [];
      
      // Optimized particle count for smooth 60fps
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: 50,
          y: 50,
          angle: Math.random() * Math.PI * 2,
          radius: 15 + Math.random() * 25,
          speed: 0.001 + Math.random() * 0.002,
          opacity: 0.3 + Math.random() * 0.4,
          size: 1 + Math.random() * 1.5
        });
      }

      // Pre-calculate sine/cosine for grid lines
      const gridAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
      const cosAngles = gridAngles.map(a => Math.cos(a));
      const sinAngles = gridAngles.map(a => Math.sin(a));

      const animate = () => {
        // Use composite operation for better performance
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, 100, 100);
        
        // GPU-friendly gradient globe grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 1;
        
        // Vertical meridian lines (optimized loop)
        const offset = (frame * 0.25) % 50;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          for (let j = 0; j <= 50; j += 2) { // Skip every other point for performance
            const y = (j - 25) + offset * 0.5;
            const scale = Math.cos((y / 25) * Math.PI * 0.5) * 0.8;
            const x = 50 + cosAngles[i] * 22 * scale;
            const yPos = 50 + y * 0.4;
            
            if (j === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
          }
          ctx.stroke();
        }
        
        // Horizontal latitude lines
        ctx.beginPath();
        for (let lat = -2; lat <= 2; lat++) {
          const y = 50 + lat * 10;
          const radius = 22 * Math.cos((lat / 2.5) * Math.PI * 0.5);
          ctx.moveTo(50 + radius, y);
          for (let angle = 0; angle <= Math.PI * 2; angle += 0.2) {
            const rx = radius * Math.cos(angle + frame * 0.01);
            ctx.lineTo(50 + rx * Math.cos(angle), y + rx * Math.sin(angle) * 0.3);
          }
        }
        ctx.stroke();
        
        // Optimized particle rendering with batching
        ctx.globalCompositeOperation = 'lighter'; // Additive blend for glow effect
        particles.forEach(p => {
          p.angle += p.speed;
          const rotation = Math.cos(frame * 0.01);
          const x = 50 + Math.cos(p.angle) * p.radius * rotation;
          const y = 50 + Math.sin(p.angle) * p.radius * Math.sin(frame * 0.008);
          
          // Simple fill instead of gradient for better performance
          ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Central glow
        const gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 35);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.08)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 100, 100);
        
        frame++;
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [videoError]);

  return (
    <>
      <style>{`
        /* GPU-Accelerated Animations with will-change */
        @keyframes globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes circuit-pulse {
          0%, 100% { opacity: 0.25; transform: translateZ(0); }
          50% { opacity: 0.7; transform: translateZ(0); }
        }
        
        @keyframes icon-hover {
          0%, 100% { transform: translateY(0) translateZ(0); }
          50% { transform: translateY(-3px) translateZ(0); }
        }
        
        @keyframes glow-soft {
          0%, 100% { 
            filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.35));
          }
          50% { 
            filter: drop-shadow(0 0 18px rgba(16, 185, 129, 0.55));
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateZ(0); }
          100% { transform: translateX(200%) translateZ(0); }
        }
        
        @keyframes pulse-ring {
          0% { 
            transform: scale(1) translateZ(0); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.15) translateZ(0); 
            opacity: 0; 
          }
          100% { 
            transform: scale(1) translateZ(0); 
            opacity: 0; 
          }
        }
        
        /* Force GPU acceleration */
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Optimize animations */
        .globe-container * {
          will-change: transform, opacity;
        }
      `}</style>

      <div className="relative flex items-center gap-3 md:gap-4 group/logo">
        
        {/* Optimized Ambient Glow */}
        <div 
          className="absolute inset-0 -inset-x-6 bg-gradient-to-r from-emerald-500/8 via-yellow-500/6 to-cyan-500/8 blur-2xl opacity-30 group-hover/logo:opacity-50 transition-opacity duration-500 rounded-full gpu-accelerated"
          style={{ willChange: 'opacity' }}
        />
        
        {/* Professional Globe Container */}
        <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 globe-container">
          
          {/* Pulsing Ring Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 via-yellow-400/15 to-cyan-500/20 animate-[pulse-ring_3s_ease-in-out_infinite] gpu-accelerated" />
          
          {/* Soft Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/15 via-yellow-400/10 to-cyan-500/15 blur-lg animate-[glow-soft_4s_ease-in-out_infinite] gpu-accelerated" />
          
          {/* Rotating Ring with Orbit Dot */}
          <div 
            className="absolute inset-0 rounded-full border border-emerald-400/25 animate-[globe-spin_30s_linear_infinite] gpu-accelerated"
            style={{ willChange: 'transform' }}
          >
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse" />
          </div>
          
          {/* Main Globe with Enhanced Visual */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.25),0_5px_20px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.12)] bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-cyan-950/90 backdrop-blur-xl group-hover/logo:border-emerald-400/60 group-hover/logo:shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-700 gpu-accelerated">
            
            {videoError ? (
              <>
                <canvas 
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full opacity-75 gpu-accelerated"
                  style={{ willChange: 'auto' }}
                />
                
                {/* AI Badge with Shimmer */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span className="relative text-sm md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-yellow-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">
                    AI
                    {/* Shimmer Effect */}
                    <span 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_3s_ease-in-out_infinite] gpu-accelerated"
                      style={{ willChange: 'transform' }}
                    />
                  </span>
                </div>
              </>
            ) : (
              <video 
                src="/header.mp4" 
                className="w-full h-full object-cover opacity-80 group-hover/logo:opacity-100 transition-opacity duration-500 gpu-accelerated"
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
              />
            )}
            
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/8 via-white/3 to-transparent pointer-events-none" />
            
            {/* Top Highlight */}
            <div className="absolute top-0 left-1/4 right-1/4 h-3 bg-gradient-to-b from-white/15 to-transparent blur-sm rounded-full" />
          </div>
          
          {/* Enhanced Icon Badges with 3D Effect */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.6),0_2px_8px_rgba(0,0,0,0.5)] border-2 border-emerald-300/30 animate-[icon-hover_3s_ease-in-out_infinite] gpu-accelerated group-hover/logo:scale-110 transition-transform duration-300">
            <Leaf size={10} className="text-white drop-shadow-lg" strokeWidth={2.8} />
          </div>
          
          <div 
            className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.6),0_2px_8px_rgba(0,0,0,0.5)] border-2 border-yellow-300/30 animate-[icon-hover_3s_ease-in-out_infinite] gpu-accelerated group-hover/logo:scale-110 transition-transform duration-300" 
            style={{ animationDelay: '1s' }}
          >
            <TrendingUp size={10} className="text-white drop-shadow-lg" strokeWidth={2.8} />
          </div>
          
          {/* Enhanced Circuit Lines */}
          <svg 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 opacity-50 pointer-events-none gpu-accelerated" 
            viewBox="0 0 96 32"
            style={{ willChange: 'opacity' }}
          >
            <defs>
              <linearGradient id="circuit1" x1="0%" x2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                <stop offset="50%" stopColor="rgba(251, 191, 36, 0.5)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <path 
              d="M0,16 Q12,16 20,10 T40,10 Q48,10 56,16 Q64,22 76,16 L96,16" 
              stroke="url(#circuit1)" 
              strokeWidth="1.5" 
              fill="none"
              filter="url(#glow)"
              className="animate-[circuit-pulse_4s_ease-in-out_infinite] gpu-accelerated"
            />
            
            {/* Circuit Nodes */}
            <circle cx="20" cy="10" r="2" fill="#10b981" className="animate-pulse" opacity="0.8" />
            <circle cx="40" cy="10" r="2" fill="#fbbf24" className="animate-pulse" style={{ animationDelay: '0.5s' }} opacity="0.8" />
            <circle cx="76" cy="16" r="2" fill="#06b6d4" className="animate-pulse" style={{ animationDelay: '1s' }} opacity="0.8" />
          </svg>
        </div>
        
        {/* Enhanced Typography */}
        <div className="flex flex-col gap-0.5">
          {/* Main Title with Gradient Animation */}
          <h1 className="text-xl md:text-2xl font-black leading-none tracking-tight flex items-center gap-1.5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 drop-shadow-[0_2px_15px_rgba(16,185,129,0.6)] group-hover/logo:drop-shadow-[0_2px_20px_rgba(16,185,129,0.8)] transition-all duration-300">
              AI
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-[0_2px_15px_rgba(251,191,36,0.6)] group-hover/logo:drop-shadow-[0_2px_20px_rgba(251,191,36,0.8)] transition-all duration-300">
              Krushi
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 drop-shadow-[0_2px_15px_rgba(6,182,212,0.6)] group-hover/logo:drop-shadow-[0_2px_20px_rgba(6,182,212,0.8)] transition-all duration-300">
              Mitra
            </span>
          </h1>
          
          {/* Refined Subtitle with Accent Line */}
          <div className="flex items-center gap-2">
            <div className="h-[1.5px] w-6 bg-gradient-to-r from-emerald-400/60 via-yellow-400/40 to-transparent rounded-full" />
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400/90 uppercase tracking-[0.25em] leading-none">
              AI Powered Platform
            </p>
          </div>
          
          {/* Enhanced Feature Badges with Hover Effects */}
          <div className="flex items-center gap-1.5 mt-1">
            {[
              { icon: Leaf, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/15', label: 'Crop' },
              { icon: TrendingUp, color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-500/15', label: 'Market' },
              { icon: Droplets, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/15', label: 'Weather' },
            ].map((badge, i) => (
              <div
                key={i}
                className={`relative w-6 h-6 rounded-lg ${badge.bg} backdrop-blur-md border border-white/15 flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer group/icon gpu-accelerated`}
                title={badge.label}
              >
                {/* Glow on Hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 blur-md" style={{ background: `linear-gradient(135deg, ${badge.color.split(' ').join(', ')})` }} />
                
                <div className={`w-4 h-4 rounded-md bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-[0_0_8px_currentColor] group-hover/icon:shadow-[0_0_15px_currentColor] transition-all duration-300`}>
                  <badge.icon size={9} className="text-white" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
