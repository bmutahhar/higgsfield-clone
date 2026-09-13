import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import { cn } from "@/lib/cn";

/*
 * The promo banner above the plans.
 *
 * Four stacked layers, and the order matters: an inset hairline ring on the
 * section itself, then a 10px dot grid with a pink wash rising off the floor,
 * then a 64px pink bloom thrown inward from the top edge, then the content.
 * Flattening any of them into a single background loses the depth — the bloom
 * in particular has to be an inset shadow, not a gradient, so it hugs the
 * rounded corners.
 *
 * The whole card is one click target: a transparent button covers it at z-20
 * and the visible button inside is decorative. One tab stop, not two.
 */
interface CountdownBannerProps {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  body: string;
  cta: string;
  onActivate?: () => void;
  className?: string;
}

export function CountdownBanner({
  eyebrow,
  headline,
  headlineAccent,
  body,
  cta,
  onActivate,
  className,
}: CountdownBannerProps) {
  return (
    <section
      className={cn(
        "relative isolate mx-auto mb-4 w-full max-w-[var(--q-pricing-column)]",
        "overflow-hidden rounded-q-400 p-4 lg:rounded-q-600 lg:p-6",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.12)]",
        "md:-mt-4",
        className,
      )}
    >
      <div
        aria-hidden
        className="q-promo-texture pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_64px_0_rgba(237,21,114,0.24)]"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex flex-col items-start gap-4">
          <DiscountBadge icon={<Icon name="tag" size={10} />}>
            {eyebrow}
          </DiscountBadge>

          <div className="flex flex-col gap-3">
            <h2 className="flex flex-col font-q-display text-[36px] leading-10 font-bold tracking-[-1.44px] uppercase">
              <span className="text-q-pink">{headlineAccent}</span>
              <span className="text-white">{headline}</span>
            </h2>
            <p className="text-q-body-sm text-q-idle-soft">{body}</p>
          </div>

          {/*
           * Decorative: the overlay below owns the interaction. Hidden from
           * the tab order and the accessibility tree so the banner announces
           * once, as one control.
           */}
          <span
            aria-hidden
            className={cn(
              "inline-grid place-items-center rounded-q-250 bg-white px-4 pt-2 pb-2.5",
              "text-q-body-sm font-semibold text-[#1a1a1a]",
              "shadow-[inset_0_-3px_0_0_var(--q-shadow-key-line),var(--shadow-q-key)]",
            )}
          >
            {cta}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "absolute inset-0 z-20 rounded-[inherit]",
          "transition-colors hover:bg-q-w-03 motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-q-focus",
        )}
      >
        <span className="sr-only">{cta}</span>
      </button>
    </section>
  );
}
