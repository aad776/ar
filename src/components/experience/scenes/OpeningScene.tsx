"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { AmbientCanvas } from "../AmbientCanvas";
import { useExperience } from "../context";

/** Scene 1 — the gate. Starting here is the user interaction that unlocks audio. */
export function OpeningScene({ onStart, minimal }: { onStart: () => void; minimal?: boolean }) {
  const { config, theme, t } = useExperience();
  const o = config.text.opening;
  const reduce = useReducedMotion();
  const [step, setStep] = useState(minimal ? 3 : 0);
  const [maybeCount, setMaybeCount] = useState(0);
  const [maybePos, setMaybePos] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);
  const responses = o.maybeResponses.filter(Boolean);
  const maybeBecameYes = responses.length > 0 ? maybeCount >= responses.length : maybeCount >= 1;
  const response = maybeCount > 0 ? responses[Math.min(maybeCount, responses.length) - 1] : null;

  useEffect(() => {
    if (minimal) return;
    const delays = reduce ? [0, 200, 400] : [1500, 3100, 4500];
    const timers = delays.map((d, i) => setTimeout(() => setStep((s) => Math.max(s, i + 1)), d));
    return () => timers.forEach(clearTimeout);
  }, [reduce, minimal]);

  const start = () => {
    if (leaving) return;
    sfx.chime();
    const r = yesRef.current?.getBoundingClientRect();
    burst(theme.particleColors, {
      x: r ? (r.left + r.width / 2) / window.innerWidth : 0.5,
      y: r ? (r.top + r.height / 2) / window.innerHeight : 0.7,
      count: 90,
      hearts: true,
    });
    setLeaving(true);
    setTimeout(onStart, reduce ? 50 : 900);
  };

  const onMaybe = () => {
    if (maybeBecameYes) return start();
    sfx.pop();
    setMaybeCount((c) => c + 1);
    const w = typeof window !== "undefined" ? Math.min(window.innerWidth, 520) : 360;
    setMaybePos({ x: (Math.random() - 0.5) * (w * 0.55), y: (Math.random() - 0.5) * 90 + 40 });
  };

  const lines = [o.line1, o.line2, o.line3].map(t);

  return (
    <motion.section
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-dreamy px-6 text-center"
      animate={leaving ? { opacity: 0, scale: 1.08, filter: "blur(10px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => step < 3 && setStep((s) => s + 1)}
    >
      <AmbientCanvas preset="stars" colors={theme.particleColors} density={1.1} className="-z-10" />
      <AmbientCanvas preset={config.globalAnimation === "stars" ? "hearts" : config.globalAnimation} colors={theme.particleColors} density={0.6} className="-z-10" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--c-glow)_0%,transparent_65%)] opacity-60 blur-2xl" />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 12, delay: 0.2 }}
        className="mb-6 text-6xl drop-shadow-[0_8px_20px_var(--c-glow)] animate-float"
        aria-hidden
      >
        {theme.decorations[0]}
      </motion.div>

      <div className="flex min-h-[220px] max-w-xl flex-col items-center gap-4">
        <AnimatePresence>
          {lines.map(
            (line, i) =>
              step >= i && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                  className={
                    i === 0
                      ? "font-display text-5xl font-semibold text-ink sm:text-6xl text-glow"
                      : i === 1
                        ? "font-script text-3xl text-accent sm:text-4xl"
                        : "text-lg tracking-wide text-ink-soft"
                  }
                >
                  {line}
                </motion.p>
              )
          )}
          {step >= 3 && (
            <motion.div
              key="q"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-4 flex flex-col items-center gap-6"
            >
              <p className="font-display text-2xl italic text-ink sm:text-3xl">{t(o.question)}</p>
              <div className="relative flex min-h-[130px] w-full flex-wrap items-start justify-center gap-4">
                <motion.button
                  ref={yesRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    start();
                  }}
                  animate={{ scale: 1 + Math.min(maybeCount, 4) * 0.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-cute relative z-10 px-8 text-lg"
                  data-cursor="heart"
                >
                  {o.yesLabel}
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMaybe();
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse" && !maybeBecameYes && maybeCount > 0) onMaybe();
                  }}
                  animate={{
                    x: maybeBecameYes ? 0 : maybePos.x,
                    y: maybeBecameYes ? 0 : maybePos.y,
                    scale: maybeBecameYes ? 1 : Math.max(0.7, 1 - maybeCount * 0.08),
                    rotate: maybeBecameYes ? 0 : maybeCount % 2 ? -8 : 6,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className={maybeBecameYes ? "btn-cute px-7 text-lg" : "btn-ghost px-7 text-lg"}
                >
                  {maybeBecameYes ? `YES 💕` : o.maybeLabel}
                </motion.button>
              </div>
              <div className="h-8">
                <AnimatePresence mode="wait">
                  {response && (
                    <motion.p
                      key={maybeCount}
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-full glass px-4 py-1.5 font-hand text-xl text-ink"
                    >
                      {t(response)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {step < 3 && (
        <p className="absolute bottom-8 text-xs tracking-[0.3em] text-ink-soft/70 uppercase">tap to continue</p>
      )}
    </motion.section>
  );
}
