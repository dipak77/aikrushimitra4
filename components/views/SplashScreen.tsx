
import React, { useEffect, useRef, useState } from "react";
import { Tractor, Wheat, Sparkles } from "lucide-react";

const DURATION = 3500; // Optimized duration

const easeOutExpo = (x: number) =>
  x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

export default function SplashScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);
  const completedRef = useRef(false); // Prevent double completion

  useEffect(() => {
    // 1. Completion Handler
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setExit(true);
      setTimeout(() => {
        onComplete();
      }, 700); // Wait for exit animation
    };

    // 2. Animation Loop
    const animate = (t: number) => {
      if (!start.current) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(elapsed / DURATION, 1);
      
      setProgress(Math.round(easeOutExpo(p) * 100));

      if (p < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        // Animation finished naturally
        setTimeout(finish, 200);
      }
    };

    // Start Animation
    raf.current = requestAnimationFrame(animate);

    // 3. SAFETY TIMEOUT: Force proceed if tab is inactive or logic stalls
    // This fixes the "stuck on splash screen" issue
    const safetyTimer = setTimeout(finish, DURATION + 1500);

    // Cleanup
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      clearTimeout(safetyTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ease-in-out ${
        exit ? "opacity-0 scale-110 filter blur-sm" : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% 20%, #052e2b, #020617 70%)",
      }}
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.png')]" />

      {/* MAIN CONTENT */}
      <div className="relative w-full max-w-5xl h-[420px] flex flex-col items-center justify-center">

        {/* LOGO */}
        <div className="relative mb-14">
          <h1
            className="text-6xl md:text-8xl font-black tracking-[-0.04em]"
            style={{
              background:
                "linear-gradient(135deg,#34d399,#22d3ee,#34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter:
                "drop-shadow(0 0 30px rgba(52,211,153,.4))",
              opacity: progress > 5 ? 1 : 0,
              transform:
                progress > 5 ? "scale(1)" : "scale(0.96)",
              transition: "all 1s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            AI KRUSHI
          </h1>

          <p
            className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-sm tracking-[0.35em] font-bold text-emerald-400 whitespace-nowrap"
            style={{
              opacity: progress > 20 ? 1 : 0,
              transform:
                progress > 20
                  ? "translateX(-50%) translateY(0)"
                  : "translateX(-50%) translateY(6px)",
              transition: "all 800ms ease",
            }}
          >
            MITRA
          </p>
        </div>

        {/* FIELD */}
        <div className="absolute bottom-24 w-full flex justify-between px-10">
          {[...Array(18)].map((_, i) => (
            <Wheat
              key={i}
              size={36}
              className="text-emerald-400"
              style={{
                opacity: progress > i * 3 ? 1 : 0,
                transform:
                  progress > i * 3
                    ? "scaleY(1)"
                    : "scaleY(0)",
                transformOrigin: "bottom",
                transition:
                  "all 400ms cubic-bezier(.17,.89,.32,1.4)",
                filter:
                  "drop-shadow(0 0 8px rgba(52,211,153,.3))",
              }}
            />
          ))}
        </div>

        {/* TRACTOR */}
        <div
          className="absolute bottom-14"
          style={{
            left: `${progress}%`,
            transform: "translateX(-50%)",
            transition: "left 100ms linear",
            filter:
              "drop-shadow(0 16px 30px rgba(0,0,0,.6))",
          }}
        >
          <div
            style={{
              animation:
                "suspension 1.3s infinite cubic-bezier(.4,0,.2,1)",
            }}
          >
            <Tractor
              size={96}
              strokeWidth={1}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="absolute bottom-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs tracking-[0.25em] font-mono font-bold">
            <Sparkles size={14} className={progress > 90 ? "animate-spin" : "animate-pulse"} />
            {progress < 30
              ? "INITIALIZING"
              : progress < 60
              ? "SYNCING DATA"
              : progress < 90
              ? "OPTIMIZING FARM"
              : "READY"}
          </div>

          {/* PROGRESS BAR */}
          <div className="w-72 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg,#34d399,#22d3ee)",
                boxShadow:
                  "0 0 20px rgba(52,211,153,.5)",
                transition: "width 100ms linear",
              }}
            />
          </div>

          <div className="text-emerald-400 font-mono text-sm">
            {progress}%
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes suspension {
          0%,100% { transform: translateY(0) }
          30% { transform: translateY(-1px) }
          60% { transform: translateY(0.5px) }
        }
      `}</style>
    </div>
  );
}
