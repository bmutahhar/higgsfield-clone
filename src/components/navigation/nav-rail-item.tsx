import type { ButtonHTMLAttributes } from "react";

import { Badge } from "@/components/core/badge";
import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface NavRailItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  icon: IconName;
  label: string;
  active?: boolean;
  /** 72px rail collapsed, 248px expanded. */
  expanded?: boolean;
  badge?: string;
  className?: string;
}

/** Active nav is a 12%-white fill, not lime. */
export function NavRailItem({
  icon,
  label,
  active = false,
  expanded = false,
  badge,
  className,
  ...rest
}: NavRailItemProps) {
  return (
    <button
      type="button"
      title={expanded ? undefined : label}
      aria-label={expanded ? undefined : label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-control border-none",
        "text-body-sm font-medium transition-colors duration-[140ms] ease-snap",
        "focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0",
        expanded ? "justify-start px-3" : "justify-center px-0",
        active
          ? "bg-w-12 text-primary"
          : "bg-transparent text-muted hover:bg-w-06",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={20} />
      {expanded && (
        <>
          <span className="whitespace-nowrap">{label}</span>
          {badge && (
            <span className="ml-auto">
              <Badge>{badge}</Badge>
            </span>
          )}
        </>
      )}
    </button>
  );
}
