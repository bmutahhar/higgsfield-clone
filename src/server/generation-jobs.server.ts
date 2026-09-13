import "server-only";

import { ASPECT_RATIOS } from "@/config/image-studio";
import { PRESETS } from "@/config/media";
import { HIGGSFIELD_PRESETS } from "@/config/presets";
import type { ImageGenerationValues } from "@/schemas/image-generation";
import type { VideoEditRequest } from "@/schemas/video-edit";
import type { VideoGenerationRequest } from "@/schemas/video-generation";
import type { VideoMotionRequest } from "@/schemas/video-motion";
import type { GenerationJob, GenerationStatus } from "@/types/generation.types";

/*
 * A stand-in for the generation queue.
 *
 * It remembers nothing. Everything polling needs to answer — when the image is
 * due, and which asset it will be — is encoded into the job id itself, so
 * reading a job is a parse and a clock comparison rather than a lookup.
 *
 * That is worth the slightly odd id format. The obvious version keeps a Map of
 * issued jobs, which then has to survive HMR, which means hanging it off
 * globalThis — and even then a real server restart strands every job already
 * in flight and those tiles spin forever. A stateless mock has none of those
 * failure modes, and it is honest that there is no queue here to remember.
 *
 * The trade is that an id is forgeable: anyone can mint one with a deadline in
 * the past and be handed a sample image. With no private data and no cost per
 * call, that is not worth a signature.
 *
 * Each image in a batch gets its own deadline, staggered, because that is how
 * a real queue behaves: four images do not land on the same tick, and the feed
 * should not pretend they do.
 */

/*
 * Base latency plus a per-image stagger.
 *
 * The stagger has to stay wider than the client's poll interval or the point
 * of it is lost: every job in a batch is enqueued on the same tick, so their
 * polls run in lockstep, and any two deadlines falling inside one interval are
 * noticed together and land as a clump. At 350ms against a 300ms poll a batch
 * of four arrives one at a time and still finishes inside ~3–4s.
 *
 * Jitter stays well under the stagger so it varies the timing without
 * reordering the batch.
 */
const BASE_MS = 2600;
const STAGGER_MS = 350;
const JITTER_MS = 120;

/*
 * How long before an image is due that it stops being "processing" and starts
 * "generating". Derived from the same deadline as everything else, so the
 * phase costs no extra state and each image in a staggered batch changes over
 * at its own moment rather than all at once.
 */
const GENERATING_MS = 1600;

/*
 * `<kind><readyAt>.<assetIndex>.<nonce>`, all base36 after the leading letter.
 * The nonce keeps ids unique; the letter says which pool the asset comes from,
 * which is what lets one stateless reader serve both surfaces.
 */
type JobKind = "image" | "video";
const KIND_TAG: Record<JobKind, string> = { image: "g", video: "v" };
const ID_PATTERN = /^([gv])([0-9a-z]+)\.([0-9a-z]+)\.[0-9a-z]+$/;

function encodeId(kind: JobKind, readyAt: number, assetIndex: number): string {
  const nonce = Math.random().toString(36).slice(2, 10);
  return `${KIND_TAG[kind]}${readyAt.toString(36)}.${assetIndex.toString(36)}.${nonce}`;
}

function decodeId(
  id: string,
): { kind: JobKind; readyAt: number; assetIndex: number } | null {
  const match = ID_PATTERN.exec(id);
  if (!match) return null;

  const readyAt = Number.parseInt(match[2], 36);
  const assetIndex = Number.parseInt(match[3], 36);
  if (!Number.isFinite(readyAt) || !Number.isFinite(assetIndex)) return null;

  return {
    kind: match[1] === "v" ? "video" : "image",
    readyAt,
    assetIndex,
  };
}

/** `Auto` has no ratio of its own, so it renders in the feed's usual portrait. */
function frame(ratioId: string): { w: number; h: number } {
  const ratio = ASPECT_RATIOS.find((candidate) => candidate.id === ratioId);
  return ratio?.w !== undefined && ratio.h !== undefined
    ? { w: ratio.w, h: ratio.h }
    : { w: 3, h: 4 };
}

export function createJobs(values: ImageGenerationValues): GenerationJob[] {
  const now = Date.now();
  const { w, h } = frame(values.aspectRatio);

  return Array.from({ length: values.batch }, (_, index) => ({
    id: encodeId(
      "image",
      now +
        BASE_MS +
        index * STAGGER_MS +
        Math.round(Math.random() * JITTER_MS),
      // Random rather than a rotating counter: a counter would be the one
      // piece of state this module otherwise avoids, and variety is all it
      // buys.
      Math.floor(Math.random() * PRESETS.length),
    ),
    w,
    h,
    prompt: values.prompt,
  }));
}

/*
 * Video takes materially longer than an image, and pretending otherwise would
 * make the phase labels meaningless — `generating` would flash past. One clip
 * per request, so there is no stagger to apply.
 */
const VIDEO_BASE_MS = 7000;
const VIDEO_JITTER_MS = 1200;
/** Longer than the image window, in proportion to the longer total. */
const VIDEO_GENERATING_MS = 4500;

/** Genjutsu renders 16:9; the frame does not depend on the request. */
const VIDEO_FRAME = { w: 16, h: 9 };

/*
 * One clip per request on every video surface, so there is no stagger to apply:
 * the deadline is a base plus jitter and nothing else. The base differs by
 * surface because the work does — an edit re-renders an existing clip, while
 * motion transfer solves a pose track before it renders anything.
 */
function createClipJob(prompt: string, baseMs = VIDEO_BASE_MS): GenerationJob {
  return {
    id: encodeId(
      "video",
      Date.now() + baseMs + Math.round(Math.random() * VIDEO_JITTER_MS),
      Math.floor(Math.random() * HIGGSFIELD_PRESETS.length),
    ),
    ...VIDEO_FRAME,
    prompt,
  };
}

export function createVideoJobs(
  values: VideoGenerationRequest,
): GenerationJob[] {
  return [createClipJob(values.prompt)];
}

export function createEditJobs(values: VideoEditRequest): GenerationJob[] {
  return [createClipJob(values.prompt, 5200)];
}

export function createMotionJobs(values: VideoMotionRequest): GenerationJob[] {
  return [
    createClipJob(
      values.sceneControl
        ? `Motion transfer, scene from ${values.sceneSource ?? "image"}`
        : "Motion transfer",
      9000,
    ),
  ];
}

/** `null` for anything that is not a job id this service could have issued. */
export function readJob(id: string): GenerationStatus | null {
  const decoded = decodeId(id);
  if (!decoded) return null;

  const video = decoded.kind === "video";
  const remaining = decoded.readyAt - Date.now();
  if (remaining > (video ? VIDEO_GENERATING_MS : GENERATING_MS)) {
    return { id, status: "processing" };
  }
  if (remaining > 0) return { id, status: "generating" };

  if (video) {
    const preset =
      HIGGSFIELD_PRESETS[decoded.assetIndex % HIGGSFIELD_PRESETS.length];
    return {
      id,
      status: "ready",
      asset: { url: preset.video ?? preset.poster, poster: preset.poster },
    };
  }

  return {
    id,
    status: "ready",
    asset: { url: PRESETS[decoded.assetIndex % PRESETS.length].poster },
  };
}
