/**
 * Content and constraints for the Motion Control surface.
 *
 * Its clip bound is 3–30 seconds, not Genjutsu's 4–30. Keeping the two apart in
 * config rather than sharing one constant is deliberate: they are different
 * models with different limits, and a shared constant would quietly move one
 * when the other changed.
 */

export const MOTION_MIN_SECONDS = 3;
export const MOTION_MAX_SECONDS = 30;

export type SceneSource = "video" | "image";

export const SCENE_SOURCES: { id: SceneSource; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "image", label: "Image" },
];

export const MOTION_PROMO = {
  title: "Motion Control",
  subtitle: "Control motion with video references",
  video:
    "https://static.higgsfield.ai/genjutsu/genjutsu-motion-transfer-intro.mp4",
  poster:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-intro-poster.webp&w=640&q=85",
};

export const MOTION_COPY = {
  motionTitle: "Add motion to copy",
  motionHint: `Video duration:\n${String(MOTION_MIN_SECONDS)}–${String(MOTION_MAX_SECONDS)} seconds`,
  characterTitle: "Add your character",
  characterHint: "Image with visible\nface and body",
  sceneControlLabel: "Scene control mode",
  sceneControlHelp:
    "Choose where the background comes from: your character's image, or the motion clip.",
};

export const MOTION_QUALITIES = ["720p", "1080p"] as const;
export const MOTION_QUALITY_DEFAULT = "720p";

/** The signed-out History panel. Our own wording. */
export const MOTION_ONBOARDING = {
  headline: "Put your character in someone else's performance",
  steps: [
    {
      title: "Pick the movement",
      body: "Any clip with a clear performer will do — the timing and the camera path are what get lifted.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/f0ad452c-2254-54cb-932e-d85d0b06dca7.webp",
    },
    {
      title: "Add your cast",
      body: "One image, face and body visible. That is who performs the movement you just chose.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/24daa737-06d4-530d-b2ff-18f0eeb2c289.webp",
    },
    {
      title: "Choose the setting",
      body: "Keep the original location, or take the background from your character's image instead.",
      poster:
        "https://cdn.higgsfield.ai/higgsfield_multiplier_video_explore_variant/f32779dd-b4be-5f1d-ac1f-71f59b92d476.webp",
    },
  ],
};
