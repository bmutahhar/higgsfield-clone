"use client";

import { Icon, type IconName } from "@/components/core/icon";
import { Dropdown } from "@/components/overlays/dropdown";
import { cn } from "@/lib/cn";

export interface ActionMenuEntry {
  id: string;
  label: string;
  icon: IconName;
  /** Parents of a submenu show a trailing chevron. */
  submenu?: boolean;
  danger?: boolean;
  /**
   * Absent leaves the row inert. That is the honest shape of the menu for the
   * handful of rows whose sub-surfaces this project does not build — an
   * affordance that leads nowhere still tells you what the product does.
   */
  onSelect?: () => void | Promise<void>;
}

export interface ActionMenuProps {
  /** `null` is a separator. */
  entries: (ActionMenuEntry | null)[];
  label?: string;
  triggerClassName?: string;
  width?: number;
}

/**
 * A generation's overflow menu. Glass rather than a flat surface: 75% of the
 * secondary fill over a heavy blur, so the image reads through it.
 *
 * Entries carry their own behaviour rather than the menu switching on ids —
 * both studios show one of these over a different set of rows, and a shared
 * `switch` would have to know about every surface that ever uses it.
 */
export function ActionMenu({
  entries,
  label = "More actions",
  triggerClassName,
  width = 180,
}: ActionMenuProps) {
  return (
    <Dropdown
      label={label}
      role="menu"
      width={width}
      align="end"
      triggerClassName={triggerClassName}
      panelClassName={cn(
        "flex flex-col gap-0.5 rounded-q-400 p-0.5 shadow-[0_4px_4px_rgba(0,0,0,0.12)]",
        "border border-q-hairline bg-q-card-strong/75 backdrop-blur-2xl",
      )}
      trigger={<Icon name="ellipsis" size={16} />}
    >
      {(close) =>
        entries.map((entry, i) =>
          entry === null ? (
            <span
              // Separators have no identity of their own; position is all they are.
              key={`sep-${String(i)}`}
              role="separator"
              className="my-0.5 h-px w-full bg-q-hairline"
            />
          ) : (
            <button
              key={entry.id}
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                /*
                 * Closed before acting, so an action that moves focus — a
                 * Recreate landing the caret in the prompt — is not fighting
                 * the panel's own teardown. Still synchronous within the
                 * click, which is what the clipboard write needs.
                 *
                 * There is nowhere left to report a failure once the panel is
                 * gone, so one surfaces in the console rather than being
                 * swallowed here.
                 */
                void entry.onSelect?.();
              }}
              className={cn(
                "flex h-8 w-full min-w-0 cursor-pointer items-center gap-1 rounded-q-300 p-2 text-left",
                "text-q-menu leading-4 text-q-body transition-colors outline-none",
                entry.danger
                  ? "text-q-danger hover:bg-q-danger-soft focus-visible:bg-q-danger-soft"
                  : "hover:bg-q-w-10 focus-visible:bg-q-w-10",
              )}
            >
              <Icon
                name={entry.icon}
                size={16}
                className={entry.danger ? "text-q-danger" : "text-q-fg"}
              />
              <span className="truncate">{entry.label}</span>
              {entry.submenu === true && (
                <Icon name="chevron-right" size={16} className="ml-auto" />
              )}
            </button>
          ),
        )
      }
    </Dropdown>
  );
}
