"use client";

import { useId, useRef, useState } from "react";

import { Icon } from "@/components/core/icon";
import { QPopover } from "@/components/overlays/q-popover";
import { useDismiss } from "@/components/overlays/use-dismiss";
import { cn } from "@/lib/cn";

/**
 * A two-line settings select: muted label above, value below, chevron at the
 * end. The menu opens to the right of the trigger rather than below it, because
 * the form column is only 320px wide and a menu under a field near the bottom
 * would be clipped by the panel's own overflow.
 *
 * A hidden input mirrors the value so the surrounding form submits natively.
 */
export function QSelect({
  label,
  name,
  value,
  options,
  onChange,
  invalid,
  describedBy,
  className,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  // The menu is portalled out of the panel, so dismissal has to watch both.
  useDismiss(open, () => setOpen(false), root, menu);

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-[54px] w-full grid-cols-[1fr_auto] items-center gap-2 rounded-q-300 bg-q-w-05 px-3 py-2 text-left transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
          invalid === true && "ring-1 ring-q-danger/50",
        )}
      >
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span className="text-q-caption-m text-q-muted">{label}</span>
          <span className="truncate text-q-label-sm font-medium text-q-fg">
            {value}
          </span>
        </span>
        <Icon
          name="chevron-right"
          size={16}
          className="shrink-0 text-q-muted"
        />
      </button>

      <input type="hidden" name={name} value={value} />

      <QPopover anchorRef={trigger} open={open} width={144}>
        <div
          ref={menu}
          id={listId}
          role="listbox"
          aria-label={label}
          className="q-menu-surface hf-scrollbar-none min-h-0 overflow-y-auto rounded-q-300 p-2"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <div
                key={option}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onChange(option);
                  setOpen(false);
                }}
                className="flex h-9 cursor-pointer items-center justify-between rounded-q-200 p-2 text-q-menu text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:bg-q-w-08 motion-reduce:transition-none"
              >
                {option}
                {selected ? <Icon name="check" size={16} /> : null}
              </div>
            );
          })}
        </div>
      </QPopover>
    </div>
  );
}
