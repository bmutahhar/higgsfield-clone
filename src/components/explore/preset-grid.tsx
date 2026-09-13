"use client";

import { useState } from "react";

import { Button } from "@/components/core/button";
import { Tag } from "@/components/core/tag";
import { MediaCard } from "@/components/display/media-card";
import type { HeroCard, Preset } from "@/config/media";
import { cn } from "@/lib/cn";

export interface PresetGridProps {
  presets: Preset[];
  /** Loops borrowed for the hover cross-fade; presets ship as stills only. */
  clips: HeroCard[];
  categories: string[];
  columns?: string;
  meta?: string;
  newCount?: number;
  className?: string;
}

/** Filter selection is real state; every visual state below is CSS. */
export function PresetGrid({
  presets,
  clips,
  categories,
  columns = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
  meta = "5s · Seedance 2.5",
  newCount = 1,
  className,
}: PresetGridProps) {
  const [filter, setFilter] = useState(categories[0] ?? "All");

  return (
    <div className={className}>
      <div className="mb-3.5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Tag
            key={category}
            selected={category === filter}
            onClick={() => {
              setFilter(category);
            }}
          >
            {category}
          </Tag>
        ))}
      </div>

      <div className={cn("grid gap-[var(--grid-gap)]", columns)}>
        {presets.map((preset, n) => (
          <MediaCard
            key={preset.slug}
            poster={preset.poster}
            video={clips[n % clips.length]?.video}
            title={preset.name}
            meta={meta}
            badge={n < newCount ? "New" : undefined}
            ratio="3 / 4"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
            action={
              <Button size="sm" pill>
                Recreate
              </Button>
            }
            overlayActions={[
              { icon: "heart", label: "Like" },
              { icon: "bookmark", label: "Save" },
            ]}
          />
        ))}
      </div>
    </div>
  );
}
