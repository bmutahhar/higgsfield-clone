"use client";

import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/core/badge";
import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/cn";

export interface ProjectPlayerProps {
  poster: string;
  video?: string;
}

/** Play state is real state; the scrub fill is a dynamic width. */
export function ProjectPlayer({ poster, video }: ProjectPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-panel bg-n-3 shadow-[var(--inset-hairline)]">
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover"
      />
      {playing && video && (
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <span className="absolute inset-0 bg-[image:var(--scrim-top)] opacity-70" />

      {/* Specs are not one-word labels, so they keep their own casing rather
          than taking the badge's uppercase treatment. */}
      <div className="absolute top-3.5 right-3.5 flex gap-2">
        <Badge tone="glass" uppercase={false}>
          <span className="font-mono">1080p</span>
        </Badge>
        <Badge tone="glass" uppercase={false}>
          <span className="font-mono">9:16 · 5s</span>
        </Badge>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-[image:var(--scrim-bottom)] p-4">
        <IconButton
          icon={playing ? "pause" : "play"}
          label={playing ? "Pause" : "Play"}
          variant="accent"
          onClick={() => {
            setPlaying(!playing);
          }}
        />
        <span className="font-mono text-mono text-white">
          00:0{playing ? 2 : 0} / 00:05
        </span>
        <span className="h-[3px] flex-1 rounded-full bg-w-24">
          <span
            className={cn(
              "block h-full rounded-full bg-lime",
              "transition-[width] duration-[220ms] ease-snap motion-reduce:duration-0",
            )}
            style={{ width: playing ? "40%" : "0%" }}
          />
        </span>
        <IconButton icon="volume-2" label="Mute" variant="glass" size="sm" />
        <IconButton
          icon="maximize-2"
          label="Fullscreen"
          variant="glass"
          size="sm"
        />
      </div>
    </div>
  );
}
