import { describe, expect, it } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
  toAudioRequest,
  ttsDefaults,
} from "@/schemas/audio-generation";

const file = (name: string) => new File(["x"], name, { type: "audio/wav" });

const tts = (overrides: Record<string, unknown> = {}) => ({
  mode: "tts" as const,
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch: 1,
  attachments: [] as File[],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS,
  ...overrides,
});

/** Values these tests have already asserted are valid. */
const valid = (input: unknown): AudioGenerationValues => {
  const parsed = audioGenerationSchema.parse(input);
  return parsed;
};

describe("text to speech", () => {
  it("accepts a minimal valid script", () => {
    expect(audioGenerationSchema.safeParse(tts()).success).toBe(true);
  });

  it("rejects an empty or whitespace-only script", () => {
    expect(audioGenerationSchema.safeParse(tts({ script: "" })).success).toBe(
      false,
    );
    expect(
      audioGenerationSchema.safeParse(tts({ script: "   " })).success,
    ).toBe(false);
  });

  it("rejects a script past the sanity bound", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ script: "a".repeat(5001) }))
        .success,
    ).toBe(false);
  });

  it("rejects a model the catalogue does not know", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ modelId: "nope" })).success,
    ).toBe(false);
  });

  it("holds batch between 1 and 4", () => {
    expect(audioGenerationSchema.safeParse(tts({ batch: 0 })).success).toBe(
      false,
    );
    expect(audioGenerationSchema.safeParse(tts({ batch: 5 })).success).toBe(
      false,
    );
    expect(audioGenerationSchema.safeParse(tts({ batch: 4 })).success).toBe(
      true,
    );
  });

  it("allows three attachments and refuses a fourth", () => {
    const three = [file("a.wav"), file("b.wav"), file("c.wav")];
    expect(
      audioGenerationSchema.safeParse(tts({ attachments: three })).success,
    ).toBe(true);
    expect(
      audioGenerationSchema.safeParse(
        tts({ attachments: [...three, file("d.wav")] }),
      ).success,
    ).toBe(false);
  });

  it("caps voice details at 500 characters", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ voiceDetails: "a".repeat(500) }))
        .success,
    ).toBe(true);
    expect(
      audioGenerationSchema.safeParse(tts({ voiceDetails: "a".repeat(501) }))
        .success,
    ).toBe(false);
  });

  /*
   * Spec §7 rule 2. The panel swaps to a supported rate on model change, so
   * this only fires for a restored draft — which is exactly when it matters.
   */
  it("rejects a sample rate the chosen model does not render at", () => {
    const result = audioGenerationSchema.safeParse(
      tts({
        modelId: "qwen-audio-3-tts",
        advanced: { ...ADVANCED_DEFAULTS, sampleRate: "44.1 kHz" },
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["advanced", "sampleRate"]);
    }
  });
});

describe("voice change", () => {
  const base = { mode: "voice-change" as const, modelId: "elevenlabs-v3" };

  it("needs both a voice and a clip", () => {
    expect(
      audioGenerationSchema.safeParse({
        ...base,
        voice: file("v.wav"),
        clip: file("c.mp4"),
      }).success,
    ).toBe(true);
  });

  it("reports the missing one by path", () => {
    const result = audioGenerationSchema.safeParse({
      ...base,
      voice: null,
      clip: file("c.mp4"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["voice"]);
    }
  });

  it("rejects when both are missing", () => {
    expect(
      audioGenerationSchema.safeParse({ ...base, voice: null, clip: null })
        .success,
    ).toBe(false);
  });
});

describe("translate", () => {
  it("needs a clip and a known language", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        modelId: "seed-speech",
        clip: file("c.mp4"),
        language: "es",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing clip", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        modelId: "seed-speech",
        clip: null,
        language: "es",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown language", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        modelId: "seed-speech",
        clip: file("c.mp4"),
        language: "kl",
      }).success,
    ).toBe(false);
  });
});

describe("toAudioRequest", () => {
  it("projects files to metadata, because a File is not JSON", () => {
    const request = toAudioRequest(
      valid(tts({ attachments: [file("clip.wav")] })),
    );
    /* The point of the projection: the name survives JSON.stringify. */
    expect(JSON.stringify(request)).toContain("clip.wav");
    if (request.mode === "tts") {
      expect(request.attachments).toEqual([
        { name: "clip.wav", size: 1, type: "audio/wav" },
      ]);
    }
  });

  it("tags every arm with kind: audio for the endpoint to switch on", () => {
    expect(toAudioRequest(valid(tts())).kind).toBe("audio");
    expect(
      toAudioRequest(
        valid({
          mode: "voice-change",
          modelId: "elevenlabs-v3",
          voice: file("v.wav"),
          clip: file("c.mp4"),
        }),
      ).kind,
    ).toBe("audio");
  });

  it("keeps the mode so the service can branch on it", () => {
    expect(toAudioRequest(valid(tts())).mode).toBe("tts");
  });
});

describe("ttsDefaults", () => {
  it("produces values the schema already accepts", () => {
    const defaults = ttsDefaults("seed-audio-1");
    /* Empty script, so it is deliberately invalid until typed into. */
    expect(defaults.script).toBe("");
    expect(defaults.batch).toBe(1);
    expect(
      audioGenerationSchema.safeParse({ ...defaults, script: "Hello." })
        .success,
    ).toBe(true);
  });

  it("picks a sample rate the chosen model actually supports", () => {
    /* Qwen tops out at 24 kHz, which is also the global default. */
    expect(ttsDefaults("qwen-audio-3-tts").advanced.sampleRate).toBe("24 kHz");
    /* MiniMax has no 16 kHz, so the default must not fall through to it. */
    const minimax = ttsDefaults("minimax-speech-2-8-hd");
    expect(["24 kHz", "44.1 kHz"]).toContain(minimax.advanced.sampleRate);
    expect(
      audioGenerationSchema.safeParse({ ...minimax, script: "Hello." }).success,
    ).toBe(true);
  });
});
