import { AudioStudio } from "@/components/audio-studio/audio-studio";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Over & Voice Translation | Higgsfield",
  description:
    "Turn a script into lifelike speech, swap the voice on a take you already have, or dub a clip into another language.",
};

/**
 * The audio studio. Routing only — and unlike `/ai/video` there is no
 * `?model=` to resolve, because the reference deep-links no model here and
 * inventing one would be a divergence.
 */
export default function AudioStudioPage() {
  return <AudioStudio />;
}
