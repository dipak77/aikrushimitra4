import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, RefreshCw, Mic, MicOff, MessageSquare, Wifi, WifiOff, Zap } from 'lucide-react';
import { decode, decodeAudioData, createPCMChunk } from '../../utils/audio';
import { triggerHaptic } from '../../utils/common';
import { clsx } from 'clsx';

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline';
type Transcript = { role: 'user' | 'model'; text: string; id: string };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  saturation: number;
  type: 'spark' | 'ember' | 'orbit';
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface Lightning {
  segments: { x: number; y: number }[];
  life: number;
  maxLife: number;
  intensity: number;
  thickness: number;
  hue: number;
}

/* ────────────────────────────────────────────────────────────────
   Design Tokens
   ──────────────────────────────────────────────────────────────── */

const COLORS = {
  primary: { h: 190, s: 95, l: 55 },      // Cyan
  secondary: { h: 220, s: 85, l: 60 },     // Blue
  accent: { h: 160, s: 80, l: 50 },        // Teal
  warm: { h: 35, s: 90, l: 60 },           // Amber
  danger: { h: 0, s: 75, l: 55 },          // Red
  surface: 'rgba(8, 12, 24, 0.95)',
} as const;

const STATUS_CONFIG: Record<Status, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon?: React.ComponentType<any>;
  pulse?: boolean;
}> = {
  idle: {
    label: 'Ready',
    color: 'text-slate-300',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
  connecting: {
    label: 'Connecting',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    pulse: true,
  },
  connected: {
    label: 'Listening',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    pulse: true,
  },
  reconnecting: {
    label: 'Reconnecting',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    pulse: true,
  },
  error: {
    label: 'Error',
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
  },
  offline: {
    label: 'Offline',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: WifiOff,
  },
};

const MAX_PARTICLES = 80;
const MAX_LIGHTNING = 6;
const MAX_RETRIES = 5;
const RECONNECT_BASE_DELAY = 1000;

/* ────────────────────────────────────────────────────────────────
   Utility
   ──────────────────────────────────────────────────────────────── */

const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const rmsByte = (arr: Uint8Array) => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = (arr[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / arr.length);
};

const bandEnergy = (freq: Uint8Array, start: number, end: number) => {
  let sum = 0;
  const e = Math.min(end, freq.length - 1);
  for (let i = start; i <= e; i++) sum += freq[i];
  return sum / ((e - start + 1) * 255);
};

/* ────────────────────────────────────────────────────────────────
   Canvas Orb Renderer (extracted for clarity)
   ──────────────────────────────────────────────────────────────── */

class OrbRenderer {
  private particles: Particle[] = [];
  private lightning: Lightning[] = [];
  private time = 0;
  private inEnv = 0;
  private outEnv = 0;
  private bassEnv = 0;
  private midEnv = 0;
  private trebleEnv = 0;
  private peakEnv = 0;
  private peakVel = 0;
  private energy = 0;
  private lastTimestamp = 0;

  // Pre-allocated typed arrays
  private inTime: Uint8Array | null = null;
  private outTime: Uint8Array | null = null;
  private inFreq: Uint8Array | null = null;
  private outFreq: Uint8Array | null = null;

  // Offscreen canvas for glow effects (avoids shadowBlur)
  private glowCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  private glowCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

  reset() {
    this.particles = [];
    this.lightning = [];
    this.time = 0;
    this.inEnv = this.outEnv = this.bassEnv = this.midEnv = this.trebleEnv = 0;
    this.peakEnv = this.peakVel = this.energy = 0;
    this.lastTimestamp = 0;
  }

  private ensureBuffers(analyser: AnalyserNode) {
    const fft = analyser.fftSize;
    const bins = analyser.frequencyBinCount;
    if (!this.inTime || this.inTime.length !== fft) {
      this.inTime = new Uint8Array(fft);
      this.outTime = new Uint8Array(fft);
      this.inFreq = new Uint8Array(bins);
      this.outFreq = new Uint8Array(bins);
    }
  }

  private ensureGlowCanvas(w: number, h: number) {
    if (this.glowCanvas) return;
    try {
      this.glowCanvas = new OffscreenCanvas(w, h);
      this.glowCtx = this.glowCanvas.getContext('2d');
    } catch {
      // Fallback for Safari
      this.glowCanvas = document.createElement('canvas');
      this.glowCanvas.width = w;
      this.glowCanvas.height = h;
      this.glowCtx = this.glowCanvas.getContext('2d');
    }
  }

  private updateEnvelopes(
    inputAnalyser: AnalyserNode | null,
    outputAnalyser: AnalyserNode | null,
    dt: number
  ) {
    if (!this.inTime || !this.outTime || !this.inFreq || !this.outFreq) return;

    const attackRate = 1 - Math.exp(-dt * 30);
    const releaseRate = 1 - Math.exp(-dt * 8);

    let inRMS = 0, outRMS = 0;

    if (inputAnalyser) {
      inputAnalyser.getByteTimeDomainData(this.inTime);
      inputAnalyser.getByteFrequencyData(this.inFreq);
      inRMS = clamp(rmsByte(this.inTime) * 3.5);
    }

    if (outputAnalyser) {
      outputAnalyser.getByteTimeDomainData(this.outTime);
      outputAnalyser.getByteFrequencyData(this.outFreq);
      outRMS = clamp(rmsByte(this.outTime) * 3.5);
    }

    this.inEnv = lerp(this.inEnv, inRMS, inRMS > this.inEnv ? attackRate : releaseRate);
    this.outEnv = lerp(this.outEnv, outRMS, outRMS > this.outEnv ? attackRate : releaseRate);

    const freqData = this.outEnv > this.inEnv ? this.outFreq : this.inFreq;
    const bins = freqData.length;

    const bassT = bandEnergy(freqData, 2, Math.min(24, bins - 1));
    const midT = bandEnergy(freqData, 24, Math.min(200, bins - 1));
    const trebT = bandEnergy(freqData, 200, Math.min(800, bins - 1));

    const smoothRate = 1 - Math.exp(-dt * 18);
    this.bassEnv = lerp(this.bassEnv, bassT, smoothRate);
    this.midEnv = lerp(this.midEnv, midT, smoothRate);
    this.trebleEnv = lerp(this.trebleEnv, trebT, smoothRate);

    this.energy = Math.max(this.inEnv, this.outEnv);

    // Peak with spring physics
    const peakTarget = Math.max(this.peakEnv, this.energy);
    this.peakVel += (peakTarget - this.peakEnv) * 0.3;
    this.peakVel *= 0.75;
    this.peakEnv += this.peakVel;
    this.peakEnv *= 0.985;
  }

  private spawnParticles(cx: number, cy: number, radius: number) {
    if (this.particles.length >= MAX_PARTICLES) return;

    const spawnRate = 0.3 + this.energy * 0.7;
    if (Math.random() > spawnRate) return;

    const count = Math.floor(1 + this.energy * 3);

    for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      const type = Math.random() > 0.7 ? 'ember' : Math.random() > 0.5 ? 'orbit' : 'spark';

      const hue = type === 'ember'
        ? COLORS.warm.h + Math.random() * 20
        : COLORS.primary.h + Math.random() * 40 - 20;

      if (type === 'orbit') {
        this.particles.push({
          x: cx, y: cy,
          vx: 0, vy: 0,
          life: 1,
          maxLife: 1.5 + Math.random() * 2,
          size: 1.5 + Math.random() * 2,
          hue,
          saturation: 80 + Math.random() * 20,
          type,
          angle: Math.random() * Math.PI * 2,
          orbitRadius: radius + 5 + Math.random() * 30,
          orbitSpeed: 0.3 + Math.random() * 0.8,
        });
      } else {
        const speed = 0.3 + Math.random() * 1.5 + this.energy * 2;
        const dist = radius + Math.random() * 15;
        this.particles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 1,
          maxLife: 0.4 + Math.random() * 1,
          size: 1 + Math.random() * 2.5 + this.energy * 1.5,
          hue,
          saturation: 70 + Math.random() * 30,
          type,
          angle: 0,
          orbitRadius: 0,
          orbitSpeed: 0,
        });
      }
    }
  }

  private spawnLightning(cx: number, cy: number, radius: number) {
    if (this.lightning.length >= MAX_LIGHTNING) return;

    // Only spawn on energy spikes
    const threshold = 0.08 + this.energy * 0.2;
    if (Math.random() > threshold) return;

    const startAngle = Math.random() * Math.PI * 2;
    const spread = (Math.random() - 0.5) * Math.PI * 0.6;
    const endAngle = startAngle + spread;
    const reach = 15 + Math.random() * 35 + this.energy * 20;

    const sx = cx + Math.cos(startAngle) * radius;
    const sy = cy + Math.sin(startAngle) * radius;
    const ex = cx + Math.cos(endAngle) * (radius + reach);
    const ey = cy + Math.sin(endAngle) * (radius + reach);

    const segCount = 6 + Math.floor(Math.random() * 4);
    const jitter = 5 + this.energy * 12;
    const segments: { x: number; y: number }[] = [{ x: sx, y: sy }];

    for (let i = 1; i < segCount; i++) {
      const t = i / segCount;
      segments.push({
        x: sx + (ex - sx) * t + (Math.random() - 0.5) * jitter,
        y: sy + (ey - sy) * t + (Math.random() - 0.5) * jitter,
      });
    }
    segments.push({ x: ex, y: ey });

    this.lightning.push({
      segments,
      life: 1,
      maxLife: 0.12 + Math.random() * 0.18,
      intensity: 0.6 + this.energy * 0.4,
      thickness: 1 + Math.random() * 1.5 + this.energy * 1.5,
      hue: COLORS.primary.h + Math.random() * 30 - 15,
    });
  }

  private updateParticles(dt: number, cx: number, cy: number) {
    this.particles = this.particles.filter(p => {
      p.life -= dt / p.maxLife;
      if (p.life <= 0) return false;

      if (p.type === 'orbit') {
        p.angle += p.orbitSpeed * dt;
        const wobble = Math.sin(this.time * 3 + p.angle * 2) * this.energy * 8;
        p.x = cx + Math.cos(p.angle) * (p.orbitRadius + wobble);
        p.y = cy + Math.sin(p.angle) * (p.orbitRadius + wobble);
      } else {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vy += 0.02 * dt * 60; // Gentle gravity
        p.vx *= 0.995;
        p.vy *= 0.995;
      }
      return true;
    });
  }

  private updateLightning(dt: number) {
    this.lightning = this.lightning.filter(l => {
      l.life -= dt / l.maxLife;
      return l.life > 0;
    });
  }

  /* ── Drawing Methods ─────────────────────────────────────────── */

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Soft fade (preserves trails)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(4, 8, 16, ${0.18 + (1 - this.energy) * 0.12})`;
    ctx.fillRect(0, 0, w, h);
  }

  private drawAmbientGlow(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    radius: number
  ) {
    // Outer ambient
    const ambientSize = radius * (2.2 + this.energy * 0.8);
    const ambient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, ambientSize);
    ambient.addColorStop(0, `hsla(${COLORS.primary.h}, 90%, 60%, ${0.03 + this.energy * 0.06})`);
    ambient.addColorStop(0.4, `hsla(${COLORS.secondary.h}, 80%, 50%, ${0.02 + this.energy * 0.04})`);
    ambient.addColorStop(0.7, `hsla(${COLORS.accent.h}, 70%, 40%, ${0.01 + this.energy * 0.02})`);
    ambient.addColorStop(1, 'transparent');

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = ambient;
    ctx.fillRect(cx - ambientSize, cy - ambientSize, ambientSize * 2, ambientSize * 2);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawOrb(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    radius: number
  ) {
    const segments = 120;
    const angleStep = (Math.PI * 2) / segments;

    // Build path once
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep + this.time * 0.25;

      // Multi-frequency noise
      const n1 = Math.sin(angle * 3 + this.time * 2.5) * (3 + this.bassEnv * 10);
      const n2 = Math.sin(angle * 7 + this.time * 4) * (1.5 + this.trebleEnv * 5);
      const n3 = Math.sin(angle * 5 - this.time * 1.8) * (2 + this.midEnv * 4);
      const breathe = Math.sin(this.time * 0.8) * 3;

      const r = radius + n1 + n2 + n3 + breathe + this.energy * 8;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    const makePath = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
    };

    // Layer 1: Wide outer glow (no shadowBlur — use gradient stroke)
    ctx.globalCompositeOperation = 'screen';
    makePath();
    const outerGrad = ctx.createRadialGradient(cx, cy, radius - 20, cx, cy, radius + 50);
    outerGrad.addColorStop(0, 'transparent');
    outerGrad.addColorStop(0.3, `hsla(${COLORS.primary.h}, 90%, 55%, ${0.08 + this.energy * 0.15})`);
    outerGrad.addColorStop(0.6, `hsla(${COLORS.primary.h}, 85%, 65%, ${0.15 + this.energy * 0.2})`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = outerGrad;
    ctx.lineWidth = 20 + this.energy * 25;
    ctx.stroke();

    // Layer 2: Mid glow
    makePath();
    const midGrad = ctx.createRadialGradient(cx, cy, radius - 10, cx, cy, radius + 25);
    midGrad.addColorStop(0, 'transparent');
    midGrad.addColorStop(0.5, `hsla(${COLORS.primary.h}, 95%, 70%, ${0.3 + this.energy * 0.3})`);
    midGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = midGrad;
    ctx.lineWidth = 8 + this.energy * 12;
    ctx.stroke();

    // Layer 3: Core ring
    ctx.globalCompositeOperation = 'source-over';
    makePath();
    ctx.strokeStyle = `hsla(${COLORS.primary.h}, 90%, 85%, ${0.7 + this.energy * 0.3})`;
    ctx.lineWidth = 2.5 + this.energy * 3;
    ctx.stroke();

    // Layer 4: White-hot core
    makePath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + this.energy * 0.4})`;
    ctx.lineWidth = 1 + this.energy * 1.5;
    ctx.stroke();

    // Inner fill glow
    makePath();
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    innerGrad.addColorStop(0, `hsla(${COLORS.primary.h}, 80%, 60%, ${0.04 + this.energy * 0.08})`);
    innerGrad.addColorStop(0.6, `hsla(${COLORS.secondary.h}, 70%, 50%, ${0.02 + this.energy * 0.04})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.fill();
  }

  private drawLightning(ctx: CanvasRenderingContext2D) {
    ctx.globalCompositeOperation = 'screen';

    for (const l of this.lightning) {
      const alpha = l.life * l.intensity;
      if (alpha < 0.01) continue;

      // Glow pass
      ctx.beginPath();
      ctx.moveTo(l.segments[0].x, l.segments[0].y);
      for (let i = 1; i < l.segments.length; i++) {
        ctx.lineTo(l.segments[i].x, l.segments[i].y);
      }
      ctx.strokeStyle = `hsla(${l.hue}, 90%, 70%, ${alpha * 0.3})`;
      ctx.lineWidth = l.thickness * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Core pass
      ctx.beginPath();
      ctx.moveTo(l.segments[0].x, l.segments[0].y);
      for (let i = 1; i < l.segments.length; i++) {
        ctx.lineTo(l.segments[i].x, l.segments[i].y);
      }
      ctx.strokeStyle = `hsla(${l.hue}, 60%, 95%, ${alpha * 0.9})`;
      ctx.lineWidth = l.thickness;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    ctx.globalCompositeOperation = 'screen';

    for (const p of this.particles) {
      const alpha = clamp(p.life);
      const size = p.size * (0.5 + p.life * 0.5);
      if (alpha < 0.01 || size < 0.5) continue;

      if (p.type === 'ember') {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 75%, ${alpha * 0.8})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, ${p.saturation}%, 55%, ${alpha * 0.4})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 80%, ${alpha * 0.7})`);
        grad.addColorStop(0.5, `hsla(${p.hue}, ${p.saturation}%, 70%, ${alpha * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `hsla(0, 0%, 100%, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── Main Render Loop ────────────────────────────────────────── */

  render(
    ctx: CanvasRenderingContext2D,
    w: number, h: number,
    timestamp: number,
    inputAnalyser: AnalyserNode | null,
    outputAnalyser: AnalyserNode | null,
    isActive: boolean
  ) {
    // Proper delta time
    const dt = this.lastTimestamp > 0
      ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.05) // Cap at 50ms
      : 0.016;
    this.lastTimestamp = timestamp;
    this.time += dt;

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;

    // Update audio envelopes
    if (inputAnalyser) this.ensureBuffers(inputAnalyser);
    if (isActive) {
      this.updateEnvelopes(inputAnalyser, outputAnalyser, dt);
    } else {
      // Gentle idle breathing
      this.energy = lerp(this.energy, 0, 1 - Math.exp(-dt * 3));
      this.bassEnv = lerp(this.bassEnv, Math.sin(this.time * 0.5) * 0.05 + 0.05, dt * 2);
      this.midEnv = lerp(this.midEnv, Math.sin(this.time * 0.7) * 0.03, dt * 2);
      this.trebleEnv = lerp(this.trebleEnv, 0, dt * 3);
    }

    // Spawn effects
    if (isActive) {
      this.spawnParticles(cx, cy, radius);
      this.spawnLightning(cx, cy, radius);
    } else if (Math.random() < 0.02) {
      // Occasional idle particles
      this.spawnParticles(cx, cy, radius);
    }

    // Update
    this.updateParticles(dt, cx, cy);
    this.updateLightning(dt);

    // Draw
    this.drawBackground(ctx, w, h);
    this.drawAmbientGlow(ctx, cx, cy, radius);
    this.drawOrb(ctx, cx, cy, radius);
    this.drawLightning(ctx);
    this.drawParticles(ctx);
  }
}

/* ────────────────────────────────────────────────────────────────
   PCM Worklet URL (created once)
   ──────────────────────────────────────────────────────────────── */

let workletUrlCache: string | null = null;

function getWorkletUrl() {
  if (workletUrlCache) return workletUrlCache;
  const code = `
    class PCMForwarder extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs?.[0]?.[0];
        if (ch?.length) {
          const copy = new Float32Array(ch.length);
          copy.set(ch);
          this.port.postMessage(copy, [copy.buffer]);
        }
        return true;
      }
    }
    registerProcessor('pcm-forwarder', PCMForwarder);
  `;
  workletUrlCache = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return workletUrlCache;
}

/* ────────────────────────────────────────────────────────────────
   Float32 → Base64 (direct, no FileReader)
   ──────────────────────────────────────────────────────────────── */

function float32ToBase64(f32: Float32Array): string {
  const int16 = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/* ────────────────────────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────────────────────────── */

const VoiceAssistant = ({
  lang,
  user,
  onBack,
}: {
  lang: Language;
  user: UserProfile;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const shouldStayRef = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const retryCount = useRef(0);

  const wsRef = useRef<WebSocket | null>(null);
  const setupDone = useRef(false);

  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const outGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextPlayTime = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbAreaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef(new OrbRenderer());

  // Scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Network listeners
  useEffect(() => {
    const onOffline = () => {
      if (shouldStayRef.current) setStatus('offline');
    };
    const onOnline = () => {
      if (shouldStayRef.current && (status === 'offline' || status === 'error')) {
        connect();
      }
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [status]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = orbAreaRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x
      const rect = wrapper.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);

      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Idle animation loop (always running when mounted)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;

      const w = canvas.width / (Math.min(window.devicePixelRatio, 2) || 1);
      const h = canvas.height / (Math.min(window.devicePixelRatio, 2) || 1);

      const isActive = status === 'connected';

      rendererRef.current.render(
        ctx, w, h, timestamp,
        isActive ? inputAnalyserRef.current : null,
        isActive ? outputAnalyserRef.current : null,
        isActive,
      );

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [status]);

  /* ── Cleanup ─────────────────────────────────────────────────── */

  const cleanup = useCallback((fullyStop = false) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    if (wsRef.current) {
      try {
        wsRef.current.onopen = wsRef.current.onclose = wsRef.current.onmessage = wsRef.current.onerror = null;
        wsRef.current.close();
      } catch { /* ignore */ }
      wsRef.current = null;
    }

    setupDone.current = false;

    [workletRef, muteGainRef, outGainRef, compressorRef].forEach(ref => {
      if (ref.current) {
        try {
          if ('port' in ref.current) (ref.current as AudioWorkletNode).port.onmessage = null;
          ref.current.disconnect();
        } catch { /* ignore */ }
        ref.current = null;
      }
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    [inputCtxRef, outputCtxRef].forEach(ref => {
      if (ref.current) {
        ref.current.close().catch(() => {});
        ref.current = null;
      }
    });

    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;

    if (fullyStop) {
      shouldStayRef.current = false;
      setStatus('idle');
      setIsSpeaking(false);
      rendererRef.current.reset();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => cleanup(true), [cleanup]);

  /* ── Reconnect ──────────────────────────────────────────────── */

  const handleReconnect = useCallback(() => {
    if (!shouldStayRef.current) return;
    if (retryCount.current >= MAX_RETRIES) {
      setStatus('error');
      setErrorMessage(lang === 'mr' ? 'नेटवर्क अस्थिर. कृपया पुन्हा प्रयत्न करा.' : 'Network unstable. Please try again.');
      shouldStayRef.current = false;
      return;
    }

    setStatus('reconnecting');
    const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, retryCount.current), 10000);
    reconnectTimer.current = setTimeout(() => {
      retryCount.current++;
      connect();
    }, delay);
  }, [lang]);

  /* ── Connect ────────────────────────────────────────────────── */

  const connect = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    cleanup(false);
    shouldStayRef.current = true;
    setErrorMessage('');
    setStatus(retryCount.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      if (!shouldStayRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;

      const ACClass = window.AudioContext || (window as any).webkitAudioContext;

      // Input context (16kHz for speech)
      const inCtx = new ACClass({ sampleRate: 16000 });
      await inCtx.resume();
      inputCtxRef.current = inCtx;

      // Output context (24kHz for Gemini TTS)
      const outCtx = new ACClass({ sampleRate: 24000 });
      await outCtx.resume();
      outputCtxRef.current = outCtx;
      nextPlayTime.current = outCtx.currentTime;

      // Analysers
      const inAnalyser = inCtx.createAnalyser();
      inAnalyser.fftSize = 2048;
      inAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inAnalyser;

      const outAnalyser = outCtx.createAnalyser();
      outAnalyser.fftSize = 2048;
      outAnalyser.smoothingTimeConstant = 0.8;
      outputAnalyserRef.current = outAnalyser;

      // Output chain: compressor → gain → analyser → destination
      const comp = outCtx.createDynamicsCompressor();
      comp.threshold.value = -24;
      comp.knee.value = 20;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      compressorRef.current = comp;

      const outGain = outCtx.createGain();
      outGain.gain.value = 2.5;
      outGainRef.current = outGain;

      comp.connect(outGain).connect(outAnalyser).connect(outCtx.destination);

      // Input chain: source → analyser, source → worklet → mute → destination
      const source = inCtx.createMediaStreamSource(stream);
      const mute = inCtx.createGain();
      mute.gain.value = 0;
      muteGainRef.current = mute;

      await inCtx.audioWorklet.addModule(getWorkletUrl());
      const worklet = new AudioWorkletNode(inCtx, 'pcm-forwarder');
      workletRef.current = worklet;

      source.connect(inAnalyser);
      source.connect(worklet);
      worklet.connect(mute).connect(inCtx.destination);

      // WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        const history = transcripts.slice(-8);
        let contextStr = '';
        if (history.length > 0) {
          contextStr = '\n\n[CONVERSATION CONTEXT]:';
          history.forEach(h => {
            contextStr += `\n${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`;
          });
        }

        const systemPrompt = `You are AI Krushi Mitra (कृषी मित्र), an expert agricultural voice assistant for Indian farmers. Speak naturally in ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}. Keep responses concise, practical, and encouraging. Use simple language.${contextStr}`;

        ws.send(JSON.stringify({
          type: 'setup',
          config: {
            voiceName: 'Puck',
            systemInstruction: systemPrompt,
            enableInputTranscription: true,
            enableOutputTranscription: true,
          },
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setErrorMessage(msg.message || 'Connection error');
            setStatus('error');
            return;
          }

          if (msg.type === 'setup_complete') {
            setupDone.current = true;
            retryCount.current = 0;
            setStatus('connected');
            triggerHaptic();
            return;
          }

          // Audio playback
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && outputCtxRef.current && compressorRef.current) {
            const ctx = outputCtxRef.current;
            const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.connect(compressorRef.current);

            const now = ctx.currentTime;
            if (nextPlayTime.current < now) nextPlayTime.current = now;
            src.start(nextPlayTime.current);
            nextPlayTime.current += buffer.duration;
            setIsSpeaking(true);
            src.onended = () => setIsSpeaking(false);
          }

          // Transcripts
          const userText = msg.serverContent?.inputTranscription?.text;
          if (userText?.trim()) {
            setTranscripts(prev => [...prev, { role: 'user', text: userText.trim(), id: uid() }]);
          }

          const modelText = msg.serverContent?.outputTranscription?.text;
          if (modelText?.trim()) {
            setTranscripts(prev => [...prev, { role: 'model', text: modelText.trim(), id: uid() }]);
          }
        } catch (e) {
          console.error('Message parse error:', e);
        }
      };

      ws.onerror = () => {
        setErrorMessage('Connection error');
        if (shouldStayRef.current) handleReconnect();
      };

      ws.onclose = (e) => {
        setupDone.current = false;
        if (shouldStayRef.current && e.code !== 1000) {
          handleReconnect();
        } else if (!shouldStayRef.current) {
          setStatus('idle');
        }
      };

      // Send audio — direct base64, no FileReader
      worklet.port.onmessage = (evt: MessageEvent) => {
        const chunk = evt.data as Float32Array;
        if (!chunk || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !setupDone.current) return;

        try {
          const base64 = float32ToBase64(chunk);
          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              media: { mimeType: 'audio/pcm', data: base64 },
            },
          }));
        } catch { /* ignore send errors */ }
      };
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to connect');
      setStatus('error');
    }
  }, [cleanup, handleReconnect, transcripts, lang]);

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleToggle = useCallback(() => {
    triggerHaptic();
    if (status === 'idle' || status === 'error' || status === 'offline') {
      if (status !== 'error') setTranscripts([]);
      connect();
    } else {
      cleanup(true);
    }
  }, [status, connect, cleanup]);

  const handleBack = useCallback(() => {
    cleanup(true);
    onBack();
  }, [cleanup, onBack]);

  /* ── Derived State ──────────────────────────────────────────── */

  const statusConfig = STATUS_CONFIG[status];
  const isActive = status === 'connected';
  const isLoading = status === 'connecting' || status === 'reconnecting';
  const hasTranscripts = transcripts.length > 0;

  const titleText = useMemo(() => {
    if (isActive) return isSpeaking
      ? (lang === 'mr' ? 'बोलतोय...' : lang === 'hi' ? 'बोल रहा हूँ...' : 'Speaking...')
      : (lang === 'mr' ? 'मी ऐकतोय...' : lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...');
    if (status === 'idle') return t.voice_title;
    if (status === 'error') return lang === 'mr' ? 'कनेक्शन एरर' : 'Connection Error';
    if (status === 'offline') return lang === 'mr' ? 'इंटरनेट नाही' : 'No Internet';
    return lang === 'mr' ? 'कनेक्ट होत आहे...' : 'Connecting...';
  }, [status, isSpeaking, lang, t.voice_title]);

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col h-[100dvh] w-full overflow-hidden"
      style={{ background: '#040810' }}
    >
      {/* ── Scoped Styles ── */}
      <style>{`
        @keyframes va-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes va-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes va-pulse-dot {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes va-bar-pulse {
          0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes va-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes va-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .va-shimmer-text {
          background: linear-gradient(
            90deg,
            hsla(190, 90%, 70%, 0.5) 0%,
            hsla(0, 0%, 100%, 0.95) 50%,
            hsla(190, 90%, 70%, 0.5) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: va-shimmer 3.5s linear infinite;
        }

        .va-transcript-mask {
          mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .va-shimmer-text { animation: none; }
          * { animation-duration: 0s !important; }
        }
      `}</style>

      {/* ── Background Layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 30%,
                hsla(${COLORS.primary.h}, 50%, 8%, 1) 0%,
                hsla(220, 30%, 3%, 1) 50%,
                #040810 100%
              )
            `,
          }}
        />

        {/* Dot matrix */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1.5px 1.5px,
                hsla(${COLORS.primary.h}, 60%, 40%, 0.15) 1px,
                transparent 0
              )
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient light shift */}
        <div
          className="absolute inset-0"
          style={{
            background: isActive
              ? `radial-gradient(ellipse 60% 50% at 50% 35%,
                  hsla(${isSpeaking ? COLORS.accent.h : COLORS.primary.h}, 60%, 15%, 0.15) 0%,
                  transparent 70%
                )`
              : 'none',
            transition: 'background 1s ease',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        className="relative z-50 flex items-center justify-between px-4 pt-4 pb-3"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          background: 'linear-gradient(180deg, rgba(4,8,16,0.9) 0%, transparent 100%)',
        }}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-full",
            "bg-white/[0.06] border border-white/[0.08]",
            "backdrop-blur-xl",
            "hover:bg-white/[0.1] active:scale-95",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
          )}
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-white/80" strokeWidth={2.2} />
          <span className="text-sm font-medium text-white/70 pr-1">
            {lang === 'mr' ? 'मागे' : 'Back'}
          </span>
        </button>

        {/* Status pill */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-full",
            "border backdrop-blur-xl",
            "transition-all duration-500",
            statusConfig.bg,
            statusConfig.border,
          )}
        >
          {/* Status dot */}
          <span className="relative flex h-2 w-2">
            {statusConfig.pulse && (
              <span
                className={clsx(
                  "absolute inset-0 rounded-full",
                  status === 'connected' ? 'bg-emerald-400' : 'bg-cyan-400',
                )}
                style={{ animation: 'va-pulse-dot 1.5s ease-in-out infinite' }}
              />
            )}
            <span
              className={clsx(
                "relative inline-flex rounded-full h-2 w-2",
                status === 'connected' ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-slate-400',
              )}
              style={{
                boxShadow: status === 'connected'
                  ? '0 0 8px rgba(52,211,153,0.8)'
                  : status === 'error'
                  ? '0 0 8px rgba(248,113,113,0.8)'
                  : 'none',
              }}
            />
          </span>

          <span className={clsx("text-[11px] font-semibold uppercase tracking-wider", statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center relative z-10">

        {/* ── Orb Area ── */}
        <div
          ref={orbAreaRef}
          className="w-full flex items-center justify-center relative"
          style={{
            height: hasTranscripts ? '240px' : '320px',
            transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <button
            onClick={handleToggle}
            className={clsx(
              "relative flex items-center justify-center",
              "w-full max-w-[380px] aspect-square",
              "cursor-pointer select-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:rounded-full",
              "transition-transform duration-200",
              "active:scale-[0.97]",
            )}
            aria-label={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
          >
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
            />

            {/* Center overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {status === 'idle' ? (
                <div
                  className="flex flex-col items-center gap-3"
                  style={{ animation: 'va-breathe 2.5s ease-in-out infinite' }}
                >
                  <div
                    className="w-18 h-18 rounded-full flex items-center justify-center"
                    style={{
                      width: '72px',
                      height: '72px',
                      background: `linear-gradient(135deg,
                        hsla(${COLORS.primary.h}, 80%, 50%, 0.2) 0%,
                        hsla(${COLORS.secondary.h}, 70%, 40%, 0.15) 100%
                      )`,
                      border: `1.5px solid hsla(${COLORS.primary.h}, 80%, 60%, 0.3)`,
                      boxShadow: `0 0 40px hsla(${COLORS.primary.h}, 80%, 50%, 0.25)`,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Mic
                      size={32}
                      className="text-cyan-300"
                      strokeWidth={2.2}
                      style={{ filter: `drop-shadow(0 0 12px hsla(${COLORS.primary.h}, 90%, 60%, 0.6))` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-300/70">
                    {lang === 'mr' ? 'सुरू करा' : 'Tap to Start'}
                  </span>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw
                    size={40}
                    className="text-cyan-400"
                    strokeWidth={2}
                    style={{
                      animation: 'va-spin-slow 1.5s linear infinite',
                      filter: `drop-shadow(0 0 20px hsla(${COLORS.primary.h}, 90%, 60%, 0.5))`,
                    }}
                  />
                  <span className="text-xs font-medium text-cyan-300/60">
                    {status === 'reconnecting'
                      ? `Retry ${retryCount.current}/${MAX_RETRIES}`
                      : (lang === 'mr' ? 'कनेक्ट होत आहे...' : 'Connecting...')}
                  </span>
                </div>
              ) : status === 'connected' ? (
                <div className="flex flex-col items-center gap-3">
                  {/* AI Identity */}
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg,
                        hsla(${COLORS.primary.h}, 70%, 40%, 0.15) 0%,
                        hsla(${COLORS.secondary.h}, 60%, 30%, 0.1) 100%
                      )`,
                      border: `1.5px solid hsla(${COLORS.primary.h}, 70%, 55%, 0.25)`,
                      boxShadow: `
                        0 0 50px hsla(${COLORS.primary.h}, 80%, 50%, ${isSpeaking ? 0.35 : 0.2}),
                        inset 0 0 30px hsla(${COLORS.primary.h}, 80%, 50%, 0.05)
                      `,
                      backdropFilter: 'blur(16px)',
                      transition: 'box-shadow 0.5s ease',
                    }}
                  >
                    {/* Rotating accent ring */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: `conic-gradient(
                          from 0deg,
                          transparent 0%,
                          hsla(${COLORS.primary.h}, 80%, 60%, ${isSpeaking ? 0.15 : 0.05}) 25%,
                          transparent 50%,
                          hsla(${COLORS.accent.h}, 70%, 50%, ${isSpeaking ? 0.1 : 0.03}) 75%,
                          transparent 100%
                        )`,
                        animation: 'va-spin-slow 6s linear infinite',
                      }}
                    />

                    <span
                      className="relative text-3xl font-black tracking-tight"
                      style={{
                        background: `linear-gradient(135deg,
                          hsla(${COLORS.primary.h}, 80%, 80%, 1) 0%,
                          white 50%,
                          hsla(${COLORS.secondary.h}, 70%, 75%, 1) 100%
                        )`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: `drop-shadow(0 0 16px hsla(0, 0%, 100%, 0.5))`,
                      }}
                    >
                      AI
                    </span>
                  </div>

                  {/* Brand name */}
                  <h1 className="text-2xl font-black leading-none va-shimmer-text">
                    कृषी मित्र
                  </h1>

                  {/* Audio bars */}
                  <div className="flex items-end gap-[3px] h-5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-[3px] rounded-full origin-bottom"
                        style={{
                          height: '100%',
                          background: `linear-gradient(to top,
                            hsla(${COLORS.primary.h}, 80%, 55%, 0.8),
                            hsla(${COLORS.primary.h}, 90%, 75%, 0.9)
                          )`,
                          boxShadow: `0 0 6px hsla(${COLORS.primary.h}, 80%, 55%, 0.4)`,
                          animation: `va-bar-pulse ${0.8 + i * 0.15}s ease-in-out ${i * 0.08}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : status === 'offline' ? (
                <div className="flex flex-col items-center gap-3">
                  <WifiOff size={36} className="text-amber-400/70" strokeWidth={2} />
                  <span className="text-xs font-medium text-amber-300/60 uppercase tracking-wider">
                    {lang === 'mr' ? 'ऑफलाइन' : 'Offline'}
                  </span>
                </div>
              ) : (
                /* Error */
                <div className="flex flex-col items-center gap-2">
                  <MicOff
                    size={36}
                    className="text-red-400/70"
                    strokeWidth={2}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(248,113,113,0.4))' }}
                  />
                  <span className="text-xs font-medium text-red-300/60 uppercase tracking-wider">
                    {lang === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Tap to Retry'}
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* ── Title + Error ── */}
        <div className="w-full px-6 flex flex-col items-center mt-2">
          <h2
            className="text-xl font-bold text-center tracking-tight"
            style={{
              color: isActive
                ? `hsla(${isSpeaking ? COLORS.accent.h : COLORS.primary.h}, 80%, 80%, 0.95)`
                : 'hsla(210, 20%, 80%, 0.8)',
              textShadow: isActive
                ? `0 0 30px hsla(${COLORS.primary.h}, 80%, 50%, 0.4)`
                : 'none',
              transition: 'color 0.4s ease, text-shadow 0.4s ease',
            }}
          >
            {titleText}
          </h2>

          {status === 'error' && errorMessage && (
            <div
              className="mt-3 text-xs text-red-300/90 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl backdrop-blur-md"
              style={{ animation: 'va-fade-up 0.3s ease-out' }}
            >
              {errorMessage}
            </div>
          )}
        </div>

        {/* ── Hint Cards ── */}
        {(status === 'idle' || (isActive && transcripts.length < 2)) && (
          <div
            className="w-full max-w-[340px] flex flex-col gap-2.5 mt-6 px-6"
            style={{ animation: 'va-fade-up 0.5s ease-out' }}
          >
            {t.voice_hints?.slice(0, 3).map((hint: string, i: number) => (
              <div
                key={i}
                className={clsx(
                  "w-full px-4 py-3 rounded-2xl",
                  "bg-white/[0.04] border border-white/[0.06]",
                  "backdrop-blur-md",
                  "text-sm font-medium text-white/60",
                  "flex items-center gap-3",
                  "hover:bg-white/[0.07] hover:text-white/75",
                  "transition-all duration-300 cursor-pointer",
                  "active:scale-[0.98]",
                )}
                style={{
                  animationDelay: `${0.1 + i * 0.08}s`,
                  animation: 'va-fade-up 0.4s ease-out backwards',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `hsla(${COLORS.primary.h}, 60%, 50%, 0.1)`,
                    border: `1px solid hsla(${COLORS.primary.h}, 60%, 50%, 0.15)`,
                  }}
                >
                  <MessageSquare size={13} style={{ color: `hsla(${COLORS.primary.h}, 70%, 65%, 0.7)` }} />
                </div>
                <span className="truncate">{hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Transcript Panel ── */}
      <div
        className={clsx(
          "absolute bottom-0 inset-x-0 z-20",
          "flex flex-col justify-end",
          "transition-all duration-600 ease-out",
          hasTranscripts
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none",
        )}
        style={{
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          maxHeight: '42vh',
          background: hasTranscripts
            ? 'linear-gradient(to top, rgba(4,8,16,0.98) 0%, rgba(4,8,16,0.9) 60%, transparent 100%)'
            : 'none',
        }}
      >
        <div className="px-5 pt-16 va-transcript-mask overflow-y-auto flex flex-col gap-3">
          {transcripts.slice(-8).map((msg, i) => (
            <div
              key={msg.id}
              className={clsx(
                "max-w-[82%] px-4 py-3 rounded-2xl",
                "text-sm font-medium leading-relaxed",
                "backdrop-blur-md border",
                "transition-all duration-300",
                msg.role === 'user'
                  ? "self-end rounded-br-md"
                  : "self-start rounded-bl-md",
              )}
              style={{
                background: msg.role === 'user'
                  ? `linear-gradient(135deg,
                      hsla(${COLORS.primary.h}, 60%, 40%, 0.2) 0%,
                      hsla(${COLORS.primary.h}, 50%, 30%, 0.12) 100%
                    )`
                  : 'rgba(255,255,255,0.05)',
                borderColor: msg.role === 'user'
                  ? `hsla(${COLORS.primary.h}, 60%, 50%, 0.2)`
                  : 'rgba(255,255,255,0.08)',
                color: msg.role === 'user'
                  ? `hsla(${COLORS.primary.h}, 60%, 88%, 0.95)`
                  : 'rgba(255,255,255,0.85)',
                animation: 'va-fade-up 0.3s ease-out',
                animationDelay: `${i * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              {msg.text}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;