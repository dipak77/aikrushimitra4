import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ViewState } from "../../types";
import { LayoutDashboard, Store, Mic, Landmark, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { triggerHaptic } from "../../utils/common";

type NavItem = {
  id: ViewState;
  label: string;
  icon: React.ComponentType<any>;
  gradient: string;          // tailwind gradient classes
  activeText: string;        // explicit tailwind class (no dynamic templates)
  ring: string;              // explicit tailwind class
  glow: string;              // rgba string for inline shadow
  main?: boolean;
};

const MobileNav = ({ view, setView }: { view: ViewState; setView: (v: ViewState) => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Scroll handling refs
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
        glow: "rgba(34,197,94,0.45)",
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
        gradient: "from-sky-400 to-indigo-500",
        activeText: "text-sky-300",
        ring: "ring-sky-400/35",
        glow: "rgba(56,189,248,0.45)",
      },
    ],
    []
  );

  // Tiny “spark” dots: deterministic + memoized (no Math.random in render)
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
    // Choose the last scrollable container if your app uses nested scroll areas
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

  // Attach scroll listener once; throttle with rAF to avoid running logic too often. [web:46]
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
    return () => target.removeEventListener("scroll", onScroll as any);
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
          0% { transform: scale(1); opacity: .45; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        @keyframes sparkTwinkle {
          0%,100% { opacity: .18; transform: scale(.85); }
          50% { opacity: .60; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-float, .nav-shimmer, .fab-pulse, .spark { animation: none !important; }
          * { transition-duration: 1ms !important; }
        }
      `}</style>

      <div
        className={clsx(
          "lg:hidden fixed bottom-6 inset-x-4 z-[200] flex justify-center pointer-events-none",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0"
        )}
      >
        <div className="relative w-full max-w-[420px] pointer-events-auto">
          {/* Ambient glow (light) */}
          <div className="absolute -inset-x-8 -inset-y-6 rounded-[2.5rem] blur-3xl opacity-50"
            style={{
              background:
                "linear-gradient(90deg, rgba(16,185,129,0.14), rgba(34,211,238,0.12), rgba(16,185,129,0.14))",
            }}
          />

          {/* Sparks (few, deterministic) */}
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
              "relative h-[5rem] rounded-[2.25rem] overflow-hidden",
              "border border-white/10 bg-slate-950/75 backdrop-blur-xl",
              "shadow-[0_18px_50px_rgba(0,0,0,0.55)]",
              "nav-float"
            )}
            style={{ animation: "softFloat 4.2s ease-in-out infinite" }}
          >
            {/* Border glow */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.25rem] ring-1 ring-emerald-400/15" />

            {/* Shimmer */}
            <div
              className="nav-shimmer absolute inset-0 pointer-events-none opacity-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                animation: "navShimmer 4.2s ease-in-out infinite",
              }}
            />

            {/* Layout with center gap */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pb-2">
              <div className="flex-1 flex justify-evenly items-center pr-6">
                {leftItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={view === item.id}
                    onTap={onTap}
                  />
                ))}
              </div>

              <div className="w-20 shrink-0" />

              <div className="flex-1 flex justify-evenly items-center pl-6">
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

          {/* CENTER FAB */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[42%] w-[4.6rem] h-[4.6rem] z-30">
            <button
              onClick={() => onTap("VOICE_ASSISTANT")}
              className="relative w-full h-full rounded-[1.55rem] focus:outline-none active:scale-90 transition-transform duration-200"
              aria-label="Voice assistant"
            >
              {/* Pulse rings (reduced count) */}
              <span
                className="fab-pulse absolute -inset-5 rounded-[2rem] border border-cyan-400/25"
                style={{ animation: "fabPulse 2.2s ease-out infinite" }}
              />
              <span
                className="fab-pulse absolute -inset-3 rounded-[2rem] border border-emerald-400/20"
                style={{ animation: "fabPulse 2.2s ease-out 0.5s infinite" }}
              />

              <div
                className={clsx(
                  "relative w-full h-full rounded-[1.55rem] grid place-items-center overflow-hidden",
                  "border-[4px] border-[#020617]",
                  "shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                )}
                style={{
                  background: "linear-gradient(135deg, #34d399 0%, #14b8a6 45%, #2563eb 100%)",
                  boxShadow: "0 0 28px rgba(34,211,238,0.25)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/18" />
                <div className="absolute -inset-10 opacity-35 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.25), transparent 60%)",
                  }}
                />
                <Mic size={32} strokeWidth={3} className="relative z-10 text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]" />
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
      onClick={() => onTap(item.id)}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-1.5 w-16 h-full",
        "active:scale-90 transition-transform duration-200",
        "touch-manipulation"
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Soft glow behind active */}
      {active && (
        <span
          className="absolute inset-0 rounded-2xl blur-2xl opacity-25"
          style={{ background: `linear-gradient(135deg, ${item.glow}, transparent)` }}
        />
      )}

      <div
        className={clsx(
          "relative p-2.5 rounded-[1.125rem] overflow-hidden",
          "border border-white/10 bg-white/5 backdrop-blur-xl",
          "transition-[transform,box-shadow,background] duration-300",
          active && "bg-white/8 ring-2",
          active ? item.ring : "ring-0"
        )}
        style={
          active
            ? { boxShadow: `0 0 18px ${item.glow}` }
            : undefined
        }
      >
        {/* Active gradient wash */}
        {active && (
          <span className={clsx("absolute inset-0 opacity-20 bg-gradient-to-br", item.gradient)} />
        )}

        <Icon
          size={24}
          strokeWidth={active ? 2.8 : 2.2}
          className={clsx("relative z-10 transition-colors duration-300", active ? item.activeText : "text-slate-400")}
        />
      </div>

      <span
        className={clsx(
          "text-[10px] font-black tracking-wider uppercase transition-colors duration-300",
          active ? item.activeText : "text-slate-500"
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

export default MobileNav;
