import { Spinner } from "@/components/display/spinner";

export interface PendingTileProps {
  w: number;
  h: number;
}

/**
 * A frame reserved for an image that is still being generated.
 *
 * It occupies the exact space the finished image will, so nothing below it
 * moves when the picture arrives — which is the whole reason the job carries
 * its ratio from the moment it is accepted.
 *
 * Deliberately plain for now; this is the surface the next pass refines.
 */
export function PendingTile({ w, h }: PendingTileProps) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden bg-q-pill"
      // Ratio comes from the job, so it cannot be a utility class.
      style={{ aspectRatio: `${String(w)} / ${String(h)}` }}
    >
      <span className="absolute inset-0 animate-pulse bg-q-w-04 motion-reduce:animate-none" />
      <Spinner size={24} className="relative" />
    </div>
  );
}
