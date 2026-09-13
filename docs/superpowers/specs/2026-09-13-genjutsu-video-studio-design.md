# Genjutsu video studio — design spec

**Route:** `/ai/video?model=genjutsu`
**Date:** 2026-09-13
**Status:** implemented — see §14 for what the build changed
**Reference:** `https://higgsfield.ai/ai/video?model=genjutsu`, inspected at 1440×900 and 375×812.

---

## 1. Goal and scope

Rebuild the Genjutsu video studio at 1:1 visual and behavioural parity with the live
page: exact geometry, exact token values, every interactive state.

**In scope** — the `Create Video` surface at `/ai/video?model=genjutsu`:

- the studio app shell (fixed viewport, two columns, no page scroll);
- the left generation form in both of its modes;
- the right pane and all three of its tabs (`History`, `Motion Library`, `How it works`);
- both preset sources (`Higgsfield`, `Community`) and the preset card's full hover surface;
- the expand lightbox, the model picker, the quality select, and the logged-out gate;
- the mobile layout down to 375px.

**Out of scope** — `Edit Video` and `Motion Control` are separate routes backed by
different models (`/ai/video/motion?model=kling-3-motion-control`). They render as
tabs that are present, correctly labelled and keyboard-reachable, but inert. No
authentication, no generation backend.

### Content and assets

Layout, geometry, tokens and behaviour are specified exactly. **Marketing prose is
specified as a content slot with its typography and placeholder copy of our own** —
implementers fill the slots, they do not transcribe the reference page. Icons are
named by shape and drawn fresh or taken from `lucide-react`; no vector data is copied
from the reference.

Media (posters, MP4s) is referenced by remote URL from typed fixture modules, per the
decision recorded in §12.

---

## 2. Decisions taken

| #   | Decision                                                                               | Rationale                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Add a **separate `q-*` studio token layer**; leave `src/styles/tokens/*.css` untouched | `CLAUDE.md` makes the existing tokens the source of truth mirroring the Claude Design project, and their values are not the live studio's. A parallel namespace gives exact parity in the studio and zero regression on the marketing pages already built. |
| D2  | Mirror the reference's own token names (`q-background-primary`, `radius-q-500`, …)     | An implementer can diff a component's classes directly against the live DOM. Cheap correctness.                                                                                                                                                            |
| D3  | `Create Video` only; the other two tabs are inert                                      | One coherent shippable slice; the other tabs are different models with different forms.                                                                                                                                                                    |
| D4  | Fixtures hold remote media URLs                                                        | Closest visual result. Accepted risk: the URLs are another origin's and may rotate — §12 covers the fallback.                                                                                                                                              |
| D5  | Every visual state is CSS (`hover:`, `peer-checked:`, `group-hover:`, `data-[state]`)  | `CLAUDE.md` forbids React state for visual state. Only genuinely-stateful things (mode, prompt-enabled, selected model, active tab, lightbox) become React state.                                                                                          |

---

## 3. App shell

The reference makes the studio a fixed-viewport application: `html, body {
height:100%; overflow:hidden }`, the footer is removed, and the header stops being
sticky. Our root layout already does this — `body` is `flex h-dvh flex-col
overflow-hidden` with the banner and header above the slot — so **no root layout
change is needed**.

```
body (h-dvh, overflow-hidden, flex-col)
├── PromoBanner        ← existing
├── RouteProgress      ← existing, 2px lime bar, fixed, z-9999
├── SiteHeader         ← existing, 44px tall on the reference
└── (studio)/layout    ← flex min-h-0 flex-1     ← existing, unchanged
    └── page           ← the grid below
```

### Grid

```
<div class="relative mx-auto grid max-w-480 grid-cols-[1fr] gap-2 px-4 pb-2
            md:grid-cols-[20rem_1fr]">
```

| Property         | Value                                            |
| ---------------- | ------------------------------------------------ |
| Columns (≥768px) | `20rem` (320px) and `1fr`                        |
| Columns (<768px) | single column; the form column is `hidden`       |
| Gap              | `8px`                                            |
| Padding          | `16px` inline, `8px` block-end, none block-start |
| Max width        | `max-w-480` = `120rem` = 1920px, centred         |

Both columns are cards: `overflow-hidden rounded-q-500` (20px) `border`. The left
column adds `self-start` so it sizes to its content; the right column stretches. Both
carry `min-h-0` so their internal scrollers actually scroll.

- Left: `border-separator-card` (`#d9d9d90a`), `bg-page-primary` (`#131517`).
- Right: `border-q-border-default` (`#ffffff1a`), transparent, over a
  `pointer-events-none absolute inset-0 -z-10` decorative layer.

At 1440px this yields a 320px form and a 1080px pane — verify these two numbers when
checking the build.

---

## 4. Token layer

New file `src/styles/tokens/q-studio.css`, imported by `globals.css` **after** the
existing token files and projected through the existing `@theme inline` block. Names
are namespaced, so nothing collides with `--surface-*` / `--r-*` / `--sp-*`.

### 4.1 Colour

```css
:root {
  /* Backgrounds */
  --q-bg-page: #0f1113; /* studio body */
  --q-bg-primary: #131517; /* form panel */
  --q-bg-secondary: #1c1e21; /* media card rest state */
  --q-bg-secondary-strong: #23262a;
  --q-bg-tertiary: #2a2d32;
  --q-bg-glass: #23262abf; /* popovers, with backdrop-blur */

  /* Borders */
  --q-border-subtle: #ffffff0d;
  --q-border-default: #ffffff1a;
  --q-border-strong: #ffffff33;
  --q-border-card: #d9d9d90a;
  --q-border-focus: #d1fe17;

  /* Text */
  --q-text-primary: #ffffff;
  --q-text-secondary: #828282;
  --q-text-tertiary: #626262;
  --q-text-muted: #898a8b; /* --color-font-secondary */
  --q-text-inverse: #14151a;
  --q-text-brand: #d1fe17;

  /* White inks — the control surface ladder */
  --q-w-05: #ffffff0d; /* control rest */
  --q-w-08: #ffffff14; /* control hover */
  --q-w-10: #ffffff1a;
  --q-w-32: #ffffff52; /* disabled label */

  /* Brand */
  --q-brand: #d1fe17;
  --q-brand-hi: #effe17; /* radial highlight on the CTA */
  --q-brand-10: #d1fe171a;
  --q-btn-disabled-bg: #292b2c;
  --q-btn-disabled-fg: #737475;
}
```

`--q-brand` is identical to the repo's existing `--hf-lime`. That is the one value the
two systems already agree on; keep both, do not alias across layers.

### 4.2 Radius and spacing

The reference uses a numeric scale where the number is hundredths of a rem.

| Token             | Value  |     | Token              | Value |
| ----------------- | ------ | --- | ------------------ | ----- |
| `--radius-q-100`  | 4px    |     | `--spacing-q-100`  | 4px   |
| `--radius-q-150`  | 6px    |     | `--spacing-q-150`  | 6px   |
| `--radius-q-200`  | 8px    |     | `--spacing-q-200`  | 8px   |
| `--radius-q-250`  | 10px   |     | `--spacing-q-250`  | 10px  |
| `--radius-q-300`  | 12px   |     | `--spacing-q-300`  | 12px  |
| `--radius-q-400`  | 16px   |     | `--spacing-q-400`  | 16px  |
| `--radius-q-500`  | 20px   |     | `--spacing-q-600`  | 24px  |
| `--radius-q-600`  | 24px   |     | `--spacing-q-800`  | 32px  |
| `--radius-q-full` | 9999px |     | `--spacing-q-1200` | 48px  |

### 4.3 Typography

Two families, loaded with `next/font/google` in the root layout alongside the existing
Archivo/JetBrains pair. Marketing pages keep Archivo; only `q-*` utilities point at
these.

- **Inter** — all UI text. Weights 400/500/600.
- **Space Grotesk** — display only: uppercase, tight tracking, `font-feature-settings:'ss04'`.

| Utility                  | Weight | Size / line-height | Tracking | Family                   |
| ------------------------ | ------ | ------------------ | -------- | ------------------------ |
| `q-accent-xl-bold`       | 700    | 36 / 40            | −1.2px   | Space Grotesk, uppercase |
| `q-accent-lg-bold`       | 700    | 32 / 36            | −1.2px   | Space Grotesk, uppercase |
| `q-brand-h-xxs-bold`     | 700    | 20 / 28            | −1%      | Space Grotesk, uppercase |
| `q-body-sm-regular`      | 400    | 14 / 20            | 0        | Inter                    |
| `q-body-sm-semi-bold`    | 600    | 14 / 20            | 0        | Inter                    |
| `q-label-sm-medium`      | 500    | 14 / 20            | 0        | Inter                    |
| `q-label-sm-semi-bold`   | 600    | 14 / 16            | 0        | Inter                    |
| `q-label-xs-regular`     | 400    | 12 / 16            | 0        | Inter                    |
| `q-label-xs-semi-bold`   | 600    | 12 / 16            | 0        | Inter                    |
| `q-caption-xs-semi-bold` | 600    | 10 / 14            | 0.2px    | Inter, uppercase         |
| `q-caption-m`            | 500    | 12 / 16            | 0        | Inter                    |

### 4.4 Elevation and motion

```css
--q-shadow-indicator:
  0 2px 2px rgba(0, 0, 0, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.05);
--q-shadow-menu:
  inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 8px rgba(0, 0, 0, 0.24);
--q-shadow-avatar: 0 6px 12px rgba(0, 0, 0, 0.4);
--q-shadow-cta: inset 0 -3px rgba(0, 0, 0, 0.43);
--q-shadow-glass:
  inset 0 2px 3px rgba(255, 255, 255, 0.05),
  0 2px 4px -0.5px rgba(0, 0, 0, 0.12);
--q-ease-pop: cubic-bezier(0.215, 0.61, 0.355, 1);
```

Durations: `150ms` colour transitions, `200ms` for popovers and the prompt collapse.
Everything animated carries `motion-reduce:transition-none`.

---

## 5. Left column — generation form

320px wide, `flex flex-col overflow-hidden rounded-q-500 border`, `hidden md:flex`.

```
GenerateForm
├── nav        FormTabs            48px  — Create Video | Edit Video | Motion Control
├── form
│   └── div    scroll body         p-2, gap-4, overflow-y-auto, scrollbar hidden
│       ├── PromoCard              aspect-[2.3], rounded-xl
│       ├── ModeTabs               302×40 segmented
│       ├── div  gap-2
│       │   ├── DropZone  video
│       │   ├── DropZone  images
│       │   └── PromptField        collapsible
│       ├── ModelSelect            302×54
│       └── QualitySelect          302×54
└── div        footer              px-2 py-3 — Generate
```

The scroll body is capped at `max-h-[calc(100vh-14rem)]`; the footer is outside it, so
`Generate` never scrolls away.

### 5.1 FormTabs

`flex gap-3 overflow-x-auto pt-3 px-4 shrink-0`, scrollbar hidden. Each tab is
`border-b-2 h-9 whitespace-nowrap` at `q-label-sm-medium`.

| State  | Colour                 | Underline              |
| ------ | ---------------------- | ---------------------- |
| Active | `#ffffff`              | `border-b-white`       |
| Idle   | `rgba(255,255,255,.6)` | `border-b-transparent` |

These are **navigation**, not local state: render as `next/link`. `Create Video` →
`/ai/video?model=genjutsu`, the other two → their routes. In scope they may point at
`#` with `aria-disabled`, but the markup must be links.

### 5.2 PromoCard

`aspect-[2.3] w-full relative group select-none overflow-hidden rounded-xl` — 302×131.

- Poster `<img>` under a `<video loop muted playsinline preload="none">`, both
  `absolute inset-0 object-cover size-full`.
- `figcaption` bottom-left, `pl-3 pb-3 pr-1.5`:
  - title — `q-brand-h-xxs-bold` in `--q-text-brand`, uppercase, truncated;
  - subtitle — 12/18 Inter in `rgba(255,255,255,.8)`.
- Top-right, `absolute top-1.5 right-1.5 flex gap-1`: a **How it works** button, 24px
  tall, `rounded-lg px-2`, `q-caption-m`, near-black translucent fill with a
  `--q-border-subtle` hairline, `hover:bg-brand hover:text-black`. Opens the right
  pane's `How it works` tab.

The video plays on card hover and pauses on leave; honour `prefers-reduced-motion` by
never auto-playing.

### 5.3 ModeTabs — the segmented control

This control recurs three times (form mode, right-pane view, preset source), so build
it once as `components/studio/q-tabs.tsx` with `cva` variants
`shape: rounded | pill` and `fill: true | false`.

| Part       | Spec                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List       | `h-10 p-1 rounded-q-300 bg-q-w-05 border border-q-w-10`, children `flex-1` when filling                                                                                                                                                                 |
| Tab        | `h-8 px-2 rounded-q-200`, `q-caption-m`, icon 16px + label, `gap-1`                                                                                                                                                                                     |
| Tab idle   | `rgba(255,255,255,.5)`                                                                                                                                                                                                                                  |
| Tab active | `#ffffff`                                                                                                                                                                                                                                               |
| Indicator  | absolutely positioned behind the active tab, `rounded-q-200`, `border 1px rgba(255,255,255,.05)`, `background: linear-gradient(148.9deg, rgba(255,255,255,.04) 22.6%, rgba(255,255,255,.06) 51.3%, rgba(255,255,255,.04) 100%)`, `--q-shadow-indicator` |

The indicator slides between tabs. Implement as a single absolutely-positioned element
whose `translate`/`width` are driven by the active index — the one sanctioned inline
`style`, with a comment, per `CLAUDE.md`'s dynamic-value exception.

**Accessibility:** real `role="tablist"` / `role="tab"` with `aria-selected`, roving
tabindex, arrow-key navigation.

#### Mode hover preview

Hovering or focusing either mode tab opens a preview card to the **right of the form
column**, vertically centred on the tab.

| Property   | Value                                                                                                                                                                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container  | `pointer-events-none fixed z-50 w-60 origin-left -translate-y-1/2`                                                                                                                                                                                                                                        |
| Enter      | `translate-x-0 scale-100 opacity-100`                                                                                                                                                                                                                                                                     |
| Exit       | `-translate-x-2 scale-96 opacity-0`                                                                                                                                                                                                                                                                       |
| Transition | `transition-[opacity,transform] duration-200 ease-[--q-ease-pop]`                                                                                                                                                                                                                                         |
| Card       | `rounded-q-600 bg-q-bg-glass backdrop-blur-2xl overflow-hidden`                                                                                                                                                                                                                                           |
| Media      | `aspect-video h-34 w-full`, autoplaying muted loop                                                                                                                                                                                                                                                        |
| Body       | `px-4 pt-3 pb-4 gap-1`; title `q-body-sm-semi-bold`, optional description `q-label-xs-regular` in `--q-text-secondary`                                                                                                                                                                                    |
| Hairline   | `absolute inset-0 rounded-[inherit]`, 1px conic-gradient border via `mask: linear-gradient(#fff,#fff) content-box exclude, linear-gradient(#fff,#fff); padding:1px; background: conic-gradient(from 45deg, rgba(255,255,255,.02) 0deg, rgba(255,255,255,.15) 90deg, rgba(255,255,255,.02) 180deg 360deg)` |
| Arrow      | `absolute top-1/2 left-0 h-3 w-2 -translate-x-full -translate-y-1/2 bg-q-bg-glass [clip-path:polygon(100%_0,100%_100%,0_50%)]`                                                                                                                                                                            |

Content slots (our own copy, one short line each): mode purpose for `Motion transfer`,
mode purpose for `Objects swap`. `Motion transfer`'s card also carries a two-line
description; `Objects swap`'s does not.

### 5.4 DropZone

Two per form, identical shell, different contents.

```
outer  rounded-xl bg-q-w-05 p-1                      302×168
└ inner  relative flex flex-col items-center justify-center
         gap-3 rounded-lg p-4 h-40                    294×160
  ├ span   absolute inset-0 rounded-lg  (dashed/idle decoration)
  ├ button absolute inset-0 z-10 rounded-[inherit]    ← the whole zone is the control
  ├ badge cluster                                     36px circles
  └ span   text stack, gap-1.5, centred, pointer-events-none
      ├ q-label-sm-semi-bold   primary line
      └ q-label-xs-regular     constraint line, --q-text-secondary
```

**Badge** — 36px circle, layered:
`absolute inset-0 rounded-full bg-surface-primary`, then
`absolute inset-0 rounded-full border border-[rgba(197,197,197,.30)] bg-white/4
mix-blend-luminosity backdrop-blur-xs` with
`shadow-[0_128.9px_36px_rgba(0,0,0,0),0_82.4px_33px_rgba(0,0,0,.01),0_46.4px_28px_rgba(0,0,0,.05),0_20.5px_20.5px_rgba(0,0,0,.09),0_5px_11.3px_rgba(0,0,0,.10),inset_0_-0.3px_5.36px_rgba(185,185,185,.35)]`,
then a 16px icon filled with a vertical white gradient (`stop 0: #fff @ .3` →
`stop 1: #fff @ 1`).

The video zone shows **one** badge; the images zone shows **three**, overlapped
`-ml-2` with ascending `z-1/2/3`.

**Copy is mode-dependent** — this is the single most important behavioural detail of
the form:

| Zone                 | Motion transfer                             | Objects swap                    |
| -------------------- | ------------------------------------------- | ------------------------------- |
| Video — primary      | "Add a reference video to extract motion"   | "Add a reference video to edit" |
| Video — constraint   | "Video duration: 4–30 seconds"              | "Video duration: 4–30 seconds"  |
| Video — `aria-label` | matches its primary line                    | matches its primary line        |
| Images — primary     | "Add your characters, products, or clothes" | unchanged                       |
| Images — constraint  | "Up to 49 images"                           | **"Up to 30 images"**           |

Both primary lines break onto two lines at an explicit `<br>`.

States to implement: idle, `hover` (raise the inner fill to `--q-w-08`),
`focus-visible` (`ring-1 ring-inset ring-q-border-focus`), `dragover` (brand-tinted
border + `--q-brand-10` fill), and populated (thumbnail grid with per-item remove,
replacing the badge/text stack). Populated state is specified in §11 as a follow-up —
the reference requires a sign-in before it can be observed.

### 5.5 PromptField

```
wrapper  flex flex-col overflow-hidden rounded-xl
├ header  h-10 flex items-center justify-between px-3 bg-q-w-05
│  ├ span  "Prompt"  q-label-sm-medium  --q-text-secondary
│  └ Switch
└ body    grid transition-[grid-template-rows] duration-200 ease-out
          grid-rows-[0fr] → grid-rows-[1fr]
   └ div  min-h-0 overflow-hidden  (inert when collapsed)
      └ editor  h-40 rounded-b-xl bg-q-w-05 p-3, overflow-y-auto
```

The `0fr → 1fr` grid trick is how the reference animates the collapse; use it, not a
height transition. The collapsed wrapper gets `inert`.

**Switch** — 28×16 track, `rounded-full`; 12×12 white thumb with
`shadow-[0_1px_2px_rgba(0,0,0,.15)]`, translating `11.76px`. Track is `#5c626a` off and
`--q-brand` on. Per `CLAUDE.md` this is a visually-hidden `<input type="checkbox">`
plus `peer-checked:` — **not** a `<span>` with `onClick`. `aria-label="Toggle prompt"`.

The editor is a plain `<textarea>` styled to match (the reference uses Lexical for
`@`-mentions; out of scope). Placeholder is `--q-text-muted`, `q-body-sm-regular`, and
is **mode-dependent** — one placeholder for recasting a scene, another for describing a
change. Write both fresh.

### 5.6 ModelSelect and QualitySelect

Identical trigger geometry:

| Property | Value                                              |
| -------- | -------------------------------------------------- |
| Size     | `w-full h-13.5` (54px)                             |
| Shape    | `rounded-xl`                                       |
| Fill     | `bg-q-w-05`, `hover:bg-q-w-08`, `active:bg-q-w-08` |
| Padding  | `px-3 py-2`                                        |
| Layout   | `grid grid-cols-[1fr_auto] items-center gap-2`     |
| Label    | `q-caption-m` in `--q-text-secondary`              |
| Value    | 14px/20 Inter 500 in `--q-text-primary`, truncated |
| Chevron  | 16px, `-rotate-90`, `--q-text-secondary`           |
| Spacing  | model `mt-4`; quality `mt-2`                       |

While the model is resolving, the value renders as a skeleton: `rounded-lg bg-q-w-08
text-transparent animate-pulse`.

**QualitySelect** — options `480p`, `720p` (default), `1080p`. Menu opens to the
**right** of the trigger, end-aligned. `min-w-36`, `rounded-q-300`, `p-2`,
`background: linear-gradient(180deg, rgba(42,42,42,.98), rgba(40,40,40,.98))`,
`--q-shadow-menu`. Items are 36px tall, `p-2 rounded-q-200`, 14px/20 Inter 500; the
selected item shows a trailing check. Keep a real hidden `<input>` carrying the value
so the form submits natively.

**ModelSelect** — a 400px popover (`w-100`), `rounded-2xl border-separator-card
bg-surface-primary/95 backdrop-blur-[32px]`, capped at `min(40rem, 100vh-32px)`,
opening to the right. Contents:

1. A search field.
2. A group heading — sparkle icon + `text-xs-medium` in `--q-text-secondary`.
3. Model rows: `w-full flex items-center rounded-xl pl-1.5 py-1.5 pr-3 h-13`,
   `hover:bg-white/5`; selected row keeps `bg-white/5` and a trailing check.
   - Leading 40px tile: `rounded-lg bg-white/5 shadow-[inset_0_2px_3px_rgba(255,255,255,.03)]`, 16px glyph. The selected model's glyph takes `--q-text-brand`.
   - Name at `text-xs-medium`, optionally followed by a badge: a `-skew-x-12`
     uppercase Space Grotesk pill, `rounded-sm px-1.5 font-bold`. `New` is
     brand-on-dark; `Top` uses a blue→cyan linear gradient.
   - Meta chips below: `px-1 py-0.5 rounded-sm bg-white/5` at 10px, one per capability.
4. Decorative blurred bars — `height:37px; border-radius:317px; background:
rgba(139,213,244,.24); filter: blur(50px)`, one pinned to the top, one at
   `bottom:35%`. Purely decorative, `aria-hidden`.
5. A top scrim: `linear-gradient(rgba(19,21,23,.898), transparent)`, `height:min(100%,38px)`,
   `filter: blur(20px)`, fading in once the list scrolls.

`src/config/models.ts` already holds `VIDEO_MODELS` with matching shape, including
`genjutsu`. Extend it to the reference's fourteen entries rather than creating a new
module; correct `genjutsu` to `4s–30s`.

Selecting a model navigates to `/ai/video?model=<id>` — the URL is the source of truth
for the active model, which is what makes the page deep-linkable.

### 5.7 Generate

```
footer   relative shrink-0 w-full px-2 py-3
└ button w-full h-12 rounded-xl
```

| Property | Value                                                                        |
| -------- | ---------------------------------------------------------------------------- |
| Fill     | `radial-gradient(in oklab, #effe17 40%, #d1fe17 100%)`                       |
| Text     | 600 16/24 Inter, `#14151a`                                                   |
| Padding  | `0 16px 2px` — the 2px bottom pad optically centres against the inset shadow |
| Shadow   | `--q-shadow-cta`                                                             |
| Hover    | `opacity-.8`                                                                 |
| Active   | `opacity-.6` and `scale-97`, `transition-transform duration-200`             |
| Disabled | `bg-[--q-btn-disabled-bg] text-[--q-btn-disabled-fg]`, no gradient           |

`type="submit"` inside the `<form>`. Signed out, submitting opens the auth gate (§9).

---

## 6. Right column — pane

```
section#create-page-content   relative flex size-full min-h-0 flex-1 flex-col
└ div   rounded-q-500 border border-q-border-default overflow-hidden isolate
   ├ div   aria-hidden absolute inset-0 -z-10           decorative
   └ div   relative flex min-h-0 flex-1 flex-col px-4 pb-4 z-10
      ├ header  flex items-center justify-between pt-q-200 pb-q-300   56px
      │  ├ QTabs  History | Motion Library | How it works
      │  └ div    zoom + layout controls — History only
      └ div   hide-scrollbar min-h-0 flex-1 overflow-y-auto
         └ the active tab's panel
```

The header's tab group is the `rounded` segmented variant with
`[&_.q-tabs-tab]:rounded-lg` and a transparent, border-less, padding-less list —
i.e. the indicator floats without a track. Default tab is **Motion Library**.

The right-hand control cluster is `invisible` + `inert` on every tab except `History`,
so the header keeps a constant height and the tabs never shift.

### 6.1 History

Signed out this is an **empty canvas** — no empty-state illustration, no sign-in
prompt, just the controls in the header. Reproduce that: an empty scroll region.

**Departure: history tiles carry a hover rail.** The live surface gives them no
per-item actions at all, only the prompt caption. Ours adds Like / Download /
Recreate / More across the top of the tile — a row rather than the image feed's
vertical stack, because a 16:9 tile runs out of height long before it runs out
of width. The overflow menu holds Open, Reuse, Like, Copy frame, Copy link and
Delete. A clip cannot go on a clipboard, so `Copy frame` copies the still the
tile is holding.

Clicking the clip opens the same lightbox as a preset
(`components/overlays/media-lightbox.tsx`), listing the recipe that made it.
Leaving the tiles inert would have meant a studio where nothing you generate
can be saved, reused or deleted.

Header controls, `flex items-center gap-3 rounded-2xl bg-q-bg-primary`:

- a 24px icon button (diagonal expand arrows);
- a 128px zoom slider, `min 0 max 5 value 5`, 12px track, 12px thumb;
- a `List` / `Grid` toggle — `rounded-lg p-0.5 flex gap-1`, each option a 32px button
  with a 16px icon and label; the active one takes a `bg-surface-primary` pill behind
  it via an `absolute inset-0 -z-1` span.

### 6.2 Motion Library — default

```
section
├ Hero            flex flex-col items-center gap-q-800 pt-q-600 pb-q-1200
│  ├ video        rounded-2xl, md:h-90 md:w-160, aspect-video, autoplay loop muted
│  └ div          gap-2, centred
│     ├ h1        q-accent-xl-bold, uppercase, ss04, text-shadow 0 4px 12px rgba(21,45,59,.08)
│     └ p         q-body-sm-regular in rgba(255,255,255,.5), max 2 lines
├ SourceTabs      sticky top-0 z-30 flex justify-center px-3 py-2
└ Masonry         columns-2 md:columns-3 xl:columns-4, column-gap 16px, p-3
```

`SourceTabs` is the **pill** segmented variant, `Higgsfield` | `Community`, sticky at
the top of the scroller so it stays reachable through a long grid. `aria-label="Preset
source"`. Community is the default.

Hero copy is a content slot: one uppercase display headline, one two-line supporting
sentence. Write our own.

#### PresetCard

`<article>`, `relative isolate overflow-hidden rounded-q-300 bg-q-bg-secondary
aspect-video mb-q-400 break-inside-avoid group/explore-card
[container-type:inline-size]`, plus a `clip-path` fallback for WebKit's rounded-corner
overflow bug.

Layers, bottom to top:

1. `<img>` poster — `absolute inset-0 z-1 size-full object-cover`.
2. `<video loop muted playsinline preload="none">` — plays on hover, `translateZ(0)`
   and `backface-visibility:hidden` to keep it on its own compositor layer.
3. **Mode chip**, top-left at `inset q-300`: icon + `q-label-xs-semi-bold` white with
   `drop-shadow-sm`, reading `Motion transfer` or `Objects swap`.
4. **Top-right stack**, `flex flex-col items-end gap-q-200`: an `Expand example`
   button, and on Community cards only, a `More options` button.
   Both 32px circles: `rounded-full border border-q-border-subtle bg-q-w-05
backdrop-blur-md --q-shadow-glass`, `hover:brightness-125`, with a `before:-inset-1`
   hit-area expansion.
5. **Bottom action bar**, `absolute inset-x-q-300 bottom-q-300 flex items-end
justify-between`:
   - variant switcher — 32px circular avatars, `bg-white border border-white
rounded-full --q-shadow-avatar`, `aria-pressed` on the active one, with a
     `h-3 w-px` divider after the first; labelled `Show variant N` / `Show source video`;
   - a `Recreate` primary-xs button.

Layers 3–5 are `opacity-0` and become `opacity-100` under
`group-hover/explore-card:`, `group-focus-within/explore-card:`, and
`[@media(hover:none)]:` — so touch devices always show the chip and hide the
hover-only controls (`max-md:hidden` on 4 and 5).

The active variant avatar carries a progress ring driven by
`--explore-video-progress` (0→1), updated from the video's `timeupdate`. This is the
second sanctioned inline `style` — a CSS custom property for a genuinely dynamic
value. Comment it.

Container queries: below `20rem` card width, insets drop to `8px`, buttons to 28px,
the chip to 10px, and the avatars overlap `-ml-2`.

An overlay `<button aria-label="Open preset">` at `z-16` covers the card and sits
_below_ the `z-20` controls, so the whole card is one click target without swallowing
them.

**Sources differ:** first-party cards have no overflow menu; Community cards have one,
containing exactly one item — `Report` — in a `w-36` menu. Model this as a
`source: "higgsfield" | "community"` discriminator on the fixture, not a prop soup.

Community is effectively endless (the reference streams ~1800 cards). Fixtures supply
a fixed set; if an infinite feel is wanted, cycle the fixture with stable keys.

### 6.3 How it works

A centred, non-scrolling stage: `flex flex-col items-center justify-center px-4 py-8`,
inner `max-w-252`.

```
├ stage    relative w-full aspect-video md:h-70    video rounded-2xl, autoplay loop muted
├ copy     mt-12 text-center
│  ├ p     q-caption-xs-semi-bold uppercase in --q-text-brand      eyebrow
│  ├ h2    mt-4 q-accent-lg-bold uppercase, text-balance
│  └ p     mt-2 max-w-129 q-body-sm-regular in --q-text-muted
└ pager    mt-10 flex items-center justify-center gap-2
```

The pager is a filmstrip: previous/next 32px round buttons (`border-2 border-white/8`,
`hover:bg-white/8`, `active:scale-97`) flanking a `rounded-full border-separator-card
bg-black/10 px-2 py-2` rail. Inside, the active slide is a 88×48 `rounded-full`
thumbnail with a `1.5px` white border and `p-1`, playing its video; inactive slides are
40×24 `rounded-full` posters. The rail translates so the active slide stays centred.

Three slides, each `{ eyebrow, title, body, poster, video }`. Every thumbnail carries
`aria-current` and an `aria-label` equal to its slide title. Content slots — write
three fresh titles and bodies.

---

## 7. Behaviour and state

Only these become React state; everything else is CSS or URL.

| State                  | Owner           | Source of truth                                |
| ---------------------- | --------------- | ---------------------------------------------- |
| Active model           | URL `?model=`   | searchParams                                   |
| Form mode              | `GenerateForm`  | `useState<"motion" \| "swap">`                 |
| Prompt enabled         | `PromptField`   | checkbox `:checked` — CSS only                 |
| Prompt text            | `PromptField`   | `useState<string>`                             |
| Quality                | `QualitySelect` | `useState<string>`, mirrored to a hidden input |
| Right tab              | pane            | `useState`, default `library`                  |
| Preset source          | `MotionLibrary` | `useState`, default `community`                |
| Lightbox               | pane            | `useState<Preset \| null>`                     |
| Card hover/press/focus | —               | CSS only                                       |
| Tab indicator position | `QTabs`         | derived from active index                      |

Mode switching rewrites both drop-zone strings, the image cap (49 → 30) and the prompt
placeholder. Drive all of it from one `MODE_COPY` record keyed by mode — not scattered
ternaries.

---

## 8. Expand lightbox

Opened by a card's `Expand example`. `role="dialog" aria-modal="true"` with the
preset's title as `aria-label`, `fixed inset-0 z-100`.

```
div  md:grid md:grid-cols-[1fr_23rem] size-full md:overflow-hidden md:pointer-events-none
├ div  aria-hidden absolute inset-0 -z-10   opaque backdrop
├ div  player      h-[65vh] md:h-full p-3 pointer-events-auto
└ section sidebar  size-full p-2 pointer-events-auto
```

Below `md` the two stack and the whole thing scrolls; `md:pointer-events-none` on the
grid with `pointer-events-auto` on the children lets clicks on the gap fall through to
dismiss.

**Player** — full-bleed video, controls in a bottom bar that fades in on hover:
40px play/mute/fullscreen buttons (`rounded-md hover:bg-white/20`), a
`current / duration` readout at 14px/500, a seek slider with a `h-1.5 rounded-sm`
`bg-white/30` track, a `bg-white/50` buffered bar, a `--q-brand` fill and a 16px white
thumb that appears only while active, and an 80px volume slider. Keyboard shortcuts
`k`/`Space`, `m`, `f`.

Floating above the controls, `absolute inset-x-0 bottom-16 hidden md:flex justify-center`:
the same variant switcher as the card.

**Sidebar** — 368px column, inner panel `rounded-3xl border border-q-border-subtle
bg-q-bg-glass backdrop-blur-2xl p-2`, laid out `grid grid-rows-[auto_1fr] gap-2`.

- Header: right-aligned 32px round `Close`, `bg-q-w-05 hover:bg-q-w-10`.
- Body: `rounded-xl bg-q-w-05 p-2 min-h-40` containing
  - a **Prompt** section — small uppercase heading plus a `Copy` button, a row of
    reference thumbnails, then the prompt text;
  - a **Details** collapsible — heading with a chevron, then label/value rows
    (`Model`, and whatever else the fixture carries).
- Footer: `grid grid-cols-4 gap-2`, two `col-span-2` buttons — `Recreate` (primary)
  and `Download` (tertiary), both 40px.

Close on `Escape`, on backdrop click, and on the close button. Trap focus; restore it
to the triggering card on close.

---

## 9. Logged-out gate

Submitting the form signed out opens a modal rather than generating. Sizing:

```
fixed z-3002 inset-0 m-auto
w-[calc(100%-24px)] max-w-88 h-155 max-h-[calc(100dvh-24px)]
md:w-140 md:h-175 md:max-h-[calc(100dvh-48px)]
xl:w-280
```

Two columns at `md`: a promo panel (rotating model showcase — badge, display title,
one-line subtitle, and a bottom strip of model names acting as tabs) and an auth panel
(heading, subheading, a lime primary CTA, provider buttons, an email option, a consent
checkbox with Terms/Privacy links, and an SSO footnote).

**In this scope the gate is presentational**: it opens, traps focus, closes on
`Escape`/backdrop/X, and no button performs authentication. Providers are listed but
inert. Do not build a sign-in flow.

---

## 10. Responsive

| Breakpoint | Behaviour                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `< 768px`  | Form column `hidden`; the pane is the full width. The site's bottom tab bar (`Home`, `Community`, centre create action, `Library`, `Profile`) is the navigation. The centre action opens the composer as a bottom sheet. |
| `≥ 768px`  | Two columns, `20rem` + `1fr`. Hover previews, card hover controls and the overflow menu all become available.                                                                                                            |
| `≥ 1280px` | Masonry goes to four columns.                                                                                                                                                                                            |
| `≥ 1920px` | Grid stops widening (`max-w-480`) and centres.                                                                                                                                                                           |

The mobile composer sheet is **not specified here** — the reference gates it behind the
bottom bar's create action, which routes through sign-in. Track as §12.

Touch (`hover: none`): mode chips are permanently visible; expand/overflow/variant
controls are hidden; cards open the lightbox on tap.

---

## 11. File map

```
src/
  app/(studio)/ai/video/page.tsx          rewritten — reads ?model=, composes the grid
  components/studio/
    generate-form.tsx                     left column shell + mode state
    form-tabs.tsx                         Create/Edit/Motion links
    promo-card.tsx
    q-tabs.tsx                            segmented control, cva: shape × fill
    mode-preview.tsx                      hover popover
    drop-zone.tsx
    glass-badge.tsx                       the 36px layered circle
    prompt-field.tsx                      switch + grid-rows collapse + textarea
    q-select.tsx                          quality select
    model-picker.tsx                      extended from the existing file
    generate-button.tsx
    studio-pane.tsx                       right column shell + tab state
    history-panel.tsx
    motion-library.tsx                    hero + source tabs + masonry
    preset-card.tsx
    preset-lightbox.tsx
    how-it-works.tsx
    auth-gate.tsx
  config/
    models.ts                             extend to 14 models; fix genjutsu duration
    genjutsu.ts                           MODE_COPY, hero slots, how-it-works slides
    presets.ts                            preset fixtures, both sources
  styles/tokens/q-studio.css              new token layer
  app/globals.css                         import + @theme inline projection
  app/layout.tsx                          add Inter + Space Grotesk
```

Every file kebab-case. No barrel files. Components are server components unless they
need a hook — `promo-card`, `q-tabs`, `mode-preview`, `prompt-field`, `q-select`,
`model-picker`, `preset-card`, `preset-lightbox`, `how-it-works`, `studio-pane`,
`generate-form` need `"use client"`; `form-tabs`, `glass-badge`, `history-panel` and
the page itself do not.

---

## 12. Risks and follow-ups

1. **Remote media (D4).** Fixture URLs point at a third-party CDN and may rotate or
   block hotlinking. Mitigation: every `<video>` gets a `poster`, every `<img>` an
   `onError` fallback to a token-coloured block, and the fixture module is the single
   place to swap in local assets later. `next.config` needs the remote host in
   `images.remotePatterns`.
2. **Populated drop-zone state.** The reference requires sign-in to observe uploads, so
   thumbnail layout, remove affordance and error styling are designed from the system's
   own vocabulary rather than measured. Flag for a second pass if a signed-in reference
   becomes available.
3. **Mobile composer sheet.** Same gating problem (§10). Out of scope; the mobile view
   ships as pane-only.
4. **Fonts.** Inter and Space Grotesk are the reference's actual faces and are both on
   Google Fonts, so this is exact, not a substitute — unlike the Archivo/JetBrains pair
   the marketing layer documents as stand-ins.
5. **Two token systems.** The repo now carries `--surface-*`/`--r-*` (marketing) and
   `--q-*` (studio). This is deliberate per D1, but it must be documented in
   `CLAUDE.md` or the next contributor will mix them. Add a short "which token layer"
   note as part of the work.
6. **Right-pane ground.** Corrected after implementation — this was originally
   recorded as "renders as effectively flat". It is not: the pane sits on a
   staggered dot lattice, two `radial-gradient` layers of `#191b1d` on a `20px`
   tile offset by `10px`, masked by two intersected linear gradients (`to right`
   holding to 78%, `to top` holding to 60%) so the dots fade out toward the right
   and top edges. Shipped as `.q-dot-grid`. See §14.

---

## 13. Acceptance

At 1440×900, signed out, with reduced-motion off:

- [ ] Form column is exactly 320px; pane is exactly 1080px; neither the page nor `body` scrolls.
- [ ] Mode switch rewrites both drop-zone primaries, flips the image cap 49 → 30, and swaps the prompt placeholder.
- [ ] Hovering either mode tab opens the preview to the right of the form, vertically centred, with the conic-gradient hairline and the left-pointing arrow.
- [ ] Prompt toggle animates `grid-rows-[0fr]` → `[1fr]` over 200ms; collapsed content is `inert`; the switch is a real checkbox reachable by Tab and toggled by Space.
- [ ] Quality menu opens to the _right_, lists 480p/720p/1080p, checks 720p.
- [ ] Model popover is 400px, lists the featured group with `Top`/`New` badges and capability chips, and checks Higgsfield Genjutsu.
- [ ] Right pane defaults to Motion Library; History shows an empty canvas plus its zoom/layout controls; How it works shows a three-slide filmstrip.
- [ ] Source tabs stick to the top of the scroller; masonry is 2/3/4 columns at sm/md/xl.
- [ ] Card hover reveals mode chip, expand, variant switcher and Recreate; the active avatar's ring tracks playback; Community cards alone expose a `Report` menu.
- [ ] Expand opens the lightbox with player and sidebar; `Escape` closes it and focus returns to the card.
- [ ] Generate opens the auth gate and never navigates.
- [ ] At 375px the form is hidden and the pane fills the width.
- [ ] Keyboard alone reaches every control; tab groups use arrow keys; focus is always visible.
- [ ] `prefers-reduced-motion` stops autoplay and zeroes every transition.
- [ ] `pnpm check` passes.

---

## 14. What implementation changed

Two things this spec got wrong only became visible once the page ran. Both are fixed
in the code; they are recorded here so the spec matches what was built.

1. **The grid needs `w-full`.** §3 gives the grid as
   `relative mx-auto grid max-w-480 …`, which is what the reference carries. But the
   reference's `main` is a block; ours is `flex min-h-0 flex-1`, so the grid became a
   flex item and shrank to its content — the pane measured 674px instead of 1080px.
   The built markup adds `w-full min-w-0`. Anything porting this to another shell
   should check the parent's display before trusting the class list.

2. **The studio needs its own page ground.** §3 said no root-layout change was
   needed, which is true, but it did not say who paints the background. The live
   studio forces `#0f1113` onto `html`/`body` for these routes; ours inherited the
   marketing `--surface-page` (`#030304`) and rendered visibly darker. The
   `(studio)` layout now carries `bg-q-page`. The site header already uses
   `--surface-panel`, which is the same `#0f1113`, so the seam is invisible.

3. **The pane's decorative layer is a dot grid**, not the no-op hook §6 assumed —
   see the corrected risk above. Shipped as `.q-dot-grid` in the token layer.

4. **`--radius-q-full` was never written.** §4.2 lists it, the implementation
   stopped at `--q-r-600`, and Tailwind emits _nothing_ for an unknown token — so
   `rounded-q-full` produced no rule and every pill in the studio rendered square:
   the prompt switch, the pill-variant tabs (`Higgsfield` / `Community`), the
   how-it-works filmstrip and its thumbnails, and the auth gate's badge. Nothing
   failed loudly; the classes were simply inert.

   **This is the failure mode to guard against in a two-layer token setup.** A
   missing key is invisible to `tsc`, to ESLint and to Prettier. The check is
   mechanical: extract every `q-*` utility used under `src/`, extract every
   `--(color|radius|text|shadow|font|ease)-q-*` key defined in the `@theme inline`
   block, and diff. Run it after touching either file. At the time of writing:
   68 defined, 58 used, 0 missing.

5. **Both menus must be portalled.** §5.6 describes the quality and model menus as
   opening to the right of their triggers, which they do — but it did not say _how_.
   Positioning them absolutely inside the form clips them: the panel is
   `overflow-hidden` and the scroll body resolves to `overflow-x: auto`, so a menu
   anchored at `left-full` was sliced at the panel edge (measured: menu right 479px,
   clip boundary 335px). They now render through `q-popover.tsx` into `document.body`
   with fixed positioning, anchored by their **bottom** edge so a tall menu grows
   upward and `max-height` alone keeps it on screen. The reference does the same thing
   — its menus are body-level elements — which is the detail the original inspection
   recorded but the spec failed to carry across. The preset card's `Report` menu has
   the same problem for the same reason and takes the same fix.

Everything else in §13 was verified against the running build at 1440×900: form 320px,
pane 1080px at x=344, no page scroll, mode switch rewriting both zones and the 49→30
cap, the prompt collapse animating `0fr`→`1fr`, 14 models with Genjutsu checked, card
hover revealing the chip/switcher/Recreate, the lightbox gridding to `1072px 368px`
with focus trapped, and the form hidden below `md`.

### Known gaps

- `history-panel.tsx` and the `Edit Video` / `Motion Control` tabs are intentionally
  inert, per §1.
- The mobile composer sheet (§10) is still unbuilt — the pane ships alone below `md`.
- `src/components/studio/video-prompt-panel.tsx` was orphaned by the page rewrite, and
  `video-studio.tsx` was already unreferenced before this work. Neither was deleted;
  both are dead code awaiting a decision.
