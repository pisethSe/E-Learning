import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_FALLBACK_DURATION = 45;
const SEEK_JUMP_SECONDS = 10;
const VOLUME_BAR_COUNT = 8;
const BAR_DELAY_INCREMENT = 0.1;
const MIN_TIME = 0;

function formatTime(timeInSeconds) {
  if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function VolumeBars({ isPlaying }) {
  return (
    <div className="pointer-events-none flex h-6 w-9 items-end justify-end gap-0.5">
      {Array.from({ length: VOLUME_BAR_COUNT }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] rounded-full bg-gradient-to-t from-[#ff2e55] to-[#ff7a95]",
            isPlaying && "animate-audio-bounce",
          )}
          style={{
            height: isPlaying ? undefined : `${5 + (index % 3) * 3}px`,
            animationDelay: `${index * BAR_DELAY_INCREMENT}s`,
          }}
        />
      ))}
    </div>
  );
}

function LiquidIconButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/76 transition-all duration-300",
        "bg-white shadow-[0_8px_20px_rgba(15,23,42,0.09),inset_2px_2px_1px_-2px_rgba(255,255,255,0.95),inset_-2px_-2px_1px_-2px_rgba(15,23,42,0.20)] ring-1 ring-black/10",
        "hover:scale-105 hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#ff6b88]/45 disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_20%,rgba(255,255,255,0.86),transparent_38%)]" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export default function LiquidAudioCard({
  src = "",
  title = "Lesson audio",
  artist = "Grade A",
  description = "",
  coverUrl = "/logo.png",
  createdAtLabel = "",
  isActive = false,
  onActivate = () => {},
  onDeactivate = () => {},
  className = "",
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(MIN_TIME);
  const [duration, setDuration] = useState(TOTAL_FALLBACK_DURATION);

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!isActive && audio && !audio.paused) {
      audio.pause();
    }
  }, [isActive]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    setDuration(audio.duration);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime);
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !src) {
      return;
    }

    if (audio.paused) {
      onActivate();

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        onDeactivate();
        setIsPlaying(false);
      }

      return;
    }

    audio.pause();
    setIsPlaying(false);
    onDeactivate();
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || !src) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const nextTime = Math.min(Math.max(MIN_TIME, percent * duration), duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const jumpBy = (seconds) => {
    const audio = audioRef.current;
    if (!audio || !src) {
      return;
    }

    const nextTime = Math.min(
      Math.max(MIN_TIME, audio.currentTime + seconds),
      duration,
    );
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/10 bg-white p-3 text-black shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-4",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(248,250,252,0.95),transparent_34%),radial-gradient(circle_at_90%_8%,rgba(255,46,85,0.08),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-black/10 blur-[1px]" />

      {src ? (
        <audio
          ref={audioRef}
          preload="metadata"
          src={src}
          onEnded={() => {
            setIsPlaying(false);
            onDeactivate();
          }}
          onError={() => {
            setIsPlaying(false);
            onDeactivate();
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={() => setIsPlaying(false)}
          onPlay={() => {
            onActivate();
            setIsPlaying(true);
          }}
          onTimeUpdate={handleTimeUpdate}
        />
      ) : null}

      <div className="relative z-10">
        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#f8fafc] shadow-[0_10px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/10 sm:h-16 sm:w-16">
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold leading-tight text-black sm:text-lg">
              {title}
            </h3>
            <p className="mt-1 truncate text-xs font-medium text-black/52 sm:text-sm">
              {artist}
            </p>
          </div>

          <VolumeBars isPlaying={isPlaying} />
        </div>

        {description ? (
          <p className="mt-3 line-clamp-1 text-xs leading-5 text-black/54 sm:text-sm">
            {description}
          </p>
        ) : null}

        <div className="mt-3">
          <div className="mb-2 flex justify-between text-xs font-semibold tabular-nums text-black/48">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            aria-label="Seek audio"
            className="relative h-2 w-full overflow-hidden rounded-full bg-black/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b88]/45"
            onClick={handleSeek}
            disabled={!src}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff2e55] to-[#ff7a95] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LiquidIconButton
              aria-label="Rewind 10 seconds"
              onClick={() => jumpBy(-SEEK_JUMP_SECONDS)}
              disabled={!src}
            >
              <ArrowLeft className="h-4 w-4" />
            </LiquidIconButton>

            <LiquidIconButton
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-10 w-10 text-black ring-[#ff6b88]/45"
              onClick={handlePlayPause}
              disabled={!src}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-0.5" />
              )}
            </LiquidIconButton>

            <LiquidIconButton
              aria-label="Forward 10 seconds"
              onClick={() => jumpBy(SEEK_JUMP_SECONDS)}
              disabled={!src}
            >
              <ArrowRight className="h-4 w-4" />
            </LiquidIconButton>
          </div>

          <div className="flex items-center gap-2">
            {createdAtLabel ? (
              <span className="hidden max-w-[160px] truncate text-[11px] font-medium text-black/42 sm:block">
                {createdAtLabel}
              </span>
            ) : null}
            <LiquidIconButton aria-label="Audio options" disabled={!src}>
              <Radio className="h-4 w-4" />
            </LiquidIconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
