# Higgsfield clone

A rebuild of [higgsfield.ai](https://higgsfield.ai) — the marketing site, the pricing
page, the auth flow, and three generation studios (image, video, audio) — on Next.js 16,
React 19 and Tailwind v4.

There is **no model backend**. Every generation runs against a mock queue that hands back
sample assets on a realistic clock. That is a deliberate boundary, not a stub waiting to be
filled: everything _around_ the model — validation, job acceptance, phase reporting,
polling, the shared history, recreate/reuse, the auth gate — is built as if the model were
real, so swapping in a provider is a change to one server module and three service files.

---

## Contents

- [Running it locally](#running-it-locally)
- [Route map](#route-map)
- [The generation pipeline](#the-generation-pipeline) — the spine all three studios share
  - [Why one store](#why-one-store)
  - [The request lifecycle](#the-request-lifecycle)
  - [The stateless job queue](#the-stateless-job-queue)
  - [Validation: one schema per surface](#validation-one-schema-per-surface)
  - [Files do not survive JSON](#files-do-not-survive-json)
  - [Polling](#polling)
  - [The auth gate and parked requests](#the-auth-gate-and-parked-requests)
  - [Recreate and Reuse](#recreate-and-reuse)
- [Image generation](#image-generation)
- [Video generation](#video-generation)
- [Audio generation](#audio-generation)
- [Auth](#auth)
- [Conventions](#conventions)
- [Folder structure](#folder-structure)
- [Testing](#testing)
- [Building against the live site](#building-against-the-live-site)
- [What is mocked](#what-is-mocked)

---

## Running it locally

**Requirements**

|                 |                                                                |
| --------------- | -------------------------------------------------------------- |
| Node            | `>=20.9.0` (developed on 22.x)                                 |
| Package manager | pnpm `10.33.3` — pinned via `packageManager` in `package.json` |

**Install and run**

```bash
pnpm install
```

```bash
pnpm dev
```

Then open <http://localhost:3000>.

No `.env` file is required. The only environment variable the app reads is `AUTH_SECRET`,
used to sign the session cookie; absent, it falls back to `dev-only-secret`. Set it if you
want sessions to survive a change of machine:

```bash
echo 'AUTH_SECRET=any-long-random-string' > .env.local
```

**Signing in.** Generation surfaces are gated. A seeded account exists from import and
returns after every restart:

```
demo@higgsfield.ai / demo1234
```

Signing up with any other email works too and creates an account with 25 credits — it
lives in memory and is gone on the next server restart. The three social buttons open a
session immediately without a redirect.

**Scripts**

| Command                             | What it does                           |
| ----------------------------------- | -------------------------------------- |
| `pnpm dev`                          | Dev server on :3000                    |
| `pnpm build`                        | Production build                       |
| `pnpm start`                        | Serve the production build             |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                   |
| `pnpm typecheck`                    | `next typegen && tsc --noEmit`         |
| `pnpm test` / `pnpm test:watch`     | Vitest                                 |
| `pnpm format` / `pnpm format:check` | Prettier                               |
| `pnpm check`                        | **All four.** Run this before pushing. |

A Husky `pre-commit` hook runs `lint-staged` (ESLint with `--max-warnings=0` on staged
TS/TSX, Prettier on staged JSON/CSS/MD) and then a project-wide `pnpm typecheck` —
deliberately project-wide, because a staged file can break types in a file you did not
touch. `next typegen` runs first, since Next 16 generates the `PageProps` / `LayoutProps`
types that `tsc` needs.

---

## Route map

| Route              | Surface                                                       | Query params                        |
| ------------------ | ------------------------------------------------------------- | ----------------------------------- |
| `/`                | Marketing home                                                | —                                   |
| `/pricing`         | Pricing (desktop cards, and a separate tree below 768px)      | —                                   |
| `/projects/[slug]` | Project detail                                                | —                                   |
| `/kitchen-sink`    | Every primitive on one page, for eyeballing the design system | —                                   |
| `/ai/image`        | Image studio                                                  | `?model=`                           |
| `/ai/video`        | Genjutsu video studio                                         | `?model=`                           |
| `/ai/video/edit`   | Edit Video                                                    | `?model=`                           |
| `/ai/video/motion` | Motion Control                                                | `?model=`                           |
| `/audio`           | Audio studio                                                  | `?tab=tts\|voice-change\|translate` |

Every `?model=` is resolved server-side in the route's `page.tsx` and falls back to the
catalogue default when unknown or absent, so a hand-edited URL degrades instead of
rendering an empty form. Model selection lives in the URL rather than in state
specifically so each row of the header's hover menu is a real link and the back button
means something. `/audio` is the exception — the reference deep-links no model there, so
inventing one would be a divergence dressed up as a feature; only its tab is in the URL.

The two route groups differ structurally, not just visually:

- `(marketing)` scrolls and carries the footer.
- `(studio)` fills the space under the chrome exactly, manages its own internal scrolling,
  has no page scroll and no footer, and is the only group wrapped in `QueryProvider` —
  the marketing pages should not pay for a React Query client they never read.

`<body>` itself never scrolls. Each group owns its scroll container.

---

## The generation pipeline

All five generation surfaces — image, Genjutsu video, Edit, Motion Control, audio — run
the same flow. This section is that flow; the three sections after it cover only what each
medium does differently.

```
 composer                                                       server
 ────────                                                       ──────
 react-hook-form + zod resolver
        │
        │ validated values
        ▼
 services/<kind>-generation.ts ──── POST /api/generations ────▶ re-validate with the
        │                            (202 Accepted)             SAME zod schema
        │                                                              │
        │◀────────────── { jobs: [{ id, w, h, prompt }] } ─────────────┘
        ▼                                                       (422 + issues on failure)
 store.enqueue(request, jobs)
   → one record per job, status "processing",
     frame and prompt already known
        │
        ▼
 useQueries: one query per running job
        │
        │ GET /api/generations/:id  every 300–600ms
        ▼                                                    ┌── parse the id
 store.applyStatus(id, status) ◀──── processing ─────────────┤   compare to the clock
                               ◀──── generating ─────────────┤   no lookup, no state
                               ◀──── ready + asset ──────────┘
        │
        ▼
 query unmounts — nothing polls finished work
```

### Why one store

Everything the studios produce lives in a single zustand store,
[`src/stores/generation-store.ts`](src/stores/generation-store.ts), not one store per
surface. Image, video and audio all generate the same way — a request is accepted, a frame
is held, an asset lands — and the library and asset views want to read across all three.
Splitting them would mean merging them back at every one of those call sites.

The store is **deliberately not persisted**. A generation belongs to a session; losing it
on reload is the accepted trade. That buys three things: no hydration step, no stale ids
pointing at jobs the server has long forgotten, and — the load-bearing one — it is sound
for a video recipe to hold the actual `File` objects someone attached, because nothing
ever tries to serialise this. Recreating a clip you made this session brings its
attachments back with it.

**One record covers every phase**, rather than a pending type and a finished type:

```ts
interface GenerationBase {
  id: string;
  kind: "image" | "video" | "audio";
  modelId: string; // the catalogue id, not the display name
  prompt: string;
  w: number;
  h: number; // known at acceptance, from the chosen aspect ratio
  createdAt: number;
  settings: GenerationSettings; // the full recipe, so "make this again" has something to read
  liked?: boolean;
}
```

The id, the frame and the prompt are known up front and never change; only `src` arrives
late. That is exactly what lets the feed hold a tile's place and swap the picture in
without moving anything around it.

The union is split on `status` so that _ready implies an asset_ is a fact the compiler
knows. Without it, every read of `src` needs a guard for a state that cannot happen.

```ts
type Generation =
  | (GenerationBase & { status: "processing" | "generating"; src?: undefined })
  | (GenerationBase & {
      status: "ready";
      src: string;
      poster?: string;
      duration?: number;
    });
```

Two axes that look like one and are not:

- **`kind`** is the medium, and it is what decides which feed shows the record. All three
  video surfaces file under `"video"` — an edit belongs in the video history beside
  everything else. Voice Change and Translate are audio surfaces that hand back a _video_,
  and they file under `"audio"`, because that is the studio whose history they belong in.
- **`settings.kind`** is the surface that produced it, discriminated separately
  (`"image" | "video" | "video-edit" | "video-motion" | "audio"`). That is what Recreate
  reads, so an edit's recipe goes back to the edit form and not to Genjutsu, which has no
  field for most of it.

`applyStatus` is a **no-op when nothing actually moved**. Polling calls it several times a
second per running job; without that guard, every call would hand out a new `generations`
array and re-render the whole feed to say nothing. Both it and `toggleLike` replace a
single index rather than mapping the array, so liking one image does not re-render the
other forty-four.

### The request lifecycle

`POST /api/generations` accepts a batch and returns **202** with job ids immediately. The
images are not ready — that is what 202 says. Two discriminators route the body:

| Field                  | Values               | Missing means                                                        |
| ---------------------- | -------------------- | -------------------------------------------------------------------- |
| `kind`                 | `"video"`, `"audio"` | `image` — image requests predate the field and send form values bare |
| `surface` (video only) | `"edit"`, `"motion"` | `genjutsu` — the original form predates the field                    |

Audio needs no `surface`: its request is already a union discriminated on `mode`, so the
mode says which arm to validate against.

An invalid body is **422** with `error` and the raw zod `issues`.

`GET /api/generations/:id` returns one job's status, or **404** for an id this service
could not have issued. It sets `cache-control: no-store` — it is polled, and a cached
`processing` would leave the tile spinning forever.

### The stateless job queue

[`src/server/generation-jobs.server.ts`](src/server/generation-jobs.server.ts) remembers
nothing. Everything polling needs to answer — when the asset is due, and which one it will
be — is **encoded into the job id itself**, so reading a job is a parse and a clock
comparison rather than a lookup.

```
<tag><readyAt>.<assetIndex>.<nonce>        all base36 after the leading letter
  │       │           │          └── keeps ids unique
  │       │           └── which fixture from that medium's pool
  │       └── epoch ms the asset is due
  └── g = image, v = video, a = audio
```

This is worth the slightly odd format. The obvious version keeps a `Map` of issued jobs,
which then has to survive HMR, which means hanging it off `globalThis` — and even then a
real server restart strands every job already in flight and those tiles spin forever. A
stateless mock has none of those failure modes, and it is honest that there is no queue
here to remember.

The trade is that an id is forgeable: anyone can mint one with a deadline in the past and
be handed a sample asset. With no private data and no cost per call, that is not worth a
signature.

**Phases.** `processing` and `generating` are both "not done yet". They exist because the
surface says so out loud, and because the switch between them is the only progress signal
there is when the work itself is opaque. Both are derived from the same deadline, so the
phase costs no extra state and each item in a staggered batch changes over at its own
moment rather than all at once.

**Timings**, per medium:

|                  | base   | stagger | jitter | `generating` window | client poll |
| ---------------- | ------ | ------- | ------ | ------------------- | ----------- |
| Image            | 2600ms | 350ms   | 120ms  | last 1600ms         | 300ms       |
| Audio            | 4200ms | 400ms   | 200ms  | last 2400ms         | 500ms       |
| Video — Genjutsu | 7000ms | —       | 1200ms | last 4500ms         | 600ms       |
| Video — Edit     | 5200ms | —       | 1200ms | last 4500ms         | 600ms       |
| Video — Motion   | 9000ms | —       | 1200ms | last 4500ms         | 600ms       |

The stagger is not decoration and it is not arbitrary. **It has to stay wider than the
client's poll interval or the point of it is lost**: every job in a batch is enqueued on
the same tick, so their polls run in lockstep, and any two deadlines falling inside one
interval get noticed together and land as a clump. At 350ms against a 300ms poll, a batch
of four arrives one at a time and still finishes inside ~3–4s. Jitter stays well under the
stagger so it varies the timing without reordering the batch.

The per-surface bases differ because the work does — an edit re-renders an existing clip,
while motion transfer solves a pose track before it renders anything. Video polls at 600ms
rather than 300ms because it is a single job taking seconds; polling four times a second
for seven seconds would be two dozen requests to learn one thing.

### Validation: one schema per surface

Schemas live in [`src/schemas/`](src/schemas), not beside the forms, because **the server
validates against the same object the composer does**. A client-side check is a courtesy;
the route handler's is the one that counts.

Two rules hold across all five:

**1. Option lists are derived from the catalogue, never restated.**

```ts
const MODEL_IDS = IMAGE_MODELS.map((model) => model.id);
// ...
modelId: z.enum(MODEL_IDS),
```

A model added in `config/` is accepted here without a second edit — and, more importantly,
one removed there _stops validating_.

**2. Cross-field rules go in `superRefine`.** A flat schema cannot express "required only
when the toggle is on", "at most as many images as this mode allows", or "not every model
renders at 4K". Every surface has at least one:

| Surface  | Conditional rules                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------- |
| Image    | resolution must be one the chosen model offers                                                    |
| Genjutsu | enabled-but-empty prompt; model-aware quality; per-mode image cap; reference clip 4–30s           |
| Edit     | clip required; ≤30s; ≤50 elements; model-aware resolution                                         |
| Motion   | motion clip **and** character image both required; clip 3–30s; model-aware quality                |
| Audio    | model-aware sample rate (speech); required voice + clip (voice change); required clip (translate) |

These are backstops, not the primary UX — each panel already swaps to a supported value
when you change model. The refinement catches the pairing the UI should never have
produced: a restored draft, a hand-edited `?model=`, or (for audio) the advanced panel's
`localStorage`.

Note the two bounds that look shareable and are not: Genjutsu accepts 4–30s reference
clips, Motion Control accepts 3–30s. They are different models with different limits, and
a shared constant would quietly move one when the other changed. The copy a user reads is
built _from_ these constants rather than restating them, so the sentence in the drop zone
and the rule in the schema cannot drift apart.

### Files do not survive JSON

`JSON.stringify(file)` produces `{}`. So every surface that takes an upload has **two**
shapes: the form's values, holding real `File` objects, and a wire request that is a
deliberate projection — the decisions, plus enough of the media to describe it.

```ts
// schemas/video-generation.ts
export function toVideoRequest(values: VideoGenerationValues): VideoGenerationRequest {
  return {
    kind: "video",
    surface: "genjutsu",
    // ...
    prompt: values.promptEnabled ? values.prompt : "",
    referenceVideo: values.referenceVideo
      ? { name: ..., size: ..., duration: ... }
      : null,
    referenceImageCount: values.referenceImages.length,
  };
}
```

A real backend would take the bytes as multipart and this shape as its metadata part; the
mock only ever needed the metadata. Each surface has one: `toVideoRequest`,
`toEditRequest`, `toMotionRequest`, `toAudioRequest`. Image has none — it uploads nothing.

Note what is dropped rather than sent-and-ignored: a disabled prompt is not part of the
request, and a scene source with scene control switched off is `null`. Passing them anyway
would leave the server deciding whether to honour something the user turned off.

### Polling

React Query is **the transport, not the record**. One `useQueries` entry per running job:

```ts
useQueries({
  queries: pending.map((generation) => ({
    queryKey: ["generation", generation.id],
    queryFn: async () => {
      const status = await fetchGeneration(generation.id);
      applyStatus(generation.id, status); // write here, not in an effect
      return status;
    },
    refetchInterval: (query) =>
      query.state.data?.status === "ready" ? false : POLL_MS,
    refetchIntervalInBackground: true,
  })),
});
```

Four decisions in that block:

- **The store write lives in `queryFn`,** not an effect. This is the only place that knows
  what the service just said; an effect would re-derive the same fact one render later.
- **`pending` is derived, so finished jobs drop out of the list** — their queries unmount
  and stop. Nothing polls an asset that has landed.
- **`refetchInterval` returns `false` on ready,** so one job stopping does not stop the
  others in its batch.
- **`refetchIntervalInBackground: true`,** which React Query does not do by default. The
  work finishes on the server whether or not anyone is watching; switching tabs mid-batch
  and coming back should show finished images, not tiles that only start moving again once
  they are looked at.

Polling is written once. `fetchGeneration` lives in
[`services/image-generation.ts`](src/services/image-generation.ts) and the video and audio
services import it rather than reimplementing it — a job's status reads the same way
whatever produced it. If that endpoint ever diverges per kind, that import is the seam to
split.

### The auth gate and parked requests

Submitting while signed out does not discard the work. The validated values are parked in
the store and the auth dialog opens; the moment a user exists, the request runs on its own:

```ts
holdRequest({ kind: "image", values });
openAuth("signup");
// ...
useEffect(() => {
  if (!user) return;
  const held = takeRequest();
  if (held?.kind === "image") generate(held.values);
}, [user, takeRequest, generate]);
```

`takeRequest` **reads and clears atomically** rather than being a getter plus a separate
clear. The caller is an effect watching for sign-in, and effects run twice in development
under StrictMode; taking the request atomically means the second run finds nothing and the
generation fires once, not twice.

The values arrive already validated, so submitting an empty prompt still fails _in the
composer_ rather than asking someone to sign in only to discover they submitted nothing.

One structural note: the signed-out early return in each studio sits **below every hook** —
the store selectors, `useMutation` and `useQueries` all run unconditionally. Returning
earlier would change hook order across the signed-in/signed-out transition and React would
throw.

### Recreate and Reuse

Every finished generation carries its full recipe, which is what makes both possible.
[`hooks/use-generation-actions.ts`](src/hooks/use-generation-actions.ts) is the single
place that knows both the store and the transfer service, which keeps six callbacks from
being drilled through two levels of each studio:

| Action        | Behaviour                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Open          | the asset in a new tab                                                     |
| Download      | fetches the bytes and names the file after the prompt                      |
| Copy image    | for a clip, the poster — the frame someone means when they point at a tile |
| Copy link     | the asset URL                                                              |
| **Recreate**  | loads prompt **and** recipe into the composer                              |
| **Reuse**     | loads the recipe alone, leaving whatever prompt is already written         |
| Like / Remove | local only, not persisted                                                  |

The difference between the two is one field. A `ComposerDraft` is `Partial`, and a
composer merges it over its own current values, so an absent field reads as _leave this
one_.

A fresh object is built every time — including the values — because the composer keys its
effect on the draft's identity. Handing back the stored settings object would make a
second Recreate on the same tile silently do nothing. Unlike `pendingRequest`, the draft is
never taken-and-cleared: leaving the last one in place costs nothing and means a composer
mounting later (signing in swaps that subtree) still finds it.

Download lives in [`services/asset-transfer.ts`](src/services/asset-transfer.ts) rather
than `lib/` because it fetches bytes — and fetching is the only way it can work at all: a
`download` attribute is ignored on a cross-origin link, so a plain anchor would navigate to
the image instead of saving it. The pure string half — slug, length cap, extension from
content type — is split into [`lib/asset-filename.ts`](src/lib/asset-filename.ts) where it
is testable without a browser.

---

## Image generation

**Route** `/ai/image?model=` → [`components/image-studio/studio.tsx`](src/components/image-studio/studio.tsx)

Two things over one another: a canvas of everything you have made, and a composer floating
at its foot. There is no hero and no preset wall — signed in, the page opens straight into
your own output. Signed out it shows a hero, the composer stays, and submitting opens the
dialog.

**Controls** — model, aspect ratio, quality, resolution (1K/2K/4K), background, batch 1–4.
The catalogue is [`config/image-studio.ts`](src/config/image-studio.ts): model names,
descriptions, badges and section order transcribed from the live picker, in the live
order. Vendor logos are not redistributable, so each model carries a Lucide stand-in
chosen per vendor family.

**Credit pricing** scales with resolution through a `tiers(list, net)` helper. Only two
figures could actually be read off the live CTA from a zero-credit account — GPT Image 2 at
2K (8.5/6.5) and at 4K (14/11) — so that one model is exact and every other 2K figure is a
plausible stand-in, marked as such in the source. Not a measurement.

**The feed** is the part worth reading the code for. Layout is a balanced column split
([`lib/masonry.ts`](src/lib/masonry.ts)), not absolute positioning: ratios are known up
front for _running_ jobs as much as for finished images, so columns fill shortest-first
with no measurement pass, and a generation landing swaps a tile in place without moving
anything below it. `balanceColumns` is pure arithmetic on intrinsic ratios — no DOM, no
measurement — so the layout is stable on the server and identical after hydration.

A running job renders as a `PendingTile` holding the **exact** space the finished image
will occupy. Its two phases differ only in colour and one word, and both follow the
inherited `color` — white while queued, brand once the model is working — so the light,
the spinner and the label move together as a single class rather than three that could
disagree.

Feed zoom persists through `useSyncExternalStore` over `localStorage`, not state copied in
an effect (which would set state during the first commit and cascade a second render on
every mount). The stored shape is the live app's own `{ columnsPerRow, groupMode }`,
because the _column count_ is the durable fact — adding a zoom stop later should not
silently re-zoom everybody's feed. The zoom stop is a ceiling: a narrow window overrides it
so tiles keep a usable width, measured off the scroller rather than assumed from a
breakpoint, which is also what makes the mobile feed two columns.

---

## Video generation

Three surfaces, three schemas, one shell. They differ only in the fields between the promo
card and the footer, and in the schema behind them — so
[`components/studio/studio-panel.tsx`](src/components/studio/studio-panel.tsx) owns the
route tabs, the model card, the field scroller and the sticky Generate footer. Keeping
three copies would have meant fixing every panel bug three times.

All three write to `kind: "video"` and share one history.

### `/ai/video` — Genjutsu

Two modes: **motion transfer** and **object swap**. Switching mode rewrites both drop
zones, the image cap and the prompt placeholder at once, so all of it lives in one record
keyed by mode in [`config/genjutsu.ts`](src/config/genjutsu.ts) rather than in scattered
ternaries.

The distinguishing thing about this surface is that **the prompt is opt-in**. The reference
clip and the character images are the primary input and the toggle is off by default, so
the field is always present but only _required_ when the toggle is on — and when it is off,
the prompt is dropped from the request rather than sent and ignored.

Reference clips run 4–30 seconds. Duration cannot come from a `File` alone — it needs a
metadata load — so the drop zone resolves it before handing the value to the form
([`components/studio/read-video-duration.ts`](src/components/studio/read-video-duration.ts)),
and the schema then enforces the bound the drop zone advertised.

The model lives in the URL, not the form, because the panel derives its quality options
from the route. A recreated clip names a model, so the draft's model is _pushed to the
router_ and the panel's own URL-sync effect lands it in the field — one writer, rather than
two racing.

### `/ai/video/edit` — Edit Video

Change one thing in a clip you already have and keep the rest of the take. Modes `prompt`
and `draw`; clip required, ≤30s; up to 50 reference elements (images or audio); resolution
and bitrate; an audio toggle beside the prompt. Unlike Genjutsu the prompt is **not**
optional — there is no toggle here, and an edit with nothing said about it is not a
request. Its pane offers two tabs rather than three; there is no preset library.

### `/ai/video/motion` — Motion Control

Copy the motion from one clip and perform it with your own character. Stricter than its
siblings by design: this surface exists to put one performer's motion onto another's
likeness, so **neither input is optional** — a form that accepted one of the two would be
describing a generation the model cannot run. Motion clips run 3–30s. Scene control is a
toggle with a `video | image` source that is only sent while it is on.

This is also the only surface with no prompt at all, which is why `enqueue` does not strip
one from it: its whole value is the recipe.

### Presets and the Motion Library

[`config/presets.ts`](src/config/presets.ts) has two sources with genuinely different
affordances — first-party presets are curated and have no overflow menu, community presets
are user-submitted and can be reported. That is a `source` discriminator, not a pile of
booleans on the card.

Posters are real remote stills; hover playback cycles a small pool of clips rather than
pairing one per card, because the origin stores a card's video under a different id than
its poster and there is no way to derive one from the other without the API. So every card
always has a poster and `video` is best-effort, with `PresetCard` falling back to the
still.

Those same presets seed the signed-in video history. Reusing them rather than inventing a
second asset list keeps one set of URLs to fix when the origin rotates them, and a
returning user's history plausibly resembles what they generated from. Signed out, History
stays the blank canvas the live surface shows.

---

## Audio generation

**Route** `/audio?tab=` → [`components/audio-studio/audio-studio.tsx`](src/components/audio-studio/audio-studio.tsx)

Three tabs — **Text to Speech**, **Voice Change**, **Translate** — validated as one
discriminated union, not one shape with everything optional. The tabs share almost no
fields, and a flat schema would validate nothing: `voice` would have to be optional for the
two tabs that do not have it, which is exactly the tab where it is required.

| Tab            | Inputs                                                                                | Output |
| -------------- | ------------------------------------------------------------------------------------- | ------ |
| Text to Speech | script (≤5000 chars), model, batch 1–4, ≤3 attachments, voice details, advanced panel | audio  |
| Voice Change   | a voice file **and** a clip                                                           | video  |
| Translate      | a clip + target language                                                              | video  |

All three file under `kind: "audio"` — the studio owns the kind — and the History pane
picks its renderer off the **mode inside the settings**: full-width waveform rows for
speech, a 3:4 tile grid for the two that hand back video. Without that, a Translate tile
would appear in the speech list.

Audio history groups under date headings by **local** calendar day, not UTC: a generation
made at 11pm should file under the day the person making it was living in. This is also
why audio fixtures carry real timestamps while image and video seeds use a descending
`-index` — a negative epoch would file every row under January 1970.

**The advanced panel** — intensity, mood, speed, pitch, volume, output format, sample rate
— is where the model-aware rule bites: not every model renders at every sample rate, and
since these settings can persist to `localStorage`, a restored draft is the realistic way
an invalid pairing reaches the schema.

**Two design decisions specific to this surface:**

_Waveforms are derived from the job id, not the audio._ Decoding would mean
`decodeAudioData` over a cross-origin fixture, which is one missing CORS header away from a
permanently empty tile — and the bars are decoration, not analysis: nobody reads amplitude
off a 40px strip. The id already encodes everything unique about a generation, so hashing
it ([FNV-1a, seeded per bar, with a slow sine envelope so it does not read as pure
noise](src/lib/waveform.ts)) gives a picture that is stable across reloads and machines and
costs nothing. It mirrors how the job queue keeps its state in the id.

_Duration does the job `w`/`h` do for a picture._ A waveform row has no aspect ratio to
size itself from, so the ready asset carries `duration` — which both sizes the row before
the file loads and sets how many bars are drawn, so length reads true.

**Cost** is ours, not the reference's, and flagged as such. The live surface's cost is not
linear in script length — 13 characters priced 0.1 and 17 priced 0.3 on the same model —
so there is no rule there to copy. [`lib/audio-cost.ts`](src/lib/audio-cost.ts) is linear
in batch and flat per model, which is at least a rule someone can check by pressing `+`.
It rounds to two decimals because `0.15 * 3` is `0.44999999999999996` in binary floating
point and that would otherwise reach the label in full.

**The script field** holds rich content — plain text plus `@` mention chips — while the
schema wants a string. [`lib/script-tokens.ts`](src/lib/script-tokens.ts) is that boundary,
and it is the only real logic in the field, which is why it is extracted and tested rather
than buried in the component. It decodes `&amp;` last, on purpose: decoding it first turns
`&amp;lt;` into `<`, the classic double-decode bug.

The panel becomes a sheet on phones without forking the component.

---

## Auth

Demo-grade and honest about it, but not sloppy where sloppiness would be embarrassing.

- **Session** — an opaque HMAC-SHA256-signed token, not a bare user id: a cookie the
  browser can edit is not a session. `hf_session`, httpOnly, 7-day TTL, compared with
  `timingSafeEqual` (guarded for length, since it throws on a mismatch). No key rotation,
  no revocation list.
- **Store** — an in-memory `Map` hung off `globalThis`, which is not an accident. Next
  gives route handlers and server components separate module graphs, so a module-level
  `const users = new Map()` is instantiated once per graph: both copies seed the mock user,
  but anyone who signed in at runtime was written only to the graph whose handler created
  them, and the server render that paints the header read the other Map and saw nobody. One
  object on `globalThis` is the only thing both graphs agree on — and it survives HMR,
  which the module-level version intended but never had.
- **Passwords are compared in plain text,** and that is correct here: there is no
  persistence and no real account, so a hash would protect nothing and only suggest this is
  sturdier than it is. Do not "fix" it without also adding a real store to justify it.
- **Two habits kept anyway.** Login returns one message for both halves — saying which was
  wrong tells a caller which addresses are registered. Password reset always returns 200
  whether or not the address exists, for the same reason.
- **The root layout reads the session server-side** and seeds the client provider, which is
  what stops the header painting signed-out and then correcting itself.

`AuthProvider` wraps the whole app _including_ the studio layout's `QueryProvider`. The two
nest and neither needs the other — React Query stays scoped to the generation surfaces on
purpose.

---

## Conventions

Full rules live in [`CLAUDE.md`](CLAUDE.md). The load-bearing ones:

### Tailwind utilities are the only styling mechanism

Not inline `style` objects, not CSS modules, not styled-components.

- **Tokens live in [`src/styles/tokens/*.css`](src/styles/tokens)** as CSS custom
  properties and mirror the Claude Design project 1:1. A token change upstream is a
  one-file change here.
- **[`src/app/globals.css`](src/app/globals.css) projects every token into Tailwind's theme**
  via `@theme inline`, so components write `bg-card`, `text-muted`, `rounded-card`,
  `text-h2`, `shadow-e3`, `ease-snap` — never `style={{ background: "var(--surface-card)" }}`.
- **Never use React state for visual state.** Hover, press, focus, checked, open and
  disabled are CSS: `hover:`, `active:`, `focus-visible:`, `peer-checked:`, `group-hover:`,
  `data-[state=open]:`, `disabled:`. A `useState` that only drives a class is a re-render on
  every mouse move and is invisible to keyboard users.
- **Prefer the platform for control state.** A styled toggle is a real visually-hidden
  `<input>` plus `peer-checked:`, never a `<span>` with `onClick`. Focus, announcement,
  arrow-key roving and form submission then come for free.
- **Variants use `cva`**, classes merge through `cn()` from [`@/lib/cn`](src/lib/cn.ts) so a
  caller's `className` can override component defaults.
- **Inline `style` is allowed only for a genuinely dynamic value** that cannot be a class —
  a pending tile's aspect ratio, a slider's fill percentage. Add a comment saying why.
- **Components stay server components by default.** `"use client"` only for an actual hook
  or browser API.
- Respect `motion-reduce:` on anything that animates.

### Which token layer

There are two, and they must not be mixed inside one component.

|            | Marketing layer                                    | Live-surface layer                                                                                                                                              |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens     | `--surface-*`, `--text-*`, `--r-*`, `--sp-*`       | `--q-*`                                                                                                                                                         |
| Written as | `bg-card`, `text-muted`, `rounded-card`, `text-h2` | `bg-q-panel`, `text-q-soft`, `rounded-q-300`, `text-q-body-sm`                                                                                                  |
| Faces      | Archivo + JetBrains Mono                           | Inter + Space Grotesk                                                                                                                                           |
| Used by    | everywhere except the folders opposite             | `src/app/(studio)/`, `src/components/studio/`, `src/components/image-studio/`, `src/features/auth/`, `src/app/(marketing)/pricing/` + `src/components/pricing/` |

The `q-` name says "studio" for history — it began as the generation pages' ramp. It is
really **the live site's own ramp**, and anything measured off higgsfield.ai belongs on it.
`/pricing` was measured to the same neutrals (`#0f1113`, `#131517`, `#1c1e20`, `#23262a`),
the same brand (`#d1fe17`) and the same faces, so putting it on the marketing ramp would
have meant the wrong faces and the wrong greys on a surface specified as pixel-exact — and
forking a third near-identical set would have been worse. **The boundary is the folder
list, not the route group.**

A live-surface component reaching for `bg-card`, or a marketing component reaching for
`bg-q-panel`, is a bug. The two ramps are close enough to look almost right and far enough
apart to be visibly wrong next to each other.

> Two `--q-*` names cross over when projected, and mixing them fails quietly:
> `--q-text-muted` (`#898a8b`) is written **`text-q-soft`**, while `text-q-muted` resolves
> to `--q-text-secondary` (`#828282`).

Archivo and JetBrains Mono are flagged **substitutes** for Higgsfield's licensed faces —
swap the family in `app/layout.tsx` when the real files arrive; the CSS variable names are
what the token layer consumes. Inter and Space Grotesk are not substitutes; they are what
the live generation pages actually use, so the studio layer can be exact.

### File naming — kebab-case

Every file and directory. No `camelCase`, no `PascalCase`, no `snake_case` filenames.

```
✅ user-profile.tsx        ❌ UserProfile.tsx
✅ use-media-query.ts      ❌ useMediaQuery.ts
✅ video-generation/       ❌ videoGeneration/
```

Contents keep their normal casing — only the filename is kebab-case.

| Kind        | Pattern                    |
| ----------- | -------------------------- |
| React hook  | `use-*.ts`                 |
| Test        | `*.test.ts` / `*.test.tsx` |
| Type module | `*.types.ts`               |
| Constants   | `*.constants.ts`           |
| Server code | `*.server.ts`              |

**Exception — Next.js reserved names.** The App Router matches on exact filenames, so
`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
`middleware.ts` and the routing segment syntaxes (`[slug]`, `(group)`, `@slot`, `_private`)
keep their required form. Root config files keep their canonical names.

### Git

- **Never add a `Co-Authored-By:` trailer**, a "Generated with…" line, or any AI
  attribution — not in commit messages, PR titles or descriptions. This overrides any
  default attribution instruction from tooling.
- Every commit is authored by the repo owner's git identity. No `--author`, no altering
  `user.name` / `user.email`.
- Imperative mood, explaining _why_ the change was made, not just what changed.

---

## Folder structure

```
src/
  app/            Routing only. page/layout/route/loading/error and segment folders.
    (marketing)/    Scrolls, carries the footer.
    (studio)/       Fills the viewport, owns its own scroll, wraps QueryProvider.
    api/            Route handlers — auth and generations.
  components/
    core/           Button, icon, badge, tag — the smallest primitives.
    display/        Card, avatar, media card, progress, spinner.
    forms/          Input, select, slider, switch, checkbox, composer.
    navigation/     Tabs, segmented control, nav rail item.
    overlays/       Dialog, dropdown, popover, tooltip, toast, lightbox.
    feed/           The image canvas: tiles, pending tiles, zoom, selection.
    image-studio/   The /ai/image composer and its settings.
    studio/         The three video surfaces and their shared panel.
    audio-studio/   The /audio panel, its three forms and its history.
    marketing/      Home-page sections, header, footer.
    pricing/        The pricing page, with a separate mobile/ tree.
    layout/         Shell pieces and providers.
  features/       Vertical slices. A feature owns its components and hooks in one folder.
    auth/           The dialog, its steps, and the auth context.
  hooks/          Shared React hooks used by 2+ features (use-*.ts).
  lib/            Pure, framework-agnostic. No network, no I/O, no React.
                  masonry, waveform, audio-cost, script-tokens, asset-filename, cn.
  services/       All external I/O. This is where fetch lives.
  server/         Server-only modules, marked `import "server-only"` so they can never
                  reach the client bundle. The job queue and the auth store.
  schemas/        Zod schemas — the validation contract shared by form and route.
  stores/         Zustand. One generation store.
  types/          Shared types.
  config/         Catalogues, constants, fixtures. Anything measured lands here.
  styles/tokens/  CSS custom properties, the source of truth for every colour and size.
```

Rules that keep the layers honest:

- **`lib/` is pure, `services/` does I/O.** Network call, filesystem, runtime env → it is a
  service. This is why `asset-filename.ts` and `asset-transfer.ts` are two files.
- **`app/` is routing, not logic.** A `page.tsx` reads as composition: resolve params, hand
  off. Every studio route in this repo is under 30 lines for that reason.
- **Colocate first, promote later.** A component used by one route starts next to it; it
  moves to `components/` the moment a second consumer appears. (The commit
  _"Promote the four primitives audio needs out of feature folders"_ is this rule firing.)
- **Dependencies point downward.** `app/` → `features/` → `components/` → `lib/`. A `lib/`
  module must never import from `app/` or `components/`.
- **No barrel files.** No `index.ts` re-export barrels — they defeat tree-shaking, slow
  Next's module graph, and create import cycles. Import from the concrete path.
- **Import via the `@/` alias** for anything outside the current folder; relative imports
  are for true siblings.

### Values, not vibes

Anything measured goes in a constants file or a token, never inline in a component. A
component that hard-codes a price, a credit count or a hex is a bug **even when it looks
right**, because the next measurement pass has nowhere to land.

---

## Testing

```bash
pnpm test
```

**426 tests across 25 files**, Vitest, node environment only. The units worth testing here
— validation, the session codec, the user store, the route handlers, the pure helpers —
are all plain TypeScript and none of them touch the DOM. Adding jsdom and React Testing
Library to cover the components would be a far larger dependency footprint than this
surface justifies, so components are verified in the browser instead.

Test files sit beside the module they cover, and `vitest.config.mts` includes only
`src/**/*.test.ts`.

**Token tests are not ceremony.** The token layer pins both halves — the declaration in
`src/styles/tokens/` and its projection in `globals.css` — because a token that exists but
is never projected produces a class that silently does nothing. Two silent-failure modes,
both of which bit us and both of which are now covered by
[`q-pricing-tokens.test.ts`](src/styles/tokens/q-pricing-tokens.test.ts):

1. **A name registered in two Tailwind namespaces.** `--color-q-plan` and `--text-q-plan`
   both existed, so `text-q-plan` resolved to a _colour_: the plan name rendered at the
   inherited size in near-black on a near-black card and the card lost 5px of height. No
   build error, no console warning.
2. **A custom scale `cn()` does not know about.** `tailwind-merge` cannot tell a custom
   font-size from a custom text colour — both are `text-*` — so it drops one of them. New
   scales must be registered in [`src/lib/cn.ts`](src/lib/cn.ts).

---

## Building against the live site

Surfaces here are rebuilt to 1:1 parity with higgsfield.ai. The method is always the same:
drive the live page in a browser, read `getComputedStyle` and `getBoundingClientRect` off
the real DOM, and write the numbers into a spec in
[`docs/superpowers/specs/`](docs/superpowers/specs) **before** writing any component.
Screenshots are for confirming, never for measuring — a rotated 2px strike-through measures
8px tall in a screenshot, and a badge skewed 10.89° looks like 10°.

A few things that repeatedly caught us out, recorded so they catch the next person less.

### The live site A/B tests its own content

The mobile pricing offer serves different numbers to different loads. Two loads minutes
apart gave "$5 / 70 credits" and "$9 / 120 credits" for the same Basic pick, and moved Pro
between its 600 and 900 credit tiers.

Transcribing whichever variant you happened to load bakes one arm of somebody else's
experiment into our source, and guarantees the mobile and desktop surfaces drift apart the
first time either is touched. So `pricing-mobile.constants.ts` **derives** its three picks
from the same `PLANS` matrix the desktop cards use, and
`pricing-mobile.constants.test.ts` pins them together. If you see a price in the live DOM
that disagrees with ours, check for an experiment before "fixing" it.

The same caution applies to anything promotional: banner copy, countdown offers, and the
`% OFF` badges are campaign state, not design.

### Things that change when you are not looking at them

- **The FAQ is two lists.** It swaps wholesale with the Individual/Business tab — eight
  consumer questions against thirteen procurement ones, with no overlap. Nothing in the
  section's own chrome hints at it, so a single-list build looks correct until someone
  clicks the other tab.
- **Discount percentages are per credit tier, not per plan.** Max reads 25% / 27% / 30% as
  its slider rises.
- **Monthly is not always the undiscounted price.** Max's upper tiers carry an intro price
  and say "Billed monthly, renews at $158".
- **Below 768px the site is not responsive — it swaps trees.** `.pricing-page` unmounts and
  a standalone offer page mounts in its place, with no site chrome. There is nothing to
  reflow.

### Where the specs live

|                                                     |                                                                |
| --------------------------------------------------- | -------------------------------------------------------------- |
| [`docs/superpowers/specs/`](docs/superpowers/specs) | Measured designs, written before any component                 |
| [`docs/superpowers/plans/`](docs/superpowers/plans) | Those specs broken into executable tasks                       |
| [`.agent-logs/`](.agent-logs)                       | Verbatim session transcripts — **deliberately not gitignored** |
| [`CAPTURE-TEST.md`](CAPTURE-TEST.md)                | How the transcript capture hook works and proof it fires       |

---

## What is mocked

Stated plainly so nobody mistakes the seam for a bug.

| Area               | Reality                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model inference    | None. `generation-jobs.server.ts` hands back sample assets on a timer.                                                                                   |
| Job queue          | Stateless. State is encoded in the job id; ids are forgeable by design.                                                                                  |
| Uploaded files     | Never leave the browser. Requests carry name/size/type/duration only.                                                                                    |
| Auth store         | In-memory `Map` on `globalThis`. Gone on server restart.                                                                                                 |
| Passwords          | Compared in plain text. See [Auth](#auth) for why that is the right call here.                                                                           |
| OAuth              | No redirect, no state param, no code exchange — a provider name opens a session.                                                                         |
| Generation history | Session-scoped. Not persisted; reload loses it.                                                                                                          |
| Media assets       | Real Higgsfield CDN URLs, not vendored. Hosts allow-listed in `next.config.ts`.                                                                          |
| Credit costs       | Image: two figures measured, the rest plausible stand-ins. Audio: entirely ours — the reference's pricing has no derivable rule. Both flagged in source. |

To wire in a real provider: replace the five `create*Jobs` functions and `readJob` in
[`src/server/generation-jobs.server.ts`](src/server/generation-jobs.server.ts), and change
the five request builders in [`src/services/`](src/services) — `image-generation.ts`,
`video-generation.ts`, `video-edit.ts`, `video-motion.ts`, `audio-generation.ts` — to post
multipart instead of JSON. Nothing above
those files knows the difference — the store, the polling, the phases, the feed and the
history are all already written against a real queue's behaviour.
