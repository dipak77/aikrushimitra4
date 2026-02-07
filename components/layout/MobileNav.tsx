
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ViewState } from "../../types";
import { LayoutDashboard, Store, Mic, ShoppingCart, Landmark } from "lucide-react";
import clsx from "clsx";
import { triggerHaptic } from "../../utils/common";

type NavItem = {
  id: ViewState;
  label: string;
  icon: React.ComponentType<any>;
  gradient: string;
  activeText: string;
  ring: string;
  glow: string;
  main?: boolean;
};

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

  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: "DASHBOARD",
        icon: LayoutDashboard,
        label: "Home",
        gradient: "from-emerald-400 to-teal-500",
        activeText: "text-emerald-300",
        ring: "ring-emerald-400/35",
        glow: "rgba(16,185,129,0.45)",
      },
      {
        id: "SABJI_MANDI",
        icon: ShoppingCart,
        label: "Shop",
        gradient: "from-green-400 to-emerald-500",
        activeText: "text-green-300",
        ring: "ring-green-400/35",
        glow: "rgba(74,222,128,0.45)",
      },
      {
        id: "VOICE_ASSISTANT",
        icon: Mic,
        label: "Voice",
        gradient: "from-cyan-400 to-blue-600",
        activeText: "text-cyan-200",
        ring: "ring-cyan-400/35",
        glow: "rgba(34,211,238,0.45)",
        main: true,
      },
      {
        id: "MARKET",
        icon: Store,
        label: "Market",
        gradient: "from-violet-400 to-purple-500",
        activeText: "text-violet-300",
        ring: "ring-violet-400/35",
        glow: "rgba(139,92,246,0.45)",
      },
      {
        id: "SCHEMES",
        icon: Landmark,
        label: "Schemes",
        gradient: "from-amber-400 to-orange-500",
        activeText: "text-amber-300",
        ring: "ring-amber-400/35",
        glow: "rgba(251,191,36,0.45)",
      },
    ],
    []
  );

  const sparks = useMemo(
    () => [
      { top: "18%", left: "14%", d: "0s" },
      { top: "32%", left: "78%", d: "0.7s" },
      { top: "66%", left: "20%", d: "1.1s" },
      { top: "72%", left: "86%", d: "1.6s" },
      { top: "40%", left: "52%", d: "2.0s" },
      { top: "20%", left: "56%", d: "2.4s" },
    ],
    []
  );

  const findScrollContainer = useCallback((): Window | HTMLElement => {
    const containers = document.querySelectorAll<HTMLElement>(".overflow-y-auto");
    return containers.length ? containers[containers.length - 1] : window;
  }, []);

  const readScrollY = (t: Window | HTMLElement) => {
    if (t === window) return window.scrollY || 0;
    return (t as HTMLElement).scrollTop || 0;
  };

  const readMaxY = (t: Window | HTMLElement) => {
    if (t === window) {
      const doc = document.documentElement;
      return Math.max(0, doc.scrollHeight - window.innerHeight);
    }
    const el = t as HTMLElement;
    return Math.max(0, el.scrollHeight - el.clientHeight);
  };

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
        const atTop = currentY < 60;
        const atBottom = currentY >= maxY - 60;

        const scrollingUp = currentY < lastY;
        const scrollingDown = currentY > lastY;

        if (atTop || atBottom) setIsVisible(true);
        else if (scrollingUp && diff > 6) setIsVisible(true);
        else if (scrollingDown && diff > 18) setIsVisible(false);

        lastYRef.current = currentY;
      });
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [findScrollContainer]);

  const onTap = useCallback(
    (id: ViewState) => {
      setView(id);
      triggerHaptic();
      setIsVisible(true);
    },
    [setView]
  );

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(3, 5);

  return (
    <>
      <style>{`
        @keyframes navShimmer {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          35% { opacity: .55; }
          100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }
        @keyframes softFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes fabPulse {
          0% { transform: scale(1); opacity: .42; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        @keyframes sparkTwinkle {
          0%,100% { opacity: .14; transform: scale(.85); }
          50% { opacity: .58; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-float, .nav-shimmer, .fab-pulse, .spark { animation: none !important; }
          * { transition-duration: 1ms !important; }
        }
      `}</style>

      <div
        className={clsx(
          "lg:hidden fixed inset-x-4 z-[200] flex justify-center pointer-events-none",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0"
        )}
        style={{
          // safe-area aware bottom spacing
          bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="relative w-full max-w-[420px] pointer-events-auto">
          {/* Ambient glow */}
          <div
            className="absolute -inset-x-8 -inset-y-7 rounded-[2.75rem] blur-3xl opacity-55"
            style={{
              background:
                "linear-gradient(90deg, rgba(16,185,129,0.16), rgba(34,211,238,0.12), rgba(139,92,246,0.12), rgba(16,185,129,0.14))",
            }}
          />

          {/* Sparks */}
          <div className="absolute inset-0 pointer-events-none">
            {sparks.map((s, i) => (
              <span
                key={i}
                className="spark absolute w-1 h-1 rounded-full bg-emerald-300/70"
                style={{
                  top: s.top,
                  left: s.left,
                  animation: `sparkTwinkle 2.6s ease-in-out ${s.d} infinite`,
                  boxShadow: "0 0 10px rgba(52,211,153,0.35)",
                }}
              />
            ))}
          </div>

          {/* NAV SHELL */}
          <div
            className={clsx(
              "relative h-[5rem] rounded-[2.35rem] overflow-hidden",
              "border border-white/10 bg-slate-950/72 backdrop-blur-xl",
              "shadow-[0_18px_50px_rgba(0,0,0,0.58)]",
              "nav-float"
            )}
            style={{ animation: "softFloat 4.2s ease-in-out infinite" }}
          >
            {/* Premium border + highlight */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.35rem] ring-1 ring-white/10" />
            <div className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.14), transparent 55%)",
              }}
            />

            {/* Shimmer */}
            <div
              className="nav-shimmer absolute inset-0 pointer-events-none opacity-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                animation: "navShimmer 4.2s ease-in-out infinite",
              }}
            />

            {/* Layout with guaranteed center dead-zone */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pb-2">
              <div className="flex-1 flex items-center justify-between gap-1 pr-9">
                {leftItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={view === item.id}
                    onTap={onTap}
                  />
                ))}
              </div>

              {/* bigger center gap so Shop can't sit under FAB */}
              <div
                className="shrink-0"
                style={{ width: "clamp(5.6rem, 22vw, 6.4rem)" }}
                aria-hidden="true"
              />

              <div className="flex-1 flex items-center justify-between gap-1 pl-9">
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
          </div>

          {/* CENTER FAB (only the real button can receive events) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[42%] w-[4.7rem] h-[4.7rem] z-30 pointer-events-none">
            <button
              type="button"
              onClick={() => onTap("VOICE_ASSISTANT")}
              className="pointer-events-auto relative w-full h-full rounded-[1.6rem]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70
                         active:scale-90 transition-transform duration-200"
              aria-label="Voice assistant"
            >
              {/* Decorative layers NEVER capture taps */}
              <span
                className="pointer-events-none fab-pulse absolute -inset-5 rounded-[2rem] border border-cyan-400/25"
                style={{ animation: "fabPulse 2.2s ease-out infinite" }}
              />
              <span
                className="pointer-events-none fab-pulse absolute -inset-3 rounded-[2rem] border border-emerald-400/20"
                style={{ animation: "fabPulse 2.2s ease-out 0.5s infinite" }}
              />

              <div
                className={clsx(
                  "relative w-full h-full rounded-[1.6rem] grid place-items-center overflow-hidden",
                  "border-[4px] border-[#020617]",
                  "shadow-[0_18px_50px_rgba(0,0,0,0.60)]"
                )}
                style={{
                  background:
                    "linear-gradient(135deg, #34d399 0%, #14b8a6 42%, #2563eb 100%)",
                  boxShadow: "0 0 34px rgba(34,211,238,0.22)",
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/18" />
                <div
                  className="pointer-events-none absolute -inset-10 opacity-35 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.24), transparent 62%)",
                  }}
                />
                <Mic
                  size={32}
                  strokeWidth={3}
                  className="relative z-10 text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function NavButton({
  item,
  active,
  onTap,
}: {
  item: {
    id: ViewState;
    label: string;
    icon: React.ComponentType<any>;
    gradient: string;
    activeText: string;
    ring: string;
    glow: string;
  };
  active: boolean;
  onTap: (id: ViewState) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onTap(item.id)}
      className={clsx(
        // Wider + stable tap target
        "relative flex flex-col items-center justify-center gap-1",
        "w-full h-full",
        "active:scale-90 transition-transform duration-200 touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:rounded-2xl"
      )}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
    >
      {active && (
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl opacity-25"
          style={{
            background: `linear-gradient(135deg, ${item.glow}, transparent)`,
          }}
        />
      )}

      <div
        className={clsx(
          "relative p-2 rounded-[1rem] overflow-hidden",
          "border border-white/10 bg-white/5 backdrop-blur-xl",
          "transition-[transform,box-shadow,background] duration-300",
          active && "bg-white/8 ring-2",
          active ? item.ring : "ring-0"
        )}
        style={active ? { boxShadow: `0 0 18px ${item.glow}` } : undefined}
      >
        {active && (
          <span
            className={clsx(
              "pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-br",
              item.gradient
            )}
          />
        )}

        <Icon
          size={20}
          strokeWidth={active ? 2.8 : 2.2}
          className={clsx(
            "relative z-10 transition-colors duration-300",
            active ? item.activeText : "text-slate-400"
          )}
        />
      </div>

      <span
        className={clsx(
          "text-[9px] font-black tracking-wider uppercase transition-colors duration-300 scale-90",
          active ? item.activeText : "text-slate-500"
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

export default MobileNav;
