import { describe, expect, it, vi } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import type { AudioGenerationRequest } from "@/schemas/audio-generation";
import { createAudioJobs, readJob } from "@/server/generation-jobs.server";

/* The module is server-only; the marker throws in this runner and means
   nothing here. Same stand-in the auth route tests use. */
vi.mock("server-only", () => ({}));

const ttsRequest = (batch: number): AudioGenerationRequest => ({
  kind: "audio",
  mode: "tts",
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch,
  attachments: [],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS as AudioGenerationRequest extends {
    advanced: infer A;
  }
    ? A
    : never,
});

describe("createAudioJobs", () => {
  it("issues one job per batch item", () => {
    expect(createAudioJobs(ttsRequest(1))).toHaveLength(1);
    expect(createAudioJobs(ttsRequest(4))).toHaveLength(4);
  });

  it("tags audio ids with 'a' so one reader can serve every surface", () => {
    for (const job of createAudioJobs(ttsRequest(2))) {
      expect(job.id.startsWith("a")).toBe(true);
    }
  });

  it("gives every job in a batch a distinct id", () => {
    const jobs = createAudioJobs(ttsRequest(4));
    expect(new Set(jobs.map((j) => j.id)).size).toBe(4);
  });

  it("carries the script through as the prompt", () => {
    expect(createAudioJobs(ttsRequest(1))[0].prompt).toBe("The fog rolled in.");
  });

  /* Speech has no frame, so w/h are a documented sentinel the tile ignores. */
  it("reports a 1x1 frame for speech", () => {
    const [job] = createAudioJobs(ttsRequest(1));
    expect(job.w).toBe(1);
    expect(job.h).toBe(1);
  });

  /* The two video modes render as 3:4 tiles, so their frame is real. */
  it("reports a 3:4 frame for the video modes, one job each", () => {
    const voiceChange: AudioGenerationRequest = {
      kind: "audio",
      mode: "voice-change",
      modelId: "elevenlabs-v3",
      voice: { name: "v.wav", size: 1, type: "audio/wav" },
      clip: { name: "c.mp4", size: 1, type: "video/mp4" },
    };
    const jobs = createAudioJobs(voiceChange);
    expect(jobs).toHaveLength(1);
    expect([jobs[0].w, jobs[0].h]).toEqual([3, 4]);
  });
});

describe("readJob for audio", () => {
  it("starts a fresh job in processing", () => {
    const [job] = createAudioJobs(ttsRequest(1));
    expect(readJob(job.id)?.status).toBe("processing");
  });

  it("reports ready with a duration once the deadline has passed", () => {
    /*
     * Forge an id with a deadline in the past — the same property the module's
     * own comment documents as an accepted trade.
     */
    const past = (Date.now() - 1000).toString(36);
    const status = readJob(`a${past}.0.abcd1234`);
    expect(status?.status).toBe("ready");
    if (status?.status === "ready") {
      expect(status.asset.url).toMatch(/^https?:\/\//);
      /* The waveform sizes itself from this before the file loads. */
      expect(status.asset.duration).toBeGreaterThan(0);
    }
  });

  it("still reads image and video ids", () => {
    const past = (Date.now() - 1000).toString(36);
    expect(readJob(`g${past}.0.abcd1234`)?.status).toBe("ready");
    expect(readJob(`v${past}.0.abcd1234`)?.status).toBe("ready");
  });

  it("returns null for an id it could not have issued", () => {
    expect(readJob("not-an-id")).toBeNull();
    expect(readJob("z123.0.abcd")).toBeNull();
  });
});
