"use client";

import { Bell, BellOff, Music2, Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { SCENE_META } from "@/lib/defaults";
import { useMediaQuery } from "@/lib/hooks";
import { sfx, useSfx } from "@/lib/sfx";
import { splitDuration } from "@/lib/time";
import type { SceneId } from "@/lib/types";
import { AmbientCanvas } from "./AmbientCanvas";
import { useExperience } from "./context";
import { useMusic } from "./music";

/* ----------------------------------------------------------- loading */

export function LoadingScreen({ show }: { show: boolean }) {
  const { config, theme, t } = useExperience();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-dreamy px-8 text-center"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.7 }}
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [-8, 8, -8], y: [0, -10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            {theme.decorations[0]}
          </motion.div>
          <p className="font-script text-3xl text-ink">{t(config.extras.loadingText)}</p>
          <div className="flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-accent"
                animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------- countdown */

export function CountdownScreen({
  unlockAt,
  onUnlock,
  onSkip,
}: {
  unlockAt: number;
  onUnlock: () => void;
  onSkip?: () => void;
}) {
  const { config, theme, t } = useExperience();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= unlockAt) {
        clearInterval(id);
        onUnlock();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [unlockAt, onUnlock]);
  const d = splitDuration(unlockAt - now);
  const units: [string, number][] = [
    ["days", d.days],
    ["hours", d.hours],
    ["minutes", d.minutes],
    ["seconds", d.seconds],
  ];
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-dreamy px-6 py-16 text-center">
      <AmbientCanvas preset={config.globalAnimation === "none" ? "stars" : config.globalAnimation} colors={theme.particleColors} className="-z-10" />
      {config.countdown.teaser && (
        <motion.div
          className="mb-6 text-7xl drop-shadow-[0_10px_24px_var(--c-glow)]"
          animate={{ rotate: [-6, 6, -6], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          aria-hidden
        >
          🎁
        </motion.div>
      )}
      <p className="font-script text-3xl text-accent">psst, {config.nickname || config.recipientName}...</p>
      <h1 className="mt-2 max-w-xl font-display text-3xl leading-tight font-semibold text-ink sm:text-5xl">
        {t(config.countdown.message)}
      </h1>
      <div className="mt-10 grid grid-cols-4 gap-2.5 sm:gap-4" aria-live="off">
        {units.map(([label, v]) => (
          <div key={label} className="flex w-[19vw] max-w-[110px] flex-col items-center rounded-2xl glass py-3 sm:py-5">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={v}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                className="font-display text-3xl font-bold text-ink tabular-nums sm:text-5xl"
              >
                {String(v).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="mt-1 text-[10px] tracking-[0.2em] text-ink-soft uppercase sm:text-xs">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft">
        Unlocks on{" "}
        {new Date(unlockAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
      </p>
      {onSkip && (
        <button onClick={onSkip} className="btn-ghost mt-6 text-sm">
          Skip countdown (preview only)
        </button>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- top bar */

export function TopBar({ onReplay }: { onReplay: () => void }) {
  const { enabled, setEnabled } = useSfx();
  return (
    <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex gap-2">
      <button
        onClick={() => {
          setEnabled(!enabled);
          if (!enabled) setTimeout(() => sfx.pop(), 10);
        }}
        aria-label={enabled ? "Turn off button sounds" : "Turn on button sounds"}
        aria-pressed={enabled}
        title="Button sounds"
        className="flex h-10 w-10 items-center justify-center rounded-full glass text-ink-soft transition hover:text-accent"
      >
        {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>
      <button
        onClick={onReplay}
        aria-label="Replay from the start"
        title="Replay"
        className="flex h-10 w-10 items-center justify-center rounded-full glass text-ink-soft transition hover:text-accent"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------- mini player */

export function MiniPlayer({ onOpen }: { onOpen?: () => void }) {
  const m = useMusic();
  const reduce = useReducedMotion();
  if (!m.available) return null;
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 120, damping: 16 }}
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-[60] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full glass py-1.5 pl-1.5 pr-2"
    >
      <button onClick={onOpen} aria-label="Go to the music" className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
        {m.coverSrc ? (
          <img src={m.coverSrc} alt="" className="h-full w-full object-cover" style={{ animation: m.playing && !reduce ? "spin 5s linear infinite" : undefined }} />
        ) : (
          <Music2 className="m-auto h-4 w-4" />
        )}
      </button>
      <div className="hidden min-w-0 max-w-[150px] flex-col leading-tight min-[380px]:flex">
        <span className="truncate text-xs font-semibold text-ink">{m.title}</span>
        <span className="truncate text-[10px] text-ink-soft">{m.playing ? "now playing ♪" : "paused"}</span>
      </div>
      <button
        onClick={m.toggle}
        aria-label={m.playing ? "Pause music" : "Play music"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white"
      >
        {m.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>
    </motion.div>
  );
}

/* ----------------------------------------------------------- scene nav */

export function SceneDots({ ids }: { ids: SceneId[] }) {
  const [active, setActive] = useState<SceneId | null>(ids[0] ?? null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(`scene-${id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.getAttribute("data-scene") as SceneId);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return (
    <nav aria-label="Scenes" className="fixed right-2 top-1/2 z-[55] flex -translate-y-1/2 flex-col gap-2.5 sm:right-4">
      {ids.map((id) => (
        <button
          key={id}
          onClick={() => document.getElementById(`scene-${id}`)?.scrollIntoView({ behavior: "smooth" })}
          aria-label={SCENE_META[id].label}
          aria-current={active === id}
          title={SCENE_META[id].label}
          className="group flex h-5 w-5 items-center justify-center"
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id ? "h-4 w-1.5 bg-accent" : "h-1.5 w-1.5 bg-ink-soft/40 group-hover:bg-accent/70"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}

/* ----------------------------------------------------------- cursor */

export function CustomCursor() {
  const fine = useMediaQuery("(pointer: fine)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = fine && !reduce;
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.getElementById("lu-root");
    root?.classList.add("lu-cursor-none");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHover(Boolean(t?.closest("button, a, [data-cursor], input, label")));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      root?.classList.remove("lu-cursor-none");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [x, y, enabled]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200] -ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-accent"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[199] -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent/60"
        style={{ x: sx, y: sy }}
        animate={{ scale: down ? 0.7 : hover ? 1.5 : 1, backgroundColor: hover ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {hover && <span className="text-[11px]">💗</span>}
      </motion.div>
    </>
  );
}
