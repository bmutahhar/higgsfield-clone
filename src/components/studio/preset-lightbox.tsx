"use client";

import { MediaLightbox } from "@/components/overlays/media-lightbox";
import type { Preset } from "@/config/presets";
import { downloadAsset } from "@/services/asset-transfer";

/**
 * The expanded library preset.
 *
 * The view itself lives in `MediaLightbox`, which your own generations open
 * too — this is only the mapping from a preset onto it.
 */
export function PresetLightbox({
  preset,
  onClose,
  onRecreate,
}: {
  preset: Preset;
  onClose: () => void;
  onRecreate: () => void;
}) {
  return (
    <MediaLightbox
      media={{
        title: preset.title,
        video: preset.video,
        poster: preset.poster,
        prompt: preset.prompt,
        variants: preset.variants,
        details: [{ label: "Model", value: preset.model }],
      }}
      onClose={onClose}
      onRecreate={onRecreate}
      /*
       * The clip if there is one, the still otherwise — the card falls back
       * the same way, since the origin stores a preset's video under a
       * different id than its poster.
       */
      onDownload={() =>
        downloadAsset(preset.video ?? preset.poster, preset.title)
      }
    />
  );
}
