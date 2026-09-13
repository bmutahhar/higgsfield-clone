import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/*
 * Every call to action on the pricing page is the same object: a "key cap".
 *
 * An inset line along the bottom edge does the work of a bevel, then two very
 * soft falls (6px and 32px) lift it off the card. The inset colour changes per
 * plan — a lime button gets an olive line, not a black one, or the bottom edge
 * reads as dirt rather than shade.
 *
 * The only hover is `brightness(1.1)`. Measured at rest and at settled hover
 * on the live site: no lift, no shadow change, no colour swap. Resist adding
 * one — the page's restraint here is deliberate and consistent across all
 * seven CTAs.
 */
const cta = cva(
  [
    "relative w-full cursor-pointer overflow-hidden",
    "flex items-center justify-center gap-2",
    "rounded-q-250 text-sm leading-5 font-semibold",
    "transition-[filter,opacity] duration-150 motion-reduce:transition-none",
    "hover:brightness-110",
    "focus-visible:outline-q-focus focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
  ],
  {
    variants: {
      tone: {
        /* BASIC, TEAM, ENTERPRISE — plain white. */
        white:
          "bg-white text-q-inverse shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.1),var(--shadow-q-key)]",
        /* PRO — lime with a vertical sheen and an olive lip. */
        lime: "q-cta-lime text-q-inverse shadow-[inset_0_-3px_0_0_var(--q-brand-lime-line),var(--shadow-q-key)]",
        /* MAX — pink, sheen tipped 182.4° so the highlight sits low-left. */
        pink: "q-cta-pink text-white shadow-[inset_0_-3px_0_0_var(--q-shadow-key-line),var(--shadow-q-key)]",
        /* SCALE — the one blue button on the page. */
        blue: "q-cta-blue text-white shadow-[inset_0_-3px_0_0_var(--q-shadow-key-line),var(--shadow-q-key)]",
      },
      size: {
        /* The card CTA. 48px, and the inset line means no bottom padding
           compensation — the label sits optically centred already. */
        md: "h-12",
        /* The mobile sticky bar. Taller, rounder, bigger type. */
        lg: "h-13 rounded-q-400 text-base leading-5",
      },
    },
    defaultVariants: { tone: "white", size: "md" },
  },
);

interface PlanCtaProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof cta> {
  children: ReactNode;
}

export function PlanCta({
  children,
  tone,
  size,
  className,
  type = "button",
  ...rest
}: PlanCtaProps) {
  return (
    <button
      type={type}
      className={cn(cta({ tone, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
