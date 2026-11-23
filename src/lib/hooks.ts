"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true only after hydration on the client (no setState-in-effect needed). */
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Subscribe to a CSS media query. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}
