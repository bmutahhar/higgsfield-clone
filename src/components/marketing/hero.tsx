"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { ButtonLink } from "@/components/core/button-link";
import { HERO } from "@/config/media";
import { cn } from "@/lib/cn";

const ROTATE_MS = 5200;

/** Full-bleed stills that cross-fade. Media is the design. */
export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((n) => (n + 1) % HERO.length);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const current = HERO[index];

  return (
    <section className="relative h-155 overflow-hidden">
      {HERO.map((item, n) => (
        <Image
          key={item.title}
          src={item.poster}
          alt=""
          fill
          priority={n === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-[640ms] ease-snap",
            "motion-reduce:transition-none",
            n === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <span className="absolute inset-0 bg-linear-to-t from-page from-[2%] via-page/55 via-[42%] to-page/25" />

      <div className="relative mx-auto flex h-full max-w-[var(--max-content)] flex-col justify-end px-8 pb-14">
        <Badge className="self-start">New</Badge>
        <h1 className="mt-4 max-w-225 text-display-1 uppercase">
          AI-native creative suite
        </h1>
        <p className="mt-4.5 max-w-155 text-body-lg text-secondary">
          Create images, videos, and voice content from text prompts or
          references. Edit and upscale media, and automate creative workflows
          with its AI agent.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <ButtonLink href="/explore" size="xl" pill iconRight="arrow-right">
            Start generating
          </ButtonLink>
          <Button size="xl" pill variant="glass" iconLeft="play">
            Watch the reel
          </Button>
          {current && (
            <span className="ml-2.5 text-body-sm text-muted">
              {current.title} — {current.blurb}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
