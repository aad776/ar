"use client";

import { ChevronDown, Eye, GripVertical, Lock } from "lucide-react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ANIMATION_PRESETS, AmbientCanvas } from "@/components/experience/AmbientCanvas";
import { themeStyle } from "@/components/experience/context";
import { SCENE_META, uid } from "@/lib/defaults";
import { useStudio } from "@/lib/store";
import { SCENE_BACKGROUNDS, THEME_LIST, THEMES } from "@/lib/themes";
import { listTimezones, splitDuration, unlockInstant } from "@/lib/time";
import type { BirthdayConfig, LetterColor, SceneAnimation, SceneBackground, SceneId, SceneSettings } from "@/lib/types";
import { Btn, Card, Field, ListEditor, Select, Slider, TextArea, TextInput, Toggle, compactInput } from "./fields";

const useC = () => useStudio((s) => s.config);
const useU = () => useStudio((s) => s.update);

const PLACEHOLDER_HINT = "Use {name}, {nickname} or {sender} anywhere — they're filled in automatically.";

/* ================================================================ personalize */

export function PersonalizePanel() {
  const c = useC();
  const u = useU();
  return (
    <div className="flex flex-col gap-5">
      <Card title="Who is this for?" hint="The basics that appear all over the experience.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Her name" value={c.recipientName} onChange={(v) => u((d) => void (d.recipientName = v))} maxLength={40} />
          <TextInput label="Nickname" value={c.nickname} onChange={(v) => u((d) => void (d.nickname = v))} maxLength={40} hint="Optional — used in playful spots" />
          <TextInput label="From (your name)" value={c.senderName} onChange={(v) => u((d) => void (d.senderName = v))} maxLength={60} hint="Optional signature" />
          <TextInput label="Birthday date" type="date" value={c.birthdayDate} onChange={(v) => u((d) => void (d.birthdayDate = v))} />
        </div>
      </Card>
      <Card title="Opening text" hint={PLACEHOLDER_HINT}>
        <SceneTextFields id="opening" />
      </Card>
      <Card title="Final birthday letter" hint="Shown when she opens the gift box at the very end.">
        <SceneTextFields id="final" />
      </Card>
      <Card title="Little extras">
        <TextInput label="Loading screen text" value={c.extras.loadingText} onChange={(v) => u((d) => void (d.extras.loadingText = v))} />
        <TextInput
          label="Secret easter-egg message"
          value={c.extras.easterEgg}
          onChange={(v) => u((d) => void (d.extras.easterEgg = v))}
          hint="Revealed when she taps her name 5 times in the birthday reveal 🥚"
        />
        <Toggle label="Cute custom cursor" hint="Desktop only — phones keep normal touch" checked={c.extras.cursor} onChange={(v) => u((d) => void (d.extras.cursor = v))} />
        <Toggle label="Button sounds on by default" hint="Off is recommended — she can switch them on from the 🔔 button" checked={c.extras.sounds} onChange={(v) => u((d) => void (d.extras.sounds = v))} />
      </Card>
    </div>
  );
}

/* ================================================================ scene text */

export function SceneTextFields({ id }: { id: SceneId }) {
  const c = useC();
  const u = useU();
  const tx = c.text;
  switch (id) {
    case "opening":
      return (
        <>
          <TextInput label="Line 1" value={tx.opening.line1} onChange={(v) => u((d) => void (d.text.opening.line1 = v))} />
          <TextInput label="Line 2" value={tx.opening.line2} onChange={(v) => u((d) => void (d.text.opening.line2 = v))} />
          <TextInput label="Line 3" value={tx.opening.line3} onChange={(v) => u((d) => void (d.text.opening.line3 = v))} />
          <TextInput label="The question" value={tx.opening.question} onChange={(v) => u((d) => void (d.text.opening.question = v))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Yes button" value={tx.opening.yesLabel} onChange={(v) => u((d) => void (d.text.opening.yesLabel = v))} maxLength={30} />
            <TextInput label="Maybe button" value={tx.opening.maybeLabel} onChange={(v) => u((d) => void (d.text.opening.maybeLabel = v))} maxLength={30} />
          </div>
          <TextArea
            label="Funny 'Maybe' responses"
            hint="One per line. The Maybe button runs away and shows these in turn — after the last one it turns into a YES."
            rows={4}
            value={tx.opening.maybeResponses.join("\n")}
            onChange={(v) => u((d) => void (d.text.opening.maybeResponses = v.split("\n").slice(0, 8)))}
          />
        </>
      );
    case "reveal":
      return (
        <>
          <TextInput label="Big title" value={tx.reveal.title} onChange={(v) => u((d) => void (d.text.reveal.title = v))} hint="Her name is highlighted automatically" />
          <TextArea label="Subtitle" rows={2} value={tx.reveal.subtitle} onChange={(v) => u((d) => void (d.text.reveal.subtitle = v))} />
        </>
      );
    case "cake":
      return (
        <>
          <TextInput label="Heading" value={tx.cake.heading} onChange={(v) => u((d) => void (d.text.cake.heading = v))} />
          <TextInput label="Instruction" value={tx.cake.wishPrompt} onChange={(v) => u((d) => void (d.text.cake.wishPrompt = v))} />
          <TextArea label="Hidden message (after the candles go out)" rows={2} value={tx.cake.hiddenMessage} onChange={(v) => u((d) => void (d.text.cake.hiddenMessage = v))} />
          <Slider label="Candles" min={1} max={9} value={tx.cake.candles} onChange={(v) => u((d) => void (d.text.cake.candles = v))} />
        </>
      );
    case "memories":
    case "special":
    case "letters":
    case "music": {
      const key = id;
      return (
        <>
          <TextInput label="Heading" value={tx[key].heading} onChange={(v) => u((d) => void (d.text[key].heading = v))} />
          <TextInput label="Subheading" value={tx[key].subheading} onChange={(v) => u((d) => void (d.text[key].subheading = v))} />
        </>
      );
    }
    case "universe":
      return (
        <>
          <TextInput label="Line 1" value={tx.universe.line1} onChange={(v) => u((d) => void (d.text.universe.line1 = v))} />
          <TextInput label="Line 2" value={tx.universe.line2} onChange={(v) => u((d) => void (d.text.universe.line2 = v))} />
          <TextInput label="Hint" value={tx.universe.hint} onChange={(v) => u((d) => void (d.text.universe.hint = v))} />
          <p className="text-xs text-[#a77b90]">Each star holds one wish — edit them in the Words tab.</p>
        </>
      );
    case "final":
      return (
        <>
          <TextInput label="Teaser above the gift" value={tx.final.teaser} onChange={(v) => u((d) => void (d.text.final.teaser = v))} />
          <TextArea
            label="The letter"
            rows={9}
            value={tx.final.letter}
            onChange={(v) => u((d) => void (d.text.final.letter = v))}
            hint="Blank lines start new paragraphs. The first paragraph is shown as a big handwritten greeting."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Sign-off" value={tx.final.signoff} onChange={(v) => u((d) => void (d.text.final.signoff = v))} />
            <TextInput label="Closing line" value={tx.final.closing} onChange={(v) => u((d) => void (d.text.final.closing = v))} />
          </div>
        </>
      );
  }
}

/* ================================================================ scenes */

const animOptions: { value: SceneAnimation; label: string }[] = [
  { value: "theme", label: "✨ Same as global animation" },
  ...ANIMATION_PRESETS.map((a) => ({ value: a.id as SceneAnimation, label: `${a.emoji} ${a.name}` })),
];

function SceneRow({ scene, onPreview, pinned }: { scene: SceneSettings; onPreview: (id: SceneId) => void; pinned?: boolean }) {
  const u = useU();
  const controls = useDragControls();
  const [open, setOpen] = useState(false);
  const meta = SCENE_META[scene.id];
  const set = (patch: Partial<SceneSettings>) =>
    u((d) => {
      const s = d.scenes.find((x) => x.id === scene.id);
      if (s) Object.assign(s, patch);
    });
  const inner = (
    <div className={`rounded-2xl border bg-white shadow-sm transition ${scene.enabled ? "border-[#f3dbe5]" : "border-dashed border-[#e7cfd9] opacity-70"}`}>
      <div className="flex items-center gap-2 p-2.5">
        {pinned ? (
          <span className="flex h-9 w-7 items-center justify-center text-[#d2a3b8]" title="The opening always comes first">
            <Lock className="h-3.5 w-3.5" />
          </span>
        ) : (
          <button type="button" aria-label="Drag to reorder" onPointerDown={(e) => controls.start(e)} className="flex h-9 w-7 cursor-grab touch-none items-center justify-center text-[#d2a3b8]">
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className="text-2xl">{meta.emoji}</span>
        <button type="button" onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-[#4a1d36]">{meta.label}</p>
          <p className="truncate text-xs text-[#a77b90]">{meta.blurb}</p>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={scene.enabled}
          aria-label={`${scene.enabled ? "Disable" : "Enable"} ${meta.label}`}
          onClick={() => set({ enabled: !scene.enabled })}
          className={`relative h-6 w-10 shrink-0 rounded-full transition ${scene.enabled ? "bg-[#f0619a]" : "bg-[#e9d5de]"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${scene.enabled ? "left-[18px]" : "left-0.5"}`} />
        </button>
        <button type="button" onClick={() => onPreview(scene.id)} aria-label={`Preview ${meta.label}`} title="Preview this scene" className="flex h-9 w-9 items-center justify-center rounded-full text-[#9a5a78] hover:bg-[#fff0f5]">
          <Eye className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Edit scene" className="flex h-9 w-9 items-center justify-center rounded-full text-[#9a5a78] hover:bg-[#fff0f5]">
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-4 border-t border-[#f6e3ea] p-4">
              {scene.id !== "opening" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Ambient animation" value={scene.animation} options={animOptions} onChange={(v) => set({ animation: v })} />
                  {scene.id === "universe" ? (
                    <Field label="Background">
                      <p className="rounded-2xl bg-[#fff6f9] px-4 py-2.5 text-sm text-[#a77b90]">Always a starry night 🌌</p>
                    </Field>
                  ) : (
                    <Field label="Background">
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(SCENE_BACKGROUNDS) as SceneBackground[]).map((b) => (
                          <button
                            key={b}
                            type="button"
                            title={SCENE_BACKGROUNDS[b].label}
                            aria-label={SCENE_BACKGROUNDS[b].label}
                            aria-pressed={scene.background === b}
                            onClick={() => set({ background: b })}
                            className={`h-9 w-9 rounded-full border-2 transition ${scene.background === b ? "scale-110 border-[#f0619a]" : "border-white shadow"}`}
                            style={{ background: SCENE_BACKGROUNDS[b].css ?? "conic-gradient(#ffd6e5,#e9ddff,#ffe2cf,#ffd6e5)" }}
                          />
                        ))}
                      </div>
                    </Field>
                  )}
                </div>
              )}
              <SceneTextFields id={scene.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  if (pinned) return inner;
  return (
    <Reorder.Item value={scene} dragListener={false} dragControls={controls}>
      {inner}
    </Reorder.Item>
  );
}

export function ScenesPanel({ onPreview }: { onPreview: (id: SceneId) => void }) {
  const c = useC();
  const u = useU();
  const opening = c.scenes.find((s) => s.id === "opening")!;
  const rest = c.scenes.filter((s) => s.id !== "opening");
  return (
    <div className="flex flex-col gap-5">
      <Card title="Scene editor" hint="Drag to reorder, toggle scenes on/off, and expand a scene to edit its words, background and animation. 👁 previews one scene on the right.">
        <SceneRow scene={opening} onPreview={onPreview} pinned />
        <Reorder.Group axis="y" values={rest} onReorder={(next) => u((d) => void (d.scenes = [opening, ...next]))} className="flex flex-col gap-3">
          {rest.map((s) => (
            <SceneRow key={s.id} scene={s} onPreview={onPreview} />
          ))}
        </Reorder.Group>
        {!opening.enabled && <p className="text-xs text-[#a77b90]">With the opening off, she&apos;ll see a simple “tap to open” gate instead (browsers need one tap before music can play).</p>}
      </Card>
    </div>
  );
}

/* ================================================================ words */

const LETTER_COLORS: { value: LetterColor; label: string }[] = [
  { value: "pink", label: "🌸 Pink" },
  { value: "lavender", label: "🪻 Lavender" },
  { value: "peach", label: "🍑 Peach" },
  { value: "cream", label: "🤍 Cream" },
  { value: "mint", label: "🌿 Mint" },
];

export function WordsPanel() {
  const c = useC();
  const u = useU();
  const patch = <K extends "specialCards" | "letters" | "wishes">(key: K, id: string, p: Partial<BirthdayConfig[K][number]>) =>
    u((d) => {
      const item = (d[key] as { id: string }[]).find((x) => x.id === id);
      if (item) Object.assign(item, p);
    });
  return (
    <div className="flex flex-col gap-5">
      <Card title="💗 Little things that make you special" hint="Flip cards — a short title on the front, your message on the back.">
        <ListEditor
          items={c.specialCards}
          onChange={(items) => u((d) => void (d.specialCards = items))}
          addLabel="Add a card"
          empty="No cards yet — this scene will be skipped."
          onAdd={() => u((d) => void d.specialCards.push({ id: uid(), emoji: "🌟", title: "Something lovely about you", message: "Write something sweet here…" }))}
          render={(it) => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input aria-label="Emoji" className={`${compactInput} w-16 text-center`} value={it.emoji} maxLength={4} onChange={(e) => patch("specialCards", it.id, { emoji: e.target.value })} />
                <input aria-label="Title" className={compactInput} value={it.title} maxLength={60} onChange={(e) => patch("specialCards", it.id, { title: e.target.value })} />
              </div>
              <textarea aria-label="Message" className={`${compactInput} resize-y`} rows={2} value={it.message} maxLength={400} onChange={(e) => patch("specialCards", it.id, { message: e.target.value })} />
            </div>
          )}
        />
      </Card>
      <Card title="💌 Open when… letters" hint="Each becomes an envelope that opens into a handwritten letter.">
        <ListEditor
          items={c.letters}
          onChange={(items) => u((d) => void (d.letters = items))}
          addLabel="Add a letter"
          empty="No letters yet — this scene will be skipped."
          onAdd={() => u((d) => void d.letters.push({ id: uid(), label: "Open when you miss me", emoji: "💌", color: "pink", body: "Dear {nickname},\n\n" }))}
          render={(it) => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input aria-label="Emoji" className={`${compactInput} w-16 text-center`} value={it.emoji} maxLength={4} onChange={(e) => patch("letters", it.id, { emoji: e.target.value })} />
                <input aria-label="Envelope label" className={compactInput} value={it.label} maxLength={70} onChange={(e) => patch("letters", it.id, { label: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LETTER_COLORS.map((col) => (
                  <button key={col.value} type="button" onClick={() => patch("letters", it.id, { color: col.value })} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${it.color === col.value ? "bg-[#f0619a] text-white" : "bg-[#fff0f5] text-[#a0336a]"}`}>
                    {col.label}
                  </button>
                ))}
              </div>
              <textarea aria-label="Letter" className={`${compactInput} resize-y`} rows={5} value={it.body} maxLength={3000} onChange={(e) => patch("letters", it.id, { body: e.target.value })} />
            </div>
          )}
        />
      </Card>
      <Card title="🌌 Wishes in the stars" hint="Every glowing star in the Little Universe reveals one of these.">
        <ListEditor
          items={c.wishes}
          onChange={(items) => u((d) => void (d.wishes = items.slice(0, 16)))}
          addLabel="Add a wish"
          empty="No wishes yet — the universe scene will be skipped."
          onAdd={() => u((d) => void (d.wishes.length < 16 && d.wishes.push({ id: uid(), text: "May …" })))}
          render={(it) => <input aria-label="Wish" className={compactInput} value={it.text} maxLength={200} onChange={(e) => patch("wishes", it.id, { text: e.target.value })} />}
        />
        <p className="text-xs text-[#a77b90]">{c.wishes.length}/16 stars</p>
      </Card>
    </div>
  );
}

/* ================================================================ theme */

export function ThemePanel() {
  const c = useC();
  const u = useU();
  return (
    <Card title="Choose a theme" hint="Changes colours, fonts, decorations, card style, frames and scene transitions everywhere.">
      <div className="grid gap-4 sm:grid-cols-2">
        {THEME_LIST.map((th) => {
          const active = c.theme === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onClick={() =>
                u((d) => {
                  d.theme = th.id;
                  // nudge the global ambient to the theme's signature one
                  d.globalAnimation = th.defaultAnimation;
                })
              }
              aria-pressed={active}
              className={`group overflow-hidden rounded-3xl border-2 text-left transition ${active ? "border-[#f0619a] shadow-[0_12px_30px_-12px_rgba(240,97,154,0.6)]" : "border-transparent shadow-sm hover:-translate-y-0.5"}`}
            >
              <div style={themeStyle(th)} className="relative h-36 overflow-hidden bg-dreamy p-4">
                <AmbientCanvas preset={th.defaultAnimation} colors={th.particleColors} density={0.5} />
                <p className="relative font-script text-xl text-accent">{th.emoji} Happy Birthday</p>
                <p className="relative mt-1 font-display text-2xl leading-tight font-semibold text-ink">It&apos;s your day!</p>
                <div className="relative mt-3 flex gap-2">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">YES 💕</span>
                  <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-ink">Maybe 👀</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 bg-white p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#4a1d36]">{th.name}</p>
                  <p className="truncate text-xs text-[#a77b90]">{th.tagline}</p>
                </div>
                <div className="flex shrink-0 -space-x-1.5">
                  {th.swatch.map((s) => (
                    <span key={s} className="h-5 w-5 rounded-full border-2 border-white" style={{ background: s }} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ================================================================ animations */

export function AnimationsPanel() {
  const c = useC();
  const u = useU();
  const theme = THEMES[c.theme];
  return (
    <div className="flex flex-col gap-5">
      <Card title="Global ambient animation" hint="Plays softly behind every scene that uses “Same as global”. Each tile is a live preview.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ANIMATION_PRESETS.map((a) => {
            const active = c.globalAnimation === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => u((d) => void (d.globalAnimation = a.id))}
                aria-pressed={active}
                className={`overflow-hidden rounded-2xl border-2 text-left transition ${active ? "border-[#f0619a]" : "border-transparent shadow-sm hover:-translate-y-0.5"}`}
              >
                <div style={themeStyle(theme)} className="relative flex h-24 items-center justify-center overflow-hidden bg-dreamy">
                  <AmbientCanvas preset={a.id} colors={theme.particleColors} density={0.9} />
                  {a.id === "cinematic" ? (
                    <CinematicSample />
                  ) : (
                    <span className="relative text-2xl">{a.emoji}</span>
                  )}
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[13px] font-semibold text-[#4a1d36]">{a.name}</p>
                  <p className="truncate text-[11px] text-[#a77b90]">{a.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title="Per-scene animation" hint="Override the ambient effect for individual scenes.">
        <div className="flex flex-col gap-2">
          {c.scenes
            .filter((s) => s.id !== "opening")
            .map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm text-[#6b3a55]">
                  {SCENE_META[s.id].emoji} {SCENE_META[s.id].label}
                </span>
                <select
                  aria-label={`Animation for ${SCENE_META[s.id].label}`}
                  className={`${compactInput} py-2 text-sm`}
                  value={s.animation}
                  onChange={(e) =>
                    u((d) => {
                      const x = d.scenes.find((y) => y.id === s.id);
                      if (x) x.animation = e.target.value as SceneAnimation;
                    })
                  }
                >
                  {animOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

function CinematicSample() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((x) => x + 1), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <p key={k} className="relative font-display text-lg text-ink italic" aria-hidden>
      {Array.from("happy birthday").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.6 }}
        >
          {ch}
        </motion.span>
      ))}
    </p>
  );
}

/* ================================================================ countdown */

export function CountdownPanel({ onPreview }: { onPreview: () => void }) {
  const c = useC();
  const u = useU();
  const zones = useMemo(() => listTimezones(), []);
  const unlock = unlockInstant(c.birthdayDate, c.countdown.timezone);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = splitDuration(unlock - now);
  const locked = c.countdown.enabled && now < unlock;
  return (
    <div className="flex flex-col gap-5">
      <Card title="Birthday countdown" hint="Before the big day she'll see a cute countdown instead of the surprise. It unlocks automatically at midnight in the timezone you pick.">
        <Toggle label="Enable countdown mode" hint="Off = the surprise is visible immediately" checked={c.countdown.enabled} onChange={(v) => u((d) => void (d.countdown.enabled = v))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Birthday date" type="date" value={c.birthdayDate} onChange={(v) => u((d) => void (d.birthdayDate = v))} />
          <Field label="Timezone (where she lives)">
            <input list="lu-tz" className={compactInput} value={c.countdown.timezone} onChange={(e) => u((d) => void (d.countdown.timezone = e.target.value))} />
            <datalist id="lu-tz">
              {zones.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </Field>
        </div>
        <TextInput label="Countdown message" value={c.countdown.message} onChange={(v) => u((d) => void (d.countdown.message = v))} />
        <Toggle label="Teaser animation" hint="A wiggling gift box above the timer" checked={c.countdown.teaser} onChange={(v) => u((d) => void (d.countdown.teaser = v))} />
        <div className="rounded-2xl bg-[#fff6f9] p-4 text-sm text-[#6b3a55]">
          {unlock ? (
            <>
              <p>
                Unlocks <b>{new Date(unlock).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</b> (your local time)
              </p>
              <p className="mt-1 text-[#a77b90]">
                {unlock > now ? `${left.days}d ${left.hours}h ${left.minutes}m ${left.seconds}s from now` : "That moment has passed — the experience is open."}{" "}
                {c.countdown.enabled ? (locked ? "· currently LOCKED 🔒" : "· currently OPEN 🎉") : "· countdown is off"}
              </p>
            </>
          ) : (
            <p>Pick a valid date.</p>
          )}
        </div>
        <Btn onClick={onPreview} className="self-start">
          Preview the countdown screen
        </Btn>
        <p className="text-xs text-[#a77b90]">On published links the lock is enforced by the server — the surprise content isn&apos;t sent to her browser until it unlocks.</p>
      </Card>
    </div>
  );
}
