"use client";

import { ActionButton, ROUND_ACTION } from "@/components/core/action-button";
import {
  type LightboxDetail,
  MediaLightbox,
} from "@/components/overlays/media-lightbox";
import { audioModelById, LANGUAGES } from "@/config/audio";
import { MODES } from "@/config/genjutsu";
import { modelById } from "@/config/image-studio";
import { videoModelById } from "@/config/models";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import type {
  GenerationSettings,
  ReadyGeneration,
} from "@/types/generation.types";

/**
 * The recipe, written out to be read rather than replayed.
 *
 * This is the one place the stored settings are shown to a person, so ids are
 * resolved to the names the pickers use: a panel reading `higgsfield-soul-2`
 * would be describing the store, not the image.
 */
function detailsFor(settings: GenerationSettings): LightboxDetail[] {
  if (settings.kind === "image") {
    const values = settings.values;
    return [
      { label: "Aspect ratio", value: values.aspectRatio, icon: "maximize" },
      { label: "Quality", value: values.quality, icon: "gem" },
      { label: "Resolution", value: values.resolution, icon: "scan" },
      { label: "Background", value: values.background, icon: "image" },
      { label: "Batch", value: String(values.batch), icon: "layers" },
    ];
  }

  /*
   * Each video surface offered different controls, so each describes itself.
   * The model is not among them: it names what made the generation rather than
   * a setting chosen alongside the rest, so it rides in its own badge.
   */

  if (settings.kind === "video-edit") {
    const values = settings.values;
    const references = values.elements.length + (values.referenceVideo ? 1 : 0);
    return [
      {
        label: "Method",
        value: values.mode === "draw" ? "Draw" : "Prompt",
        icon: "pencil",
      },
      { label: "Resolution", value: values.resolution, icon: "scan" },
      { label: "Bitrate", value: values.bitrate, icon: "gauge" },
      { label: "Audio", value: values.audio ? "On" : "Off", icon: "volume-2" },
      { label: "References", value: String(references), icon: "paperclip" },
    ];
  }

  if (settings.kind === "video-motion") {
    const values = settings.values;
    return [
      { label: "Quality", value: values.quality, icon: "gem" },
      {
        label: "Scene control",
        value: values.sceneControl
          ? values.sceneSource === "video"
            ? "From motion clip"
            : "From character image"
          : "Off",
      },
    ];
  }

  if (settings.kind === "audio") {
    const values = settings.values;
    const name = audioModelById(values.modelId)?.name ?? values.modelId;

    if (values.mode === "translate") {
      const language =
        LANGUAGES.find((entry) => entry.id === values.language)?.name ??
        values.language;
      return [
        { label: "Model", value: name },
        { label: "Language", value: language },
      ];
    }

    if (values.mode === "voice-change") {
      return [{ label: "Model", value: name }];
    }

    return [
      { label: "Model", value: name },
      { label: "Batch", value: String(values.batch) },
      { label: "Format", value: values.advanced.outputFormat },
      { label: "Sample rate", value: values.advanced.sampleRate },
      { label: "Attachments", value: String(values.attachments.length) },
    ];
  }

  const values = settings.values;
  const references =
    values.referenceImages.length + (values.referenceVideo ? 1 : 0);

  return [
    { label: "Mode", value: MODES[values.mode].label, icon: "circle-dashed" },
    { label: "Quality", value: values.quality, icon: "gem" },
    { label: "References", value: String(references), icon: "paperclip" },
  ];
}

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
        badge: {
          label:
            generation.kind === "image"
              ? modelById(generation.modelId).name
              : (videoModelById(generation.modelId)?.name ??
                generation.modelId),
          icon: "clapperboard",
        },
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
