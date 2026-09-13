"use client";

import { Icon, type IconName } from "@/components/core/icon";
import { RatioGlyph } from "@/components/image-studio/ratio-glyph";
import { PILL_CLASS } from "@/components/image-studio/setting-pill";
import { Dropdown } from "@/components/overlays/dropdown";
import { cn } from "@/lib/cn";

export interface SettingOption {
  id: string;
  /** Renders the two-line row. */
  description?: string;
  /** Renders the icon-tile row. */
  icon?: IconName;
  /** Renders the icon-tile row with a proportional rectangle. */
  ratio?: { w: number; h: number };
}

export interface SettingPopoverProps {
  /** Heading inside the panel, e.g. "Select quality". */
  title: string;
  /** Pill icon. */
  icon: IconName;
  value: string;
  options: SettingOption[];
  onChange: (next: string) => void;
  /** 200 for the icon lists, 300 for the described ones. */
  width?: number;
}

/*
 * Pattern A: a titled listbox.
 *
 * Upstream paints the heading as an absolutely positioned span outside the
 * panel, drawing three of its own borders so it appears to sit inside one. A
 * sticky first child of the bordered panel gets to the same picture with none
 * of that, and keeps the heading in place while the list scrolls.
 *
 * Both row shapes highlight on `group-hover` and carry the identical fill when
 * selected — the check mark is the only thing that separates hovered from
 * chosen, which is how the live menu reads.
 */
export function SettingPopover({
  title,
  icon,
  value,
  options,
  onChange,
  width = 200,
}: SettingPopoverProps) {
  const described = options.some((o) => o.description !== undefined);

  return (
    <Dropdown
      label={title}
      width={width}
      align="start"
      triggerClassName={cn(PILL_CLASS, "justify-center")}
      panelClassName={cn(
        "rounded-q-300 border border-q-accent-05 bg-q-modal px-1 pt-0 pb-2 shadow-none",
      )}
      trigger={
        <>
          <Icon name={icon} size={20} />
          <span>{value}</span>
        </>
      }
    >
      {(close) => (
        <>
          <div className="sticky top-0 z-1 -mx-1 bg-q-modal px-3 pt-2.5 pb-2">
            <span className="text-q-body-sm text-q-idle">{title}</span>
          </div>
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.id);
                  close();
                }}
                className="group flex w-full items-center gap-1 rounded-q-200 px-1.5 py-1.5 text-left capitalize focus-visible:outline-none"
              >
                {!described && (
                  <span
                    className={cn(
                      "flex h-9 w-8 shrink-0 items-center justify-center rounded-q-150 p-1",
                      "transition-colors group-hover:bg-q-w-08 group-focus-visible:bg-q-w-08",
                      selected && "bg-q-w-08",
                    )}
                  >
                    {option.ratio ? (
                      <RatioGlyph w={option.ratio.w} h={option.ratio.h} />
                    ) : (
                      <Icon name={option.icon ?? "scan"} size={20} />
                    )}
                  </span>
                )}

                <span
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-q-150 p-2",
                    "transition-colors group-hover:bg-q-w-08 group-focus-visible:bg-q-w-08",
                    selected && "bg-q-w-08",
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-q-body-sm">{option.id}</span>
                    {option.description !== undefined && (
                      <span className="truncate text-q-caption-xs font-normal text-q-idle">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <Icon
                      name="check"
                      size={16}
                      className="shrink-0 text-q-idle"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </>
      )}
    </Dropdown>
  );
}
