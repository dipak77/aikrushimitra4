
import React from 'react';
import { GlassTile } from './GlassTile';
import { DASH_TEXT } from './constants';
import { MapPin, Wind, Sparkles, Clock, Droplets, Sun, Moon, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const WeatherIcon3D = ({ type, isDay }: { type: string, isDay: boolean }) => (
  <div className="relative w-44 h-44 flex items-center justify-center filter drop-shadow-2xl">
    {/* Multi-layer glow orbs for depth */}
    <div className={`absolute w-36 h-36 rounded-full blur-[70px] opacity-70 
      animate-[orbPulse_4s_ease-in-out_infinite]
      ${isDay ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500' : 
        'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500'}`} />
    <div className={`absolute w-28 h-28 rounded-full blur-[50px] opacity-50 
      animate-[orbPulse_3s_ease-in-out_infinite_0.5s]
      ${isDay ? 'bg-yellow-300' : 'bg-cyan-400'}`} />
    <div className={`absolute w-20 h-20 rounded-full blur-[30px] opacity-30 
      animate-[orbPulse_2s_ease-in-out_infinite_1s]
      ${isDay ? 'bg-orange-300' : 'bg-blue-300'}`} />
    
    {/* Sun/Moon with enhanced 3D effect */}
    {isDay && type !== 'rain' && type !== 'storm' && (
      <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-br 
        from-yellow-200 via-orange-400 to-red-500 
        shadow-[0_0_80px_rgba(251,191,36,0.9),inset_0_-10px_30px_rgba(0,0,0,0.2)]
        animate-[floatSlow_6s_ease-in-out_infinite]
        ${type === 'clear' ? 'scale-100' : 'top-2 right-4 scale-75'}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-300/50 to-transparent blur-md" />
        <div className="absolute inset-6 rounded-full bg-yellow-100/30 blur-lg" />
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-4 bg-gradient-to-b from-yellow-200 to-transparent rounded-full 
              animate-[sunRays_2s_ease-in-out_infinite]"
            style={{
              left: '50%',
              top: '-20px',
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
              transformOrigin: '50% 70px',
              animationDelay: `${i * 0.125}s`
            }}
          />
        ))}
      </div>
    )}
    
    {!isDay && type !== 'rain' && type !== 'storm' && (
      <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-br 
        from-slate-50 via-slate-200 to-slate-400 
        shadow-[0_0_60px_rgba(255,255,255,0.6),inset_-5px_-5px_15px_rgba(0,0,0,0.3)]
        animate-[floatSlow_7s_ease-in-out_infinite]
        ${type === 'clear' ? 'scale-100' : 'top-2 right-4 scale-75'}`}>
        <div className="absolute top-5 left-4 w-5 h-5 bg-slate-300/40 rounded-full blur-sm" />
        <div className="absolute bottom-5 right-6 w-3 h-3 bg-slate-300/40 rounded-full blur-sm" />
        <div className="absolute top-8 right-5 w-2 h-2 bg-slate-400/30 rounded-full" />
      </div>
    )}
    
    {/* Enhanced 3D Cloud */}
    {type !== 'clear' && (
      <div className="relative z-10 transform scale-110 
        animate-[floatSlow_8s_ease-in-out_infinite]">
        <svg width="170" height="115" viewBox="0 0 170 115" 
          className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="cloudHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="cloudShadow">
              <feGaussianBlur stdDeviation="5" />
              <feOffset dy="3" result="offsetblur" />
              <feFlood floodColor="#000000" floodOpacity="0.3" />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <path d="M55,95 Q28,95 28,68 Q28,38 58,38 Q68,14 98,14 Q128,14 138,48 Q165,48 165,73 Q165,95 138,95 Z" 
            fill="url(#cloudGrad)" filter="url(#cloudShadow)" />
          <path d="M65,43 Q78,26 98,26 Q125,26 135,48" 
            fill="none" stroke="url(#cloudHighlight)" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
          
          {/* Inner glow */}
          <ellipse cx="100" cy="55" rx="40" ry="25" fill="white" opacity="0.1" 
            className="animate-pulse" />
        </svg>
        
        {/* Enhanced Rain */}
        {(type === 'rain' || type === 'storm') && (
          <div className="absolute -bottom-4 left-12 flex gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} 
                className="w-1.5 h-9 bg-gradient-to-b from-cyan-200 via-blue-400 to-blue-700 
                  rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]
                  animate-[rainDrop_0.8s_ease-in_infinite] opacity-80"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  transform: 'rotate(15deg)'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Enhanced Lightning */}
        {type === 'storm' && (
          <svg className="absolute bottom-[-22px] right-14 w-12 h-18 text-yellow-300 
            drop-shadow-[0_0_25px_rgba(250,204,21,1)] animate-[lightning_2.5s_ease-in-out_infinite]" 
            viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            {/* Lightning glow */}
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" opacity="0.4" 
              className="animate-pulse" />
          </svg>
        )}
      </div>
    )}
    
    {/* Twinkling stars for night */}
    {!isDay && [...Array(8)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full 
          animate-[twinkle_2s_ease-in-out_infinite]"
        style={{
          left: `${20 + Math.random() * 60}%`,
          top: `${10 + Math.random() * 40}%`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

export const WeatherWidget = ({ weather, loading, location, lang, onNavigate }: any) => {
  const isDay = weather?.current?.is_day !== 0;
  const code = weather?.current?.weather_code || 0;
  const txt = DASH_TEXT[lang];
  
  const getType = (c: number) => {
    if(c >= 95) return 'storm';
    if(c >= 51) return 'rain';
    if(c >= 1 && c <= 3) return 'cloudy';
    return 'clear';
  };
  const type = getType(code);

  return (
    <GlassTile 
      onClick={() => onNavigate('WEATHER')} 
      className="h-full p-6 relative overflow-hidden group 
        bg-gradient-to-br from-slate-900/80 via-blue-900/40 to-purple-900/50
        hover:from-slate-900/90 hover:via-blue-900/50 hover:to-purple-900/60">
      
      {/* Dynamic animated orb */}
      <div className="absolute top-[-40%] right-[-40%] w-[150%] h-[150%] 
        bg-gradient-to-br from-blue-500/25 via-purple-500/25 to-pink-500/25 
        blur-[120px] rounded-full animate-[orbFloat_12s_ease-in-out_infinite]" />
      
      {/* Particle stars */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(25)].map((_, i) => (
          <div key={i} 
            className="absolute w-0.5 h-0.5 bg-white rounded-full 
              animate-[twinkle_3s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center h-full relative z-10">
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-lg font-bold text-slate-200 tracking-wide flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 
              border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <MapPin size={15} className="text-emerald-400"/>
            </div>
            {location}
          </h2>
          
          <div className="flex items-start -ml-1 mb-2">
            <span className="text-[6.5rem] leading-[0.75] font-thin tracking-tighter 
              text-transparent bg-clip-text bg-gradient-to-b 
              from-amber-100 via-orange-400 to-red-500 
              drop-shadow-[0_6px_25px_rgba(251,191,36,0.6)]
              animate-[gradientShift_4s_ease_infinite]">
              {loading ? "--" : Math.round(weather.current.temperature_2m)}°
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold text-white capitalize drop-shadow-2xl">
              {loading ? "..." : txt.weather_desc[code] || txt.weather_desc[0]}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 flex items-center gap-2 
                px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Wind size={14} className="text-cyan-400"/> 
                {loading ? "-" : weather.current.wind_speed_10m} km/h
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center transform scale-110 -mr-2">
          <WeatherIcon3D type={type} isDay={isDay} />
        </div>
      </div>
    </GlassTile>
  );
};
    