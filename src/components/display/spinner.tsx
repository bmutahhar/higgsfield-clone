import { cn } from "@/lib/cn";

export interface SpinnerProps {
  /** Pixel box. */
  size?: number;
  className?: string;
}

/** Loaders run linear — the one place the system uses a continuous animation. */
export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-w-12 border-t-lime",
        "[animation-duration:0.7s] [animation-timing-function:linear]",
        "motion-reduce:animate-none",
        className,
      )}
      // Numeric size prop — cannot be a class.
      style={{ width: size, height: size }}
    />
  );
}
