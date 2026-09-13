"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/core/badge";
import { ButtonLink } from "@/components/core/button-link";
import { Icon } from "@/components/core/icon";
import { Wordmark } from "@/components/layout/wordmark";
import { PRIMARY_NAV } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Sticky glass header. The live site leads with an abstract logo mark; the
 * design system's no-reconstruction rule means no mark was drawn, so the
 * wordmark stands in as plain display type.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-5 border-b border-hairline px-4 lg:px-6",
        "bg-page/72 backdrop-blur-[20px] backdrop-saturate-[1.4]",
      )}
    >
      <Link href="/" className="shrink-0">
        <Wordmark className="text-body-lg" />
      </Link>

      <nav className="hidden min-w-0 items-center gap-4 xl:flex">
        {PRIMARY_NAV.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-1.5 text-body-sm font-medium whitespace-nowrap",
              "transition-colors duration-[140ms]",
              pathname === link.href
                ? "text-primary"
                : "text-secondary hover:text-primary",
            )}
          >
            {link.label}
            {link.badge && (
              <Badge tone="neutral" className="h-4 px-1.5">
                {link.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      <span className="flex-1" />

      {/* The live site hangs the discount pill below the bar; inline keeps it
          from being clipped by the 56px chrome height. */}
      <Link
        href="/pricing"
        className="hidden items-center gap-1.5 text-body-sm font-medium text-lime md:inline-flex"
      >
        <Icon name="flame" size={15} />
        Pricing
        <span className="ml-0.5 rounded-full bg-[#FF2D78] px-1.5 py-px text-[9px] font-bold tracking-wide text-white">
          30% OFF
        </span>
      </Link>

      <Link
        href="/pricing"
        className="hidden items-center gap-1.5 text-body-sm font-medium text-secondary hover:text-primary lg:inline-flex"
      >
        <Icon name="sparkle" size={15} />
        Enterprise
      </Link>

      <button
        type="button"
        aria-label="Language"
        className="hidden text-muted hover:text-primary lg:inline-flex"
      >
        <Icon name="globe" size={17} />
      </button>

      <span className="hidden h-5 w-px bg-hairline lg:block" />

      <Link
        href="/explore"
        className="text-body-sm font-medium text-primary hover:text-lime"
      >
        Login
      </Link>
      <ButtonLink href="/explore" size="sm" pill>
        Sign up
      </ButtonLink>
    </header>
  );
}
