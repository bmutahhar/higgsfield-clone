"use client";

import { useEffect, useRef, useState } from "react";

/*
 * The credit counts on the live site roll rather than cut — it ships the
 * `number-flow` custom element, which animates each digit vertically.
 *
 * This is the same effect at a fraction of the weight: ease the value itself
 * and render it with tabular figures, so the width never jitters. At 320ms the
 * two are hard to tell apart, and this one has no runtime dependency and no
 * custom element to hydrate around.
 *
 * Reduced motion snaps. A number that counts is decoration; the number itself
 * is the information.
 */
const DURATION = 320;

/* Matches --q-ease-pop, the curve the rest of this surface animates on. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target);
  const frame = useRef<number>(undefined);
  const from = useRef(target);

  useEffect(() => {
    const origin = from.current;
    const delta = target - origin;
    if (delta === 0) return;

    /*
     * Reduced motion runs the same loop at zero duration rather than setting
     * state straight from the effect body: the first frame lands on t = 1 and
     * snaps. Same result, no cascading render on mount.
     */
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : DURATION;

    const start = performance.now();

    const step = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const value = Math.round(origin + delta * easeOut(t));
      setDisplay(value);
      from.current = value;
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      /*
       * Land on the target when interrupted mid-roll. Without this, changing
       * tiers twice quickly leaves the counter parked on whatever intermediate
       * value the first animation had reached.
       */
      from.current = target;
    };
  }, [target]);

  return display;
}
