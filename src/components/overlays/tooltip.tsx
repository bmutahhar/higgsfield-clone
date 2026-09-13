import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const SIDE: Record<TooltipSide, string> = {
  top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  left: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2",
  right: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
};

export interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}

/*
 * No state at all: the bubble reveals on group-hover and group-focus-within,
 * so it also appears for keyboard users, which the design system's
 * mouse-only version did not.
 */
export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-70 rounded-lg border border-hairline bg-n-5 px-2 py-[5px]",
          "text-caption whitespace-nowrap text-primary opacity-0 shadow-e2",
          "transition-opacity duration-[140ms] ease-snap motion-reduce:duration-0",
          "group-focus-within:opacity-100 group-hover:opacity-100",
          SIDE[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
