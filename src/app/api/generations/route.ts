import { imageGenerationSchema } from "@/schemas/image-generation";
import { videoGenerationRequestSchema } from "@/schemas/video-generation";
import { createJobs, createVideoJobs } from "@/server/generation-jobs.server";

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

  /*
   * `kind` discriminates the two surfaces. Image requests predate it and send
   * the form values bare, so a missing `kind` means image — that keeps the
   * image client working untouched rather than forcing a lockstep change to
   * something already shipped.
   */
  const kind =
    typeof body === "object" && body !== null && "kind" in body
      ? body.kind
      : "image";

  if (kind === "video") {
    const parsed = videoGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid generation request", issues: parsed.error.issues },
        { status: 422 },
      );
    }
    return Response.json(
      { jobs: createVideoJobs(parsed.data) },
      { status: 202 },
    );
  }

  const parsed = imageGenerationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid generation request", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  return Response.json({ jobs: createJobs(parsed.data) }, { status: 202 });
}
