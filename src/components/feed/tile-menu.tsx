"use client";

import { Icon, type IconName } from "@/components/core/icon";
import { Dropdown } from "@/components/studio/dropdown";
import { cn } from "@/lib/cn";

interface MenuEntry {
  id: string;
  label: string;
  icon: IconName;
  /** Parents of a submenu show a trailing chevron. */
  submenu?: boolean;
  danger?: boolean;
}

/** `null` is a separator. */
const ENTRIES: (MenuEntry | null)[] = [
  { id: "open", label: "Open", icon: "arrow-up-right" },
  { id: "regenerate", label: "Regenerate", icon: "rotate-cw" },
  { id: "reuse", label: "Reuse", icon: "copy" },
  {
    id: "create-element",
    label: "Create element",
    icon: "at-sign",
    submenu: true,
  },
  { id: "assign-element", label: "Assign to element", icon: "at-sign" },
  {
    id: "additional",
    label: "Additional",
    icon: "wand-sparkles",
    submenu: true,
  },
  null,
  { id: "like", label: "Like", icon: "heart" },
  { id: "share", label: "Share", icon: "share-2", submenu: true },
  { id: "folder", label: "Add to folder", icon: "folder-plus", submenu: true },
  null,
  { id: "download", label: "Download", icon: "download" },
  { id: "delete", label: "Delete", icon: "trash-2", danger: true },
];

export interface TileMenuProps {
  triggerClassName?: string;
  onDelete: () => void;
}

/*
 * A feed tile's overflow menu. Glass rather than a flat surface: 75% of the
 * secondary fill over a heavy blur, so the image reads through it.
 *
 * The six items that open submenus upstream carry their chevron but no
 * submenu — the sub-surfaces are out of this route's scope, and an affordance
 * that leads nowhere is still the honest shape of the menu.
 */
export function TileMenu({ triggerClassName, onDelete }: TileMenuProps) {
  return (
    <Dropdown
      label="More actions"
      role="menu"
      width={180}
      align="end"
      triggerClassName={triggerClassName}
      panelClassName={cn(
        "flex flex-col gap-0.5 rounded-q-400 p-0.5 shadow-[0_4px_4px_rgba(0,0,0,0.12)]",
        "border border-q-hairline bg-q-card-strong/75 backdrop-blur-2xl",
      )}
      trigger={<Icon name="ellipsis" size={16} />}
    >
      {(close) =>
        ENTRIES.map((entry, i) =>
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
                if (entry.id === "delete") onDelete();
                close();
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
              {entry.submenu && (
                <Icon name="chevron-right" size={16} className="ml-auto" />
              )}
            </button>
          ),
        )
      }
    </Dropdown>
  );
}
