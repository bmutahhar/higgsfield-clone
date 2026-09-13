import { cn } from "@/lib/cn";

export interface WordmarkProps {
  className?: string;
}

/*
 * Plain display type, not a logo file. Per the design system's no-
 * reconstruction rule no mark was drawn; drop the official SVG in and replace
 * this component when it is available.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-display text-h4 font-bold tracking-[-0.02em] text-primary",
        className,
      )}
    >
      Higgsfield
    </span>
  );
}
