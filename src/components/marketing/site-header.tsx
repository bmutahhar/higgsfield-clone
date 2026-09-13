"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/core/icon";
import { LogoMark } from "@/components/layout/logo-mark";
import { AccountMenu } from "@/components/marketing/account-menu";
import { NavMenu } from "@/components/marketing/nav-menu";
import { ComingSoon } from "@/components/overlays/coming-soon";
import { NAV_MENUS } from "@/config/nav-menus";
import { PRIMARY_NAV } from "@/config/site";
import { useAuth } from "@/features/auth/auth-context";
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
 * Both sizes cross in 300ms on the CSS `ease-in-out` keyword, spelled as an
 * arbitrary value because Tailwind's ease-in-out utility is a different,
 * asymmetric curve. The live site also runs the buttons' colours on that same
 * 300ms rather than the 140ms the rest of the system uses for controls, so
 * hover settles more slowly here than on a page button.
 *
 * The live site shrinks a bar that overlays the page, because there the
 * document scrolls under it. Here the header is chrome in a body that does not
 * scroll, so it gives its 16px back to the scroll container below instead —
 * same 300ms, and the two animate together.
 *
 * Responsiveness has exactly one breakpoint, `md` (768px) — found by stepping
 * the live header from 320 to 1440. Nothing else moves: between 768 and 1440
 * the link row simply flexes and the action group keeps its 422px.
 *
 *                        >= 768         < 768
 *   link row             visible        display:none
 *   wordmark             hidden         visible, beside the mark
 *   Instagram            hidden         36px glyph, first in the actions
 *   Enterprise           visible        hidden
 *   language             visible        hidden
 *   Login                visible        hidden
 *   Pricing, Sign up     visible        visible
 *   actions gap          8px            4px
 *
 * The row is dropped, not squeezed to nothing, and the difference is not only
 * paint: a zero-width `overflow-x-auto` row still holds all nineteen links in
 * the tab order, so a keyboard would walk through nineteen invisible targets
 * on its way to Sign up.
 *
 * Below md the live header is not sticky either — it scrolls off with the page
 * and the tab bar at the foot of the screen carries navigation from there.
 * Here the header is chrome in a body that does not scroll, so it has nowhere
 * to go; it keeps its compact size instead, which is the same trade this file
 * already makes on desktop for the same reason.
 *
 * `relative` on the row is what the hover menus hang off: it makes the header
 * the containing block for their panels, which both keeps them clear of the
 * nav row's horizontal clipping and lets `top-full` track whatever height the
 * header currently has. `z-60` puts them over the page — above the studio
 * composer at 50, below the dropdowns and modals at 100 and up.
 */

const NAV_LINK =
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[14px] font-medium whitespace-nowrap transition-colors duration-[140ms] ease-snap motion-reduce:duration-0 focus-visible:shadow-ring focus-visible:outline-none";

const BUTTON =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-control px-3 text-[14px] font-medium whitespace-nowrap transition-[height,padding,border-radius,color,background-color] duration-300 ease-[ease-in-out] motion-reduce:duration-0 focus-visible:shadow-ring focus-visible:outline-none group-data-compact:h-6 group-data-compact:rounded-lg group-data-compact:px-2.5";

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
  const { user, openAuth } = useAuth();

  // Explore's href is "/" on the live site, so plain path matching is enough.
  const isActive = (href?: string) =>
    Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      ref={headerRef}
      data-site-chrome
      className="group relative z-60 flex h-13 shrink-0 items-center gap-3 bg-panel px-4 transition-[height] duration-300 ease-[ease-in-out] data-compact:h-9 motion-reduce:duration-0"
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 text-[#F7F7F8]"
        aria-label="Higgsfield home"
      >
        {/* Sized in CSS, not through the `size` prop, so the two states can
              animate into each other. */}
        <LogoMark className="size-8 transition-[width,height] duration-300 ease-[ease-in-out] group-data-compact:size-5 motion-reduce:duration-0" />
        {/* Live shows the wordmark only below md, where the row it would
              otherwise crowd is gone — not above it, which is what this had. */}
        <span className="font-display text-[18px] font-bold tracking-[-0.01em] md:hidden">
          Higgsfield
        </span>
      </Link>

      {/* The live row overflows horizontally rather than collapsing. Entries
            for surfaces this clone has not built render inert, not as 404 links. */}
      {/*
        `self-stretch` rather than the header's default centring: the row is
        otherwise only as tall as a link, and a hover menu's trigger has to
        reach the header's lower edge or the pointer crosses dead space on its
        way down to the panel and the menu closes under it.
      */}
      <nav className="hf-scrollbar-none hidden min-w-0 flex-1 items-center gap-0.5 self-stretch overflow-x-auto md:flex">
        {PRIMARY_NAV.map((link) => {
          const active = isActive(link.href);
          const content = (
            <>
              {link.label}
              {link.badge && <NavBadge>{link.badge}</NavBadge>}
            </>
          );

          const item = link.href ? (
            <Link
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
          ) : (
            <ComingSoon
              side="under-header"
              className={cn(NAV_LINK, "cursor-default text-[#A8A8A8]/45")}
            >
              {content}
            </ComingSoon>
          );

          // Four items open a panel on the live site; the two whose surfaces
          // exist here carry one.
          const menu = link.menu ? NAV_MENUS[link.menu] : undefined;

          return menu ? (
            <NavMenu key={link.label} menu={menu}>
              {item}
            </NavMenu>
          ) : (
            <Fragment key={link.label}>{item}</Fragment>
          );
        })}
      </nav>

      {/* `ml-auto` is inert while the row is there to take the slack, and is
            what holds the actions against the right edge once it is not. */}
      <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
        {/*
          Mobile-only on the live site, and a real outbound link there. Lucide
          v1 dropped its brand marks and the design system forbids redrawing a
          logo it has no file for, so this takes the footer's neutral glyph and
          names the platform in its label.
        */}
        <a
          href="https://www.instagram.com/higgsfield.ai"
          target="_blank"
          rel="noreferrer"
          aria-label="Higgsfield on Instagram"
          className={cn(
            BUTTON,
            "w-9 justify-center bg-transparent px-0 text-white group-data-compact:w-6 group-data-compact:px-0 hover:text-lime md:hidden",
          )}
        >
          <Icon name="camera" size={20} />
        </a>

        <Link
          href="/pricing"
          className={cn(
            BUTTON,
            "relative gap-1.5 bg-transparent px-2 text-lime group-data-compact:px-2",
          )}
        >
          <Icon name="flame" size={15} />
          Pricing
          {/*
            Out of flow, centred on the pill and hanging 8px below it, which is
            where the live chip sits. In flow it adds ~48px to the pill, and
            that is the difference between the actions fitting beside the
            wordmark on a 375px screen and running off the edge. `top-full`
            tracks the pill through both header sizes.
          */}
          <span className="absolute top-full left-1/2 inline-flex h-4 -translate-x-1/2 -translate-y-2 items-center rounded-md bg-[#FF2D78] px-1.5 text-[10px] font-bold whitespace-nowrap text-white">
            30% OFF
          </span>
        </Link>

        <Link
          href="/pricing"
          className={cn(BUTTON, "hidden bg-white/5 text-white md:inline-flex")}
        >
          <Icon name="sparkle" size={15} />
          Enterprise
        </Link>

        <button
          type="button"
          aria-label="Language"
          className={cn(
            BUTTON,
            "hidden w-9 justify-center px-0 text-[#A8A8A8] group-data-compact:w-6 group-data-compact:px-0 hover:text-primary md:inline-flex",
          )}
        >
          <Icon name="globe" size={17} />
        </button>

        {user ? (
          <AccountMenu />
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                openAuth("login");
              }}
              className={cn(
                BUTTON,
                "hidden bg-lime/8 text-lime md:inline-flex",
              )}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                openAuth("signup");
              }}
              className={cn(
                BUTTON,
                "bg-accent text-[#1A1A1A] hover:bg-accent-hover",
              )}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
