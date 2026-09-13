import Link from "next/link";

import { ButtonLink } from "@/components/core/button-link";
import { Avatar } from "@/components/display/avatar";
import { MediaCard } from "@/components/display/media-card";
import { ModelCard } from "@/components/display/model-card";
import { HeroRail } from "@/components/explore/hero-rail";
import { PresetGrid } from "@/components/explore/preset-grid";
import { SectionHead } from "@/components/layout/section-head";
import { HERO, PRESETS } from "@/config/media";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore · Higgsfield",
  description:
    "Feed of promo cards, models, viral presets and community projects.",
};

const FILTERS = ["All", "Cinematic", "Character", "Product", "Anime", "Motion"];

export default function ExplorePage() {
  return (
    <div className="px-6 pt-6 pb-16">
      <HeroRail items={HERO} />

      <SectionHead
        eyebrow="Models"
        title="Start with a model"
        action={
          <ButtonLink
            href="/video"
            variant="ghost"
            size="sm"
            iconRight="arrow-right"
          >
            All models
          </ButtonLink>
        }
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <SectionHead
        eyebrow="Presets"
        title="Viral effects"
        action={
          <ButtonLink
            href="/effects"
            variant="ghost"
            size="sm"
            iconRight="arrow-right"
          >
            View all presets
          </ButtonLink>
        }
      />
      <PresetGrid
        presets={PRESETS.slice(0, 10)}
        clips={HERO}
        categories={FILTERS}
        className="mb-8"
      />

      <SectionHead
        eyebrow="Community"
        title="Explore the inside of every project"
        action={
          <ButtonLink
            variant="ghost"
            size="sm"
            iconRight="arrow-right"
            href="/explore"
          >
            Explore community
          </ButtonLink>
        }
      />
      <div className="grid gap-[var(--grid-gap)] sm:grid-cols-2 xl:grid-cols-4">
        {PRESETS.slice(10, 14).map((preset, n) => (
          <Link
            key={preset.slug}
            href={`/projects/${preset.slug}`}
            className="group/project"
          >
            <MediaCard
              poster={preset.poster}
              video={HERO[n % HERO.length]?.video}
              ratio="16 / 9"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
            <div className="mt-2.5 flex items-center gap-2">
              <Avatar name="Higgsfield Studio" size={24} />
              <span className="min-w-0">
                <span className="block truncate text-body-sm/[1.2] font-medium text-primary">
                  {preset.name}
                </span>
                <span className="mt-[3px] block text-caption text-muted">
                  Higgsfield Studio · Public
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
