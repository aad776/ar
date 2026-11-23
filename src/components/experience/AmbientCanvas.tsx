"use client";

import { useEffect, useRef } from "react";
import type { AnimationPreset } from "@/lib/types";

export const ANIMATION_PRESETS: { id: AnimationPreset; name: string; emoji: string; blurb: string }[] = [
  { id: "hearts", name: "Floating Hearts", emoji: "💗", blurb: "Soft hearts drifting upward" },
  { id: "stars", name: "Sparkling Stars", emoji: "✨", blurb: "Twinkling four-point sparkles" },
  { id: "confetti", name: "Confetti Explosion", emoji: "🎊", blurb: "Gentle, fluttering confetti rain" },
  { id: "butterflies", name: "Butterfly Garden", emoji: "🦋", blurb: "Butterflies flapping across the screen" },
  { id: "petals", name: "Falling Petals", emoji: "🌸", blurb: "Blossom petals swaying down" },
  { id: "fireflies", name: "Magical Fireflies", emoji: "🌟", blurb: "Warm glowing lights wandering" },
  { id: "polaroids", name: "Polaroid Shuffle", emoji: "📸", blurb: "Tiny polaroids floating & spinning" },
  { id: "cinematic", name: "Cinematic Text Reveal", emoji: "🎬", blurb: "Bokeh light & letter-by-letter titles" },
  { id: "none", name: "Calm (no motion)", emoji: "🤍", blurb: "Just the background, nice and still" },
];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  r: number;
  vr: number;
  c: string;
  ph: number;
  life: number;
}

function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.05, s * 0.25, -s * 0.5, -s * 0.05, -s * 0.5, -s * 0.3);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.62, -s * 0.08, -s * 0.66, 0, -s * 0.36);
  ctx.bezierCurveTo(s * 0.08, -s * 0.66, s * 0.5, -s * 0.62, s * 0.5, -s * 0.3);
  ctx.bezierCurveTo(s * 0.5, -s * 0.05, s * 0.05, s * 0.25, 0, s * 0.3);
  ctx.closePath();
}

function sparklePath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
  ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
  ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
  ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
  ctx.closePath();
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function AmbientCanvas({
  preset,
  colors,
  density = 1,
  className = "",
  active = true,
}: {
  preset: AnimationPreset;
  colors: string[];
  density?: number;
  className?: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const colorsKey = colors.join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || preset === "none") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const palette = colorsKey.split(",");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let particles: P[] = [];

    const area = () => (w * h) / (1000 * 700);
    const baseCount: Record<AnimationPreset, number> = {
      hearts: 18,
      stars: 46,
      confetti: 46,
      butterflies: 7,
      petals: 22,
      fireflies: 26,
      polaroids: 9,
      cinematic: 12,
      none: 0,
    };

    const spawn = (initial: boolean): P => {
      const c = palette[Math.floor(Math.random() * palette.length)];
      const p: P = { x: rand(0, w), y: rand(0, h), vx: 0, vy: 0, s: 10, r: rand(0, Math.PI * 2), vr: 0, c, ph: rand(0, Math.PI * 2), life: 0 };
      switch (preset) {
        case "hearts":
          p.s = rand(8, 22);
          p.vy = -rand(0.25, 0.7);
          p.vr = rand(-0.004, 0.004);
          if (!initial) p.y = h + 30;
          break;
        case "stars":
          p.s = rand(2, 7);
          p.vy = -rand(0.02, 0.12);
          if (!initial) p.y = h + 10;
          break;
        case "confetti":
          p.s = rand(5, 10);
          p.vy = rand(0.6, 1.4);
          p.vx = rand(-0.3, 0.3);
          p.vr = rand(-0.06, 0.06);
          if (!initial) p.y = -20;
          break;
        case "butterflies":
          p.s = rand(12, 22);
          p.vx = rand(0.3, 0.8) * (Math.random() < 0.5 ? -1 : 1);
          p.vy = -rand(0.05, 0.3);
          if (!initial) {
            p.x = p.vx > 0 ? -30 : w + 30;
            p.y = rand(h * 0.2, h);
          }
          break;
        case "petals":
          p.s = rand(7, 14);
          p.vy = rand(0.4, 1);
          p.vx = rand(0.1, 0.5);
          p.vr = rand(-0.02, 0.02);
          if (!initial) {
            p.y = -20;
            p.x = rand(-w * 0.2, w);
          }
          break;
        case "fireflies":
          p.s = rand(1.5, 3.5);
          p.vx = rand(-0.25, 0.25);
          p.vy = rand(-0.25, 0.25);
          break;
        case "polaroids":
          p.s = rand(26, 46);
          p.vy = -rand(0.15, 0.4);
          p.vr = rand(-0.003, 0.003);
          p.r = rand(-0.4, 0.4);
          if (!initial) p.y = h + 60;
          break;
        case "cinematic":
          p.s = rand(30, 110);
          p.vx = rand(-0.12, 0.12);
          p.vy = rand(-0.1, 0.05);
          break;
      }
      return p;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(baseCount[preset] * density * Math.min(1.6, Math.max(0.45, area())));
      particles = Array.from({ length: n }, () => spawn(true));
    };

    const draw = (p: P, t: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      switch (preset) {
        case "hearts": {
          ctx.rotate(Math.sin(t * 0.001 + p.ph) * 0.25 + p.r * 0.1);
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = p.c;
          ctx.shadowColor = p.c;
          ctx.shadowBlur = 10;
          heartPath(ctx, p.s);
          ctx.fill();
          break;
        }
        case "stars": {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0016 + p.ph));
          ctx.globalAlpha = tw;
          ctx.fillStyle = p.c;
          ctx.shadowColor = p.c;
          ctx.shadowBlur = 8;
          ctx.rotate(t * 0.0003 + p.ph);
          sparklePath(ctx, p.s * (0.7 + tw * 0.5));
          ctx.fill();
          break;
        }
        case "confetti": {
          ctx.rotate(p.r);
          ctx.scale(1, Math.sin(t * 0.006 + p.ph));
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = p.c;
          if (p.ph > Math.PI) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          else {
            ctx.beginPath();
            ctx.arc(0, 0, p.s / 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "butterflies": {
          const flap = Math.abs(Math.sin(t * 0.012 + p.ph));
          ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = p.c;
          for (const side of [-1, 1]) {
            ctx.save();
            ctx.scale(side * (0.25 + flap * 0.75), 1);
            ctx.beginPath();
            ctx.ellipse(p.s * 0.45, -p.s * 0.2, p.s * 0.5, p.s * 0.38, -0.5, 0, Math.PI * 2);
            ctx.ellipse(p.s * 0.35, p.s * 0.3, p.s * 0.32, p.s * 0.25, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "rgba(80,50,80,0.6)";
          ctx.fillRect(-1, -p.s * 0.45, 2, p.s * 0.9);
          break;
        }
        case "petals": {
          ctx.rotate(p.r + Math.sin(t * 0.002 + p.ph) * 0.6);
          ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 0.003 + p.ph)));
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.moveTo(0, -p.s);
          ctx.quadraticCurveTo(p.s * 0.9, -p.s * 0.2, 0, p.s);
          ctx.quadraticCurveTo(-p.s * 0.9, -p.s * 0.2, 0, -p.s);
          ctx.fill();
          break;
        }
        case "fireflies": {
          const pulse = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.0012 + p.ph));
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s * 7);
          g.addColorStop(0, `rgba(255,236,170,${0.85 * pulse})`);
          g.addColorStop(0.25, `rgba(255,214,140,${0.35 * pulse})`);
          g.addColorStop(1, "rgba(255,214,140,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "polaroids": {
          ctx.rotate(p.r);
          ctx.globalAlpha = 0.55;
          ctx.shadowColor = "rgba(0,0,0,0.12)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = "#fffdf9";
          ctx.fillRect(-p.s / 2, -p.s * 0.6, p.s, p.s * 1.2);
          ctx.shadowColor = "transparent";
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s * 0.42, -p.s * 0.52, p.s * 0.84, p.s * 0.84);
          ctx.fillStyle = "rgba(255,255,255,0.65)";
          ctx.beginPath();
          ctx.arc(p.s * 0.15, -p.s * 0.25, p.s * 0.12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "cinematic": {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.0006 + p.ph);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
          g.addColorStop(0, p.c);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.12 + pulse * 0.16;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, p.s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
      ctx.restore();
    };

    const step = (p: P, t: number, i: number) => {
      p.life++;
      switch (preset) {
        case "hearts":
          p.x += Math.sin(t * 0.0008 + p.ph) * 0.3;
          p.y += p.vy;
          if (p.y < -30) particles[i] = spawn(false);
          break;
        case "stars":
          p.y += p.vy;
          if (p.y < -10) particles[i] = spawn(false);
          break;
        case "confetti":
          p.x += p.vx + Math.sin(t * 0.002 + p.ph) * 0.4;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y > h + 20) particles[i] = spawn(false);
          break;
        case "butterflies":
          p.x += p.vx;
          p.y += p.vy + Math.sin(t * 0.003 + p.ph) * 0.6;
          if (p.x < -40 || p.x > w + 40 || p.y < -40) particles[i] = spawn(false);
          break;
        case "petals":
          p.x += p.vx + Math.sin(t * 0.0015 + p.ph) * 0.5;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y > h + 20 || p.x > w + 30) particles[i] = spawn(false);
          break;
        case "fireflies":
          p.vx += rand(-0.02, 0.02);
          p.vy += rand(-0.02, 0.02);
          p.vx = Math.max(-0.4, Math.min(0.4, p.vx));
          p.vy = Math.max(-0.4, Math.min(0.4, p.vy));
          p.x = (p.x + p.vx + w) % w;
          p.y = (p.y + p.vy + h) % h;
          break;
        case "polaroids":
          p.x += Math.sin(t * 0.0006 + p.ph) * 0.25;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y < -80) particles[i] = spawn(false);
          break;
        case "cinematic":
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -p.s) p.x = w + p.s;
          if (p.x > w + p.s) p.x = -p.s;
          if (p.y < -p.s) p.y = h + p.s;
          if (p.y > h + p.s) p.y = -p.s;
          break;
      }
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      if (preset === "cinematic") {
        // a slow light sweep
        const x = ((t * 0.04) % (w * 2)) - w * 0.5;
        const g = ctx.createLinearGradient(x - 200, 0, x + 200, h);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, "rgba(255,255,255,0.10)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      for (let i = 0; i < particles.length; i++) {
        if (!reduced) step(particles[i], t, i);
        draw(particles[i], t);
      }
      if (!reduced && visible && active) raf = requestAnimationFrame(frame);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduced && active) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && visible && active) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [preset, colorsKey, density, active]);

  if (preset === "none") return null;
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
