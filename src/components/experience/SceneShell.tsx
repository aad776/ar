"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { DARK_SCENE_VARS, SCENE_BACKGROUNDS, type TransitionStyle } from "@/lib/themes";
import type { AnimationPreset, SceneSettings } from "@/lib/types";
import { AmbientCanvas } from "./AmbientCanvas";
import { useExperience } from "./context";

const ENTER: Record<TransitionStyle, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  float: { initial: { opacity: 0, y: 60, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } },
  blur: { initial: { opacity: 0, filter: "blur(16px)" }, animate: { opacity: 1, filter: "blur(0px)" } },
  slide: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.88 }, animate: { opacity: 1, scale: 1 } },
  unfold: { initial: { opacity: 0, rotateX: 18, y: 40, transformPerspective: 900 }, animate: { opacity: 1, rotateX: 0, y: 0 } },
  "fade-up": { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
};

export function useSceneAnimation(scene: SceneSettings): AnimationPreset {
  const { config } = useExperience();
  return scene.animation === "theme" ? config.globalAnimation : scene.animation;
}

export function SceneShell({
  scene,
  children,
  onNext,
  className = "",
  forceDark,
  ambientDensity = 1,
  hideAmbient,
}: {
  scene: SceneSettings;
  children: ReactNode;
  onNext?: () => void;
  className?: string;
  forceDark?: boolean;
  ambientDensity?: number;
  hideAmbient?: boolean;
}) {
  const { theme } = useExperience();
  const reduce = useReducedMotion();
  const anim = useSceneAnimation(scene);
  const bg = SCENE_BACKGROUNDS[scene.background] ?? SCENE_BACKGROUNDS.theme;
  const dark = forceDark || (bg.dark && !theme.dark);
  const style: CSSProperties = {
    ...(dark ? DARK_SCENE_VARS : {}),
    ...(bg.css ? { background: bg.css } : {}),
  } as CSSProperties;
  const enter = ENTER[theme.transition];

  return (
    <section
      id={`scene-${scene.id}`}
      data-scene={scene.id}
      style={style}
      className={`relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden pt-20 pb-28 text-ink ${
        bg.css ? "" : "bg-dreamy"
      } ${className}`}
    >
      {!hideAmbient && (
        <AmbientCanvas
          preset={anim}
          colors={dark ? ["#ffffff", "#ffe8a3", "#f9a8d4", "#c4b5fd"] : theme.particleColors}
          density={ambientDensity}
          className="-z-10"
        />
      )}
      <motion.div
        className="relative w-full"
        initial={reduce ? false : enter.initial}
        whileInView={enter.animate}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.div>
      {onNext && (
        <button
          onClick={onNext}
          aria-label="Next scene"
          className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 flex h-11 w-11 items-center sm:right-auto sm:left-1/2 sm:-translate-x-1/2 justify-center rounded-full glass text-ink-soft transition hover:scale-110"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      )}
    </section>
  );
}
