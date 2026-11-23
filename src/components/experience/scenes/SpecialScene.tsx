"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { burst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import type { SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { SceneHeading, seeded } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

export function SpecialScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, theme, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const cards = config.specialCards;
  const tints = ["var(--c-accent-2)", "var(--c-accent-3)", "var(--c-bg-2)", "var(--c-bg-3)"];

  const flip = (id: string, el: HTMLElement) => {
    const wasOpen = flipped.has(id);
    setFlipped((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    if (!wasOpen) {
      sfx.pop();
      const r = el.getBoundingClientRect();
      burst(theme.particleColors, {
        x: (r.left + r.width / 2) / window.innerWidth,
        y: (r.top + r.height / 2) / window.innerHeight,
        count: 26,
        hearts: true,
      });
    }
  };

  return (
    <SceneShell scene={scene} onNext={onNext}>
      <SceneHeading
        eyebrow={theme.decorations[1]}
        title={t(config.text.special.heading)}
        sub={t(config.text.special.subheading)}
        cinematic={anim === "cinematic"}
      />
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 px-5 min-[400px]:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const open = flipped.has(c.id);
          const tilt = (seeded(c.id) - 0.5) * 5;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: tilt }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 110, damping: 15, delay: (i % 3) * 0.08 }}
              className="[perspective:1000px]"
            >
              <button
                type="button"
                onClick={(e) => flip(c.id, e.currentTarget)}
                aria-pressed={open}
                aria-label={open ? `${c.title}: ${c.message}` : `Reveal: ${c.title}`}
                className="group relative block h-[210px] w-full text-left sm:h-[230px]"
                data-cursor="heart"
              >
                <motion.div
                  className="relative h-full w-full [transform-style:preserve-3d]"
                  animate={{ rotateY: open ? 180 : 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 16 }}
                >
                  {/* front */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] glass p-5 text-center [backface-visibility:hidden] transition-transform group-hover:-translate-y-1"
                    style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${tints[i % 4]} 55%, transparent), var(--c-surface))` }}
                  >
                    <span className="text-5xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{c.emoji}</span>
                    <p className="font-display text-xl leading-tight font-semibold text-ink">{t(c.title)}</p>
                    <span className="rounded-full bg-white/50 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-ink-soft uppercase">tap to open</span>
                  </div>
                  {/* back */}
                  <div className="absolute inset-0 flex flex-col justify-center gap-2 rounded-[var(--radius-card)] bg-paper p-6 shadow-[0_16px_40px_-12px_var(--c-glow)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <span aria-hidden className="washi absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3" />
                    <p className="text-[11px] font-semibold tracking-[0.25em] text-accent uppercase">
                      {c.emoji} {t(c.title)}
                    </p>
                    <p className="font-hand text-[1.45rem] leading-snug text-[#4a3040]">{t(c.message)}</p>
                  </div>
                </motion.div>
              </button>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-8 text-center font-hand text-xl text-ink-soft">
        {flipped.size === cards.length && cards.length > 0 ? "…and a million more reasons 💗" : `${flipped.size} of ${cards.length} opened`}
      </p>
    </SceneShell>
  );
}
