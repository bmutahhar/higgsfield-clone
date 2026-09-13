import { CreditCost } from "@/components/core/credit-cost";

export interface GenerateCtaProps {
  /** Pre-discount total, struck through. */
  list: number;
  /** Charged total. */
  net: number;
}

/*
 * The image studio's call to action.
 *
 * A tall block rather than a bar — 84px, filling the composer's right column
 * and bottom-aligned, so it holds still while the prompt grows above it. The
 * Genjutsu form's `GenerateButton` is a different shape for a different
 * surface; these two deliberately do not share.
 *
 * It is never disabled: the live button stays live on an empty prompt, and
 * submitting nothing is the server's to report, not the button's to pre-empt.
 */
export function GenerateCta({ list, net }: GenerateCtaProps) {
  return (
    <button
      type="submit"
      className="flex h-full min-w-44 shrink-0 items-center justify-center rounded-q-300 bg-q-accent px-1.5 text-q-inverse transition-colors duration-150 hover:bg-q-accent-80 focus-visible:bg-q-accent-80 focus-visible:ring-2 focus-visible:ring-q-accent/50 focus-visible:outline-none motion-reduce:transition-none"
    >
      <span className="flex items-center gap-1.5 text-base font-semibold">
        Generate
        <CreditCost list={list} net={net} />
      </span>
    </button>
  );
}
