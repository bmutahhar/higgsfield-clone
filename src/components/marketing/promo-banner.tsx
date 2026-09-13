"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";

/**
 * Lime promo strip above the header. Dismissible, and the one place in the
 * system where lime is a background for a run of text — it is a single short
 * line, not a text block.
 */
export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      data-site-chrome
      className="relative flex h-9 items-center justify-center gap-3 bg-accent px-10 text-n-0"
    >
      <Icon name="tag" size={15} className="hidden sm:block" />
      <span className="truncate text-body-sm font-medium">
        Get an additional discount on premium plans after signing up
      </span>
      <button
        type="button"
        className="hidden h-6 shrink-0 items-center rounded-full bg-n-0 px-3 text-caption font-medium text-primary transition-opacity hover:opacity-80 sm:inline-flex"
      >
        Get your discount
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
        }}
        className="absolute right-4 inline-flex text-n-0 opacity-70 transition-opacity hover:opacity-100"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
