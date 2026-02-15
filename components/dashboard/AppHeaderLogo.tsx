import React, { useMemo } from 'react';
import { Sprout } from 'lucide-react';

const B = {
  emerald: '#10B981',
  teal: '#0D9488',
  gold: '#F59E0B',
  cyan: '#06B6D4',
  glow: 'rgba(16,185,129,0.5)',
  glowSoft: 'rgba(16,185,129,0.15)',
};

export const AppHeaderLogo = () => {
  const orbits = useMemo(() => [
    { size: 3, speed: 25, delay: 0, color: B.emerald },
    { size: 2.5, speed: 25, delay: -12.5, color: B.gold },
  ], []);

  return (
    <div className="HL group relative flex items-center gap-3">
      <style>{`
        .HL { --g: ${B.emerald}; --gold: ${B.gold}; --cyan: ${B.cyan}; }

        @keyframes HL-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes HL-glow {
          0%, 100% { opacity: .35; transform: scale(1); }
          50% { opacity: .55; transform: scale(1.08); }
        }
        @keyframes HL-ring {
          0% { transform: scale(1); opacity: .4; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes HL-dot {
          0%, 100% { opacity: .6; }
          50% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .HL, .HL * { animation: none !important; }
        }
      `}</style>

      {/* ═══ LOGO MARK ═══ */}
      <div className="relative shrink-0" style={{ width: 42, height: 42 }}>

        {/* Ambient glow */}
        <div
          className="absolute -inset-3 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${B.glowSoft} 0%, transparent 70%)`,
            animation: 'HL-glow 4s ease-in-out infinite',
          }}
        />

        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1.5px solid ${B.emerald}30`,
            animation: 'HL-ring 3s ease-out infinite',
          }}
        />

        {/* Orbit ring + dots */}
        <div className="absolute inset-0">
          {orbits.map((o, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ animation: `HL-orbit ${o.speed}s linear ${o.delay}s infinite` }}
            >
              <span
                className="absolute rounded-full"
                style={{
                  width: o.size, height: o.size,
                  top: 0, left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: o.color,
                  boxShadow: `0 0 6px ${o.color}90, 0 0 12px ${o.color}40`,
                }}
              />
            </div>
          ))}
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Main icon container */}
        <div
          className="relative w-full h-full rounded-[14px] overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-[1.04]"
          style={{
            background: `linear-gradient(145deg,
              rgba(16,185,129,0.12) 0%,
              rgba(15,23,42,0.95) 40%,
              rgba(13,148,136,0.08) 100%
            )`,
            border: '1px solid rgba(16,185,129,0.15)',
            boxShadow: `
              0 0 30px ${B.glowSoft},
              0 8px 24px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(0,0,0,0.2)
            `,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(145deg, ${B.emerald}18 0%, transparent 50%, ${B.teal}12 100%)` }}
          />
          <div className="absolute top-0 left-[18%] right-[18%] h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${B.emerald}30, rgba(255,255,255,0.2), ${B.emerald}30, transparent)` }}
          />
          <Sprout size={22} strokeWidth={2}
            className="relative z-10 text-emerald-400 transition-all duration-500 group-hover:text-emerald-300"
            style={{ filter: `drop-shadow(0 0 8px ${B.glow})` }}
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)' }}
          />
        </div>

        {/* Status dot */}
        <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center" style={{ width: 10, height: 10 }}>
          <span className="absolute inset-0 rounded-full"
            style={{ background: B.emerald, opacity: 0.3, animation: 'HL-ring 2s ease-out infinite' }}
          />
          <span className="relative rounded-full"
            style={{
              width: 6, height: 6,
              background: `linear-gradient(135deg, #34D399, ${B.emerald})`,
              boxShadow: `0 0 6px ${B.emerald}80`,
              animation: 'HL-dot 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* ═══ WORDMARK — Three-Color Branding ═══ */}
      <div className="flex flex-col gap-0.5 min-w-0">

        {/* Title: AI (emerald) · Krushi (gold) · Mitra (cyan) */}
        <h1 className="text-xl md:text-2xl font-black leading-none tracking-tight flex items-center gap-1.5">
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 2px 12px rgba(16,185,129,0.5))',
            }}
          >
            AI
          </span>
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 2px 12px rgba(251,191,36,0.5))',
            }}
          >
            Krushi
          </span>
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 2px 12px rgba(6,182,212,0.5))',
            }}
          >
            Mitra
          </span>
        </h1>

        {/* Subtitle with accent line */}
        <div className="flex items-center gap-2">
          <div
            className="h-[1.5px] w-6 rounded-full shrink-0"
            style={{
              background: `linear-gradient(90deg, ${B.emerald}60, ${B.gold}40, transparent)`,
            }}
          />
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400/90 uppercase tracking-[0.25em] leading-none truncate">
            AI Powered Enable
          </p>
        </div>
      </div>
    </div>
  );
};