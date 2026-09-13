"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import type { SelectOption } from "@/components/forms/select";
import { cn } from "@/lib/cn";

export interface RadioGroupProps {
  options?: SelectOption[];
  value?: string;
  onChange?: (next: string) => void;
  label?: ReactNode;
  direction?: "row" | "column";
  className?: string;
  name?: string;
}

/*
 * Real radio inputs, so grouping and arrow-key roving come from the platform.
 * Client-only for useId's stable group name; the visual state is all CSS.
 */
export function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  direction = "column",
  className,
  name,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div
      role="radiogroup"
      aria-label={typeof label === "string" ? label : undefined}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {label && (
        <span className="text-body-sm font-medium text-secondary">{label}</span>
      )}
      <div
        className={cn(
          "flex",
          direction === "row" ? "flex-row gap-5" : "flex-col gap-2.5",
        )}
      >
        {options.map((option) => {
          const opt =
            typeof option === "string"
              ? { value: option, label: option }
              : option;
          return (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                className="hf-sr-only peer"
                name={groupName}
                value={opt.value}
                checked={opt.value === value}
                onChange={() => onChange?.(opt.value)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full",
                  "border border-input-border transition-colors duration-[140ms] ease-snap",
                  "peer-checked:border-accent motion-reduce:duration-0",
                  "peer-focus-visible:shadow-ring",
                  "[&>span]:scale-0 peer-checked:[&>span]:scale-100",
                )}
              >
                <span className="size-[9px] rounded-full bg-accent transition-transform duration-[140ms] ease-snap motion-reduce:duration-0" />
              </span>
              <span
                className={cn(
                  "text-body-sm",
                  opt.value === value ? "text-primary" : "text-secondary",
                )}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
