"use client";

import {
  Clapperboard,
  Clock,
  Eye,
  Heart,
  Images,
  Maximize2,
  Monitor,
  Music,
  Palette,
  PenLine,
  RefreshCw,
  Rocket,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { SCENE_META } from "@/lib/defaults";
import { useStudio } from "@/lib/store";
import type { SceneId } from "@/lib/types";
import { MemoriesPanel, MusicPanel } from "./media-panels";
import { AnimationsPanel, CountdownPanel, PersonalizePanel, ScenesPanel, ThemePanel, WordsPanel } from "./panels";
import { PublishPanel } from "./PublishPanel";

type Tab = "personalize" | "scenes" | "memories" | "words" | "music" | "theme" | "animations" | "countdown" | "publish";

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "personalize", label: "Personalize", icon: Heart },
  { id: "scenes", label: "Scenes", icon: Clapperboard },
  { id: "memories", label: "Memories", icon: Images },
  { id: "words", label: "Cards & Letters", icon: PenLine },
  { id: "music", label: "Music", icon: Music },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "animations", label: "Animations", icon: Sparkles },
  { id: "countdown", label: "Countdown", icon: Clock },
  { id: "publish", label: "Publish", icon: Rocket },
];

const DEVICES = {
  mobile: { w: 390, h: 844 },
  desktop: { w: 1280, h: 800 },
};

function PreviewFrame({ scene, countdown, onClearScene, onClose }: { scene: SceneId | null; countdown: boolean; onClearScene: () => void; onClose?: () => void }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>("mobile");
  const [reloadKey, setReloadKey] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const dims = DEVICES[device];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setScale(Math.min((r.width - 24) / dims.w, (r.height - 24) / dims.h, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h]);

  const params = new URLSearchParams({ embed: "1" });
  if (scene) params.set("scene", scene);
  if (countdown) params.set("countdown", "1");
  const src = `/preview?${params}`;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          {(["mobile", "desktop"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${device === d ? "bg-[#f0619a] text-white" : "text-[#9a5a78]"}`}
            >
              {d === "mobile" ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
              {d === "mobile" ? "Mobile" : "Desktop"}
            </button>
          ))}
        </div>
        <button onClick={() => setReloadKey((k) => k + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#9a5a78] shadow-sm" aria-label="Restart preview" title="Restart preview">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <a href={src.replace("embed=1", "embed=0")} target="_blank" rel="noreferrer" className="flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-[#9a5a78] shadow-sm" title="Open full-screen preview">
          <Maximize2 className="h-3.5 w-3.5" /> Full screen
        </a>
        {onClose && (
          <button onClick={onClose} className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#9a5a78] shadow-sm" aria-label="Close preview">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {(scene || countdown) && (
        <div className="flex items-center gap-2 rounded-full bg-[#fff0f5] px-3 py-1.5 text-xs text-[#a0336a]">
          <Eye className="h-3.5 w-3.5" />
          {countdown ? "Previewing the countdown screen" : `Previewing: ${SCENE_META[scene!].label}`}
          <button onClick={onClearScene} className="ml-auto font-semibold underline">
            show full story
          </button>
        </div>
      )}
      <div ref={box} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_20%,#ffe6ef,#f6effa)]">
        <div
          className="relative shrink-0 overflow-hidden bg-white shadow-[0_30px_60px_-20px_rgba(120,40,80,0.45)]"
          style={{
            width: dims.w,
            height: dims.h,
            transform: `scale(${scale})`,
            borderRadius: device === "mobile" ? 48 : 14,
            border: device === "mobile" ? "10px solid #1f1a1d" : "8px solid #1f1a1d",
          }}
        >
          <iframe key={`${reloadKey}-${src}`} src={src} title="Live preview" className="h-full w-full border-0" allow="microphone; autoplay" />
        </div>
      </div>
      <p className="text-center text-[11px] text-[#a77b90]">Live preview · updates as you type · tap YES inside to explore</p>
    </div>
  );
}

function SavedBadge() {
  const config = useStudio((s) => s.config);
  const [pulse, setPulse] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [config]);
  return (
    <span className="hidden items-center gap-1.5 text-xs text-[#a77b90] sm:flex">
      <span className={`h-2 w-2 rounded-full transition ${pulse ? "scale-150 bg-[#f0619a]" : "bg-[#7cd3a2]"}`} />
      {pulse ? "Saving…" : "Saved on this device"}
    </span>
  );
}

export function Studio() {
  const [tab, setTab] = useState<Tab>("personalize");
  const [scene, setScene] = useState<SceneId | null>(null);
  const [countdown, setCountdown] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const name = useStudio((s) => s.config.recipientName);

  const previewScene = (id: SceneId) => {
    setCountdown(false);
    setScene(id);
    if (window.innerWidth < 1024) setMobilePreview(true);
  };

  const panel = {
    personalize: <PersonalizePanel />,
    scenes: <ScenesPanel onPreview={previewScene} />,
    memories: <MemoriesPanel />,
    words: <WordsPanel />,
    music: <MusicPanel />,
    theme: <ThemePanel />,
    animations: <AnimationsPanel />,
    countdown: (
      <CountdownPanel
        onPreview={() => {
          setScene(null);
          setCountdown(true);
          if (window.innerWidth < 1024) setMobilePreview(true);
        }}
      />
    ),
    publish: <PublishPanel />,
  }[tab];

  return (
    <div className="min-h-dvh bg-[#fff7fa] font-[family-name:var(--font-dm)] text-[#4a1d36]">
      <header className="sticky top-0 z-40 border-b border-[#f6e1ea] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8fb8] to-[#c47bff] text-lg shadow">🎀</span>
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-playfair)] text-[15px] font-semibold">Little Universe Studio</span>
              <span className="block text-[11px] text-[#a77b90]">for {name || "someone special"}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <SavedBadge />
            <button onClick={() => setMobilePreview(true)} className="flex h-10 items-center gap-1.5 rounded-full bg-[#fff0f5] px-4 text-sm font-semibold text-[#a0336a] lg:hidden">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <a href="/preview" target="_blank" className="hidden h-10 items-center gap-1.5 rounded-full bg-[#fff0f5] px-4 text-sm font-semibold text-[#a0336a] sm:flex">
              <Maximize2 className="h-4 w-4" /> Full experience
            </a>
            <button onClick={() => setTab("publish")} className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f0619a] to-[#c47bff] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(240,97,154,0.8)]">
              <Rocket className="h-4 w-4" /> <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 lg:grid-cols-[210px_minmax(0,1fr)_minmax(380px,42%)]">
        <nav aria-label="Studio sections" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:sticky lg:top-[84px] lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active}
                className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? "bg-white text-[#d93f80] shadow-[0_6px_20px_-10px_rgba(240,97,154,0.6)]" : "text-[#9a6a82] hover:bg-white/70"}`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
          <div className="mt-4 hidden rounded-2xl bg-white/70 p-3 text-xs leading-relaxed text-[#a77b90] lg:block">
            💡 Everything autosaves in this browser. Publish when you&apos;re ready to share.
          </div>
        </nav>

        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {panel}
            </motion.div>
          </AnimatePresence>
        </main>

        <aside className="hidden lg:sticky lg:top-[84px] lg:block lg:h-[calc(100dvh-104px)]">
          <PreviewFrame scene={scene} countdown={countdown} onClearScene={() => (setScene(null), setCountdown(false))} />
        </aside>
      </div>

      <AnimatePresence>
        {mobilePreview && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed inset-0 z-50 bg-[#fff7fa] p-3 lg:hidden">
            <PreviewFrame scene={scene} countdown={countdown} onClearScene={() => (setScene(null), setCountdown(false))} onClose={() => setMobilePreview(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
