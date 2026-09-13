import { describe, expect, it } from "vitest";

import { VIDEO_MODELS } from "@/config/models";
import { VIDEO_HISTORY } from "@/config/video-fixtures";
import { videoGenerationSchema } from "@/schemas/video-generation";

const entries = VIDEO_HISTORY.map((clip) => [clip.id, clip] as const);

describe("seeded video history", () => {
  it("opens the history with every preset, both sources", () => {
    expect(VIDEO_HISTORY).toHaveLength(28);
  });

  it("gives every clip an id of its own", () => {
    const ids = VIDEO_HISTORY.map((clip) => clip.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /*
   * Same contract as the image fixtures: a recipe that the panel could not
   * have submitted would load a form that refuses to generate. Parsing
   * through the real schema covers the model-supports-quality rule and the
   * prompt-required-when-enabled rule at once.
   */
  it.each(entries)(
    "%s carries a recipe the panel would accept",
    (_id, clip) => {
      const parsed = videoGenerationSchema.safeParse({
        ...clip.settings,
        prompt: clip.prompt,
      });
      expect(parsed.error?.issues ?? []).toEqual([]);
      expect(parsed.success).toBe(true);
    },
  );

  /*
   * A seeded clip has no bytes behind it, so its drop zones must be empty.
   * Inventing a reference file here would make Recreate restore an attachment
   * that never existed.
   */
  it.each(entries)("%s attaches no reference media", (_id, clip) => {
    expect(clip.settings.referenceVideo).toBeNull();
    expect(clip.settings.referenceImages).toEqual([]);
  });

  it("writes a distinct prompt for every clip", () => {
    const prompts = new Set(VIDEO_HISTORY.map((clip) => clip.prompt));
    expect(prompts.size).toBe(VIDEO_HISTORY.length);
  });

  it("spreads the catalogue rather than crediting one model", () => {
    const models = new Set(VIDEO_HISTORY.map((clip) => clip.settings.modelId));
    expect(models.size).toBeGreaterThan(4);
    for (const id of models) {
      expect(VIDEO_MODELS.map((model) => model.id)).toContain(id);
    }
  });
});
