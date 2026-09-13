This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Building against the live site

Surfaces in here are rebuilt to 1:1 parity with higgsfield.ai. The method is
always the same: drive the live page in a browser, read `getComputedStyle` and
`getBoundingClientRect` off the real DOM, and write the numbers into a spec in
`docs/superpowers/specs/` before writing any component. Screenshots are for
confirming, never for measuring — a rotated 2px strike-through measures 8px
tall in a screenshot, and a badge skewed 10.89° looks like 10°.

A few things that repeatedly caught us out, recorded so they catch the next
person less.

### The live site A/B tests its own content

The mobile pricing offer serves different numbers to different loads. Two loads
minutes apart gave "$5 / 70 credits" and "$9 / 120 credits" for the same Basic
pick, and moved Pro between its 600 and 900 credit tiers.

Transcribing whichever variant you happened to load bakes one arm of somebody
else's experiment into our source, and guarantees the mobile and desktop
surfaces drift apart the first time either is touched. So
`pricing-mobile.constants.ts` **derives** its three picks from the same `PLANS`
matrix the desktop cards use, and `pricing-mobile.constants.test.ts` pins them
together. If you see a price in the live DOM that disagrees with ours, check
for an experiment before "fixing" it.

The same caution applies to anything promotional: banner copy, countdown
offers, and the `% OFF` badges are campaign state, not design.

### Things that change when you are not looking at them

- **The FAQ is two lists.** It swaps wholesale with the Individual/Business
  tab — eight consumer questions against thirteen procurement ones, with no
  overlap. Nothing in the section's own chrome hints at it, so a single-list
  build looks correct until someone clicks the other tab.
- **Discount percentages are per credit tier, not per plan.** Max reads
  25% / 27% / 30% as its slider rises.
- **Monthly is not always the undiscounted price.** Max's upper tiers carry an
  intro price and say "Billed monthly, renews at $158".
- **Below 768px the site is not responsive — it swaps trees.** `.pricing-page`
  unmounts and a standalone offer page mounts in its place, with no site
  chrome. There is nothing to reflow.

### Values, not vibes

Anything measured goes in a constants file or a token, never inline in a
component. A component that hard-codes a price, a credit count or a hex is a
bug even when it looks right, because the next measurement pass has nowhere to
land. The token layer pins both halves — the declaration in
`src/styles/tokens/` and its projection in `globals.css` — with tests, because
a token that exists but is never projected produces a class that silently does
nothing.

Two silent-failure modes worth knowing about, both of which bit us and both of
which are now covered by tests in `src/styles/tokens/q-pricing-tokens.test.ts`:

1. **A name registered in two Tailwind namespaces.** `--color-q-plan` and
   `--text-q-plan` both existed, so `text-q-plan` resolved to a _colour_: the
   plan name rendered at the inherited size in near-black on a near-black card
   and the card lost 5px of height. No build error, no console warning.
2. **A custom scale that `cn()` does not know about.** `tailwind-merge` cannot
   tell a custom font-size from a custom text colour — both are `text-*` — so
   it drops one of them. New scales must be registered in `src/lib/cn.ts`.

### Where the accessibility differs on purpose

We do not copy the live markup where it is inaccessible, only the pixels. The
plan credit slider is a real `<input type="range">` under the painted track
(the live one is a bare `<div>` stack with no role, tabindex or keyboard
path); the mobile plan picker is a real `radiogroup`; the FAQ stays on native
`<details>`; the comparison table is a real `<table>` with `<th scope>` so a
cell like "960 videos" is announced with the plan it belongs to. Each of these
is listed as a deliberate deviation in the spec.

## Tooling

| Script              | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Dev server                                               |
| `pnpm build`        | Production build                                         |
| `pnpm lint`         | ESLint (`eslint .` — `next lint` was removed in Next 16) |
| `pnpm lint:fix`     | ESLint with `--fix`                                      |
| `pnpm format`       | Prettier write                                           |
| `pnpm format:check` | Prettier check                                           |
| `pnpm typecheck`    | `next typegen && tsc --noEmit`                           |
| `pnpm check`        | All three, as CI would run them                          |

A husky `pre-commit` hook runs `lint-staged` (ESLint `--fix --max-warnings=0`
then Prettier on staged files) followed by a project-wide `pnpm typecheck`.

### Editor setup (format + fix on save)

`.vscode/settings.json` is committed and works in both VS Code and Cursor. It
enables `editor.formatOnSave` with Prettier, plus `source.fixAll.eslint` on
save, which is what applies import sorting automatically.

Install the recommended extensions when prompted (`dbaeumer.vscode-eslint`,
`esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`) — without the ESLint
extension, nothing fixes on save.

Formatting problems (stray blank lines, spacing, quotes) are surfaced as
**ESLint errors** via `eslint-plugin-prettier`, so they get underlined in the
editor rather than only being silently corrected on save. The trade-off is
slower lint runs; to go back to Prettier-only formatting, swap
`eslint-plugin-prettier/recommended` for `eslint-config-prettier/flat` in
`eslint.config.mjs`.

Import order is enforced by `import/order` (statement order, grouped
builtin → external → `@/` internal → relative, with `react` and `next/*`
pinned first) and `sort-imports` (named members inside the braces). Both are
auto-fixable.

### Pinned versions — do not bump blindly

- **ESLint is pinned to the 9.x line.** ESLint 10 is the current `latest`, but
  `eslint-plugin-react@7.37.5` (a dependency of `eslint-config-next`) crashes on
  it: `contextOrFilename.getFilename is not a function`. Revisit once
  `eslint-plugin-react` ships a stable ESLint 10 release.
- **TypeScript stays on 5.x.** TypeScript 7 is published, but
  `typescript-eslint@8` declares `typescript >=4.8.4 <6.1.0`, so type-aware
  linting would stop working.

`.agent-logs/` is listed in `.prettierignore`: the capture log is append-only
and must never be reformatted.
