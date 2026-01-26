
import React from 'react';

export const GlassTile = ({ children, className = '', onClick, delay = 0 }: any) => (
  <div
    onClick={onClick}
    style={{ 
      animationDelay: `${delay}ms`,
      transform: 'translateZ(0)',
      willChange: 'transform'
    }}
    className={`relative overflow-hidden rounded-[2rem] border border-white/10 
      transition-all duration-500 group cursor-pointer
      bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-slate-900/70 
      backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(16,185,129,0.1)] 
      hover:border-white/20 hover:scale-[1.02] hover:-translate-y-1
      animate-[fadeInUp_0.6s_ease-out_forwards] ${className}`}
  >
    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 
        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </div>
    {children}
  </div>
);
