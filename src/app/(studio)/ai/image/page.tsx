import { ImageStudio } from "@/components/image-studio/studio";
import { DEFAULT_MODEL_ID, IMAGE_MODELS } from "@/config/image-studio";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI Images from Text & Photo | Higgsfield",
  description: "Generate images from a prompt or a reference photo.",
};

/*
 * The image studio is two things over one another: a canvas of everything you
 * have made, and a composer floating at its foot. There is no hero and no
 * preset wall — signed in, the page opens straight into your own output.
 *
 * Routing only: it resolves the model from the query string and hands off, the
 * way `/ai/video` does. That query param is what makes every model in the
 * header's hover menu a link rather than a click handler.
 */
export default async function ImageStudioPage(props: PageProps<"/ai/image">) {
  const { model } = await props.searchParams;
  const requested = Array.isArray(model) ? model[0] : model;
  // An unknown or absent model falls back to the catalogue's default rather
  // than leaving the composer unset, so a hand-edited URL degrades instead of
  // breaking.
  const known = IMAGE_MODELS.some((m) => m.id === requested);

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-q-page font-q-ui text-q-body">
      <ImageStudio
        modelId={known && requested ? requested : DEFAULT_MODEL_ID}
      />
    </main>
  );
}
