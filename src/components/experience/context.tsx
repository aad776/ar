"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { fmt } from "@/lib/defaults";
import { THEMES, type Theme } from "@/lib/themes";
import type { BirthdayConfig } from "@/lib/types";

interface Ctx {
  config: BirthdayConfig;
  theme: Theme;
  /** fill {name} etc */
  t: (s: string) => string;
  mode: "live" | "preview";
}

const ExperienceCtx = createContext<Ctx | null>(null);

export function ExperienceProvider({
  config,
  mode,
  children,
}: {
  config: BirthdayConfig;
  mode: "live" | "preview";
  children: ReactNode;
}) {
  const theme = THEMES[config.theme] ?? THEMES.coquette;
  return (
    <ExperienceCtx.Provider value={{ config, theme, mode, t: (s) => fmt(s, config) }}>
      {children}
    </ExperienceCtx.Provider>
  );
}

export function useExperience() {
  const c = useContext(ExperienceCtx);
  if (!c) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return c;
}

export function themeStyle(theme: Theme): CSSProperties {
  return {
    ...theme.vars,
    "--fd": `var(${theme.fonts.display})`,
    "--fs": `var(${theme.fonts.script})`,
    "--fb": `var(${theme.fonts.body})`,
    colorScheme: theme.dark ? "dark" : "light",
  } as CSSProperties;
}
