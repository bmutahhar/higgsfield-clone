import { cn } from "@/lib/cn";

/**
 * The frosted disc used in the drop zones. Three stacked layers: an opaque
 * base, a luminosity-blended rim that picks up whatever sits behind it, and the
 * glyph. The long shadow ladder is what gives it the sense of floating a few
 * millimetres off the panel.
 */
export function GlassBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-q-card" />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[rgba(197,197,197,0.30)] bg-white/4 mix-blend-luminosity shadow-q-badge backdrop-blur-xs"
      />
      <span className="relative flex size-4 items-center justify-center text-white">
        {children}
      </span>
    </span>
  );
}
