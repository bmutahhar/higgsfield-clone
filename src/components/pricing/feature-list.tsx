import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import type { FeatureRow } from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * The flat list at the foot of a plan card.
 *
 * Ink is semantic and there are exactly three values. The odd one out is the
 * pale blue on "Access to Supercomputer" — it is the only info-coloured row
 * anywhere on the page, and it is not an accident of a hover state.
 */
const INK: Record<FeatureRow["state"], string> = {
  on: "text-white",
  info: "text-q-info",
  off: "text-q-w-30",
};

const GLYPH: Record<FeatureRow["state"], string> = {
  on: "text-q-brand",
  info: "text-q-info",
  off: "text-q-w-30",
};

export function FeatureList({
  features,
  className,
}: {
  features: FeatureRow[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {features.map((feature) => {
        const body = (
          <>
            <Icon
              name={feature.state === "off" ? "x" : "check"}
              size={16}
              className={GLYPH[feature.state]}
            />
            <span className={cn("text-xs leading-4", INK[feature.state])}>
              {feature.label}
            </span>
            {feature.badge ? (
              <DiscountBadge
                tone={feature.badge.tone === "pink" ? "pink" : "lime"}
              >
                {feature.badge.label}
              </DiscountBadge>
            ) : null}
          </>
        );

        return (
          <li key={feature.label} className="flex items-center gap-1">
            {/*
             * Rows that open an explainer are buttons on the live site; the
             * rest are plain text. Making them all buttons would put seven
             * dead tab stops on every card.
             */}
            {feature.interactive ? (
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 text-left",
                  "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
                )}
              >
                {body}
              </button>
            ) : (
              <span className="flex items-center gap-1">{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
