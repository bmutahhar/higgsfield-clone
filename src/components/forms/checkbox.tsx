import type { InputHTMLAttributes, ReactNode } from "react";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> {
  label?: ReactNode;
  className?: string;
}

/* Real checkbox behind the styled box — see the note in switch.tsx. */
export function Checkbox({
  label,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        disabled={disabled}
        className="hf-sr-only peer"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[6px]",
          "border border-input-border bg-transparent text-n-0",
          "transition-[background-color,border-color] duration-[140ms] ease-snap",
          "motion-reduce:duration-0",
          "peer-checked:border-transparent peer-checked:bg-accent",
          "peer-focus-visible:shadow-ring",
          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <Icon name="check" size={13} strokeWidth={3} />
      </span>
      {label && <span className="text-body-sm text-secondary">{label}</span>}
    </label>
  );
}
