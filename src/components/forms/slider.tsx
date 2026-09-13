import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "className"
> {
  label?: ReactNode;
  value?: number;
  min?: number;
  max?: number;
  /** Suffix on the mono readout, e.g. "s" or "%". */
  unit?: string;
  className?: string;
}

/*
 * The filled portion of the track is a gradient stop that depends on the
 * current value, so it is the one genuinely dynamic style here and rides a CSS
 * custom property rather than a class.
 */
export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  unit,
  className,
  ...rest
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label ?? unit !== undefined) && (
        <div className="flex items-baseline justify-between">
          <span className="text-body-sm font-medium text-secondary">
            {label}
          </span>
          <span className="font-mono text-mono text-primary">
            {value}
            {unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={typeof label === "string" ? label : undefined}
        className="hf-slider h-1 w-full cursor-pointer rounded-full outline-none"
        style={{ "--hf-slider-pct": `${String(pct)}%` } as React.CSSProperties}
        {...rest}
      />
    </div>
  );
}
