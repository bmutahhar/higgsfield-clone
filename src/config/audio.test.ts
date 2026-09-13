import { describe, expect, it } from "vitest";

import {
  ADVANCED_DEFAULTS,
  AUDIO_MODELS,
  AUDIO_TABS,
  audioModelById,
  DEFAULT_AUDIO_MODEL_ID,
  LANGUAGES,
  MAX_ATTACHMENTS,
  MAX_BATCH,
  OUTPUT_FORMATS,
  SAMPLE_RATES,
  SCRIPT_MAX_LENGTH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";

describe("audio catalogue", () => {
  it("offers the five featured models", () => {
    expect(AUDIO_MODELS.map((m) => m.id)).toEqual([
      "seed-audio-1",
      "elevenlabs-v3",
      "qwen-audio-3-tts",
      "minimax-speech-2-8-hd",
      "seed-speech",
    ]);
  });

  it("defaults to Seed Audio 1.0", () => {
    expect(DEFAULT_AUDIO_MODEL_ID).toBe("seed-audio-1");
    expect(audioModelById(DEFAULT_AUDIO_MODEL_ID)?.name).toBe("Seed Audio 1.0");
  });

  it("returns undefined for an unknown model rather than throwing", () => {
    expect(audioModelById("nope")).toBeUndefined();
  });

  /* Spec §5.9 — measured against the reference for one script. */
  it("prices Seed Audio above the rest", () => {
    expect(audioModelById("seed-audio-1")?.rate).toBe(0.3);
    expect(audioModelById("elevenlabs-v3")?.rate).toBe(0.15);
    expect(audioModelById("minimax-speech-2-8-hd")?.rate).toBe(0.15);
  });

  it("gives every model a non-empty description and sample rates", () => {
    for (const model of AUDIO_MODELS) {
      expect(model.description.length).toBeGreaterThan(0);
      expect(model.sampleRates.length).toBeGreaterThan(0);
      /* Every advertised rate must be one the picker actually offers. */
      for (const rate of model.sampleRates) {
        expect(SAMPLE_RATES).toContain(rate);
      }
    }
  });

  it("names the three tabs in reference order", () => {
    expect(AUDIO_TABS.map((t) => t.id)).toEqual([
      "tts",
      "voice-change",
      "translate",
    ]);
    expect(AUDIO_TABS.map((t) => t.label)).toEqual([
      "Text to Speech",
      "Voice Change",
      "Translate",
    ]);
  });

  it("holds the measured limits", () => {
    expect(MAX_BATCH).toBe(4);
    expect(MAX_ATTACHMENTS).toBe(3);
    expect(VOICE_DETAILS_MAX_LENGTH).toBe(500);
    expect(SCRIPT_MAX_LENGTH).toBe(5000);
  });

  it("defaults English first among the languages", () => {
    expect(LANGUAGES[0].id).toBe("en");
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(10);
    /* Ids must be unique — a duplicate silently breaks the select. */
    expect(new Set(LANGUAGES.map((l) => l.id)).size).toBe(LANGUAGES.length);
  });

  it("offers MP3 first and defaults the advanced panel to the measured values", () => {
    expect(OUTPUT_FORMATS[0]).toBe("MP3");
    expect(ADVANCED_DEFAULTS).toEqual({
      intensity: 5,
      mood: 0,
      speed: 1,
      pitch: 0,
      volume: 100,
      outputFormat: "MP3",
      sampleRate: "24 kHz",
      saveSettings: false,
    });
  });
});
