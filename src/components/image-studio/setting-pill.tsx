/*
 * The composer's control shape, shared by all six settings.
 *
 * Deliberately without a hover fill: the live pills do not react to hover at
 * all — only the model pill's chevron changes, and it does so in lime. The
 * focus ring is ours, and is the one thing the live surface omits.
 */
export const PILL_CLASS = [
  "flex h-10 shrink-0 items-center gap-1 rounded-q-300 px-3",
  "border border-q-accent-05 bg-q-pill",
  "text-q-body-sm font-medium text-q-fg whitespace-nowrap",
  "focus-visible:ring-2 focus-visible:ring-q-accent/50 focus-visible:outline-none",
].join(" ");
