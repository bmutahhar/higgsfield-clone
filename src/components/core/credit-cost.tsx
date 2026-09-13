import { Icon } from "@/components/core/icon";

export interface CreditCostProps {
  /**
   * Pre-discount total, struck through. Omitted when a model carries no
   * discount — there is nothing to strike, and showing the same number twice
   * would read as a bug.
   */
  list?: number;
  /** Charged total. */
  net: number;
}

/** Credits print without a trailing `.0`: 6.5 stays 6.5, 11.0 becomes 11. */
function credits(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/**
 * What a generation costs, as it appears inside a call to action.
 *
 * Shared by both studios' buttons, which are otherwise deliberately different
 * shapes. The angled rule through the old price is the reason this is one
 * component rather than two copies — it is fiddly enough that a second copy
 * would drift.
 *
 * Carries no colour of its own: it inherits from whichever button holds it, so
 * it needs no knowledge of either surface's palette.
 */
export function CreditCost({ list, net }: CreditCostProps) {
  return (
    <span className="flex items-center gap-1">
      <Icon name="sparkles" size={16} />
      {list !== undefined && list > net && (
        /*
         * A 30° rule, not `line-through`: the live strike is drawn at an angle
         * and overhangs the digits by 2px.
         */
        <span className="relative opacity-50">
          {credits(list)}
          <span className="absolute top-1/2 -right-0.5 -left-0.5 rotate-[30deg] border-t-[1.5px] border-current" />
        </span>
      )}
      <span>{credits(net)}</span>
    </span>
  );
}
