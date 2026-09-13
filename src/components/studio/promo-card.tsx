"use client";

import { useRef } from "react";

import { Icon, type IconName } from "@/components/core/icon";

export interface PromoCardProps {
  title: string;
  subtitle: string;
  video: string;
  poster: string;
  /**
   * The button in the top-right corner. Genjutsu and Motion Control explain
   * themselves; Edit Video offers a model change instead. One prop rather than
   * two components, since only the label and the handler differ.
   */
  action: { label: string; icon?: IconName; onClick: () => void };
}

/**
 * The model card pinned above a generation form. The clip stays idle until the
 * pointer arrives, which keeps a background video off the critical path;
 * reduced-motion users never get playback at all.
 */
export function PromoCard({
  title,
  subtitle,
  video,
  poster,
  action,
}: PromoCardProps) {
  const ref = useRef<HTMLVideoElement>(null);

  function play() {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void node.play().catch(() => {
      /* Autoplay can be refused; the poster is already correct. */
    });
  }

  return (
    <figure
      onMouseEnter={play}
      onMouseLeave={() => ref.current?.pause()}
      className="group relative aspect-[2.3] w-full shrink-0 overflow-hidden rounded-q-300 bg-q-card select-none"
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        src={video}
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      {/* Scrim: the caption sits over moving footage and has to stay legible. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
      />

      <figcaption className="absolute bottom-0 left-0 z-10 w-full pr-1.5 pb-3 pl-3">
        <p className="truncate font-q-display text-q-brand-xxs text-q-brand uppercase">
          {title}
        </p>
        <p className="truncate text-xs text-white/80">{subtitle}</p>
      </figcaption>

      <div className="absolute top-1.5 right-1.5 z-20 flex gap-1">
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex h-6 items-center gap-1 rounded-q-200 border border-q-subtle bg-black/60 px-2 text-q-caption-m text-white transition-colors duration-150 outline-none hover:bg-q-accent hover:text-black focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          {action.icon && <Icon name={action.icon} size={12} />}
          {action.label}
        </button>
      </div>
    </figure>
  );
}
