"use client";

import { Icon } from "@/components/core/icon";
import { PILL_CLASS } from "@/components/image-studio/setting-pill";
import { cn } from "@/lib/cn";

export interface BatchStepperProps {
  value: number;
  max: number;
  onChange: (next: number) => void;
}

const STEP_CLASS =
  "flex size-5 items-center justify-center text-q-idle transition-colors hover:text-q-fg disabled:text-white/25 disabled:hover:text-white/25 focus-visible:outline-none focus-visible:text-q-fg";

/** How many images one press of Generate produces. Reads `1/4`, not `1 of 4`. */
export function BatchStepper({ value, max, onChange }: BatchStepperProps) {
  return (
    <div className={cn(PILL_CLASS, "gap-1")}>
      <button
        type="button"
        aria-label="Decrement"
        disabled={value <= 1}
        onClick={() => {
          onChange(Math.max(1, value - 1));
        }}
        className={STEP_CLASS}
      >
        <Icon name="minus" size={16} />
      </button>

      <span className="min-w-8 text-center tabular-nums">
        <span className="text-q-fg">{value}</span>
        <span className="text-q-idle">/{max}</span>
      </span>

      <button
        type="button"
        aria-label="Increment"
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
