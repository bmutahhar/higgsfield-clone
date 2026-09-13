import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { DEFAULT_MODEL_ID, FEED_ITEMS } from "@/config/image-studio";
import type {
  Generation,
  GenerationJob,
  GenerationKind,
  GenerationStatus,
  PendingRequest,
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
 * stale ids pointing at jobs the server has long forgotten.
 */

/** Seed history, so the feed opens with something rather than blank. */
const SEED: Generation[] = FEED_ITEMS.map((item, index) => ({
  id: item.id,
  kind: "image",
  modelId: DEFAULT_MODEL_ID,
  status: "ready",
  prompt: item.prompt,
  w: item.w,
  h: item.h,
  src: item.src,
  // Descending, so seeded items sort below anything generated this session.
  createdAt: -index,
}));

interface GenerationState {
  generations: Generation[];
  /** Records accepted jobs as pending, newest first. */
  enqueue: (
    kind: GenerationKind,
    modelId: string,
    jobs: GenerationJob[],
  ) => void;
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

  /*
   * A generation someone asked for before they were allowed to start it —
   * parked while they sign in, and run the moment they are.
   */
  pendingRequest: PendingRequest | null;
  holdRequest: (request: PendingRequest) => void;
  /**
   * Reads and clears in one step.
   *
   * Deliberately not a plain getter plus a separate clear: the caller is an
   * effect watching for sign-in, and effects run twice in development under
   * StrictMode. Taking the request atomically means the second run finds
   * nothing and the generation fires once, not twice.
   */
  takeRequest: () => PendingRequest | null;
}

export const useGenerationStore = create<GenerationState>()((set, get) => ({
  generations: SEED,

  enqueue: (kind, modelId, jobs) => {
    const createdAt = Date.now();
    set((state) => ({
      generations: [
        ...jobs.map((job): Generation => ({
          id: job.id,
          kind,
          modelId,
          // Accepted, not yet started: the first thing the service reports.
          status: "processing",
          prompt: job.prompt,
          w: job.w,
          h: job.h,
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

  pendingRequest: null,

  holdRequest: (request) => {
    set({ pendingRequest: request });
  },

  takeRequest: () => {
    const request = get().pendingRequest;
    if (request !== null) set({ pendingRequest: null });
    return request;
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
