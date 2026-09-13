import { GENJUTSU_QUALITY, type GenModel, VIDEO_MODELS } from "@/config/models";
import { COMMUNITY_PRESETS, HIGGSFIELD_PRESETS } from "@/config/presets";
import type { VideoSettings } from "@/schemas/video-generation";

/*
 * Stand-in generation history for the video studio.
 *
 * Built from the same presets the Motion Library shows, so there is one set of
 * URLs to fix when the origin rotates them and a returning user's history
 * plausibly resembles what they generated from. Both sources are used rather
 * than a slice of the first: the posters are what carry the variety, since the
 * clips themselves come from a pool of four.
 *
 * Each clip also carries the recipe that supposedly made it, so the tile's
 * Recreate has something real to load back into the panel.
 */

export interface SeededClip {
  id: string;
  /** The clip. Falls back to the still where the pool has no entry. */
  src: string;
  /** Holds the frame until the clip decodes. */
  poster: string;
  w: number;
  h: number;
  prompt: string;
  /** What produced it. Always a combination the panel could submit. */
  settings: VideoSettings;
}

/**
 * A model from the catalogue, by id. Throws rather than falling back, so a
 * typo here fails at import instead of quietly crediting another model.
 */
function catalogue(id: string): GenModel {
  const model = VIDEO_MODELS.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Seeded history names an unknown model: ${id}`);
  return model;
}

/**
 * Always one the model actually offers — the schema rejects anything else,
 * and models here disagree about resolutions far more than the image ones do.
 */
function quality(model: GenModel, index: number): string {
  const offered = model.resolutions ?? [...GENJUTSU_QUALITY];
  return offered[index % offered.length];
}

/*
 * Rotated over the catalogue but weighted to Genjutsu, which is the studio
 * these were supposedly made in. Fourteen entries against twenty-eight
 * presets, so each slot is used exactly twice.
 */
const RECIPE_MODELS = [
  "genjutsu",
  "seedance-2-5",
  "kling-3",
  "genjutsu",
  "minimax-h3",
  "flux-3-video",
  "genjutsu",
  "seedance-2-0",
  "gemini-omni-flash",
  "genjutsu",
  "kling-3-motion-control",
  "grok-imagine-1-5",
  "genjutsu",
  "seedance-2-0-fast",
];

/*
 * Every preset shares one of two prompts, one per mode — fine as library
 * copy, useless as a history of settings to reuse. Each title gets a camera
 * note instead, so twenty-eight clips read as twenty-eight ideas.
 */
const FLAVOURS = [
  "handheld, natural light, no cuts",
  "locked-off tripod, one long take",
  "slow dolly in, shallow focus",
  "steadicam follow at eye level",
  "overhead crane descent",
  "whip pan between beats",
  "low angle, wide lens",
  "slow push out, backlit",
];

/** Every clip is 16:9, so a tile never resizes when one lands. */
const FRAME = { w: 16, h: 9 };

const SOURCES = [...HIGGSFIELD_PRESETS, ...COMMUNITY_PRESETS];

export const VIDEO_HISTORY: SeededClip[] = SOURCES.map(
  (preset, index): SeededClip => {
    const model = catalogue(RECIPE_MODELS[index % RECIPE_MODELS.length]);

    return {
      id: `seed-video-${preset.id}`,
      src: preset.video ?? preset.poster,
      poster: preset.poster,
      ...FRAME,
      prompt: `${preset.title}, ${FLAVOURS[index % FLAVOURS.length]}`,
      settings: {
        mode: preset.mode,
        modelId: model.id,
        quality: quality(model, index),
        promptEnabled: true,
        // A seed has no bytes behind it; pretending otherwise would make
        // Recreate restore an attachment that never existed.
        referenceVideo: null,
        referenceImages: [],
      },
    };
  },
);
