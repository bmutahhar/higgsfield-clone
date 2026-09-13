"use client";

import Image from "next/image";

import { useAuth } from "@/features/auth/auth-context";

/*
 * The History tab.
 *
 * Signed out the live studio does not leave this blank — it runs a three-step
 * onboarding here, and only swaps in your generations once you have a session.
 * An earlier version of this file asserted the opposite; that was checked
 * against the live page by selecting the tab with no session, and it is wrong.
 *
 * The header's zoom and layout controls are rendered by the pane, since they
 * belong to the toolbar rather than to this panel.
 */
const CDN =
  "https://higgsfield.ai/cdn-cgi/image/fit=scale-down,format=webp,onerror=redirect,width=1920,quality=85/https://static.higgsfield.ai/feed/";

const STEPS = [
  {
    id: "add-image",
    title: "Add image",
    body: "Upload or generate an image to start your animation",
    poster: `${CDN}step-1-v2.webp`,
    video: null,
  },
  {
    id: "choose-preset",
    title: "Choose preset",
    body: "Pick a preset to control your image movement",
    poster: `${CDN}step2-thumbnail.webp`,
    video: "https://static.higgsfield.ai/feed/step-2.mp4",
  },
  {
    id: "get-video",
    title: "Get video",
    body: "Click generate to create your final animated video!",
    poster: `${CDN}step-3-thumbnail.webp`,
    video: "https://static.higgsfield.ai/feed/step-3.mp4",
  },
] as const;

export function HistoryPanel() {
  const { user } = useAuth();

  if (user) {
    /*
     * Signed in this is where your generations go. There are none in this
     * clone yet, so the canvas stays empty rather than showing fixtures that
     * are not yours.
     */
    return (
      <div
        role="status"
        aria-label="No generations yet"
        className="min-h-full w-full"
      />
    );
  }

  return (
    <section className="flex w-full flex-col self-start px-8 py-24">
      <header className="mb-8">
        <h2 className="mb-2 font-q-display text-[40px] leading-12 font-bold tracking-[-4%] uppercase">
          Make videos in one click
        </h2>
        <p className="text-sm text-q-soft">
          250+ presets for camera control, framing, and high-quality VFX - or
          use the general preset for manual control.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-10">
        {STEPS.map((step) => (
          <article key={step.id}>
            <figure
              className="relative mb-4 w-full overflow-hidden rounded-2xl"
              // A measured aspect ratio, not one of Tailwind's stops.
              style={{ aspectRatio: "1.31646 / 1" }}
            >
              <Image
                src={step.poster}
                alt=""
                fill
                sizes="(max-width: 1200px) 33vw, 15vw"
                className="object-cover"
              />
              {step.video && (
                <video
                  src={step.video}
                  aria-label={step.title}
                  autoPlay
                  loop
                  playsInline
                  disablePictureInPicture
                  preload="none"
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </figure>
            <h3 className="mb-2 font-q-display text-xl leading-7 font-bold tracking-[-4%] uppercase">
              {step.title}
            </h3>
            <p className="text-sm text-q-soft">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
