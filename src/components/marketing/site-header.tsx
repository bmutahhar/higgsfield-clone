"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/core/icon";
import { LogoMark } from "@/components/layout/logo-mark";
import { PRIMARY_NAV } from "@/config/site";
import { cn } from "@/lib/cn";

import { useCompactHeader } from "./use-compact-header";

/*
 * Measured against the live header rather than eyeballed. The values below are
 * taken from its computed styles, so a few sit outside the design system's
 * token set and are written as exact literals. The header has two sizes — a
 * resting one at the top of the page and a compact one for everything below:
 *
 *              at rest              scrolled
 *   row        52px tall            36px tall, still solid #0F1113, no blur
 *   logo       32px                 20px
 *   buttons    36px, r10, 0 12px    24px, r8, 0 10px
 *   nav link   14px/500, 4px 8px, radius 8, #A8A8A8 idle — same in both
 *   active     lime text — not white, which is what this had before
 *   badges     10px/700, radius 6, lime at 20% on lime text
 *
 * Both sizes cross in 300ms ease-in-out, and the live site runs the buttons'
 * colours on that same 300ms rather than the 140ms the rest of the system uses
 * for controls — so hover here settles slower than on a page button.
 *
 * The live site shrinks a bar that overlays the page, because there the
 * document scrolls under it. Here the header is chrome in a body that does not
 * scroll, so it gives its 16px back to the scroll container below instead —
 * same 300ms, and the two animate together.
 */

const NAV_LINK =
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[14px] font-medium whitespace-nowrap transition-colors duration-[140ms] ease-snap motion-reduce:duration-0 focus-visible:shadow-ring focus-visible:outline-none";

const BUTTON =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-control px-3 text-[14px] font-medium whitespace-nowrap transition-[height,padding,border-radius,color,background-color] duration-300 ease-in-out motion-reduce:duration-0 focus-visible:shadow-ring focus-visible:outline-none group-data-compact:h-6 group-data-compact:rounded-lg group-data-compact:px-2.5";

function NavBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex h-4 items-center rounded-md bg-lime/20 px-1.5 text-[10px] font-bold text-lime">
      {children}
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useCompactHeader<HTMLElement>(pathname);

  // Explore's href is "/" on the live site, so plain path matching is enough.
  const isActive = (href?: string) =>
    Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      ref={headerRef}
      className="group flex h-13 shrink-0 items-center gap-3 bg-panel px-4 transition-[height] duration-300 ease-in-out data-compact:h-9 motion-reduce:duration-0"
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 text-[#F7F7F8]"
        aria-label="Higgsfield home"
      >
        {/* Sized in CSS, not through the `size` prop, so the two states can
              animate into each other. */}
        <LogoMark className="size-8 transition-[width,height] duration-300 ease-in-out group-data-compact:size-5 motion-reduce:duration-0" />
        <span className="hidden font-display text-[16px] tracking-[-0.01em] sm:block">
          Higgsfield
        </span>
      </Link>

      {/* The live row overflows horizontally rather than collapsing. Entries
            for surfaces this clone has not built render inert, not as 404 links. */}
      <nav className="hf-scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
        {PRIMARY_NAV.map((link) => {
          const active = isActive(link.href);
          const content = (
            <>
              {link.label}
              {link.badge && <NavBadge>{link.badge}</NavBadge>}
            </>
          );

          if (!link.href) {
            return (
              <span
                key={link.label}
                aria-disabled="true"
                title={`${link.label} — not built in this clone`}
                className={cn(NAV_LINK, "cursor-default text-[#A8A8A8]/45")}
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                NAV_LINK,
                active
                  ? "text-lime"
                  : "text-[#A8A8A8] hover:bg-w-06 hover:text-primary",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/pricing"
          className={cn(
            BUTTON,
            "gap-1.5 bg-transparent px-2 text-lime group-data-compact:px-2",
          )}
        >
          <Icon name="flame" size={15} />
          Pricing
          <span className="inline-flex h-4 items-center rounded-md bg-[#FF2D78] px-1.5 text-[10px] font-bold text-white">
            30% OFF
          </span>
        </Link>

        <Link
          href="/pricing"
          className={cn(BUTTON, "hidden bg-white/5 text-white lg:inline-flex")}
        >
          <Icon name="sparkle" size={15} />
          Enterprise
        </Link>

        <button
          type="button"
          aria-label="Language"
          className={cn(
            BUTTON,
            "hidden w-9 justify-center px-0 text-[#A8A8A8] group-data-compact:w-6 group-data-compact:px-0 hover:text-primary lg:inline-flex",
          )}
        >
          <Icon name="globe" size={17} />
        </button>

        <Link href="/" className={cn(BUTTON, "bg-lime/8 text-lime")}>
          Login
        </Link>

        <Link
          href="/"
          className={cn(
            BUTTON,
            "bg-accent text-[#1A1A1A] hover:bg-accent-hover",
          )}
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
