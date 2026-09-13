"use client";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/**
 * The zoom and layout controls in the pane header. They belong to History, but
 * they stay mounted on every tab — hidden with `invisible` plus `inert` rather
 * than unmounted — so the header keeps a constant height and the tabs beside
 * them never shift as you switch.
 */
export function PaneToolbar({
  visible,
  layout,
  onLayoutChange,
  zoom,
  onZoomChange,
}: {
  visible: boolean;
  layout: "list" | "grid";
  onLayoutChange: (next: "list" | "grid") => void;
  zoom: number;
  onZoomChange: (next: number) => void;
}) {
  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn("flex items-center gap-2", !visible && "invisible")}
    >
      <div className="flex items-center gap-3 rounded-q-500 bg-q-panel pr-3 pl-0.5">
        <button
          type="button"
          aria-label="Fit to view"
          className="flex size-6 items-center justify-center rounded-q-150 text-q-muted transition-colors duration-150 outline-none hover:text-q-fg focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          <Icon name="maximize-2" size={14} />
        </button>

        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={zoom}
          aria-label="Thumbnail size"
          onChange={(event) => onZoomChange(Number(event.target.value))}
          // The fill percentage has to reach CSS as a number; a class cannot
          // carry it. hf-slider reads this custom property.
          style={
            { "--hf-slider-pct": `${(zoom / 5) * 100}%` } as React.CSSProperties
          }
          className="hf-slider h-1.5 w-32 cursor-pointer appearance-none rounded-full"
        />
      </div>

      <div
        role="tablist"
        aria-label="Result layout"
        aria-orientation="horizontal"
        className="flex gap-1 rounded-q-200 border border-q-hairline bg-q-panel p-0.5"
      >
        {(["list", "grid"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={layout === id}
            tabIndex={layout === id ? 0 : -1}
            onClick={() => onLayoutChange(id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-q-200 px-2.5 text-q-label-xs capitalize transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
              layout === id
                ? "border border-q-hairline bg-q-card text-q-fg"
                : "text-q-muted hover:text-q-fg",
            )}
          >
            <Icon name={id === "list" ? "rows-3" : "grid-2x2"} size={16} />
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}
