import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/*
 * Cards are a hairline plus a 14px radius with no shadow at rest. Hover lifts
 * 2px and brightens the border. Never a coloured left border.
 */
const card = cva(
  "rounded-card border border-hairline transition-[border-color,transform,box-shadow] duration-[140ms] ease-snap motion-reduce:duration-0",
  {
    variants: {
      tone: {
        card: "bg-card",
        panel: "bg-panel",
        raised: "bg-raised",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 hover:border-strong hover:shadow-e2",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: { tone: "card", interactive: false, padding: "md" },
  },
);

export interface CardProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "className">,
    VariantProps<typeof card> {
  children?: ReactNode;
  className?: string;
}

export function Card({
  children,
  tone,
  interactive,
  padding,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(card({ tone, interactive, padding }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}
