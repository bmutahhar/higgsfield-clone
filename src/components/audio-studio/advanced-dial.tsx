"use client";

import { IntensitySlider } from "@/components/audio-studio/intensity-slider";
import { Icon } from "@/components/core/icon";
import { Dropdown } from "@/components/overlays/dropdown";

/**
 * One of the three-up Speed / Pitch / Volume dials.
 *
 * `Dropdown` owns the open state and wraps `trigger` in its own button, which
 * is why the trigger here is a `<span>` — a nested button would be invalid
 * markup and unreachable by keyboard.
 *
 * `role="dialog"` because the panel holds a slider. A listbox may not contain
 * focusable chrome, and announcing this one as a list of options would be a
 * lie about what is inside it.
 */
export function AdvancedDial({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (next: number) => void;
}) {
  return (
    <Dropdown
      label={label}
      role="dialog"
      width={260}
      align="start"
      triggerClassName="min-w-0 flex-1"
      trigger={
        <span className="flex h-14.5 w-full items-center gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-left transition-colors hover:border-q-default motion-reduce:transition-none">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-q-caption-l font-medium text-q-soft">
              {label}
            </span>
            <span className="truncate text-q-menu text-q-fg tabular-nums">
              {format(value)}
            </span>
          </span>
          <Icon name="chevron-right" size={16} className="shrink-0" />
        </span>
      }
    >
      {/*
        The render prop receives `close`, ignored here on purpose: a slider you
        drag should stay open while you drag it.
      */}
      {() => (
        <div className="p-2">
          <IntensitySlider
            label={label}
            value={value}
            min={min}
            max={max}
            step={step}
            format={format}
            onChange={onChange}
          />
        </div>
      )}
    </Dropdown>
  );
}
