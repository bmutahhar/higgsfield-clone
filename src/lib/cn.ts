import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge has to know our theme, not just Tailwind's defaults.
 *
 * Without this it cannot tell a custom font-size from a custom text colour —
 * both are `text-*` — so it treats `text-body-sm` and `text-lime` as
 * conflicting and silently drops the first. The class never reaches the DOM
 * and the element quietly inherits body's 15px instead. The same applies to
 * our custom radii and shadows.
 */
const FONT_SIZES = [
  "display-1",
  "display-2",
  "display-3",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "micro",
  "label",
  "eyebrow",
  "mono",
  // The studio scale. Same reasoning: without these, `text-q-body-sm` and
  // `text-q-idle` both look like `text-*` and one is dropped.
  "q-accent-xl",
  "q-accent-lg",
  "q-accent-sm",
  "q-brand-xxs",
  "q-body-sm",
  "q-label-sm",
  "q-label-xs",
  "q-caption-m",
  "q-caption-xs",
  "q-menu",
  // The pricing steps, added to the same scale.
  "q-price",
  "q-plan",
  "q-title",
  "q-badge",
  "q-caption-l",
  // The audio surface. Same reasoning as every entry above.
  "q-accent-2xl",
  "q-heading-sm",
  "q-body-lg",
  "q-body-md",
  "q-cta",
];

const RADII = [
  "control",
  "card",
  "media",
  "panel",
  "modal",
  "thumb",
  "q-100",
  "q-150",
  "q-200",
  "q-250",
  "q-300",
  "q-400",
  "q-500",
  "q-600",
  "q-700",
  "q-800",
];

const SHADOWS = [
  "e1",
  "e2",
  "e3",
  "e4",
  "ring",
  "glow",
  "q-indicator",
  "q-menu",
  "q-avatar",
  "q-cta",
  "q-glass",
  "q-badge",
  "q-dialog",
  "q-key",
  "q-plan",
  "q-sheet",
  "q-knob",
  "q-slider",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
      rounded: [{ rounded: RADII }],
      "shadow-color": [],
      shadow: [{ shadow: SHADOWS }],
    },
  },
});

/**
 * Join class names, with later Tailwind utilities winning over earlier ones.
 * Lets a caller's `className` override a component's defaults without
 * depending on stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
