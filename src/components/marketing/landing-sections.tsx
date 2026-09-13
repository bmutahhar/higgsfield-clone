import Image from "next/image";

import { Button } from "@/components/core/button";
import { ButtonLink } from "@/components/core/button-link";
import { Avatar } from "@/components/display/avatar";
import { MediaCard } from "@/components/display/media-card";
import { ModelCard } from "@/components/display/model-card";
import { HERO, PRESETS } from "@/config/media";

const SECTION = "mx-auto max-w-[var(--max-content)] px-8";

export function ModelStrip() {
  return (
    <section className={`${SECTION} pt-16`}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ModelCard
          name="Seedance 2.5"
          blurb="The most advanced video model"
          badge="Top"
          kind="Video"
          poster={HERO[2]?.poster}
        />
        <ModelCard
          name="Nano Banana Pro"
          blurb="Generate high-quality visuals"
          kind="Image"
          poster={HERO[3]?.poster}
        />
        <ModelCard
          name="Higgsfield Genjutsu"
          blurb="One video, many versions"
          badge="New"
          kind="Video"
          poster={HERO[1]?.poster}
        />
        <ModelCard
          name="Supercomputer"
          blurb="Agent powered by GPT-6 Astra"
          kind="Agent"
          poster={HERO[4]?.poster}
        />
      </div>
    </section>
  );
}

export function PresetWall() {
  return (
    <section className={`${SECTION} pt-18`}>
      <div className="mb-4.5 flex items-end">
        <div>
          <div className="hf-eyebrow mb-2.5">Effects</div>
          <h2 className="text-display-3">Viral presets, one click</h2>
        </div>
        <span className="flex-1" />
        <ButtonLink href="/effects" variant="ghost" iconRight="arrow-right">
          View all presets
        </ButtonLink>
      </div>
      <div className="grid grid-cols-2 gap-[var(--grid-gap)] sm:grid-cols-3 xl:grid-cols-5">
        {PRESETS.slice(0, 10).map((preset, n) => (
          <MediaCard
            key={preset.slug}
            poster={preset.poster}
            video={HERO[n % HERO.length]?.video}
            title={preset.name}
            ratio="3 / 4"
            badge={n === 0 ? "New" : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
            action={
              <Button size="sm" pill>
                Recreate
              </Button>
            }
          />
        ))}
      </div>
    </section>
  );
}

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
            <ButtonLink href="/video" pill size="lg">
              Start generating
            </ButtonLink>
            <Button pill size="lg" variant="outline">
              Learn more
            </Button>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-panel shadow-[var(--inset-hairline)]">
          {hero && (
            <video
              src={hero.video}
              poster={hero.poster}
              autoPlay
              muted
              loop
              playsInline
              className="size-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}

const COMMUNITY = ["Red Flag", "Kok Boru", "ONEIRIC", "HELL GRIND"];

export function CommunityStrip() {
  return (
    <section className={`${SECTION} pt-22`}>
      <h2 className="text-h1">Explore the inside of every project</h2>
      <p className="mt-2 text-body text-muted">
        See all prompts, assets, and how each project was created
      </p>
      <div className="mt-5 grid gap-[var(--grid-gap)] sm:grid-cols-2 xl:grid-cols-4">
        {COMMUNITY.map((title, n) => (
          <div key={title}>
            <MediaCard
              poster={PRESETS[n + 8]?.poster}
              video={HERO[n % HERO.length]?.video}
              ratio="16 / 9"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
            <div className="mt-2.5 flex items-center gap-2.25">
              <Avatar name="Higgsfield Studio" size={24} />
              <span>
                <span className="block text-body-sm/[1.2] font-medium">
                  {title}
                </span>
                <span className="mt-[3px] block text-caption text-muted">
                  Higgsfield Studio · Public
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AgentBanner() {
  return (
    <section className={`${SECTION} pt-22`}>
      <div className="relative flex min-h-65 items-center overflow-hidden rounded-panel p-10">
        {HERO[4] && (
          <Image
            src={HERO[4].poster}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <span className="absolute inset-0 bg-linear-to-r from-page/95 to-page/35" />
        <div className="relative max-w-130">
          <div className="hf-eyebrow mb-3">Supercomputer</div>
          <h2 className="text-h1">
            One superagent for your entire creative stack
          </h2>
          <div className="mt-5.5">
            <ButtonLink href="/explore" pill size="lg">
              Try Supercomputer
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
