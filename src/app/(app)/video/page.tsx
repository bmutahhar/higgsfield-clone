import { VideoStudio } from "@/components/studio/video-studio";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video · Higgsfield",
  description: "Generate video from a prompt, an image or another clip.",
};

export default function VideoPage() {
  return <VideoStudio />;
}
