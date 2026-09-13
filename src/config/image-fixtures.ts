import {
  ASPECT_RATIOS,
  IMAGE_MODELS,
  type ImageModel,
  type ResolutionId,
} from "@/config/image-studio";
import { PRESETS } from "@/config/media";
import type { ImageSettings } from "@/schemas/image-generation";

/*
 * Stand-in generation history for the image studio.
 *
 * The live feed is the signed-in user's own output; these are Higgsfield's
 * public stills at assorted ratios, which is what the masonry needs to be
 * exercised properly. Each one also carries the recipe that supposedly made
 * it, so the tile's Recreate has something real to load back into the
 * composer.
 *
 * It lives here rather than in `config/image-studio.ts` because it needs the
 * settings type, and that is derived from the schema — which already imports
 * the catalogue. Putting it back in the catalogue would close the loop into a
 * module cycle.
 */

export interface SeededImage {
  id: string;
  src: string;
  /** Intrinsic ratio, so the masonry can lay out before the image loads. */
  w: number;
  h: number;
  prompt: string;
  /** What produced it. Always a combination the composer could submit. */
  settings: ImageSettings;
}

/**
 * A ratio from the catalogue, by id.
 *
 * The frame is read back off `ASPECT_RATIOS` rather than written beside the
 * id, so a seeded tile can never reserve a shape that the composer does not
 * offer — which the previous hand-written list did, with a 4:5 that appears
 * nowhere in the picker.
 */
function frame(id: string): { id: string; w: number; h: number } {
  const ratio = ASPECT_RATIOS.find((candidate) => candidate.id === id);
  if (ratio?.w === undefined || ratio.h === undefined) {
    throw new Error(`Seeded history names an unknown aspect ratio: ${id}`);
  }
  return { id, w: ratio.w, h: ratio.h };
}

/**
 * A model from the catalogue, by id.
 *
 * Deliberately not `modelById`, which falls back to the first model for an
 * unknown id — the right behaviour for a hand-edited URL, the wrong one here,
 * where it would quietly attribute a fixture to a model nobody chose.
 */
function catalogue(id: string): ImageModel {
  const model = IMAGE_MODELS.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Seeded history names an unknown model: ${id}`);
  return model;
}

/*
 * Weighted toward portrait, the way an image history actually skews. Sixteen
 * entries against fifteen stills, so the same still lands on a different
 * frame on each pass.
 */
const RATIOS = [
  "3:4",
  "2:3",
  "1:1",
  "3:4",
  "4:3",
  "2:3",
  "1:1",
  "16:9",
  "3:4",
  "2:3",
  "1:1",
  "9:16",
  "3:2",
  "3:4",
  "2:3",
  "21:9",
];

/*
 * A preset's name is a label — "Floating fall". A prompt someone would reuse
 * has something to edit in it, so each name gets a photographic tail.
 */
const FLAVOURS = [
  "shot on 35mm, volumetric haze, editorial fashion",
  "hard flash, high contrast, studio seamless",
  "golden hour rim light, shallow depth of field",
  "overcast daylight, muted palette, documentary framing",
  "anamorphic flare, wet asphalt, night exterior",
  "soft window light, fine grain, quiet interior",
  "tungsten practicals, deep shadows, cinematic grade",
  "backlit dust, long lens compression, warm highlights",
];

const RECIPE_MODELS = [
  "higgsfield-soul-2",
  "gpt-image-2",
  "seedream-5-pro",
  "nano-banana-pro",
  "flux-2-max",
  "recraft-v4-1",
  "higgsfield-soul-cinema",
  "z-image",
  "grok-imagine-2",
  "kling-o1",
];

const QUALITIES = ["High", "Medium", "High", "Low", "High", "Medium"];
const BACKGROUNDS = ["Auto", "Auto", "Opaque", "Auto", "Transparent", "Auto"];
const BATCHES = [1, 2, 1, 4, 1, 2, 3, 1];

/**
 * Always one the model actually offers.
 *
 * The schema rejects a model/resolution pairing it does not support, so
 * picking out of the model's own list is what keeps every fixture valid by
 * construction rather than by inspection.
 */
function resolution(model: ImageModel, index: number): ResolutionId {
  return model.resolutions[index % model.resolutions.length];
}

/** How many times the stills are walked. Three passes over fifteen is 45. */
const PASSES = 3;

export const IMAGE_HISTORY: SeededImage[] = Array.from(
  { length: PASSES * PRESETS.length },
  (_, index): SeededImage => {
    const pass = Math.floor(index / PRESETS.length);
    const preset = PRESETS[index % PRESETS.length];
    const ratio = frame(RATIOS[index % RATIOS.length]);
    const model = catalogue(RECIPE_MODELS[index % RECIPE_MODELS.length]);

    return {
      // The first pass keeps the bare slug, so anything already pointing at
      // one of these ids still resolves.
      id: pass === 0 ? preset.slug : `${preset.slug}-${String(pass + 1)}`,
      src: preset.poster,
      w: ratio.w,
      h: ratio.h,
      prompt: `${preset.name}, ${FLAVOURS[index % FLAVOURS.length]}`,
      settings: {
        modelId: model.id,
        aspectRatio: ratio.id,
        quality: QUALITIES[index % QUALITIES.length],
        resolution: resolution(model, index),
        background: BACKGROUNDS[index % BACKGROUNDS.length],
        batch: BATCHES[index % BATCHES.length],
      },
    };
  },
);
