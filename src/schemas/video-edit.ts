import { z } from "zod";

import { videoModelById } from "@/config/models";
import {
  BITRATES,
  EDIT_MAX_ELEMENTS,
  EDIT_MAX_SECONDS,
  EDIT_RESOLUTIONS,
  type EditMode,
} from "@/config/video-edit";

/*
 * What the Edit Video panel is allowed to submit.
 *
 * Same contract as the other two surfaces: enums derived from config, and the
 * conditional rules in `superRefine` because a flat schema cannot express
 * "required only in this mode".
 *
 * Unlike Genjutsu the prompt is not optional here — this surface has no toggle,
 * and an edit with nothing said about it is not a request.
 */

const MODE_IDS = ["prompt", "draw"] as [EditMode, ...EditMode[]];

export const EDIT_PROMPT_MAX = 2000;

const fileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Expected a file.",
);

const referenceVideoSchema = z.object({
  file: fileSchema,
  /** Seconds. `null` when the browser could not decode the metadata. */
  duration: z.number().positive().nullable(),
});

export const videoEditSchema = z
  .object({
    mode: z.enum(MODE_IDS),
    modelId: z.string().min(1),
    prompt: z
      .string()
      .trim()
      .min(1, "Describe what should change in the clip.")
      .max(
        EDIT_PROMPT_MAX,
        `Keep the prompt under ${String(EDIT_PROMPT_MAX)} characters.`,
      ),
    referenceVideo: referenceVideoSchema.nullable(),
    elements: z.array(fileSchema),
    resolution: z.enum(EDIT_RESOLUTIONS),
    bitrate: z.enum(BITRATES),
    /** Whether generated audio rides along. The toggle beside the prompt. */
    audio: z.boolean(),
  })
  .superRefine((values, ctx) => {
    /* 1. There is nothing to edit without a clip. */
    if (!values.referenceVideo) {
      ctx.addIssue({
        code: "custom",
        path: ["referenceVideo"],
        message: "Add the video you want to edit.",
      });
    }

    /* 2. The advertised length bound, actually enforced. */
    const duration = values.referenceVideo?.duration;
    if (duration != null && duration > EDIT_MAX_SECONDS) {
      ctx.addIssue({
        code: "custom",
        path: ["referenceVideo"],
        message: `Clips run up to ${String(EDIT_MAX_SECONDS)}s. This one is ${duration.toFixed(1)}s.`,
      });
    }

    /* 3. The element cap. */
    if (values.elements.length > EDIT_MAX_ELEMENTS) {
      ctx.addIssue({
        code: "custom",
        path: ["elements"],
        message: `Up to ${String(EDIT_MAX_ELEMENTS)} elements.`,
      });
    }

    /*
     * 4. Not every model renders at every resolution. The panel falls back when
     * you change model, so this catches a restored draft or a hand-edited URL.
     */
    const model = videoModelById(values.modelId);
    if (model?.resolutions && !model.resolutions.includes(values.resolution)) {
      ctx.addIssue({
        code: "custom",
        path: ["resolution"],
        message: `${model.name} does not render at ${values.resolution}.`,
      });
    }
  });

export type VideoEditValues = z.infer<typeof videoEditSchema>;

/*
 * The wire shape. A File does not survive JSON.stringify, so the request
 * carries the decisions plus enough of the media to describe it — the same
 * projection the Genjutsu request makes.
 */
export const videoEditRequestSchema = z.object({
  kind: z.literal("video"),
  surface: z.literal("edit"),
  mode: z.enum(MODE_IDS),
  modelId: z.string().min(1),
  prompt: z.string(),
  resolution: z.string().min(1),
  bitrate: z.string().min(1),
  audio: z.boolean(),
  referenceVideo: z
    .object({
      name: z.string(),
      size: z.number().nonnegative(),
      duration: z.number().positive().nullable(),
    })
    .nullable(),
  elementCount: z.number().int().nonnegative(),
});

export type VideoEditRequest = z.infer<typeof videoEditRequestSchema>;

export function toEditRequest(values: VideoEditValues): VideoEditRequest {
  return {
    kind: "video",
    surface: "edit",
    mode: values.mode,
    modelId: values.modelId,
    prompt: values.prompt,
    resolution: values.resolution,
    bitrate: values.bitrate,
    audio: values.audio,
    referenceVideo: values.referenceVideo
      ? {
          name: values.referenceVideo.file.name,
          size: values.referenceVideo.file.size,
          duration: values.referenceVideo.duration,
        }
      : null,
    elementCount: values.elements.length,
  };
}
