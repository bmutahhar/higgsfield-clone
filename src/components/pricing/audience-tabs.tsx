"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export type Audience = "individual" | "business";

const TABS: { id: Audience; label: string }[] = [
  { id: "individual", label: "Individual plans" },
  { id: "business", label: "Business plans" },
];

/*
 * Individual ⇄ Business.
 *
 * The thumb is one element that slides, not a background on the active tab:
 * sliding is what makes the two feel like one control rather than two buttons.
 * It sits behind the labels at z-0 so the type never fades through it.
 */
interface AudienceTabsProps {
  value: Audience;
  onChange: (value: Audience) => void;
  /** Id of the panel the tabs control, for aria-controls. */
  panelId: string;
  className?: string;
}

export function AudienceTabs({
  value,
  onChange,
  panelId,
  className,
}: AudienceTabsProps) {
  const index = TABS.findIndex((tab) => tab.id === value);

  return (
    <div
      role="tablist"
      aria-label="Plan audience"
      className={cn(
        "relative flex w-max items-center overflow-hidden rounded-q-300 border border-q-subtle bg-q-w-05 p-1",
        className,
      )}
    >
      <span
        aria-hidden
        /*
         * Inline style: the thumb's offset is a multiple of the active tab's
         * index, which is data. Everything else about it is a class.
         */
        style={{ "--index": index } as CSSProperties}
        className={cn(
          "absolute left-1 h-8 w-40 rounded-q-200 border border-q-subtle bg-q-w-05",
          "translate-x-[calc(var(--index)*100%)]",
          "transition-[transform,width] duration-300 ease-q-std",
          "motion-reduce:transition-none",
        )}
      />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${panelId}-tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={panelId}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative z-10 flex h-8 min-w-40 items-center justify-center gap-1.5 rounded-q-200",
            "px-3 text-sm leading-5 font-semibold whitespace-nowrap",
            "transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
            tab.id === value ? "text-white" : "text-q-soft",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
