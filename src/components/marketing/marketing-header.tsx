"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/core/button-link";
import { Wordmark } from "@/components/layout/wordmark";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/effects", label: "Effects" },
  { href: "/pricing", label: "Pricing" },
];

/** Sticky 64px glass header — one of the few places blur is sanctioned. */
export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-6.5 border-b border-hairline px-8",
        "bg-page/72 backdrop-blur-[20px] backdrop-saturate-[1.4]",
      )}
    >
      <Link href="/">
        <Wordmark className="text-[18px]" />
      </Link>
      <nav className="hidden gap-5.5 sm:flex">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-body-sm font-medium transition-colors duration-[140ms]",
              pathname === link.href
                ? "text-primary"
                : "text-muted hover:text-primary",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="flex-1" />
      <Link
        href="/explore"
        className="text-body-sm font-medium text-secondary hover:text-primary"
      >
        Login
      </Link>
      <ButtonLink href="/explore" size="sm" pill>
        Sign up
      </ButtonLink>
    </header>
  );
}
