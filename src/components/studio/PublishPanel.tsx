"use client";

import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Link2, LogOut, Rocket, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  SLUG_RE,
  exportBackup,
  importBackup,
  listMyExperiences,
  publishExperience,
  randomToken,
  setPublished,
  slugify,
  type MyExperience,
  type PublishProgress,
} from "@/lib/publish";
import { useStudio } from "@/lib/store";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase";
import { Btn, Card, TextInput, Toggle } from "./fields";

function BackupCard() {
  const reset = useStudio((s) => s.reset);
  const fileIn = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Card title="Backup & move devices" hint="Your draft (including uploaded media) lives in this browser. Export a backup file to keep it safe or continue on another computer.">
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => exportBackup().then(() => setMsg("Backup downloaded ✓")).catch((e) => setMsg(e.message))}>
          <Download className="h-4 w-4" /> Export backup
        </Btn>
        <Btn onClick={() => fileIn.current?.click()}>
          <Upload className="h-4 w-4" /> Import backup
        </Btn>
        <Btn
          variant="danger"
          onClick={() => {
            if (confirm("Start over? This resets everything to the demo content on this device.")) reset();
          }}
        >
          Reset to demo
        </Btn>
      </div>
      <input
        ref={fileIn}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) importBackup(f).then(() => setMsg("Backup restored ✓")).catch((err) => setMsg(err.message));
        }}
      />
      {msg && <p className="text-sm text-[#6b3a55]">{msg}</p>}
    </Card>
  );
}

function NotConfigured() {
  return (
    <Card title="Cloud publishing isn't configured yet">
      <div className="flex gap-3 rounded-2xl bg-[#fff8e6] p-4 text-sm text-[#6b4a1d]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#d99a1e]" />
        <div className="space-y-2">
          <p>
            Right now everything is saved <b>only in this browser</b>. The preview works perfectly, but a link you send her
            can&apos;t load photos that live on your device — so there&apos;s no shareable link yet.
          </p>
          <p>To publish, connect a free Supabase project (about 5 minutes):</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Create a project at supabase.com.</li>
            <li>
              Run <code className="rounded bg-white px-1">supabase/schema.sql</code> in the SQL editor.
            </li>
            <li>
              Add <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-white px-1">.env.local</code> (and to Vercel).
            </li>
            <li>Restart the app — this tab will show sign-in and publishing.</li>
          </ol>
          <p>Full instructions are in the README. You can always try the public demo link: /birthday/demo</p>
        </div>
      </div>
    </Card>
  );
}

function AuthCard({ onSession }: { onSession: (s: Session | null) => void }) {
  const sb = getBrowserSupabase()!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/studio` } });
        if (error) throw error;
        if (!data.session) setMsg("Check your inbox to confirm your email, then sign in 💌");
        else onSession(data.session);
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSession(data.session);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };
  const magic = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/studio` } });
    setBusy(false);
    setMsg(error ? error.message : "Magic link sent — open it on this device ✨");
  };

  return (
    <Card title={mode === "signin" ? "Sign in to publish" : "Create your creator account"} hint="Only you need an account. She just opens the link — no login, no app.">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <TextInput label="Email" type="email" value={email} onChange={setEmail} />
        <TextInput label="Password" type="password" value={password} onChange={setPassword} hint={mode === "signup" ? "At least 6 characters" : undefined} />
        <div className="flex flex-wrap gap-2">
          <Btn type="submit" variant="primary" disabled={busy || !email || password.length < 6}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Btn>
          <Btn onClick={magic} disabled={busy || !email}>
            Email me a magic link
          </Btn>
          <Btn variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "New here? Create account" : "Have an account? Sign in"}
          </Btn>
        </div>
        {msg && <p className="text-sm text-[#6b3a55]">{msg}</p>}
      </form>
    </Card>
  );
}

function ShareBox({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Someone made a little something for you, ${name}... 🎀 ${url}`;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#f3ebff] p-4">
      <p className="text-xs font-semibold tracking-wide text-[#a0336a] uppercase">Your shareable link</p>
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
        <Link2 className="h-4 w-4 shrink-0 text-[#f0619a]" />
        <span className="min-w-0 flex-1 truncate text-sm text-[#4a1d36]">{url}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn
          variant="primary"
          onClick={() =>
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            })
          }
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy link"}
        </Btn>
        <a className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#25d366] px-4 py-2 text-sm font-semibold text-white" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
          Share on WhatsApp
        </a>
        <a className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#a0336a]" href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" /> Open
        </a>
      </div>
    </div>
  );
}

function Publisher({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const config = useStudio((s) => s.config);
  const publish = useStudio((s) => s.publish);
  const setPublish = useStudio((s) => s.setPublish);
  const replaceConfig = useStudio((s) => s.replaceConfig);
  const [slug, setSlug] = useState(publish.slug ?? slugify(config.recipientName || "birthday"));
  const [unlisted, setUnlisted] = useState(publish.unlisted);
  const [progress, setProgress] = useState<PublishProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(publish.slug ? `${location.origin}/birthday/${publish.slug}` : null);
  const [mine, setMine] = useState<MyExperience[] | null>(null);
  const busy = progress !== null && progress.progress < 1;

  const refresh = () => listMyExperiences().then(setMine).catch(() => setMine([]));
  useEffect(() => {
    void refresh();
  }, []);

  const go = async () => {
    setError(null);
    setProgress({ label: "Preparing…", progress: 0.02 });
    try {
      const res = await publishExperience({ session, slug, unlisted, onProgress: setProgress });
      setUrl(res.url);
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed");
      setProgress(null);
    }
  };

  const toggleUnlisted = (v: boolean) => {
    setUnlisted(v);
    const base = slug.replace(/-[a-z0-9]{6}$/, "");
    setSlug(v ? `${base}-${randomToken()}` : base);
  };

  return (
    <>
      <Card
        title="Publish your little universe"
        hint="Uploads your photos, videos and music to secure cloud storage and creates a public, read-only link."
        actions={
          <Btn variant="ghost" onClick={onSignOut} title={session.user.email ?? ""}>
            <LogOut className="h-4 w-4" /> Sign out
          </Btn>
        }
      >
        <TextInput
          label="Link name"
          value={slug}
          onChange={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          hint={`${typeof location !== "undefined" ? location.origin : ""}/birthday/${slug || "…"}`}
          maxLength={64}
        />
        <Toggle label="Unlisted link" hint="Adds a random code so the link can't be guessed. Pages are never indexed by search engines either way." checked={unlisted} onChange={toggleUnlisted} />
        {!SLUG_RE.test(slug) && slug.length > 0 && <p className="text-xs text-[#c43c3c]">3–64 characters: lowercase letters, numbers and dashes (not at the ends).</p>}
        <Btn variant="primary" onClick={go} disabled={busy || !SLUG_RE.test(slug)} className="self-start px-6">
          <Rocket className="h-4 w-4" /> {publish.lastPublishedAt ? "Publish changes" : "Publish"}
        </Btn>
        {progress && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-[#6b3a55]">
              <span>{progress.label}</span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f3dbe5]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#f0619a] to-[#c47bff] transition-[width] duration-300" style={{ width: `${progress.progress * 100}%` }} />
            </div>
          </div>
        )}
        {error && <p className="rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#c43c3c]">{error}</p>}
        {url && !busy && <ShareBox url={url} name={config.recipientName} />}
        {publish.lastPublishedAt && (
          <p className="text-xs text-[#a77b90]">
            Last published {new Date(publish.lastPublishedAt).toLocaleString()}. Edits you make here stay private until you publish again.
          </p>
        )}
      </Card>
      {mine && mine.length > 0 && (
        <Card title="Your published experiences">
          <div className="flex flex-col gap-2">
            {mine.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#fff6f9] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#4a1d36]">
                    {m.config?.recipientName ?? "Untitled"} <span className="font-normal text-[#a77b90]">/birthday/{m.slug}</span>
                  </p>
                  <p className="text-xs text-[#a77b90]">
                    {m.published ? "Live" : "Unpublished"} · updated {new Date(m.updated_at).toLocaleDateString()}
                    {publish.experienceId === m.id ? " · editing now" : ""}
                  </p>
                </div>
                {publish.experienceId !== m.id && (
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      if (!confirm("Load this experience into the editor? Your current local draft will be replaced.")) return;
                      replaceConfig(m.config);
                      setPublish({ experienceId: m.id, slug: m.slug, unlisted: m.unlisted, lastPublishedAt: Date.parse(m.updated_at) });
                      setSlug(m.slug);
                      setUnlisted(m.unlisted);
                      setUrl(`${location.origin}/birthday/${m.slug}`);
                    }}
                  >
                    Edit
                  </Btn>
                )}
                {publish.experienceId === m.id && (
                  <Btn
                    variant={m.published ? "danger" : "soft"}
                    onClick={() =>
                      setPublished(!m.published)
                        .then(refresh)
                        .catch((e) => setError(e.message))
                    }
                  >
                    {m.published ? "Unpublish" : "Re-publish"}
                  </Btn>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

export function PublishPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {!supabaseConfigured ? (
        <NotConfigured />
      ) : !ready ? (
        <Card title="Checking your session…">
          <div className="shimmer h-10 rounded-2xl" />
        </Card>
      ) : session ? (
        <Publisher session={session} onSignOut={() => void getBrowserSupabase()?.auth.signOut()} />
      ) : (
        <AuthCard onSession={setSession} />
      )}
      <BackupCard />
    </div>
  );
}
