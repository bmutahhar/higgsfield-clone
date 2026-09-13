import { describe, expect, it } from "vitest";

import { AUDIO_MODELS, voiceById, VOICES } from "@/config/audio";
import {
  AUDIO_FIXTURES,
  AUDIO_SEED,
  audioSeedFor,
} from "@/config/audio-fixtures";

describe("audio fixtures", () => {
  it("gives every clip an absolute url and a positive duration", () => {
    for (const fixture of AUDIO_FIXTURES) {
      expect(fixture.url).toMatch(/^https?:\/\//);
      expect(fixture.duration).toBeGreaterThan(0);
    }
  });
});

describe("the seeded back catalogue", () => {
  /* An empty tab shows a reviewer nothing — not the rows, not the grid. */
  it("seeds all three tabs", () => {
    expect(audioSeedFor("tts").length).toBeGreaterThan(0);
    expect(audioSeedFor("voice-change").length).toBeGreaterThan(0);
    expect(audioSeedFor("translate").length).toBeGreaterThan(0);
  });

  it("uses ids that are unique", () => {
    expect(new Set(AUDIO_SEED.map((s) => s.id)).size).toBe(AUDIO_SEED.length);
  });

  it("names only models the catalogue knows", () => {
    const ids = new Set(AUDIO_MODELS.map((m) => m.id));
    for (const entry of AUDIO_SEED) {
      expect(ids.has(entry.modelId)).toBe(true);
    }
  });

  /* History rows lead with the voice, so speech without one renders headless. */
  it("gives every speech entry a known voice", () => {
    for (const entry of audioSeedFor("tts")) {
      expect(entry.voiceId).toBeDefined();
      expect(voiceById(entry.voiceId!)).toBeDefined();
    }
  });

  /* The two video tabs render tiles, which need a poster and a real frame. */
  it("gives every video entry a poster and a 3:4 frame", () => {
    for (const mode of ["voice-change", "translate"] as const) {
      for (const entry of audioSeedFor(mode)) {
        expect(entry.poster).toBeTruthy();
        expect(entry.src).toMatch(/^https?:\/\//);
        expect([entry.w, entry.h]).toEqual([3, 4]);
      }
    }
  });

  it("leaves speech without a frame of its own", () => {
    for (const entry of audioSeedFor("tts")) {
      expect([entry.w, entry.h]).toEqual([1, 1]);
      expect(entry.poster).toBeUndefined();
    }
  });

  it("returns each tab newest first", () => {
    for (const mode of ["tts", "voice-change", "translate"] as const) {
      const stamps = audioSeedFor(mode).map((e) => e.createdAt);
      expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
    }
  });

  /*
   * Fixed timestamps, not offsets from now: a date computed at module load is
   * evaluated once on the server and again in the browser, and a request
   * served either side of local midnight would group under two different
   * headings. Calling twice must give the same answer.
   */
  it("holds timestamps that do not move between calls", () => {
    expect(audioSeedFor("tts").map((e) => e.createdAt)).toEqual(
      audioSeedFor("tts").map((e) => e.createdAt),
    );
    for (const entry of AUDIO_SEED) {
      expect(Number.isFinite(entry.createdAt)).toBe(true);
      expect(entry.createdAt).toBeGreaterThan(0);
    }
  });

  /* More than one day per tab, or the grouping has nothing to group. */
  it("spreads speech across at least two calendar days", () => {
    const days = new Set(
      audioSeedFor("tts").map((e) =>
        new Date(e.createdAt).toISOString().slice(0, 10),
      ),
    );
    expect(days.size).toBeGreaterThanOrEqual(2);
  });

  it("keeps every voice avatar a usable gradient pair", () => {
    for (const voice of VOICES) {
      expect(voice.avatar).toHaveLength(2);
      for (const stop of voice.avatar) {
        expect(stop).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});
