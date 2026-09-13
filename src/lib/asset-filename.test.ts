import { describe, expect, it } from "vitest";

import { assetFilename, extensionFor, slugify } from "@/lib/asset-filename";

describe("slugify", () => {
  it.each([
    ["Floating fall, shot on 35mm", "floating-fall-shot-on-35mm"],
    ["  Spaced   out  ", "spaced-out"],
    ["Punctuation!!! everywhere???", "punctuation-everywhere"],
    ["MiXeD CaSe", "mixed-case"],
    ["café — naïve", "cafe-naive"],
    ["under_scores and-hyphens", "under-scores-and-hyphens"],
  ])("turns %j into %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  /* A prompt is free text: it can be empty, or contain nothing nameable. */
  it.each(["", "   ", "!!!", "。。。"])(
    "falls back to a usable name for %j",
    (input) => {
      expect(slugify(input)).toBe("generation");
    },
  );

  it("caps the length without leaving a trailing hyphen", () => {
    const long = slugify(
      "a very long prompt that keeps going well past any reasonable file name length limit indeed",
    );
    expect(long.length).toBeLessThanOrEqual(60);
    expect(long).not.toMatch(/-$/);
    // Cut on a word boundary, so the name still reads.
    expect(long).toBe(
      "a-very-long-prompt-that-keeps-going-well-past-any-reasonable",
    );
  });
});

describe("extensionFor", () => {
  it.each([
    ["image/webp", "webp"],
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["video/mp4", "mp4"],
    ["image/webp; charset=binary", "webp"],
  ])("reads %j as .%s", (mime, expected) => {
    expect(extensionFor(mime, "https://example.com/thing")).toBe(expected);
  });

  /*
   * The stills come through Cloudflare's image transform, which nests the
   * origin URL inside the path. The extension worth having is the one on the
   * last segment, not the one in the transform's `format=` parameter.
   */
  it("falls back to the url when the type is unknown", () => {
    expect(
      extensionFor(
        undefined,
        "https://higgsfield.ai/cdn-cgi/image/fit=scale-down,format=webp,width=1920/https://cdn.higgsfield.ai/viral_hub/abc.webp",
      ),
    ).toBe("webp");
  });

  it.each([
    ["https://static.higgsfield.ai/genjutsu/intro.mp4", "mp4"],
    ["https://example.com/a.webp?v=2", "webp"],
  ])("reads %j as .%s", (url, expected) => {
    expect(extensionFor("application/octet-stream", url)).toBe(expected);
  });

  it.each(["https://example.com/no-extension", "not a url at all", ""])(
    "gives up safely on %j",
    (url) => {
      expect(extensionFor(undefined, url)).toBe("bin");
    },
  );
});

describe("assetFilename", () => {
  it("names the file after the prompt that made it", () => {
    expect(
      assetFilename("Floating fall, shot on 35mm", "image/webp", "https://x/y"),
    ).toBe("floating-fall-shot-on-35mm.webp");
  });

  it("still produces a name for an empty prompt", () => {
    expect(assetFilename("", "video/mp4", "https://x/y")).toBe(
      "generation.mp4",
    );
  });
});
