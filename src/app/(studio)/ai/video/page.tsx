import { GenjutsuStudio } from "@/components/studio/genjutsu-studio";
import { VIDEO_MODELS } from "@/config/models";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI Videos from Text & Image | Higgsfield",
  description:
    "Reuse a performance you already have: recast it, move it, or swap a single element and keep the rest of the take.",
};

/**
 * The video studio. Routing only — it resolves the model from the query string
 * and hands off; everything else lives in the studio components.
 */
export default async function VideoStudioPage(props: PageProps<"/ai/video">) {
  const { model } = await props.searchParams;
  const requested = Array.isArray(model) ? model[0] : model;
  // An unknown or absent model falls back to Genjutsu rather than rendering an
  // empty form, so a hand-edited URL degrades instead of breaking.
  const known = VIDEO_MODELS.some((m) => m.id === requested);

  return (
    <GenjutsuStudio modelId={known && requested ? requested : "genjutsu"} />
  );
}
