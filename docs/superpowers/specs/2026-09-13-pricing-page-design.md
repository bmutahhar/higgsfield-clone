# `/pricing` — 1:1 design spec

Target: `https://higgsfield.ai/pricing`, signed out.

Every number below was read off the live DOM — `getComputedStyle` and
`getBoundingClientRect` — at a **1728 × 906** viewport for the desktop surface
and **375 × 812** for the mobile one. Nothing here is estimated from a
screenshot. Where a value looks odd (a `-10.89deg` skew, a `h-44.5`) it is
odd on the live site too.

Parity is on **rendered output and interaction state**, not on their DOM or
class names. The live site is a Tailwind v4 app on a 3.8 MB stylesheet using
Base UI popovers, `number-flow` for animated digits, and a hand-rolled div
slider; we rebuild the same surface in Next 16 with this repo's own tokens and
primitives.

---

## 1. Scope

**In scope — both surfaces, in full:**

- `≥ 768px` — the `.pricing-page` tree: countdown banner, page header, the
  segmented plan-audience control, the billing toggle, the Individual (3-up)
  and Business (3-up) plan grids, the per-card credit slider and seat stepper,
  the "Find the best plan for you" configurator, the expandable comparison
  table, the FAQ and the closing CTA.
- `< 768px` — the `.pricing-mobile-layout` tree, a **completely different
  component tree** (see §10). Not a reflow: a separate long-form sales page
  with its own hero video, radio-style plan picker, story carousels, a
  full-comparison bottom sheet and a fixed CTA bar.
- Every hover / press / open / selected / checked / disabled state of the
  above, as observed by driving the live page.

**Out of scope:** the shared chrome (`site-header`, footer) already built in
this repo, and the routes the CTAs link to (checkout, `/creator-hub/...`).

**Deliberate deviations** — places we do _not_ copy the live site, each with a
reason. These are the only intentional differences; everything else is parity.

| Live behaviour                                                                                                   | What we build instead                                               | Why                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan credit slider is a bare `<div>` stack — no `role`, no `tabindex`, no `aria-value*`, unreachable by keyboard | Real visually-hidden `<input type="range">` under the painted track | CLAUDE.md: "Prefer the platform for control state." The live configurator already does exactly this (§7.2), so this is consistency, not invention. Identical pixels. |
| Slider tick labels are `<button>`s with no `aria-pressed`                                                        | `aria-pressed` on each tick                                         | One attribute, no visual change                                                                                                                                      |
| Mobile plan cards are `<button>`s with no radio semantics                                                        | `role="radio"` in a `role="radiogroup"`, arrow-key roving           | Single-select control announced as a single-select control                                                                                                           |
| Full-comparison bottom sheet: `role="dialog"`, no focus trap, no labelled title                                  | `<dialog>` with `aria-labelledby`                                   | Platform modal gives trap + Esc for free                                                                                                                             |
| Tabs have `role="tab"`/`aria-selected` but no `aria-controls`                                                    | Add `aria-controls` to the panel                                    | Completes the pattern already begun                                                                                                                                  |
| Plan card frame declares `transition-[border-color,box-shadow] duration-300` but **nothing changes on hover**    | Drop the dead transition                                            | Measured at rest and at hover: identical. Copying it copies a bug.                                                                                                   |

### 1.1 Assets we do not have

The live page loads several of its own image and video files. Every surface
below is built so the gradients carry it alone, and each is a drop-in once an
equivalent asset exists — none of them changes layout.

| Asset                                   | Used by                                | Without it                            |
| --------------------------------------- | -------------------------------------- | ------------------------------------- |
| `/promotions/seedance-4k-grid-room.png` | Seedance panel, screen-blended at 30%  | Gradient only; reads slightly flatter |
| `/pricing/find-best-plan-right-bg.png`  | Configurator's right panel, full-bleed | Flat `#1c1e20` panel                  |
| Mobile hero video (§10.2)               | 280px hero, autoplay loop              | Poster/gradient only                  |
| Mobile story-panel stills (§10.5)       | Two 588px story panels                 | Gradient + scrim only                 |

---

## 2. Token layer

**Decision: extend the `q-` layer and amend CLAUDE.md.**

The live `/pricing` page is built on the _same_ ramp as the generation
surfaces — the values in `src/styles/tokens/q-studio.css` are already exact
matches, measured:

| Live `/pricing`                                       | Existing token                 | Match |
| ----------------------------------------------------- | ------------------------------ | ----- |
| `#0f1113` page / body                                 | `--q-bg-page`                  | ✅    |
| `#131517` FAQ item                                    | `--q-bg-primary`               | ✅    |
| `#1c1e20` recommendation panel, tooltip, mobile cards | `--q-bg-secondary`             | ✅    |
| `#23262a` "unlimited" panel                           | `--q-bg-secondary-strong`      | ✅    |
| `#d1fe17` brand                                       | `--q-brand` / `--q-text-brand` | ✅    |
| `#f7f7f8` body ink                                    | `--q-text-body`                | ✅    |
| `#898a8b` muted ink                                   | `--q-text-muted`               | ✅    |
| Inter + Space Grotesk                                 | studio faces                   | ✅    |

So `q-studio.css` is misnamed rather than mis-valued: it is the **live-site
ramp**, and the marketing ramp (Archivo, `#030304`) is the Claude Design
mirror. Forking a third `--p-*` set would duplicate eight values verbatim and
create exactly the "close enough to look almost right" drift CLAUDE.md warns
about.

**Required edits:**

1. `CLAUDE.md` → under _Which token layer_, widen the studio entry:

   > **Live-surface layer** — `--q-*` from `src/styles/tokens/q-studio.css`.
   > Used by every route that must hit 1:1 parity with the live site:
   > `src/app/(studio)/`, `src/components/studio/`,
   > `src/components/image-studio/`, plus `src/app/(marketing)/pricing/` and
   > `src/components/pricing/`. Faces: Inter + Space Grotesk.

   The rule that the two ramps must never mix **inside one component** stands
   unchanged.

2. `src/styles/tokens/q-studio.css` → append the pricing-only primitives.
   These are new; nothing existing changes value.

```css
/* ---- Pricing surface (measured on /pricing) ---- */
--q-brand-pink: #ff005b; /* discount badges, MAX card + CTA, strike-through */
--q-brand-pink-deep: #ed1572; /* countdown banner inner glow only */
--q-brand-blue: #0256fe; /* SCALE CTA */
--q-brand-blue-1: #4fc9dc; /* "Best value" badge gradient stop 1 */
--q-brand-blue-2: #32a2ee; /* stop 2 */
--q-brand-blue-3: #167bff; /* stop 3 */
--q-info: #9ce6f3; /* "Access to Supercomputer" feature ink */
--q-switch-off: #5e636e; /* toggle track, unchecked */

--q-bg-plan: #18191c; /* PRO / MAX card base under the tint */
--q-bg-plan-basic-a: #1d1f20; /* BASIC frame gradient, top */
--q-bg-plan-basic-b: #17191b; /* BASIC frame gradient, bottom */
--q-bg-enterprise: #ffffff; /* Enterprise outer shell */

--q-fill-5: rgba(255, 255, 255, 0.05); /* credits box, savings strip, chips */
--q-fill-10: rgba(255, 255, 255, 0.1); /* usage-meter track, "no access" pill */
--q-fill-20: rgba(
  255,
  255,
  255,
  0.2
); /* slider track, unchecked checkbox edge */

--q-border-6: rgba(255, 255, 255, 0.06); /* comparison table rows + frame */
--q-border-8: rgba(255, 255, 255, 0.08); /* comparison billing toggle */
--q-border-10: rgba(255, 255, 255, 0.1); /* toggles, "Not sure", View More */
--q-border-14: rgba(255, 255, 255, 0.14); /* FAQ item */

--q-ink-30: rgba(255, 255, 255, 0.3); /* disabled feature rows */
--q-ink-40: rgba(255, 255, 255, 0.4); /* configurator sub-copy */
--q-ink-50: rgba(255, 255, 255, 0.5); /* plan sub-copy, tick labels at rest */
```

3. `src/app/globals.css` → project them in the existing `@theme inline` block
   that already carries `--color-q-*`, following the same naming
   (`--color-q-brand-pink`, `--color-q-fill-5`, …), so components write
   `bg-q-plan`, `text-q-ink-50`, `border-q-border-10`.

**Fonts.** The `q-` layer needs Inter and Space Grotesk via `next/font`,
exposed as `--font-q-sans` and `--font-q-display`. Space Grotesk is used
_only_ for badges and the mobile display headlines; everything else is Inter.
The marketing layer (Archivo + JetBrains Mono) is untouched.

### 2.1 Type scale, as measured

| Role          | Size / line-height / weight / tracking             | Where                                            |
| ------------- | -------------------------------------------------- | ------------------------------------------------ |
| Page h1       | 40 / 48, w600, `-0`                                | "Upgrade your plan"                              |
| Section h2    | 40 / 48–50, w600, `-1.2px` / `-1px`                | "Compare features", "Find the best plan for you" |
| FAQ h4        | 36 / 44, w700                                      | "Frequently Asked Questions"                     |
| Banner h2     | 36 / 40, w700, `-1.44px`, uppercase, Grotesk       | countdown banner                                 |
| Plan name     | 24 / 28, w700, `-1.2px`, uppercase                 | BASIC / PRO / MAX                                |
| Price, large  | 28 / 32, w700, `-1.2px`                            | `$59`                                            |
| Price, struck | 24 / 28 (card) · 28 / 32 (panel), w700, brand pink | `$79`                                            |
| Card sub-head | 16 / 24, w600                                      | "How many content items per month?"              |
| Body          | 14 / 20, w400–w600                                 | CTAs, tabs, most labels                          |
| Caption       | 12 / 16–18, w400–w600                              | feature rows, tick labels, disclaimers           |
| Badge         | 12 / 12, w700, uppercase, **Grotesk**, skewed      | "21% OFF", "Best value"                          |
| Micro badge   | 10 / 14, w600                                      | "No access", "2K"                                |

---

## 3. Page skeleton (≥ 768px)

```
body                              bg #0f1113, ink #f7f7f8, font Inter
├─ route-progress bar             (already in repo)
├─ #header                        h 52  ← existing site-header
└─ main
   └─ .pricing-page               bg #0f1113, min-h 100vh
      │  --pricing-max-width: 90rem (1440px)
      │  --pricing-padding-x: 1rem (3.75rem at lg) — but see below
      │  --pricing-padding-y: 2rem
      │  --pricing-column: 1064px         ← every section centres on this
      └─ .pricing-page__container max-w 1440, px 16, py 32, flex col, items-center, gap 8
         ├─ §4  countdown banner   1064 × 248, mb 16, md:-mt-4 (−16px)
         └─ #cards                 w-full
            ├─ §5  header + controls + plan grid
            ├─ §7  #find-best-plan   1064 × 900, mt 48, scroll-mt 96
            ├─ §8  #pricing-comparison  mt 80, scroll-mt 32
            ├─ §9  FAQ               pt 60 pb 40
            └─ §9.2 closing CTA row  h 40
```

`--pricing-padding-x` is declared but **overridden**: the container carries
`px-3! md:px-4!`, so the measured padding is a flat `32px 16px` at every width
from 768 to 1728. Keep the variable for fidelity, but do not expect it to do
anything.

`--pricing-column` is a hard 1064px at every width ≥ 768; the container grows
to 1440 but the content does not. A `.pricing-page--wide` modifier exists on
the live site (`--pricing-column: 1424px; --pricing-max-width: 92rem`) but is
not applied on this route — build the hook, leave it off.

---

## 4. Countdown banner

`section`, 1064 × 248, `rounded-3xl` (24px), `p-6`, `overflow-hidden`,
`isolate`, `mb-4`, `md:-mt-4`. At `< lg` it is `rounded-2xl p-4` and its inner
row stacks to a column.

Four stacked layers, bottom to top:

1. **Ring + drop shadow** on the section itself — `inset 0 0 0 1px rgba(255,255,255,0.1)`
   plus `0 8px 24px rgba(0,0,0,0.12)`. Inset ring, not a border: the radius
   stays crisp.
2. **Texture layer**, `absolute inset-0 rounded-[inherit]`, four backgrounds in
   this order:
   ```css
   background-image:
     conic-gradient(
       from 270deg at 3px 3px,
       rgba(255, 255, 255, 0.02) 0deg,
       rgba(255, 255, 255, 0.02) 25%,
       transparent 0deg
     ),
     conic-gradient(
       from 270deg at 3px 3px,
       rgba(255, 255, 255, 0.02) 0deg,
       rgba(255, 255, 255, 0.02) 25%,
       transparent 0deg
     ),
     linear-gradient(
       to top,
       rgba(255, 0, 91, 0.1) 0%,
       rgba(255, 0, 91, 0.004) 100%
     ),
     linear-gradient(
       90deg,
       rgba(255, 255, 255, 0.03) 0%,
       rgba(255, 255, 255, 0.03) 100%
     );
   background-size:
     10px 10px,
     10px 10px,
     100% 100%,
     100% 100%;
   background-position:
     0 0,
     5px 5px,
     0 0,
     0 0;
   ```
   The two offset conic gradients are a 10px dot grid; the pink linear is the
   promo wash.
3. **Glow layer**, `absolute inset-0`, `box-shadow: inset 0 1px 64px 0 rgba(237,21,114,0.24)`.
4. **Content**, `relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6`.

Content column (1016 × 200, `gap-4`):

- **Eyebrow badge** — `span`, h 16, `bg #ff005b`, `rounded-xs` (2px),
  `pl-1 pr-1.5`, `-skew-x-[10.89deg]`, containing a 10px icon and the label
  `12/12 w700 uppercase Grotesk #fff` (`skew-x-10` on the label to counter the
  parent skew, so the type stands upright inside a slanted chip). This
  counter-skew pattern repeats on every badge on the page.
- **Headline** — `h2`, two `span` lines, each `36/40 w700 -1.44px uppercase`
  Grotesk. Line 1 `#ff005b`, line 2 `#fff`.
- **Sub-copy** — `p`, `14/20 w400 rgba(255,255,255,0.5)`.
- **Button** — 234 × 40, `bg #fff`, `rounded-[10px]`, ink `#1a1a1a`,
  `14/20 w600`, `px-4 pt-2 pb-2.5`, and the page's signature three-part
  shadow:
  ```
  inset 0 -3px 0 0 rgba(0,0,0,0.32), 0 6px 4px 0 rgba(0,0,0,0.25), 0 32px 24px 0 rgba(0,0,0,0.15)
  ```
  The inset top-light/bottom-dark is what gives every CTA on this page its
  "key-cap" look. Reuse it as `--q-shadow-key`.

**States.** The whole banner is also a `button` at `absolute inset-0 z-20`
overlaying the content — clicking anywhere activates it. Hover:
`background-color: rgba(255,255,255,0.03)` on that overlay, `transition-colors`.
The inner "Sign up and get your discount" button is therefore decorative; keep
it non-focusable (`tabindex="-1"`, `aria-hidden`) and let the overlay carry the
accessible name, or invert it — one focus stop either way, not two.

---

## 5. Plan section

### 5.1 Header block

`flex flex-col gap-3`, pt 24:

- `h1` "Upgrade your plan" — `40/48 w600 #fff`
- `p` — `14/20 w500 #898a8b`, "Lock better prices with upgrade or scale your
  creativity maximizing your current plan"

40px gap to the controls row.

### 5.2 Controls row

`flex items-center justify-between gap-3`, h 42.

**Left — audience segmented control.** `div[role=tablist]`, 330 × 42,
`bg rgba(255,255,255,0.05)`, `border 1px rgba(255,255,255,0.05)`,
`rounded-xl`, `p-1`, `overflow-hidden`, `w-max`.

- A sliding **thumb** `span`, 160 × 32, `bg rgba(255,255,255,0.05)`,
  `border 1px rgba(255,255,255,0.05)`, `rounded-lg`, positioned by
  `transform`, transition `transform .3s cubic-bezier(.4,0,.2,1), width .3s`
  (same curve on both).
- Two `button[role=tab]`, each 160 × 32 (`min-w-40 h-8`), `rounded-lg`,
  `px-3`, `14/20 w600`. Selected ink `#fff`; unselected `#898a8b`;
  `transition-colors`.
- `aria-selected` flips correctly on the live site. **Add `aria-controls`**
  pointing at `#pricing-plans`.

**Right — two controls, `gap-2`:**

_"Not sure which plan?"_ — `button`, 178 × 40, transparent,
`border 1px rgba(255,255,255,0.1)`, `rounded-[0.625rem]`, `px-3 py-2`,
`12/16 w500 #f7f7f8`, a 16px "collapse arrows" icon, `gap-1`.
Hover `bg rgba(255,255,255,0.05)` (`transition-[background-color,border-color] 150ms`).
Press `opacity .88`. Click → smooth-scrolls to `#find-best-plan`, which carries
`scroll-mt-24` (96px), so the section lands 96px below the viewport top.

_Billing toggle_ — `button[role="switch"][aria-label="Toggle billing period"]`,
161 × 40, transparent, `border 1px rgba(255,255,255,0.1)`, `rounded-lg`,
`px-2 py-1.5`, `overflow-hidden`. Children:

| Part                              | Annual (checked)                                                                                                | Monthly (unchecked)                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| "Monthly" label `12/16 w500`      | `#898a8b`                                                                                                       | `#f7f7f8`                                            |
| Track `28 × 16 rounded-xl`        | `#d1fe17`                                                                                                       | `#5e636e`                                            |
| Knob `12 × 12 rounded-lg bg-#fff` | `translate-x-3`, `border 1px rgba(0,0,0,0.1)`, `shadow 0 1px 12px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.15)` | at rest, `shadow 0 1px 2px rgba(0,0,0,0.15)`         |
| "Annual" label                    | `#f7f7f8`                                                                                                       | `#898a8b`                                            |
| "30% OFF" badge                   | `max-w-0 opacity-0 translate-x-1 pl-0` — collapsed                                                              | `max-w-64 opacity-100 translate-x-0 pl-1` — revealed |

The badge is the toggle's whole trick: it advertises the annual saving only
while you are on Monthly, and folds away once you take it. Track and knob
transition 200ms `ease-out`; the badge transitions
`max-width, opacity, padding, transform` over 200ms `ease-out`. Badge itself:
h 16, `skew-x-[-10deg]`, `rounded-sm`, `bg #ff005b`, `px-1.5`,
`12/12 w700 uppercase` Grotesk, `drop-shadow(0 4px 4px rgba(0,0,0,0.2))`, with
an inner `skew-x-10` counter-rotation.

Respect `motion-reduce:` on all three.

### 5.3 Plan grid

`#pricing-plans > div`: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3`,
`gap-2 xl:gap-4`.

| Width         | Columns | Track | Gap  |
| ------------- | ------- | ----- | ---- |
| ≥ 1280 (`xl`) | 3       | 344px | 16px |
| 1024          | 2       | 476px | 8px  |
| 768 (`md`)    | 2       | 348px | 8px  |

Card height is equalised by the grid (910px annual / 839px monthly at `xl`) —
all three cards are the same height in a row, and that height **changes with
the billing mode**, because the annual mode adds a savings strip and an extra
unlimited-model row.

---

## 6. Plan card (Individual)

344 × 910. Three nested layers:

1. **Frame** — `relative h-full overflow-hidden rounded-[1.25rem]` (20px).
   Background differs per plan:

   | Plan  | `background-color` | `background-image`                                                                                                                                                                          |
   | ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | BASIC | —                  | `radial-gradient(58% 220% at 3% 42%, rgba(255,255,255,0.094) 0%, rgba(255,255,255,0.035) 42%, rgba(255,255,255,0.01) 100%), linear-gradient(#1d1f20 0%, #17191b 100%)`                      |
   | PRO   | `#18191c`          | `linear-gradient(225deg, rgba(209,254,23,0.16) 0%, rgba(209,254,23,0.08) 28%, rgba(209,254,23,0) 62%)`                                                                                      |
   | MAX   | `#18191c`          | `radial-gradient(145% 54% at 100% 0%, rgba(255,0,91,0.32) 0%, rgba(255,0,91,0.15) 42%, transparent 78%), linear-gradient(rgba(255,0,91,0.13) 0%, rgba(255,0,91,0.07) 36%, transparent 72%)` |

   MAX alone also carries `box-shadow: 0 24px 64px rgba(0,0,0,0.24)`.

2. **Hairline ring** — `absolute inset-0 rounded-[inherit] p-px`, background
   `linear-gradient(rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.09) 18%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0) 72%)`,
   masked to the 1px edge with the standard
   `mask: linear-gradient(#000,#000) content-box exclude, linear-gradient(#000,#000)`
   trick. It is a _gradient_ hairline — bright at the top, gone by 72% down.
   A flat `border` here is the second-most visible thing a naive clone gets
   wrong (after the badge skew).

3. **Content** — `flex flex-col`.

### 6.1 Header block (h 258, `px-4 pt-4`, `gap-3`)

- **Title row**, `gap-2 items-center`: plan name `24/28 w700 -1.2px uppercase
#fff`, then the discount badge when one applies — `bg #ff005b`,
  `rounded-xs`, `pl-1 pr-1.5`, h 16, `-skew-x-[10.89deg]`, label
  `12/12 w700 uppercase` Grotesk `#fff`. MAX additionally carries the **"Best
  value"** badge: same geometry, but
  `background: radial-gradient(84% 180% at 50% 118%, #4fc9dc 0%, #32a2ee 50%, #167bff 100%)`.
- **Tagline** `p` — `12/18 w400 rgba(255,255,255,0.5)`.
- **Credits box** — 312 × 136, `bg rgba(255,255,255,0.05)`, `rounded-xl`,
  `p-3`, `flex flex-col justify-between`:
  - Row: 16px sparkle icon + `<number-flow>` count + " credits/mo."
    (`14/20 w600 #fff`). The count is an **animated odometer** — digits roll
    when the slider or billing mode changes. Use a small
    `use-animated-number` hook (tabular-nums, per-digit `translateY`), not a
    library; `motion-reduce:` snaps it.
  - Two derived lines, `12/16 w500 rgba(255,255,255,0.5)`, `pl-7`:
    `= N Nano Banana Pro Generations`, `~ N Seedance 2.0 videos`.
  - Then **either** the BASIC fixed-amount notice — 288 × 38,
    `border 1px rgba(255,255,255,0.05)`, `rounded-lg`, centred, 16px check
    icon + `12/18 w500 rgba(255,255,255,0.5)` "Fixed amount of 120 credits/mo"
    — **or** the credit slider (§6.2).
- **Price row**, `flex items-end gap-1`:
  - Struck original (annual, or monthly at a raised tier): `24/28 w700
-1.2px #ff005b` with a full-width 8px-thick `#ff005b` bar absolutely
    positioned across it — a _drawn_ strike, not `line-through`.
  - Current: `28/32 w700 -1.2px #fff`.
  - Cadence: `12/18 w400 rgba(255,255,255,0.5)` — "per month, billed annually"
    / "Billed monthly" / "Billed monthly, renews at $158".

### 6.2 Credit slider

288 × 46, `pt-1`, `gap-2`. Present on PRO (2 stops) and MAX (3 stops); absent
on BASIC.

- Wrapper `relative flex cursor-pointer touch-none items-center mx-2.5 h-4`.
- Track `absolute inset-x-0 h-1 rounded-full bg-white/20`.
- Fill `absolute left-0 h-1 rounded-full bg-white`, inline `width: N%`,
  `transition-[width] 150ms`.
- Thumb `absolute size-5 -translate-x-1/2 rounded-full bg-white shadow-md grid
place-items-center`, inline `left: N%`, `transition-[left] 150ms`, holding a
  16px black `⟨⟩` chevron-pair icon.
- Below, `flex justify-between px-2.5`: one `button` per stop,
  `12/18 w500`, `gap-1`, a 14px credit glyph + the number. Active `#fff`;
  inactive `rgba(255,255,255,0.5)`.

Stops map to `left`/`width` of `0% / 50% / 100%` — evenly spaced regardless of
credit value.

**Our implementation:** paint exactly this, but drive it from a visually-hidden
`<input type="range" min="0" max="{stops-1}" step="1">` stretched over the
track (`absolute inset-0 opacity-0 cursor-pointer`), exactly as the live
configurator does for its own sliders. Tick labels stay real buttons and gain
`aria-pressed`.

### 6.3 Body blocks (`p-3`, `gap-4`)

**a. CTA block** — 320 wide, `bg rgba(255,255,255,0.05)`,
`border 1px rgba(255,255,255,0.05)`, `rounded-xl`. Height **82 annual / 50
monthly**: annual adds the savings strip.

- Button, 318 × 48, `rounded-[0.625rem]`, `14/20 w600`, full-width:

  | Plan  | Fill                                                                                 | Ink       | Inset shadow line  |
  | ----- | ------------------------------------------------------------------------------------ | --------- | ------------------ |
  | BASIC | `#fff`                                                                               | `#131517` | `rgba(0,0,0,0.1)`  |
  | PRO   | `linear-gradient(rgba(255,255,20,0) 0%, #ffff14 100%)` over `#d1fe17`                | `#131517` | `#829b19`          |
  | MAX   | `linear-gradient(182.4deg, rgba(243,100,228,0) 12.7%, #fa4ae7 75.8%)` over `#ff005b` | `#fff`    | `rgba(0,0,0,0.32)` |

  Full shadow on all three:
  `inset 0 -3px 0 0 <line>, 0 6px 4px rgba(0,0,0,0.25), 0 32px 24px rgba(0,0,0,0.15)`.
  **Hover: `filter: brightness(1.1)`**, `transition-[filter,opacity] 150ms`.
  That is the only hover state — no lift, no shadow change. Verified by
  measuring at rest and at hover.

- Savings strip (annual only) — 318 × 32, `p-2`, centred,
  `12/16 w400 rgba(255,255,255,0.5)`: "No difference compared to monthly"
  (BASIC) or "Save $N" (`w600 #fff`) + " compared to monthly".

**b. Unlimited-models panel** — 320 × 196/158, `bg #23262a` +
`radial-gradient(80% 40% at 50% 100%, rgba(255,255,255,0.08), transparent)`,
`border 1px rgba(255,255,255,0.05)`, `rounded-xl`, `pt-3 px-3 pb-1`.
**On BASIC the whole panel is `opacity: 0.6`** — the plan has no unlimited
models and the panel is dimmed wholesale rather than restyled.

- Header row: 16px icon + `14/20 w700 -0.56px uppercase` label
  ("UNLIMITED & FREE GENS"), ink `rgba(255,255,255,0.4)` on BASIC; a 24px
  circular info button at the right.
- Rows, 38px each, `py-2.5`, `gap-1.5`, `border-b rgba(255,255,255,0.05)`
  except the last: 16px status icon + model name
  (`12/16 w400`, `rgba(255,255,255,0.3)` when unavailable) + right-aligned
  badges — `2K` and `7-day unlimited` (brand pill) or `No unlimited`
  (neutral pill).
- Foot row on PRO/MAX: "7 unlimited & free generation models" with a `›`
  chevron — a link to the full list.

**c. Seedance panel** — 320 × 159/163, `bg #23262a`,
`border 1px rgba(255,255,255,0.05)`, `rounded-2xl`, `pt-2 px-2 pb-3`,
`gap-1.5`. Two variants:

- _BASIC_ — header "NO ACCESS TO SEEDANCE 2.5" `16/20 w700 -0.64px uppercase
rgba(255,255,255,0.5)`, sub "Available from Pro plan"
  `12/18 w500 rgba(255,255,255,0.3)`, and a 32px circular glyph badge with
  `linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.1))`. Model rows
  carry a grey `No access` micro-pill (`10/14 w600`, `bg rgba(255,255,255,0.1)`,
  `rounded`, `px-1`).
- _PRO / MAX_ — "ACCESS TO SEEDANCE MODELS" / "Full line-up included", blue
  treatment, rows carry `1080p` / `4K` + a `Full access` pill.

Inner list is `bg rgba(255,255,255,0.05)`, `rounded-lg`, `px-3`,
`backdrop-blur(4px)`.

**d. Feature list** — `flex flex-col gap-1`, rows 16px tall, `gap-1`, 16px
check/cross icon + label `12/16 w400`. Ink is semantic:

| Ink                     | Meaning                                               |
| ----------------------- | ----------------------------------------------------- |
| `#fff`                  | included                                              |
| `#9ce6f3`               | "Access to Supercomputer" — the one info-coloured row |
| `rgba(255,255,255,0.3)` | not included on this plan                             |

Some rows are `button`s (they open explainers); MAX's last row carries a
`50% CHEAPER` / `60% CHEAPER` badge that tracks the billing mode, and its
first row a `New` badge.

---

## 7. Find the best plan (`#find-best-plan`)

1064 × 900, `mt-12`, `scroll-mt-24`, `rounded-xl`.

Header: `h2` "Find the best plan for you" `40/50 w600 -1px #fff`; `p` "Choose
what you want to create and get what you need" `14/20 w400 rgba(255,255,255,0.4)`.

Shell: 1064 × 786, `bg #18191c`, `border 1px rgba(217,217,217,0.04)`,
`rounded-2xl`, `flex`. Two equal 531px columns.

Entry animation `.pricing-fbp-shell`:
`animation: .22s cubic-bezier(.215,.61,.355,1) both pricing-fbp-soft-enter`
where `soft-enter` is `opacity 0→1, translateY(.375rem)→0`. Steps and chips
reuse it at `.18s` / `.15s`.

### 7.1 Step 1 — "What are you here to make?"

Left column `pt-5 pr-7 pb-6 pl-4`, `gap-8`. Each step is
`flex gap-3 items-stretch` with a 28px numbered disc
(`bg rgba(255,255,255,0.05)`, `rounded-full`, `14/20 w600 #fff`) above a 1px
`rgba(255,255,255,0.1)` connector line that runs the height of the step.

Options: `grid grid-cols-2 gap-1.5`, six `button[aria-pressed]`, each
221 × 38, `bg rgba(255,255,255,0.05)`, `rounded-lg`, `p-2.5`, `gap-2`,
`backdrop-blur-2xl`, `transition-[background-color,color,transform] 150ms ease-out`.

| State    | Fill                     | Ink       | Checkbox                                                                                   |
| -------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------ |
| Rest     | `rgba(255,255,255,0.05)` | `#fff`    | 18px `rounded-md`, `border 1px rgba(255,255,255,0.2)`, empty                               |
| Hover    | unchanged                | unchanged | — plus `transform: translateY(-1px)` (`.pricing-fbp-option:hover`)                         |
| Press    | —                        | —         | `opacity .88` (`.pricing-fbp-pressable:active`)                                            |
| Selected | `rgba(255,255,255,0.1)`  | `#d1fe17` | `bg #d1fe17`, `border 1px #d1fe17`, white ✓ drawn as a rotated `border-b-2 border-l-2` box |

Multi-select; the sub-label says so.

### 7.2 Step 2 — "How many content items per month?"

Heading `16/24 w600` + a 20px info button. Sub-copy two lines
`12/16 w400 rgba(255,255,255,0.4)` naming the per-generation credit cost —
**these lines change with the Premium-quality toggle** (§7.5).

Card: 447 × 227, `border 1px rgba(217,217,217,0.04)`, `rounded-xl`, `p-4`,
`gap-4`, holding two sliders split by a 1px `rgba(255,255,255,0.05)` rule.

Each slider is three stacked pieces:

1. **Tick ruler**, 413 × 28, `px-2 py-1`, `flex justify-between`. ~46 bars,
   9px apart. Away from the thumb: 1 × 6px, `rgba(255,255,255,0.4)`,
   `opacity .55`. Around the thumb, a nine-bar equaliser wave, 2px wide, all
   `#d1fe17`:

   | Offset  | −4  | −3    | −2   | −1    | 0      | +1    | +2   | +3    | +4  |
   | ------- | --- | ----- | ---- | ----- | ------ | ----- | ---- | ----- | --- |
   | Height  | 6   | 8     | 12   | 16    | **20** | 16    | 12   | 8     | 6   |
   | Opacity | .15 | .3625 | .575 | .7875 | **1**  | .7875 | .575 | .3625 | .15 |

   Opacity steps are linear between .15 and 1 in four increments (0.2125).
   The wave is centred on the thumb and travels with it.

2. **Track** 413 × 4 `bg rgba(255,255,255,0.1) rounded-full`; **fill** 6px
   tall `#d1fe17 rounded-full` with
   `box-shadow: 0 0 1.125rem rgba(209,254,23,0.28)` (`.pricing-fbp-slider-track`);
   **thumb** 32 × 20 `bg #fff rounded-lg`. A real
   `<input type="range" class="absolute inset-0 h-4 w-full opacity-0 cursor-pointer">`
   sits on top and owns the interaction.

   | Slider | `aria-label`       | min | max | step | default | credits each                                |
   | ------ | ------------------ | --- | --- | ---- | ------- | ------------------------------------------- |
   | Videos | `Videos per month` | 5   | 200 | 5    | 50      | 14 (Kling 3.0) / 36 (Seedance 2.0, premium) |
   | Photos | `Photos per month` | 10  | 500 | 10   | 60      | 2 (Nano Banana Pro)                         |

3. **Read-out row**: `~N <model> videos` (`12/16 w500 #fff`) + `N credits`
   (`rgba(255,255,255,0.4)`), and a right-aligned cap pill — `200 +` / `500 +`,
   h 20, `bg rgba(255,255,255,0.05)`, `rounded-full`, `pl-1 pr-2 py-0.5`,
   `12/16 w500 rgba(255,255,255,0.4)` with a 16px icon.

### 7.3 Step 3 — "Features & capabilities"

"+ Add features" trigger, h 32, `rounded-md`, `pl-2 pr-1.5`, `12/16 w500`,
ink `#d1fe17`, fill `color-mix(in srgb, #d1fe17 10%, transparent)`, hover
`16%`. A count badge sits `-top-1.5 -right-1.5`: `min-w-4.5`, `rounded-full`,
`bg #d1fe17`, `10/14 w600`, ink dark.

**Menu** — `role="menu"`, `z-100000`, 302 wide, `rounded-xl`,
`bg surface-secondary/75` + `backdrop-blur`,
`border 1px rgba(217,217,217,0.04)`, `shadow 0 4px 4px rgba(0,0,0,0.12)`,
`animation: .2s forwards popover-in-down` (matching
`.pricing-fbp-dropdown--bottom`: `opacity 0→1, translateY(-.375rem)→0`,
`.16s cubic-bezier(.215,.61,.355,1)`; the `--top` variant comes from `+.375rem`).

Items are `role="menuitemcheckbox"`, `min-h-9`, `rounded-lg`, `p-2`,
`justify-between gap-2`, hover `bg rgba(255,255,255,0.05)`,
`transition-colors 150ms`. Each carries a label and, where relevant, a tier
line ("from Pro Annual") beneath. Checkbox: 18px `rounded-md`; checked
`bg/border #d1fe17`, unchecked `border 1px rgba(255,255,255,0.2)`.

The eight options, in order:

| Option                                    | Tier line       | Default |
| ----------------------------------------- | --------------- | ------- |
| AI image generation                       | —               | ✓       |
| AI video generation                       | —               | ✓       |
| MCP & Supercomputer                       | from Basic Plan | ✓       |
| Access to all models & features           | from Pro Plan   |         |
| 7-day Unlimited Nano Banana 2 & Kling 3.0 | from Pro Annual |         |
| Lowest cost per credit                    | from Max Plan   |         |
| Run 8 generations at once                 | from Max Plan   |         |
| 7-day Unlimited Nano Banana Pro           | from Max Annual |         |

Selected options render below as **chips** — h 32, `bg rgba(255,255,255,0.05)`,
`rounded-lg`, `px-2`, with an optional tier prefix badge ("Basic", "Max") and
a remove `button` carrying `aria-label="Remove <label>"`. Chips animate in
with `.pricing-fbp-chip` (`.15s` soft-enter).

### 7.4 Recommendation panel

Right column, 531 × 784, `bg #1c1e20`, `rounded-xl`, `p-4`, centred, with a
full-bleed `img` behind it (`/pricing/find-best-plan-right-bg.png`,
`object-fill object-bottom`).

- "We recommend **X** plan" — `14/20 w400 rgba(255,255,255,0.3)`.
- **"See why"** — h 24, `rounded-full`, `bg rgba(209,254,23,0.24)`,
  `pl-2.5 pr-2`, `12/16 w500 #d1fe17` + 14px icon, hover
  `surface-brand-alpha-2`. It is a **hover tooltip** (`data-state` cycles
  `closed → delayed-open`), not a click popover. Panel: `max-w-64` (256px),
  `bg #1c1e20`, `border 1px rgba(217,217,217,0.04)`, `rounded-xl`,
  `px-3 py-2`, `12/16 w400 #fff`, `z-100000`, `transition duration-200`,
  placed above the trigger. Copy is computed:
  _"Based on your volume of ~820 credits a month, Pro is the right fit.
  Calculated with regular quality and annual billing."_
- **Mini plan card**, 320 × 470, `rounded-[20px]`, `p-5`,
  `justify-between` — a condensed copy of §6: name + discount badge, tagline,
  a credits box with its own slider and tick buttons, the usage meter, three
  feature rows, the price row and the CTA block.
- **Usage meter** — label "Expected monthly usage"
  `12/16 w400 #898a8b`; value `N/M credits` `12/16 w400 #d1fe17`; track
  280 × 4 `bg rgba(255,255,255,0.1) rounded-md`; fill `#d1fe17`, width
  `usage / quota`. It **never overflows**: the recommender always picks a plan
  _and_ a credit tier whose quota ≥ usage, escalating Pro → Max and stepping
  the tier up as the sliders rise. There is no over-quota state to build.
- The card swaps with a 3D animation when the recommendation changes.
  `.pricing-fbp-card-perspective` sets `perspective: 72rem`;
  `.pricing-fbp-plan-swap` is `absolute inset-0`, `preserve-3d`,
  `backface-visibility: hidden`:

  ```
  enter: .42s cubic-bezier(.77,0,.175,1) both
         from opacity 0, translate3d(7rem,0,-2.5rem) rotateY(5deg) scale(.982)
  exit:  .42s cubic-bezier(.77,0,.175,1) both
         to   opacity 0, translate3d(-7rem,0,-2.5rem) rotateY(-5deg) scale(.982)
         (z-index 3, pointer-events none)
  ```

### 7.5 Panel footer controls

`flex gap-2 justify-center`, h 40.

- **Premium quality** — `button[role="switch"][aria-label="Toggle premium quality"]`,
  171 × 40, same shell as the billing toggle. Track `bg #5e636e` off /
  `#d1fe17` on; knob `left-0.5` → `left-3.5`, `transition-[left] 200ms ease-out`.
  Flipping it changes the video model the estimate is priced against:

  |     | Model                 | Credits each | 50 videos     |
  | --- | --------------------- | ------------ | ------------- |
  | Off | Kling 3.0, 8s 720p    | ≈14          | 700 credits   |
  | On  | Seedance 2.0, 8s 720p | ≈36          | 1,800 credits |

  A "Quality details" affordance sits beside it as `role="img" tabindex="0"` —
  rebuild as a real `button`.

- **Billing toggle** — a second instance of §5.2's switch, 223 × 40, wired to
  the same state as the page-level one.

---

## 8. Comparison table (`#pricing-comparison`)

`mt-20 scroll-mt-8`. Below `xl` it is a `bg-surface-tertiary rounded-t-2xl -mx-3 px-3 pt-5`
slab; at `xl` it goes transparent, square and flush (`xl:bg-transparent
xl:rounded-none xl:mx-0 xl:px-0`).

Header: `h2` "Compare features" `40/48 w600 -1.2px`; `p` "See in details what
plan suits you best" `14/20 w400 #898a8b`.

Frame: `border 1px rgba(255,255,255,0.06)`, `bg #0f1113`, `rounded-[20px]`.

**Layout is column-major, not row-major** — an outer `flex gap-0 px-6` holding
a `w-61` (244px) label column and three `flex-1` plan columns of 257px. Rows
line up because every cell is exactly `h-16` (64px) with
`border-b rgba(255,255,255,0.06)` and `flex flex-col items-start justify-center gap-1`.

**Sticky header row** — `sticky top-9` (36px), `z-20`, `bg #0f1113`,
`border-b`, `px-6`, `h-44.5` (178px). The label cell holds the billing
toggle: 184 × 40, `flex items-center gap-3`, `rounded-lg`,
`border 1px rgba(255,255,255,0.08)`, `px-2.5 py-1`, `backdrop-blur-md`, label
"Annual 30% OFF" `14/20 w600 #fff`. Each plan cell is
`flex flex-col items-center gap-4 py-4 px-2`: name, optional BEST VALUE badge,
`$N/month`, "Billed annually", and a `Get Plan` button.

**Collapsed by default.** Wrapper `max-height: 560px; overflow: clip;
transition: max-height .7s cubic-bezier(.4,0,.2,1)`. A fade mask sits over the
bottom: `absolute inset-x-0 bottom-0 h-60`, `z-10`, `pointer-events-none`,
`background: linear-gradient(180deg, rgba(15,17,19,0) 0%, rgba(15,17,19,1) 70%)`,
`transition-opacity duration-500`. Expanded → `max-height: none`, mask
`opacity: 0`, height ~1305px.

Toggle button: 152 × 48, transparent, `border-2 rgba(255,255,255,0.1)` →
hover `rgba(255,255,255,0.2)`, `rounded-xl`, `px-3`, `14/20 w600 #fff`,
`gap-2`, label **"Compare Features" ⇄ "Close Features"**.

**Per-section "View More".** Each category (Video, Image, Lipsync Studio,
Character, Credits & Usage, Access & Features) shows a few rows and hides the
rest. Hidden rows are `h-0 opacity-0 -translate-y-2`; revealed rows are
`h-16 opacity-100 translate-y-0`; `transition: all .5s ease-in-out`. The
trigger is itself a 244 × 64 row in the label column,
`cursor-pointer flex items-center gap-2 h-16 w-full text-start
transition-colors duration-200`, label **"View More" ⇄ "View Less"**.

Cell content is one of: a plan-specific count (`320 videos`, `10800 images`),
`N concurrent jobs`, `Included` / `Not included`, or a credit figure. Label
cells carry a name plus a `~N credits/5s` sub-line. This is a **data table,
not a layout** — model it as `pricing-comparison.constants.ts` (category →
rows → `{ label, sublabel, basic, pro, max }`) and render it generically; the
live table runs to ~150 model rows and will change independently of the
design.

Semantics: build it as a real `<table>` with `<th scope="row">` and
`<th scope="col">`, laid out with `display: grid` on the rows if the column
layout demands it. The live div-soup is not worth copying.

---

## 9. FAQ and closing CTA

### 9.1 FAQ

Centred stack, 640 wide, `gap-3`, heading `h4` "Frequently Asked Questions"
`36/44 w700 #fff`, section `pt-15 pb-10 gap-8`.

Each item is a **native `<details>`** — keep that. 640 × 60 closed,
`bg #131517`, `border 1px rgba(217,217,217,0.04)`, `rounded-lg`,
`py-4 px-5`.

- `<summary>` — `flex items-center justify-between`, `cursor-pointer`,
  `focus:outline-none` (replace with a real `focus-visible:` ring), question
  `18/26 w600 #fff`, 20px chevron `m6 9 6 6 6-6`.
- Open: chevron `rotate(180deg)`; body `overflow-hidden`, animating
  `height` and `opacity` (the live site drives these as inline styles from JS
  — prefer a CSS grid `0fr → 1fr` transition, which needs no measurement).
- Body copy `16/24 w400 #898a8b`, `py-4`, `white-space: pre-line`.
- Items are **independent, not exclusive** — several can be open at once.

Eight questions: credits, auto-renewal, generation counts, extra credits,
Unlimited, the 365 Unlimited promo, changing a subscription, Supercomputer
cost.

Above the FAQ sit two help links (`12/18 w400 #898a8b`, 12px external icon,
`target="_blank"`) — "How do Higgsfield plans work?" and "What are Unlimited
models?" — and the legal disclaimer (`12/18 w400 #898a8b`, centred, `px-2`)
about Unlimited availability, VAT and dynamic speed adjustment, with an inline
"Learn more".

### 9.2 Closing CTA

`hidden sm:flex gap-4 justify-center items-center`, h 40: "Are you ready?"
`14/20 w500 #fff` + a 139 × 40 brand button "Choose your plan"
(`bg #d1fe17`, `rounded-[10px]`, `14/20 w600 #131517`, key-cap shadow).

---

## 10. Mobile surface (< 768px)

**This is a different page, not a reflow.** At exactly `<768px` the app mounts
`.pricing-mobile-layout` and unmounts `.pricing-page` entirely. The switch is
a JS branch on a media query, not CSS — build it as a client component that
picks a tree, and render both server-side behind a `md:hidden` / `hidden md:block`
pair only if you can afford the duplicate markup; otherwise branch on a
`use-media-query` hook with the desktop tree as the SSR default.

The mobile tree also injects an inline `<style>` that hides the site chrome:

```css
#header,
#footer,
#header-mobile,
#header-promotion {
  display: none !important;
}
```

So it is a **full-bleed standalone offer page** with its own close affordance —
a paywall, not a marketing page. Reproduce by having the route set a layout
flag rather than by injecting `!important` CSS.

Root: `relative min-h-dvh bg-surface-tertiary overflow-x-clip`; content
`flex flex-col pb-28 w-full`; total height ≈ 4776px at 375 wide.

### 10.1 Top bar — `fixed top-0 inset-x-0 z-30`

h 48, `px-3 py-2`, `flex items-center justify-between`. A 32px circular close
button, `bg rgba(255,255,255,0.05)`, `backdrop-blur-md`, 16px ✕; a 32px
spacer opposite it to keep the (absent) title centred.

### 10.2 Hero — 375 × 280, `relative overflow-hidden`

Four layers:

1. `<video class="absolute inset-0 size-full object-cover">`, autoplay/muted/
   loop/playsinline.
2. Scrim `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)`.
3. Bottom glow, h 160:
   `radial-gradient(120% 100% at 50% 100%, rgba(180,40,120,0.45) 0%, rgba(140,30,100,…) …)`.
4. Content, `absolute inset-0 flex flex-col items-center justify-center pb-8
select-none`, `transition-[opacity,transform] duration-500 ease-in-out`:
   - Discount chip, 189 × 46: an SVG blob backing plate with the label
     `40/40 w700 -1.6px uppercase` Grotesk, ink `#131517`,
     `skew-x-[-10deg]`.
   - Headline `p`, `40/48 w700 -1.2px uppercase` Grotesk,
     `skew-x-[-10deg]`, white with the second word in `#d1fe17`.

### 10.3 Plan sheet — `selling-bg-stars`, `rounded-t-4xl`, `-mt-8`, `z-1`

`bg #0f1113`, 375 × 1207. Four blocks:

**a. Trustpilot strip** — `px-3 pt-5`, two 24px laurel glyphs flanking two
lines: `12/16 w500 #fff` / `12/16 w500 rgba(255,255,255,0.5)`.

**b. Plan picker** — `px-3 pt-6 gap-3`, three cards, single-select.

The offer differs from desktop: **Basic Monthly $5**, **Pro Annual $29→$23**
(default), **Pro Monthly $29**.

|               | Ribbon                                                  | Frame                                                                                                |
| ------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Basic Monthly | "Most Popular", lime strip, ink `#131517`, `12/16 w600` | `border 1px #d1fe17`, `radial-gradient(50% 20% at 50% 100%, rgba(209,254,23,0.2), …)`, `rounded-2xl` |
| Pro Annual    | "Best Value" + a skewed `21% OFF` pill                  | `radial-gradient(60% 50% at 100% 80%, rgba(255,0,91,0.4), rgba(255,0,91,0.1) …)`                     |
| Pro Monthly   | none                                                    | `bg #1c1e20`, `border 1px rgba(217,217,217,0.04)`                                                    |

Each card body is a `button`, `p-3`, holding:

- **Radio**, 24px. Unselected `size-6 rounded-full border-2` — `border-white/20`,
  or `border-primary/15` on the lime-framed card. Selected
  `flex size-6 items-center justify-center rounded-full bg-primary` with a dark
  ✓. _No ARIA on the live site_ — we add `role="radiogroup"` / `role="radio"`
  / `aria-checked` and arrow-key roving.
- Plan name and cadence; a right-aligned price block (`96 × 64`,
  `rounded-xl`, `px-3 py-2`) carrying the struck original above the current
  price.
- A 1px divider (`rgba(255,255,255,0.1)`, or lime-tinted on the lime card).
- A 3-item `<ul>`, `gap-1`, rows 20px.
- A **"Learn more"** chip, `absolute` bottom-right, 103 × 28,
  `border 1px rgba(255,255,255,0.1)`, `rounded-lg`, `px-2 py-1`,
  `12/18 w500 rgba(255,255,255,0.6)` + chevron. Toggling it expands the card
  (227 → 241px) with two extra rows and relabels to **"Hide"**.

Selecting a card retitles the fixed bottom CTA ("Get Pro Plan" / "Get Basic
Plan") and shows or hides its discount badge.

**c. Promo card** — 351 × 164, `bg #24438f` under a full-bleed `img`,
`border 1px rgba(255,255,255,0.08)`, `rounded-[20px]`, `p-4`, `gap-2`. Body
`14/20 w400 rgba(255,255,255,0.5)`; CTA 319 × 48, `bg #d1fe17`,
`rounded-[10px]`, `14/20 w600 #131517` — "Get access for $3".

**d. Disclaimer** — same copy as desktop, `12/18 w400 #898a8b`, centred,
`px-4 pt-4 mt-4`.

### 10.4 "What's included" — `px-3 pt-5 pb-10`, `gap-5`

A two-plan mini comparison, 351 wide:

- Label column 191px: header "What's included" `14/20 w500 #fff` in a 45px
  `py-3` cell, then ten 40px rows `14/20 w400 #898a8b`.
- Two 80px plan columns. "Basic" header `#fff`; **"Pro" header `#d1fe17` and
  the whole column tinted `rgba(209,254,23,0.05)` with `rounded-lg`** — the
  recommended column is highlighted as a vertical band.
- Rows: video/image parallel generations, Soul 2.0 free generations, Seedance
  2.5, Seedance 2.0, unlimited marketplace, 7-day unlimited Kling 3.0 /
  Nano Banana 2 / Nano Banana Pro, lowest cost per credit.

**"See full comparison"** — 351 × 40, `bg rgba(255,255,255,0.1)`,
`rounded-[10px]`, `14/16 w600 #fff`. Opens a **bottom sheet**:

```
fixed bottom-0 inset-x-0 z-1000 h-[90dvh]
bg #0f1113 rounded-t-[28px] overflow-hidden
animation: .2s forwards fade-in
role="dialog"  + a scrim behind it
```

Inside: a 32px circular close button `absolute top-4 left-4`,
`bg rgba(255,255,255,0.08)`, `border 1px rgba(217,217,217,0.04)`; then a
`py-16 px-3` scroller with ~4340px of grouped rows (`gap-6`) covering Basic /
Max / Team / Scale. Rebuild on `<dialog>` for the focus trap and Esc.

### 10.5 Story sections (×2)

Two near-identical blocks (`Seedance 2.5 / Nano Banana Pro / ElevenLabs`, and
"ONE CLICK TO CREATE CONTENT"):

- A 375 × 588 media panel, `rounded-[28px]` / `rounded-4xl`, `bg #0f1113`,
  with a bleeding `img` at `inset-[-15px]`, a flat `rgba(0,0,0,0.2)` scrim and
  a tinted gradient
  (`linear-gradient(rgba(13,47,183,0) 40.29%, rgba(0,26,130,0.6) 100%)` /
  `rgba(0,0,0,0.2) → rgba(0,0,0,0.75)`).
- **Progress dots**, `absolute top-6 inset-x-0 z-3`, h 10, `gap-1.5`. Active
  dot 10px `#fff`; inactive 6px `rgba(255,255,255,0.3)`;
  `transition .3s cubic-bezier(.4,0,.2,1)`. Three slides, **auto-advancing**,
  with crossfading content layers (`opacity 0` siblings).
- A card below at `-mt-23`, `px-2`, `z-2`: 359 wide, `rounded-3xl`,
  `background: linear-gradient(rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.16) 100%)`.

Reduced motion must stop the auto-advance and leave the dots controllable.

### 10.6 Testimonials — `py-8 gap-6`

`h2` "COMMUNITY OF / 25 MILLION CREATORS" — `32/40 w700 -1.28px uppercase`
Grotesk, the number in `#d1fe17`. Two 172px marquee rows, each
`w-[calc(100%+24px)]` so the items bleed past both edges.

### 10.7 Mobile FAQ — `px-3 py-12 gap-6`

`h2` `32/40 w700 -1.28px uppercase` Grotesk. Items are `div` + `button`
(**not** `<details>` as on desktop — unify on `<details>` in our build),
351 wide, `bg #1c1e20`, `border 1px rgba(217,217,217,0.04)`, `rounded-xl`,
`gap-2`. Trigger `p-3 gap-3`, question `14/20 **w700** #fff`, 20px chevron.
Body `14/20 w400 #898a8b`, `px-3 pb-3`, collapsed as `h-0 opacity-0`.

### 10.8 Fixed CTA bar — `fixed bottom-0 inset-x-0 z-30 pointer-events-none`

- Scrim, `absolute inset-x-0 bottom-0 h-30`,
  `linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 50%, transparent 100%)`.
- Bar `relative px-3 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]`.
- Button `pointer-events-auto`, 351 × 52, `rounded-2xl`, `gap-2`,
  `16/20 w600 #131517`,
  `linear-gradient(rgba(255,255,20,0) 0%, #ffff14 100%)` over `#d1fe17`,
  label tracking the selected plan, with the skewed `21% OFF` badge when the
  annual option is selected.

The page reserves room for it with `pb-28` on the content column.

---

## 11. Interaction state matrix

Everything below was observed by driving the live page, not inferred.

| Control                  | Rest                             | Hover                               | Press         | Selected / checked                                | Disabled                                     |
| ------------------------ | -------------------------------- | ----------------------------------- | ------------- | ------------------------------------------------- | -------------------------------------------- |
| Plan CTA                 | per-plan fill + key-cap shadow   | `brightness(1.1)`, 150ms            | —             | —                                                 | —                                            |
| Plan card frame          | gradient + hairline              | **no change**                       | —             | —                                                 | —                                            |
| Countdown banner         | —                                | overlay `bg rgba(255,255,255,0.03)` | —             | —                                                 | —                                            |
| Audience tab             | ink `#898a8b`                    | —                                   | —             | ink `#fff`, thumb slides 300ms                    | —                                            |
| Billing / quality switch | border `rgba(255,255,255,0.1)`   | —                                   | `opacity .88` | track `#d1fe17`, knob `translate-x-3`             | `cursor-not-allowed opacity-70`              |
| "Not sure which plan?"   | transparent                      | `bg rgba(255,255,255,0.05)`         | `opacity .88` | —                                                 | —                                            |
| Configurator option      | `bg rgba(255,255,255,0.05)`      | `translateY(-1px)`                  | `opacity .88` | `bg rgba(255,255,255,0.1)`, ink `#d1fe17`, lime ✓ | —                                            |
| Menu item                | transparent                      | `bg rgba(255,255,255,0.05)`         | —             | lime checkbox                                     | —                                            |
| "See why"                | `bg rgba(209,254,23,0.24)`       | `surface-brand-alpha-2`             | —             | tooltip after delay                               | —                                            |
| Slider tick              | ink `rgba(255,255,255,0.5)`      | —                                   | —             | ink `#fff`                                        | —                                            |
| Seat stepper ±           | ink `#fff`                       | —                                   | —             | —                                                 | `opacity-40 cursor-not-allowed` + `disabled` |
| "Compare Features"       | `border-2 rgba(255,255,255,0.1)` | `rgba(255,255,255,0.2)`             | —             | label → "Close Features"                          | —                                            |
| "View More"              | `#f7f7f8`                        | `transition-colors 200ms`           | —             | label → "View Less"                               | —                                            |
| FAQ summary              | chevron 0°                       | —                                   | —             | chevron 180°, body expands                        | —                                            |
| Mobile plan card         | `border rgba(217,217,217,0.04)`  | —                                   | —             | lime filled radio + ✓                             | —                                            |

**Focus.** The live site ships essentially no visible focus treatment — the
FAQ summary explicitly sets `focus:outline-none` with no replacement. Add a
consistent `focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-q-focus` on every interactive element. This is a
deviation and an improvement; it costs nothing visually at rest.

---

## 12. Motion

All of it, in one place. Respect `motion-reduce:` throughout — the live site
already ships the reduced-motion block, so honouring it is parity.

| What                     | Value                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Configurator shell enter | `.22s cubic-bezier(.215,.61,.355,1)` — `opacity 0→1, translateY(6px)→0`                                      |
| Step / soft enter        | `.18s`, same curve                                                                                           |
| Chip enter               | `.15s`, same curve                                                                                           |
| Dropdown enter           | `.16s`, same curve, `translateY(∓6px)→0`                                                                     |
| Plan swap                | `.42s cubic-bezier(.77,0,.175,1)`, 3D, `perspective: 72rem`                                                  |
| Slider slot expand       | `grid-template-rows 0fr→1fr` + `margin-top` `.22s cubic-bezier(.455,.03,.515,.955)`, `opacity .16s ease-out` |
| Slider fill / thumb      | `width` / `left` 150ms                                                                                       |
| Segmented thumb          | `transform` + `width` `.3s cubic-bezier(.4,0,.2,1)`                                                          |
| Switch track / knob      | 200ms `ease-out`                                                                                             |
| Switch badge reveal      | `max-width, opacity, padding, transform` 200ms `ease-out`                                                    |
| Button hover filter      | 150ms                                                                                                        |
| Comparison expand        | `max-height .7s cubic-bezier(.4,0,.2,1)`; mask `opacity .5s`                                                 |
| Comparison row reveal    | `all .5s ease-in-out` (`h-16 ⇄ h-0`, opacity, `-translate-y-2`)                                              |
| Mobile story dots        | `.3s cubic-bezier(.4,0,.2,1)`                                                                                |
| Bottom sheet             | `.2s forwards fade-in`                                                                                       |
| Press                    | `opacity .88`, instant                                                                                       |

Reduced motion (ship verbatim):

```css
@media (prefers-reduced-motion: reduce) {
  .pricing-slider-tick--active,
  .pricing-fbp-shell,
  .pricing-fbp-step,
  .pricing-fbp-soft-enter,
  .pricing-fbp-slider-card,
  .pricing-fbp-plan-swap,
  .pricing-fbp-chip,
  .pricing-fbp-dropdown--bottom,
  .pricing-fbp-dropdown--top {
    animation: none;
  }
  .pricing-fbp-shell *,
  .pricing-fbp-slider-slot,
  .pricing-fbp-dropdown {
    transition: none;
  }
}
```

---

## 13. Pricing data

Measured by driving every tick × every billing mode. This is the whole matrix;
put it in `src/config/pricing.constants.ts`, not in components.

### Individual

| Plan  | Tier | Credits     | Monthly         | Annual /mo | Annual badge | Annual saving                       | Monthly badge | NB Pro gens | Seedance 2.0 videos |
| ----- | ---- | ----------- | --------------- | ---------- | ------------ | ----------------------------------- | ------------- | ----------- | ------------------- |
| Basic | —    | 120 (fixed) | $9              | $9         | —            | "No difference compared to monthly" | —             | 60          | ~7 (2.0 Fast)       |
| Pro   | 1    | 600         | $29             | $23        | 21% OFF      | $72                                 | —             | 300         | ~27                 |
| Pro   | 2    | 900         | $43             | $34        | 21% OFF      | $108                                | —             | 450         | ~40                 |
| Max   | 1    | 1,800       | $79             | $59        | 25% OFF      | $240                                | —             | 900         | ~80                 |
| Max   | 2    | 3,600       | $158 → **$139** | $115       | 27% OFF      | $516                                | 12% OFF       | 1,800       | ~160                |
| Max   | 3    | 5,400       | $237 → **$199** | $165       | 30% OFF      | $864                                | 16% OFF       | 2,700       | ~240                |

Two non-obvious rules:

- **The discount badge percentage is per-tier, not per-plan.** MAX reads
  25% / 27% / 30% as the slider rises.
- **Monthly is not always undiscounted.** MAX tiers 2 and 3 carry an intro
  price in monthly mode, and the cadence line becomes
  _"Billed monthly, renews at $158"_. Pro never does.

### Business

| Plan       | Seats            | Credits/seat | Total at default | Monthly /seat | Annual /seat | Badge                | Saving |
| ---------- | ---------------- | ------------ | ---------------- | ------------- | ------------ | -------------------- | ------ |
| Team       | 2–9 (default 5)  | 1,000        | 5,000            | $79           | $65          | 18% OFF              | $168   |
| Scale      | 5–15 (default 5) | 2,500        | 12,500           | $215          | $150         | 30% OFF + Best value | $228   |
| Enterprise | custom           | custom       | —                | —             | —            | Experts' choice      | —      |

- Stepper: `aria-label="Decrease team size"` / `"Increase team size"`,
  `disabled` + `opacity-40 cursor-not-allowed` at each end. Shell 319 × 48,
  `bg rgba(255,255,255,0.05)`, `border 1px rgba(255,255,255,0.05)`,
  `rounded-xl`, `px-4 py-1.5`; value centred in a `w-[8ch]` column so the
  layout does not jump between "2 seats" and "15 seats".
- Card frames: Team `linear-gradient(#1f2022, #222420 55%, #272a20)` (olive);
  Scale `linear-gradient(#121d23, #152026 45%, #1d282e 75%, #273238)` (blue);
  Enterprise `linear-gradient(#1f2024, #232428 40%, #343539 75%, #48494d)`.
- CTAs: Team white; **Scale `#0256fe`** with
  `linear-gradient(rgba(255,255,255,0) 12%, rgba(255,255,255,0.16) 76%)` over
  it; Enterprise white, labelled "Contact sales".
- **Enterprise is inverted**: a white outer shell (`bg #fff`,
  `border 1px rgba(0,0,0,0.06)`, `shadow 0 8px 24px rgba(0,0,0,0.12)`,
  `rounded-2xl`) whose top strip carries the "Experts' choice" label, with the
  dark card inset inside it. It is the only light surface on the page.

### Configurator credit maths

```
videoCredits  = videos × (premium ? 36 : 14)
photoCredits  = photos × 2
usage         = videoCredits + photoCredits
plan          = cheapest plan+tier whose quota ≥ usage, subject to the
                minimum tier implied by any selected "from X Plan" feature
```

---

## 14. Files

```
src/app/(marketing)/pricing/
  page.tsx                         route; picks desktop vs mobile tree
src/components/pricing/
  countdown-banner.tsx
  audience-tabs.tsx                role=tablist + sliding thumb
  billing-switch.tsx               shared by page, panel and table
  plan-grid.tsx
  plan-card.tsx
  plan-card-header.tsx
  credit-slider.tsx                painted track + hidden range input
  unlimited-panel.tsx
  seedance-panel.tsx
  feature-list.tsx
  plan-cta.tsx                     key-cap shadow + brightness hover
  discount-badge.tsx               skewed chip w/ counter-skewed label
  business-grid.tsx
  seat-stepper.tsx
  enterprise-card.tsx
  find-best-plan/
    index.tsx
    step-shell.tsx                 numbered disc + connector
    audience-options.tsx
    volume-sliders.tsx
    tick-ruler.tsx                 the equaliser wave
    feature-menu.tsx               role=menu + menuitemcheckbox
    feature-chips.tsx
    recommendation-panel.tsx
    usage-meter.tsx
    plan-swap.tsx                  3D enter/exit
  comparison-table.tsx
  comparison-row.tsx
  faq-list.tsx                     <details>
  closing-cta.tsx
  mobile/
    layout.tsx
    hero.tsx
    plan-picker.tsx                radiogroup
    plan-option-card.tsx
    included-table.tsx
    comparison-sheet.tsx           <dialog>
    story-section.tsx
    testimonials.tsx
    sticky-cta.tsx
src/config/
  pricing.constants.ts             §13 matrices
  pricing-comparison.constants.ts  the ~150-row model table
src/hooks/
  use-animated-number.ts           number-flow replacement
```

---

## 15. Build order

1. Tokens + CLAUDE.md amendment (§2), fonts wired. Nothing renders yet.
2. `discount-badge`, `plan-cta`, `billing-switch` — the three primitives every
   section reuses. Get the skew, the counter-skew and the key-cap shadow right
   here and the rest follows.
3. Static plan card at one tier, annual, all three variants. Compare against
   the live card at 344px.
4. `pricing.constants.ts` + `credit-slider` + billing toggle → the whole §13
   matrix drives from data.
5. Business grid + seat stepper.
6. Comparison table from `pricing-comparison.constants.ts`, collapsed and
   expanded.
7. FAQ, disclaimer, closing CTA. Desktop surface complete.
8. Configurator: options → sliders → menu/chips → recommendation panel →
   plan-swap animation. Most complex piece; last on desktop.
9. Mobile tree (§10), in the order of §10.1–10.8.
10. Motion pass (§12) and focus pass (§11).

### Acceptance

- At 1728 × 906 and at 375 × 812, every measurement in this document
  reproduces within 1px.
- Toggling billing changes: prices, cadence copy, discount badges, the savings
  strip, card height, and the unlimited-model row count — all six.
- Each slider stop reproduces its row of §13, including the per-tier badge
  percentage and the monthly intro price on MAX.
- The configurator escalates Pro → Max and steps the tier as the sliders rise,
  and the usage meter never exceeds 100%.
- Every control is reachable and operable by keyboard with a visible focus
  ring — including the credit slider, which is not on the live site.
- `prefers-reduced-motion: reduce` stops the plan swap, the story auto-advance
  and the number roll.
