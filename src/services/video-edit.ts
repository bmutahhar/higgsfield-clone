import { toEditRequest, type VideoEditValues } from "@/schemas/video-edit";
import type { GenerationJob } from "@/types/generation.types";

/*
 * The browser's half of the edit flow. Polling is not duplicated here — a job's
 * status reads the same way whatever produced it, so callers import
 * `fetchGeneration` from the image service.
 */

const ENDPOINT = "/api/generations";

export async function requestVideoEdit(
  values: VideoEditValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(toEditRequest(values)),
  });

  if (!response.ok) {
    throw new Error(`Could not start the edit (${String(response.status)})`);
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}
