"use client";

import confetti from "canvas-confetti";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let heartShape: confetti.Shape | null = null;
const heart = () => {
  if (!heartShape && typeof confetti.shapeFromPath === "function") {
    heartShape = confetti.shapeFromPath({
      path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
    });
  }
  return heartShape;
};

const base = { zIndex: 80, disableForReducedMotion: true } as const;

export function burst(
  colors: string[],
  opts: { x?: number; y?: number; count?: number; hearts?: boolean } = {}
) {
  if (reduced()) return;
  const origin = { x: opts.x ?? 0.5, y: opts.y ?? 0.55 };
  const count = opts.count ?? 140;
  confetti({ ...base, particleCount: count, spread: 80, startVelocity: 42, origin, colors, ticks: 220 });
  confetti({ ...base, particleCount: Math.round(count / 2), spread: 120, startVelocity: 28, origin, colors, scalar: 0.8, ticks: 240 });
  const h = opts.hearts ? heart() : null;
  if (h) confetti({ ...base, particleCount: 24, spread: 100, startVelocity: 30, origin, colors, shapes: [h], scalar: 1.6, ticks: 260 });
}

export function sideCannons(colors: string[]) {
  if (reduced()) return;
  const end = Date.now() + 900;
  (function frame() {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
    confetti({ ...base, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function fireworks(colors: string[], durationMs = 4500) {
  if (reduced()) return () => {};
  const end = Date.now() + durationMs;
  const id = window.setInterval(() => {
    if (Date.now() > end) return window.clearInterval(id);
    confetti({
      ...base,
      particleCount: 46,
      startVelocity: 26,
      spread: 360,
      ticks: 70,
      gravity: 0.6,
      scalar: 0.9,
      colors,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
    });
  }, 420);
  return () => window.clearInterval(id);
}

export function heartRain(colors: string[]) {
  if (reduced()) return;
  const h = heart();
  const end = Date.now() + 2200;
  (function frame() {
    confetti({
      ...base,
      particleCount: 2,
      startVelocity: 0,
      ticks: 300,
      gravity: 0.5,
      origin: { x: Math.random(), y: -0.05 },
      colors,
      shapes: h ? [h] : ["circle"],
      scalar: 1.8,
      drift: Math.random() - 0.5,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
