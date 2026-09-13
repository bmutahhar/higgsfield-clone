"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/core/icon";
import { QPopover } from "@/components/overlays/q-popover";
import { useDismiss } from "@/components/overlays/use-dismiss";
import { MODES } from "@/config/genjutsu";
import type { Preset } from "@/config/presets";
import { cn } from "@/lib/cn";

/**
 * One example in the Motion Library.
 *
 * Everything except the still is hover-revealed, and all of that reveal is CSS
 * via `group-hover` / `group-focus-within` — so the grid stays cheap no matter
 * how many cards are mounted, and keyboard users get the same affordances
 * without a single pointer event.
 *
 * Two things do need JavaScript: playback (hover-start, leave-reset) and the
 * ring that tracks it, which rides a custom property because a percentage is
 * exactly the kind of dynamic value a class cannot express.
 */
export function PresetCard({
  preset,
  onOpen,
  onRecreate,
}: {
  preset: Preset;
  onOpen: (preset: Preset) => void;
  /** Loads this preset's prompt and mode into the form. */
  onRecreate: (preset: Preset) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const menuRoot = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLDivElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [variant, setVariant] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  // The card clips its own overflow, so the menu is portalled out of it.
  useDismiss(menuOpen, () => setMenuOpen(false), menuRoot, menuPanel);

  function play() {
    const node = video.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void node.play().catch(() => {
      /* Refused autoplay leaves the poster in place, which is fine. */
    });
  }

  function stop() {
    const node = video.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
    setProgress(0);
  }

  return (
    <article
      onMouseEnter={play}
      onMouseLeave={stop}
      className="group/card [container-type:inline-size] relative isolate mb-4 aspect-video w-full min-w-0 shrink-0 cursor-pointer break-inside-avoid overflow-hidden rounded-q-300 bg-q-card"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        loading="lazy"
        decoding="async"
        src={preset.poster}
        className="pointer-events-none absolute inset-0 z-1 size-full object-cover"
      />

      {preset.video ? (
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          src={preset.video}
          aria-hidden
          onTimeUpdate={(event) => {
            const node = event.currentTarget;
            if (node.duration) setProgress(node.currentTime / node.duration);
          }}
          className="pointer-events-none absolute inset-0 z-2 size-full [transform:translateZ(0)] object-cover opacity-0 transition-opacity duration-200 [backface-visibility:hidden] group-hover/card:opacity-100 motion-reduce:transition-none"
        />
      ) : null}

      <button
        type="button"
        aria-label={`Open preset: ${preset.title}`}
        onClick={() => onOpen(preset)}
        className="absolute inset-0 z-16 cursor-pointer touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-q-focus focus-visible:ring-inset"
      />

      {/* Mode chip. Always visible on touch, hover-revealed on pointer devices. */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 hidden items-center gap-1.5 text-q-label-xs font-semibold text-white opacity-0 drop-shadow-sm transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 motion-reduce:transition-none max-md:opacity-100 md:flex [@container_(max-width:20rem)]:top-2 [@container_(max-width:20rem)]:left-2 [@media(hover:none)]:opacity-100">
        <Icon
          name={preset.mode === "swap" ? "replace" : "circle-dashed"}
          size={12}
          className="shrink-0"
        />
        {MODES[preset.mode].label}
      </div>

      <div
        ref={menuRoot}
        className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 opacity-0 transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 motion-reduce:transition-none max-md:hidden [@container_(max-width:20rem)]:top-2 [@container_(max-width:20rem)]:right-2 [@media(hover:none)]:hidden"
      >
        <GlassCircle label="Expand example" onClick={() => onOpen(preset)}>
          <Icon name="maximize-2" size={16} />
        </GlassCircle>

        {/* Community submissions can be reported; curated ones cannot. */}
        {preset.source === "community" ? (
          <div ref={menuTrigger} className="relative">
            <GlassCircle
              label="More options"
              expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name="ellipsis" size={16} />
            </GlassCircle>

            <QPopover anchorRef={menuTrigger} open={menuOpen} width={144}>
              <div
                ref={menuPanel}
                role="menu"
                className="q-menu-surface rounded-q-300 p-2"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-full items-center rounded-q-200 p-2 text-left text-q-menu text-q-fg transition-colors duration-150 hover:bg-q-w-08 motion-reduce:transition-none"
                >
                  Report
                </button>
              </div>
            </QPopover>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-3 bottom-3 z-20 flex min-w-0 items-end justify-between gap-2 opacity-0 transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 motion-reduce:transition-none max-md:hidden [@container_(max-width:20rem)]:inset-x-2 [@container_(max-width:20rem)]:bottom-2 [@media(hover:none)]:hidden">
        <div className="flex min-w-0 shrink items-center gap-2 [@container_(max-width:20rem)]:gap-0">
          {preset.variants.map((src, i) => (
            <div key={src} className="flex items-center">
              {i === 1 ? (
                <span
                  aria-hidden
                  className="mr-2 h-3 w-px bg-q-w-10 [@container_(max-width:20rem)]:hidden"
                />
              ) : null}
              <button
                type="button"
                aria-label={
                  i === 1 ? "Show source video" : `Show variant ${i + 1}`
                }
                aria-pressed={variant === i}
                onClick={() => setVariant(i)}
                // The ring tracks playback; a percentage cannot be a class.
                style={
                  variant === i
                    ? ({
                        "--ring": `${Math.round(progress * 360)}deg`,
                      } as React.CSSProperties)
                    : undefined
                }
                className={cn(
                  "relative size-8 shrink-0 rounded-full bg-white shadow-q-avatar transition-[filter] hover:brightness-150 motion-reduce:transition-none [@container_(max-width:20rem)]:size-7",
                  i > 0 && "[@container_(max-width:20rem)]:-ml-2",
                  variant === i &&
                    "before:absolute before:-inset-0.5 before:rounded-full before:bg-[conic-gradient(var(--color-q-accent)_var(--ring),transparent_0)] before:content-['']",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  loading="lazy"
                  decoding="async"
                  src={src}
                  className="relative size-full rounded-full border border-white object-cover"
                />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label={`Recreate ${preset.title}`}
          onClick={() => onRecreate(preset)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-q-200 bg-q-accent px-2.5 text-q-label-xs font-semibold text-q-inverse transition-opacity duration-150 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none [@container_(max-width:20rem)]:h-7 [@container_(max-width:20rem)]:px-2"
        >
          <Icon name="refresh-cw" size={14} />
          Recreate
        </button>
      </div>
    </article>
  );
}

function GlassCircle({
  label,
  children,
  onClick,
  expanded,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-q-subtle bg-q-w-05 text-white shadow-q-glass backdrop-blur-md transition-[filter] outline-none before:absolute before:-inset-1 before:content-[''] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none [@container_(max-width:20rem)]:size-7"
    >
      {children}
    </button>
  );
}
