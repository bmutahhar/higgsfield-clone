import type { IconName } from "@/components/core/icon";

/**
 * Content and constraints for the Edit Video surface.
 *
 * Mirrors `config/genjutsu.ts`: the copy a user reads and the bounds the schema
 * enforces come from the same place, so the sentence and the rule cannot drift.
 */

export type EditMode = "prompt" | "draw";

/** How long a clip this model will edit. */
export const EDIT_MAX_SECONDS = 30;
/** Reference elements — images or audio — accepted alongside the clip. */
export const EDIT_MAX_ELEMENTS = 50;

export const EDIT_MODES: {
  id: EditMode;
  label: string;
  icon: IconName;
}[] = [
  { id: "prompt", label: "Prompt", icon: "text-cursor-input" },
  { id: "draw", label: "Draw", icon: "pencil" },
];

export const EDIT_PROMO = {
  title: "General",
  subtitle: "Seedance 2.5 Edit",
  video: "https://static.higgsfield.ai/genjutsu/genjutsu-idea.mp4",
  poster:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-idea-poster.webp&w=640&q=85",
};

export const EDIT_COPY = {
  videoTitle: "Add a video to edit",
  videoHint: `Up to ${String(EDIT_MAX_SECONDS)}s`,
  elementsTitle: "Add elements or references",
  elementsHint: `Up to ${String(EDIT_MAX_ELEMENTS)} image or audio`,
  promptPlaceholder:
    "Say what should change in the clip — a person, an object, the lighting. Everything you leave out stays as filmed.",
  /** Only meaningful while Draw is selected; see the note in edit-form. */
  drawPlaceholder:
    "Draw over the frame to mark what should change, then describe the replacement.",
};

export const BITRATES = ["Standard", "High", "Max"] as const;
export const BITRATE_DEFAULT = "High";
export const EDIT_RESOLUTIONS = ["480p", "720p", "1080p"] as const;
export const EDIT_RESOLUTION_DEFAULT = "1080p";

/** The signed-out History panel. Our own wording. */
export const EDIT_ONBOARDING = {
  headline: "Change a shot without reshooting it",
  steps: [
    {
      title: "Bring your footage",
      body: "Drop in the clip you already have, plus any stills or audio the edit should reference.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/9650072f-7ed8-5c91-bc2f-edc3a30ba02e.webp",
    },
    {
      title: "Say what changes",
      body: "Describe the difference in plain language. Anything you leave unmentioned stays exactly as filmed.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/1bc47dfd-2af0-509b-bd76-3896ec07bf3d.webp",
    },
    {
      title: "Keep the take",
      body: "The grade, the grain and the camera move survive. Only the thing you named is rebuilt.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/067a9f92-94b2-5e63-accf-2c57fe1a0cdf.webp",
    },
  ],
};
