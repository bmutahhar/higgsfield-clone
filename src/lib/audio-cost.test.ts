import { describe, expect, it } from "vitest";

import { audioCost } from "@/lib/audio-cost";

describe("audioCost", () => {
  it("charges the model rate for a batch of one", () => {
    expect(audioCost("tts", "seed-audio-1", 1)).toBe(0.3);
    expect(audioCost("tts", "elevenlabs-v3", 1)).toBe(0.15);
  });

  it("scales linearly with batch", () => {
    expect(audioCost("tts", "seed-audio-1", 2)).toBe(0.6);
    expect(audioCost("tts", "seed-audio-1", 4)).toBe(1.2);
  });

  /*
   * Two decimals, not one: the base rates are themselves 0.15, so rounding to
   * a single place would report the cheapest model's own price as 0.2.
   *
   * Floating point is the reason any rounding happens at all — 0.15 * 3 is
   * 0.44999999999999996, which would render as a 17-digit CTA label.
   */
  it("rounds to two decimal places", () => {
    expect(audioCost("tts", "elevenlabs-v3", 3)).toBe(0.45);
    expect(audioCost("tts", "elevenlabs-v3", 7)).toBe(1.05);
  });

  it("uses a flat rate for the single-job modes and ignores batch", () => {
    expect(audioCost("voice-change", "seed-audio-1", 1)).toBe(0.2);
    expect(audioCost("voice-change", "seed-audio-1", 4)).toBe(0.2);
    expect(audioCost("translate", "seed-audio-1", 4)).toBe(0.4);
  });

  it("falls back to zero for an unknown model rather than NaN", () => {
    expect(audioCost("tts", "nope", 2)).toBe(0);
  });
});
