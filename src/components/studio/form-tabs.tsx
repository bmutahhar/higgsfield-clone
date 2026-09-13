import Link from "next/link";

import { FORM_TABS } from "@/config/genjutsu";
import { cn } from "@/lib/cn";

/**
 * The three surfaces above the form. These are routes, not local state — each
 * one is a different model with a different form — so they are links, and the
 * active one is decided by which page rendered them.
 */
export function FormTabs() {
  return (
    <nav
      aria-label="Generation surface"
      className="hf-scrollbar-none flex min-w-0 shrink-0 gap-3 overflow-x-auto bg-transparent px-4 pt-3"
    >
      {FORM_TABS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "h-9 shrink-0 border-b-2 text-q-label-sm font-medium whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none",
            item.active
              ? "border-b-white text-q-fg"
              : "border-b-transparent text-q-idle hover:text-q-fg",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
