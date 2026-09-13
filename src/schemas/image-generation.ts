import { z } from "zod";

import {
  ASPECT_RATIOS,
  BACKGROUNDS,
  IMAGE_MODELS,
  MAX_BATCH,
  modelById,
  QUALITIES,
} from "@/config/image-studio";

/*
 * What the image composer is allowed to submit.
 *
 * The option lists are derived from the catalogue rather than restated, so a
 * model or ratio added in `config/image-studio.ts` is accepted here without a
 * second edit — and, more importantly, one removed there stops validating.
 */

const MODEL_IDS = IMAGE_MODELS.map((model) => model.id);
const RATIO_IDS = ASPECT_RATIOS.map((ratio) => ratio.id);
const QUALITY_IDS = QUALITIES.map((quality) => quality.id);
const BACKGROUND_IDS = BACKGROUNDS.map((background) => background.id);

/** Long enough for a shot list; short enough that the request is sane. */
export const PROMPT_MAX_LENGTH = 2000;

export const imageGenerationSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(1, "Describe the scene you want to generate.")
      .max(
        PROMPT_MAX_LENGTH,
        `Keep the prompt under ${String(PROMPT_MAX_LENGTH)} characters.`,
      ),
    modelId: z.enum(MODEL_IDS),
    aspectRatio: z.enum(RATIO_IDS),
    quality: z.enum(QUALITY_IDS),
    resolution: z.enum(["1K", "2K", "4K"]),
    background: z.enum(BACKGROUND_IDS),
    batch: z.number().int().min(1).max(MAX_BATCH),
  })
  /*
   * Resolution is the one field whose valid range depends on another: not
   * every model renders at 4K. The composer already swaps to a supported
   * resolution when you change model, so this is the backstop for a pairing
   * the UI should never have produced — a restored draft, say, or a stale
   * link.
   */
  .superRefine((values, ctx) => {
    const model = modelById(values.modelId);
    if (!model.resolutions.includes(values.resolution)) {
      ctx.addIssue({
        code: "custom",
        path: ["resolution"],
        message: `${model.name} does not render at ${values.resolution}.`,
      });
    }
  });

export type ImageGenerationValues = z.infer<typeof imageGenerationSchema>;
