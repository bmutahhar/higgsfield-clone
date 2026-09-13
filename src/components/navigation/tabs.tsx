import { cn } from "@/lib/cn";

export type TabItem = string | { value: string; label: string };

export interface TabsProps {
  items?: TabItem[];
  value?: string;
  onChange?: (next: string) => void;
  className?: string;
}

/** The lime underline is one of the accent's sanctioned uses. */
export function Tabs({ items = [], value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-6 border-b border-hairline", className)}
    >
      {items.map((item) => {
        const tab =
          typeof item === "string" ? { value: item, label: item } : item;
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.value)}
            className={cn(
              "relative cursor-pointer border-none bg-none px-0 pt-0 pb-3",
              "text-body font-medium transition-colors duration-[140ms] ease-snap",
              "focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0",
              active ? "text-primary" : "text-muted hover:text-secondary",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-colors duration-[140ms]",
                active ? "bg-accent" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
