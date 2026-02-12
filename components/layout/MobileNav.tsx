import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ViewState } from "../../types";
import {
  LayoutDashboard,
  Store,
  Mic,
  ShoppingCart,
  Landmark,
} from "lucide-react";
import clsx from "clsx";
import { triggerHaptic } from "../../utils/common";

/* ────────────────────────────────────────────────────────────
   Design Tokens
   ──────────────────────────────────────────────────────────── */

type NavItem = {
  id: ViewState;
  label: string;
  icon: React.ComponentType<any>;
  color: string;        // Primary CSS color
  colorMuted: string;   // Softer variant
  gradient: string;     // Tailwind gradient classes
  main?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "DASHBOARD",
    icon: LayoutDashboard,
    label: "Home",
    color: "#10b981",
    colorMuted: "#34d399",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "SABJI_MANDI",
    icon: ShoppingCart,
    label: "Shop",
    color: "#22c55e",
    colorMuted: "#4ade80",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: "VOICE_ASSISTANT",
    icon: Mic,
    label: "Voice",
    color: "#06b6d4",
    colorMuted: "#22d3ee",
    gradient: "from-cyan-400 to-blue-600",
    main: true,
  },
  {
    id: "MARKET",
    icon: Store,
    label: "Market",
    color: "#8b5cf6",
    colorMuted: "#a78bfa",
    gradient: "from-violet-400 to-purple-600",
  },
  {
    id: "SCHEMES",
    icon: Landmark,
    label: "Schemes",
    color: "#f59e0b",
    colorMuted: "#fbbf24",
    gradient: "from-amber-400 to-orange-500",
  },
];

const SCROLL = {
  showThreshold: 8,
  hideThreshold: 14,
  topZone: 50,
  bottomZone: 50,
} as const;

/* ────────────────────────────────────────────────────────────
   NavButton Component
   ──────────────────────────────────────────────────────────── */

const NavButton = React.memo(function NavButton({
  item,
  active,
  onTap,
}: {
  item: NavItem;
  active: boolean;
  onTap: (id: ViewState) => void;
}) {
  const Icon = item.icon;
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onTap(item.id)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={clsx(
        "nav-btn relative flex flex-col items-center justify-center",
        "min-w-[52px] min-h-[52px] py-1.5",
        "transition-transform duration-200 ease-out",
        "touch-manipulation",
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-white/30 focus-visible:rounded-2xl",
        pressed && "scale-90",
      )}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
    >
      {/* Active background glow */}
      {active && (
        <div
          className="absolute inset-1 rounded-2xl pointer-events-none nav-glow-bg"
          style={{
            background: `radial-gradient(
              circle at 50% 40%,
              ${item.color}18 0%,
              transparent 70%
            )`,
          }}
        />
      )}

      {/* Icon container */}
      <div
        className={clsx(
          "relative flex items-center justify-center",
          "w-10 h-10 rounded-[14px]",
          "transition-all duration-350 ease-out",
          active
            ? "bg-white/[0.08] shadow-nav-active"
            : "bg-transparent",
        )}
        style={{
          boxShadow: active
            ? `0 0 0 1.5px ${item.color}35, 0 4px 20px ${item.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`
            : 'none',
        }}
      >
        {/* Active gradient fill */}
        {active && (
          <div
            className={clsx(
              "absolute inset-0 rounded-[14px] opacity-[0.12]",
              "bg-gradient-to-br",
              item.gradient,
            )}
          />
        )}

        {/* Active top highlight */}
        {active && (
          <div
            className="absolute top-0 left-2.5 right-2.5 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${item.colorMuted}50, transparent)`,
            }}
          />
        )}

        <Icon
          size={21}
          strokeWidth={active ? 2.6 : 1.9}
          className="relative z-10 transition-all duration-300"
          style={{
            color: active ? item.colorMuted : '#64748b',
            filter: active
              ? `drop-shadow(0 2px 8px ${item.color}50)`
              : 'none',
          }}
        />
      </div>

      {/* Label */}
      <span
        className={clsx(
          "mt-0.5 text-[10px] font-semibold tracking-wide leading-none",
          "transition-all duration-300",
          active ? "opacity-100" : "opacity-50",
        )}
        style={{
          color: active ? item.colorMuted : '#64748b',
          textShadow: active ? `0 0 12px ${item.color}40` : 'none',
        }}
      >
        {item.label}
      </span>

      {/* Active indicator dot */}
      {active && (
        <div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full nav-indicator"
          style={{
            background: item.color,
            boxShadow: `0 0 6px ${item.color}80, 0 0 12px ${item.color}40`,
          }}
        />
      )}
    </button>
  );
});

/* ────────────────────────────────────────────────────────────
   CenterFAB Component
   ──────────────────────────────────────────────────────────── */

const CenterFAB = React.memo(function CenterFAB({
  active,
  onTap,
}: {
  active: boolean;
  onTap: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className={clsx(
        "absolute left-1/2 -translate-x-1/2 z-30",
        "pointer-events-none",
      )}
      style={{
        top: '-26px',
        width: '68px',
        height: '68px',
      }}
    >
      {/* Pulse rings */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[22px] fab-ring"
        style={{
          border: `1.5px solid ${active ? 'rgba(34,211,238,0.3)' : 'rgba(34,211,238,0.15)'}`,
          animation: 'fabRingPulse 2.8s ease-out infinite',
        }}
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-[22px] fab-ring"
        style={{
          border: `1px solid rgba(16,185,129,0.12)`,
          animation: 'fabRingPulse 2.8s ease-out 0.6s infinite',
        }}
      />

      {/* Shadow base */}
      <div
        className="absolute inset-0 rounded-[22px] pointer-events-none"
        style={{
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.5),
            0 0 0 3px rgba(2,6,23,0.95),
            0 0 ${active ? '40px' : '20px'} ${active ? 'rgba(34,211,238,0.25)' : 'rgba(34,211,238,0.12)'}
          `,
          borderRadius: '22px',
          transition: 'box-shadow 0.4s ease',
        }}
      />

      {/* Main button */}
      <button
        type="button"
        onClick={onTap}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={clsx(
          "pointer-events-auto relative w-full h-full rounded-[22px]",
          "flex items-center justify-center",
          "overflow-hidden",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60",
          "transition-transform duration-200 ease-out",
          pressed && "scale-[0.88]",
        )}
        aria-label="Voice assistant"
        style={{
          background: 'linear-gradient(145deg, #34d399 0%, #14b8a6 35%, #0891b2 65%, #2563eb 100%)',
        }}
      >
        {/* Surface layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top highlight */}
          <div
            className="absolute inset-0 rounded-[22px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)',
            }}
          />

          {/* Inner border */}
          <div
            className="absolute inset-0 rounded-[22px]"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)',
            }}
          />

          {/* Radial highlight */}
          <div
            className="absolute -inset-4 opacity-30 blur-xl"
            style={{
              background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.3), transparent 60%)',
            }}
          />
        </div>

        {/* Active state inner glow */}
        {active && (
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              animation: 'fabInnerGlow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Icon */}
        <Mic
          size={28}
          strokeWidth={2.8}
          className="relative z-10 text-white"
          style={{
            filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.4))',
          }}
        />
      </button>
    </div>
  );
});

/* ────────────────────────────────────────────────────────────
   MobileNav — Main Component
   ──────────────────────────────────────────────────────────── */

const MobileNav = ({
  view,
  setView,
}: {
  view: ViewState;
  setView: (v: ViewState) => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTargetRef = useRef<Window | HTMLElement | null>(null);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);
  const nextYRef = useRef(0);

  /* ── Scroll container detection ── */
  const findScrollContainer = useCallback((): Window | HTMLElement => {
    const containers = document.querySelectorAll<HTMLElement>(".overflow-y-auto");
    return containers.length ? containers[containers.length - 1] : window;
  }, []);

  const readScrollY = useCallback((t: Window | HTMLElement) => {
    return t === window ? (window.scrollY || 0) : (t as HTMLElement).scrollTop || 0;
  }, []);

  const readMaxY = useCallback((t: Window | HTMLElement) => {
    if (t === window) {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }
    const el = t as HTMLElement;
    return Math.max(0, el.scrollHeight - el.clientHeight);
  }, []);

  /* ── Scroll-driven show/hide ── */
  useEffect(() => {
    const target = findScrollContainer();
    scrollTargetRef.current = target;
    lastYRef.current = readScrollY(target);

    const onScroll = () => {
      const t = scrollTargetRef.current;
      if (!t) return;
      nextYRef.current = Math.max(0, readScrollY(t));

      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        const currentY = nextYRef.current;
        const lastY = lastYRef.current;
        const diff = Math.abs(currentY - lastY);
        const maxY = readMaxY(t);

        if (currentY < SCROLL.topZone || currentY >= maxY - SCROLL.bottomZone) {
          setIsVisible(true);
        } else if (currentY < lastY && diff > SCROLL.showThreshold) {
          setIsVisible(true);
        } else if (currentY > lastY && diff > SCROLL.hideThreshold) {
          setIsVisible(false);
        }

        lastYRef.current = currentY;
      });
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [findScrollContainer, readScrollY, readMaxY]);

  /* ── Navigation handler ── */
  const onTap = useCallback(
    (id: ViewState) => {
      setView(id);
      triggerHaptic();
      setIsVisible(true);
    },
    [setView],
  );

  /* ── Active item for ambient glow color ── */
  const activeItem = useMemo(
    () => NAV_ITEMS.find((n) => n.id === view) || NAV_ITEMS[0],
    [view],
  );

  const leftItems = useMemo(() => NAV_ITEMS.slice(0, 2), []);
  const rightItems = useMemo(() => NAV_ITEMS.slice(3, 5), []);

  return (
    <>
      {/* ── Scoped Styles ── */}
      <style>{`
        /* Ring pulse for FAB */
        @keyframes fabRingPulse {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.55); opacity: 0; }
        }

        /* FAB inner glow when active */
        @keyframes fabInnerGlow {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }

        /* Ambient glow drift */
        @keyframes ambientDrift {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50%      { transform: translateX(3%); opacity: 0.65; }
        }

        /* Subtle shimmer on nav bar */
        @keyframes navShimmer {
          0%   { transform: translateX(-200%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }

        /* Active indicator scale-in */
        .nav-indicator {
          animation: indicatorIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes indicatorIn {
          0%   { transform: translateX(-50%) scale(0); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* Glow background fade-in */
        .nav-glow-bg {
          animation: glowFade 0.4s ease-out forwards;
        }
        @keyframes glowFade {
          0%   { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .fab-ring,
          .nav-indicator,
          .nav-glow-bg {
            animation: none !important;
          }
          * {
            transition-duration: 0ms !important;
          }
        }
      `}</style>

      {/* ── Nav Container ── */}
      <nav
        className={clsx(
          "lg:hidden fixed inset-x-0 z-[100]",
          "flex justify-center",
          "pointer-events-none",
          "transition-all duration-[450ms]",
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-[130%] opacity-0",
        )}
        style={{
          bottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative w-full max-w-[400px] pointer-events-auto">

          {/* ── Ambient Glow (behind nav) ── */}
          <div
            className="absolute -inset-x-6 -inset-y-6 pointer-events-none"
            style={{
              background: `radial-gradient(
                ellipse 80% 60% at 50% 80%,
                ${activeItem.color}12 0%,
                transparent 70%
              )`,
              filter: 'blur(20px)',
              animation: 'ambientDrift 6s ease-in-out infinite',
            }}
          />

          {/* ── Nav Bar ── */}
          <div
            className={clsx(
              "relative overflow-hidden",
              "h-[72px] rounded-[24px]",
              "border border-white/[0.06]",
            )}
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(15, 23, 42, 0.88) 0%,
                  rgba(2, 6, 23, 0.95) 100%
                )
              `,
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              boxShadow: `
                0 20px 60px -15px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.06),
                inset 0 -1px 0 rgba(0, 0, 0, 0.3)
              `,
            }}
          >
            {/* Top edge highlight */}
            <div
              className="absolute top-0 left-6 right-6 h-[0.5px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.12) 70%, transparent 100%)',
              }}
            />

            {/* Shimmer (runs once every 8s, not infinite aggressive) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100"
              style={{
                background: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
                animation: 'navShimmer 8s ease-in-out 3s infinite',
                opacity: 0.6,
              }}
            />

            {/* ── Button Layout ── */}
            <div className="relative h-full flex items-center">

              {/* Left group */}
              <div className="flex-1 flex items-center justify-evenly h-full">
                {leftItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={view === item.id}
                    onTap={onTap}
                  />
                ))}
              </div>

              {/* Center spacer for FAB */}
              <div
                className="shrink-0"
                style={{ width: '76px' }}
                aria-hidden="true"
              />

              {/* Right group */}
              <div className="flex-1 flex items-center justify-evenly h-full">
                {rightItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={view === item.id}
                    onTap={onTap}
                  />
                ))}
              </div>
            </div>

            {/* Active item underline glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg,
                  transparent 5%,
                  ${activeItem.color}30 20%,
                  ${activeItem.color}50 50%,
                  ${activeItem.color}30 80%,
                  transparent 95%
                )`,
                boxShadow: `0 0 12px ${activeItem.color}25`,
                transition: 'all 0.4s ease',
              }}
            />
          </div>

          {/* ── Center FAB ── */}
          <CenterFAB
            active={view === "VOICE_ASSISTANT"}
            onTap={() => onTap("VOICE_ASSISTANT")}
          />
        </div>
      </nav>

      {/* ── Safe-area bottom spacer (prevents content hiding behind nav) ── */}
      <div
        className="lg:hidden h-24 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
};

export default MobileNav;