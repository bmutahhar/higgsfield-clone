"use client";

import { useRef } from "react";

import { PROMO } from "@/config/genjutsu";

/**
 * The model card pinned above the form. The clip is idle until the pointer
 * arrives, which keeps a background video off the critical path; reduced-motion
 * users never get playback at all.
 */
export function PromoCard({ onHowItWorks }: { onHowItWorks: () => void }) {
  const video = useRef<HTMLVideoElement>(null);

  function play() {
    const node = video.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void node.play().catch(() => {
      /* Autoplay can be refused; the poster is already correct. */
    });
  }

  function stop() {
    video.current?.pause();
  }

  return (
    <figure
      onMouseEnter={play}
      onMouseLeave={stop}
      className="group relative aspect-[2.3] w-full shrink-0 overflow-hidden rounded-q-300 bg-q-card select-none"
    >
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        poster={PROMO.poster}
        src={PROMO.video}
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
          {PROMO.title}
        </p>
        <p className="text-xs text-white/80">{PROMO.subtitle}</p>
      </figcaption>

      <div className="absolute top-1.5 right-1.5 z-20 flex gap-1">
        <button
          type="button"
          onClick={onHowItWorks}
          className="inline-flex h-6 items-center rounded-q-200 border border-q-subtle bg-black/60 px-2 text-q-caption-m text-white transition-colors duration-150 outline-none hover:bg-q-accent hover:text-black focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          How it works
        </button>
      </div>
    </figure>
  );
}
