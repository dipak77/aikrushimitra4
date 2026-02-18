
import React, { useMemo, useState, useEffect } from 'react';

const B = {
  emerald: '#10B981',
  teal: '#0D9488',
  gold: '#F59E0B',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  glow: 'rgba(16,185,129,0.5)',
  glowSoft: 'rgba(16,185,129,0.15)',
  glowCyan: 'rgba(6,182,212,0.3)',
};

export const AppHeaderLogo = () => {
  const [hovered, setHovered] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);

  // Eye blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 180);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const orbits = useMemo(() => [
    { size: 3, speed: 20, delay: 0, color: B.emerald },
    { size: 2.5, speed: 20, delay: -10, color: B.gold },
    { size: 2, speed: 20, delay: -5, color: B.cyan },
  ], []);

  return (
    <div
      className="HL group relative flex items-center gap-3 cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        .HL {
          --g: ${B.emerald};
          --gold: ${B.gold};
          --cyan: ${B.cyan};
        }

        /* ===== ORBIT ANIMATIONS ===== */
        @keyframes HL-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes HL-glow {
          0%, 100% { opacity: .3; transform: scale(1); }
          50% { opacity: .6; transform: scale(1.12); }
        }
        @keyframes HL-ring {
          0% { transform: scale(1); opacity: .35; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes HL-dot {
          0%, 100% { opacity: .5; }
          50% { opacity: 1; }
        }

        /* ===== EAGLE ANIMATIONS ===== */
        @keyframes eagle-idle-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-1.5px) rotate(-0.3deg); }
          70% { transform: translateY(-0.8px) rotate(0.3deg); }
        }
        @keyframes eagle-hover-excited {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          15% { transform: translateY(-2px) rotate(-1deg) scale(1.02); }
          30% { transform: translateY(0.5px) rotate(0.5deg) scale(1); }
          50% { transform: translateY(-2.5px) rotate(-0.5deg) scale(1.03); }
          70% { transform: translateY(0px) rotate(0.3deg) scale(1.01); }
          85% { transform: translateY(-1.5px) rotate(-0.8deg) scale(1.02); }
        }
        @keyframes wing-flap-idle {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          30% { transform: rotate(-3deg) scaleX(0.97); }
          60% { transform: rotate(2deg) scaleX(1.01); }
        }
        @keyframes wing-flap-idle-r {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          30% { transform: rotate(3deg) scaleX(0.97); }
          60% { transform: rotate(-2deg) scaleX(1.01); }
        }
        @keyframes wing-flap-excited {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          12% { transform: rotate(-12deg) scaleX(0.92); }
          25% { transform: rotate(8deg) scaleX(1.03); }
          37% { transform: rotate(-10deg) scaleX(0.94); }
          50% { transform: rotate(6deg) scaleX(1.02); }
          65% { transform: rotate(-8deg) scaleX(0.95); }
          80% { transform: rotate(4deg) scaleX(1.01); }
        }
        @keyframes wing-flap-excited-r {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          12% { transform: rotate(12deg) scaleX(0.92); }
          25% { transform: rotate(-8deg) scaleX(1.03); }
          37% { transform: rotate(10deg) scaleX(0.94); }
          50% { transform: rotate(-6deg) scaleX(1.02); }
          65% { transform: rotate(8deg) scaleX(0.95); }
          80% { transform: rotate(-4deg) scaleX(1.01); }
        }
        @keyframes chest-core-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shield-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes tail-wag {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes head-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }

        .eagle-body-idle { animation: eagle-idle-bob 4s ease-in-out infinite; }
        .eagle-body-hover { animation: eagle-hover-excited 1.2s ease-in-out infinite; }
        .wing-l-idle { animation: wing-flap-idle 4s ease-in-out infinite; transform-origin: right center; }
        .wing-r-idle { animation: wing-flap-idle-r 4s ease-in-out infinite; transform-origin: left center; }
        .wing-l-excited { animation: wing-flap-excited 0.8s ease-in-out infinite; transform-origin: right center; }
        .wing-r-excited { animation: wing-flap-excited-r 0.8s ease-in-out infinite; transform-origin: left center; }
        .head-tilt-hover { animation: head-tilt 1s ease-in-out infinite; transform-origin: center bottom; }
        .tail-wag-hover { animation: tail-wag 0.6s ease-in-out infinite; transform-origin: center top; }

        /* ===== WORDMARK ANIMATIONS ===== */
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .text-shimmer-ai {
          background-size: 200% auto;
          animation: text-shimmer 4s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .HL, .HL * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ═══════════════════════════════
           LOGO MARK WITH EAGLE
      ═══════════════════════════════ */}
      <div className="relative shrink-0" style={{ width: 44, height: 44 }}>

        {/* Ambient glow */}
        <div
          className="absolute -inset-4 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${B.glowSoft} 0%, transparent 70%)`,
            animation: 'HL-glow 4s ease-in-out infinite',
          }}
        />

        {/* Pulse ring */}
        <div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{
            border: `1.5px solid ${B.emerald}25`,
            animation: 'HL-ring 3s ease-out infinite',
          }}
        />

        {/* Orbit ring + dots */}
        <div className="absolute -inset-1">
          {orbits.map((o, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ animation: `HL-orbit ${o.speed}s linear ${o.delay}s infinite` }}
            >
              <span
                className="absolute rounded-full"
                style={{
                  width: o.size,
                  height: o.size,
                  top: 0,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: o.color,
                  boxShadow: `0 0 6px ${o.color}90, 0 0 12px ${o.color}40`,
                }}
              />
            </div>
          ))}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          />
        </div>

        {/* Main icon container */}
        <div
          className="relative w-full h-full rounded-[14px] overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-[1.06]"
          style={{
            background: `linear-gradient(145deg,
              rgba(16,185,129,0.12) 0%,
              rgba(15,23,42,0.95) 40%,
              rgba(13,148,136,0.08) 100%
            )`,
            border: `1px solid rgba(16,185,129,${hovered ? '0.3' : '0.15'})`,
            boxShadow: hovered
              ? `0 0 40px ${B.glowSoft}, 0 0 15px ${B.glowCyan}, 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)`
              : `0 0 25px ${B.glowSoft}, 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Inner gradient overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(145deg, ${B.emerald}15 0%, transparent 50%, ${B.teal}10 100%)`,
            }}
          />
          <div
            className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${B.emerald}35, rgba(255,255,255,0.2), ${B.emerald}35, transparent)`,
            }}
          />

          {/* Shimmer sweep on hover */}
          {hovered && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                  animation: 'shield-shimmer 1.5s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {/* ═══ THE EAGLE ROBOT (Inline SVG) ═══ */}
          <div className={`relative z-10 ${hovered ? 'eagle-body-hover' : 'eagle-body-idle'}`}>
            <svg
              viewBox="0 0 200 200"
              width="32"
              height="32"
              className="overflow-visible"
              style={{
                filter: `drop-shadow(0 0 6px ${B.glow})`,
              }}
            >
              <defs>
                <radialGradient id="hl-bodyG" cx="50%" cy="35%" r="50%">
                  <stop offset="0%" stopColor="#d1fae5" />
                  <stop offset="50%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <radialGradient id="hl-bellyG" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ecfdf5" />
                </radialGradient>
                <linearGradient id="hl-wingL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="hl-wingR" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <radialGradient id="hl-eyeG" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0891b2" />
                </radialGradient>
                <filter id="hl-glow">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="hl-softSh">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* LEFT WING */}
              <g className={hovered ? 'wing-l-excited' : 'wing-l-idle'}>
                <path
                  d="M55 90 C35 70, 18 58, 8 48 C5 44, 12 40, 22 46 C30 38, 38 34, 34 30 C32 27, 38 25, 45 30 C48 22, 55 20, 53 27 L65 70 Z"
                  fill="url(#hl-wingL)"
                  opacity="0.95"
                  filter="url(#hl-softSh)"
                />
                <path d="M48 65 C35 52, 25 46, 18 42" stroke="#047857" strokeWidth="0.8" fill="none" opacity="0.4" />
              </g>

              {/* RIGHT WING */}
              <g className={hovered ? 'wing-r-excited' : 'wing-r-idle'}>
                <path
                  d="M145 90 C165 70, 182 58, 192 48 C195 44, 188 40, 178 46 C170 38, 162 34, 166 30 C168 27, 162 25, 155 30 C152 22, 145 20, 147 27 L135 70 Z"
                  fill="url(#hl-wingR)"
                  opacity="0.95"
                  filter="url(#hl-softSh)"
                />
                <path d="M152 65 C165 52, 175 46, 182 42" stroke="#047857" strokeWidth="0.8" fill="none" opacity="0.4" />
              </g>

              {/* BODY */}
              <ellipse cx="100" cy="110" rx="42" ry="50" fill="url(#hl-bodyG)" filter="url(#hl-softSh)" />
              <ellipse cx="100" cy="120" rx="28" ry="32" fill="url(#hl-bellyG)" opacity="0.85" />

              {/* CHEST CORE */}
              <g style={{ transformOrigin: '100px 100px' }}>
                <circle cx="100" cy="100" r="8" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <circle cx="100" cy="100" r="5" fill="none" stroke="#22d3ee" strokeWidth="0.6" opacity="0.3"
                  style={{ animation: 'chest-core-spin 6s linear infinite', transformOrigin: '100px 100px' }}
                />
                <circle cx="100" cy="100" r="2.5" fill="#22d3ee" opacity="0.8" filter="url(#hl-glow)">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* HEAD */}
              <g className={hovered ? 'head-tilt-hover' : ''}>
                <ellipse cx="100" cy="65" rx="28" ry="25" fill="url(#hl-bodyG)" filter="url(#hl-softSh)" />
                
                {/* CREST */}
                <path d="M93 42 C95 28, 98 20, 100 14 C102 20, 105 28, 107 42" fill="#059669" opacity="0.9" />

                {/* ANTENNA */}
                <line x1="100" y1="14" x2="100" y2="6" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="100" cy="4" r="1.5" fill="#22d3ee" filter="url(#hl-glow)">
                  <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* EYES */}
                <g style={{ opacity: eyeBlink ? 0.1 : 1, transition: 'opacity 0.15s' }}>
                  <ellipse cx="88" cy="62" rx="7.5" ry="6.5" fill="url(#hl-eyeG)" opacity="0.9" filter="url(#hl-glow)" />
                  <ellipse cx="112" cy="62" rx="7.5" ry="6.5" fill="url(#hl-eyeG)" opacity="0.9" filter="url(#hl-glow)" />
                  <ellipse cx="89.5" cy="61.5" rx="2.5" ry="3.5" fill="#021a0f" opacity="0.6" />
                  <ellipse cx="113.5" cy="61.5" rx="2.5" ry="3.5" fill="#021a0f" opacity="0.6" />
                </g>

                {/* BEAK */}
                <path d="M95 73 L100 86 L105 73 Z" fill="#f59e0b" />
              </g>

              {/* FEET */}
              <g>
                <path d="M85 157 L85 170 L82 175" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M115 157 L115 170 L112 175" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Glass overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)',
            }}
          />
        </div>

        {/* Status dot (top-right) */}
        <div
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
          style={{ width: 11, height: 11 }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: B.emerald,
              opacity: 0.3,
              animation: 'HL-ring 2s ease-out infinite',
            }}
          />
          <span
            className="relative rounded-full"
            style={{
              width: 6,
              height: 6,
              background: `linear-gradient(135deg, #34D399, ${B.emerald})`,
              boxShadow: `0 0 6px ${B.emerald}80`,
              animation: 'HL-dot 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* AI micro-badge (bottom-left) */}
        <div
          className="absolute -bottom-1 -left-1 flex items-center justify-center transition-all duration-300"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: `0 0 8px ${B.glowSoft}`,
            opacity: hovered ? 1 : 0.7,
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <span
            style={{
              fontSize: '6px',
              fontWeight: 900,
              background: `linear-gradient(135deg, ${B.emerald}, ${B.cyan})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            AI
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════
           WORDMARK — THREE-COLOR BRANDING
      ═══════════════════════════════ */}
      <div className="flex flex-col gap-0.5 min-w-0">

        {/* Title: AI (emerald) · Krushi (gold) · Mitra (cyan) */}
        <h1 className="text-xl md:text-2xl font-black leading-none tracking-tight flex items-center gap-1.5">
          <span
            className="text-transparent bg-clip-text transition-all duration-300 text-shimmer-ai"
            style={{
              backgroundImage: `linear-gradient(90deg, #34d399, #10b981, #6ee7b7, #10b981, #34d399)`,
              backgroundSize: '200% auto',
              filter: `drop-shadow(0 2px 12px rgba(16,185,129,${hovered ? '0.7' : '0.4'}))`,
              WebkitBackgroundClip: 'text',
            }}
          >
            AI
          </span>
          <span
            className="text-transparent bg-clip-text transition-all duration-300"
            style={{
              backgroundImage: 'linear-gradient(90deg, #fcd34d, #f59e0b, #d97706)',
              filter: `drop-shadow(0 2px 12px rgba(251,191,36,${hovered ? '0.7' : '0.4'}))`,
              WebkitBackgroundClip: 'text',
            }}
          >
            Krushi
          </span>
          <span
            className="text-transparent bg-clip-text transition-all duration-300"
            style={{
              backgroundImage: 'linear-gradient(90deg, #67e8f9, #06b6d4, #0891b2)',
              filter: `drop-shadow(0 2px 12px rgba(6,182,212,${hovered ? '0.7' : '0.4'}))`,
              WebkitBackgroundClip: 'text',
            }}
          >
            Mitra
          </span>
        </h1>

        {/* Subtitle with animated accent line */}
        <div className="flex items-center gap-2 mt-0.5">
          <div
            className="h-[1.5px] rounded-full shrink-0 transition-all duration-500"
            style={{
              width: hovered ? 24 : 16,
              background: `linear-gradient(90deg, ${B.emerald}70, ${B.gold}50, ${B.cyan}30, transparent)`,
            }}
          />
          <p className="text-[10px] md:text-[11px] font-bold text-slate-400/90 uppercase tracking-[0.2em] leading-none truncate transition-colors duration-300 group-hover:text-slate-300/90">
            Smart Farming
          </p>
          {/* Tiny eagle icon indicator */}
          <span
            className="text-emerald-500/50 transition-all duration-300"
            style={{
              fontSize: '8px',
              opacity: hovered ? 1 : 0.5,
              transform: hovered ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s',
            }}
          >
            🦅
          </span>
        </div>
      </div>
    </div>
  );
};
