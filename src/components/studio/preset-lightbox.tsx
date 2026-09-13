"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/core/icon";
import type { Preset } from "@/config/presets";
import { cn } from "@/lib/cn";

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The expanded example: player on the left, everything the preset knows about
 * itself on the right.
 *
 * Focus is trapped while it is open and handed back to whatever opened it on
 * close, which matters because the trigger is one card in a grid of dozens —
 * losing the position would send a keyboard user back to the top.
 */
export function PresetLightbox({
  preset,
  onClose,
  onRecreate,
}: {
  preset: Preset;
  onClose: () => void;
  onRecreate: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);
  // Mirrors the element's own state: a ref read during render would never
  // update the label, since assigning to a ref does not re-render.
  const [playing, setPlaying] = useState(true);
  const [variant, setVariant] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = dialog.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={preset.title}
      tabIndex={-1}
      className="fixed inset-0 z-100 outline-none"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 -z-10 size-full cursor-default bg-q-page"
      />

      <div className="relative size-full overflow-y-auto md:grid md:grid-cols-[1fr_23rem] md:overflow-hidden">
        <div className="relative h-[65vh] min-h-0 min-w-0 overflow-hidden p-3 md:h-full">
          <div className="relative size-full overflow-hidden rounded-q-400 bg-black">
            <video
              ref={video}
              autoPlay
              loop
              muted={muted}
              playsInline
              poster={preset.variants[variant] ?? preset.poster}
              src={preset.video}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="size-full object-contain"
            />

            <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-3">
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => {
                  const node = video.current;
                  if (!node) return;
                  if (node.paused) void node.play();
                  else node.pause();
                }}
                className="inline-flex size-10 items-center justify-center rounded-q-150 text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-q-focus"
              >
                <Icon name={playing ? "pause" : "play"} size={20} />
              </button>

              <div className="flex items-center text-sm font-medium text-white">
                <span>{clock(time)}</span>
                <span className="mx-1 text-white/80">/</span>
                <span>{clock(duration)}</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={pct}
                aria-label="Seek"
                onChange={(event) => {
                  const node = video.current;
                  if (!node || !duration) return;
                  node.currentTime =
                    (Number(event.target.value) / 100) * duration;
                }}
                style={{ "--hf-slider-pct": `${pct}%` } as React.CSSProperties}
                className="hf-slider mx-2 h-1.5 flex-1 cursor-pointer appearance-none rounded-sm"
              />

              <button
                type="button"
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={!muted}
                onClick={() => setMuted((v) => !v)}
                className="inline-flex size-10 items-center justify-center rounded-q-150 text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-q-focus"
              >
                <Icon name={muted ? "volume-off" : "volume-2"} size={20} />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-16 z-20 hidden justify-center md:flex">
              <div className="flex items-center gap-2">
                {preset.variants.map((src, i) => (
                  <div key={src} className="flex items-center">
                    {i === 1 ? (
                      <span aria-hidden className="mr-2 h-3 w-px bg-q-w-10" />
                    ) : null}
                    <button
                      type="button"
                      aria-label={
                        i === 1 ? "Show source video" : `Show variant ${i + 1}`
                      }
                      aria-pressed={variant === i}
                      onClick={() => setVariant(i)}
                      className={cn(
                        "size-8 shrink-0 rounded-full bg-white shadow-q-avatar transition-[filter] hover:brightness-150 motion-reduce:transition-none",
                        variant === i && "ring-2 ring-q-accent",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={src}
                        className="size-full rounded-full border border-white object-cover"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="size-full bg-transparent p-2">
          <div className="relative grid size-full min-h-0 grid-rows-[auto_1fr] gap-2 overflow-hidden rounded-q-600 border border-q-subtle bg-q-glass p-2 backdrop-blur-2xl">
            <header className="flex items-center justify-end p-0">
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="m-1 flex size-8 items-center justify-center rounded-full bg-q-w-05 text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-10 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
              >
                <Icon name="x" size={18} />
              </button>
            </header>

            <div className="grid min-h-0 grid-rows-[1fr_auto] gap-2">
              <div className="hf-scrollbar-none min-h-0 overflow-x-hidden overflow-y-auto">
                <div className="flex w-full flex-col items-start gap-2 rounded-q-300 bg-q-w-05 p-2">
                  <section className="flex w-full flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-q-caption-xs text-q-muted uppercase">
                        Prompt
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard?.writeText(preset.prompt);
                        }}
                        className="inline-flex h-7 items-center gap-1.5 rounded-q-200 bg-q-w-05 px-2 text-q-label-xs text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
                      >
                        <Icon name="copy" size={14} />
                        Copy
                      </button>
                    </div>

                    <div className="flex gap-1.5 px-1">
                      {preset.variants.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          alt=""
                          src={src}
                          className="aspect-square w-12 rounded-q-200 border border-q-subtle object-cover"
                        />
                      ))}
                    </div>

                    <p className="px-1 pb-1 text-q-body-sm text-q-fg">
                      {preset.prompt}
                    </p>
                  </section>

                  <section className="w-full">
                    <button
                      type="button"
                      aria-expanded={detailsOpen}
                      onClick={() => setDetailsOpen((v) => !v)}
                      className="flex w-full items-center justify-between px-1 py-2 text-q-caption-xs text-q-muted uppercase outline-none focus-visible:ring-2 focus-visible:ring-q-focus"
                    >
                      Details
                      <Icon
                        name="chevron-down"
                        size={14}
                        className={cn(
                          "transition-transform duration-150 motion-reduce:transition-none",
                          detailsOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {detailsOpen ? (
                      <dl className="flex items-center justify-between gap-2 rounded-q-200 bg-q-w-05 px-3 py-2">
                        <dt className="text-q-label-xs text-q-muted">Model</dt>
                        <dd className="truncate text-q-label-xs text-q-fg">
                          {preset.model}
                        </dd>
                      </dl>
                    ) : null}
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onRecreate}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-q-200 bg-q-accent text-q-label-sm font-semibold text-q-inverse transition-opacity duration-150 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                >
                  <Icon name="refresh-cw" size={16} />
                  Recreate
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-q-200 bg-q-w-05 text-q-label-sm font-medium text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
                >
                  <Icon name="download" size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
