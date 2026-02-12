import React, { useMemo } from 'react';
import { GlassTile } from './GlassTile';
import { DASH_TEXT } from './constants';
import {
  MapPin, Wind, Droplets, Thermometer,
  ArrowUpRight, ArrowDownRight, ChevronRight, Eye,
} from 'lucide-react';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type WxType = 'clear' | 'cloudy' | 'rain' | 'storm';

const wxType = (code: number): WxType => {
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  if (code >= 1 && code <= 3) return 'cloudy';
  return 'clear';
};

/* ═══════════════════════════════════════════════════════════════
   PALETTES — 8 rich color schemes
   ═══════════════════════════════════════════════════════════════ */

type Pal = {
  sky: [string, string, string];  // gradient stops
  orb: [string, string];          // ambient orb
  sun: string;                    // celestial body color
  glow: string;                   // glow color
  accent: string;                 // UI accent
  text: string;                   // description text
  temp: string;                   // tailwind gradient classes
  chip: string;                   // chip background accent
  particle: string[];             // particle colors
  bar: string;                    // bottom bar color
};

const PAL: Record<string, Pal> = {
  'clear-day': {
    sky: ['rgba(251,191,36,0.12)', 'rgba(15,23,42,0.97)', 'rgba(234,88,12,0.06)'],
    orb: ['rgba(251,191,36,0.25)', 'rgba(245,158,11,0.12)'],
    sun: '#FBBF24', glow: 'rgba(251,191,36,0.55)', accent: '#FBBF24',
    text: '#FDE68A', temp: 'from-amber-50 via-yellow-300 to-orange-500',
    chip: 'rgba(251,191,36,0.08)', particle: ['#FBBF24','#F59E0B','#FDE047','#FCD34D'],
    bar: '#F59E0B',
  },
  'clear-night': {
    sky: ['rgba(99,102,241,0.1)', 'rgba(5,5,25,0.98)', 'rgba(79,70,229,0.08)'],
    orb: ['rgba(129,140,248,0.2)', 'rgba(99,102,241,0.1)'],
    sun: '#A5B4FC', glow: 'rgba(129,140,248,0.45)', accent: '#A5B4FC',
    text: '#C7D2FE', temp: 'from-slate-50 via-indigo-200 to-violet-400',
    chip: 'rgba(129,140,248,0.08)', particle: ['#818CF8','#A5B4FC','#6366F1','#C4B5FD'],
    bar: '#6366F1',
  },
  'cloudy-day': {
    sky: ['rgba(148,163,184,0.08)', 'rgba(15,23,42,0.97)', 'rgba(100,116,139,0.05)'],
    orb: ['rgba(148,163,184,0.18)', 'rgba(100,116,139,0.08)'],
    sun: '#CBD5E1', glow: 'rgba(148,163,184,0.4)', accent: '#CBD5E1',
    text: '#E2E8F0', temp: 'from-white via-slate-200 to-blue-300',
    chip: 'rgba(148,163,184,0.08)', particle: ['#94A3B8','#CBD5E1','#64748B','#E2E8F0'],
    bar: '#94A3B8',
  },
  'cloudy-night': {
    sky: ['rgba(71,85,105,0.1)', 'rgba(5,8,20,0.98)', 'rgba(51,65,85,0.08)'],
    orb: ['rgba(71,85,105,0.2)', 'rgba(51,65,85,0.1)'],
    sun: '#94A3B8', glow: 'rgba(71,85,105,0.4)', accent: '#94A3B8',
    text: '#CBD5E1', temp: 'from-slate-100 via-slate-300 to-blue-400',
    chip: 'rgba(71,85,105,0.1)', particle: ['#475569','#64748B','#94A3B8','#334155'],
    bar: '#475569',
  },
  'rain-day': {
    sky: ['rgba(59,130,246,0.1)', 'rgba(10,15,30,0.97)', 'rgba(37,99,235,0.06)'],
    orb: ['rgba(59,130,246,0.22)', 'rgba(37,99,235,0.1)'],
    sun: '#60A5FA', glow: 'rgba(59,130,246,0.5)', accent: '#60A5FA',
    text: '#BFDBFE', temp: 'from-blue-50 via-blue-300 to-cyan-500',
    chip: 'rgba(59,130,246,0.08)', particle: ['#3B82F6','#60A5FA','#93C5FD','#2563EB'],
    bar: '#3B82F6',
  },
  'rain-night': {
    sky: ['rgba(29,78,216,0.1)', 'rgba(5,5,20,0.98)', 'rgba(30,58,138,0.08)'],
    orb: ['rgba(29,78,216,0.2)', 'rgba(30,58,138,0.1)'],
    sun: '#3B82F6', glow: 'rgba(29,78,216,0.45)', accent: '#3B82F6',
    text: '#93C5FD', temp: 'from-blue-100 via-blue-400 to-indigo-500',
    chip: 'rgba(29,78,216,0.1)', particle: ['#1D4ED8','#2563EB','#3B82F6','#1E3A8A'],
    bar: '#1D4ED8',
  },
  'storm-day': {
    sky: ['rgba(124,58,237,0.12)', 'rgba(8,5,20,0.97)', 'rgba(109,40,217,0.08)'],
    orb: ['rgba(124,58,237,0.25)', 'rgba(109,40,217,0.12)'],
    sun: '#A78BFA', glow: 'rgba(124,58,237,0.55)', accent: '#A78BFA',
    text: '#DDD6FE', temp: 'from-violet-50 via-purple-300 to-fuchsia-500',
    chip: 'rgba(124,58,237,0.08)', particle: ['#7C3AED','#A78BFA','#8B5CF6','#6D28D9'],
    bar: '#7C3AED',
  },
  'storm-night': {
    sky: ['rgba(76,29,149,0.12)', 'rgba(5,3,18,0.98)', 'rgba(49,46,129,0.1)'],
    orb: ['rgba(76,29,149,0.22)', 'rgba(49,46,129,0.12)'],
    sun: '#8B5CF6', glow: 'rgba(76,29,149,0.5)', accent: '#8B5CF6',
    text: '#C4B5FD', temp: 'from-purple-100 via-violet-400 to-indigo-600',
    chip: 'rgba(76,29,149,0.1)', particle: ['#4C1D95','#6D28D9','#7C3AED','#312E81'],
    bar: '#4C1D95',
  },
};

/* ═══════════════════════════════════════════════════════════════
   WEATHER SCENE
   ═══════════════════════════════════════════════════════════════ */

const WxScene = React.memo(function WxScene({
  type, isDay, p,
}: {
  type: WxType; isDay: boolean; p: Pal;
}) {
  const stars = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: 12 + ((i * 31 + 11) % 76), y: 6 + ((i * 19 + 5) % 50),
    s: .8 + (i % 3) * .6, d: i * .35,
  })), []);

  const rainDrops = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    i, h: type === 'storm' ? 16 : 11,
    dur: .55 + i * .06, del: i * .12,
    x: 10 + i * 22,
  })), [type]);

  const showSun = isDay && (type === 'clear' || type === 'cloudy');
  const showMoon = !isDay && (type === 'clear' || type === 'cloudy');
  const showCloud = type !== 'clear';
  const showRain = type === 'rain' || type === 'storm';
  const showBolt = type === 'storm';

  return (
    <div className="WX relative w-[155px] h-[155px] lg:w-[170px] lg:h-[170px] flex items-center justify-center shrink-0">

      {/* Ambient halo */}
      <div className="absolute inset-0 WXa" style={{
        background: `radial-gradient(circle at 50% 42%, ${p.orb[0]} 0%, ${p.orb[1]} 35%, transparent 65%)`,
        filter: 'blur(28px)',
        animation: 'WX-halo 5s ease-in-out infinite',
      }} />

      {/* Secondary depth orb */}
      <div className="absolute WXa" style={{
        width: '60%', height: '60%', top: '15%', left: '20%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`,
        filter: 'blur(40px)', opacity: .25,
        animation: 'WX-orb2 7s ease-in-out infinite',
      }} />

      {/* ── Sun ── */}
      {showSun && (
        <div className={clsx('absolute WXa', type === 'cloudy' ? '-top-1 right-0 w-[52px] h-[52px]' : 'w-[88px] h-[88px]')}
          style={{ animation: 'WX-celestial 8s ease-in-out infinite' }}>

          {/* Core sphere */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle at 36% 32%, #FEF9C3 0%, #FBBF24 28%, #F59E0B 55%, #EA580C 100%)`,
            boxShadow: `
              0 0 50px rgba(251,191,36,.8),
              0 0 100px rgba(251,191,36,.3),
              0 0 160px rgba(245,158,11,.15),
              inset 0 -8px 20px rgba(0,0,0,.12),
              inset 0 5px 10px rgba(255,255,255,.35)
            `,
          }} />

          {/* Inner hot spot */}
          <div className="absolute rounded-full" style={{
            top: '22%', left: '25%', width: '30%', height: '30%',
            background: 'radial-gradient(circle, rgba(255,255,255,.5) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }} />

          {/* Corona rings */}
          {[0, 1, 2].map(i => (
            <div key={i} className="absolute rounded-full WXa" style={{
              inset: `${-8 - i * 8}px`,
              border: `${1.5 - i * .3}px solid rgba(251,191,36,${.15 - i * .04})`,
              animation: `WX-corona ${3.5 + i}s ease-in-out ${i * .4}s infinite`,
            }} />
          ))}

          {/* Ray beams (only clear) */}
          {type === 'clear' && (
            <div className="absolute inset-0 WXa" style={{ animation: 'WX-rays 20s linear infinite' }}>
              {[0,45,90,135,180,225,270,315].map(deg => (
                <div key={deg} className="absolute" style={{
                  top: '50%', left: '50%', width: '2px', height: '18px',
                  transformOrigin: '50% 0',
                  transform: `translate(-50%, -150%) rotate(${deg}deg)`,
                  background: `linear-gradient(to top, rgba(251,191,36,.4), transparent)`,
                  borderRadius: '2px',
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Moon ── */}
      {showMoon && (
        <div className={clsx('absolute WXa', type === 'cloudy' ? '-top-1 right-1 w-[46px] h-[46px]' : 'w-[72px] h-[72px]')}
          style={{ animation: 'WX-celestial 9s ease-in-out infinite' }}>

          <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle at 33% 28%, #F8FAFC 0%, #E2E8F0 35%, #94A3B8 75%, #64748B 100%)`,
            boxShadow: `
              0 0 35px rgba(255,255,255,.45),
              0 0 70px rgba(255,255,255,.15),
              0 0 120px rgba(148,163,184,.08),
              inset -5px -5px 15px rgba(0,0,0,.22),
              inset 3px 3px 10px rgba(255,255,255,.25)
            `,
          }} />

          {/* Craters */}
          {[
            { t: '20%', l: '18%', w: '20%', h: '20%', o: .25 },
            { t: '50%', l: '55%', w: '14%', h: '14%', o: .2 },
            { t: '38%', l: '35%', w: '10%', h: '10%', o: .18 },
          ].map((c, i) => (
            <div key={i} className="absolute rounded-full" style={{
              top: c.t, left: c.l, width: c.w, height: c.h,
              background: `rgba(100,116,139,${c.o})`,
              boxShadow: `inset 1px 1px 3px rgba(0,0,0,.12)`,
            }} />
          ))}

          {/* Aura */}
          <div className="absolute -inset-4 rounded-full WXa" style={{
            border: '1px solid rgba(255,255,255,.06)',
            animation: 'WX-corona 5s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* ── Cloud ── */}
      {showCloud && (
        <div className="relative z-10 WXa" style={{ animation: 'WX-cloud 7s ease-in-out infinite' }}>
          <svg width="145" height="96" viewBox="0 0 145 96">
            <defs>
              <linearGradient id="wxcg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="wxch" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,.85)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="wxcs">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity=".35" />
              </filter>
            </defs>

            {/* Back cloud (depth) */}
            <path d="M58,78 Q38,78 38,60 Q38,38 60,38 Q68,18 92,18 Q116,18 122,44 Q145,44 145,66 Q145,78 126,78 Z"
              fill="#475569" opacity=".25" transform="translate(-6, 6)" />

            {/* Main cloud */}
            <path d="M42,80 Q20,80 20,58 Q20,32 46,32 Q54,12 80,12 Q106,12 114,40 Q140,40 140,62 Q140,80 116,80 Z"
              fill="url(#wxcg)" filter="url(#wxcs)" />

            {/* Top highlight */}
            <path d="M52,36 Q66,20 80,20 Q102,20 112,40"
              fill="none" stroke="url(#wxch)" strokeWidth="4" strokeLinecap="round" opacity=".65" />

            {/* Inner luminance */}
            <ellipse cx="82" cy="48" rx="28" ry="16" fill="white" opacity=".06" />
          </svg>

          {/* ── Rain ── */}
          {showRain && (
            <div className="absolute -bottom-3 left-6 right-6 flex justify-between">
              {rainDrops.map(r => (
                <div key={r.i} className="WXa" style={{
                  width: '2.5px', height: `${r.h}px`, borderRadius: '4px',
                  background: `linear-gradient(to bottom, rgba(147,197,253,.7), rgba(37,99,235,.95))`,
                  boxShadow: '0 0 5px rgba(59,130,246,.35)',
                  transform: 'rotate(14deg)',
                  animation: `WX-rain ${r.dur}s ease-in ${r.del}s infinite`,
                }} />
              ))}
            </div>
          )}

          {/* ── Lightning ── */}
          {showBolt && (
            <svg width="24" height="32" viewBox="0 0 24 30"
              className="absolute -bottom-6 right-8 WXa"
              style={{
                filter: `drop-shadow(0 0 14px rgba(250,204,21,.95)) drop-shadow(0 0 30px rgba(250,204,21,.4))`,
                animation: 'WX-bolt 2.8s ease-in-out infinite',
              }}>
              <path d="M13 1L3 14H11L10 23L20 10H12L13 1Z" fill="#FDE047" />
              <path d="M13 1L3 14H11L10 23L20 10H12L13 1Z" fill="white" opacity=".45" />
            </svg>
          )}
        </div>
      )}

      {/* ── Atmospheric particles ── */}
      {p.particle.slice(0, 5).map((c, i) => (
        <span key={i} className="absolute rounded-full WXa" style={{
          width: 2 + i % 3, height: 2 + i % 3,
          top: `${12 + ((i * 23) % 70)}%`,
          left: `${8 + ((i * 31 + 7) % 80)}%`,
          background: `radial-gradient(circle, ${c}80, transparent 70%)`,
          boxShadow: `0 0 ${4 + i * 2}px ${c}40`,
          animation: `WX-particle ${4 + i * 1.2}s ease-in-out ${i * .6}s infinite`,
        }} />
      ))}

      {/* ── Night stars ── */}
      {!isDay && stars.map(s => (
        <span key={s.x} className="absolute rounded-full bg-white WXa" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s,
          boxShadow: `0 0 ${s.s * 3}px rgba(255,255,255,.6)`,
          animation: `WX-star ${2 + s.d}s ease-in-out ${s.d}s infinite`,
        }} />
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   STAT CHIP
   ═══════════════════════════════════════════════════════════════ */

const Chip = React.memo(function Chip({
  icon: Ic, value, unit, color, bg,
}: {
  icon: React.ComponentType<any>;
  value: string | number;
  unit?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="WW-chip flex items-center gap-1.5 px-2.5 py-[5px] rounded-[10px]"
      style={{
        background: bg,
        border: '1px solid rgba(255,255,255,.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
      <Ic size={12} strokeWidth={2.5} style={{ color, flexShrink: 0 }} />
      <span className="text-[11px] font-bold text-white/85" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
        {unit && <span className="text-[9px] text-white/45 ml-[2px] font-semibold">{unit}</span>}
      </span>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════ */

const Skeleton = () => (
  <div className="flex justify-between items-center h-full p-5 animate-pulse">
    <div className="flex flex-col gap-3 flex-1">
      <div className="h-4 w-24 rounded-lg bg-white/[.04]" />
      <div className="h-14 w-20 rounded-xl bg-white/[.04]" />
      <div className="h-4 w-28 rounded-lg bg-white/[.04]" />
      <div className="flex gap-2"><div className="h-6 w-16 rounded-lg bg-white/[.04]" /><div className="h-6 w-16 rounded-lg bg-white/[.04]" /></div>
    </div>
    <div className="w-32 h-32 rounded-full bg-white/[.03]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════════════════════════ */

export const WeatherWidget = ({
  weather, loading, location, lang, onNavigate,
}: any) => {
  const isDay = weather?.current?.is_day !== 0;
  const code = weather?.current?.weather_code || 0;
  const type = wxType(code);
  const txt = DASH_TEXT[lang];

  const pk = `${type}-${isDay ? 'day' : 'night'}`;
  const p: Pal = (PAL as any)[pk] || PAL['clear-day'];

  const temp = weather?.current?.temperature_2m;
  const wind = weather?.current?.wind_speed_10m;
  const hum = weather?.current?.relative_humidity_2m;
  const feel = weather?.current?.apparent_temperature;
  const hi = weather?.daily?.temperature_2m_max?.[0];
  const lo = weather?.daily?.temperature_2m_min?.[0];

  return (
    <GlassTile
      onClick={() => onNavigate('WEATHER')}
      className="WW h-full relative overflow-hidden group cursor-pointer"
    >
      <style>{`
/* ═══ SCENE ANIMATIONS ═══ */
@keyframes WX-halo {
  0%,100% { transform: scale(1); opacity: .45; }
  50% { transform: scale(1.12); opacity: .65; }
}
@keyframes WX-orb2 {
  0%,100% { transform: translate(0,0) scale(1); opacity: .2; }
  50% { transform: translate(5%,-8%) scale(1.15); opacity: .35; }
}
@keyframes WX-celestial {
  0%,100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.02); }
}
@keyframes WX-corona {
  0%,100% { transform: scale(1); opacity: .25; }
  50% { transform: scale(1.08); opacity: .5; }
}
@keyframes WX-rays {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes WX-cloud {
  0%,100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-3px) translateX(2px); }
  75% { transform: translateY(2px) translateX(-2px); }
}
@keyframes WX-rain {
  0% { transform: rotate(14deg) translateY(-6px); opacity: 0; }
  25% { opacity: .85; }
  100% { transform: rotate(14deg) translateY(24px); opacity: 0; }
}
@keyframes WX-bolt {
  0%,85%,100% { opacity: 0; transform: scale(.85); }
  87% { opacity: 1; transform: scale(1.12); }
  89% { opacity: .2; }
  91% { opacity: 1; transform: scale(1); }
  93% { opacity: .1; }
}
@keyframes WX-star {
  0%,100% { opacity: .15; transform: scale(.7); }
  50% { opacity: .85; transform: scale(1.25); }
}
@keyframes WX-particle {
  0%,100% { transform: translate(0,0) scale(1); opacity: .3; }
  50% { transform: translate(6px,-10px) scale(.6); opacity: .12; }
}

/* ═══ WIDGET ANIMATIONS ═══ */
@keyframes WW-orb-drift {
  0%,100% { transform: translate(0,0) scale(1) rotate(0deg); opacity: .5; }
  33% { transform: translate(5%,-4%) scale(1.08) rotate(3deg); opacity: .65; }
  66% { transform: translate(-3%,5%) scale(.95) rotate(-2deg); opacity: .55; }
}
@keyframes WW-temp-pulse {
  0%,100% { filter: drop-shadow(0 4px 16px ${p.glow}); }
  50% { filter: drop-shadow(0 6px 28px ${p.glow}) drop-shadow(0 0 50px ${p.glow}); }
}
@keyframes WW-edge-breathe {
  0%,100% { opacity: .25; }
  50% { opacity: .55; }
}
@keyframes WW-bar-glow {
  0%,100% { box-shadow: 0 0 8px ${p.glow}; }
  50% { box-shadow: 0 0 18px ${p.glow}, 0 0 35px ${p.glow}; }
}
@keyframes WW-shine {
  0% { transform: translateX(-200%) skewX(-18deg); }
  100% { transform: translateX(300%) skewX(-18deg); }
}

.WW-chip {
  transition: all .3s ease;
}
.WW-chip:hover {
  background: rgba(255,255,255,.08) !important;
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .WXa, .WWa { animation: none !important; transition: none !important; }
}
      `}</style>

      {/* ═══ BG-1: Sky gradient ═══ */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(155deg, ${p.sky[0]} 0%, ${p.sky[1]} 45%, ${p.sky[2]} 100%)`,
      }} />

      {/* ═══ BG-2: Primary aurora orb ═══ */}
      <div className="absolute pointer-events-none WWa" style={{
        top: '-35%', right: '-30%',
        width: '90%', height: '90%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${p.orb[0]} 0%, ${p.orb[1]} 40%, transparent 70%)`,
        filter: 'blur(50px)',
        animation: 'WW-orb-drift 16s ease-in-out infinite',
      }} />

      {/* ═══ BG-3: Secondary depth orb ═══ */}
      <div className="absolute pointer-events-none WWa" style={{
        bottom: '-20%', left: '-15%',
        width: '60%', height: '60%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${p.orb[1]} 0%, transparent 65%)`,
        filter: 'blur(45px)', opacity: .35,
        animation: 'WW-orb-drift 12s ease-in-out 2s infinite',
      }} />

      {/* ═══ BG-4: Top specular ═══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(130% 50% at 50% -8%, rgba(255,255,255,.06) 0%, transparent 50%)',
      }} />

      {/* ═══ BG-5: Bottom depth ═══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.35) 100%)',
      }} />

      {/* ═══ BG-6: Grain ═══ */}
      <div className="absolute inset-0 pointer-events-none opacity-[.12]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`,
        backgroundSize: '128px', mixBlendMode: 'overlay',
      }} />

      {/* ═══ BG-7: Top edge highlight ═══ */}
      <div className="absolute top-0 left-5 right-5 h-px pointer-events-none WWa" style={{
        background: `linear-gradient(90deg, transparent, ${p.accent}25, rgba(255,255,255,.14), ${p.accent}25, transparent)`,
        animation: 'WW-edge-breathe 4.5s ease-in-out infinite',
      }} />

      {/* ═══ BG-8: Bottom accent bar ═══ */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] pointer-events-none overflow-hidden">
        <div className="h-full WWa" style={{
          background: `linear-gradient(90deg, transparent 5%, ${p.bar} 25%, ${p.accent} 50%, ${p.bar} 75%, transparent 95%)`,
          animation: 'WW-bar-glow 4s ease-in-out infinite',
        }} />
      </div>

      {/* ═══ BG-9: Shine sweep ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-y-0 w-[40%] WWa" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.06) 40%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 60%, transparent)',
          animation: 'WW-shine 3s ease-in-out forwards',
        }} />
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10 flex justify-between items-stretch h-full p-[18px] lg:p-5 gap-1">
        {loading ? <Skeleton /> : (
          <>
            {/* ── Left column ── */}
            <div className="flex flex-col justify-between flex-1 min-w-0">

              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[8px]" style={{
                  background: p.chip,
                  border: `1px solid ${p.accent}18`,
                  boxShadow: `0 0 12px ${p.glow.replace(/[\d.]+\)$/, '.08)')}`,
                }}>
                  <MapPin size={12} strokeWidth={2.5} style={{ color: p.accent }} />
                </div>
                <span className="text-[12px] font-bold text-white/80 truncate tracking-wide">{location}</span>
                <ChevronRight size={13}
                  className="text-white/20 ml-auto shrink-0 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300"
                  strokeWidth={2.5}
                />
              </div>

              {/* Temperature */}
              <div className="flex items-baseline gap-1 -ml-0.5">
                <span className={clsx(
                  'text-[4rem] lg:text-[4.8rem] leading-none font-extralight tracking-[-0.04em]',
                  'text-transparent bg-clip-text bg-gradient-to-b', p.temp, 'WWa',
                )} style={{ animation: 'WW-temp-pulse 4.5s ease-in-out infinite' }}>
                  {Math.round(temp)}°
                </span>

                {hi != null && lo != null && (
                  <div className="flex flex-col gap-px ml-1.5 mb-2.5">
                    <span className="flex items-center gap-[2px] text-[10px] font-bold text-white/50">
                      <ArrowUpRight size={9} className="text-orange-400/80" strokeWidth={3} />
                      {Math.round(hi)}°
                    </span>
                    <span className="flex items-center gap-[2px] text-[10px] font-bold text-white/35">
                      <ArrowDownRight size={9} className="text-blue-400/70" strokeWidth={3} />
                      {Math.round(lo)}°
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-[14px] font-bold capitalize tracking-wide line-clamp-1 mb-2"
                style={{ color: p.text, textShadow: `0 0 20px ${p.glow.replace(/[\d.]+\)$/, '.2)')}` }}>
                {txt.weather_desc[code] || txt.weather_desc[0]}
              </p>

              {/* Stat chips */}
              <div className="flex items-center gap-[6px] flex-wrap">
                {wind != null && <Chip icon={Wind} value={Math.round(wind)} unit="km/h" color={p.accent} bg={p.chip} />}
                {hum != null && <Chip icon={Droplets} value={Math.round(hum)} unit="%" color="#60A5FA" bg="rgba(96,165,250,.06)" />}
                {feel != null && <Chip icon={Thermometer} value={`${Math.round(feel)}°`} color="#F472B6" bg="rgba(244,114,182,.06)" />}
              </div>
            </div>

            {/* ── Right: Scene ── */}
            <div className="flex items-center justify-center -mr-1">
              <WxScene type={type} isDay={isDay} p={p} />
            </div>
          </>
        )}
      </div>

      {/* ═══ Hover glow ═══ */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${p.accent}08 0%, transparent 65%)`,
      }} />
    </GlassTile>
  );
};