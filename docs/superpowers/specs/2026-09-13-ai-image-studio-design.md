# `/ai/image` — studio surface, 1:1 design spec

Target: `https://higgsfield.ai/ai/image?model=gpt_image_2`, signed in.

Every number below was measured off the live DOM (computed styles and
`getBoundingClientRect`) at a 1728 × 906 viewport unless stated otherwise, not
estimated from screenshots. The live site is a TanStack Start app using Radix
popovers and a 10.8 MB Tailwind bundle; we rebuild the same surface in Next 16
with the repo's own `q-` studio token layer and the existing `Dropdown`
primitive. Parity is on **rendered output and interaction states**, not on
their DOM or class names.

---

## 1. Scope

In scope — the whole `/ai/image` route at `md` and above:

- the canvas: masonry feed of past generations, its zoom control, tile hover
  affordances, the tile context menu, multi-select and the selection bar;
- the composer: prompt editor, reference button, model picker, four setting
  popovers, batch stepper, Generate button with live credit pricing;
- every hover / focus / open / selected / disabled state of the above;
- the `< md` layout (composer hidden, bottom tab bar).

Out of scope — shared chrome already built in this repo (`site-header`), and
the routes the tile actions link to (`/flow`, `/layers`, `/asset/all`).

Explicitly **not observable** on the live site from this account (0 credits),
recorded here so the implementation makes a deliberate choice rather than an
accidental one:

| Unobservable                                                         | Decision                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In-flight generation tile                                            | Build a placeholder tile: same masonry cell, `bg-q-card`, centred spinner, no hover overlay. The live DOM carries a `#image-feed-loader` node and a `fixed top-[45%] left-1/2 … animate-spin` page spinner, so a spinner is the right family. |
| Empty feed (new account)                                             | Render nothing in the canvas — composer only. No invented hero or preset grid.                                                                                                                                                                |
| Submit error toast                                                   | Not built.                                                                                                                                                                                                                                    |
| `Create element` / `Additional` / `Share` / `Add to folder` submenus | Render the parent item with its `▸` affordance; submenu contents are stubs.                                                                                                                                                                   |

---

## 2. Colour and type, as measured

The repo already owns a studio token layer (`src/styles/tokens/q-studio.css`,
projected into Tailwind in `globals.css`). These are the live values; where the
existing token is close but not exact, the spec corrects it.

### Surfaces

| Live value            | Role                               | Token                                                  |
| --------------------- | ---------------------------------- | ------------------------------------------------------ |
| `#0f1113`             | page / body                        | `--q-bg-page` ✅ already correct                       |
| `#131517`             | zoom-slider capsule                | `--q-bg-primary` ✅                                    |
| `rgba(15,17,19,0.96)` | composer outer shell               | **new** `--q-bg-composer`                              |
| `#1b1b1b`             | setting popovers ("modal default") | **new** `--q-bg-modal`                                 |
| `#1c1e20`             | model dialog base (at 95%)         | `--q-bg-secondary` — **correct `#1c1e21` → `#1c1e20`** |
| `#222222`             | settings pills at rest             | **new** `--q-bg-pill`                                  |
| `#23262a`             | tile context menu (at 75%)         | `--q-bg-secondary-strong` ✅                           |

### Borders

The composer and its pills are bordered in **lime alpha, not white alpha** —
this is the single most visible thing a naive clone gets wrong.

| Live value               | Role                                         | Token                         |
| ------------------------ | -------------------------------------------- | ----------------------------- |
| `rgba(209,254,23,0.05)`  | composer shell, every pill, setting popovers | **new** `--q-border-brand-5`  |
| `rgba(209,254,23,0.10)`  | the `+` reference button                     | **new** `--q-border-brand-10` |
| `rgba(217,217,217,0.04)` | cards, menus, separators                     | `--q-border-card` ✅          |

### Ink

| Live value               | Role                                              |
| ------------------------ | ------------------------------------------------- |
| `#f7f7f8`                | body text, prompt text                            |
| `#ffffff`                | pill labels, option labels                        |
| `rgba(255,255,255,0.6)`  | placeholder, popover titles, secondary labels     |
| `#898a8b`                | model descriptions, section-header icons          |
| `#d1fe17`                | brand: check marks, model logos, badges, Generate |
| `#e72930`                | destructive menu item                             |
| `rgba(255,255,255,0.08)` | selected/hover fill inside setting popovers       |
| `rgba(255,255,255,0.05)` | selected/hover fill inside the model dialog       |
| `rgba(255,255,255,0.10)` | hover fill inside the tile context menu           |

### Type

Live font stack is **Inter** (sans), **Space Grotesk** (badges only), Space
Mono. The repo ships Archivo + JetBrains Mono. Studio components get Inter via
a `--font-q-sans` addition; the marketing layer is untouched.

| Live token       | px / line-height | Used by                                  |
| ---------------- | ---------------- | ---------------------------------------- |
| `text-caption-l` | 14 / 20, w400    | pill labels, option rows, popover titles |
| `text-caption-m` | 12 / 16          | —                                        |
| `text-caption-s` | 10 / 14          | option sublabels ("2048px")              |
| `text-sm-medium` | 14 / 20, w500    | context-menu items                       |
| `text-xs-medium` | 12 / 18, w500    | model names                              |
| `text-xxs`       | 10               | model descriptions                       |
| `text-body-s`    | 16 / 24          | the word "Generate"                      |

Badge type is `font-grotesk`, `10px`, `700`, `uppercase`, `-skew-x-12`.

---

## 3. Page skeleton

```
body  bg #0f1113, color #f7f7f8, font Inter
├─ route-progress bar                     (already in repo)
├─ header wrapper            h 44,  header itself h 36, z 51
└─ main                      h-full min-w-0
   └─ div                    relative size-full grid grid-cols-[1fr] gap-3
      ├─ canvas column       relative size-full min-w-0
      │  └─ flex flex-col size-full gap-2.5
      │     ├─ toolbar row   h 32,  flex items-center justify-end, .container, z-10
      │     │   └─ zoom capsule   172 × 32, hidden md:flex
      │     └─ feed viewport flex-1 min-h-0 relative
      │         └─ scroller  absolute inset-0 overflow-y-scroll overflow-x-hidden
      │                      hide-scrollbar pr-4
      │             └─ masonry  w-full relative mb-60   (240px runway under the composer)
      ├─ composer            fixed bottom-4, centred, z-50
      └─ overlay layer       fixed inset-x-0 top-0 bottom-2 z-100 pointer-events-none
                             (hosts the selection bar)
```

Two consequences worth stating because they are easy to lose:

- **The page never scrolls.** The live app injects
  `html, body { min-height: 0 !important }` and scrolls only the feed viewport.
  This repo's `(studio)/layout.tsx` already establishes that.
- **`mb-60` (240px) under the masonry** is what keeps the last row clear of the
  fixed composer. It is not padding on the scroller.

A custom scrollbar sits at `absolute right-0 top-0 bottom-0 w-4` with a `w-4`
thumb; the native one is suppressed with `hide-scrollbar`. We reuse the repo's
`hf-scrollbar` rather than rebuilding a JS scrollbar — visually equivalent, far
less code.

---

## 4. Composer

### 4.1 Shell

```
wrapper   fixed bottom-4  left-1/2 -translate-x-1/2  w-full  max-w-[1120px]
          p-0.5  rounded-[26px]  bg-[rgba(15,17,19,0.96)]  z-50  hidden md:flex
  form    w-full  p-[22px]  rounded-3xl(24px)  border border-q-brand-5
          backdrop-blur-[10.45px]
```

The 2px `p-0.5` on the wrapper plus the 26/24 radius pair is what produces the
double-ring look. Keep both.

### 4.2 Layout inside the form

```
fieldset                      flex gap-3
├─ left column                flex-1 space-y-2 min-w-0
│  ├─ row 1                   flex gap-3   (h 40)
│  │  ├─ input[type=file]     sr-only
│  │  ├─ "+" button           32×32
│  │  └─ prompt editor        flex-1
│  └─ row 2                   flex h-10 items-center gap-2
│     ├─ model pill           160×40, shrink-0, NOT in the scroller
│     └─ scroller             relative min-w-0 flex-1
│        ├─ rail              hide-scrollbar overflow-x-auto overscroll-x-none
│        │                    → flex min-w-full w-max items-center gap-2
│        │                       aspect · quality · resolution · background · stepper
│        ├─ ◀ arrow           absolute -left-2  top-1/2 -translate-y-1/2 size-4
│        └─ ▶ arrow           absolute -right-2 top-1/2 -translate-y-1/2 size-4
└─ aside                      relative z-20 h-[84px] self-end flex items-end justify-end
   └─ Generate                min-w-[176px] h-full
```

The model pill is deliberately **outside** the horizontal scroller — it stays
pinned while the other five scroll.

### 4.3 `+` reference button

|               |                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box           | 32 × 32, `rounded-[10px]`                                                                                                                                           |
| Rest          | `bg-[#1b1b1b]`, `border border-q-brand-10`, icon 16px `#fff`                                                                                                        |
| Hover         | icon → `#d1fe17`, background → `rgba(209,254,23,0.05)`                                                                                                              |
| Focus-visible | 2px brand ring                                                                                                                                                      |
| Behaviour     | opens the hidden `input[type=file]` (reference image)                                                                                                               |
| Quirk         | the live button carries an inline `top: -5.5px` nudge so its 32px box optically centres against the 40px editor row. Reproduce with `-mt-[5.5px]`, and comment why. |

### 4.4 Prompt editor

The live control is a **`contenteditable` div with `role="textbox"`**, not a
`<textarea>`; the placeholder is a sibling absolutely-positioned div, not the
`::placeholder` pseudo-element.

We use a plain auto-growing `<textarea>` instead. It is keyboard- and
IME-correct for free, participates in form submission, and `::placeholder`
gives the identical rendering. The only thing lost is rich inline content,
which this surface does not use.

|             |                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Type        | 14px / 20px, `#f7f7f8`                                                                                    |
| Placeholder | "Describe the scene you imagine", `rgba(255,255,255,0.6)`                                                 |
| Height      | 1 line at rest (40px row), grows per line, **max 112px** (`max-h-28`), then scrolls with `hide-scrollbar` |
| Focus       | no visible container change — the composer border does not react                                          |
| Growth      | the whole composer grows upward; the Generate button stays bottom-aligned via `self-end` on the aside     |

Verified: 4 lines of prompt grew the form from 134 → 174px with the Generate
button pinned to the bottom edge.

### 4.5 Setting pills — shared anatomy

|        |                                                                                                                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box    | `h-10`, `rounded-xl` (12px), `px-3 py-2.5`, `gap-1`                                                                                                                                                                                 |
| Rest   | `bg-[#222]`, `border border-q-brand-5`                                                                                                                                                                                              |
| Label  | 14px / 500, `#fff`                                                                                                                                                                                                                  |
| Icon   | 16–20px, `#fff`                                                                                                                                                                                                                     |
| Widths | model 160 · aspect 81 · quality 81 · resolution 68 · background 81 · stepper 106 — all content-derived, so a longer value widens the pill (selecting "Transparent" visibly widens the background pill and pushes the stepper right) |

Icons, matched to the live glyphs (Lucide substitutes):

| Pill         | Live glyph            | Lucide                                           |
| ------------ | --------------------- | ------------------------------------------------ |
| Model        | vendor logo, lime     | per-model (`sparkle`, `chart-no-axes-column`, …) |
| Aspect ratio | four corner brackets  | `maximize`                                       |
| Quality      | gem outline           | `gem`                                            |
| Resolution   | gem outline           | `gem`                                            |
| Background   | brackets around a dot | `scan`                                           |

The model pill additionally has a trailing chevron (a `chevron-down` rotated
-90°, i.e. pointing right) in `rgba(255,255,255,0.6)` that **turns lime on
hover of the pill**. The other pills have no chevron.

### 4.6 Batch stepper

`− 1/4 +` in a pill of the same treatment.

- Range 1…4, default 1.
- The current number is `#fff`; `/4` is `rgba(255,255,255,0.6)`.
- `−` is disabled (and dimmed to `#898a8b`) at 1; `+` is disabled at 4.
- Changing it rescales the Generate price linearly — measured 1 → `8.5 / 6.5`,
  2 → `17 / 13`, 4 → `34 / 26`.

### 4.7 Settings-row scroll arrows

Two 16px round buttons overhanging the rail at `-left-2` / `-right-2`.

- Colour `rgba(255,255,255,0.45)`, hover `rgba(255,255,255,0.70)`, `transition`.
- Visibility is **scroll-position driven**, not hover driven: `opacity-0
pointer-events-none` when that direction has nothing to scroll to.
  Confirmed at 800px viewport — left `0`, right `1`.
- At 1728px nothing overflows and both are hidden; they start appearing around
  a 820px viewport.

### 4.8 Generate button

```
min-w-[176px]  h-[84px]  rounded-xl  bg-[#d1fe17]  text-[#14151a]
text 14px/600 ·  gap-2
```

Content, left to right: **Generate** (`text-body-s`, 600) · sparkle icon 16px ·
old price · new price.

The struck-through old price is the detail worth copying exactly:

```html
<span class="relative opacity-50"
  >8.5
  <span
    class="absolute top-1/2 right-[-2px] left-[-2px] rotate-30 border-t-[1.5px] border-current"
  ></span>
</span>
```

A 30°-rotated 1.5px rule — not `line-through`.

| State         | Treatment                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------- |
| Hover         | `bg-[rgba(209,254,23,0.8)]`                                                                   |
| Focus-visible | same fill + brand ring                                                                        |
| Disabled      | `bg-[#222]`, text `rgba(255,255,255,0.32)`, neutral border                                    |
| Empty prompt  | **not** disabled on the live site — verified `button.disabled === false` with an empty editor |

Price = `model.credits × batch`, with `model.listCredits × batch` struck
through. Resolution changes it too: GPT Image 2 at 2K is `8.5 / 6.5`, at 4K
`14 / 11`.

---

## 5. Popovers

Two distinct patterns. Both are built on the repo's existing portal `Dropdown`
(fixed positioning off the trigger rect, flip-up when short of room below,
outside-click and `Escape` to close) — the live ones are Radix, and flip the
same way.

### 5.1 Pattern A — titled listbox (aspect, quality, resolution, background)

```
wrapper      z-[100]  flex flex-col   w-[200px] (aspect, background)
                                      w-[300px] (quality, resolution)
title span   absolute top-0 left-0  pt-2.5 px-3  w-full
             rounded-t-xl  border-t border-l border-r border-q-brand-5
             bg-[#1b1b1b]  text-[rgba(255,255,255,0.6)] text-[14px]
listbox      role=listbox  pt-8 pb-2 px-1  rounded-xl
             border border-q-brand-5  bg-[#1b1b1b]
             overflow-auto hide-scrollbar
```

The title is a separate absolutely-positioned element that paints its own top
and side borders; the listbox's `pt-8` reserves the space. That is why the
title appears to sit _inside_ the panel's border without a divider.

Option rows, `role="option"`, `px-1.5 py-1.5`, **`capitalize` on the whole
button** (so the source string `"fastest and cheapest"` renders as "Fastest And
Cheapest" — reproduce the class, not pre-capitalised strings):

**With-icon variant** (aspect ratio, background) — 48px tall, two separately
filled segments with a 4px gap:

```
div.flex.group.gap-1.w-full
├─ icon tile   w-8 p-1 rounded-md flex items-center justify-center
│              selected → bg-white/8 ; else group-hover:bg-white/8
│              svg 20px #fff
└─ label area  flex flex-1 items-center gap-2 justify-between p-2 rounded-md
               selected → bg-white/8 ; else group-hover:bg-white/8
               label 14px  +  check svg 16px rgba(255,255,255,0.6) when selected
```

Both segments light together on hover (`group-hover`), and stay lit when
selected. Hover and selected are the _same_ fill — only the check distinguishes
them.

**Two-line variant** (quality, resolution) — 62px tall, one full-width segment:

```
label area   flex flex-1 items-center gap-2 justify-between p-2 rounded-md
├─ column    title 14px #fff
│            sub   10px rgba(255,255,255,0.6)
└─ check     16px, when selected
```

Contents:

| Popover      | Title               | Options                                                                                                                                             |
| ------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aspect ratio | `Aspect ratio`      | Auto · 1:1 · 3:2 · 2:3 · 16:9 · 9:16 · 4:3 · 3:4 · 21:9 — each with a **proportionally drawn rectangle** icon; `Auto` uses the corner-bracket glyph |
| Quality      | `Select quality`    | Low / "fastest and cheapest" · Medium / "balanced visuals" · High / "best visual fidelity"                                                          |
| Resolution   | `Select resolution` | 1K / "1024px" · 2K / "2048px" · 4K / "4096px"                                                                                                       |
| Background   | `Select background` | Auto · Opaque · Transparent (each with an icon)                                                                                                     |

The ratio icons are drawn, not iconographic: a 1:1 option shows a square, 16:9
a wide rectangle, 9:16 a tall one — all inside the same 20px box. Implement as
a small SVG that takes `w`/`h` and centres a `rect` scaled to fit.

Selecting an option commits the value and closes the popover. Defaults: Auto ·
High · 2K · Auto.

### 5.2 Pattern B — model dialog

```
role=dialog  z-[100]  rounded-2xl  w-[400px]  max-w-[calc(100vw-32px)]
             max-h-[min(40rem,calc(100vh-32px))]
             border border-q-hairline  bg-[rgba(28,30,32,0.95)]  backdrop-blur-[32px]
             flex flex-col
```

Fixed height: the panel stays 640px tall whether it lists 33 models or zero.

**Search row** — `h-[42px]`, `px-1.5 py-0.5`, `flex items-center gap-2`,
`border-b border-q-hairline`, `cursor-text`; 24px magnifier in `#898a8b`; input
`text-sm flex-1 bg-transparent outline-none`, placeholder `Search...`.
Autofocused on open.

**Scroll body** — `hide-scrollbar overflow-y-auto overscroll-contain`, with a
38px fade overlay pinned top and bottom that cross-fades on scroll position
(top starts at `opacity-0`, bottom at `opacity-100`).

**Sections** — header `flex items-center gap-1.5 px-3 py-2` with a 14px
`#898a8b` icon; body `px-3 flex flex-col gap-1`.

**Row** — 52px:

```
button  w-full flex items-center rounded-xl pl-1.5 py-1.5 pr-3 text-start
        transition-colors  hover:bg-white/5  focus-visible:bg-white/5
        selected → bg-white/5
├─ icon tile  size-10 rounded-lg bg-white/5 mr-2 text-[#d1fe17]
│             shadow-[inset_0_2px_3px_rgba(255,255,255,0.03)]   svg 16px
├─ text       flex-1 min-w-0 flex flex-col items-start gap-1
│  ├─ row     flex items-center gap-1.5 flex-wrap
│  │          name  12px/500 #fff   +   badge
│  └─ desc    10px #898a8b
└─ check      20px #d1fe17, only when selected
```

**Badge** — one component, two labels (`NEW`, `PREMIUM`), identical styling:
`font-grotesk text-[10px] uppercase font-bold px-1 h-4 leading-4 rounded-sm
-skew-x-12 bg-[#d1fe17] text-[#131517]`.

**Search** filters across both sections and drops a section that has no
matches. No match at all → the body shows `No models found` in
`rgba(255,255,255,0.6)`, and the panel keeps its full height.

**Catalogue** — the live list, verbatim.

_Featured models_ (12): Higgsfield Soul 2.0 · Higgsfield Soul Cinema · GPT
Image 2.5 Sunburst `NEW` · GPT Image 2.5 Flare `NEW` · GPT Image 2 `PREMIUM` ·
Seedream 5.0 Pro `PREMIUM` · Seedream 5.0 lite · Seedream 4.5 `PREMIUM` · Nano
Banana Pro · Nano Banana 2 `PREMIUM` · Nano Banana 2 Lite `PREMIUM` · Recraft
V4.1 `PREMIUM`

_All models_ (21): Auto · Nano Banana `PREMIUM` · Higgsfield Soul · Higgsfield
Face Swap · Higgsfield Character Swap · Seedream 4.0 `PREMIUM` · GPT Image 1.5
`PREMIUM` · Grok Imagine `PREMIUM` · Grok Imagine 2.0 `PREMIUM` · Recraft V4.1
`PREMIUM` · Recraft V4.1 Utility `PREMIUM` · Recraft V4 Styles `NEW` · Z-Image
· Kling O1 `PREMIUM` · FLUX.2 Pro · FLUX.2 Flex `PREMIUM` · FLUX.2 Max
`PREMIUM` · Flux Kontext Max `PREMIUM` · GPT Image `PREMIUM` · Multi Reference
`PREMIUM` · WAN 2.2

Descriptions are carried verbatim in config (e.g. GPT Image 2 → "4K images with
near-perfect text rendering"). Recraft V4.1 appears in both sections; it is one
model listed twice.

---

## 6. Feed

### 6.1 Masonry

Absolutely-positioned cells over a `relative` container, ~2px gutters, column
count from the zoom control, cell height from each image's aspect ratio.

The zoom value sets a **column ceiling**, not the final count — verified at
1728 and 1440:

| slider value | 0   | 1   | 2   | 3 (default) | 4   |
| ------------ | --- | --- | --- | ----------- | --- |
| columns      | 7   | 6   | 5   | 4           | 3   |

A narrow window overrides that ceiling: columns are
`max(2, min(zoomColumns, floor(scrollerWidth / 240)))`. One rule reconciles
every count observed live — 1728px at zoom 3 is 4 columns, 1440px at zoom 2 is
5, 900px is 3 whatever the zoom, and 500px is 2 — and it is what makes the
mobile feed two columns with the zoom control hidden.

Persisted to `localStorage` as
`hf:image-feed-view-controls:<date>` → `{"columnsPerRow":N,"groupMode":"default"}`.
We keep the shape (it is what the live app stores) minus the date-stamped key,
which is a cache-busting detail of theirs.

### 6.2 Tile

```
cell   absolute (positioned by the layout pass)
  tile @container group relative overflow-hidden bg-[#222]
       transition-[border-radius] duration-200
    img size-full object-cover
```

Corners are square at rest; the radius transition exists for the selected
state.

### 6.3 Hover overlay

One `absolute inset-0 pointer-events-none [container-type:size]` layer. Its
children use **container queries**, so controls shrink on small tiles rather
than crowding:

- `[@container(max-height:200px)]:scale-75` and the same for `max-width:180px`,
  with `origin-top-right` / `origin-bottom-right`;
- `[@container(max-height:185px)]:hidden` drops the third rail button;
- `@[15rem]:top-3` nudges the checkbox on wider tiles.

**Scrims** — top and bottom, each `h-1/4`, a multi-stop black gradient:
`rgba(0,0,0,.4) 0% → .3 12% → .2 25% → .1 38% → .05 50% → 0`.

**Right rail** — `absolute top-0 right-0 h-full flex flex-col items-end pl-8
pr-2.5 pt-2.5`, inner `flex flex-col items-center gap-1`. Four 32×32
`rounded-full` buttons on `rgba(0,0,0,0.4)` + `backdrop-blur-sm`:

1. Like (heart)
2. Download
3. Recreate (copy glyph)
4. More actions (`…`)

**Bottom-right cluster** — `absolute bottom-2 right-2 grid grid-flow-col-dense
gap-1`. Buttons `h-8 rounded-full border border-q-hairline` on
`rgba(0,0,0,0.4)` + `backdrop-blur-sm`, 16px icons:

1. **Reference** (image glyph) — single button
2. **Animate** (video glyph) + chevron — split button
3. **Create 3D scene** (move/3D glyph) + chevron — split button

**Tooltips** — dark pill, 12px `#f7f7f8`, appearing beside the trigger
(rail tooltips to the left, cluster tooltips above). Labels as named above.

**Checkbox** — `absolute left-2 top-2 size-4`, `opacity-0
group-hover:opacity-100 transition-opacity duration-200`, with a 40px hit area
(`-m-3 p-3`). Checked → white fill, black glyph.

### 6.4 Selection

Clicking a checkbox enters selection mode:

- the selected tile's inner box gets `ring-3 ring-white scale-[97%]` — a white
  ring with the image inset inside it;
- **every** tile's checkbox becomes permanently visible (no longer hover-gated);
- the selection bar appears.

**Selection bar** — in the `z-100` overlay layer, `absolute bottom-4`, centred,
`h-14 px-1.5 gap-1 rounded-2xl bg-[rgba(28,30,32,0.8)]
max-w-[calc(100%-2rem)]`:

```
├─ left    grid grid-cols-[auto_1fr] items-center h-full gap-2 px-3
│          16px thumbnail (rounded-xs ring-1 ring-white shadow-md)
│          "N selected"  14px/600
├─ actions hide-scrollbar overflow-x-auto → flex items-center gap-1
│          Download · Add to ▾ · [folder] · Delete selected · More actions
│          h-10 rounded-xl border border-q-hairline bg-white/5 px-4 py-3, icon 18px
└─ close   ✕, transparent background
```

Every action button carries a hover glow: `absolute bottom-[-20px] left-1/2
h-[30px] w-[84px] rounded-[50%] blur-lg opacity-0 group-hover:opacity-100
-translate-x-1/2`.

Note the live quirk: the bar and the composer are both anchored `bottom-4`, so
at short viewports they overlap. We keep both anchored the same way but give
the bar the higher z-index it already has, so it sits _over_ the composer
rather than under it.

### 6.5 Tile context menu

```
role=menu  z-[100]  w-max min-w-[180px]  max-w-[calc(100vw-2rem)]
           rounded-2xl  p-0.5  gap-0.5  flex flex-col
           border border-q-hairline  bg-[rgba(35,38,42,0.75)]
           backdrop-blur-2xl  shadow-[0_4px_4px_rgba(0,0,0,0.12)]
```

Item: `h-8 rounded-xl p-2 gap-1`, `text-sm-medium leading-4`, `#f7f7f8`, 16px
icon. Hover / focus / highlighted → `bg-[rgba(255,255,255,0.10)]`. Disabled →
`opacity-40 pointer-events-none`. Danger → text and icon `#e72930`, hover
`bg-[rgba(231,41,48,0.2)]`. Separator → `h-px bg-q-hairline`. Submenu parents
get a trailing `chevron-right` via `ml-auto`.

Items, in order, with separators as shown:

```
Open · Regenerate · Reuse · Create element ▸ · Assign to element · Additional ▸
──────
Like · Share ▸ · Add to folder ▸
──────
Download · Delete (danger)
```

**Two deliberate departures from the measured menu**, both made when the
actions were implemented:

- **`Copy image` is added**, after `Reuse`. The rail is four buttons and every
  one of them is spoken for, so there is nowhere to put copying without
  breaking the count above — and an image you cannot get onto the clipboard is
  a worse gap than an extra row here.
- **`Share ▸` became `Copy link`** and lost its chevron. Copying the link is
  the one thing that submenu would have offered that works without a backend,
  and a chevron promising a sub-surface that does not exist is worse than a row
  that does something.

`Regenerate` and `Reuse` both load the composer rather than generating:
`Regenerate` sends the prompt and the settings, `Reuse` sends the settings and
leaves whatever prompt is written. Nothing in this menu spends a generation on
one click.

**The tile itself opens a full-size view.** Clicking the picture — a
full-bleed button under the controls — opens the same lightbox the Genjutsu
library uses for its presets (`components/overlays/media-lightbox.tsx`), with
the generation's own recipe listed under Details. The live site has no such
view on this surface; sharing the one that already existed was cheaper than
building a second.

---

## 7. Zoom control

```
capsule  172 × 32  flex items-center gap-3  rounded-2xl  bg-[#131517]
         hidden md:flex   (right-aligned in the toolbar row)
  slider w-36 (144px)
    track  h-3 with a 4px rounded rail, rgba(217,217,217,0.04)
    thumb  12 × 12 white circle
```

`role="slider"`, `min 0 / max 4`, horizontal, arrow keys step by one. Maps to
the column table in §6.1. Hidden below `md`.

---

## 8. Responsive

| Breakpoint   | Behaviour                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ≥ 768 (`md`) | Everything above. Composer `max-w-[1120px]`, 16px from the bottom. Settings arrows appear once the rail overflows (~< 820px).                                                                                            |
| < 768        | Composer is `display:none` — verified. The page is header + feed + a bottom tab bar (Home · Community · **✦** · Library · Profile), the ✦ pill in brand lime linking to `/flow`. Zoom capsule hidden. Feed at 2 columns. |

The mobile header switches to logo + "Higgsfield" wordmark + Instagram +
Pricing + hamburger. That is shared chrome and already exists in
`site-header.tsx`.

---

## 9. Accessibility

Per this repo's conventions — hover, press, focus and checked are CSS, and real
form controls carry state:

- setting popovers are `role="listbox"` / `role="option"` with `aria-selected`;
  the model dialog is `role="dialog"` with a labelled search input;
- the tile checkbox is a real `<input type="checkbox">` styled with
  `peer-checked:`, not a `<span onClick>`;
- the zoom control is a real `<input type="range">` (the repo's `hf-slider`)
  with `aria-valuetext` naming the column count;
- every icon-only button has an `aria-label` matching its tooltip;
- `Escape` closes any open popover and returns focus to its trigger;
- everything that animates respects `motion-reduce:`.

---

## 10. State model

Composer state is genuinely interactive and lives in one client component:

```ts
{
  (prompt, model, aspect, quality, resolution, background, batch);
}
```

`model` drives the resolution options; if the current resolution is not offered
by the newly-picked model, it falls back to that model's first.

Canvas state: `columns` (0–4 index, persisted) and `selected: Set<string>`.

Everything else — hover, focus, open-state fills, checked marks, scrim
reveals — is CSS.

---

## 11. Files

```
src/app/(studio)/ai/image/page.tsx           rewritten: feed + composer
src/components/image-studio/
  composer.tsx                               the floating bar
  prompt-editor.tsx                          auto-grow textarea + placeholder
  setting-pill.tsx                           the shared pill shape
  setting-popover.tsx                        pattern A (both row variants)
  ratio-glyph.tsx                            proportional rectangle icon
  model-dialog.tsx                           pattern B
  model-badge.tsx                            the skewed NEW/PREMIUM badge
  batch-stepper.tsx                          1–4, with its bounds
  generate-cta.tsx                           incl. the 30° strike
  scroll-rail.tsx                            overflow rail + edge arrows
src/components/feed/
  image-feed.tsx                             masonry, columns, selection
  feed-tile.tsx                              tile + hover overlay
  tile-menu.tsx                              context menu
  selection-bar.tsx                          multi-select toolbar
  zoom-control.tsx                           the density slider
src/config/image-studio.ts                   33 models, ratios, quality,
                                             resolutions, backgrounds, feed
src/hooks/use-feed-columns.ts                persisted column count
src/lib/masonry.ts                           shortest-column-first balancing
src/components/studio/dropdown.tsx           + `role` and `height` props
src/lib/cn.ts                                register the q- scale with tw-merge
src/styles/tokens/q-studio.css               corrected + extended per §2
src/app/globals.css                          project the new q- tokens
```

The image studio gets its own folder rather than joining `components/studio/`.
That folder belongs to the video surfaces — `option-pill.tsx`,
`model-picker.tsx`, the Genjutsu form and its own `generate-button.tsx` all
live there and stay untouched. Two feature folders beat one shared one whose
components would have to bend into two shapes, and it keeps concurrent work on
the two studios from landing on the same filenames.

`cn()` needs the `q-` font sizes, radii and shadows registered with
tailwind-merge for the same reason its own comment already gives for the
marketing scale: without them `text-q-body-sm` and `text-q-idle` both look like
`text-*`, and one is silently dropped.

---

## 12. Acceptance

The clone is done when, at 1728 × 906:

1. composer measures 1120 × 134 at rest, 24px radius, lime-5% border;
2. the five pills read `GPT Image 2 › | ⛶ Auto | ◈ High | ◈ 2K | ⊡ Auto | − 1/4 +`
   at the measured widths;
3. Generate reads `Generate ✦ 8̸.̸5̸ 6.5`, 176 × 84, and rescales with batch and
   resolution;
4. each of the four setting popovers opens above its pill with the correct
   title, width and row variant;
5. the model dialog opens 400 × 640 with 12 featured + 21 all models, search
   filters and empties correctly;
6. the feed lays out 4 columns by default, 7…3 across the zoom range;
7. tile hover reveals scrims, a 4-button right rail, a 3-control bottom
   cluster, and a checkbox; the context menu matches §6.5;
8. selecting a tile rings it white at 97% scale and raises the selection bar;
9. below 768px the composer is gone and the bottom tab bar is present.
