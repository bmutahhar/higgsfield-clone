/*
 * Real Higgsfield media, served from their public CDN.
 *
 * Ported from the design system's assets/media.js, which shipped as an IIFE
 * assigning window.HF_MEDIA. Here it is a plain module with types.
 *
 * The binaries are not vendored — see the ASSETS section of the design
 * project's readme for how to localise them. Both hosts are allow-listed for
 * next/image in next.config.ts.
 */

const IMG =
  "https://higgsfield.ai/cdn-cgi/image/fit=scale-down,format=webp,onerror=redirect,width=1920,quality=85/https://cdn.higgsfield.ai/";

export function viral(id: string): string {
  return `${IMG}viral_hub/${id}.webp`;
}

export function card(id: string): string {
  return `${IMG}card/${id}.webp`;
}

export function clip(id: string): string {
  return `https://cdn.higgsfield.ai/card/${id}.mp4`;
}

export interface Preset {
  name: string;
  slug: string;
  poster: string;
}

export interface HeroCard {
  title: string;
  blurb: string;
  poster: string;
  video: string;
  href: string;
}

/** Viral-effect stills. Preset names are sentence case, as the brand voice specifies. */
export const PRESETS: Preset[] = [
  {
    name: "Floating fall",
    slug: "floating-fall",
    poster: viral("151664fa-7f7f-43d6-80fa-4683104a3c02"),
  },
  {
    name: "High flip",
    slug: "high-flip",
    poster: viral("95cd0d73-4f3c-40d1-ac0b-c8668a99440b"),
  },
  {
    name: "Burning man",
    slug: "burning-man",
    poster: viral("a1560137-597c-455a-be9e-9622cccf76a3"),
  },
  {
    name: "Studio slide",
    slug: "studio-slide",
    poster: viral("05201733-c72f-43ed-8393-8b8cea28b8ce"),
  },
  {
    name: "Incline",
    slug: "incline",
    poster: viral("30142c8a-46ee-4930-aca3-6fa5321dd84a"),
  },
  {
    name: "Act natural",
    slug: "act-natural",
    poster: viral("17cc1333-9822-442c-adaa-d208c59e3e01"),
  },
  {
    name: "Eyes in",
    slug: "eyes-in",
    poster: viral("5354ce11-c68c-45a0-8a97-5aab94f52833"),
  },
  {
    name: "Street colossus",
    slug: "street-colossus",
    poster: viral("5e67ff0a-60f7-4c0a-8ace-18c9bf3e5426"),
  },
  {
    name: "Melting",
    slug: "melting",
    poster: viral("6ecca888-1780-46ae-a86d-a05b69b2fe34"),
  },
  {
    name: "Wild ride",
    slug: "wild-ride",
    poster: viral("99aa3365-5ae0-4616-9722-ce0dc087607d"),
  },
  {
    name: "Cutout",
    slug: "cutout",
    poster: viral("b5c90864-c3c5-4b14-87a0-3739250fd00b"),
  },
  {
    name: "World morphing",
    slug: "world-morphing",
    poster: viral("0abb112e-068d-45e4-acea-9c8c44a16781"),
  },
  {
    name: "Smash and grab",
    slug: "smash-and-grab",
    poster: viral("4a2315f6-57e1-4378-82a5-598ddbbfbbcb"),
  },
  {
    name: "Selfception",
    slug: "selfception",
    poster: viral("495d9e85-0417-47d9-9e0a-722ace805852"),
  },
  {
    name: "Lacewalker",
    slug: "lacewalker",
    poster: viral("ef3dfc4c-a4c2-44a0-af27-d005bd1c319d"),
  },
];

/** Promo cards: full-bleed stills that cross-fade to muted looping mp4s. */
export const HERO: HeroCard[] = [
  {
    title: "Higgsfield AI Motion Designer",
    blurb: "ChatGPT can now do motion design in After Effects.",
    poster: card("a8d8030f-9cc9-47ad-a266-e0d3708d2126"),
    video: clip("8b8270cd-dc63-4a34-88e7-3277536987fb"),
    href: "https://higgsfield.ai/ai-motion-designer",
  },
  {
    title: "Higgsfield Effects",
    blurb: "Viral video presets now in ChatGPT, with free generations",
    poster: card("5fba4d2a-1023-4bd1-9d7a-e2faaf8a21d1"),
    video: clip("31293efb-7438-41c9-84cc-8bc820ce39b6"),
    href: "https://higgsfield.ai/effects",
  },
  {
    title: "Higgsfield Genjutsu",
    blurb: "One upload in. Endless new visions out.",
    poster: card("9c6affe8-03a8-4434-97ef-2fc476f7a71e"),
    video: clip("16eebc9a-8310-4f68-8a02-1e2e6f109169"),
    href: "https://higgsfield.ai/ai/video?model=genjutsu",
  },
  {
    title: "GPT Image 2.5 Sunburst",
    blurb: "Sharper edits with more natural light and texture",
    poster: card("f11a402b-0e0e-43cc-90e5-f6cc39352123"),
    video: clip("4da5ce4e-8483-4471-9564-0907b394d3e0"),
    href: "https://higgsfield.ai/mobile/image/gpt_image_2_5_sunburst",
  },
  {
    title: "HIGGSFIELD × GPT-6 ASTRA",
    blurb:
      "Turn a single prompt into a playable 3D game. Story, mechanics, and every asset included",
    poster: card("25341b90-c34e-4cc3-97d8-fa45c693f5b5"),
    video: clip("f155252f-83ad-46c3-b484-728f6292e00d"),
    href: "https://higgsfield.ai/gpt-astra",
  },
];
