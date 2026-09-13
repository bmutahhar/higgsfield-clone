"use client";

import type { ModeCopy } from "@/config/genjutsu";
import { cn } from "@/lib/cn";

/**
 * The card that slides out beside the form when a mode tab is hovered. It is
 * positioned by the caller against the form column's right edge and centred on
 * the tab, and it is always inert: it explains, it never receives a click.
 *
 * The hairline is a masked conic gradient rather than a border, because the
 * stroke brightens through its top-right quadrant — a border-color cannot do
 * that.
 */
export function ModePreview({
  mode,
  open,
  top,
  left,
}: {
  mode: ModeCopy | null;
  open: boolean;
  top: number;
  left: number;
}) {
  if (!mode) return null;

  return (
    <div
      aria-hidden
      // Anchored to a measured tab position — the only way to place a portal
      // against an element that moves with the form's scroll.
      style={{ top, left }}
      className={cn(
        "pointer-events-none fixed z-50 w-60 origin-left -translate-y-1/2 transition-[opacity,transform] duration-200 ease-q-pop motion-reduce:transition-none",
        open
          ? "translate-x-0 scale-100 opacity-100"
          : "-translate-x-2 scale-96 opacity-0",
      )}
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-q-600 bg-q-glass backdrop-blur-2xl">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-q-card">
          <video
            key={mode.preview.video}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster={mode.preview.poster}
            src={mode.preview.video}
            className="size-full object-cover"
          />
        </div>

        <div className="flex flex-col items-start gap-1 self-stretch px-4 pt-3 pb-4">
          <p className="text-q-body-sm font-semibold text-q-fg">
            {mode.preview.title[0]}
            <br />
            {mode.preview.title[1]}
          </p>
          {mode.preview.body ? (
            <p className="text-q-label-xs text-q-muted">{mode.preview.body}</p>
          ) : null}
        </div>

        <span
          aria-hidden
          className="q-hairline-conic pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      </div>

      <span
        aria-hidden
        className="absolute top-1/2 left-0 z-3 h-3 w-2 -translate-x-full -translate-y-1/2 bg-q-glass [clip-path:polygon(100%_0,100%_100%,0_50%)]"
      />
    </div>
  );
}
