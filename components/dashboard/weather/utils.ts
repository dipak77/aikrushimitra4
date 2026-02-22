import { Language } from '../../../types';

export type WeatherAtmosphericIconKind =
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

export const DASH_TEXT: any = {
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
  mr: {
    weather_desc: {
      0: "निरभ्र आकाश",
      1: "मुख्यतः निरभ्र",
      2: "अंशतः ढगाळ",
      3: "ढगाळ",
      45: "धुके",
      48: "दाट धुके",
      51: "हलका रिमझिम पाऊस",
      53: "रिमझिम पाऊस",
      55: "जोरदार रिमझिम",
      61: "हलका पाऊस",
      63: "पाऊस",
      65: "मुसळधार पाऊस",
      71: "हलकी बर्फवृष्टी",
      73: "बर्फवृष्टी",
      75: "जोरदार बर्फवृष्टी",
      80: "पावसाच्या सरी",
      81: "जोरदार सरी",
      82: "अतिवृष्टी",
      85: "बर्फाच्या सरी",
      86: "जोरदार बर्फाच्या सरी",
      95: "वादळी पाऊस",
      96: "गारपीट",
      99: "तीव्र वादळ",
    },
  },
  hi: {
    weather_desc: {
      0: "साफ आसमान",
      1: "मुख्य रूप से साफ",
      2: "आंशिक रूप से बादल",
      3: "बादल छाए रहेंगे",
      45: "कोहरा",
      48: "घना कोहरा",
      51: "हल्की बूंदाबांदी",
      53: "बूंदाबांदी",
      55: "भारी बूंदाबांदी",
      61: "हल्की बारिश",
      63: "बारिश",
      65: "भारी बारिश",
      71: "हल्की बर्फबारी",
      73: "बर्फबारी",
      75: "भारी बर्फबारी",
      80: "बारिश की बौछारें",
      81: "भारी बौछारें",
      82: "मूसलाधार बारिश",
      85: "बर्फ की बौछारें",
      86: "भारी बर्फ की बौछारें",
      95: "आंधी तूफान",
      96: "ओलावृष्टि",
      99: "तेज आंधी",
    },
  },
};

export type WxType = "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog" | "windy";

export type Pal = {
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

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export const wxTypeFrom = (code: number, windKmh?: number): WxType => {
  if (code >= 95) return "storm";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 1 && code <= 3) return "cloudy";
  if ((windKmh ?? 0) >= 28) return "windy";
  return "clear";
};

export const PAL: Record<string, Pal> = {
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

export function mapToAtmosphericIconKind(opts: { code: number; isDay: boolean; windKmh?: number }): WeatherAtmosphericIconKind {
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
