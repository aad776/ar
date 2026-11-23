import type { AnimationPreset, FrameStyle, SceneBackground, ThemeId } from "./types";

export type TransitionStyle = "float" | "blur" | "slide" | "zoom" | "unfold" | "fade-up";

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  dark: boolean;
  vars: Record<string, string>;
  /** CSS var names from next/font */
  fonts: { display: string; script: string; body: string };
  particleColors: string[];
  decorations: string[];
  defaultFrame: FrameStyle;
  defaultAnimation: AnimationPreset;
  transition: TransitionStyle;
  card: "glass" | "paper" | "flat";
  swatch: string[];
}

const base = {
  "--radius-card": "28px",
};

export const THEMES: Record<ThemeId, Theme> = {
  coquette: {
    id: "coquette",
    name: "Pink Coquette Princess",
    tagline: "Bows, blush and a little bit of sparkle",
    emoji: "🎀",
    dark: false,
    vars: {
      ...base,
      "--c-bg": "#fff1f5",
      "--c-bg-2": "#ffe0ea",
      "--c-bg-3": "#f6e3ff",
      "--c-surface": "rgba(255,255,255,0.62)",
      "--c-surface-strong": "rgba(255,255,255,0.88)",
      "--c-border": "rgba(236,72,153,0.18)",
      "--c-ink": "#5b2140",
      "--c-ink-soft": "#9a5a78",
      "--c-accent": "#f0619a",
      "--c-accent-2": "#ffb3cb",
      "--c-accent-3": "#c9a7ff",
      "--c-glow": "rgba(255,143,184,0.55)",
      "--c-paper": "#fffafc",
    },
    fonts: { display: "--font-playfair", script: "--font-dancing", body: "--font-dm" },
    particleColors: ["#ff8fb8", "#ffc2d6", "#f0619a", "#ffd6e5", "#d9b8ff"],
    decorations: ["🎀", "💗", "✨", "🌸", "💕"],
    defaultFrame: "polaroid",
    defaultAnimation: "hearts",
    transition: "float",
    card: "glass",
    swatch: ["#fff1f5", "#ffb3cb", "#f0619a", "#c9a7ff"],
  },
  lavender: {
    id: "lavender",
    name: "Lavender Dreamland",
    tagline: "Soft clouds, lilac skies and slow dreams",
    emoji: "🪻",
    dark: false,
    vars: {
      ...base,
      "--c-bg": "#f5f0ff",
      "--c-bg-2": "#e9ddff",
      "--c-bg-3": "#ffe4f3",
      "--c-surface": "rgba(255,255,255,0.58)",
      "--c-surface-strong": "rgba(255,255,255,0.86)",
      "--c-border": "rgba(139,92,246,0.2)",
      "--c-ink": "#3d2a66",
      "--c-ink-soft": "#7a68a6",
      "--c-accent": "#9b6cff",
      "--c-accent-2": "#d6c2ff",
      "--c-accent-3": "#ffb3d9",
      "--c-glow": "rgba(167,139,250,0.55)",
      "--c-paper": "#fcfaff",
    },
    fonts: { display: "--font-cormorant", script: "--font-dancing", body: "--font-quicksand" },
    particleColors: ["#c4b5fd", "#ddd6fe", "#f9a8d4", "#a78bfa", "#ffffff"],
    decorations: ["🦋", "✨", "☁️", "🪻", "💜"],
    defaultFrame: "rounded",
    defaultAnimation: "butterflies",
    transition: "blur",
    card: "glass",
    swatch: ["#f5f0ff", "#d6c2ff", "#9b6cff", "#ffb3d9"],
  },
  scrapbook: {
    id: "scrapbook",
    name: "Vintage Scrapbook",
    tagline: "Kraft paper, washi tape and typewriter notes",
    emoji: "📎",
    dark: false,
    vars: {
      ...base,
      "--radius-card": "6px",
      "--c-bg": "#f6ecdc",
      "--c-bg-2": "#efdfc6",
      "--c-bg-3": "#f9e1dc",
      "--c-surface": "rgba(255,251,242,0.78)",
      "--c-surface-strong": "#fffaf0",
      "--c-border": "rgba(120,84,48,0.22)",
      "--c-ink": "#4a3424",
      "--c-ink-soft": "#8a6d55",
      "--c-accent": "#d0645a",
      "--c-accent-2": "#e8b4a0",
      "--c-accent-3": "#8fb39a",
      "--c-glow": "rgba(232,180,160,0.5)",
      "--c-paper": "#fffaf0",
    },
    fonts: { display: "--font-special", script: "--font-caveat", body: "--font-dm" },
    particleColors: ["#d0645a", "#e8b4a0", "#8fb39a", "#e9c46a", "#f4a5a5"],
    decorations: ["📎", "🌼", "✂️", "🍒", "💌"],
    defaultFrame: "vintage",
    defaultAnimation: "petals",
    transition: "unfold",
    card: "paper",
    swatch: ["#f6ecdc", "#e8b4a0", "#d0645a", "#8fb39a"],
  },
  starry: {
    id: "starry",
    name: "Starry Night Magic",
    tagline: "Midnight blue, glowing stars, quiet wishes",
    emoji: "🌙",
    dark: true,
    vars: {
      ...base,
      "--c-bg": "#0d0b26",
      "--c-bg-2": "#1c1748",
      "--c-bg-3": "#3a1d55",
      "--c-surface": "rgba(255,255,255,0.08)",
      "--c-surface-strong": "rgba(30,24,72,0.92)",
      "--c-border": "rgba(255,255,255,0.14)",
      "--c-ink": "#fdf4ff",
      "--c-ink-soft": "#c4b5fd",
      "--c-accent": "#ffcf6e",
      "--c-accent-2": "#f9a8d4",
      "--c-accent-3": "#93c5fd",
      "--c-glow": "rgba(255,207,110,0.45)",
      "--c-paper": "#fffaf0",
    },
    fonts: { display: "--font-playfair", script: "--font-dancing", body: "--font-dm" },
    particleColors: ["#ffffff", "#ffe8a3", "#f9a8d4", "#c4b5fd", "#93c5fd"],
    decorations: ["🌙", "⭐", "✨", "🪐", "💫"],
    defaultFrame: "rounded",
    defaultAnimation: "stars",
    transition: "zoom",
    card: "glass",
    swatch: ["#0d0b26", "#3a1d55", "#ffcf6e", "#f9a8d4"],
  },
  peach: {
    id: "peach",
    name: "Soft Peach Aesthetic",
    tagline: "Golden hour, peach fuzz and warm hugs",
    emoji: "🍑",
    dark: false,
    vars: {
      ...base,
      "--c-bg": "#fff4ec",
      "--c-bg-2": "#ffe2cf",
      "--c-bg-3": "#ffe6ea",
      "--c-surface": "rgba(255,255,255,0.6)",
      "--c-surface-strong": "rgba(255,255,255,0.9)",
      "--c-border": "rgba(244,140,100,0.22)",
      "--c-ink": "#5a2f22",
      "--c-ink-soft": "#a06b55",
      "--c-accent": "#f28b6b",
      "--c-accent-2": "#ffc9ad",
      "--c-accent-3": "#f7a8b8",
      "--c-glow": "rgba(255,170,130,0.5)",
      "--c-paper": "#fffaf6",
    },
    fonts: { display: "--font-playfair", script: "--font-caveat", body: "--font-quicksand" },
    particleColors: ["#ffb38a", "#ffd2bb", "#f7a8b8", "#ffe1a8", "#ffffff"],
    decorations: ["🍑", "🌷", "☀️", "🧡", "✨"],
    defaultFrame: "tape",
    defaultAnimation: "petals",
    transition: "fade-up",
    card: "glass",
    swatch: ["#fff4ec", "#ffc9ad", "#f28b6b", "#f7a8b8"],
  },
  minimal: {
    id: "minimal",
    name: "Minimal Elegant Birthday",
    tagline: "Ivory, champagne and quiet elegance",
    emoji: "🤍",
    dark: false,
    vars: {
      ...base,
      "--radius-card": "18px",
      "--c-bg": "#fbf8f3",
      "--c-bg-2": "#f3ede3",
      "--c-bg-3": "#f7efef",
      "--c-surface": "rgba(255,255,255,0.7)",
      "--c-surface-strong": "#ffffff",
      "--c-border": "rgba(60,50,40,0.12)",
      "--c-ink": "#2e2924",
      "--c-ink-soft": "#7d7268",
      "--c-accent": "#b8926a",
      "--c-accent-2": "#e6d5c0",
      "--c-accent-3": "#d9b8b8",
      "--c-glow": "rgba(212,186,150,0.45)",
      "--c-paper": "#ffffff",
    },
    fonts: { display: "--font-cormorant", script: "--font-dancing", body: "--font-dm" },
    particleColors: ["#d4ba96", "#e6d5c0", "#c9a27a", "#efe6da", "#ffffff"],
    decorations: ["🤍", "✦", "🕊️", "🥂", "✧"],
    defaultFrame: "rounded",
    defaultAnimation: "cinematic",
    transition: "blur",
    card: "flat",
    swatch: ["#fbf8f3", "#e6d5c0", "#b8926a", "#2e2924"],
  },
};

export const THEME_LIST = Object.values(THEMES);

export const SCENE_BACKGROUNDS: Record<
  SceneBackground,
  { label: string; css: string | null; dark: boolean }
> = {
  theme: { label: "Theme default", css: null, dark: false },
  blush: {
    label: "Blush",
    css: "radial-gradient(120% 80% at 10% 0%, #ffe0ea 0%, transparent 60%), radial-gradient(100% 70% at 100% 100%, #f6e3ff 0%, transparent 55%), #fff1f5",
    dark: false,
  },
  lavender: {
    label: "Lavender haze",
    css: "radial-gradient(120% 80% at 90% 0%, #e2d4ff 0%, transparent 60%), radial-gradient(100% 70% at 0% 100%, #ffe4f3 0%, transparent 55%), #f6f1ff",
    dark: false,
  },
  peach: {
    label: "Peach glow",
    css: "radial-gradient(120% 80% at 0% 0%, #ffd9c2 0%, transparent 60%), radial-gradient(100% 70% at 100% 100%, #ffe0e8 0%, transparent 55%), #fff5ee",
    dark: false,
  },
  cream: {
    label: "Cream paper",
    css: "radial-gradient(100% 60% at 50% 0%, #fffaf0 0%, transparent 70%), #f8f1e5",
    dark: false,
  },
  sunset: {
    label: "Cotton-candy sunset",
    css: "linear-gradient(180deg, #ffd3e2 0%, #ffe3cf 45%, #e9ddff 100%)",
    dark: false,
  },
  mint: {
    label: "Mint cream",
    css: "radial-gradient(120% 80% at 100% 0%, #d8f5ea 0%, transparent 60%), radial-gradient(100% 70% at 0% 100%, #ffe6ef 0%, transparent 55%), #f6fffb",
    dark: false,
  },
  night: {
    label: "Midnight sky",
    css: "radial-gradient(120% 80% at 50% 0%, #2c1f5e 0%, transparent 65%), radial-gradient(90% 60% at 100% 100%, #4a1f4f 0%, transparent 60%), #0d0b26",
    dark: true,
  },
};

/** Local overrides applied when a scene sits on a dark background inside a light theme. */
export const DARK_SCENE_VARS: Record<string, string> = {
  "--c-ink": "#fdf4ff",
  "--c-ink-soft": "#d8c8ff",
  "--c-surface": "rgba(255,255,255,0.09)",
  "--c-surface-strong": "rgba(36,28,80,0.94)",
  "--c-border": "rgba(255,255,255,0.16)",
};
