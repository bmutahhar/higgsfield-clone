import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface TagProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  children?: ReactNode;
  /** Lucide icon name shown before the label. */
  icon?: IconName;
  selected?: boolean;
  onRemove?: () => void;
  className?: string;
}

/*
 * Selection inverts to a white fill with black text — never a lime fill, which
 * is reserved for actions.
 *
 * Renders as a <button> when interactive so keyboard and screen-reader support
 * come from the platform; the design system used a clickable <span>.
 */
export function Tag({
  children,
  icon,
  selected = false,
  onRemove,
  onClick,
  className,
  type = "button",
  ...rest
}: TagProps) {
  const interactive = Boolean(onClick);

  const content = (
    <>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </>
  );

  const classes = cn(
    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5",
    "text-body-sm font-medium whitespace-nowrap",
    "transition-[background-color,color,border-color] duration-[140ms] ease-snap",
    "motion-reduce:duration-0 focus-visible:shadow-ring focus-visible:outline-none",
    selected
      ? "border-transparent bg-n-12 text-n-0"
      : "border-hairline bg-w-06 text-secondary",
    interactive && !selected && "hover:bg-w-12",
    className,
  );

  const removeButton = onRemove ? (
    <button
      type="button"
      aria-label="Remove"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="inline-flex opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
    >
      <Icon name="x" size={12} />
    </button>
  ) : null;

  if (!interactive) {
    return (
      <span className={classes}>
        {content}
        {removeButton}
      </span>
    );
  }

  return (
    <span className={classes}>
      <button
        type={type}
        aria-pressed={selected}
        onClick={onClick}
        className="inline-flex items-center gap-1.5 focus-visible:outline-none"
        {...rest}
      >
        {content}
      </button>
      {removeButton}
    </span>
  );
}
