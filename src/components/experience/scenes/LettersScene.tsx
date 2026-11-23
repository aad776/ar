"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";
import type { Letter, LetterColor, SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { Portal, SceneHeading, seeded } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

const PALETTE: Record<LetterColor, { body: string; flap: string; inner: string; seal: string }> = {
  pink: { body: "#ffc9da", flap: "#ffb3cb", inner: "#ff9fbe", seal: "#e2477f" },
  lavender: { body: "#ddd0ff", flap: "#cdb9ff", inner: "#b9a0ff", seal: "#7c4dff" },
  peach: { body: "#ffd8c4", flap: "#ffc5a8", inner: "#ffb08a", seal: "#e8704a" },
  cream: { body: "#f8ecd6", flap: "#efdcbc", inner: "#e6cda4", seal: "#c0563f" },
  mint: { body: "#cdeedd", flap: "#b5e4cc", inner: "#9bd8ba", seal: "#3f9b72" },
};

function Envelope({ letter, opening, onOpen }: { letter: Letter; opening: boolean; onOpen: () => void }) {
  const p = PALETTE[letter.color] ?? PALETTE.pink;
  const { t } = useExperience();
  const tilt = (seeded(letter.id) - 0.5) * 6;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ y: -6, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="group flex w-full flex-col items-center gap-3"
      aria-label={`Open letter: ${t(letter.label)}`}
      data-cursor="heart"
    >
      <div className="relative aspect-[3/2] w-full max-w-[300px] [perspective:900px]">
        {/* back + inner */}
        <div className="absolute inset-0 rounded-[10px] shadow-[0_18px_30px_-14px_rgba(80,30,60,0.45)]" style={{ background: p.inner }} />
        {/* letter peeking */}
        <motion.div
          className="absolute inset-x-[8%] top-[8%] h-[80%] rounded-md bg-[#fffdf8] shadow-sm"
          animate={opening ? { y: "-55%" } : { y: "0%" }}
          transition={{ duration: 0.6, delay: opening ? 0.35 : 0, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <div className="space-y-2 p-4 pt-5">
            <div className="h-1.5 w-2/3 rounded-full bg-black/10" />
            <div className="h-1.5 w-1/2 rounded-full bg-black/10" />
            <div className="h-1.5 w-3/5 rounded-full bg-black/10" />
          </div>
        </motion.div>
        {/* front pocket */}
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{
            background: `linear-gradient(135deg, ${p.body} 0 50%, color-mix(in srgb, ${p.body} 85%, black) 50% 100%)`,
            clipPath: "polygon(0 22%, 50% 62%, 100% 22%, 100% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{ background: p.body, clipPath: "polygon(0 100%, 50% 56%, 100% 100%)", filter: "brightness(1.03)" }}
        />
        {/* flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[60%] origin-top"
          style={{ transformStyle: "preserve-3d", zIndex: opening ? 0 : 3 }}
          animate={{ rotateX: opening ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <div className="h-full w-full" style={{ background: p.flap, clipPath: "polygon(0 0, 100% 0, 50% 100%)", borderRadius: "10px 10px 0 0" }} />
        </motion.div>
        {/* wax seal */}
        <motion.div
          className="absolute left-1/2 top-[52%] z-[4] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25),0_3px_6px_rgba(0,0,0,0.2)]"
          style={{ background: p.seal }}
          animate={opening ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        >
          <span className="transition-transform group-hover:scale-125">{letter.emoji}</span>
        </motion.div>
      </div>
      <p className="max-w-[300px] text-center font-hand text-[1.45rem] leading-tight text-ink">{t(letter.label)}</p>
    </motion.button>
  );
}

function Typewriter({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    const step = Math.max(1, Math.round(text.length / 260));
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + step;
      });
    }, 22);
    return () => clearInterval(id);
  }, [text, reduce]);
  return (
    <p className="whitespace-pre-line font-hand text-[1.55rem] leading-8 text-[#3f2a38]" onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 animate-pulse bg-accent" />}
      <span className="sr-only">{text}</span>
    </p>
  );
}

export function LettersScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, theme, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const [opening, setOpening] = useState<string | null>(null);
  const [reading, setReading] = useState<Letter | null>(null);

  const open = (l: Letter) => {
    sfx.whoosh();
    setOpening(l.id);
    setTimeout(() => {
      setReading(l);
      sfx.sparkle();
    }, 900);
  };
  const close = () => {
    setReading(null);
    setTimeout(() => setOpening(null), 300);
  };

  useEffect(() => {
    if (!reading) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [reading]);

  return (
    <SceneShell scene={scene} onNext={onNext}>
      <SceneHeading eyebrow="💌" title={t(config.text.letters.heading)} sub={t(config.text.letters.subheading)} cinematic={anim === "cinematic"} />
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-x-8 gap-y-12 px-8 sm:grid-cols-2">
        {config.letters.map((l) => (
          <Envelope key={l.id} letter={l} opening={opening === l.id} onOpen={() => open(l)} />
        ))}
      </div>
      <Portal>
        <AnimatePresence>
          {reading && (
            <motion.div
              key="letter"
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              role="dialog"
              aria-modal
              aria-label={t(reading.label)}
            >
              <motion.div
                initial={{ y: 120, rotate: -4, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, rotate: -1, scale: 1, opacity: 1 }}
                exit={{ y: 80, opacity: 0, rotate: 3 }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
                className="lined-paper relative max-h-[86svh] w-[min(94vw,520px)] overflow-y-auto rounded-md px-6 pb-8 pl-14 pt-12 shadow-2xl"
              >
                <span aria-hidden className="washi absolute -top-1 left-1/2 h-7 w-28 -translate-x-1/2 rotate-2" />
                <button onClick={close} aria-label="Close letter" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[#7a5a6a] hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
                <p className="mb-2 font-script text-2xl text-accent">{t(reading.label)}</p>
                <Typewriter key={reading.id} text={t(reading.body)} />
                {config.senderName && <p className="mt-6 text-right font-script text-2xl text-accent">— {config.senderName}</p>}
                {theme.decorations.slice(0, 3).map((d, i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute text-2xl"
                    style={{ right: `${10 + i * 14}%`, bottom: 10 + (i % 2) * 16 }}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + i * 0.15, type: "spring" }}
                  >
                    {d}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </SceneShell>
  );
}
