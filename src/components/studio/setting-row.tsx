"use client";

import { useId, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { QPopover } from "@/components/overlays/q-popover";
import { useDismiss } from "@/components/overlays/use-dismiss";
import { cn } from "@/lib/cn";

export interface SettingRowProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
  icon?: IconName;
  /**
   * `compact` is the 40px chip the Edit surface lines up in a row; `stacked`
   * is the 48px two-line row Motion Control and Genjutsu use.
   */
  layout?: "compact" | "stacked";
  /** Draws the value as a brand chip — the Bitrate control's treatment. */
  accent?: boolean;
  bordered?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/**
 * A settings control that opens a menu.
 *
 * Portalled, like every other menu in this panel: the form clips its overflow,
 * so anything anchored inside it is sliced at the panel edge.
 */
export function SettingRow({
  label,
  value,
  options,
  onChange,
  icon,
  layout = "stacked",
  accent,
  bordered,
  invalid,
  describedBy,
  className,
}: SettingRowProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), root, menu);

  const compact = layout === "compact";

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <button
        ref={trigger}
        type="button"
        // The same shape `QSelect` already uses, and what this actually is: a
        // listbox trigger. `aria-invalid` is not allowed on a plain button,
        // which is what flagged it, and the role requires the pairing below.
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 text-left transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
          compact ? "h-10 rounded-q-200 px-2" : "h-12 rounded-q-300 px-3 py-2",
          bordered ? "border border-q-hairline bg-q-card" : "bg-q-w-05",
          invalid === true && "ring-1 ring-q-danger/50",
        )}
      >
        {icon && (
          <Icon name={icon} size={compact ? 16 : 20} className="shrink-0" />
        )}

        {compact ? (
          <span className="flex min-w-0 flex-1 items-center gap-1">
            <span className="truncate text-q-label-sm font-medium text-q-fg">
              {accent ? label : value}
            </span>
          </span>
        ) : (
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="text-q-caption-m text-q-muted">{label}</span>
            <span className="truncate text-q-label-sm font-medium text-q-fg">
              {value}
            </span>
          </span>
        )}

        {accent && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-q-150 bg-q-accent-10 py-0.5 pr-2 pl-0.5">
            <Icon name="gauge" size={16} className="text-q-brand" />
            <span className="text-q-label-xs font-medium text-q-brand">
              {value}
            </span>
          </span>
        )}

        <Icon
          name="chevron-right"
          size={16}
          className="shrink-0 text-q-muted"
        />
      </button>

      <QPopover anchorRef={trigger} open={open} width={176}>
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
                {selected && <Icon name="check" size={16} />}
              </div>
            );
          })}
        </div>
      </QPopover>
    </div>
  );
}
