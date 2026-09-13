import { DiscountBadge } from "@/components/pricing/discount-badge";
import { cn } from "@/lib/cn";

/*
 * Monthly ⇄ Annual.
 *
 * The control's trick is the badge: it advertises the annual saving only while
 * you are on Monthly, and folds away the moment you take it. Collapsing it by
 * animating `max-width` (rather than unmounting) is what makes the shell
 * shrink smoothly instead of snapping.
 *
 * A real checkbox does the work. `role="switch"` makes it announce correctly,
 * `checked` gives us `aria-checked` for free, and every visual — both label
 * colours, the track, the knob's travel and the badge reveal — hangs off the
 * input's state in CSS. No React state touches a class here, so keyboard users
 * get the control the platform already ships.
 *
 * `group-has-[:checked]:` rather than `peer-checked:`: peer is a sibling
 * combinator, and the knob is a descendant of a sibling. peer-checked would
 * compile fine and then silently never match.
 */
interface BillingSwitchProps {
  /** Checked means annual. */
  annual: boolean;
  onChange: (annual: boolean) => void;
  /** Copy for the badge revealed while Monthly is selected. */
  discountLabel?: string;
  className?: string;
}

export function BillingSwitch({
  annual,
  onChange,
  discountLabel = "30% OFF",
  className,
}: BillingSwitchProps) {
  return (
    <label
      className={cn(
        "group relative inline-flex h-10 cursor-pointer items-center justify-center gap-0.5",
        "overflow-hidden rounded-q-200 border border-q-default px-2 py-1.5",
        "transition-[border-color,opacity] duration-150 motion-reduce:transition-none",
        "active:opacity-[0.88]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-q-focus",
        className,
      )}
    >
      <input
        type="checkbox"
        role="switch"
        aria-label="Toggle billing period"
        checked={annual}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />

      <span className="px-1.5 text-q-caption-m text-q-body transition-colors duration-150 group-has-[:checked]:text-q-soft motion-reduce:transition-none">
        Monthly
      </span>

      <span className="relative flex h-4 w-7 shrink-0 items-center rounded-q-300 bg-q-switch-off transition-colors duration-200 ease-out group-has-[:checked]:bg-q-accent motion-reduce:transition-none">
        <span
          className={cn(
            "ml-0.5 size-3 rounded-q-200 border border-transparent bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
            "group-has-[:checked]:translate-x-3 group-has-[:checked]:border-black/10 group-has-[:checked]:shadow-q-knob",
            "transition-transform duration-200 ease-out motion-reduce:transition-none",
          )}
        />
      </span>

      <span className="flex items-center">
        <span className="px-1.5 text-q-caption-m text-q-soft transition-colors duration-150 group-has-[:checked]:text-q-body motion-reduce:transition-none">
          Annual
        </span>
        {/*
         * aria-hidden: the saving is already stated on the card this switch
         * controls, and announcing "30% OFF" between the two option labels
         * makes the switch read as a third choice.
         */}
        <span
          aria-hidden
          className={cn(
            "flex shrink-0 items-center overflow-hidden",
            "max-w-64 translate-x-0 pl-1 opacity-100",
            "group-has-[:checked]:max-w-0 group-has-[:checked]:translate-x-1 group-has-[:checked]:pl-0 group-has-[:checked]:opacity-0",
            "transition-[max-width,opacity,padding,transform] duration-200 ease-out",
            "motion-reduce:transition-none",
          )}
        >
          <DiscountBadge shape="soft">{discountLabel}</DiscountBadge>
        </span>
      </span>
    </label>
  );
}
