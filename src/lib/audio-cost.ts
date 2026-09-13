import { type AudioMode, audioModelById, FLAT_RATE } from "@/config/audio";

/*
 * What the CTA shows beside the sparkle.
 *
 * Ours, not the reference's — see the spec's D5. Linear in batch and flat per
 * model, which is at least a rule someone can check by pressing `+`.
 */
export function audioCost(
  mode: AudioMode,
  modelId: string,
  batch: number,
): number {
  if (mode !== "tts") return FLAT_RATE[mode];

  const model = audioModelById(modelId);
  /*
   * An unknown model means a stale draft. Zero is wrong but harmless; NaN
   * would render the button as "Generate ✦ NaN".
   */
  if (!model) return 0;

  /*
   * Two decimals, because the rates themselves have two — rounding to one
   * would price the cheapest model at 0.2 instead of 0.15. The rounding
   * exists at all because 0.15 * 3 is 0.44999999999999996 in binary floating
   * point, which would reach the label in full.
   */
  return Math.round(model.rate * batch * 100) / 100;
}
