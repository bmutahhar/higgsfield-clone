"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/*
 * The bar is a promise, not a measurement. Nothing on the client knows how far
 * a server-rendered route has got, so the fill is a decelerating guess that
 * parks short of the end; only a committed navigation is allowed to reach it.
 */

/** Held on screen this long even when the route commits at once, so a
 *  prefetched navigation still reads as a sweep rather than a flicker. */
const MIN_VISIBLE_MS = 280;

/** Long enough for the finish to play out before the bar resets to idle. */
const RESET_AFTER_MS = 420;

/** A navigation that never commits must not strand the bar on screen. */
const STALL_AFTER_MS = 10_000;

/**
 * Whether this click hands the router a new pathname to render.
 *
 * Checked in the capture phase, because `<Link>` calls `preventDefault()` on
 * its way out — by the time a click reaches the document every real client
 * navigation looks cancelled.
 */
function startsRouteChange(event: MouseEvent): boolean {
  // Anything but an unmodified primary click belongs to the browser: a new
  // tab, a download, a context menu.
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return false;
  }

  const anchor =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.download || (anchor.target && anchor.target !== "_self")) {
    return false;
  }
  if (anchor.relList.contains("external")) return false;

  /*
   * HTMLAnchorElement implements the URL interface, so the href is already
   * resolved and parsed — no `new URL` that could throw on a malformed one.
   * A cross-origin link, a `mailto:` (origin "null"), a jump to #section and a
   * link back to the page we are on all fail one of these two tests.
   *
   * Matching on pathname alone is deliberate: it is exactly what `usePathname`
   * below reports, so every navigation that starts the bar has a signal that
   * ends it. A search-param change is the same route and gets no bar.
   */
  return (
    anchor.origin === window.location.origin &&
    anchor.pathname !== window.location.pathname
  );
}

/**
 * Drives a top progress bar from the router's own navigation lifecycle, and
 * returns the ref to hang on the bar.
 *
 * The three phases are written straight to the DOM as `data-state` and drawn
 * entirely in CSS, the way `use-compact-header` writes `data-compact`: none of
 * this is render input, so a navigation re-renders nothing but this one leaf.
 *
 * One document-level listener covers the whole app, so links do not have to be
 * routed through a wrapper to be tracked — which is what `useLinkStatus` would
 * have required, given it only reports on the `<Link>` it is nested inside.
 */
export function useRouteProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const pathname = usePathname();

  const committed = useRef(pathname);
  const startedAt = useRef(0);
  const settle = useRef(0);
  const reset = useRef(0);
  const stall = useRef(0);

  const clearTimers = useCallback(() => {
    window.clearTimeout(settle.current);
    window.clearTimeout(reset.current);
    window.clearTimeout(stall.current);
  }, []);

  const finish = useCallback(() => {
    const el = ref.current;
    if (!el || el.dataset.state !== "loading") return;

    clearTimers();
    const shown = performance.now() - startedAt.current;

    settle.current = window.setTimeout(
      () => {
        el.dataset.state = "done";
        reset.current = window.setTimeout(() => {
          delete el.dataset.state;
        }, RESET_AFTER_MS);
      },
      Math.max(0, MIN_VISIBLE_MS - shown),
    );
  }, [clearTimers]);

  const start = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    clearTimers();
    // A second click mid-flight keeps the run it already has: restarting the
    // fill would read as the first navigation having been undone.
    if (el.dataset.state !== "loading") {
      startedAt.current = performance.now();
      el.dataset.state = "loading";
    }
    stall.current = window.setTimeout(finish, STALL_AFTER_MS);
  }, [clearTimers, finish]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (startsRouteChange(event)) start();
    };

    // Back and forward have already rewritten the URL by the time this runs,
    // so the comparison has to be against the route React last rendered.
    const onPopState = () => {
      if (window.location.pathname !== committed.current) start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, [clearTimers, start]);

  /*
   * `usePathname` only advances once the navigation Transition commits, which
   * is the same moment the new page paints. That makes it the end of the
   * navigation rather than the start of the request — the signal this wants.
   * The first run finds the two already equal, so a cold load shows no bar.
   */
  useEffect(() => {
    if (committed.current === pathname) return;
    committed.current = pathname;
    finish();
  }, [finish, pathname]);

  return ref;
}
