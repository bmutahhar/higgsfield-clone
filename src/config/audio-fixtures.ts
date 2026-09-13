import type { AudioMode } from "@/config/audio";
import { HIGGSFIELD_PRESETS } from "@/config/presets";

/*
 * Stand-in media for the audio surface, and the back catalogue the three
 * History tabs open with.
 *
 * Remote URLs rather than bundled files, matching the decision the video
 * fixtures already took: closest visual result, no repo weight. The accepted
 * risk is that they are another origin's and may rotate — which is why they
 * are all in this one module, and why the waveform is derived from the job id
 * rather than decoded from these bytes.
 */

export interface AudioFixture {
  url: string;
  /** Seconds. Read once from the file, not at runtime. */
  duration: number;
}

/** The pool the mock job service hands out for finished text-to-speech jobs. */
export const AUDIO_FIXTURES: readonly AudioFixture[] = [
  {
    url: "https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3",
    duration: 7.4,
  },
  {
    url: "https://cdn.freesound.org/previews/459/459145_9159316-lq.mp3",
    duration: 5.1,
  },
  {
    url: "https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3",
    duration: 9.8,
  },
  {
    url: "https://cdn.freesound.org/previews/316/316847_5123451-lq.mp3",
    duration: 4.3,
  },
];

/**
 * One pre-seeded generation, in the three shapes the pane has to render.
 *
 * Deliberately *not* a `Generation`. This module describes the fixture; the
 * store decides how to turn it into a record, which keeps the seed data
 * readable and stops it from having to track every field the store's own type
 * grows.
 */
export interface AudioSeed {
  id: string;
  mode: AudioMode;
  modelId: string;
  /** Text-to-speech only — history rows lead with the voice. */
  voiceId?: string;
  /** The script for speech; a short label for the two video modes. */
  prompt: string;
  /** Audio file for speech, video file for the other two. */
  src: string;
  /** Video modes only: the still that holds the frame until the clip decodes. */
  poster?: string;
  duration: number;
  /** 1×1 for speech, which has no frame; 3:4 for the video modes. */
  w: number;
  h: number;
  createdAt: number;
}

/*
 * Fixed timestamps, not offsets from `Date.now()`.
 *
 * The history groups by calendar day, and a date computed at module load would
 * be evaluated once on the server and again in the browser — a request served
 * either side of local midnight would render one heading on the server and a
 * different one on the client, which is a hydration mismatch that only shows
 * up at night. Fixed dates cannot drift.
 */
const day = (iso: string, hour: number) =>
  new Date(`${iso}T${String(hour).padStart(2, "0")}:00:00Z`).getTime();

/** 3:4, measured off the reference's Voice Change and Translate tiles. */
const VIDEO_FRAME = { w: 3, h: 4 };

/** Borrowed from the video studio's catalogue, so no new URLs are introduced. */
const preset = (index: number) => {
  const entry = HIGGSFIELD_PRESETS[index % HIGGSFIELD_PRESETS.length];
  return { src: entry.video ?? entry.poster, poster: entry.poster };
};

/**
 * The back catalogue each History tab opens with when signed in.
 *
 * Every tab is seeded, because an empty History is the one state that tells a
 * reviewer nothing: it cannot show the row layout, the date grouping, or the
 * fact that the two video tabs render a grid rather than a list.
 */
export const AUDIO_SEED: readonly AudioSeed[] = [
  /* ---- Text to Speech: rows, grouped by day ---- */
  {
    id: "seed-tts-1",
    mode: "tts",
    modelId: "elevenlabs-v3",
    voiceId: "marisol",
    prompt:
      "The fog rolled in just after midnight, and the harbour went quiet.",
    src: AUDIO_FIXTURES[0].url,
    duration: AUDIO_FIXTURES[0].duration,
    w: 1,
    h: 1,
    createdAt: day("2026-09-12", 14),
  },
  {
    id: "seed-tts-2",
    mode: "tts",
    modelId: "seed-audio-1",
    voiceId: "rowan",
    prompt: "Warm, calm male voice. Unhurried pace, slight gravel.",
    src: AUDIO_FIXTURES[1].url,
    duration: AUDIO_FIXTURES[1].duration,
    w: 1,
    h: 1,
    createdAt: day("2026-09-12", 11),
  },
  {
    id: "seed-tts-3",
    mode: "tts",
    modelId: "minimax-speech-2-8-hd",
    voiceId: "ingrid",
    prompt: "Chapter one. Everything I am about to tell you is true.",
    src: AUDIO_FIXTURES[2].url,
    duration: AUDIO_FIXTURES[2].duration,
    w: 1,
    h: 1,
    createdAt: day("2026-09-10", 17),
  },
  {
    id: "seed-tts-4",
    mode: "tts",
    modelId: "seed-speech",
    voiceId: "bo",
    prompt: "Thanks for listening. We will be back on Thursday.",
    src: AUDIO_FIXTURES[3].url,
    duration: AUDIO_FIXTURES[3].duration,
    w: 1,
    h: 1,
    createdAt: day("2026-09-06", 9),
  },

  /* ---- Voice Change: a 3:4 video grid ---- */
  {
    id: "seed-vc-1",
    mode: "voice-change",
    modelId: "elevenlabs-v3",
    prompt: "Recast in Rowan",
    ...preset(0),
    duration: 8,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-12", 16),
  },
  {
    id: "seed-vc-2",
    mode: "voice-change",
    modelId: "seed-audio-1",
    prompt: "Recast in Marisol",
    ...preset(1),
    duration: 6,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-11", 13),
  },
  {
    id: "seed-vc-3",
    mode: "voice-change",
    modelId: "elevenlabs-v3",
    prompt: "Recast in Caspian",
    ...preset(2),
    duration: 11,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-08", 10),
  },

  /* ---- Translate: the same grid, different labels ---- */
  {
    id: "seed-tr-1",
    mode: "translate",
    modelId: "seed-speech",
    prompt: "Dubbed into Spanish",
    ...preset(3),
    duration: 9,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-12", 15),
  },
  {
    id: "seed-tr-2",
    mode: "translate",
    modelId: "seed-speech",
    prompt: "Dubbed into Japanese",
    ...preset(4),
    duration: 7,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-09", 12),
  },
  {
    id: "seed-tr-3",
    mode: "translate",
    modelId: "seed-speech",
    prompt: "Dubbed into German",
    ...preset(5),
    duration: 12,
    ...VIDEO_FRAME,
    createdAt: day("2026-09-05", 18),
  },
];

/** The seed for one tab, newest first — the order the pane renders. */
export function audioSeedFor(mode: AudioMode): AudioSeed[] {
  return AUDIO_SEED.filter((entry) => entry.mode === mode).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
