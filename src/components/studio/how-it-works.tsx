"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { HOW_IT_WORKS } from "@/config/genjutsu";
import { cn } from "@/lib/cn";

/**
 * A three-beat explainer. The pager is a filmstrip rather than dots: the active
 * slide grows and plays, its neighbours stay small stills, and the rail slides
 * so the active one is always centred.
 */
export function HowItWorks() {
  const [index, setIndex] = useState(1);
  const slide = HOW_IT_WORKS[index];
  if (!slide) return null;

  const go = (next: number) =>
    setIndex((next + HOW_IT_WORKS.length) % HOW_IT_WORKS.length);

  return (
    <section
      aria-label="How it works"
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col items-center overflow-x-hidden px-4 py-5 md:justify-center md:py-8"
    >
      <div className="mx-auto flex w-full max-w-252 min-w-0 flex-col items-center">
        <div className="flex w-full min-w-0 flex-col items-center">
          <div className="relative aspect-video w-full min-w-0 shrink-0 md:aspect-auto md:h-70">
            <div className="absolute inset-0 flex min-w-0 justify-center">
              <div className="relative aspect-video h-auto w-full min-w-0 overflow-hidden rounded-q-500 bg-q-card md:h-70 md:w-auto md:max-w-full">
                <video
                  key={slide.id}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  poster={slide.poster}
                  src={slide.video}
                  aria-label={`${slide.title} example`}
                  className="size-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex w-full min-w-0 flex-col items-center px-1 text-center md:mt-12">
            <p className="text-center text-q-caption-xs text-q-brand uppercase">
              {slide.eyebrow}
            </p>
            <h2 className="mt-2 max-w-full text-center font-q-display [font-feature-settings:'ss04'] text-q-accent-sm text-balance text-q-fg uppercase md:mt-4 md:text-q-accent-lg">
              {slide.title}
            </h2>
            <p className="mt-2 max-w-129 text-center text-q-body-sm text-q-soft">
              {slide.body}
            </p>
          </div>
        </div>

        <div className="mt-6 flex w-full min-w-0 shrink-0 items-center justify-center gap-1.5 md:mt-10 md:gap-2">
          <PagerArrow label="Previous example" onClick={() => go(index - 1)}>
            <Icon name="chevron-left" size={16} />
          </PagerArrow>

          <div className="flex min-w-0 items-center justify-center md:flex-none">
            <div className="flex items-center gap-1 overflow-hidden rounded-q-full border border-q-hairline bg-black/10 px-2 py-2">
              {HOW_IT_WORKS.map((item, i) => {
                const current = i === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={current}
                    aria-label={item.title}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative flex shrink-0 items-center overflow-hidden rounded-q-full bg-q-card transition-[width,height] duration-200 ease-q-pop outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                      current
                        ? "h-12 w-22 border-[1.5px] border-white p-1"
                        : "h-6 w-10",
                    )}
                  >
                    {current ? (
                      <span className="block size-full overflow-hidden rounded-q-full">
                        <video
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="none"
                          poster={item.poster}
                          src={item.video}
                          aria-hidden
                          className="size-full object-cover"
                        />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        loading="lazy"
                        decoding="async"
                        src={item.poster}
                        className="size-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <PagerArrow label="Next example" onClick={() => go(index + 1)}>
            <Icon name="chevron-right" size={16} />
          </PagerArrow>
        </div>
      </div>
    </section>
  );
}

function PagerArrow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full border-2 border-white/8 bg-transparent px-2 py-1 text-white transition-colors duration-150 outline-none hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-q-focus active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      {children}
    </button>
  );
}
