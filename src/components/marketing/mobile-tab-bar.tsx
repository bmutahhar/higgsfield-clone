"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/core/icon";
import { MOBILE_TABS, type MobileTab } from "@/config/site";
import { cn } from "@/lib/cn";

/*
 * The navigation the live site swaps in below `md`. The header's link row goes
 * to `display:none` at that width and these five tabs take over at the foot of
 * the screen — measured off the live bar rather than eyeballed:
 *
 *   bar       #131517, 4px padding, five equal columns
 *   tab       48px tall, 12px radius, 20px glyph over a 10px/500 label
 *   label     #FFFFFF when current, #898A8B otherwise
 *   create    66x44, lime, 12px radius, a 24px glyph in #2F3907, and
 *             `inset 0 -3px 0 #829B19` for the pressed lip
 *
 * The live bar is `sticky` because the live body scrolls underneath it. Here
 * the body does not scroll — each route group owns its own scroller — so the
 * bar is a flex sibling of that scroller and stays put without it. It keeps
 * the home-indicator inset, which is a fact about the device rather than
 * about scrolling.
 *
 * `data-site-chrome` is load-bearing, not decoration: the mobile pricing
 * surface is a takeover that hides every marked element (see the rule in
 * q-studio.css), and this bar is chrome by the same argument the header is.
 */

const TAB = cn(
  "flex flex-col items-center justify-center gap-0.5 rounded-xl p-1.5",
  "text-center text-[10px] leading-[14px] font-medium",
  "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
  "focus-visible:shadow-ring focus-visible:outline-none",
);

const CREATE = cn(
  "grid h-11 w-[66px] place-items-center rounded-xl bg-accent text-[#2F3907]",
  // The lip under the button is part of its shape, not a shadow the elevation
  // scale carries — the scale has no inset step.
  "shadow-[inset_0_-3px_0_0_#829B19]",
  "transition-[translate,opacity] duration-[140ms] ease-snap motion-reduce:duration-0",
  "active:translate-y-0.5 active:opacity-90",
  "focus-visible:shadow-ring focus-visible:outline-none",
);

function TabFace({ tab }: { tab: MobileTab }) {
  return (
    <>
      <Icon name={tab.icon} size={20} />
      <span className="px-1">{tab.label}</span>
    </>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      data-site-chrome
      aria-label="Primary"
      className="grid shrink-0 auto-cols-fr grid-flow-col items-center bg-[#131517] p-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] md:hidden"
    >
      {MOBILE_TABS.map((tab) => {
        if (tab.primary) {
          const glyph = <Icon name={tab.icon} size={24} />;

          return (
            <div key={tab.label} className="flex items-center justify-center">
              {tab.href ? (
                <Link href={tab.href} aria-label={tab.label} className={CREATE}>
                  {glyph}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title={`${tab.label} — not built in this clone`}
                  className={cn(CREATE, "cursor-default opacity-45")}
                >
                  {glyph}
                </span>
              )}
            </div>
          );
        }

        // Every tab but Home is a surface this clone has not built, so the
        // href does the deciding rather than a per-tab flag.
        if (!tab.href) {
          return (
            <span
              key={tab.label}
              aria-disabled="true"
              title={`${tab.label} — not built in this clone`}
              className={cn(TAB, "cursor-default text-[#898A8B]/45")}
            >
              <TabFace tab={tab} />
            </span>
          );
        }

        const current = pathname === tab.href;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              TAB,
              current ? "text-white" : "text-[#898A8B] hover:text-white",
            )}
          >
            <TabFace tab={tab} />
          </Link>
        );
      })}
    </nav>
  );
}
