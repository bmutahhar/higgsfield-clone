/*
 * The audio surface's catalogue.
 *
 * Model names are the ones the live surface offers; the one-line descriptions
 * are ours. Rates are ours too — the reference's cost is not linear in script
 * length (13 characters priced 0.1 and 17 priced 0.3 on one model), so there
 * is no rule there to copy. Keeping the number here means correcting it later
 * is one edit rather than a hunt.
 */

export type AudioMode = "tts" | "voice-change" | "translate";

export interface AudioModel {
  id: string;
  name: string;
  description: string;
  /** Credits per generated clip. Multiplied by batch — see `lib/audio-cost.ts`. */
  rate: number;
  /** Not every model renders at every rate; the schema enforces the pairing. */
  sampleRates: readonly string[];
}

export const SAMPLE_RATES = ["16 kHz", "24 kHz", "44.1 kHz"] as const;
export const OUTPUT_FORMATS = ["MP3", "WAV", "AAC"] as const;

export const AUDIO_MODELS: readonly AudioModel[] = [
  {
    id: "seed-audio-1",
    name: "Seed Audio 1.0",
    description: "Multi-speaker scenes with speech and ambience",
    rate: 0.3,
    sampleRates: SAMPLE_RATES,
  },
  {
    id: "elevenlabs-v3",
    name: "ElevenLabs v3",
    description: "Emotion and delivery control via inline tags",
    rate: 0.15,
    sampleRates: SAMPLE_RATES,
  },
  {
    id: "qwen-audio-3-tts",
    name: "Qwen Audio 3.0 TTS",
    description: "Natural speech with voice, style and emotion control",
    rate: 0.15,
    sampleRates: ["16 kHz", "24 kHz"],
  },
  {
    id: "minimax-speech-2-8-hd",
    name: "MiniMax Speech 2.8 HD",
    description: "High-fidelity single-voice narration",
    rate: 0.15,
    sampleRates: ["24 kHz", "44.1 kHz"],
  },
  {
    id: "seed-speech",
    name: "Seed Speech",
    description: "Multilingual speech across 30+ languages",
    rate: 0.15,
    sampleRates: SAMPLE_RATES,
  },
];

export const DEFAULT_AUDIO_MODEL_ID = "seed-audio-1";

/** `undefined` rather than a throw: a stale saved draft should degrade. */
export function audioModelById(id: string): AudioModel | undefined {
  return AUDIO_MODELS.find((model) => model.id === id);
}

/** The two secondary tabs are single-job, so their cost does not scale. */
export const FLAT_RATE: Record<"voice-change" | "translate", number> = {
  "voice-change": 0.2,
  translate: 0.4,
};

export const AUDIO_TABS: readonly { id: AudioMode; label: string }[] = [
  { id: "tts", label: "Text to Speech" },
  { id: "voice-change", label: "Voice Change" },
  { id: "translate", label: "Translate" },
];

export const LANGUAGES = [
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "es", name: "Spanish", flag: "🇪🇸" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "de", name: "German", flag: "🇩🇪" },
  { id: "it", name: "Italian", flag: "🇮🇹" },
  { id: "pt", name: "Portuguese", flag: "🇧🇷" },
  { id: "ja", name: "Japanese", flag: "🇯🇵" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "zh", name: "Chinese", flag: "🇨🇳" },
  { id: "hi", name: "Hindi", flag: "🇮🇳" },
  { id: "ar", name: "Arabic", flag: "🇸🇦" },
] as const;

/**
 * The voices a generation can be attributed to.
 *
 * History rows lead with the voice, not the script — which means a generation
 * needs a voice identity even before voice cloning exists as a surface.
 *
 * The avatar is a gradient pair rather than an image: it renders from two hex
 * values, needs no hosting, and cannot 404. Swap it for a real portrait when
 * there are real voices to portray.
 */
export interface Voice {
  id: string;
  name: string;
  /** Shown under the name in the picker; not in the history row. */
  register: string;
  /** `[from, to]`, painted as a 135° linear gradient. */
  avatar: readonly [string, string];
}

export const VOICES: readonly Voice[] = [
  {
    id: "rowan",
    name: "Rowan",
    register: "Male voice",
    avatar: ["#4ade80", "#0f9d58"],
  },
  {
    id: "marisol",
    name: "Marisol",
    register: "Female voice",
    avatar: ["#a3e635", "#3f8f2e"],
  },
  {
    id: "ingrid",
    name: "Ingrid",
    register: "Female voice",
    avatar: ["#67e8f9", "#0e7490"],
  },
  {
    id: "caspian",
    name: "Caspian",
    register: "Male voice",
    avatar: ["#c4b5fd", "#6d28d9"],
  },
  {
    id: "nadia",
    name: "Nadia",
    register: "Female voice",
    avatar: ["#fda4af", "#be123c"],
  },
  {
    id: "bo",
    name: "Bo",
    register: "Neutral voice",
    avatar: ["#fcd34d", "#b45309"],
  },
];

export const DEFAULT_VOICE_ID = "rowan";

export function voiceById(id: string): Voice | undefined {
  return VOICES.find((voice) => voice.id === id);
}

export const MAX_BATCH = 4;
export const MAX_ATTACHMENTS = 3;
/** No visible limit on the reference; this is a sanity bound, not a counter. */
export const SCRIPT_MAX_LENGTH = 5000;
export const VOICE_DETAILS_MAX_LENGTH = 500;

export interface AdvancedValues {
  /** 0–10, the expression intensity slider. */
  intensity: number;
  /** −1 (Angry) … 0 (Neutral) … 1 (Happy). */
  mood: number;
  speed: number;
  pitch: number;
  volume: number;
  outputFormat: string;
  sampleRate: string;
  saveSettings: boolean;
}

export const ADVANCED_DEFAULTS: AdvancedValues = {
  intensity: 5,
  mood: 0,
  speed: 1,
  pitch: 0,
  volume: 100,
  outputFormat: "MP3",
  sampleRate: "24 kHz",
  saveSettings: false,
};

/** Bounds for the sliders, in one place so the UI cannot drift from the schema. */
export const AUDIO_RANGES = {
  intensity: { min: 0, max: 10, step: 1 },
  mood: { min: -1, max: 1, step: 0.01 },
  speed: { min: 0.5, max: 2, step: 0.1 },
  pitch: { min: -12, max: 12, step: 1 },
  volume: { min: 0, max: 200, step: 5 },
} as const;
