"use client";

import gsap from "gsap";
import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, fireworks } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import type { SceneSettings } from "@/lib/types";
import { AmbientCanvas } from "../AmbientCanvas";
import { useExperience } from "../context";
import { RevealText } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

export function FinalScene({ scene, onReplay }: { scene: SceneSettings; onReplay?: () => void }) {
  const { config, theme, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const reduce = useReducedMotion();
  const [state, setState] = useState<"closed" | "opening" | "open">("closed");
  const box = useRef<HTMLDivElement>(null);
  const stopFw = useRef<() => void>(() => {});

  useEffect(() => () => stopFw.current(), []);

  const open = () => {
    if (state !== "closed" || !box.current) return;
    setState("opening");
    sfx.whoosh();
    const q = gsap.utils.selector(box.current);
    const done = () => {
      setState("open");
      sfx.chime();
      const r = box.current?.getBoundingClientRect();
      burst(theme.particleColors, {
        x: r ? (r.left + r.width / 2) / window.innerWidth : 0.5,
        y: r ? (r.top + r.height / 2) / window.innerHeight : 0.5,
        count: 200,
        hearts: true,
      });
      setTimeout(() => {
        stopFw.current = fireworks([...theme.particleColors, "#ffffff", "#ffe8a3"], 5000);
      }, 900);
    };
    if (reduce) return done();
    gsap
      .timeline({ onComplete: done })
      .to(box.current, { rotate: -4, duration: 0.08, repeat: 5, yoyo: true, ease: "sine.inOut" })
      .to(box.current, { rotate: 0, duration: 0.1 })
      .to(q("[data-loop-l]"), { rotate: -70, x: -40, y: 30, opacity: 0, duration: 0.5, ease: "power2.in" }, "untie")
      .to(q("[data-loop-r]"), { rotate: 70, x: 40, y: 30, opacity: 0, duration: 0.5, ease: "power2.in" }, "untie")
      .to(q("[data-knot]"), { scale: 0, duration: 0.3 }, "untie+=0.2")
      .to(q("[data-ribbon]"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.35, ease: "power2.in" }, "untie+=0.3")
      .to(q("[data-ribbon-h]"), { scaleX: 0, duration: 0.35, ease: "power2.in" }, "untie+=0.3")
      .to(q("[data-lid]"), { y: -190, x: 70, rotate: 28, opacity: 0, duration: 0.8, ease: "power3.out" }, "lift")
      .fromTo(q("[data-beam]"), { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, "lift+=0.1");
  };

  const paragraphs = t(config.text.final.letter).split(/\n{2,}/);

  return (
    <SceneShell scene={scene} className="!justify-start !pt-24 !pb-32">
      {/* background transformation */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={false}
        animate={{ opacity: state === "open" ? 1 : 0 }}
        transition={{ duration: 1.6 }}
        style={{
          background:
            "radial-gradient(80% 60% at 50% 20%, color-mix(in srgb, var(--c-accent-2) 70%, white) 0%, transparent 70%), radial-gradient(60% 50% at 20% 80%, color-mix(in srgb, var(--c-accent-3) 50%, transparent), transparent 70%), radial-gradient(60% 50% at 85% 75%, color-mix(in srgb, var(--c-accent) 30%, transparent), transparent 70%)",
        }}
      />
      {state === "open" && <AmbientCanvas preset="hearts" colors={theme.particleColors} density={0.8} className="-z-[5]" />}

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-5 text-center">
        <AnimatePresence mode="wait">
          {state !== "open" ? (
            <motion.div key="gift" exit={{ opacity: 0, scale: 0.9, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
              <RevealText as="h2" text={t(config.text.final.teaser)} cinematic={anim === "cinematic" || !reduce} className="font-display text-3xl font-semibold text-ink italic sm:text-5xl" />
              <p className="mt-2 font-hand text-xl text-ink-soft">tap the gift 🎁</p>
              <button onClick={open} aria-label="Open the gift" className="mt-14 outline-none" data-cursor="heart" disabled={state !== "closed"}>
                <div ref={box} className={`relative h-[220px] w-[220px] ${state === "closed" ? "animate-wiggle" : ""}`} style={{ animationDuration: "3.5s" }}>
                  {/* light beam */}
                  <div data-beam className="absolute bottom-[120px] left-1/2 h-[260px] w-[200px] -translate-x-1/2 origin-bottom scale-y-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,240,200,0.95),rgba(255,200,230,0.4)_45%,transparent_70%)] opacity-0 blur-md" />
                  {/* base */}
                  <div className="absolute bottom-0 left-0 h-[150px] w-full rounded-b-xl rounded-t-sm shadow-[0_30px_50px_-20px_var(--c-glow)]" style={{ background: "linear-gradient(160deg, var(--c-accent) 0%, color-mix(in srgb, var(--c-accent) 70%, black) 100%)" }}>
                    <div className="absolute inset-0 rounded-b-xl bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25)_0_3px,transparent_4px),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.22)_0_3px,transparent_4px)] bg-[length:36px_36px]" />
                    <div data-ribbon className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 bg-gradient-to-r from-[#fff3c4] via-[#ffe08a] to-[#f5c95a]" />
                    <div data-ribbon-h className="absolute left-0 top-1/2 h-9 w-full -translate-y-1/2 bg-gradient-to-b from-[#fff3c4] via-[#ffe08a] to-[#f5c95a]" />
                  </div>
                  {/* lid */}
                  <div data-lid className="absolute -left-[6%] top-[46px] h-[48px] w-[112%] rounded-lg shadow-lg" style={{ background: "linear-gradient(170deg, color-mix(in srgb, var(--c-accent) 85%, white) 0%, var(--c-accent) 100%)" }}>
                    <div className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 bg-gradient-to-r from-[#fff3c4] via-[#ffe08a] to-[#f5c95a]" />
                    {/* bow */}
                    <svg viewBox="-60 -50 120 60" className="absolute -top-[52px] left-1/2 h-[64px] w-[130px] -translate-x-1/2 overflow-visible">
                      <g data-loop-l>
                        <path d="M0 0 C -30 -50, -62 -30, -48 -6 C -40 8, -14 4, 0 0z" fill="#ffd56b" stroke="#e8b33c" strokeWidth="2" />
                        <path d="M-4 2 C -20 14, -30 28, -26 40" stroke="#ffd56b" strokeWidth="9" strokeLinecap="round" fill="none" />
                      </g>
                      <g data-loop-r>
                        <path d="M0 0 C 30 -50, 62 -30, 48 -6 C 40 8, 14 4, 0 0z" fill="#ffd56b" stroke="#e8b33c" strokeWidth="2" />
                        <path d="M4 2 C 20 14, 30 28, 26 40" stroke="#ffd56b" strokeWidth="9" strokeLinecap="round" fill="none" />
                      </g>
                      <circle data-knot r="10" fill="#f5c95a" stroke="#e8b33c" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div key="letter" initial={{ opacity: 0, y: 80, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 80, damping: 16, delay: 0.2 }} className="w-full">
              <div className="relative mx-auto w-full rounded-[var(--radius-card)] bg-paper px-6 py-9 text-left shadow-[0_40px_80px_-30px_var(--c-glow)] sm:px-10">
                <span aria-hidden className="washi absolute -top-3 left-8 h-7 w-24 -rotate-6" />
                <span aria-hidden className="washi absolute -top-3 right-8 h-7 w-24 rotate-6" />
                {paragraphs.map((para, i) => (
                  <RevealText
                    key={i}
                    text={para}
                    delay={0.6 + i * 0.5}
                    className={i === 0 ? "mb-5 font-script text-[2.2rem] leading-tight text-accent" : "mb-4 font-hand text-[1.5rem] leading-[1.35] text-[#3f2a38]"}
                  />
                ))}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + paragraphs.length * 0.5 }} className="mt-6 text-right">
                  <p className="font-hand text-xl text-[#7a5a6a]">{t(config.text.final.signoff)}</p>
                  {config.senderName && <p className="font-script text-3xl text-accent">{config.senderName}</p>}
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + paragraphs.length * 0.5 }} className="mt-10 flex flex-col items-center gap-5">
                <p className="font-display text-lg text-ink italic">{t(config.text.final.closing)}</p>
                {onReplay && (
                  <button onClick={onReplay} className="btn-cute">
                    <RotateCcw className="h-4 w-4" /> Replay the surprise
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
