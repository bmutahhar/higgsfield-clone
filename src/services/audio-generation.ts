import {
  type AudioGenerationValues,
  toAudioRequest,
} from "@/schemas/audio-generation";
import type { GenerationJob } from "@/types/generation.types";

/*
 * The browser's half of the audio flow. Polling is not duplicated here — a
 * job's status reads the same way whatever produced it, so callers import
 * `fetchGeneration` from the image service.
 *
 * One function covers all three tabs: the request is a union discriminated on
 * `mode`, and `toAudioRequest` picks the arm. A function per tab would have
 * been three copies of the same fetch.
 */

const ENDPOINT = "/api/generations";

export async function requestAudioGeneration(
  values: AudioGenerationValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    // Files cannot be JSON; the request carries their metadata instead.
    body: JSON.stringify(toAudioRequest(values)),
  });

  if (!response.ok) {
    throw new Error(
      `Could not start the generation (${String(response.status)})`,
    );
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}
