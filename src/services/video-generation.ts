import {
  toVideoRequest,
  type VideoGenerationValues,
} from "@/schemas/video-generation";
import type { GenerationJob } from "@/types/generation.types";

/*
 * The browser's half of the video generation flow. Mirrors
 * `image-generation.ts`; the components above know only this function and the
 * types it returns.
 *
 * Polling is not duplicated here — a job's status is read the same way
 * whatever produced it, so `fetchGeneration` is imported from the image
 * service rather than reimplemented. If that endpoint ever diverges per kind,
 * this is the seam to split.
 */

const ENDPOINT = "/api/generations";

export async function requestVideoGeneration(
  values: VideoGenerationValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    // Files cannot be JSON; the request carries their metadata instead.
    body: JSON.stringify(toVideoRequest(values)),
  });

  if (!response.ok) {
    throw new Error(
      `Could not start the generation (${String(response.status)})`,
    );
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}
