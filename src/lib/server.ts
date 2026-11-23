import "server-only";
import { bakedExperiences } from "./baked";
import { createDefaultConfig, normalizeConfig } from "./defaults";
import { SUPABASE_URL, getServerSupabase, supabaseConfigured } from "./supabase";
import { unlockInstant } from "./time";
import type { BirthdayConfig, LockedTeaser } from "./types";

export type ExperienceLookup =
  | { status: "ok"; config: BirthdayConfig; unlisted: boolean; demo: boolean }
  | { status: "not-found" }
  | { status: "unconfigured" };

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])$/;

export async function lookupExperience(slug: string): Promise<ExperienceLookup> {
  if (slug === "demo") return { status: "ok", config: createDefaultConfig(), unlisted: false, demo: true };
  if (!SLUG_RE.test(slug)) return { status: "not-found" };
  // Experiences bundled into the build (scripts/bake-backup.mjs) - no cloud needed.
  if (Object.hasOwn(bakedExperiences, slug)) {
    const config = normalizeConfig(structuredClone(bakedExperiences[slug]));
    return { status: "ok", config: sanitize(config), unlisted: true, demo: false };
  }
  if (!supabaseConfigured) return { status: "unconfigured" };
  const sb = getServerSupabase()!;
  // Only an exact-slug lookup is possible: anon has no SELECT on the table itself.
  const { data, error } = await sb.rpc("get_published_experience", { p_slug: slug });
  if (error) {
    console.error("[birthday] lookup failed", error.message);
    return { status: "not-found" };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.config) return { status: "not-found" };
  return { status: "ok", config: sanitize(normalizeConfig(row.config)), unlisted: Boolean(row.unlisted), demo: false };
}

/** Public pages only load media from our storage bucket or bundled demo files. */
function sanitize(config: BirthdayConfig): BirthdayConfig {
  const okUrl = (s?: string) => !!s && (s.startsWith("/demo/") || s.startsWith("/u/") || (!!SUPABASE_URL && s.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`)));
  for (const [id, a] of Object.entries(config.assets)) {
    if (!okUrl(a.src)) delete config.assets[id];
    else if (a.poster && !okUrl(a.poster)) delete a.poster;
  }
  return config;
}

/** Countdown gating happens on the server so the surprise isn't sent early. */
export function lockedTeaser(config: BirthdayConfig, now = Date.now()): LockedTeaser | null {
  if (!config.countdown.enabled) return null;
  const unlockAt = unlockInstant(config.birthdayDate, config.countdown.timezone);
  if (!unlockAt || now >= unlockAt) return null;
  return {
    recipientName: config.recipientName,
    nickname: config.nickname,
    birthdayDate: config.birthdayDate,
    theme: config.theme,
    globalAnimation: config.globalAnimation,
    countdown: config.countdown,
    unlockAt,
  };
}
