import "server-only";

import { ASPECT_RATIOS } from "@/config/image-studio";
import { PRESETS } from "@/config/media";
import type { ImageGenerationValues } from "@/schemas/image-generation";
import type { GenerationJob, GenerationStatus } from "@/types/generation.types";

/*
 * A stand-in for the generation queue.
 *
 * Accepting a request records a deadline per image and nothing else; polling
 * compares that deadline to the clock. There is no worker and no work — but
 * the shape is the real one, so swapping in a service means replacing the two
 * functions below and nothing above them.
 *
 * Each image in a batch gets its own deadline, staggered, because that is how
 * a real queue behaves: four images do not land on the same tick, and the feed
 * should not pretend they do.
 */

interface StoredJob {
  readyAt: number;
  url: string;
}

/*
 * Held on globalThis so the store survives the module re-evaluation that HMR
 * does on every edit. A plain module-level Map would empty mid-generation and
 * strand every job that was already in flight.
 */
declare global {
  var __hfGenerationJobs: Map<string, StoredJob> | undefined;
}

const jobs = (globalThis.__hfGenerationJobs ??= new Map<string, StoredJob>());

/*
 * Base latency plus a per-image stagger. Sized so a full batch of four still
 * lands inside ~3–4s once the client's poll granularity is added on top: the
 * last image is due at 3.5–3.8s and is noticed within one poll of that.
 */
const BASE_MS = 2600;
const STAGGER_MS = 300;
const JITTER_MS = 300;

let cursor = 0;

/** Rotates the sample set so a second batch does not repeat the first. */
function nextPoster(): string {
  const poster = PRESETS[cursor % PRESETS.length].poster;
  cursor += 1;
  return poster;
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

  return Array.from({ length: values.batch }, (_, index) => {
    const id = crypto.randomUUID();
    jobs.set(id, {
      readyAt:
        now +
        BASE_MS +
        index * STAGGER_MS +
        Math.round(Math.random() * JITTER_MS),
      url: nextPoster(),
    });
    return { id, w, h, prompt: values.prompt };
  });
}

/** `null` for an id this process has never issued. */
export function readJob(id: string): GenerationStatus | null {
  const job = jobs.get(id);
  if (!job) return null;
  if (Date.now() < job.readyAt) return { id, status: "pending" };
  return { id, status: "ready", asset: { url: job.url } };
}
