"use client";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/*
 * − N seats +
 *
 * The value sits in a fixed `w-[8ch]` column so the layout does not twitch
 * between "2 seats" and "15 seats" as you step through the range. Both ends
 * disable rather than clamp silently, so the control tells you where the range
 * stops instead of just refusing to move.
 */
interface SeatStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (seats: number) => void;
  className?: string;
}

export function SeatStepper({
  value,
  min,
  max,
  onChange,
  className,
}: SeatStepperProps) {
  const step = (delta: number) =>
    onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between rounded-q-300 border border-q-subtle bg-q-w-05 px-4 py-1.5",
        className,
      )}
    >
      <StepButton
        label="Decrease team size"
        icon="minus"
        disabled={value <= min}
        onClick={() => step(-1)}
      />
      <p
        className="w-[8ch] pb-0.5 text-center text-sm leading-5 font-semibold whitespace-pre text-white"
        aria-live="polite"
      >
        {value} {value === 1 ? "seat" : "seats"}
      </p>
      <StepButton
        label="Increase team size"
        icon="plus"
        disabled={value >= max}
        onClick={() => step(1)}
      />
    </div>
  );
}

function StepButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: "minus" | "plus";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-5 items-center justify-center text-white",
        "transition-opacity duration-150 motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
      )}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
