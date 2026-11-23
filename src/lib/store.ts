"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDefaultConfig, normalizeConfig } from "./defaults";
import type { BirthdayConfig } from "./types";

export const STUDIO_KEY = "little-universe-studio";

export interface PublishInfo {
  experienceId: string | null;
  slug: string | null;
  unlisted: boolean;
  lastPublishedAt: number | null;
}

interface StudioState {
  config: BirthdayConfig;
  publish: PublishInfo;
  /** Mutate a deep copy of the config. */
  update: (recipe: (draft: BirthdayConfig) => void) => void;
  replaceConfig: (c: BirthdayConfig) => void;
  setPublish: (p: Partial<PublishInfo>) => void;
  reset: () => void;
}

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function freshConfig() {
  const c = createDefaultConfig();
  if (typeof window !== "undefined") c.countdown.timezone = browserTimezone();
  return c;
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      config: freshConfig(),
      publish: { experienceId: null, slug: null, unlisted: false, lastPublishedAt: null },
      update: (recipe) =>
        set((s) => {
          const draft = structuredClone(s.config);
          recipe(draft);
          return { config: draft };
        }),
      replaceConfig: (c) => set({ config: normalizeConfig(c) }),
      setPublish: (p) => set((s) => ({ publish: { ...s.publish, ...p } })),
      reset: () =>
        set({
          config: freshConfig(),
          publish: { experienceId: null, slug: null, unlisted: false, lastPublishedAt: null },
        }),
    }),
    {
      name: STUDIO_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ config: s.config, publish: s.publish }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudioState>;
        return {
          ...current,
          config: p.config ? normalizeConfig(p.config) : current.config,
          publish: { ...current.publish, ...p.publish },
        };
      },
    }
  )
);

/* ------------------------------------------------------------- upload queue */

export interface UploadJob {
  id: string;
  name: string;
  progress: number;
  stage: string;
  error?: string;
  done?: boolean;
}

interface QueueState {
  jobs: UploadJob[];
  upsert: (j: UploadJob) => void;
  patch: (id: string, p: Partial<UploadJob>) => void;
  clearDone: () => void;
}

export const useUploads = create<QueueState>()((set) => ({
  jobs: [],
  upsert: (j) => set((s) => ({ jobs: [...s.jobs.filter((x) => x.id !== j.id), j] })),
  patch: (id, p) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...p } : j)) })),
  clearDone: () => set((s) => ({ jobs: s.jobs.filter((j) => !j.done && !j.error) })),
}));
