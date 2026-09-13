import { cn } from "@/lib/cn";

export interface RatioGlyphProps {
  w: number;
  h: number;
  className?: string;
}

/*
 * The aspect-ratio menu draws its own icons: each option shows a rectangle in
 * that option's proportions, all fitted inside the same 20px box. A 1:1 reads
 * as a square, 9:16 as a tall sliver. An icon font cannot express that, so it
 * is a rect scaled to fit and centred.
 */
const BOX = 20;
const MAX = 15;

export function RatioGlyph({ w, h, className }: RatioGlyphProps) {
  const scale = MAX / Math.max(w, h);
  const rw = Math.max(4, w * scale);
  const rh = Math.max(4, h * scale);

  return (
    <svg
      viewBox={`0 0 ${String(BOX)} ${String(BOX)}`}
      width={BOX}
      height={BOX}
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x={(BOX - rw) / 2}
        y={(BOX - rh) / 2}
        width={rw}
        height={rh}
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
