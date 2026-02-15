import React, { useCallback, useRef, useState } from 'react';
import { GlassTile } from './GlassTile';
import { ArrowUpRight, Sparkles, ChevronRight, Zap } from 'lucide-react';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════
   THEME SYSTEM
   ═══════════════════════════════════════════════════════════════ */

type CardTheme = {
  bg: string;
  bgHover: string;
  icon: string;
  iconBg: string;
  iconBorder: string;
  iconGlow: string;
  orb: string;
  orbSecondary: string;
  accent: string;
  accentGlow: string;
  particle: string;
  ring: string;
  barGradient: string;
  badgeBg: string;
  badgeText: string;
};

const CARD_THEMES: Record<string, CardTheme> = {
  soil: {
    bg: 'from-orange-500/8 via-amber-500/5 to-transparent',
    bgHover: 'from-orange-500/20 via-amber-500/12 to-orange-600/5',
    icon: 'text-orange-400',
    iconBg: 'from-orange-950/90 to-amber-950/80',
    iconBorder: 'border-orange-500/30',
    iconGlow: 'rgba(249, 115, 22, 0.4)',
    orb: 'from-orange-500/50 to-amber-400/30',
    orbSecondary: 'from-amber-600/20 to-orange-500/10',
    accent: 'from-orange-400 via-amber-400 to-yellow-400',
    accentGlow: 'rgba(251, 146, 60, 0.5)',
    particle: 'rgba(249, 115, 22, 0.5)',
    ring: 'ring-orange-500/20',
    barGradient: 'from-orange-400 via-amber-400 to-yellow-300',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-300',
  },
  yield: {
    bg: 'from-violet-500/8 via-purple-500/5 to-transparent',
    bgHover: 'from-violet-500/20 via-purple-500/12 to-fuchsia-500/5',
    icon: 'text-violet-400',
    iconBg: 'from-violet-950/90 to-purple-950/80',
    iconBorder: 'border-violet-500/30',
    iconGlow: 'rgba(139, 92, 246, 0.4)',
    orb: 'from-violet-500/50 to-fuchsia-400/30',
    orbSecondary: 'from-purple-600/20 to-violet-500/10',
    accent: 'from-violet-400 via-purple-400 to-fuchsia-400',
    accentGlow: 'rgba(167, 139, 250, 0.5)',
    particle: 'rgba(139, 92, 246, 0.5)',
    ring: 'ring-violet-500/20',
    barGradient: 'from-violet-400 via-purple-400 to-fuchsia-300',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-300',
  },
  area: {
    bg: 'from-cyan-500/8 via-blue-500/5 to-transparent',
    bgHover: 'from-cyan-500/20 via-blue-500/12 to-sky-500/5',
    icon: 'text-cyan-400',
    iconBg: 'from-cyan-950/90 to-blue-950/80',
    iconBorder: 'border-cyan-500/30',
    iconGlow: 'rgba(6, 182, 212, 0.4)',
    orb: 'from-cyan-500/50 to-sky-400/30',
    orbSecondary: 'from-blue-600/20 to-cyan-500/10',
    accent: 'from-cyan-400 via-sky-400 to-blue-400',
    accentGlow: 'rgba(34, 211, 238, 0.5)',
    particle: 'rgba(6, 182, 212, 0.5)',
    ring: 'ring-cyan-500/20',
    barGradient: 'from-cyan-400 via-sky-400 to-blue-300',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-300',
  },
  disease: {
    bg: 'from-emerald-500/8 via-green-500/5 to-transparent',
    bgHover: 'from-emerald-500/20 via-green-500/12 to-teal-500/5',
    icon: 'text-emerald-400',
    iconBg: 'from-emerald-950/90 to-green-950/80',
    iconBorder: 'border-emerald-500/30',
    iconGlow: 'rgba(16, 185, 129, 0.4)',
    orb: 'from-emerald-500/50 to-teal-400/30',
    orbSecondary: 'from-green-600/20 to-emerald-500/10',
    accent: 'from-emerald-400 via-green-400 to-teal-400',
    accentGlow: 'rgba(52, 211, 153, 0.5)',
    particle: 'rgba(16, 185, 129, 0.5)',
    ring: 'ring-emerald-500/20',
    barGradient: 'from-emerald-400 via-green-400 to-teal-300',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-300',
  },
};

/* ═══════════════════════════════════════════════════════════════
   MICRO-PARTICLES
   ═══════════════════════════════════════════════════════════════ */

const MicroParticles = React.memo(({ color }: { color: string }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${1.5 + Math.random() * 2}px`,
          height: `${1.5 + Math.random() * 2}px`,
          background: color,
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
          opacity: 0,
          animation: `micro-float ${3 + Math.random() * 4}s ease-in-out ${i * 0.8}s infinite`,
        }}
      />
    ))}
  </div>
));

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD — Ultra Premium
   ═══════════════════════════════════════════════════════════════ */

export const FeatureCard = ({ title, icon: Icon, variant, delay, onClick }: any) => {
  const c = CARD_THEMES[variant as keyof typeof CARD_THEMES] || CARD_THEMES.soil;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--cx', `${x}px`);
    cardRef.current.style.setProperty('--cy', `${y}px`);
  }, []);

  return (
    <>
      <style>{`
        @keyframes micro-float {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.8); }
          15%       { opacity: 0.7; }
          50%       { opacity: 0.3; transform: translateY(-18px) translateX(6px) scale(1); }
          85%       { opacity: 0.1; }
        }
        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes bar-expand {
          from { width: 0; opacity: 0; }
          to   { width: var(--bar-w); opacity: 1; }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes corner-glow {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.6; }
        }
      `}</style>

      <GlassTile delay={delay} onClick={onClick}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className={clsx(
            "group relative p-5 h-52 flex flex-col justify-between",
            "rounded-2xl overflow-hidden cursor-pointer",
            "border border-white/[0.06]",
            "bg-gradient-to-br from-[#0a0918] via-[#0d0b1e] to-[#0f0c22]",
            "hover:border-white/[0.12]",
            "transition-all duration-600 ease-out",
            "hover:-translate-y-1 hover:shadow-2xl",
          )}
          style={{ willChange: 'transform, box-shadow' }}
        >
          {/* ── L1: Deep Base Gradient ────────────────── */}
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100",
              "transition-opacity duration-700",
              c.bgHover
            )}
          />

          {/* ── L2: Noise Texture ─────────────────────── */}
          <div
            className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.035] transition-opacity duration-500"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px',
            }}
          />

          {/* ── L3: Primary Orb ───────────────────────── */}
          <div
            className={clsx(
              "absolute -right-10 -top-10 w-36 h-36 rounded-full blur-[70px]",
              "opacity-0 group-hover:opacity-60",
              "transition-all duration-700 ease-out",
              "bg-gradient-to-br",
              c.orb
            )}
          />

          {/* ── L4: Secondary Orb (bottom-left) ──────── */}
          <div
            className={clsx(
              "absolute -left-8 -bottom-8 w-28 h-28 rounded-full blur-[50px]",
              "opacity-0 group-hover:opacity-30",
              "transition-all duration-700 delay-100",
              "bg-gradient-to-tr",
              c.orbSecondary
            )}
          />

          {/* ── L5: Mouse Spotlight ───────────────────── */}
          <div
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(350px circle at var(--cx, 50%) var(--cy, 50%), ${c.iconGlow.replace('0.4', '0.12')}, transparent 50%)`
            }}
          />

          {/* ── L6: Shimmer Sweep ─────────────────────── */}
          <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div
              className="absolute inset-0 w-1/3"
              style={{
                background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.03), transparent)',
                animation: 'shimmer-card 2.5s ease-in-out infinite',
              }}
            />
          </div>
          <style>{`@keyframes shimmer-card { 0% { transform: translateX(-150%); } 100% { transform: translateX(400%); } }`}</style>

          {/* ── L7: Micro Particles ───────────────────── */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <MicroParticles color={c.particle} />
          </div>

          {/* ── L8: Top-Left Accent Line ──────────────── */}
          <div
            className={clsx(
              "absolute top-0 left-6 right-6 h-[1px]",
              "bg-gradient-to-r from-transparent via-transparent to-transparent",
              "group-hover:from-transparent group-hover:to-transparent",
              "transition-all duration-700"
            )}
          >
            <div
              className={clsx(
                "h-full bg-gradient-to-r opacity-0 group-hover:opacity-60",
                "transition-opacity duration-700",
                c.accent
              )}
            />
          </div>

          {/* ═══════════════════════════════════════════
              CONTENT
              ═══════════════════════════════════════════ */}

          {/* ── Icon Container ────────────────────────── */}
          <div className="relative z-10">
            <div className="relative inline-flex">
              {/* Icon Glow Ring */}
              <div
                className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-lg"
                style={{ background: c.iconGlow }}
              />

              {/* Spinning Ring (decorative) */}
              <div
                className={clsx(
                  "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-700 pointer-events-none"
                )}
              >
                <div
                  className="w-full h-full rounded-2xl"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${c.iconGlow}, transparent, ${c.iconGlow}, transparent)`,
                    animation: 'ring-spin 6s linear infinite',
                    opacity: 0.15,
                  }}
                />
              </div>

              {/* Main Icon Box */}
              <div
                className={clsx(
                  "relative w-14 h-14 rounded-2xl p-[1.5px]",
                  "bg-gradient-to-br",
                  c.iconBg,
                  "border", c.iconBorder,
                  "flex items-center justify-center",
                  "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
                  "group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
                  "group-hover:scale-110 group-hover:rotate-3",
                  "transition-all duration-500 ease-out"
                )}
                style={{
                  animation: 'icon-float 4s ease-in-out infinite',
                }}
              >
                <div
                  className={clsx(
                    "w-full h-full rounded-[13px] flex items-center justify-center",
                    "bg-gradient-to-br",
                    c.iconBg,
                    "relative overflow-hidden"
                  )}
                >
                  {/* Inner glow */}
                  <div
                    className={clsx(
                      "absolute inset-0 opacity-20 bg-gradient-to-br",
                      c.accent
                    )}
                  />
                  <Icon
                    size={26}
                    strokeWidth={1.8}
                    className={clsx(c.icon, "relative z-10 drop-shadow-lg")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Text Block ────────────────────────────── */}
          <div className="relative z-10 space-y-3">
            <h3
              className={clsx(
                "text-[15px] font-extrabold leading-snug tracking-tight",
                "text-slate-200 group-hover:text-white",
                "transition-colors duration-400",
                "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              )}
            >
              {title}
            </h3>

            {/* Animated Accent Bar */}
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "h-[3px] rounded-full bg-gradient-to-r",
                  "transition-all duration-600 ease-out",
                  "w-8 group-hover:w-16",
                  "opacity-50 group-hover:opacity-100",
                  c.barGradient
                )}
                style={{
                  boxShadow: `0 0 12px ${c.accentGlow}`,
                  filter: 'brightness(1.2)',
                }}
              />
              <div
                className={clsx(
                  "h-[3px] w-1.5 rounded-full bg-gradient-to-r",
                  "opacity-0 group-hover:opacity-70",
                  "transition-all duration-600 delay-100",
                  c.barGradient
                )}
              />
            </div>
          </div>

          {/* ── Bottom-Right Arrow ────────────────────── */}
          <div
            className={clsx(
              "absolute bottom-4 right-4 z-10",
              "opacity-0 group-hover:opacity-100",
              "translate-x-2 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0",
              "transition-all duration-400 ease-out"
            )}
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                "bg-white/[0.04] border border-white/[0.08]",
                "backdrop-blur-sm",
                "group-hover:bg-white/[0.08]",
                "transition-colors duration-300"
              )}
            >
              <ArrowUpRight
                size={16}
                className="text-white/50 group-hover:text-white/80 transition-colors duration-300"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* ── Corner Sparkle ────────────────────────── */}
          <div
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200"
          >
            <Sparkles
              size={12}
              className={clsx(c.icon, "opacity-40")}
              style={{ animation: 'corner-glow 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </GlassTile>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BANNER THEMES
   ═══════════════════════════════════════════════════════════════ */

type BannerTheme = {
  gradient: string;
  overlayGlow: string;
  textShadow: string;
  btnBg: string;
  btnText: string;
  btnGlow: string;
  accentLine: string;
};

const BANNER_PRESETS: Record<string, BannerTheme> = {
  scan: {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    overlayGlow: 'rgba(16, 185, 129, 0.3)',
    textShadow: '0 2px 20px rgba(16, 185, 129, 0.4)',
    btnBg: 'bg-white',
    btnText: 'text-emerald-700',
    btnGlow: '0 8px 32px rgba(16, 185, 129, 0.4)',
    accentLine: 'from-emerald-300 to-cyan-300',
  },
  coins: {
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    overlayGlow: 'rgba(245, 158, 11, 0.3)',
    textShadow: '0 2px 20px rgba(245, 158, 11, 0.4)',
    btnBg: 'bg-white',
    btnText: 'text-amber-700',
    btnGlow: '0 8px 32px rgba(245, 158, 11, 0.4)',
    accentLine: 'from-amber-300 to-yellow-300',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ILLUSTRATIVE BANNER — Ultra Premium
   ═══════════════════════════════════════════════════════════════ */

export const IllustrativeBanner = ({
  title, subtitle, icon: Icon, gradient, pattern, onClick,
}: any) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const theme = BANNER_PRESETS[pattern] || BANNER_PRESETS.scan;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    bannerRef.current.style.setProperty('--bx', `${e.clientX - rect.left}px`);
    bannerRef.current.style.setProperty('--by', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <>
      <style>{`
        @keyframes grid-scroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(30px); }
        }
        @keyframes coin-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50%      { transform: translateY(-8px) rotate(15deg); opacity: 0.25; }
        }
        @keyframes banner-shimmer {
          0%   { transform: translateX(-100%) rotate(-10deg); }
          100% { transform: translateX(200%) rotate(-10deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.5; }
          50%  { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes badge-enter {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        ref={bannerRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        className={clsx(
          "relative h-48 md:h-52 rounded-[1.5rem] overflow-hidden cursor-pointer group",
          "border border-white/[0.1] hover:border-white/[0.2]",
          "hover:-translate-y-1.5",
          "transition-all duration-600 ease-out",
          "shadow-[0_8px_40px_rgba(0,0,0,0.4)]",
          "hover:shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        )}
        role="button"
        aria-label={title}
      >
        {/* ── L1: Base Gradient ───────────────────────── */}
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br",
            "transition-all duration-500",
            gradient
          )}
        />

        {/* ── L2: Depth Gradient Overlay ──────────────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* ── L3: Noise Texture ───────────────────────── */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px',
          }}
        />

        {/* ── L4: Pattern ─────────────────────────────── */}
        {pattern === 'scan' && (
          <>
            {/* Animated Grid */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 overflow-hidden">
              <div
                style={{ animation: 'grid-scroll 4s linear infinite' }}
                className="absolute inset-0 -top-8"
              >
                <svg width="100%" height="200%" className="absolute inset-0">
                  <defs>
                    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Scan Line */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            >
              <div
                className="absolute left-0 right-0 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'grid-scroll 3s linear infinite',
                  top: '50%',
                }}
              />
            </div>

            {/* Corner Crosshairs */}
            <div className="absolute top-5 right-5 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M2 8V2h6M16 2h6v6M22 16v6h-6M8 22H2v-6" />
              </svg>
            </div>
          </>
        )}

        {pattern === 'coins' && (
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none">
            {[
              { cx: 75, cy: 20, r: 14, delay: 0 },
              { cx: 55, cy: 50, r: 18, delay: 0.5 },
              { cx: 85, cy: 78, r: 22, delay: 1 },
              { cx: 40, cy: 80, r: 10, delay: 1.5 },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${c.cx}%`,
                  top: `${c.cy}%`,
                  width: `${c.r * 2}px`,
                  height: `${c.r * 2}px`,
                  animation: `coin-float ${3 + i * 0.5}s ease-in-out ${c.delay}s infinite`,
                }}
              >
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  <text x="20" y="25" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="16" fontWeight="bold">₹</text>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* ── L5: Mouse Spotlight ─────────────────────── */}
        <div
          className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at var(--bx, 50%) var(--by, 50%), ${theme.overlayGlow}, transparent 50%)`
          }}
        />

        {/* ── L6: Shimmer Sweep ───────────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 w-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.06), transparent)',
              animation: 'banner-shimmer 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════
            CONTENT
            ═══════════════════════════════════════════ */}
        <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-between z-10">
          {/* Top Section */}
          <div className="space-y-4">
            {/* Icon with Pulse Ring */}
            <div className="relative inline-flex">
              {/* Pulse Ring */}
              <div
                className="absolute -inset-2 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
              />

              {/* Icon Background */}
              <div
                className={clsx(
                  "relative w-12 h-12 md:w-14 md:h-14 rounded-2xl",
                  "bg-white/20 backdrop-blur-xl",
                  "flex items-center justify-center",
                  "border border-white/30",
                  "shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
                  "group-hover:scale-110 group-hover:bg-white/25",
                  "transition-all duration-500 ease-out"
                )}
              >
                <Icon
                  size={24}
                  className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  strokeWidth={2}
                />

                {/* Corner Indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white/40 border border-white/60 flex items-center justify-center">
                  <Zap size={6} className="text-white" />
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3
                className={clsx(
                  "text-xl md:text-2xl font-black text-white leading-none",
                  "drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]",
                  "group-hover:tracking-tight",
                  "transition-all duration-400"
                )}
                style={{ textShadow: theme.textShadow }}
              >
                {title}
              </h3>
              <p
                className={clsx(
                  "text-xs md:text-sm font-bold text-white/80 uppercase tracking-[0.15em]",
                  "drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                )}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            {/* Accent Line */}
            <div
              className={clsx(
                "h-[2px] rounded-full bg-gradient-to-r",
                "w-12 group-hover:w-24",
                "opacity-50 group-hover:opacity-80",
                "transition-all duration-600",
                theme.accentLine
              )}
              style={{ filter: 'brightness(1.3)' }}
            />

            {/* Badge */}
            <div
              className="opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{ animation: 'badge-enter 0.4s ease-out' }}
            >
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="text-white/40" />
                Tap to explore
              </span>
            </div>
          </div>
        </div>

        {/* ── Floating Action Button ──────────────────── */}
        <div
          className={clsx(
            "absolute bottom-5 right-5 z-20",
            "transform translate-y-4 opacity-0 scale-90",
            "group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100",
            "transition-all duration-400 ease-out delay-100"
          )}
        >
          <div
            className={clsx(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              theme.btnBg, theme.btnText,
              "shadow-xl"
            )}
            style={{ boxShadow: theme.btnGlow }}
          >
            <ArrowUpRight size={22} strokeWidth={2.5} />
          </div>
        </div>

        {/* ── Bottom Progress/Accent Bar ──────────────── */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/20">
          <div
            className={clsx(
              "h-full bg-gradient-to-r opacity-40 group-hover:opacity-70",
              "transition-opacity duration-500",
              theme.accentLine
            )}
          />
        </div>
      </div>
    </>
  );
};