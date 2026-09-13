import type { FeedItem } from "@/config/image-studio";

/**
 * A job accepted by the generation service. The frame is known the moment the
 * request is accepted — it comes from the chosen aspect ratio — which is what
 * lets the feed reserve the right space before the image exists.
 */
export interface GenerationJob {
  id: string;
  w: number;
  h: number;
  prompt: string;
}

export interface GenerationAsset {
  url: string;
}

/** What polling a job returns. Discriminated so `asset` is only there when it is. */
export type GenerationStatus =
  | { id: string; status: "pending" }
  | { id: string; status: "ready"; asset: GenerationAsset };

/**
 * One masonry cell: a finished image, or a frame still being generated.
 * Both carry a ratio, so the layout does not shift when one becomes the other.
 */
export interface FeedCell {
  id: string;
  w: number;
  h: number;
  /** Null while the generation is still running. */
  item: FeedItem | null;
}
