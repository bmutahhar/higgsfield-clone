import Image from "next/image";

import { Button } from "@/components/core/button";
import { ButtonLink } from "@/components/core/button-link";
import { HERO } from "@/config/media";

const SECTION = "mx-auto max-w-[var(--max-content)] px-8";

export function FeatureSplit() {
  const hero = HERO[2];

  return (
    <section className={`${SECTION} pt-22`}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="hf-eyebrow mb-3">New model</div>
          <h2 className="text-display-2 uppercase">Higgsfield Genjutsu</h2>
          <p className="mt-4 text-body-lg text-secondary">
            Reality Manipulation — transfer motion into new scenes, or swap
            details while everything else stays as filmed.
          </p>
          <div className="mt-6 flex gap-2.5">
            <ButtonLink href="/ai/video" pill size="lg">
              Start generating
            </ButtonLink>
            <Button pill size="lg" variant="outline">
              Learn more
            </Button>
          </div>
        </div>
        {/* The still is a real <Image> underneath rather than the video's
            poster attribute: a poster only paints once the element starts
            loading, so a deferred or blocked video left the panel empty. */}
        <div className="relative aspect-4/3 overflow-hidden rounded-panel bg-n-3 shadow-[var(--inset-hairline)]">
          {hero && (
            <>
              <Image
                src={hero.poster}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <video
                src={hero.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
