"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useIsClient } from "@/lib/hooks";
import { Experience } from "@/components/experience/Experience";
import { SCENE_ORDER } from "@/lib/defaults";
import { STUDIO_KEY, useStudio } from "@/lib/store";
import type { SceneId } from "@/lib/types";

export function PreviewClient() {
  const params = useSearchParams();
  const embed = params.get("embed") === "1";
  const sceneParam = params.get("scene") as SceneId | null;
  const only = sceneParam && SCENE_ORDER.includes(sceneParam) ? sceneParam : null;
  const skipCountdown = params.get("countdown") !== "1";
  const config = useStudio((s) => s.config);
  const mounted = useIsClient();

  useEffect(() => {
    // live-sync with the studio (other tab or parent frame)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDIO_KEY) void useStudio.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!mounted) return <div className="min-h-dvh bg-dreamy" />;

  return (
    <>
      {!embed && (
        <div className="fixed left-1/2 top-2 z-[150] -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs text-white backdrop-blur">
          Local preview · only visible on this device ·{" "}
          <Link href="/studio" className="underline">
            back to studio
          </Link>
        </div>
      )}
      <Experience key={`${only}-${skipCountdown}-${skipCountdown ? "" : `${config.countdown.enabled}-${config.birthdayDate}-${config.countdown.timezone}`}`} config={config} mode="preview" only={only} skipCountdown={skipCountdown} />
    </>
  );
}
