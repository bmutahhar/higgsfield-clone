"use client";

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
      { label: "Model", value: modelById(values.modelId).name },
      { label: "Aspect ratio", value: values.aspectRatio },
      { label: "Quality", value: values.quality },
      { label: "Resolution", value: values.resolution },
      { label: "Background", value: values.background },
      { label: "Batch", value: String(values.batch) },
    ];
  }

  /*
   * Each video surface offered different controls, so each describes itself.
   * The shared rows — model, and how much you attached — are written the same
   * way so a reader moving between them is not re-learning the panel.
   */
  const model = (id: string) => videoModelById(id)?.name ?? id;

  if (settings.kind === "video-edit") {
    const values = settings.values;
    const references = values.elements.length + (values.referenceVideo ? 1 : 0);
    return [
      { label: "Model", value: model(values.modelId) },
      { label: "Method", value: values.mode === "draw" ? "Draw" : "Prompt" },
      { label: "Resolution", value: values.resolution },
      { label: "Bitrate", value: values.bitrate },
      { label: "Audio", value: values.audio ? "On" : "Off" },
      { label: "References", value: String(references) },
    ];
  }

  if (settings.kind === "video-motion") {
    const values = settings.values;
    return [
      { label: "Model", value: model(values.modelId) },
      { label: "Quality", value: values.quality },
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
    { label: "Model", value: model(values.modelId) },
    { label: "Mode", value: MODES[values.mode].label },
    { label: "Quality", value: values.quality },
    { label: "References", value: String(references) },
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
      }}
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
