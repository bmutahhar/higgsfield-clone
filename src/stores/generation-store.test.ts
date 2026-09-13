import { beforeEach, describe, expect, it } from "vitest";

import type { ImageGenerationValues } from "@/schemas/image-generation";
import { useGenerationStore } from "@/stores/generation-store";
import type { GenerationJob } from "@/types/generation.types";

const VALUES: ImageGenerationValues = {
  prompt: "A quiet interior, soft window light",
  // Deliberately not the catalogue default: the point of several of these
  // cases is that the submitted model is what gets recorded.
  modelId: "seedream-5-pro",
  aspectRatio: "3:4",
  quality: "Medium",
  resolution: "4K",
  background: "Transparent",
  batch: 2,
};

const JOBS: GenerationJob[] = [
  { id: "job-1", w: 3, h: 4, prompt: VALUES.prompt },
  { id: "job-2", w: 3, h: 4, prompt: VALUES.prompt },
];

const pristine = useGenerationStore.getState();

beforeEach(() => {
  useGenerationStore.setState(pristine, true);
});

const state = () => useGenerationStore.getState();
const find = (id: string) => state().generations.find((g) => g.id === id);

describe("seeded history", () => {
  it("opens both studios with something to scroll", () => {
    const { generations } = state();
    expect(generations.filter((g) => g.kind === "image")).toHaveLength(45);
    expect(generations.filter((g) => g.kind === "video")).toHaveLength(28);
  });

  it("gives every seed a recipe of its own kind", () => {
    for (const generation of state().generations) {
      expect(generation.settings.kind).toBe(generation.kind);
    }
  });

  it("sorts below anything generated this session", () => {
    for (const generation of state().generations) {
      expect(generation.createdAt).toBeLessThanOrEqual(0);
    }
  });
});

describe("enqueue", () => {
  /*
   * The regression this whole change exists to remove. `enqueue` used to be
   * handed the route's model — the one in `?model=` — so changing the model in
   * the composer and generating attributed the result to the wrong one.
   */
  it("credits the model that was submitted, not the route's", () => {
    state().enqueue({ kind: "image", values: VALUES }, JOBS);
    expect(find("job-1")?.modelId).toBe("seedream-5-pro");
  });

  it("records the recipe without duplicating the prompt into it", () => {
    state().enqueue({ kind: "image", values: VALUES }, JOBS);
    const settings = find("job-1")?.settings;

    expect(settings).toEqual({
      kind: "image",
      values: {
        modelId: "seedream-5-pro",
        aspectRatio: "3:4",
        quality: "Medium",
        resolution: "4K",
        background: "Transparent",
        batch: 2,
      },
    });
    // The prompt lives on the record; two copies could disagree.
    expect(settings?.values).not.toHaveProperty("prompt");
  });

  it("puts the batch in front of the existing history", () => {
    state().enqueue({ kind: "image", values: VALUES }, JOBS);
    const ids = state()
      .generations.slice(0, 2)
      .map((g) => g.id);
    expect(ids).toEqual(["job-1", "job-2"]);
  });
});

describe("applyStatus", () => {
  it("carries the recipe and the like across the landing", () => {
    state().enqueue({ kind: "image", values: VALUES }, JOBS);
    state().toggleLike("job-1");
    state().applyStatus("job-1", {
      id: "job-1",
      status: "ready",
      asset: { url: "https://example.com/a.webp" },
    });

    const landed = find("job-1");
    expect(landed?.status).toBe("ready");
    expect(landed?.src).toBe("https://example.com/a.webp");
    expect(landed?.liked).toBe(true);
    expect(landed?.settings.values.modelId).toBe("seedream-5-pro");
  });
});

describe("toggleLike", () => {
  it("flips one record", () => {
    const [first] = state().generations;
    state().toggleLike(first.id);
    expect(find(first.id)?.liked).toBe(true);
    state().toggleLike(first.id);
    expect(find(first.id)?.liked).toBe(false);
  });

  /*
   * Every other tile has to keep its identity, or `useShallow` reports a
   * change for the whole feed and liking one image re-renders forty-four
   * others.
   */
  it("leaves every other record referentially identical", () => {
    const before = state().generations;
    state().toggleLike(before[0].id);
    const after = state().generations;

    expect(after[0]).not.toBe(before[0]);
    for (let i = 1; i < before.length; i++) {
      expect(after[i]).toBe(before[i]);
    }
  });

  it("ignores an id it does not hold", () => {
    const before = state().generations;
    state().toggleLike("nothing-here");
    expect(state().generations).toBe(before);
  });
});

describe("draft", () => {
  it("holds what Recreate hands over", () => {
    expect(state().draft).toBeNull();
    state().loadDraft({ kind: "image", values: VALUES });
    expect(state().draft).toEqual({ kind: "image", values: VALUES });
  });

  /*
   * Unlike `pendingRequest` a draft is not taken-and-cleared — the composer
   * keys off its identity — so a second Recreate has to replace the first
   * rather than be ignored.
   */
  it("replaces an earlier draft", () => {
    state().loadDraft({ kind: "image", values: VALUES });
    const second = { ...VALUES, prompt: "Something else" };
    state().loadDraft({ kind: "image", values: second });
    expect(state().draft).toMatchObject({
      kind: "image",
      values: { prompt: "Something else" },
    });
  });
});
