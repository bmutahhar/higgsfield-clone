"use client";

import { Icon } from "@/components/core/icon";
import { Spinner } from "@/components/display/spinner";
import { cn } from "@/lib/cn";
import type { GenerationPhase } from "@/types/generation.types";

export interface PendingTileProps {
  w: number;
  h: number;
  /** `ready` never reaches here — the finished tile takes over. */
  phase: Exclude<GenerationPhase, "ready">;
  onCancel: () => void;
}

const LABEL: Record<PendingTileProps["phase"], string> = {
  processing: "Processing",
  generating: "Generating",
};

const PILL =
  "flex h-8 items-center gap-2 rounded-full bg-white/10 px-3 backdrop-blur-md text-q-body-sm font-medium text-white";

/*
 * A frame reserved for an image that is still being generated.
 *
 * It occupies the exact space the finished image will, so nothing below it
 * moves when the picture arrives — which is the whole reason the job carries
 * its ratio from the moment it is accepted.
 *
 * The two phases differ only in colour and one word, and both come from the
 * inherited `color`: white while the request is queued, brand once the model
 * is actually working. The light, the spinner and the label all follow it, so
 * the transition is a single class rather than three that could disagree.
 */
export function PendingTile({ w, h, phase, onCancel }: PendingTileProps) {
  return (
    <div
      className={cn(
        "@container relative overflow-hidden bg-q-pill transition-colors duration-500",
        phase === "generating" ? "text-q-brand" : "text-white",
      )}
      // Ratio comes from the job, so it cannot be a utility class.
      style={{ aspectRatio: `${String(w)} / ${String(h)}` }}
    >
      {/* The breathing light, over the top third. */}
      <span
        aria-hidden="true"
        className="q-generation-light pointer-events-none absolute inset-x-0 top-0 h-1/3"
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 @[13rem]:p-3">
        <p className={PILL} role="status">
          <Spinner size={14} className="border-white/20 border-t-current" />
          {/* The word is the only copy that changes between phases. */}
          <span className="@max-[15rem]:hidden">{LABEL[phase]}</span>
        </p>

        <button
          type="button"
          onClick={onCancel}
          className={cn(
            PILL,
            "shrink-0 cursor-pointer transition-colors hover:bg-white/16 focus-visible:bg-white/16 focus-visible:outline-none",
          )}
        >
          <Icon name="ban" size={14} />
          <span className="@max-[15rem]:hidden">Cancel</span>
        </button>
      </div>
    </div>
  );
}
