"use client";

import { uid } from "./defaults";
import {
  compressImage,
  deleteBlob,
  kindOf,
  mimeOf,
  probeAudio,
  probeVideo,
  readWithProgress,
  saveBlob,
  validateFile,
} from "./media";
import { useStudio, useUploads } from "./store";
import { THEMES } from "./themes";
import type { MediaAsset, MediaKind } from "./types";

type Target =
  | { type: "memories" }
  | { type: "replace-memory"; memoryId: string }
  | { type: "music" }
  | { type: "cover" };

/** Store a file locally (IndexedDB) as a MediaAsset, with real progress + optimisation. */
async function ingest(file: File, allowed: MediaKind[]): Promise<MediaAsset> {
  const err = validateFile(file, allowed);
  const jobId = uid();
  const q = useUploads.getState();
  q.upsert({ id: jobId, name: file.name, progress: 0, stage: "Checking…" });
  if (err) {
    q.patch(jobId, { error: err, stage: "Not added" });
    throw new Error(err);
  }
  try {
    const kind = kindOf(file)!;
    let warning: string | undefined;
    q.patch(jobId, { stage: "Reading…" });
    const raw = await readWithProgress(file, (p) => q.patch(jobId, { progress: p * 0.5 }));
    const id = uid();
    let asset: MediaAsset = { id, kind, name: file.name, mime: mimeOf(file), size: file.size, src: `idb:${id}` };
    if (kind === "image") {
      q.patch(jobId, { stage: "Optimising…", progress: 0.55 });
      const { blob, width, height } = await compressImage(raw);
      q.patch(jobId, { stage: "Saving…", progress: 0.85 });
      await saveBlob(id, blob);
      asset = { ...asset, mime: blob.type || asset.mime, size: blob.size, width, height };
    } else if (kind === "video") {
      q.patch(jobId, { stage: "Making a thumbnail…", progress: 0.6 });
      const info = await probeVideo(raw);
      q.patch(jobId, { stage: "Saving…", progress: 0.85 });
      await saveBlob(id, raw);
      if (info.poster) await saveBlob(`${id}-poster`, info.poster);
      asset = {
        ...asset,
        width: info.width,
        height: info.height,
        duration: info.duration,
        poster: info.poster ? `idb:${id}-poster` : undefined,
      };
      if (!info.playable) {
        warning = "Added — but this browser can't play this video codec. MP4 (H.264) is safest.";
      }
    } else {
      q.patch(jobId, { stage: "Saving…", progress: 0.7 });
      const duration = await probeAudio(raw);
      await saveBlob(id, raw);
      asset = { ...asset, duration };
    }
    q.patch(jobId, { progress: 1, done: true, stage: warning ?? "Added ✓" });
    return asset;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    q.patch(jobId, { error: `${file.name}: ${msg}`, stage: "Failed" });
    throw e;
  }
}

export async function importFiles(files: File[], target: Target) {
  const allowed: MediaKind[] =
    target.type === "music" ? ["audio"] : target.type === "cover" ? ["image"] : ["image", "video"];
  for (const file of files) {
    let asset: MediaAsset;
    try {
      asset = await ingest(file, allowed);
    } catch {
      continue;
    }
    const { update } = useStudio.getState();
    update((c) => {
      c.assets[asset.id] = asset;
      if (target.type === "memories") {
        const theme = THEMES[c.theme];
        c.memories.push({
          id: uid(),
          assetId: asset.id,
          caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 40),
          note: "",
          frame: theme.defaultFrame,
          sticker: "none",
          date: "",
        });
      } else if (target.type === "replace-memory") {
        const m = c.memories.find((x) => x.id === target.memoryId);
        if (m) {
          const old = m.assetId;
          m.assetId = asset.id;
          if (!isAssetUsed(c, old)) void removeAsset(c, old);
        }
      } else if (target.type === "music") {
        const old = c.music.assetId;
        c.music.assetId = asset.id;
        c.music.title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        if (old && !isAssetUsed(c, old)) void removeAsset(c, old);
      } else if (target.type === "cover") {
        const old = c.music.coverAssetId;
        c.music.coverAssetId = asset.id;
        if (old && !isAssetUsed(c, old)) void removeAsset(c, old);
      }
    });
    if (target.type !== "memories") break;
  }
}

function isAssetUsed(c: ReturnType<typeof useStudio.getState>["config"], id: string) {
  return (
    c.memories.some((m) => m.assetId === id) || c.music.assetId === id || c.music.coverAssetId === id
  );
}

/** Remove an asset entry (from a draft config) and its local blobs. Demo files are never deleted. */
async function removeAsset(c: ReturnType<typeof useStudio.getState>["config"], id: string) {
  const a = c.assets[id];
  if (!a) return;
  delete c.assets[id];
  if (a.src.startsWith("idb:")) await deleteBlob(a.src.slice(4));
  if (a.poster?.startsWith("idb:")) await deleteBlob(a.poster.slice(4));
}

export function deleteMemory(memoryId: string) {
  useStudio.getState().update((c) => {
    const m = c.memories.find((x) => x.id === memoryId);
    c.memories = c.memories.filter((x) => x.id !== memoryId);
    if (m && !isAssetUsed(c, m.assetId)) void removeAsset(c, m.assetId);
  });
}
