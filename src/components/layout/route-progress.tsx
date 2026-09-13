"use client";

import { useRouteProgress } from "./use-route-progress";

/**
 * The hairline that runs across the top of the app while a route change is in
 * flight.
 *
 * It hangs out of a zero-height slot in the body's flow rather than being
 * pinned to the top of the viewport, because the promo strip above it is lime
 * and a lime bar on lime is no bar at all. In the flow it draws over the first
 * 3px of the header instead — solid panel, maximum contrast — and rides up on
 * its own when the strip is dismissed, without either knowing about the other.
 *
 * `aria-hidden` is deliberate: the fill is a guess rather than a measured
 * percentage, so announcing it as a progressbar would state a number that is
 * not true. Assistive tech gets the route change from the document itself.
 *
 * Three states, all drawn in CSS from `data-state`:
 *
 *   idle       collapsed and transparent
 *   loading    fills left to right, decelerating, parking at 90%
 *   done       completes to 100% in `--dur-fast`, then fades
 *
 * The finish is a transition rather than a second animation on purpose. A
 * transition starts from the *running animation's* current value, so the fill
 * completes from wherever the creep had got to; keyframes would take their
 * start from the underlying `scale-x-0` and snap backwards first.
 */
export function RouteProgress() {
  const ref = useRouteProgress<HTMLDivElement>();

  return (
    <div className="relative z-200 h-0 shrink-0">
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent opacity-0 data-[state=done]:scale-x-100 data-[state=done]:animate-route-progress-out data-[state=done]:transition-transform data-[state=done]:duration-[var(--dur-fast)] data-[state=done]:ease-snap data-[state=loading]:animate-route-progress data-[state=loading]:opacity-100 motion-reduce:animate-none data-[state=loading]:motion-reduce:scale-x-100"
      />
    </div>
  );
}
