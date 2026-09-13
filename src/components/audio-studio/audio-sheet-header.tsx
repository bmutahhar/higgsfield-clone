import Link from "next/link";

import { Icon } from "@/components/core/icon";
import { LogoMark } from "@/components/layout/logo-mark";

/**
 * The `<md` header.
 *
 * Desktop puts the site chrome above the studio; the phone layout replaces it
 * with a titled sheet, so this only ever renders below the breakpoint. Closing
 * returns home rather than popping history, because the sheet can be arrived
 * at directly from a link.
 */
export function AudioSheetHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:hidden">
      <LogoMark size={28} className="shrink-0" />
      <span className="font-q-display text-q-brand-xxs text-q-fg uppercase">
        Create audio
      </span>
      <Icon name="chevron-down" size={16} className="shrink-0 text-q-soft" />
      <Link
        href="/"
        aria-label="Close"
        className="ml-auto flex size-10 items-center justify-center rounded-q-200 bg-q-w-05 text-q-fg"
      >
        <Icon name="x" size={20} />
      </Link>
    </header>
  );
}
