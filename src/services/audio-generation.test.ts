import { afterEach, describe, expect, it, vi } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
} from "@/schemas/audio-generation";
import { requestAudioGeneration } from "@/services/audio-generation";

/* Parsed rather than cast, so the fixture cannot drift from the schema. */
const values: AudioGenerationValues = audioGenerationSchema.parse({
  mode: "tts",
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch: 2,
  attachments: [],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestAudioGeneration", () => {
  it("posts the projected request and returns the jobs", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: [{ id: "a1.0.xy", w: 1, h: 1, prompt: "x" }],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const jobs = await requestAudioGeneration(values);

    expect(jobs).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/generations");
    expect(init.method).toBe("POST");

    /*
     * The wire payload must be the projection, not the form values: a File
     * serialises to {} and the endpoint would reject the request.
     */
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.kind).toBe("audio");
    expect(body.mode).toBe("tts");
    expect(body.batch).toBe(2);
  });

  it("throws with the status when the endpoint refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 422 }),
    );

    await expect(requestAudioGeneration(values)).rejects.toThrow("422");
  });
});
