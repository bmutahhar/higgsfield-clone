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
