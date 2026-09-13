import Link from "next/link";

import { ButtonLink } from "@/components/core/button-link";
import { Avatar } from "@/components/display/avatar";
import { MediaCard } from "@/components/display/media-card";
import { HERO, PRESETS } from "@/config/media";
import { COMMUNITY_PROJECTS } from "@/config/site";

/** Eight community projects, each crediting its studio with a Public marker. */
export function CommunityGrid() {
  return (
    <section className="px-4 pt-16 lg:px-6">
      <h2 className="text-h1 uppercase">Explore the inside of every project</h2>
      <p className="mt-2 text-body-sm text-muted">
        See all prompts, assets, and how each project was created
      </p>

      <div className="mt-4 grid gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITY_PROJECTS.map((title, n) => {
          const preset = PRESETS[(n + 3) % PRESETS.length];
          return (
            <Link key={title} href={`/projects/${preset?.slug ?? ""}`}>
              <MediaCard
                poster={preset?.poster}
                video={HERO[n % HERO.length]?.video}
                ratio="16 / 9"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="mt-2.5 flex items-center gap-2">
                <Avatar name="Higgsfield Studio" size={22} />
                <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-primary">
                  {title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-w-06 px-2 py-0.5 text-[10px] text-muted">
                  Public
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <ButtonLink
          href="/explore"
          pill
          variant="secondary"
          iconRight="arrow-up-right"
        >
          Explore community
        </ButtonLink>
      </div>
    </section>
  );
}
