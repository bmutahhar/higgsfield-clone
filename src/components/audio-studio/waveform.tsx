"use client";

import { cn } from "@/lib/cn";
import { waveformBars } from "@/lib/waveform";

/**
 * The bars, mirrored about a horizontal centre line.
 *
 * Heights come from the job id, never from the file — see the spec's D4: the
 * fixtures are cross-origin and a decode is one missing header away from a
 * permanently blank row. The contour is therefore synthetic, so the *duration*
 * sets how many bars are drawn: without that a one-second take and a
 * ten-second one would render at identical length, which next to real
 * amplitude reads as a bug rather than a simplification.
 */
export function Waveform({
  id,
  duration,
  progress,
  onSeek,
}: {
  id: string;
  /** Seconds. Sets the bar count, so length reads true. */
  duration: number;
  /** 0–1. Bars behind it are brand, ahead of it are dim. */
  progress: number;
  onSeek?: (fraction: number) => void;
}) {
  /* ~14 bars a second, clamped so a very short or very long clip still reads
     as a waveform rather than a dot or a solid block. */
  const count = Math.max(24, Math.min(200, Math.round(duration * 14)));
  const bars = waveformBars(id, count);
  const played = Math.round(bars.length * progress);

  return (
    <div
      role={onSeek ? "slider" : undefined}
      aria-label={onSeek ? "Seek" : undefined}
      aria-valuenow={onSeek ? Math.round(progress * 100) : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      tabIndex={onSeek ? 0 : undefined}
      onClick={(event) => {
        if (!onSeek) return;
        const box = event.currentTarget.getBoundingClientRect();
        onSeek((event.clientX - box.left) / box.width);
      }}
      onKeyDown={(event) => {
        if (!onSeek) return;
        const delta =
          event.key === "ArrowRight"
            ? 0.05
            : event.key === "ArrowLeft"
              ? -0.05
              : 0;
        if (delta === 0) return;
        event.preventDefault();
        onSeek(Math.min(1, Math.max(0, progress + delta)));
      }}
      className={cn(
        "flex h-10 min-w-0 flex-1 items-center gap-px outline-none",
        onSeek &&
          "cursor-pointer focus-visible:ring-2 focus-visible:ring-q-focus",
      )}
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-0.5 shrink-0 rounded-full",
            index < played ? "bg-q-brand" : "bg-q-w-20",
          )}
          /*
           * A continuous height fraction cannot be a utility class. The bar is
           * centred by the row's `items-center`, which is what mirrors it about
           * the middle rather than standing it on a baseline.
           */
          style={{ height: `${String(Math.round(height * 100))}%` }}
        />
      ))}
    </div>
  );
}
