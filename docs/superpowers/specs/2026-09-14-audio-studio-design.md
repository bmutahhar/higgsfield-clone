# Audio studio — design spec

**Route:** `/audio`
**Date:** 2026-09-14
**Status:** specified — not yet implemented
**Reference:** `https://higgsfield.ai/audio`, inspected at 1440×900 and 375×812, logged out.

---

## 1. Goal and scope

Rebuild the audio generation surface at 1:1 visual and behavioural parity with the
live page, and wire it into the generation pipeline the image and video studios
already share.

**In scope:**

- the studio shell at `/audio` — two columns at `md`+, a full-screen sheet below;
- all three panel tabs, each validating and submitting: `Text to Speech`,
  `Voice Change`, `Translate`;
- every control in the Text to Speech form, including the whole of
  `Advanced settings`;
- the model popover and the filters popover;
- the right pane and both of its tabs (`History`, `How it works`), with a
  per-tab `How it works` surface;
- History rendering audio as a waveform tile with inline playback;
- the logged-out gate, reusing the existing hold-request → auth → auto-resume flow;
- the mobile sheet down to 375px.

**Out of scope:** voice cloning (the live "clone your own" path is a separate
surface behind auth), the `@`-mention typeahead's _remote_ search — ours indexes
only the attachments on the current form — and any real audio synthesis. The job
service stays the stateless mock the other two surfaces use.

### Content and assets

Layout, geometry, tokens and behaviour are specified exactly. **Marketing prose is
a content slot with its typography fixed and copy of our own** — §6.2 gives the
strings we ship; implementers do not transcribe the reference page. Model _names_
are recorded as fact (which third-party models the surface offers, exactly as
`config/models.ts` already does for video); their one-line descriptions are ours.

Audio fixtures are remote URLs in a typed fixture module, per decision D4 of the
Genjutsu spec. §14 covers the fallback.

---

## 2. Decisions taken

| #   | Decision                                               | Rationale                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Route is `/audio`, not `/ai/audio`                     | Matches the reference and the `href` the live nav already points at. It still lives under `src/app/(studio)/`, so it inherits the studio layout, the `q-` ramp and `QueryProvider` unchanged.                                                      |
| D2  | All three tabs validate and submit                     | The two secondary tabs are two-dropzone forms — they add schema branches and job plumbing, not new UI vocabulary. Shipping them inert would leave two thirds of the surface a façade.                                                              |
| D3  | One discriminated-union schema keyed on `mode`         | The three tabs share almost no fields. A union narrows correctly at the one place it matters — the submit call — which is the same reason `PendingRequest` discriminates on `kind`. A flat schema with everything optional would validate nothing. |
| D4  | Waveform bars are derived from the job id, not decoded | Fixtures are cross-origin; `decodeAudioData` is one missing CORS header away from a permanently empty tile. Deriving from the id is the trick `generation-jobs.server.ts` already uses to stay stateless, and it is deterministic across reloads.  |
| D5  | Our own credit formula: `rate(model) × batch`          | The reference's cost is not linear in script length — 13 characters priced 0.1 and 17 priced 0.3 on the same model. Rather than ship a guess nobody can verify, the rate table lives in `config/audio.ts` where it is one edit to change.          |
| D6  | `GenerationAsset` gains `duration`                     | A waveform tile must reserve its width before the file loads, for the same reason `w`/`h` exist on `Generation` for images. Optional, so image and video are untouched.                                                                            |
| D7  | Every visual state is CSS                              | `CLAUDE.md` forbids React state for visual state. Only genuinely-stateful things (active tab, selected model, advanced-open, playback position, pane tab) become React state.                                                                      |
| D8  | The mobile sheet is the same components, not a fork    | Below `md` the panel becomes a full-screen sheet and the batch stepper relocates into the CTA footer. Both are container/order changes, expressible in classes. A second component tree would drift.                                               |

---

## 3. App shell

The reference makes this a fixed-viewport application, exactly as the video studio
does. Our root layout already delivers that — `body` is `flex h-dvh flex-col
overflow-hidden` — and `src/app/(studio)/layout.tsx` already paints `bg-q-page` and
provides React Query. **No layout change is needed.**

```
body (h-dvh, overflow-hidden, flex-col)
├── PromoBanner        ← existing
├── RouteProgress      ← existing
├── SiteHeader         ← existing
└── (studio)/layout    ← existing, unchanged
    └── audio/page     ← the grid below
```

### Grid

```
<div class="relative grid size-full min-h-0 grid-cols-[1fr] gap-0
            md:grid-cols-[max-content_1fr]">
```

Measured at 1440×900:

| Property    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Aside width | `w-85.5` = **342px**, `shrink-0`                                                 |
| Aside box   | `flex h-full min-h-0 flex-col pb-4`, offset `16px` from the viewport edge        |
| Panel card  | `342 × 783`, `rounded-q-600` (24px), `border-q-subtle`, `bg-q-panel` (`#131517`) |
| Pane        | `1066 × 799` at `x=358`, `relative size-full`                                    |
| Pane inset  | content and toolbar both `left-6` (24px), flush right                            |

Two differences from the video studio, both deliberate and both measured:

- the panel is **24px** radius here, not the video studio's 20px;
- the pane is **not a card**. There is no border, no dot grid, no rounded
  container. The toolbar floats `absolute` above a plain scroller, and the only
  rounded surface inside is the `How it works` card itself.

---

## 4. Token layer

Everything this surface needs already exists in `src/styles/tokens/q-studio.css`
except the entries below. Add them to that file; project them through the existing
`@theme inline` block in `globals.css`.

### 4.1 Colour

```css
:root {
  /* The how-it-works cards. Same value as --q-bg-plan, which becomes an alias:
     the pricing page happened to measure it first, but it is not a plan colour. */
  --q-bg-section: #18191c;
  --q-bg-plan: var(--q-bg-section);
}
```

Two existing values to be careful with, both already noted in `CLAUDE.md`:

- `--q-text-muted` (`#898a8b`) is written **`text-q-soft`**. It is the colour of
  every secondary label on this panel, and it is the one most likely to be
  mistyped as `text-q-muted` — which resolves to `--q-text-secondary` (`#828282`)
  and is a different, wronger grey.
- `--q-text-secondary` (`#828282`) **is** correct for the how-it-works card body
  copy. The two greys genuinely both appear on this page, 16px apart.

One discrepancy to resolve, not paper over: the Save-settings switch measured
`#5e636e` on this page, while `--q-switch-off` is `#5c626a`. Keep one value. Unless
the existing one is re-measured and found wrong, use `--q-switch-off` and note the
2-point drift.

### 4.2 Typography

Five ramps this page uses that the `q-` layer does not yet have. All Inter except
the display.

| New token             | Size / line-height | Weight | Tracking | Used by                                          |
| --------------------- | ------------------ | ------ | -------- | ------------------------------------------------ |
| `--text-q-accent-2xl` | 40 / 48            | 700    | −1.6px   | Pane headline (Space Grotesk, uppercase, `ss04`) |
| `--text-q-heading-sm` | 24 / 28            | 500    | −0.4px   | How-it-works card titles                         |
| `--text-q-body-lg`    | 18 / 28            | 500    | 0        | Pane sub-headline                                |
| `--text-q-body-md`    | 16 / 24            | 500    | 0        | Drop-zone title, card body copy                  |
| `--text-q-cta`        | 18 / 24            | 600    | −0.4px   | Generate label and cost                          |

Note `--text-q-accent-2xl` is **not** `--text-q-title` (40/48/600, no tracking):
same box, different weight, different tracking, different face.

Existing ramps this surface reuses, for reference while building:

| Utility             | Value        | Used by                                                                                                                                           |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text-q-menu`       | 14 / 20, 500 | Row labels and values, panel tabs                                                                                                                 |
| `text-q-caption-l`  | 12 / 18      | Sub-labels, group headings, pane tabs (600), script editor (400)                                                                                  |
| `text-q-caption-xs` | 10 / 14      | `Optional` badge, counters, mood scale — **weight 500, tracking 0** here, so pass `font-medium tracking-normal` to override the token's 600/0.2px |

### 4.3 Radius

All present. For the record, this surface uses `rounded-q-600` (24px, panel and
how-it-works cards), `rounded-q-400` (16px, drop zone and model popover),
`rounded-q-300` (12px, every settings row and the CTA), `rounded-q-250` (10px, the
Filters button — the one 10px radius on the page), `rounded-q-200` (8px, segmented
buttons and model-row tiles), `rounded-q-150` (6px, stepper buttons) and
`rounded-q-full` (chips and the switch).

---

## 5. Left column — the panel

```
aside  w-85.5 flex h-full min-h-0 flex-col pb-4
└── div  flex max-h-full min-h-0 flex-col overflow-hidden
         rounded-q-600 border border-q-subtle bg-q-panel
    ├── PanelTabs        ← 5.1
    └── form  hf-scrollbar-none flex min-h-0 flex-1 flex-col
               overflow-y-auto overscroll-none px-3 pt-3
        ├── div  flex flex-col gap-3     ← the fields, per tab
        └── GenerateFooter               ← 5.9, sticky
```

The form scrolls; the CTA is sticky inside it, not a sibling below it. That is why
a long `Advanced settings` panel pushes content under a CTA that stays put.

### 5.1 Panel tabs

```
<div class="mx-3 flex min-w-0 shrink-0 justify-between
            border-b border-q-card px-2 pt-3">
```

Height 49px. Three buttons, `justify-between` so they spread to the panel's inner
width rather than sitting in a row.

|        | Rest                                                    | Active           |
| ------ | ------------------------------------------------------- | ---------------- |
| Box    | `h-9 shrink-0 items-start whitespace-nowrap border-b-2` | same             |
| Type   | `text-q-caption-l font-medium` (14/20 · 500)            | same             |
| Border | `border-b-transparent`                                  | `border-b-white` |
| Ink    | `text-q-idle` (`rgba(255,255,255,0.6)`)                 | `text-q-fg`      |

Tab is React state — it swaps the whole form body, which no CSS selector can
express. Implement as a real `tablist`/`tab`/`tabpanel` triple so arrow keys work.

### 5.2 Upload zone

Shared by all three tabs, with different copy, icon stack, badge and arity. One
component, `upload-zone.tsx`; the differences are props.

```
<div class="relative shrink-0">
  <div class="group relative flex min-h-40 w-full shrink-0 cursor-pointer
              flex-col items-center justify-center gap-3 rounded-q-400
              bg-q-w-05 px-4 pt-6 pb-5 transition-colors
              hover:bg-q-w-08">
    <svg …dashed border… />
    <ChipStack />
    <div class="flex w-full flex-col items-center gap-1 text-center">
      <span class="text-q-body-md text-q-fg">{title}</span>
      <span class="w-full truncate text-q-menu text-q-soft">{hint}</span>
    </div>
  </div>
  <Badge />
</div>
```

**The dashed border is an SVG rect, not `border-dashed`.** CSS dashes do not
corner-join cleanly at this radius. Exact attributes:

```html
<rect
  x="0.75"
  y="0.75"
  rx="15.25"
  ry="15.25"
  fill="none"
  stroke="rgba(255,255,255,0.08)"
  stroke-width="1.5"
  stroke-dasharray="3 3"
  style="width: calc(100% - 1.5px); height: calc(100% - 1.5px)"
  class="transition-[stroke-dasharray] duration-200"
/>
```

Height is `min-h-40` (160px) and the content is centred, so a longer hint does not
change the box.

**Chip stack** — 40px circles, `bg-q-card-strong` (`#23262a`), `rounded-q-full`,
overlapping by 8px (`-ml-2` on all but the first; three chips measure 104px, two
measure 72px). Each carries the reference's layered shadow, which reads as a
physical token sitting on the surface:

```
shadow-[0_5.059px_5.654px_0_rgba(0,0,0,0.1),
        0_20.533px_10.266px_0_rgba(0,0,0,0.09),
        0_46.422px_13.986px_0_rgba(0,0,0,0.05),
        0_82.429px_16.516px_0_rgba(0,0,0,0.01),
        inset_0_-0.298px_5.356px_0_rgba(185,185,185,0.35)]
```

Icons are 16–17px, `text-q-fg`, drawn fresh or from `lucide-react`.

**Badge** — `absolute top-1.5 right-1.5 rounded-q-300 bg-q-w-05 px-2 py-1
text-q-caption-xs font-medium tracking-normal text-q-soft`, `pointer-events-none`.
Reads `Optional` or `Required`; the word is decoration only, the schema enforces it.

Per tab:

| Tab            | Title           | Hint                                   | Chips                       | Badge    | Accepts                  |
| -------------- | --------------- | -------------------------------------- | --------------------------- | -------- | ------------------------ |
| TTS            | `Upload media`  | `Up to 3 Voices/Audios or Image`       | waveform, music note, image | Optional | `audio/*,image/*`, max 3 |
| Voice Change ① | `Pick a voice`  | `Choose a preset or an uploaded voice` | waveform                    | Required | `audio/*`, max 1         |
| Voice Change ② | `Add your clip` | `Upload the video to change its voice` | video, upload               | Required | `video/*`, max 1         |
| Translate      | `Add your clip` | `Upload the video you want to dub`     | video, upload               | Required | `video/*`, max 1         |

Each chip is its own labelled `<input type="file" class="hidden">` — the reference
renders three, one per accepted kind, and clicking a chip opens that filter rather
than one combined picker. Drag-and-drop targets the whole box.

**Filled state.** The reference replaces the stack with thumbnails of what was
attached and the hint with the file name. Ours does the same: `filledHint` shows
`{name}` for one file, `{n} attachments` for more, and the existing `DropZone`
already models this pair — reuse its `files` / `onFilesChange` / `filledHint`
contract rather than inventing a second one.

### 5.3 Script field (Text to Speech)

```
<section class="relative flex h-40 w-full shrink-0 flex-col gap-1
                rounded-q-300 border border-q-subtle bg-q-w-05 p-3
                transition-colors focus-within:border-q-default">
```

Fixed 160px tall. Header row is `flex items-center justify-between gap-2`:

- `Script` — `text-q-menu text-q-soft`
- info icon — `size-4.5` (18px), `text-q-soft hover:text-q-fg`, opens a tooltip

Body is `min-h-0 flex-1` wrapping the editor: `text-q-caption-l font-normal
text-q-fg`, `overflow-y-auto`, `[scrollbar-gutter:stable]`, `cursor-text`,
`size-full`, no outline on focus (the section's `focus-within` border is the
affordance).

Placeholder is an absolutely-positioned `pointer-events-none select-none`
`text-q-soft` layer with `whitespace-pre-line`, carrying a literal newline:

```
Write exactly what the voice will read out loud.
Type @ to reference attachments
```

**`@` mentions.** Typing `@` opens a typeahead listing the files currently attached
to this form. Picking one inserts a non-editable chip token. The reference backs
this with a rich-text editor; ours needs only the attachment list, so a
`contenteditable` with a token span is enough — but the field's _value_ must
serialise back to plain text with tokens rendered as `@{name}` so the schema sees a
string. Keep that serialisation in `lib/`, pure and unit-tested; it is the one part
of this field with real logic in it.

**No character counter.** The script has no visible limit on the reference. Ours
caps at `SCRIPT_MAX_LENGTH = 5000` in the schema as a sanity bound, surfaced only
as a validation message, never as a counter.

### 5.4 Model row and popover

**Trigger** — `h-14` (56px), `rounded-q-300 border border-q-subtle bg-q-w-05 px-3
py-2 gap-2`, `hover:border-q-default hover:bg-q-w-08`:

```
<span class="flex min-w-0 flex-col items-start gap-1">
  <span class="text-q-caption-l font-medium text-q-soft">Model</span>
  <span class="flex min-w-0 items-center gap-1 text-q-menu text-q-fg">
    <span class="truncate">{name}</span>
    <ModelGlyph class="inline-block size-3.5 shrink-0 bg-q-brand" />
  </span>
</span>
<ChevronRight class="size-4" />
```

The glyph is a 14px CSS mask filled with `--q-brand`, not an image — the same
technique `model-badge.tsx` already uses.

**Popover** — anchored to the trigger, **316px** wide (the trigger's inner width),
`max-h` 353px. Reuse `QPopover`; it already handles edge-flipping and `width`.

```
rounded-q-400 border border-q-card bg-q-glass backdrop-blur-2xl
```

| Part          | Spec                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search header | `h-10 flex shrink-0 items-center gap-2 border-b border-q-card px-3`; 20px icon `text-q-soft`; input `text-q-menu font-normal py-2.5 bg-transparent outline-none placeholder:text-q-soft` |
| List          | `flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-none p-3 pt-2`                                                                                                                   |
| Group heading | `flex items-center gap-1.5 px-1.5`; 16px icon `text-q-fg`; label `text-q-caption-l font-medium text-q-soft`                                                                              |
| Rows          | `flex flex-col gap-0.5`                                                                                                                                                                  |

Each row is `h-13` (52px), `rounded-q-300 py-1.5 pr-2 pl-1.5 gap-2`, full-width,
left-aligned:

- **Tile** — `size-10 rounded-q-200 bg-q-w-05 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]`, centring a `size-4` masked glyph. Lime (`bg-q-brand`) for the selected model, `bg-q-fg` for the rest.
- **Text** — name `text-q-caption-l font-medium text-q-fg truncate`; description `text-q-caption-xs font-normal text-q-soft truncate`.
- **Check** — `size-5` `text-q-brand`, selected row only.
- **Selected** `bg-q-w-05`; **unselected** `hover:bg-q-w-05`.

Exactly one group, `Featured models`, holding five entries. Names are the
reference's; the one-liners are ours:

| id                      | Name                  | Description                                          |
| ----------------------- | --------------------- | ---------------------------------------------------- |
| `seed-audio-1`          | Seed Audio 1.0        | Multi-speaker scenes with speech and ambience        |
| `elevenlabs-v3`         | ElevenLabs v3         | Emotion and delivery control via inline tags         |
| `qwen-audio-3-tts`      | Qwen Audio 3.0 TTS    | Natural speech with voice, style and emotion control |
| `minimax-speech-2-8-hd` | MiniMax Speech 2.8 HD | High-fidelity single-voice narration                 |
| `seed-speech`           | Seed Speech           | Multilingual speech across 30+ languages             |

Search filters on name and description, case-insensitive. An empty result renders
a single `text-q-caption-l text-q-soft` line, not a blank popover.

### 5.5 Batch size

```
<div class="flex h-12 w-full shrink-0 items-center justify-between gap-2
            rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2
            transition-colors hover:border-q-default">
  <span class="text-q-menu text-q-fg">Batch size</span>
  <Stepper />
</div>
```

Stepper is `flex items-center gap-0.5`: two `size-6 rounded-q-150` buttons,
`hover:bg-q-w-05`, `disabled:opacity-40`, 16px minus/plus glyphs, with the value
between them as `px-1 text-q-menu font-semibold tabular-nums`.

Rendered `{value} / {max}` — max is **4**. `BatchStepper` already exists in
`components/image-studio/` and renders a bare number in a pill. Audio is its second
consumer, so it **moves** to `components/forms/batch-stepper.tsx` and gains an
optional `max` prop that switches it to the `n / max` form. Promote and extend;
do not fork, and do not import across feature folders.

### 5.6 Voice details (Text to Speech)

Same section chrome as the script field, but height is content-driven:

```
<section class="relative flex w-full shrink-0 flex-col gap-1 rounded-q-300
                border border-q-subtle bg-q-w-05 p-3 transition-colors
                focus-within:border-q-default">
```

- `Optional` badge, positioned exactly as the drop zone's.
- `<label>` `Voice details` — `text-q-menu text-q-soft`.
- `<textarea>` — `resize-none bg-transparent outline-none text-q-caption-l
font-normal text-q-fg placeholder:text-q-soft`, `[scrollbar-gutter:stable]`, and
  the reference's gutter trick `-mr-2 w-[calc(100%+8px)] pr-1` so the scrollbar
  sits in the padding rather than shortening the text.
- Counter — `mt-0.5 self-end text-q-caption-xs font-medium tabular-nums
text-q-w-40`, reading `{n} / 500`.

Placeholder: `e.g. Young female voice with british accent, soft and loud. Excited,
giggling`. Max **500**, enforced by the schema and by `maxLength`.

### 5.7 Advanced settings (Text to Speech)

**Disclosure** — `flex w-full shrink-0 items-center gap-2 rounded-q-300 p-1.5`, no
border, no fill. 16px sliders glyph, label `min-w-0 flex-1 truncate text-left
text-q-menu text-q-fg`, and a 16px chevron that points right when collapsed and
down when open. Carries `aria-expanded` and `aria-controls`.

Open state is React state (it changes layout, not just paint) and the panel is
mounted only when open.

**Panel** — `flex w-full shrink-0 flex-col gap-2`, four blocks:

#### Header

`flex items-center justify-between pl-0.5`. Left: `{model.name} controls` as
`px-0.5 text-q-caption-l font-medium text-q-soft` — the model name is interpolated,
so switching model relabels it. Right: a Reset button, `flex h-6 shrink-0
items-center gap-1 rounded-q-150`, 12px revert glyph plus `Reset` in
`text-q-caption-l font-medium text-q-fg`. Reset restores every control in this
panel to the active model's defaults, nothing else.

#### Expression intensity

A slider that _is_ the row — the fill sits inside the row's own box rather than
under a separate track.

```
<span class="relative flex h-12 w-full cursor-pointer items-center
             justify-between overflow-hidden rounded-q-300
             border border-q-subtle bg-q-w-05 px-3
             transition-colors hover:border-q-default">
  <span aria-hidden class="pointer-events-none absolute inset-0">…9 ticks…</span>
  <span aria-hidden class="pointer-events-none absolute inset-y-0 left-0
        rounded-q-300 bg-q-w-05 shadow-[inset_0_2px_3px_rgba(255,255,255,0.05)]"
        style="width: {pct}%" />
  <span class="relative z-10 flex items-center gap-1.5 text-q-menu text-q-fg">
    Expression intensity</span>
  <span class="relative z-10 text-q-menu tabular-nums text-q-fg">{value}</span>
  <Thumb />
</span>
```

- **Ticks**: nine, `absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2
rounded-xs bg-q-w-20`, at 10%…90%.
- **Fill width** is the one legitimate inline `style` on this surface — a
  continuous percentage cannot be a class. Comment it as such, per `CLAUDE.md`.
- **Thumb**: `block h-6 w-1 cursor-pointer rounded-xs bg-q-w-80
active:cursor-grabbing`.
- Range **0–10**, default **5**, step 1.

Build it on a visually-hidden `<input type="range">` with the painted layers as
siblings, so keyboard, arrow keys and screen-reader announcement come for free —
the `.q-slider` utility in `q-studio.css` already establishes this pattern.

#### Mood

A card, not a row — it needs a caption under the control.

```
<div class="flex w-full flex-col gap-3 rounded-q-300 border border-q-subtle
            bg-q-w-05 p-3 transition-colors hover:border-q-default">
```

Label row: `flex items-center gap-1 px-0.5` — `Mood` in `text-q-caption-l
font-medium text-q-soft`, plus a `size-4` info icon.

The fader is the one control on this page with a physical metaphor, and the detail
is what sells it:

| Part    | Spec                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Track   | `relative flex h-7 w-full cursor-pointer items-center rounded-q-200 bg-q-w-05 p-0.5`                                                   |
| Fill    | `absolute inset-y-0 left-0 overflow-hidden rounded-q-200`, width `{pct}%`, carrying the mood gradient                                  |
| Notches | four `size-1 rounded-[1px] bg-q-w-10`, `justify-between` across `px-2`                                                                 |
| Handle  | `relative z-1 block h-7.5 w-5.5 cursor-grab rounded-q-100 border-[0.5px] border-black/15 bg-white outline-none active:cursor-grabbing` |
| Grips   | two `absolute bottom-[11.5px] h-1.5 w-px bg-black/10` at `left-[7.5px]` and `left-[11.5px]`                                            |

The handle is **taller than the track** (30px against 28px) and overhangs it — that
overhang is the whole effect; do not clip it with `overflow-hidden` on the track.

Gradient runs red → orange → white across the range. Scale labels below:
`flex w-full items-center justify-between gap-1 px-1 text-q-caption-xs
font-medium text-q-soft` reading `Angry` · `Neutral` · `Happy`. Range −1…+1,
default 0 (neutral, handle centred).

#### Audio settings

Group label `Audio settings` — `px-1 text-q-caption-l font-medium text-q-soft` —
over a `flex flex-col gap-2` holding three things.

**1. Three-up row.** `flex w-full items-stretch gap-2`, each button `min-w-0 flex-1
items-center gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2
text-left` at **58px** tall, `hover:border-q-default`:

```
<span class="flex min-w-0 flex-1 flex-col gap-0.5">
  <span class="truncate text-q-caption-l font-medium text-q-soft">{label}</span>
  <span class="truncate text-q-menu tabular-nums text-q-fg">{value}</span>
</span>
<ChevronRight class="size-4" />
```

| Control | Range     | Step | Default | Display |
| ------- | --------- | ---- | ------- | ------- |
| Speed   | 0.5 – 2.0 | 0.1  | 1.0     | `1.0x`  |
| Pitch   | −12 – +12 | 1    | 0       | `0`     |
| Volume  | 0 – 200   | 5    | 100     | `100%`  |

Each opens a titled popover holding an `Expression intensity`-style slider.
`setting-popover.tsx` is already exactly this pattern, but it currently lives in
`components/image-studio/`. Audio is its second consumer, so per `CLAUDE.md`'s
"colocate first, promote later" it **moves** to `components/forms/setting-popover.tsx`
and both studios import it from there. Do not cross-import between feature folders.

**2 and 3. Output format and Sample rate.** Two `h-12` rows sharing the settings-row
chrome: label `text-q-menu text-q-fg` left, value right as `flex shrink-0
items-center gap-2` holding `{value}` in `text-q-menu text-q-fg` (Output format
prefixes a 16px file glyph) and a 16px chevron.

- **Output format** — `MP3` · `WAV` · `AAC`, default `MP3`.
- **Sample rate** — `16 kHz` · `24 kHz` · `44.1 kHz`, default `24 kHz`.

Both open a plain listbox popover; reuse `QSelect`.

#### Save settings

An `h-12` settings row whose right side is a switch rather than a chevron.

```
<button role="switch" aria-checked={on}
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
               rounded-q-full transition outline-none
               focus-visible:ring-2 focus-visible:ring-q-focus">
  <span class="pointer-events-none absolute top-1/2 left-0.5 size-5
               -translate-y-1/2 rounded-q-full bg-white shadow-lg
               transition-transform duration-300 ease-in-out" />
</button>
```

44×24 with a 20px knob; off `bg-q-switch-off`, on `bg-q-brand` with the knob
translated `+20px`. **Prefer the platform** — per `CLAUDE.md` this should be a
visually-hidden `<input type="checkbox">` with `peer-checked:` driving the knob, so
the state is not React's and form submission is free.

On: the current advanced values persist to `localStorage` and rehydrate on next
visit. Off: they reset to model defaults on reload. This is the only control on the
surface with a side effect beyond the request.

### 5.8 Voice Change and Translate forms

Both are short, and both reuse §5.2 and §5.4 wholesale.

**Voice Change** — two required upload zones, nothing else:

```
flex flex-col gap-3
├── UploadZone  Pick a voice     (Required, audio/*, 1)
└── UploadZone  Add your clip    (Required, video/*, 1)
```

**Translate** — one required upload zone and a language row:

```
flex flex-col gap-3
├── UploadZone   Add your clip   (Required, video/*, 1)
└── LanguageRow
```

The language row is the §5.4 trigger with the glyph swapped for a flag:

```
<span class="flex min-w-0 flex-col items-start gap-1">
  <span class="text-q-caption-l font-medium text-q-soft">Language</span>
  <span class="flex min-w-0 items-center gap-1.5 text-q-menu text-q-fg">
    <img class="h-3 w-4.5 shrink-0 rounded-xs object-cover" … />
    <span class="truncate">{language}</span>
  </span>
</span>
```

The flag is an 18×12 image, `rounded-xs`, `object-cover`. Popover is the §5.4
listbox with a search field, rows showing flag + language name, no descriptions.
Ship the ten languages in `config/audio.ts`; default `English`.

Neither tab has a model row, a batch stepper or advanced settings. The CTA is the
only other element.

### 5.9 Generate

```
<div class="sticky bottom-0 z-20 mt-6 pb-3">
  <button type="submit"
          class="relative flex h-14 w-full min-w-12 items-center justify-center
                 overflow-hidden rounded-q-300 px-5 pt-4 pb-5
                 q-cta-audio transition
                 hover:brightness-105 active:brightness-95
                 disabled:pointer-events-none disabled:brightness-60">
    <span aria-hidden class="pointer-events-none absolute inset-0
          rounded-[inherit] shadow-[inset_0_-3px_0_0_var(--q-brand-lime-line)]" />
    <span class="flex items-center px-1.5 text-q-cta text-q-inverse">Generate</span>
    {cost !== null && (
      <span class="flex items-center gap-1 text-q-cta text-q-inverse">
        <CreditGlyph class="size-4.5 shrink-0" />{cost}
      </span>
    )}
  </button>
</div>
```

This CTA is **not** the video studio's. It is 56px rather than 48, 12px radius, and
its fill is two stacked gradients over a flat brand base — a vertical wash from
transparent to `--q-brand-lime-hi` on top of solid `--q-brand`:

```css
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

Both `--q-brand-lime-hi` (`#ffff14`) and `--q-brand-lime-line` (`#829b19`) already
exist in the `q-` layer. Label ink is `#1b1b1b`, which is **not**
`--q-text-inverse` (`#14151a`) — a neutral grey against a blue-leaning one. Add
`--q-text-on-brand: #1b1b1b` rather than reaching for the near-miss.

**Cost.** The label is followed by a 4-point sparkle glyph and a number. Per D5 the
formula is ours:

```ts
cost = round1(MODEL_RATE[modelId] * batch);
```

with rates in `config/audio.ts` — `seed-audio-1` at `0.3`, the rest at `0.15`,
matching what the reference charged for the same script. Voice Change and Translate
are single-job and use their own flat rates. The cost element is omitted entirely
when the form is invalid, which is also when the button is disabled.

**Disabled** is the resting state and matters more than usual here:

| Tab            | Enabled when                          |
| -------------- | ------------------------------------- |
| Text to Speech | the script has non-whitespace content |
| Voice Change   | both uploads present                  |
| Translate      | the clip is present                   |

Confirmed against the reference: filling _Voice details_ alone leaves Generate
disabled — the gate is the script. Disabled renders at `brightness-60`, which reads
as olive rather than lime, and takes `pointer-events-none`.

---

## 6. Right column — the pane

```
<div class="relative size-full">
  <div class="absolute top-0 right-0 left-6 z-1 pb-3">…toolbar…</div>
  <div class="absolute inset-y-0 right-0 left-6 overflow-hidden pt-14.5">
    <div class="size-full overflow-y-auto overscroll-none pb-4">…tab body…</div>
  </div>
</div>
```

The toolbar is absolutely positioned over the scroller and the scroller is padded
`pt-14.5` (58px) to clear it, so content scrolls _under_ the controls rather than
pushing them. No card, no border, no background — the pane is the page.

### 6.1 Toolbar

`relative flex w-full items-center justify-between`, 40px tall.

**Left — segmented control.** `flex h-10 items-center gap-1 rounded-q-300 border
border-q-subtle bg-q-panel p-0.5`. Two buttons, each `h-8 rounded-q-200 px-2 py-1
text-q-caption-l font-semibold`, 16px icon plus a `px-1` label.

|           | Rest                          | Active                                                                                                        |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Ink       | `text-q-soft hover:text-q-fg` | `text-q-fg`                                                                                                   |
| Indicator | none                          | `absolute inset-0 -z-1 rounded-q-200 border border-q-subtle backdrop-blur-md` over a subtle diagonal gradient |

`QTabs` already renders exactly this shape — reuse it with `surface="bare"`.

**Right — Filters.** `flex h-8 items-center gap-1.5 rounded-q-250 border
border-q-subtle bg-q-panel px-2.5 text-q-soft hover:text-q-fg`, 16px icon plus
`text-q-caption-l font-medium` label. Note `rounded-q-250` — 10px, the only one on
the page, and deliberately not the 8px of the segmented buttons beside it.

Opens a 250px popover (`rounded-q-300`, glass) with two groups:

- **Date** — a date-range control.
- **Activity** — `All` · `Liked` · `Downloaded`, single-select, default `All`.

Filters apply to History only, so the button is rendered only on that tab — the
same `visible` prop `PaneToolbar` already takes.

### 6.2 How it works

The default tab when there is no history. One card filling the pane:

```
<div class="@container w-full overflow-hidden rounded-q-300 border
            border-q-subtle bg-q-panel">
  <div class="flex min-h-160 flex-col px-8 pt-10.5 pb-8
              @max-[640px]:px-4 @max-[640px]:pt-7">
```

A **container query**, not a media query — the card reflows on its own width, which
is what keeps it right when the panel is open beside it.

Header — `flex flex-col items-center gap-2`:

- `<h2 class="text-center font-q-display text-q-accent-2xl uppercase text-q-fg [font-feature-settings:'ss04'] @max-[640px]:text-[28px]">`
- `<p class="text-center text-q-body-lg text-q-soft">`

Cards — `mt-9.5 flex w-full flex-col gap-5 @[640px]:flex-row`, each:

```
flex min-w-0 flex-1 flex-col items-center justify-center gap-6
overflow-hidden rounded-q-600 border border-q-card bg-q-section
px-4 pt-5 pb-4
├── div  flex w-full flex-col gap-2 px-2
│   ├── h3  text-q-heading-sm text-q-fg
│   └── p   text-q-body-md text-q-muted        ← #828282, not #898a8b
└── div  relative h-75 w-full overflow-hidden rounded-q-300   ← media slot
```

Copy is per pane tab, and it is **ours** — the slots and their typography are the
spec, the strings below are what we ship:

| Tab            | Headline                             | Sub-headline                                             |
| -------------- | ------------------------------------ | -------------------------------------------------------- |
| Text to Speech | Turn text into speech                | Lifelike speech from any script, ready for your projects |
| Voice Change   | Swap the voice, keep the performance | Replace the voice and keep the delivery                  |
| Translate      | Your video, in any language          | Translate and lip-sync a clip into a new language        |

Text to Speech gets two cards — one about choosing a voice, one about writing and
generating. The other two tabs get a single full-width card. The 300px media slot
holds a looping fixture clip with a poster; treat it as a content slot and do not
copy the reference's animation.

### 6.3 History

The pane's other tab, and the reason `duration` joins `GenerationAsset`.

Layout is a single column of tiles, `flex flex-col gap-2`, max-width 720px centred
— audio has no aspect ratio, so the masonry the image feed uses buys nothing here.

**Tile:**

```
<article class="flex flex-col gap-3 rounded-q-300 border border-q-subtle
                bg-q-w-05 p-3 transition-colors hover:border-q-default">
  <div class="flex items-center gap-3">
    <PlayButton />                       ← size-10, rounded-q-full, bg-q-card-strong
    <Waveform />                         ← flex-1, h-10
    <span class="shrink-0 text-q-caption-l tabular-nums text-q-soft">
      {elapsed} / {duration}</span>
  </div>
  <p class="line-clamp-2 text-q-caption-l text-q-soft">{prompt}</p>
  <div class="flex items-center gap-2 text-q-caption-xs font-medium text-q-soft">
    {model} · {format} · {sampleRate}
  </div>
</article>
```

**Waveform** — a row of bars, `flex h-10 items-end gap-px`, each bar
`w-0.5 rounded-full`. Played bars are `bg-q-brand`, unplayed `bg-q-w-20`; the split
is a percentage, so it is one inline `style` on a wrapper, commented like the
slider fill.

Per D4, heights come from the job id, not from the file:

```ts
// lib/waveform.ts — pure, no I/O, unit-tested
export function waveformBars(id: string, count = 64): number[];
```

A small deterministic hash over the id, normalised to `0.15–1`. Same id, same
picture, every reload and every machine — and no CORS surface.

**Playback** — one `<audio>` element per tile, `preload="metadata"`. Only one plays
at a time: starting one pauses the rest. Clicking the waveform seeks. `duration`
from the store holds the tile's layout before metadata loads; once the real
`loadedmetadata` fires, prefer the element's value.

**Pending tiles.** A job that has not landed renders the same frame with the
waveform replaced by a shimmer and the time replaced by the phase label —
`Processing…` then `Generating…`, from the existing `GenerationPhase`. The tile
keeps its height throughout, so nothing below it moves when the asset lands. This
is exactly what `pending-tile.tsx` does for images; follow it.

**Empty state.** No generations and the user has switched to History deliberately:
centre a `studio-empty-state` with a line of copy and nothing else. When History is
empty the pane opens on `How it works` instead, which is why the reference shows
that tab first when logged out.

**Row actions** — on `group-hover`, a trailing cluster: download, copy prompt,
delete. Delete calls the store's existing `remove`.

---

## 7. Schema

`src/schemas/audio-generation.ts`. One discriminated union on `mode`, per D3.
Option lists derive from `config/audio.ts` rather than being restated, so a model
added there validates here without a second edit — and one removed there stops
validating. Same contract as the two existing schemas.

```ts
const attachment = z.custom<File>(
  (v) => typeof File !== "undefined" && v instanceof File,
  "Expected a file.",
);

const ttsSchema = z.object({
  mode: z.literal("tts"),
  script: z
    .string()
    .trim()
    .min(1, "Write what the voice should say.")
    .max(
      SCRIPT_MAX_LENGTH,
      `Keep the script under ${SCRIPT_MAX_LENGTH} characters.`,
    ),
  modelId: z.enum(MODEL_IDS),
  batch: z.number().int().min(1).max(MAX_BATCH),
  attachments: z.array(attachment).max(3, "Up to 3 attachments."),
  voiceDetails: z.string().trim().max(VOICE_DETAILS_MAX_LENGTH),
  advanced: advancedSchema,
});

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

export const audioGenerationSchema = z.discriminatedUnion("mode", [
  ttsSchema,
  voiceChangeSchema,
  translateSchema,
]);
```

Two rules need `superRefine`, for the same reason the video schema does — they are
conditional on another field:

1. **`voice` and `clip` are required, but only on their own tab.** Modelled as
   `.nullable()` plus a refinement rather than a non-nullable field, because the
   form legitimately holds `null` while the user is still attaching; a
   non-nullable field would make the resting state a type error.
2. **Advanced values must be legal for the selected model.** Not every model
   accepts every sample rate. The panel swaps to a supported value on model
   change, so this is the backstop for a pairing the UI should never produce — a
   restored `localStorage` draft from §5.7's Save settings, most likely.

### Request projection

A `File` does not survive `JSON.stringify` — it serialises to `{}`. So, exactly as
`toVideoRequest` does, the wire payload is a deliberate projection: the decisions,
plus enough of the media to describe it.

```ts
export const audioGenerationRequestSchema = z.discriminatedUnion("kind", [ … ]);
export function toAudioRequest(values: AudioGenerationValues): AudioGenerationRequest;
```

Every arm carries `kind: "audio"` plus its `mode`, so the generations endpoint
switches on `kind` first and `mode` second. Attachments project to
`{ name, size, type }`. A real backend would take the bytes as multipart and this
shape as its metadata part.

---

## 8. Pipeline

Audio slots into seams the codebase already has. The type module even says so:
`GenerationKind` has included `"audio"` since the image studio landed.

### 8.1 Types — `src/types/generation.types.ts`

```ts
export interface GenerationAsset {
  url: string;
  poster?: string;
  /** Seconds. Audio only — lets a waveform tile size itself before the
      file loads, the same job w/h do for an image. */
  duration?: number;
}

export type PendingRequest =
  | { kind: "image"; values: ImageGenerationValues }
  | { kind: "video"; values: VideoGenerationValues }
  | { kind: "audio"; values: AudioGenerationValues }; // ← new arm
```

`Generation` gains an optional `duration` on the `ready` arm, carried through by
`applyStatus`. Delete the "Video and audio are not built yet" comment on
`GenerationKind` — it will be false.

**`w`/`h` for audio.** A `GenerationJob` requires them. Audio has no frame, so the
job reports `{ w: 1, h: 1 }` and the tile ignores it. Widening `GenerationJob` to
make them optional would mean guarding every existing read for a case that only
arises here; a documented sentinel is the smaller change.

### 8.2 Job service — `src/server/generation-jobs.server.ts`

Add `audio` to `JobKind` and `'a'` to `KIND_TAG`; `ID_PATTERN` becomes
`/^([gva])([0-9a-z]+)\.([0-9a-z]+)\.[0-9a-z]+$/`. Everything else — the stateless
deadline-in-the-id scheme, the phase thresholds, the forgeability trade — carries
over unchanged and needs no new reasoning.

```ts
const AUDIO_BASE_MS = 4200; // between image (2.6s) and video (7s)
const AUDIO_STAGGER_MS = 400; // wider than the 300ms poll, per the existing note
const AUDIO_JITTER_MS = 200;
const AUDIO_GENERATING_MS = 2400;

export function createAudioJobs(
  values: AudioGenerationRequest,
): GenerationJob[];
```

TTS honours `batch` and staggers like the image path; Voice Change and Translate
are single-job like video. `readJob` returns an `AUDIO_FIXTURES` entry with its
`duration`.

### 8.3 Endpoint — `src/app/api/generations/route.ts`

The route already switches on `kind` with a missing `kind` meaning image. Add a
third branch before the image fallback:

```ts
if (kind === "audio") {
  const parsed = audioGenerationRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ … }, { status: 422 });
  return Response.json({ jobs: createAudioJobs(parsed.data) }, { status: 202 });
}
```

Polling needs no change at all — `GET /api/generations/[id]` reads the kind out of
the id.

### 8.4 Client service — `src/services/audio-generation.ts`

Mirrors `video-generation.ts` exactly: one `requestAudioGeneration(values)` that
POSTs `toAudioRequest(values)` and returns `GenerationJob[]`. Polling is **not**
reimplemented — `fetchGeneration` is imported from the image service, as the video
service already does. If the endpoint ever diverges per kind, that import is the
seam to split.

### 8.5 Store

**No changes.** `enqueue`, `applyStatus`, `remove`, `holdRequest`, `takeRequest`
and `useGenerationsOfKind("audio")` all work as they stand. `applyStatus` needs one
line to carry `duration` onto the ready arm.

---

## 9. Behaviour and state

The composition root is `audio-studio.tsx`, modelled on `genjutsu-studio.tsx`.

| State                           | Lives in                       | Why                                                                                                   |
| ------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Active form tab                 | `useState` in the studio root  | Swaps the form body; also decides the `How it works` copy, so both columns must agree                 |
| Pane tab                        | `useState` in the studio root  | The form can push it — submitting switches to History                                                 |
| Selected model                  | `useState`                     | Not in the URL: `/audio` takes no `?model=` on the reference, and inventing one would be a divergence |
| Advanced open                   | `useState` in the panel        | Changes layout, not paint                                                                             |
| Advanced values                 | form state (`react-hook-form`) | They are request fields                                                                               |
| Playback position               | `useState` per tile            | Genuinely per-tile runtime state                                                                      |
| Hover / press / focus / checked | **CSS only**                   | Per `CLAUDE.md`                                                                                       |

Form plumbing is `react-hook-form` + `zodResolver`, `mode: "onSubmit"`, with custom
controls through `Controller` — none of them are native inputs. Matching the video
panel, validation says nothing until submit: an error that appears while someone is
still attaching their first clip is worse than useless.

**Polling.** One React Query per running job, `POLL_MS = 500` — between the image
studio's 300ms and the video studio's 600ms, in proportion to the job length.
`refetchIntervalInBackground: true`, and a query stops the moment its job reads
`ready`.

**Submit flow**, unchanged from video:

```
onSubmit(values)
  ├── no user → holdRequest({ kind: "audio", values }); openAuth("signup")
  └── user    → generate(values)
                  └── onSuccess → enqueue("audio", modelId, jobs)
                                  setPaneTab("history")
```

The effect that watches for sign-in picks up a held request and narrows on
`held?.kind === "audio"`. `takeRequest` reads and clears atomically, so it fires
once even under StrictMode's double-invoked effects.

---

## 10. Logged-out gate

Reuses the existing gate wholesale; no new auth surface.

- **Generate** parks validated values and opens the auth dialog. Because the values
  are already validated, an empty script still fails in the panel rather than
  asking someone to sign in and only then discover they submitted nothing.
- **History** is signed-in only. On the reference, clicking it while logged out
  does nothing — the tab stays on `How it works`. Ours does better: the tab
  switches and the pane shows a short gate with a sign-in button, which is
  honest about why it is empty.
- Everything else — all three forms, the model popover, advanced settings — is
  fully usable logged out. That matches the reference and it is the right call:
  the panel is the product demo.

---

## 11. Responsive

One breakpoint, `md` (768px), and it is a bigger change than the video studio's.

**≥768px** — the two-column grid of §3.

**<768px** — the panel becomes a full-screen sheet and the pane is not rendered:

```
fixed inset-0 z-50 flex flex-col bg-q-page
├── header  flex h-14 shrink-0 items-center gap-2 px-4
│   ├── LogoMark          ← 32px, lime, rounded
│   ├── "CREATE AUDIO"    ← font-q-display uppercase, text-q-brand-xxs
│   ├── ChevronDown       ← surface switcher (Image / Video / Audio)
│   └── CloseButton       ← ml-auto, size-10, rounded-q-200, bg-q-w-05
├── PanelTabs             ← same component, larger touch targets
├── form                  ← same fields, full width, flex-1 overflow-y-auto
└── footer  flex shrink-0 items-center gap-2 px-4 pb-4
    ├── BatchStepper      ← moves out of its row into the footer
    └── GenerateButton    ← flex-1
```

Two things move rather than restyle, and both are order/container changes
expressible in classes — per D8 there is no second component tree:

1. **The batch stepper leaves its row** and becomes a compact `− n +` pill beside
   the CTA. Its row is `md:flex hidden`; the footer copy is `md:hidden`.
2. **Advanced settings stops expanding inline** and opens as a nested sheet, since
   an inline panel would bury the CTA on a phone.

The `How it works` card's own container queries (`@max-[640px]`) already handle the
narrow case and need no media query.

---

## 12. Accessibility

- Panel tabs and pane tabs are real `tablist`/`tab`/`tabpanel` triples with roving
  `tabindex` and arrow-key movement.
- Every slider — intensity, mood, speed, pitch, volume — is a visually-hidden
  `<input type="range">` with the paint as siblings. Arrow keys, `Home`/`End` and
  announcement come free. `aria-valuetext` on the mood fader reads `Angry` /
  `Neutral` / `Happy` rather than `-1` / `0` / `1`.
- The Save-settings switch is a checkbox with `peer-checked:` paint.
- The drop zones are buttons wrapping labelled file inputs, reachable and operable
  from the keyboard; drag-and-drop is an enhancement, never the only route.
- Popovers trap focus, close on `Escape` and on outside click, and return focus to
  their trigger. `use-dismiss.ts` already does this.
- Each history tile's play control is a button with an accessible name naming the
  generation (`Play "The fog rolled in…"`), not a bare icon.
- Live regions: phase changes (`Processing` → `Generating` → `Ready`) announce via
  a polite region, once per job, not once per poll.
- `motion-reduce:` on the shimmer, the CTA transition and the sheet animation.

---

## 13. File map

**New:**

```
src/app/(studio)/audio/page.tsx                     route, metadata, renders the studio
src/config/audio.ts                                 models, rates, languages, formats,
                                                    sample rates, advanced defaults, tabs
src/config/audio-fixtures.ts                        remote clip URLs + durations
src/schemas/audio-generation.ts                     union schema, request projection
src/services/audio-generation.ts                    requestAudioGeneration
src/lib/waveform.ts                                 deterministic bars from a job id (pure)
src/lib/audio-cost.ts                               rate × batch (pure)
src/lib/script-tokens.ts                            @-mention serialise/parse (pure)

src/components/audio-studio/audio-studio.tsx        composition root
src/components/audio-studio/audio-panel.tsx         panel shell + tabs
src/components/audio-studio/tts-form.tsx
src/components/audio-studio/voice-change-form.tsx
src/components/audio-studio/translate-form.tsx
src/components/audio-studio/upload-zone.tsx
src/components/audio-studio/script-field.tsx
src/components/audio-studio/setting-row.tsx         the h-12 / h-14 row primitive
src/components/audio-studio/audio-model-popover.tsx
src/components/audio-studio/language-popover.tsx
src/components/audio-studio/advanced-settings.tsx
src/components/audio-studio/intensity-slider.tsx
src/components/audio-studio/mood-fader.tsx
src/components/audio-studio/audio-cta.tsx
src/components/audio-studio/audio-pane.tsx
src/components/audio-studio/audio-how-it-works.tsx
src/components/audio-studio/audio-history.tsx
src/components/audio-studio/waveform.tsx
src/components/audio-studio/waveform-tile.tsx
src/components/audio-studio/audio-sheet.tsx         the <md shell
```

**Modified:**

```
src/types/generation.types.ts        PendingRequest arm, GenerationAsset.duration
src/server/generation-jobs.server.ts createAudioJobs, 'a' tag, widened ID_PATTERN
src/app/api/generations/route.ts     audio branch
src/stores/generation-store.ts       carry duration onto the ready arm
src/config/site.ts                   Audio nav entry gets href: "/audio"
src/styles/tokens/q-studio.css       --q-bg-section, .q-cta-audio, the five ramps
src/app/globals.css                  project the new tokens through @theme inline
src/components/image-studio/batch-stepper.tsx   → moves to components/forms/,
                                     gains optional `max` → "n / max" form
src/components/image-studio/setting-popover.tsx → moves to components/forms/
src/components/image-studio/composer.tsx        follow the two moves above
```

**Reused unchanged:** `QPopover`, `QTabs`, `QSelect`, `use-dismiss.ts`,
`studio-empty-state.tsx`, `pending-tile.tsx` (as the pattern), `auth-context`,
the whole store, `fetchGeneration`.

**Promoted, then reused:** `batch-stepper.tsx` and `setting-popover.tsx` move from
`components/image-studio/` to `components/forms/`. Both are pure presentational
primitives with no image-specific knowledge, so the move is an import rewrite in
`composer.tsx` and nothing more.

---

## 14. Risks and follow-ups

| Risk                                                         | Mitigation                                                                                                                                                                                                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fixture audio URLs are another origin's and may rotate       | Same accepted risk as D4 in the Genjutsu spec. Keep them in one typed module so a rotation is a one-file change; if they go dark, fall back to a short locally-generated tone so tiles still play.                                                 |
| The `@`-mention editor is the one genuinely fiddly control   | Keep serialisation in `lib/script-tokens.ts`, pure and unit-tested. If the `contenteditable` proves unstable, degrade to a plain `<textarea>` where `@` inserts literal text — the schema sees a string either way, so nothing downstream changes. |
| Our credit formula will not match the reference's            | Stated openly in D5. `config/audio.ts` is the single edit if the real rule is ever worked out.                                                                                                                                                     |
| Three tabs is real surface area                              | The two secondary tabs share `upload-zone.tsx` and the CTA with TTS. If they slip, they ship inert as the Genjutsu spec's D3 did — but that is a schedule decision, not a design one.                                                              |
| `--q-switch-off` drift (`#5c626a` vs the measured `#5e636e`) | Re-measure once on both surfaces and settle on one value rather than adding a second token.                                                                                                                                                        |
| Sheet and two-column sharing components                      | Verify at 767px and 768px specifically; the stepper moving between containers is where it will break.                                                                                                                                              |

---

## 15. Acceptance

A build is done when, at 1440×900 logged out:

1. The panel is **342px** wide with a **24px** radius; the pane starts at
   **x=358** and has no border or card of its own.
2. Panel tabs spread `justify-between`; the active one is white with a 2px white
   underline, the others `rgba(255,255,255,0.6)`.
3. The drop zone is **160px** tall with an **SVG** dashed border (`3 3`,
   `rgba(255,255,255,0.08)`, 1.5px) and overlapping 40px chips.
4. `Generate` is **disabled** on an empty script, and stays disabled when only
   _Voice details_ is filled.
5. Typing a script enables it and reveals `✦ {cost}`; raising batch to 2 doubles
   the number.
6. The model popover is **316px** wide, lists five models under `Featured models`,
   marks the selected one with a lime check and a lime tile glyph, and filters on
   search.
7. `Advanced settings` expands inline to: intensity slider (9 ticks, default 5),
   mood fader (handle overhanging the track, `Angry`/`Neutral`/`Happy`), a
   three-up Speed/Pitch/Volume row at 58px, Output format, Sample rate and a
   Save-settings switch.
8. Voice Change shows two **Required** zones and nothing else; Translate shows one
   plus a Language row with a flag.
9. Submitting signed out parks the request and opens the auth dialog; signing in
   runs it exactly once.
10. A submitted TTS batch of 4 produces four tiles that arrive staggered, each
    moving `Processing → Generating → Ready` without the column reflowing.
11. A ready tile plays; starting a second tile pauses the first; the waveform is
    identical across reloads for the same generation.
12. At 375px the panel is a full-screen sheet, the pane is gone, and the batch
    stepper sits beside the CTA in the footer.
13. Keyboard alone can reach and operate every control, and `prefers-reduced-motion`
    stops the shimmer and the sheet animation.
