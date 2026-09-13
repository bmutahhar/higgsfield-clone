"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { IconName } from "@/components/core/icon";
import { NavRailItem } from "@/components/navigation/nav-rail-item";

interface NavEntry {
  icon: IconName;
  label: string;
  href?: string;
  badge?: string;
}

/*
 * The product's full surface inventory. Entries without an href are surfaces
 * the real site has that this clone has not built yet — they render muted and
 * inert rather than linking to a 404.
 */
const APP_NAV: NavEntry[] = [
  { icon: "compass", label: "Explore", href: "/" },
  { icon: "clapperboard", label: "Video", href: "/ai/video" },
  { icon: "wand-2", label: "Effects", href: "/effects", badge: "New" },
  { icon: "image", label: "Image", href: "/ai/image" },
  { icon: "layers", label: "Edit" },
  { icon: "bot", label: "Supercomputer" },
];

const FOOTER_NAV: NavEntry[] = [
  { icon: "folder", label: "Projects" },
  { icon: "settings", label: "Settings" },
];

function Entry({ entry, active }: { entry: NavEntry; active: boolean }) {
  if (!entry.href) {
    return (
      <NavRailItem
        icon={entry.icon}
        label={`${entry.label} — not built yet`}
        badge={entry.badge}
        disabled
        className="opacity-40"
      />
    );
  }
  return (
    <Link href={entry.href} className="w-full">
      <NavRailItem
        icon={entry.icon}
        label={entry.label}
        badge={entry.badge}
        active={active}
        tabIndex={-1}
      />
    </Link>
  );
}

/** 72px icon rail. Active nav is a 12%-white fill, never lime. */
export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="flex w-18 shrink-0 flex-col items-center gap-1 border-r border-hairline bg-page px-2.5 py-3">
      {APP_NAV.map((entry) => (
        <Entry
          key={entry.label}
          entry={entry}
          active={Boolean(entry.href && pathname.startsWith(entry.href))}
        />
      ))}
      <span className="flex-1" />
      {FOOTER_NAV.map((entry) => (
        <Entry key={entry.label} entry={entry} active={false} />
      ))}
    </nav>
  );
}
