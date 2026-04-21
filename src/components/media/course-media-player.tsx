"use client";

import { Button } from "@heroui/react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type CourseMediaPlayerProps = {
  src: string;
  variant: "video" | "audio";
  title?: string;
  poster?: string | null;
};

export function CourseMediaPlayer({ src, variant, title, poster }: CourseMediaPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fs, setFs] = useState(false);

  const isVideo = variant === "video";

  const clearTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const resetHideTimer = useCallback(() => {
    clearTimer();
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3200);
  }, [clearTimer, playing]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onDur = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onVol = () => {
      setVolume(el.volume);
      setMuted(el.muted);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("loadedmetadata", onDur);
    el.addEventListener("volumechange", onVol);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("loadedmetadata", onDur);
      el.removeEventListener("volumechange", onVol);
    };
  }, [src, variant]);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const togglePlay = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
    resetHideTimer();
  }, [resetHideTimer]);

  const onSeek = useCallback(
    (value: number) => {
      const el = mediaRef.current;
      if (!el || !Number.isFinite(value)) return;
      el.currentTime = value;
      setCurrentTime(value);
      resetHideTimer();
    },
    [resetHideTimer]
  );

  const onVolumeInput = useCallback(
    (v: number) => {
      const el = mediaRef.current;
      if (!el) return;
      el.volume = v;
      el.muted = v === 0;
      setVolume(v);
      setMuted(v === 0);
      resetHideTimer();
    },
    [resetHideTimer]
  );

  const toggleMute = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleFs = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* ignore */
    }
    resetHideTimer();
  }, [resetHideTimer]);

  const maxT = duration > 0 ? duration : 1;

  return (
    <div
      ref={wrapRef}
      className="group/player relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl ring-1 ring-fuchsia-500/15"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-fuchsia-600/25 via-transparent to-violet-600/20"
        aria-hidden
      />

      {isVideo ? (
        <video
          ref={mediaRef as RefObject<HTMLVideoElement>}
          src={src}
          poster={poster ?? undefined}
          playsInline
          preload="metadata"
          className="relative z-[1] aspect-video w-full cursor-pointer bg-black object-contain outline-none"
          onClick={togglePlay}
        />
      ) : (
        <div className="relative z-[1] flex flex-col gap-5 bg-linear-to-b from-zinc-900 via-zinc-950 to-black px-6 pb-4 pt-10">
          <div className="flex h-16 items-end justify-center gap-[3px]" aria-hidden>
            {Array.from({ length: 32 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-linear-to-t from-fuchsia-500 to-violet-400"
                style={{
                  height: `${22 + ((i * 19) % 48)}px`,
                  opacity: 0.25 + ((i * 11) % 55) / 100,
                }}
              />
            ))}
          </div>
          <audio ref={mediaRef as RefObject<HTMLAudioElement>} src={src} preload="metadata" />
          {title ? (
            <p className="text-center text-sm font-semibold text-white/90 [text-wrap:balance]">
              {title}
            </p>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={togglePlay}
        className={`absolute left-1/2 top-1/2 z-20 flex size-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition hover:scale-[1.04] hover:border-fuchsia-300/40 hover:bg-fuchsia-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
          playing ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        }`}
        aria-label="Play"
      >
        <Play className="size-8 translate-x-0.5 drop-shadow-md" strokeWidth={1.75} />
      </button>

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black via-black/85 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 sm:px-4 ${
          showControls || !playing ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {isVideo && title ? (
          <p className="mb-2 truncate text-center text-[11px] font-semibold uppercase tracking-wide text-fuchsia-200/90">
            {title}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={playing ? "Pause" : "Play"}
            className="size-9 min-w-0 shrink-0 rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
            onPress={togglePlay}
          >
            {playing ? (
              <Pause className="size-4" strokeWidth={2} />
            ) : (
              <Play className="size-4 translate-x-px" strokeWidth={2} />
            )}
          </Button>

          <span className="shrink-0 text-[11px] tabular-nums text-white/85 sm:text-xs">
            {formatTime(currentTime)}
            <span className="text-white/40"> / </span>
            {formatTime(duration)}
          </span>

          <input
            type="range"
            min={0}
            max={maxT}
            step={0.05}
            value={Math.min(currentTime, maxT)}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="mx-1 h-1.5 min-w-[4rem] flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-fuchsia-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/80 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
            aria-label="Seek"
          />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={muted ? "Unmute" : "Mute"}
              className="size-9 min-w-0 shrink-0 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/15"
              onPress={toggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeInput(Number(e.target.value))}
              className="hidden h-1.5 w-16 cursor-pointer sm:block accent-fuchsia-400"
              aria-label="Volume"
            />
            {isVideo ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
                className="size-9 min-w-0 shrink-0 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/15"
                onPress={toggleFs}
              >
                {fs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
