import { Icon } from "@/components/core/icon";
import { ModelRow } from "@/components/pricing/model-row";
import type { ModelRow as ModelRowData } from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * "UNLIMITED & FREE GENS".
 *
 * On Basic the entire panel is dimmed to 60% rather than restyled row by row —
 * the plan has no unlimited models, and the live card says so by turning the
 * lights down on the whole thing. Worth copying exactly: a per-row dim reads
 * as "some of these apply", which is the wrong message.
 */
interface UnlimitedPanelProps {
  rows: ModelRowData[];
  footer?: string;
  dimmed?: boolean;
  className?: string;
}

export function UnlimitedPanel({
  rows,
  footer,
  dimmed = false,
  className,
}: UnlimitedPanelProps) {
  return (
    <div
      className={cn(
        "q-panel-floor rounded-q-300 border border-q-subtle bg-q-card-strong",
        "flex flex-col gap-1 px-3 pt-3 pb-1",
        dimmed && "opacity-60",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon
            name="infinity"
            size={16}
            className={dimmed ? "text-q-w-40" : "text-q-brand"}
          />
          <span
            className={cn(
              "text-sm leading-5 font-bold tracking-[-0.04em] uppercase",
              dimmed ? "text-q-w-40" : "text-white",
            )}
          >
            Unlimited &amp; free gens
          </span>
        </div>
        <button
          type="button"
          aria-label="About unlimited and free generations"
          className={cn(
            "grid size-6 place-items-center rounded-full text-q-w-40",
            "hover:text-white",
            "transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
          )}
        >
          <Icon name="circle-help" size={16} />
        </button>
      </div>

      <div className="flex flex-col">
        {rows.map((row, index) => (
          <ModelRow
            key={row.name}
            row={row}
            divided={index < rows.length - 1}
          />
        ))}
      </div>

      {footer ? (
        <button
          type="button"
          className={cn(
            "flex items-center justify-between py-2.5 text-left text-q-brand",
            "text-xs leading-4",
            "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-q-focus",
          )}
        >
          {footer}
          <Icon name="chevron-right" size={14} />
        </button>
      ) : null}
    </div>
  );
}
