"use client";

import { Icon, type IconName } from "@/components/core/icon";
import { Dropdown, DropdownItem } from "@/components/studio/dropdown";
import { cn } from "@/lib/cn";

export interface OptionPillProps {
  icon?: IconName;
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
  /** Renders the chevron and a heading row, as the Bitrate control does. */
  variant?: "pill" | "row";
  className?: string;
}

/** The small settings controls in both generation bars. */
export function OptionPill({
  icon,
  label,
  value,
  options,
  onChange,
  variant = "pill",
  className,
}: OptionPillProps) {
  return (
    <Dropdown
      label={label}
      width={168}
      triggerClassName={cn(
        "flex items-center gap-1.5 rounded-lg border border-hairline bg-w-06 text-[13px]",
        "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
        "hover:border-strong focus-visible:shadow-ring focus-visible:outline-none",
        variant === "row" ? "h-9 w-full justify-between px-2.5" : "h-8 px-2.5",
        className,
      )}
      trigger={
        <>
          {icon && <Icon name={icon} size={13} className="text-muted" />}
          {variant === "row" && <span className="text-muted">{label}</span>}
          <span className={cn("text-primary", variant === "row" && "ml-auto")}>
            {value}
          </span>
          <Icon name="chevron-down" size={12} className="text-muted" />
        </>
      }
    >
      {(close) =>
        options.map((option) => (
          <DropdownItem
            key={option}
            selected={option === value}
            onSelect={() => {
              onChange(option);
              close();
            }}
          >
            {option}
            {option === value && (
              <Icon name="check" size={14} className="ml-auto text-lime" />
            )}
          </DropdownItem>
        ))
      }
    </Dropdown>
  );
}
