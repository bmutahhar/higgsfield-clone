import type { IconName } from "@/components/core/icon";

/**
 * Model catalogue for the generation surfaces. Names and capability figures
 * are the identifiers the live model picker lists; they drive the dropdown
 * rows and the per-model constraints on the settings pills.
 */
export interface GenModel {
  id: string;
  name: string;
  /**
   * One line of prose for surfaces that describe a model rather than list its
   * numbers — the header's hover menu. Transcribed from the live menu for the
   * models it lists; the rest are written from the model's own capabilities
   * and are descriptive, not quoted.
   */
  blurb: string;
  icon: IconName;
  badge?: "Top" | "New";
  /** Capability chips shown under the name. */
  chips: string[];
  featured?: boolean;
  /** Durations this model supports, in seconds. Video only. */
  durations?: number[];
  resolutions?: string[];
  credits: number;
  /** Pre-discount figure, struck through next to the charged amount. */
  listCredits?: number;
}

export const VIDEO_MODELS: GenModel[] = [
  {
    id: "seedance-2-5",
    name: "Seedance 2.5",
    blurb: "Create cinematic videos up to 30 seconds",
    icon: "chart-no-axes-column",
    badge: "Top",
    chips: ["1080p", "4s–30s"],
    featured: true,
    durations: [4, 5, 8, 10, 15, 30],
    resolutions: ["720p", "1080p"],
    credits: 45,
    listCredits: 80,
  },
  {
    id: "genjutsu",
    name: "Higgsfield Genjutsu",
    blurb: "Transfer motion or swap objects from a reference video",
    icon: "infinity",
    badge: "New",
    chips: ["1080p", "4s–30s"],
    featured: true,
    durations: [4, 5, 10, 20, 30],
    // The live quality menu offers all three for Genjutsu.
    resolutions: ["480p", "720p", "1080p"],
    credits: 60,
    listCredits: 95,
  },
  {
    id: "seedance-2-5-edit",
    name: "Seedance 2.5 Edit",
    blurb: "Recut and restyle a take you already have",
    icon: "chart-no-axes-column",
    badge: "Top",
    chips: ["480p–720p", "Edit Video", "Audio"],
    featured: true,
    durations: [4, 5, 8],
    resolutions: ["480p", "720p"],
    credits: 40,
  },
  {
    id: "seedance-2-0",
    name: "Seedance 2.0",
    blurb: "The previous generation, still at 4K",
    icon: "chart-no-axes-column",
    chips: ["4K", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["1080p", "4K"],
    credits: 55,
  },
  {
    id: "seedance-2-0-fast",
    name: "Seedance 2.0 Fast",
    blurb: "The same model, tuned for turnaround over detail",
    icon: "chart-no-axes-column",
    chips: ["720p", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["720p"],
    credits: 25,
  },
  {
    id: "seedance-2-0-mini",
    name: "Seedance 2.0 Mini",
    blurb: "The cheapest way to test a shot",
    icon: "chart-no-axes-column",
    chips: ["720p", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["720p"],
    credits: 15,
  },
  {
    id: "minimax-h3",
    name: "MiniMax H3",
    blurb: "Create 2K videos from text, keyframes, or multimodal references",
    icon: "waves",
    chips: ["2K", "5s–15s"],
    durations: [5, 10, 15],
    resolutions: ["1080p", "2K"],
    credits: 38,
  },
  {
    id: "minimax-h3-max",
    name: "MiniMax H3 Max",
    blurb: "Longer takes at a lower resolution",
    icon: "waves",
    chips: ["768p", "5s–15s"],
    durations: [5, 10, 15],
    resolutions: ["768p"],
    credits: 30,
  },
  {
    id: "gemini-omni-flash",
    name: "Gemini Omni Flash 1.1",
    blurb: "Generate and edit video from any input",
    icon: "sparkle",
    chips: ["4K", "3s–10s"],
    durations: [3, 5, 8, 10],
    resolutions: ["1080p", "4K"],
    credits: 50,
  },
  {
    id: "gemini-omni-flash-extend",
    name: "Gemini Omni Flash 1.1 Extend",
    blurb: "Carry an existing clip past its last frame",
    icon: "sparkle",
    chips: ["4K", "3s–10s"],
    durations: [3, 5, 8, 10],
    resolutions: ["1080p", "4K"],
    credits: 58,
  },
  {
    id: "kling-3",
    name: "Kling 3.0",
    blurb: "Cinematic videos with audio",
    icon: "orbit",
    chips: ["4K", "3s–15s"],
    durations: [3, 5, 10, 15],
    resolutions: ["1080p", "4K"],
    credits: 52,
  },
  {
    id: "kling-3-motion-control",
    name: "Kling 3.0 Motion Control",
    blurb: "Transfer motion from video to image",
    icon: "orbit",
    chips: ["1080p", "3s–30s"],
    durations: [3, 5, 10, 20, 30],
    resolutions: ["720p", "1080p"],
    credits: 62,
  },
  {
    id: "flux-3-video",
    name: "FLUX.3 Video",
    blurb: "Text, image, and video generation with synchronized audio",
    icon: "layers",
    chips: ["1080p", "5s–20s"],
    durations: [5, 10, 15, 20],
    resolutions: ["720p", "1080p"],
    credits: 48,
  },
  {
    id: "grok-imagine-1-5",
    name: "Grok Imagine 1.5",
    blurb: "Cinematic videos with synchronized audio",
    icon: "zap",
    chips: ["720p", "1s–15s"],
    durations: [1, 5, 10, 15],
    resolutions: ["720p"],
    credits: 20,
  },
];

export const IMAGE_MODELS: GenModel[] = [
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    blurb: "4K images with near-perfect text rendering",
    icon: "sparkle",
    badge: "Top",
    chips: ["4K", "Text rendering"],
    featured: true,
    resolutions: ["1K", "2K", "4K"],
    credits: 6.5,
    listCredits: 8.5,
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    blurb: "Best 4K image model ever",
    icon: "banana",
    badge: "New",
    chips: ["2K", "Fast"],
    featured: true,
    resolutions: ["1K", "2K"],
    credits: 4,
    listCredits: 6,
  },
  {
    id: "seedream-4",
    name: "Seedream 4.0",
    blurb: "Photoreal stills with strong prompt adherence",
    icon: "chart-no-axes-column",
    chips: ["2K", "Photoreal"],
    featured: true,
    resolutions: ["1K", "2K"],
    credits: 5,
  },
  {
    id: "flux-kontext",
    name: "Flux Kontext",
    blurb: "Edit an image by describing the change",
    icon: "layers",
    chips: ["2K", "Editing"],
    resolutions: ["1K", "2K"],
    credits: 4.5,
  },
  {
    id: "higgsfield-soul",
    name: "Higgsfield Soul 2.0",
    blurb: "A culture-native photo model for fashion and aesthetics",
    icon: "aperture",
    chips: ["2K", "Fashion"],
    resolutions: ["1K", "2K"],
    credits: 5.5,
  },
  {
    id: "topaz",
    name: "Topaz",
    blurb: "High-resolution upscaler",
    icon: "expand",
    chips: ["8K", "Upscale"],
    resolutions: ["4K", "8K"],
    credits: 3,
  },
];

export const ASPECT_RATIOS = [
  "Auto",
  "16:9",
  "9:16",
  "1:1",
  "4:3",
  "3:4",
  "21:9",
];
export const IMAGE_QUALITY = ["Low", "Medium", "High"];
export const BITRATES = ["Standard", "High", "Max"];

/**
 * Look up a video model by id. Returns undefined for an unknown id rather than
 * throwing or falling back: callers decide whether that is a bad URL to correct
 * or a validation failure to report.
 */
export function videoModelById(id: string): GenModel | undefined {
  /*
   * The live edit route spells its model `seedance_2_5_edit` while the rest of
   * the catalogue is hyphenated. Normalising here rather than adding a second
   * id means a pasted link resolves instead of silently falling back.
   */
  const normalised = id.replaceAll("_", "-");
  return VIDEO_MODELS.find((model) => model.id === normalised);
}

/** Resolution options on the Genjutsu form's Quality select. */
export const GENJUTSU_QUALITY = ["480p", "720p", "1080p"] as const;
export const GENJUTSU_QUALITY_DEFAULT = "720p";
