import Image from "next/image";

import { Icon } from "@/components/core/icon";
import { VideoPromptPanel } from "@/components/studio/video-prompt-panel";
import { PRESETS } from "@/config/media";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI Videos from Text & Image | Higgsfield",
  description: "Generate video from a prompt, an image or another clip.",
};

const STEPS = [
  {
    title: "Add image",
    blurb: "Upload or generate an image to start your animation",
    offset: 0,
  },
  {
    title: "Choose preset",
    blurb: "Pick a preset to control your image movement",
    offset: 5,
  },
  {
    title: "Get video",
    blurb: "Click generate to create your final animated video",
    offset: 9,
  },
];

export default function VideoStudioPage() {
  return (
    <div className="flex min-h-0 flex-1">
      <VideoPromptPanel />

      <div className="hf-scrollbar min-w-0 flex-1 overflow-y-auto p-4">
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

        <div className="mt-8 rounded-panel border border-hairline bg-w-04 p-10">
          <h1 className="text-h1 uppercase">Make videos in one click</h1>
          <p className="mt-2 max-w-160 text-body-sm text-muted">
            250+ presets for camera control, framing and VFX — or use the
            general preset for manual control.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title}>
                <div className="relative aspect-video overflow-hidden rounded-media border border-hairline bg-n-3">
                  <Image
                    src={PRESETS[step.offset]?.poster ?? ""}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <h2 className="mt-3 text-body font-semibold uppercase">
                  {step.title}
                </h2>
                <p className="mt-1 text-body-sm text-muted">{step.blurb}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-panel border border-hairline bg-w-04 p-4">
          <div className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-media sm:block">
            <Image
              src={PRESETS[2]?.poster ?? ""}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-body-sm font-medium">
              Don’t know where to start?
            </p>
            <p className="mt-0.5 text-caption text-muted">
              Go to the Academy and start your journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
