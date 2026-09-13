import type { IconName } from "@/components/core/icon";

/**
 * Model catalogue for the generation surfaces. Names and capability figures
 * are the identifiers the live model picker lists; they drive the dropdown
 * rows and the per-model constraints on the settings pills.
 */
export interface GenModel {
  id: string;
  name: string;
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
    icon: "infinity",
    badge: "New",
    chips: ["1080p", "4s–20s"],
    featured: true,
    durations: [4, 5, 10, 20],
    resolutions: ["720p", "1080p"],
    credits: 60,
    listCredits: 95,
  },
  {
    id: "seedance-2-5-edit",
    name: "Seedance 2.5 Edit",
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
    icon: "chart-no-axes-column",
    chips: ["4K", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["1080p", "4K"],
    credits: 55,
  },
  {
    id: "seedance-2-0-fast",
    name: "Seedance 2.0 Fast",
    icon: "chart-no-axes-column",
    chips: ["720p", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["720p"],
    credits: 25,
  },
  {
    id: "seedance-2-0-mini",
    name: "Seedance 2.0 Mini",
    icon: "chart-no-axes-column",
    chips: ["720p", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["720p"],
    credits: 15,
  },
  {
    id: "minimax-h3",
    name: "MiniMax H3",
    icon: "waves",
    chips: ["2K", "1s–15s"],
    durations: [1, 5, 10, 15],
    resolutions: ["1080p", "2K"],
    credits: 38,
  },
  {
    id: "minimax-h3-max",
    name: "MiniMax H3 Max",
    icon: "waves",
    chips: ["768p", "5s–15s"],
    durations: [5, 10, 15],
    resolutions: ["768p"],
    credits: 30,
  },
  {
    id: "gemini-omni-flash",
    name: "Gemini Omni Flash 1.1",
    icon: "sparkle",
    chips: ["4K", "4s–15s"],
    durations: [4, 5, 10, 15],
    resolutions: ["1080p", "4K"],
    credits: 50,
  },
  {
    id: "gemini-omni-flash-extend",
    name: "Gemini Omni Flash 1.1 Extend",
    icon: "sparkle",
    chips: ["4K", "5s–16s"],
    durations: [5, 8, 16],
    resolutions: ["1080p", "4K"],
    credits: 58,
  },
];

export const IMAGE_MODELS: GenModel[] = [
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
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
    icon: "chart-no-axes-column",
    chips: ["2K", "Photoreal"],
    featured: true,
    resolutions: ["1K", "2K"],
    credits: 5,
  },
  {
    id: "flux-kontext",
    name: "Flux Kontext",
    icon: "layers",
    chips: ["2K", "Editing"],
    resolutions: ["1K", "2K"],
    credits: 4.5,
  },
  {
    id: "higgsfield-soul",
    name: "Higgsfield Soul 2.0",
    icon: "aperture",
    chips: ["2K", "Fashion"],
    resolutions: ["1K", "2K"],
    credits: 5.5,
  },
  {
    id: "topaz",
    name: "Topaz",
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
