"use client";

import gsap from "gsap";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, heartRain, sideCannons } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import type { SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { Portal, RevealText } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

function Balloon({ color, left, delay, size, dur }: { color: string; left: string; delay: number; size: number; dur: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-[-160px] -z-[5]"
      style={{
        left,
        animation: `rise ${dur}s ease-in ${delay}s infinite`,
        ["--drift" as string]: `${(left.length % 3) * 30 - 30}px`,
      }}
    >
      <svg width={size} height={size * 1.9} viewBox="0 0 60 114">
        <defs>
          <radialGradient id={`b-${color.slice(1)}`} cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#fff" stopOpacity=".75" />
            <stop offset=".25" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity=".85" />
          </radialGradient>
        </defs>
        <ellipse cx="30" cy="32" rx="26" ry="31" fill={`url(#b-${color.slice(1)})`} />
        <path d="M27 62 l3 5 l3 -5z" fill={color} />
        <path d="M30 67 C 24 80, 36 92, 28 112" stroke="rgba(120,80,100,.45)" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}

export function RevealScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, theme, t } = useExperience();
  const reduce = useReducedMotion();
  const anim = useSceneAnimation(scene);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(titleRef, { once: true, amount: 0.6 });
  const [taps, setTaps] = useState(0);
  const [egg, setEgg] = useState(false);

  const title = t(config.text.reveal.title);
  // split the name out so it can be styled differently
  const name = config.recipientName;
  const idx = name ? title.toLowerCase().indexOf(name.toLowerCase()) : -1;
  const parts =
    idx >= 0
      ? [title.slice(0, idx), title.slice(idx, idx + name.length), title.slice(idx + name.length)]
      : [title, "", ""];

  useEffect(() => {
    if (!inView) return;
    const colors = theme.particleColors;
    burst(colors, { y: 0.45, count: 160 });
    const t1 = setTimeout(() => sideCannons(colors), 500);
    sfx.sparkle();
    if (!reduce && titleRef.current) {
      const chars = titleRef.current.querySelectorAll("[data-char]");
      gsap.fromTo(
        chars,
        { yPercent: 120, rotateX: -80, opacity: 0, scale: 0.6 },
        { yPercent: 0, rotateX: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.035, ease: "back.out(1.8)" }
      );
    }
    return () => clearTimeout(t1);
  }, [inView, reduce, theme.particleColors]);

  const onNameTap = () => {
    const n = taps + 1;
    setTaps(n);
    sfx.tap();
    if (n === 5) {
      heartRain(theme.particleColors);
      sfx.chime();
      setEgg(true);
      setTimeout(() => setEgg(false), 5200);
      setTaps(0);
    }
  };

  const charSpans = (s: string, cls = "") =>
    Array.from(s).map((ch, i) => (
      <span key={i} data-char className={`inline-block whitespace-pre ${cls}`} style={{ opacity: reduce ? 1 : 0 }}>
        {ch}
      </span>
    ));

  const balloons = [theme.particleColors[0], theme.particleColors[2], theme.particleColors[4] ?? "#c9a7ff", theme.particleColors[1], theme.particleColors[3] ?? "#ffd6e5", theme.particleColors[0]];

  return (
    <SceneShell scene={scene} onNext={onNext}>
      {!reduce &&
        balloons.map((c, i) => (
          <Balloon key={i} color={c} left={`${6 + i * 16}%`} delay={i * 1.7} size={38 + (i % 3) * 12} dur={11 + (i % 3) * 3} />
        ))}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        {theme.decorations.slice(1, 5).map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute text-3xl animate-float sm:text-4xl"
            style={{
              top: ["-8%", "8%", "82%", "92%"][i],
              left: ["6%", "88%", "2%", "84%"][i],
              animationDelay: `${i * 0.8}s`,
              ["--rot" as string]: `${i % 2 ? 12 : -12}deg`,
            }}
          >
            {d}
          </span>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="mb-4 text-6xl"
          aria-hidden
        >
          🎉
        </motion.div>
        <h1
          ref={titleRef}
          aria-label={title}
          className="font-display text-[2.6rem] leading-[1.05] font-bold tracking-tight text-ink [perspective:600px] sm:text-7xl md:text-8xl"
        >
          <span aria-hidden>{charSpans(parts[0].toUpperCase())}</span>
          {parts[1] && (
            <button
              aria-hidden
              tabIndex={-1}
              onClick={onNameTap}
              className="relative inline-block font-script text-[1.25em] leading-[1.1] normal-case"
            >
              {charSpans(parts[1], "bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-accent-3)] to-[var(--c-accent)] bg-clip-text text-transparent px-[0.02em]")}
            </button>
          )}
          <span aria-hidden>{charSpans(parts[2].toUpperCase())}</span>
          {!title.includes("🎂") && (
            <span aria-hidden className="ml-2 inline-block">
              {charSpans("🎂💗")}
            </span>
          )}
        </h1>
        <RevealText
          text={t(config.text.reveal.subtitle)}
          delay={1.2}
          cinematic={anim === "cinematic"}
          className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
        />
        {config.nickname && (
          <motion.p
            initial={{ opacity: 0, rotate: -6, scale: 0.8 }}
            whileInView={{ opacity: 1, rotate: -3, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.8, type: "spring" }}
            className="mt-6 rounded-full glass px-5 py-2 font-hand text-2xl text-accent"
          >
            (yes, you, {config.nickname} ✨)
          </motion.p>
        )}
      </div>
      <Portal>
      <AnimatePresence>
        {egg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            className="fixed bottom-24 left-1/2 z-[70] w-[min(92vw,420px)] -translate-x-1/2 rounded-3xl glass px-5 py-4 text-center font-hand text-xl text-ink"
          >
            🥚 {t(config.extras.easterEgg)}
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </SceneShell>
  );
}
