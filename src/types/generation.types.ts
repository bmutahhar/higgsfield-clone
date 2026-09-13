import type {
  AudioGenerationValues,
  AudioSettings,
} from "@/schemas/audio-generation";
import type {
  ImageGenerationValues,
  ImageSettings,
} from "@/schemas/image-generation";
import type { VideoEditValues } from "@/schemas/video-edit";
import type {
  VideoGenerationValues,
  VideoSettings,
} from "@/schemas/video-generation";
import type { VideoMotionValues } from "@/schemas/video-motion";

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
  /**
   * Seconds. Audio only — a waveform row has no aspect ratio to size itself
   * from, so this does the job `w`/`h` do for a picture, and it also sets how
   * many bars are drawn so length reads true.
   */
  duration?: number;
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

/**
 * The medium a generation is, which is not the same axis as the surface that
 * made it — `GenerationSettings` below discriminates on the surface.
 *
 * Voice Change and Translate are audio surfaces that hand back a video; they
 * are `audio` here, because that is the studio whose history they belong in.
 */
export type GenerationKind = "image" | "video" | "audio";

/**
 * The recipe behind a generation — every control the surface offered, minus
 * the prompt, which the record carries in its own right.
 *
 * Discriminated on its own `kind` rather than leaning on the record's: that
 * way narrowing to one surface's settings is a single check the compiler
 * understands, without having to prove that two independent fields agree.
 *
 */
export type GenerationSettings =
  | { kind: "image"; values: ImageSettings }
  | { kind: "video"; values: VideoSettings }
  | { kind: "video-edit"; values: Omit<VideoEditValues, "prompt"> }
  | { kind: "video-motion"; values: Omit<VideoMotionValues, "prompt"> }
  /*
   * One arm for all three audio modes rather than three. The values are
   * already a union discriminated on `mode`, so a reader narrows once here and
   * again on the mode — and the History pane picks its renderer off that mode.
   */
  | { kind: "audio"; values: AudioSettings };

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
  /**
   * What produced it, so "make this again" has something to read.
   *
   * Required rather than optional: a generation is born either from a
   * submitted form or from a fixture, and both know their own recipe. Leaving
   * it optional would put a guard for an impossible state at every call site
   * that recreates one.
   *
   * Note that a video recipe holds the actual `File` objects that were
   * attached. That is only sound because this store is never persisted — it
   * keeps those blobs alive for the session, and nothing tries to serialise
   * them.
   */
  settings: GenerationSettings;
  /** Local only, and deliberately not persisted anywhere. */
  liked?: boolean;
}

export type Generation =
  | (GenerationBase & {
      status: Exclude<GenerationPhase, "ready">;
      src?: undefined;
    })
  | (GenerationBase & {
      status: "ready";
      src: string;
      poster?: string;
      /** Seconds. Audio only — see `GenerationAsset.duration`. */
      duration?: number;
    });

/**
 * A generation whose asset has landed.
 *
 * Named so a tile that can only render a finished one says so in its props,
 * rather than taking the whole union and guarding a state its parent has
 * already ruled out.
 */
export type ReadyGeneration = Extract<Generation, { status: "ready" }>;

/**
 * One surface's full composer values, tagged with the surface they came from.
 *
 * A union rather than one shape with a loose payload: narrowing on `kind` is
 * what keeps each surface's values typed by its own schema at the one place it
 * matters — the call that finally runs them.
 *
 * Three things want precisely this shape, which is why it is one type and not
 * three: the request handed to `enqueue`, a request parked while someone signs
 * in, and a draft waiting to be loaded back into a composer.
 */
export type GenerationRequest =
  | { kind: "image"; values: ImageGenerationValues }
  | { kind: "video"; values: VideoGenerationValues }
  | { kind: "video-edit"; values: VideoEditValues }
  | { kind: "video-motion"; values: VideoMotionValues }
  | { kind: "audio"; values: AudioGenerationValues };

/**
 * Values handed to a composer to load — what Recreate and Reuse send.
 *
 * Partial on purpose, and it is the difference between the two: Recreate sends
 * the prompt along with the recipe, Reuse sends the recipe alone and leaves
 * whatever is already in the box. A composer merges the draft over its own
 * current values, so an absent field reads as "leave this one".
 */
export type ComposerDraft =
  | { kind: "image"; values: Partial<ImageGenerationValues> }
  | { kind: "video"; values: Partial<VideoGenerationValues> }
  | { kind: "video-edit"; values: Partial<VideoEditValues> }
  | { kind: "video-motion"; values: Partial<VideoMotionValues> }
  | { kind: "audio"; values: Partial<AudioGenerationValues> };
