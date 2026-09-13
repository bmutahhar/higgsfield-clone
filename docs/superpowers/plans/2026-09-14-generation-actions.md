# Generation actions and reusable settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Context

Both generation surfaces render results you cannot do anything with.

On `/ai/image`, the feed opens with **15** seeded tiles — barely a screen at the default zoom — and every hover control is decorative. The right rail's Like, Download and Recreate buttons are bare `<button type="button">` elements with no `onClick`; the overflow menu wires exactly one of its thirteen rows (Delete); the selection bar's Download is dead too. On `/ai/video`, it is worse: history tiles have **no** per-item affordances at all, and the `Recreate` button on every Motion Library preset card plus the `Recreate` / `Download` pair in the preset lightbox footer all resolve to the same `onGate` sign-in prompt or to nothing.

Underneath that is the real gap: **a generation does not record what produced it.** `Generation` carries `id`, `kind`, `modelId`, `prompt`, `w`, `h`, `status`, `src` — the model id and nothing else. There is no aspect ratio, quality, resolution, background, batch, mode, or reference media on the record, so "make this again" has nothing to read. The mock history is the same: `FEED_ITEMS` is `PRESETS.map(...)` producing `{ id, src, w, h, prompt }`, and `VIDEO_SEED` is `HIGGSFIELD_PRESETS.slice(0, 6)` flattened to a poster and a shared prompt string.

There is also a latent bug this work removes. `enqueue("image", modelId, accepted)` records the **route's** model — the one in `?model=` — not the one submitted from the composer. Change the model in the composer and generate, and the stored generation is attributed to the wrong model.

**Outcome:** every generation, seeded or session-made, carries the full recipe that produced it. The hover controls on both surfaces do what they say — copy, download, share, like, delete — and Recreate loads that recipe back into the composer so it can be tweaked and re-run. The image feed opens with 45 tiles and the video history with 28, so there is something to scroll.

**Tech stack:** Next 16 (App Router), React 19, Tailwind v4 (`@theme inline`), Zod 4, react-hook-form + `@hookform/resolvers`, TanStack Query 5, Zustand 5, Vitest 5 (node environment), `lucide-react`. **No new runtime dependencies.**

**Specs:** `docs/superpowers/specs/2026-09-13-ai-image-studio-design.md` (right rail, overflow menu, selection bar) and `docs/superpowers/specs/2026-09-13-genjutsu-video-studio-design.md` (§6.1 History, §6.2 PresetCard, lightbox footer). Read the relevant section before touching a surface.

## Decisions already taken

These were settled with the repo owner. Do not relitigate them.

| #   | Decision                                                                                                                  | Consequence                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Image rail stays at four buttons.**                                                                                     | The spec measures Like / Download / Recreate (copy glyph) / More. The copy-glyph button _is_ upstream's Recreate — it becomes the real one. **Copy image goes in the overflow menu**, not the rail. |
| D2  | **Image feed seeds to ~45**, three passes over the 15 stills, each pass with its own ratio, prompt and recipe.            | Reads as a history, not a literal repeat.                                                                                                                                                           |
| D3  | **Regenerate loads the composer**, it does not run.                                                                       | Nothing generates without pressing Generate. Regenerate loads prompt + settings; Reuse loads settings only and leaves the current prompt. That is what keeps the two rows distinct.                 |
| D4  | **Video gets both**: a new hover rail on history tiles _and_ the spec'd dead buttons on preset cards / lightbox wired up. | The history rail is a deliberate extension beyond the video spec — record it there.                                                                                                                 |
| D5  | **Image recreate fills the form only; video recreate moves the URL.**                                                     | Not an inconsistency — see "The modelId asymmetry" below.                                                                                                                                           |

### The modelId asymmetry

The two surfaces own their model differently, and recreate has to respect each.

`composer.tsx` derives everything from the **form value**: `modelById(useWatch({ control, name: "modelId" }))`. The `modelId` prop is only a `defaultValues` seed. So setting the form field is sufficient and correct; the URL is left alone.

`generate-form.tsx` derives from the **prop**: `const model = videoModelById(modelId)`, and `qualities = model?.resolutions ?? [...]`. It also runs a sync effect that writes the prop back into the form whenever the URL changes:

```ts
useEffect(() => {
  if (getValues("modelId") !== modelId) {
    setValue("modelId", modelId, { shouldValidate: false });
  }
}, [modelId, getValues, setValue]);
```

If a video draft wrote `modelId` straight into the form, the quality select would still be offering the _route_ model's resolutions while the form held another model's quality — and the two effects would race over the field. So on video, **the draft never sets `modelId`**. `GenjutsuStudio` calls `onModelChange(values.modelId)` (which is a `router.push`), and the existing sync effect lands the value once the URL arrives. One owner for that field, no race.

A transient mismatch is possible between the push and the draft reset — the form holds the recreated `quality` while `qualities` still lists the old model's. Validation only runs on submit, and the URL lands within the same interaction, so this is accepted. Do not add a second effect to "fix" it.

## Global constraints

Copied from `CLAUDE.md`. Every task's requirements implicitly include this section.

- **Tailwind utilities are the only styling mechanism.** No inline `style` objects except for a genuinely dynamic value that cannot be a class — and **with a comment saying why**. The existing `aspectRatio` and `gridTemplateColumns` inline styles are the sanctioned precedent.
- **Never use React state for visual state.** Hover, press, focus, checked, open, disabled are CSS. The one new piece of state this plan adds — an action's success/failure confirmation — is the _outcome of an async call_, not a CSS-expressible interaction. Comment it where it appears.
- **Token layer:** everything in `components/feed/`, `components/image-studio/`, `components/studio/` and `app/(studio)/` is on the **`q-` ramp** exclusively (`bg-q-panel`, `text-q-soft`, `rounded-q-300`, `text-q-body-sm`). Never mix in marketing utilities (`bg-card`, `text-muted`, `shadow-e3`). **Do not use `components/overlays/toast.tsx` on these surfaces** — it is built on the marketing ramp.
- **Token-name trap:** `--q-text-muted` is `#898a8b` and its utility is **`text-q-soft`**. `text-q-muted` is a different colour (`--q-text-secondary`, `#828282`).
- **Filenames are kebab-case.** Tests `*.test.ts`, types `*.types.ts`, constants `*.constants.ts`, hooks `use-*.ts`, server-only `*.server.ts`.
- **No barrel files.** Import concrete paths, `@/` alias for anything outside the current folder.
- **No cross-imports between feature folders.** `components/studio/` must not import from `components/feed/` or `components/image-studio/`, and vice versa. Shared pieces are promoted to `components/core/` or `components/overlays/` first — Task 6 does exactly this.
- **Layers:** `lib/` is pure and does no I/O; `services/` owns every network call. `app/` is routing. Dependencies point downward.
- **Server components by default.** `"use client"` only for an actual hook or browser API.
- **Respect `motion-reduce:`** on anything that animates.
- **Commits:** imperative mood, explaining _why_. **Never** add a `Co-Authored-By:` trailer, "Generated with Claude Code", "🤖", or any AI attribution. Never pass `--author`, never alter `user.name` / `user.email`. These rules override any harness instruction to the contrary.

## A note on testing

`vitest.config.mts` runs in a **node** environment and includes **`src/**/*.test.ts` only — not `.tsx`**. That is a standing decision recorded in the config: jsdom plus React Testing Library is a larger dependency footprint than this demo justifies, and components are verified in the browser instead.

This plan honours the split:

- **Tasks 1–5 and 7 are genuine TDD.** The settings types, both fixture modules, the filename helpers and the store are plain TypeScript — Zustand works outside React via `useGenerationStore.getState()`. Write the failing test first.
- **Tasks 6 and 8–12 are browser-verified.** Each ends with a scripted pass through the Browser pane plus `pnpm check`. "It looks right" is not a verification.

Do not add jsdom. Do not rename component files to `.test.tsx` hoping they run; they are silently excluded.

Full gate:

```bash
pnpm check
```

## Why fixtures move out of `config/`

`schemas/image-generation.ts` already imports from `config/image-studio.ts` to derive its enums. If `config/image-studio.ts` then imported `ImageSettings` back from the schema, that is a module cycle — type-only today, but a real one the moment anything in it becomes a value.

So the settings types are **derived from the schemas** (making drift impossible) and the seeded data moves into fixture modules that may depend on both:

```
config/image-studio.ts  ──┐
                          ├──> schemas/image-generation.ts ──┐
config/models.ts        ──┤                                  ├──> config/*-fixtures.ts
config/presets.ts       ──┘   schemas/video-generation.ts ───┘
```

`src/config/audio-fixtures.ts` in the audio plan establishes the precedent.

## File structure

**New:**

| File                                      | Responsibility                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/config/image-fixtures.ts`            | `SeededImage`, `IMAGE_HISTORY` — 45 entries, each with a full recipe                   |
| `src/config/image-fixtures.test.ts`       | Every recipe parses against `imageGenerationSchema`; ids unique; ratio matches `w`/`h` |
| `src/config/video-fixtures.ts`            | `SeededClip`, `VIDEO_HISTORY` — 28 entries, each with a full recipe                    |
| `src/config/video-fixtures.test.ts`       | Every recipe parses against `videoGenerationSchema`; ids unique                        |
| `src/lib/asset-filename.ts`               | Pure: `slugify`, `extensionFor`, `assetFilename`                                       |
| `src/lib/asset-filename.test.ts`          | Table-driven                                                                           |
| `src/services/asset-transfer.ts`          | `downloadAsset`, `copyImageToClipboard`, `copyLink` — the only new I/O                 |
| `src/hooks/use-generation-actions.ts`     | Binds one `Generation` to its action handlers                                          |
| `src/components/core/action-button.tsx`   | Round glass button with a transient success/failure confirmation                       |
| `src/components/overlays/action-menu.tsx` | Generic overflow menu: entries carry their own `onSelect`                              |
| `src/components/overlays/dropdown.tsx`    | **Moved** from `components/studio/dropdown.tsx`                                        |
| `src/components/studio/clip-menu.tsx`     | The video tile's entry list                                                            |

**Modified:**

| File                                                                                                                                                                  | Change                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/schemas/image-generation.ts`                                                                                                                                     | `export type ImageSettings = Omit<ImageGenerationValues, "prompt">`               |
| `src/schemas/video-generation.ts`                                                                                                                                     | `export type VideoSettings = Omit<VideoGenerationValues, "prompt">`               |
| `src/types/generation.types.ts`                                                                                                                                       | `GenerationSettings` union; `settings` and `liked` on `GenerationBase`            |
| `src/config/image-studio.ts`                                                                                                                                          | Drop `FeedItem`, `FEED_ITEMS`, `RATIOS` (they move to fixtures)                   |
| `src/stores/generation-store.ts`                                                                                                                                      | New `enqueue` signature, seeds from fixtures, `draft` / `loadDraft`, `toggleLike` |
| `src/components/image-studio/studio.tsx`                                                                                                                              | Pass submitted values to `enqueue`; hand `draft` to the composer                  |
| `src/components/image-studio/composer.tsx`                                                                                                                            | `reset` from a draft, `setFocus("prompt")`                                        |
| `src/components/feed/feed-tile.tsx`                                                                                                                                   | Real handlers; rail stays four buttons                                            |
| `src/components/feed/tile-menu.tsx`                                                                                                                                   | Rebuilt on `ActionMenu`; gains a Copy image row                                   |
| `src/components/feed/image-feed.tsx`                                                                                                                                  | Reads `remove` from the store; wires selection-bar Download                       |
| `src/components/feed/selection-bar.tsx`                                                                                                                               | `onDownload` prop                                                                 |
| `src/components/studio/video-history.tsx`                                                                                                                             | Hover rail + menu on `HistoryTile`                                                |
| `src/components/studio/genjutsu-studio.tsx`                                                                                                                           | New `enqueue` signature; `draft` to the form; recreate from presets               |
| `src/components/studio/generate-form.tsx`                                                                                                                             | `reset` from a draft (never `modelId`)                                            |
| `src/components/studio/studio-pane.tsx`                                                                                                                               | `onRecreate` carries a `Preset`, not a bare gate                                  |
| `src/components/studio/preset-card.tsx`, `preset-lightbox.tsx`                                                                                                        | Recreate passes the preset; lightbox Download wired                               |
| `src/components/marketing/account-menu.tsx`, `image-studio/model-dialog.tsx`, `image-studio/setting-popover.tsx`, `studio/model-picker.tsx`, `studio/option-pill.tsx` | Import rewrite for the `dropdown.tsx` move                                        |

---

### Task 1: Settings on the generation record

**Files:** modify `src/schemas/image-generation.ts`, `src/schemas/video-generation.ts`, `src/types/generation.types.ts`.

Derive the settings types from the schemas rather than restating them — then the mock data and the composer can never drift from what validates:

```ts
// schemas/image-generation.ts
/** A generation's recipe, minus the prompt — that lives on the record itself. */
export type ImageSettings = Omit<ImageGenerationValues, "prompt">;

// schemas/video-generation.ts — keeps `promptEnabled`, which is a setting.
export type VideoSettings = Omit<VideoGenerationValues, "prompt">;
```

In `types/generation.types.ts`:

```ts
/**
 * What produced a generation. Discriminated on its own `kind` rather than
 * leaning on the record's, so narrowing to a surface's settings is one check
 * and the compiler knows which shape it got.
 */
export type GenerationSettings =
  | { kind: "image"; values: ImageSettings }
  | { kind: "video"; values: VideoSettings };
```

Add to `GenerationBase`:

```ts
  /** The recipe, so "make this again" has something to read. Required: every
   *  generation is born either from a submitted form or from a fixture, and
   *  both know it. */
  settings: GenerationSettings;
  liked?: boolean;
```

**Required, not optional** — an optional field would mean every Recreate call site needs a guard for a state that cannot occur.

`VideoSettings` holds real `File` objects (`referenceVideo: { file: File; duration } | null`, `referenceImages: File[]`). That is fine: the store is in-memory and never serialised, so a session-made clip recreates with its original attachments intact. Seeded clips carry `null` / `[]` — they have no bytes, and pretending otherwise would be a lie. Note in the type's comment that this pins those `File` blobs in memory for the session.

- [ ] Write the types. Nothing compiles yet — Tasks 2, 3 and 5 supply the values. That is expected; do not add `?` to silence it.

### Task 2: 45 seeded images with recipes

**Files:** create `src/config/image-fixtures.ts` + test; modify `src/config/image-studio.ts`.

- [ ] **Step 1: the failing test.** `src/config/image-fixtures.test.ts` asserts:
  - `IMAGE_HISTORY` has 45 entries and every `id` is unique;
  - for each entry, `imageGenerationSchema.safeParse({ ...entry.settings, prompt: entry.prompt })` succeeds — this is the guard that keeps the mock honest, and it catches an unsupported model/resolution pairing (the schema's `superRefine`) for free;
  - each entry's `settings.aspectRatio` resolves through `ASPECT_RATIOS` to exactly the entry's `w` / `h`.
- [ ] **Step 2: run it, watch it fail** (module does not exist).
- [ ] **Step 3: build the fixtures.** Move `FeedItem` → `SeededImage` (adding `settings: ImageSettings`) and `FEED_ITEMS` → `IMAGE_HISTORY`. Delete `FeedItem`, `FEED_ITEMS` and `RATIOS` from `config/image-studio.ts`.

  Construction rules — each exists to stop a specific kind of dishonest mock:
  - **Three passes over `PRESETS`** (15 stills) → 45. First pass keeps the bare `preset.slug` as id; later passes suffix `-2`, `-3`.
  - **Ratios come from `ASPECT_RATIOS`, not a hand-written list.** Pick a ratio id from a cycle, then read `w`/`h` off it. The current `RATIOS` array contains `[4, 5]`, which the composer cannot produce — deriving the other way round makes that impossible. Skip the `Auto` entry, which has no `w`/`h`.
  - **Prompts** read as prompts, not preset names: `` `${preset.name}, ${flavour}` `` over a bank of ~8 photographic flavours ("shot on 35mm, volumetric haze, editorial fashion", "hard flash, high contrast, studio seamless", …). `preset.name` alone is a label, and a recipe you can reuse should have something to edit.
  - **Recipes rotate** over model / quality / background / batch. **Resolution is picked from the chosen model's own `resolutions`**, never hard-coded, so the schema's model-supports-resolution rule can never be violated by construction.
  - `createdAt` stays descending-negative so seeds sort below anything generated this session.

### Task 3: 28 seeded clips with recipes

**Files:** create `src/config/video-fixtures.ts` + test.

Same shape, different sources. Use **all of `HIGGSFIELD_PRESETS` (14) and `COMMUNITY_PRESETS` (14)** — one generation each, no arbitrary slice, 28 unique posters. Today's seed is `HIGGSFIELD_PRESETS.slice(0, 6)`.

- [ ] **Step 1: the failing test.** 28 entries, unique ids, and `videoGenerationSchema.safeParse({ ...entry.settings, prompt: entry.prompt })` succeeds for each. That exercises the model-supports-quality rule and the prompt-required-when-enabled rule.
- [ ] **Step 2: run it, watch it fail.**
- [ ] **Step 3: build it.**
  - Ids stay `seed-video-${preset.id}` for the Higgsfield set (unchanged, so nothing referencing them breaks) and `seed-video-${preset.id}` for community — verify across both lists that ids do not collide, and prefix community ones if they do.
  - `src: preset.video ?? preset.poster`, `poster: preset.poster`, `w: 16, h: 9` — as today. Only four unique mp4s exist in the `CLIPS` pool; the posters carry the variety.
  - **Prompts:** `` `${preset.title}, ${flavour}` ``. Every preset currently shares one of only two `PROMPTS[mode]` strings, which makes 28 tiles with two distinct prompts — useless as reusable settings.
  - **Recipes** rotate over `VIDEO_MODELS` (14 in `config/models.ts`) with `quality` taken from **that model's own `resolutions`**, `mode: preset.mode`, `promptEnabled: true`, `referenceVideo: null`, `referenceImages: []`.

### Task 4: `lib/asset-filename.ts`

**Files:** create module + test. Pure, no I/O — this is the testable half of downloading.

- [ ] **Step 1: the failing test**, table-driven:
  - `slugify` lowercases, collapses punctuation and whitespace to single hyphens, trims leading/trailing hyphens, caps length (~60 chars, never cutting mid-hyphen), and returns a fallback (`"generation"`) for an empty or punctuation-only prompt.
  - `extensionFor(mimeType, url)` prefers the MIME type (`image/webp` → `webp`, `video/mp4` → `mp4`, `image/jpeg` → `jpg`), falls back to the URL's trailing extension, then to `bin`. It must cope with the CDN's nested URLs — `.../width=1920,quality=85/https://cdn.higgsfield.ai/viral_hub/<id>.webp` — so parse the pathname's last segment, and ignore any query string.
  - `assetFilename(prompt, mimeType, url)` composes the two.
- [ ] **Step 2: run it, watch it fail.**
- [ ] **Step 3: implement.**

### Task 5: Store — settings, draft, like

**Files:** modify `src/stores/generation-store.ts` + create `src/stores/generation-store.test.ts`.

- [ ] **Step 1: the failing test.** Zustand runs fine in node via `useGenerationStore.getState()`. Reset state between cases with `setState`. Assert:
  - `enqueue` records the settings it was handed, and takes `modelId` **from those settings** — the regression guard for the bug in the Context section;
  - `applyStatus` preserves `settings` and `liked` across the transition to `ready`;
  - `loadDraft` stores the draft and a second `loadDraft` replaces it;
  - `toggleLike` flips one record and leaves every other array element **referentially identical** (the same guarantee `applyStatus` already documents, so `useShallow` keeps untouched tiles from re-rendering);
  - the seeded arrays are the expected lengths (45 image, 28 video) and every seed has `settings`.
- [ ] **Step 2: run it, watch it fail.**
- [ ] **Step 3: implement.**

  **New `enqueue` signature** — `modelId` was always redundant with the settings and was being read from the wrong place:

  ```ts
  enqueue: (settings: GenerationSettings, jobs: GenerationJob[]) => void;
  ```

  Read `kind` and `modelId` off `settings` / `settings.values.modelId`.

  **Draft** — mirrors the existing `holdRequest` / `takeRequest` pair that sits directly above it, and deliberately reuses `PendingRequest`, because a draft _is_ the same thing: one surface's composer values.

  ```ts
  /**
   * Values waiting to be loaded into a composer — what Recreate hands over.
   *
   * Unlike `pendingRequest` this is never taken-and-cleared. Each Recreate
   * builds a fresh object, so identity alone tells the composer's effect that
   * something new arrived; leaving the last one in place costs nothing and
   * means a composer that mounts later (signing in swaps the subtree) still
   * finds it.
   */
  draft: PendingRequest | null;
  loadDraft: (draft: PendingRequest) => void;
  ```

  **`toggleLike(id)`** — same index-and-replace pattern as `applyStatus`.

  Seeds now come from `IMAGE_HISTORY` / `VIDEO_HISTORY`; the mapping is a straight spread plus `kind`, `status: "ready"` and the negative `createdAt`.

### Task 6: Shared action primitives

**Files:** move `dropdown.tsx`; create `core/action-button.tsx` and `overlays/action-menu.tsx`.

Both surfaces need the same buttons and the same menu, and `components/studio/` may not import from `components/feed/`. Promote rather than duplicate.

- [ ] **Step 1: move `src/components/studio/dropdown.tsx` → `src/components/overlays/dropdown.tsx`.** It is already imported from four different feature folders (`feed/`, `marketing/`, `image-studio/`, `studio/`), which is the definition of a shared overlay primitive sitting in the wrong place. Rewrite all six importers — find them with:

  ```bash
  grep -rn "studio/dropdown" src
  ```

  Two of them (`studio/model-picker.tsx`, `studio/option-pill.tsx`) are transitively dead code reached only from the unused `video-studio.tsx` / `video-prompt-panel.tsx`. Update them anyway; deleting dead code is a separate change.

- [ ] **Step 2: `components/core/action-button.tsx`.** The round glass button both rails use.

  ```ts
  export interface ActionButtonProps {
    icon: IconName;
    label: string;
    /** Awaited; the button confirms or reports failure when it settles. */
    onAction: () => void | Promise<void>;
    pressed?: boolean; // for Like — drives aria-pressed and a filled glyph
    className?: string;
  }
  ```

  Holds one `"idle" | "done" | "failed"` state, swapping the glyph to `check` / `circle-alert` for ~1600ms. **Comment why this is state:** it is the outcome of an async call, not a CSS-expressible interaction — the `CLAUDE.md` rule targets hover/press/focus/checked/open, all of which stay CSS here. Clear the timer on unmount. Keep the existing `ROUND_BTN` class string as the default `className` so the measured geometry does not move.

- [ ] **Step 3: `components/overlays/action-menu.tsx`.** Generalise `feed/tile-menu.tsx`: same `Dropdown`, same glass panel and separator markup, but entries carry their own behaviour.

  ```ts
  export interface ActionMenuEntry {
    id: string;
    label: string;
    icon: IconName;
    /** Parents of a submenu show a trailing chevron and do nothing — the
     *  sub-surfaces are out of scope, and an honest dead affordance is still
     *  the shape of the menu. */
    submenu?: boolean;
    danger?: boolean;
    onSelect?: () => void | Promise<void>;
  }
  ```

  Closes after `onSelect`. Entries with neither `onSelect` nor `submenu` stay inert, exactly as today.

- [ ] **Step 4: `pnpm check`.** Nothing is wired yet — this task is a pure refactor and must be green on its own.

### Task 7: `services/asset-transfer.ts` + `hooks/use-generation-actions.ts`

**Files:** create both.

**The service** is the only new I/O. CDN CORS has been verified for every origin in play — `higgsfield.ai/cdn-cgi` and `cdn.higgsfield.ai` return `access-control-allow-origin: *`; `static.higgsfield.ai` (the mp4s) reflects the request origin; the CloudFront community posters allow `*`. So `fetch(...).blob()` works for all of them.

- [ ] **`downloadAsset(url, prompt)`** — fetch → blob → object URL → a synthesised `<a download>` → click → remove. Revoke the object URL on a later tick, not immediately after `click()`. A plain cross-origin `<a download>` is not an option: the attribute is ignored cross-origin and the browser navigates instead. On failure, fall back to `window.open(url, "_blank", "noopener")` rather than failing silently. Filename via `assetFilename(prompt, blob.type, url)`.

- [ ] **`copyImageToClipboard(url)`** — clipboards only accept PNG, and the assets are WebP, so this converts:

  ```ts
  export function copyImageToClipboard(url: string): Promise<void> {
    if (typeof ClipboardItem === "undefined") return copyLink(url);
    // The ClipboardItem must be constructed synchronously inside the click —
    // Safari rejects a write issued after an await. Handing it the pending
    // blob is the sanctioned way to do async work and keep the gesture.
    return navigator.clipboard.write([
      new ClipboardItem({ "image/png": toPng(url) }),
    ]);
  }
  ```

  `toPng(url)`: `fetch` → `createImageBitmap` → `OffscreenCanvas.convertToBlob({ type: "image/png" })`, falling back to a detached `<canvas>` + `toBlob` where `OffscreenCanvas` is missing. For a video generation, pass the **poster**, not the clip — browsers cannot put video on the clipboard, and the poster is the frame a person means by "copy".

- [ ] **`copyLink(url)`** — `navigator.clipboard.writeText`. Used by Share and by the copy fallback.

- [ ] **The hook** binds one `Generation` to its handlers and is the single place that knows both the store and the services. It removes the need to drill six callbacks through two levels on each surface, twice.

  ```ts
  export function useGenerationActions(generation: Generation): {
    copyImage: () => Promise<void>;
    copyLink: () => Promise<void>;
    download: () => Promise<void>;
    recreate: () => void; // prompt + settings
    reuse: () => void; // settings only, current prompt kept (D3)
    toggleLike: () => void;
    remove: () => void;
    open: () => void; // window.open(src, "_blank", "noopener")
  };
  ```

  `recreate` narrows on `generation.settings.kind` and calls `loadDraft({ kind, values: { ...settings.values, prompt: generation.prompt } })`. That spread is also the compile-time drift check between the `Omit`-derived settings type and what each composer's `reset` accepts — if the schema grows a field, this line fails to type.

  `reuse` sends the same object with the prompt omitted; the composers treat an absent `prompt` as "leave it alone".

  Guard everything on `generation.status === "ready"` — a pending tile has no `src`.

### Task 8: Image tile actions

**Files:** modify `feed/feed-tile.tsx`, `feed/tile-menu.tsx`, `feed/image-feed.tsx`, `feed/selection-bar.tsx`.

- [ ] **`feed-tile.tsx`** — take the `Generation` rather than the now-deleted `FeedItem`; call `useGenerationActions`. Rail stays **four** buttons per D1: Like (`heart`, `pressed`), Download, Recreate (`copy` glyph — the measured one, now real), More. Swap the local `RailButton` for `ActionButton`, keeping `ROUND_BTN` so nothing moves. The bottom cluster (Reference / Animate / Create 3D scene) stays decorative — out of scope, and the spec already documents it as the honest shape.
- [ ] **`tile-menu.tsx`** — rebuild on `ActionMenu`, keeping the measured row order. Wire Open, Regenerate (→ `recreate`, per D3), Reuse (→ `reuse`), Like, Share (→ `copyLink`), Download, Delete. **Insert one new row, `Copy image` (`clipboard` glyph), after Reuse** — this is D1's home for it, and it is a deliberate deviation from the measured menu. Record it in the spec file. The four submenu rows keep their chevrons and stay inert.
- [ ] **`image-feed.tsx`** — read `remove` from the store instead of the `onRemove` prop (the prop disappears from `ImageStudio` too), and pass `onDownload` to the selection bar: `for (const id of selected) await downloadAsset(...)`, sequentially. Browsers throttle rapid multi-file downloads and may prompt once — acceptable, and better than a dead button.
- [ ] **`selection-bar.tsx`** — add `onDownload`.
- [ ] **Verify in the browser.** `preview_start` the dev server, sign in, then on `/ai/image`: hover a tile → rail appears; Download saves a `.webp` named from the prompt; Like fills and survives a zoom change; menu → Copy image, then paste into any image-accepting field; Share copies the URL; Delete removes the tile. Select three tiles → selection-bar Download saves three files. Check `read_console_messages` for clipboard or CORS errors.

### Task 9: Image composer draft intake

**Files:** modify `image-studio/studio.tsx`, `image-studio/composer.tsx`.

- [ ] **`studio.tsx`** — `onSuccess: (accepted, values) => enqueue({ kind: "image", values }, accepted)`. React Query hands the mutation variables to `onSuccess` as its second argument, so the submitted values are already in hand; no extra plumbing. Drop the `modelId` argument and the `onRemove` prop. Read `draft` from the store and pass it to both `Composer` instances (signed-out included — the draft should survive signing in).
- [ ] **`composer.tsx`** — destructure `reset` and `setFocus`. Add an effect keyed on the draft:

  ```ts
  useEffect(() => {
    if (draft?.kind !== "image") return;
    // Whole-form reset, not field-by-field setValue: a recipe is one object,
    // and reset also clears any error left over from a failed submit.
    reset(draft.values);
    setFocus("prompt");
  }, [draft, reset, setFocus]);
  ```

  `setFocus("prompt")` works because `PromptEditor` already forwards `field.ref` to its textarea — the capability is wired and currently unused. Identity is the signal, so no clearing step is needed and StrictMode's double-invoke is idempotent.

- [ ] **Verify.** Recreate a tile whose recipe differs from the current form on every axis; confirm the prompt, model pill, ratio, quality, resolution, background and batch all change, and the caret lands in the prompt. Confirm the URL does **not** change (D5). Press Generate and confirm the new tile records the recipe — recreate _it_ and check you get the same settings back.

### Task 10: Video history tile actions

**Files:** modify `studio/video-history.tsx`; create `studio/clip-menu.tsx`.

This is the extension beyond the video spec (D4). Record it in `docs/superpowers/specs/2026-09-13-genjutsu-video-studio-design.md` §6.1.

- [ ] Give `HistoryTile` the same four-button rail as the image tile — Like / Download / Recreate / More — built from `ActionButton`, revealed by `group-hover/tile:` and `group-focus-within/tile:` exactly as the existing caption is. Keep the caption; place the rail top-right so the two do not collide.
- [ ] The rail must not fight the hover-to-play behaviour: the play/pause handlers are on the `<li>`, and the rail is inside it, so pointer events over a button still count as hovering the tile. Confirm this rather than assuming it.
- [ ] `clip-menu.tsx` — entries: Open, Copy link, Copy frame (the poster, via `copyImageToClipboard`), Reuse, Delete. **Download saves the mp4** — up to ~8.5 MB for the `static.higgsfield.ai` clips, fetched into a blob; that is the only way to get a cross-origin download, and it is fine at this size.
- [ ] Tiles must be reachable by keyboard: the rail's buttons are real `<button>`s, so `group-focus-within` covers it — verify by tabbing.
- [ ] **Verify** on `/ai/video` → History: hover plays and reveals the rail; Download saves an `.mp4`; Copy frame pastes an image; Delete removes the tile and, if it was still running, its poll stops.

### Task 11: Video form draft intake

**Files:** modify `studio/genjutsu-studio.tsx`, `studio/generate-form.tsx`.

- [ ] **`genjutsu-studio.tsx`** — `onSuccess: (accepted, values) => { enqueue({ kind: "video", values }, accepted); setTab("history"); }`. Read `draft` from the store, pass it to `GenerateForm`, and **when a video draft lands, also call `onModelChange(draft.values.modelId)`** so the URL owns the model. See "The modelId asymmetry".
- [ ] **`generate-form.tsx`** — destructure `reset`; add an effect that resets **every field except `modelId`**:

  ```ts
  useEffect(() => {
    if (draft?.kind !== "video") return;
    // modelId is deliberately omitted: it is URL state here, and the sync
    // effect above owns writing it into the form. Setting it in both places
    // makes them race over the field.
    const { modelId: _routed, ...rest } = draft.values;
    reset({ ...rest, modelId: getValues("modelId") });
  }, [draft, reset, getValues]);
  ```

  Recreating a seeded clip clears the drop zones (its settings hold `null` / `[]`), which is correct — there were never any bytes. Recreating a clip you made this session restores the actual `File`s.

- [ ] Switch the pane to `history` only on submit, as today — recreate should leave the pane where it is, since the form is the thing that changed.
- [ ] **Verify.** Recreate a seeded clip whose recipe names a non-`genjutsu` model: the URL's `?model=` changes, the model row and the quality options follow it, and mode/prompt/quality land. Then generate something with two reference images, recreate it, and confirm both thumbnails come back in the drop zone.

### Task 12: Preset card and lightbox

**Files:** modify `studio/preset-card.tsx`, `studio/preset-lightbox.tsx`, `studio/motion-library.tsx`, `studio/studio-pane.tsx`, `studio/genjutsu-studio.tsx`.

These buttons are in the spec and have never worked. Today every one of them resolves to `onGate` → `openAuth("signup")`, even for a signed-in user.

- [ ] Widen `onRecreate` to carry the preset: `onRecreate: (preset: Preset) => void`, threaded through `motion-library.tsx` and `studio-pane.tsx`.
- [ ] In `genjutsu-studio.tsx`: signed out, keep gating; signed in, `loadDraft` a recipe built from the preset — `{ mode: preset.mode, modelId: "genjutsu", quality: GENJUTSU_QUALITY_DEFAULT, promptEnabled: true, prompt: preset.prompt, referenceVideo: null, referenceImages: [] }`. `preset.model` is a display string ("Higgsfield Genjutsu — Objects swap"), **not** a model id — do not try to parse it.
- [ ] Wire the lightbox footer's dead Download (`preset-lightbox.tsx`, the `<button>` with no `onClick` beside Recreate) to `downloadAsset(preset.video ?? preset.poster, preset.title)`. Close the lightbox on Recreate so the form it just filled is visible.
- [ ] **Verify.** Signed out, Recreate on a preset card still opens the sign-up dialog. Signed in, it fills the form with that preset's prompt and mode. Lightbox Download saves the clip.

## Verification

Every task ends with `pnpm check` (lint, typecheck, vitest, prettier). Beyond that:

**Automated** — the four new test files pin the parts that can rot silently:

```bash
pnpm vitest run src/config/image-fixtures.test.ts src/config/video-fixtures.test.ts src/lib/asset-filename.test.ts src/stores/generation-store.test.ts
```

The fixture tests are the important ones: they parse all 73 seeded recipes through the real Zod schemas, so a mock that the composer could not actually have produced fails the build.

**Browser** — start the dev server through the Browser pane (never `bash npm run dev`), sign in, and walk both surfaces:

| Check                 | Where                              | Expect                                                              |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Feed volume           | `/ai/image`                        | 45 tiles, varied ratios, no visibly repeated prompt in one viewport |
| Rail                  | hover a tile                       | four buttons, unchanged geometry, shrinking at zoom 7 as before     |
| Download              | rail                               | a `.webp` named from the prompt                                     |
| Copy image            | overflow menu                      | pastes as an image elsewhere                                        |
| Like                  | rail                               | fills, survives a zoom change and a scroll                          |
| Recreate              | rail                               | every composer control changes; caret in the prompt; URL unchanged  |
| Round trip            | generate, then recreate the result | identical settings come back                                        |
| Bulk download         | select 3 → selection bar           | three files                                                         |
| History volume        | `/ai/video` → History              | 28 tiles                                                            |
| Clip rail             | hover a tile                       | plays _and_ shows the rail; Download saves `.mp4`                   |
| Video recreate        | rail                               | `?model=` moves, quality options follow, mode and prompt land       |
| Attachment round trip | generate with 2 images → recreate  | both thumbnails return                                              |
| Preset recreate       | Motion Library card                | signed out → dialog; signed in → form fills                         |
| Lightbox download     | preset lightbox                    | saves the clip                                                      |

Finish with `read_console_messages` on both routes — clipboard and CORS failures are silent in the UI and loud in the console.

**Spec upkeep.** Two deliberate deviations get written into the spec files as part of the work, not left for someone to rediscover: the image overflow menu's new Copy image row, and the video history tile's rail.
