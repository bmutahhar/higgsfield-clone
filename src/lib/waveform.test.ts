import { describe, expect, it } from "vitest";

import { waveformBars } from "@/lib/waveform";

describe("waveformBars", () => {
  it("returns the requested number of bars", () => {
    expect(waveformBars("a1b2c3", 64)).toHaveLength(64);
    expect(waveformBars("a1b2c3", 8)).toHaveLength(8);
  });

  it("defaults to 64 bars", () => {
    expect(waveformBars("a1b2c3")).toHaveLength(64);
  });

  /* D4: same id, same picture, every reload and every machine. */
  it("is deterministic for a given id", () => {
    expect(waveformBars("axyz.1.abcd")).toEqual(waveformBars("axyz.1.abcd"));
  });

  it("gives different ids different shapes", () => {
    expect(waveformBars("axyz.1.abcd")).not.toEqual(
      waveformBars("axyz.2.abcd"),
    );
  });

  /* A zero-height bar renders as nothing and reads as a rendering bug. */
  it("keeps every bar within 0.15 and 1", () => {
    for (const id of ["a1", "bqqq.0.zz", "axyz.1.abcd", ""]) {
      for (const bar of waveformBars(id, 128)) {
        expect(bar).toBeGreaterThanOrEqual(0.15);
        expect(bar).toBeLessThanOrEqual(1);
      }
    }
  });

  it("survives an empty id rather than throwing", () => {
    expect(waveformBars("", 4)).toHaveLength(4);
  });

  /* Flat output would mean the hash collapsed — the tile would look broken. */
  it("produces varied heights, not a flat line", () => {
    const bars = waveformBars("axyz.1.abcd", 64);
    expect(new Set(bars).size).toBeGreaterThan(8);
  });
});
