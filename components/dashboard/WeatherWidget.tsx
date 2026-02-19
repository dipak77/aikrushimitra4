
import React, { useCallback, useMemo, useRef, useState, useId } from "react";
import clsx from "clsx";
import {
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Eye,
} from "lucide-react";
import { GlassTile } from './GlassTile';
import { Language } from '../../types';

type IconProps = {
  size?: number;
  animated?: boolean;
  className?: string;
};

type Weather3DIconKind =
  | "clearDay"
  | "clearNight"
  | "cloudy"
  | "partlyCloudyDay"
  | "partlyCloudyNight"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "windyDay"
  | "windyNight"
  | "rainWind"
  | "stormWind";

/* ──────────────────────────────────────────────────────────────
   Text (minimal).
   ────────────────────────────────────────────────────────────── */
const DASH_TEXT: any = {
  en: {
    weather_desc: {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Heavy showers",
      82: "Violent showers",
      85: "Snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm + hail",
      99: "Severe thunderstorm",
    },
  },
};

type WxType = "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog" | "windy";

type Pal = {
  sky: [string, string, string];
  orb: [string, string];
  accent: string;
  glow: string;
  text: string;
  temp: string;
  chip: string;
  chipBorder: string;
  bar: string;
  hoverGlow: string;
  shimmer: string;
  highlight: string;
  aurora: string;
  depth: string;
  ring: string;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const wxTypeFrom = (code: number, windKmh?: number): WxType => {
  if (code >= 95) return "storm";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 1 && code <= 3) return "cloudy";
  if ((windKmh ?? 0) >= 28) return "windy";
  return "clear";
};

const PAL: Record<string, Pal> = {
  "clear-day": {
    sky: ["rgba(251,191,36,0.18)", "rgba(10,14,30,0.98)", "rgba(234,88,12,0.10)"],
    orb: ["rgba(251,191,36,0.35)", "rgba(245,158,11,0.18)"],
    accent: "#FBBF24",
    glow: "rgba(251,191,36,0.6)",
    text: "#FDE68A",
    temp: "from-amber-50 via-yellow-300 to-orange-500",
    chip: "rgba(251,191,36,0.08)",
    chipBorder: "rgba(251,191,36,0.16)",
    bar: "#F59E0B",
    hoverGlow: "rgba(251,191,36,0.10)",
    shimmer: "rgba(255,255,255,0.45)",
    highlight: "rgba(255,251,235,0.65)",
    aurora: "rgba(251,191,36,0.06)",
    depth: "rgba(234,88,12,0.04)",
    ring: "rgba(251,191,36,0.12)",
  },
  "clear-night": {
    sky: ["rgba(99,102,241,0.16)", "rgba(3,3,18,0.99)", "rgba(79,70,229,0.12)"],
    orb: ["rgba(129,140,248,0.28)", "rgba(99,102,241,0.16)"],
    accent: "#A5B4FC",
    glow: "rgba(129,140,248,0.5)",
    text: "#C7D2FE",
    temp: "from-slate-50 via-indigo-200 to-violet-400",
    chip: "rgba(129,140,248,0.09)",
    chipBorder: "rgba(129,140,248,0.16)",
    bar: "#6366F1",
    hoverGlow: "rgba(129,140,248,0.10)",
    shimmer: "rgba(199,210,254,0.35)",
    highlight: "rgba(238,242,255,0.55)",
    aurora: "rgba(99,102,241,0.05)",
    depth: "rgba(79,70,229,0.04)",
    ring: "rgba(129,140,248,0.10)",
  },
  "cloudy-day": {
    sky: ["rgba(148,163,184,0.14)", "rgba(10,14,30,0.98)", "rgba(100,116,139,0.10)"],
    orb: ["rgba(148,163,184,0.26)", "rgba(100,116,139,0.14)"],
    accent: "#CBD5E1",
    glow: "rgba(148,163,184,0.48)",
    text: "#E2E8F0",
    temp: "from-white via-slate-200 to-blue-300",
    chip: "rgba(148,163,184,0.09)",
    chipBorder: "rgba(148,163,184,0.14)",
    bar: "#94A3B8",
    hoverGlow: "rgba(148,163,184,0.08)",
    shimmer: "rgba(241,245,249,0.38)",
    highlight: "rgba(248,250,252,0.58)",
    aurora: "rgba(148,163,184,0.04)",
    depth: "rgba(100,116,139,0.03)",
    ring: "rgba(148,163,184,0.08)",
  },
  "cloudy-night": {
    sky: ["rgba(71,85,105,0.16)", "rgba(3,4,14,0.99)", "rgba(51,65,85,0.12)"],
    orb: ["rgba(71,85,105,0.28)", "rgba(51,65,85,0.16)"],
    accent: "#94A3B8",
    glow: "rgba(71,85,105,0.48)",
    text: "#CBD5E1",
    temp: "from-slate-100 via-slate-300 to-blue-400",
    chip: "rgba(71,85,105,0.11)",
    chipBorder: "rgba(71,85,105,0.16)",
    bar: "#475569",
    hoverGlow: "rgba(71,85,105,0.08)",
    shimmer: "rgba(203,213,225,0.28)",
    highlight: "rgba(226,232,240,0.48)",
    aurora: "rgba(71,85,105,0.04)",
    depth: "rgba(51,65,85,0.03)",
    ring: "rgba(71,85,105,0.08)",
  },
  "rain-day": {
    sky: ["rgba(59,130,246,0.16)", "rgba(6,10,24,0.98)", "rgba(37,99,235,0.11)"],
    orb: ["rgba(59,130,246,0.30)", "rgba(37,99,235,0.16)"],
    accent: "#60A5FA",
    glow: "rgba(59,130,246,0.58)",
    text: "#BFDBFE",
    temp: "from-blue-50 via-blue-300 to-cyan-500",
    chip: "rgba(59,130,246,0.09)",
    chipBorder: "rgba(59,130,246,0.16)",
    bar: "#3B82F6",
    hoverGlow: "rgba(59,130,246,0.10)",
    shimmer: "rgba(191,219,254,0.38)",
    highlight: "rgba(239,246,255,0.55)",
    aurora: "rgba(59,130,246,0.05)",
    depth: "rgba(37,99,235,0.04)",
    ring: "rgba(59,130,246,0.10)",
  },
  "rain-night": {
    sky: ["rgba(29,78,216,0.16)", "rgba(2,3,14,0.99)", "rgba(30,58,138,0.13)"],
    orb: ["rgba(29,78,216,0.28)", "rgba(30,58,138,0.16)"],
    accent: "#3B82F6",
    glow: "rgba(29,78,216,0.52)",
    text: "#93C5FD",
    temp: "from-blue-100 via-blue-400 to-indigo-500",
    chip: "rgba(29,78,216,0.11)",
    chipBorder: "rgba(29,78,216,0.16)",
    bar: "#1D4ED8",
    hoverGlow: "rgba(29,78,216,0.10)",
    shimmer: "rgba(147,197,253,0.32)",
    highlight: "rgba(219,234,254,0.48)",
    aurora: "rgba(29,78,216,0.05)",
    depth: "rgba(30,58,138,0.04)",
    ring: "rgba(29,78,216,0.10)",
  },
  "storm-day": {
    sky: ["rgba(124,58,237,0.18)", "rgba(5,3,14,0.98)", "rgba(109,40,217,0.13)"],
    orb: ["rgba(124,58,237,0.34)", "rgba(109,40,217,0.18)"],
    accent: "#A78BFA",
    glow: "rgba(124,58,237,0.62)",
    text: "#DDD6FE",
    temp: "from-violet-50 via-purple-300 to-fuchsia-500",
    chip: "rgba(124,58,237,0.09)",
    chipBorder: "rgba(124,58,237,0.16)",
    bar: "#7C3AED",
    hoverGlow: "rgba(124,58,237,0.10)",
    shimmer: "rgba(221,214,254,0.38)",
    highlight: "rgba(250,245,255,0.55)",
    aurora: "rgba(124,58,237,0.06)",
    depth: "rgba(109,40,217,0.04)",
    ring: "rgba(124,58,237,0.12)",
  },
  "storm-night": {
    sky: ["rgba(76,29,149,0.18)", "rgba(2,1,12,0.99)", "rgba(49,46,129,0.14)"],
    orb: ["rgba(76,29,149,0.30)", "rgba(49,46,129,0.18)"],
    accent: "#8B5CF6",
    glow: "rgba(76,29,149,0.58)",
    text: "#C4B5FD",
    temp: "from-purple-100 via-violet-400 to-indigo-600",
    chip: "rgba(76,29,149,0.11)",
    chipBorder: "rgba(76,29,149,0.16)",
    bar: "#4C1D95",
    hoverGlow: "rgba(76,29,149,0.10)",
    shimmer: "rgba(196,181,253,0.32)",
    highlight: "rgba(237,233,254,0.48)",
    aurora: "rgba(76,29,149,0.06)",
    depth: "rgba(49,46,129,0.04)",
    ring: "rgba(76,29,149,0.12)",
  },
  "snow-day": {
    sky: ["rgba(226,232,240,0.18)", "rgba(8,12,22,0.98)", "rgba(125,211,252,0.10)"],
    orb: ["rgba(255,255,255,0.28)", "rgba(186,230,253,0.16)"],
    accent: "#E2E8F0",
    glow: "rgba(186,230,253,0.55)",
    text: "#E5E7EB",
    temp: "from-white via-slate-200 to-sky-300",
    chip: "rgba(226,232,240,0.08)",
    chipBorder: "rgba(226,232,240,0.14)",
    bar: "#BAE6FD",
    hoverGlow: "rgba(186,230,253,0.10)",
    shimmer: "rgba(255,255,255,0.40)",
    highlight: "rgba(255,255,255,0.55)",
    aurora: "rgba(186,230,253,0.06)",
    depth: "rgba(148,163,184,0.04)",
    ring: "rgba(226,232,240,0.10)",
  },
  "snow-night": {
    sky: ["rgba(148,163,184,0.14)", "rgba(2,3,12,0.99)", "rgba(56,189,248,0.10)"],
    orb: ["rgba(226,232,240,0.18)", "rgba(56,189,248,0.12)"],
    accent: "#CBD5E1",
    glow: "rgba(56,189,248,0.45)",
    text: "#E2E8F0",
    temp: "from-slate-100 via-slate-300 to-sky-400",
    chip: "rgba(148,163,184,0.10)",
    chipBorder: "rgba(148,163,184,0.16)",
    bar: "#38BDF8",
    hoverGlow: "rgba(56,189,248,0.10)",
    shimmer: "rgba(226,232,240,0.32)",
    highlight: "rgba(241,245,249,0.45)",
    aurora: "rgba(56,189,248,0.05)",
    depth: "rgba(51,65,85,0.05)",
    ring: "rgba(148,163,184,0.10)",
  },
  "fog-day": {
    sky: ["rgba(203,213,225,0.18)", "rgba(10,14,30,0.98)", "rgba(148,163,184,0.10)"],
    orb: ["rgba(203,213,225,0.26)", "rgba(148,163,184,0.14)"],
    accent: "#E2E8F0",
    glow: "rgba(203,213,225,0.45)",
    text: "#E2E8F0",
    temp: "from-white via-slate-200 to-slate-300",
    chip: "rgba(203,213,225,0.08)",
    chipBorder: "rgba(203,213,225,0.14)",
    bar: "#CBD5E1",
    hoverGlow: "rgba(203,213,225,0.10)",
    shimmer: "rgba(248,250,252,0.36)",
    highlight: "rgba(248,250,252,0.52)",
    aurora: "rgba(203,213,225,0.05)",
    depth: "rgba(100,116,139,0.04)",
    ring: "rgba(203,213,225,0.10)",
  },
  "fog-night": {
    sky: ["rgba(71,85,105,0.16)", "rgba(2,3,12,0.99)", "rgba(148,163,184,0.10)"],
    orb: ["rgba(148,163,184,0.22)", "rgba(71,85,105,0.14)"],
    accent: "#CBD5E1",
    glow: "rgba(148,163,184,0.45)",
    text: "#CBD5E1",
    temp: "from-slate-100 via-slate-300 to-slate-400",
    chip: "rgba(71,85,105,0.11)",
    chipBorder: "rgba(71,85,105,0.16)",
    bar: "#94A3B8",
    hoverGlow: "rgba(148,163,184,0.10)",
    shimmer: "rgba(226,232,240,0.28)",
    highlight: "rgba(241,245,249,0.40)",
    aurora: "rgba(148,163,184,0.05)",
    depth: "rgba(30,41,59,0.05)",
    ring: "rgba(148,163,184,0.10)",
  },
  "windy-day": {
    sky: ["rgba(34,197,94,0.10)", "rgba(10,14,30,0.98)", "rgba(59,130,246,0.08)"],
    orb: ["rgba(59,130,246,0.20)", "rgba(34,197,94,0.10)"],
    accent: "#A7F3D0",
    glow: "rgba(52,211,153,0.55)",
    text: "#D1FAE5",
    temp: "from-emerald-50 via-teal-200 to-cyan-400",
    chip: "rgba(52,211,153,0.08)",
    chipBorder: "rgba(52,211,153,0.14)",
    bar: "#34D399",
    hoverGlow: "rgba(52,211,153,0.10)",
    shimmer: "rgba(240,253,250,0.32)",
    highlight: "rgba(236,254,255,0.52)",
    aurora: "rgba(52,211,153,0.05)",
    depth: "rgba(59,130,246,0.04)",
    ring: "rgba(52,211,153,0.10)",
  },
  "windy-night": {
    sky: ["rgba(16,185,129,0.10)", "rgba(2,3,12,0.99)", "rgba(59,130,246,0.08)"],
    orb: ["rgba(59,130,246,0.18)", "rgba(16,185,129,0.10)"],
    accent: "#6EE7B7",
    glow: "rgba(16,185,129,0.50)",
    text: "#A7F3D0",
    temp: "from-emerald-100 via-teal-300 to-cyan-500",
    chip: "rgba(16,185,129,0.10)",
    chipBorder: "rgba(16,185,129,0.14)",
    bar: "#10B981",
    hoverGlow: "rgba(16,185,129,0.10)",
    shimmer: "rgba(209,250,229,0.26)",
    highlight: "rgba(240,253,250,0.42)",
    aurora: "rgba(16,185,129,0.05)",
    depth: "rgba(30,58,138,0.04)",
    ring: "rgba(16,185,129,0.10)",
  },
};

const WxStatusDot = React.memo(function WxStatusDot({
  color,
  type,
}: {
  color: string;
  type: WxType;
}) {
  return (
    <span className="relative flex items-center justify-center w-2 h-2 mr-1.5 shrink-0">
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          backgroundColor: color,
          opacity: 0.25,
          animationDuration: type === "storm" ? "1.1s" : "2.4s",
        }}
      />
      <span
        className="relative rounded-full w-1.5 h-1.5"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}60`,
        }}
      />
    </span>
  );
});

// ENHANCED: Clay Gradients & Shadows with more depth
function ClayDefs({
  id,
  base,
  light,
  shadow,
  glow,
}: {
  id: string;
  base: string;
  light: string;
  shadow: string;
  glow?: string;
}) {
  return (
    <defs>
      <radialGradient id={`${id}-clay`} cx="35%" cy="28%" r="70%">
        <stop offset="0%" stopColor={light} />
        <stop offset="40%" stopColor={base} />
        <stop offset="100%" stopColor={shadow} />
      </radialGradient>

      <radialGradient id={`${id}-hi`} cx="30%" cy="22%" r="55%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
        <stop offset="35%" stopColor="rgba(255,255,255,0.32)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>

      <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,0.25)" />
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.16)" />
      </filter>

      {glow ? (
        <linearGradient id={`${id}-gl`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={glow} stopOpacity="0.7" />
          <stop offset="100%" stopColor={glow} stopOpacity="0.0" />
        </linearGradient>
      ) : null}
    </defs>
  );
}

// ENHANCED Sun
const SunClay = React.memo(function SunClay({ size = 120, animated = true, className }: IconProps) {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={className}
      style={{
        overflow: "visible",
        filter: "drop-shadow(0 14px 34px rgba(255,186,0,0.30))",
      }}
    >
      <ClayDefs
        id={uid}
        base="#F6B01D"
        light="#FFE59A"
        shadow="#C97206"
        glow="rgba(255,198,64,0.9)"
      />
      <g style={{ transformOrigin: "70px 70px", animation: animated ? "wx-spin 22s linear infinite" : undefined }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 360) / 12;
          return (
            <g key={i} transform={`rotate(${a} 70 70)`} opacity={0.96}>
              <rect x="65" y="6" width="10" height="24" rx="5" fill="#F5A524" />
              <rect x="67" y="8" width="6" height="18" rx="3" fill="rgba(255,255,255,0.35)" />
            </g>
          );
        })}
      </g>
      <g filter={`url(#${uid}-shadow)`}>
        <circle cx="70" cy="74" r="34" fill={`url(#${uid}-clay)`} />
        <circle cx="70" cy="74" r="34" fill={`url(#${uid}-hi)`} opacity={0.92} />
        <circle cx="74" cy="80" r="30" fill="none" stroke="rgba(120,54,0,0.18)" strokeWidth="5" />
      </g>
      <ellipse cx="70" cy="128" rx="26" ry="7" fill="rgba(0,0,0,0.18)" style={{ filter: "blur(3px)" }} />
    </svg>
  );
});

// ENHANCED Moon
const MoonClay = React.memo(function MoonClay({ size = 110, animated = true, className }: IconProps) {
  const uid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className={className} style={{ overflow: "visible" }}>
      <ClayDefs id={uid} base="#B9C3D3" light="#F7FAFF" shadow="#667389" />
      <g style={{ animation: animated ? "wx-float 6.2s ease-in-out infinite" : undefined, transformOrigin: "70px 70px" }}>
        <g filter={`url(#${uid}-shadow)`}>
          <circle cx="72" cy="70" r="34" fill={`url(#${uid}-clay)`} />
          <circle cx="72" cy="70" r="34" fill={`url(#${uid}-hi)`} opacity={0.9} />
          <circle cx="90" cy="58" r="34" fill="rgba(10,12,24,0.22)" />
          <g opacity={0.9}>
            <circle cx="60" cy="60" r="6.5" fill="rgba(58,71,90,0.20)" />
            <circle cx="76" cy="78" r="5" fill="rgba(58,71,90,0.18)" />
            <circle cx="64" cy="84" r="3.4" fill="rgba(58,71,90,0.16)" />
          </g>
          <ellipse cx="78" cy="78" rx="26" ry="24" fill="none" stroke="rgba(30,41,59,0.16)" strokeWidth="5" />
        </g>
      </g>
      {[
        { x: 22, y: 22, s: 3.2 },
        { x: 112, y: 28, s: 2.6 },
        { x: 118, y: 92, s: 2.2 },
      ].map((st, i) => (
        <circle
          key={i} cx={st.x} cy={st.y} r={st.s} fill="white" opacity={0.85}
          style={{ animation: animated ? `wx-twinkle ${2.2 + i * 0.7}s ease-in-out ${i * 0.3}s infinite` : undefined }}
        />
      ))}
    </svg>
  );
});

// ENHANCED Cloud
const CloudClay = React.memo(function CloudClay({
  size = 160,
  shade = "light",
  animated = true,
  className,
}: IconProps & { shade?: "light" | "mid" | "dark" }) {
  const uid = useId();
  const tone = shade === "dark"
      ? { base: "#6B778C", light: "#B8C3D2", shadow: "#2E3A4E" }
      : shade === "mid"
        ? { base: "#C7D1DF", light: "#F3F6FB", shadow: "#7B879A" }
        : { base: "#E7EEF7", light: "#FFFFFF", shadow: "#9AA7BC" };

  return (
    <svg width={size} height={(size * 0.7) | 0} viewBox="0 0 220 150" className={className} style={{ overflow: "visible" }}>
      <ClayDefs id={uid} base={tone.base} light={tone.light} shadow={tone.shadow} />
      <g style={{ animation: animated ? "wx-cloud 7.8s ease-in-out infinite" : undefined, transformOrigin: "110px 80px" }}>
        <g filter={`url(#${uid}-shadow)`}>
          <circle cx="80" cy="76" r="40" fill={`url(#${uid}-clay)`} />
          <circle cx="120" cy="58" r="46" fill={`url(#${uid}-clay)`} />
          <circle cx="160" cy="78" r="36" fill={`url(#${uid}-clay)`} />
          <rect x="52" y="82" width="132" height="44" rx="22" fill={`url(#${uid}-clay)`} />
          <ellipse cx="102" cy="44" rx="34" ry="18" fill={`url(#${uid}-hi)`} opacity={0.95} />
          <ellipse cx="70" cy="60" rx="18" ry="11" fill="rgba(255,255,255,0.55)" />
          <ellipse cx="154" cy="66" rx="16" ry="10" fill="rgba(255,255,255,0.42)" />
          <path d="M66,104 Q98,120 126,112 Q152,120 184,104" fill="none" stroke="rgba(30,41,59,0.12)" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
      <ellipse cx="110" cy="144" rx="68" ry="8" fill="rgba(0,0,0,0.14)" style={{ filter: "blur(3px)" }} />
    </svg>
  );
});

// ENHANCED Rain drops
const DropClay = React.memo(function DropClay({ x, y, s, delay, dur, animated = true }: { x: number; y: number; s: number; delay: number; dur: number; animated?: boolean }) {
  const uid = useId();
  return (
    <g style={{ transformOrigin: `${x}px ${y}px`, animation: animated ? `wx-rain ${dur}s ease-in ${delay}s infinite` : undefined }}>
      <defs>
        <linearGradient id={`${uid}-drop`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D7ECFF" />
          <stop offset="45%" stopColor="#6FB3FF" />
          <stop offset="100%" stopColor="#1B61D1" />
        </linearGradient>
      </defs>
      <path d={`M ${x} ${y} C ${x - 6 * s} ${y + 10 * s}, ${x - 7 * s} ${y + 16 * s}, ${x} ${y + 22 * s} C ${x + 7 * s} ${y + 16 * s}, ${x + 6 * s} ${y + 10 * s}, ${x} ${y} Z`} fill={`url(#${uid}-drop)`} style={{ filter: "drop-shadow(0 3px 6px rgba(59,130,246,0.25))" }} />
      <ellipse cx={x - 2.2 * s} cy={y + 11 * s} rx={2.2 * s} ry={5 * s} fill="rgba(255,255,255,0.55)" />
    </g>
  );
});

// ENHANCED Lightning bolt
const BoltClay = React.memo(function BoltClay({ x, y, s, animated = true }: { x: number; y: number; s: number; animated?: boolean }) {
  const uid = useId();
  return (
    <g style={{ animation: animated ? "wx-bolt 3.2s ease-in-out infinite" : undefined }}>
      <defs>
        <linearGradient id={`${uid}-bolt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF7C2" />
          <stop offset="45%" stopColor="#FFE166" />
          <stop offset="100%" stopColor="#F6B01D" />
        </linearGradient>
      </defs>
      <path d={`M ${x + 10 * s} ${y} L ${x - 8 * s} ${y + 24 * s} H ${x + 2 * s} L ${x - 4 * s} ${y + 44 * s} L ${x + 18 * s} ${y + 18 * s} H ${x + 7 * s} Z`} fill={`url(#${uid}-bolt)`} style={{ filter: "drop-shadow(0 0 16px rgba(255,208,80,0.65)) drop-shadow(0 10px 18px rgba(0,0,0,0.16))" }} />
      <path d={`M ${x + 6 * s} ${y + 6 * s} L ${x - 2 * s} ${y + 18 * s}`} stroke="rgba(255,255,255,0.6)" strokeWidth={2.8 * s} strokeLinecap="round" opacity={0.8} />
    </g>
  );
});

// ENHANCED Wind strokes
const WindStrokes = React.memo(function WindStrokes({ x, y, w, animated = true, speed = 1 }: { x: number; y: number; w: number; animated?: boolean; speed?: number }) {
  const dur = 3.4 / clamp(speed, 0.7, 1.6);
  return (
    <g style={{ animation: animated ? `wx-wind ${dur}s ease-in-out infinite` : undefined }}>
      <path d={`M ${x} ${y} C ${x + w * 0.22} ${y - 10}, ${x + w * 0.44} ${y - 10}, ${x + w * 0.62} ${y} C ${x + w * 0.76} ${y + 8}, ${x + w * 0.88} ${y + 8}, ${x + w} ${y}`} fill="none" stroke="rgba(170, 223, 255, 0.95)" strokeWidth="7" strokeLinecap="round" style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.16))" }} />
      <path d={`M ${x + 8} ${y + 18} C ${x + w * 0.24} ${y + 8}, ${x + w * 0.46} ${y + 8}, ${x + w * 0.66} ${y + 18} C ${x + w * 0.80} ${y + 26}, ${x + w * 0.90} ${y + 26}, ${x + w} ${y + 18}`} fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
});

export const Weather3DIcon = React.memo(function Weather3DIcon({
  kind,
  size = 180,
  animated = true,
  intensity = 1,
  className,
}: IconProps & { kind: Weather3DIconKind; intensity?: number }) {
  const k = kind;

  const rainParams = useMemo(() => {
    const s = clamp(intensity || 1, 0.7, 1.6);
    return [
      { x: 86, y: 98, sc: 0.95, d: 0.00, dur: 0.62 / s },
      { x: 112, y: 102, sc: 1.05, d: 0.10, dur: 0.66 / s },
      { x: 138, y: 98, sc: 0.90, d: 0.18, dur: 0.58 / s },
      { x: 162, y: 104, sc: 0.82, d: 0.26, dur: 0.60 / s },
    ];
  }, [intensity]);

  const snowParams = useMemo(() => {
    const s = clamp(intensity || 1, 0.7, 1.6);
    return [
      { x: 90, y: 106, r: 3.6, d: 0.00, dur: 1.25 / s },
      { x: 118, y: 110, r: 3.0, d: 0.18, dur: 1.32 / s },
      { x: 146, y: 106, r: 3.2, d: 0.28, dur: 1.18 / s },
      { x: 166, y: 112, r: 2.8, d: 0.38, dur: 1.38 / s },
    ];
  }, [intensity]);

  const svg = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className} style={{ overflow: "visible" }}>
      {children}
    </svg>
  );

  if (k === "clearDay") return <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}><SunClay size={Math.round(size * 0.92)} animated={animated} /></div>;
  if (k === "clearNight") return <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}><MoonClay size={Math.round(size * 0.92)} animated={animated} /></div>;
  if (k === "cloudy") return <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}><CloudClay size={Math.round(size * 1.05)} shade="mid" animated={animated} /></div>;

  if (k === "partlyCloudyDay") return svg(<><g transform="translate(38,26)"><SunClay size={120} animated={animated} /></g><g transform="translate(20,88)"><CloudClay size={190} shade="light" animated={animated} /></g></>);
  if (k === "partlyCloudyNight") return svg(<><g transform="translate(52,22)"><MoonClay size={120} animated={animated} /></g><g transform="translate(20,90)"><CloudClay size={190} shade="light" animated={animated} /></g></>);

  if (k === "rain") return svg(<><g transform="translate(22,72)"><CloudClay size={196} shade="mid" animated={animated} /></g><g>{rainParams.map((p, i) => <DropClay key={i} x={p.x} y={p.y} s={p.sc} delay={p.d} dur={p.dur} animated={animated} />)}</g></>);
  if (k === "storm") return svg(<><g transform="translate(18,68)"><CloudClay size={204} shade="dark" animated={animated} /></g><BoltClay x={138} y={98} s={1.05} animated={animated} /><g>{rainParams.slice(0, 3).map((p, i) => <DropClay key={i} x={p.x - 6} y={p.y + 2} s={p.sc * 0.9} delay={p.d} dur={p.dur * 0.9} animated={animated} />)}</g></>);
  if (k === "snow") return svg(<><g transform="translate(22,72)"><CloudClay size={196} shade="light" animated={animated} /></g><g>{snowParams.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgba(255,255,255,0.95)" style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.14))", animation: animated ? `wx-snow ${s.dur}s ease-in-out ${s.d}s infinite` : undefined }} />)}</g></>);
  if (k === "fog") return svg(<><g transform="translate(22,72)"><CloudClay size={196} shade="mid" animated={animated} /></g><g style={{ opacity: 0.95 }}>{Array.from({ length: 3 }, (_, i) => <rect key={i} x={34} y={140 + i * 18} width={172} height={14} rx={7} fill={`rgba(255,255,255,${0.22 - i * 0.04})`} style={{ filter: "blur(0.3px)", animation: animated ? `wx-fog ${7.2 + i * 1.1}s ease-in-out ${i * 0.4}s infinite` : undefined }} />)}</g></>);

  if (k === "windyDay") return svg(<><g transform="translate(44,20)"><SunClay size={108} animated={animated} /></g><g transform="translate(22,84)"><CloudClay size={196} shade="light" animated={animated} /></g><WindStrokes x={42} y={148} w={160} animated={animated} speed={intensity} /></>);
  if (k === "windyNight") return svg(<><g transform="translate(58,18)"><MoonClay size={108} animated={animated} /></g><g transform="translate(22,84)"><CloudClay size={196} shade="light" animated={animated} /></g><WindStrokes x={42} y={148} w={160} animated={animated} speed={intensity} /></>);
  if (k === "rainWind") return svg(<><g transform="translate(22,72)"><CloudClay size={196} shade="mid" animated={animated} /></g><WindStrokes x={44} y={142} w={160} animated={animated} speed={intensity} /><g>{rainParams.slice(0, 3).map((p, i) => <DropClay key={i} x={p.x} y={p.y} s={p.sc} delay={p.d} dur={p.dur} animated={animated} />)}</g></>);
  if (k === "stormWind") return svg(<><g transform="translate(18,68)"><CloudClay size={204} shade="dark" animated={animated} /></g><WindStrokes x={44} y={142} w={160} animated={animated} speed={intensity} /><BoltClay x={138} y={98} s={1.05} animated={animated} /></>);

  return <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}><CloudClay size={Math.round(size * 1.05)} shade="mid" animated={animated} /></div>;
});

export function mapTo3DIconKind(opts: { code: number; isDay: boolean; windKmh?: number }): Weather3DIconKind {
  const { code, isDay, windKmh = 0 } = opts;
  const windy = windKmh >= 28;

  if (code >= 95) return windy ? "stormWind" : "storm";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    if (windy) return "rainWind";
    return "rain";
  }

  if (code >= 1 && code <= 3) return isDay ? "partlyCloudyDay" : "partlyCloudyNight";
  if (windy) return isDay ? "windyDay" : "windyNight";

  return isDay ? "clearDay" : "clearNight";
}

const WEATHER_3D_ICON_CSS = `
@keyframes wx-float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
@keyframes wx-spin { from{ transform: rotate(0deg) } to{ transform: rotate(360deg) } }
@keyframes wx-cloud {
  0%,100%{ transform: translateX(0) translateY(0) }
  25%{ transform: translateX(7px) translateY(-4px) }
  50%{ transform: translateX(-5px) translateY(-2px) }
  75%{ transform: translateX(5px) translateY(3px) }
}
@keyframes wx-rain {
  0%{ transform: translateY(-18px) scale(1); opacity: 0 }
  12%{ opacity: 0.95 }
  100%{ transform: translateY(40px) scale(0.75); opacity: 0 }
}
@keyframes wx-snow {
  0%{ transform: translateY(-10px) rotate(0deg); opacity: 0 }
  14%{ opacity: 0.9 }
  100%{ transform: translateY(30px) rotate(220deg); opacity: 0 }
}
@keyframes wx-bolt {
  0%,82%,100%{ opacity: 0; transform: scale(0.72) translateY(6px) }
  83%{ opacity: 1; transform: scale(1.12) translateY(-4px) }
  86%{ opacity: 0.12 }
  88%{ opacity: 1; transform: scale(1.03) translateY(0) }
  93%{ opacity: 0 }
}
@keyframes wx-wind { 0%,100%{ transform: translateX(-10px) } 50%{ transform: translateX(12px) } }
@keyframes wx-fog { 0%,100%{ transform: translateX(-6px) } 50%{ transform: translateX(8px) } }
@keyframes wx-twinkle { 0%,100%{ opacity: .35; transform: scale(.75) } 50%{ opacity: 1; transform: scale(1.25) } }
`;

// WIDGET ANIMATION CSS - using CSS variables to prevent re-generation
const WIDGET_CSS = `
@keyframes WW-orb-drift {
  0%,100% { transform: translate(0,0) scale(1) rotate(0deg); opacity: .54; }
  25% { transform: translate(7%,-6%) scale(1.12) rotate(5deg); opacity: .70; }
  50% { transform: translate(-5%,7%) scale(.96) rotate(-4deg); opacity: .60; }
  75% { transform: translate(4%,-4%) scale(1.06) rotate(3deg); opacity: .64; }
}
@keyframes WW-temp-pulse {
  0%,100% { filter: drop-shadow(0 0 0 transparent); transform: scale(1); }
  50% { filter: drop-shadow(0 4px 46px var(--ww-glow-20)); transform: scale(1.015); }
}
@keyframes WW-edge-breathe { 0%,100% { opacity: .22; } 50% { opacity: .60; } }
@keyframes WW-bar-glow {
  0%,100% { box-shadow: 0 0 10px var(--ww-glow); opacity: .74; }
  50% { box-shadow: 0 0 24px var(--ww-glow), 0 0 50px var(--ww-glow); opacity: 1; }
}
@keyframes WW-shine { 0% { transform: translateX(-280%) skewX(-22deg); } 100% { transform: translateX(450%) skewX(-22deg); } }
@keyframes WW-chip-shimmer { 0% { transform: translateX(-220%); } 100% { transform: translateX(220%); } }
@keyframes WW-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes WW-fade-in-scale { from { opacity: 0; transform: translateY(6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes WW-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes WW-entrance { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.WW-chip { transition: all .45s cubic-bezier(.4,0,.15,1); }
.WW-chip:hover {
  background: rgba(255,255,255,.10) !important;
  transform: translateY(-2.5px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0,0,0,.28), 0 0 0 0.5px rgba(255,255,255,.10) inset, 0 -1px 0 rgba(255,255,255,.12) inset !important;
}
.WW-chip:active { transform: translateY(-1px) scale(1.01); transition-duration: .15s; }

@media (prefers-reduced-motion: reduce) { .WXa, .WWa { animation: none !important; } }
`;

const Chip = React.memo(function Chip({
  icon: Ic,
  value,
  unit,
  color,
  bg,
  borderColor,
}: {
  icon: React.ComponentType<any>;
  value: string | number;
  unit?: string;
  color: string;
  bg: string;
  borderColor: string;
}) {
  return (
    <div
      className="WW-chip group/chip relative flex items-center gap-1.5 px-2.5 py-[7px] rounded-[12px] overflow-hidden select-none"
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        boxShadow:
          "0 1px 4px rgba(0,0,0,.12), 0 0 0 0.5px rgba(255,255,255,.03) inset, 0 -1px 0 rgba(255,255,255,.05) inset, 0 4px 12px rgba(0,0,0,.08)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover/chip:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}18, ${color}0A 55%, transparent 78%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover/chip:opacity-100 transition-opacity duration-400"
        style={{
          background:
            "linear-gradient(110deg, transparent 20%, rgba(255,255,255,.14) 42%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.14) 58%, transparent 80%)",
          animation: "WW-chip-shimmer 2.2s ease-in-out infinite",
        }}
      />
      <Ic
        size={13}
        strokeWidth={2.5}
        style={{ color, flexShrink: 0, filter: `drop-shadow(0 0 5px ${color}45)` }}
        className="relative z-10 group-hover/chip:scale-110 transition-transform duration-300 ease-out"
      />
      <span
        className="relative z-10 text-[11px] font-bold text-white/90 group-hover/chip:text-white transition-colors duration-300"
        style={{
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 1px 3px rgba(0,0,0,.25)",
          letterSpacing: "0.01em",
        }}
      >
        {value}
        {unit && (
          <span className="text-[9px] text-white/42 group-hover/chip:text-white/58 ml-[2px] font-semibold transition-colors duration-300">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
});

const Skeleton = () => (
  <div className="flex justify-between items-center h-full p-5 w-full">
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-white/[.07] to-white/[.02] animate-pulse" style={{ animationDuration: "1.8s" }} />
        <div className="h-3.5 w-28 rounded-lg bg-gradient-to-r from-white/[.07] via-white/[.04] to-white/[.02] animate-pulse" style={{ animationDelay: "80ms", animationDuration: "1.8s" }} />
      </div>
      <div className="animate-pulse" style={{ animationDelay: "160ms", animationDuration: "1.8s" }}>
        <div className="h-[82px] w-32 rounded-2xl bg-gradient-to-br from-white/[.07] via-white/[.04] to-white/[.01]" />
      </div>
      <div className="animate-pulse" style={{ animationDelay: "240ms", animationDuration: "1.8s" }}>
        <div className="h-4 w-36 rounded-lg bg-gradient-to-r from-white/[.07] via-white/[.04] to-white/[.02]" />
      </div>
      <div className="flex gap-2.5">
        {[20, 16, 14].map((w, i) => (
          <div key={i} className="animate-pulse" style={{ animationDelay: `${320 + i * 80}ms`, animationDuration: "1.8s" }}>
            <div className="h-[30px] rounded-xl bg-gradient-to-br from-white/[.06] to-white/[.02]" style={{ width: `${w * 4}px` }} />
          </div>
        ))}
      </div>
    </div>
    <div className="w-[160px] h-[160px] relative animate-pulse" style={{ animationDelay: "480ms", animationDuration: "2s" }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[.05] via-white/[.02] to-transparent" />
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/[.04] to-transparent" />
      <div className="absolute inset-16 rounded-full bg-white/[.04]" />
    </div>
  </div>
);

type WeatherWidgetProps = {
  weather: any;
  loading?: boolean;
  location?: string;
  lang?: Language;
  onNavigate?: (route: string) => void;
  intensity?: number;
};

export const WeatherWidget = ({
  weather,
  loading = false,
  location = "—",
  lang = "en",
  onNavigate = () => {},
  intensity = 1,
}: WeatherWidgetProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = tileRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = clamp((0.5 - y) * 10, -8, 8);
    const ry = clamp((x - 0.5) * 12, -10, 10);
    el.style.setProperty("--wx", `${e.clientX - r.left}px`);
    el.style.setProperty("--wy", `${e.clientY - r.top}px`);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = tileRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  }, []);

  const isDay = weather?.current?.is_day !== 0;
  const code = weather?.current?.weather_code ?? 0;

  const temp = weather?.current?.temperature_2m;
  const wind = weather?.current?.wind_speed_10m;
  const hum = weather?.current?.relative_humidity_2m;
  const feel = weather?.current?.apparent_temperature;
  const hi = weather?.daily?.temperature_2m_max?.[0];
  const lo = weather?.daily?.temperature_2m_min?.[0];
  const vis = weather?.current?.visibility;

  const type = wxTypeFrom(code, wind);
  const pk = `${type}-${isDay ? "day" : "night"}`;
  const p: Pal = (PAL as any)[pk] || PAL[isDay ? "clear-day" : "clear-night"];
  const txt = DASH_TEXT[lang];

  const iconKind = mapTo3DIconKind({ code, isDay, windKmh: wind });

  // CSS variables for static optimization
  const cssVars = useMemo(() => ({
    '--ww-sky-0': p.sky[0],
    '--ww-sky-1': p.sky[1],
    '--ww-sky-2': p.sky[2],
    '--ww-orb-0': p.orb[0],
    '--ww-orb-1': p.orb[1],
    '--ww-accent': p.accent,
    '--ww-glow': p.glow,
    '--ww-glow-20': p.glow.replace(/[\d.]+\)$/, ".20)"),
    '--ww-glow-14': p.glow.replace(/[\d.]+\)$/, ".14)"),
    '--ww-glow-12': p.glow.replace(/[\d.]+\)$/, ".12)"),
    '--ww-glow-10': p.glow.replace(/[\d.]+\)$/, ".10)"),
    '--ww-text': p.text,
    '--ww-chip': p.chip,
    '--ww-chip-border': p.chipBorder,
    '--ww-bar': p.bar,
    '--ww-hover-glow': p.hoverGlow,
    '--ww-shimmer': p.shimmer,
    '--ww-highlight': p.highlight,
    '--ww-aurora': p.aurora,
    '--ww-depth': p.depth,
    '--ww-ring': p.ring,
  } as React.CSSProperties), [p]);

  return (
    <GlassTile
      onClick={() => onNavigate("WEATHER")}
      className="WW h-full relative overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      <div
        ref={tileRef}
        onMouseMove={handleMouseMove}
        className="absolute inset-0 z-20"
        style={{
          transform: isHovered ? "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" : "none",
          transition: "transform 420ms cubic-bezier(.2,.8,.2,1)",
          transformStyle: "preserve-3d",
          ...cssVars
        }}
      >
      <style>{WEATHER_3D_ICON_CSS}</style>
      <style>{WIDGET_CSS}</style>

      {/* Background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(162deg, var(--ww-sky-0) 0%, var(--ww-sky-1) 46%, var(--ww-sky-2) 100%)` }} />

      {/* Orbs */}
      <div
        className="absolute pointer-events-none WWa"
        style={{
          top: "-40%",
          right: "-34%",
          width: "105%",
          height: "105%",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--ww-orb-0) 0%, var(--ww-orb-1) 40%, transparent 70%)`,
          filter: "blur(65px)",
          animation: "WW-orb-drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none WWa"
        style={{
          bottom: "-24%",
          left: "-20%",
          width: "72%",
          height: "72%",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--ww-orb-1) 0%, var(--ww-glow-14) 48%, transparent 68%)`,
          filter: "blur(58px)",
          opacity: 0.38,
          animation: "WW-orb-drift 15s ease-in-out 3s infinite",
        }}
      />
      <div
        className="absolute pointer-events-none WWa"
        style={{
          top: "-10%",
          left: "-14%",
          width: "52%",
          height: "52%",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--ww-aurora) 0%, var(--ww-depth) 45%, transparent 62%)`,
          filter: "blur(48px)",
          animation: "WW-orb-drift 17s ease-in-out 3.5s infinite",
        }}
      />

      {/* Specular + vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(145% 58% at 50% -12%, rgba(255,255,255,.10) 0%, rgba(255,255,255,.04) 28%, transparent 52%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(188deg, transparent 42%, rgba(0,0,0,.32) 82%, rgba(0,0,0,.50) 100%)" }} />

      {/* Edges */}
      <div
        className="absolute top-0 left-5 right-5 h-[0.5px] pointer-events-none WWa"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(var(--ww-accent), 0.22), var(--ww-highlight) 50%, rgba(var(--ww-accent), 0.22), transparent)`,
          animation: "WW-edge-breathe 5.5s ease-in-out infinite",
        }}
      />

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 inset-x-0 h-[2.5px] pointer-events-none overflow-hidden">
        <div
          className="h-full WWa"
          style={{
            background: `linear-gradient(90deg, transparent 2%, var(--ww-bar) 50 18%, var(--ww-accent) 50%, var(--ww-bar) 50 82%, transparent 98%)`,
            animation: "WW-bar-glow 5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-800"
        style={{
          background: `radial-gradient(520px circle at var(--wx, 50%) var(--wy, 50%), var(--ww-hover-glow), transparent 62%)`,
        }}
      />

      {/* Shine sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-900">
        <div
          className="absolute inset-y-0 w-[45%] WWa"
          style={{
            background: `linear-gradient(98deg, transparent, var(--ww-shimmer) 06 28%, var(--ww-shimmer) 46%, var(--ww-highlight) 50%, var(--ww-shimmer) 54%, transparent)`,
            animation: "WW-shine 4.5s ease-in-out forwards",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex justify-between items-stretch h-full p-[18px] lg:p-[22px] gap-1"
        style={{ animation: "WW-entrance 0.7s cubic-bezier(.4,0,.2,1) both" }}
      >
        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Left */}
            <div className="flex flex-col justify-between flex-1 min-w-0" style={{ animation: "WW-fade-in-scale 0.65s ease-out both" }}>
              {/* Location */}
              <div className="flex items-center gap-2.5 group/loc">
                <div
                  className="p-[6px] rounded-[11px] relative overflow-hidden transition-all duration-350 group-hover/loc:scale-110"
                  style={{
                    background: p.chip,
                    border: `1px solid ${p.chipBorder}`,
                    boxShadow: `0 0 16px var(--ww-glow-10), 0 2px 5px rgba(0,0,0,.12)`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: `radial-gradient(circle, var(--ww-accent) 14, transparent 72%)` }} />
                  <MapPin size={13} strokeWidth={2.5} style={{ color: p.accent, filter: `drop-shadow(0 0 4px ${p.accent}50)` }} className="relative z-10" />
                </div>
                <span
                  className="text-[12.5px] font-bold text-white/82 truncate tracking-[0.02em] transition-colors duration-350 group-hover/loc:text-white/95"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,.35)" }}
                >
                  {location}
                </span>
                <ChevronRight
                  size={14}
                  className="text-white/18 ml-auto shrink-0 group-hover:text-white/52 group-hover:translate-x-1.5 transition-all duration-500"
                  strokeWidth={2.5}
                />
              </div>

              {/* Temperature */}
              <div className="flex items-baseline gap-1.5 -ml-0.5 WWa" style={{ animation: "WW-float 7s ease-in-out infinite" }}>
                <span
                  className={clsx(
                    "text-[4.6rem] lg:text-[5.4rem] leading-none font-extralight tracking-[-0.055em]",
                    "text-transparent bg-clip-text bg-gradient-to-b",
                    p.temp,
                    "WWa"
                  )}
                  style={{
                    animation: "WW-temp-pulse 5.5s ease-in-out infinite",
                    filter: `drop-shadow(0 3px 10px var(--ww-glow-12))`,
                  }}
                >
                  {temp != null ? `${Math.round(temp)}°` : "—"}
                </span>

                {hi != null && lo != null && (
                  <div className="flex flex-col gap-[3px] ml-2 mb-3.5">
                    <span className="flex items-center gap-[3px] text-[10.5px] font-bold text-white/52 group-hover:text-white/72 transition-colors" style={{ textShadow: "0 1px 3px rgba(0,0,0,.28)" }}>
                      <ArrowUpRight size={10} className="text-orange-400/82" strokeWidth={3} style={{ filter: "drop-shadow(0 0 4px rgba(251,146,60,.45))" }} />
                      {Math.round(hi)}°
                    </span>
                    <span className="flex items-center gap-[3px] text-[10.5px] font-bold text-white/32 group-hover:text-white/48 transition-colors" style={{ textShadow: "0 1px 3px rgba(0,0,0,.28)" }}>
                      <ArrowDownRight size={10} className="text-blue-400/72" strokeWidth={3} style={{ filter: "drop-shadow(0 0 4px rgba(96,165,250,.35))" }} />
                      {Math.round(lo)}°
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex items-center mb-3.5">
                <WxStatusDot color={p.accent} type={type} />
                <p
                  className="text-[14.5px] font-bold capitalize tracking-[0.02em] line-clamp-1"
                  style={{
                    color: p.text,
                    textShadow: `0 0 30px var(--ww-glow-20), 0 2px 5px rgba(0,0,0,.32)`,
                  }}
                >
                  {txt?.weather_desc?.[code] || txt?.weather_desc?.[0] || "Weather"}
                </p>
              </div>

              {/* Chips */}
              <div className="flex items-center gap-[8px] flex-wrap">
                {wind != null && (
                  <div style={{ animation: "WW-fade-in 0.6s ease-out 0.15s both" }}>
                    <Chip icon={Wind} value={Math.round(wind)} unit="km/h" color={p.accent} bg={p.chip} borderColor={p.chipBorder} />
                  </div>
                )}
                {hum != null && (
                  <div style={{ animation: "WW-fade-in 0.6s ease-out 0.25s both" }}>
                    <Chip icon={Droplets} value={Math.round(hum)} unit="%" color="#60A5FA" bg="rgba(96,165,250,.07)" borderColor="rgba(96,165,250,.14)" />
                  </div>
                )}
                {feel != null && (
                  <div style={{ animation: "WW-fade-in 0.6s ease-out 0.35s both" }}>
                    <Chip icon={Thermometer} value={`${Math.round(feel)}°`} color="#F472B6" bg="rgba(244,114,182,.07)" borderColor="rgba(244,114,182,.14)" />
                  </div>
                )}
                {vis != null && (
                  <div style={{ animation: "WW-fade-in 0.6s ease-out 0.45s both" }}>
                    <Chip icon={Eye} value={`${Math.round(vis / 1000)}`} unit="km" color="#34D399" bg="rgba(52,211,153,.07)" borderColor="rgba(52,211,153,.14)" />
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center justify-center -mr-1 relative" style={{ animation: "WW-fade-in-scale 0.7s ease-out 0.2s both" }}>
              <div
                className="absolute inset-0 rounded-full transition-all duration-600"
                style={{
                  background: `radial-gradient(circle, ${isHovered ? 'var(--ww-glow-12)' : 'var(--ww-glow-10)'}, transparent 60%)`,
                  filter: "blur(28px)",
                  transform: isHovered ? "scale(1.12)" : "scale(1)",
                }}
              />
              <div
                style={{
                  transform: isHovered ? "translateZ(26px) translateY(-2px)" : "translateZ(0px)",
                  transformStyle: "preserve-3d",
                  transition: "transform 420ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <Weather3DIcon kind={iconKind} intensity={intensity} size={188} animated={true} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action hint */}
      <div className="absolute bottom-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-550 translate-y-2.5 group-hover:translate-y-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-[6px] rounded-[10px] relative overflow-hidden"
          style={{
            background: p.chip,
            border: `1px solid ${p.chipBorder}`,
            backdropFilter: "blur(20px) saturate(1.3)",
            boxShadow: "0 3px 10px rgba(0,0,0,.18), 0 0 0 0.5px rgba(255,255,255,.05) inset",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(110deg, transparent 22%, var(--ww-shimmer) 48%, var(--ww-highlight) 50%, var(--ww-shimmer) 52%, transparent 78%)`,
              animation: "WW-chip-shimmer 2.8s ease-in-out infinite",
              opacity: 0.6,
            }}
          />
          <span className="relative z-10 text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: p.accent, textShadow: "0 1px 3px rgba(0,0,0,.25)", opacity: 0.85 }}>
            Details
          </span>
          <ChevronRight size={11} style={{ color: p.accent, opacity: 0.7 }} strokeWidth={2.5} className="relative z-10" />
        </div>
      </div>

      {/* Inner border glow */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ boxShadow: `inset 0 0 0 1px var(--ww-ring), inset 0 0 30px var(--ww-aurora)` }}
      />
      </div>
    </GlassTile>
  );
};
