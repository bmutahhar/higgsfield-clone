"use client";

import { useEffect, useRef, useState } from "react";

import { FeedTile } from "@/components/feed/feed-tile";
import { PendingTile } from "@/components/feed/pending-tile";
import { SelectionBar } from "@/components/feed/selection-bar";
import { ZoomControl } from "@/components/feed/zoom-control";
import { GenerationLightbox } from "@/components/overlays/generation-lightbox";
import { MIN_COLUMNS, MIN_TILE_WIDTH } from "@/config/image-studio";
import { useFeedColumns } from "@/hooks/use-feed-columns";
import { balanceColumns } from "@/lib/masonry";
import { downloadAsset } from "@/services/asset-transfer";
import { useGenerationStore } from "@/stores/generation-store";
import type { Generation, ReadyGeneration } from "@/types/generation.types";

export interface ImageFeedProps {
  generations: Generation[];
}

/*
 * The canvas: everything above the composer.
 *
 * The page itself never scrolls — the studio layout sizes to the viewport and
 * this is the one scroll container. The 240px of bottom margin under the
 * masonry is what keeps the last row clear of the fixed composer; padding on
 * the scroller would not, since the composer is not in its flow.
 *
 * Layout is a balanced column split rather than absolute positioning: the
 * ratios are known up front — for running jobs as much as for finished images
 * — so columns fill shortest-first with no measurement pass, and a generation
 * landing swaps a tile in place without moving anything below it.
 *
 * A generation that has not reached `ready` is one still running, and renders
 * as a held frame rather than a picture.
 */
export function ImageFeed({ generations }: ImageFeedProps) {
  const { zoom, setZoom, columns } = useFeedColumns();
  const remove = useGenerationStore((state) => state.remove);
  const [selected, setSelected] = useState<string[]>([]);
  /*
   * Held by id, not by record: the expanded tile can be liked or deleted while
   * it is open, and a captured object would go stale the moment either
   * happened.
   */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /*
   * The zoom stop is a ceiling. A narrow window overrides it so the tiles keep
   * a usable width — which is also what makes the mobile feed two columns with
   * the zoom control hidden. Measured rather than assumed from a breakpoint,
   * because the scroller, not the viewport, is what the columns divide.
   */
  const scroller = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Null until measured, so the server and the first client paint agree.
  const fitted =
    width === null
      ? columns
      : Math.max(
          MIN_COLUMNS,
          Math.min(columns, Math.floor(width / MIN_TILE_WIDTH)),
        );

  const buckets = balanceColumns(generations, fitted);

  /*
   * The live selection is derived, not pruned.
   *
   * A tile can now leave the feed from its own overflow menu as well as from
   * this bar, and a running one can be cancelled. Filtering against what is
   * actually here means none of those paths has to reach in and clear an id —
   * a deleted tile simply stops counting.
   */
  const chosen = selected.filter((id) =>
    generations.some((generation) => generation.id === id),
  );

  // Only finished images are selectable, so the bar always has a thumbnail.
  const lastSelected = generations.find(
    (generation) =>
      generation.id === chosen.at(-1) && generation.src !== undefined,
  );

  // A predicate, not a plain callback: `find` cannot narrow the union on its
  // own, and the lightbox only renders something that has landed.
  const expanded = generations.find(
    (generation): generation is ReadyGeneration =>
      generation.id === expandedId && generation.status === "ready",
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function downloadChosen() {
    for (const id of chosen) {
      const generation = generations.find((item) => item.id === id);
      if (generation?.status !== "ready") continue;
      /*
       * One at a time. Browsers throttle a burst of simultaneous saves and
       * some drop all but the first without saying so.
       */
      await downloadAsset(generation.src, generation.prompt);
    }
  }

  return (
    <div className="relative flex size-full min-w-0 flex-col gap-2.5">
      <div className="z-10 container flex h-8 shrink-0 items-center justify-end">
        <ZoomControl zoom={zoom} onChange={setZoom} />
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scroller}
          className="hf-scrollbar absolute inset-0 overflow-x-hidden overflow-y-auto pr-4"
        >
          <div className="mb-60 flex w-full gap-[2px]">
            {buckets.map((bucket, i) => (
              <div
                // Columns are positions, not entities — index is their identity.
                key={i}
                className="flex min-w-0 flex-1 flex-col gap-[2px]"
              >
                {bucket.map((generation) =>
                  generation.status !== "ready" ? (
                    <PendingTile
                      key={generation.id}
                      w={generation.w}
                      h={generation.h}
                      phase={generation.status}
                      // Cancelling drops the tile and, with it, the query that
                      // was polling for it.
                      onCancel={() => {
                        remove([generation.id]);
                      }}
                    />
                  ) : (
                    <FeedTile
                      key={generation.id}
                      generation={generation}
                      selected={chosen.includes(generation.id)}
                      selecting={chosen.length > 0}
                      onToggle={() => {
                        toggle(generation.id);
                      }}
                      onExpand={() => {
                        setExpandedId(generation.id);
                      }}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {chosen.length > 0 && lastSelected?.src && (
        <SelectionBar
          count={chosen.length}
          poster={lastSelected.src}
          onClear={() => {
            setSelected([]);
          }}
          onDownload={() => {
            void downloadChosen();
          }}
          onDelete={() => {
            remove(chosen);
          }}
        />
      )}

      {expanded ? (
        <GenerationLightbox
          generation={expanded}
          onClose={() => {
            setExpandedId(null);
          }}
        />
      ) : null}
    </div>
  );
}
