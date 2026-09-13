# Audio Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/audio` generation studio — three submitting forms, a waveform history pane, and the job plumbing behind them — at 1:1 parity with `higgsfield.ai/audio`.

**Architecture:** A new `(studio)` route renders a two-column shell: a 342px form panel whose body swaps between three tabs, and a bare right pane with History and How-it-works. All three forms validate against one Zod discriminated union and submit through the existing `/api/generations` endpoint, which gains an `audio` branch backed by the same stateless deadline-in-the-id job service image and video already use. Finished jobs land in the shared Zustand store and render as waveform tiles whose bar heights derive deterministically from the job id.

**Tech Stack:** Next 16 (App Router), React 19, Tailwind v4 (`@theme inline`), Zod 4, react-hook-form + `@hookform/resolvers`, TanStack Query 5, Zustand 5, Vitest 5 (node environment), `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-09-14-audio-studio-design.md` — read it alongside this plan. Every measured value cited here comes from it, and section references (§5.2, §6.3) point into it.

## Global Constraints

Copied verbatim from `CLAUDE.md` and the spec. Every task's requirements implicitly include this section.

- **Tailwind utilities are the only styling mechanism.** No inline `style` objects, no CSS modules, no styled-components. Inline `style` only for a genuinely dynamic value that cannot be a class — the slider fill percentage, the waveform played-split — **with a comment saying why**.
- **Never use React state for visual state.** Hover, press, focus, checked, open and disabled are CSS: `hover:`, `active:`, `focus-visible:`, `peer-checked:`, `group-hover:`, `data-[state=open]:`, `disabled:`.
- **Prefer the platform for control state.** A styled toggle is a real visually-hidden `<input>` plus `peer-checked:`, never a `<span>` with `onClick`. Every slider is a visually-hidden `<input type="range">` with the paint as siblings.
- **Token layer:** everything under `src/components/audio-studio/` and `src/app/(studio)/audio/` uses the studio `q-` layer **exclusively**. Never mix with marketing utilities (`bg-card`, `text-muted`, `rounded-card`, `text-h2`).
- **Token-name trap:** `--q-text-muted` is `#898a8b` and its utility is **`text-q-soft`**. `text-q-muted` is a different colour (`#828282`). Both appear on this page — see spec §4.1.
- **Filenames are kebab-case.** Tests are `*.test.ts`, types `*.types.ts`, constants `*.constants.ts`, server-only `*.server.ts`. Next.js reserved names (`page.tsx`, `layout.tsx`, `route.ts`) keep their required form.
- **No barrel files.** Import concrete paths. Use the `@/` alias for anything outside the current folder.
- **No cross-imports between feature folders.** `components/audio-studio/` must not import from `components/image-studio/` or `components/studio/`. Shared primitives are promoted to `components/forms/` or `components/ui/` first — Task 7 does exactly this.
- **Server components by default.** Add `"use client"` only for an actual hook or browser API.
- **`src/server/**` starts with `import "server-only";`**
- **Dependencies point downward:** `app/` → `features/` → `components/` → `lib/`. A `lib/` module must never import from `app/` or `components/`, must be pure, and must do no I/O.
- **Respect `motion-reduce:`** on anything that animates.
- **Commits:** imperative mood, explaining _why_. **Never** add a `Co-Authored-By:` trailer, "Generated with Claude Code", "🤖", or any AI attribution. Never pass `--author`, never alter `user.name` / `user.email`.
- Node >= 20.9.0, pnpm 10.33.3. No new runtime dependencies — everything this plan needs is already installed.

## A note on testing

`vitest.config.ts` runs in a **node** environment and includes **`src/**/*.test.ts` only — not `.tsx`**. That is a deliberate standing decision recorded in the config: jsdom plus React Testing Library is a larger dependency footprint than this demo justifies, and components are verified in the browser instead.

This plan honours that split rather than fighting it:

- **Tasks 1–6 are genuine TDD.** Tokens, config, the three pure `lib/` modules, the schema, the job service and the client service are all plain TypeScript. Every one gets a failing test first.
- **Tasks 7–15 are browser-verified.** Each ends with a scripted pass through the Browser pane against a numbered acceptance item from spec §15, plus `pnpm check`. The steps say exactly what to look at and what number to expect — "it looks right" is not a verification.

Do not add jsdom. Do not rename component files to `.test.tsx` hoping they run; they will be silently excluded.

Run the full gate with:

```bash
pnpm check
```

which is `lint && typecheck && test && format:check`.

## File structure

**New — pure modules and data (Tasks 1–6):**

| File                               | Responsibility                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/config/audio.ts`              | Models, credit rates, languages, output formats, sample rates, advanced defaults, limits, tab list |
| `src/config/audio-fixtures.ts`     | Remote clip URLs with durations, for the mock job service                                          |
| `src/lib/waveform.ts`              | Deterministic bar heights from a job id                                                            |
| `src/lib/audio-cost.ts`            | `rate(model) × batch`                                                                              |
| `src/lib/script-tokens.ts`         | `@`-mention serialise / parse                                                                      |
| `src/schemas/audio-generation.ts`  | The discriminated union and its request projection                                                 |
| `src/services/audio-generation.ts` | `requestAudioGeneration`                                                                           |

**New — components (Tasks 8–15), all under `src/components/audio-studio/`:**

| File                                                                | Responsibility                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| `audio-studio.tsx`                                                  | Composition root: tabs, model, submit flow, polling    |
| `audio-panel.tsx`                                                   | Left panel shell and its three tabs                    |
| `tts-form.tsx` / `voice-change-form.tsx` / `translate-form.tsx`     | One per tab                                            |
| `upload-zone.tsx`                                                   | The dashed drop zone, shared by all three tabs         |
| `script-field.tsx`                                                  | Script editor and `@` typeahead                        |
| `setting-row.tsx`                                                   | The `h-12` / `h-14` row primitive every setting reuses |
| `audio-model-popover.tsx` / `language-popover.tsx`                  | The two searchable listboxes                           |
| `advanced-settings.tsx` / `intensity-slider.tsx` / `mood-fader.tsx` | The disclosure and its two bespoke controls            |
| `audio-cta.tsx`                                                     | Generate button with credit cost                       |
| `audio-pane.tsx` / `audio-how-it-works.tsx` / `audio-history.tsx`   | The right column                                       |
| `waveform.tsx` / `waveform-tile.tsx`                                | History rendering and playback                         |
| `audio-sheet.tsx`                                                   | The `<md` full-screen shell                            |

**Modified:**

| File                                              | Change                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/styles/tokens/q-studio.css`                  | `--q-bg-section`, `--q-text-on-brand`, `.q-cta-audio`, five type ramps |
| `src/app/globals.css`                             | Project the above through `@theme inline`                              |
| `src/lib/cn.ts`                                   | Register the five new font sizes                                       |
| `src/types/generation.types.ts`                   | `PendingRequest` audio arm, `GenerationAsset.duration`                 |
| `src/server/generation-jobs.server.ts`            | `createAudioJobs`, `'a'` tag, widened `ID_PATTERN`                     |
| `src/app/api/generations/route.ts`                | Audio branch                                                           |
| `src/stores/generation-store.ts`                  | Carry `duration` onto the ready arm                                    |
| `src/config/site.ts`                              | Audio nav entry gains `href: "/audio"`                                 |
| `src/components/image-studio/batch-stepper.tsx`   | **Moves** to `components/forms/`, gains `max`                          |
| `src/components/image-studio/setting-popover.tsx` | **Moves** to `components/forms/`                                       |
| `src/components/image-studio/composer.tsx`        | Import rewrite for the two moves                                       |

---

### Task 1: Design tokens for the audio surface

**Files:**

- Modify: `src/styles/tokens/q-studio.css`
- Modify: `src/app/globals.css`
- Modify: `src/lib/cn.ts`
- Create: `src/styles/tokens/q-audio-tokens.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: utilities `bg-q-section`, `text-q-on-brand`, `.q-cta-audio`, and the font sizes `text-q-accent-2xl`, `text-q-heading-sm`, `text-q-body-lg`, `text-q-body-md`, `text-q-cta`.

Spec §4. A token can silently do nothing in three ways — declared but never projected, projected but not registered in `cn.ts`, or a near-duplicate of one that already exists. None produces a build error. The test covers all three, following `q-pricing-tokens.test.ts`.

- [ ] **Step 1: Write the failing test**

Create `src/styles/tokens/q-audio-tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const tokens = read("./q-studio.css");
const globals = read("../../app/globals.css");

describe("audio tokens", () => {
  it.each([
    ["--q-bg-section", "--color-q-section"],
    ["--q-text-on-brand", "--color-q-on-brand"],
  ])("declares %s and projects it as %s", (variable, projection) => {
    expect(tokens).toContain(`${variable}:`);
    expect(globals).toContain(`${projection}: var(${variable})`);
  });

  it.each([
    ["q-accent-2xl", "40px", "48px", "-1.6px", "700"],
    ["q-heading-sm", "24px", "28px", "-0.4px", "500"],
    ["q-body-lg", "18px", "28px", "normal", "500"],
    ["q-body-md", "16px", "24px", "normal", "500"],
    ["q-cta", "18px", "24px", "-0.4px", "600"],
  ])("projects text-%s at %s/%s", (name, size, line, tracking, weight) => {
    expect(globals).toContain(`--text-${name}: ${size}`);
    expect(globals).toContain(`--text-${name}--line-height: ${line}`);
    expect(globals).toContain(`--text-${name}--font-weight: ${weight}`);
    if (tracking !== "normal") {
      expect(globals).toContain(`--text-${name}--letter-spacing: ${tracking}`);
    }
  });

  /*
   * Registration in cn.ts. Without it tailwind-merge cannot tell a custom
   * font-size from a custom colour — both are `text-*` — and silently drops
   * one. Asserting the size survives beside a colour is the only way to see it.
   */
  it.each([
    "text-q-accent-2xl",
    "text-q-heading-sm",
    "text-q-body-lg",
    "text-q-body-md",
    "text-q-cta",
  ])("keeps %s when merged with a colour", (size) => {
    expect(cn(size, "text-q-soft")).toBe(`${size} text-q-soft`);
  });

  /* The CTA fill is a utility, not inline styles: it is two stacked gradients. */
  it("defines the audio CTA fill from existing brand tokens", () => {
    expect(tokens).toContain(".q-cta-audio");
    expect(tokens).toContain("var(--q-brand-lime-hi)");
  });

  /* Spec §4.1: --q-bg-plan keeps its name but stops holding its own literal. */
  it("makes --q-bg-plan an alias of --q-bg-section", () => {
    expect(tokens).toContain("--q-bg-plan: var(--q-bg-section)");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/styles/tokens/q-audio-tokens.test.ts`
Expected: FAIL — every assertion misses, starting with `--q-bg-section:`.

- [ ] **Step 3: Add the colour tokens and the CTA utility**

In `src/styles/tokens/q-studio.css`, inside the existing `:root` block, beside the other background tokens:

```css
/* The how-it-works cards. The pricing page measured this first and called it
     --q-bg-plan, but it is not a plan colour — it is the section surface. */
--q-bg-section: #18191c;
--q-text-on-brand: #1b1b1b; /* CTA ink. Not --q-text-inverse (#14151a). */
```

Then find the existing `--q-bg-plan: #18191c;` and change it to:

```css
--q-bg-plan: var(--q-bg-section);
```

At the end of the file, beside `.q-cta-fill`:

```css
/*
 * The audio CTA. Unlike `.q-cta-fill`'s radial wash this is two stacked
 * linear gradients: a vertical transparent-to-highlight pass over a flat
 * brand base, which is what gives it a lit top edge rather than a lit centre.
 */
.q-cta-audio {
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 20, 0) 0%,
      var(--q-brand-lime-hi) 100%
    ),
    linear-gradient(90deg, var(--q-brand) 0%, var(--q-brand) 100%);
  box-shadow:
    0 32px 24px 0 rgba(0, 0, 0, 0.15),
    0 6px 4px 0 rgba(0, 0, 0, 0.25);
}
```

- [ ] **Step 4: Project the tokens in `globals.css`**

In the `@theme inline` block, beside the other `--color-q-*` entries:

```css
--color-q-section: var(--q-bg-section);
--color-q-on-brand: var(--q-text-on-brand);
```

And beside the other `--text-q-*` ramps:

```css
--text-q-accent-2xl: 40px;
--text-q-accent-2xl--line-height: 48px;
--text-q-accent-2xl--letter-spacing: -1.6px;
--text-q-accent-2xl--font-weight: 700;
--text-q-heading-sm: 24px;
--text-q-heading-sm--line-height: 28px;
--text-q-heading-sm--letter-spacing: -0.4px;
--text-q-heading-sm--font-weight: 500;
--text-q-body-lg: 18px;
--text-q-body-lg--line-height: 28px;
--text-q-body-lg--font-weight: 500;
--text-q-body-md: 16px;
--text-q-body-md--line-height: 24px;
--text-q-body-md--font-weight: 500;
--text-q-cta: 18px;
--text-q-cta--line-height: 24px;
--text-q-cta--letter-spacing: -0.4px;
--text-q-cta--font-weight: 600;
```

- [ ] **Step 5: Register the font sizes in `cn.ts`**

In `src/lib/cn.ts`, append to the `FONT_SIZES` array after the pricing entries:

```ts
  // The audio surface. Same reasoning as every entry above.
  "q-accent-2xl",
  "q-heading-sm",
  "q-body-lg",
  "q-body-md",
  "q-cta",
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `pnpm vitest run src/styles/tokens/q-audio-tokens.test.ts`
Expected: PASS — 14 assertions.

- [ ] **Step 7: Confirm nothing else broke**

Run: `pnpm vitest run src/styles/tokens/`
Expected: PASS — the auth and pricing token tests still pass. `q-pricing-tokens.test.ts` asserts `--q-bg-plan` projects as `--color-q-ground`; aliasing its value does not change the projection, so it stays green. If it fails, the alias was written wrong.

- [ ] **Step 8: Commit**

```bash
git add src/styles/tokens/q-studio.css src/styles/tokens/q-audio-tokens.test.ts src/app/globals.css src/lib/cn.ts
git commit -m "Add the audio surface's tokens, and stop #18191c pretending to be a plan colour

The audio page needs five type ramps the q- layer did not have, and a CTA
fill that is two stacked gradients rather than the radial wash the video
studio uses.

It also needs #18191c, which the pricing page already declared under the
name --q-bg-plan. It was never a plan colour — it is the section surface,
and the audio how-it-works cards are the second thing to sit on it. Give
it its real name and leave the old one pointing at it, so no pricing
class has to change."
```

---

### Task 2: The audio catalogue

**Files:**

- Create: `src/config/audio.ts`
- Create: `src/config/audio.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `AUDIO_MODELS: readonly AudioModel[]` where `AudioModel = { id: string; name: string; description: string; rate: number; sampleRates: readonly string[] }`
  - `audioModelById(id: string): AudioModel | undefined`
  - `DEFAULT_AUDIO_MODEL_ID: string`
  - `AUDIO_TABS: readonly { id: AudioMode; label: string }[]`, `type AudioMode = "tts" | "voice-change" | "translate"`
  - `LANGUAGES: readonly { id: string; name: string; flag: string }[]`
  - `OUTPUT_FORMATS: readonly string[]`, `SAMPLE_RATES: readonly string[]`
  - `MAX_BATCH: number`, `MAX_ATTACHMENTS: number`, `SCRIPT_MAX_LENGTH: number`, `VOICE_DETAILS_MAX_LENGTH: number`
  - `ADVANCED_DEFAULTS: AdvancedValues` and `type AdvancedValues`
  - `FLAT_RATE: Record<"voice-change" | "translate", number>`

Spec §5.4, §5.7, §5.8, §5.9. Model names are the reference's; descriptions are ours.

- [ ] **Step 1: Write the failing test**

Create `src/config/audio.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  ADVANCED_DEFAULTS,
  audioModelById,
  AUDIO_MODELS,
  AUDIO_TABS,
  DEFAULT_AUDIO_MODEL_ID,
  LANGUAGES,
  MAX_ATTACHMENTS,
  MAX_BATCH,
  OUTPUT_FORMATS,
  SAMPLE_RATES,
  SCRIPT_MAX_LENGTH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";

describe("audio catalogue", () => {
  it("offers the five featured models", () => {
    expect(AUDIO_MODELS.map((m) => m.id)).toEqual([
      "seed-audio-1",
      "elevenlabs-v3",
      "qwen-audio-3-tts",
      "minimax-speech-2-8-hd",
      "seed-speech",
    ]);
  });

  it("defaults to Seed Audio 1.0", () => {
    expect(DEFAULT_AUDIO_MODEL_ID).toBe("seed-audio-1");
    expect(audioModelById(DEFAULT_AUDIO_MODEL_ID)?.name).toBe("Seed Audio 1.0");
  });

  it("returns undefined for an unknown model rather than throwing", () => {
    expect(audioModelById("nope")).toBeUndefined();
  });

  /* Spec §5.9 — measured against the reference for one script. */
  it("prices Seed Audio above the rest", () => {
    expect(audioModelById("seed-audio-1")?.rate).toBe(0.3);
    expect(audioModelById("elevenlabs-v3")?.rate).toBe(0.15);
    expect(audioModelById("minimax-speech-2-8-hd")?.rate).toBe(0.15);
  });

  it("gives every model a non-empty description and sample rates", () => {
    for (const model of AUDIO_MODELS) {
      expect(model.description.length).toBeGreaterThan(0);
      expect(model.sampleRates.length).toBeGreaterThan(0);
      /* Every advertised rate must be one the picker actually offers. */
      for (const rate of model.sampleRates) {
        expect(SAMPLE_RATES).toContain(rate);
      }
    }
  });

  it("names the three tabs in reference order", () => {
    expect(AUDIO_TABS.map((t) => t.id)).toEqual([
      "tts",
      "voice-change",
      "translate",
    ]);
    expect(AUDIO_TABS.map((t) => t.label)).toEqual([
      "Text to Speech",
      "Voice Change",
      "Translate",
    ]);
  });

  it("holds the measured limits", () => {
    expect(MAX_BATCH).toBe(4);
    expect(MAX_ATTACHMENTS).toBe(3);
    expect(VOICE_DETAILS_MAX_LENGTH).toBe(500);
    expect(SCRIPT_MAX_LENGTH).toBe(5000);
  });

  it("defaults English first among the languages", () => {
    expect(LANGUAGES[0].id).toBe("en");
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(10);
    /* Ids must be unique — a duplicate silently breaks the select. */
    expect(new Set(LANGUAGES.map((l) => l.id)).size).toBe(LANGUAGES.length);
  });

  it("offers MP3 first and defaults the advanced panel to the measured values", () => {
    expect(OUTPUT_FORMATS[0]).toBe("MP3");
    expect(ADVANCED_DEFAULTS).toEqual({
      intensity: 5,
      mood: 0,
      speed: 1,
      pitch: 0,
      volume: 100,
      outputFormat: "MP3",
      sampleRate: "24 kHz",
      saveSettings: false,
    });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/config/audio.test.ts`
Expected: FAIL — `Cannot find module '@/config/audio'`.

- [ ] **Step 3: Write the catalogue**

Create `src/config/audio.ts`:

```ts
/*
 * The audio surface's catalogue.
 *
 * Model names are the ones the live surface offers; the one-line descriptions
 * are ours. Rates are ours too — the reference's cost is not linear in script
 * length (13 characters priced 0.1 and 17 priced 0.3 on one model), so there
 * is no rule there to copy. Keeping the number here means correcting it later
 * is one edit rather than a hunt.
 */

export type AudioMode = "tts" | "voice-change" | "translate";

export interface AudioModel {
  id: string;
  name: string;
  description: string;
  /** Credits per generated clip. Multiplied by batch — see `lib/audio-cost.ts`. */
  rate: number;
  /** Not every model renders at every rate; the schema enforces the pairing. */
  sampleRates: readonly string[];
}

export const SAMPLE_RATES = ["16 kHz", "24 kHz", "44.1 kHz"] as const;
export const OUTPUT_FORMATS = ["MP3", "WAV", "AAC"] as const;

export const AUDIO_MODELS: readonly AudioModel[] = [
  {
    id: "seed-audio-1",
    name: "Seed Audio 1.0",
    description: "Multi-speaker scenes with speech and ambience",
    rate: 0.3,
    sampleRates: SAMPLE_RATES,
  },
  {
    id: "elevenlabs-v3",
    name: "ElevenLabs v3",
    description: "Emotion and delivery control via inline tags",
    rate: 0.15,
    sampleRates: SAMPLE_RATES,
  },
  {
    id: "qwen-audio-3-tts",
    name: "Qwen Audio 3.0 TTS",
    description: "Natural speech with voice, style and emotion control",
    rate: 0.15,
    sampleRates: ["16 kHz", "24 kHz"],
  },
  {
    id: "minimax-speech-2-8-hd",
    name: "MiniMax Speech 2.8 HD",
    description: "High-fidelity single-voice narration",
    rate: 0.15,
    sampleRates: ["24 kHz", "44.1 kHz"],
  },
  {
    id: "seed-speech",
    name: "Seed Speech",
    description: "Multilingual speech across 30+ languages",
    rate: 0.15,
    sampleRates: SAMPLE_RATES,
  },
];

export const DEFAULT_AUDIO_MODEL_ID = "seed-audio-1";

/** `undefined` rather than a throw: a stale saved draft should degrade. */
export function audioModelById(id: string): AudioModel | undefined {
  return AUDIO_MODELS.find((model) => model.id === id);
}

/** The two secondary tabs are single-job, so their cost does not scale. */
export const FLAT_RATE: Record<"voice-change" | "translate", number> = {
  "voice-change": 0.2,
  translate: 0.4,
};

export const AUDIO_TABS: readonly { id: AudioMode; label: string }[] = [
  { id: "tts", label: "Text to Speech" },
  { id: "voice-change", label: "Voice Change" },
  { id: "translate", label: "Translate" },
];

export const LANGUAGES = [
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "es", name: "Spanish", flag: "🇪🇸" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "de", name: "German", flag: "🇩🇪" },
  { id: "it", name: "Italian", flag: "🇮🇹" },
  { id: "pt", name: "Portuguese", flag: "🇧🇷" },
  { id: "ja", name: "Japanese", flag: "🇯🇵" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "zh", name: "Chinese", flag: "🇨🇳" },
  { id: "hi", name: "Hindi", flag: "🇮🇳" },
  { id: "ar", name: "Arabic", flag: "🇸🇦" },
] as const;

export const MAX_BATCH = 4;
export const MAX_ATTACHMENTS = 3;
/** No visible limit on the reference; this is a sanity bound, not a counter. */
export const SCRIPT_MAX_LENGTH = 5000;
export const VOICE_DETAILS_MAX_LENGTH = 500;

export interface AdvancedValues {
  /** 0–10, the expression intensity slider. */
  intensity: number;
  /** −1 (Angry) … 0 (Neutral) … 1 (Happy). */
  mood: number;
  speed: number;
  pitch: number;
  volume: number;
  outputFormat: string;
  sampleRate: string;
  saveSettings: boolean;
}

export const ADVANCED_DEFAULTS: AdvancedValues = {
  intensity: 5,
  mood: 0,
  speed: 1,
  pitch: 0,
  volume: 100,
  outputFormat: "MP3",
  sampleRate: "24 kHz",
  saveSettings: false,
};

/** Bounds for the three popover sliders, in one place so the UI cannot drift. */
export const AUDIO_RANGES = {
  intensity: { min: 0, max: 10, step: 1 },
  mood: { min: -1, max: 1, step: 0.01 },
  speed: { min: 0.5, max: 2, step: 0.1 },
  pitch: { min: -12, max: 12, step: 1 },
  volume: { min: 0, max: 200, step: 5 },
} as const;
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm vitest run src/config/audio.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/config/audio.ts src/config/audio.test.ts
git commit -m "Put the audio catalogue somewhere a wrong number is one edit to fix

Models, rates, languages, limits and the advanced panel's defaults, in one
module the schema derives its enums from rather than restating them. A
model removed here stops validating, which is the property that makes the
derivation worth it.

The rates are ours and the test says so. The reference charges by some
rule we could not recover — the same model priced 13 characters at 0.1
and 17 at 0.3 — so guessing at its shape would have been a number nobody
could check against anything."
```

---

### Task 3: The three pure helpers

**Files:**

- Create: `src/lib/waveform.ts`, `src/lib/waveform.test.ts`
- Create: `src/lib/audio-cost.ts`, `src/lib/audio-cost.test.ts`
- Create: `src/lib/script-tokens.ts`, `src/lib/script-tokens.test.ts`

**Interfaces:**

- Consumes: `AUDIO_MODELS`, `audioModelById`, `FLAT_RATE` from Task 2.
- Produces:
  - `waveformBars(id: string, count?: number): number[]` — `count` defaults to 64, values in `[0.15, 1]`
  - `audioCost(mode: AudioMode, modelId: string, batch: number): number`
  - `serialiseScript(html: string): string` and `scriptMentions(text: string): string[]`

Spec §5.3, §5.9, §6.3 and decision D4. These are the only three places in the feature with real logic, which is exactly why they are pure and live in `lib/`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/waveform.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { waveformBars } from "@/lib/waveform";

describe("waveformBars", () => {
  it("returns the requested number of bars", () => {
    expect(waveformBars("a1b2c3", 64)).toHaveLength(64);
    expect(waveformBars("a1b2c3", 8)).toHaveLength(8);
  });

  it("defaults to 64 bars", () => {
    expect(waveformBars("a1b2c3")).toHaveLength(64);
  });

  /* D4: same id, same picture, every reload and every machine. */
  it("is deterministic for a given id", () => {
    expect(waveformBars("axyz.1.abcd")).toEqual(waveformBars("axyz.1.abcd"));
  });

  it("gives different ids different shapes", () => {
    expect(waveformBars("axyz.1.abcd")).not.toEqual(
      waveformBars("axyz.2.abcd"),
    );
  });

  /* A zero-height bar renders as nothing and reads as a rendering bug. */
  it("keeps every bar within 0.15 and 1", () => {
    for (const id of ["a1", "bqqq.0.zz", "axyz.1.abcd", ""]) {
      for (const bar of waveformBars(id, 128)) {
        expect(bar).toBeGreaterThanOrEqual(0.15);
        expect(bar).toBeLessThanOrEqual(1);
      }
    }
  });

  it("survives an empty id rather than throwing", () => {
    expect(waveformBars("", 4)).toHaveLength(4);
  });

  /* Flat output would mean the hash collapsed — the tile would look broken. */
  it("produces varied heights, not a flat line", () => {
    const bars = waveformBars("axyz.1.abcd", 64);
    expect(new Set(bars).size).toBeGreaterThan(8);
  });
});
```

Create `src/lib/audio-cost.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { audioCost } from "@/lib/audio-cost";

describe("audioCost", () => {
  it("charges the model rate for a batch of one", () => {
    expect(audioCost("tts", "seed-audio-1", 1)).toBe(0.3);
    expect(audioCost("tts", "elevenlabs-v3", 1)).toBe(0.15);
  });

  it("scales linearly with batch", () => {
    expect(audioCost("tts", "seed-audio-1", 2)).toBe(0.6);
    expect(audioCost("tts", "seed-audio-1", 4)).toBe(1.2);
  });

  /* Floating point: 0.15 * 3 is 0.44999999999999996 without rounding. */
  it("rounds to one decimal place", () => {
    expect(audioCost("tts", "elevenlabs-v3", 3)).toBe(0.45);
    expect(audioCost("tts", "elevenlabs-v3", 7)).toBe(1.1);
  });

  it("uses a flat rate for the single-job modes and ignores batch", () => {
    expect(audioCost("voice-change", "seed-audio-1", 1)).toBe(0.2);
    expect(audioCost("voice-change", "seed-audio-1", 4)).toBe(0.2);
    expect(audioCost("translate", "seed-audio-1", 4)).toBe(0.4);
  });

  it("falls back to zero for an unknown model rather than NaN", () => {
    expect(audioCost("tts", "nope", 2)).toBe(0);
  });
});
```

Create `src/lib/script-tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { scriptMentions, serialiseScript } from "@/lib/script-tokens";

describe("serialiseScript", () => {
  it("returns plain text unchanged", () => {
    expect(serialiseScript("The fog rolled in.")).toBe("The fog rolled in.");
  });

  /* The editor renders a mention as a chip; the schema must see a string. */
  it("renders a mention chip as @name", () => {
    const html = 'Read <span data-mention="clip.wav">clip.wav</span> aloud.';
    expect(serialiseScript(html)).toBe("Read @clip.wav aloud.");
  });

  it("handles several mentions in one line", () => {
    const html =
      '<span data-mention="a.wav">a.wav</span> then <span data-mention="b.wav">b.wav</span>';
    expect(serialiseScript(html)).toBe("@a.wav then @b.wav");
  });

  it("turns block elements into newlines", () => {
    expect(serialiseScript("<p>One</p><p>Two</p>")).toBe("One\nTwo");
  });

  it("decodes entities so the schema counts real characters", () => {
    expect(serialiseScript("Tom &amp; Jerry &lt;3")).toBe("Tom & Jerry <3");
  });

  it("returns an empty string for empty input", () => {
    expect(serialiseScript("")).toBe("");
    expect(serialiseScript("<p></p>")).toBe("");
  });
});

describe("scriptMentions", () => {
  it("lists the names a script references", () => {
    expect(scriptMentions("Read @clip.wav then @take2.mp3")).toEqual([
      "clip.wav",
      "take2.mp3",
    ]);
  });

  it("returns an empty list when there are none", () => {
    expect(scriptMentions("No references here.")).toEqual([]);
  });

  it("does not treat an email as a mention", () => {
    expect(scriptMentions("write to sam@example.com")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `pnpm vitest run src/lib/waveform.test.ts src/lib/audio-cost.test.ts src/lib/script-tokens.test.ts`
Expected: FAIL — three `Cannot find module` errors.

- [ ] **Step 3: Write `waveform.ts`**

```ts
/*
 * Bar heights for a generation's waveform, derived from its job id.
 *
 * Not from the audio. Decoding would mean `decodeAudioData` over a
 * cross-origin fixture, which is one missing CORS header away from a
 * permanently empty tile — and the bars are decoration, not analysis. The id
 * already encodes everything unique about a generation, so hashing it gives a
 * picture that is stable across reloads and machines and costs nothing.
 *
 * This mirrors how `generation-jobs.server.ts` keeps its state in the id.
 */

/** Lower bound, so no bar renders as an invisible zero-height sliver. */
const MIN = 0.15;

/*
 * FNV-1a, seeded per bar. A plain hash of the id would give one number; the
 * index is mixed in so each bar gets its own, and the multiply-xor keeps
 * neighbouring indices from producing neighbouring heights.
 */
function hash(id: string, index: number): number {
  let h = 0x811c9dc5 ^ index;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491);
  return (h >>> 0) / 0xffffffff;
}

export function waveformBars(id: string, count = 64): number[] {
  return Array.from({ length: count }, (_, index) => {
    const base = hash(id, index);
    /*
     * A slow sine over the run stops the result reading as pure noise: real
     * speech swells and falls, and a flat band of random bars does not.
     */
    const envelope = 0.55 + 0.45 * Math.sin((index / count) * Math.PI * 3);
    return MIN + (1 - MIN) * Math.min(1, base * envelope);
  });
}
```

- [ ] **Step 4: Write `audio-cost.ts`**

```ts
import { type AudioMode, audioModelById, FLAT_RATE } from "@/config/audio";

/*
 * What the CTA shows beside the sparkle.
 *
 * Ours, not the reference's — see the spec's D5. Linear in batch and flat per
 * model, which is at least a rule someone can check by pressing `+`.
 */
export function audioCost(
  mode: AudioMode,
  modelId: string,
  batch: number,
): number {
  if (mode !== "tts") return FLAT_RATE[mode];

  const model = audioModelById(modelId);
  // An unknown model means a stale draft. Zero is wrong but harmless; NaN
  // would render as "Generate ✦ NaN".
  if (!model) return 0;

  return Math.round(model.rate * batch * 10) / 10;
}
```

- [ ] **Step 5: Write `script-tokens.ts`**

```ts
/*
 * The script editor holds rich content — plain text plus `@` mention chips —
 * and the schema wants a string. These two functions are that boundary, and
 * they are the only real logic in the field, which is why they live here and
 * are tested rather than buried in the component.
 */

/** Mentions are inserted as `@name`; a name runs to whitespace. */
const MENTION = /(^|\s)@([^\s@]+)/g;

/**
 * Flatten the editor's HTML to the text the schema validates.
 *
 * Mention chips become `@name`, block boundaries become newlines, and
 * entities are decoded so a `&amp;` counts as one character and not five.
 */
export function serialiseScript(html: string): string {
  const withMentions = html.replace(
    /<span[^>]*data-mention="([^"]*)"[^>]*>.*?<\/span>/g,
    (_match, name: string) => `@${name}`,
  );

  const withBreaks = withMentions
    .replace(/<\/(p|div)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n");

  const stripped = withBreaks.replace(/<[^>]+>/g, "");

  return decode(stripped).replace(/\n+$/, "");
}

/** The five entities an editor actually produces. No DOM here — `lib/` is pure. */
function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * Which attachments a script refers to.
 *
 * The leading-boundary group is what keeps `sam@example.com` from reading as
 * a mention of `example.com`.
 */
export function scriptMentions(text: string): string[] {
  return [...text.matchAll(MENTION)].map((match) => match[2]);
}
```

- [ ] **Step 6: Run the tests and watch them pass**

Run: `pnpm vitest run src/lib/waveform.test.ts src/lib/audio-cost.test.ts src/lib/script-tokens.test.ts`
Expected: PASS — 16 tests across three files.

If the `&amp;` test fails with `Tom &amp; Jerry`, the `&amp;` replacement is running before the others and re-decoding its own output. It must come **last** in `decode`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/waveform.ts src/lib/waveform.test.ts src/lib/audio-cost.ts src/lib/audio-cost.test.ts src/lib/script-tokens.ts src/lib/script-tokens.test.ts
git commit -m "Derive waveforms from the job id instead of decoding the audio

The fixtures are another origin's. decodeAudioData against them is one
missing CORS header away from every tile rendering as a blank strip, and
the bars are decoration — nobody reads amplitude off a 40px tile. Hashing
the id gives a picture that is stable across reloads and machines, which
is the property that actually matters, and it is the same trick the job
service already uses to avoid holding state.

Also lands the cost formula and the script serialiser here, pure and
tested, rather than inside the components that call them."
```

---

### Task 4: The audio schema

**Files:**

- Create: `src/schemas/audio-generation.ts`
- Create: `src/schemas/audio-generation.test.ts`

**Interfaces:**

- Consumes: Task 2's catalogue.
- Produces:
  - `audioGenerationSchema` and `type AudioGenerationValues`
  - `audioGenerationRequestSchema` and `type AudioGenerationRequest`
  - `toAudioRequest(values: AudioGenerationValues): AudioGenerationRequest`
  - `ttsDefaults(modelId: string): Extract<AudioGenerationValues, { mode: "tts" }>`

Spec §7. Option lists derive from the catalogue rather than being restated, exactly as the image and video schemas do — so a model removed in Task 2 stops validating here without a second edit.

- [ ] **Step 1: Write the failing test**

Create `src/schemas/audio-generation.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import {
  audioGenerationSchema,
  toAudioRequest,
  ttsDefaults,
} from "@/schemas/audio-generation";

const file = (name: string) => new File(["x"], name, { type: "audio/wav" });

const tts = (overrides: Record<string, unknown> = {}) => ({
  mode: "tts" as const,
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch: 1,
  attachments: [],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS,
  ...overrides,
});

describe("text to speech", () => {
  it("accepts a minimal valid script", () => {
    expect(audioGenerationSchema.safeParse(tts()).success).toBe(true);
  });

  it("rejects an empty or whitespace-only script", () => {
    expect(audioGenerationSchema.safeParse(tts({ script: "" })).success).toBe(
      false,
    );
    expect(
      audioGenerationSchema.safeParse(tts({ script: "   " })).success,
    ).toBe(false);
  });

  it("rejects a script past the sanity bound", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ script: "a".repeat(5001) }))
        .success,
    ).toBe(false);
  });

  it("rejects a model the catalogue does not know", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ modelId: "nope" })).success,
    ).toBe(false);
  });

  it("holds batch between 1 and 4", () => {
    expect(audioGenerationSchema.safeParse(tts({ batch: 0 })).success).toBe(
      false,
    );
    expect(audioGenerationSchema.safeParse(tts({ batch: 5 })).success).toBe(
      false,
    );
    expect(audioGenerationSchema.safeParse(tts({ batch: 4 })).success).toBe(
      true,
    );
  });

  it("allows three attachments and refuses a fourth", () => {
    const three = [file("a.wav"), file("b.wav"), file("c.wav")];
    expect(
      audioGenerationSchema.safeParse(tts({ attachments: three })).success,
    ).toBe(true);
    expect(
      audioGenerationSchema.safeParse(
        tts({ attachments: [...three, file("d.wav")] }),
      ).success,
    ).toBe(false);
  });

  it("caps voice details at 500 characters", () => {
    expect(
      audioGenerationSchema.safeParse(tts({ voiceDetails: "a".repeat(500) }))
        .success,
    ).toBe(true);
    expect(
      audioGenerationSchema.safeParse(tts({ voiceDetails: "a".repeat(501) }))
        .success,
    ).toBe(false);
  });

  /*
   * Spec §7 rule 2. The panel swaps to a supported rate on model change, so
   * this only fires for a restored draft — which is exactly when it matters.
   */
  it("rejects a sample rate the chosen model does not render at", () => {
    const result = audioGenerationSchema.safeParse(
      tts({
        modelId: "qwen-audio-3-tts",
        advanced: { ...ADVANCED_DEFAULTS, sampleRate: "44.1 kHz" },
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["advanced", "sampleRate"]);
    }
  });
});

describe("voice change", () => {
  const base = { mode: "voice-change" as const };

  it("needs both a voice and a clip", () => {
    expect(
      audioGenerationSchema.safeParse({
        ...base,
        voice: file("v.wav"),
        clip: file("c.mp4"),
      }).success,
    ).toBe(true);
  });

  it("reports the missing one by path", () => {
    const result = audioGenerationSchema.safeParse({
      ...base,
      voice: null,
      clip: file("c.mp4"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["voice"]);
    }
  });

  it("rejects when both are missing", () => {
    expect(
      audioGenerationSchema.safeParse({ ...base, voice: null, clip: null })
        .success,
    ).toBe(false);
  });
});

describe("translate", () => {
  it("needs a clip and a known language", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        clip: file("c.mp4"),
        language: "es",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing clip", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        clip: null,
        language: "es",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown language", () => {
    expect(
      audioGenerationSchema.safeParse({
        mode: "translate",
        clip: file("c.mp4"),
        language: "kl",
      }).success,
    ).toBe(false);
  });
});

describe("toAudioRequest", () => {
  it("projects files to metadata, because a File is not JSON", () => {
    const request = toAudioRequest(
      tts({ attachments: [file("clip.wav")] }) as never,
    );
    expect(JSON.stringify(request)).toContain("clip.wav");
    if (request.mode === "tts") {
      expect(request.attachments).toEqual([
        { name: "clip.wav", size: 1, type: "audio/wav" },
      ]);
    }
  });

  it("tags every arm with kind: audio for the endpoint to switch on", () => {
    expect(toAudioRequest(tts() as never).kind).toBe("audio");
    expect(
      toAudioRequest({
        mode: "voice-change",
        voice: file("v.wav"),
        clip: file("c.mp4"),
      } as never).kind,
    ).toBe("audio");
  });

  it("keeps the mode so the service can branch on it", () => {
    expect(toAudioRequest(tts() as never).mode).toBe("tts");
  });
});

describe("ttsDefaults", () => {
  it("produces values the schema already accepts", () => {
    const defaults = ttsDefaults("seed-audio-1");
    /* Empty script, so it is deliberately invalid until typed into. */
    expect(defaults.script).toBe("");
    expect(defaults.batch).toBe(1);
    expect(
      audioGenerationSchema.safeParse({ ...defaults, script: "Hello." })
        .success,
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/schemas/audio-generation.test.ts`
Expected: FAIL — `Cannot find module '@/schemas/audio-generation'`.

- [ ] **Step 3: Write the schema**

Create `src/schemas/audio-generation.ts`:

```ts
import { z } from "zod";

import {
  ADVANCED_DEFAULTS,
  AUDIO_MODELS,
  audioModelById,
  LANGUAGES,
  MAX_ATTACHMENTS,
  MAX_BATCH,
  OUTPUT_FORMATS,
  SAMPLE_RATES,
  SCRIPT_MAX_LENGTH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";

/*
 * What the audio panel is allowed to submit.
 *
 * A discriminated union rather than one shape with everything optional: the
 * three tabs share almost no fields, and a flat schema would validate nothing
 * — `voice` would have to be optional for the two tabs that do not have it,
 * which is exactly the tab where it is required.
 *
 * Option lists derive from the catalogue rather than being restated, the same
 * contract `image-generation.ts` and `video-generation.ts` keep: a model added
 * in `config/audio.ts` validates here with no second edit, and one removed
 * there stops validating.
 */

const MODEL_IDS = AUDIO_MODELS.map((model) => model.id) as [
  string,
  ...string[],
];
const LANGUAGE_IDS = LANGUAGES.map((l) => l.id) as [string, ...string[]];

const attachment = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Expected a file.",
);

const advancedSchema = z.object({
  intensity: z.number().min(0).max(10),
  mood: z.number().min(-1).max(1),
  speed: z.number().min(0.5).max(2),
  pitch: z.number().int().min(-12).max(12),
  volume: z.number().min(0).max(200),
  outputFormat: z.enum(OUTPUT_FORMATS),
  sampleRate: z.enum(SAMPLE_RATES),
  saveSettings: z.boolean(),
});

const ttsSchema = z.object({
  mode: z.literal("tts"),
  script: z
    .string()
    .trim()
    .min(1, "Write what the voice should say.")
    .max(
      SCRIPT_MAX_LENGTH,
      `Keep the script under ${String(SCRIPT_MAX_LENGTH)} characters.`,
    ),
  modelId: z.enum(MODEL_IDS),
  batch: z.number().int().min(1).max(MAX_BATCH),
  attachments: z
    .array(attachment)
    .max(MAX_ATTACHMENTS, `Up to ${String(MAX_ATTACHMENTS)} attachments.`),
  voiceDetails: z
    .string()
    .trim()
    .max(
      VOICE_DETAILS_MAX_LENGTH,
      `Keep voice details under ${String(VOICE_DETAILS_MAX_LENGTH)} characters.`,
    ),
  advanced: advancedSchema,
});

/*
 * `voice` and `clip` are nullable with a refinement rather than non-nullable
 * fields. The form legitimately holds `null` while someone is still attaching;
 * a non-nullable field would make the resting state a type error.
 */
const voiceChangeSchema = z.object({
  mode: z.literal("voice-change"),
  voice: attachment.nullable(),
  clip: attachment.nullable(),
});

const translateSchema = z.object({
  mode: z.literal("translate"),
  clip: attachment.nullable(),
  language: z.enum(LANGUAGE_IDS),
});

export const audioGenerationSchema = z
  .discriminatedUnion("mode", [ttsSchema, voiceChangeSchema, translateSchema])
  .superRefine((values, ctx) => {
    if (values.mode === "tts") {
      /*
       * Not every model renders at every rate. The panel swaps to a supported
       * one when you change model, so this is the backstop for a pairing the
       * UI should never have produced — a restored draft, most likely, since
       * the advanced panel can persist to localStorage.
       */
      const model = audioModelById(values.modelId);
      if (model && !model.sampleRates.includes(values.advanced.sampleRate)) {
        ctx.addIssue({
          code: "custom",
          path: ["advanced", "sampleRate"],
          message: `${model.name} does not render at ${values.advanced.sampleRate}.`,
        });
      }
      return;
    }

    if (values.mode === "voice-change") {
      if (!values.voice) {
        ctx.addIssue({
          code: "custom",
          path: ["voice"],
          message: "Pick a voice to use.",
        });
      }
      if (!values.clip) {
        ctx.addIssue({
          code: "custom",
          path: ["clip"],
          message: "Add the clip you want to change.",
        });
      }
      return;
    }

    if (!values.clip) {
      ctx.addIssue({
        code: "custom",
        path: ["clip"],
        message: "Add the clip you want to dub.",
      });
    }
  });

export type AudioGenerationValues = z.infer<typeof audioGenerationSchema>;
export type AdvancedFormValues = z.infer<typeof advancedSchema>;

/** The panel's opening state. Script is empty, so it starts invalid by design. */
export function ttsDefaults(
  modelId: string,
): Extract<AudioGenerationValues, { mode: "tts" }> {
  const model = audioModelById(modelId);
  return {
    mode: "tts",
    script: "",
    modelId,
    batch: 1,
    attachments: [],
    voiceDetails: "",
    advanced: {
      ...ADVANCED_DEFAULTS,
      // Respect the model's own range rather than handing the schema a
      // pairing it will immediately reject.
      sampleRate: model?.sampleRates.includes(ADVANCED_DEFAULTS.sampleRate)
        ? ADVANCED_DEFAULTS.sampleRate
        : (model?.sampleRates[0] ?? ADVANCED_DEFAULTS.sampleRate),
    },
  };
}

/*
 * What actually goes over the wire.
 *
 * A `File` does not survive `JSON.stringify` — it serialises to `{}` — so the
 * request is a deliberate projection: the decisions, plus enough of the media
 * to describe it. A real backend would take the bytes as multipart and this
 * shape as its metadata part; the mock only ever needed the metadata.
 */
const fileMeta = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
});

export const audioGenerationRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("tts"),
    script: z.string().min(1),
    modelId: z.enum(MODEL_IDS),
    batch: z.number().int().min(1).max(MAX_BATCH),
    attachments: z.array(fileMeta).max(MAX_ATTACHMENTS),
    voiceDetails: z.string(),
    advanced: advancedSchema,
  }),
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("voice-change"),
    voice: fileMeta,
    clip: fileMeta,
  }),
  z.object({
    kind: z.literal("audio"),
    mode: z.literal("translate"),
    clip: fileMeta,
    language: z.enum(LANGUAGE_IDS),
  }),
]);

export type AudioGenerationRequest = z.infer<
  typeof audioGenerationRequestSchema
>;

const meta = (file: File) => ({
  name: file.name,
  size: file.size,
  type: file.type,
});

/**
 * Narrow validated form values down to the request payload.
 *
 * Called only with values the schema accepted, which is why the non-null
 * assertions on `voice` and `clip` are safe: the refinement above has already
 * rejected the null case.
 */
export function toAudioRequest(
  values: AudioGenerationValues,
): AudioGenerationRequest {
  if (values.mode === "tts") {
    return {
      kind: "audio",
      mode: "tts",
      script: values.script,
      modelId: values.modelId,
      batch: values.batch,
      attachments: values.attachments.map(meta),
      voiceDetails: values.voiceDetails,
      advanced: values.advanced,
    };
  }

  if (values.mode === "voice-change") {
    return {
      kind: "audio",
      mode: "voice-change",
      voice: meta(values.voice as File),
      clip: meta(values.clip as File),
    };
  }

  return {
    kind: "audio",
    mode: "translate",
    clip: meta(values.clip as File),
    language: values.language,
  };
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm vitest run src/schemas/audio-generation.test.ts`
Expected: PASS — 18 tests.

If the sample-rate test reports its path as `[]` rather than `["advanced","sampleRate"]`, the `superRefine` is attached to a member schema instead of the union — it must wrap `z.discriminatedUnion(...)`.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/audio-generation.ts src/schemas/audio-generation.test.ts
git commit -m "Validate the three audio tabs as one union rather than one loose shape

The tabs share almost no fields. A single flat schema would have to make
voice and clip optional for the two tabs that lack them, which is exactly
the tab where they are required — it would validate nothing and the
server would be the first to notice.

Narrowing on mode also keeps toAudioRequest honest: each arm projects
only its own files, and File-to-metadata happens in one place because a
File serialises to {} and would otherwise reach the endpoint as an empty
object."
```

---

### Task 5: Fixtures, job service and the endpoint branch

**Files:**

- Create: `src/config/audio-fixtures.ts`
- Modify: `src/types/generation.types.ts`
- Modify: `src/server/generation-jobs.server.ts`
- Modify: `src/app/api/generations/route.ts`
- Create: `src/server/audio-jobs.test.ts`

**Interfaces:**

- Consumes: Task 4's `AudioGenerationRequest`.
- Produces: `createAudioJobs(values: AudioGenerationRequest): GenerationJob[]`, a widened `readJob`, and `GenerationAsset.duration?: number`.

Spec §8.1–§8.3. The id scheme, the phase thresholds and the forgeability trade all carry over unchanged — only the tag letter and the timings are new.

- [ ] **Step 1: Write the failing test**

Create `src/server/audio-jobs.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import type { AudioGenerationRequest } from "@/schemas/audio-generation";
import { createAudioJobs, readJob } from "@/server/generation-jobs.server";

const ttsRequest = (batch: number): AudioGenerationRequest => ({
  kind: "audio",
  mode: "tts",
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch,
  attachments: [],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS,
});

describe("createAudioJobs", () => {
  it("issues one job per batch item", () => {
    expect(createAudioJobs(ttsRequest(1))).toHaveLength(1);
    expect(createAudioJobs(ttsRequest(4))).toHaveLength(4);
  });

  it("tags audio ids with 'a' so one reader can serve three surfaces", () => {
    for (const job of createAudioJobs(ttsRequest(2))) {
      expect(job.id.startsWith("a")).toBe(true);
    }
  });

  it("gives every job in a batch a distinct id", () => {
    const jobs = createAudioJobs(ttsRequest(4));
    expect(new Set(jobs.map((j) => j.id)).size).toBe(4);
  });

  it("carries the script through as the prompt", () => {
    expect(createAudioJobs(ttsRequest(1))[0].prompt).toBe("The fog rolled in.");
  });

  /* Spec §8.1: audio has no frame, so w/h are a documented sentinel. */
  it("reports a 1x1 frame", () => {
    const [job] = createAudioJobs(ttsRequest(1));
    expect(job.w).toBe(1);
    expect(job.h).toBe(1);
  });

  it("issues a single job for the two single-job modes", () => {
    const voiceChange: AudioGenerationRequest = {
      kind: "audio",
      mode: "voice-change",
      voice: { name: "v.wav", size: 1, type: "audio/wav" },
      clip: { name: "c.mp4", size: 1, type: "video/mp4" },
    };
    expect(createAudioJobs(voiceChange)).toHaveLength(1);
  });
});

describe("readJob for audio", () => {
  it("starts a fresh job in processing", () => {
    const [job] = createAudioJobs(ttsRequest(1));
    expect(readJob(job.id)?.status).toBe("processing");
  });

  it("reports ready with an asset once the deadline has passed", () => {
    /* Forge an id with a deadline in the past — the same property the
       module's own comment documents as an accepted trade. */
    const past = (Date.now() - 1000).toString(36);
    const status = readJob(`a${past}.0.abcd1234`);
    expect(status?.status).toBe("ready");
    if (status?.status === "ready") {
      expect(status.asset.url).toMatch(/^https?:\/\//);
      expect(status.asset.duration).toBeGreaterThan(0);
    }
  });

  it("still reads image and video ids", () => {
    const past = (Date.now() - 1000).toString(36);
    expect(readJob(`g${past}.0.abcd1234`)?.status).toBe("ready");
    expect(readJob(`v${past}.0.abcd1234`)?.status).toBe("ready");
  });

  it("returns null for an id it could not have issued", () => {
    expect(readJob("not-an-id")).toBeNull();
    expect(readJob("z123.0.abcd")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/server/audio-jobs.test.ts`
Expected: FAIL — `createAudioJobs` is not exported.

- [ ] **Step 3: Add `duration` to the asset type**

In `src/types/generation.types.ts`, extend `GenerationAsset`:

```ts
export interface GenerationAsset {
  url: string;
  /**
   * A still to hold the frame until the clip decodes. Video only — an image
   * asset is its own poster.
   */
  poster?: string;
  /**
   * Seconds. Audio only — lets a waveform tile size itself before the file
   * loads, which is the same job `w`/`h` do for an image.
   */
  duration?: number;
}
```

Update the `GenerationKind` comment, which is now stale in two ways:

```ts
/** The surfaces that produce generations. */
export type GenerationKind = "image" | "video" | "audio";
```

Add the third arm to `PendingRequest` and the import it needs:

```ts
import type { AudioGenerationValues } from "@/schemas/audio-generation";

export type PendingRequest =
  | { kind: "image"; values: ImageGenerationValues }
  | { kind: "video"; values: VideoGenerationValues }
  | { kind: "audio"; values: AudioGenerationValues };
```

Delete the trailing "Audio joins here when it exists" sentence from that comment — it does now.

Finally, carry `duration` on the ready arm of `Generation`:

```ts
export type Generation =
  | (GenerationBase & {
      status: Exclude<GenerationPhase, "ready">;
      src?: undefined;
    })
  | (GenerationBase & {
      status: "ready";
      src: string;
      poster?: string;
      duration?: number;
    });
```

- [ ] **Step 4: Write the fixtures**

Create `src/config/audio-fixtures.ts`:

```ts
/*
 * Stand-in audio for the mock job service.
 *
 * Remote URLs rather than bundled files, matching the decision the video
 * fixtures already took: closest visual result, no repo weight. The accepted
 * risk is that they are another origin's and may rotate — which is why they
 * are all in this one module, and why the waveform is derived from the job id
 * rather than decoded from these bytes.
 */

export interface AudioFixture {
  url: string;
  /** Seconds. Read once from the file, not at runtime. */
  duration: number;
}

export const AUDIO_FIXTURES: readonly AudioFixture[] = [
  {
    url: "https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3",
    duration: 7.4,
  },
  {
    url: "https://cdn.freesound.org/previews/459/459145_9159316-lq.mp3",
    duration: 5.1,
  },
  {
    url: "https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3",
    duration: 9.8,
  },
  {
    url: "https://cdn.freesound.org/previews/316/316847_5123451-lq.mp3",
    duration: 4.3,
  },
];
```

> If any URL 404s when you verify in Task 14, replace the whole array with
> short clips from any CORS-permitting host and update the durations. Nothing
> outside this file depends on the specific values.

- [ ] **Step 5: Extend the job service**

In `src/server/generation-jobs.server.ts`:

Add the import:

```ts
import { AUDIO_FIXTURES } from "@/config/audio-fixtures";
import type { AudioGenerationRequest } from "@/schemas/audio-generation";
```

Widen the kind tag and the pattern:

```ts
type JobKind = "image" | "video" | "audio";
const KIND_TAG: Record<JobKind, string> = {
  image: "g",
  video: "v",
  audio: "a",
};
const ID_PATTERN = /^([gva])([0-9a-z]+)\.([0-9a-z]+)\.[0-9a-z]+$/;
```

Update `decodeId`'s return to resolve all three letters:

```ts
function decodeId(
  id: string,
): { kind: JobKind; readyAt: number; assetIndex: number } | null {
  const match = ID_PATTERN.exec(id);
  if (!match) return null;

  const readyAt = Number.parseInt(match[2], 36);
  const assetIndex = Number.parseInt(match[3], 36);
  if (!Number.isFinite(readyAt) || !Number.isFinite(assetIndex)) return null;

  const kind: JobKind =
    match[1] === "v" ? "video" : match[1] === "a" ? "audio" : "image";

  return { kind, readyAt, assetIndex };
}
```

Add the audio timings and the factory, after the video block:

```ts
/*
 * Audio sits between the two: slower than an image, faster than a clip. The
 * stagger stays wider than the client's poll interval for the same reason the
 * image path's does — otherwise a batch's deadlines fall inside one interval
 * and the tiles land as a clump instead of one at a time.
 */
const AUDIO_BASE_MS = 4200;
const AUDIO_STAGGER_MS = 400;
const AUDIO_JITTER_MS = 200;
const AUDIO_GENERATING_MS = 2400;

/** Audio has no frame. The feed ignores these; the type requires them. */
const AUDIO_FRAME = { w: 1, h: 1 };

export function createAudioJobs(
  values: AudioGenerationRequest,
): GenerationJob[] {
  const now = Date.now();
  // Only text-to-speech batches; the other two modes are one job each.
  const count = values.mode === "tts" ? values.batch : 1;
  const prompt =
    values.mode === "tts"
      ? values.script
      : values.mode === "translate"
        ? `Dub into ${values.language}`
        : "Voice change";

  return Array.from({ length: count }, (_, index) => ({
    id: encodeId(
      "audio",
      now +
        AUDIO_BASE_MS +
        index * AUDIO_STAGGER_MS +
        Math.round(Math.random() * AUDIO_JITTER_MS),
      Math.floor(Math.random() * AUDIO_FIXTURES.length),
    ),
    ...AUDIO_FRAME,
    prompt,
  }));
}
```

In `readJob`, replace the single `video` boolean with a per-kind window and add the audio branch. The existing `const video = decoded.kind === "video";` line becomes:

```ts
const generatingWindow =
  decoded.kind === "video"
    ? VIDEO_GENERATING_MS
    : decoded.kind === "audio"
      ? AUDIO_GENERATING_MS
      : GENERATING_MS;

const remaining = decoded.readyAt - Date.now();
if (remaining > generatingWindow) return { id, status: "processing" };
if (remaining > 0) return { id, status: "generating" };

if (decoded.kind === "audio") {
  const fixture = AUDIO_FIXTURES[decoded.assetIndex % AUDIO_FIXTURES.length];
  return {
    id,
    status: "ready",
    asset: { url: fixture.url, duration: fixture.duration },
  };
}

if (decoded.kind === "video") {
  const preset =
    HIGGSFIELD_PRESETS[decoded.assetIndex % HIGGSFIELD_PRESETS.length];
  return {
    id,
    status: "ready",
    asset: { url: preset.video ?? preset.poster, poster: preset.poster },
  };
}
```

Leave the image return as the final fallthrough.

- [ ] **Step 6: Add the endpoint branch**

In `src/app/api/generations/route.ts`, import the schema and factory:

```ts
import { audioGenerationRequestSchema } from "@/schemas/audio-generation";
import {
  createAudioJobs,
  createJobs,
  createVideoJobs,
} from "@/server/generation-jobs.server";
```

Add the branch immediately after the `video` one and before the image fallback:

```ts
if (kind === "audio") {
  const parsed = audioGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid generation request", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  return Response.json({ jobs: createAudioJobs(parsed.data) }, { status: 202 });
}
```

- [ ] **Step 7: Run the tests and watch them pass**

Run: `pnpm vitest run src/server/ src/schemas/`
Expected: PASS — the new audio job tests plus every existing server test. The image and video assertions in `readJob for audio` are the regression guard for the `ID_PATTERN` widening.

- [ ] **Step 8: Typecheck**

Run: `pnpm typecheck`
Expected: clean. If `PendingRequest` errors in `genjutsu-studio.tsx`, the new arm was added without the `AudioGenerationValues` import.

- [ ] **Step 9: Commit**

```bash
git add src/config/audio-fixtures.ts src/types/generation.types.ts src/server/generation-jobs.server.ts src/server/audio-jobs.test.ts src/app/api/generations/route.ts
git commit -m "Teach the job service a third kind, and give assets a duration

The id scheme already carried everything a stateless reader needs, so
audio costs one more tag letter and one more branch rather than a new
service. The timings sit between image and video, and the stagger stays
wider than the client's poll for the reason the image path documents:
deadlines inside one interval land as a clump.

GenerationAsset grows a duration because a waveform tile has no aspect
ratio to size itself from. Optional, so image and video are untouched —
but without it every tile would have to guess its own height and the
column would reflow the moment the file loaded."
```

---

### Task 6: The client service and the store's duration

**Files:**

- Create: `src/services/audio-generation.ts`
- Create: `src/services/audio-generation.test.ts`
- Modify: `src/stores/generation-store.ts`

**Interfaces:**

- Consumes: Task 4's `toAudioRequest`, Task 5's endpoint.
- Produces: `requestAudioGeneration(values: AudioGenerationValues): Promise<GenerationJob[]>`.

Spec §8.4–§8.5. Polling is **not** reimplemented — `fetchGeneration` is imported from the image service, exactly as `video-generation.ts` already does.

- [ ] **Step 1: Write the failing test**

Create `src/services/audio-generation.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADVANCED_DEFAULTS } from "@/config/audio";
import type { AudioGenerationValues } from "@/schemas/audio-generation";
import { requestAudioGeneration } from "@/services/audio-generation";

const values: AudioGenerationValues = {
  mode: "tts",
  script: "The fog rolled in.",
  modelId: "seed-audio-1",
  batch: 2,
  attachments: [],
  voiceDetails: "",
  advanced: ADVANCED_DEFAULTS,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestAudioGeneration", () => {
  it("posts the projected request and returns the jobs", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [{ id: "a1.0.xy", w: 1, h: 1, prompt: "x" }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const jobs = await requestAudioGeneration(values);

    expect(jobs).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/generations");
    expect(init.method).toBe("POST");

    /* The wire payload must be the projection, not the form values:
       a File would serialise to {} and the endpoint would reject it. */
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.kind).toBe("audio");
    expect(body.mode).toBe("tts");
    expect(body.batch).toBe(2);
  });

  it("throws with the status when the endpoint refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 422 }),
    );

    await expect(requestAudioGeneration(values)).rejects.toThrow("422");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/services/audio-generation.test.ts`
Expected: FAIL — `Cannot find module '@/services/audio-generation'`.

- [ ] **Step 3: Write the service**

Create `src/services/audio-generation.ts`:

```ts
import {
  type AudioGenerationValues,
  toAudioRequest,
} from "@/schemas/audio-generation";
import type { GenerationJob } from "@/types/generation.types";

/*
 * The browser's half of the audio generation flow. Mirrors
 * `video-generation.ts`; the components above know only this function and the
 * types it returns.
 *
 * Polling is not duplicated here — a job's status is read the same way
 * whatever produced it, so `fetchGeneration` is imported from the image
 * service rather than reimplemented. If that endpoint ever diverges per kind,
 * this is the seam to split.
 */

const ENDPOINT = "/api/generations";

export async function requestAudioGeneration(
  values: AudioGenerationValues,
): Promise<GenerationJob[]> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    // Files cannot be JSON; the request carries their metadata instead.
    body: JSON.stringify(toAudioRequest(values)),
  });

  if (!response.ok) {
    throw new Error(
      `Could not start the generation (${String(response.status)})`,
    );
  }

  const body = (await response.json()) as { jobs: GenerationJob[] };
  return body.jobs;
}
```

- [ ] **Step 4: Carry `duration` through the store**

In `src/stores/generation-store.ts`, inside `applyStatus`, the ready branch becomes:

```ts
status.status === "ready"
  ? {
      ...current,
      status: "ready",
      src: status.asset.url,
      // Video assets carry a still to hold the frame until the clip
      // decodes; an image asset is its own poster and sends none.
      poster: status.asset.poster,
      // Audio has no frame at all, so the tile sizes itself from the
      // duration instead.
      duration: status.asset.duration,
    }
  : { ...current, status: status.status, src: undefined };
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `pnpm vitest run src/services/`
Expected: PASS — the two new tests plus the existing `auth-client` tests.

- [ ] **Step 6: Commit**

```bash
git add src/services/audio-generation.ts src/services/audio-generation.test.ts src/stores/generation-store.ts
git commit -m "Add the audio client service, reusing the one poller there is

Same shape as the video service, and deliberately importing fetchGeneration
rather than writing a third copy: a job's status reads identically whatever
produced it, and three poll implementations would be three places to fix
the day the endpoint changes.

The store learns to carry a duration onto ready generations. It is the
only field audio needs that the other two surfaces do not have."
```

---

### Task 7: Promote the two shared primitives

**Files:**

- Move: `src/components/image-studio/batch-stepper.tsx` → `src/components/forms/batch-stepper.tsx`
- Move: `src/components/studio/dropdown.tsx` → `src/components/overlays/dropdown.tsx`
- Modify: every importer of the two (see Step 2)

**Interfaces:**

- Consumes: nothing.
- Produces: `BatchStepper({ value, max, onChange, showMax }: { value: number; max: number; onChange: (next: number) => void; showMax?: boolean })` at `@/components/forms/batch-stepper`, and `Dropdown` / `DropdownItem` unchanged at `@/components/overlays/dropdown`.

> **Why `dropdown` and not `setting-popover`.** An earlier draft of this plan
> promoted `setting-popover.tsx`. That was wrong: it is a _titled listbox_ —
> `{title, icon, value, options, onChange}` — that renders its own trigger pill.
> Audio's advanced dials need a slider under a custom trigger, which is
> `Dropdown`'s shape (`trigger` node plus `children: (close) => ReactNode` plus
> `role="dialog"`), not a list of options. Audio never consumes
> `setting-popover`, so it does not move.
>
> `Dropdown` is already imported out of `components/studio/` by
> `components/feed/`, `components/marketing/` and `components/image-studio/`, so
> this promotion settles a cross-feature violation that predates audio.

`CLAUDE.md`: _"Colocate first, promote later. A component moves to `components/` the moment a second consumer appears."_ Audio is that second consumer. Doing the move now, in its own commit, keeps the image studio's regression separate from the audio feature.

- [ ] **Step 1: Move both files with git so history follows**

```bash
mkdir -p src/components/forms src/components/overlays
git mv src/components/image-studio/batch-stepper.tsx src/components/forms/batch-stepper.tsx
git mv src/components/studio/dropdown.tsx src/components/overlays/dropdown.tsx
```

- [ ] **Step 2: Find every importer**

```bash
grep -rln "image-studio/batch-stepper\|studio/dropdown" src/ | xargs sed -i '' \
  -e 's#@/components/image-studio/batch-stepper#@/components/forms/batch-stepper#g' \
  -e 's#@/components/studio/dropdown#@/components/overlays/dropdown#g'
grep -rn "image-studio/batch-stepper\|studio/dropdown" src/ || echo "no stale imports"
```

`batch-stepper` has one importer (`composer.tsx`). `dropdown` has five:
`studio/model-picker.tsx`, `studio/option-pill.tsx`, `feed/tile-menu.tsx`,
`marketing/account-menu.tsx` and `image-studio/setting-popover.tsx`.

- [ ] **Step 3: Add the optional `max` display to `BatchStepper`**

The component currently renders a bare number. Audio needs `1 / 4`. Add a `showMax` prop rather than changing the default, so the image composer is untouched:

```tsx
export interface BatchStepperProps {
  value: number;
  max: number;
  onChange: (next: number) => void;
  /**
   * Render as `n / max` rather than `n`. The audio panel labels its stepper
   * with the ceiling; the image composer shows the count alone.
   */
  showMax?: boolean;
}
```

and in the value span:

```tsx
<span className="px-1 text-q-menu font-semibold text-q-fg tabular-nums">
  {showMax ? `${String(value)} / ${String(max)}` : String(value)}
</span>
```

Give the two buttons real names while you are here, since audio's are the only ones a screen reader will meet out of context:

```tsx
        aria-label="Decrease batch size"
        aria-label="Increase batch size"
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: clean. A leftover import path is the only likely failure.

- [ ] **Step 5: Verify the image studio still works**

Start the dev server through the Browser pane (**not** `pnpm dev` in a shell) and open `/ai/image`.

Check:

1. The composer renders with its settings row intact.
2. The batch stepper still shows a bare number — **not** `1 / 4`. If it shows the max, `showMax` was defaulted to `true`.
3. Clicking a settings pill still opens its titled popover (that popover is
   `setting-popover.tsx`, which stays in `image-studio/` and now imports
   `Dropdown` from its new home).
4. The account menu in the site header still opens, and a feed tile's `⋯` menu
   still opens — those are the other two `Dropdown` consumers.
5. The browser console has no errors.

- [ ] **Step 6: Commit**

```bash
git add -A src/components
git commit -m "Promote the batch stepper and the dropdown into shared folders

Audio is the stepper's second consumer, and feature folders are not
allowed to import from each other — the alternative was a duplicate that
would drift the first time either was touched.

The dropdown had already lost that argument. It lives in studio/ but feed/,
marketing/ and image-studio/ all reach into it, so the rule was being
broken three times before audio existed. Moving it to overlays/ makes the
existing imports legal rather than adding a fourth violation.

The stepper grows an opt-in showMax, because audio labels its ceiling
(1 / 4) and the image composer shows the count alone. Opt-in rather than
a changed default, so the surface that already shipped renders exactly as
it did."
```

---

### Task 8: The route, the shell and the panel tabs

**Files:**

- Create: `src/app/(studio)/audio/page.tsx`
- Create: `src/components/audio-studio/audio-studio.tsx`
- Create: `src/components/audio-studio/audio-panel.tsx`
- Modify: `src/config/site.ts`
- Create: `.claude/launch.json` (if absent)

**Interfaces:**

- Consumes: `AUDIO_TABS`, `AudioMode`, `DEFAULT_AUDIO_MODEL_ID` from Task 2.
- Produces:
  - `AudioStudio()` — the composition root, `"use client"`
  - `AudioPanel({ mode, onModeChange, children }: { mode: AudioMode; onModeChange: (next: AudioMode) => void; children: React.ReactNode })`

Spec §3 and §5.1. This task puts an empty but correctly-proportioned shell on screen; the forms arrive in Tasks 9–12.

- [ ] **Step 1: Make sure the Browser pane can start the dev server**

If `.claude/launch.json` does not exist, create it:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "higgsfield",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": 3000
    }
  ]
}
```

Never run the dev server with the Bash tool — use the Browser pane's `preview_start`.

- [ ] **Step 2: Write the route**

Create `src/app/(studio)/audio/page.tsx`:

```tsx
import { AudioStudio } from "@/components/audio-studio/audio-studio";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Over & Voice Translation | Higgsfield",
  description:
    "Turn a script into lifelike speech, swap the voice on a take you already have, or dub a clip into another language.",
};

/**
 * The audio studio. Routing only — unlike `/ai/video` there is no `?model=`
 * to resolve, because the reference deep-links no model here and inventing
 * one would be a divergence.
 */
export default function AudioStudioPage() {
  return <AudioStudio />;
}
```

- [ ] **Step 3: Write the panel shell**

Create `src/components/audio-studio/audio-panel.tsx`:

```tsx
"use client";

import { AUDIO_TABS, type AudioMode } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The left column's frame: the card, the three tabs, and a slot for whichever
 * form is showing.
 *
 * The tab is real state — it swaps the whole form body, which no CSS selector
 * can express. Everything else here is paint, so it is classes.
 */
export function AudioPanel({
  mode,
  onModeChange,
  children,
}: {
  mode: AudioMode;
  onModeChange: (next: AudioMode) => void;
  children: React.ReactNode;
}) {
  return (
    <aside className="flex h-full min-h-0 w-85.5 shrink-0 flex-col pb-4">
      <div className="flex max-h-full min-h-0 flex-col overflow-hidden rounded-q-600 border border-q-subtle bg-q-panel">
        <div
          role="tablist"
          aria-label="Audio mode"
          className="mx-3 flex min-w-0 shrink-0 justify-between border-b border-q-card px-2 pt-3"
        >
          {AUDIO_TABS.map((tab) => {
            const active = tab.id === mode;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`audio-tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`audio-panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => {
                  onModeChange(tab.id);
                }}
                onKeyDown={(event) => {
                  /* Roving tabindex: arrows move between tabs, as ARIA expects. */
                  const delta =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (delta === 0) return;
                  event.preventDefault();
                  const index = AUDIO_TABS.findIndex((t) => t.id === mode);
                  const next =
                    AUDIO_TABS[
                      (index + delta + AUDIO_TABS.length) % AUDIO_TABS.length
                    ];
                  onModeChange(next.id);
                  document.getElementById(`audio-tab-${next.id}`)?.focus();
                }}
                className={cn(
                  "flex h-9 shrink-0 items-start border-b-2 text-q-caption-l font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                  active
                    ? "border-b-white text-q-fg"
                    : "border-b-transparent text-q-idle hover:text-q-fg",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {children}
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Write the composition root**

Create `src/components/audio-studio/audio-studio.tsx`. This is the skeleton; Tasks 12–14 fill the two slots.

```tsx
"use client";

import { useState } from "react";

import { AudioPanel } from "@/components/audio-studio/audio-panel";
import { type AudioMode, DEFAULT_AUDIO_MODEL_ID } from "@/config/audio";

/*
 * Composition root for the audio studio.
 *
 * It holds only what both columns must agree on — the active mode, since the
 * pane's How-it-works copy follows it, and the pane tab, since submitting
 * switches to History.
 *
 * The model is state rather than a URL parameter: `/audio` takes no `?model=`
 * on the reference, so putting one in would be a divergence dressed up as a
 * feature.
 */
export function AudioStudio() {
  const [mode, setMode] = useState<AudioMode>("tts");
  const [modelId, setModelId] = useState(DEFAULT_AUDIO_MODEL_ID);

  return (
    <div className="relative grid size-full min-h-0 grid-cols-[1fr] px-4 md:grid-cols-[max-content_1fr]">
      <AudioPanel mode={mode} onModeChange={setMode}>
        <form className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3">
          <div
            role="tabpanel"
            id={`audio-panel-${mode}`}
            aria-labelledby={`audio-tab-${mode}`}
            className="flex flex-col gap-3"
          >
            {/* Tasks 9–12 fill this. */}
          </div>
        </form>
      </AudioPanel>

      <div className="relative size-full">{/* Tasks 13–14 fill this. */}</div>
    </div>
  );
}
```

Note `modelId` and `setModelId` are unused until Task 10. If lint objects, wire the model row in Task 10 rather than deleting them — or add them in that task instead. Prefer the latter if `pnpm lint` fails here.

- [ ] **Step 5: Point the nav at the route**

In `src/config/site.ts`, the entry `{ label: "Audio" }` becomes:

```ts
  { label: "Audio", href: "/audio" },
```

- [ ] **Step 6: Verify in the browser**

Start the preview and open `/audio`.

Check, against spec §15 items 1–2:

1. The panel measures **342px** wide. Confirm with `javascript_tool`:
   ```js
   Math.round(document.querySelector("aside").getBoundingClientRect().width);
   ```
   Expected: `342`.
2. Its card has a **24px** radius:
   ```js
   getComputedStyle(document.querySelector("aside").firstElementChild)
     .borderRadius;
   ```
   Expected: `24px`.
3. The three tabs read `Text to Speech`, `Voice Change`, `Translate` and spread across the panel.
4. The active tab is white with a 2px white underline; the other two are `rgba(255, 255, 255, 0.6)`.
5. Clicking a tab moves the underline; `←`/`→` move it from the keyboard.
6. The `Audio` nav item is highlighted and links here.
7. There is no page scrollbar — the studio fills the viewport exactly.

- [ ] **Step 7: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(studio\)/audio src/components/audio-studio src/config/site.ts .claude/launch.json
git commit -m "Stand up the audio shell at the width the reference actually uses

342px at a 24px radius, not the video studio's 320 at 20 — close enough
to look the same in isolation and visibly wrong beside it. Getting the
frame right before any field goes in means the fields are measured
against a correct box.

The tabs are real ARIA tabs with a roving tabindex, since they swap the
whole form body and are the one thing on this panel that cannot be CSS.
The model is component state: the reference deep-links no model here, and
adding a ?model= would be inventing a feature."
```

---

### Task 9: The upload zone

**Files:**

- Create: `src/components/audio-studio/upload-zone.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces:

```ts
export interface UploadZoneProps {
  title: string;
  hint: string;
  badge: "Optional" | "Required";
  /** One entry per chip; each opens a file picker filtered to its own accept. */
  pickers: readonly { icon: React.ReactNode; accept: string }[];
  files: File[];
  onFilesChange: (next: File[]) => void;
  max: number;
  invalid?: boolean;
  describedBy?: string;
}
export function UploadZone(props: UploadZoneProps): React.JSX.Element;
```

Spec §5.2. One component for all four zones across the three tabs — the differences are props, not variants.

- [ ] **Step 1: Write the component**

Create `src/components/audio-studio/upload-zone.tsx`:

```tsx
"use client";

import { useId, useRef } from "react";

import { cn } from "@/lib/cn";

export interface UploadZoneProps {
  title: string;
  hint: string;
  badge: "Optional" | "Required";
  pickers: readonly { icon: React.ReactNode; accept: string }[];
  files: File[];
  onFilesChange: (next: File[]) => void;
  max: number;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * The dashed drop zone, shared by every tab.
 *
 * The dashed border is an SVG rect rather than `border-dashed`: CSS dashes do
 * not corner-join cleanly at a 16px radius, and the reference's do.
 *
 * Each chip is its own file input rather than one combined picker, matching
 * the reference — clicking the image chip should offer images, not everything.
 */
export function UploadZone({
  title,
  hint,
  badge,
  pickers,
  files,
  onFilesChange,
  max,
  invalid,
  describedBy,
}: UploadZoneProps) {
  const baseId = useId();
  const dropRef = useRef<HTMLDivElement>(null);

  const accept = (incoming: FileList | null) => {
    if (!incoming) return;
    onFilesChange([...files, ...Array.from(incoming)].slice(0, max));
  };

  const filled = files.length > 0;
  const shownHint = filled
    ? files.length === 1
      ? files[0].name
      : `${String(files.length)} attachments`
    : hint;

  return (
    <div className="relative shrink-0">
      <div
        ref={dropRef}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          accept(event.dataTransfer.files);
        }}
        aria-describedby={describedBy}
        className={cn(
          "group relative flex min-h-40 w-full shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-q-400 bg-q-w-05 px-4 pt-6 pb-5 transition-colors hover:bg-q-w-08 motion-reduce:transition-none",
          invalid && "ring-1 ring-q-danger",
        )}
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        >
          <rect
            x="0.75"
            y="0.75"
            rx="15.25"
            ry="15.25"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            /* Inset by half the stroke so the dash sits inside the box; a
               percentage in the attribute would not account for it. */
            style={{
              width: "calc(100% - 1.5px)",
              height: "calc(100% - 1.5px)",
            }}
          />
        </svg>

        <div className="flex items-start">
          {pickers.map((picker, index) => (
            <span key={picker.accept} className={index > 0 ? "-ml-2" : ""}>
              <input
                id={`${baseId}-${String(index)}`}
                type="file"
                accept={picker.accept}
                multiple={max > 1}
                className="sr-only"
                onChange={(event) => {
                  accept(event.target.files);
                  // Let the same file be picked twice in a row.
                  event.target.value = "";
                }}
              />
              <label
                htmlFor={`${baseId}-${String(index)}`}
                className="flex size-10 cursor-pointer items-center justify-center rounded-q-full bg-q-card-strong text-q-fg shadow-[0_5.059px_5.654px_0_rgba(0,0,0,0.1),0_20.533px_10.266px_0_rgba(0,0,0,0.09),0_46.422px_13.986px_0_rgba(0,0,0,0.05),0_82.429px_16.516px_0_rgba(0,0,0,0.01),inset_0_-0.298px_5.356px_0_rgba(185,185,185,0.35)]"
              >
                {picker.icon}
              </label>
            </span>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-1 text-center">
          <span className="text-q-body-md text-q-fg">{title}</span>
          <span className="w-full truncate text-q-menu text-q-soft">
            {shownHint}
          </span>
        </div>
      </div>

      <span className="pointer-events-none absolute top-1.5 right-1.5 rounded-q-300 bg-q-w-05 px-2 py-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
        {badge}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Mount it in the TTS slot so it can be seen**

In `audio-studio.tsx`, inside the `tabpanel` div, temporarily render the TTS zone:

```tsx
import { ImageIcon, Music, AudioLines } from "lucide-react";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { MAX_ATTACHMENTS } from "@/config/audio";

// inside the component:
const [attachments, setAttachments] = useState<File[]>([]);

// inside the tabpanel:
<UploadZone
  title="Upload media"
  hint="Up to 3 Voices/Audios or Image"
  badge="Optional"
  max={MAX_ATTACHMENTS}
  files={attachments}
  onFilesChange={setAttachments}
  pickers={[
    { icon: <AudioLines className="size-4" />, accept: "audio/*" },
    { icon: <Music className="size-4" />, accept: "audio/*" },
    { icon: <ImageIcon className="size-4" />, accept: "image/*" },
  ]}
/>;
```

Task 12 replaces this with a `Controller`-driven field; it exists now only so this task is verifiable.

- [ ] **Step 3: Verify in the browser**

Reload `/audio`.

Check, against spec §15 item 3:

1. The zone is **160px** tall:
   ```js
   Math.round(
     document.querySelector("aside .group").getBoundingClientRect().height,
   );
   ```
   Expected: `160`.
2. The dashed border renders with rounded corners and no visible join seam.
3. The three chips are 40px circles overlapping by 8px — the stack measures **104px**:
   ```js
   Math.round(
     document.querySelector("aside .group > div").getBoundingClientRect().width,
   );
   ```
   Expected: `104`.
4. `Upload media` is 16/24 and `Up to 3 Voices/Audios or Image` is 14/20 in `#898a8b`.
5. The `Optional` badge sits at the top-right and does not intercept clicks.
6. Hovering the zone lifts the fill from `rgba(255,255,255,0.05)` to `0.08`.
7. Clicking the third chip opens a picker offering images. Picking a file swaps the hint to its name.
8. Tab reaches each chip and `Enter` opens its picker.

- [ ] **Step 4: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/audio-studio
git commit -m "Draw the drop zone's dashed border as SVG, not border-dashed

CSS dashes do not corner-join cleanly at a 16px radius — they bunch and
leave a seam, which is visible against a 160px box. An SVG rect with an
explicit dasharray matches the reference and costs one element.

One component covers all four zones across the three tabs. They differ in
copy, chips, arity and badge, all of which are props; making them variants
would have been three near-identical components drifting apart."
```

---

### Task 10: Setting rows, the model popover and the rest of the TTS body

**Files:**

- Create: `src/components/audio-studio/setting-row.tsx`
- Create: `src/components/audio-studio/audio-model-popover.tsx`
- Create: `src/components/audio-studio/script-field.tsx`
- Create: `src/components/audio-studio/language-popover.tsx`

**Interfaces:**

- Consumes: Task 2's catalogue, Task 3's `serialiseScript`, `QPopover` from `@/components/studio/q-popover`.
- Produces:

```ts
export function SettingRow(props: {
  label: string;
  value?: React.ReactNode;
  /** Stacks label over value at 56px instead of one 48px line. */
  stacked?: boolean;
  trailing?: React.ReactNode;
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}): React.JSX.Element;

export function AudioModelPopover(props: {
  value: string;
  onChange: (id: string) => void;
}): React.JSX.Element;

export function ScriptField(props: {
  value: string;
  onChange: (next: string) => void;
  attachments: readonly string[];
  invalid?: boolean;
}): React.JSX.Element;

export function LanguagePopover(props: {
  value: string;
  onChange: (id: string) => void;
}): React.JSX.Element;
```

Spec §5.3, §5.4, §5.5, §5.6, §5.8.

> `QPopover` lives in `components/studio/`. Audio importing it would be a
> cross-feature import, which the constraints forbid. **Move it first**, in this
> task's Step 1, the same way Task 7 moved the other two.

- [ ] **Step 1: Promote `QPopover` and `use-dismiss`**

```bash
git mv src/components/studio/q-popover.tsx src/components/overlays/q-popover.tsx
git mv src/components/studio/use-dismiss.ts src/components/overlays/use-dismiss.ts
grep -rln "studio/q-popover\|studio/use-dismiss" src/ | xargs sed -i '' \
  -e 's#@/components/studio/q-popover#@/components/overlays/q-popover#g' \
  -e 's#@/components/studio/use-dismiss#@/components/overlays/use-dismiss#g'
```

Then fix the now-relative import inside `q-popover.tsx` itself if it referenced `./use-dismiss` — it still resolves, since both moved together.

Run `pnpm typecheck` before continuing. Expected: clean.

- [ ] **Step 2: Write the row primitive**

Create `src/components/audio-studio/setting-row.tsx`:

```tsx
"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Every settings row on this panel: same chrome, two heights.
 *
 * `stacked` is the 56px form with the label above the value (Model, Language,
 * Speed); the default is the 48px single line (Batch size, Output format).
 * One component because the chrome is identical and the reference's rows are
 * pixel-identical apart from that one choice.
 */
export function SettingRow({
  label,
  value,
  stacked,
  trailing,
  onClick,
  ref,
}: {
  label: string;
  value?: React.ReactNode;
  stacked?: boolean;
  trailing?: React.ReactNode;
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const chrome =
    "flex w-full shrink-0 items-center justify-between gap-2 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-left transition-colors hover:border-q-default motion-reduce:transition-none";

  const body = stacked ? (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-q-caption-l font-medium text-q-soft">{label}</span>
      <span className="flex min-w-0 items-center gap-1 text-q-menu text-q-fg">
        {value}
      </span>
    </span>
  ) : (
    <>
      <span className="min-w-0 truncate text-q-menu text-q-fg">{label}</span>
      {value ? (
        <span className="flex shrink-0 items-center gap-2 text-q-menu text-q-fg">
          {value}
        </span>
      ) : null}
    </>
  );

  const tail = trailing ?? <ChevronRight className="size-4 shrink-0" />;

  // A row with no handler is a container, not a control — it must not be a
  // button, or the keyboard gets a stop that does nothing.
  if (!onClick) {
    return (
      <div className={cn(chrome, stacked ? "h-14" : "h-12")}>
        {body}
        {tail}
      </div>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        chrome,
        stacked ? "h-14" : "h-12",
        "outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus",
      )}
    >
      {body}
      {tail}
    </button>
  );
}
```

- [ ] **Step 3: Write the model popover**

Create `src/components/audio-studio/audio-model-popover.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Check, Search, Sparkles } from "lucide-react";

import { SettingRow } from "@/components/audio-studio/setting-row";
import { QPopover } from "@/components/overlays/q-popover";
import { AUDIO_MODELS, audioModelById } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The Model row and its searchable list.
 *
 * Width is pinned to the trigger's 316px, which is what the reference does and
 * what keeps the popover from looking like a detached menu.
 */
export function AudioModelPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = audioModelById(value);
  const term = query.trim().toLowerCase();
  const matches = AUDIO_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(term) ||
      model.description.toLowerCase().includes(term),
  );

  return (
    <>
      <SettingRow
        ref={anchor}
        stacked
        label="Model"
        value={
          <>
            <span className="truncate">{selected?.name ?? "Pick a model"}</span>
            <span
              aria-hidden
              className="inline-block size-3.5 shrink-0 bg-q-brand"
              /* A CSS mask, so the glyph takes the brand colour rather than
                 shipping a second coloured asset. */
              style={{
                maskImage: "url(/glyphs/waveform.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
              }}
            />
          </>
        }
        onClick={() => {
          setOpen((current) => !current);
        }}
      />

      <QPopover anchorRef={anchor} open={open} width={316}>
        <div className="flex shrink-0 items-center gap-2 border-b border-q-card px-3">
          <Search className="size-5 shrink-0 text-q-soft" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search..."
            aria-label="Search models"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-q-menu font-normal text-q-fg outline-none placeholder:text-q-soft"
          />
        </div>

        <div className="flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-none p-3 pt-2">
          <div className="flex items-center gap-1.5 px-1.5">
            <Sparkles className="size-4 shrink-0 text-q-fg" />
            <span className="text-q-caption-l font-medium text-q-soft">
              Featured models
            </span>
          </div>

          {matches.length === 0 ? (
            <p className="px-1.5 py-2 text-q-caption-l text-q-soft">
              No model matches “{query}”.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {matches.map((model) => {
                const active = model.id === value;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-q-300 py-1.5 pr-2 pl-1.5 text-left transition-colors motion-reduce:transition-none",
                      active ? "bg-q-w-05" : "hover:bg-q-w-05",
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-q-200 bg-q-w-05 shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.05)]">
                      <span
                        aria-hidden
                        className={cn(
                          "inline-block size-4",
                          active ? "bg-q-brand" : "bg-q-fg",
                        )}
                        style={{
                          maskImage: "url(/glyphs/waveform.svg)",
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                        }}
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-0.5">
                      <span className="truncate text-q-caption-l font-medium text-q-fg">
                        {model.name}
                      </span>
                      <span className="truncate text-q-caption-xs font-normal tracking-normal text-q-soft">
                        {model.description}
                      </span>
                    </span>
                    {active ? (
                      <Check className="size-5 shrink-0 text-q-brand" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </QPopover>
    </>
  );
}
```

Create `public/glyphs/waveform.svg` — a simple four-bar mark, drawn fresh:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect x="1" y="6" width="2.5" height="4" rx="1" />
  <rect x="5" y="3" width="2.5" height="10" rx="1" />
  <rect x="9" y="1" width="2.5" height="14" rx="1" />
  <rect x="13" y="5" width="2.5" height="6" rx="1" />
</svg>
```

- [ ] **Step 4: Write the language popover**

Create `src/components/audio-studio/language-popover.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Check, Search } from "lucide-react";

import { SettingRow } from "@/components/audio-studio/setting-row";
import { QPopover } from "@/components/overlays/q-popover";
import { LANGUAGES } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The Translate tab's language row.
 *
 * Same listbox as the model popover, minus the group heading and the
 * descriptions — a language has a flag and a name and nothing else worth
 * showing.
 */
export function LanguagePopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = LANGUAGES.find((language) => language.id === value);
  const term = query.trim().toLowerCase();
  const matches = LANGUAGES.filter((language) =>
    language.name.toLowerCase().includes(term),
  );

  return (
    <>
      <SettingRow
        ref={anchor}
        stacked
        label="Language"
        value={
          <>
            <span aria-hidden className="text-base leading-none">
              {selected?.flag}
            </span>
            <span className="truncate">{selected?.name ?? "Pick one"}</span>
          </>
        }
        onClick={() => {
          setOpen((current) => !current);
        }}
      />

      <QPopover anchorRef={anchor} open={open} width={316}>
        <div className="flex shrink-0 items-center gap-2 border-b border-q-card px-3">
          <Search className="size-5 shrink-0 text-q-soft" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search..."
            aria-label="Search languages"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-q-menu font-normal text-q-fg outline-none placeholder:text-q-soft"
          />
        </div>

        <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-none p-3 pt-2">
          {matches.length === 0 ? (
            <p className="px-1.5 py-2 text-q-caption-l text-q-soft">
              No language matches “{query}”.
            </p>
          ) : (
            matches.map((language) => (
              <button
                key={language.id}
                type="button"
                onClick={() => {
                  onChange(language.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-q-300 px-2 py-2 text-left transition-colors motion-reduce:transition-none",
                  language.id === value ? "bg-q-w-05" : "hover:bg-q-w-05",
                )}
              >
                <span aria-hidden className="text-base leading-none">
                  {language.flag}
                </span>
                <span className="min-w-0 flex-1 truncate text-q-caption-l font-medium text-q-fg">
                  {language.name}
                </span>
                {language.id === value ? (
                  <Check className="size-5 shrink-0 text-q-brand" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </QPopover>
    </>
  );
}
```

- [ ] **Step 5: Write the script field**

Create `src/components/audio-studio/script-field.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/cn";
import { serialiseScript } from "@/lib/script-tokens";

/**
 * The script editor.
 *
 * A `contenteditable` rather than a textarea, because `@` mentions render as
 * chips. All the real logic — flattening the HTML back to the string the
 * schema validates — lives in `lib/script-tokens.ts`, tested, so this
 * component is markup and one event handler.
 */
export function ScriptField({
  value,
  onChange,
  attachments,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  attachments: readonly string[];
  invalid?: boolean;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const [mentioning, setMentioning] = useState(false);

  return (
    <section
      className={cn(
        "relative flex h-40 w-full shrink-0 flex-col gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors focus-within:border-q-default motion-reduce:transition-none",
        invalid && "border-q-danger",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-q-menu text-q-soft">Script</span>
        <span
          title="Write what the voice should say, word for word."
          className="flex size-4.5 shrink-0 items-center justify-center text-q-soft transition-colors hover:text-q-fg motion-reduce:transition-none"
        >
          <Info className="size-4.5" />
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label="Script"
          onInput={(event) => {
            const text = serialiseScript(event.currentTarget.innerHTML);
            onChange(text);
            setMentioning(/(^|\s)@[^\s@]*$/.test(text));
          }}
          className="minimal-scrollbar size-full cursor-text overflow-y-auto text-q-caption-l font-normal text-q-fg outline-none [scrollbar-gutter:stable]"
        />

        {value.length === 0 ? (
          <p className="pointer-events-none absolute top-0 left-0 text-q-caption-l font-normal whitespace-pre-line text-q-soft select-none">
            {
              "Write exactly what the voice will read out loud.\nType @ to reference attachments"
            }
          </p>
        ) : null}

        {mentioning && attachments.length > 0 ? (
          <ul
            role="listbox"
            aria-label="Attachments"
            className="q-menu-surface absolute bottom-0 left-0 z-30 w-full overflow-hidden rounded-q-200"
          >
            {attachments.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    const next = value.replace(
                      /(^|\s)@[^\s@]*$/,
                      `$1@${name} `,
                    );
                    onChange(next);
                    if (editor.current) editor.current.textContent = next;
                    setMentioning(false);
                  }}
                  className="flex w-full items-center px-2 py-1.5 text-left text-q-caption-l text-q-fg hover:bg-q-w-05"
                >
                  @{name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Mount the row, model, batch and voice-details fields**

In `audio-studio.tsx`'s tabpanel, below the `UploadZone`, add the remaining TTS fields using `SettingRow`, `AudioModelPopover`, `BatchStepper` (from `@/components/forms/batch-stepper`, `showMax`) and a voice-details `<section>` matching spec §5.6. Keep them on local `useState` for now; Task 12 converts the whole body to `react-hook-form`.

- [ ] **Step 7: Verify in the browser**

Reload `/audio`.

Check, against spec §15 items 6 and the §5 geometry:

1. The Model row is **56px** and the Batch row **48px**:
   ```js
   [
     ...document.querySelectorAll("aside form button, aside form > div > div"),
   ].map((el) => Math.round(el.getBoundingClientRect().height));
   ```
   Expected: the list includes `56` and `48`.
2. Clicking Model opens a popover **316px** wide listing five models under `Featured models`.
3. `Seed Audio 1.0` is marked with a lime check and a lime tile glyph; the rest are white.
4. Typing `eleven` filters to one row; typing `zzz` shows the empty line, not a blank popover.
5. Picking a model closes the popover and relabels the row.
6. `Escape` closes the popover and returns focus to the row.
7. The script field is **160px** tall with a two-line placeholder; typing hides the placeholder.
8. The batch stepper reads `1 / 4`; `−` is disabled at 1 and `+` disabled at 4.
9. Voice details counts up to `500` and the counter is `rgba(255,255,255,0.4)`.

- [ ] **Step 8: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add -A src/components
git commit -m "Build the panel's rows on one primitive with two heights

Model, Language, Batch size, Output format, Sample rate and the three
audio dials are the same row: identical chrome, differing only in whether
the label sits above the value (56px) or beside it (48px). One component
with a stacked flag beats six near-copies that drift.

QPopover moves to components/overlays on the way, for the reason Task 7
moved the stepper: audio is its second consumer and feature folders do
not import from each other."
```

---

### Task 11: Advanced settings

**Files:**

- Create: `src/components/audio-studio/intensity-slider.tsx`
- Create: `src/components/audio-studio/mood-fader.tsx`
- Create: `src/components/audio-studio/advanced-settings.tsx`

**Interfaces:**

- Consumes: `AUDIO_RANGES`, `ADVANCED_DEFAULTS`, `OUTPUT_FORMATS`, `audioModelById` from Task 2; `SettingRow` from Task 10; `Dropdown` from `@/components/overlays/dropdown` (promoted in Task 7).
- Produces:

```ts
export function IntensitySlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}): React.JSX.Element;

export function MoodFader(props: {
  value: number;
  onChange: (next: number) => void;
}): React.JSX.Element;

export function AdvancedSettings(props: {
  modelId: string;
  value: AdvancedFormValues;
  onChange: (next: AdvancedFormValues) => void;
}): React.JSX.Element;
```

Spec §5.7. Both sliders are visually-hidden `<input type="range">` elements with the paint as siblings — that is the constraint about preferring the platform, and it is what makes arrow keys and announcement free.

- [ ] **Step 1: Write the intensity slider**

Create `src/components/audio-studio/intensity-slider.tsx`:

```tsx
"use client";

/**
 * A slider that *is* the row: the fill sits inside the row's own box rather
 * than under a separate track.
 *
 * The input is visually hidden and stretched across the row, so pointer drags,
 * arrow keys, Home/End and screen-reader announcement all come from the
 * platform. Everything painted is a sibling.
 */
export function IntensitySlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <label className="relative flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden rounded-q-300 border border-q-subtle bg-q-w-05 px-3 transition-colors hover:border-q-default motion-reduce:transition-none">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />

      <span aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rounded-xs bg-q-w-20"
            /* One tick per tenth. A percentage cannot be a utility class. */
            style={{ left: `${String((index + 1) * 10)}%` }}
          />
        ))}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 rounded-q-300 bg-q-w-05 shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.05)]"
        /* The fill is a continuous percentage — the one thing here that
           genuinely cannot be expressed as a class. */
        style={{ width: `${String(pct)}%` }}
      />

      <span className="pointer-events-none relative z-10 flex items-center gap-1.5 text-q-menu whitespace-nowrap text-q-fg">
        {label}
      </span>
      <span className="pointer-events-none relative z-10 text-q-menu whitespace-nowrap text-q-fg tabular-nums">
        {format ? format(value) : value}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 block h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-q-w-80"
        style={{ left: `${String(pct)}%` }}
      />
    </label>
  );
}
```

- [ ] **Step 2: Write the mood fader**

Create `src/components/audio-studio/mood-fader.tsx`:

```tsx
"use client";

import { AUDIO_RANGES } from "@/config/audio";

const SCALE = ["Angry", "Neutral", "Happy"];

/**
 * The one control on this panel with a physical metaphor.
 *
 * The handle is deliberately taller than the track and overhangs it — that
 * overhang is the whole effect, so the track must never get `overflow-hidden`.
 */
export function MoodFader({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const { min, max, step } = AUDIO_RANGES.mood;
  const pct = ((value - min) / (max - min)) * 100;
  const label = value < -0.33 ? "Angry" : value > 0.33 ? "Happy" : "Neutral";

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="relative flex h-7 w-full cursor-pointer items-center rounded-q-200 bg-q-w-05 p-0.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label="Mood"
          /* Announce the word, not the number — "0.42" tells nobody anything. */
          aria-valuetext={label}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 rounded-q-200 bg-[linear-gradient(90deg,#e7412b_0%,#f08a2c_55%,#ffffff_100%)]"
          style={{ width: `${String(pct)}%` }}
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center justify-between px-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="size-1 rounded-[1px] bg-q-w-10" />
          ))}
        </span>

        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 z-1 block h-7.5 w-5.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-q-100 border-[0.5px] border-black/15 bg-white active:cursor-grabbing"
          style={{ left: `${String(pct)}%` }}
        >
          <span className="pointer-events-none absolute bottom-[11.5px] left-[7.5px] h-1.5 w-px bg-black/10" />
          <span className="pointer-events-none absolute bottom-[11.5px] left-[11.5px] h-1.5 w-px bg-black/10" />
        </span>
      </label>

      <div className="flex w-full items-center justify-between gap-1 px-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
        {SCALE.map((name) => (
          <span key={name} className="truncate">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the disclosure**

Create `src/components/audio-studio/advanced-settings.tsx`. It renders, in order: the disclosure button, the `{model} controls` header with Reset, the intensity slider, the Mood card, the `Audio settings` group (three-up row, Output format, Sample rate) and Save settings.

```tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  FileAudio,
  Info,
} from "lucide-react";

import { AdvancedDial } from "@/components/audio-studio/advanced-dial";
import { IntensitySlider } from "@/components/audio-studio/intensity-slider";
import { MoodFader } from "@/components/audio-studio/mood-fader";
import { SettingRow } from "@/components/audio-studio/setting-row";
import {
  ADVANCED_DEFAULTS,
  AUDIO_RANGES,
  audioModelById,
  OUTPUT_FORMATS,
} from "@/config/audio";
import type { AdvancedFormValues } from "@/schemas/audio-generation";

export function AdvancedSettings({
  modelId,
  value,
  onChange,
}: {
  modelId: string;
  value: AdvancedFormValues;
  onChange: (next: AdvancedFormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const model = audioModelById(modelId);
  const set = <K extends keyof AdvancedFormValues>(
    key: K,
    next: AdvancedFormValues[K],
  ) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="audio-advanced"
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="flex w-full shrink-0 items-center gap-2 rounded-q-300 p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-q-focus"
      >
        <SlidersHorizontal className="size-4 shrink-0 text-q-fg" />
        <span className="min-w-0 flex-1 truncate text-left text-q-menu text-q-fg">
          Advanced settings
        </span>
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-q-fg" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-q-fg" />
        )}
      </button>

      {open ? (
        <div
          id="audio-advanced"
          className="flex w-full shrink-0 flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pl-0.5">
              <span className="px-0.5 text-q-caption-l font-medium text-q-soft">
                {model?.name ?? "Model"} controls
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...ADVANCED_DEFAULTS,
                    sampleRate: model?.sampleRates.includes(
                      ADVANCED_DEFAULTS.sampleRate,
                    )
                      ? ADVANCED_DEFAULTS.sampleRate
                      : (model?.sampleRates[0] ?? ADVANCED_DEFAULTS.sampleRate),
                  } as AdvancedFormValues);
                }}
                className="flex h-6 shrink-0 items-center gap-1 rounded-q-150 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
              >
                <RotateCcw className="size-3 shrink-0 text-q-fg" />
                <span className="text-q-caption-l font-medium text-q-fg">
                  Reset
                </span>
              </button>
            </div>

            <IntensitySlider
              label="Expression intensity"
              value={value.intensity}
              {...AUDIO_RANGES.intensity}
              onChange={(next) => {
                set("intensity", next);
              }}
            />
          </div>

          <div className="flex w-full flex-col gap-3 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors hover:border-q-default motion-reduce:transition-none">
            <div className="flex items-center gap-1 px-0.5">
              <span className="text-q-caption-l font-medium text-q-soft">
                Mood
              </span>
              <span
                title="How the delivery leans, from angry to happy."
                className="flex size-4 shrink-0 items-center justify-center text-q-soft transition-colors hover:text-q-fg motion-reduce:transition-none"
              >
                <Info className="size-3.5" />
              </span>
            </div>
            <MoodFader
              value={value.mood}
              onChange={(next) => {
                set("mood", next);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="px-1 text-q-caption-l font-medium text-q-soft">
              Audio settings
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex w-full items-stretch gap-2">
                <AdvancedDial
                  label="Speed"
                  value={value.speed}
                  {...AUDIO_RANGES.speed}
                  format={(v) => `${v.toFixed(1)}x`}
                  onChange={(next) => {
                    set("speed", next);
                  }}
                />
                <AdvancedDial
                  label="Pitch"
                  value={value.pitch}
                  {...AUDIO_RANGES.pitch}
                  format={(v) => String(v)}
                  onChange={(next) => {
                    set("pitch", next);
                  }}
                />
                <AdvancedDial
                  label="Volume"
                  value={value.volume}
                  {...AUDIO_RANGES.volume}
                  format={(v) => `${String(v)}%`}
                  onChange={(next) => {
                    set("volume", next);
                  }}
                />
              </div>

              <SettingRow
                label="Output format"
                value={
                  <span className="flex items-center gap-1">
                    <FileAudio className="size-4 shrink-0" />
                    {value.outputFormat}
                  </span>
                }
                onClick={() => {
                  const index = OUTPUT_FORMATS.indexOf(
                    value.outputFormat as (typeof OUTPUT_FORMATS)[number],
                  );
                  set(
                    "outputFormat",
                    OUTPUT_FORMATS[(index + 1) % OUTPUT_FORMATS.length],
                  );
                }}
              />

              <SettingRow
                label="Sample Rate"
                value={value.sampleRate}
                onClick={() => {
                  const rates = model?.sampleRates ?? [];
                  const index = rates.indexOf(value.sampleRate);
                  set("sampleRate", rates[(index + 1) % rates.length]);
                }}
              />
            </div>
          </div>

          <SettingRow
            label="Save settings"
            trailing={
              <>
                <input
                  id="audio-save-settings"
                  type="checkbox"
                  checked={value.saveSettings}
                  onChange={(event) => {
                    set("saveSettings", event.target.checked);
                  }}
                  className="peer sr-only"
                />
                <label
                  htmlFor="audio-save-settings"
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-q-full bg-q-switch-off transition peer-checked:bg-q-brand peer-focus-visible:ring-2 peer-focus-visible:ring-q-focus motion-reduce:transition-none"
                >
                  <span className="pointer-events-none absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-q-full bg-white shadow-lg transition-transform duration-300 ease-in-out peer-checked:translate-x-5 motion-reduce:transition-none" />
                </label>
              </>
            }
          />
        </div>
      ) : null}
    </>
  );
}
```

> The knob's `peer-checked:translate-x-5` is inside the `<label>`, which is not
> a sibling of the input — Tailwind's `peer-*` needs the sibling relationship.
> Put the knob `<span>` as a direct child of the label and give the **label**
> the `peer-checked:` classes, which it can have because it _is_ the input's
> sibling. Verify the knob actually moves in Step 5; if it does not, this is why.

- [ ] **Step 4: Write the three-up dial**

Create `src/components/audio-studio/advanced-dial.tsx` — a `SettingRow`-shaped trigger at `h-14.5` whose `Dropdown` panel holds one `IntensitySlider`. `Dropdown` owns its own open state and takes the trigger as a node, so there is no `useState`/`useRef` pair here. `role="dialog"` because the panel holds a focusable control, which a `listbox` may not:

```tsx
"use client";

import { ChevronRight } from "lucide-react";

import { IntensitySlider } from "@/components/audio-studio/intensity-slider";
import { Dropdown } from "@/components/overlays/dropdown";

export function AdvancedDial({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (next: number) => void;
}) {
  return (
    <Dropdown
      label={label}
      /* The panel holds a slider, which is focusable chrome — a listbox may
         not contain one, so the panel is a dialog. */
      role="dialog"
      width={260}
      align="start"
      triggerClassName="min-w-0 flex-1"
      trigger={
        <span className="flex h-14.5 w-full items-center gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-left transition-colors hover:border-q-default motion-reduce:transition-none">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-q-caption-l font-medium text-q-soft">
              {label}
            </span>
            <span className="truncate text-q-menu text-q-fg tabular-nums">
              {format(value)}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0" />
        </span>
      }
    >
      {() => (
        <div className="p-2">
          <IntensitySlider
            label={label}
            value={value}
            min={min}
            max={max}
            step={step}
            format={format}
            onChange={onChange}
          />
        </div>
      )}
    </Dropdown>
  );
}
```

> `Dropdown`'s `children` is a render prop receiving `close`. This panel does
> not close on change — a slider you drag should stay open — so the argument is
> ignored. Check `dropdown.tsx` for whether `trigger` is already wrapped in its
> own `<button>`; if it is, the trigger here must stay a `<span>`, as written,
> never a nested `<button>`.

- [ ] **Step 5: Verify in the browser**

Mount `AdvancedSettings` in the TTS body, reload `/audio` and expand it.

Check, against spec §15 item 7:

1. The chevron is `chevron-right` collapsed and `chevron-down` open; `aria-expanded` flips.
2. The header reads `Seed Audio 1.0 controls`; switching model to ElevenLabs relabels it.
3. The intensity slider shows nine ticks and the value `5`; the fill is ~50% of the row.
4. Dragging the slider moves the fill and the thumb together; `←`/`→` step it by 1.
5. The mood handle is **30px tall over a 28px track** and visibly overhangs:
   ```js
   [
     Math.round(
       document
         .querySelector("#audio-advanced label:nth-of-type(1)")
         .getBoundingClientRect().height,
     ),
     Math.round(
       document
         .querySelector("#audio-advanced label span:last-child")
         .getBoundingClientRect().height,
     ),
   ];
   ```
   Expected: roughly `[28, 30]` for the mood row.
6. The mood scale reads `Angry` · `Neutral` · `Happy`.
7. The three dials sit in one row, each ~100px wide and **58px** tall, reading `1.0x`, `0`, `100%`.
8. Clicking a dial opens its popover; dragging updates the row's value live.
9. `Output format` cycles MP3 → WAV → AAC; `Sample Rate` cycles only the rates the current model supports.
10. The Save-settings knob slides right and the track turns lime when checked.
11. `Reset` returns every control to its default.

- [ ] **Step 6: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/audio-studio
git commit -m "Build both audio sliders on a real range input

Every painted layer is a sibling of a visually-hidden input, so pointer
drags, arrow keys, Home/End and screen-reader announcement come from the
platform rather than from handlers we would have to get right. The mood
fader announces 'Angry' and 'Happy' rather than -0.42, which is the only
version of that value anyone can act on.

The mood handle is taller than its track on purpose — the overhang is
what makes it read as a physical fader, so the track must never be given
overflow-hidden."
```

---

### Task 12: The CTA, the three forms and the submit flow

**Files:**

- Create: `src/components/audio-studio/audio-cta.tsx`
- Create: `src/components/audio-studio/tts-form.tsx`
- Create: `src/components/audio-studio/voice-change-form.tsx`
- Create: `src/components/audio-studio/translate-form.tsx`
- Modify: `src/components/audio-studio/audio-studio.tsx`

**Interfaces:**

- Consumes: everything from Tasks 2–11, plus `useAuth` from `@/features/auth/auth-context`, `useGenerationStore` / `useGenerationsOfKind`, `requestAudioGeneration`, `fetchGeneration`.
- Produces:
  - `AudioCta({ cost, disabled }: { cost: number | null; disabled: boolean })`
  - `TtsForm`, `VoiceChangeForm`, `TranslateForm`, each `{ modelId, onModelChange, onSubmit }`-shaped for its own mode

Spec §5.9, §9, §10. This is the task that makes the surface real: three forms validating against Task 4's schema and submitting through Task 6's service.

- [ ] **Step 1: Write the CTA**

Create `src/components/audio-studio/audio-cta.tsx`:

```tsx
import { cn } from "@/lib/cn";

/**
 * The Generate button.
 *
 * Deliberately not the video studio's `GenerateButton`: this one is 56px on a
 * 12px radius with a two-gradient fill and a credit cost beside the label.
 * Sharing them would have meant a component with two of everything.
 *
 * Disabled is the resting state — the script starts empty — so it has to look
 * deliberate rather than broken. `brightness-60` reads as olive, which is what
 * the reference does.
 */
export function AudioCta({
  cost,
  disabled,
}: {
  cost: number | null;
  disabled: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 pb-3">
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "q-cta-audio relative flex h-14 w-full min-w-12 items-center justify-center overflow-hidden rounded-q-300 px-5 pt-4 pb-5 transition outline-none",
          "hover:brightness-105 focus-visible:ring-2 focus-visible:ring-q-focus active:brightness-95",
          "disabled:pointer-events-none disabled:brightness-60",
          "motion-reduce:transition-none",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-3px_0_0_var(--q-brand-lime-line)]"
        />
        <span className="text-q-cta text-q-on-brand flex items-center px-1.5">
          Generate
        </span>
        {cost !== null ? (
          <span className="text-q-cta text-q-on-brand flex items-center gap-1">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="size-4.5 shrink-0 fill-current"
            >
              {/* Four-point sparkle: the credit mark. */}
              <path d="M10 1.5c.4 3.9 3.6 7.1 7.5 7.5v2c-3.9.4-7.1 3.6-7.5 7.5h-2c-.4-3.9-3.6-7.1-7.5-7.5V9c3.9-.4 7.1-3.6 7.5-7.5h2Z" />
            </svg>
            <span className="tabular-nums">{cost}</span>
          </span>
        ) : null}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write the TTS form**

Create `src/components/audio-studio/tts-form.tsx`. It owns the fields from Tasks 9–11, wired through `react-hook-form` so the whole panel validates as one object.

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AudioLines, ImageIcon, Music } from "lucide-react";

import { AdvancedSettings } from "@/components/audio-studio/advanced-settings";
import { AudioCta } from "@/components/audio-studio/audio-cta";
import { AudioModelPopover } from "@/components/audio-studio/audio-model-popover";
import { ScriptField } from "@/components/audio-studio/script-field";
import { SettingRow } from "@/components/audio-studio/setting-row";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { BatchStepper } from "@/components/forms/batch-stepper";
import {
  MAX_ATTACHMENTS,
  MAX_BATCH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
  ttsDefaults,
} from "@/schemas/audio-generation";

export function TtsForm({
  modelId,
  onModelChange,
  onSubmit,
}: {
  modelId: string;
  onModelChange: (id: string) => void;
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit, setValue } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    /*
     * Validate on submit. The live Generate button says nothing until pressed;
     * an error that appears while you are still attaching your first file is
     * worse than useless.
     */
    mode: "onSubmit",
    defaultValues: ttsDefaults(modelId),
  });

  const script = useWatch({ control, name: "script" });
  const batch = useWatch({ control, name: "batch" });
  const attachments = useWatch({ control, name: "attachments" });

  /* Spec §5.9: the gate is the script, confirmed against the reference —
     filling voice details alone leaves the button disabled. */
  const ready = typeof script === "string" && script.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3"
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="attachments"
          render={({ field }) => (
            <UploadZone
              title="Upload media"
              hint="Up to 3 Voices/Audios or Image"
              badge="Optional"
              max={MAX_ATTACHMENTS}
              files={(field.value as File[] | undefined) ?? []}
              onFilesChange={field.onChange}
              pickers={[
                { icon: <AudioLines className="size-4" />, accept: "audio/*" },
                { icon: <Music className="size-4" />, accept: "audio/*" },
                { icon: <ImageIcon className="size-4" />, accept: "image/*" },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="script"
          render={({ field, fieldState }) => (
            <ScriptField
              value={(field.value as string | undefined) ?? ""}
              onChange={field.onChange}
              attachments={((attachments as File[] | undefined) ?? []).map(
                (file) => file.name,
              )}
              invalid={Boolean(fieldState.error)}
            />
          )}
        />

        <AudioModelPopover
          value={modelId}
          onChange={(id) => {
            onModelChange(id);
            setValue("modelId", id);
            /* Re-derive advanced values so the new model's sample-rate range
               applies — otherwise the schema rejects a pairing the UI shows. */
            setValue("advanced", ttsDefaults(id).advanced);
          }}
        />

        <Controller
          control={control}
          name="batch"
          render={({ field }) => (
            <SettingRow
              label="Batch size"
              trailing={
                <BatchStepper
                  showMax
                  max={MAX_BATCH}
                  value={(field.value as number | undefined) ?? 1}
                  onChange={field.onChange}
                />
              }
            />
          )}
        />

        <Controller
          control={control}
          name="voiceDetails"
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? "";
            return (
              <section className="relative flex w-full shrink-0 flex-col gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors focus-within:border-q-default motion-reduce:transition-none">
                <span className="pointer-events-none absolute top-1.5 right-1.5 rounded-q-300 bg-q-w-05 px-2 py-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
                  Optional
                </span>
                <label
                  htmlFor="audio-voice-details"
                  className="text-q-menu text-q-soft"
                >
                  Voice details
                </label>
                <textarea
                  id="audio-voice-details"
                  rows={3}
                  maxLength={VOICE_DETAILS_MAX_LENGTH}
                  value={value}
                  onChange={field.onChange}
                  placeholder="e.g. Young female voice with british accent, soft and loud. Excited, giggling"
                  className="minimal-scrollbar -mr-2 w-[calc(100%+8px)] resize-none overflow-y-auto bg-transparent pr-1 text-q-caption-l font-normal text-q-fg outline-none [scrollbar-gutter:stable] placeholder:text-q-soft"
                />
                <span className="mt-0.5 self-end text-q-caption-xs font-medium tracking-normal text-q-w-40 tabular-nums">
                  {value.length} / {VOICE_DETAILS_MAX_LENGTH}
                </span>
              </section>
            );
          }}
        />

        <Controller
          control={control}
          name="advanced"
          render={({ field }) => (
            <AdvancedSettings
              modelId={modelId}
              value={field.value as never}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <AudioCta
        disabled={!ready}
        cost={ready ? audioCost("tts", modelId, (batch as number) ?? 1) : null}
      />
    </form>
  );
}
```

- [ ] **Step 3: Write the two short forms**

Create `src/components/audio-studio/voice-change-form.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AudioLines, Upload, Video } from "lucide-react";

import { AudioCta } from "@/components/audio-studio/audio-cta";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
} from "@/schemas/audio-generation";

/** A zone holds at most one file here, so the array/File edges are bridged once. */
const one = (file: File | null) => (file ? [file] : []);

export function VoiceChangeForm({
  onSubmit,
}: {
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    mode: "onSubmit",
    defaultValues: { mode: "voice-change", voice: null, clip: null },
  });

  const voice = useWatch({ control, name: "voice" });
  const clip = useWatch({ control, name: "clip" });
  const ready = Boolean(voice) && Boolean(clip);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3"
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="voice"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Pick a voice"
              hint="Choose a preset or an uploaded voice"
              badge="Required"
              max={1}
              files={one(field.value as File | null)}
              onFilesChange={(files) => {
                field.onChange(files[0] ?? null);
              }}
              invalid={Boolean(fieldState.error)}
              pickers={[
                { icon: <AudioLines className="size-4" />, accept: "audio/*" },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="clip"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Add your clip"
              hint="Upload the video to change its voice"
              badge="Required"
              max={1}
              files={one(field.value as File | null)}
              onFilesChange={(files) => {
                field.onChange(files[0] ?? null);
              }}
              invalid={Boolean(fieldState.error)}
              pickers={[
                { icon: <Video className="size-4" />, accept: "video/*" },
                { icon: <Upload className="size-4" />, accept: "video/*" },
              ]}
            />
          )}
        />
      </div>

      <AudioCta
        disabled={!ready}
        cost={ready ? audioCost("voice-change", "", 1) : null}
      />
    </form>
  );
}
```

Create `src/components/audio-studio/translate-form.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Upload, Video } from "lucide-react";

import { AudioCta } from "@/components/audio-studio/audio-cta";
import { LanguagePopover } from "@/components/audio-studio/language-popover";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
} from "@/schemas/audio-generation";

const one = (file: File | null) => (file ? [file] : []);

export function TranslateForm({
  onSubmit,
}: {
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    mode: "onSubmit",
    defaultValues: { mode: "translate", clip: null, language: "en" },
  });

  const clip = useWatch({ control, name: "clip" });
  const ready = Boolean(clip);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3"
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="clip"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Add your clip"
              hint="Upload the video you want to dub"
              badge="Required"
              max={1}
              files={one(field.value as File | null)}
              onFilesChange={(files) => {
                field.onChange(files[0] ?? null);
              }}
              invalid={Boolean(fieldState.error)}
              pickers={[
                { icon: <Video className="size-4" />, accept: "video/*" },
                { icon: <Upload className="size-4" />, accept: "video/*" },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <LanguagePopover
              value={(field.value as string | undefined) ?? "en"}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <AudioCta
        disabled={!ready}
        cost={ready ? audioCost("translate", "", 1) : null}
      />
    </form>
  );
}
```

- [ ] **Step 4: Wire the studio root**

Replace `audio-studio.tsx`'s body with the real composition — polling, the store, and the signed-out gate, mirroring `genjutsu-studio.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";

import { AudioPanel } from "@/components/audio-studio/audio-panel";
import { TranslateForm } from "@/components/audio-studio/translate-form";
import { TtsForm } from "@/components/audio-studio/tts-form";
import { VoiceChangeForm } from "@/components/audio-studio/voice-change-form";
import { type AudioMode, DEFAULT_AUDIO_MODEL_ID } from "@/config/audio";
import { useAuth } from "@/features/auth/auth-context";
import { requestAudioGeneration } from "@/services/audio-generation";
import { fetchGeneration } from "@/services/image-generation";
import {
  useGenerationsOfKind,
  useGenerationStore,
} from "@/stores/generation-store";

/*
 * How often a running job is asked whether it has landed. Between the image
 * studio's 300ms and the video studio's 600ms, in proportion to the work: an
 * audio job takes about four seconds.
 */
const POLL_MS = 500;

export function AudioStudio() {
  const { user, openAuth } = useAuth();
  const [mode, setMode] = useState<AudioMode>("tts");
  const [modelId, setModelId] = useState(DEFAULT_AUDIO_MODEL_ID);
  const [paneTab, setPaneTab] = useState<"history" | "how">("how");

  const generations = useGenerationsOfKind("audio");
  // Actions never change identity, so selecting them needs no shallow compare.
  const enqueue = useGenerationStore((state) => state.enqueue);
  const applyStatus = useGenerationStore((state) => state.applyStatus);
  const holdRequest = useGenerationStore((state) => state.holdRequest);
  const takeRequest = useGenerationStore((state) => state.takeRequest);

  const { mutate: generate } = useMutation({
    mutationFn: requestAudioGeneration,
    onSuccess: (accepted) => {
      enqueue("audio", modelId, accepted);
      // Send them where the work actually appears.
      setPaneTab("history");
    },
  });

  /*
   * Picking up where signing in left off. `takeRequest` clears as it reads, so
   * this fires once per parked request even under StrictMode's double effects.
   */
  useEffect(() => {
    if (!user) return;
    const held = takeRequest();
    if (held?.kind === "audio") generate(held.values);
  }, [user, takeRequest, generate]);

  const pending = generations.filter((g) => g.status !== "ready");

  useQueries({
    queries: pending.map((generation) => ({
      queryKey: ["generation", generation.id],
      queryFn: async () => {
        const status = await fetchGeneration(generation.id);
        applyStatus(generation.id, status);
        return status;
      },
      refetchInterval: (query: { state: { data?: { status: string } } }) =>
        query.state.data?.status === "ready" ? false : POLL_MS,
      refetchIntervalInBackground: true,
    })),
  });

  const submit = (values: Parameters<typeof generate>[0]) => {
    if (!user) {
      holdRequest({ kind: "audio", values });
      openAuth("signup");
      return;
    }
    generate(values);
  };

  return (
    <div className="relative grid size-full min-h-0 grid-cols-[1fr] px-4 md:grid-cols-[max-content_1fr]">
      <AudioPanel mode={mode} onModeChange={setMode}>
        {mode === "tts" ? (
          <TtsForm
            modelId={modelId}
            onModelChange={setModelId}
            onSubmit={submit}
          />
        ) : mode === "voice-change" ? (
          <VoiceChangeForm onSubmit={submit} />
        ) : (
          <TranslateForm onSubmit={submit} />
        )}
      </AudioPanel>

      <div className="relative size-full">
        {/* Tasks 13–14 replace this with <AudioPane />. */}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify in the browser**

Reload `/audio`, **signed out**.

Check, against spec §15 items 4, 5, 8, 9:

1. Generate is dimmed and carries `disabled`:
   ```js
   [...document.querySelectorAll("aside button")].find((b) =>
     b.textContent.includes("Generate"),
   ).disabled;
   ```
   Expected: `true`.
2. Type only into **Voice details** — Generate stays disabled. This is the reference's behaviour and the one most likely to regress.
3. Type into the **Script** — Generate enables and shows `✦ 0.3`.
4. Raise batch to 2 — the cost reads `0.6`. Raise to 4 — `1.2`.
5. Switch the model to ElevenLabs v3 — the cost drops to `0.15` at batch 1.
6. Press Generate — the auth dialog opens and **no** generation starts.
7. Sign up through the dialog — the parked request runs **exactly once**. Confirm one POST in the network log, not two.
8. Switch to Voice Change — two `Required` zones, no model row, no batch, no advanced. Generate disabled until both files are attached.
9. Switch to Translate — one `Required` zone plus the Language row with a flag.

- [ ] **Step 6: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/audio-studio
git commit -m "Make all three audio tabs submit, gating each on its own fields

The enable rule is per-tab and specific, not 'any field touched': the
reference leaves Generate disabled when only Voice details is filled, and
copying that exactly is what stops someone paying credits for a script
they never wrote.

Submitting signed out parks validated values and opens the dialog, so an
empty script still fails in the panel rather than after a sign-up. That
is the flow the video studio already has, reused rather than rebuilt —
takeRequest clears as it reads, which is what keeps StrictMode's double
effects from generating twice."
```

---

### Task 13: The pane toolbar and How it works

**Files:**

- Create: `src/components/audio-studio/audio-pane.tsx`
- Create: `src/components/audio-studio/audio-how-it-works.tsx`
- Create: `src/config/audio-copy.ts`
- Modify: `src/components/audio-studio/audio-studio.tsx`

**Interfaces:**

- Consumes: `QTabs` from `@/components/studio/q-tabs` — **promote it to `@/components/navigation/q-tabs` first**, per the no-cross-imports rule, the same way Tasks 7 and 10 moved theirs.
- Produces:
  - `AudioPane({ tab, onTabChange, mode, generations, onGate })`
  - `AudioHowItWorks({ mode })`
  - `AUDIO_COPY: Record<AudioMode, { headline: string; sub: string; cards: { title: string; body: string }[] }>`

Spec §6.1–§6.2. The pane is **not** a card — no border, no dot grid.

- [ ] **Step 1: Promote `QTabs`**

```bash
git mv src/components/studio/q-tabs.tsx src/components/navigation/q-tabs.tsx
grep -rln "studio/q-tabs" src/ | xargs sed -i '' 's#@/components/studio/q-tabs#@/components/navigation/q-tabs#g'
pnpm typecheck
```

Expected: clean.

- [ ] **Step 2: Write the copy module**

Create `src/config/audio-copy.ts`. This is **our** copy occupying the reference's slots, per spec §6.2 — not a transcription.

```ts
import type { AudioMode } from "@/config/audio";

/*
 * The How-it-works copy, one entry per tab.
 *
 * Kept out of the component because it is content, not layout: changing a
 * headline should not mean opening a file full of container queries.
 */
export const AUDIO_COPY: Record<
  AudioMode,
  {
    headline: string;
    sub: string;
    cards: { title: string; body: string }[];
  }
> = {
  tts: {
    headline: "Turn text into speech",
    sub: "Lifelike speech from any script, ready for your projects",
    cards: [
      {
        title: "Pick or clone a voice",
        body: "Choose a preset, clone your own, or pick a model",
      },
      {
        title: "Write, describe and generate",
        body: "Type your script, describe how it sounds, and create",
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
      },
    ],
  },
};
```

- [ ] **Step 3: Write How it works**

Create `src/components/audio-studio/audio-how-it-works.tsx`:

```tsx
import { AUDIO_COPY } from "@/config/audio-copy";
import type { AudioMode } from "@/config/audio";

/**
 * The pane's default tab.
 *
 * A container query, not a media query: the card reflows on its own width,
 * which is what keeps it correct with the 342px panel open beside it.
 */
export function AudioHowItWorks({ mode }: { mode: AudioMode }) {
  const copy = AUDIO_COPY[mode];

  return (
    <div className="@container w-full overflow-hidden rounded-q-300 border border-q-subtle bg-q-panel">
      <div className="flex min-h-160 flex-col px-8 pt-10.5 pb-8 @max-[640px]:px-4 @max-[640px]:pt-7">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-q-accent-2xl text-center font-q-display text-q-fg uppercase [font-feature-settings:'ss04'] @max-[640px]:text-[28px]">
            {copy.headline}
          </h2>
          <p className="text-q-body-lg text-center text-q-soft">{copy.sub}</p>
        </div>

        <div className="mt-9.5 flex w-full flex-col gap-5 @[640px]:flex-row">
          {copy.cards.map((card) => (
            <div
              key={card.title}
              className="bg-q-section flex min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-q-600 border border-q-card px-4 pt-5 pb-4"
            >
              <div className="flex w-full flex-col gap-2 px-2">
                <h3 className="text-q-heading-sm text-q-fg">{card.title}</h3>
                {/* text-q-muted is #828282 here, deliberately — not the
                    #898a8b the panel's labels use. Both are on this page. */}
                <p className="text-q-body-md text-q-muted">{card.body}</p>
              </div>
              <div className="relative h-75 w-full overflow-hidden rounded-q-300 bg-q-w-05" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

The 300px media slot is left as a flat fill for now. Filling it with a looping fixture is a content task, not a layout one — do it only once everything else passes.

- [ ] **Step 4: Write the pane**

Create `src/components/audio-studio/audio-pane.tsx`:

```tsx
"use client";

import { BookOpen, Folder, SlidersHorizontal } from "lucide-react";

import { AudioHistory } from "@/components/audio-studio/audio-history";
import { AudioHowItWorks } from "@/components/audio-studio/audio-how-it-works";
import { QTabs } from "@/components/navigation/q-tabs";
import type { AudioMode } from "@/config/audio";
import type { Generation } from "@/types/generation.types";

export type AudioPaneTab = "history" | "how";

/**
 * The right column.
 *
 * Unlike the video studio's pane this is not a card — no border, no dot grid.
 * The toolbar floats above the scroller and the scroller is padded to clear
 * it, so content passes under the controls rather than pushing them.
 */
export function AudioPane({
  tab,
  onTabChange,
  mode,
  generations,
  onGate,
}: {
  tab: AudioPaneTab;
  onTabChange: (next: AudioPaneTab) => void;
  mode: AudioMode;
  generations: Generation[];
  onGate: () => void;
}) {
  return (
    <div className="relative size-full">
      <div className="absolute top-0 right-0 left-6 z-1 pb-3">
        <div className="relative flex w-full items-center justify-between">
          <QTabs
            label="Pane view"
            surface="bare"
            className="shrink-0"
            value={tab}
            onValueChange={(id) => {
              onTabChange(id as AudioPaneTab);
            }}
            items={[
              { id: "history", label: "History", icon: "folder" },
              { id: "how", label: "How it works", icon: "book-open" },
            ]}
          />

          {tab === "history" ? (
            <div className="flex w-max flex-row items-center gap-3">
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-q-250 border border-q-subtle bg-q-panel px-2.5 text-q-soft transition-colors outline-none hover:text-q-fg focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
              >
                <SlidersHorizontal className="size-4 shrink-0" />
                <span className="text-q-caption-l font-medium">Filters</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 left-6 overflow-hidden pt-14.5">
        <div className="size-full overflow-y-auto overscroll-none pb-4">
          {tab === "how" ? (
            <AudioHowItWorks mode={mode} />
          ) : (
            <AudioHistory generations={generations} onGate={onGate} />
          )}
        </div>
      </div>
    </div>
  );
}
```

> `QTabs`'s `items` take an `icon` name — check which names its `Icon` component
> accepts (`folder`, `book-open` are used by the video studio's `PANE_TABS`) and
> use those exact strings. The `Folder` / `BookOpen` imports above are only
> needed if `QTabs` takes nodes instead; delete them if it takes names.

- [ ] **Step 5: Mount the pane**

In `audio-studio.tsx`, replace the empty right column:

```tsx
<AudioPane
  tab={paneTab}
  onTabChange={setPaneTab}
  mode={mode}
  generations={generations}
  onGate={() => {
    openAuth("signup");
  }}
/>
```

and drop the now-unused wrapper `<div className="relative size-full">`.

- [ ] **Step 6: Verify in the browser**

Reload `/audio`.

Check:

1. The pane starts at **x=358** and has no border of its own:
   ```js
   const pane = document.querySelector("aside").parentElement.lastElementChild;
   [
     Math.round(pane.getBoundingClientRect().x),
     getComputedStyle(pane).borderTopWidth,
   ];
   ```
   Expected: `[358, "0px"]`.
2. The segmented control is 40px tall with 32px buttons; the active one carries the blurred indicator.
3. The headline renders in Space Grotesk, uppercase, **40/48** with `-1.6px` tracking:
   ```js
   const h = document.querySelector("main h2");
   [
     getComputedStyle(h).fontSize,
     getComputedStyle(h).lineHeight,
     getComputedStyle(h).letterSpacing,
   ];
   ```
   Expected: `["40px", "48px", "-1.6px"]`.
4. TTS shows **two** cards side by side; Voice Change and Translate show **one** full-width.
5. Switching panel tabs changes the headline and sub-headline.
6. The card body copy is `#828282` and the panel's labels are `#898a8b` — two different greys, both present.
7. `Filters` appears only on History.
8. Scrolling the pane passes content **under** the toolbar; the toolbar does not move.

- [ ] **Step 7: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A src/components src/config/audio-copy.ts
git commit -m "Build the audio pane as a bare column, not a card

The video studio's pane is a bordered card over a dot lattice. This one
is neither — the toolbar floats over a plain scroller and the only
rounded surface is the how-it-works card itself. Copying the video shell
here would have added a border the reference does not draw.

The card reflows on a container query rather than a media query, so it
stays correct with the 342px panel beside it, and the copy lives in its
own module because changing a headline should not mean opening a file
full of layout."
```

---

### Task 14: History — waveform tiles and playback

**Files:**

- Create: `src/components/audio-studio/waveform.tsx`
- Create: `src/components/audio-studio/waveform-tile.tsx`
- Create: `src/components/audio-studio/audio-history.tsx`

**Interfaces:**

- Consumes: `waveformBars` from Task 3, `Generation` from Task 5, `audioModelById`.
- Produces:
  - `Waveform({ id, progress, onSeek }: { id: string; progress: number; onSeek?: (fraction: number) => void })`
  - `WaveformTile({ generation }: { generation: Generation })`
  - `AudioHistory({ generations, onGate }: { generations: Generation[]; onGate: () => void })`

Spec §6.3. One `<audio>` per tile; only one plays at a time.

- [ ] **Step 1: Write the waveform**

Create `src/components/audio-studio/waveform.tsx`:

```tsx
"use client";

import { waveformBars } from "@/lib/waveform";

/**
 * The bars. Heights come from the job id, never from the file — see the
 * spec's D4: the fixtures are cross-origin and a decode is one missing header
 * away from a permanently blank tile.
 */
export function Waveform({
  id,
  progress,
  onSeek,
}: {
  id: string;
  progress: number;
  onSeek?: (fraction: number) => void;
}) {
  const bars = waveformBars(id);
  const played = Math.round(bars.length * progress);

  return (
    <div
      role={onSeek ? "slider" : undefined}
      aria-label={onSeek ? "Seek" : undefined}
      aria-valuenow={onSeek ? Math.round(progress * 100) : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      tabIndex={onSeek ? 0 : undefined}
      onClick={(event) => {
        if (!onSeek) return;
        const box = event.currentTarget.getBoundingClientRect();
        onSeek((event.clientX - box.left) / box.width);
      }}
      onKeyDown={(event) => {
        if (!onSeek) return;
        const delta =
          event.key === "ArrowRight"
            ? 0.05
            : event.key === "ArrowLeft"
              ? -0.05
              : 0;
        if (delta === 0) return;
        event.preventDefault();
        onSeek(Math.min(1, Math.max(0, progress + delta)));
      }}
      className="flex h-10 flex-1 cursor-pointer items-end gap-px outline-none focus-visible:ring-2 focus-visible:ring-q-focus"
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className={`w-0.5 rounded-full ${index < played ? "bg-q-brand" : "bg-q-w-20"}`}
          /* A continuous height fraction cannot be a utility class. */
          style={{ height: `${String(height * 100)}%` }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write the tile**

Create `src/components/audio-studio/waveform-tile.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Waveform } from "@/components/audio-studio/waveform";
import { audioModelById } from "@/config/audio";
import type { Generation } from "@/types/generation.types";

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60))}:${String(whole % 60).padStart(2, "0")}`;
};

/**
 * One generation.
 *
 * The frame is identical in every phase — shimmer while it runs, bars once it
 * lands — so nothing below it moves when the asset arrives. That is the same
 * reason the image feed reserves its tiles' space up front.
 */
export function WaveformTile({ generation }: { generation: Generation }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const duration =
    generation.status === "ready" ? (generation.duration ?? 0) : 0;
  const ready = generation.status === "ready";
  const progress = duration > 0 ? elapsed / duration : 0;

  return (
    <article className="flex flex-col gap-3 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors hover:border-q-default motion-reduce:transition-none">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          aria-label={
            playing
              ? `Pause “${generation.prompt}”`
              : `Play “${generation.prompt}”`
          }
          onClick={() => {
            const element = audio.current;
            if (!element) return;
            if (playing) {
              element.pause();
              setPlaying(false);
              return;
            }
            /* Only one tile plays at a time. Pausing every other audio element
               is cruder than a shared context and needs no shared state. */
            document.querySelectorAll("audio").forEach((other) => {
              if (other !== element) other.pause();
            });
            void element.play();
            setPlaying(true);
          }}
          className="hover:bg-q-tertiary flex size-10 shrink-0 items-center justify-center rounded-q-full bg-q-card-strong text-q-fg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-q-focus disabled:opacity-40 motion-reduce:transition-none"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>

        {ready ? (
          <Waveform
            id={generation.id}
            progress={progress}
            onSeek={(fraction) => {
              const element = audio.current;
              if (!element || !duration) return;
              element.currentTime = fraction * duration;
              setElapsed(fraction * duration);
            }}
          />
        ) : (
          <div className="h-10 flex-1 animate-pulse rounded-q-200 bg-q-w-05 motion-reduce:animate-none" />
        )}

        <span className="shrink-0 text-q-caption-l text-q-soft tabular-nums">
          {ready
            ? `${clock(elapsed)} / ${clock(duration)}`
            : generation.status === "processing"
              ? "Processing…"
              : "Generating…"}
        </span>
      </div>

      <p className="line-clamp-2 text-q-caption-l text-q-soft">
        {generation.prompt}
      </p>

      <div className="flex items-center gap-2 text-q-caption-xs font-medium tracking-normal text-q-soft">
        {audioModelById(generation.modelId)?.name ?? generation.modelId}
      </div>

      {ready ? (
        <audio
          ref={audio}
          src={generation.src}
          preload="metadata"
          onTimeUpdate={(event) => {
            setElapsed(event.currentTarget.currentTime);
          }}
          onEnded={() => {
            setPlaying(false);
            setElapsed(0);
          }}
        />
      ) : null}
    </article>
  );
}
```

- [ ] **Step 3: Write the list**

Create `src/components/audio-studio/audio-history.tsx`:

```tsx
"use client";

import { WaveformTile } from "@/components/audio-studio/waveform-tile";
import type { Generation } from "@/types/generation.types";

/**
 * The History tab.
 *
 * A single column rather than the image feed's masonry: audio has no aspect
 * ratio, so a packing algorithm would be solving a problem that does not exist.
 */
export function AudioHistory({
  generations,
  onGate,
}: {
  generations: Generation[];
  onGate: () => void;
}) {
  if (generations.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
        <p className="text-q-body-md text-q-soft">Nothing generated yet.</p>
        <button
          type="button"
          onClick={onGate}
          className="text-q-caption-l font-medium text-q-brand underline-offset-4 hover:underline"
        >
          Sign in to keep your history
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-180 flex-col gap-2">
      {generations.map((generation) => (
        <WaveformTile key={generation.id} generation={generation} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify in the browser**

Sign in, then generate a **batch of 4** from the TTS tab.

Check, against spec §15 items 10–11:

1. The pane switches to History on submit.
2. Four tiles appear immediately, each showing `Processing…` with a shimmer.
3. They flip to `Generating…` and then to bars **one at a time**, not as a clump — that is the stagger from Task 5 working.
4. Nothing below a tile moves as it lands. Watch the fourth tile's top edge while the first three resolve.
5. Pressing play on a tile plays audio; the bars fill lime left to right.
6. Pressing play on a second tile **pauses the first**.
7. Clicking mid-waveform seeks; the elapsed time jumps.
8. Reload and generate again with the same script — a given generation's bars are whatever its id makes them, and the same tile re-rendered keeps the identical shape.
9. The browser console has no errors. If audio fails to load, the fixture URLs in `config/audio-fixtures.ts` need replacing — that file's comment says so.

- [ ] **Step 5: Run the gate**

Run: `pnpm check`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/audio-studio
git commit -m "Render finished audio as a tile you can actually hear

A history row you cannot play is a list of filenames. Each tile carries
its own audio element and pauses every other one when it starts, which is
cruder than a shared playback context and needs no shared state to go
wrong.

The tile keeps its exact height from Processing through to Ready, so a
staggered batch of four lands without the column reflowing under the
cursor — the same reason the image feed reserves a tile's frame before
the picture exists."
```

---

### Task 15: The mobile sheet and the acceptance pass

**Files:**

- Create: `src/components/audio-studio/audio-sheet.tsx`
- Modify: `src/components/audio-studio/audio-panel.tsx`
- Modify: `src/components/audio-studio/tts-form.tsx` (footer stepper)

**Interfaces:**

- Consumes: everything built so far.
- Produces: `AudioSheetHeader({ onClose }: { onClose: () => void })`.

Spec §11. Per decision D8 this is container and order changes in classes, not a second component tree.

- [ ] **Step 1: Add the sheet header**

Create `src/components/audio-studio/audio-sheet.tsx`:

```tsx
"use client";

import { ChevronDown, X } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/layout/logo-mark";

/**
 * The `<md` header. Desktop has the site chrome above the studio; the phone
 * layout replaces it with a titled sheet, so this only ever renders below the
 * breakpoint.
 */
export function AudioSheetHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:hidden">
      <LogoMark className="size-8 shrink-0" />
      <span className="font-q-display text-q-brand-xxs text-q-fg uppercase">
        Create audio
      </span>
      <ChevronDown className="size-4 shrink-0 text-q-soft" />
      <Link
        href="/"
        aria-label="Close"
        className="ml-auto flex size-10 items-center justify-center rounded-q-200 bg-q-w-05 text-q-fg"
      >
        <X className="size-5" />
      </Link>
    </header>
  );
}
```

> Check `LogoMark`'s actual props before using it — if it takes no `className`,
> wrap it in a sized `<span>` instead of passing one.

- [ ] **Step 2: Make the panel a sheet below `md`**

In `audio-panel.tsx`, the `<aside>` and its card become responsive. The aside:

```tsx
    <aside className="fixed inset-0 z-50 flex flex-col bg-q-page md:relative md:inset-auto md:z-auto md:h-full md:min-h-0 md:w-85.5 md:shrink-0 md:bg-transparent md:pb-4">
```

and the card drops its frame on mobile:

```tsx
      <div className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-none md:rounded-q-600 md:border md:border-q-subtle md:bg-q-panel">
```

Render `<AudioSheetHeader />` as the aside's first child, above the tablist.

- [ ] **Step 3: Hide the pane below `md`**

In `audio-studio.tsx`, wrap the pane:

```tsx
      <div className="hidden md:block md:size-full">
        <AudioPane … />
      </div>
```

- [ ] **Step 4: Move the batch stepper into the footer on mobile**

In `tts-form.tsx`, the Batch-size `SettingRow` gains `className="hidden md:flex"` — add a `className` pass-through to `SettingRow` if it does not have one, merged through `cn()` so a caller can override.

Then the CTA wrapper becomes a row that holds both on mobile. In `audio-cta.tsx`, accept an optional `leading` slot:

```tsx
export function AudioCta({
  cost,
  disabled,
  leading,
}: {
  cost: number | null;
  disabled: boolean;
  leading?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 flex items-center gap-2 pb-3">
      {leading ? (
        <div className="shrink-0 md:hidden">{leading}</div>
      ) : null}
      <button type="submit" disabled={disabled} className="… flex-1 …">
```

and in `tts-form.tsx` pass the stepper through it:

```tsx
<Controller
  control={control}
  name="batch"
  render={({ field }) => (
    <AudioCta
      disabled={!ready}
      cost={
        ready ? audioCost("tts", modelId, (field.value as number) ?? 1) : null
      }
      leading={
        <div className="flex h-14 items-center rounded-q-300 border border-q-subtle bg-q-w-05 px-3">
          <BatchStepper
            max={MAX_BATCH}
            value={(field.value as number | undefined) ?? 1}
            onChange={field.onChange}
          />
        </div>
      }
    />
  )}
/>
```

Note the footer stepper deliberately omits `showMax` — the reference shows a bare `1` there and the ceiling only in the row.

- [ ] **Step 5: Verify at 375px**

Set the Browser pane to the mobile preset and reload `/audio`.

Check, against spec §15 item 12:

1. The panel fills the viewport; **no** right pane is rendered.
2. The header reads `CREATE AUDIO` with a close control at the right.
3. The Batch-size row is gone from the field list.
4. The footer shows a `− 1 +` pill beside a flexible Generate button.
5. The dashed drop-zone border is visible and the chips are legible.
6. The form scrolls behind a footer that stays put.
7. Nothing scrolls horizontally:
   ```js
   document.documentElement.scrollWidth <= document.documentElement.clientWidth;
   ```
   Expected: `true`.
8. Check **767px and 768px** specifically — the stepper moving between containers is where this breaks.

Reset the viewport to desktop when done.

- [ ] **Step 6: Run the full acceptance pass**

Work through all thirteen items of spec §15 at 1440×900, signed in, then the mobile items at 375px. Every one either passes or gets a fix in this task. Record anything deliberately left — for example the how-it-works media slot still being a flat fill — as a follow-up line in the commit body rather than silently shipping it.

Confirm these three in particular, since they are the ones earlier tasks could regress:

```js
// 1. Panel geometry
[
  Math.round(document.querySelector("aside").getBoundingClientRect().width),
  getComputedStyle(document.querySelector("aside > div")).borderRadius,
];
// Expected: [342, "24px"]
```

```js
// 2. Disabled CTA on an empty script
[...document.querySelectorAll("aside button")].find((b) =>
  b.textContent.includes("Generate"),
).disabled;
// Expected: true
```

```js
// 3. No page scroll
document.body.scrollHeight <= window.innerHeight;
// Expected: true
```

- [ ] **Step 7: Run the gate**

Run: `pnpm check`
Expected: clean — lint, typecheck, all tests, and Prettier.

- [ ] **Step 8: Commit**

```bash
git add -A src/components/audio-studio
git commit -m "Turn the audio panel into a sheet on phones without forking it

Below md the panel fills the viewport, the pane is not rendered, and the
batch stepper leaves its row to sit beside the CTA. All three are
container and order changes, so they are classes on the components that
already exist — a second tree would have drifted from this one by the
first change either side.

Verified at 767 and 768 specifically, since the stepper moving between
containers is the seam most likely to break."
```

---

## Self-review

Run before handing this plan to an executor.

**Spec coverage.** Every section of the spec maps to a task:

| Spec                                  | Task                     |
| ------------------------------------- | ------------------------ |
| §3 App shell and grid                 | 8                        |
| §4 Token layer                        | 1                        |
| §5.1 Panel tabs                       | 8                        |
| §5.2 Upload zone                      | 9                        |
| §5.3 Script field                     | 10                       |
| §5.4 Model row and popover            | 10                       |
| §5.5 Batch size                       | 7 (primitive), 10 (row)  |
| §5.6 Voice details                    | 12                       |
| §5.7 Advanced settings                | 11                       |
| §5.8 Voice Change and Translate forms | 12                       |
| §5.9 Generate and cost                | 3 (formula), 12 (button) |
| §6.1 Pane toolbar                     | 13                       |
| §6.2 How it works                     | 13                       |
| §6.3 History and waveform             | 3 (bars), 14 (tiles)     |
| §7 Schema                             | 4                        |
| §8 Pipeline                           | 5, 6                     |
| §9 Behaviour and state                | 12                       |
| §10 Logged-out gate                   | 12                       |
| §11 Responsive                        | 15                       |
| §12 Accessibility                     | 8, 10, 11, 14            |
| §13 File map                          | all                      |
| §15 Acceptance                        | 15                       |

**Known gaps, carried deliberately:**

1. **The how-it-works 300px media slot ships as a flat fill** (Task 13). The reference animates a voice carousel and a form mock there. It is content, not layout, and filling it does not change any measurement — do it after Task 15 passes, or leave it.
2. **The Filters popover is a button with no menu** (Task 13). Spec §6.1 specifies its two groups; the button is in place and correctly styled, but History has no filtering to drive yet. Wire it when History has enough entries to need it.
3. **Voice cloning is out of scope** and stated as such in spec §1. The `Pick a voice` zone accepts an upload; it does not offer presets.

**Type consistency.** Names used across task boundaries, checked against their definitions:

- `waveformBars(id, count?)` — Task 3 defines, Task 14 calls. ✓
- `audioCost(mode, modelId, batch)` — Task 3 defines, Task 12 calls. ✓
- `serialiseScript(html)` — Task 3 defines, Task 10 calls. ✓
- `ttsDefaults(modelId)` — Task 4 defines, Tasks 11 and 12 call. ✓
- `AdvancedFormValues` — Task 4 exports, Tasks 11 and 12 consume. ✓
- `createAudioJobs(request)` — Task 5 defines, Task 5's endpoint calls. ✓
- `requestAudioGeneration(values)` — Task 6 defines, Task 12 calls. ✓
- `BatchStepper({ value, max, onChange, showMax })` — Task 7 defines, Tasks 12 and 15 call. ✓
- `SettingRow({ label, value, stacked, trailing, onClick, ref })` — Task 10 defines, Tasks 11 and 12 call. Task 15 adds `className`. ✓
- `AudioCta({ cost, disabled })` — Task 12 defines; Task 15 adds `leading`. ✓
- `AudioPane({ tab, onTabChange, mode, generations, onGate })` — Task 13 defines, Task 13 mounts. ✓

**Three moves that must happen before their consumers**, all because feature folders may not import from each other:

| Moved                                                            | By      | Needed by    |
| ---------------------------------------------------------------- | ------- | ------------ |
| `batch-stepper.tsx`, `setting-popover.tsx` → `components/forms/` | Task 7  | Tasks 11, 12 |
| `q-popover.tsx`, `use-dismiss.ts` → `components/overlays/`       | Task 10 | Tasks 10, 11 |
| `q-tabs.tsx` → `components/navigation/`                          | Task 13 | Task 13      |

If tasks are executed out of order, these are the dependencies that will bite.
