"use client";

import { useRef, useState } from "react";

import { ActionButton, ROUND_ACTION } from "@/components/core/action-button";
import { Icon } from "@/components/core/icon";
import { GenerationLightbox } from "@/components/overlays/generation-lightbox";
import { Tooltip } from "@/components/overlays/tooltip";
import { ClipMenu } from "@/components/studio/clip-menu";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import { cn } from "@/lib/cn";
import type { Generation, ReadyGeneration } from "@/types/generation.types";

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
  /**
   * Shown when nothing has been generated. A slot rather than a fixed state:
   * Genjutsu leaves this blank, the other two surfaces explain themselves.
   */
  empty?: React.ReactNode;
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
  /*
   * Held by id, not by record: the expanded clip can be liked or deleted while
   * it is open, and a captured object would go stale the moment either
   * happened. Declared above the empty-state return so the hook order holds.
   */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // A predicate, not a plain callback: `find` cannot narrow the union alone.
  const expanded = generations.find(
    (generation): generation is ReadyGeneration =>
      generation.id === expandedId && generation.status === "ready",
  );

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
    <>
      <ul
        className="grid gap-3 p-3"
        // The column count is a live numeric value, so it cannot be a class.
        style={{
          gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
        }}
      >
        {generations.map((generation) => (
          <HistoryTile
            key={generation.id}
            generation={generation}
            onExpand={() => {
              setExpandedId(generation.id);
            }}
          />
        ))}
      </ul>

      {expanded ? (
        <GenerationLightbox
          generation={expanded}
          onClose={() => {
            setExpandedId(null);
          }}
        />
      ) : null}
    </>
  );
}

function HistoryTile({
  generation,
  onExpand,
}: {
  generation: Generation;
  onExpand: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const actions = useGenerationActions(generation);
  const ready = generation.status === "ready";
  const liked = generation.liked === true;

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

          {/*
            The clip itself opens the expanded view, the same way the picture
            does in the image feed. A real button so it is reachable by
            keyboard, and below the rail so the controls still win the click.
          */}
          <button
            type="button"
            aria-label={`Open ${generation.prompt || "generated clip"}`}
            onClick={onExpand}
            className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          />

          {/*
            A row across the top rather than the image feed's vertical rail.
            These tiles are 16:9 — they run out of height long before they run
            out of width, so a stacked rail would overflow a tile that a
            horizontal one sits comfortably inside.

            Hovering a button still counts as hovering the tile, so the clip
            keeps playing underneath.
          */}
          <div
            className={cn(
              "absolute top-2 right-2 z-20 flex items-center gap-1",
              "opacity-0 transition-opacity duration-200 motion-reduce:transition-none",
              "group-focus-within/tile:opacity-100 group-hover/tile:opacity-100",
            )}
          >
            <Tooltip label={liked ? "Unlike" : "Like"} side="bottom">
              <ActionButton
                icon="heart"
                label={liked ? "Unlike" : "Like"}
                pressed={liked}
                onAction={actions.toggleLike}
              />
            </Tooltip>
            <Tooltip label="Download" side="bottom">
              <ActionButton
                icon="download"
                label="Download"
                onAction={actions.download}
              />
            </Tooltip>
            {/* The same glyph the preset cards use for the same idea. */}
            <Tooltip label="Recreate" side="bottom">
              <ActionButton
                icon="refresh-cw"
                label="Recreate"
                onAction={actions.recreate}
              />
            </Tooltip>
            <Tooltip label="More actions" side="bottom">
              <ClipMenu
                actions={actions}
                liked={liked}
                triggerClassName={ROUND_ACTION}
              />
            </Tooltip>
          </div>

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
