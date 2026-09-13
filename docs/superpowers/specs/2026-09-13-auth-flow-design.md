# Authentication — modal, store and mock API, 1:1 design spec

Target: the sign-in / sign-up dialog at `https://higgsfield.ai/`, opened from
the header's `Login` and `Sign up` buttons in an unauthenticated browser
context.

Every number below was measured off the live DOM (computed styles and
`getBoundingClientRect`) at a 1440 × 900 viewport unless stated otherwise, not
estimated from screenshots. The live site renders this dialog with Radix and
authenticates through Clerk — a `#clerk-captcha-modal` node sits at the foot of
every step. We rebuild the same surface in Next 16 against mock route handlers.
Parity is on **rendered output and interaction states**, not on their DOM,
class names or auth vendor.

---

## 1. Scope

In scope:

- the auth dialog: shell, media carousel, and all four steps;
- every hover / focus / checked / disabled / error state of the above;
- the auth module: types, validation, session, in-memory store, six mock API
  routes, a typed client service, and a React context;
- the surfaces that change with auth state: the site header, the `/ai/image`
  canvas, and the `/ai/video` pane's History tab.

Out of scope — named here so their absence is a decision, not an oversight:

- real OAuth. The provider buttons complete a session locally; no redirect,
  no popup, no token exchange.
- a database. The user store is a module-level `Map` that resets when the dev
  server restarts. The seeded mock user always returns.
- the code-entry and new-password screens that follow `Send code`. Not
  observable without a real inbox, so the reset flow stops at a confirmation.
- email delivery, rate limiting, CSRF tokens, and account deletion.
- the `SSO available on Scale and Enterprise plans` link target.

### 1.1 Not observable from an unauthenticated session

Recorded so the implementation makes a deliberate choice rather than an
accidental one.

| Unobservable                                  | Decision                                                                                                                                                                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The signed-in header                          | Replace `Login` / `Sign up` with a 32px avatar button opening a menu holding the display name, email, credit balance and `Sign out`. Reuses the repo's existing `Avatar` and `CreditMeter`. Inferred, not measured — mark the component with a comment saying so. |
| The signed-in `/ai/image` canvas              | Render the masonry the repo already builds from `FEED_ITEMS`. The signed-out hero is measured; the signed-in state is the surface `2026-09-13-ai-image-studio-design.md` already specced.                                                                         |
| A signed-in account with **zero** generations | Unchanged from the image-studio spec: composer only, no invented hero. This is a different state from signed-out, which _does_ get the hero — do not collapse the two.                                                                                            |
| The dialog's enter/exit transition            | The live node carries `style="opacity: 1; transform: none"`, the signature of a JS-driven enter. Use a 160ms fade plus `scale(0.98) → 1`, `--q-ease-pop`, disabled under `motion-reduce`.                                                                         |
| Server-side validation copy                   | Two messages only: `That email is already registered.` on signup conflict, `Wrong email or password.` on login failure. Never disclose which half was wrong.                                                                                                      |
| Post-`Send code` screens                      | Stop at a confirmation line. See §10.4.                                                                                                                                                                                                                           |

---

## 2. Behaviour, as observed

One dialog, four steps, two modes. `Login` and `Sign up` open the **same** root
screen — the only difference is the consent checkbox, which sign-up mode renders
and login mode omits entirely.

```
                 header "Sign up"          header "Login"
                       │                         │
                       ▼                         ▼
              root (consent shown)      root (no consent)
                       │                         │
     ┌─────────────────┼─────────────────┐       │
     │                 │                 │       │
  Google            Apple           Microsoft    │
  Continue with Email ──────────────────────┬────┘
                                            ▼
                 mode=signup ──▶ "Create an account"
                                     │
                                     └── "Log in" ──▶ "Log in to Higgsfield AI"
                 mode=login  ──▶ "Log in to Higgsfield AI"
                                     ├── "Sign up" ──▶ "Create an account"
                                     └── "Forgot password?" ──▶ "Reset Your Password"
```

Observed facts that are easy to get wrong:

- **No URL change.** The dialog never touches the address bar. `location.href`
  stayed `https://higgsfield.ai/` across every step. It is not a route.
- **The lime `Sign up and get an additional discount` strip is a `<div>`, not a
  button.** It is a notice. Nothing happens when you click it.
- **Back pops one step and returns to the root**, not to the previous mode. From
  `Log in to Higgsfield AI` (reached via the `Log in` link on the signup step)
  back lands on the signup root with the consent checkbox **reset to unchecked**.
- **Escape closes the dialog** from any step.
- The consent gate blocks every provider button, not just email.
- The carousel keeps running across step changes and resets to slide 1 when the
  dialog is reopened.

---

## 3. Tokens

The repo's studio layer (`src/styles/tokens/q-studio.css`) already holds this
dialog's values verbatim — the live auth modal and the live generation pages are
the same design system. Confirmed identical:

| Live token                                      | Live value              | Repo token                    |
| ----------------------------------------------- | ----------------------- | ----------------------------- |
| `--color-page-primary`                          | `#131517`               | `--q-bg-primary`              |
| `--color-separator-card`                        | `rgba(217,217,217,.04)` | `--q-border-card`             |
| `--color-font-secondary`                        | `#898a8b`               | `--q-text-muted`              |
| `--color-font-primary`                          | `#ffffff`               | `--q-text-primary`            |
| body text colour                                | `#f7f7f8`               | `--q-text-body`               |
| `--color-lime` / `--color-primary`              | `#d1fe17`               | `--q-brand`                   |
| `--color-neutral-subtle`                        | `#1b1b1b`               | `--q-bg-modal`                |
| disabled button fill / ink                      | `#292b2c` / `#737475`   | `--q-btn-disabled-bg` / `-fg` |
| `rounded-xl` / `rounded-[20px]` / `rounded-3xl` | 12 / 20 / 24px          | `--q-r-300` / `-500` / `-600` |
| body face                                       | Inter                   | `--font-inter`                |
| display face                                    | Space Grotesk           | `--font-space-grotesk`        |

Four values have no home yet. Add them to `q-studio.css` and project them in
`globals.css`:

```css
--q-divider: rgba(
  255,
  255,
  255,
  0.08
); /* the SSO footer's top rule, #ffffff14 */
--q-btn-solid: #1f2228; /* email submit at rest */
--q-scrim: rgba(0, 0, 0, 0.8); /* the dialog's backdrop */
--q-shadow-dialog: inset 0 0 32px rgba(0, 0, 0, 0.2);
```

`--q-bg-secondary-strong` (`#23262a`) is already the right hover step for
`--q-btn-solid`; do not add a second token for it.

Project the four in `globals.css` as `--color-q-divider`, `--color-q-solid`,
`--color-q-scrim` and `--shadow-q-dialog`.

**The variable names and the utility names are not the same**, and two of them
cross over in a way that silently produces the wrong colour:

| Variable                      | Value                   | Utility                                |
| ----------------------------- | ----------------------- | -------------------------------------- |
| `--q-bg-primary`              | `#131517`               | `bg-q-panel`                           |
| `--q-border-card`             | `rgba(217,217,217,.04)` | `border-q-hairline`                    |
| `--q-text-primary`            | `#ffffff`               | `text-q-fg`                            |
| `--q-text-body`               | `#f7f7f8`               | `text-q-body`                          |
| `--q-text-muted`              | `#898a8b`               | **`text-q-soft`**                      |
| `--q-text-secondary`          | `#828282`               | **`text-q-muted`**                     |
| `--q-brand`                   | `#d1fe17`               | `bg-q-accent` / `text-q-brand`         |
| `--q-bg-secondary-strong`     | `#23262a`               | `bg-q-card-strong`                     |
| `--q-btn-disabled-bg` / `-fg` | `#292b2c` / `#737475`   | `bg-q-disabled` / `text-q-disabled-fg` |

Every `--q-text-muted` in this spec means `#898a8b`, which is written
`text-q-soft`. Writing `text-q-muted` gets you `#828282` — close enough to look
plausible and wrong against the live surface.

Type scale, measured:

| Role            | Size / line       | Weight               | Colour                                      |
| --------------- | ----------------- | -------------------- | ------------------------------------------- |
| Step heading    | 30 / 36           | 600                  | `--q-text-body`                             |
| Step subtitle   | 14 / 20           | 400                  | `--q-text-muted`                            |
| Provider button | 14 / 20           | 600                  | `--q-text-body`                             |
| Promo strip     | 14 / 20           | 500                  | `--q-brand`                                 |
| `OR`            | 12                | 400                  | `#737475`                                   |
| Consent copy    | 12 / 16           | 400                  | `--q-text-primary`                          |
| Consent error   | 12 / 16           | 400                  | `--q-brand`                                 |
| Input / submit  | 16 / 24           | 500                  | secondary at rest, `--q-text-body` on focus |
| SSO footer      | 14                | 500                  | `--q-text-muted`                            |
| Carousel title  | 40 / 48, `-0.8px` | 700                  | `#ffffff`, uppercase, Space Grotesk         |
| Carousel body   | 14 / 20           | 400                  | `rgba(255,255,255,.5)`                      |
| Carousel badge  | 10 / 14           | 600                  | `#ffffff`                                   |
| Carousel label  | 12 / 18           | 400 idle, 500 active | `white/40` → `#ffffff`                      |

### 3.1 CLAUDE.md amendment

The "Which token layer" section currently scopes the studio layer to
`src/app/(studio)/` and `src/components/studio/`. Auth is a third consumer —
it is the same live design system, and rebuilding it on the marketing ramp
would put Archivo and a different neutral scale on a surface that must match
1:1. Amend that paragraph to read:

> Used only under `src/app/(studio)/`, `src/components/studio/` and
> `src/features/auth/`.

The rule it protects is unchanged: never mix the two layers inside one
component. The auth dialog uses `q-` utilities exclusively, including where it
is mounted from marketing chrome.

---

## 4. The dialog shell

```
fixed · inset-0 · m-auto            ← centred by auto margins, not a flex parent
z-3002 over a z-3001 scrim
display: flex, row
overflow: hidden
background  --q-bg-primary
border      1px --q-border-card
shadow      --q-shadow-dialog
radius      20px, 24px at md
```

Geometry, three breakpoints:

|              | width                        | height                            | cap                                                       |
| ------------ | ---------------------------- | --------------------------------- | --------------------------------------------------------- |
| base         | `calc(100% - 24px)`, max 352 | 620                               | `max-h: calc(100dvh - 24px)`                              |
| `md` (≥768)  | 560                          | 700                               | `max-h: calc(100dvh - 48px)`, `max-w: calc(100vw - 48px)` |
| `xl` (≥1280) | 1120                         | `min(720px, calc(100dvh - 64px))` | `max-w: calc(100vw - 64px)`                               |

The scrim is `rgba(0,0,0,.8)` with **no** blur.

### 4.1 Use the platform

Build on the native `<dialog>` element with `showModal()`, as
`src/components/overlays/dialog.tsx` already does. It gives a focus trap,
Escape-to-close, an inert background and `::backdrop` for free. The live
implementation sets `body { pointer-events: none }` to fake inertness — a Radix
artifact we do not need and should not copy.

`::backdrop` cannot be a Tailwind utility on the element, so the scrim is
`backdrop:bg-q-scrim`. Because `<dialog>` is centred by the UA, drop the
`fixed inset-0 m-auto` triple and let `showModal()` position it.

### 4.2 Close and back buttons

Identical geometry, mirrored.

```
size-7, md:size-8            28px → 32px
rounded-2xl                  16px
bg white/5, border 1px white/4
hover bg white/10
icon 16px, white
top-3 right-3 · md:top-5 md:right-5     (close)
top-3 left-3  · md:top-5 md:left-5      (back)
```

At `xl` the back button moves to `left-[calc(50%+1.25rem)]` so it sits inside
the form column rather than over the media panel. The back button renders only
when the step stack is non-empty.

---

## 5. The media carousel

`hidden xl:block w-1/2 min-h-0 p-2 pr-0` — below 1280px the panel does not
render at all, and the dialog is a single column. Inside: `h-full rounded-xl
overflow-hidden`, then a black, full-bleed slide track.

Four slides, **5 seconds each**, advancing on a linear timer and wrapping. The
progress fill measured 60.274% after 3.002s, giving 4.98s per slide.

| #   | Kind  | Badges                                 | Title              | Body                                                                         |
| --- | ----- | -------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| 1   | video | `4K Resolution`                        | SEEDANCE 2.0 4K    | The world's most capable video model at full 4K                              |
| 2   | image | `4K Resolution`                        | NANO BANANA PRO 4K | The best image model, for the best price in the industry, only on Higgsfield |
| 3   | image | `2K Quality`, `Prompt Enhancer`        | HIGGSFIELD SOUL    | Create consistent characters across images and videos for storytelling       |
| 4   | video | `Cinematic Motion`, `Film-grade Shots` | CINEMA STUDIO      | Turn images into cinematic shots with motion and transitions                 |

Sources, to live in `src/config/auth.ts` alongside the rest of the auth
constants. `static.higgsfield.ai` is already allow-listed in `next.config.ts`,
and `src/config/media.ts` establishes the precedent of serving real Higgsfield
media from their CDN rather than vendoring binaries:

```
1  https://static.higgsfield.ai/auth/seedance.mp4
2  https://static.higgsfield.ai/quiz-v2/auth-1.webp
3  https://static.higgsfield.ai/quiz-v2/auth-3.png
4  https://static.higgsfield.ai/quiz-v2/auth-5-mini.mp4
```

Videos are `autoplay loop playsinline disablepictureinpicture preload="none"`
and carry the slide title as `aria-label`. Every slide is overlaid with
`bg-gradient-to-b from-transparent via-black/20 to-black/80`.

The caption block is `absolute bottom-0 inset-x-0 p-5 flex flex-col gap-8`:

- badges — `inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]
font-semibold leading-3.5 bg-white/10 text-white backdrop-blur-lg`, 16px icon;
- title and body in a `gap-1.5` column;
- the control block, `flex flex-col gap-2`.

The control block is two rows of four, each `flex gap-1`:

- **progress** — `flex-1 min-w-0 h-1 rounded-full bg-white/20 overflow-hidden`
  wrapping `h-full bg-white rounded-full` whose width runs 0 → 100%. Passed
  slides sit at 100%, upcoming at 0%.
- **labels** — `flex-1 min-w-0 text-left text-xs leading-4.5 truncate`;
  `font-normal text-white/40 hover:text-white/60` idle, `font-medium text-white`
  active: `Seedance 2.0 4K`, `Nano Banana Pro`, `Higgsfield Soul`, `Cinematic App`.

Both rows are `<button>`s and both jump to that slide. Note the labels differ
from the titles — `Cinematic App` labels the `CINEMA STUDIO` slide.

Under `motion-reduce`, hold slide 1 and render all four progress bars empty;
the labels still switch slides on click.

---

## 6. The form column

`flex-1 flex flex-col items-center overflow-y-auto` with a hidden scrollbar.
Padding `20px 24px`, `32px 88px` at `md`.

### 6.1 Header

`mb-6 md:mb-10 flex flex-col text-center w-full gap-4`:

- a 32px logo mark, `rx=16`, filled `currentColor` at `--q-brand`;
- a `gap-3` column holding the step heading (30/36, 600) and subtitle (14/20,
  `--q-text-muted`).

| Step   | Heading                 | Subtitle                                    |
| ------ | ----------------------- | ------------------------------------------- |
| root   | Welcome to Higgsfield   | Sign up and generate for free               |
| signup | Create an account       | Sign up and generate for free               |
| login  | Log in to Higgsfield AI | Enter your account and continue creating    |
| reset  | Reset Your Password     | _(none — the subtitle is omitted entirely)_ |

### 6.2 Promo strip — root only

```
flex items-center justify-center gap-2.5
rounded-xl p-3
bg-lime/10 · text-sm font-medium · text-lime
20px gift icon, shrink-0
```

A `<div>`. Not focusable, not clickable.

### 6.3 Provider buttons

Three in a `flex flex-col gap-3` group, then the `OR` rule, then the email
button — the email button is a **sibling of the group, not a member of it**, so
the gap above it comes from the parent's `gap-3`, not the group's.

```
py-3.5 md:py-5              → 54px, 62px at md
rounded-xl                  12px
flex gap-2 items-center justify-center
text-sm font-semibold       14 / 20
border 1px white/10 → hover solid white
background transparent
transition
20px brand mark, then the label
```

Labels: `Continue with Google`, `Continue with Apple`, `Continue with Microsoft`,
`Continue with Email`.

The hover is a **border** change only — no fill, no lift. Add
`focus-visible:` parity with the hover state; the live buttons have no visible
focus ring, which is a defect we should not reproduce.

Brand marks are inline SVG in `src/features/auth/provider-mark.tsx`: Google's
four-colour G, Apple's monochrome mark, Microsoft's four-square. `lucide-react`
carries no vendor logos. The existing `auth-gate.tsx` substitutes neutral
glyphs, reasoning that reproducing a trademark on a button that does not
authenticate would be wrong — that reasoning expires here, because these
buttons now authenticate. Using a provider's mark to label its own sign-in
button is the intended, conventional use.

### 6.4 The `OR` rule

`flex justify-center items-center w-full` around a `text-xs text-center` span at
`#737475`. There are no rules either side — it is bare text.

### 6.5 Consent — sign-up mode only

```html
<label
  class="flex w-full cursor-pointer items-center gap-3 max-md:rounded-xl max-md:border max-md:border-white/10 max-md:p-3"
>
  <input type="checkbox" class="peer sr-only" />
  <span
    class="flex size-4.5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-white/10 transition peer-checked:border-0 peer-checked:bg-q-accent"
  >
    <!-- 12px tick, stroke --q-bg-modal, only visible when checked -->
  </span>
  <span class="min-w-0 flex-1 text-left text-xs leading-4 text-white">…</span>
</label>
```

A real visually-hidden `<input>` driving a `peer-checked:` sibling — which is
both what the live site does and what `CLAUDE.md` requires. Do not reach for
`useState`.

Copy, with two `target="_blank"` links in `font-medium underline`:

> I agree to the [Terms of Use](/terms-of-use-agreement), acknowledge the
> [Privacy Policy](/privacy-policy), and confirm I'm at least 18 years old.

Below it, **always rendered**, a `text-xs leading-4 text-lime` paragraph:

> \* Please agree to the Terms of Use to continue

It carries `invisible` and `aria-hidden="true"` at rest; on a blocked submit it
drops `invisible`, flips to `aria-hidden="false"`, and the label gains
`animate-attention-shake`. Checking the box clears all three.

Below 768px the label becomes a bordered card (`p-3`, `rounded-xl`, 1px
`white/10`) so the hit target is the full row.

`attention-shake` is not in the repo. Add to `q-studio.css`:

```css
@keyframes q-attention-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-4px);
  }
  40%,
  80% {
    transform: translateX(4px);
  }
}
.animate-q-attention-shake {
  animation: q-attention-shake 0.4s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .animate-q-attention-shake {
    animation: none;
  }
}
```

### 6.6 SSO footer — root only

```
flex items-center justify-center gap-1.5
pt-4 mt-3 border-t 1px --q-divider
18px cloud icon at --q-text-muted, stroke-width 2
text-sm font-medium --q-text-muted
```

> SSO available on <u>Scale and Enterprise</u> plans

The underlined span is a `<button>` on the live site and goes nowhere
observable. Render it as a link to `/pricing` — the closest honest destination
this clone owns.

---

## 7. Email steps

Both the signup and login steps share one form shell.

```html
<form novalidate>
  <fieldset
    class="relative flex w-full flex-col gap-3 disabled:animate-pulse disabled:cursor-wait"
  ></fieldset>
</form>
```

Disabling the `<fieldset>` during submit is the whole loading state — it greys
and pulses the entire group and blocks input, with no spinner anywhere. Reuse
it rather than inventing one.

Each field is `grid grid-rows-[0_auto_auto]`: a zero-height row holding a
visually-hidden `<label>` (`invisible opacity-0` — present for screen readers,
collapsed for layout), the input, and a reserved auto row for its error. The
reserved row is why an appearing error does not shift the form.

Input:

```
w-full h-13 px-4          52px tall
rounded-xl                12px
border-2 white/10 → focus solid white
bg transparent
text-base font-medium     16 / 24
placeholder + rest ink    secondary
focus ink                 --q-text-body
```

Note `border-2`, not `border`. The inputs are twice the weight of the provider
buttons, and getting this wrong is visible at a glance.

Submit is an `<input type="submit">` styled as a button:

```
h-13 w-full rounded-xl
bg --q-btn-solid           #1f2228
hover / focus-visible      --q-bg-secondary-strong
disabled                   --q-btn-disabled-bg on --q-btn-disabled-fg
text-base font-medium      16 / 24, --q-text-body
```

| Step   | Fields                           | Submit value          | Footer                                                                                                                                           |
| ------ | -------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| signup | `email` (type=email), `password` | `Continue with Email` | `mt-4`, centred, `text-xs md:text-sm` muted: `Already have an account?` + `Log in` button in `text-font-primary underline`                       |
| login  | `email`, `password`              | `Log in`              | `mt-4 flex items-center justify-between`: `Forgot password?` (muted, `hover:text-font-primary`) left, `Don't have an account?` + `Sign up` right |
| reset  | `email` only                     | `Send code`           | none                                                                                                                                             |

Placeholders are `Email` and `Password`; both inputs are `required`.

---

## 8. Auth module

```
src/
  types/auth.types.ts              User · Session · AuthError · Provider
  config/auth.ts                   seed user, cookie name, TTL, providers, slides
  lib/auth/validate.ts             pure — email shape, password rules
  lib/auth/identity.ts             pure — display name and avatar hue from email
  server/auth/store.server.ts      "server-only" — in-memory user Map
  server/auth/session.server.ts    "server-only" — token sign/verify, cookie io
  app/api/auth/signup/route.ts
  app/api/auth/login/route.ts
  app/api/auth/oauth/route.ts
  app/api/auth/logout/route.ts
  app/api/auth/me/route.ts
  app/api/auth/reset/route.ts
  services/auth-client.ts          typed fetch wrappers
  features/auth/
    auth-context.tsx               "use client" — AuthProvider, useAuth
    auth-dialog.tsx                the <dialog> shell and step router
    auth-media.tsx                 the xl carousel
    provider-mark.tsx              Google · Apple · Microsoft marks
    steps/root.tsx
    steps/email-signup.tsx
    steps/email-login.tsx
    steps/reset.tsx
```

This respects the repo's layering: `lib/` stays pure and trivially testable,
`services/` owns the network calls, `server/` is `import "server-only"` so it
can never reach the client bundle, `app/` is routing only, and `features/auth/`
is the vertical slice that owns its own components. No barrel files — import
concrete paths.

### 8.1 Types

```ts
export type Provider = "google" | "apple" | "microsoft" | "email";

export interface User {
  id: string;
  email: string;
  name: string;
  provider: Provider;
  credits: number;
  createdAt: string; // ISO 8601
}

export interface AuthErrorBody {
  error: string; // shown to the user verbatim
  field?: "email" | "password";
}
```

`credits` exists so the header menu can render the repo's `CreditMeter`. Seed
new accounts with 25.

### 8.2 Store

A module-level `Map<string, StoredUser>` keyed by lowercased email, seeded at
import with the mock user. `StoredUser` is `User` plus a `password` field that
never crosses the module boundary — the routes return `User`, never `StoredUser`.

Seed, in `config/auth.ts`:

```ts
export const MOCK_USER = {
  email: "demo@higgsfield.ai",
  password: "demo1234",
  name: "Demo Creator",
  credits: 250,
};
```

Passwords are compared in plain text. That is correct for a mock with no
database and no real accounts, and the module carries a comment saying so, so
nobody later mistakes it for an oversight worth "fixing" with a hash that
protects nothing.

The store resets on server restart. Accounts created during a session survive
hot reloads but not a restart; the seeded user always returns.

### 8.3 Session

An opaque token: `base64url(JSON.stringify({ sub, iat, exp }))` joined to an
HMAC-SHA256 of that payload using `process.env.AUTH_SECRET ?? "dev-only-secret"`,
via `node:crypto`. Verification checks the signature in constant time and then
the expiry.

Cookie:

```ts
cookieStore.set(SESSION_COOKIE, token, {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
});
```

`cookies()` is async in Next 16 — `const cookieStore = await cookies()` in every
route handler and in the layout. `readSession()` returns `User | null` and is
safe to call from a server component.

### 8.4 Routes

All accept and return JSON. All are `POST` except `me`.

| Route              | Body                  | Success                       | Failure                                                        |
| ------------------ | --------------------- | ----------------------------- | -------------------------------------------------------------- |
| `/api/auth/signup` | `{ email, password }` | `201 { user }` + cookie       | `400` invalid shape, `409` `That email is already registered.` |
| `/api/auth/login`  | `{ email, password }` | `200 { user }` + cookie       | `401` `Wrong email or password.`                               |
| `/api/auth/oauth`  | `{ provider }`        | `200 { user }` + cookie       | `400` unknown provider                                         |
| `/api/auth/logout` | —                     | `204` + cleared cookie        | —                                                              |
| `/api/auth/me`     | — (GET)               | `200 { user }`                | `401 { user: null }`                                           |
| `/api/auth/reset`  | `{ email }`           | `200 { ok: true }` **always** | `400` only on malformed email                                  |

`/api/auth/oauth` is the one-click path the brief asks for: it takes a provider,
finds-or-creates a deterministic mock identity for it
(`demo.google@higgsfield.ai`, `Google Creator`, and so on), opens a session and
returns. No redirect, no popup, no state parameter.

`/api/auth/reset` returns `200` whether or not the address exists. Telling a
caller which emails are registered is an enumeration oracle, and the habit is
worth keeping even in a demo.

Every handler sleeps 400–600ms before responding, so the disabled-fieldset
loading state is actually visible. Put the delay behind one named helper in
`config/auth.ts` rather than scattering literals.

### 8.5 Validation

`lib/auth/validate.ts` is pure and shared by client and server:

- `isValidEmail(value)` — a single pragmatic regex; anything with a local part,
  an `@`, a dotted domain and no whitespace passes. Per the brief, **any valid
  email signs up.**
- `passwordIssue(value)` — `null`, or `Password must be at least 8 characters.`

The client checks before fetching to save a round trip; the server checks again
because a client check is not a control.

### 8.6 Context

```ts
interface AuthValue {
  user: User | null;
  status: "idle" | "pending";
  openAuth: (mode?: "signup" | "login") => void;
  closeAuth: () => void;
  signIn: (provider: Provider) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  logInWithEmail: (email: string, password: string) => Promise<User>;
  requestReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

`AuthProvider` lives in the root layout and takes `initialUser` read server-side
from the cookie, so the first paint is already correct and the header never
flashes signed-out. It owns the dialog's open state and mode; the dialog itself
is rendered once, by the provider.

State is a `useReducer` — `user`, `status`, `open`, `mode`, `step`. The step
stack is a plain array so back is a pop.

After `signIn` / `signUp` / `logIn` / `signOut`, call `router.refresh()` so
server components re-read the cookie.

---

## 9. Where auth state shows

No middleware. No protected routes. Signed out, every route stays reachable and
renders its default state — this matches the live site, which serves
`/ai/image` and `/ai/video` to anonymous visitors.

### 9.1 Header

`src/components/marketing/site-header.tsx` currently renders `Login` and
`Sign up` as `<Link href="/">` — dead links. They become `<button>`s calling
`openAuth("login")` and `openAuth("signup")`. Keep the existing `BUTTON` class
string and both compact-header transitions untouched.

Signed in, the pair is replaced by a single 32px avatar button opening a menu
with the display name, email, a `CreditMeter`, and `Sign out`. Built on the
repo's existing `Dropdown`. Inferred, not measured — §1.1.

### 9.2 `/ai/image` — the signed-out hero

This is the real behavioural bug in the current build: `ImageFeed` renders
`FEED_ITEMS` unconditionally, so a signed-out visitor sees somebody else's
generations. Live, the feed is replaced by a hero.

Container, sized so the composer clears it:

```
relative w-full h-[calc(100%-244px)]
flex flex-col items-center justify-center
gap-[clamp(16px,3vh,40px)] px-4
```

244px is the live composer's reserved height. Measure ours and use that number;
do not copy 244 blindly.

Inside, `flex flex-col gap-[clamp(12px,2.5vh,32px)] items-center w-full relative`
holding three children:

1. **The glow.** The card cluster again, `absolute left-1/2 -translate-x-1/2
top-0 blur-[32px] opacity-40`. Same markup as (2) — the live site renders the
   cluster twice, once blurred behind and once sharp in front. Mark it
   `aria-hidden`.
2. **The cluster**, `flex items-center isolate`. Four cards, each
   `size-[clamp(64px,min(12vw,16vh),172px)]`, overlapping by
   `-mr-[clamp(16px,min(1.5vw,2vh),36px)]` except the last, descending
   `z-index` 4 → 1:

   | #   | rotation                  | shape          | border                                 |
   | --- | ------------------------- | -------------- | -------------------------------------- |
   | 1   | `-rotate-10`              | `rounded-xl`   | `border-3 xl:border-4 border-white/30` |
   | 2   | `rotate-4`                | `rounded-xl`   | none                                   |
   | 3   | `rotate-180 -scale-y-100` | `rounded-full` | `border-3 xl:border-4 border-white/30` |
   | 4   | `-rotate-4`               | `rounded-xl`   | `border-3 xl:border-4 border-white/30` |

   Shadow on all four:
   `0 0.3px 0.3px -0.15px rgba(0,0,0,.03), 0 0.9px 0.9px -0.45px rgba(0,0,0,.03)`.
   Sources are `…/image/empty-state/soul-cinematic-{1,2,3,4}.webp` behind the
   same `cdn-cgi` transform `src/config/media.ts` already builds.

3. **The text**, `flex flex-col items-center text-center` wrapping a
   `flex flex-col gap-2`:
   - a `font-grotesk font-bold uppercase leading-[1] tracking-[-0.56px]
text-[clamp(20px,min(3vw,4.5vh),36px)]` block holding two paragraphs —
     `Start creating with` in white, then `Higgsfield Soul Cinema` in
     `--q-brand`;
   - `Describe a scene, character, mood, or style — and watch it come to life`
     at `text-sm xl:text-base` in `--q-text-muted`.

An `<aside>` may float at `top-0`, centred, `z-10`: a pill
(`rounded-q-full bg-q-card-strong p-2.5`) with a 38px circled icon (`gap-3`),
`Don't know where to start?` over `Go to the Academy and start your journey`, a
`Learn now` link and a close button. It animates in from `translateY(-40px)`
and was absent on a later load, so it is dismissible and probably
frequency-capped. Build it dismissible, client-side only, and do not persist
the dismissal.

Signed in, all of the above is replaced by the existing masonry.

### 9.3 `/ai/video` — the History tab

`src/components/studio/history-panel.tsx` renders an empty `<div>` and its
comment claims the live studio leaves the surface blank when signed out. That is
wrong, and verified so: with `History` selected and no session, the pane renders
a 640 × 558 onboarding section; switching to `How it works` unmounts it.

```html
<section class="px-8 py-24 flex flex-col self-start w-full">
  <header class="mb-8">
    <h1 …>Make videos in one click</h1>          <!-- 40/48, 700, -4%, uppercase, Space Grotesk, --q-text-body -->
    <p  …>250+ presets for camera control, framing, and high-quality VFX -
          or use the general preset for manual control.</p>   <!-- 14/20, --q-text-muted -->
  </header>
  <div class="grid grid-cols-3 gap-10"> … three <article> … </div>
</section>
```

Each `<article>` is a `rounded-2xl` figure at `aspect-ratio: 1.31646`, then a
20/28, 700, `-4%` uppercase Space Grotesk `<h2>` with `mb-2`, then 14/20 muted
body:

| Figure              | Heading       | Body                                                |
| ------------------- | ------------- | --------------------------------------------------- |
| still               | Add image     | Upload or generate an image to start your animation |
| `…/feed/step-2.mp4` | Choose preset | Pick a preset to control your image movement        |
| `…/feed/step-3.mp4` | Get video     | Click generate to create your final animated video! |

Correct the component's comment along with its markup.

### 9.4 Generate

`GenjutsuStudio` holds a `gate` boolean and renders `AuthGate`. Both go. The
Generate handler becomes: signed in, generate; signed out, `openAuth("signup")`.

**Delete `src/components/studio/auth-gate.tsx`.** It is a disabled placeholder
for exactly this dialog, and leaving it would give the repo two auth modals with
different tokens, different copy and different behaviour.

---

## 10. Interaction and accessibility

### 10.1 Focus

`showModal()` traps focus. On open, move it to the dialog container
(`tabIndex={-1}`), not to the first provider button — autofocusing a button
makes a screen reader announce "Continue with Google" before the heading. On
close, the native element restores focus to the opener.

On the email steps, focus the first input on mount: the user chose to type.

### 10.2 Labelling

`aria-labelledby` points at the step heading, `aria-describedby` at the
subtitle. Both ids change with the step, so the dialog re-announces.

### 10.3 The consent gate

Blocked submits do not move focus. The error paragraph is the input's
`aria-describedby` target and flips `aria-hidden`, so it is announced when it
appears. Give the checkbox `aria-invalid` while blocked.

### 10.4 Reset confirmation

After a `200` from `/api/auth/reset`, replace the form with a centred line —

> If that address has an account, we've sent a code to **{email}**.

— and a `Back to log in` button. This is where the observed flow ends, and the
copy is deliberately non-committal for the enumeration reason in §8.4.

### 10.5 Motion

Everything that animates carries `motion-reduce:`. That covers the dialog
enter, the carousel, the attention shake and the `animate-pulse` on the
submitting fieldset.

---

## 11. Files

**Added** — 21 files under `types/`, `config/`, `lib/auth/`, `server/auth/`,
`app/api/auth/`, `services/`, and `features/auth/` as listed in §8.

**Changed**

| File                                        | Change                                               |
| ------------------------------------------- | ---------------------------------------------------- |
| `src/app/layout.tsx`                        | read the session, wrap in `AuthProvider initialUser` |
| `src/components/marketing/site-header.tsx`  | dead links → modal triggers; signed-in avatar menu   |
| `src/components/feed/image-feed.tsx`        | branch on `useAuth().user`                           |
| `src/components/studio/history-panel.tsx`   | build the onboarding section; fix the comment        |
| `src/components/studio/genjutsu-studio.tsx` | drop `gate` state; Generate calls `openAuth`         |
| `src/styles/tokens/q-studio.css`            | four tokens, the shake keyframe                      |
| `src/app/globals.css`                       | project the four tokens                              |
| `CLAUDE.md`                                 | name `features/auth/` as a studio-layer consumer     |

**Deleted** — `src/components/studio/auth-gate.tsx`.

**Added** — `src/components/feed/studio-empty-state.tsx` for §9.2.

---

## 12. Testing

The repo has no test runner. Until one lands, verification is the `pnpm check`
gate plus a scripted manual pass:

1. Signed out, `/` — header shows `Login` / `Sign up`.
2. `Sign up` → consent visible. `Login` → consent absent. Same root otherwise.
3. Click every provider button with consent unchecked — all four blocked, lime
   error visible, label shakes.
4. Check consent, click `Continue with Google` — signed in, dialog closes,
   header shows the avatar.
5. Reload — still signed in, and the header does **not** flash signed-out.
6. Sign out, `Sign up` → `Continue with Email` → a fresh address + an
   8-character password → signed in.
7. Sign out, `Login` → `Continue with Email` → the same address and password →
   signed in. Wrong password → `Wrong email or password.`
8. `demo@higgsfield.ai` / `demo1234` → signed in.
9. Signing up with an address already registered → `409` copy.
10. `Forgot password?` → any address → the confirmation line.
11. Escape closes from every step; back pops to the root with consent reset.
12. Signed out, `/ai/image` → hero, no feed. Sign in → masonry.
13. Signed out, `/ai/video` → History shows the three-step section; Generate
    opens the dialog.
14. At 1279px the media panel is gone; at 1280px it is back.
15. Keyboard only: tab through every control, confirm a visible focus ring on
    each, and that focus cannot leave the dialog.
16. `prefers-reduced-motion: reduce` — no shake, no pulse, no carousel advance.
