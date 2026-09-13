import { z } from "zod";

import {
  ADVANCED_DEFAULTS,
  AUDIO_MODELS,
  audioModelById,
  DEFAULT_DUB_MODEL_ID,
  LANGUAGES,
  MAX_ATTACHMENTS,
  MAX_BATCH,
  OUTPUT_FORMATS,
  SAMPLE_RATES,
  SCRIPT_MAX_LENGTH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";

/*
 * What the audio panel is allowed to submit.
 *
 * A discriminated union rather than one shape with everything optional: the
 * three tabs share almost no fields, and a flat schema would validate nothing
 * — `voice` would have to be optional for the two tabs that do not have it,
 * which is exactly the tab where it is required.
 *
 * Option lists are derived from the catalogue rather than restated, the same
 * contract `image-generation.ts` and `video-generation.ts` keep: a model added
 * in `config/audio.ts` is accepted here without a second edit, and one removed
 * there stops validating.
 */

const MODEL_IDS = AUDIO_MODELS.map((model) => model.id) as [
  string,
  ...string[],
];
const LANGUAGE_IDS = LANGUAGES.map((language) => language.id) as [
  string,
  ...string[],
];

const attachment = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Expected a file.",
);

const advancedSchema = z.object({
  intensity: z.number().min(0).max(10),
  mood: z.number().min(-1).max(1),
  speed: z.number().min(0.5).max(2),
  pitch: z.number().int().min(-12).max(12),
  volume: z.number().min(0).max(200),
  outputFormat: z.enum(OUTPUT_FORMATS),
  sampleRate: z.enum(SAMPLE_RATES),
  saveSettings: z.boolean(),
});

const ttsSchema = z.object({
  mode: z.literal("tts"),
  script: z
    .string()
    .trim()
    .min(1, "Write what the voice should say.")
    .max(
      SCRIPT_MAX_LENGTH,
      `Keep the script under ${String(SCRIPT_MAX_LENGTH)} characters.`,
    ),
  modelId: z.enum(MODEL_IDS),
  batch: z.number().int().min(1).max(MAX_BATCH),
  attachments: z
    .array(attachment)
    .max(MAX_ATTACHMENTS, `Up to ${String(MAX_ATTACHMENTS)} attachments.`),
  voiceDetails: z
    .string()
    .trim()
    .max(
      VOICE_DETAILS_MAX_LENGTH,
      `Keep voice details under ${String(VOICE_DETAILS_MAX_LENGTH)} characters.`,
    ),
  advanced: advancedSchema,
});

/*
 * `voice` and `clip` are nullable with a refinement rather than non-nullable
 * fields. The form legitimately holds `null` while someone is still attaching;
 * a non-nullable field would make the panel's resting state a type error.
 */
/*
 * These two tabs offer no model picker, but every generation still has to be
 * attributable — the store credits one, and history labels it. So the field is
 * present and defaulted rather than absent: a record with no model is a record
 * whose provenance is gone, and "the panel did not ask" is not the same as
 * "nothing produced it".
 */
const voiceChangeSchema = z.object({
  mode: z.literal("voice-change"),
  modelId: z.enum(MODEL_IDS),
  voice: attachment.nullable(),
  clip: attachment.nullable(),
});

const translateSchema = z.object({
  mode: z.literal("translate"),
  modelId: z.enum(MODEL_IDS),
  clip: attachment.nullable(),
  language: z.enum(LANGUAGE_IDS),
});

export const audioGenerationSchema = z
  .discriminatedUnion("mode", [ttsSchema, voiceChangeSchema, translateSchema])
  .superRefine((values, ctx) => {
    if (values.mode === "tts") {
      /*
       * Not every model renders at every rate. The panel swaps to a supported
       * one when you change model, so this is the backstop for a pairing the
       * UI should never have produced — a restored draft, most likely, since
       * the advanced panel can persist to localStorage.
       */
      const model = audioModelById(values.modelId);
      if (model && !model.sampleRates.includes(values.advanced.sampleRate)) {
        ctx.addIssue({
          code: "custom",
          path: ["advanced", "sampleRate"],
          message: `${model.name} does not render at ${values.advanced.sampleRate}.`,
        });
      }
      return;
    }

    if (values.mode === "voice-change") {
      if (!values.voice) {
        ctx.addIssue({
          code: "custom",
          path: ["voice"],
          message: "Pick a voice to use.",
        });
      }
      if (!values.clip) {
        ctx.addIssue({
          code: "custom",
          path: ["clip"],
          message: "Add the clip you want to change.",
        });
      }
      return;
    }

    if (!values.clip) {
      ctx.addIssue({
        code: "custom",
        path: ["clip"],
        message: "Add the clip you want to dub.",
      });
    }
  });

export type AudioGenerationValues = z.infer<typeof audioGenerationSchema>;
export type AdvancedFormValues = z.infer<typeof advancedSchema>;
export type TtsValues = Extract<AudioGenerationValues, { mode: "tts" }>;

/**
 * Distributes over a union instead of collapsing it.
 *
 * A bare `Omit<A | B, K>` flattens the union into a single object holding only
 * the keys both members share — which would turn the three audio modes into
 * one shapeless record and lose the `mode` narrowing entirely.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * A generation's recipe: everything the panel submitted except the script,
 * which the record carries in its own right.
 *
 * The same contract `ImageSettings` and `VideoSettings` keep, and derived from
 * the schema rather than restated — a field added above is a compile error at
 * every call site that builds one.
 *
 * Only the speech arm loses a key; the other two never had a script to drop.
 */
export type AudioSettings = DistributiveOmit<AudioGenerationValues, "script">;

/** The panel's opening state. Script is empty, so it starts invalid by design. */
export function ttsDefaults(modelId: string): TtsValues {
  const model = audioModelById(modelId);
  return {
    mode: "tts",
    script: "",
    modelId,
    batch: 1,
    attachments: [],
    voiceDetails: "",
    advanced: {
      ...ADVANCED_DEFAULTS,
      /*
       * Respect the model's own range rather than handing the schema a pairing
       * it will immediately reject.
       */
      sampleRate: (model?.sampleRates.includes(ADVANCED_DEFAULTS.sampleRate)
        ? ADVANCED_DEFAULTS.sampleRate
        : (model?.sampleRates[0] ??
          ADVANCED_DEFAULTS.sampleRate)) as AdvancedFormValues["sampleRate"],
      outputFormat:
        ADVANCED_DEFAULTS.outputFormat as AdvancedFormValues["outputFormat"],
    },
  };
}

/** Opening values for Voice Change. Both attachments start empty and required. */
export function voiceChangeDefaults(
  modelId: string = DEFAULT_DUB_MODEL_ID,
): Extract<AudioGenerationValues, { mode: "voice-change" }> {
  return { mode: "voice-change", modelId, voice: null, clip: null };
}

/** Opening values for Translate. */
export function translateDefaults(
  modelId: string = DEFAULT_DUB_MODEL_ID,
): Extract<AudioGenerationValues, { mode: "translate" }> {
  return { mode: "translate", modelId, clip: null, language: "en" };
}

/*
 * What actually goes over the wire.
 *
 * A `File` does not survive `JSON.stringify` — it serialises to `{}` — so the
 * request is a deliberate projection: the decisions, plus enough of the media
 * to describe it. A real backend would take the bytes as multipart and this
 * shape as its metadata part; the mock only ever needed the metadata.
 */
const fileMeta = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
});

export const audioGenerationRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("tts"),
    script: z.string().min(1),
    modelId: z.enum(MODEL_IDS),
    batch: z.number().int().min(1).max(MAX_BATCH),
    attachments: z.array(fileMeta).max(MAX_ATTACHMENTS),
    voiceDetails: z.string(),
    advanced: advancedSchema,
  }),
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("voice-change"),
    modelId: z.enum(MODEL_IDS),
    voice: fileMeta,
    clip: fileMeta,
  }),
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("translate"),
    modelId: z.enum(MODEL_IDS),
    clip: fileMeta,
    language: z.enum(LANGUAGE_IDS),
  }),
]);

export type AudioGenerationRequest = z.infer<
  typeof audioGenerationRequestSchema
>;

const meta = (file: File) => ({
  name: file.name,
  size: file.size,
  type: file.type,
});

/**
 * Narrow validated form values down to the request payload.
 *
 * Called only with values the schema accepted, which is what makes the
 * non-null assertions on `voice` and `clip` safe: the refinement above has
 * already rejected the null case for those two modes.
 */
export function toAudioRequest(
  values: AudioGenerationValues,
): AudioGenerationRequest {
  if (values.mode === "tts") {
    return {
      kind: "audio",
      mode: "tts",
      script: values.script,
      modelId: values.modelId,
      batch: values.batch,
      attachments: values.attachments.map(meta),
      voiceDetails: values.voiceDetails,
      advanced: values.advanced,
    };
  }

  if (values.mode === "voice-change") {
    return {
      kind: "audio",
      mode: "voice-change",
      modelId: values.modelId,
      voice: meta(values.voice!),
      clip: meta(values.clip!),
    };
  }

  return {
    kind: "audio",
    mode: "translate",
    modelId: values.modelId,
    clip: meta(values.clip!),
    language: values.language,
  };
}
