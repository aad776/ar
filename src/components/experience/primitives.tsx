"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ElementType, type ReactNode } from "react";
import { useIsClient } from "@/lib/hooks";
import { createPortal } from "react-dom";
import { useResolvedSrc } from "@/lib/media";
import type { FrameStyle, MediaAsset, StickerId } from "@/lib/types";
import { useExperience } from "./context";

export const STICKERS: Record<StickerId, string> = {
  none: "",
  bow: "🎀",
  heart: "💗",
  star: "⭐",
  cherry: "🍒",
  flower: "🌸",
  butterfly: "🦋",
  sparkle: "✨",
  cake: "🍰",
  cloud: "☁️",
  strawberry: "🍓",
};

export function Sticker({ id, className = "" }: { id: StickerId; className?: string }) {
  if (id === "none") return null;
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none text-3xl drop-shadow-[0_3px_4px_rgba(0,0,0,0.18)] ${className}`}
    >
      {STICKERS[id]}
    </span>
  );
}

/** Renders an image or (muted, looping) video thumbnail with a shimmer while loading. */
export function MediaView({
  asset,
  className = "",
  cover = true,
  autoPlay = true,
}: {
  asset: MediaAsset | undefined;
  className?: string;
  cover?: boolean;
  autoPlay?: boolean;
}) {
  const { url } = useResolvedSrc(asset?.src);
  const { url: poster } = useResolvedSrc(asset?.poster);
  const [loaded, setLoaded] = useState(false);
  const fit = cover ? "object-cover" : "object-contain";
  if (!asset) return <div className={`shimmer ${className}`} />;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="shimmer absolute inset-0" />}
      {url && asset.kind === "video" ? (
        <video
          src={url}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          className={`h-full w-full ${fit}`}
        />
      ) : url ? (
        <img
          src={url}
          alt={asset.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full ${fit} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {asset.kind === "video" && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur">
          ▶ VIDEO
        </span>
      )}
    </div>
  );
}

/** Word-by-word (or letter-by-letter "cinematic") reveal when scrolled into view. */
export function RevealText({
  text,
  as: Tag = "p",
  className = "",
  delay = 0,
  cinematic,
  once = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  cinematic?: boolean;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <Tag className={className}>{text}</Tag>;
  if (cinematic) {
    let idx = 0;
    const words = text.split(" ");
    return (
      <Tag className={className} aria-label={text}>
        {words.map((w, wi) => (
          <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(w + (wi < words.length - 1 ? " " : "")).map((ch) => {
              const i = idx++;
              return (
                <motion.span
                  key={i}
                  className="inline-block whitespace-pre"
                  initial={{ opacity: 0, filter: "blur(12px)", y: 6 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once }}
                  transition={{ duration: 0.9, delay: delay + i * 0.035, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </Tag>
    );
  }
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once }}
          transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {w + (i < words.length - 1 ? " " : "")}
        </motion.span>
      ))}
    </Tag>
  );
}

export function SceneHeading({
  title,
  sub,
  eyebrow,
  cinematic,
  className = "",
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  cinematic?: boolean;
  className?: string;
}) {
  const { theme } = useExperience();
  return (
    <div className={`relative z-10 mx-auto max-w-2xl px-5 text-center ${className}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 font-script text-2xl text-accent"
        >
          {eyebrow}
        </motion.p>
      )}
      <RevealText
        as="h2"
        text={title}
        cinematic={cinematic}
        className="font-display text-[2.1rem] leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl"
      />
      {sub && (
        <RevealText
          text={sub}
          delay={0.25}
          className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft sm:text-base"
        />
      )}
      <div aria-hidden className="mt-4 flex items-center justify-center gap-2 text-sm opacity-70">
        <span className="h-px w-10 bg-current text-accent" />
        <span>{theme.decorations[0]}</span>
        <span className="h-px w-10 bg-current text-accent" />
      </div>
    </div>
  );
}

/** Photo frame styles used across gallery layouts. */
export function Framed({
  frame,
  children,
  caption,
  className = "",
}: {
  frame: FrameStyle;
  children: ReactNode;
  caption?: string;
  className?: string;
}) {
  switch (frame) {
    case "polaroid":
      return (
        <div className={`bg-white p-2.5 pb-3 shadow-[0_12px_30px_-10px_rgba(80,30,60,0.35)] ${className}`}>
          {children}
          {caption !== undefined && (
            <p className="mt-2 truncate text-center font-hand text-xl leading-none text-[#5b4150]">{caption}</p>
          )}
        </div>
      );
    case "tape":
      return (
        <div className={`relative bg-white p-2 shadow-[0_10px_28px_-10px_rgba(80,30,60,0.35)] ${className}`}>
          <span aria-hidden className="washi absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3" />
          {children}
          {caption !== undefined && (
            <p className="mt-1.5 truncate text-center font-hand text-lg text-[#5b4150]">{caption}</p>
          )}
        </div>
      );
    case "film":
      return (
        <div className={`relative rounded-sm bg-[#1d1a1f] px-2 py-4 shadow-xl ${className}`}>
          <div aria-hidden className="absolute inset-x-0 top-1 flex justify-around">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-1.5 w-2.5 rounded-[2px] bg-white/80" />
            ))}
          </div>
          {children}
          <div aria-hidden className="absolute inset-x-0 bottom-1 flex justify-around">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-1.5 w-2.5 rounded-[2px] bg-white/80" />
            ))}
          </div>
          {caption !== undefined && (
            <p className="mt-1 truncate text-center font-mono text-[10px] tracking-[0.2em] text-amber-200/80 uppercase">
              {caption}
            </p>
          )}
        </div>
      );
    case "heart":
      return (
        <div className={`${className}`}>
          <div className="overflow-hidden drop-shadow-[0_10px_18px_var(--c-glow)]" style={{ clipPath: "url(#lu-heart)" }}>
            {children}
          </div>
          {caption !== undefined && <p className="mt-1 truncate text-center font-hand text-xl text-ink">{caption}</p>}
        </div>
      );
    case "vintage":
      return (
        <div className={`relative bg-[#f8efdc] p-3 shadow-[0_12px_30px_-12px_rgba(90,60,30,0.45)] ${className}`}>
          <div className="sepia-[0.25] saturate-[0.9]">{children}</div>
          {["-left-1 -top-1 rotate-45", "-right-1 -top-1 -rotate-45", "-left-1 -bottom-1 -rotate-45", "-right-1 -bottom-1 rotate-45"].map(
            (c) => (
              <span key={c} aria-hidden className={`absolute h-4 w-7 bg-[#c9a77c]/80 ${c}`} />
            )
          )}
          {caption !== undefined && (
            <p className="mt-2 truncate text-center font-[family-name:var(--font-special)] text-xs tracking-wide text-[#6b5034]">
              {caption}
            </p>
          )}
        </div>
      );
    default:
      return (
        <div className={`overflow-hidden rounded-[22px] bg-white/80 p-1.5 shadow-[0_14px_34px_-12px_var(--c-glow)] ${className}`}>
          <div className="overflow-hidden rounded-[18px]">{children}</div>
          {caption !== undefined && <p className="px-2 py-1.5 truncate text-center font-hand text-lg text-ink">{caption}</p>}
        </div>
      );
  }
}

/**
 * Portal into the experience root (keeps theme CSS variables, escapes transformed
 * ancestors so `position: fixed` overlays behave).
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(children, document.getElementById("lu-root") ?? document.body);
}

/** Shared SVG defs (heart clip path for the heart frame). Render once per page. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <clipPath id="lu-heart" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.2 C0.4,0 0,0.01 0,0.33 C0,0.6 0.3,0.8 0.5,1 C0.7,0.8 1,0.6 1,0.33 C1,0.01 0.6,0 0.5,0.2Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Stable pseudo-random from a string (for consistent tilts). */
export function seeded(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
