"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "@/lib/sfx";
import type { GalleryLayout, SceneSettings } from "@/lib/types";
import { useExperience } from "../context";
import { Lightbox, type GalleryItem } from "../Lightbox";
import { Framed, MediaView, SceneHeading, Sticker, seeded } from "../primitives";
import { SceneShell, useSceneAnimation } from "../SceneShell";

/* ------------------------------------------------------------- helpers */

function Parallax({ children, speed, className = "" }: { children: ReactNode; speed: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 50, -speed * 50]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

function Tappable({ onOpen, children, className = "", label }: { onOpen: () => void; children: ReactNode; className?: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.tap();
        onOpen();
      }}
      aria-label={`Open memory: ${label}`}
      className={`block w-full text-left focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-accent)] ${className}`}
      data-cursor="heart"
    >
      {children}
    </button>
  );
}

const aspectOf = (it: GalleryItem) => {
  const w = it.asset.width ?? 4;
  const h = it.asset.height ?? 5;
  const r = w / h;
  return r > 1.15 ? "aspect-[4/3]" : r < 0.8 ? "aspect-[4/5]" : "aspect-square";
};

/* ------------------------------------------------------------- layouts */

function PolaroidWall({ items, open }: { items: GalleryItem[]; open: (i: number) => void }) {
  return (
    <div className="mx-auto mt-10 max-w-6xl columns-2 gap-4 px-4 sm:columns-3 sm:gap-6 lg:columns-4">
      {items.map((it, i) => {
        const rot = (seeded(it.memory.id) - 0.5) * 12;
        return (
          <Parallax key={it.memory.id} speed={(seeded(it.memory.id, 3) - 0.5) * 1.2} className="mb-6 break-inside-avoid sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: -60, rotate: rot * 3, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, rotate: rot, scale: 1 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 5 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: (i % 4) * 0.08 }}
              className="relative"
            >
              {i % 3 === 1 && <span aria-hidden className="washi absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-6" />}
              <Tappable onOpen={() => open(i)} label={it.memory.caption}>
                <Framed frame={it.memory.frame} caption={it.memory.caption}>
                  <MediaView asset={it.asset} className={`w-full ${aspectOf(it)}`} />
                </Framed>
              </Tappable>
              <Sticker id={it.memory.sticker} className="absolute -right-3 -top-4 rotate-12" />
            </motion.div>
          </Parallax>
        );
      })}
    </div>
  );
}

function Scrapbook({ items, open }: { items: GalleryItem[]; open: (i: number) => void }) {
  return (
    <div className="relative mx-auto mt-10 w-[min(94vw,980px)] rounded-[10px] bg-[#ffeef4] px-4 py-10 shadow-[0_30px_60px_-30px_rgba(120,40,80,0.4)] paper sm:px-10">
      <div aria-hidden className="absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/5 to-transparent md:block" />
      {["left-6 top-3 -rotate-6", "right-8 top-5 rotate-3", "left-1/3 bottom-3 rotate-2"].map((c) => (
        <span key={c} aria-hidden className={`washi absolute h-6 w-24 ${c}`} />
      ))}
      <div className="flex flex-col gap-12">
        {items.map((it, i) => {
          const left = i % 2 === 0;
          const rot = (left ? -1 : 1) * (2 + seeded(it.memory.id) * 4);
          return (
            <motion.div
              key={it.memory.id}
              initial={{ opacity: 0, x: left ? -50 : 50, rotate: rot * 2 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
              className={`flex flex-col items-center gap-5 md:flex-row ${left ? "" : "md:flex-row-reverse"}`}
            >
              <div className="relative w-[78%] max-w-[340px] md:w-1/2" style={{ rotate: `${rot}deg` }}>
                <Tappable onOpen={() => open(i)} label={it.memory.caption}>
                  <Framed frame={it.memory.frame === "film" ? "tape" : it.memory.frame} caption={it.memory.caption}>
                    <MediaView asset={it.asset} className={`w-full ${aspectOf(it)}`} />
                  </Framed>
                </Tappable>
                <Sticker id={it.memory.sticker} className={`absolute -top-5 text-4xl ${left ? "-right-4 rotate-12" : "-left-4 -rotate-12"}`} />
              </div>
              <div className="relative w-[85%] max-w-[320px] md:w-1/2" style={{ rotate: `${-rot / 2}deg` }}>
                <div className="lined-paper rounded-sm px-6 pb-5 pl-12 pt-7 shadow-md">
                  <span aria-hidden className="washi absolute -top-2 left-8 h-5 w-14 -rotate-6" />
                  {it.memory.date && <p className="font-hand text-lg leading-8 text-accent">{it.memory.date}</p>}
                  <p className="font-hand text-2xl leading-8 text-[#4a3040]">{it.memory.note || it.memory.caption || "a moment worth keeping ♡"}</p>
                </div>
                <svg aria-hidden viewBox="0 0 80 40" className={`absolute -bottom-8 h-8 w-16 text-accent ${left ? "left-2" : "right-2 -scale-x-100"}`}>
                  <path d="M5 5 C 25 35, 50 35, 72 18 M62 14 l10 4 l-6 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FilmRoll({ items, open }: { items: GalleryItem[]; open: (i: number) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (d: number) => scroller.current?.scrollBy({ left: d * Math.min(320, window.innerWidth * 0.7), behavior: "smooth" });
  const holes = (
    <div aria-hidden className="flex gap-4 px-2">
      {Array.from({ length: Math.max(24, items.length * 6) }).map((_, i) => (
        <span key={i} className="h-3 w-5 shrink-0 rounded-[3px] bg-[#f6efe7]/90" />
      ))}
    </div>
  );
  return (
    <div className="relative mt-10 w-full">
      <motion.div
        initial={{ opacity: 0, x: 120 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative -rotate-2 bg-[#1b1719] py-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
      >
        <div ref={scroller} className="no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          <div className="w-max">
            {holes}
            <div className="flex gap-4 px-[8vw] py-3">
              {items.map((it, i) => (
                <div key={it.memory.id} className="w-[64vw] max-w-[280px] shrink-0 snap-center">
                  <Tappable onOpen={() => open(i)} label={it.memory.caption}>
                    <div className="relative overflow-hidden rounded-[4px] ring-1 ring-white/10">
                      <MediaView asset={it.asset} className="aspect-[4/5] w-full" />
                      <span className="absolute left-2 top-2 font-mono text-[10px] tracking-widest text-amber-300/90">
                        {String(i + 1).padStart(2, "0")}A ▸
                      </span>
                      <Sticker id={it.memory.sticker} className="absolute bottom-2 right-2 text-2xl" />
                    </div>
                  </Tappable>
                  <p className="mt-2 truncate font-mono text-[11px] tracking-[0.18em] text-amber-100/80 uppercase">
                    {it.memory.caption}
                    {it.memory.date ? ` · ${it.memory.date}` : ""}
                  </p>
                </div>
              ))}
            </div>
            {holes}
          </div>
        </div>
      </motion.div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="btn-ghost h-11 min-h-0 w-11 p-0">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-hand text-xl text-ink-soft">swipe through our film roll</span>
        <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="btn-ghost h-11 min-h-0 w-11 p-0">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function TiltCard({ children, delay }: { children: ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 18);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay }}
    >
      <div className="animate-float" style={{ animationDelay: `${delay * 3}s`, animationDuration: `${5 + delay * 4}s` }}>
        {children}
      </div>
    </motion.div>
  );
}

function FloatingCards({ items, open }: { items: GalleryItem[]; open: (i: number) => void }) {
  return (
    <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 px-4 sm:grid-cols-3 sm:gap-8">
      {items.map((it, i) => (
        <div key={it.memory.id} className={i % 3 === 1 ? "sm:translate-y-12" : i % 2 ? "translate-y-6 sm:translate-y-0" : ""}>
          <TiltCard delay={(i % 3) * 0.15}>
            <Tappable onOpen={() => open(i)} label={it.memory.caption}>
              <div className="relative overflow-hidden rounded-[var(--radius-card)] glass p-2">
                <MediaView asset={it.asset} className={`w-full rounded-[calc(var(--radius-card)-8px)] ${aspectOf(it)}`} />
                <div className="px-2 pb-1 pt-2.5">
                  <p className="truncate font-display text-base font-semibold text-ink">{it.memory.caption}</p>
                  {it.memory.note && <p className="line-clamp-2 font-hand text-lg leading-tight text-ink-soft">{it.memory.note}</p>}
                </div>
                <Sticker id={it.memory.sticker} className="absolute right-3 top-3 text-2xl" />
              </div>
            </Tappable>
          </TiltCard>
        </div>
      ))}
    </div>
  );
}

function Magazine({ items, open }: { items: GalleryItem[]; open: (i: number) => void }) {
  const { config } = useExperience();
  const [hero, ...rest] = items;
  const spans = ["col-span-3 row-span-2", "col-span-3", "col-span-2", "col-span-4 row-span-2", "col-span-2", "col-span-3", "col-span-3"];
  const quote = rest.find((x) => x.memory.note)?.memory.note;
  return (
    <div className="mx-auto mt-10 w-[min(94vw,1000px)] rounded-[4px] bg-[#fffdfa] p-4 text-[#231a1e] shadow-[0_40px_80px_-40px_rgba(60,20,40,0.45)] sm:p-8">
      <div className="flex items-end justify-between border-b-2 border-[#231a1e] pb-2">
        <p className="font-display text-[11px] tracking-[0.35em] uppercase">Vol. {new Date(config.birthdayDate).getFullYear() || "∞"} · Birthday Edition</p>
        <p className="font-display text-[11px] tracking-[0.35em] uppercase">No. 1</p>
      </div>
      <h3 className="mt-3 font-display text-[13vw] leading-[0.85] font-black tracking-tighter uppercase sm:text-8xl">
        The {config.recipientName || "Birthday"} <span className="font-script font-normal text-accent normal-case italic">Issue</span>
      </h3>
      {hero && (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 grid gap-5 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <Tappable onOpen={() => open(0)} label={hero.memory.caption}>
              <MediaView asset={hero.asset} className="aspect-[4/5] w-full" />
            </Tappable>
          </div>
          <div className="flex flex-col justify-between gap-4 sm:col-span-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent uppercase">Cover story</p>
              <p className="mt-2 font-display text-3xl leading-tight font-bold italic">{hero.memory.caption}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#5a4a50]">{hero.memory.note}</p>
            </div>
            {quote && (
              <blockquote className="border-l-4 border-accent pl-4 font-display text-2xl leading-snug italic">“{quote}”</blockquote>
            )}
          </div>
        </motion.div>
      )}
      <div className="mt-6 grid auto-rows-[120px] grid-cols-6 gap-3 sm:auto-rows-[160px] sm:gap-4">
        {rest.map((it, i) => (
          <motion.div
            key={it.memory.id}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: (i % 3) * 0.08 }}
            className={`relative ${spans[i % spans.length]}`}
          >
            <Tappable onOpen={() => open(i + 1)} label={it.memory.caption} className="h-full">
              <MediaView asset={it.asset} className="h-full w-full" />
              <span className="absolute bottom-0 left-0 bg-[#fffdfa] px-2 py-1 font-display text-[11px] font-semibold tracking-wider uppercase">
                {String(i + 2).padStart(2, "0")} — {it.memory.caption}
              </span>
            </Tappable>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const LAYOUTS: Record<GalleryLayout, typeof PolaroidWall> = {
  polaroid: PolaroidWall,
  scrapbook: Scrapbook,
  filmroll: FilmRoll,
  floating: FloatingCards,
  magazine: Magazine,
};

export function MemoriesScene({ scene, onNext }: { scene: SceneSettings; onNext?: () => void }) {
  const { config, t } = useExperience();
  const anim = useSceneAnimation(scene);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = useMemo<GalleryItem[]>(
    () =>
      config.memories
        .map((m) => ({ memory: m, asset: config.assets[m.assetId] }))
        .filter((x): x is GalleryItem => Boolean(x.asset)),
    [config.memories, config.assets]
  );
  const Layout = LAYOUTS[config.text.memories.layout] ?? PolaroidWall;

  return (
    <SceneShell scene={scene} onNext={onNext} ambientDensity={0.7}>
      <SceneHeading
        eyebrow="📸"
        title={t(config.text.memories.heading)}
        sub={t(config.text.memories.subheading)}
        cinematic={anim === "cinematic"}
      />
      {items.length ? (
        <Layout items={items} open={setOpenIdx} />
      ) : (
        <p className="mt-10 text-center font-hand text-2xl text-ink-soft">memories coming soon ♡</p>
      )}
      <p className="mt-10 text-center text-xs tracking-[0.25em] text-ink-soft uppercase">tap a photo to open it</p>
      <Lightbox items={items} index={openIdx} onClose={() => setOpenIdx(null)} onIndex={setOpenIdx} />
    </SceneShell>
  );
}
