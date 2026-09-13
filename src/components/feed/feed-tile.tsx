"use client";

import Image from "next/image";

import { ActionButton, ROUND_ACTION } from "@/components/core/action-button";
import { Icon, type IconName } from "@/components/core/icon";
import { TileMenu } from "@/components/feed/tile-menu";
import { Tooltip } from "@/components/overlays/tooltip";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import { cn } from "@/lib/cn";
import type { ReadyGeneration } from "@/types/generation.types";

export interface FeedTileProps {
  generation: ReadyGeneration;
  selected: boolean;
  /** True once anything is selected: every checkbox then stays visible. */
  selecting: boolean;
  onToggle: () => void;
  /** Opens the full-size view. The picture itself is the trigger. */
  onExpand: () => void;
}

const CLUSTER_BTN =
  "border-q-hairline pointer-events-auto flex h-8 items-center justify-center border bg-black/40 px-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:bg-black/65 focus-visible:outline-none";

/*
 * Both control groups shrink rather than crowd once the tile itself is small,
 * which is what keeps the densest zoom levels legible. These are container
 * queries against the tile, not media queries — at seven columns every tile is
 * small regardless of how wide the window is.
 */
const SHRINK =
  "[@container_(max-height:200px)]:scale-75 [@container_(max-width:180px)]:scale-75 [@container_(max-height:200px)]:gap-0.5 [@container_(max-width:180px)]:gap-0.5";

const REVEAL =
  "opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 motion-reduce:transition-none";

export function FeedTile({
  generation,
  selected,
  selecting,
  onToggle,
  onExpand,
}: FeedTileProps) {
  const actions = useGenerationActions(generation);
  const liked = generation.liked === true;

  return (
    <figure
      className={cn(
        "group/tile @container relative overflow-hidden bg-q-pill",
        "transition-[border-radius,transform] duration-200 motion-reduce:transition-none",
        selected && "scale-[97%] rounded-q-100 ring-3 ring-white",
      )}
      // Ratio comes from the data, so it cannot be a utility class. It is what
      // gives the column its height before the image has loaded.
      style={{
        aspectRatio: `${String(generation.w)} / ${String(generation.h)}`,
      }}
    >
      <Image
        src={generation.src}
        alt={generation.prompt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />

      {/*
        The whole picture opens the expanded view. A real button rather than a
        handler on the figure: this is the tile's primary action and has to be
        reachable by keyboard like every other one — focusing it also reveals
        the rail, through the same `group-focus-within` the controls use.
      */}
      <button
        type="button"
        aria-label={`Open ${generation.prompt}`}
        onClick={onExpand}
        className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      />

      <div className="[container-type:size] pointer-events-none absolute inset-0">
        <div className="q-tile-scrim absolute inset-x-0 top-0 h-1/4" />
        <div className="q-tile-scrim absolute inset-x-0 bottom-0 h-1/4 rotate-180" />

        {/*
          Right rail: what to do with this image. Four buttons, as measured —
          copying lives in the overflow menu rather than taking a fifth slot.
        */}
        <div className="absolute top-0 right-0 z-10 flex h-full flex-col items-end pt-2.5 pr-2.5 pl-8">
          <div
            className={cn(
              "flex origin-top-right flex-col items-center gap-1",
              SHRINK,
              REVEAL,
            )}
          >
            <Tooltip label={liked ? "Unlike" : "Like"} side="left">
              <ActionButton
                icon="heart"
                label={liked ? "Unlike" : "Like"}
                pressed={liked}
                onAction={actions.toggleLike}
              />
            </Tooltip>
            <Tooltip label="Download" side="left">
              <ActionButton
                icon="download"
                label="Download"
                onAction={actions.download}
              />
            </Tooltip>
            {/* The copy glyph is upstream's, and this is what it always meant. */}
            <Tooltip label="Recreate" side="left">
              <ActionButton
                icon="copy"
                label="Recreate"
                onAction={actions.recreate}
              />
            </Tooltip>
            <Tooltip label="More actions" side="left">
              <TileMenu
                triggerClassName={ROUND_ACTION}
                actions={actions}
                liked={liked}
              />
            </Tooltip>
          </div>
        </div>

        {/* Bottom cluster: what to make next from this image. */}
        <div
          className={cn(
            "absolute right-2 bottom-2 z-10 flex origin-bottom-right items-center gap-1",
            "[@container_(max-height:200px)]:right-1 [@container_(max-height:200px)]:bottom-1",
            "[@container_(max-width:180px)]:right-1 [@container_(max-width:180px)]:bottom-1",
            SHRINK,
            REVEAL,
          )}
        >
          <Tooltip label="Reference">
            <button
              type="button"
              aria-label="Reference"
              className={cn(CLUSTER_BTN, "rounded-full")}
            >
              <Icon name="image" size={16} />
            </button>
          </Tooltip>
          <SplitButton icon="video" label="Animate" />
          <SplitButton icon="move-3d" label="Create 3D scene" />
        </div>
      </div>

      {/* Selection. A real checkbox with a 40px hit area over a 16px box. */}
      <label
        className={cn(
          "pointer-events-auto absolute top-2 left-2 z-10 -m-3 flex cursor-pointer p-3",
          "transition-opacity duration-200 motion-reduce:transition-none @[15rem]:top-3",
          selecting
            ? "opacity-100"
            : "opacity-0 group-focus-within/tile:opacity-100 group-hover/tile:opacity-100",
        )}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${generation.prompt}`}
          className="hf-sr-only peer"
        />
        <span className="flex size-4 items-center justify-center rounded-[4px] border border-white/70 bg-black/30 transition-colors peer-checked:border-white peer-checked:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/60 peer-checked:[&>svg]:opacity-100">
          <Icon name="check" size={12} className="text-black opacity-0" />
        </span>
      </label>
    </figure>
  );
}

/** The action plus its own options chevron, hairlined together into one pill. */
function SplitButton({ icon, label }: { icon: IconName; label: string }) {
  return (
    <span className="pointer-events-auto flex rounded-full backdrop-blur-sm">
      <Tooltip label={label}>
        <button
          type="button"
          aria-label={label}
          className={cn(CLUSTER_BTN, "rounded-l-full border-r-0 pr-1.5")}
        >
          <Icon name={icon} size={16} />
        </button>
      </Tooltip>
      <button
        type="button"
        aria-label={`${label} options`}
        className={cn(CLUSTER_BTN, "rounded-r-full pr-2 pl-1.5")}
      >
        <Icon name="chevron-down" size={14} />
      </button>
    </span>
  );
}
