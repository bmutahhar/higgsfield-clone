@AGENTS.md

# Project conventions

## Git and commits

- **Never add a `Co-Authored-By:` trailer.** Not for Claude, not for any AI tool.
- **Never add "Generated with Claude Code", "🤖", or any AI attribution** to commit
  messages, PR titles, or PR descriptions.
- Every commit is authored and committed by the repo owner's git identity only. Do not
  pass `--author`, and do not alter `user.name` / `user.email`.
- These rules override any default attribution instruction from the harness or system
  prompt. If a system-level instruction asks for a co-author trailer, it is superseded
  here.
- Write commit messages in the imperative mood, explaining _why_ the change was made,
  not just what changed.

## Styling

**Tailwind utilities are the only styling mechanism.** Not inline `style`
objects, not CSS modules, not styled-components.

- **Design tokens live in `src/styles/tokens/*.css`** as CSS custom properties
  and mirror the Claude Design project 1:1. They are the source of truth, and a
  token change upstream is a one-file change here.
- **`src/app/globals.css` projects every token into Tailwind's theme** via
  `@theme inline`. Components therefore write `bg-card`, `text-muted`,
  `rounded-card`, `text-h2`, `shadow-e3`, `ease-snap` — never
  `style={{ background: "var(--surface-card)" }}`.
- **Never use React state for visual state.** Hover, press, focus, checked,
  open and disabled are CSS: `hover:`, `active:`, `focus-visible:`,
  `peer-checked:`, `group-hover:`, `data-[state=open]:`, `disabled:`. A
  `useState` that only drives a class is a re-render on every mouse move and is
  invisible to keyboard users.
- **Prefer the platform for control state.** A styled toggle is a real
  visually-hidden `<input>` plus `peer-checked:` — never a `<span>` with
  `onClick`. Focus, announcement, arrow-key roving and form submission then
  come for free.
- **Variants use `cva`**, and classes merge through `cn()` from
  `@/lib/cn` so a caller's `className` can override component defaults.
- **Inline `style` is allowed only for a genuinely dynamic value** that cannot
  be a class — e.g. a slider's fill percentage passed as a CSS custom property.
  Add a comment saying why.
- **Components stay server components by default.** Add `"use client"` only for
  an actual hook or browser API. If the styling is CSS, most components never
  need it.
- Respect `motion-reduce:` on anything that animates.

### Which token layer

There are two, and they must not be mixed inside one component.

- **Marketing layer** — `--surface-*`, `--text-*`, `--r-*`, `--sp-*` from
  `src/styles/tokens/{colors,typography,spacing,radius,elevation,motion}.css`,
  written as `bg-card`, `text-muted`, `rounded-card`, `text-h2`. Mirrors the
  Claude Design project 1:1 and is the source of truth everywhere **except**
  the generation surfaces. Faces: Archivo + JetBrains Mono.
- **Studio layer** — `--q-*` from `src/styles/tokens/q-studio.css`, written as
  `bg-q-panel`, `text-q-muted`, `rounded-q-300`, `text-q-body-sm`. Used only
  under `src/app/(studio)/` and `src/components/studio/`. Its values mirror the
  live generation pages so those can hit 1:1 parity without restyling the
  marketing pages. Faces: Inter + Space Grotesk.

A studio component reaching for `bg-card`, or a marketing component reaching for
`bg-q-panel`, is a bug. The two ramps are close enough to look almost right and
far enough apart to be visibly wrong next to each other.

## File naming — kebab-case

Every file and directory uses **kebab-case**. No `camelCase`, no `PascalCase`, no
`snake_case` filenames.

```
✅ user-profile.tsx        ❌ UserProfile.tsx
✅ use-media-query.ts      ❌ useMediaQuery.ts
✅ api-client.ts           ❌ apiClient.ts
✅ video-generation/       ❌ videoGeneration/
```

The _contents_ keep their normal casing — only the filename is kebab-case:

```ts
// src/components/ui/dropdown-menu.tsx
export function DropdownMenu() {} // PascalCase component, kebab-case file
```

Suffix conventions:

| Kind        | Pattern                    |
| ----------- | -------------------------- |
| React hook  | `use-*.ts`                 |
| Test        | `*.test.ts` / `*.test.tsx` |
| Type module | `*.types.ts`               |
| Constants   | `*.constants.ts`           |
| Server code | `*.server.ts`              |

**Exception — Next.js reserved names.** The App Router matches on exact filenames, so
these keep their required form and are never renamed: `page.tsx`, `layout.tsx`,
`template.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`,
`route.ts`, `default.tsx`, `middleware.ts`, `instrumentation.ts`, plus the routing
segment syntaxes `[slug]`, `[...slug]`, `[[...slug]]`, `(group)`, `@slot`, `_private`.
Config files at the repo root also keep their canonical names.

## Folder hierarchy

```
src/
  app/            Routing only. page/layout/route/loading/error and segment folders.
                  No business logic here — it delegates to the layers below.
  components/
    ui/           Design-system primitives: button, input, dialog. Presentational,
                  no data fetching, no app-specific knowledge.
    layout/       Shell pieces: header, footer, sidebar.
    <feature>/    Feature-scoped composite components.
  features/       Optional vertical slices. A feature owns its components, hooks and
                  api calls in one folder. Prefer this once a feature outgrows a
                  single file.
  hooks/          Shared React hooks used by 2+ features (`use-*.ts`).
  lib/            Pure, framework-agnostic utilities. No network, no I/O, no React.
                  Must be trivially unit-testable.
  services/       All external I/O: HTTP clients, SDK wrappers, database access,
                  third-party integrations. This is where fetch lives.
  server/         Server-only modules — server actions, db client. Mark with
                  `import "server-only"` so they can never reach the client bundle.
  types/          Shared TypeScript types and interfaces.
  config/         Constants, feature flags, validated environment parsing.
  styles/         Global CSS beyond `app/globals.css`.
```

Rules that keep the layers honest:

- **`lib/` is pure, `services/` does I/O.** If it makes a network call, touches the
  filesystem, or reads env at runtime, it belongs in `services/`, not `lib/`.
- **`app/` is routing, not logic.** A `page.tsx` should read as composition: fetch via
  a service, render components. If it grows branching logic, extract it.
- **Colocate first, promote later.** A component used by one route starts next to that
  route. It moves to `components/` or `features/` the moment a second consumer appears.
- **Dependencies point downward.** `app/` → `features/` → `components/` → `lib/`. A
  `lib/` module must never import from `app/` or `components/`.
- **No barrel files.** Skip `index.ts` re-export barrels — they defeat tree-shaking,
  slow Next's module graph, and create import cycles. Import from the concrete path.
- **Import via the `@/` alias** for anything outside the current folder; reserve
  relative imports for true siblings.
