import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const MEDIA_BUCKET = "birthday-media";

/** True when public (anon) Supabase credentials are present. No secret keys are ever used. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let browserClient: SupabaseClient | null = null;

/** Browser client — the creator's session lives in localStorage; RLS protects everything. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured || typeof window === "undefined") return null;
  browserClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return browserClient;
}

/** Stateless server client using the public anon key (reads only through a SECURITY DEFINER RPC). */
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const publicMediaUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
