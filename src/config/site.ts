import type { IconName } from "@/components/core/icon";

/**
 * Content inventory for the landing page, mirroring the surfaces the live
 * higgsfield.ai home page lists. Product and model names are factual
 * identifiers; the one-line descriptors are kept short and in the brand voice
 * documented in the design system (declarative, sentence case, no emoji).
 */

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

/**
 * The header's full link inventory, in the order the live site lists it. The
 * row overflows horizontally rather than collapsing.
 */
export const PRIMARY_NAV: NavLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "Image", href: "/explore" },
  { label: "Video", href: "/video" },
  { label: "Audio", href: "/explore" },
  { label: "MCP", href: "/explore" },
  { label: "ChatGPT Plugin", href: "/explore", badge: "New" },
  { label: "Genjutsu", href: "/explore", badge: "New" },
  { label: "Effects", href: "/effects", badge: "Free" },
  { label: "Cinema Studio", href: "/explore" },
  { label: "Marketing Studio", href: "/explore" },
  { label: "Supercomputer", href: "/explore" },
  { label: "3D Jutsu", href: "/explore", badge: "New" },
  { label: "Edit", href: "/explore" },
  { label: "Academy", href: "/explore" },
  { label: "Community", href: "/explore" },
  { label: "Contests", href: "/explore" },
  { label: "Plugins", href: "/explore" },
  { label: "Canvas", href: "/explore" },
  { label: "Originals", href: "/explore" },
];

export interface ModelTile {
  name: string;
  blurb: string;
  icon: IconName;
  badge?: string;
  kind?: string;
}

export const MODEL_TILES: ModelTile[] = [
  {
    name: "Seedance 2.5",
    blurb: "The most advanced video model",
    icon: "chart-no-axes-column",
    badge: "Top",
    kind: "Video",
  },
  {
    name: "Nano Banana Pro",
    blurb: "Generate high-quality visuals",
    icon: "banana",
    kind: "Image",
  },
  {
    name: "Higgsfield Genjutsu",
    blurb: "One video, many versions",
    icon: "infinity",
    badge: "New",
  },
  {
    name: "MCP & CLI",
    blurb: "Turn Claude into a creative engine",
    icon: "asterisk",
  },
  {
    name: "Cinema Studio 4.0",
    blurb: "Create cinematic scenes effortlessly",
    icon: "clapperboard",
  },
  {
    name: "Supercomputer",
    blurb: "Agent powered by GPT-6 Astra",
    icon: "bot",
  },
];

export interface Showcase {
  title: string;
  blurb: string;
  cta: string;
  /** Index into PRESETS to slice media from. */
  offset: number;
  count?: number;
}

export const SHOWCASES: Showcase[] = [
  {
    title: "Seedance 2.5",
    blurb: "The most advanced AI video model",
    cta: "View all of Seedance 2.5",
    offset: 0,
  },
  {
    title: "GPT Image 2",
    blurb: "4K images with near-perfect text rendering.",
    cta: "View all of GPT Image 2",
    offset: 4,
  },
  {
    title: "Marketing Studio",
    blurb: "See what creators and brands are making with Marketing Studio.",
    cta: "View all of Marketing Studio",
    offset: 8,
  },
  {
    title: "Seedance 2.0",
    blurb: "Browse premium AI video generations from the Higgsfield community.",
    cta: "View all of Seedance 2.0",
    offset: 2,
  },
  {
    title: "Higgsfield Soul Cinema",
    blurb: "Explore the community gallery for Soul Cinema creations.",
    cta: "View all of Soul Cinema",
    offset: 6,
  },
  {
    title: "Higgsfield Soul 2.0",
    blurb:
      "A culture-native photo model built for fashion, aesthetics and creative expression.",
    cta: "View all of Soul 2.0",
    offset: 10,
  },
];

export const COMMUNITY_PROJECTS = [
  "Cully Hill Boys",
  "Red Flag",
  "Kok Boru",
  "Adiliada",
  "ONEIRIC",
  "ZEPHYR: Special",
  "HELL GRIND",
  "Melting Point",
];

/** The feature tag cloud above the footer. */
export const FEATURE_TAGS = [
  "Cinema Studio",
  "Visual Effects",
  "Higgsfield Soul",
  "Kling 2.1 Master",
  "Camera Controls",
  "Viral",
  "Action movements",
  "Commercial",
  "MiniMax Hailuo 02",
  "Seedance Pro",
  "Community",
  "Wan 2.2 Image",
  "Seedream 4.0",
  "Nano Banana",
  "Flux Kontext",
  "GPT Image",
  "Topaz",
  "Google Veo3",
  "Kling 2.5 Turbo",
  "Kling Avatars 2.0",
  "Claude MCP",
  "Wan 2.5",
  "Sora 2",
  "Sora 2 Presets",
  "Banana Placement",
  "Edit Image",
  "Multi Reference",
  "Upscale",
  "YouTube",
  "TikTok",
  "Instagram Reels",
  "YouTube Shorts",
  "Nano Banana Pro",
  "Kling o1",
  "Mixed Media Community",
  "Soul Presets",
  "Visual Effects Collection",
];

export const FOOTER_COLUMNS: { heading: string; items: string[] }[] = [
  {
    heading: "Create",
    items: [
      "AI Video",
      "AI Image",
      "Edit Image",
      "Inpaint",
      "Upscale",
      "Mixed Media",
      "AI Face Swap",
      "AI Influencer",
    ],
  },
  {
    heading: "Video models",
    items: [
      "Seedance 2.5",
      "Sora 2",
      "Kling 2.5 Turbo",
      "Google Veo3",
      "MiniMax Hailuo 02",
      "Wan 2.5",
    ],
  },
  {
    heading: "Image models",
    items: [
      "Nano Banana Pro",
      "GPT Image 2",
      "Seedream 4.0",
      "Flux Kontext",
      "Higgsfield Soul",
      "Topaz",
    ],
  },
  {
    heading: "Products",
    items: [
      "Cinema Studio",
      "Marketing Studio",
      "Supercomputer",
      "Canvas",
      "3D Jutsu",
      "Plugins",
      "MCP",
    ],
  },
  {
    heading: "Company",
    items: [
      "Enterprise",
      "Pricing",
      "Academy",
      "Community",
      "Contests",
      "Terms",
      "Privacy",
    ],
  },
];
