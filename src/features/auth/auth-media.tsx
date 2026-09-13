"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Icon } from "@/components/core/icon";
import { AUTH_SLIDES, SLIDE_DURATION_MS } from "@/config/auth";
import { cn } from "@/lib/cn";

/*
 * The xl-only half. Four slides at a measured 5s each, advancing on a linear
 * timer and wrapping.
 *
 * `elapsed` is genuine state — it drives a width, not a class — so this is the
 * one place here that legitimately re-renders on a tick. It updates about 16
 * times a second rather than per frame, which is imperceptible on a 1px bar
 * and a fraction of the work.
 */
const TICK_MS = 60;

export function AuthMedia() {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Holding on slide 1 is the reduced-motion answer; the labels still work.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + TICK_MS;
        if (next >= SLIDE_DURATION_MS) {
          setIndex((current) => (current + 1) % AUTH_SLIDES.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  function jumpTo(next: number) {
    setIndex(next);
    setElapsed(0);
  }

  const slide = AUTH_SLIDES[index];
  if (!slide) return null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-q-300 bg-black">
      <div className="absolute inset-0">
        {slide.media.kind === "video" ? (
          <video
            key={slide.id}
            src={slide.media.src}
            aria-label={slide.title}
            autoPlay
            loop
            playsInline
            disablePictureInPicture
            preload="none"
            className="size-full object-cover"
          />
        ) : (
          <Image
            key={slide.id}
            src={slide.media.src}
            alt={slide.title}
            fill
            sizes="50vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex gap-1">
            {slide.badges.map((badge) => (
              <span
                key={badge.text}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] leading-3.5 font-semibold text-white backdrop-blur-lg"
              >
                <Icon name={badge.icon} size={16} />
                {badge.text}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-q-display text-[40px] leading-12 font-bold tracking-[-0.8px] text-white uppercase">
              {slide.title}
            </h2>
            <p className="text-sm leading-5 text-white/50">{slide.body}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {AUTH_SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.label}`}
                onClick={() => {
                  jumpTo(i);
                }}
                className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/20"
              >
                <div
                  /*
                   * A fill percentage is continuous, so it cannot be a class.
                   * Passed slides hold at 100%, upcoming sit at 0%.
                   */
                  style={{
                    width:
                      i < index
                        ? "100%"
                        : i === index
                          ? `${String((elapsed / SLIDE_DURATION_MS) * 100)}%`
                          : "0%",
                  }}
                  className="h-full rounded-full bg-white"
                />
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {AUTH_SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  jumpTo(i);
                }}
                className={cn(
                  "min-w-0 flex-1 truncate text-left text-xs leading-4.5 transition-colors motion-reduce:transition-none",
                  i === index
                    ? "font-medium text-white"
                    : "font-normal text-white/40 hover:text-white/60",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
