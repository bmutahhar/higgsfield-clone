import {
  ADVANCED_DEFAULTS,
  type AudioMode,
  audioModelById,
} from "@/config/audio";
import { HIGGSFIELD_PRESETS } from "@/config/presets";
import type { AudioSettings } from "@/schemas/audio-generation";

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
 * One pre-seeded generation.
 *
 * Carries the recipe that supposedly made it, exactly as the image and video
 * histories do, so a tile's Recreate has something real to load back into the
 * panel rather than an empty form.
 */
export interface AudioSeed {
  id: string;
  /** Audio file for speech, video file for the other two. */
  src: string;
  /** Video modes only: the still that holds the frame until the clip decodes. */
  poster?: string;
  /** Seconds — what sizes a waveform row before its file loads. */
  duration: number;
  /** 1×1 for speech, which has no frame; 3:4 for the video modes. */
  w: number;
  h: number;
  prompt: string;
  /** Text-to-speech only — history rows lead with the voice. */
  voiceId?: string;
  /** What produced it. Always a combination the panel could actually submit. */
  settings: AudioSettings;
  createdAt: number;
}

/**
 * A model from the catalogue, by id. Throws rather than falling back, so a
 * typo here fails at import instead of quietly crediting another model.
 */
function catalogue(id: string): string {
  if (!audioModelById(id)) {
    throw new Error(`Seeded audio history names an unknown model: ${id}`);
  }
  return id;
}

/** A speech recipe the schema would accept, with the model's own sample rate. */
function speechSettings(modelId: string): AudioSettings {
  const model = audioModelById(catalogue(modelId));
  return {
    mode: "tts",
    modelId,
    batch: 1,
    attachments: [],
    voiceDetails: "",
    advanced: {
      ...ADVANCED_DEFAULTS,
      sampleRate: (model?.sampleRates.includes(ADVANCED_DEFAULTS.sampleRate)
        ? ADVANCED_DEFAULTS.sampleRate
        : (model?.sampleRates[0] ?? ADVANCED_DEFAULTS.sampleRate)) as never,
      outputFormat: ADVANCED_DEFAULTS.outputFormat as never,
    },
  };
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

/*
 * One stamp per seeded entry, in the order they are listed. Spread across
 * several days so the speech tab's date grouping has more than one heading to
 * draw, and so the two video tabs are not all filed under the same afternoon.
 */
const STAMPS = [
  day("2026-09-12", 14),
  day("2026-09-12", 11),
  day("2026-09-10", 17),
  day("2026-09-06", 9),
  day("2026-09-12", 16),
  day("2026-09-11", 13),
  day("2026-09-08", 10),
  day("2026-09-12", 15),
  day("2026-09-09", 12),
  day("2026-09-05", 18),
];

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
const ENTRIES: Omit<AudioSeed, "createdAt">[] = [
  /* ---- Text to Speech: rows, grouped by day ---- */
  {
    id: "seed-tts-1",
    src: AUDIO_FIXTURES[0].url,
    duration: AUDIO_FIXTURES[0].duration,
    w: 1,
    h: 1,
    prompt:
      "The fog rolled in just after midnight, and the harbour went quiet.",
    voiceId: "marisol",
    settings: speechSettings("elevenlabs-v3"),
  },
  {
    id: "seed-tts-2",
    src: AUDIO_FIXTURES[1].url,
    duration: AUDIO_FIXTURES[1].duration,
    w: 1,
    h: 1,
    prompt: "Warm, calm male voice. Unhurried pace, slight gravel.",
    voiceId: "rowan",
    settings: speechSettings("seed-audio-1"),
  },
  {
    id: "seed-tts-3",
    src: AUDIO_FIXTURES[2].url,
    duration: AUDIO_FIXTURES[2].duration,
    w: 1,
    h: 1,
    prompt: "Chapter one. Everything I am about to tell you is true.",
    voiceId: "ingrid",
    settings: speechSettings("minimax-speech-2-8-hd"),
  },
  {
    id: "seed-tts-4",
    src: AUDIO_FIXTURES[3].url,
    duration: AUDIO_FIXTURES[3].duration,
    w: 1,
    h: 1,
    prompt: "Thanks for listening. We will be back on Thursday.",
    voiceId: "bo",
    settings: speechSettings("seed-speech"),
  },

  /* ---- Voice Change: a 3:4 video grid ---- */
  {
    id: "seed-vc-1",
    ...preset(0),
    duration: 8,
    ...VIDEO_FRAME,
    prompt: "Recast in Rowan",
    settings: {
      mode: "voice-change",
      modelId: catalogue("elevenlabs-v3"),
      voice: null,
      clip: null,
    },
  },
  {
    id: "seed-vc-2",
    ...preset(1),
    duration: 6,
    ...VIDEO_FRAME,
    prompt: "Recast in Marisol",
    settings: {
      mode: "voice-change",
      modelId: catalogue("seed-audio-1"),
      voice: null,
      clip: null,
    },
  },
  {
    id: "seed-vc-3",
    ...preset(2),
    duration: 11,
    ...VIDEO_FRAME,
    prompt: "Recast in Caspian",
    settings: {
      mode: "voice-change",
      modelId: catalogue("elevenlabs-v3"),
      voice: null,
      clip: null,
    },
  },

  /* ---- Translate: the same grid, different labels ---- */
  {
    id: "seed-tr-1",
    ...preset(3),
    duration: 9,
    ...VIDEO_FRAME,
    prompt: "Dubbed into Spanish",
    settings: {
      mode: "translate",
      modelId: catalogue("seed-speech"),
      clip: null,
      language: "es",
    },
  },
  {
    id: "seed-tr-2",
    ...preset(4),
    duration: 7,
    ...VIDEO_FRAME,
    prompt: "Dubbed into Japanese",
    settings: {
      mode: "translate",
      modelId: catalogue("seed-speech"),
      clip: null,
      language: "ja",
    },
  },
  {
    id: "seed-tr-3",
    ...preset(5),
    duration: 12,
    ...VIDEO_FRAME,
    prompt: "Dubbed into German",
    settings: {
      mode: "translate",
      modelId: catalogue("seed-speech"),
      clip: null,
      language: "de",
    },
  },
];

export const AUDIO_HISTORY: readonly AudioSeed[] = ENTRIES.map(
  (entry, index) => ({
    ...entry,
    /*
     * Stamped here rather than per entry so the dates stay in one list, and
     * fixed rather than offset from `Date.now()`: this history groups by
     * calendar day, and a date computed at module load is evaluated once on the
     * server and again in the browser — a request served either side of local
     * midnight would render two different headings.
     */
    createdAt: STAMPS[index % STAMPS.length],
  }),
);

/** The seed for one tab, newest first — the order the pane renders. */
export function audioSeedFor(mode: AudioMode): AudioSeed[] {
  return AUDIO_HISTORY.filter((entry) => entry.settings.mode === mode).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
