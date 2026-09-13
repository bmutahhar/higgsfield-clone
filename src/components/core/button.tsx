import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/*
 * Primary action control. Pill for marketing CTAs, 10px radius in product.
 *
 * All interaction state is CSS: hover is one step lighter (never a hue
 * change), press is a scale (never a ripple), focus is the lime ring. No React
 * state, so this stays a server component and costs no re-renders.
 */
const button = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "border font-medium tracking-[-0.005em]",
    "transition-[background-color,color,border-color,transform,opacity]",
    "duration-[140ms] ease-snap motion-reduce:duration-0",
    "focus-visible:shadow-ring focus-visible:outline-none",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-hairline",
    "disabled:bg-n-4 disabled:opacity-45",
    "aria-busy:pointer-events-none aria-busy:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-accent text-on-accent hover:bg-accent-hover",
        secondary: "border-hairline bg-n-4 text-primary hover:bg-n-5",
        ghost: "border-transparent bg-transparent text-secondary hover:bg-w-06",
        outline: "border-strong bg-transparent text-primary hover:bg-w-06",
        glass: "border-w-16 bg-white/10 text-primary hover:bg-white/20",
        danger: "border-transparent bg-danger text-white hover:bg-[#FF6666]",
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
const SPINNER_SIZE = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-[18px]",
  xl: "size-5",
} as const;

export type ButtonVariant = NonNullable<VariantProps<typeof button>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof button>["size"]>;

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">,
    VariantProps<typeof button> {
  children?: ReactNode;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant,
  size,
  pill,
  fullWidth,
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const glyph = GLYPH_SIZE[size ?? "md"];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(button({ variant, size, pill, fullWidth }), className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className={cn(
            "animate-spin rounded-full border-2 border-current border-t-transparent",
            "motion-reduce:animate-none",
            SPINNER_SIZE[size ?? "md"],
          )}
        />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={glyph} />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={glyph} /> : null}
    </button>
  );
}
