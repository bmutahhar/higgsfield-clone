import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/*
 * An entry for a surface this clone has not built: inert, dimmed by the
 * caller, and carrying a "Coming soon" bubble on hover.
 *
 * It replaces the `title` attribute these entries used to rely on, which was
 * unstyleable, arrived after the browser's own half-second delay, and read
 * "not built in this clone" — a note about the repository rather than
 * something a visitor would want to be told.
 *
 * Open is CSS, as everywhere else in this codebase: the trigger is a group and
 * the bubble reveals on hover.
 *
 * One rule for callers: dim the trigger with colour alpha — `text-white/45`,
 * `bg-accent/45` — and never with `opacity-*`. Opacity applies to the whole
 * subtree, so it fades the bubble along with the label, and it opens a
 * stacking context that traps the bubble's z-index inside the trigger, letting
 * anything later on the page paint over it. Both of those look like the
 * tooltip is broken rather than like the caller is.
 */

/*
 * `side` is a positioning strategy, not merely a direction. Two of the four
 * surfaces that need this sit inside a scroll container, where an ordinarily
 * anchored bubble is not just misplaced but *clipped away entirely* — measured
 * in the running app, correctly positioned and invisible. Hence `under-header`.
 */
const SIDE = {
  /*
   * The header's link row, which is `overflow-x-auto`. A clipped axis forces
   * the other one to clip too, so the row cuts off anything hung below a link.
   *
   * The escape is to anchor the two axes to different things. `top` resolves
   * against the nearest positioned ancestor, and that is the header, so the
   * bubble's containing block sits outside the scroll container and the
   * clipping never applies to it; `top-full` then lands it on the header's
   * lower edge and keeps up when the header compacts. `left` is deliberately
   * absent — left at `auto` it falls back to the box's static position, which
   * for a flex child is its own content-box corner, so each bubble tracks the
   * item it belongs to with nothing measured and no per-item values.
   *
   * The trigger must therefore NOT be `relative`, or it becomes the containing
   * block again and the clipping comes back. That is why this row's wrapper
   * class is empty rather than merely unset.
   */
  "under-header": { wrapper: "", bubble: "top-full translate-y-2" },
  /*
   * The selection bar's action row, which is `overflow-x-auto` and therefore
   * clips both axes — a bubble hung above a button inside it is positioned
   * correctly and painted nowhere.
   *
   * Same escape as `under-header`, mirrored: leaving the wrapper unpositioned
   * hands the bubble a containing block outside the scroller, so the scroller
   * is no longer on its containing-block chain and stops clipping it. That
   * block's lower edge is the bar's own, so `bottom-full` lands on the bar's
   * top edge; `left` is left at `auto` so each bubble tracks its button from
   * its static position, with nothing measured.
   */
  "above-bar": { wrapper: "", bubble: "bottom-full -translate-y-2" },
  top: {
    wrapper: "relative",
    bubble: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  },
  right: {
    wrapper: "relative",
    bubble: "top-1/2 left-[calc(100%+8px)] -translate-y-1/2",
  },
} as const;

/*
 * The two token layers may not be mixed inside one component, and this one is
 * used on both sides of that line — the header and tab bar are marketing, the
 * sign-in dialog is studio. So the bubble's skin is the one thing that varies.
 */
const TONE = {
  marketing:
    "rounded-lg border border-hairline bg-n-5 text-caption text-primary shadow-e2",
  studio:
    "rounded-q-250 border border-q-hairline bg-q-modal text-q-caption-m text-q-fg shadow-q-menu",
} as const;

export type ComingSoonSide = keyof typeof SIDE;
export type ComingSoonTone = keyof typeof TONE;

export interface ComingSoonProps {
  /** The trigger's own content — label, glyph, badge. */
  children: ReactNode;
  side?: ComingSoonSide;
  tone?: ComingSoonTone;
  className?: string;
}

export function ComingSoon({
  children,
  side = "top",
  tone = "marketing",
  className,
}: ComingSoonProps) {
  const place = SIDE[side];

  return (
    /*
     * The group is named. An unnamed `group` would be matched by the header's
     * own `group` class — it carries the compact-scroll flag — and every
     * bubble in the row would appear whenever the pointer touched the header.
     */
    <span
      aria-disabled="true"
      className={cn("group/tip", place.wrapper, className)}
    >
      {children}

      {/*
        Carried in the accessible name rather than through `aria-describedby`:
        the trigger is inert and unfocusable, so a description has to travel
        with the label to be read out at all.
      */}
      <span className="hf-sr-only"> — coming soon</span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-70 px-2 py-[5px] whitespace-nowrap",
          "opacity-0 transition-opacity duration-[140ms] ease-snap motion-reduce:duration-0",
          "group-focus-within/tip:opacity-100 group-hover/tip:opacity-100",
          TONE[tone],
          place.bubble,
        )}
      >
        Coming soon
      </span>
    </span>
  );
}
