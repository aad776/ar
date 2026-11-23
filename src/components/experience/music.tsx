"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useResolvedSrc } from "@/lib/media";
import type { BirthdayConfig } from "@/lib/types";

interface MusicApi {
  available: boolean;
  playing: boolean;
  current: number;
  duration: number;
  volume: number;
  loop: boolean;
  title: string;
  artist: string;
  coverSrc: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setLoop: (v: boolean) => void;
  /** lower the music while a video with sound is playing */
  duck: (on: boolean) => void;
}

const MusicCtx = createContext<MusicApi | null>(null);
export const useMusic = () => {
  const m = useContext(MusicCtx);
  if (!m) throw new Error("useMusic outside provider");
  return m;
};

const FADE_MS = 900;

export function MusicProvider({ config, children }: { config: BirthdayConfig; children: ReactNode }) {
  const asset = config.music.assetId ? config.assets[config.music.assetId] : undefined;
  const cover = config.music.coverAssetId ? config.assets[config.music.coverAssetId] : undefined;
  const { url } = useResolvedSrc(asset?.src);
  const { url: coverUrl } = useResolvedSrc(cover?.src);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(asset?.duration ?? 0);
  const [volume, setVol] = useState(config.music.volume);
  const [loop, setLoopState] = useState(config.music.loop);
  const ducked = useRef(false);
  const targetVol = useRef(config.music.volume);

  const [prevProps, setPrevProps] = useState({ volume: config.music.volume, loop: config.music.loop });
  if (prevProps.volume !== config.music.volume || prevProps.loop !== config.music.loop) {
    setPrevProps({ volume: config.music.volume, loop: config.music.loop });
    setVol(config.music.volume);
    setLoopState(config.music.loop);
  }
  useEffect(() => {
    targetVol.current = config.music.volume;
  }, [config.music.volume]);

  const fadeTo = useCallback((to: number, ms = FADE_MS, after?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = a.volume;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * (k * (2 - k))));
      if (k < 1) fadeRaf.current = requestAnimationFrame(tick);
      else after?.();
    };
    fadeRaf.current = requestAnimationFrame(tick);
  }, []);

  const effectiveVol = () => (ducked.current ? targetVol.current * 0.15 : targetVol.current);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a || !url) return;
    a.volume = 0;
    a.play()
      .then(() => {
        setPlaying(true);
        fadeTo(effectiveVol());
      })
      .catch(() => setPlaying(false));
  }, [url, fadeTo]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setPlaying(false);
    fadeTo(0, 500, () => a.pause());
  }, [fadeTo]);

  const api = useMemo<MusicApi>(
    () => ({
      available: Boolean(url),
      playing,
      current,
      duration,
      volume,
      loop,
      title: config.music.title,
      artist: config.music.artist,
      coverSrc: coverUrl,
      play,
      pause,
      toggle: () => (playing ? pause() : play()),
      seek: (t) => {
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrent(t);
      },
      setVolume: (v) => {
        targetVol.current = v;
        setVol(v);
        if (audioRef.current && playing) {
          cancelAnimationFrame(fadeRaf.current);
          audioRef.current.volume = effectiveVol();
        }
      },
      setLoop: (v) => setLoopState(v),
      duck: (on) => {
        ducked.current = on;
        if (playing) fadeTo(effectiveVol(), 400);
      },
    }),
    [url, playing, current, duration, volume, loop, config.music.title, config.music.artist, coverUrl, play, pause, fadeTo]
  );

  useEffect(() => () => cancelAnimationFrame(fadeRaf.current), []);

  return (
    <MusicCtx.Provider value={api}>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          loop={loop}
          preload="none"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => setPlaying(false)}
          onPause={(e) => {
            if (e.currentTarget.volume > 0.01) setPlaying(false);
          }}
        />
      )}
      {children}
    </MusicCtx.Provider>
  );
}

export const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
