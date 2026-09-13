"use client";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface BatchStepperProps {
  value: number;
  max: number;
  onChange: (next: number) => void;
  /**
   * The shell around the control. Each surface draws its own: the image
   * composer uses its pill, the audio panel a settings row, the audio sheet a
   * bare footer cluster. The stepper owns the behaviour, not the frame.
   */
  className?: string;
  /**
   * Render the ceiling as `1/4`. On by default, because every surface that
   * gives the control a row of its own also labels the limit — only the phone
   * footer, where the row is gone, shows the count alone.
   */
  showMax?: boolean;
  /** Named for a reader who meets the buttons out of context. */
  label?: string;
}

const STEP_CLASS =
  "flex size-5 items-center justify-center text-q-idle transition-colors hover:text-q-fg disabled:text-white/25 disabled:hover:text-white/25 focus-visible:outline-none focus-visible:text-q-fg";

/** How many generations one press of Generate produces. Reads `1/4`, not `1 of 4`. */
export function BatchStepper({
  value,
  max,
  onChange,
  className,
  showMax = true,
  label = "batch size",
}: BatchStepperProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= 1}
        onClick={() => {
          onChange(Math.max(1, value - 1));
        }}
        className={STEP_CLASS}
      >
        <Icon name="minus" size={16} />
      </button>

      <span
        className={cn(
          "text-center tabular-nums",
          showMax ? "min-w-8" : "min-w-4",
        )}
      >
        <span className="text-q-fg">{value}</span>
        {showMax && <span className="text-q-idle">/{max}</span>}
      </span>

      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => {
          onChange(Math.min(max, value + 1));
        }}
        className={STEP_CLASS}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
