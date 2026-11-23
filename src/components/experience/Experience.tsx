"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveSrc } from "@/lib/media";
import { useSfx } from "@/lib/sfx";
import { THEMES } from "@/lib/themes";
import { unlockInstant } from "@/lib/time";
import type { BirthdayConfig, SceneId, SceneSettings } from "@/lib/types";
import { CountdownScreen, CustomCursor, LoadingScreen, MiniPlayer, SceneDots, TopBar } from "./chrome";
import { ExperienceProvider, themeStyle } from "./context";
import { MusicProvider, useMusic } from "./music";
import { SvgDefs } from "./primitives";
import { CakeScene } from "./scenes/CakeScene";
import { FinalScene } from "./scenes/FinalScene";
import { LettersScene } from "./scenes/LettersScene";
import { MemoriesScene } from "./scenes/MemoriesScene";
import { MusicScene } from "./scenes/MusicScene";
import { OpeningScene } from "./scenes/OpeningScene";
import { RevealScene } from "./scenes/RevealScene";
import { SpecialScene } from "./scenes/SpecialScene";
import { UniverseScene } from "./scenes/UniverseScene";

type Stage = "loading" | "countdown" | "gate" | "story";

export interface ExperienceProps {
  config: BirthdayConfig;
  mode: "live" | "preview";
  /** preview a single scene */
  only?: SceneId | null;
  /** preview: bypass the countdown */
  skipCountdown?: boolean;
}

function sceneHasContent(s: SceneSettings, c: BirthdayConfig, musicAvailable: boolean) {
  switch (s.id) {
    case "memories":
      return c.memories.some((m) => c.assets[m.assetId]);
    case "special":
      return c.specialCards.length > 0;
    case "letters":
      return c.letters.length > 0;
    case "universe":
      return c.wishes.length > 0;
    case "music":
      return musicAvailable;
    default:
      return true;
  }
}

function Story({
  config,
  only,
  onReplay,
}: {
  config: BirthdayConfig;
  only?: SceneId | null;
  onReplay: () => void;
}) {
  const music = useMusic();
  const scenes = useMemo(
    () =>
      config.scenes.filter(
        (s) =>
          s.id !== "opening" &&
          (only ? s.id === only : s.enabled && sceneHasContent(s, config, music.available))
      ),
    [config, only, music.available]
  );
  const ids = scenes.map((s) => s.id);
  const next = (i: number) =>
    i < ids.length - 1
      ? () => document.getElementById(`scene-${ids[i + 1]}`)?.scrollIntoView({ behavior: "smooth" })
      : undefined;

  return (
    <main>
      {scenes.map((s, i) => {
        const props = { scene: s, onNext: next(i) };
        switch (s.id) {
          case "reveal":
            return <RevealScene key={s.id} {...props} />;
          case "cake":
            return <CakeScene key={s.id} {...props} />;
          case "memories":
            return <MemoriesScene key={s.id} {...props} />;
          case "special":
            return <SpecialScene key={s.id} {...props} />;
          case "letters":
            return <LettersScene key={s.id} {...props} />;
          case "music":
            return <MusicScene key={s.id} {...props} />;
          case "universe":
            return <UniverseScene key={s.id} {...props} />;
          case "final":
            return <FinalScene key={s.id} scene={s} onReplay={onReplay} />;
          default:
            return null;
        }
      })}
      {!only && ids.length > 1 && <SceneDots ids={ids} />}
      {!only && !ids.includes("final") && (
        <footer className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="font-display text-lg text-ink italic">{config.text.final.closing}</p>
          <button onClick={onReplay} className="btn-cute">
            Replay the surprise
          </button>
        </footer>
      )}
    </main>
  );
}

function ExperienceInner({ config, mode, only, skipCountdown }: ExperienceProps) {
  const music = useMusic();
  const unlockAt = useMemo(
    () => unlockInstant(config.birthdayDate, config.countdown.timezone),
    [config.birthdayDate, config.countdown.timezone]
  );
  const needsCountdown = () => config.countdown.enabled && !skipCountdown && !only && Date.now() < unlockAt;
  const [stage, setStage] = useState<Stage>("loading");
  const [run, setRun] = useState(0);
  const openingEnabled = config.scenes.find((s) => s.id === "opening")?.enabled !== false;

  const afterLoading = useCallback((): Stage => {
    if (needsCountdown()) return "countdown";
    if (only && only !== "opening") return "story";
    return "gate";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.countdown.enabled, skipCountdown, only, unlockAt]);

  // Loading: wait for fonts + the first few images (bounded), with a minimum for charm.
  useEffect(() => {
    let alive = true;
    const minDelay = new Promise((r) => setTimeout(r, mode === "preview" ? 500 : 1400));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const firstImages = config.memories.slice(0, 4).map(async (m) => {
      const a = config.assets[m.assetId];
      const url = await resolveSrc(a?.kind === "video" ? a.poster : a?.src);
      if (!url) return;
      await new Promise<void>((res) => {
        const img = new Image();
        img.onload = img.onerror = () => res();
        img.src = url;
      });
    });
    const timeout = new Promise((r) => setTimeout(r, 4000));
    Promise.race([Promise.all([minDelay, fonts, ...firstImages]), timeout]).then(() => {
      if (alive) setStage(afterLoading());
    });
    return () => {
      alive = false;
    };
    // run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    if (config.music.assetId) music.play();
    setStage("story");
    window.scrollTo({ top: 0 });
  };

  const replay = () => {
    music.pause();
    music.seek(0);
    window.scrollTo({ top: 0 });
    setRun((r) => r + 1);
    setStage(only && only !== "opening" ? "story" : "gate");
  };

  return (
    <>
      <LoadingScreen show={stage === "loading"} />
      {stage === "countdown" && (
        <CountdownScreen
          unlockAt={unlockAt}
          onUnlock={() => setStage("gate")}
          onSkip={mode === "preview" ? () => setStage("gate") : undefined}
        />
      )}
      {stage === "gate" && <OpeningScene key={`gate-${run}`} onStart={start} minimal={!openingEnabled} />}
      {stage === "story" && (
        <>
          <Story key={`story-${run}`} config={config} only={only === "opening" ? null : only} onReplay={replay} />
          <MiniPlayer onOpen={() => document.getElementById("scene-music")?.scrollIntoView({ behavior: "smooth" })} />
          <TopBar onReplay={replay} />
        </>
      )}
    </>
  );
}

export function Experience(props: ExperienceProps) {
  const { config } = props;
  const theme = THEMES[config.theme] ?? THEMES.coquette;
  const setSfx = useSfx((s) => s.setEnabled);
  useEffect(() => setSfx(config.extras.sounds), [config.extras.sounds, setSfx]);
  useEffect(() => {
    // so overscroll / safe areas match the theme
    document.documentElement.style.background = theme.vars["--c-bg"];
    document.body.style.background = theme.vars["--c-bg"];
  }, [theme]);

  return (
    <ExperienceProvider config={config} mode={props.mode}>
      <div
        id="lu-root"
        style={themeStyle(theme)}
        className="relative min-h-[100svh] overflow-x-clip bg-[var(--c-bg)] font-body text-ink"
      >
        <SvgDefs />
        <MusicProvider config={config}>
          <ExperienceInner {...props} />
        </MusicProvider>
        {config.extras.cursor && <CustomCursor />}
      </div>
    </ExperienceProvider>
  );
}
