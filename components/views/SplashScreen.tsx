import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Sparkles,
  Leaf,
  TrendingUp,
  Droplets,
  ScanLine,
  Cpu,
  Satellite,
  Sun,
  CloudRain,
  Sprout,
  Zap,
  Wheat,
  Shield,
  Eye,
} from "lucide-react";

// --- Configuration ---
const DURATION = 5500;
const PARTICLE_COUNT = 50;
const FIREFLY_COUNT = 20;

// Custom Easings
const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

// Generate particles
const generateParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.2,
    color: ["#10b981", "#22d3ee", "#f59e0b", "#6366f1", "#ffffff"][
      Math.floor(Math.random() * 5)
    ],
  }));

const generateFireflies = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 6 + 6,
    delay: Math.random() * 4,
  }));

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [eagleLoaded, setEagleLoaded] = useState(false);
  const [eyeGlow, setEyeGlow] = useState(false);

  const raf = useRef<number>(0);
  const start = useRef<number>(0);
  const completedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);
  const fireflies = useMemo(() => generateFireflies(FIREFLY_COUNT), []);

  // Canvas Neural Network
  const drawNeuralNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    for (let i = 0; i < 35; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    let animFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - dist / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
        ctx.fill();
      });
      animFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setPhase(1), 300);
    setTimeout(() => setEyeGlow(true), 1500);

    const cleanup = drawNeuralNetwork();

    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3500);

    // Eye blink effect
    const blinkInterval = setInterval(() => {
      setEyeGlow(false);
      setTimeout(() => setEyeGlow(true), 200);
    }, 4000);

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase(2);
      setTimeout(() => {
        setExit(true);
        setTimeout(onComplete, 1200);
      }, 600);
    };

    const animate = (t: number) => {
      if (!start.current) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(Math.round(easeOutExpo(p) * 100));
      if (p < 1) raf.current = requestAnimationFrame(animate);
      else setTimeout(finish, 400);
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf.current);
      clearInterval(glitchInterval);
      clearInterval(blinkInterval);
      cleanup?.();
    };
  }, [onComplete, drawNeuralNetwork]);

  const status = useMemo(() => {
    if (progress < 12) return { text: "INITIALIZING EAGLE AI CORE", color: "text-cyan-400", icon: Eye };
    if (progress < 25) return { text: "ESTABLISHING SATELLITE LINK", color: "text-cyan-400", icon: Satellite };
    if (progress < 40) return { text: "SCANNING TERRAIN DATA", color: "text-blue-400", icon: ScanLine };
    if (progress < 55) return { text: "ANALYZING SOIL COMPOSITION", color: "text-emerald-400", icon: Sprout };
    if (progress < 70) return { text: "CALIBRATING WEATHER MODELS", color: "text-amber-400", icon: CloudRain };
    if (progress < 82) return { text: "PROCESSING CROP INTELLIGENCE", color: "text-green-400", icon: Cpu };
    if (progress < 92) return { text: "OPTIMIZING NEURAL NETWORK", color: "text-indigo-400", icon: Sparkles };
    if (progress < 100) return { text: "ACTIVATING GUARDIAN EAGLE", color: "text-purple-400", icon: Zap };
    return { text: "EAGLE AI ONLINE", color: "text-white", icon: Shield };
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-[1200ms] ease-out ${
        exit ? "opacity-0 scale-[1.15] blur-2xl" : "opacity-100 scale-100 blur-0"
      }`}
      style={{ background: "#000a06" }}
    >
      {/* ===== BACKGROUND LAYERS ===== */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#064e3b_0%,#021a0f_40%,#000a06_70%)]" />

      {/* Aurora */}
      <div className="absolute inset-0 opacity-30">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>

      {/* Neural Network Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full particle-float"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            backgroundColor: p.color, opacity: p.opacity,
            animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}

      {/* Fireflies */}
      {fireflies.map((f) => (
        <div
          key={`ff-${f.id}`}
          className="absolute rounded-full firefly"
          style={{
            left: `${f.startX}%`, top: `${f.startY}%`,
            width: `${f.size}px`, height: `${f.size}px`,
            animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s`,
          }}
        />
      ))}

      {/* Grid */}
      <div className="absolute inset-0 grid-container">
        <div className="perspective-grid" />
      </div>

      {/* Hex Pattern */}
      <div className="absolute inset-0 hex-pattern opacity-[0.02]" />

      {/* Light Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="light-ray ray-1" />
        <div className="light-ray ray-2" />
        <div className="light-ray ray-3" />
      </div>

      {/* Circular Energy Rings (behind eagle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="energy-ring ring-1" />
        <div className="energy-ring ring-2" />
        <div className="energy-ring ring-3" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,10,6,0.8)_70%,#000a06_100%)] pointer-events-none" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative w-full max-w-5xl px-4 flex flex-col items-center z-10">

        {/* Domain Badge */}
        <div className={`transition-all duration-1000 delay-200 ${phase >= 1 ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-emerald-300/80 uppercase">aikrushimitra.in</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* ===== EAGLE ROBOT HERO SECTION ===== */}
        <div className={`relative transition-all duration-[1800ms] ease-out delay-300 ${
          phase >= 1 ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-90"
        }`}>

          {/* Outer Glow */}
          <div className="absolute -inset-16 rounded-full bg-gradient-to-br from-emerald-500/15 via-transparent to-cyan-500/15 blur-3xl animate-pulse-slow" />

          {/* The Eagle Robot Container */}
          <div className="relative flex flex-col items-center">

            {/* Eagle Robot SVG Illustration */}
            <div className="relative eagle-float mb-2">
              {/* Shadow beneath eagle */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-emerald-500/20 rounded-full blur-xl eagle-shadow" />

              {/* Holographic Platform */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-2 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent platform-pulse" />
              </div>

              {/* The Eagle Robot - Inline SVG for maximum control */}
              <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                  {/* Body Base */}
                  <defs>
                    <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#d1fae5" />
                      <stop offset="40%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#059669" />
                    </radialGradient>
                    <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ecfdf5" />
                    </radialGradient>
                    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="wingGradR" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="60%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="softShadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>

                  {/* Left Wing */}
                  <g className="eagle-wing-left">
                    <path d="M100 180 C60 140, 30 120, 15 100 C10 94, 20 88, 35 95 C50 80, 65 75, 55 70 C50 65, 60 60, 75 68 C80 55, 100 50, 95 60 L120 140 Z"
                      fill="url(#wingGrad)" opacity="0.95" filter="url(#softShadow)"/>
                    {/* Wing detail feathers */}
                    <path d="M85 130 C65 110, 45 100, 30 95" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.5"/>
                    <path d="M90 145 C70 125, 50 115, 35 105" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.4"/>
                    <path d="M95 160 C80 140, 60 130, 45 120" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.3"/>
                  </g>

                  {/* Right Wing */}
                  <g className="eagle-wing-right">
                    <path d="M300 180 C340 140, 370 120, 385 100 C390 94, 380 88, 365 95 C350 80, 335 75, 345 70 C350 65, 340 60, 325 68 C320 55, 300 50, 305 60 L280 140 Z"
                      fill="url(#wingGradR)" opacity="0.95" filter="url(#softShadow)"/>
                    <path d="M315 130 C335 110, 355 100, 370 95" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.5"/>
                    <path d="M310 145 C330 125, 350 115, 365 105" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.4"/>
                    <path d="M305 160 C320 140, 340 130, 355 120" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.3"/>
                  </g>

                  {/* Body */}
                  <ellipse cx="200" cy="220" rx="85" ry="100" fill="url(#bodyGrad)" filter="url(#softShadow)"/>

                  {/* Belly */}
                  <ellipse cx="200" cy="240" rx="55" ry="65" fill="url(#bellyGrad)" opacity="0.9"/>

                  {/* Chest Emblem / Arc Reactor Style */}
                  <g className="chest-glow">
                    <circle cx="200" cy="200" r="18" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.6"/>
                    <circle cx="200" cy="200" r="12" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4">
                      <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="8s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="200" cy="200" r="6" fill="#22d3ee" opacity="0.8" filter="url(#glow)">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    {/* Orbiting dots */}
                    <circle cx="200" cy="182" r="2" fill="#22d3ee" filter="url(#glow)">
                      <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="4s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="200" cy="218" r="2" fill="#10b981" filter="url(#glow)">
                      <animateTransform attributeName="transform" type="rotate" from="180 200 200" to="540 200 200" dur="4s" repeatCount="indefinite"/>
                    </circle>
                  </g>

                  {/* Head */}
                  <ellipse cx="200" cy="130" rx="55" ry="50" fill="url(#bodyGrad)" filter="url(#softShadow)"/>

                  {/* Head Crest / Mohawk */}
                  <path d="M185 85 C188 55, 195 40, 200 30 C205 40, 212 55, 215 85"
                    fill="#059669" opacity="0.9"/>
                  <path d="M180 90 C182 65, 188 52, 192 42" stroke="#34d399" strokeWidth="1.5" fill="none" opacity="0.5"/>
                  <path d="M175 95 C178 78, 182 65, 185 55" stroke="#34d399" strokeWidth="1" fill="none" opacity="0.3"/>

                  {/* Antenna */}
                  <line x1="200" y1="30" x2="200" y2="15" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="200" cy="12" r="4" fill="#22d3ee" filter="url(#glow)">
                    <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                  </circle>

                  {/* Eyes */}
                  <g className={`eagle-eyes ${eyeGlow ? 'eyes-on' : 'eyes-off'}`}>
                    {/* Left Eye Socket */}
                    <ellipse cx="175" cy="125" rx="20" ry="18" fill="#021a0f" opacity="0.8"/>
                    {/* Left Eye */}
                    <ellipse cx="175" cy="125" rx="15" ry="13" fill="url(#eyeGlow)" opacity="0.9" filter="url(#glow)">
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                    {/* Left Pupil */}
                    <ellipse cx="178" cy="124" rx="5" ry="7" fill="#021a0f" opacity="0.7"/>
                    {/* Left Eye Shine */}
                    <ellipse cx="172" cy="121" rx="3" ry="2" fill="white" opacity="0.8"/>

                    {/* Right Eye Socket */}
                    <ellipse cx="225" cy="125" rx="20" ry="18" fill="#021a0f" opacity="0.8"/>
                    {/* Right Eye */}
                    <ellipse cx="225" cy="125" rx="15" ry="13" fill="url(#eyeGlow)" opacity="0.9" filter="url(#glow)">
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                    {/* Right Pupil */}
                    <ellipse cx="228" cy="124" rx="5" ry="7" fill="#021a0f" opacity="0.7"/>
                    {/* Right Eye Shine */}
                    <ellipse cx="222" cy="121" rx="3" ry="2" fill="white" opacity="0.8"/>
                  </g>

                  {/* Beak */}
                  <path d="M190 145 L200 170 L210 145 Z" fill="#f59e0b" filter="url(#softShadow)"/>
                  <path d="M193 148 L200 165 L207 148 Z" fill="#fbbf24"/>
                  {/* Beak line */}
                  <line x1="192" y1="152" x2="208" y2="152" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>

                  {/* Feet */}
                  <g className="eagle-feet">
                    {/* Left Foot */}
                    <path d="M170 315 L165 340 L155 345" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M170 315 L170 340 L165 348" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M170 315 L175 340 L180 345" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>

                    {/* Right Foot */}
                    <path d="M230 315 L225 340 L215 345" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M230 315 L230 340 L225 348" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M230 315 L235 340 L240 345" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </g>

                  {/* Robot Panel Lines on Body */}
                  <path d="M155 200 Q155 250, 175 280" stroke="#047857" strokeWidth="1" fill="none" opacity="0.4"/>
                  <path d="M245 200 Q245 250, 225 280" stroke="#047857" strokeWidth="1" fill="none" opacity="0.4"/>

                  {/* Small circuit dots on body */}
                  <circle cx="160" cy="210" r="2" fill="#22d3ee" opacity="0.5"/>
                  <circle cx="240" cy="210" r="2" fill="#22d3ee" opacity="0.5"/>
                  <circle cx="170" cy="260" r="1.5" fill="#22d3ee" opacity="0.4"/>
                  <circle cx="230" cy="260" r="1.5" fill="#22d3ee" opacity="0.4"/>

                  {/* Leaf held in right talons */}
                  <g className="held-leaf" transform="translate(240, 335) rotate(-20)">
                    <path d="M0 0 C10 -15, 25 -20, 35 -10 C25 -5, 10 0, 0 0 Z" fill="#34d399" opacity="0.9"/>
                    <path d="M0 0 C8 -10, 20 -15, 30 -8" stroke="#059669" strokeWidth="1" fill="none"/>
                  </g>

                  {/* Wheat held in left talons */}
                  <g className="held-wheat" transform="translate(148, 338) rotate(15)">
                    <line x1="0" y1="0" x2="-5" y2="-25" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                    <ellipse cx="-6" cy="-28" rx="3" ry="5" fill="#fbbf24" opacity="0.9"/>
                    <ellipse cx="-3" cy="-32" rx="2.5" ry="4" fill="#f59e0b" opacity="0.8"/>
                    <ellipse cx="-8" cy="-33" rx="2.5" ry="4" fill="#f59e0b" opacity="0.7"/>
                  </g>
                </svg>

                {/* Scanning ring effect around eagle */}
                <div className="absolute inset-[-20%] rounded-full border border-emerald-500/10 animate-ping-slow" />
                <div className="absolute inset-[-35%] rounded-full border border-cyan-500/5 animate-ping-slower" />
              </div>
            </div>

            {/* AI Badge below eagle */}
            <div className="relative mt-2 mb-3">
              <div className="ai-badge-ring">
                <div className="ai-badge">
                  <span className="text-lg md:text-xl font-black bg-gradient-to-br from-emerald-300 via-cyan-200 to-emerald-400 bg-clip-text text-transparent">AI</span>
                </div>
              </div>
            </div>

            {/* Main Title */}
            <div className={`relative ${glitchActive ? "glitch-active" : ""}`}>
              <h1 className="main-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-center">
                <span className="block bg-gradient-to-br from-white via-emerald-100 to-emerald-200/80 bg-clip-text text-transparent drop-shadow-2xl">KRUSHI</span>
                <span className="block bg-gradient-to-br from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent mt-[-0.05em]">MITRA</span>
              </h1>

              {/* Holographic ghost */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-center opacity-15">
                  <span className="block text-emerald-400 blur-sm">KRUSHI</span>
                  <span className="block text-cyan-400 blur-sm mt-[-0.05em]">MITRA</span>
                </h1>
              </div>

              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
                <div className="title-scanline" />
              </div>
            </div>

            {/* Subtitle */}
            <div className="flex items-center gap-3 mt-4">
              <div className="h-[1px] w-12 md:w-16 bg-gradient-to-r from-transparent via-emerald-500/60 to-emerald-500" />
              <div className="flex items-center gap-2">
                <Sparkles size={10} className="text-amber-400 animate-pulse" />
                <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-emerald-200/60 uppercase font-mono">Guardian of Smart Farming</p>
                <Sparkles size={10} className="text-amber-400 animate-pulse" />
              </div>
              <div className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-transparent via-emerald-500/60 to-emerald-500" />
            </div>
          </div>
        </div>

        {/* Tech Badges Row */}
        <div className={`flex justify-center gap-4 md:gap-8 mt-8 transition-all duration-1000 delay-500 ${
          phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}>
          <HoloBadge icon={Satellite} label="SAT" color="cyan" delay={0} />
          <HoloBadge icon={Leaf} label="BIO" color="emerald" delay={100} />
          <HoloBadge icon={Sun} label="SOL" color="amber" delay={200} />
          <HoloBadge icon={Droplets} label="H₂O" color="blue" delay={300} />
          <HoloBadge icon={TrendingUp} label="AI" color="indigo" delay={400} />
        </div>

        {/* ===== HUD LOADING ===== */}
        <div className={`w-full max-w-lg mt-8 relative transition-all duration-1000 delay-700 ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {/* Status */}
          <div className="flex items-center justify-between mb-3 text-xs font-mono font-bold tracking-widest">
            <div className={`flex items-center gap-2 ${status.color} transition-all duration-500`}>
              <div className="relative">
                <status.icon size={14} className="animate-spin-slow" />
                <div className="absolute inset-0 blur-sm opacity-60" style={{ color: "currentColor" }}>
                  <status.icon size={14} />
                </div>
              </div>
              <span className="hidden sm:inline">{status.text}</span>
              <span className="sm:hidden">{status.text.split(" ").slice(-2).join(" ")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    progress > 25 * (i + 1) ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-slate-700"
                  }`} />
                ))}
              </div>
              <span className="text-white/90 text-sm tabular-nums">{progress}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 w-full rounded-full overflow-hidden bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl relative">
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  transition: "width 0.15s linear",
                  background: "linear-gradient(90deg, #059669, #10b981, #22d3ee, #10b981)",
                  backgroundSize: "200% 100%",
                  animation: "gradientShift 3s linear infinite",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-sweep" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/60 blur-[1px]" />
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(110deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)",
                    animation: "stripeMove 1s linear infinite",
                  }}
                />
              </div>
              {progress > 5 && (
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#22d3ee] z-10"
                  style={{ left: `calc(${progress}% - 6px)`, transition: "left 0.15s linear" }}
                />
              )}
            </div>

            {/* Mirror */}
            <div className="h-2 w-full rounded-full mt-1 overflow-hidden opacity-10 blur-[2px] transform scale-y-[-1]">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${progress}%`, transition: "width 0.15s linear" }}
              />
            </div>
          </div>

          {/* Data readout */}
          <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-500 tracking-wider">
            <span>v2.0.25 · EAGLE_NEURAL_ENGINE</span>
            <span className="flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                progress === 100 ? "bg-emerald-400 shadow-[0_0_4px_#10b981]" : "bg-amber-400 animate-pulse"
              }`} />
              {progress === 100 ? "ALL SYSTEMS GO" : "PROCESSING"}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-8 transition-all duration-1000 delay-1000 ${phase >= 1 ? "opacity-50" : "opacity-0"}`}>
          <p className="text-[9px] font-mono tracking-[0.4em] text-slate-500 uppercase">
            Powered by Eagle AI · Advanced Agricultural Intelligence
          </p>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        /* Aurora */
        .aurora {
          position: absolute; width: 150%; height: 60%; border-radius: 50%; filter: blur(80px); opacity: 0.4;
        }
        .aurora-1 {
          top: -30%; left: -25%;
          background: radial-gradient(ellipse, rgba(16,185,129,0.3) 0%, transparent 70%);
          animation: auroraMove1 12s ease-in-out infinite;
        }
        .aurora-2 {
          top: -20%; right: -25%;
          background: radial-gradient(ellipse, rgba(34,211,238,0.2) 0%, transparent 70%);
          animation: auroraMove2 15s ease-in-out infinite;
        }
        .aurora-3 {
          bottom: -30%; left: 0;
          background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%);
          animation: auroraMove3 18s ease-in-out infinite;
        }
        @keyframes auroraMove1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(5%, 3%) rotate(5deg) scale(1.1); }
          66% { transform: translate(-3%, -2%) rotate(-3deg) scale(0.95); }
        }
        @keyframes auroraMove2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-8%, 5%) rotate(-8deg) scale(1.15); }
        }
        @keyframes auroraMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10%, -5%) scale(1.2); }
        }

        /* Particles */
        .particle-float {
          animation: particleRise linear infinite; pointer-events: none;
        }
        @keyframes particleRise {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(30px) scale(0.3); opacity: 0; }
        }

        /* Fireflies */
        .firefly {
          background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
          box-shadow: 0 0 8px #fbbf24, 0 0 20px rgba(251,191,36,0.3);
          pointer-events: none;
          animation: fireflyFloat ease-in-out infinite;
        }
        @keyframes fireflyFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          50% { transform: translate(40px, -60px) scale(1.5); opacity: 0.3; }
          80% { opacity: 0.7; }
          100% { transform: translate(-20px, -120px) scale(0.5); opacity: 0; }
        }

        /* Grid */
        .grid-container {
          perspective: 600px; overflow: hidden;
          mask-image: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3) 100%);
        }
        .perspective-grid {
          position: absolute; bottom: -60%; left: -50%; width: 200%; height: 100%;
          background-image:
            linear-gradient(rgba(16,185,129,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.12) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotateX(65deg);
          animation: gridScroll 25s linear infinite;
        }
        @keyframes gridScroll {
          0% { transform: rotateX(65deg) translateY(0); }
          100% { transform: rotateX(65deg) translateY(50px); }
        }

        /* Hex Pattern */
        .hex-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        /* Light Rays */
        .light-ray {
          position: absolute; width: 2px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(16,185,129,0.1), transparent);
          opacity: 0.5;
        }
        .ray-1 { left: 20%; animation: rayPulse 6s ease-in-out infinite; }
        .ray-2 { left: 50%; animation: rayPulse 8s ease-in-out infinite 2s; width: 3px; }
        .ray-3 { left: 80%; animation: rayPulse 7s ease-in-out infinite 4s; }
        @keyframes rayPulse {
          0%, 100% { opacity: 0; transform: scaleY(0.5); }
          50% { opacity: 0.3; transform: scaleY(1); }
        }

        /* Energy Rings */
        .energy-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(16,185,129,0.15);
        }
        .ring-1 {
          inset: -80px; animation: ringPulse 4s ease-in-out infinite;
        }
        .ring-2 {
          inset: -140px; animation: ringPulse 5s ease-in-out infinite 1s;
          border-color: rgba(34,211,238,0.1);
        }
        .ring-3 {
          inset: -200px; animation: ringPulse 6s ease-in-out infinite 2s;
          border-color: rgba(99,102,241,0.08);
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        /* Eagle Animations */
        .eagle-float {
          animation: eagleFloat 5s ease-in-out infinite;
        }
        @keyframes eagleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-8px) rotate(-0.5deg); }
          70% { transform: translateY(-4px) rotate(0.5deg); }
        }

        .eagle-shadow {
          animation: shadowPulse 5s ease-in-out infinite;
        }
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.2; }
          30% { transform: translateX(-50%) scaleX(0.85); opacity: 0.15; }
          70% { transform: translateX(-50%) scaleX(0.9); opacity: 0.18; }
        }

        .eagle-wing-left {
          animation: wingFlapLeft 3s ease-in-out infinite;
          transform-origin: 120px 140px;
        }
        .eagle-wing-right {
          animation: wingFlapRight 3s ease-in-out infinite;
          transform-origin: 280px 140px;
        }
        @keyframes wingFlapLeft {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          25% { transform: rotate(-8deg) scaleX(0.95); }
          50% { transform: rotate(5deg) scaleX(1.02); }
          75% { transform: rotate(-3deg) scaleX(0.98); }
        }
        @keyframes wingFlapRight {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          25% { transform: rotate(8deg) scaleX(0.95); }
          50% { transform: rotate(-5deg) scaleX(1.02); }
          75% { transform: rotate(3deg) scaleX(0.98); }
        }

        .eagle-eyes.eyes-off ellipse[fill="url(#eyeGlow)"] {
          opacity: 0.1 !important;
        }
        .eagle-eyes.eyes-on ellipse[fill="url(#eyeGlow)"] {
          transition: opacity 0.2s;
        }

        .platform-pulse {
          animation: platformGlow 2s ease-in-out infinite;
        }
        @keyframes platformGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .held-leaf {
          animation: leafSway 4s ease-in-out infinite;
          transform-origin: 240px 335px;
        }
        @keyframes leafSway {
          0%, 100% { transform: translate(240px, 335px) rotate(-20deg); }
          50% { transform: translate(240px, 335px) rotate(-15deg); }
        }

        /* AI Badge */
        .ai-badge-ring {
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .ai-badge-ring::before {
          content: ''; position: absolute; inset: -3px; border-radius: 50%; padding: 2px;
          background: conic-gradient(from 0deg, #10b981, #22d3ee, #6366f1, #f59e0b, #10b981);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: ringRotate 4s linear infinite;
        }
        .ai-badge {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; background: rgba(0,10,6,0.9); backdrop-filter: blur(10px);
          border: 1px solid rgba(16,185,129,0.2);
        }
        @keyframes ringRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Title Effects */
        .title-scanline {
          position: absolute; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent);
          animation: scanDown 3s linear infinite;
        }
        @keyframes scanDown { 0% { top: -10%; } 100% { top: 110%; } }

        .glitch-active .main-title {
          animation: glitch 150ms steps(2) infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
          50% { transform: translate(2px, -1px); }
          75% { transform: translate(-1px, -2px); filter: hue-rotate(-90deg); }
          100% { transform: translate(0); }
        }

        /* Progress */
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .shimmer-sweep { animation: shimmer 2s ease-in-out infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes stripeMove { 0% { transform: translateX(0); } 100% { transform: translateX(8px); } }

        /* Utilities */
        .animate-spin-slow { animation: spinSlow 3s linear infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
        @keyframes pulseSlow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .animate-ping-slow { animation: pingSlow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes pingSlow { 0% { transform: scale(1); opacity: 0.3; } 75%, 100% { transform: scale(1.3); opacity: 0; } }
        .animate-ping-slower { animation: pingSlow 4.5s cubic-bezier(0, 0, 0.2, 1) infinite 1s; }
      `}</style>
    </div>
  );
}

// --- Sub Components ---
const HoloBadge = ({ icon: Icon, label, color, delay }: { icon: any; label: string; color: string; delay: number }) => {
  const colorStyles: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/5", text: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
    blue: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
    indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/5", text: "text-indigo-400", glow: "shadow-[0_0_20px_rgba(99,102,241,0.15)]" },
  };
  const s = colorStyles[color];

  return (
    <div className="holo-badge-float" style={{ animationDelay: `${delay}ms`, animationDuration: "5s" }}>
      <div className={`relative flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-xl border backdrop-blur-xl ${s.border} ${s.bg} ${s.glow} transition-all duration-300`}>
        <Icon size={20} strokeWidth={1.5} className={s.text} />
        <span className={`text-[7px] font-mono font-bold tracking-widest ${s.text} opacity-70`}>{label}</span>
        <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l ${s.border} rounded-tl-md`} />
        <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r ${s.border} rounded-tr-md`} />
        <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l ${s.border} rounded-bl-md`} />
        <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r ${s.border} rounded-br-md`} />
      </div>
      <style>{`
        .holo-badge-float { animation: holoBadgeFloat 5s ease-in-out infinite; }
        @keyframes holoBadgeFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
};