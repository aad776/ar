# A Little Universe Made For You 💗

An interactive, art-directed birthday surprise website **plus** a no-code Customization Studio to personalise it, preview it on phone/desktop and publish it as one shareable link.

The recipient just opens `https://your-domain.com/birthday/<name>` — no app, no account, no login.

---

## What's inside

**The experience** (`/birthday/[slug]`, `/preview`)

| # | Scene | Highlights |
|---|-------|-----------|
| 1 | The Mysterious Opening | Timed text reveal, "YESSS!! 💕" starts everything (and unlocks audio); "Maybe… 👀" runs away with funny replies, then turns into a YES |
| 2 | The Birthday Reveal | GSAP letter-by-letter title, confetti + side cannons, rising balloons, **easter egg:** tap her name 5× |
| 3 | Interactive Cake | Illustrated 3-tier cake, flickering candles, tap **or blow into the mic** (permission-based, tap fallback), smoke puffs, hidden wish |
| 4 | Memory Lane | Photos **and videos**, 5 layouts (Polaroid Wall · Pink Scrapbook · Film Roll · Floating Cards · Magazine), 6 frames, stickers, washi tape, handwritten notes, parallax, swipeable lightbox (music ducks while a video plays) |
| 5 | Little Things… | 3D flip cards with heart bursts |
| 6 | Open When… | Envelopes that open, letter slides out, typewriter handwriting |
| 7 | A Little Music | Vinyl player with tonearm, seek, volume, loop, fade in/out, floating notes; mini-player stays on screen |
| 8 | The Little Universe | Canvas night sky, shooting stars, wish stars that connect into a constellation |
| 9 | Final Surprise | Gift box shakes, ribbon unties, lid flies, light beam, background transforms, letter, fireworks, replay |

Plus: personalised loading screen, scene dots nav, custom cursor (desktop), optional soft UI sounds (muted by default), replay button, countdown mode, beautiful share-preview image, `prefers-reduced-motion` support everywhere.

**The Studio** (`/studio`)

- **Personalize** – name, nickname, sender, date, opening text, "maybe" replies, final letter, loading text, easter egg
- **Scenes** – enable/disable, drag to reorder, per-scene text, background & animation, 👁 preview a single scene
- **Memories** – drag & drop upload with progress, validation (type/size), automatic resize + WebP compression, video thumbnails, captions/notes/frames/stickers, replace, delete, reorder, preview
- **Cards & Letters** – create/edit/delete/reorder flip cards, letters and wishes
- **Music** – upload song + cover, title, artist, volume, loop, vinyl toggle
- **Theme** – 6 themes: Pink Coquette Princess · Lavender Dreamland · Vintage Scrapbook · Starry Night Magic · Soft Peach Aesthetic · Minimal Elegant Birthday (colours, fonts, decorations, card style, frames, transitions)
- **Animations** – 8 presets with live previews: Floating Hearts · Sparkling Stars · Confetti · Butterfly Garden · Falling Petals · Magical Fireflies · Polaroid Shuffle · Cinematic Text Reveal
- **Countdown** – date, timezone, message, teaser; unlocks automatically at midnight in her timezone
- **Publish** – creator sign-in, link name, unlisted links, upload progress, copy / WhatsApp share, unpublish, edit previously published experiences
- **Live preview** – mobile & desktop device frames that update as you type, plus full-screen preview

Everything has polished demo content (illustrations + a generated music-box "Happy Birthday" — public-domain melody), so it looks complete before you add anything.

---

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000          landing
# http://localhost:3000/studio   the studio
# http://localhost:3000/birthday/demo   the public demo
```

### Local-only mode (no cloud configured)

Without Supabase credentials the app is a **fully working local demo**: the studio saves your text to `localStorage` and your photos/videos/music to **IndexedDB in your browser**, and `/preview` plays the complete experience.

> ⚠️ Local mode **cannot** produce a shareable link — your media lives only on your device. Use **Publish → Export backup** to save or move your draft. Publishing requires the setup below.

---

## Enable publishing (Supabase, ~5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste and run [`supabase/schema.sql`](supabase/schema.sql). It creates:
   - `experiences` table with **Row Level Security** (creators can only read/write their own rows)
   - `get_published_experience(slug)` – the *only* way anonymous visitors can read, and only one published experience by exact slug (nobody can list everyone's birthdays)
   - `birthday-media` storage bucket with a **50 MB limit and MIME allow-list** enforced server-side, and policies that let a creator write only inside their own `<user-id>/` folder
3. **Authentication → Providers → Email**: keep enabled. (Optionally disable "Confirm email" for quicker testing.) Under **URL Configuration**, set the Site URL to your domain and add `https://your-domain.com/studio` to redirect URLs (for magic links).
4. **Project Settings → API**: copy the Project URL and the `anon` public key into `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. Restart `npm run dev`. The **Publish** tab now shows sign-in.

Only the public anon key is used. **Never** add the `service_role` key to this app — it isn't needed.

### How publishing works

1. You sign in (email + password, or magic link).
2. Every locally stored file the experience uses is uploaded to `birthday-media/<your-id>/<experience-id>/…` with real byte progress.
3. The config (text + public file URLs, no secrets) is upserted into `experiences`. Unused cloud files are cleaned up.
4. You get `https://your-domain.com/birthday/<slug>` to copy or share on WhatsApp.

Edits stay private in the studio until you click **Publish changes**. **Unpublish** takes the link offline immediately.

### Security notes

- Database writes are protected by RLS (owner-only); storage writes are restricted to the creator's own folder; the bucket enforces size + type limits (SVG is not allowed).
- Anonymous visitors can't query the table — only fetch one published experience by its exact slug.
- **Unlisted links** add a random code to the slug so the link can't be guessed. All birthday pages send `noindex`.
- Media files are public-by-URL (that's what lets her open them without logging in), with unguessable paths.
- The public page only loads media from your Supabase bucket or the bundled `/demo/` files.
- **Countdown is enforced on the server:** before the unlock time, the page only receives her name, the date and the countdown message — the surprise itself isn't sent until midnight in the configured timezone.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo** (framework auto-detected: Next.js).
3. Add environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com` (used for absolute share-preview image URLs; falls back to the Vercel production URL)
4. Deploy. In Supabase → Authentication → URL Configuration, set the Site URL to the Vercel domain and add `https://<domain>/studio` as a redirect URL.
5. Open `https://<domain>/studio` → build → Publish → send the link 💌

---

## Project structure

```
src/
  app/
    page.tsx                     landing
    studio/                      customization studio (client-only)
    preview/                     local full-screen / embedded preview
    birthday/[slug]/             public page, OG image, not-found
  components/
    experience/                  the birthday experience
      Experience.tsx             stage machine: loading → countdown → gate → story
      scenes/*.tsx               the 9 scenes
      AmbientCanvas.tsx          8 canvas animation presets
      music.tsx                  audio engine (fade, duck, loop) + context
      chrome.tsx                 loading, countdown, mini-player, nav, cursor
      primitives.tsx Lightbox.tsx SceneShell.tsx
    studio/                      studio shell, panels, fields, publish
  lib/
    types.ts defaults.ts themes.ts   data model, demo content, 6 themes
    store.ts                     zustand (persisted) editor state
    media.ts importer.ts         IndexedDB, validation, compression, probing
    publish.ts supabase.ts server.ts   cloud publish + public lookup
    time.ts fx.ts sfx.ts hooks.ts
supabase/schema.sql              tables, RLS, RPC, bucket + policies
scripts/make-demo-assets.mjs     regenerates demo illustrations + music box
```

**Tech:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion for React · GSAP · Lucide · Zustand · idb-keyval · canvas-confetti · Supabase.

## Tips

- Placeholders `{name}`, `{nickname}`, `{sender}` work in any text.
- Phone videos: MP4 (H.264) plays everywhere; HEVC/MOV may not play on some Android/Chrome devices. HEIC photos need exporting as JPG first.
- Keep videos short (under ~50 MB). Photos are compressed automatically.
- Browsers never allow sound before a tap. Music starts when she presses YES.
