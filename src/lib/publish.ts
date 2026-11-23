"use client";

import type { Session } from "@supabase/supabase-js";
import { loadBlob, saveBlob, deleteBlob } from "./media";
import { useStudio } from "./store";
import { MEDIA_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL, getBrowserSupabase, publicMediaUrl } from "./supabase";
import type { BirthdayConfig } from "./types";

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])$/;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export const randomToken = (n = 6) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/ogg": "ogg",
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/webm": "weba",
  "audio/flac": "flac",
};

/** Upload with real byte progress (supabase-js has no progress callback). */
function uploadWithProgress(path: string, blob: Blob, token: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("cache-control", "31536000");
    xhr.setRequestHeader("Content-Type", blob.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `Upload failed (${xhr.status})`;
      try {
        const j = JSON.parse(xhr.responseText);
        msg = j.message || j.error || msg;
      } catch {
        /* ignore */
      }
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.send(blob);
  });
}

function referencedAssetIds(c: BirthdayConfig) {
  const ids = new Set<string>();
  c.memories.forEach((m) => ids.add(m.assetId));
  if (c.music.assetId) ids.add(c.music.assetId);
  if (c.music.coverAssetId) ids.add(c.music.coverAssetId);
  return ids;
}

export interface PublishProgress {
  label: string;
  /** 0..1 overall */
  progress: number;
}

export async function publishExperience(opts: {
  session: Session;
  slug: string;
  unlisted: boolean;
  onProgress: (p: PublishProgress) => void;
}): Promise<{ url: string; slug: string }> {
  const sb = getBrowserSupabase();
  if (!sb) throw new Error("Cloud publishing is not configured.");
  const { session, slug, unlisted, onProgress } = opts;
  if (!SLUG_RE.test(slug)) throw new Error("Link name must be 3–64 characters: lowercase letters, numbers and dashes.");
  const userId = session.user.id;
  const store = useStudio.getState();
  const experienceId = store.publish.experienceId ?? crypto.randomUUID();
  const folder = `${userId}/${experienceId}`;

  // 1. upload every locally-stored file that the experience actually uses
  const cfg = structuredClone(store.config);
  const used = referencedAssetIds(cfg);
  const jobs: { assetId: string; field: "src" | "poster"; key: string }[] = [];
  for (const id of used) {
    const a = cfg.assets[id];
    if (!a) continue;
    if (a.src.startsWith("idb:")) jobs.push({ assetId: id, field: "src", key: a.src.slice(4) });
    if (a.poster?.startsWith("idb:")) jobs.push({ assetId: id, field: "poster", key: a.poster.slice(4) });
  }
  const blobs = await Promise.all(jobs.map((j) => loadBlob(j.key)));
  const total = blobs.reduce((s, b) => s + (b?.size ?? 0), 0) || 1;
  let doneBytes = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const blob = blobs[i];
    const asset = cfg.assets[job.assetId];
    if (!blob) throw new Error(`The file “${asset.name}” is missing from this device. Please re-upload it.`);
    const ext = EXT[blob.type] ?? (job.field === "poster" ? "jpg" : "bin");
    const path = `${folder}/${job.assetId}${job.field === "poster" ? "-poster" : ""}.${ext}`;
    const label = `Uploading ${asset.name}${job.field === "poster" ? " (thumbnail)" : ""} · ${i + 1}/${jobs.length}`;
    await uploadWithProgress(path, blob, session.access_token, (p) =>
      onProgress({ label, progress: 0.05 + 0.85 * ((doneBytes + p * blob.size) / total) })
    );
    doneBytes += blob.size;
    asset[job.field] = publicMediaUrl(path);
  }

  // 2. drop assets the experience doesn't use, so the public config stays small
  for (const id of Object.keys(cfg.assets)) if (!used.has(id)) delete cfg.assets[id];

  // 3. save the row (RLS: only the owner may insert/update)
  onProgress({ label: "Saving your experience…", progress: 0.93 });
  const { error } = await sb.from("experiences").upsert(
    { id: experienceId, owner_id: userId, slug, config: cfg, published: true, unlisted },
    { onConflict: "id" }
  );
  if (error) {
    if (error.code === "23505") throw new Error("That link name is already taken — try another one.");
    throw new Error(error.message);
  }

  // 4. local config now points at cloud files; free up the local copies
  useStudio.getState().update((d) => {
    for (const j of jobs) {
      const a = d.assets[j.assetId];
      const uploaded = cfg.assets[j.assetId][j.field];
      if (a && uploaded) a[j.field] = uploaded;
    }
  });
  await Promise.all(jobs.map((j) => deleteBlob(j.key).catch(() => {})));
  useStudio.getState().setPublish({ experienceId, slug, unlisted, lastPublishedAt: Date.now() });

  // 5. tidy: remove cloud files no longer referenced
  onProgress({ label: "Tidying up old files…", progress: 0.97 });
  try {
    const { data } = await sb.storage.from(MEDIA_BUCKET).list(folder, { limit: 1000 });
    const keep = new Set(
      Object.values(cfg.assets)
        .flatMap((a) => [a.src, a.poster])
        .filter((s): s is string => Boolean(s?.includes(`/${folder}/`)))
        .map((s) => decodeURIComponent(s.split("/").pop()!))
    );
    const stale = (data ?? []).map((f) => f.name).filter((n) => !keep.has(n));
    if (stale.length) await sb.storage.from(MEDIA_BUCKET).remove(stale.map((n) => `${folder}/${n}`));
  } catch {
    /* non-fatal */
  }

  onProgress({ label: "Published!", progress: 1 });
  return { url: `${window.location.origin}/birthday/${slug}`, slug };
}

export async function setPublished(published: boolean) {
  const sb = getBrowserSupabase();
  const id = useStudio.getState().publish.experienceId;
  if (!sb || !id) return;
  const { error } = await sb.from("experiences").update({ published }).eq("id", id);
  if (error) throw new Error(error.message);
}

export interface MyExperience {
  id: string;
  slug: string;
  published: boolean;
  unlisted: boolean;
  updated_at: string;
  config: BirthdayConfig;
}

export async function listMyExperiences(): Promise<MyExperience[]> {
  const sb = getBrowserSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("experiences")
    .select("id, slug, published, unlisted, updated_at, config")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MyExperience[];
}

/* ------------------------------------------------------------- local backup */

const toDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });

export async function exportBackup() {
  const { config } = useStudio.getState();
  const files: Record<string, string> = {};
  for (const a of Object.values(config.assets)) {
    for (const s of [a.src, a.poster]) {
      if (s?.startsWith("idb:")) {
        const b = await loadBlob(s.slice(4));
        if (b) files[s.slice(4)] = await toDataUrl(b);
      }
    }
  }
  const blob = new Blob([JSON.stringify({ kind: "little-universe-backup", version: 1, config, files })], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `little-universe-${(config.recipientName || "backup").toLowerCase().replace(/\W+/g, "-")}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function importBackup(file: File) {
  const data = JSON.parse(await file.text());
  if (data?.kind !== "little-universe-backup" || !data.config) throw new Error("That doesn't look like a Little Universe backup file.");
  for (const [key, dataUrl] of Object.entries<string>(data.files ?? {})) {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:") || !/^[a-z0-9-]+$/i.test(key)) continue;
    const blob = await (await fetch(dataUrl)).blob();
    await saveBlob(key, blob);
  }
  useStudio.getState().replaceConfig(data.config);
}
