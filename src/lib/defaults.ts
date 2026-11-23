import type { BirthdayConfig, MediaAsset, SceneId, SceneSettings } from "./types";

export const SCENE_META: Record<SceneId, { label: string; emoji: string; blurb: string }> = {
  opening: { label: "The Mysterious Opening", emoji: "🎀", blurb: "The secret little gate before everything" },
  reveal: { label: "The Birthday Reveal", emoji: "🎂", blurb: "Big name, confetti and balloons" },
  cake: { label: "Interactive Cake", emoji: "🕯️", blurb: "Blow out the candles & make a wish" },
  memories: { label: "Our Little Memory Lane", emoji: "📸", blurb: "Your photo & video scrapbook" },
  special: { label: "Little Things That Make You Special", emoji: "💗", blurb: "Flip cards with sweet notes" },
  letters: { label: "Open When... Letters", emoji: "💌", blurb: "Envelopes with handwritten letters" },
  music: { label: "A Little Music For You", emoji: "🎵", blurb: "Your song, on a dreamy vinyl player" },
  universe: { label: "The Little Universe", emoji: "🌌", blurb: "A starry sky full of wishes" },
  final: { label: "The Final Surprise", emoji: "🎁", blurb: "A gift box & your final letter" },
};

export const SCENE_ORDER: SceneId[] = [
  "opening",
  "reveal",
  "cake",
  "memories",
  "special",
  "letters",
  "music",
  "universe",
  "final",
];

const demoAsset = (id: string, file: string, name: string): MediaAsset => ({
  id,
  kind: "image",
  name,
  mime: "image/svg+xml",
  size: 0,
  width: 800,
  height: 1000,
  src: `/demo/${file}`,
});

const demoAssets: MediaAsset[] = [
  demoAsset("demo-1", "best-friends.svg", "best-friends.svg"),
  demoAsset("demo-2", "coffee-chats.svg", "coffee-chats.svg"),
  demoAsset("demo-3", "sunset-beach.svg", "sunset-beach.svg"),
  demoAsset("demo-4", "picnic-day.svg", "picnic-day.svg"),
  demoAsset("demo-5", "city-lights.svg", "city-lights.svg"),
  demoAsset("demo-6", "ice-cream.svg", "ice-cream.svg"),
  demoAsset("demo-7", "flower-market.svg", "flower-market.svg"),
  demoAsset("demo-8", "fairy-lights.svg", "fairy-lights.svg"),
  {
    id: "demo-song",
    kind: "audio",
    name: "music-box.wav",
    mime: "audio/wav",
    size: 0,
    duration: 31.6,
    src: "/demo/music-box.wav",
  },
  {
    id: "demo-cover",
    kind: "image",
    name: "cover-art.svg",
    mime: "image/svg+xml",
    size: 0,
    width: 600,
    height: 600,
    src: "/demo/cover-art.svg",
  },
];

const scenes: SceneSettings[] = SCENE_ORDER.map((id) => ({
  id,
  enabled: true,
  animation:
    id === "universe" ? "stars" : id === "memories" ? "polaroids" : id === "final" ? "fireflies" : "theme",
  background: id === "universe" ? "night" : "theme",
}));

export function createDefaultConfig(): BirthdayConfig {
  return {
    version: 1,
    recipientName: "Arshu",
    nickname: "",
    senderName: "your favourite human",
    birthdayDate: "2026-12-14",
    theme: "coquette",
    globalAnimation: "hearts",
    scenes: structuredClone(scenes),
    text: {
      opening: {
        line1: "Hey you! 💗",
        line2: "Someone made a little something for you...",
        line3: "But before that...",
        question: "Are you ready for your surprise? 🎀",
        yesLabel: "YESSS!! 💕",
        maybeLabel: "Maybe... 👀",
        maybeResponses: [
          "Hmm, wrong button 🙈",
          "That button is on vacation 🏝️",
          "Nope. Try again, birthday girl 😌",
          "Okay fine, it's a YES now 💕",
        ],
      },
      reveal: {
        title: "It's your day, {name}!!",
        subtitle: "The world got a little brighter the day you arrived — so today, everything is about you.",
      },
      cake: {
        heading: "Make a wish... ✨",
        wishPrompt: "Tap each candle (or blow into your mic) to make your wish",
        hiddenMessage: "May all your little dreams find their way to you.",
        candles: 5,
      },
      memories: {
        heading: "Our Little Memory Lane",
        subheading: "A few moments I never want to forget",
        layout: "polaroid",
      },
      special: {
        heading: "A few things that make you, YOU!",
        subheading: "Tap a card to peek inside",
      },
      letters: {
        heading: "Open when...",
        subheading: "Little letters for all your moods — open them now or save them for later",
      },
      music: {
        heading: "A little music for you",
        subheading: "Press play, close your eyes, and smile a little",
      },
      universe: {
        line1: "If I could give you a little universe...",
        line2: "Every star would carry a wish for you.",
        hint: "Tap the glowing stars",
      },
      final: {
        teaser: "One last thing for you...",
        letter:
          "Happy Birthday, {name}! 💗\n\nI hope this new chapter brings you all the happiness, adventures, laughter, and beautiful surprises you deserve.\n\nThank you for every late-night talk, every ridiculous inside joke, and every time you made an ordinary day feel like a small celebration.\n\nKeep being your wonderfully unique self.\n\nAnd never forget how special you are!",
        signoff: "With lots of love,",
        closing: "Made with a little extra effort, just for you. 🎀",
      },
    },
    memories: [
      { id: "m1", assetId: "demo-1", caption: "us, basically", note: "two braincells, shared", frame: "polaroid", sticker: "bow", date: "forever ago" },
      { id: "m2", assetId: "demo-2", caption: "coffee & chaos", note: "3 hours, 1 coffee, 400 topics", frame: "tape", sticker: "heart", date: "every sunday" },
      { id: "m3", assetId: "demo-3", caption: "that sunset", note: "you made me stop and look", frame: "polaroid", sticker: "sparkle", date: "summer" },
      { id: "m4", assetId: "demo-4", caption: "picnic day", note: "the strawberries were elite", frame: "rounded", sticker: "strawberry", date: "spring" },
      { id: "m5", assetId: "demo-5", caption: "city lights", note: "walking & talking till 2am", frame: "film", sticker: "star", date: "that night" },
      { id: "m6", assetId: "demo-6", caption: "triple scoop", note: "no regrets", frame: "polaroid", sticker: "cherry", date: "july" },
      { id: "m7", assetId: "demo-7", caption: "flower market", note: "you picked the prettiest ones", frame: "vintage", sticker: "flower", date: "april" },
      { id: "m8", assetId: "demo-8", caption: "best night ever", note: "fairy lights & bad singing", frame: "tape", sticker: "butterfly", date: "new year" },
    ],
    specialCards: [
      { id: "s1", emoji: "😂", title: "Your contagious laugh", message: "It starts small, then takes over the whole room — and suddenly everyone's laughing without knowing why." },
      { id: "s2", emoji: "🌪️", title: "Your chaotic but adorable energy", message: "You turn 'let's just grab food' into an adventure every single time. Never change." },
      { id: "s3", emoji: "🎈", title: "Ordinary moments, made fun", message: "Grocery runs, long walks, waiting in lines — somehow they all become core memories with you." },
      { id: "s4", emoji: "🌷", title: "Your kindness", message: "You notice when someone's quiet. You check in. You remember the little things. That's rare." },
      { id: "s5", emoji: "🦄", title: "Your one-of-a-kind personality", message: "There's literally nobody else like you, and honestly the world is lucky to have the original." },
      { id: "s6", emoji: "✨", title: "The way you show up", message: "For big days, bad days and random Tuesdays — you're always there. I see it, and I'm grateful." },
    ],
    letters: [
      { id: "l1", label: "Open when you need a smile", emoji: "💌", color: "pink", body: "Hi you!\n\nQuick reminder: you once laughed so hard you snorted, then laughed harder BECAUSE you snorted. I think about that at least once a week.\n\nYou're allowed to be this happy all the time." },
      { id: "l2", label: "Open when you're having a bad day", emoji: "🌷", color: "lavender", body: "Hey, it's okay.\n\nBad days don't get to define you — they're just weather. Drink some water, wrap yourself in a blanket, and text me. I'll bring snacks and terrible jokes.\n\nYou've survived 100% of your hardest days so far." },
      { id: "l3", label: "Open when you need motivation", emoji: "✨", color: "peach", body: "Listen up, superstar.\n\nYou are SO much more capable than your brain likes to admit. Remember everything you've already figured out? This is just the next thing.\n\nGo get it. I'm cheering the loudest." },
      { id: "l4", label: "Open on your birthday", emoji: "🎂", color: "cream", body: "HAPPY BIRTHDAY!!\n\nToday you're allowed to: eat cake for breakfast, ignore every responsibility, and be celebrated nonstop.\n\nI hope this year is soft and exciting and full of good surprises — like you." },
    ],
    wishes: [
      { id: "w1", text: "May you always have a reason to laugh until your cheeks hurt." },
      { id: "w2", text: "May every door you knock on open a little wider than you expected." },
      { id: "w3", text: "May your mornings be slow and your coffee always be perfect." },
      { id: "w4", text: "May you find adventure in the places you least expect." },
      { id: "w5", text: "May you be surrounded by people who see how wonderful you are." },
      { id: "w6", text: "May your heart stay soft, and your dreams stay big." },
      { id: "w7", text: "May this be the year everything finally clicks." },
    ],
    assets: Object.fromEntries(demoAssets.map((a) => [a.id, a])),
    music: {
      assetId: "demo-song",
      coverAssetId: "demo-cover",
      title: "Happy Birthday (Music Box)",
      artist: "A little song for you",
      loop: true,
      volume: 0.7,
      vinyl: true,
    },
    countdown: {
      enabled: false,
      timezone: "UTC",
      message: "Something magical is being wrapped for you... come back soon 🎀",
      teaser: true,
    },
    extras: {
      cursor: true,
      sounds: false,
      loadingText: "Wrapping up a little universe for {name}...",
      easterEgg: "You found a secret! Fun fact: you're my favourite person to annoy 💗",
    },
  };
}

/** Fill {name} / {nickname} / {sender} placeholders. */
export function fmt(text: string, c: Pick<BirthdayConfig, "recipientName" | "nickname" | "senderName">) {
  return text
    .replaceAll("{name}", c.recipientName || "you")
    .replaceAll("{nickname}", c.nickname || c.recipientName || "you")
    .replaceAll("{sender}", c.senderName || "");
}

/** Make sure configs saved by older versions / imported JSON have every field. */
export function normalizeConfig(input: unknown): BirthdayConfig {
  const d = createDefaultConfig();
  if (!input || typeof input !== "object") return d;
  const c = input as Partial<BirthdayConfig>;
  const merged: BirthdayConfig = {
    ...d,
    ...c,
    text: {
      opening: { ...d.text.opening, ...c.text?.opening },
      reveal: { ...d.text.reveal, ...c.text?.reveal },
      cake: { ...d.text.cake, ...c.text?.cake },
      memories: { ...d.text.memories, ...c.text?.memories },
      special: { ...d.text.special, ...c.text?.special },
      letters: { ...d.text.letters, ...c.text?.letters },
      music: { ...d.text.music, ...c.text?.music },
      universe: { ...d.text.universe, ...c.text?.universe },
      final: { ...d.text.final, ...c.text?.final },
    },
    music: { ...d.music, ...c.music },
    countdown: { ...d.countdown, ...c.countdown },
    extras: { ...d.extras, ...c.extras },
    assets: c.assets ?? d.assets,
    memories: Array.isArray(c.memories) ? c.memories : d.memories,
    specialCards: Array.isArray(c.specialCards) ? c.specialCards : d.specialCards,
    letters: Array.isArray(c.letters) ? c.letters : d.letters,
    wishes: Array.isArray(c.wishes) ? c.wishes : d.wishes,
  };
  // scenes: keep stored order, append any missing scene ids
  const stored = Array.isArray(c.scenes) ? c.scenes.filter((s) => SCENE_ORDER.includes(s.id)) : [];
  const seen = new Set(stored.map((s) => s.id));
  merged.scenes = [...stored, ...d.scenes.filter((s) => !seen.has(s.id))];
  // opening is always first
  merged.scenes.sort((a, b) => (a.id === "opening" ? -1 : b.id === "opening" ? 1 : 0));
  return merged;
}

export const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  ).replace(/-/g, "").slice(0, 16);
