import { cn } from "@/lib/cn";

export interface ModelBadgeProps {
  label: "New" | "Premium";
  className?: string;
}

/**
 * The skewed lime chip beside a model name.
 *
 * `New` and `Premium` are the same object — the live picker gives them
 * identical treatment and only the word changes, so this takes a label rather
 * than a variant.
 */
export function ModelBadge({ label, className }: ModelBadgeProps) {
  return (
    <span
      className={cn(
        "flex h-4 max-h-4 -skew-x-12 items-center justify-center rounded-[3px] px-1",
        "font-q-display text-[10px] leading-4 font-bold uppercase",
        "bg-q-accent text-q-inverse",
        className,
      )}
    >
      {label}
    </span>
  );
}
