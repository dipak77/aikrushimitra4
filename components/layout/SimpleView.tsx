import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

interface SimpleViewProps {
  title: string;
  children?: React.ReactNode;
  onBack: () => void;
}

const SimpleView = ({ title, children, onBack }: SimpleViewProps) => {
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic orb animation on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (orbsRef.current) {
        const orbs = orbsRef.current.querySelectorAll('.floating-orb');
        orbs.forEach((orb, index) => {
          const speed = (index + 1) * 0.02;
          const x = (e.clientX * speed) / 100;
          const y = (e.clientY * speed) / 100;
          (orb as HTMLElement).style.transform = `translate(${x}px, ${y}px) scale(${1 + Math.sin(Date.now() / 1000 + index) * 0.1})`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden lg:pl-36">
      
      {/* Ultra-Premium Animated Orb Background */}
      <div ref={orbsRef} className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary Orb - Emerald Glow */}
        <div className="floating-orb absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-transparent blur-[120px] animate-float-slow opacity-40"></div>
        
        {/* Secondary Orb - Cyan Pulse */}
        <div className="floating-orb absolute top-[60%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-cyan-400/25 via-blue-500/20 to-transparent blur-[100px] animate-float-medium opacity-35" style={{ animationDelay: '2s' }}></div>
        
        {/* Tertiary Orb - Purple Accent */}
        <div className="floating-orb absolute bottom-[20%] left-[40%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-transparent blur-[90px] animate-float-fast opacity-30" style={{ animationDelay: '4s' }}></div>
        
        {/* Ambient Orb - White Glow */}
        <div className="floating-orb absolute top-[40%] left-[60%] w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-white/10 via-slate-400/10 to-transparent blur-[80px] animate-pulse-slow opacity-25" style={{ animationDelay: '1s' }}></div>
        
        {/* Micro Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Gradient Mesh Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-cyan-900/10 pointer-events-none"></div>
      
      {/* Main Content Container with Premium Glass Effect */}
      <div className="relative z-10 h-full w-full flex flex-col bg-gradient-to-br from-[#020617]/80 via-[#0f172a]/75 to-[#020617]/80 backdrop-blur-3xl animate-enter">
        
        {/* Ultra-Premium Liquid Glass Header */}
        <div className="flex items-center gap-6 p-8 pt-safe-top z-50 sticky top-0 bg-gradient-to-r from-[#020617]/70 via-[#0f172a]/65 to-[#020617]/70 backdrop-blur-[40px] border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_4px_16px_rgba(16,185,129,0.1)] group/header">
          
          {/* Animated Glow Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700"></div>
          
          {/* Premium Lens-Style Back Button with Ripple Effect */}
          <button 
            onClick={() => { onBack(); triggerHaptic(); }} 
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl flex items-center justify-center text-slate-100 border border-white/20 hover:border-emerald-400/50 active:scale-95 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.3),0_0_40px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] group overflow-hidden"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-cyan-500/0 to-transparent group-hover:from-emerald-500/20 group-hover:via-cyan-500/15 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            
            {/* Ripple Effect on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-hover:scale-100 group-active:scale-110 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"></div>
            
            {/* Rotating Border Glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/40 via-cyan-400/40 to-emerald-400/40 blur-md animate-spin-slow"></div>
            </div>
            
            {/* Icon with Enhanced Motion */}
            <ArrowLeft size={22} className="relative z-10 group-hover:-translate-x-1.5 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-300" strokeWidth={2.5}/>
            
            {/* Corner Accents */}
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/30 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/30 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          {/* Ultra-Premium Shimmer Text Title with 3D Effect */}
          <div className="flex items-center gap-3 flex-1">
            {/* Decorative Sparkle Icon */}
            <Sparkles size={28} className="text-emerald-400/80 animate-pulse-glow drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" strokeWidth={2}/>
            
            <h1 className="text-4xl font-black tracking-tight leading-none relative group/title">
              {/* 3D Shadow Layers */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-emerald-400/20 blur-sm translate-y-1">
                {title}
              </span>
              
              {/* Main Title with Advanced Shimmer */}
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-cyan-300 bg-[length:200%_auto] animate-[text-shimmer_3s_ease-in-out_infinite] drop-shadow-[0_2px_20px_rgba(16,185,129,0.5)] filter brightness-110">
                {title}
              </span>
              
              {/* Animated Underline */}
              <div className="absolute -bottom-2 left-0 h-[3px] w-0 group-hover/title:w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] animate-[gradient-shift_2s_ease_infinite] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-700"></div>
              
              {/* Glow Pulse Effect */}
              <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/40 via-white/40 to-cyan-400/40 blur-xl animate-pulse-slow opacity-50"></div>
            </h1>
          </div>

          {/* Floating Indicator Dots */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse-sequence shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                style={{ animationDelay: `${i * 0.3}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Premium Content Area with Fade Effects */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-40 hide-scrollbar relative">
          {/* Top Fade Gradient */}
          <div className="sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#020617]/80 to-transparent pointer-events-none z-20"></div>
          
          {/* Content Container with Enter Animation */}
          <div className="max-w-4xl mx-auto w-full pt-8 animate-[enter_0.6s_ease-out] relative">
            {/* Subtle Content Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-cyan-500/5 rounded-3xl blur-3xl pointer-events-none"></div>
            
            {/* Children Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
          
          {/* Bottom Fade Mask */}
          <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none z-20"></div>
        </div>
      </div>

      {/* Advanced Animation Keyframes */}
      <style>{`
        @keyframes text-shimmer {
          0%, 100% { background-position: 200% center; }
          50% { background-position: -200% center; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(40px, 20px) scale(1.02); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 30px) rotate(120deg); }
          66% { transform: translate(30px, -30px) rotate(240deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -50px) scale(1.1); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 8px rgba(16,185,129,0.6)); }
          50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(16,185,129,0.9)); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes pulse-sequence {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.4); }
        }
        
        @keyframes enter {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98);
            filter: blur(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 12s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
        .animate-pulse-sequence { animation: pulse-sequence 2s ease-in-out infinite; }
        
        /* Custom Scrollbar Styling */
        .hide-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3));
          border-radius: 10px;
          transition: background 0.3s;
        }
        
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16,185,129,0.6), rgba(6,182,212,0.6));
        }
      `}</style>
    </div>
  );
};

export default SimpleView;
