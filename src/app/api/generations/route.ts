import { imageGenerationSchema } from "@/schemas/image-generation";
import { createJobs } from "@/server/generation-jobs.server";

/*
 * Accepts a batch and returns its job ids immediately — the images are not
 * ready yet, which is what 202 says. The client polls each id from here.
 *
 * The body is checked against the same schema the composer validates against.
 * That is the whole reason the schema lives in `schemas/` rather than beside
 * the form: a client-side check is a courtesy, and this is the one that counts.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = imageGenerationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid generation request", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  return Response.json({ jobs: createJobs(parsed.data) }, { status: 202 });
}
