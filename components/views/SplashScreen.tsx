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
    progress < 22
      ? "INITIALIZING"
      : progress < 48
      ? "LOADING MODELS"
      : progress < 74
      ? "SYNCING DATA"
      : progress < 94
      ? "OPTIMIZING"
      : "READY";

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
          "radial-gradient(1200px 600px at 50% 20%, rgba(16,185,129,0.22), transparent 60%)," +
          "radial-gradient(900px 500px at 75% 35%, rgba(34,211,238,0.14), transparent 60%)," +
          "linear-gradient(180deg, #071a17 0%, #020617 75%)",
      }}
      aria-label="Loading AI Krushi Mitra"
    >
      {/* Aurora (lightweight, no blur animation) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.55]">
        <div className="absolute -inset-[30%] aurora" />
      </div>

      {/* Subtle grid / premium texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(55% 55% at 50% 45%, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(55% 55% at 50% 45%, black 40%, transparent 70%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side at 50% 45%, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative w-full max-w-[820px] px-6">
        {/* Brand block */}
        <div className="flex flex-col items-center text-center">
          {/* Badges row (brand reference) */}
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
                  "linear-gradient(90deg, transparent, rgba(16,185,129,0.55), rgba(34,211,238,0.45), transparent)",
              }}
            />

            <IconBadge tone="emerald" delayMs={0} icon={<Leaf size={26} strokeWidth={2.2} />} />
            <IconBadge tone="amber" delayMs={120} icon={<TrendingUp size={26} strokeWidth={2.2} />} />
            <IconBadge tone="cyan" delayMs={240} icon={<Droplets size={26} strokeWidth={2.2} />} />
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
              filter: "drop-shadow(0 10px 28px rgba(251,191,36,0.18))",
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

        {/* Scene */}
        <div className="relative mt-10 h-[170px]">
          {/* Horizon glow */}
          <div
            className="absolute left-1/2 bottom-[66px] -translate-x-1/2 h-[80px] w-[92%] opacity-60"
            style={{
              background:
                "radial-gradient(closest-side at 50% 100%, rgba(16,185,129,0.22), transparent 70%)",
            }}
          />

          {/* Ground line */}
          <div
            className="absolute left-0 right-0 bottom-[64px] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.22) 20%, rgba(34,211,238,0.18) 50%, rgba(16,185,129,0.22) 80%, transparent)",
            }}
          />

          {/* Wheat */}
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
                  filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.18))",
                  animation: progress > 35 ? `wheatSway 3.8s ease-in-out ${i * 120}ms infinite` : "none",
                }}
              />
            ))}
          </div>

          {/* Tractor */}
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
                style={{ filter: "drop-shadow(0 0 14px rgba(34,211,238,0.28))" }}
              />
            </div>
          </div>
        </div>

        {/* Status + progress */}
        <div className="mt-2 flex flex-col items-center gap-4">
          <div
            className="flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-sm"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,211,238,0.08))",
              border: "1px solid rgba(52,211,153,0.22)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
            aria-live="polite"
          >
            <Sparkles size={14} className={`text-emerald-300 ${progress > 90 ? "animate-spin" : "animate-pulse"}`} />
            <span className="text-xs tracking-[0.30em] font-bold uppercase text-emerald-200/90">
              {status}
            </span>
          </div>

          <div className="w-full max-w-sm">
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{
                background: "rgba(15,23,42,0.55)",
                border: "1px solid rgba(16,185,129,0.18)",
                boxShadow: "inset 0 1px 5px rgba(0,0,0,0.35)",
              }}
            >
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399, #22d3ee)",
                  backgroundSize: "200% 100%",
                  transition: "width 140ms linear",
                  animation: "barFlow 3.2s ease-in-out infinite",
                  boxShadow: "0 0 16px rgba(52,211,153,0.38)",
                  willChange: "width",
                }}
              >
                <div
                  className="absolute inset-0 opacity-35"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
                    animation: "barSheen 1.9s ease-in-out infinite",
                  }}
                />
              </div>
            </div>

            <div
              className="mt-2.5 text-center text-sm font-bold tabular-nums"
              style={{
                background: "linear-gradient(135deg, #34d399, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 1px 8px rgba(52,211,153,0.22))",
              }}
            >
              {progress}%
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Aurora: a few gradients, animated background-position only (cheap) */
        .aurora{
          background:
            radial-gradient(800px 320px at 20% 30%, rgba(16,185,129,0.22), transparent 60%),
            radial-gradient(700px 300px at 70% 20%, rgba(34,211,238,0.16), transparent 60%),
            radial-gradient(900px 360px at 50% 70%, rgba(245,158,11,0.10), transparent 60%),
            linear-gradient(120deg, rgba(16,185,129,0.10), rgba(34,211,238,0.08), rgba(245,158,11,0.06));
          background-size: 160% 160%;
          animation: auroraMove 10s ease-in-out infinite;
          transform: translateZ(0);
          will-change: background-position;
        }

        @keyframes auroraMove{
          0%,100%{ background-position: 10% 10%; }
          50%{ background-position: 90% 70%; }
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

        /* Motion accessibility */
        @media (prefers-reduced-motion: reduce){
          .aurora{ animation: none !important; }
          *{ animation: none !important; transition-duration: 1ms !important; }
        }
      `}</style>
    </div>
  );
}

function IconBadge({
  tone,
  icon,
  delayMs,
}: {
  tone: "emerald" | "amber" | "cyan";
  icon: React.ReactNode;
  delayMs: number;
}) {
  const palette =
    tone === "emerald"
      ? {
          bg: "linear-gradient(135deg, #064e3b, #10b981)",
          ring: "rgba(16,185,129,0.28)",
          glow: "rgba(16,185,129,0.35)",
          fg: "text-emerald-100",
        }
      : tone === "amber"
      ? {
          bg: "linear-gradient(135deg, #b45309, #f59e0b)",
          ring: "rgba(245,158,11,0.28)",
          glow: "rgba(245,158,11,0.35)",
          fg: "text-amber-50",
        }
      : {
          bg: "linear-gradient(135deg, #0e7490, #22d3ee)",
          ring: "rgba(34,211,238,0.28)",
          glow: "rgba(34,211,238,0.35)",
          fg: "text-cyan-50",
        };

  return (
    <div
      className="relative"
      style={{
        animation: `badgeBob 3.2s ease-in-out ${delayMs}ms infinite`,
      }}
    >
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

      <div
        className="absolute inset-[-5px] rounded-full"
        style={{
          border: `1px solid ${palette.ring}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset`,
        }}
      />

      <style>{`
        @keyframes badgeBob{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
