"use client";

import { ActionButton, ROUND_ACTION } from "@/components/core/action-button";
import { MediaLightbox } from "@/components/overlays/media-lightbox";
import {
  detailsFor,
  modelNameFor,
} from "@/components/studio/generation-details";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import type { ReadyGeneration } from "@/types/generation.types";

export interface GenerationLightboxProps {
  generation: ReadyGeneration;
  onClose: () => void;
}

/**
 * One of your own generations, full size, with the settings that made it.
 *
 * Shares its view with the library's preset lightbox — expanding a tile and
 * expanding an example are the same gesture, and they should not look like
 * two different products.
 */
export function GenerationLightbox({
  generation,
  onClose,
}: GenerationLightboxProps) {
  const actions = useGenerationActions(generation);

  return (
    <MediaLightbox
      media={{
        title: generation.prompt,
        // An image is its own poster and has no clip to transport.
        video: generation.kind === "video" ? generation.src : undefined,
        poster: generation.poster ?? generation.src,
        prompt: generation.prompt,
        details: detailsFor(generation.settings),
        /*
         * The model moves out of the settings list and into a chip of its own.
         * It is what made this, not a setting you chose alongside the others,
         * and it is the first thing you look for.
         */
        badge: { label: modelNameFor(generation), icon: "clapperboard" },
        detailsAs: "chips",
      }}
      rail={
        <>
          <ActionButton
            icon="heart"
            label={generation.liked === true ? "Unlike" : "Like"}
            pressed={generation.liked === true}
            onAction={actions.toggleLike}
            className={ROUND_ACTION}
          />
          <ActionButton
            icon="copy"
            label="Copy"
            onAction={actions.copyImage}
            className={ROUND_ACTION}
          />
          <ActionButton
            icon="download"
            label="Download"
            onAction={actions.download}
            className={ROUND_ACTION}
          />
          <ActionButton
            icon="link"
            label="Copy link"
            onAction={actions.copyLink}
            className={ROUND_ACTION}
          />
        </>
      }
      onClose={onClose}
      onRecreate={() => {
        actions.recreate();
        // The composer it has just filled is behind this dialog.
        onClose();
      }}
      onDownload={actions.download}
    />
  );
}
