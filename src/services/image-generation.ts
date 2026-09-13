import type { ImageGenerationValues } from "@/schemas/image-generation";
import type { GenerationJob, GenerationStatus } from "@/types/generation.types";

/*
 * The browser's half of the generation flow. Everything that touches the
 * network for this feature lives here; the components above know only these
 * two functions and the types they return.
 */

const ENDPOINT = "/api/generations";

export async function requestGeneration(
  values: ImageGenerationValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(
      `Could not start the generation (${String(response.status)})`,
    );
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}

export async function fetchGeneration(id: string): Promise<GenerationStatus> {
  const response = await fetch(`${ENDPOINT}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not read generation ${id} (${String(response.status)})`,
    );
  }

  return (await response.json()) as GenerationStatus;
}
