import { EditStudio } from "@/components/studio/edit-studio";
import { videoModelById } from "@/config/models";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit AI Video | Higgsfield",
  description:
    "Change one thing in a clip you already have and keep the rest of the take.",
};

/**
 * The edit surface. Routing only — it resolves the model from the query string
 * and hands off.
 */
export default async function EditVideoPage(
  props: PageProps<"/ai/video/edit">,
) {
  const { model } = await props.searchParams;
  const requested = Array.isArray(model) ? model[0] : model;
  // `videoModelById` accepts the live route's underscore spelling.
  const resolved = requested ? videoModelById(requested) : undefined;

  return <EditStudio modelId={resolved?.id ?? "seedance-2-5-edit"} />;
}
