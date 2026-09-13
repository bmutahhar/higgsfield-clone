"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import {
  COMPARISON,
  type ComparisonRow,
  type ComparisonSection,
  VISIBLE_ROWS,
} from "@/config/pricing-comparison.constants";
import {
  type BillingPeriod,
  currentPrice,
  PLANS,
} from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * "Compare features" — roughly 125 model rows across six sections.
 *
 * Built as real <table>s. The live markup is nested flex columns, which reads
 * as one long list of disconnected numbers to a screen reader: the column
 * header never associates with the cell, so "960 videos" arrives with no way
 * to know which plan it belongs to. `<th scope>` fixes that for free and the
 * layout is unchanged.
 *
 * Two independent collapse mechanisms, both on the live site:
 *
 *   1. The whole block is capped at 560px behind a fade until "Compare
 *      Features" is pressed.
 *   2. *Within* that, each section shows four rows and hides the rest behind
 *      its own "View More".
 *
 * So an expanded block can still have collapsed sections, and the first press
 * of "Compare Features" does not reveal 125 rows.
 */
const CELL_HEIGHT = "h-16";

export function ComparisonTable({ period }: { period: BillingPeriod }) {
  const [open, setOpen] = useState(false);

  return (
    <div id="pricing-comparison" className="mt-20 w-full scroll-mt-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-q-title tracking-[-1.2px] text-white">
          Compare features
        </h2>
        <p className="text-q-body-sm text-q-soft">
          See in details what plan suits you best
        </p>
      </div>

      <div className="mt-8 flex flex-col">
        <div
          className={cn(
            "relative transition-[max-height] duration-700 ease-in-out motion-reduce:transition-none",
            open ? "max-h-none" : "max-h-140 overflow-clip",
          )}
        >
          <div className="rounded-q-500 border border-q-w-06 bg-q-page">
            <ComparisonHeader period={period} />
            <div className="flex flex-col gap-3 px-6 pt-4 pb-6">
              {COMPARISON.map((section) => (
                <Section key={section.title} section={section} />
              ))}
            </div>
          </div>

          {/*
           * The fade is a sibling, not a mask on the frame: it has to sit over
           * the rows while leaving the frame's own border crisp.
           */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-60 bg-gradient-to-t from-q-page to-transparent",
              "transition-opacity duration-500 motion-reduce:transition-none",
              open && "opacity-0",
            )}
          />
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-12 items-center gap-2 rounded-q-300 border-2 px-3",
              "text-q-body-sm font-semibold text-white",
              "border-q-default hover:border-q-strong",
              "transition-colors motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
            )}
          >
            {open ? "Close Features" : "Compare Features"}
            <Icon
              name="chevron-down"
              size={18}
              className={cn(
                "transition-transform duration-300 motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * The header sticks at `top-9` — under the site header, not under the viewport
 * top — so the plan names stay with you while you scroll 125 rows.
 */
function ComparisonHeader({ period }: { period: BillingPeriod }) {
  return (
    <div className="sticky top-9 z-20 flex border-b border-q-w-06 bg-q-page px-6">
      <div className="flex w-61 shrink-0 items-end pb-4">
        <div className="flex h-10 items-center gap-3 rounded-q-200 border border-q-w-08 px-2.5 py-1 backdrop-blur-md">
          <span className="text-q-body-sm font-semibold whitespace-nowrap text-white">
            {period === "annual" ? "Annual" : "Monthly"}
          </span>
          {period === "annual" ? (
            <DiscountBadge shape="soft">30% OFF</DiscountBadge>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col items-center justify-start gap-4 px-2 py-4"
          >
            <div className="flex items-center gap-2">
              {/*
               * Inter, title case, 24/32 — not the Grotesk uppercase the plan
               * cards use. The table is a reference document, not a pitch.
               */}
              <span className="text-2xl leading-8 font-bold text-white">
                {plan.name}
              </span>
              {plan.bestValue ? (
                <DiscountBadge tone="best">Best value</DiscountBadge>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-q-display text-xl leading-6 font-bold text-white">
                ${currentPrice(plan.tiers[0], period)}/month
              </span>
              <span className="text-xs leading-4 text-q-soft">
                {period === "annual" ? "Billed annually" : "Billed monthly"}
              </span>
            </div>
            {/*
             * Only Max gets the brand fill here. Basic and Pro sit on the
             * raised grey — the table ranks the plans, so just one of them
             * shouts.
             */}
            <button
              type="button"
              className={cn(
                "h-10 w-full cursor-pointer rounded-q-250 text-sm leading-5 font-semibold",
                "transition-[filter] duration-150 hover:brightness-110 motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
                plan.bestValue
                  ? "q-cta-fill text-q-inverse"
                  : "border border-black/6 bg-q-raised text-white",
              )}
            >
              Get Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ section }: { section: ComparisonSection }) {
  const [showAll, setShowAll] = useState(false);
  const collapsible = section.rows.length > VISIBLE_ROWS;

  return (
    <table
      className={cn(
        "w-full table-fixed border-collapse",
        /* The four short sections are drawn as their own bordered cards. */
        section.layout === "card" &&
          "rounded-q-400 border border-q-w-06 bg-q-page",
      )}
    >
      <caption
        className={cn(
          "text-left text-base leading-6 font-semibold text-white",
          section.layout === "card" ? "px-4 pt-4 pb-2" : "pt-2 pb-2",
        )}
      >
        {section.title}
      </caption>
      <colgroup>
        <col className="w-61" />
        <col span={3} />
      </colgroup>
      <tbody>
        {section.rows.map((row, i) => (
          <Row
            key={row.label}
            row={row}
            hidden={collapsible && !showAll && i >= VISIBLE_ROWS}
            card={section.layout === "card"}
          />
        ))}
        {collapsible ? (
          <tr>
            <td colSpan={4} className={section.layout === "card" ? "px-4" : ""}>
              <button
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((v) => !v)}
                className={cn(
                  "flex h-16 w-full cursor-pointer items-center gap-2 text-start text-q-body",
                  "hover:text-white",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-q-focus",
                )}
              >
                {showAll ? "View Less" : "View More"}
                <Icon
                  name="chevron-down"
                  size={16}
                  className={cn(
                    "transition-transform duration-200 motion-reduce:transition-none",
                    showAll && "rotate-180",
                  )}
                />
              </button>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}

/*
 * Hidden rows stay in the DOM and collapse to zero height rather than
 * unmounting — that is what lets the reveal animate. A <tr> cannot be
 * transitioned directly, so the height and opacity live on the cell contents.
 */
function Row({
  row,
  hidden,
  card,
}: {
  row: ComparisonRow;
  hidden: boolean;
  card: boolean;
}) {
  const inner = cn(
    "flex flex-col justify-center overflow-hidden",
    "transition-all duration-500 ease-in-out motion-reduce:transition-none",
    hidden ? "h-0 -translate-y-2 opacity-0" : `${CELL_HEIGHT} translate-y-0`,
  );

  return (
    <tr className={cn(!hidden && "border-b border-q-w-06")}>
      <th
        scope="row"
        className={cn("text-left align-middle font-normal", card && "pl-4")}
      >
        <div className={cn(inner, "items-start gap-1")}>
          <span className="text-q-body-sm text-white">{row.label}</span>
          {row.sublabel ? (
            <span className="text-xs leading-4 text-q-soft">
              {row.sublabel}
            </span>
          ) : null}
        </div>
      </th>
      {row.values.map((value, i) => (
        <td key={i} className={cn("align-middle", card && "pr-4 last:pr-4")}>
          <div className={cn(inner, "items-center")}>
            <Cell value={value} />
          </div>
        </td>
      ))}
    </tr>
  );
}

function Cell({ value }: { value: string }) {
  if (value === "YES")
    return (
      <>
        <Icon name="check" size={20} className="text-q-brand" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === "NO" || value === "Not included")
    return (
      <>
        <Icon name="x" size={20} className="text-q-soft" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-q-body-sm text-white">{value}</span>;
}
