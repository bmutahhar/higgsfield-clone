import type { IconName } from "@/components/core/icon";
import type { NavMenuId } from "@/config/nav-menus";

/**
 * Content inventory for the landing page, mirroring the surfaces the live
 * higgsfield.ai home page lists. Product and model names are factual
 * identifiers; the one-line descriptors are kept short and in the brand voice
 * documented in the design system (declarative, sentence case, no emoji).
 */

export interface NavLink {
  label: string;
  /** Omitted for surfaces this clone has not built — those render inert. */
  href?: string;
  badge?: string;
  /** Opens a hover panel of features and models. See `config/nav-menus.ts`. */
  menu?: NavMenuId;
}

/**
 * The header's full link inventory, in the order the live site lists it. The
 * row overflows horizontally rather than collapsing.
 */
/**
 * The header's link inventory, in the live order, with the live paths. On the
 * real site Explore IS the root — there is no /explore route. Entries without
 * an href are surfaces this clone has not built; they render inert rather than
 * linking to a 404.
 */
export const PRIMARY_NAV: NavLink[] = [
  { label: "Explore", href: "/" },
  { label: "Image", href: "/ai/image", menu: "image" },
  { label: "Video", href: "/ai/video", menu: "video" },
  { label: "Audio", href: "/audio", menu: "audio" },
  { label: "MCP" },
  { label: "ChatGPT Plugin", badge: "New" },
  { label: "Genjutsu", href: "/ai/video?model=genjutsu", badge: "New" },
  { label: "Effects", badge: "Free" },
  { label: "Cinema Studio" },
  { label: "Marketing Studio" },
  { label: "Supercomputer" },
  { label: "3D Jutsu", badge: "New" },
  { label: "Edit" },
  { label: "Academy" },
  { label: "Community" },
  { label: "Contests" },
  { label: "Plugins" },
  { label: "Canvas" },
  { label: "Originals" },
];

/**
 * The navigation that replaces the link row below `md`. The live site does not
 * shrink the row at that width, it drops it and hands navigation to five fixed
 * tabs at the foot of the screen, so this is its own inventory rather than a
 * slice of PRIMARY_NAV.
 *
 * Entries without an href are surfaces this clone has not built and render
 * inert, the same way the row treats them. The live create button opens
 * `/flow`, a creation hub with no equivalent here, so it points at the image
 * studio instead.
 */
export interface MobileTab {
  label: string;
  href?: string;
  icon: IconName;
  /** The lime create button at the centre of the bar. */
  primary?: boolean;
}

export const MOBILE_TABS: MobileTab[] = [
  { label: "Home", href: "/", icon: "house" },
  { label: "Community", icon: "users" },
  { label: "Generate", href: "/ai/image", icon: "sparkle", primary: true },
  { label: "Library", icon: "folder" },
  { label: "Profile", icon: "circle-user" },
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
