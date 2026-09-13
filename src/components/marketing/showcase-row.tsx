import { ButtonLink } from "@/components/core/button-link";
import { MediaCard } from "@/components/display/media-card";
import { HERO, PRESETS } from "@/config/media";
import type { Showcase } from "@/config/site";

/**
 * The repeating model-showcase block: uppercase title, one-line blurb, a row
 * of 16:9 generations, and a "View all of X" link. The live page stacks
 * several of these between feature sections.
 */
export function ShowcaseRow({
  title,
  blurb,
  cta,
  offset,
  count = 4,
}: Showcase) {
  const tiles = Array.from({ length: count }, (_, n) => {
    const preset = PRESETS[(offset + n) % PRESETS.length];
    return { preset, clip: HERO[(offset + n) % HERO.length] };
  });

  return (
    <section className="px-4 pt-16 lg:px-6">
      <h2 className="text-h2 uppercase">{title}</h2>
      <p className="mt-2 text-body-sm text-muted">{blurb}</p>

      <div className="mt-4 grid gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ preset, clip }) => (
          <MediaCard
            key={preset?.slug}
            poster={preset?.poster}
            video={clip?.video}
            ratio="16 / 9"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <ButtonLink
          href="/"
          pill
          variant="secondary"
          iconRight="arrow-up-right"
        >
          {cta}
        </ButtonLink>
      </div>
    </section>
  );
}
