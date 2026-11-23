"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { burst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import type { SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { RevealText, seeded } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

function NightSky() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let stars: { x: number; y: number; r: number; ph: number; sp: number }[] = [];
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 2500;

    const resize = () => {
      const rect = c.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 2600);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.08 ? 1.6 + Math.random() : 0.4 + Math.random() * 0.9,
        ph: Math.random() * 6.28,
        sp: 0.0008 + Math.random() * 0.002,
      }));
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fill();
        if (s.r > 1.5) {
          ctx.globalAlpha = a * 0.35;
          ctx.fillRect(s.x - s.r * 4, s.y - 0.4, s.r * 8, 0.8);
          ctx.fillRect(s.x - 0.4, s.y - s.r * 4, 0.8, s.r * 8);
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) {
        if (!shooting && t > nextShoot) {
          shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.35, vx: -(6 + Math.random() * 4), vy: 2.5 + Math.random() * 2, life: 1 };
          nextShoot = t + 3500 + Math.random() * 5000;
        }
        if (shooting) {
          const s = shooting;
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
          g.addColorStop(0, `rgba(255,255,255,${s.life})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
          ctx.stroke();
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.012;
          if (s.life <= 0 || s.x < -50 || s.y > h + 50) shooting = null;
        }
        if (visible) raf = requestAnimationFrame(frame);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(c);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />;
}

export function UniverseScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const reduce = useReducedMotion();
  const wishes = config.wishes;
  const [found, setFound] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const positions = useMemo(() => {
    const n = wishes.length;
    const cols = Math.max(2, Math.ceil(Math.sqrt(n * 0.8)));
    const rows = Math.max(1, Math.ceil(n / cols));
    const cells = Array.from({ length: cols * rows }, (_, i) => i).sort(
      (a, b) => seeded(`c${a}`, n) - seeded(`c${b}`, n)
    );
    return wishes.map((wsh, i) => {
      const cell = cells[i];
      const cx = cell % cols;
      const cy = Math.floor(cell / cols);
      return {
        x: ((cx + 0.2 + seeded(wsh.id) * 0.6) / cols) * 84 + 8,
        y: ((cy + 0.2 + seeded(wsh.id, 9) * 0.6) / rows) * 80 + 8,
      };
    });
  }, [wishes]);

  const activeWish = wishes.find((w) => w.id === active);
  const allFound = wishes.length > 0 && found.length === wishes.length;

  const pick = (id: string, el: HTMLElement) => {
    setActive(id);
    sfx.sparkle();
    if (!found.includes(id)) {
      const next = [...found, id];
      setFound(next);
      if (next.length === wishes.length) {
        const r = el.getBoundingClientRect();
        setTimeout(() => burst(["#fff", "#ffe8a3", "#f9a8d4", "#c4b5fd"], { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight, count: 120 }), 300);
      }
    }
  };

  const pts = found.map((id) => positions[wishes.findIndex((w) => w.id === id)]).filter(Boolean);
  const segments = pts.slice(1).map((p, i) => [pts[i], p] as const);

  return (
    <SceneShell
      scene={{ ...scene, background: "night" }}
      onNext={onNext}
      forceDark
      hideAmbient={anim === "stars" || anim === "none"}
      ambientDensity={0.5}
      className="!pt-14 !pb-28"
    >
      <NightSky />
      <div aria-hidden className="absolute left-[-10%] top-[30%] -z-10 h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.28),transparent_60%)] blur-2xl" />
      <div aria-hidden className="absolute right-[-15%] top-[-5%] -z-10 h-[45vmax] w-[45vmax] rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.22),transparent_60%)] blur-2xl" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <RevealText as="h2" text={t(config.text.universe.line1)} cinematic={anim === "cinematic" || !reduce} className="font-display text-3xl leading-tight text-white italic sm:text-5xl" />
        <RevealText text={t(config.text.universe.line2)} delay={1.4} className="mt-3 font-script text-2xl text-[#ffe8a3] sm:text-3xl" />
      </div>

      <div className="relative mx-auto mt-6 h-[58svh] max-h-[560px] min-h-[340px] w-[min(96vw,900px)]">
        <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
          {segments.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={`${a.x}%`}
              y1={`${a.y}%`}
              x2={`${b.x}%`}
              y2={`${b.y}%`}
              stroke="rgba(255,232,163,0.6)"
              strokeWidth={1.5}
              strokeDasharray="4 6"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          ))}
        </svg>
        {wishes.map((wsh, i) => {
          const p = positions[i];
          const isFound = found.includes(wsh.id);
          const isActive = active === wsh.id;
          return (
            <button
              key={wsh.id}
              onClick={(e) => pick(wsh.id, e.currentTarget)}
              aria-label={isFound ? `Wish ${i + 1}: ${wsh.text}` : `Hidden wish star ${i + 1}`}
              className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              data-cursor="heart"
            >
              <span
                className="absolute h-12 w-12 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${isFound ? "rgba(255,214,110,0.55)" : "rgba(255,255,255,0.45)"} 0%, transparent 65%)`,
                  animation: `twinkle ${2.2 + (i % 3) * 0.6}s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
              <motion.svg
                viewBox="-20 -20 40 40"
                className="relative h-7 w-7"
                animate={{ scale: isActive ? 1.5 : 1, rotate: isActive ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 12 }}
              >
                <path d="M0-20C2-6 6-2 20 0 6 2 2 6 0 20-2 6-6 2-20 0-6-2-2-6 0-20z" fill={isFound ? "#ffd66e" : "#ffffff"} style={{ filter: `drop-shadow(0 0 6px ${isFound ? "#ffd66e" : "#ffffff"})` }} />
              </motion.svg>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto mt-2 flex min-h-[132px] w-[min(92vw,460px)] flex-col items-center justify-start px-2 text-center">
        <AnimatePresence mode="wait">
          {activeWish ? (
            <motion.div
              key={activeWish.id}
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              className="w-full rounded-3xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-md"
              aria-live="polite"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] text-[#ffe8a3] uppercase">
                wish {wishes.findIndex((w) => w.id === activeWish.id) + 1} of {wishes.length}
              </p>
              <p className="mt-2 font-display text-xl leading-snug text-white italic">{t(activeWish.text)}</p>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 font-hand text-2xl text-white/80">
              {t(config.text.universe.hint)} ✨
            </motion.p>
          )}
        </AnimatePresence>
        <p className="mt-3 text-xs tracking-[0.25em] text-white/60 uppercase">
          {allFound ? "every star is yours ✦" : `${found.length} / ${wishes.length} wishes found`}
        </p>
      </div>
    </SceneShell>
  );
}
