import {
  toMotionRequest,
  type VideoMotionValues,
} from "@/schemas/video-motion";
import type { GenerationJob } from "@/types/generation.types";

/* The browser's half of the motion-control flow. See `video-edit.ts`. */

const ENDPOINT = "/api/generations";

export async function requestVideoMotion(
  values: VideoMotionValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(toMotionRequest(values)),
  });

  if (!response.ok) {
    throw new Error(
      `Could not start the generation (${String(response.status)})`,
    );
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}
