"use client";

import { ActionButton } from "@/components/core/action-button";
import { Icon } from "@/components/core/icon";
import type { LightboxDetail } from "@/components/overlays/media-lightbox";
import { MODES } from "@/config/genjutsu";
import { modelById } from "@/config/image-studio";
import { videoModelById } from "@/config/models";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import type { Generation, GenerationSettings } from "@/types/generation.types";

/**
 * The recipe, written out to be read rather than replayed.
 *
 * This is the one place the stored settings are shown to a person, so ids are
 * resolved to the names the pickers use: a panel reading `higgsfield-soul-2`
 * would be describing the store, not the image.
 */
export function detailsFor(settings: GenerationSettings): LightboxDetail[] {
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
        icon: "scan",
      },
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

/** The name of whatever produced a generation, resolved from its catalogue. */
export function modelNameFor(generation: Generation): string {
  return generation.kind === "image"
    ? modelById(generation.modelId).name
    : (videoModelById(generation.modelId)?.name ?? generation.modelId);
}

export interface GenerationDetailsProps {
  generation: Generation;
  /** Dismiss the view this panel sits in, if it sits in one. */
  onAfterRerun?: () => void;
  className?: string;
}

/**
 * The recipe beside the thing it made.
 *
 * The same panel serves a row in the history list and the sidebar of the
 * expanded view, because they answer the same question — what were the
 * settings, and what can I do about them — and two versions would drift.
 *
 * The prompt is clamped rather than scrolled: this is a reminder of what you
 * asked for, and the full text is a click away in the expanded view.
 */
export function GenerationDetails({
  generation,
  onAfterRerun,
  className,
}: GenerationDetailsProps) {
  const actions = useGenerationActions(generation);
  const details = detailsFor(generation.settings);

  return (
    <div
      className={
        "flex min-h-0 flex-col gap-3 rounded-q-400 border border-q-hairline bg-q-panel p-3 " +
        (className ?? "")
      }
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-q-200 bg-q-w-05 px-2 py-1.5 text-q-label-xs text-q-fg">
        <Icon name="clapperboard" size={14} className="text-q-muted" />
        {modelNameFor(generation)}
      </span>

      {/*
        Faded rather than truncated with an ellipsis: the gradient says the
        text continues without spending a line saying so.
      */}
      <p className="line-clamp-6 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] text-q-body-sm text-q-fg">
        {generation.prompt}
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {details.map((detail) => (
          <li
            key={detail.label}
            className="inline-flex items-center gap-1.5 rounded-q-200 bg-q-w-05 px-2 py-1.5 text-q-label-xs text-q-fg"
          >
            {detail.icon && (
              <Icon
                name={detail.icon}
                size={14}
                className="shrink-0 text-q-muted"
              />
            )}
            <span className="sr-only">{detail.label}: </span>
            {detail.value}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            actions.recreate();
            onAfterRerun?.();
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-q-200 px-2 text-q-label-sm text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          <Icon name="rotate-ccw" size={16} />
          Rerun
        </button>

        <span className="flex items-center gap-1">
          <ActionButton
            icon="copy"
            label="Copy prompt"
            onAction={() => navigator.clipboard?.writeText(generation.prompt)}
          />
          <ActionButton
            icon="trash-2"
            label="Delete"
            onAction={actions.remove}
          />
        </span>
      </div>
    </div>
  );
}
