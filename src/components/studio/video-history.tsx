"use client";

import { useRef } from "react";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";
import type { Generation } from "@/types/generation.types";

/** What each phase says while a clip is still being made. */
const PHASE_LABEL: Record<string, string> = {
  processing: "Queued",
  generating: "Generating",
};

export interface VideoHistoryProps {
  generations: Generation[];
  /** 0–5 from the pane toolbar; fewer columns means larger tiles. */
  zoom: number;
  layout: "list" | "grid";
}

/**
 * Everything this studio has produced, newest first.
 *
 * A running job holds its frame from the moment it is accepted rather than
 * appearing when it lands: the aspect is known up front, so the tile can be
 * reserved and the clip swapped in without moving anything around it.
 *
 * Empty, this renders nothing at all — no illustration, no prompt to start.
 * That is deliberate and matches the live studio, which leaves the canvas
 * blank until you have made something.
 */
export function VideoHistory({ generations, zoom, layout }: VideoHistoryProps) {
  if (generations.length === 0) {
    return (
      <div
        role="status"
        aria-label="No generations yet"
        className="min-h-full w-full"
      />
    );
  }

  // The toolbar's zoom is a column count, inverted: more zoom, larger tiles.
  const columns = layout === "list" ? 1 : Math.max(1, 6 - zoom);

  return (
    <ul
      className="grid gap-3 p-3"
      // The column count is a live numeric value, so it cannot be a class.
      style={{
        gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
      }}
    >
      {generations.map((generation) => (
        <HistoryTile key={generation.id} generation={generation} />
      ))}
    </ul>
  );
}

function HistoryTile({ generation }: { generation: Generation }) {
  const video = useRef<HTMLVideoElement>(null);
  const ready = generation.status === "ready";

  function play() {
    const node = video.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void node.play().catch(() => {
      /* Refused autoplay leaves the poster up, which is correct anyway. */
    });
  }

  return (
    <li
      onMouseEnter={ready ? play : undefined}
      onMouseLeave={() => video.current?.pause()}
      className={cn(
        "group/tile relative isolate overflow-hidden rounded-q-300 bg-q-card",
        // The frame is known before the clip exists, so the tile never resizes.
        "aspect-video",
      )}
    >
      {ready ? (
        <>
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            poster={generation.poster}
            src={generation.src}
            aria-label={generation.prompt || "Generated clip"}
            className="size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover/tile:opacity-100 motion-reduce:transition-none">
            <p className="line-clamp-2 text-q-label-xs text-white">
              {generation.prompt || "No prompt"}
            </p>
          </div>
        </>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2">
          {/*
            A pulse, not a spinner: there is no progress to report, and a
            determinate-looking control would be inventing one.
          */}
          <Icon
            name="loader"
            size={18}
            className="animate-spin text-q-muted motion-reduce:animate-none"
          />
          <span className="text-q-label-xs text-q-muted">
            {PHASE_LABEL[generation.status] ?? "Working"}
          </span>
        </div>
      )}
    </li>
  );
}
