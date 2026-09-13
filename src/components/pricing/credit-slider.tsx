"use client";

import type { CSSProperties } from "react";

import { Icon } from "@/components/core/icon";
import { formatCredits } from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * The credit-tier slider on a plan card.
 *
 * The live site paints this with bare <div>s and drives them from pointer
 * events — no role, no tabindex, no aria-value*, so it is unreachable by
 * keyboard and silent to a screen reader. We keep the pixels and put a real
 * <input type="range"> under them, stretched over the track at opacity 0. The
 * live configurator's own sliders already do exactly this, so it is the same
 * design system talking to itself, not an invention.
 *
 * Stops are evenly spaced regardless of their credit values: two stops sit at
 * 0% and 100%, three at 0/50/100. The slider indexes into the tier list, it
 * does not interpolate credits.
 */
interface CreditSliderProps {
  stops: number[];
  value: number;
  onChange: (index: number) => void;
  /** Names the control for assistive tech, e.g. "Pro credits per month". */
  label: string;
  className?: string;
}

export function CreditSlider({
  stops,
  value,
  onChange,
  label,
  className,
}: CreditSliderProps) {
  const last = stops.length - 1;
  const percent = last === 0 ? 0 : (value / last) * 100;

  return (
    <div className={cn("flex flex-col gap-2 pt-1", className)}>
      <div
        className="relative mx-2.5 flex h-4 touch-none items-center"
        /*
         * Inline style: the fill width and thumb offset are a continuous
         * percentage of the track, which no utility can express. Passed as a
         * custom property so the two consumers below stay in classes.
         */
        style={{ "--fill": `${percent}%` } as CSSProperties}
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-q-w-20" />
        <div className="absolute left-0 h-1 w-[var(--fill)] rounded-full bg-white transition-[width] duration-150 motion-reduce:transition-none" />
        <div
          className={cn(
            "absolute left-[var(--fill)] grid size-5 -translate-x-1/2 place-items-center",
            "rounded-full bg-white shadow-md",
            "transition-[left] duration-150 motion-reduce:transition-none",
          )}
        >
          <Icon
            name="chevrons-left-right"
            size={16}
            className="text-q-inverse"
          />
        </div>

        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={value}
          aria-label={label}
          aria-valuetext={`${formatCredits(stops[value])} credits per month`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-x-0 top-0 m-0 h-4 w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="flex justify-between px-2.5">
        {stops.map((credits, index) => (
          <button
            key={credits}
            type="button"
            aria-pressed={index === value}
            onClick={() => onChange(index)}
            className={cn(
              "flex items-center gap-1 text-q-caption-l font-medium",
              "transition-colors duration-150 motion-reduce:transition-none",
              "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
              index === value ? "text-white" : "text-q-idle-soft",
            )}
          >
            <Icon name="sparkles" size={14} />
            {formatCredits(credits)}
          </button>
        ))}
      </div>
    </div>
  );
}
