import { Button } from "@/components/core/button";
import { MediaCard } from "@/components/display/media-card";
import { ComingSoon } from "@/components/overlays/coming-soon";
import { HERO, PRESETS } from "@/config/media";

/**
 * The preset wall: a dense 3:4 grid at the system's tight 12px media gap,
 * each tile revealing a Recreate action on hover.
 *
 * Both CTAs used to open `/effects`. That route is gone, so they take the
 * inert treatment the header gives an unbuilt surface rather than linking to
 * a 404 — a disabled Button inside a "Coming soon" bubble.
 *
 * The dimming is the button's own `disabled:opacity-45`, which the rule in
 * `ComingSoon` does not cover: that rule is about a class landing on the
 * wrapper span, an ancestor of the bubble. Here it lands on the button, the
 * bubble's *sibling*, so the bubble neither fades with it nor gets trapped in
 * its stacking context. `disabled:pointer-events-none` then passes the hover
 * up to the wrapper, which is the group the bubble listens to.
 */
export function EffectsWall() {
  return (
    <section className="px-4 pt-16 lg:px-6">
      <div className="mb-4 flex items-end gap-4">
        <div>
          <h2 className="text-h1 uppercase">Visual effects</h2>
          <p className="mt-2 text-body-sm text-muted">
            Big-budget visual effects, from explosions to surreal
            transformations.
          </p>
        </div>
        <span className="flex-1" />
        <ComingSoon>
          <Button disabled pill>
            Try for free
          </Button>
        </ComingSoon>
      </div>

      <div className="grid grid-cols-2 gap-[var(--grid-gap)] sm:grid-cols-3 lg:grid-cols-5">
        {PRESETS.map((preset, n) => (
          <MediaCard
            key={preset.slug}
            poster={preset.poster}
            video={HERO[n % HERO.length]?.video}
            title={preset.name.toUpperCase()}
            ratio="3 / 4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            action={
              <Button size="sm" pill iconLeft="sparkles">
                Recreate
              </Button>
            }
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <ComingSoon>
          <Button disabled pill variant="secondary" iconRight="arrow-up-right">
            View all presets
          </Button>
        </ComingSoon>
      </div>
    </section>
  );
}
