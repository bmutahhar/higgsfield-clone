# Edit Video and Motion Control — design spec

**Routes:** `/ai/video/edit?model=seedance_2_5_edit`, `/ai/video/motion?model=kling-3-motion-control`
**Date:** 2026-09-14
**Status:** awaiting review
**Reference:** both live pages, inspected signed-out at 1440×900.

---

## 1. Scope

The two sibling surfaces behind the video panel's other tabs. Today those tabs are
links that go nowhere: `Edit Video` points at a query on `/ai/video` that does not
exist, and `Motion Control` points at a route with no page. Both should become real.

**In scope**

- `/ai/video/edit` — the Seedance 2.5 Edit form and its pane.
- `/ai/video/motion` — the Kling 3.0 Motion Control form and its pane.
- The `History` / `How it works` pane both share, including the signed-out onboarding.
- Wiring both into the existing schema → RHF → service → React Query → store spine, so
  their output lands in the same history the Genjutsu route already writes to.

**Out of scope** — no new models beyond the two the routes name, no backend. The
`Draw` mode on Edit Video renders as a real tab but its canvas is not built (§8).

**Copy.** Layout, geometry and behaviour are specified exactly. Functional microcopy
(field labels, constraints) is carried across because parity depends on it; prose —
headings, step descriptions — is a content slot with our own wording, as in the
Genjutsu spec. Icons are named by shape and drawn from `lucide-react`.

---

## 2. What all three video routes share

This is the important finding: the three surfaces are **one shell with three forms**.

|                  | Genjutsu                                  | Edit Video            | Motion Control        |
| ---------------- | ----------------------------------------- | --------------------- | --------------------- |
| Grid             | `20rem 1fr`, gap 8, `max-w-480`           | same                  | same                  |
| Measured at 1440 | 320 / 1080                                | **320 / 1080**        | **320 / 1080**        |
| Panel shell      | `rounded-q-500 border`                    | same                  | same                  |
| Form tabs        | 3 links, active underlined                | same                  | same                  |
| Promo card       | `aspect-[2.3]`, caption bottom-left       | same                  | same                  |
| Pane tabs        | History, **Motion Library**, How it works | History, How it works | History, How it works |
| Pane toolbar     | zoom + List/Grid                          | same                  | same                  |

So `GenerateForm`'s shell, `FormTabs`, `PromoCard`, `StudioPane`, `PaneToolbar` and
`VideoHistory` are all reusable as-is. What differs is the **body of the form** and
the **promo card's action button**.

Three consequences for the build:

1. **Extract the panel shell.** `generate-form.tsx` currently hard-codes the Genjutsu
   body inside the shell. Split it: a `StudioPanel` owning tabs + promo + scroller +
   footer, taking the form body as children. The three routes then differ only in
   their body and their schema.
2. **`StudioPane` already generalises.** It takes `generations` and a tab set; give it
   the tab list as a prop so Edit and Motion can drop `Motion Library`.
3. **The promo card's top-right button varies** — `How it works` on Genjutsu and
   Motion Control, **`Change`** on Edit Video (a pencil, opening the model picker).
   Make it a prop rather than a second component.

### Corrections to existing code

`FORM_TABS` in `config/genjutsu.ts` is wrong on both counts and must become:

```ts
{ label: "Create Video",   href: "/ai/video?model=genjutsu" }
{ label: "Edit Video",     href: "/ai/video/edit?model=seedance_2_5_edit" }
{ label: "Motion Control", href: "/ai/video/motion?model=kling-3-motion-control" }
```

Note the **underscores** in `seedance_2_5_edit` — the live edit route does not use the
hyphenated id the rest of the catalogue uses. Either accept both spellings when
resolving the model, or keep our hyphenated id and accept the divergence knowingly.
Recommend accepting both: a pasted link should work.

---

## 3. Edit Video — form body

```
StudioPanel (shared)
└── body
    ├── ModeTabs      Prompt | Draw            302×40
    ├── DropZone      video                    302×120, dashed
    ├── DropZone      elements/references      302×120, dashed
    ├── PromptBlock   always visible           302×160
    ├── ModelRow      Seedance 2.5 Edit        302×50
    └── SettingsRow   Resolution | Bitrate     302×40, grid-cols-[5rem_1fr]
```

### 3.1 Mode tabs — not the segmented control

`grid grid-cols-2 rounded-xl bg-q-w-05 p-1`, each button 147×32. The active pill is an
`absolute inset-0 rounded-lg bg-white/10` span behind the label, not the gradient
indicator `QTabs` draws. Labels `Prompt` / `Draw`, each with a leading 16px icon.

Build it with `QTabs shape="rounded"` only if the indicator is restyled to a flat
`white/10`; otherwise a small local control is cheaper than a third `QTabs` variant.
**Recommend the latter** — this is two buttons, and forcing it through `QTabs` would
add a variant used once.

### 3.2 Drop zones — dashed, and shorter

These differ from Genjutsu's and must not reuse its look:

|             | Genjutsu              | Edit Video                                  |
| ----------- | --------------------- | ------------------------------------------- |
| Height      | 160px                 | **120px** (`h-30`)                          |
| Border      | none at rest          | **`border border-dashed border-q-default`** |
| Radius      | `rounded-q-200` inner | **`rounded-q-400`**                         |
| Badge       | 36px glass            | 36px glass (same)                           |
| Badge count | 1 / 3                 | 1 / **2**                                   |

- **Video** — one badge, `Add a video to edit` / `Up to 30s`.
- **Elements** — two badges side by side (image, audio), `Add elements or references` /
  `Up to 50 image or audio`.

`DropZone` therefore needs a `variant: "solid" | "dashed"` and a `height` — or, better,
accept `className` and let the caller decide, since the internals are identical.

### 3.3 Prompt — always visible

No toggle. `min-h-40 max-h-64` column:

- editor: `rounded-t-xl border border-q-hairline bg-q-card`, label `Prompt` absolutely
  at `top-3 left-3` and the text area padded `p-3 pt-9` to clear it;
- footer bar: `rounded-b-xl p-3 pt-2 flex flex-wrap gap-1`, holding
  - an **Elements** button — 85×26, `rounded-lg bg-q-panel px-1.5 py-1`, icon + label;
  - an **audio toggle** — a `<label>` wrapping a visually-hidden checkbox, icon + `On`.

The toggle is a real checkbox, per the styling rules. The Elements button opens an
`@`-mention picker which is **out of scope**; render it and have it focus the editor.

### 3.4 Settings row

`fieldset` at `grid grid-cols-[5rem_1fr] gap-2`, both 40px tall:

- **Resolution** — 80px, `rounded-md bg-q-w-05 px-2`, 16px glyph + `1080p`.
- **Bitrate** — fills, `rounded-md bg-q-w-05 px-3`, 20px icon, label `Bitrate`, then a
  value chip: `rounded-md bg-q-accent-10 py-0.5 pl-0.5 pr-2`, 16px brand icon and the
  value (`High`) in `text-q-brand`, then a chevron.

Both open menus through the existing portalled `QPopover` — the panel clips overflow
here exactly as it does on Genjutsu.

---

## 4. Motion Control — form body

```
StudioPanel (shared)
└── body
    ├── PairedDropZones   two 3:4 zones in one frame   302×202
    ├── ModelRow          Kling 3.0 Motion Control     302×50
    ├── QualityRow        720p                         302×48
    ├── SceneControlCard  toggle + Video|Image + help  302×146
    └── AdvancedSettings  collapsible
```

### 4.1 Paired drop zones — the distinctive piece

Both zones sit **inside one framed container**, unlike the stacked, separate zones on
the other two routes:

```
p-1 rounded-[20px] border border-q-hairline
shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
grid grid-cols-2 gap-1
```

Each child is `aspect-3/4` (144×192) with a dashed border, a **32px** badge (not 36),
and two lines of centred label:

- `Add motion to copy` / `Video duration: 3–30 seconds`
- `Add your character` / `Image with visible face and body`

Note the duration here is **3–30s**, not Genjutsu's 4–30s. Both constraints belong in
config, derived into the copy and the schema as Genjutsu's already are.

Each zone is a `<label>` wrapping a visually-hidden `<input type="file">` covering the
tile — which is a cleaner pattern than Genjutsu's stretched button and should be
adopted there too when the drop zone is next touched.

### 4.2 Model and quality rows

Same 50px model row as Edit Video, value `Kling 3.0 Motion Control` plus the brand
glyph. Quality is a **bordered** 48px row (`rounded-xl border border-q-hairline
bg-q-card`) rather than Genjutsu's flat `bg-q-w-05` — a wrapper applies the border via
`*:*:` child selectors, which we should express as an explicit prop instead.

### 4.3 Scene control card

`rounded-xl border border-q-hairline bg-q-card p-3 flex flex-col gap-3`:

1. Row: label `Scene control mode` + a 36×24 switch (larger than the 28×16 prompt
   switch on Genjutsu — a second size, not a reuse).
2. A two-up `Video` | `Image` segmented control, `Image` selected.
3. Helper text in `--q-text-secondary` explaining which source the background is taken
   from. Content slot; write our own.

The segmented control is only meaningful while the switch is on. When off it should be
`inert` and dimmed rather than unmounted, so the card does not change height.

### 4.4 Advanced settings

A collapsible whose header is a row with a chevron. Its contents are not visible
signed-out; ship the disclosure with an empty, labelled region and fill it when a
signed-in reference is available. Flagged in §9.

---

## 5. The pane

Identical shell to Genjutsu's, with `Motion Library` removed — so `PANE_TABS` becomes a
parameter rather than a constant.

### Signed-out History

Both routes show an onboarding panel where Genjutsu shows a blank canvas. This is a
real difference and worth honouring:

```
section  px-8 py-24 rounded-q-500 border border-q-hairline bg-q-panel
├── h1    font-q-display uppercase, centred, mb-8
└── div   grid grid-cols-3 gap-10
    └── article ×3
        ├── figure  aspect-[328/331] max-w-82 mb-4
        ├── chip    "Step N"  text-q-label-xs, rounded-md, bg-white/5, px-2 py-1
        ├── h2      font-q-display uppercase text-center mb-2
        └── p       text-q-body-sm text-q-muted text-center
```

Signed in it becomes the same `VideoHistory` grid the Genjutsu route uses, reading the
shared store filtered to `kind: "video"`.

**Consequence for the current build:** `VideoHistory`'s empty state is currently a bare
canvas. It should take an `empty` slot so Genjutsu keeps its blank canvas while these
two render the three-step panel.

---

## 6. Data and schema

Both routes plug into the spine already built for Genjutsu.

### Config

Add to `config/models.ts` — both entries already exist; correct their capability lists:

- `seedance-2-5-edit` — resolutions `["480p","720p","1080p"]`, accept `seedance_2_5_edit` as an alias.
- `kling-3-motion-control` — resolutions `["720p","1080p"]`, durations 3–30.

New `config/video-edit.ts` and `config/video-motion.ts` for each surface's copy and
constraints, mirroring `config/genjutsu.ts`.

### Schemas

Two new modules beside `schemas/video-generation.ts`, same shape: a form schema with
`superRefine` for the cross-field rules, plus a serialisable request projection and a
`toRequest` mapper, since `File` still cannot cross `JSON.stringify`.

**Edit** — `mode: "prompt" | "draw"`, `prompt` (required, this surface has no toggle),
`referenceVideo` (≤30s), `elements` (≤50, image **or** audio), `resolution`, `bitrate`.
Cross-field: resolution offered by the model; `draw` mode requires a video.

**Motion** — `motionVideo` (3–30s, required), `characterImage` (required),
`quality`, `sceneControl: boolean`, `sceneSource: "video" | "image"`.
Cross-field: `sceneSource` only meaningful when `sceneControl` is on; both media
required, which is stricter than the other two surfaces and is the point of the form.

### Service, API, store

- `services/` gains one function per surface, mirroring `requestVideoGeneration`.
- The generations endpoint already discriminates on `kind`. Add `"video-edit"` and
  `"video-motion"`, or keep `kind: "video"` and add a `surface` field — **recommend the
  latter**: they all produce a video, and `GenerationKind` drives which feed shows a
  record. A surface that changed `kind` would hide its output from the video history.
- `generation-jobs.server.ts` gains job factories for each; its id already carries a
  kind tag, so extend that alphabet rather than adding a parallel reader.
- `PendingRequest` gains two members so a signed-out submit parks correctly.

---

## 7. File map

```
src/
  app/(studio)/ai/video/
    edit/page.tsx                    new — resolves ?model=, renders EditStudio
    motion/page.tsx                  new — same for MotionStudio
  components/studio/
    studio-panel.tsx                 new — extracted shell (tabs, promo, scroller, footer)
    generate-form.tsx                becomes Genjutsu's body only
    edit-form.tsx                    new
    motion-form.tsx                  new
    edit-studio.tsx                  new — query/store/auth wiring
    motion-studio.tsx                new — same
    paired-drop-zone.tsx             new — Motion's framed 3:4 pair
    prompt-block.tsx                 new — Edit's always-visible prompt
    setting-row.tsx                  new — Resolution/Bitrate/Quality rows
    scene-control-card.tsx           new
    studio-onboarding.tsx            new — the three-step signed-out panel
    drop-zone.tsx                    gains a dashed variant
    studio-pane.tsx                  takes its tab list and empty slot as props
    video-history.tsx                takes an `empty` slot
  schemas/  video-edit.ts, video-motion.ts
  services/ video-edit.ts, video-motion.ts
  config/   video-edit.ts, video-motion.ts; models.ts corrected
```

---

## 8. Deliberately not built

- **Draw mode.** The tab renders and selects; its canvas is a separate piece of work.
  Selecting it shows a labelled empty region, not a broken tool.
- **The `@`-mention element picker** behind Edit's `Elements` button.
- **Advanced settings contents** on Motion Control — not observable signed-out.

Each should be visibly inert rather than absent, so the surface reads as unfinished in
one named place instead of silently missing.

---

## 9. Risks

1. **Two of three forms are unobservable in their filled state.** As with Genjutsu, the
   live site gates uploads behind sign-in. Filled zones are designed from our own
   vocabulary and flagged provisional.
2. **The `seedance_2_5_edit` spelling.** Accepting both spellings costs one line and
   avoids a dead link from a pasted URL; not accepting it will look like a bug.
3. **Switch sizes are diverging.** 28×16 on Genjutsu, 36×24 here. Two sizes is fine;
   three would not be. Add it to the switch as a variant now rather than a one-off.
4. **`StudioPanel` extraction touches a shipped route.** Genjutsu is working and
   committed; the refactor must be verified against it, not just the new routes.

---

## 10. Acceptance

At 1440×900, signed out:

- [ ] Both routes render at 320 / 1080 with no page scroll.
- [ ] All three form tabs navigate, and the active one is underlined on each route.
- [ ] Edit: mode tabs switch; both zones are dashed and 120px; the prompt is always
      visible with its label clear of the text; Resolution and Bitrate open portalled
      menus that are not clipped.
- [ ] Motion: the two 3:4 zones sit in one frame; scene control's segmented control is
      inert while the switch is off; quality row is bordered.
- [ ] Both panes show History and How it works only — no Motion Library.
- [ ] Signed-out History shows the three-step panel; Genjutsu still shows a blank one.
- [ ] Submitting signed out parks the request and opens the auth dialog; signing in
      replays it and the clip lands in the shared video history.
- [ ] Keyboard reaches every control; tab groups use arrow keys.
- [ ] `pnpm check` passes, and the Genjutsu route is unchanged by the extraction.
