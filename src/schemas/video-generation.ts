import { z } from "zod";

import {
  type GenjutsuMode,
  MODES,
  VIDEO_MAX_SECONDS,
  VIDEO_MIN_SECONDS,
} from "@/config/genjutsu";
import {
  GENJUTSU_QUALITY,
  VIDEO_MODELS,
  videoModelById,
} from "@/config/models";

/*
 * What the Genjutsu side panel is allowed to submit.
 *
 * Same contract as `image-generation.ts`: option lists are derived from the
 * catalogue rather than restated, so a model added in `config/models.ts` is
 * accepted here without a second edit, and one removed there stops validating.
 *
 * Three of this panel's rules are conditional on another field, which is why
 * the bulk of the work happens in `superRefine` rather than on the fields
 * themselves — a flat schema cannot express "required only when the toggle is
 * on" or "at most as many images as this mode allows".
 */

const MODEL_IDS = VIDEO_MODELS.map((model) => model.id);
const MODE_IDS = Object.keys(MODES) as [GenjutsuMode, ...GenjutsuMode[]];

/** Long enough for a shot description, short enough that the request is sane. */
export const PROMPT_MAX_LENGTH = 2000;

/**
 * A picked clip and the duration we read off it. Duration cannot come from the
 * `File` alone — it needs a metadata load — so the drop zone resolves it before
 * handing the value to the form.
 */
const referenceVideoSchema = z.object({
  file: z.custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Expected a video file.",
  ),
  /** Seconds. `null` when the browser could not decode the metadata. */
  duration: z.number().positive().nullable(),
});

const referenceImageSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Expected an image file.",
);

export const videoGenerationSchema = z
  .object({
    mode: z.enum(MODE_IDS),
    modelId: z.enum(MODEL_IDS),
    /*
     * Not an enum. The catalogue speaks a wider vocabulary than this panel's
     * default list — 4K, 2K, 768p — and which values are legal depends entirely
     * on the selected model, so the real check is the model-aware rule below.
     * A fixed enum here would have rejected resolutions the UI itself offers.
     */
    quality: z.string().min(1, "Pick a quality."),
    /*
     * The prompt is opt-in on this surface — the reference clip and the
     * character images are the primary input, and the toggle is off by
     * default. So the field is always present but only *required* when the
     * toggle is on; see the refinement below.
     */
    promptEnabled: z.boolean(),
    prompt: z
      .string()
      .trim()
      .max(
        PROMPT_MAX_LENGTH,
        `Keep the prompt under ${String(PROMPT_MAX_LENGTH)} characters.`,
      ),
    referenceVideo: referenceVideoSchema.nullable(),
    referenceImages: z.array(referenceImageSchema),
  })
  .superRefine((values, ctx) => {
    /* 1. An enabled prompt that says nothing is a mistake, not a choice. */
    if (values.promptEnabled && values.prompt.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["prompt"],
        message: "Describe the change you want, or turn the prompt off.",
      });
    }

    /*
     * 2. Not every model renders at every resolution. The panel swaps to a
     * supported one when you change model, so this is the backstop for a
     * pairing the UI should never have produced — a restored draft, or a
     * hand-edited `?model=` in the URL.
     */
    const model = videoModelById(values.modelId);
    const offered: readonly string[] = model?.resolutions ?? GENJUTSU_QUALITY;
    if (!offered.includes(values.quality)) {
      ctx.addIssue({
        code: "custom",
        path: ["quality"],
        message: model
          ? `${model.name} does not render at ${values.quality}.`
          : `${values.quality} is not a supported quality.`,
      });
    }

    /* 3. The image cap is a property of the mode, not of the field. */
    const limit = MODES[values.mode].imageLimit;
    if (values.referenceImages.length > limit) {
      ctx.addIssue({
        code: "custom",
        path: ["referenceImages"],
        message: `${MODES[values.mode].label} accepts up to ${String(limit)} images.`,
      });
    }

    /* 4. The duration bound the drop zone advertises, actually enforced. */
    const duration = values.referenceVideo?.duration;
    if (
      duration != null &&
      (duration < VIDEO_MIN_SECONDS || duration > VIDEO_MAX_SECONDS)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["referenceVideo"],
        message: `Reference clips run ${String(VIDEO_MIN_SECONDS)}–${String(VIDEO_MAX_SECONDS)} seconds. This one is ${duration.toFixed(1)}s.`,
      });
    }
  });

export type VideoGenerationValues = z.infer<typeof videoGenerationSchema>;
export type ReferenceVideo = z.infer<typeof referenceVideoSchema>;
