"use client";

import {
  copyLink as copyAssetLink,
  copyImageToClipboard,
  downloadAsset,
} from "@/services/asset-transfer";
import { useGenerationStore } from "@/stores/generation-store";
import type { Generation } from "@/types/generation.types";

/**
 * Everything a finished generation can be asked to do.
 *
 * The asynchronous ones resolve when they have actually happened, so the
 * button that called them can say so.
 */
export interface GenerationActions {
  /** The asset in its own tab. */
  open: () => void;
  download: () => Promise<void>;
  /** The picture itself — for a clip, the frame it holds. */
  copyImage: () => Promise<void>;
  copyLink: () => Promise<void>;
  /** Load the prompt and the recipe into this surface's composer. */
  recreate: () => void;
  /** Load the recipe alone, leaving whatever prompt is already written. */
  reuse: () => void;
  toggleLike: () => void;
  remove: () => void;
}

/**
 * Binds one generation to the things a tile can do with it.
 *
 * The single place that knows both the store and the transfer service, which
 * is what keeps six callbacks from being drilled through two levels of each
 * studio — and keeps the image feed and the video history doing the same
 * thing rather than two similar things.
 */
export function useGenerationActions(
  generation: Generation,
): GenerationActions {
  // Actions never change identity, so selecting them needs no shallow compare.
  const loadDraft = useGenerationStore((state) => state.loadDraft);
  const like = useGenerationStore((state) => state.toggleLike);
  const drop = useGenerationStore((state) => state.remove);

  const ready = generation.status === "ready";
  const asset = ready ? generation.src : undefined;

  /*
   * What "copy" means per kind. A clip cannot go on a clipboard at all, so for
   * video it is the poster — which is the frame someone means when they point
   * at a tile and say copy.
   */
  const still = ready ? (generation.poster ?? generation.src) : undefined;

  const { settings, prompt } = generation;

  /*
   * A fresh object every time, including the values: the composer keys its
   * effect on the draft's identity, so handing back the stored settings
   * object would make a second Recreate on the same tile do nothing.
   */
  function draft(withPrompt: boolean) {
    const values = withPrompt ? { prompt } : {};
    /*
     * The draft keeps the surface that produced it. Collapsing every video
     * surface to one kind would hand an edit's recipe to the Genjutsu form,
     * which has no field for most of it — each arm narrows to its own values
     * so the composer that receives it is the one that can load it.
     */
    switch (settings.kind) {
      case "image":
        loadDraft({ kind: "image", values: { ...settings.values, ...values } });
        return;
      case "video":
        loadDraft({ kind: "video", values: { ...settings.values, ...values } });
        return;
      case "video-edit":
        loadDraft({
          kind: "video-edit",
          values: { ...settings.values, ...values },
        });
        return;
      case "video-motion":
        loadDraft({ kind: "video-motion", values: { ...settings.values } });
        return;
    }
  }

  return {
    open: () => {
      if (asset !== undefined) window.open(asset, "_blank", "noopener");
    },
    // A tile that has not landed has no asset; its buttons are never shown,
    // and resolving quietly is better than throwing at one that slips through.
    download: () =>
      asset === undefined
        ? Promise.resolve()
        : downloadAsset(asset, generation.prompt),
    copyImage: () =>
      still === undefined ? Promise.resolve() : copyImageToClipboard(still),
    copyLink: () =>
      asset === undefined ? Promise.resolve() : copyAssetLink(asset),
    recreate: () => {
      draft(true);
    },
    reuse: () => {
      draft(false);
    },
    toggleLike: () => {
      like(generation.id);
    },
    remove: () => {
      drop([generation.id]);
    },
  };
}
