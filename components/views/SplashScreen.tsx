import React, { useEffect, useRef, useState } from "react";
import { Tractor, Wheat, Sparkles, Leaf, TrendingUp, Droplets } from "lucide-react";

const DURATION = 3500;
const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setExit(true);
      setTimeout(onComplete, 600);
    };

    const animate = (t: number) => {
      if (!start.current) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(Math.round(easeOutExpo(p) * 100));
      if (p < 1) raf.current = requestAnimationFrame(animate);
      else setTimeout(finish, 160);
    };

    raf.current = requestAnimationFrame(animate);
    const safetyTimer = setTimeout(finish, DURATION + 1500);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      clearTimeout(safetyTimer);
    };
  }, [onComplete]);

  const status =
    progress < 22 ? "INITIALIZING" :
    progress < 48 ? "LOADING MODELS" :
    progress < 74 ? "SYNCING DATA" :
    progress < 94 ? "OPTIMIZING" : "READY";

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] overflow-hidden",
        "flex items-center justify-center",
        "transition-[opacity,transform,filter] duration-600 ease-out",
        exit ? "opacity-0 scale-[1.02] blur-[1px]" : "opacity-100 scale-100 blur-0",
      ].join(" ")}
      style={{
        background:
          "radial-gradient(1100px 520px at 50% 18%, rgba(16,185,129,0.18), transparent 60%)," +
          "radial-gradient(900px 520px at 78% 35%, rgba(34,211,238,0.12), transparent 58%)," +
          "linear-gradient(180deg, #061513 0%, #020617 78%)",
      }}
      aria-label="Loading AI Krushi Mitra"
    >
      {/* DJ LASER RIG (lightweight) */}
      <div className="absolute inset-0 pointer-events-none laser-rig">
        <div className="laser-beam beam-a" />
        <div className="laser-beam beam-b" />
        <div className="laser-beam beam-c" />
        <div className="laser-beam beam-d" />
        <div className="laser-scanline" />
      </div>

      {/* Premium subtle texture + vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(55% 55% at 50% 42%, black 42%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(55% 55% at 50% 42%, black 42%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side at 50% 45%, transparent 0%, rgba(0,0,0,0.60) 100%)",
        }}
      />

      {/* MAIN */}
      <div className="relative w-full max-w-[820px] px-6">
        {/* BRAND */}
        <div className="flex flex-col items-center text-center">
          {/* badges row (reference-like) */}
          <div
            className="relative mb-8 flex items-center gap-5"
            style={{
              opacity: progress > 10 ? 1 : 0,
              transform: progress > 10 ? "translateY(0)" : "translateY(-10px)",
              transition: "all 900ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-[260px] opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(16,185,129,0.50), rgba(34,211,238,0.42), transparent)",
              }}
            />
            <IconBadge tone="emerald" icon={<Leaf size={26} strokeWidth={2.2} />} />
            <IconBadge tone="amber" icon={<TrendingUp size={26} strokeWidth={2.2} />} />
            <IconBadge tone="cyan" icon={<Droplets size={26} strokeWidth={2.2} />} />
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, #fff7cc 0%, #fbbf24 30%, #f59e0b 52%, #fbbf24 74%, #fff7cc 100%)",
              backgroundSize: "220% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 12px 30px rgba(251,191,36,0.16))",
              opacity: progress > 5 ? 1 : 0,
              transform: progress > 5 ? "scale(1)" : "scale(0.97)",
              transition: "all 1000ms cubic-bezier(.2,.8,.2,1)",
              animation: progress > 5 ? "titleShimmer 7s ease-in-out infinite" : "none",
            }}
          >
            AI Krushi Mitra
          </h1>

          {/* Subtitle */}
          <div
            className="mt-3 flex items-center gap-3"
            style={{
              opacity: progress > 18 ? 1 : 0,
              transform: progress > 18 ? "translateY(0)" : "translateY(6px)",
              transition: "all 850ms ease",
            }}
          >
            <div className="h-px w-10 bg-gradient-to-r from-transparent via-slate-500/70 to-transparent" />
            <p className="text-xs sm:text-sm tracking-[0.38em] font-semibold uppercase text-slate-300/90">
              AI Powered Platform
            </p>
            <div className="h-px w-10 bg-gradient-to-r from-transparent via-slate-500/70 to-transparent" />
          </div>
        </div>

        {/* SCENE */}
        <div className="relative mt-10 h-[170px]">
          <div
            className="absolute left-1/2 bottom-[66px] -translate-x-1/2 h-[80px] w-[92%] opacity-60"
            style={{
              background:
                "radial-gradient(closest-side at 50% 100%, rgba(16,185,129,0.18), transparent 72%)",
            }}
          />
          <div
            className="absolute left-0 right-0 bottom-[64px] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.20) 20%, rgba(34,211,238,0.16) 50%, rgba(16,185,129,0.20) 80%, transparent)",
            }}
          />

          <div className="absolute left-0 right-0 bottom-[70px] flex justify-around px-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Wheat
                key={i}
                size={30}
                strokeWidth={1.5}
                className="text-emerald-500/80"
                style={{
                  opacity: progress > i * 6 ? 1 : 0,
                  transform: progress > i * 6 ? "scaleY(1)" : "scaleY(0)",
                  transformOrigin: "bottom",
                  transition: `all 520ms cubic-bezier(.17,.89,.32,1.3) ${i * 35}ms`,
                  filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.16))",
                  animation: progress > 35 ? `wheatSway 3.8s ease-in-out ${i * 120}ms infinite` : "none",
                }}
              />
            ))}
          </div>

          <div
            className="absolute bottom-[44px]"
            style={{
              left: `${Math.min(progress * 0.86, 86)}%`,
              transform: "translateX(-50%)",
              transition: "left 140ms linear",
              willChange: "left",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
            }}
          >
            <div style={{ animation: progress > 10 ? "tractorFloat 1.25s ease-in-out infinite" : "none" }}>
              <Tractor
                size={70}
                strokeWidth={1.6}
                className="text-cyan-300"
                style={{ filter: "drop-shadow(0 0 14px rgba(34,211,238,0.26))" }}
              />
            </div>
          </div>
        </div>

        {/* HUD */}
        <div className="mt-2 flex flex-col items-center gap-4">
          <div
            className="flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-sm hud"
            aria-live="polite"
          >
            <Sparkles size={14} className={`text-emerald-300 ${progress > 90 ? "animate-spin" : "animate-pulse"}`} />
            <span className="text-xs tracking-[0.30em] font-bold uppercase text-emerald-200/90">
              {status}
            </span>
          </div>

          <div className="w-full max-w-sm">
            <div className="relative h-2 rounded-full overflow-hidden barShell">
              <div className="absolute inset-y-0 left-0 barFill" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 sheen" />
              </div>
            </div>

            <div className="mt-2.5 text-center text-sm font-bold tabular-nums pct">
              {progress}%
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        /* LASER RIG */
        .laser-rig{
          /* keep lasers focused toward center (mask = cheap + clean) */
          mask-image: radial-gradient(58% 55% at 50% 35%, black 45%, transparent 76%);
          -webkit-mask-image: radial-gradient(58% 55% at 50% 35%, black 45%, transparent 76%);
        }

        .laser-beam{
          position:absolute;
          left:50%;
          top:38%;
          width:140vmax;
          height:4px;
          transform: translate(-50%,-50%) rotate(var(--a, 25deg));
          transform-origin: 50% 50%;
          opacity: 0.55;
          border-radius: 999px;
          /* bright center, soft edges */
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.04) 18%,
            var(--c, rgba(34,211,238,0.85)) 50%,
            rgba(255,255,255,0.04) 82%,
            transparent 100%
          );
          /* glow without heavy blur */
          box-shadow:
            0 0 18px rgba(255,255,255,0.06),
            0 0 26px var(--g, rgba(34,211,238,0.22));
          mix-blend-mode: screen;
          will-change: transform, opacity;
          animation: beamSweep var(--t, 4.6s) ease-in-out infinite;
        }

        .beam-a{ --a: 18deg;  --c: rgba(34,211,238,0.90); --g: rgba(34,211,238,0.24); --t: 4.8s; }
        .beam-b{ --a: -12deg; --c: rgba(16,185,129,0.86); --g: rgba(16,185,129,0.22); --t: 5.6s; animation-delay: .35s; }
        .beam-c{ --a: 42deg;  --c: rgba(245,158,11,0.72); --g: rgba(245,158,11,0.18); --t: 6.4s; animation-delay: .7s; height: 3px; opacity: .45;}
        .beam-d{ --a: -34deg; --c: rgba(217,70,239,0.62); --g: rgba(217,70,239,0.16); --t: 5.2s; animation-delay: 1.05s; height: 3px; opacity: .40;}

        @keyframes beamSweep{
          0%,100%{ transform: translate(-50%,-50%) rotate(var(--a)) translateX(-2.5vmax); opacity: .30; }
          40%{ opacity: .62; }
          50%{ transform: translate(-50%,-50%) rotate(calc(var(--a) + 10deg)) translateX(2.5vmax); opacity: .70; }
          60%{ opacity: .55; }
        }

        .laser-scanline{
          position:absolute;
          left:50%;
          top:18%;
          width:120vmax;
          height:2px;
          transform: translateX(-50%) rotate(-6deg);
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.45), transparent);
          opacity: .22;
          mix-blend-mode: screen;
          animation: scanMove 3.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes scanMove{
          0%,100%{ transform: translateX(-50%) translateY(-8px) rotate(-6deg); opacity: .14; }
          50%{ transform: translateX(-50%) translateY(18px) rotate(-6deg); opacity: .28; }
        }

        /* HUD */
        .hud{
          background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,211,238,0.08));
          border: 1px solid rgba(52,211,153,0.22);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .barShell{
          background: rgba(15,23,42,0.55);
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow: inset 0 1px 5px rgba(0,0,0,0.35);
        }
        .barFill{
          background: linear-gradient(90deg, #10b981, #34d399, #22d3ee);
          background-size: 200% 100%;
          transition: width 140ms linear;
          animation: barFlow 3.2s ease-in-out infinite;
          box-shadow: 0 0 16px rgba(52,211,153,0.34);
          will-change: width;
        }
        .sheen{
          opacity: .30;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: barSheen 1.9s ease-in-out infinite;
        }
        .pct{
          background: linear-gradient(135deg, #34d399, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 1px 8px rgba(52,211,153,0.20));
        }

        @keyframes titleShimmer{
          0%,100%{ background-position: 0% 50%; }
          50%{ background-position: 100% 50%; }
        }
        @keyframes barFlow{
          0%,100%{ background-position: 0% 50%; }
          50%{ background-position: 100% 50%; }
        }
        @keyframes barSheen{
          0%{ transform: translateX(-120%); }
          100%{ transform: translateX(220%); }
        }
        @keyframes wheatSway{
          0%,100%{ transform: rotate(0deg); }
          50%{ transform: rotate(3deg); }
        }
        @keyframes tractorFloat{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-2px); }
        }

        /* Accessibility: reduce motion when requested */
        @media (prefers-reduced-motion: reduce){
          .laser-beam, .laser-scanline{ animation: none !important; opacity: .18 !important; }
          *{ animation: none !important; transition-duration: 1ms !important; }
        }
      `}</style>
    </div>
  );
}

function IconBadge({
  tone,
  icon,
}: {
  tone: "emerald" | "amber" | "cyan";
  icon: React.ReactNode;
}) {
  const palette =
    tone === "emerald"
      ? { bg: "linear-gradient(135deg, #064e3b, #10b981)", glow: "rgba(16,185,129,0.34)", fg: "text-emerald-100" }
      : tone === "amber"
      ? { bg: "linear-gradient(135deg, #b45309, #f59e0b)", glow: "rgba(245,158,11,0.30)", fg: "text-amber-50" }
      : { bg: "linear-gradient(135deg, #0e7490, #22d3ee)", glow: "rgba(34,211,238,0.30)", fg: "text-cyan-50" };

  return (
    <div className="relative" style={{ animation: "badgeBob 3.2s ease-in-out infinite" }}>
      <div
        className="w-[66px] h-[66px] rounded-full grid place-items-center relative overflow-hidden"
        style={{
          background: palette.bg,
          boxShadow: `0 10px 26px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.16)`,
        }}
      >
        <div className={`relative z-10 ${palette.fg}`}>{icon}</div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      </div>

      <style>{`
        @keyframes badgeBob{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
