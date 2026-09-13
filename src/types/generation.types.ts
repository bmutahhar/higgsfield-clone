import type { ImageGenerationValues } from "@/schemas/image-generation";
import type { VideoGenerationValues } from "@/schemas/video-generation";

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
  /**
   * A still to hold the frame until the clip decodes. Video only — an image
   * asset is its own poster.
   */
  poster?: string;
}

/**
 * How far along a job is.
 *
 * `processing` and `generating` are both "not done yet" — they exist because
 * the surface says so out loud, and because the switch between them is the
 * only progress signal there is when the work itself is opaque.
 */
export type GenerationPhase = "processing" | "generating" | "ready";

/** What polling a job returns. Discriminated so `asset` is only there when it is. */
export type GenerationStatus =
  | { id: string; status: "processing" }
  | { id: string; status: "generating" }
  | { id: string; status: "ready"; asset: GenerationAsset };

/** The surfaces that produce generations. Video and audio are not built yet. */
export type GenerationKind = "image" | "video" | "audio";

/**
 * One generation, from the moment it is accepted to long after it lands.
 *
 * A single record covers every phase rather than a pending type and a finished
 * type: the id, the frame and the prompt are known up front and never change,
 * and only `src` arrives late. That is what lets the feed hold a tile's place
 * and swap the picture in without moving anything around it.
 *
 * Split on `status` so that "ready implies an asset" is a fact the compiler
 * knows. Without it every read of `src` needs a guard for a state that cannot
 * happen.
 */
interface GenerationBase {
  id: string;
  kind: GenerationKind;
  /** Which model produced it — the catalogue id, not the display name. */
  modelId: string;
  prompt: string;
  w: number;
  h: number;
  createdAt: number;
}

export type Generation =
  | (GenerationBase & {
      status: Exclude<GenerationPhase, "ready">;
      src?: undefined;
    })
  | (GenerationBase & { status: "ready"; src: string; poster?: string });

/**
 * A generation the user asked for before they were allowed to start it.
 *
 * A union rather than one shape with a loose payload: narrowing on `kind` is
 * what keeps each surface's values typed by its own schema at the one place it
 * matters — the call that finally runs them. Audio joins here when it exists.
 */
export type PendingRequest =
  | { kind: "image"; values: ImageGenerationValues }
  | { kind: "video"; values: VideoGenerationValues };
