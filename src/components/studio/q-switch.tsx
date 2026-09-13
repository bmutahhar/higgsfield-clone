"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export interface QSwitchProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  /**
   * `sm` is the prompt toggle (28×16); `md` is the settings toggle Motion
   * Control uses (36×24). Two sizes is a scale; a third would be a smell.
   */
  size?: "sm" | "md";
}

/**
 * A switch that is a real checkbox.
 *
 * The visible track is a `<label>`, so clicking it toggles natively and the
 * control is tabbable, announced and operable with Space without a single
 * handler. The thumb is a child of the track, which is why its variant is
 * addressed through the track — `peer-checked:` alone only reaches siblings.
 */
export function QSwitch({
  checked,
  onCheckedChange,
  label,
  size = "sm",
}: QSwitchProps) {
  const id = useId();
  const md = size === "md";

  return (
    <>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        aria-label={label}
        className="peer hf-sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "relative shrink-0 cursor-pointer rounded-q-full bg-q-switch-off transition-colors duration-150 peer-checked:bg-q-accent peer-focus-visible:ring-2 peer-focus-visible:ring-q-focus motion-reduce:transition-none",
          md ? "h-6 w-9" : "h-4 w-7",
        )}
      >
        <span
          className={cn(
            "absolute rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-150 motion-reduce:transition-none",
            md
              ? "top-1 left-1 size-4 peer-checked:translate-x-3"
              : "top-0.5 left-0.5 size-3 peer-checked:translate-x-3",
          )}
        />
      </label>
    </>
  );
}
