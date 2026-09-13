/*
 * The "Compare features" table, extracted from the live page by expanding
 * every section and reading the DOM.
 *
 * Stored as pipe-delimited text rather than object literals: it is ~125 rows
 * of four fields, and as objects it would be a 700-line file nobody reads. As
 * text it diffs one line per model when the catalogue moves, which is how this
 * data actually changes.
 *
 *   label | sublabel | basic | pro | max
 *
 * `YES` / `NO` render as a tick or a cross; anything else prints verbatim.
 *
 * This is a catalogue, not a design. It will drift from the live site as
 * models are added — re-extract rather than hand-patching rows.
 */

export interface ComparisonRow {
  label: string;
  sublabel?: string;
  values: string[];
}

export interface ComparisonSection {
  title: string;
  /** Video and Image share the wide table; the rest are separate cards. */
  layout: "table" | "card";
  rows: ComparisonRow[];
}

/** Measured: every section shows four rows, then "View More". */
export const VISIBLE_ROWS = 4;

const VIDEO = `
Concurrent Jobs||2 concurrent jobs|3 concurrent jobs|8 concurrent jobs
Seedance 2.0 720p|~22 credits/5s|Not included|320 videos|960 videos
Seedance 2.0 1080p|~45 credits/5s|Not included|160 videos|480 videos
Seedance 2.0 4K|~110 credits/5s|Not included|65 videos|196 videos
Seedance 2.0 Fast 720p|~17 credits/5s|82 videos|411 videos|1234 videos
Kling 3.0 720p|~7 credits/5s|192 videos|960 videos|2880 videos
Kling 3.0 1080p|~8 credits/5s|Not included|822 videos|2468 videos
Kling 3.0 4K|~30 credits/5s|Not included|240 videos|720 videos
Kling Omni 3 Image Reference 720p|~5 credits/5s|288 videos|1440 videos|4320 videos
Kling Omni 3 Image Reference 1080p|~7 credits/5s|192 videos|960 videos|2880 videos
Kling Omni 3 FLF 720p|~5 credits/5s|288 videos|1440 videos|4320 videos
Kling Omni 3 FLF 1080p|~6 credits/5s|230 videos|1152 videos|3456 videos
Grok Video|~7 credits/5s|192 videos|960 videos|2880 videos
Grok Video Edit|~10 credits/5s|144 videos|720 videos|2160 videos
Kling 2.6 Motion Control 720p|~5 credits/5s|288 videos|1440 videos|4320 videos
Kling 2.6 Motion Control 1080p|~7 credits/5s|192 videos|960 videos|2880 videos
Kling 3.0 Motion Control 720p|~7 credits/5s|Not included|960 videos|2880 videos
Kling 3.0 Motion Control 1080p|~12 credits/5s|Not included|576 videos|1728 videos
Kling Omni 1 720p|~7 credits/5s|192 videos|960 videos|2880 videos
Kling Omni 1 1080p|~10 credits/5s|144 videos|720 videos|2160 videos
Kling 2.6 with sound|~10 credits/5s|144 videos|720 videos|2160 videos
Kling 2.6 without sound|~5 credits/5s|288 videos|1440 videos|4320 videos
Wan 2.6 480p|~7 credits/5s|205 videos|1028 videos|3085 videos
Wan 2.6 720p|~13 credits/5s|110 videos|553 videos|1661 videos
Wan 2.6 1080p|~20 credits/5s|72 videos|360 videos|1080 videos
Wan 3.0 480p|5 credits/5s|288 videos|1440 videos|4320 videos
Wan 3.0 720p|8.75 credits/5s|164 videos|822 videos|2468 videos
Wan 3.0 1080p|17.5 credits/5s|82 videos|411 videos|1234 videos
Wan 3.0 Prime 480p|7.5 credits/5s|192 videos|960 videos|2880 videos
Wan 3.0 Prime 720p|15 credits/5s|96 videos|480 videos|1440 videos
Wan 3.0 Prime 1080p|30 credits/5s|48 videos|240 videos|720 videos
Seedance 1.5 480p|~1 credits/5s|960 videos|4800 videos|14400 videos
Seedance 1.5 720p|~3 credits/5s|480 videos|2400 videos|7200 videos
Seedance 1.5 1080p|~7 credits/5s|192 videos|960 videos|2880 videos
Higgsfield DoP Lite 720p|~3 credits/3s|480 videos|2400 videos|7200 videos
Higgsfield DoP Standard 720p|~7 credits/3s|205 videos|1028 videos|3085 videos
Higgsfield DoP Turbo 720p|~5 credits/3s|Not included|1440 videos|4320 videos
Sora 2 720p|~10 credits/4s|Not included|720 videos|2160 videos
Sora 2 Pro 720p|~30 credits/4s|Not included|240 videos|720 videos
Sora 2 Pro 1080p|~50 credits/4s|Not included|144 videos|432 videos
Sora 2 Max 720p|~14 credits/4s|Not included|514 videos|1542 videos
Sora 2 Max 1080p|~34 credits/4s|Not included|211 videos|635 videos
Sora 2 Pro Max 720p|~34 credits/4s|Not included|211 videos|635 videos
Sora 2 Pro Max 1080p|~54 credits/4s|Not included|133 videos|400 videos
Google Veo 3.1 Fast 720p|~11 credits/4s|Not included|654 videos|1963 videos
Google Veo 3.1 Fast 1080p|~11 credits/4s|Not included|654 videos|1963 videos
Google Veo 3.1 720p|~29 credits/4s|Not included|248 videos|744 videos
Google Veo 3.1 1080p|~29 credits/4s|Not included|248 videos|744 videos
Google Veo 3 Fast 720p|~22 credits/8s|Not included|327 videos|981 videos
Google Veo 3 720p|~58 credits/8s|Not included|124 videos|372 videos
Kling 2.5 Turbo 720p|~4 credits/5s|360 videos|1800 videos|5400 videos
Kling 2.5 Turbo 1080p|~6 credits/5s|240 videos|1200 videos|3600 videos
Kling 2.1 720p|~5 credits/5s|288 videos|1440 videos|4320 videos
Kling 2.1 1080p|~10 credits/5s|144 videos|720 videos|2160 videos
Kling 2.1 Master 1080p|~25 credits/5s|57 videos|288 videos|864 videos
Wan 2.2 Fast 720p|~5 credits/5s|288 videos|1440 videos|4320 videos
Wan 2.2 720p|~7 credits/5s|205 videos|1028 videos|3085 videos
Wan 2.5 Fast 720p|~9 credits/5s|160 videos|800 videos|2400 videos
Wan 2.5 Fast 1080p|~13 credits/5s|110 videos|553 videos|1661 videos
Wan 2.5 480p|~7 credits/5s|205 videos|1028 videos|3085 videos
Wan 2.5 720p|~13 credits/5s|110 videos|553 videos|1661 videos
Wan 2.5 1080p|~20 credits/5s|72 videos|360 videos|1080 videos
Minimax Hailuo 2.3 Fast 768p|~4 credits/6s|360 videos|1800 videos|5400 videos
Minimax Hailuo 2.3 Fast 1080p|~7 credits/6s|205 videos|1028 videos|3085 videos
Minimax Hailuo 2.3 768p|~6 credits/6s|240 videos|1200 videos|3600 videos
Minimax Hailuo 2.3 1080p|~10 credits/6s|144 videos|720 videos|2160 videos
Minimax Hailuo 02 Fast 512p|~3 credits/6s|480 videos|2400 videos|7200 videos
Minimax Hailuo 02 768p|~6 credits/6s|240 videos|1200 videos|3600 videos
Minimax Hailuo 02 1080p|~10 credits/6s|144 videos|720 videos|2160 videos
Seedance Pro Fast 720p|~4 credits/5s|360 videos|1800 videos|5400 videos
Seedance Pro Fast 1080p|~9 credits/5s|160 videos|800 videos|2400 videos
Seedance Pro 480p|~4 credits/5s|360 videos|1800 videos|5400 videos
Seedance Pro 720p|~8 credits/5s|180 videos|900 videos|2700 videos
Seedance Pro 1080p|~18 credits/5s|80 videos|400 videos|1200 videos
`;

const IMAGE = `
Concurrent Jobs||4 concurrent jobs|4 concurrent jobs|8 concurrent jobs
Nano Banana Pro|2 credit/image|720 images|3600 images|10800 images
Nano Banana Pro 4K|4 credits/image|Not included|1800 images|5400 images
Nano Banana 2|2 credit/image|720 images|3600 images|10800 images
Higgsfield Soul 2.0|0.12 credits/image|12000 images|60000 images|180000 images
Higgsfield Soul|0.25 credits/image|5760 images|28800 images|86400 images
Soul Inpaint|0.25 credits/image|Not included|28800 images|86400 images
Product Placement|0.25 credits/image|Not included|28800 images|86400 images
Higgsfield Popcorn|1.5 credits/image|960 images|4800 images|14400 images
Higgsfield Face Swap|~2 credits/image|720 images|3600 images|10800 images
Higgsfield Character Swap|~2 credits/image|720 images|3600 images|10800 images
Reve|0.25 credit/image|5760 images|28800 images|86400 images
Nano Banana|1 credit/image|1440 images|7200 images|21600 images
Banana Placement|1 credit/image|1440 images|7200 images|21600 images
Seedream|1 credit/image|1440 images|7200 images|21600 images
Wan 2.2|0.5 credits/image|2880 images|14400 images|43200 images
Flux Kontext|1.5 credits/image|960 images|4800 images|14400 images
Multi Reference|1.5 credits/image|960 images|4800 images|14400 images
GPT Image|1 credit/image|1440 images|7200 images|21600 images
FLUX.2 Pro|1 credits/image|1440 images|7200 images|21600 images
FLUX.2 Flex|3 credits/image|480 images|2400 images|7200 images
FLUX.2 Max|4 credits/image|Not included|1800 images|5400 images
`;

const LIPSYNC = `
Concurrent Jobs||2 concurrent jobs|3 concurrent jobs|8 concurrent jobs
Higgsfield Speak 2.0 720p|~14 credits/5s|Not included|514 videos|1542 videos
Google Veo 3 Fast w/audio 720p|~22 credits/8s|Not included|327 videos|981 videos
Google Veo 3 w/audio 720p|~58 credits/8s|Not included|124 videos|372 videos
Wan 2.5 Speak Fast 720p|~9 credits/5s|160 videos|800 videos|2400 videos
Wan 2.5 Speak Fast 1080p|~12 credits/5s|115 videos|576 videos|1728 videos
Wan 2.5 Speak 480p|~6 credits/5s|230 videos|1152 videos|3456 videos
Wan 2.5 Speak 720p|~12 credits/5s|115 videos|576 videos|1728 videos
Wan 2.5 Speak 1080p|~20 credits/5s|72 videos|360 videos|1080 videos
Kling Speak 720p|~2 credits/2s|Not included|3600 videos|10800 videos
Kling Speak 1080p|~4 credits/2s|Not included|1800 videos|5400 videos
Kling Lipsync 720p|~2 credits/5s|Not included|2880 videos|8640 videos
Infinite Talk 480p|~18 credits/5s|Not included|480 videos|1440 videos
Infinite Talk 720p|~12 credits/2s|Not included|600 videos|1800 videos
Sync Lipsync 3 4K 30FPS|~18 credits/2s|Not included|400 videos|1200 videos
`;

const CHARACTER = `
Concurrent Jobs||1 concurrent jobs|2 concurrent jobs|3 concurrent jobs
Max Generations Amount||Up to 48 generations|Up to 240 generations|Up to 720 generations
`;

const CREDITS = `
Credits||120|600|1800
Credit discount||Not included|Not included|Not included
`;

const ACCESS = `
Commercial use||YES|YES|YES
Fast-track generation||YES|YES|YES
Access to characters||YES|YES|YES
Start & End Frame control||NO|YES|YES
Higgsfield ads||YES|YES|YES
Higgsfield speak||NO|YES|YES
UGC builder||NO|YES|YES
Priority access to new models||NO|YES|YES
Priority access to new features||NO|YES|YES
`;

function parse(block: string): ComparisonRow[] {
  return block
    .trim()
    .split("\n")
    .map((line) => {
      const [label, sublabel, ...values] = line.split("|");
      return {
        label,
        ...(sublabel ? { sublabel } : {}),
        values,
      };
    });
}

export const COMPARISON: ComparisonSection[] = [
  { title: "Video", layout: "table", rows: parse(VIDEO) },
  { title: "Image", layout: "table", rows: parse(IMAGE) },
  { title: "Lipsync Studio", layout: "card", rows: parse(LIPSYNC) },
  { title: "Character", layout: "card", rows: parse(CHARACTER) },
  { title: "Credits & Usage", layout: "card", rows: parse(CREDITS) },
  { title: "Access & Features", layout: "card", rows: parse(ACCESS) },
];

/** Column headers, in order. Prices come from the plan matrix. */
export const COMPARISON_PLANS = ["basic", "pro", "max"] as const;
