"use client";

import { useRef, useState } from "react";

import { ActionButton } from "@/components/core/action-button";
import { Icon } from "@/components/core/icon";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import type { Generation } from "@/types/generation.types";

/**
 * One Voice Change or Translate generation, as a 3:4 video tile.
 *
 * These two modes hand back an edited video, so their history is a grid rather
 * than the speech tab's list. At rest the tile shows a centred play button; on
 * hover an action rail slides in at the right edge — the same gesture the feed
 * tiles already use, so moving between surfaces teaches nothing new.
 */
export function DubTile({ generation }: { generation: Generation }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const actions = useGenerationActions(generation);

  const ready = generation.status === "ready";

  return (
    <article className="group bg-q-secondary relative aspect-[3/4] overflow-hidden rounded-q-300 border border-q-subtle">
      {ready ? (
        <video
          ref={video}
          src={generation.src}
          poster={generation.poster}
          preload="metadata"
          playsInline
          loop
          muted
          onPlay={() => {
            setPlaying(true);
          }}
          onPause={() => {
            setPlaying(false);
          }}
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full animate-pulse bg-q-w-05 motion-reduce:animate-none" />
      )}

      {!ready && (
        <span className="absolute inset-x-0 bottom-3 text-center text-q-caption-l text-q-soft">
          {generation.status === "processing" ? "Processing…" : "Generating…"}
        </span>
      )}

      {ready && (
        <>
          {/* At rest: a centred play control. It hides while playing so the
              picture is not covered by a button nobody needs. */}
          <button
            type="button"
            aria-label={playing ? "Pause" : `Play “${generation.prompt}”`}
            onClick={() => {
              const element = video.current;
              if (!element) return;
              if (playing) {
                element.pause();
                return;
              }
              document.querySelectorAll("video").forEach((other) => {
                if (other !== element) other.pause();
              });
              void element.play();
            }}
            className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-q-focus"
          >
            <span
              className={
                "flex size-16 items-center justify-center rounded-q-full bg-white/85 text-black transition-opacity duration-150 motion-reduce:transition-none " +
                (playing ? "opacity-0 group-hover:opacity-100" : "opacity-100")
              }
            >
              <Icon name={playing ? "pause" : "play"} size={24} />
            </span>
          </button>

          {/* On hover: the action rail at the right edge. */}
          <span className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
            <ActionButton
              icon="copy"
              label="Copy prompt"
              onAction={() => navigator.clipboard?.writeText(generation.prompt)}
            />
            <ActionButton
              icon="download"
              label="Download"
              onAction={actions.download}
            />
            <ActionButton
              icon="heart"
              label={generation.liked ? "Unlike" : "Like"}
              onAction={actions.toggleLike}
            />
            <ActionButton
              icon="trash-2"
              label="Delete"
              onAction={actions.remove}
            />
          </span>

          <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-q-full bg-black/55 px-2 py-1 text-q-caption-xs font-medium tracking-normal text-white backdrop-blur-sm">
            <Icon name="mic" size={12} />
            {generation.prompt}
          </span>
        </>
      )}
    </article>
  );
}
