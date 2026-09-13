"use client";

import { useEffect, useRef } from "react";

/*
 * The live site flips at ~9px of scroll — measured by stepping the real
 * header's `data-header-compact` against window.scrollY a pixel at a time. In
 * practice that reads as "the moment the page moves at all", which is the
 * point: the tall header is a resting state, not a scroll-distance reward.
 */
const COMPACT_AFTER_PX = 8;

/**
 * Marks the returned element `data-compact` for as long as the page is
 * scrolled, so the header can shrink itself in CSS.
 *
 * The flag is written straight to the DOM rather than held in React state.
 * Nothing here needs to re-render — every size is a utility keyed off the
 * attribute — so a `useState` would re-render the whole nav on a scroll frame
 * and buy nothing.
 *
 * `route` is the current pathname: the body does not scroll, so the thing
 * being watched is whatever the route group marked `data-page-scroll`, and
 * that element is replaced on navigation. Studio routes scroll internally and
 * mark nothing, which correctly leaves the header at its resting size.
 */
export function useCompactHeader<T extends HTMLElement>(route: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scroller = document.querySelector("[data-page-scroll]");
    const sync = () => {
      el.toggleAttribute(
        "data-compact",
        (scroller?.scrollTop ?? 0) > COMPACT_AFTER_PX,
      );
    };

    // Navigating resets the new container to the top, and a route without a
    // page scroll never fires an event — so take a reading before listening.
    sync();
    if (!scroller) return;

    let frame = 0;
    const flush = () => {
      frame = 0;
      sync();
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(flush);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [route]);

  return ref;
}
