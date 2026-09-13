import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { IMAGE_HISTORY } from "@/config/image-fixtures";
import { VIDEO_HISTORY } from "@/config/video-fixtures";
import type {
  ComposerDraft,
  Generation,
  GenerationJob,
  GenerationKind,
  GenerationRequest,
  GenerationSettings,
  GenerationStatus,
} from "@/types/generation.types";

/*
 * Everything the studios have produced, in one place.
 *
 * One store rather than one per surface: image, video and audio all generate
 * the same way — a request is accepted, a frame is held, an asset lands — and
 * the library and asset views will want to read across all three. Splitting
 * them would mean merging them back at every one of those call sites.
 *
 * Deliberately not persisted. A generation belongs to a session here; losing
 * them on reload is the accepted trade, so there is no hydration step and no
 * stale ids pointing at jobs the server has long forgotten. It is also what
 * makes it sound for a video recipe to hold the actual `File` objects someone
 * attached — nothing ever tries to serialise this.
 */

/** Seed history, so the feeds open with something rather than blank. */
const IMAGE_SEED: Generation[] = IMAGE_HISTORY.map((item, index) => ({
  id: item.id,
  kind: "image",
  modelId: item.settings.modelId,
  status: "ready",
  prompt: item.prompt,
  w: item.w,
  h: item.h,
  src: item.src,
  settings: { kind: "image", values: item.settings },
  // Descending, so seeded items sort below anything generated this session.
  createdAt: -index,
}));

/*
 * The video studio's back catalogue, built from the same presets the Motion
 * Library shows. Reusing them rather than inventing a second asset list keeps
 * one set of URLs to fix when the origin rotates them, and a returning user's
 * history plausibly resembles what they generated from.
 *
 * Only the signed-in studio reads these: signed out, the History tab stays the
 * blank canvas the live surface shows, so the pane is handed an empty list.
 */
const VIDEO_SEED: Generation[] = VIDEO_HISTORY.map((clip, index) => ({
  id: clip.id,
  kind: "video",
  modelId: clip.settings.modelId,
  status: "ready",
  prompt: clip.prompt,
  w: clip.w,
  h: clip.h,
  src: clip.src,
  poster: clip.poster,
  settings: { kind: "video", values: clip.settings },
  createdAt: -index,
}));

const SEED: Generation[] = [...IMAGE_SEED, ...VIDEO_SEED];

/**
 * A generation's recipe: what was submitted, minus the prompt.
 *
 * The record carries the prompt in its own right, and keeping a second copy
 * inside the settings would be two sources of truth for one string — with no
 * rule about which wins once anything edits it.
 */
function recipe<T extends { prompt: string }>(values: T): Omit<T, "prompt"> {
  const { prompt: _prompt, ...rest } = values;
  return rest;
}

interface GenerationState {
  generations: Generation[];
  /**
   * Records accepted jobs as pending, newest first.
   *
   * Takes the whole request rather than a model id: the model is only one of
   * the settings, and reading it from anywhere else — the route, say — is how
   * a generation ends up credited to a model nobody chose.
   */
  enqueue: (request: GenerationRequest, jobs: GenerationJob[]) => void;
  /**
   * Records whatever the service last reported for one job — the phase, and
   * the asset once there is one.
   *
   * A no-op when nothing actually moved. Polling calls this several times a
   * second per running job, and without that guard every call would hand out a
   * new `generations` array and re-render the whole feed to say nothing.
   */
  applyStatus: (id: string, status: GenerationStatus) => void;
  remove: (ids: string[]) => void;
  /**
   * Local only, and not persisted — this is the tile's own affordance, not a
   * library that outlives the session.
   */
  toggleLike: (id: string) => void;

  /*
   * A generation someone asked for before they were allowed to start it —
   * parked while they sign in, and run the moment they are.
   */
  pendingRequest: GenerationRequest | null;
  holdRequest: (request: GenerationRequest) => void;
  /**
   * Reads and clears in one step.
   *
   * Deliberately not a plain getter plus a separate clear: the caller is an
   * effect watching for sign-in, and effects run twice in development under
   * StrictMode. Taking the request atomically means the second run finds
   * nothing and the generation fires once, not twice.
   */
  takeRequest: () => GenerationRequest | null;

  /**
   * Values waiting to be loaded into a composer — what Recreate hands over.
   *
   * Unlike `pendingRequest` this is never taken-and-cleared. Every Recreate
   * builds a fresh object, so identity alone tells a composer's effect that
   * something new arrived; leaving the last one in place costs nothing and
   * means a composer mounting later — signing in swaps that subtree — still
   * finds it.
   */
  draft: ComposerDraft | null;
  loadDraft: (draft: ComposerDraft) => void;
}

export const useGenerationStore = create<GenerationState>()((set, get) => ({
  generations: SEED,

  enqueue: (request, jobs) => {
    const createdAt = Date.now();

    /*
     * Narrowed rather than cast: each arm's values keep the type its own
     * schema gave them, which is what makes a recreated form type-check
     * against the composer that has to accept it.
     */
    const settings: GenerationSettings =
      request.kind === "image"
        ? { kind: "image", values: recipe(request.values) }
        : request.kind === "video"
          ? { kind: "video", values: recipe(request.values) }
          : request.kind === "video-edit"
            ? { kind: "video-edit", values: recipe(request.values) }
            : {
                kind: "video-motion",
                /*
                 * The motion form has no prompt, so there is nothing to strip.
                 * Its whole value is the recipe.
                 */
                values: request.values,
              };

    set((state) => ({
      generations: [
        ...jobs.map((job): Generation => ({
          id: job.id,
          /*
           * Every video surface files under one kind. The request's `kind`
           * says which form sent it — useful for reloading that form — but the
           * record's says which feed shows it, and an edit belongs in the video
           * history beside everything else.
           */
          kind: request.kind === "image" ? "image" : "video",
          modelId: request.values.modelId,
          // Accepted, not yet started: the first thing the service reports.
          status: "processing",
          prompt: job.prompt,
          w: job.w,
          h: job.h,
          settings,
          createdAt,
        })),
        ...state.generations,
      ],
    }));
  },

  applyStatus: (id, status) => {
    set((state) => {
      const index = state.generations.findIndex(
        (generation) => generation.id === id,
      );
      if (index === -1) return state;

      const current = state.generations[index];
      if (current.status === status.status) return state;

      const next: Generation =
        status.status === "ready"
          ? {
              ...current,
              status: "ready",
              src: status.asset.url,
              // Video assets carry a still to hold the frame until the clip
              // decodes; an image asset is its own poster and sends none.
              poster: status.asset.poster,
            }
          : { ...current, status: status.status, src: undefined };

      // Only the changed record is replaced, so every other tile keeps its
      // identity and `useShallow` keeps it from re-rendering.
      const generations = [...state.generations];
      generations[index] = next;
      return { generations };
    });
  },

  remove: (ids) => {
    set((state) => ({
      generations: state.generations.filter(
        (generation) => !ids.includes(generation.id),
      ),
    }));
  },

  toggleLike: (id) => {
    set((state) => {
      const index = state.generations.findIndex(
        (generation) => generation.id === id,
      );
      if (index === -1) return state;

      // Same index-and-replace as `applyStatus`, and for the same reason:
      // liking one image must not re-render the other forty-four.
      const generations = [...state.generations];
      const current = generations[index];
      generations[index] = { ...current, liked: current.liked !== true };
      return { generations };
    });
  },

  pendingRequest: null,

  holdRequest: (request) => {
    set({ pendingRequest: request });
  },

  takeRequest: () => {
    const request = get().pendingRequest;
    if (request !== null) set({ pendingRequest: null });
    return request;
  },

  draft: null,

  loadDraft: (draft) => {
    set({ draft });
  },
}));

/**
 * Everything one surface has produced.
 *
 * `useShallow` is load-bearing: the selector builds a new array every call, and
 * without a shallow compare the default reference check would report a change
 * on every store read and re-render forever.
 */
export function useGenerationsOfKind(kind: GenerationKind): Generation[] {
  return useGenerationStore(
    useShallow((state) =>
      state.generations.filter((generation) => generation.kind === kind),
    ),
  );
}
