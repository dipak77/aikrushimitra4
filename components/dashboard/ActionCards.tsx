
import React from 'react';
import { GlassTile } from './GlassTile';
import { ArrowUpRight } from 'lucide-react';

export const FeatureCard = ({ title, icon: Icon, variant, delay, onClick }: any) => {
  const colors = {
    soil: { 
      bg: 'from-orange-500/20 to-amber-500/10', 
      icon: 'text-orange-400', 
      orb: 'from-orange-500/40 to-amber-500/40',
      border: 'border-orange-400/30'
    },
    yield: { 
      bg: 'from-purple-500/20 to-pink-500/10', 
      icon: 'text-purple-400', 
      orb: 'from-purple-500/40 to-pink-500/40',
      border: 'border-purple-400/30'
    },
    area: { 
      bg: 'from-cyan-500/20 to-blue-500/10', 
      icon: 'text-cyan-400', 
      orb: 'from-cyan-500/40 to-blue-500/40',
      border: 'border-cyan-400/30'
    },
    disease: { 
      bg: 'from-emerald-500/20 to-green-500/10', 
      icon: 'text-emerald-400', 
      orb: 'from-emerald-500/40 to-green-500/40',
      border: 'border-emerald-400/30'
    },
  };
  
  const c = colors[variant as keyof typeof colors] || colors.soil;

  return (
    <GlassTile delay={delay} onClick={onClick} className="group relative p-5 h-48 flex flex-col justify-between 
      border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 
      hover:border-white/20 transition-all duration-500 overflow-hidden">
      
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 
        transition-opacity duration-500 ${c.bg}`} />
      
      {/* Animated orb */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] 
        opacity-0 group-hover:opacity-50 transition-all duration-500 bg-gradient-to-br ${c.orb}`} />
      
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl bg-slate-950/70 border-2 ${c.border}
        flex items-center justify-center shadow-2xl group-hover:scale-110 
        group-hover:rotate-6 transition-all duration-500 z-10 ${c.icon}
        shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(0,0,0,0.7)]`}>
        <Icon size={26} strokeWidth={2} className="drop-shadow-2xl" />
      </div>
      
      {/* Text */}
      <div className="relative z-10">
        <h3 className="text-sm font-black text-slate-200 group-hover:text-white 
          transition-colors leading-tight mb-2 drop-shadow-lg">
          {title}
        </h3>
        <div className="w-10 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 
          opacity-60 group-hover:w-20 group-hover:opacity-100 transition-all duration-500 
          shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
      </div>
      
      {/* Arrow indicator */}
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 
        transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ArrowUpRight size={18} className="text-slate-400" strokeWidth={2.5} />
      </div>
    </GlassTile>
  );
};

export const IllustrativeBanner = ({ title, subtitle, icon: Icon, gradient, pattern, onClick }: any) => (
  <div onClick={onClick} className="relative h-44 rounded-[2rem] overflow-hidden cursor-pointer group 
    shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] 
    transition-all duration-500 border border-white/10 hover:border-white/20 hover:-translate-y-1">
    
    {/* Background gradient */}
    <div className={`absolute inset-0 bg-gradient-to-r opacity-95 group-hover:opacity-100 
      transition-opacity duration-500 ${gradient}`} />
    
    {/* Pattern overlay */}
    {pattern === 'scan' && (
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity 
        bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.4)_25%,rgba(255,255,255,.4)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.4)_75%,rgba(255,255,255,.4)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.4)_25%,rgba(255,255,255,.4)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.4)_75%,rgba(255,255,255,.4)_76%,transparent_77%,transparent)] 
        bg-[length:30px_30px]" />
    )}
    {pattern === 'coins' && (
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 group-hover:opacity-25 transition-opacity">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <circle cx="80" cy="20" r="15" />
          <circle cx="60" cy="50" r="20" />
          <circle cx="90" cy="80" r="25" />
        </svg>
      </div>
    )}
    
    {/* Content */}
    <div className="absolute inset-0 p-7 flex flex-col justify-center z-10">
      <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center 
        mb-4 shadow-2xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-500">
        <Icon size={24} className="text-white drop-shadow-lg" />
      </div>
      <h3 className="text-2xl font-black text-white leading-none mb-2 drop-shadow-2xl 
        group-hover:scale-105 transition-transform duration-300 origin-left">
        {title}
      </h3>
      <p className="text-sm font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">
        {subtitle}
      </p>
    </div>
    
    {/* Floating action */}
    <div className="absolute bottom-5 right-5 w-12 h-12 rounded-2xl bg-white text-emerald-600 
      flex items-center justify-center shadow-2xl transform translate-y-3 opacity-0 
      group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
      <ArrowUpRight size={24} strokeWidth={3} />
    </div>
  </div>
);
