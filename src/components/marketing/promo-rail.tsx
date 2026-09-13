"use client";

import { useRef } from "react";
import Image from "next/image";

import { HERO } from "@/config/media";

/**
 * The hero is a horizontally scrolling rail of promo cards, each a full-bleed
 * still that cross-fades to a muted loop on hover, with the title and blurb
 * sitting below the frame rather than over it.
 */
export function PromoRail() {
  const refs = useRef<Map<string, HTMLVideoElement>>(new Map());

  function play(key: string) {
    const el = refs.current.get(key);
    void el?.play().catch(() => {
      /* autoplay may be refused; the poster stays */
    });
  }

  function stop(key: string) {
    const el = refs.current.get(key);
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  return (
    <section className="hf-scrollbar overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3 px-4 lg:px-6">
        {HERO.map((item) => (
          <article
            key={item.title}
            className="group w-[min(78vw,420px)] shrink-0"
            onMouseEnter={() => {
              play(item.title);
            }}
            onMouseLeave={() => {
              stop(item.title);
            }}
          >
            <div className="relative aspect-16/10 overflow-hidden rounded-media border border-hairline bg-n-3">
              <Image
                src={item.poster}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 78vw, 420px"
                className="object-cover transition-transform duration-[640ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <video
                ref={(el) => {
                  if (el) refs.current.set(item.title, el);
                  else refs.current.delete(item.title);
                }}
                src={item.video}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100 motion-reduce:transition-none"
              />
            </div>
            <h2 className="mt-3 text-body-sm font-semibold tracking-[0.02em] text-primary uppercase">
              {item.title}
            </h2>
            <p className="mt-1 text-body-sm text-muted">{item.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
