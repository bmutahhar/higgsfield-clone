"use client";

import { useId, useState } from "react";

import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import type { MobileOption } from "@/config/pricing-mobile.constants";
import { cn } from "@/lib/cn";

/*
 * One pick in the mobile funnel.
 *
 * The live card is a <button> with no radio semantics at all — no role, no
 * aria-checked, no group — so a screen reader hears three unrelated buttons
 * and never learns that picking one unpicks the others. This is a real radio
 * in a real radiogroup: arrow keys roam, Space selects, and the selected
 * option is announced as such. The pixels are unchanged.
 *
 * The ribbon is a strip *behind* the card, not a badge on it: the card body is
 * inset by 2px so the strip shows as a collar along the top edge.
 */
interface PlanOptionCardProps {
  option: MobileOption;
  selected: boolean;
  onSelect: () => void;
}

export function PlanOptionCard({
  option,
  selected,
  onSelect,
}: PlanOptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();
  const rows = expanded ? [...option.rows, ...option.extraRows] : option.rows;

  return (
    <div
      className={cn(
        "relative rounded-q-400",
        /*
         * Solid lime, not the wash: the collar is a printed strip with dark
         * type on it. The radial only lifts the card body below it.
         */
        option.ribbon?.tone === "lime" && "border border-q-accent bg-q-accent",
        option.ribbon?.tone === "pink" &&
          "bg-[radial-gradient(60%_50%_at_100%_80%,rgba(255,0,91,0.9)_0%,rgba(255,0,91,0.45)_100%)]",
        !option.ribbon && "border border-q-hairline bg-q-card",
      )}
    >
      {option.ribbon ? (
        <div className="flex items-center justify-center gap-2 px-6 pt-1 pb-1.5">
          <span
            className={cn(
              "text-xs leading-4 font-semibold",
              option.ribbon.tone === "lime" ? "text-q-inverse" : "text-white",
            )}
          >
            {option.ribbon.text}
          </span>
          {option.discount ? (
            <DiscountBadge shape="soft">{option.discount}% OFF</DiscountBadge>
          ) : null}
        </div>
      ) : null}

      <div className={cn(option.ribbon && "p-0.5")}>
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          aria-describedby={detailId}
          onClick={onSelect}
          className={cn(
            "flex w-full flex-col gap-0 rounded-q-400 p-3 text-left",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
            option.ribbon?.tone === "lime"
              ? "q-pick-body--lime"
              : "q-pick-body",
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                selected
                  ? "bg-q-accent"
                  : option.ribbon?.tone === "lime"
                    ? "border-2 border-q-accent/15"
                    : "border-2 border-white/20",
              )}
            >
              {selected ? (
                <Icon name="check" size={14} className="text-q-inverse" />
              ) : null}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-q-display text-xl leading-6 font-bold text-white">
                {option.label}
              </span>
              <span className="flex items-center gap-1 text-xs leading-4 text-q-soft">
                {option.strike ? (
                  <span className="relative text-q-pink">
                    ${option.strike}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-1/2 h-0.5 -rotate-8 bg-q-pink"
                    />
                  </span>
                ) : null}
                {option.cadence}
              </span>
            </div>

            <span className="flex shrink-0 flex-col items-center rounded-q-300 bg-q-card-strong px-3 py-2">
              {option.strike ? (
                <span className="text-[10px] leading-3 text-q-soft line-through">
                  ${option.strike}
                </span>
              ) : null}
              <span className="font-q-display text-xl leading-6 font-bold text-white">
                ${option.price}
              </span>
              <span className="text-[10px] leading-3 text-q-soft">
                per month
              </span>
            </span>
          </div>

          <span className="my-3 block h-px w-full bg-white/10" />

          {/*
           * pr-17/pb-9 reserve the corner the "Learn more" chip is absolutely
           * placed into. Without them the chip sits on top of the last row.
           */}
          <ul id={detailId} className="flex flex-col gap-1 pr-17 pb-9">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-2">
                <Icon
                  name={r.included ? "check" : "x"}
                  size={16}
                  className={r.included ? "text-q-brand" : "text-q-soft"}
                />
                <span
                  className={cn(
                    "text-sm leading-5",
                    r.included ? "text-white" : "text-q-soft",
                  )}
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </button>
      </div>

      {/*
       * Outside the radio: expanding the detail must not also select the
       * option. Nesting it would make the whole card a single hit target.
       */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailId}
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "absolute right-4 bottom-4 flex items-center gap-1 rounded-q-200 border border-q-default px-2 py-1",
          "text-xs leading-[18px] font-medium text-q-idle",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
        )}
      >
        {expanded ? "Hide" : "Learn more"}
        <Icon
          name="chevron-down"
          size={16}
          className={cn(
            "transition-transform duration-200 motion-reduce:transition-none",
            expanded && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
