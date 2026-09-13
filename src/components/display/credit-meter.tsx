import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface CreditMeterProps {
  credits?: number;
  /** When set, draws the remaining-balance bar. */
  total?: number;
  label?: string;
  className?: string;
}

/*
 * Credits are a first-class concept in the top bar. The lime bolt is the only
 * coloured glyph in the system.
 */
export function CreditMeter({
  credits = 0,
  total,
  label = "credits",
  className,
}: CreditMeterProps) {
  const pct = total
    ? Math.max(0, Math.min(100, (credits / total) * 100))
    : null;

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-hairline bg-w-06 px-3",
        className,
      )}
    >
      <Icon name="zap" size={14} className="text-lime" />
      <span className="font-mono text-mono text-primary">
        {credits.toLocaleString()}
      </span>
      <span className="text-caption text-muted">{label}</span>
      {pct !== null && (
        <span className="h-[3px] w-10 overflow-hidden rounded-full bg-n-5">
          <span
            className="block h-full bg-accent"
            // Remaining balance — genuinely dynamic.
            style={{ width: `${String(pct)}%` }}
          />
        </span>
      )}
    </span>
  );
}
