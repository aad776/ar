"use client";

import { Mic, MicOff, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { burst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import type { SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { RevealText, SceneHeading } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

function Flame({ lit }: { lit: boolean }) {
  return (
    <AnimatePresence>
      {lit ? (
        <motion.span
          key="flame"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="absolute -top-[30px] left-1/2 -ml-[8px] block h-[26px] w-[16px] origin-bottom"
        >
          <span className="absolute inset-0 animate-flicker rounded-[50%_50%_45%_45%/65%_65%_35%_35%] bg-[radial-gradient(ellipse_at_50%_75%,#fff7c2_0%,#ffd36e_35%,#ff8a3d_70%,transparent_72%)] shadow-[0_0_22px_8px_rgba(255,190,90,0.55)]" />
          <span className="absolute bottom-[3px] left-1/2 -ml-[3px] h-[9px] w-[6px] rounded-full bg-[#7ec8ff]/70 blur-[1px]" />
        </motion.span>
      ) : (
        <motion.span
          key="smoke"
          initial={{ opacity: 0.7, y: 0, scale: 0.6 }}
          animate={{ opacity: 0, y: -46, scale: 1.8 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute -top-[22px] left-1/2 -ml-[7px] block h-[14px] w-[14px] rounded-full bg-gray-400/50 blur-[3px]"
        />
      )}
    </AnimatePresence>
  );
}

function Cake({ candles, lit, onBlow }: { candles: number; lit: boolean[]; onBlow: (i: number) => void }) {
  const sprinkles = ["#ff6fa3", "#7cc6ff", "#ffd166", "#9be7b0", "#c9a7ff", "#ffffff"];
  return (
    <div className="relative mx-auto w-[min(86vw,340px)] select-none">
      <svg viewBox="0 0 340 300" className="w-full drop-shadow-[0_24px_40px_var(--c-glow)]" aria-hidden>
        <defs>
          <linearGradient id="tier1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffd6e5" />
            <stop offset="1" stopColor="#ffb3cb" />
          </linearGradient>
          <linearGradient id="tier2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff6ef" />
            <stop offset="1" stopColor="#ffe5d6" />
          </linearGradient>
          <linearGradient id="tier3" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e9dcff" />
            <stop offset="1" stopColor="#d4c0ff" />
          </linearGradient>
        </defs>
        {/* plate */}
        <ellipse cx="170" cy="276" rx="160" ry="20" fill="#fff" opacity=".9" />
        <ellipse cx="170" cy="272" rx="150" ry="15" fill="#f4e8ee" />
        {/* bottom tier */}
        <rect x="40" y="190" width="260" height="80" rx="16" fill="url(#tier1)" />
        <ellipse cx="170" cy="190" rx="130" ry="16" fill="#ffc6da" />
        {Array.from({ length: 13 }).map((_, i) => (
          <circle key={i} cx={52 + i * 20} cy={262} r="7" fill="#fff" opacity=".9" />
        ))}
        {/* middle tier */}
        <rect x="70" y="130" width="200" height="66" rx="14" fill="url(#tier2)" />
        <ellipse cx="170" cy="130" rx="100" ry="13" fill="#fff" />
        <path d="M70 136 q12 22 24 0 q12 26 24 0 q12 18 24 0 q12 28 24 0 q12 20 24 0 q12 24 24 0 q12 18 24 0 q12 22 24 0 q4 10 8 0 v-6 h-200z" fill="#ff9fc0" />
        {/* top tier */}
        <rect x="100" y="80" width="140" height="56" rx="12" fill="url(#tier3)" />
        <ellipse cx="170" cy="80" rx="70" ry="11" fill="#f3ecff" />
        <path d="M100 86 q10 18 20 0 q10 22 20 0 q10 14 20 0 q10 24 20 0 q10 16 20 0 q10 20 20 0 q10 14 20 0 v-6 h-140z" fill="#fff" />
        {/* sprinkles */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 60 + ((i * 53) % 220);
          const y = 205 + ((i * 29) % 45);
          return (
            <rect key={i} x={x} y={y} width="8" height="3" rx="1.5" fill={sprinkles[i % sprinkles.length]} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />
          );
        })}
        {[110, 150, 190, 230].map((x, i) => (
          <circle key={i} cx={x} cy={160 + (i % 2) * 14} r="6" fill="#e2335e" />
        ))}
        {/* ribbon bow */}
        <g transform="translate(170 168)">
          <path d="M0 0c-26-22-40 6-26 14 10 6 26-14 26-14zM0 0c26-22 40 6 26 14-10 6-26-14-26-14z" fill="var(--c-accent)" />
          <circle r="6" fill="var(--c-accent)" />
        </g>
      </svg>
      {/* candles sit on the top tier: x from 30% to 70% of width, y ≈ 26% */}
      <div className="absolute left-[31%] right-[31%] top-[9%] flex h-[18%] items-end justify-between">
        {Array.from({ length: candles }).map((_, i) => (
          <button
            key={i}
            onClick={() => onBlow(i)}
            aria-label={lit[i] ? `Blow out candle ${i + 1}` : `Candle ${i + 1} is out`}
            className="relative flex h-full items-end justify-center"
            style={{ width: candles > 5 ? 14 : 24 }}
            data-cursor="heart"
          >
            <span
              className="relative block h-[70%] w-[9px] rounded-t-[3px] shadow-sm"
              style={{
                background: `repeating-linear-gradient(135deg, ${["#ff8fb8", "#9fd3ff", "#ffd166", "#b7a4ff", "#9be7b0"][i % 5]} 0 5px, #fff 5px 9px)`,
              }}
            >
              <span className="absolute -top-[6px] left-1/2 h-[7px] w-[2px] -translate-x-1/2 bg-[#4a3a3a]" />
              <Flame lit={lit[i]} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CakeScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, theme, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const n = Math.max(1, Math.min(9, config.text.cake.candles || 1));
  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(true));
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const micRef = useRef<{ stream: MediaStream; ctx: AudioContext; raf: number } | null>(null);
  const allOut = lit.every((l) => !l);
  const sectionRef = useRef<HTMLDivElement>(null);

  if (lit.length !== n) setLit(Array(n).fill(true));

  const stopMic = useCallback(() => {
    const m = micRef.current;
    if (!m) return;
    cancelAnimationFrame(m.raf);
    m.stream.getTracks().forEach((tr) => tr.stop());
    void m.ctx.close();
    micRef.current = null;
    setMicOn(false);
    setLevel(0);
  }, []);

  useEffect(() => () => stopMic(), [stopMic]);

  const blow = useCallback((i: number) => {
    setLit((prev) => {
      if (!prev[i]) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
    sfx.puff();
  }, []);

  const blowNext = useCallback(() => {
    setLit((prev) => {
      const i = prev.findIndex(Boolean);
      if (i < 0) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
    sfx.puff();
  }, []);

  useEffect(() => {
    if (!allOut) return;
    stopMic();
    const r = sectionRef.current?.getBoundingClientRect();
    const y = r ? Math.min(0.8, Math.max(0.2, (r.top + r.height * 0.4) / window.innerHeight)) : 0.5;
    const tm = setTimeout(() => {
      burst(theme.particleColors, { y, count: 180, hearts: true });
      sfx.chime();
    }, 350);
    return () => clearTimeout(tm);
  }, [allOut, stopMic, theme.particleColors]);

  const startMic = async () => {
    setMicError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Your browser can't use the mic here — just tap the candles!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      let loudSince = 0;
      let lastBlow = 0;
      const loop = (now: number) => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 4));
        if (rms > 0.14) {
          if (!loudSince) loudSince = now;
          if (now - loudSince > 140 && now - lastBlow > 260) {
            lastBlow = now;
            blowNext();
          }
        } else loudSince = 0;
        if (micRef.current) micRef.current.raf = requestAnimationFrame(loop);
      };
      micRef.current = { stream, ctx, raf: requestAnimationFrame(loop) };
      setMicOn(true);
    } catch {
      setMicError("No worries — mic access wasn't allowed. Just tap the candles! 🕯️");
    }
  };

  return (
    <SceneShell scene={scene} onNext={onNext}>
      <div ref={sectionRef} className="flex flex-col items-center gap-6">
        <SceneHeading
          title={t(config.text.cake.heading)}
          sub={allOut ? undefined : t(config.text.cake.wishPrompt)}
          cinematic={anim === "cinematic"}
        />
        <Cake candles={n} lit={lit} onBlow={blow} />

        <AnimatePresence mode="wait">
          {!allOut ? (
            <motion.div key="controls" exit={{ opacity: 0, y: 10 }} className="flex flex-col items-center gap-3 px-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={micOn ? stopMic : startMic} className="btn-ghost text-sm">
                  {micOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {micOn ? "Stop listening" : "Blow into the mic"}
                </button>
                <span className="text-sm text-ink-soft">
                  {lit.filter(Boolean).length} / {n} candles lit
                </span>
              </div>
              {micOn && (
                <div className="flex items-center gap-2 text-xs text-ink-soft" aria-live="polite">
                  <span>Blow gently 🌬️</span>
                  <span className="h-2 w-32 overflow-hidden rounded-full bg-black/10">
                    <span className="block h-full rounded-full bg-accent transition-[width] duration-75" style={{ width: `${level * 100}%` }} />
                  </span>
                </div>
              )}
              {micError && <p className="max-w-xs text-center text-sm text-ink-soft">{micError}</p>}
            </motion.div>
          ) : (
            <motion.div
              key="wish"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mx-5 flex max-w-md flex-col items-center gap-4 rounded-[var(--radius-card)] glass px-7 py-6 text-center"
            >
              <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">wish made ✨</p>
              <RevealText text={t(config.text.cake.hiddenMessage)} delay={0.9} className="font-script text-3xl leading-snug text-ink" />
              <button
                onClick={() => setLit(Array(n).fill(true))}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-offset-4 hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" /> relight the candles
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
