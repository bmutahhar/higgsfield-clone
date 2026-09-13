import Image from "next/image";

import { Icon } from "@/components/core/icon";
import { ImageComposer } from "@/components/studio/image-composer";
import { PRESETS } from "@/config/media";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI Images from Text & Photo | Higgsfield",
  description: "Generate images from a prompt or a reference photo.",
};

export default function ImageStudioPage() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="hf-scrollbar min-h-0 flex-1 overflow-y-auto p-4 pb-45">
        <div className="flex gap-2">
          {(
            [
              { icon: "folder", label: "History" },
              { icon: "book-open", label: "How it works" },
            ] as const
          ).map((item) => (
            <button
              key={item.label}
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-w-06 px-2.5 text-[13px] text-secondary transition-colors hover:border-strong hover:text-primary focus-visible:shadow-ring focus-visible:outline-none"
            >
              <Icon name={item.icon} size={13} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-h1 uppercase">Start with a prompt</h1>
          <p className="mx-auto mt-2 max-w-130 text-body-sm text-muted">
            Describe the scene you imagine, or drop in a reference to edit.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-[var(--grid-gap)] sm:grid-cols-3 lg:grid-cols-4">
          {PRESETS.slice(0, 8).map((preset) => (
            <figure
              key={preset.slug}
              className="relative aspect-square overflow-hidden rounded-media border border-hairline bg-n-3"
            >
              <Image
                src={preset.poster}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-[image:var(--scrim-bottom)]" />
              <figcaption className="absolute right-3 bottom-2.5 left-3 truncate font-mono text-mono text-w-80">
                {preset.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <ImageComposer />
    </div>
  );
}
