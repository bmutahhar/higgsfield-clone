import type { IconName } from "@/components/core/icon";

/*
 * The /ai/image studio's catalogue.
 *
 * Model names, descriptions, badges and section order are transcribed from the
 * live picker, in the live order. The vendor logos are not redistributable, so
 * each model carries a Lucide stand-in chosen per vendor family — the tile is
 * brand-lime either way, which is what reads at 16px.
 */

export type ResolutionId = "1K" | "2K" | "4K";

export interface PriceTier {
  /** Struck through on the CTA. */
  list: number;
  /** Charged. */
  net: number;
}

export interface ImageModel {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  badge?: "New" | "Premium";
  resolutions: ResolutionId[];
  price: Record<ResolutionId, PriceTier>;
}

/*
 * Credits scale with resolution. The factors below reproduce the two figures
 * that could actually be read off the live CTA — GPT Image 2 at 2K is 8.5/6.5
 * and at 4K is 14/11 — so `tiers(8.5, 6.5)` is exact for that model. Every
 * other model's 2K figure is unverifiable from a zero-credit account and is
 * therefore a plausible stand-in, not a measurement.
 */
function tiers(list: number, net: number): Record<ResolutionId, PriceTier> {
  const half = (n: number) => Math.round(n * 2) / 2;
  return {
    "1K": { list: half(list * 0.7), net: half(net * 0.7) },
    "2K": { list, net },
    "4K": { list: Math.round(list * 1.69), net: Math.round(net * 1.69) },
  };
}

const ALL_RES: ResolutionId[] = ["1K", "2K", "4K"];
const UP_TO_2K: ResolutionId[] = ["1K", "2K"];

export const IMAGE_MODELS: ImageModel[] = [
  {
    id: "higgsfield-soul-2",
    name: "Higgsfield Soul 2.0",
    description: "Next generation ultra-realistic fashion visuals",
    icon: "aperture",
    resolutions: ALL_RES,
    price: tiers(9, 7),
  },
  {
    id: "higgsfield-soul-cinema",
    name: "Higgsfield Soul Cinema",
    description: "Cinema-grade visual creation",
    icon: "aperture",
    resolutions: ALL_RES,
    price: tiers(11, 8.5),
  },
  {
    id: "gpt-image-2-5-sunburst",
    name: "GPT Image 2.5 Sunburst",
    description: "Exceptional quality, precise edits",
    icon: "sparkle",
    badge: "New",
    resolutions: ALL_RES,
    price: tiers(12, 9),
  },
  {
    id: "gpt-image-2-5-flare",
    name: "GPT Image 2.5 Flare",
    description: "Stunning everyday images, fast",
    icon: "sparkle",
    badge: "New",
    resolutions: ALL_RES,
    price: tiers(7, 5.5),
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    description: "4K images with near-perfect text rendering",
    icon: "sparkle",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(8.5, 6.5),
  },
  {
    id: "seedream-5-pro",
    name: "Seedream 5.0 Pro",
    description:
      "Logically consistent images with intelligent visual reasoning",
    icon: "chart-no-axes-column",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(10, 7.5),
  },
  {
    id: "seedream-5-lite",
    name: "Seedream 5.0 lite",
    description: "Intelligent visual reasoning",
    icon: "chart-no-axes-column",
    resolutions: UP_TO_2K,
    price: tiers(5, 4),
  },
  {
    id: "seedream-4-5",
    name: "Seedream 4.5",
    description: "ByteDance's next-gen 4K image model",
    icon: "chart-no-axes-column",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(8, 6),
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Google's flagship generation model",
    icon: "banana",
    resolutions: ALL_RES,
    price: tiers(9.5, 7.5),
  },
  {
    id: "nano-banana-2",
    name: "Nano Banana 2",
    description: "Pro quality at Flash speed",
    icon: "banana",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(6, 4.5),
  },
  {
    id: "nano-banana-2-lite",
    name: "Nano Banana 2 Lite",
    description: "Lightweight image generation at speed",
    icon: "banana",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(4, 3),
  },
  {
    id: "recraft-v4-1",
    name: "Recraft V4.1",
    description: "Photorealistic and expressive image generation",
    icon: "pen-tool",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(8, 6),
  },
  {
    id: "auto",
    name: "Auto",
    description: "The best model for any prompt, chosen for you",
    icon: "wand-sparkles",
    resolutions: ALL_RES,
    price: tiers(7, 5.5),
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    description: "Google's standard generation model",
    icon: "banana",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(5, 4),
  },
  {
    id: "higgsfield-soul",
    name: "Higgsfield Soul",
    description: "Ultra-realistic fashion visuals",
    icon: "aperture",
    resolutions: UP_TO_2K,
    price: tiers(7, 5.5),
  },
  {
    id: "higgsfield-face-swap",
    name: "Higgsfield Face Swap",
    description: "Seamless face swapping",
    icon: "scan-face",
    resolutions: UP_TO_2K,
    price: tiers(4, 3),
  },
  {
    id: "higgsfield-character-swap",
    name: "Higgsfield Character Swap",
    description: "Seamless character swapping",
    icon: "scan-face",
    resolutions: UP_TO_2K,
    price: tiers(4.5, 3.5),
  },
  {
    id: "seedream-4",
    name: "Seedream 4.0",
    description: "ByteDance's advanced image editing model",
    icon: "chart-no-axes-column",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(6, 4.5),
  },
  {
    id: "gpt-image-1-5",
    name: "GPT Image 1.5",
    description: "True-color precision rendering",
    icon: "sparkle",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(7.5, 6),
  },
  {
    id: "grok-imagine",
    name: "Grok Imagine",
    description: "Versatile image styles by xAI",
    icon: "zap",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(5.5, 4.5),
  },
  {
    id: "grok-imagine-2",
    name: "Grok Imagine 2.0",
    description: "High-resolution image generation by xAI",
    icon: "zap",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(8, 6.5),
  },
  {
    id: "recraft-v4-1-utility",
    name: "Recraft V4.1 Utility",
    description: "Simple scenes with flat, even lighting",
    icon: "pen-tool",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(5, 4),
  },
  {
    id: "recraft-v4-styles",
    name: "Recraft V4 Styles",
    description: "Generate consistently in the style of your references",
    icon: "pen-tool",
    badge: "New",
    resolutions: UP_TO_2K,
    price: tiers(6, 4.5),
  },
  {
    id: "z-image",
    name: "Z-Image",
    description: "Instant lifelike portraits",
    icon: "scan-face",
    resolutions: UP_TO_2K,
    price: tiers(3.5, 2.5),
  },
  {
    id: "kling-o1",
    name: "Kling O1",
    description: "Kling's Photorealistic Image Model",
    icon: "orbit",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(9, 7),
  },
  {
    id: "flux-2-pro",
    name: "FLUX.2 Pro",
    description: "Speed-optimized detail",
    icon: "layers",
    resolutions: UP_TO_2K,
    price: tiers(6, 4.5),
  },
  {
    id: "flux-2-flex",
    name: "FLUX.2 Flex",
    description: "Next-gen image generation",
    icon: "layers",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(8, 6),
  },
  {
    id: "flux-2-max",
    name: "FLUX.2 Max",
    description: "Ultimate precision and speed",
    icon: "layers",
    badge: "Premium",
    resolutions: ALL_RES,
    price: tiers(11, 8.5),
  },
  {
    id: "flux-kontext-max",
    name: "Flux Kontext Max",
    description: "Edit with accuracy",
    icon: "layers",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(7, 5.5),
  },
  {
    id: "gpt-image",
    name: "GPT Image",
    description: "Versatile text-to-image AI",
    icon: "sparkle",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(6, 4.5),
  },
  {
    id: "multi-reference",
    name: "Multi Reference",
    description: "Multiple edits in one shot",
    icon: "images",
    badge: "Premium",
    resolutions: UP_TO_2K,
    price: tiers(7, 5.5),
  },
  {
    id: "wan-2-2",
    name: "WAN 2.2",
    description: "High-fidelity cinematic visuals",
    icon: "waves",
    resolutions: UP_TO_2K,
    price: tiers(5, 4),
  },
];

export interface ModelSection {
  label: string;
  icon: IconName;
  /** Model ids, in the order the live picker lists them. */
  models: string[];
}

/*
 * Two sections, and Recraft V4.1 genuinely appears in both — it is one model
 * listed twice, which is why membership is ids rather than a flag on the model.
 */
export const MODEL_SECTIONS: ModelSection[] = [
  {
    label: "Featured models",
    icon: "sparkles",
    models: [
      "higgsfield-soul-2",
      "higgsfield-soul-cinema",
      "gpt-image-2-5-sunburst",
      "gpt-image-2-5-flare",
      "gpt-image-2",
      "seedream-5-pro",
      "seedream-5-lite",
      "seedream-4-5",
      "nano-banana-pro",
      "nano-banana-2",
      "nano-banana-2-lite",
      "recraft-v4-1",
    ],
  },
  {
    label: "All models",
    icon: "image",
    models: [
      "auto",
      "nano-banana",
      "higgsfield-soul",
      "higgsfield-face-swap",
      "higgsfield-character-swap",
      "seedream-4",
      "gpt-image-1-5",
      "grok-imagine",
      "grok-imagine-2",
      "recraft-v4-1",
      "recraft-v4-1-utility",
      "recraft-v4-styles",
      "z-image",
      "kling-o1",
      "flux-2-pro",
      "flux-2-flex",
      "flux-2-max",
      "flux-kontext-max",
      "gpt-image",
      "multi-reference",
      "wan-2-2",
    ],
  },
];

export const DEFAULT_MODEL_ID = "gpt-image-2";

export function modelById(id: string): ImageModel {
  return IMAGE_MODELS.find((m) => m.id === id) ?? IMAGE_MODELS[0];
}

/** `Auto` has no ratio; the rest drive a proportionally drawn glyph. */
export interface AspectRatio {
  id: string;
  w?: number;
  h?: number;
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: "Auto" },
  { id: "1:1", w: 1, h: 1 },
  { id: "3:2", w: 3, h: 2 },
  { id: "2:3", w: 2, h: 3 },
  { id: "16:9", w: 16, h: 9 },
  { id: "9:16", w: 9, h: 16 },
  { id: "4:3", w: 4, h: 3 },
  { id: "3:4", w: 3, h: 4 },
  { id: "21:9", w: 21, h: 9 },
];

export interface DescribedOption {
  id: string;
  /* Lowercase on purpose: the option row is `capitalize`, exactly as upstream,
     so "fastest and cheapest" renders as "Fastest And Cheapest". */
  description: string;
}

export const QUALITIES: DescribedOption[] = [
  { id: "Low", description: "fastest and cheapest" },
  { id: "Medium", description: "balanced visuals" },
  { id: "High", description: "best visual fidelity" },
];

export const RESOLUTIONS: Record<ResolutionId, string> = {
  "1K": "1024px",
  "2K": "2048px",
  "4K": "4096px",
};

export interface IconOption {
  id: string;
  icon: IconName;
}

export const BACKGROUNDS: IconOption[] = [
  { id: "Auto", icon: "scan" },
  { id: "Opaque", icon: "square" },
  { id: "Transparent", icon: "grid-2x2" },
];

export const MAX_BATCH = 4;

/** Zoom index → columns. The zoom stop is the ceiling, not the final count. */
export const FEED_COLUMNS = [7, 6, 5, 4, 3];
export const DEFAULT_ZOOM = 3;

/*
 * Below this the tiles stop being worth looking at, so the chosen zoom gives
 * way to whatever the width allows — never fewer than two columns. It is what
 * reconciles every count observed live: 1728px at zoom 3 is 4 columns, 1440px
 * at zoom 2 is 5, 900px is 3 whatever the zoom, and 500px is 2.
 */
export const MIN_TILE_WIDTH = 240;
export const MIN_COLUMNS = 2;
