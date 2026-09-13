import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/** Badges are one word, uppercase: NEW, TOP, PRO. */
const badge = cva(
  "inline-flex h-5 items-center self-start rounded-full border px-2 text-micro font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        accent: "border-transparent bg-accent text-on-accent",
        soft: "border-accent-ring bg-accent-soft text-lime",
        neutral: "border-transparent bg-w-08 text-secondary",
        outline: "border-strong bg-transparent text-secondary",
        glass: "border-w-16 bg-b-60 text-white",
        sand: "border-transparent bg-sand text-n-0",
      },
      uppercase: {
        true: "tracking-[0.06em] uppercase",
        false: "tracking-normal normal-case",
      },
    },
    defaultVariants: { tone: "accent", uppercase: true },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badge>["tone"]>;

export interface BadgeProps extends VariantProps<typeof badge> {
  children?: ReactNode;
  className?: string;
}

export function Badge({ children, tone, uppercase, className }: BadgeProps) {
  return (
    <span className={cn(badge({ tone, uppercase }), className)}>
      {children}
    </span>
  );
}
