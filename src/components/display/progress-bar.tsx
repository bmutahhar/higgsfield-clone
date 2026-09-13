import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  /** 0-100. Ignored when indeterminate. */
  value?: number;
  label?: ReactNode;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  value = 0,
  label,
  indeterminate = false,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="flex justify-between text-caption text-muted">
          <span>{label}</span>
          {!indeterminate && (
            <span className="font-mono text-mono">{Math.round(value)}%</span>
          )}
        </span>
      )}
      <span
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative block h-1 overflow-hidden rounded-full bg-n-5"
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-accent",
            indeterminate
              ? "w-2/5 animate-indeterminate motion-reduce:animate-none"
              : "transition-[width] duration-[220ms] ease-snap motion-reduce:duration-0",
          )}
          // Fill width tracks the value — genuinely dynamic.
          style={indeterminate ? undefined : { width: `${String(value)}%` }}
        />
      </span>
    </div>
  );
}
