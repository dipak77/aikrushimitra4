import React, { useEffect, useRef, useState, useMemo } from "react";
import { Sprout, Wheat, Leaf, TrendingUp, Droplets, Sun, CloudRain, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */

const DURATION = 4200;
const EXIT_MS = 800;

const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

/* ── Colors ── */
const C = {
  bg: '#020807',
  emerald: { h: 152, s: 76, l: 46 },
  teal:    { h: 168, s: 80, l: 40 },
  gold:    { h: 43,  s: 96, l: 56 },
  cyan:    { h: 185, s: 90, l: 48 },
};

const h = (c: { h: number; s: number; l: number }, a = 1) =>
  `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

/* ── Phases ── */
const PHASES = [
  { text: 'Initializing sensors', icon: '◉', color: h(C.emerald) },
  { text: 'Analyzing field data', icon: '◎', color: h(C.teal) },
  { text: 'Building crop models', icon: '◈', color: h(C.gold) },
  { text: 'System ready', icon: '✦', color: '#fff' },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [p, setP] = useState(0);         // progress 0-100
  const [ph, setPh] = useState(0);       // phase index
  const [exit, setExit] = useState(false);
  const [on, setOn] = useState(false);   // mounted

  const raf = useRef(0);
  const t0 = useRef(0);
  const done = useRef(false);

  /* stable seeds */
  const dots = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i, x: Math.random() * 100, y: Math.random() * 100,
    s: 1.5 + Math.random() * 3.5,
    dx: -15 + Math.random() * 30, dy: -20 - Math.random() * 15,
    dur: 5 + Math.random() * 5, del: Math.random() * 5,
    a: .1 + Math.random() * .35,
    hue: C.emerald.h + (Math.random() - .5) * 40,
  })), []);

  const rings = useMemo(() => Array.from({ length: 3 }, (_, i) => ({
    i, size: 140 + i * 48, dur: 8 + i * 3, del: i * .8,
    opacity: .12 - i * .03,
  })), []);

  const stalks = useMemo(() => Array.from({ length: 11 }, (_, i) => ({
    i, h: 24 + (i * 7) % 22, golden: i % 4 === 0,
    trigger: (i / 11) * 65 + 8,
  })), []);

  useEffect(() => {
    setOn(true);
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setPh(3);
      setExit(true);
      setTimeout(onComplete, EXIT_MS);
    };
    const tick = (t: number) => {
      if (!t0.current) t0.current = t;
      const raw = Math.min((t - t0.current) / DURATION, 1);
      const val = Math.round(easeOutExpo(raw) * 100);
      setP(val);
      if (val < 25) setPh(0);
      else if (val < 55) setPh(1);
      else if (val < 85) setPh(2);
      else setPh(3);
      if (raw < 1) raf.current = requestAnimationFrame(tick);
      else setTimeout(finish, 400);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [onComplete]);

  const phase = PHASES[ph];
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference * (1 - p / 100);

  return (
    <div
      className={`SP ${on ? 'SP--on' : ''} ${exit ? 'SP--exit' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <style>{`
/* ═══════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════ */
.SP {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; background: ${C.bg};
  opacity: 0;
  transition: opacity ${EXIT_MS}ms cubic-bezier(.4,0,.2,1),
              transform ${EXIT_MS}ms cubic-bezier(.4,0,.2,1);
  color-scheme: dark;
}
.SP--on { opacity: 1; }
.SP--exit { opacity: 0; transform: scale(1.04); pointer-events: none; }

/* ═══════════════════════════════════════════════════
   BACKGROUND LAYERS
   ═══════════════════════════════════════════════════ */

/* 1 — Deep radial color wash */
.SP-bg1 {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 90% 70% at 50% 25%, ${h(C.emerald, .1)} 0%, transparent 55%),
    radial-gradient(ellipse 70% 80% at 20% 80%, ${h(C.teal, .06)} 0%, transparent 50%),
    radial-gradient(ellipse 60% 60% at 85% 70%, ${h(C.gold, .04)} 0%, transparent 50%);
}

/* 2 — Aurora blobs */
.SP-aurora {
  position: absolute; inset: -20%;
  animation: SP-aurora-drift 16s ease-in-out infinite;
  mix-blend-mode: screen;
}
.SP-aurora-a, .SP-aurora-b, .SP-aurora-c {
  position: absolute; border-radius: 50%; filter: blur(80px);
}
.SP-aurora-a {
  width: 420px; height: 420px; top: 8%; left: 15%;
  background: ${h(C.emerald, .18)};
  animation: SP-blob-a 12s ease-in-out infinite;
}
.SP-aurora-b {
  width: 350px; height: 350px; bottom: 15%; right: 10%;
  background: ${h(C.teal, .14)};
  animation: SP-blob-b 14s ease-in-out infinite;
}
.SP-aurora-c {
  width: 280px; height: 280px; top: 40%; left: 50%;
  background: ${h(C.gold, .08)};
  animation: SP-blob-c 10s ease-in-out infinite;
}

/* 3 — Moving grid floor */
.SP-grid-wrap {
  position: absolute; inset: 0;
  perspective: 550px; overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent 15%, black 55%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 15%, black 55%, black 80%, transparent 100%);
  opacity: .14;
}
.SP-grid {
  position: absolute; bottom: -55%; left: -20%; width: 140%; height: 110%;
  background-image:
    linear-gradient(${h(C.emerald, .3)} 1px, transparent 1px),
    linear-gradient(90deg, ${h(C.emerald, .3)} 1px, transparent 1px);
  background-size: 48px 48px;
  transform: rotateX(68deg);
  animation: SP-grid-move 22s linear infinite;
}

/* 4 — Scan line */
.SP-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, ${h(C.emerald, .25)}, ${h(C.cyan, .3)}, ${h(C.emerald, .25)}, transparent);
  box-shadow: 0 0 20px ${h(C.emerald, .15)};
  animation: SP-scan 4s ease-in-out infinite;
  pointer-events: none;
}

/* 5 — Film grain */
.SP-grain {
  position: absolute; inset: 0; pointer-events: none;
  opacity: .025; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px;
}

/* 6 — Vignette */
.SP-vig {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, ${C.bg} 100%);
}

/* ═══════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════ */
.SP-dot {
  position: absolute; border-radius: 50%; pointer-events: none;
  animation: SP-float var(--d) ease-in-out var(--dl) infinite;
}

/* ═══════════════════════════════════════════════════
   CONTENT STAGE
   ═══════════════════════════════════════════════════ */
.SP-stage {
  position: relative; z-index: 10;
  width: 100%; max-width: 440px;
  padding: 0 24px;
  display: flex; flex-direction: column; align-items: center;
}

/* ═══════════════════════════════════════════════════
   LOGO ORB — concentric rings + icon
   ═══════════════════════════════════════════════════ */
.SP-orb-wrap {
  position: relative;
  width: 140px; height: 140px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(.7) translateY(16px);
  transition: all 1s cubic-bezier(.16,1,.3,1) .1s;
}
.SP--on .SP-orb-wrap {
  opacity: 1; transform: scale(1) translateY(0);
}

/* Ambient glow behind orb */
.SP-orb-ambient {
  position: absolute; inset: -40px; border-radius: 50%;
  background: radial-gradient(circle, ${h(C.emerald, .2)} 0%, transparent 65%);
  animation: SP-breathe 4s ease-in-out infinite;
  pointer-events: none;
}

/* Concentric rings */
.SP-ring {
  position: absolute; border-radius: 50%;
  border: 1.5px solid;
  pointer-events: none;
}

/* Glass icon card */
.SP-icon-card {
  position: relative;
  width: 76px; height: 76px;
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid ${h(C.emerald, .15)};
  box-shadow:
    0 0 50px ${h(C.emerald, .12)},
    0 0 100px ${h(C.emerald, .05)},
    inset 0 1px 0 rgba(255,255,255,.15),
    inset 0 -1px 0 rgba(0,0,0,.2);
  overflow: hidden;
}
.SP-icon-card::before {
  content: '';
  position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
  background: linear-gradient(90deg, transparent, ${h(C.emerald, .35)}, rgba(255,255,255,.3), ${h(C.emerald, .35)}, transparent);
}
.SP-icon-wash {
  position: absolute; inset: 0;
  background: linear-gradient(145deg, ${h(C.emerald, .15)} 0%, transparent 50%, ${h(C.teal, .1)} 100%);
}

/* ═══════════════════════════════════════════════════
   CIRCULAR PROGRESS (SVG ring around orb)
   ═══════════════════════════════════════════════════ */
.SP-cprog {
  position: absolute; inset: -12px;
}
.SP-cprog-track {
  fill: none;
  stroke: ${h(C.emerald, .06)};
  stroke-width: 2;
}
.SP-cprog-fill {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset .2s linear;
  filter: drop-shadow(0 0 6px ${h(C.emerald, .5)});
}
.SP-cprog-glow {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset .2s linear;
  opacity: .25;
  filter: blur(4px);
}

/* ═══════════════════════════════════════════════════
   TITLE
   ═══════════════════════════════════════════════════ */
.SP-title {
  margin-top: 32px;
  font-size: 36px; font-weight: 900;
  letter-spacing: -.03em; line-height: 1.1;
  text-align: center;
  background: linear-gradient(135deg,
    #fff 0%, ${h(C.emerald, .95)} 25%, #fff 50%, ${h(C.gold, .9)} 75%, #fff 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: SP-title-shine 5s ease-in-out infinite;
  opacity: 0; transform: translateY(14px);
  transition: all .9s cubic-bezier(.16,1,.3,1) .2s;
}
.SP--on .SP-title { opacity: 1; transform: translateY(0); }

/* ═══════════════════════════════════════════════════
   SUBTITLE
   ═══════════════════════════════════════════════════ */
.SP-sub {
  margin-top: 10px;
  display: flex; align-items: center; gap: 12px;
  opacity: 0; transform: translateY(10px);
  transition: all .8s ease .35s;
}
.SP--on .SP-sub { opacity: 1; transform: translateY(0); }
.SP-sub-line {
  height: 1px; width: 32px;
  background: linear-gradient(90deg, transparent, ${h(C.emerald, .35)});
}
.SP-sub-text {
  font-size: 10px; font-weight: 700;
  letter-spacing: .22em; text-transform: uppercase;
  color: ${h(C.emerald, .45)};
}

/* ═══════════════════════════════════════════════════
   FEATURE PILLS
   ═══════════════════════════════════════════════════ */
.SP-pills {
  display: flex; gap: 8px; margin-top: 22px;
  flex-wrap: wrap; justify-content: center;
}
.SP-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 14px; border-radius: 100px;
  font-size: 10px; font-weight: 700;
  color: ${h(C.emerald, .65)};
  background: ${h(C.emerald, .04)};
  border: 1px solid ${h(C.emerald, .08)};
  backdrop-filter: blur(8px);
  opacity: 0; transform: translateY(10px) scale(.92);
  transition: all .6s cubic-bezier(.16,1,.3,1);
}
.SP--on .SP-pill { opacity: 1; transform: translateY(0) scale(1); }

/* ═══════════════════════════════════════════════════
   WHEAT FIELD SCENE
   ═══════════════════════════════════════════════════ */
.SP-field {
  position: relative; width: 100%; height: 90px;
  margin-top: 28px; display: flex;
  align-items: flex-end; justify-content: center;
  overflow: hidden;
}
.SP-field-gnd {
  position: absolute; bottom: 0; left: 8%; right: 8%; height: 1.5px;
  background: linear-gradient(90deg,
    transparent, ${h(C.emerald, .25)}, ${h(C.gold, .2)}, ${h(C.emerald, .25)}, transparent);
  box-shadow: 0 0 10px ${h(C.emerald, .08)};
}
.SP-field-glow {
  position: absolute; bottom: -16px; left: 15%; right: 15%; height: 32px;
  background: radial-gradient(ellipse at 50% 0%, ${h(C.emerald, .06)} 0%, transparent 70%);
  pointer-events: none;
}
.SP-stalks {
  display: flex; align-items: flex-end;
  justify-content: center; gap: 5px;
  padding: 0 16px; position: relative; z-index: 2;
}
.SP-stalk {
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  transform-origin: bottom center;
  transition: all .6s cubic-bezier(.34,1.56,.64,1);
}

/* Beam scanner */
.SP-beam {
  position: absolute; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(to bottom, transparent, ${h(C.cyan, .7)}, transparent);
  box-shadow: 0 0 10px ${h(C.cyan, .3)}, 3px 0 16px ${h(C.cyan, .12)};
  animation: SP-beam-scan 3.2s ease-in-out infinite alternate;
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════
   HUD STATUS
   ═══════════════════════════════════════════════════ */
.SP-hud {
  width: 100%; max-width: 300px;
  margin-top: 24px;
  opacity: 0; transform: translateY(8px);
  transition: all .6s ease .45s;
}
.SP--on .SP-hud { opacity: 1; transform: translateY(0); }

.SP-hud-row {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 6px;
}
.SP-hud-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 9px; font-weight: 800;
  letter-spacing: .14em; text-transform: uppercase;
  transition: color .3s;
}
.SP-hud-pct {
  font-size: 10px; font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  color: rgba(255,255,255,.3);
}

/* Linear progress bar */
.SP-bar {
  height: 3px; width: 100%; border-radius: 100px;
  background: ${h(C.emerald, .06)};
  border: 1px solid ${h(C.emerald, .06)};
  overflow: hidden; position: relative;
}
.SP-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, ${h(C.teal, .7)}, ${h(C.emerald, .9)}, ${h(C.gold, .8)});
  position: relative; transition: width .15s linear;
}
.SP-bar-tip {
  position: absolute; right: 0; top: -1px; bottom: -1px; width: 24px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55));
  border-radius: 0 100px 100px 0; filter: blur(1px);
}
.SP-bar-ref {
  margin-top: 3px; height: 1.5px; border-radius: 100px;
  opacity: .1; filter: blur(2px);
  background: linear-gradient(90deg, transparent, ${h(C.emerald, .5)}, transparent);
  transition: width .15s linear;
}

/* ═══════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════ */
@keyframes SP-aurora-drift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  33% { transform: translate(3%,-2%) rotate(3deg); }
  66% { transform: translate(-2%,3%) rotate(-2deg); }
}
@keyframes SP-blob-a {
  0%,100% { transform: translate(0,0) scale(1); opacity: .18; }
  50% { transform: translate(8%,5%) scale(1.15); opacity: .25; }
}
@keyframes SP-blob-b {
  0%,100% { transform: translate(0,0) scale(1); opacity: .14; }
  50% { transform: translate(-6%,-4%) scale(1.1); opacity: .2; }
}
@keyframes SP-blob-c {
  0%,100% { transform: translate(0,0) scale(1); opacity: .08; }
  50% { transform: translate(5%,-6%) scale(1.2); opacity: .14; }
}
@keyframes SP-grid-move {
  0% { transform: rotateX(68deg) translateY(0); }
  100% { transform: rotateX(68deg) translateY(48px); }
}
@keyframes SP-scan {
  0% { top: 15%; opacity: 0; }
  10% { opacity: .5; }
  90% { opacity: .5; }
  100% { top: 85%; opacity: 0; }
}
@keyframes SP-float {
  0%,100% { transform: translate(0,0) scale(1); opacity: var(--a); }
  30% { transform: translate(calc(var(--dx)*.4), calc(var(--dy)*.3)) scale(.82); opacity: calc(var(--a)*.6); }
  60% { transform: translate(var(--dx), var(--dy)) scale(.6); opacity: calc(var(--a)*.3); }
  85% { transform: translate(calc(var(--dx)*.6), calc(var(--dy)*.8)) scale(.88); opacity: calc(var(--a)*.55); }
}
@keyframes SP-breathe {
  0%,100% { opacity: .45; transform: scale(1); }
  50% { opacity: .75; transform: scale(1.1); }
}
@keyframes SP-ring-spin {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to { transform: translate(-50%,-50%) rotate(360deg); }
}
@keyframes SP-title-shine {
  0% { background-position: 300% 50%; }
  100% { background-position: -300% 50%; }
}
@keyframes SP-beam-scan {
  0% { left: 8%; opacity: 0; }
  12% { opacity: .6; }
  88% { opacity: .6; }
  100% { left: 92%; opacity: 0; }
}

@media (min-width: 768px) {
  .SP-title { font-size: 48px; }
  .SP-orb-wrap { width: 160px; height: 160px; }
  .SP-icon-card { width: 88px; height: 88px; border-radius: 26px; }
  .SP-stage { max-width: 520px; }
}

@media (prefers-reduced-motion: reduce) {
  .SP, .SP * {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
  }
}
      `}</style>

      {/* ═══ BG-1: Color wash ═══ */}
      <div className="SP-bg1" />

      {/* ═══ BG-2: Aurora blobs ═══ */}
      <div className="SP-aurora">
        <div className="SP-aurora-a" />
        <div className="SP-aurora-b" />
        <div className="SP-aurora-c" />
      </div>

      {/* ═══ BG-3: Perspective grid ═══ */}
      <div className="SP-grid-wrap"><div className="SP-grid" /></div>

      {/* ═══ BG-4: Horizontal scan line ═══ */}
      <div className="SP-scanline" />

      {/* ═══ BG-5: Particles ═══ */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {dots.map(d => {
          const c = `hsla(${d.hue},75%,58%,${d.a})`;
          return (
            <span key={d.i} className="SP-dot" style={{
              top: `${d.y}%`, left: `${d.x}%`,
              width: d.s, height: d.s,
              background: `radial-gradient(circle,${c} 0%,transparent 70%)`,
              boxShadow: `0 0 ${d.s * 4}px ${c}`,
              '--d': `${d.dur}s`, '--dl': `${d.del}s`,
              '--a': `${d.a}`, '--dx': `${d.dx}px`, '--dy': `${d.dy}px`,
            } as React.CSSProperties} />
          );
        })}
      </div>

      {/* ═══ BG-6: Grain ═══ */}
      <div className="SP-grain" />

      {/* ═══ BG-7: Vignette ═══ */}
      <div className="SP-vig" />

      {/* ═══ CONTENT ═══ */}
      <div className="SP-stage">

        {/* ── Orb (logo + circular progress) ── */}
        <div className="SP-orb-wrap">
          {/* Ambient glow */}
          <div className="SP-orb-ambient" />

          {/* Concentric rings */}
          {rings.map(r => (
            <div key={r.i} className="SP-ring" style={{
              width: r.size, height: r.size,
              top: '50%', left: '50%',
              borderColor: h(C.emerald, r.opacity),
              animation: `SP-ring-spin ${r.dur}s linear ${r.del}s infinite`,
              borderStyle: r.i === 1 ? 'dashed' : 'solid',
            }} />
          ))}

          {/* Circular progress SVG */}
          <svg className="SP-cprog" viewBox="0 0 100 100">
            <circle className="SP-cprog-track" cx="50" cy="50" r="44" />
            <circle className="SP-cprog-glow" cx="50" cy="50" r="44"
              stroke={`url(#sp-grad)`}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
            />
            <circle className="SP-cprog-fill" cx="50" cy="50" r="44"
              stroke={`url(#sp-grad)`}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="sp-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={h(C.teal)} />
                <stop offset="50%" stopColor={h(C.emerald)} />
                <stop offset="100%" stopColor={h(C.gold)} />
              </linearGradient>
            </defs>
          </svg>

          {/* Glass icon card */}
          <div className="SP-icon-card">
            <div className="SP-icon-wash" />
            <Sprout size={34} strokeWidth={1.8} style={{
              color: h(C.emerald, .9),
              filter: `drop-shadow(0 0 10px ${h(C.emerald, .45)})`,
              position: 'relative', zIndex: 2,
            }} />
          </div>
        </div>

        {/* ── Title ── */}
        <h1 className="SP-title">AI Krushi Mitra</h1>

        {/* ── Subtitle ── */}
        <div className="SP-sub">
          <div className="SP-sub-line" />
          <span className="SP-sub-text">Smart Agriculture Platform</span>
          <div className="SP-sub-line" style={{ transform: 'scaleX(-1)' }} />
        </div>

        {/* ── Pills ── */}
        <div className="SP-pills">
          {[
            { icon: Sun, label: 'Weather', del: 380 },
            { icon: TrendingUp, label: 'Market', del: 480 },
            { icon: Droplets, label: 'Irrigation', del: 580 },
            { icon: Zap, label: 'AI Advisory', del: 680 },
          ].map((f, i) => (
            <div key={i} className="SP-pill" style={{
              transitionDelay: `${f.del}ms`,
            }}>
              <f.icon size={13} strokeWidth={2.2} />
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── Wheat field ── */}
        <div className="SP-field">
          {/* Scanner beam */}
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            pointerEvents: 'none',
            opacity: p > 10 ? .45 : 0,
            transition: 'opacity .5s',
          }}>
            <div className="SP-beam" />
          </div>

          <div className="SP-stalks">
            {stalks.map(s => (
              <div key={s.i} className="SP-stalk" style={{
                height: s.h,
                transform: p > s.trigger ? 'scaleY(1)' : 'scaleY(0) translateY(6px)',
                opacity: p > s.trigger ? (.45 + p / 200) : 0,
                transitionDelay: `${s.i * 35}ms`,
              }}>
                <Wheat
                  size={s.h > 38 ? 22 : 16}
                  strokeWidth={1.5}
                  style={{
                    color: s.golden ? h(C.gold, .75) : h(C.emerald, .65),
                    filter: s.golden
                      ? `drop-shadow(0 0 5px ${h(C.gold, .35)})`
                      : `drop-shadow(0 0 4px ${h(C.emerald, .25)})`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="SP-field-gnd" />
          <div className="SP-field-glow" />
        </div>

        {/* ── HUD ── */}
        <div className="SP-hud">
          <div className="SP-hud-row">
            <div className="SP-hud-label" style={{ color: phase.color }}>
              <span style={{
                display: 'inline-flex', fontSize: 10,
                animation: ph < 3 ? 'SP-ring-spin 2s linear infinite' : 'none',
              }}>
                {phase.icon}
              </span>
              <span>{phase.text}</span>
            </div>
            <span className="SP-hud-pct">{p}%</span>
          </div>

          <div className="SP-bar">
            <div className="SP-bar-fill" style={{ width: `${p}%` }}>
              <div className="SP-bar-tip" />
            </div>
          </div>
          <div className="SP-bar-ref" style={{ width: `${p}%` }} />
        </div>
      </div>
    </div>
  );
}