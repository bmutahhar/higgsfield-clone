import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export type SegmentItem =
  string | { value: string; label: string; icon?: IconName };

export interface SegmentedControlProps {
  items?: SegmentItem[];
  value?: string;
  onChange?: (next: string) => void;
  size?: "sm" | "md";
  className?: string;
}

/** Selection inverts to a white fill with black text, never a lime fill. */
export function SegmentedControl({
  items = [],
  value,
  onChange,
  size = "md",
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex gap-0.5 rounded-full border border-hairline bg-w-06 p-[3px]",
        size === "sm" ? "h-[34px]" : "h-[42px]",
        className,
      )}
    >
      {items.map((item) => {
        const segment =
          typeof item === "string" ? { value: item, label: item } : item;
        const active = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(segment.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5 font-medium",
              "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
              "focus-visible:shadow-ring focus-visible:outline-none",
              size === "sm" ? "h-7 text-caption" : "h-9 text-body-sm",
              active
                ? "bg-n-12 text-n-0"
                : "bg-transparent text-secondary hover:bg-w-06",
            )}
          >
            {"icon" in segment && segment.icon && (
              <Icon name={segment.icon} size={14} />
            )}
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
