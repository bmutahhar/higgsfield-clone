"use client";

import { useEffect, useRef, useState } from "react";

import { FeedTile } from "@/components/feed/feed-tile";
import { PendingTile } from "@/components/feed/pending-tile";
import { SelectionBar } from "@/components/feed/selection-bar";
import { ZoomControl } from "@/components/feed/zoom-control";
import { MIN_COLUMNS, MIN_TILE_WIDTH } from "@/config/image-studio";
import { useFeedColumns } from "@/hooks/use-feed-columns";
import { balanceColumns } from "@/lib/masonry";
import type { Generation } from "@/types/generation.types";

export interface ImageFeedProps {
  generations: Generation[];
  onRemove: (ids: string[]) => void;
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
export function ImageFeed({ generations, onRemove }: ImageFeedProps) {
  const { zoom, setZoom, columns } = useFeedColumns();
  const [selected, setSelected] = useState<string[]>([]);

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

  // Only finished images are selectable, so the bar always has a thumbnail.
  const lastSelected = generations.find(
    (generation) =>
      generation.id === selected.at(-1) && generation.src !== undefined,
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function remove(ids: string[]) {
    onRemove(ids);
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
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
                      item={{
                        id: generation.id,
                        src: generation.src,
                        w: generation.w,
                        h: generation.h,
                        prompt: generation.prompt,
                      }}
                      selected={selected.includes(generation.id)}
                      selecting={selected.length > 0}
                      onToggle={() => {
                        toggle(generation.id);
                      }}
                      onDelete={() => {
                        remove([generation.id]);
                      }}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected.length > 0 && lastSelected?.src && (
        <SelectionBar
          count={selected.length}
          poster={lastSelected.src}
          onClear={() => {
            setSelected([]);
          }}
          onDelete={() => {
            remove(selected);
          }}
        />
      )}
    </div>
  );
}
