"use client";

import { createStore, del, get, set } from "idb-keyval";
import { useEffect, useState } from "react";
import type { MediaKind } from "./types";

/* ------------------------------------------------------------------ IndexedDB */

let _store: ReturnType<typeof createStore> | null = null;
const store = () => (_store ??= createStore("little-universe", "media"));

export const saveBlob = (key: string, blob: Blob) => set(key, blob, store());
export const loadBlob = (key: string) => get<Blob>(key, store());
export const deleteBlob = async (key: string) => {
  await del(key, store());
  const cached = urlCache.get(`idb:${key}`);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(`idb:${key}`);
  }
};

/* ------------------------------------------------------------- URL resolving */

const urlCache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

export async function resolveSrc(src: string | undefined | null): Promise<string | null> {
  if (!src) return null;
  if (!src.startsWith("idb:")) return src;
  const hit = urlCache.get(src);
  if (hit) return hit;
  let p = pending.get(src);
  if (!p) {
    p = loadBlob(src.slice(4)).then((blob) => {
      pending.delete(src);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      urlCache.set(src, url);
      return url;
    });
    pending.set(src, p);
  }
  return p;
}

/** Resolves an asset src ("/demo/..", "idb:..", "https://..") to a usable URL. */
export function useResolvedSrc(src: string | undefined | null) {
  const sync = !src ? null : src.startsWith("idb:") ? (urlCache.get(src) ?? null) : src;
  const [resolved, setResolved] = useState<{ src: string; url: string | null } | null>(null);
  useEffect(() => {
    if (!src || !src.startsWith("idb:")) return;
    let alive = true;
    resolveSrc(src).then((u) => alive && setResolved({ src, url: u }));
    return () => {
      alive = false;
    };
  }, [src]);
  const hit = resolved && resolved.src === src ? resolved : null;
  return { url: sync ?? hit?.url ?? null, missing: hit ? hit.url === null : false };
}

/* ---------------------------------------------------------------- validation */

export const LIMITS: Record<MediaKind, { mb: number; types: string[]; label: string }> = {
  image: {
    mb: 25,
    types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    label: "JPG, PNG, WEBP, GIF or AVIF up to 25 MB",
  },
  video: {
    mb: 50,
    types: ["video/mp4", "video/webm", "video/quicktime"],
    label: "MP4, WEBM or MOV up to 50 MB (keep it short!)",
  },
  audio: {
    mb: 25,
    types: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/ogg",
      "audio/aac",
      "audio/mp4",
      "audio/x-m4a",
      "audio/m4a",
      "audio/webm",
      "audio/flac",
    ],
    label: "MP3, WAV, M4A, OGG, AAC or FLAC up to 25 MB",
  },
};

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",
};

export function mimeOf(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? "";
}

export function kindOf(file: File): MediaKind | null {
  const m = mimeOf(file);
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  return null;
}

export function validateFile(file: File, allowed: MediaKind[]): string | null {
  const kind = kindOf(file);
  const mime = mimeOf(file);
  if (/hei[cf]/i.test(mime) || /\.hei[cf]$/i.test(file.name))
    return `${file.name}: HEIC photos don't display in most browsers — please export as JPG first.`;
  if (!kind || !allowed.includes(kind)) return `${file.name}: this file type isn't supported here.`;
  const lim = LIMITS[kind];
  if (!lim.types.includes(mime)) return `${file.name}: unsupported format. Use ${lim.label}.`;
  if (file.size > lim.mb * 1024 * 1024)
    return `${file.name}: too large (${(file.size / 1048576).toFixed(1)} MB). Max ${lim.mb} MB.`;
  return null;
}

/* ------------------------------------------------------------ optimisation */

export async function compressImage(
  file: Blob,
  maxDim = 1800,
  quality = 0.84
): Promise<{ blob: Blob; width: number; height: number }> {
  // GIFs would lose animation, tiny files aren't worth it
  if (file.type === "image/gif") {
    const { width, height } = await imageSize(file);
    return { blob: file, width, height };
  }
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const webp = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  const out =
    webp && webp.type === "image/webp"
      ? webp
      : await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
  if (!out || out.size >= file.size) return { blob: file, width, height };
  return { blob: out, width, height };
}

function imageSize(blob: Blob) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ width: 800, height: 1000 });
    img.src = url;
  });
}

export function probeVideo(blob: Blob): Promise<{
  poster: Blob | null;
  width: number;
  height: number;
  duration: number;
  playable: boolean;
}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    let done = false;
    const finish = (r: Awaited<ReturnType<typeof probeVideo>>) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(
      () => finish({ poster: null, width: 720, height: 1280, duration: 0, playable: false }),
      8000
    );
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.6, (v.duration || 1) / 3);
    };
    v.onseeked = () => {
      const w = v.videoWidth || 720;
      const h = v.videoHeight || 1280;
      const scale = Math.min(1, 900 / Math.max(w, h));
      const c = document.createElement("canvas");
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(
        (b) => {
          clearTimeout(timer);
          finish({ poster: b, width: w, height: h, duration: v.duration || 0, playable: true });
        },
        "image/jpeg",
        0.8
      );
    };
    v.onerror = () => {
      clearTimeout(timer);
      finish({ poster: null, width: 720, height: 1280, duration: 0, playable: false });
    };
    v.src = url;
  });
}

export function probeAudio(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("audio");
    a.preload = "metadata";
    const t = setTimeout(() => resolve(0), 6000);
    a.onloadedmetadata = () => {
      clearTimeout(t);
      resolve(a.duration || 0);
      URL.revokeObjectURL(url);
    };
    a.onerror = () => {
      clearTimeout(t);
      resolve(0);
    };
    a.src = url;
  });
}

/** Read a file while reporting real byte progress. */
export function readWithProgress(file: File, onProgress: (p: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    r.onload = () => resolve(new Blob([r.result as ArrayBuffer], { type: mimeOf(file) }));
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}

export const formatBytes = (n: number) =>
  n <= 0 ? "—" : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
