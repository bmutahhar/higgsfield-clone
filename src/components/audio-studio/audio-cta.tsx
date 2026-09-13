import { CreditCost } from "@/components/core/credit-cost";
import { cn } from "@/lib/cn";

/**
 * The Generate button.
 *
 * Deliberately not the video studio's `GenerateButton`: this one is 56px on a
 * 12px radius with a two-gradient fill, and its label is 18px rather than 16.
 * Sharing them would have meant a component with two of everything.
 *
 * Disabled is the resting state — the script starts empty — so it has to look
 * deliberate rather than broken. `brightness-60` reads as olive, which is what
 * the reference does.
 */
export function AudioCta({
  cost,
  disabled,
  leading,
}: {
  /** Omitted while the form is invalid: an unknown price and a free one
      should not look the same. */
  cost: number | null;
  disabled: boolean;
  /** The phone footer's batch stepper, which has no row of its own there. */
  leading?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 flex items-center gap-2 pb-3">
      {leading && <div className="shrink-0 md:hidden">{leading}</div>}

      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "q-cta-audio relative flex h-14 w-full min-w-12 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-q-300 px-5 pt-4 pb-5 transition outline-none",
          "hover:brightness-105 focus-visible:ring-2 focus-visible:ring-q-focus active:brightness-95",
          "disabled:pointer-events-none disabled:brightness-60",
          "motion-reduce:transition-none",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-3px_0_0_var(--q-brand-lime-line)]"
        />
        <span className="flex items-center px-1.5 text-q-cta text-q-on-brand">
          Generate
        </span>
        {cost !== null && (
          <span className="flex items-center text-q-cta text-q-on-brand">
            <CreditCost net={cost} />
          </span>
        )}
      </button>
    </div>
  );
}
