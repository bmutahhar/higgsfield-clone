import { audioGenerationRequestSchema } from "@/schemas/audio-generation";
import { imageGenerationSchema } from "@/schemas/image-generation";
import { videoEditRequestSchema } from "@/schemas/video-edit";
import { videoGenerationRequestSchema } from "@/schemas/video-generation";
import { videoMotionRequestSchema } from "@/schemas/video-motion";
import {
  createAudioJobs,
  createEditJobs,
  createJobs,
  createMotionJobs,
  createVideoJobs,
} from "@/server/generation-jobs.server";

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

  if (kind === "audio") {
    /*
     * One schema for all three audio tabs, discriminated on `mode` — so
     * unlike video there is no `surface` field to read: the mode already says
     * which arm to check against, and the union does the branching.
     */
    const parsed = audioGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid generation request", issues: parsed.error.issues },
        { status: 422 },
      );
    }
    return Response.json(
      { jobs: createAudioJobs(parsed.data) },
      { status: 202 },
    );
  }

  if (kind === "video") {
    /*
     * All three video surfaces produce a video, so they share a kind and the
     * history that reads it. `surface` says which form sent the request, and
     * so which schema to check it against. Absent means the original Genjutsu
     * form, which predates the field.
     */
    const surface =
      typeof body === "object" && body !== null && "surface" in body
        ? body.surface
        : "genjutsu";

    const parsed =
      surface === "edit"
        ? videoEditRequestSchema.safeParse(body)
        : surface === "motion"
          ? videoMotionRequestSchema.safeParse(body)
          : videoGenerationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid generation request", issues: parsed.error.issues },
        { status: 422 },
      );
    }

    const jobs =
      parsed.data.surface === "edit"
        ? createEditJobs(parsed.data)
        : parsed.data.surface === "motion"
          ? createMotionJobs(parsed.data)
          : createVideoJobs(parsed.data);

    return Response.json({ jobs }, { status: 202 });
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
