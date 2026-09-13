"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** One row under Details. */
export interface LightboxDetail {
  label: string;
  value: string;
}

/**
 * Everything the expanded view needs, whatever it is expanding.
 *
 * A view model rather than the source record, because the two things that open
 * this — a library preset and one of your own generations — have almost
 * nothing in common beyond a picture and a prompt.
 */
export interface LightboxMedia {
  /** Names the dialog for assistive technology. */
  title: string;
  /** A clip, when there is one. Absent means this is a still. */
  video?: string;
  /** The still: a clip's poster, or the image itself. */
  poster: string;
  prompt: string;
  /**
   * Alternate stills, shown as a switcher under the player. A preset has
   * three; a generation has none, and the switcher does not render.
   */
  variants?: string[];
  details: LightboxDetail[];
}

export interface MediaLightboxProps {
  media: LightboxMedia;
  onClose: () => void;
  onRecreate: () => void;
  onDownload: () => void | Promise<void>;
}

/**
 * The expanded view: the asset on the left, everything known about it on the
 * right.
 *
 * Focus is trapped while it is open and handed back to whatever opened it on
 * close, which matters because the trigger is one tile in a grid of dozens —
 * losing the position would send a keyboard user back to the top.
 */
export function MediaLightbox({
  media,
  onClose,
  onRecreate,
  onDownload,
}: MediaLightboxProps) {
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
  const variants = media.variants ?? [];
  // One thumbnail is not a choice, so the switcher needs at least two.
  const switchable = variants.length > 1;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={media.title}
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
            {media.video === undefined ? (
              /*
               * A still has no transport, so it gets the frame and nothing
               * else. `object-contain` rather than cover: this is the view
               * where the whole picture matters.
               */
              <Image
                src={media.poster}
                alt={media.prompt}
                fill
                sizes="(max-width: 768px) 100vw, 70vw"
                className="object-contain"
              />
            ) : (
              <>
                <video
                  ref={video}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  poster={variants[variant] ?? media.poster}
                  src={media.video}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) =>
                    setDuration(e.currentTarget.duration)
                  }
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
                    // A live percentage cannot be a class; the track reads it.
                    style={
                      { "--hf-slider-pct": `${pct}%` } as React.CSSProperties
                    }
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
              </>
            )}

            {switchable ? (
              <div className="absolute inset-x-0 bottom-16 z-20 hidden justify-center md:flex">
                <div className="flex items-center gap-2">
                  {variants.map((src, i) => (
                    <div key={src} className="flex items-center">
                      {i === 1 ? (
                        <span aria-hidden className="mr-2 h-3 w-px bg-q-w-10" />
                      ) : null}
                      <button
                        type="button"
                        aria-label={
                          i === 1
                            ? "Show source video"
                            : `Show variant ${i + 1}`
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
            ) : null}
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
                          void navigator.clipboard?.writeText(media.prompt);
                        }}
                        className="inline-flex h-7 items-center gap-1.5 rounded-q-200 bg-q-w-05 px-2 text-q-label-xs text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
                      >
                        <Icon name="copy" size={14} />
                        Copy
                      </button>
                    </div>

                    {variants.length > 0 ? (
                      <div className="flex gap-1.5 px-1">
                        {variants.map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            alt=""
                            src={src}
                            className="aspect-square w-12 rounded-q-200 border border-q-subtle object-cover"
                          />
                        ))}
                      </div>
                    ) : null}

                    <p className="px-1 pb-1 text-q-body-sm text-q-fg">
                      {media.prompt}
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
                      <dl className="flex flex-col gap-px overflow-hidden rounded-q-200">
                        {media.details.map((detail) => (
                          <div
                            key={detail.label}
                            className="flex items-center justify-between gap-2 bg-q-w-05 px-3 py-2"
                          >
                            <dt className="shrink-0 text-q-label-xs text-q-muted">
                              {detail.label}
                            </dt>
                            <dd className="truncate text-q-label-xs text-q-fg">
                              {detail.value}
                            </dd>
                          </div>
                        ))}
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
                  onClick={() => {
                    void onDownload();
                  }}
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
