import type { IconName } from "@/components/core/icon";
import { AUDIO_MODELS } from "@/config/audio";
import {
  IMAGE_MODELS,
  type ImageModel,
  MODEL_SECTIONS,
} from "@/config/image-studio";
import { VIDEO_MODELS } from "@/config/models";

/*
 * The header's hover menus.
 *
 * Four nav items open one on the live site — Image, Video, Audio and Plugins.
 * Only the first two are built here, so only those two carry a menu; the rest
 * stay plain links.
 *
 * Each menu is two columns. The left one lists product surfaces and is
 * transcribed from the live panel verbatim, labels and one-liners both; rows
 * for surfaces this clone has not built carry no href and render inert, the
 * same treatment the nav row already gives them. The right one is NOT
 * transcribed — it is derived from the model catalogues, so every row is
 * guaranteed to resolve to a model the studio can actually select and the two
 * lists cannot drift apart.
 */

export interface NavMenuRow {
  label: string;
  blurb: string;
  icon: IconName;
  /**
   * Rendered as the live chip: lime for "New", hot pink for anything else.
   * The catalogue's own vocabulary is kept rather than remapped to the live
   * TOP/NEW pair, so a badge here always says what the model list says.
   */
  badge?: string;
  /** Omitted for surfaces this clone has not built — those rows render inert. */
  href?: string;
}

export interface NavMenuColumn {
  heading: string;
  rows: NavMenuRow[];
}

export interface NavMenu {
  /** Names the panel for assistive tech. */
  label: string;
  columns: NavMenuColumn[];
}

export type NavMenuId = "image" | "video" | "audio";

const IMAGE_FEATURES: NavMenuRow[] = [
  {
    label: "Create Image",
    blurb: "Generate AI images",
    icon: "image",
    href: "/ai/image",
  },
  {
    label: "Cinematic Cameras",
    blurb: "Image generation with camera controls",
    icon: "camera",
  },
  {
    label: "Canvas",
    blurb: "Visual ideation meets repeatable AI workflows.",
    icon: "frame",
  },
  {
    label: "Soul Moodboard",
    blurb: "Turn your references into a focused moodboard",
    icon: "layout-grid",
  },
  {
    label: "Soul ID Character",
    blurb: "Create unique character",
    icon: "user-round",
  },
  {
    label: "AI Influencer",
    blurb: "Create and manage your AI influencer",
    icon: "megaphone",
  },
  { label: "Photodump", blurb: "Generate Your Aesthetic", icon: "images" },
  {
    label: "Relight",
    blurb: "Adjust lighting position, color, and brightness",
    icon: "sun",
  },
  {
    label: "Inpaint",
    blurb: "Select an area, describe the change",
    icon: "paintbrush",
  },
  { label: "Image Upscale", blurb: "Enhance image quality", icon: "expand" },
  {
    label: "Face Swap",
    blurb: "Create Realistic Face Swaps",
    icon: "scan-face",
  },
  {
    label: "Character Swap",
    blurb: "Create Realistic Character Swaps",
    icon: "users-round",
  },
];

const VIDEO_FEATURES: NavMenuRow[] = [
  {
    label: "Create Video",
    blurb: "Generate AI videos",
    icon: "video",
    href: "/ai/video",
  },
  {
    label: "Cinema Studio",
    blurb: "Cinematic video with AI director",
    icon: "clapperboard",
  },
  {
    label: "Faceless Studio",
    blurb: "Start a faceless channel in one click",
    icon: "eye-off",
  },
  {
    label: "3D Jutsu",
    blurb: "Create 3D scenes and turn them into videos",
    icon: "box",
    badge: "New",
  },
  {
    label: "Shorts Studio",
    blurb: "Turn your footage into ready-made shorts",
    icon: "smartphone",
  },
  {
    label: "Higgsfield Explainer",
    blurb: "Turn any topic into an explainer video",
    icon: "presentation",
  },
  {
    label: "Canvas",
    blurb: "Visual ideation meets repeatable AI workflows.",
    icon: "frame",
  },
  {
    label: "Mixed Media",
    blurb: "Create mixed media projects",
    icon: "layers",
  },
  {
    label: "Edit Video",
    blurb: "Edit scenes, shots, elements",
    icon: "scissors",
  },
  {
    label: "Higgsfield Reframe",
    blurb: "Reframe and resize videos to any aspect ratio",
    icon: "crop",
  },
  {
    label: "Click to Ad",
    blurb: "Turn product URLs into video ads",
    icon: "link",
  },
  {
    label: "Change Color Palette",
    blurb: "Adjust color palette, tones, and overall mood",
    icon: "palette",
  },
  {
    label: "Relight",
    blurb: "Adjust lighting position, color, and brightness",
    icon: "sun",
  },
  { label: "Lipsync Studio", blurb: "Create Talking Clips", icon: "mic" },
  {
    label: "Draw to Video",
    blurb: "Sketch turns into a cinema",
    icon: "pencil",
  },
  {
    label: "Draw to Edit",
    blurb: "Sketch directly on video frames to guide edits",
    icon: "pen-tool",
  },
  {
    label: "UGC Factory",
    blurb: "Build UGC video with avatar",
    icon: "user-round",
  },
  { label: "Video Upscale", blurb: "Enhance video quality", icon: "expand" },
];

/*
 * The live menu lists the featured half of the catalogue rather than all of
 * it, which is exactly what `MODEL_SECTIONS[0]` already curates.
 */
const IMAGE_MODEL_ROWS: NavMenuRow[] = (MODEL_SECTIONS[0]?.models ?? [])
  .map((id) => IMAGE_MODELS.find((model) => model.id === id))
  .filter((model): model is ImageModel => model !== undefined)
  .map((model) => ({
    label: model.name,
    blurb: model.description,
    icon: model.icon,
    badge: model.badge,
    href: `/ai/image?model=${model.id}`,
  }));

const VIDEO_MODEL_ROWS: NavMenuRow[] = VIDEO_MODELS.map((model) => ({
  label: model.name,
  blurb: model.blurb,
  icon: model.icon,
  badge: model.badge,
  href: `/ai/video?model=${model.id}`,
}));

/*
 * The three audio tabs plus the surfaces around them. Each of the built three
 * deep-links straight to its own tab, which is what the live menu does — the
 * route reads the tab from the query string.
 */
const AUDIO_FEATURES: NavMenuRow[] = [
  {
    label: "Text to Speech",
    blurb: "Turn a script into lifelike speech",
    icon: "audio-lines",
    href: "/audio",
  },
  {
    label: "Voice Change",
    blurb: "Swap the voice and keep the performance",
    icon: "mic",
    href: "/audio?tab=voice-change",
  },
  {
    label: "Translate",
    blurb: "Dub a clip into another language",
    icon: "languages",
    href: "/audio?tab=translate",
  },
  {
    label: "Voice Cloning",
    blurb: "Build a reusable voice from a sample",
    icon: "user-round",
  },
  {
    label: "Sound Effects",
    blurb: "Generate ambience and one-shots",
    icon: "waves",
  },
];

/*
 * Derived from the catalogue rather than restated, the same way the video
 * column is: a model added in config/audio.ts appears here with no second
 * edit, and one removed stops being advertised.
 */
const AUDIO_MODEL_ROWS: NavMenuRow[] = AUDIO_MODELS.map((model) => ({
  label: model.name,
  blurb: model.description,
  icon: "audio-lines",
  href: "/audio",
}));

export const NAV_MENUS: Record<NavMenuId, NavMenu> = {
  image: {
    label: "Image",
    columns: [
      { heading: "Features", rows: IMAGE_FEATURES },
      { heading: "Models", rows: IMAGE_MODEL_ROWS },
    ],
  },
  video: {
    label: "Video",
    columns: [
      { heading: "Features", rows: VIDEO_FEATURES },
      { heading: "Models", rows: VIDEO_MODEL_ROWS },
    ],
  },
  audio: {
    label: "Audio",
    columns: [
      { heading: "Features", rows: AUDIO_FEATURES },
      { heading: "Models", rows: AUDIO_MODEL_ROWS },
    ],
  },
};
