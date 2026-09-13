import Link from "next/link";

import { FORM_TABS, type FormTabId } from "@/config/genjutsu";
import { cn } from "@/lib/cn";

/**
 * The three surfaces above the form. These are routes, not local state — each
 * one is a different model with a different form — so they are links, and which
 * is current is decided by the page that rendered them rather than by config.
 */
export function FormTabs({ active }: { active: FormTabId }) {
  return (
    <nav
      aria-label="Generation surface"
      className="hf-scrollbar-none flex min-w-0 shrink-0 gap-3 overflow-x-auto bg-transparent px-4 pt-3"
    >
      {FORM_TABS.map((item) => {
        const current = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "h-9 shrink-0 border-b-2 text-q-label-sm font-medium whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none",
              current
                ? "border-b-white text-q-fg"
                : "border-b-transparent text-q-idle hover:text-q-fg",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
