import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "size"
> {
  label?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/*
 * A real checkbox drives the visual through `peer-checked:` — no React state,
 * so focus, keyboard toggling, announcement and form submission all come from
 * the platform. The design system styled a bare <span> with onClick, which is
 * unreachable by keyboard and carries no form semantics.
 */
export function Switch({
  label,
  size = "md",
  disabled,
  className,
  ...rest
}: SwitchProps) {
  const track = size === "sm" ? "h-5 w-[34px]" : "h-[26px] w-11";
  const knob = size === "sm" ? "size-3.5" : "size-5";
  // The knob is a descendant of the peer's sibling, not a sibling itself, so
  // the variant has to be written on the track and reach in with [&>span].
  const travel =
    size === "sm"
      ? "peer-checked:[&>span]:translate-x-[14px]"
      : "peer-checked:[&>span]:translate-x-[18px]";

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
        role="switch"
        disabled={disabled}
        className="hf-sr-only peer"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border border-hairline bg-n-5 p-0.5",
          "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
          "peer-checked:border-transparent peer-checked:bg-accent",
          "peer-focus-visible:shadow-ring",
          "peer-checked:[&>span]:bg-n-0",
          track,
          travel,
        )}
      >
        <span
          className={cn(
            "rounded-full bg-n-11 transition-transform duration-[140ms] ease-snap",
            "motion-reduce:duration-0",
            knob,
          )}
        />
      </span>
      {label && <span className="text-body-sm text-secondary">{label}</span>}
    </label>
  );
}
