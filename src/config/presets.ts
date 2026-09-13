import type { GenjutsuMode } from "@/config/genjutsu";

/**
 * Preset fixtures for the Motion Library.
 *
 * Two sources with different affordances: first-party presets are curated and
 * have no overflow menu, community presets are user-submitted and can be
 * reported. That difference is the `source` discriminator, not a pile of
 * booleans on the card.
 *
 * Posters are real remote stills. Hover playback cycles a small pool of clips
 * rather than pairing one per card: the origin stores a card's video under a
 * different id than its poster, and there is no way to derive one from the
 * other without the API. Every card therefore always has a poster, and
 * `video` is best-effort — `PresetCard` falls back to the still.
 */

export type PresetSource = "higgsfield" | "community";

export interface Preset {
  id: string;
  title: string;
  mode: GenjutsuMode;
  source: PresetSource;
  poster: string;
  video?: string;
  /** Reference stills shown as the variant switcher and in the lightbox. */
  variants: string[];
  prompt: string;
  model: string;
}

/** Shared clip pool — see the note above on why these are not 1:1 with posters. */
const CLIPS = [
  "https://static.higgsfield.ai/genjutsu/genjutsu-intro.mp4",
  "https://static.higgsfield.ai/genjutsu/replace.mp4",
  "https://static.higgsfield.ai/genjutsu/genjutsu-motion-transfer-intro.mp4",
  "https://static.higgsfield.ai/genjutsu/genjutsu-idea.mp4",
];

const HF =
  "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant";
const CM = "https://d8j0ntlcm91z4.cloudfront.net/community-presets";

/** Titles are ours; they label the fixture, they are not upstream metadata. */
const FIRST_PARTY: [string, string, GenjutsuMode][] = [
  ["54b6f52b-08b2-5acf-9557-2e599560acd8", "Crossing, recast", "swap"],
  ["c045b52b-ab93-5d96-8e2b-72115697cb50", "Runway, new label", "swap"],
  ["9650072f-7ed8-5c91-bc2f-edc3a30ba02e", "Stairwell descent", "motion"],
  ["e1db4f4b-3101-5151-91bf-a06be7a8a316", "Street walk, four ways", "motion"],
  ["1bc47dfd-2af0-509b-bd76-3896ec07bf3d", "Courtyard turn", "motion"],
  ["067a9f92-94b2-5e63-accf-2c57fe1a0cdf", "Product in hand", "swap"],
  ["f0ad452c-2254-54cb-932e-d85d0b06dca7", "Rooftop pacing", "motion"],
  ["d34e684b-0ed7-50fa-befb-d550e7a43881", "Lobby entrance", "swap"],
  ["24daa737-06d4-530d-b2ff-18f0eeb2c289", "Market crowd", "motion"],
  ["08edcef0-2205-5490-a4e3-014f32e77587", "Jacket change", "swap"],
  ["f32779dd-b4be-5f1d-ac1f-71f59b92d476", "Night platform", "motion"],
  ["167113f5-32ca-5c5f-ae3f-7f8e7599e964", "Hallway tracking", "motion"],
  ["80918ab3-d0cf-5c86-af99-29d53184edf0", "Café sit-down", "swap"],
  ["33ab59ac-cee3-57eb-95ce-5e754de9f021", "Bridge approach", "motion"],
];

const COMMUNITY: [string, string, GenjutsuMode][] = [
  ["7d8d7bd8-021e-4940-b643-3945e722e081", "Handoff on the corner", "swap"],
  ["e3383872-c80e-4e1c-9c8b-d1c4993888e1", "Studio spin", "motion"],
  ["387ab3cc-2982-43cc-95e7-c5ba532e875d", "Gallery walkthrough", "motion"],
  ["55c09c9f-6219-4082-a204-adc09474534b", "Doorway reveal", "swap"],
  ["92717bc3-c94e-43da-8ef7-b1f409036bd5", "Rain crossing", "motion"],
  ["a3c1a5c3-6e1f-4e74-b08c-24d0fa2cf0a0", "Bench conversation", "swap"],
  ["fd46a833-ed49-4b16-b132-a814596901ec", "Escalator ride", "motion"],
  ["5e0f05b8-6613-4a4c-84ad-a4abac57ea96", "Warehouse pan", "motion"],
  ["65fc429e-2b96-469e-bc04-a725084eecbd", "Kitchen counter", "swap"],
  ["39188150-8725-4108-b1c3-b3cd959bb4bd", "Dock at dusk", "motion"],
  ["3083a16f-ed2b-40be-b376-81d5a436049e", "Storefront pause", "swap"],
  ["79fd703a-2e94-474b-9cc4-f87adcd5320e", "Tunnel run", "motion"],
  ["f3d46004-40c6-4c4f-8d8a-78922d7efa75", "Balcony lean", "swap"],
  ["0fbbcdd3-4400-4e92-9380-951d64c8bb60", "Parking lot circle", "motion"],
];

const PROMPTS: Record<GenjutsuMode, string> = {
  motion:
    "Keep the camera move and the performer's timing exactly as filmed, then rebuild the scene around the references — new cast, new location, same beats.",
  swap: "Replace the scene location with the environment from my references and change the characters. Leave the framing, lighting and grade untouched.",
};

function build(
  rows: [string, string, GenjutsuMode][],
  base: string,
  source: PresetSource,
  ext: string,
): Preset[] {
  return rows.map(([id, title, mode], i) => {
    const poster = `${base}/${id}${ext}`;
    return {
      id,
      title,
      mode,
      source,
      poster,
      video: CLIPS[i % CLIPS.length],
      // The first thumbnail is the result, the second stands in for the source
      // clip, the third for an alternate take — matching the live switcher.
      variants: [
        poster,
        `${base}/${rows[(i + 1) % rows.length]?.[0]}${ext}`,
        `${base}/${rows[(i + 2) % rows.length]?.[0]}${ext}`,
      ],
      prompt: PROMPTS[mode],
      model:
        mode === "swap"
          ? "Higgsfield Genjutsu — Objects swap"
          : "Higgsfield Genjutsu — Motion transfer",
    };
  });
}

export const HIGGSFIELD_PRESETS = build(FIRST_PARTY, HF, "higgsfield", ".webp");
export const COMMUNITY_PRESETS = build(
  COMMUNITY,
  CM,
  "community",
  "/generation.webp",
);

export const PRESET_SOURCES = [
  { id: "higgsfield" as const, label: "Higgsfield", icon: "infinity" },
  { id: "community" as const, label: "Community", icon: "users" },
];

export function presetsFor(source: PresetSource): Preset[] {
  return source === "higgsfield" ? HIGGSFIELD_PRESETS : COMMUNITY_PRESETS;
}
