import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/*
 * The slanted chip: "21% OFF", "Best value", "New", "50% CHEAPER".
 *
 * Two details carry the whole look and both are easy to miss.
 *
 * 1. The chip is skewed, the label is skewed back. A single -10.89° skew on
 *    the wrapper would italicise the type as well; the counter-skew on the
 *    inner span keeps the letterforms upright inside a parallelogram. That
 *    contrast — slanted box, straight text — is the badge.
 * 2. "Best value" is not a flat blue. It is a radial whose light source sits
 *    just below the bottom edge, so the chip reads as lit from underneath.
 *
 * 10.89° is the live value (`matrix(1, 0, -0.192389, 1, 0, 0)`), not a round
 * number someone picked.
 */
const badge = cva(
  [
    "inline-flex h-4 shrink-0 items-center justify-center gap-0.5",
    "font-q-display text-q-badge uppercase",
    "-skew-x-[10.89deg]",
  ],
  {
    variants: {
      tone: {
        pink: "bg-q-pink text-white",
        best: "q-badge-best text-white",
        lime: "bg-q-accent text-q-inverse",
        neutral: "bg-q-w-10 text-white",
      },
      /*
       * `chip` is the card badge — a 2px corner tight against the plan name.
       * `soft` is the one inside the billing switch: rounder, wider padding
       * and a drop shadow, because it sits on a busy control rather than on a
       * flat card.
       */
      shape: {
        chip: "rounded-q-100 pl-1 pr-1.5",
        soft: "rounded-q-100 px-1.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]",
      },
    },
    defaultVariants: { tone: "pink", shape: "chip" },
  },
);

interface DiscountBadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  /** Rendered before the label, inside the skewed box. Keep it ≤ 10px. */
  icon?: ReactNode;
  className?: string;
}

export function DiscountBadge({
  children,
  icon,
  tone,
  shape,
  className,
}: DiscountBadgeProps) {
  return (
    <span className={cn(badge({ tone, shape }), className)}>
      {icon ? (
        <span className="flex skew-x-[10.89deg] items-center">{icon}</span>
      ) : null}
      <span className="skew-x-[10.89deg] whitespace-nowrap">{children}</span>
    </span>
  );
}
