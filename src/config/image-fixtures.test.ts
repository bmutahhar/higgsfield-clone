import { describe, expect, it } from "vitest";

import { IMAGE_HISTORY } from "@/config/image-fixtures";
import { ASPECT_RATIOS } from "@/config/image-studio";
import { imageGenerationSchema } from "@/schemas/image-generation";

const entries = IMAGE_HISTORY.map((item) => [item.id, item] as const);

describe("seeded image history", () => {
  it("opens the feed with three passes over the stills", () => {
    expect(IMAGE_HISTORY).toHaveLength(45);
  });

  it("gives every entry an id of its own", () => {
    const ids = IMAGE_HISTORY.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /*
   * The reason the fixture exists at all. A seeded recipe that the composer
   * could not have submitted would load a form that cannot be generated, and
   * the failure would surface as a validation error on someone else's click.
   * Parsing through the real schema makes that unreachable — including the
   * model-supports-resolution rule, which no amount of reading catches.
   */
  it.each(entries)(
    "%s carries a recipe the composer would accept",
    (_id, item) => {
      const parsed = imageGenerationSchema.safeParse({
        ...item.settings,
        prompt: item.prompt,
      });
      // Asserted before `success` so a failure prints what was wrong, not `false`.
      expect(parsed.error?.issues ?? []).toEqual([]);
      expect(parsed.success).toBe(true);
    },
  );

  /*
   * The tile reserves its space from `w`/`h` before the image loads, and
   * Recreate puts `aspectRatio` back in the composer. If those two disagree,
   * regenerating a tile silently produces a different shape than the one on
   * screen.
   */
  it.each(entries)("%s reserves the frame its ratio names", (_id, item) => {
    const ratio = ASPECT_RATIOS.find(
      (candidate) => candidate.id === item.settings.aspectRatio,
    );
    expect(ratio).toBeDefined();
    expect([ratio?.w, ratio?.h]).toEqual([item.w, item.h]);
  });

  it("writes a distinct prompt for every entry", () => {
    const prompts = new Set(IMAGE_HISTORY.map((item) => item.prompt));
    expect(prompts.size).toBe(IMAGE_HISTORY.length);
  });

  it("varies the recipe rather than repeating one", () => {
    const recipes = new Set(
      IMAGE_HISTORY.map((item) => JSON.stringify(item.settings)),
    );
    expect(recipes.size).toBeGreaterThan(8);
  });
});
