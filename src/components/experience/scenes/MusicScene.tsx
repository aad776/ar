"use client";

import { Pause, Play, Repeat, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { fmtTime, useMusic } from "../music";
import { SceneHeading } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

export function Vinyl({ cover, spinning, className = "w-[min(62vw,250px)]" }: { cover: string | null; spinning: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative aspect-square ${className}`}>
      <div
        className="absolute inset-0 rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.45)]"
        style={{
          background:
            "repeating-radial-gradient(circle at 50% 50%, #1c1418 0 2px, #2a2026 2px 4px), radial-gradient(circle, #2a2026, #0f0b0d)",
          animation: spinning && !reduce ? "spin 4s linear infinite" : undefined,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,0.12)_40deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.08)_220deg,transparent_260deg)]" />
        <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-4 ring-black/40">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-accent" />}
        </div>
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3e6ea]" />
      </div>
      {/* tonearm */}
      <motion.div
        className="absolute -right-3 -top-2 h-[62%] w-3 origin-top"
        animate={{ rotate: spinning ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 60, damping: 12 }}
      >
        <div className="absolute -left-2 -top-2 h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-400 shadow" />
        <div className="mx-auto h-full w-1.5 rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400" />
        <div className="-ml-1 h-5 w-5 rounded-sm bg-zinc-700" />
      </motion.div>
    </div>
  );
}

export function FloatingNotes({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {["♪", "♫", "♬", "♩", "♪", "♫"].map((n, i) => (
        <span
          key={i}
          className="absolute text-2xl text-accent"
          style={{
            left: `${15 + i * 13}%`,
            bottom: "30%",
            animation: `note ${2.6 + (i % 3) * 0.6}s ease-out ${i * 0.45}s infinite`,
            ["--dx" as string]: `${(i % 2 ? 1 : -1) * (20 + i * 6)}px`,
          }}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export function MusicScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const m = useMusic();
  const pct = m.duration ? (m.current / m.duration) * 100 : 0;
  const VolIcon = m.volume === 0 ? VolumeX : m.volume < 0.5 ? Volume1 : Volume2;

  return (
    <SceneShell scene={scene} onNext={onNext}>
      <SceneHeading eyebrow="🎵" title={t(config.text.music.heading)} sub={t(config.text.music.subheading)} cinematic={anim === "cinematic"} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto mt-10 flex w-[min(92vw,420px)] flex-col items-center gap-6 rounded-[32px] glass px-6 pb-7 pt-9"
      >
        <FloatingNotes active={m.playing} />
        {config.music.vinyl ? (
          <Vinyl cover={m.coverSrc} spinning={m.playing} />
        ) : (
          <div className="aspect-square w-[70%] overflow-hidden rounded-2xl shadow-xl">
            {m.coverSrc ? <img src={m.coverSrc} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-accent" />}
          </div>
        )}
        <div className="w-full text-center">
          <p className="truncate font-display text-2xl font-semibold text-ink">{m.title || "Untitled song"}</p>
          <p className="truncate text-sm text-ink-soft">{m.artist}</p>
        </div>
        {m.available ? (
          <>
            <div className="w-full">
              <input
                type="range"
                min={0}
                max={m.duration || 0}
                step={0.1}
                value={m.current}
                onChange={(e) => m.seek(Number(e.target.value))}
                className="lu-range w-full"
                style={{ ["--fill" as string]: `${pct}%` }}
                aria-label="Seek"
              />
              <div className="mt-1 flex justify-between text-xs text-ink-soft tabular-nums">
                <span>{fmtTime(m.current)}</span>
                <span>{fmtTime(m.duration)}</span>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <button
                onClick={() => m.setLoop(!m.loop)}
                aria-pressed={m.loop}
                aria-label="Loop"
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${m.loop ? "bg-accent/15 text-accent" : "text-ink-soft"}`}
              >
                <Repeat className="h-5 w-5" />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={m.toggle}
                aria-label={m.playing ? "Pause" : "Play"}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_30px_-6px_var(--c-glow)]"
              >
                {m.playing ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
              </motion.button>
              <div className="flex w-11 items-center justify-center text-ink-soft">
                <VolIcon className="h-5 w-5" />
              </div>
            </div>
            <label className="flex w-full items-center gap-3 text-xs text-ink-soft">
              <span>Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={m.volume}
                onChange={(e) => m.setVolume(Number(e.target.value))}
                className="lu-range flex-1"
                style={{ ["--fill" as string]: `${m.volume * 100}%` }}
                aria-label="Volume"
              />
            </label>
          </>
        ) : (
          <p className="text-center text-sm text-ink-soft">The song is still on its way ♪</p>
        )}
      </motion.div>
    </SceneShell>
  );
}
