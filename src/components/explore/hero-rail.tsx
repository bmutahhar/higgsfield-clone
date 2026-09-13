"use client";

import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/core/badge";
import { ButtonLink } from "@/components/core/button-link";
import type { HeroCard } from "@/config/media";
import { cn } from "@/lib/cn";

export interface HeroRailProps {
  items: HeroCard[];
}

/*
 * 21:9 feature plus a thumbnail column. The selected index is real UI state —
 * unlike hover, it is not expressible in CSS — so useState is correct here.
 */
export function HeroRail({ items }: HeroRailProps) {
  const [index, setIndex] = useState(0);
  const hero = items[index];

  if (!hero) return null;

  return (
    <div className="mb-8 grid gap-3 lg:grid-cols-[1fr_236px]">
      <div className="relative aspect-21/9 overflow-hidden rounded-panel border border-hairline bg-n-3">
        <Image
          src={hero.poster}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
        />
        <span className="absolute inset-0 bg-[image:var(--scrim-bottom)]" />
        <div className="absolute right-7 bottom-6 left-7 flex items-end gap-6">
          <div className="max-w-[560px]">
            <Badge>New</Badge>
            <h1 className="mt-3 text-display-3 text-white">{hero.title}</h1>
            <p className="mt-2 text-body-lg/[1.45] text-w-80">{hero.blurb}</p>
          </div>
          <span className="flex-1" />
          <ButtonLink href="/video" size="lg" pill iconRight="arrow-right">
            Open
          </ButtonLink>
        </div>
      </div>

      <div className="flex min-h-105 flex-col gap-2">
        {items.map((item, n) => (
          <button
            key={item.title}
            type="button"
            aria-current={n === index}
            onClick={() => {
              setIndex(n);
            }}
            className={cn(
              "relative min-h-19 flex-1 cursor-pointer overflow-hidden rounded-media border bg-n-3 p-0",
              "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
              "focus-visible:shadow-ring focus-visible:outline-none",
              n === index ? "border-accent" : "border-hairline",
            )}
          >
            <Image
              src={item.poster}
              alt=""
              fill
              sizes="236px"
              className={cn(
                "object-cover transition-opacity duration-[220ms]",
                n === index ? "opacity-100" : "opacity-55",
              )}
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-black/15" />
            <span className="absolute right-2.5 bottom-2 left-2.5 text-left text-caption/[1.25] font-medium text-white">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
