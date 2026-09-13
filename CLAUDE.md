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
