"use client";

import { useIsClient } from "@/lib/hooks";
import { Studio } from "@/components/studio/Studio";

/** The studio reads localStorage / IndexedDB, so it renders only in the browser. */
export function StudioClient() {
  const mounted = useIsClient();
  if (!mounted)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#fff7fa]">
        <p className="animate-pulse font-[family-name:var(--font-dancing)] text-3xl text-[#f0619a]">opening your studio… 🎀</p>
      </div>
    );
  return <Studio />;
}
