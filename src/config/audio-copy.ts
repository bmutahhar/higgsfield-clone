import type { AudioMode } from "@/config/audio";

/** Which illustration a card carries. Drawn in `how-it-works-media.tsx`. */
export type AudioCardMedia = "voices" | "panel" | "swap" | "languages";

/*
 * The How-it-works copy, one entry per tab.
 *
 * Kept out of the component because it is content, not layout: changing a
 * headline should not mean opening a file full of container queries.
 *
 * Ours, not the reference's. The slots and their typography are the spec; the
 * strings are written here.
 */
export const AUDIO_COPY: Record<
  AudioMode,
  {
    headline: string;
    sub: string;
    cards: { title: string; body: string; media: AudioCardMedia }[];
  }
> = {
  tts: {
    headline: "Turn text into speech",
    sub: "Lifelike speech from any script, ready for your projects",
    cards: [
      {
        title: "Pick or clone a voice",
        body: "Choose a preset, clone your own, or pick a model",
        media: "voices",
      },
      {
        title: "Write, describe and generate",
        body: "Type your script, describe how it sounds, and create",
        media: "panel",
      },
    ],
  },
  "voice-change": {
    headline: "Swap the voice, keep the performance",
    sub: "Replace the voice and keep the delivery",
    cards: [
      {
        title: "Bring your own take",
        body: "Upload a clip and the voice you want it to carry",
        media: "swap",
      },
    ],
  },
  translate: {
    headline: "Your video, in any language",
    sub: "Translate and lip-sync a clip into a new language",
    cards: [
      {
        title: "One clip, many languages",
        body: "Pick a target language and keep the timing intact",
        media: "languages",
      },
    ],
  },
};
