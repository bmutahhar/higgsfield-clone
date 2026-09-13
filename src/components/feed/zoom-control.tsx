"use client";

import { FEED_COLUMNS } from "@/config/image-studio";

export interface ZoomControlProps {
  zoom: number;
  onChange: (next: number) => void;
}

/**
 * Grid density for the feed. Five stops, each a fixed column count — the
 * viewport width does not enter into it, which is why the tiles get genuinely
 * bigger rather than merely reflowing.
 */
export function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  const columns = FEED_COLUMNS[zoom];

  return (
    <div className="hidden h-8 items-center justify-center rounded-q-400 bg-q-panel px-3.5 md:flex">
      <input
        type="range"
        min={0}
        max={FEED_COLUMNS.length - 1}
        step={1}
        value={zoom}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        aria-label="Grid size"
        aria-valuetext={`${String(columns)} columns`}
        className="q-slider w-36 focus:outline-none"
      />
    </div>
  );
}
