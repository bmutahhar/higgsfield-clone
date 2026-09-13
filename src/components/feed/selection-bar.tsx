"use client";

import Image from "next/image";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface SelectionBarProps {
  count: number;
  /** Thumbnail of the most recently selected tile. */
  poster: string;
  onClear: () => void;
  onDelete: () => void;
}

/*
 * Every action carries a soft elliptical glow that rises from below the button
 * on hover. It is a blurred pseudo-box rather than a shadow because it has to
 * be clipped by the button's own rounding.
 */
const GLOW =
  "pointer-events-none absolute bottom-[-20px] left-1/2 h-[30px] w-[84px] -translate-x-1/2 rounded-[50%] bg-white/25 opacity-0 blur-lg transition-opacity group-hover/btn:opacity-100 motion-reduce:transition-none";

const ACTION =
  "border-q-hairline bg-q-w-05 text-q-body group/btn relative flex h-10 items-center gap-2 overflow-hidden rounded-q-300 border px-4 transition-colors hover:bg-q-w-08 focus-visible:bg-q-w-08 focus-visible:outline-none";

/**
 * The multi-select toolbar. Lives in the page's overlay layer so it floats
 * over the composer rather than under it.
 */
export function SelectionBar({
  count,
  poster,
  onClear,
  onDelete,
}: SelectionBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-100 flex justify-center">
      <div className="pointer-events-auto flex h-14 max-w-[calc(100%-2rem)] items-center gap-1 rounded-q-400 bg-q-card/80 px-1.5 backdrop-blur-xl">
        <div className="flex h-full shrink-0 items-center gap-2 px-3">
          <span className="relative size-4 shrink-0 overflow-hidden rounded-[2px] bg-q-card shadow-md ring-1 shadow-black/50 ring-white">
            <Image
              src={poster}
              alt=""
              fill
              sizes="16px"
              className="object-cover"
            />
          </span>
          <p className="text-q-body-sm font-semibold whitespace-nowrap">
            {count} selected
          </p>
        </div>

        <div className="hf-scrollbar-none flex min-w-0 items-center gap-1 overflow-x-auto">
          <Action icon="download" label="Download" />
          <Action icon="folder-plus" label="Add to" chevron />
          <Action icon="at-sign" label="Assign to element" iconOnly />
          <Action
            icon="trash-2"
            label="Delete selected"
            iconOnly
            onClick={onDelete}
          />
          <Action icon="ellipsis" label="More actions" iconOnly />
        </div>

        <button
          type="button"
          aria-label="Clear selection"
          onClick={onClear}
          className="flex size-10 shrink-0 items-center justify-center rounded-q-300 bg-transparent text-q-body transition-colors hover:text-q-fg focus-visible:outline-none"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
    </div>
  );
}

function Action({
  icon,
  label,
  iconOnly = false,
  chevron = false,
  onClick,
}: {
  icon: IconName;
  label: string;
  iconOnly?: boolean;
  chevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={iconOnly ? label : undefined}
      onClick={onClick}
      className={cn(ACTION, iconOnly && "w-13 justify-center px-0")}
    >
      <span className={GLOW} />
      <Icon name={icon} size={18} />
      {!iconOnly && (
        <span className="text-q-body-sm whitespace-nowrap">{label}</span>
      )}
      {chevron && <Icon name="chevron-down" size={14} />}
    </button>
  );
}
