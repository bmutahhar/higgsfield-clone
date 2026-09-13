import { Icon } from "@/components/core/icon";
import type {
  ModelRow as ModelRowData,
  RowBadge,
} from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * A model line inside either panel: a status glyph, a name, and any number of
 * right-aligned badges.
 *
 * The four badge tones are measured, not invented, and the distinction does
 * real work: a solid lime chip means "you get this outright", a lime wash
 * means "you have access", a bright grey means "here is the spec", a dim grey
 * means "you do not get this". Flattening them to one or two tones is what
 * makes a clone of this card read as flat.
 */
/*
 * `access` is the odd one out: it carries a 1px border, so it drops the
 * vertical padding to land on the same 16px the live chip measures. The other
 * three are borderless and pad to 18px. Padding all four the same makes every
 * row two pixels tall and the card seven — which is how this drifted first
 * time round.
 */
const BADGE_TONE: Record<RowBadge["tone"], string> = {
  unlimited: "bg-q-accent py-0.5 text-q-inverse",
  spec: "bg-q-w-20 py-0.5 text-white",
  muted: "bg-q-w-10 py-0.5 text-q-idle-soft",
  access: "border border-white/5 bg-[rgba(209,254,23,0.14)] text-q-brand",
};

export function RowBadgeChip({ badge }: { badge: RowBadge }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-q-100 px-1 whitespace-nowrap",
        "text-[10px] leading-[14px] font-semibold",
        BADGE_TONE[badge.tone],
      )}
    >
      {badge.label}
    </span>
  );
}

interface ModelRowProps {
  row: ModelRowData;
  /** Adds the hairline rule under every row but the last. */
  divided?: boolean;
  className?: string;
}

export function ModelRow({ row, divided = true, className }: ModelRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1.5 py-2.5",
        divided && "border-b border-q-subtle",
        className,
      )}
    >
      <Icon
        name={row.included ? "check" : "x"}
        size={16}
        className={row.included ? "text-q-brand" : "text-q-w-30"}
      />
      <span
        className={cn(
          "min-w-0 flex-1 text-xs leading-4",
          row.included ? "text-white" : "text-q-w-30",
        )}
      >
        {row.name}
      </span>
      {row.badges.length > 0 ? (
        <div className="flex shrink-0 items-center gap-1">
          {row.badges.map((badge) => (
            <RowBadgeChip key={badge.label} badge={badge} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
