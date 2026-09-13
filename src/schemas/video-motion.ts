import { z } from "zod";

import { videoModelById } from "@/config/models";
import {
  MOTION_MAX_SECONDS,
  MOTION_MIN_SECONDS,
  MOTION_QUALITIES,
  type SceneSource,
} from "@/config/video-motion";

/*
 * What the Motion Control panel is allowed to submit.
 *
 * Stricter than its two siblings, and deliberately so: this surface exists to
 * put one performer's motion onto another's likeness, so neither input is
 * optional. A form that accepted one of the two would be describing a
 * generation the model cannot run.
 */

const SOURCE_IDS = ["video", "image"] as [SceneSource, ...SceneSource[]];

const fileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Expected a file.",
);

const motionVideoSchema = z.object({
  file: fileSchema,
  /** Seconds. `null` when the browser could not decode the metadata. */
  duration: z.number().positive().nullable(),
});

export const videoMotionSchema = z
  .object({
    modelId: z.string().min(1),
    quality: z.enum(MOTION_QUALITIES),
    motionVideo: motionVideoSchema.nullable(),
    characterImage: fileSchema.nullable(),
    sceneControl: z.boolean(),
    sceneSource: z.enum(SOURCE_IDS),
  })
  .superRefine((values, ctx) => {
    /* 1 and 2. Both halves are required; there is no useful half-request. */
    if (!values.motionVideo) {
      ctx.addIssue({
        code: "custom",
        path: ["motionVideo"],
        message: "Add the clip whose motion you want to copy.",
      });
    }
    if (!values.characterImage) {
      ctx.addIssue({
        code: "custom",
        path: ["characterImage"],
        message: "Add a character image with a visible face and body.",
      });
    }

    /* 3. The advertised range, actually enforced. */
    const duration = values.motionVideo?.duration;
    if (
      duration != null &&
      (duration < MOTION_MIN_SECONDS || duration > MOTION_MAX_SECONDS)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["motionVideo"],
        message: `Motion clips run ${String(MOTION_MIN_SECONDS)}–${String(MOTION_MAX_SECONDS)} seconds. This one is ${duration.toFixed(1)}s.`,
      });
    }

    /* 4. Quality the model actually offers. */
    const model = videoModelById(values.modelId);
    if (model?.resolutions && !model.resolutions.includes(values.quality)) {
      ctx.addIssue({
        code: "custom",
        path: ["quality"],
        message: `${model.name} does not render at ${values.quality}.`,
      });
    }
  });

export type VideoMotionValues = z.infer<typeof videoMotionSchema>;

export const videoMotionRequestSchema = z.object({
  kind: z.literal("video"),
  surface: z.literal("motion"),
  modelId: z.string().min(1),
  quality: z.string().min(1),
  sceneControl: z.boolean(),
  /*
   * Sent only while scene control is on. Off, the field is not part of the
   * request, and passing it anyway would leave the server deciding whether to
   * honour a setting the user disabled.
   */
  sceneSource: z.enum(SOURCE_IDS).nullable(),
  motionVideo: z
    .object({
      name: z.string(),
      size: z.number().nonnegative(),
      duration: z.number().positive().nullable(),
    })
    .nullable(),
  characterImage: z
    .object({ name: z.string(), size: z.number().nonnegative() })
    .nullable(),
});

export type VideoMotionRequest = z.infer<typeof videoMotionRequestSchema>;

export function toMotionRequest(values: VideoMotionValues): VideoMotionRequest {
  return {
    kind: "video",
    surface: "motion",
    modelId: values.modelId,
    quality: values.quality,
    sceneControl: values.sceneControl,
    sceneSource: values.sceneControl ? values.sceneSource : null,
    motionVideo: values.motionVideo
      ? {
          name: values.motionVideo.file.name,
          size: values.motionVideo.file.size,
          duration: values.motionVideo.duration,
        }
      : null,
    characterImage: values.characterImage
      ? { name: values.characterImage.name, size: values.characterImage.size }
      : null,
  };
}
