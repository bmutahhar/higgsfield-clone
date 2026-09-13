import type { InputHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export type ControlSize = "sm" | "md" | "lg";

export const CONTROL_HEIGHT: Record<ControlSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
};

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "className"
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  iconLeft?: IconName;
  /** Trailing readout — rendered in mono, as every number in the system is. */
  suffix?: ReactNode;
  size?: ControlSize;
  className?: string;
  inputClassName?: string;
}

/*
 * Focus switches the border to solid lime and adds the lime ring. Both are
 * driven by `focus-within` on the shell rather than a React focus flag.
 */
export function Input({
  label,
  hint,
  error,
  iconLeft,
  suffix,
  size = "md",
  className,
  inputClassName,
  ...rest
}: InputProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-body-sm font-medium text-secondary">{label}</span>
      )}
      <span
        className={cn(
          "flex items-center gap-2 rounded-control border bg-input px-3",
          "transition-[border-color,box-shadow] duration-[140ms] ease-snap",
          "motion-reduce:duration-0",
          CONTROL_HEIGHT[size],
          error
            ? "border-danger"
            : // Border only, as on Textarea: text entry gets no focus ring.
              "border-input-border focus-within:border-lime",
        )}
      >
        {iconLeft && <Icon name={iconLeft} size={16} className="text-muted" />}
        <input
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent text-body text-primary",
            "outline-none placeholder:text-muted",
            inputClassName,
          )}
          {...rest}
        />
        {suffix && (
          <span className="font-mono text-mono text-muted">{suffix}</span>
        )}
      </span>
      {(hint ?? error) && (
        <span
          className={cn("text-caption", error ? "text-danger" : "text-muted")}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
