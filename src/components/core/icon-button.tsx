import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/** Where a control floats over media it becomes a glass capsule, not a scrim. */
const iconButton = cva(
  [
    "inline-flex items-center justify-center border p-0",
    "transition-[background-color,color,border-color,transform,opacity]",
    "duration-[140ms] ease-snap motion-reduce:duration-0",
    "focus-visible:shadow-ring focus-visible:outline-none",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
    // Active nav is a 12%-white fill, never lime.
    "aria-pressed:bg-w-12 aria-pressed:text-primary",
  ],
  {
    variants: {
      variant: {
        ghost: "border-transparent bg-transparent text-secondary hover:bg-w-06",
        solid: "border-hairline bg-n-4 text-primary hover:bg-n-5",
        glass: "border-w-16 bg-black/45 text-white hover:bg-black/65",
        accent:
          "border-transparent bg-accent text-on-accent hover:bg-accent-hover",
      },
      size: { sm: "size-7", md: "size-9", lg: "size-11" },
      pill: { true: "rounded-full", false: "rounded-control" },
    },
    defaultVariants: { variant: "ghost", size: "md", pill: true },
  },
);

const GLYPH_SIZE = { sm: 16, md: 20, lg: 22 } as const;

export type IconButtonVariant = NonNullable<
  VariantProps<typeof iconButton>["variant"]
>;

export interface IconButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">,
    VariantProps<typeof iconButton> {
  icon: IconName;
  /** Accessible label — required, also used as the native tooltip. */
  label: string;
  active?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  label,
  variant,
  size,
  pill,
  active = false,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={cn(iconButton({ variant, size, pill }), className)}
      {...rest}
    >
      <Icon name={icon} size={GLYPH_SIZE[size ?? "md"]} />
    </button>
  );
}
