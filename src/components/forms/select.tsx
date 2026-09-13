import type { ReactNode, SelectHTMLAttributes } from "react";

import { Icon } from "@/components/core/icon";
import { CONTROL_HEIGHT, type ControlSize } from "@/components/forms/input";
import { cn } from "@/lib/cn";

export type SelectOption = string | { value: string; label: string };

function normalize(option: SelectOption): { value: string; label: string } {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "className"
> {
  label?: ReactNode;
  options?: SelectOption[];
  size?: ControlSize;
  className?: string;
}

export function Select({
  label,
  options = [],
  size = "md",
  className,
  ...rest
}: SelectProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-body-sm font-medium text-secondary">{label}</span>
      )}
      <span
        className={cn(
          "relative flex items-center rounded-control border border-input-border bg-input",
          "transition-[border-color,box-shadow] duration-[140ms] ease-snap",
          "focus-within:border-lime focus-within:shadow-ring motion-reduce:duration-0",
          CONTROL_HEIGHT[size],
        )}
      >
        <select
          className={cn(
            "h-full flex-1 cursor-pointer appearance-none border-none bg-transparent",
            "pr-[34px] pl-3 text-body text-primary outline-none",
          )}
          {...rest}
        >
          {options.map((option) => {
            const opt = normalize(option);
            return (
              <option key={opt.value} value={opt.value} className="bg-n-3">
                {opt.label}
              </option>
            );
          })}
        </select>
        <Icon
          name="chevron-down"
          size={16}
          className="pointer-events-none absolute right-2.5 text-muted"
        />
      </span>
    </label>
  );
}
