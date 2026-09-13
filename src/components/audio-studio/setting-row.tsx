"use client";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface AudioSettingRowProps {
  label: string;
  value?: React.ReactNode;
  /** Stacks label over value at 56px instead of one 48px line. */
  stacked?: boolean;
  /** Replaces the chevron — a stepper, a switch, a value cluster. */
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Every settings row on the audio panel: same chrome, two heights.
 *
 * Not `studio/setting-row.tsx`. That one is an options select — it takes
 * `options` and owns its own popover — which fits Output format but not the
 * model picker, the batch stepper or the save switch. This is the frame those
 * all share, with the control passed in.
 *
 * `stacked` is the 56px form with the label above the value (Model, Language,
 * Speed); the default is the 48px single line (Batch size, Output format).
 */
export function AudioSettingRow({
  label,
  value,
  stacked,
  trailing,
  onClick,
  className,
  ref,
}: AudioSettingRowProps) {
  const chrome =
    "flex w-full shrink-0 items-center justify-between gap-2 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-left transition-colors hover:border-q-default motion-reduce:transition-none";

  const body = stacked ? (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-q-caption-l font-medium text-q-soft">{label}</span>
      <span className="flex min-w-0 items-center gap-1 text-q-menu text-q-fg">
        {value}
      </span>
    </span>
  ) : (
    <>
      <span className="min-w-0 truncate text-q-menu text-q-fg">{label}</span>
      {value !== undefined && (
        <span className="flex shrink-0 items-center gap-2 text-q-menu text-q-fg">
          {value}
        </span>
      )}
    </>
  );

  const tail = trailing ?? (
    <Icon name="chevron-right" size={16} className="shrink-0" />
  );

  /*
   * A row with no handler is a container, not a control — making it a button
   * would give the keyboard a stop that does nothing.
   */
  if (!onClick) {
    return (
      <div className={cn(chrome, stacked ? "h-14" : "h-12", className)}>
        {body}
        {tail}
      </div>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        chrome,
        stacked ? "h-14" : "h-12",
        "outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus",
        className,
      )}
    >
      {body}
      {tail}
    </button>
  );
}
