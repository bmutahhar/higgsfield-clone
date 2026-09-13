import type { ReactNode } from "react";
import Link from "next/link";

import { Icon } from "@/components/core/icon";
import type { NavMenu as NavMenuData, NavMenuRow } from "@/config/nav-menus";
import { cn } from "@/lib/cn";

/*
 * The header's hover menu — a two-column panel that opens under a nav item.
 *
 * Open is CSS, not state: the wrapper is a group and the panel reveals on
 * `group-hover` and `group-focus-within`. Two details make that work rather
 * than merely look like it works.
 *
 * First, the panel is `absolute`, not `fixed`, and its containing block is the
 * header — the wrapper is deliberately NOT `relative`. The nav row is
 * `overflow-x-auto`, which clips its descendants; an absolutely positioned box
 * whose containing block sits *above* the scroll container escapes that
 * clipping. Resolving against the header also means `top-full` tracks the
 * header's own height, so the panel stays glued to its lower edge whether the
 * header is at rest, compacted by scroll, or shifted by the promo banner being
 * dismissed. None of those are numbers this file has to know.
 *
 * Second, the closed panel is `invisible`, not merely transparent, which keeps
 * its links out of the tab order and out of the accessibility tree. That is
 * what makes the keyboard path work instead of breaking it: focusing the
 * trigger puts `:focus-within` on the wrapper, the panel turns visible, and
 * only then are its links focusable — so Tab walks into a panel that is
 * already on screen. The wrapper is `h-full` so the pointer travelling from
 * the link down to the panel never leaves the group and the menu does not
 * close mid-journey.
 */

const PANEL = cn(
  // Hidden below md: hover menus are a pointer affordance, and the live site
  // drops the whole row at that width rather than shrinking this.
  "max-md:hidden",
  "invisible absolute top-full left-4 -translate-y-1 opacity-0",
  "w-[min(55rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain",
  "max-h-[min(50rem,calc(100dvh-7rem))]",
  // 24px is the live panel's radius and sits outside the token set, which
  // stops at 20px for a modal — written as a literal the way the header
  // already writes the values it measured off the live surface.
  "rounded-[24px] border border-hairline bg-n-4 shadow-e3",
  "transition-[opacity,translate,visibility] duration-[140ms] ease-snap motion-reduce:duration-0",
  "group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100",
  /*
   * `:focus-visible`, not `:focus-within`. A mouse click leaves focus on the
   * row it followed, and plain `:focus-within` would then hold the panel open
   * over the page you just navigated to until you clicked something else. The
   * browser only marks focus "visible" when it arrived by keyboard, which is
   * exactly the case that needs the panel open.
   */
  "group-has-[:focus-visible]/menu:visible group-has-[:focus-visible]/menu:translate-y-0 group-has-[:focus-visible]/menu:opacity-100",
);

const ROW = cn(
  "grid grid-cols-[auto_1fr] items-center gap-3 rounded-panel p-2",
  "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
  "focus-visible:shadow-ring focus-visible:outline-none",
);

/*
 * The live chip: uppercase, bold, and skewed 12°. Lime carries "New"; anything
 * else takes the hot pink, which has no token because the system carries
 * exactly one brand accent — the header writes its discount chip the same way.
 *
 * It sits beside the name rather than on the icon tile, where the live menu
 * puts it. That placement only survives a three-letter word: this catalogue
 * says "Premium", which at any legible size is wider than the 48px tile and
 * lands on top of the model's name. Beside the name is also where the studio's
 * own model picker puts it, so the two surfaces agree.
 */
function RowBadge({ badge }: { badge: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 shrink-0 -skew-x-12 items-center rounded-[3px] px-1",
        "text-[10px] leading-4 font-bold uppercase",
        badge === "New" ? "bg-lime text-n-0" : "bg-[#FF005B] text-white",
      )}
    >
      {badge}
    </span>
  );
}

function Row({ row }: { row: NavMenuRow }) {
  const content = (
    <>
      <span
        className={cn(
          "grid size-12 place-items-center rounded-media border bg-w-06 text-secondary",
          row.badge === undefined
            ? "border-transparent"
            : row.badge === "New"
              ? "border-lime/24"
              : "border-[#FF005B]/24",
        )}
      >
        <Icon name={row.icon} size={24} />
      </span>

      {/*
        Both lines truncate so every row is the live panel's flat 64px,
        whatever the length of a model's one-liner.
      */}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[14px] font-medium text-primary">
            {row.label}
          </span>
          {row.badge && <RowBadge badge={row.badge} />}
        </span>
        <span className="block truncate text-[14px] text-muted">
          {row.blurb}
        </span>
      </span>
    </>
  );

  // Same treatment the nav row gives a surface this clone has not built: inert
  // and dimmed, rather than a link to a 404.
  if (!row.href) {
    return (
      <span
        aria-disabled="true"
        title={`${row.label} — not built in this clone`}
        className={cn(ROW, "cursor-default opacity-45")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={row.href} className={cn(ROW, "hover:bg-w-06")}>
      {content}
    </Link>
  );
}

export interface NavMenuProps {
  menu: NavMenuData;
  /** The nav link this menu hangs off. */
  children: ReactNode;
}

export function NavMenu({ menu, children }: NavMenuProps) {
  return (
    <div className="group/menu flex h-full shrink-0 items-center">
      {children}

      <div className={PANEL}>
        <div className="grid grid-cols-2 gap-x-2 p-1">
          {menu.columns.map((column) => (
            <div key={column.heading} className="min-w-0">
              <p
                aria-hidden="true"
                className="px-2 py-2 text-[14px] text-muted"
              >
                {column.heading}
              </p>
              <ul aria-label={`${menu.label} ${column.heading}`}>
                {column.rows.map((row) => (
                  <li key={row.label}>
                    <Row row={row} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
