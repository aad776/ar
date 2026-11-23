"use client";

import { Check, CloudUpload, Eye, Image as ImageIcon, Music, RefreshCw, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { STICKERS } from "@/components/experience/primitives";
import { createDefaultConfig } from "@/lib/defaults";
import { deleteMemory, importFiles } from "@/lib/importer";
import { LIMITS, formatBytes, useResolvedSrc } from "@/lib/media";
import { useStudio, useUploads } from "@/lib/store";
import type { FrameStyle, GalleryLayout, MediaAsset, StickerId } from "@/lib/types";
import { Btn, Card, ListEditor, Slider, TextInput, Toggle, compactInput } from "./fields";

const useC = () => useStudio((s) => s.config);
const useU = () => useStudio((s) => s.update);

export const LAYOUT_OPTIONS: { id: GalleryLayout; name: string; emoji: string; blurb: string }[] = [
  { id: "polaroid", name: "Vintage Polaroid Wall", emoji: "📷", blurb: "Tilted polaroids with tape & parallax" },
  { id: "scrapbook", name: "Cute Pink Scrapbook", emoji: "🎀", blurb: "Photos + handwritten notes on paper" },
  { id: "filmroll", name: "Film Camera Roll", emoji: "🎞️", blurb: "A swipeable strip of film" },
  { id: "floating", name: "Floating Memory Cards", emoji: "☁️", blurb: "Dreamy floating 3D-tilt cards" },
  { id: "magazine", name: "Magazine Editorial Collage", emoji: "📰", blurb: "“The [Name] Issue” cover story" },
];

const FRAMES: { value: FrameStyle; label: string }[] = [
  { value: "polaroid", label: "Polaroid" },
  { value: "tape", label: "Washi tape" },
  { value: "rounded", label: "Soft rounded" },
  { value: "film", label: "Film frame" },
  { value: "heart", label: "Heart" },
  { value: "vintage", label: "Vintage corners" },
];

function Thumb({ asset, className = "" }: { asset?: MediaAsset; className?: string }) {
  const { url } = useResolvedSrc(asset?.kind === "video" ? (asset.poster ?? asset.src) : asset?.src);
  if (!asset) return <div className={`flex items-center justify-center bg-[#fff0f5] text-[#d2a3b8] ${className}`}><ImageIcon className="h-5 w-5" /></div>;
  if (asset.kind === "video" && !asset.poster)
    return url ? <video src={url} muted playsInline preload="metadata" className={`object-cover ${className}`} /> : <div className={`shimmer ${className}`} />;
  return url ? <img src={url} alt="" className={`object-cover ${className}`} /> : <div className={`shimmer ${className}`} />;
}

function PreviewModal({ asset, onClose }: { asset: MediaAsset | null; onClose: () => void }) {
  const { url } = useResolvedSrc(asset?.src);
  return (
    <AnimatePresence>
      {asset && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur" onClick={onClose}>
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-[92vw]">
            <button onClick={onClose} aria-label="Close preview" className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
              <X className="h-4 w-4" />
            </button>
            {url && asset.kind === "video" ? (
              <video src={url} controls autoPlay playsInline className="max-h-[80vh] rounded-2xl bg-black" />
            ) : url && asset.kind === "audio" ? (
              <audio src={url} controls autoPlay className="w-[min(90vw,420px)]" />
            ) : url ? (
              <img src={url} alt={asset.name} className="max-h-[80vh] rounded-2xl" />
            ) : null}
            <p className="mt-2 text-center text-xs text-white/80">
              {asset.name} · {formatBytes(asset.size)}
              {asset.width ? ` · ${asset.width}×${asset.height}` : ""}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function UploadQueue() {
  const jobs = useUploads((s) => s.jobs);
  const clear = useUploads((s) => s.clearDone);
  if (!jobs.length) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#fff6f9] p-3">
      {jobs.map((j) => (
        <div key={j.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold text-[#6b3a55]">{j.name}</span>
            <span className={`shrink-0 ${j.error ? "text-[#c43c3c]" : "text-[#a77b90]"}`}>{j.error ? "Not added" : j.stage}</span>
          </div>
          {j.error ? (
            <p className="text-xs text-[#c43c3c]">{j.error}</p>
          ) : (
            <div className="h-1.5 overflow-hidden rounded-full bg-[#f3dbe5]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#f0619a] to-[#c47bff]" animate={{ width: `${Math.round(j.progress * 100)}%` }} />
            </div>
          )}
        </div>
      ))}
      <button onClick={clear} className="self-end text-xs font-semibold text-[#a0336a] hover:underline">
        Clear finished
      </button>
    </div>
  );
}

function DropZone({ accept, onFiles, label, sub }: { accept: string; onFiles: (f: File[]) => void; label: string; sub: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition ${
        over ? "border-[#f0619a] bg-[#ffe9f1]" : "border-[#f0c7d8] bg-[#fff8fb] hover:bg-[#fff0f5]"
      }`}
    >
      <CloudUpload className="h-8 w-8 text-[#f0619a]" />
      <p className="text-sm font-semibold text-[#5b2140]">{label}</p>
      <p className="text-xs text-[#a77b90]">{sub}</p>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

function StorageMeter() {
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null);
  const memCount = useStudio((s) => s.config.memories.length);
  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setEst({ usage: e.usage ?? 0, quota: e.quota ?? 0 }));
  }, [memCount]);
  if (!est?.quota) return null;
  return (
    <p className="text-xs text-[#a77b90]">
      Saved on this device: {formatBytes(est.usage)} used of ~{formatBytes(est.quota)} available.
    </p>
  );
}

/* ================================================================ memories */

export function MemoriesPanel() {
  const c = useC();
  const u = useU();
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const patch = (id: string, p: Partial<(typeof c.memories)[number]>) =>
    u((d) => {
      const m = d.memories.find((x) => x.id === id);
      if (m) Object.assign(m, p);
    });

  return (
    <div className="flex flex-col gap-5">
      <Card title="Gallery layout" hint="How Memory Lane is arranged.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LAYOUT_OPTIONS.map((l) => {
            const active = c.text.memories.layout === l.id;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={active}
                onClick={() => u((d) => void (d.text.memories.layout = l.id))}
                className={`relative flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition ${active ? "border-[#f0619a] bg-[#fff0f5]" : "border-[#f3dbe5] bg-white hover:-translate-y-0.5"}`}
              >
                {active && <Check className="absolute right-2 top-2 h-4 w-4 text-[#f0619a]" />}
                <span className="text-2xl">{l.emoji}</span>
                <span className="text-[13px] font-semibold text-[#4a1d36]">{l.name}</span>
                <span className="text-[11px] leading-tight text-[#a77b90]">{l.blurb}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Photos & videos" hint="Drag & drop or tap to add. Photos are resized and compressed automatically; videos get a thumbnail.">
        <DropZone
          accept={[...LIMITS.image.types, ...LIMITS.video.types, ".mov,.m4v"].join(",")}
          onFiles={(files) => void importFiles(files, { type: "memories" })}
          label="Drop photos & short videos here"
          sub={`${LIMITS.image.label} · ${LIMITS.video.label}`}
        />
        <UploadQueue />
        <StorageMeter />
        <input
          ref={replaceInput}
          type="file"
          accept={[...LIMITS.image.types, ...LIMITS.video.types].join(",")}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f && replaceId) void importFiles([f], { type: "replace-memory", memoryId: replaceId });
          }}
        />
        <ListEditor
          items={c.memories}
          onChange={(items) => u((d) => void (d.memories = items))}
          onDelete={(m) => deleteMemory(m.id)}
          empty="No memories yet — the Memory Lane scene will be hidden until you add some."
          render={(m) => {
            const asset = c.assets[m.assetId];
            return (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-24">
                  <Thumb asset={asset} className="h-full w-full" />
                  {asset?.kind === "video" && <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-[10px] font-semibold text-white">VIDEO</span>}
                  {asset?.src.startsWith("/demo/") && <span className="absolute left-1 top-1 rounded bg-white/85 px-1.5 text-[10px] font-semibold text-[#a0336a]">demo</span>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex gap-2">
                    <input aria-label="Caption" placeholder="Caption" className={`${compactInput} py-2 text-sm`} value={m.caption} maxLength={60} onChange={(e) => patch(m.id, { caption: e.target.value })} />
                    <input aria-label="Date" placeholder="When?" className={`${compactInput} w-28 py-2 text-sm`} value={m.date} maxLength={24} onChange={(e) => patch(m.id, { date: e.target.value })} />
                  </div>
                  <input aria-label="Handwritten note" placeholder="Handwritten note (optional)" className={`${compactInput} py-2 text-sm`} value={m.note} maxLength={160} onChange={(e) => patch(m.id, { note: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-2">
                    <select aria-label="Frame" className={`${compactInput} w-auto py-1.5 text-xs`} value={m.frame} onChange={(e) => patch(m.id, { frame: e.target.value as FrameStyle })}>
                      {FRAMES.map((f) => (
                        <option key={f.value} value={f.value}>
                          🖼 {f.label}
                        </option>
                      ))}
                    </select>
                    <select aria-label="Sticker" className={`${compactInput} w-auto py-1.5 text-xs`} value={m.sticker} onChange={(e) => patch(m.id, { sticker: e.target.value as StickerId })}>
                      {(Object.keys(STICKERS) as StickerId[]).map((s) => (
                        <option key={s} value={s}>
                          {s === "none" ? "No sticker" : `${STICKERS[s]} ${s}`}
                        </option>
                      ))}
                    </select>
                    <Btn variant="ghost" className="min-h-8 px-2.5 py-1 text-xs" onClick={() => setPreview(asset ?? null)}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Btn>
                    <Btn
                      variant="ghost"
                      className="min-h-8 px-2.5 py-1 text-xs"
                      onClick={() => {
                        setReplaceId(m.id);
                        replaceInput.current?.click();
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Replace
                    </Btn>
                  </div>
                </div>
              </div>
            );
          }}
        />
        {c.memories.some((m) => c.assets[m.assetId]?.src.startsWith("/demo/")) && (
          <Btn
            variant="danger"
            className="self-start"
            onClick={() => u((d) => void (d.memories = d.memories.filter((m) => !d.assets[m.assetId]?.src.startsWith("/demo/"))))}
          >
            <Trash2 className="h-4 w-4" /> Remove all demo photos
          </Btn>
        )}
      </Card>
      <PreviewModal asset={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/* ================================================================ music */

export function MusicPanel() {
  const c = useC();
  const u = useU();
  const song = c.music.assetId ? c.assets[c.music.assetId] : undefined;
  const cover = c.music.coverAssetId ? c.assets[c.music.coverAssetId] : undefined;
  const { url } = useResolvedSrc(song?.src);
  const audioIn = useRef<HTMLInputElement>(null);
  const coverIn = useRef<HTMLInputElement>(null);
  const defaults = createDefaultConfig();

  return (
    <div className="flex flex-col gap-5">
      <Card title="Your song" hint="Plays softly after she taps YES (browsers never allow autoplay before a tap). It fades in and out and stays in a mini-player.">
        <div className="flex items-center gap-4 rounded-2xl bg-[#fff6f9] p-3">
          <button onClick={() => coverIn.current?.click()} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl" aria-label="Change cover image">
            <Thumb asset={cover} className="h-full w-full" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">change cover</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[#4a1d36]">{c.music.title || "No title"}</p>
            <p className="truncate text-xs text-[#a77b90]">
              {song ? `${song.name}${song.size ? ` · ${formatBytes(song.size)}` : ""}` : "No song selected"}
            </p>
            {url && <audio src={url} controls preload="none" className="mt-2 h-9 w-full" />}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="primary" onClick={() => audioIn.current?.click()}>
            <Music className="h-4 w-4" /> {song ? "Replace song" : "Upload a song"}
          </Btn>
          <Btn onClick={() => coverIn.current?.click()}>
            <ImageIcon className="h-4 w-4" /> Cover image
          </Btn>
          {song && (
            <Btn variant="danger" onClick={() => u((d) => void (d.music.assetId = null))}>
              <Trash2 className="h-4 w-4" /> No music
            </Btn>
          )}
          {c.music.assetId !== "demo-song" && (
            <Btn
              variant="ghost"
              onClick={() =>
                u((d) => {
                  d.assets["demo-song"] = defaults.assets["demo-song"];
                  d.assets["demo-cover"] = defaults.assets["demo-cover"];
                  d.music = { ...d.music, assetId: "demo-song", coverAssetId: d.music.coverAssetId ?? "demo-cover", title: defaults.music.title, artist: defaults.music.artist };
                })
              }
            >
              Use the demo music-box tune
            </Btn>
          )}
        </div>
        <input ref={audioIn} type="file" accept={[...LIMITS.audio.types, ".mp3,.m4a,.wav,.flac,.ogg"].join(",")} hidden onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void importFiles([f], { type: "music" });
        }} />
        <input ref={coverIn} type="file" accept={LIMITS.image.types.join(",")} hidden onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void importFiles([f], { type: "cover" });
        }} />
        <UploadQueue />
        <p className="text-xs text-[#a77b90]">{LIMITS.audio.label}. Only upload music you have the right to share.</p>
      </Card>
      <Card title="Player settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Song title" value={c.music.title} onChange={(v) => u((d) => void (d.music.title = v))} />
          <TextInput label="Artist / subtitle" value={c.music.artist} onChange={(v) => u((d) => void (d.music.artist = v))} />
        </div>
        <Slider label="Starting volume" min={0} max={1} step={0.05} value={c.music.volume} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => u((d) => void (d.music.volume = v))} />
        <Toggle label="Loop the song" checked={c.music.loop} onChange={(v) => u((d) => void (d.music.loop = v))} />
        <Toggle label="Spinning vinyl record" hint="Off shows a square album cover instead" checked={c.music.vinyl} onChange={(v) => u((d) => void (d.music.vinyl = v))} />
      </Card>
    </div>
  );
}
