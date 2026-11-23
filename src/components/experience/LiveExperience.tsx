"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { normalizeConfig } from "@/lib/defaults";
import { THEMES } from "@/lib/themes";
import type { BirthdayConfig, LockedTeaser } from "@/lib/types";
import { CountdownScreen } from "./chrome";
import { ExperienceProvider, themeStyle } from "./context";
import { Experience } from "./Experience";

export function LiveExperience({ config }: { config: BirthdayConfig }) {
  return <Experience config={config} mode="live" />;
}

/** Before the birthday the server only sends this teaser, never the surprise itself. */
export function LockedExperience({ teaser }: { teaser: LockedTeaser }) {
  const router = useRouter();
  const config = useMemo(
    () =>
      normalizeConfig({
        recipientName: teaser.recipientName,
        nickname: teaser.nickname,
        birthdayDate: teaser.birthdayDate,
        theme: teaser.theme,
        globalAnimation: teaser.globalAnimation,
        countdown: teaser.countdown,
      }),
    [teaser]
  );
  const theme = THEMES[config.theme] ?? THEMES.coquette;
  return (
    <ExperienceProvider config={config} mode="live">
      <div id="lu-root" style={themeStyle(theme)} className="min-h-[100svh] bg-[var(--c-bg)] font-body text-ink">
        <CountdownScreen unlockAt={teaser.unlockAt} onUnlock={() => router.refresh()} />
      </div>
    </ExperienceProvider>
  );
}
