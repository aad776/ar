export type SceneId =
  | "opening"
  | "reveal"
  | "cake"
  | "memories"
  | "special"
  | "letters"
  | "music"
  | "universe"
  | "final";

export type ThemeId = "coquette" | "lavender" | "scrapbook" | "starry" | "peach" | "minimal";

export type AnimationPreset =
  | "hearts"
  | "stars"
  | "confetti"
  | "butterflies"
  | "petals"
  | "fireflies"
  | "polaroids"
  | "cinematic"
  | "none";

/** "theme" means: inherit the global ambient animation */
export type SceneAnimation = AnimationPreset | "theme";

export type GalleryLayout = "polaroid" | "scrapbook" | "filmroll" | "floating" | "magazine";

export type FrameStyle = "polaroid" | "tape" | "rounded" | "film" | "heart" | "vintage";

export type StickerId =
  | "none"
  | "bow"
  | "heart"
  | "star"
  | "cherry"
  | "flower"
  | "butterfly"
  | "sparkle"
  | "cake"
  | "cloud"
  | "strawberry";

export type SceneBackground =
  | "theme"
  | "blush"
  | "lavender"
  | "peach"
  | "cream"
  | "sunset"
  | "mint"
  | "night";

export type MediaKind = "image" | "video" | "audio";

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  name: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  /** "/demo/..." bundled demo file · "idb:<key>" local IndexedDB blob · "https://..." published cloud file */
  src: string;
  /** video poster frame, same src conventions */
  poster?: string;
}

export interface Memory {
  id: string;
  assetId: string;
  caption: string;
  note: string;
  frame: FrameStyle;
  sticker: StickerId;
  date: string;
}

export interface SpecialCard {
  id: string;
  emoji: string;
  title: string;
  message: string;
}

export type LetterColor = "pink" | "lavender" | "peach" | "cream" | "mint";

export interface Letter {
  id: string;
  label: string;
  emoji: string;
  body: string;
  color: LetterColor;
}

export interface Wish {
  id: string;
  text: string;
}

export interface SceneSettings {
  id: SceneId;
  enabled: boolean;
  animation: SceneAnimation;
  background: SceneBackground;
}

export interface BirthdayConfig {
  version: 1;
  recipientName: string;
  nickname: string;
  senderName: string;
  /** YYYY-MM-DD */
  birthdayDate: string;
  theme: ThemeId;
  globalAnimation: AnimationPreset;
  scenes: SceneSettings[];
  text: {
    opening: {
      line1: string;
      line2: string;
      line3: string;
      question: string;
      yesLabel: string;
      maybeLabel: string;
      maybeResponses: string[];
    };
    reveal: { title: string; subtitle: string };
    cake: { heading: string; wishPrompt: string; hiddenMessage: string; candles: number };
    memories: { heading: string; subheading: string; layout: GalleryLayout };
    special: { heading: string; subheading: string };
    letters: { heading: string; subheading: string };
    music: { heading: string; subheading: string };
    universe: { line1: string; line2: string; hint: string };
    final: { teaser: string; letter: string; signoff: string; closing: string };
  };
  memories: Memory[];
  specialCards: SpecialCard[];
  letters: Letter[];
  wishes: Wish[];
  assets: Record<string, MediaAsset>;
  music: {
    assetId: string | null;
    coverAssetId: string | null;
    title: string;
    artist: string;
    loop: boolean;
    volume: number;
    vinyl: boolean;
  };
  countdown: {
    enabled: boolean;
    timezone: string;
    message: string;
    teaser: boolean;
  };
  extras: {
    cursor: boolean;
    sounds: boolean;
    loadingText: string;
    easterEgg: string;
  };
}

/** What the server is willing to reveal while the countdown is still locked. */
export interface LockedTeaser {
  recipientName: string;
  nickname: string;
  birthdayDate: string;
  theme: ThemeId;
  globalAnimation: AnimationPreset;
  countdown: BirthdayConfig["countdown"];
  unlockAt: number;
}
