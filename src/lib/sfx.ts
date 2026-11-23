"use client";

import { create } from "zustand";

interface SfxState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}
export const useSfx = create<SfxState>()((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));

let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0) {
  if (!useSfx.getState().enabled) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Soft UI sounds — muted unless the viewer turns them on. */
export const sfx = {
  pop: () => tone(520, 0.12, "sine", 0.12, 880),
  tap: () => tone(740, 0.07, "triangle", 0.06),
  chime: () => [880, 1108, 1318].forEach((f, i) => tone(f, 0.5, "sine", 0.07, undefined, i * 0.08)),
  whoosh: () => tone(300, 0.35, "sine", 0.05, 1200),
  puff: () => tone(200, 0.2, "triangle", 0.05, 90),
  sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.25, "sine", 0.04, undefined, i * 0.05)),
};
