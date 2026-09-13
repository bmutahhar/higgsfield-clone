import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/*
 * The anchor form of Button. The design system models this as a polymorphic
 * `as` prop; splitting it keeps both halves correctly typed — a link cannot be
 * disabled or submit a form, and a button has no href.
 */
const buttonLink = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "border font-medium tracking-[-0.005em] no-underline",
    "transition-[background-color,color,border-color,transform,opacity]",
    "duration-[140ms] ease-snap motion-reduce:duration-0",
    "focus-visible:shadow-ring focus-visible:outline-none",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent",
        secondary:
          "border-hairline bg-n-4 text-primary hover:bg-n-5 hover:text-primary",
        ghost: "border-transparent bg-transparent text-secondary hover:bg-w-06",
        outline:
          "border-strong bg-transparent text-primary hover:bg-w-06 hover:text-primary",
        glass:
          "border-w-16 bg-white/10 text-primary hover:bg-white/20 hover:text-primary",
      },
      size: {
        sm: "h-7 gap-1.5 px-3 text-caption",
        md: "h-9 px-4 text-body-sm",
        lg: "h-11 px-[22px] text-body",
        xl: "h-13 gap-2.5 px-7 text-[16px]",
      },
      pill: { true: "rounded-full", false: "rounded-control" },
      fullWidth: { true: "flex w-full", false: "" },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      pill: false,
      fullWidth: false,
    },
  },
);

const GLYPH_SIZE = { sm: 14, md: 16, lg: 18, xl: 20 } as const;

export interface ButtonLinkProps
  extends
    Omit<ComponentProps<typeof Link>, "className">,
    VariantProps<typeof buttonLink> {
  children?: ReactNode;
  iconLeft?: IconName;
  iconRight?: IconName;
  className?: string;
}

export function ButtonLink({
  children,
  variant,
  size,
  pill,
  fullWidth,
  iconLeft,
  iconRight,
  className,
  ...rest
}: ButtonLinkProps) {
  const glyph = GLYPH_SIZE[size ?? "md"];

  return (
    <Link
      className={cn(buttonLink({ variant, size, pill, fullWidth }), className)}
      {...rest}
    >
      {iconLeft ? <Icon name={iconLeft} size={glyph} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={glyph} /> : null}
    </Link>
  );
}
