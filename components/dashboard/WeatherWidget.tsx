import React, { useCallback, useMemo, useRef, useState } from "react";
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
  CloudLightning,
  CloudRain,
  Cloud,
  Sun,
  CloudFog,
  Snowflake,
} from "lucide-react";
import { GlassTile } from './GlassTile';
import { Language, ViewState } from '../../types';
import { WeatherAtmosphericIcon } from "./weather/WeatherIcons";
import { DASH_TEXT, PAL, Pal, WxType, clamp, wxTypeFrom, mapToAtmosphericIconKind } from "./weather/utils";

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
  onNavigate?: (route: ViewState) => void;
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

  const forecast = useMemo(() => {
    if (!weather?.daily) return [];
    return weather.daily.time.slice(1, 3).map((time: string, i: number) => ({
      time,
      max: weather.daily.temperature_2m_max[i + 1],
      min: weather.daily.temperature_2m_min[i + 1],
      code: weather.daily.weather_code[i + 1],
    }));
  }, [weather]);

  const type = wxTypeFrom(code, wind);
  const pk = `${type}-${isDay ? "day" : "night"}`;
  const p: Pal = (PAL as any)[pk] || PAL[isDay ? "clear-day" : "clear-night"];
  const txt = DASH_TEXT[lang];

  const iconKind = mapToAtmosphericIconKind({ code, isDay, windKmh: wind });

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

              {/* 2-Day Forecast */}
              {forecast.length > 0 && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5" style={{ animation: "WW-fade-in 0.8s ease-out 0.5s both" }}>
                  {forecast.map((day: any, i: number) => {
                    const dayType = wxTypeFrom(day.code);
                    const dayName = new Date(day.time).toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
                    return (
                      <div key={day.time} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{dayName}</span>
                        <div className="flex items-center gap-1.5">
                          {dayType === 'storm' && <CloudLightning size={12} className="text-purple-400" />}
                          {dayType === 'rain' && <CloudRain size={12} className="text-blue-400" />}
                          {dayType === 'cloudy' && <Cloud size={12} className="text-slate-400" />}
                          {dayType === 'clear' && <Sun size={12} className="text-amber-400" />}
                          {dayType === 'fog' && <CloudFog size={12} className="text-slate-300" />}
                          {dayType === 'snow' && <Snowflake size={12} className="text-cyan-200" />}
                          <div className="flex items-baseline gap-1">
                            <span className="text-[11px] font-black text-white/90">{Math.round(day.max)}°</span>
                            <span className="text-[9px] font-bold text-white/30">{Math.round(day.min)}°</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <WeatherAtmosphericIcon kind={iconKind} intensity={intensity} size={188} animated={true} />
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
