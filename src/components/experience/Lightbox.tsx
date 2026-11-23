"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useResolvedSrc } from "@/lib/media";
import type { MediaAsset, Memory } from "@/lib/types";
import { useMusic } from "./music";
import { Portal, Sticker } from "./primitives";

export interface GalleryItem {
  memory: Memory;
  asset: MediaAsset;
}

function FullMedia({ asset }: { asset: MediaAsset }) {
  const { url } = useResolvedSrc(asset.src);
  const { url: poster } = useResolvedSrc(asset.poster);
  const music = useMusic();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => () => music.duck(false), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!url) return <div className="shimmer aspect-[4/5] w-[min(80vw,420px)] rounded-2xl" />;
  if (asset.kind === "video")
    return (
      <video
        ref={videoRef}
        src={url}
        poster={poster ?? undefined}
        controls
        autoPlay
        playsInline
        preload="auto"
        onPlay={(e) => music.duck(!e.currentTarget.muted)}
        onPause={() => music.duck(false)}
        onEnded={() => music.duck(false)}
        onVolumeChange={(e) => music.duck(!e.currentTarget.muted && !e.currentTarget.paused)}
        className="max-h-[68svh] w-auto max-w-[92vw] rounded-2xl bg-black shadow-2xl"
      />
    );
  return (
    <img
      src={url}
      alt={asset.name}
      draggable={false}
      className="max-h-[68svh] w-auto max-w-[92vw] rounded-2xl object-contain shadow-2xl"
    />
  );
}

export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const go = (d: number) => {
    if (index === null) return;
    onIndex((index + d + items.length) % items.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  });

  return (
    <Portal>
      <AnimatePresence>
        {item && (
          <motion.div
            key="lb"
            role="dialog"
            aria-modal
            aria-label={item.memory.caption || "Memory"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#1a0d16]/80 px-4 backdrop-blur-xl"
            onClick={onClose}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.memory.id}
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                drag={items.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(1);
                  else if (info.offset.x > 70) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex touch-pan-y flex-col items-center"
              >
                <div className="relative rounded-[22px] bg-white p-2.5 pb-4 shadow-2xl">
                  <FullMedia asset={item.asset} />
                  <Sticker id={item.memory.sticker} className="absolute -right-4 -top-5 rotate-12 text-5xl" />
                  {(item.memory.caption || item.memory.date) && (
                    <div className="mt-3 flex items-baseline justify-between gap-4 px-1.5">
                      <p className="font-hand text-2xl leading-none text-[#5b4150]">{item.memory.caption}</p>
                      {item.memory.date && <p className="shrink-0 font-hand text-lg text-[#9a7a8a]">{item.memory.date}</p>}
                    </div>
                  )}
                </div>
                {item.memory.note && (
                  <p className="mt-4 max-w-md text-center font-script text-2xl text-white drop-shadow">{item.memory.note}</p>
                )}
              </motion.div>
            </AnimatePresence>
            {items.length > 1 && (
              <div className="mt-5 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => go(-1)} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                  <ChevronLeft />
                </button>
                <span className="text-sm text-white/80 tabular-nums">
                  {(index ?? 0) + 1} / {items.length}
                </span>
                <button onClick={() => go(1)} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                  <ChevronRight />
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-white/50">swipe or use arrows</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
