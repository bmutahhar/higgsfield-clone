import { MotionStudio } from "@/components/studio/motion-studio";
import { videoModelById } from "@/config/models";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motion Control | Higgsfield",
  description:
    "Copy the motion from one clip and perform it with your own character.",
};

/** The motion-control surface. Routing only. */
export default async function MotionControlPage(
  props: PageProps<"/ai/video/motion">,
) {
  const { model } = await props.searchParams;
  const requested = Array.isArray(model) ? model[0] : model;
  const resolved = requested ? videoModelById(requested) : undefined;

  return <MotionStudio modelId={resolved?.id ?? "kling-3-motion-control"} />;
}
