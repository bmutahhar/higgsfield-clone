"use client";

import { FormTabs } from "@/components/studio/form-tabs";
import { GenerateButton } from "@/components/studio/generate-button";
import { PromoCard, type PromoCardProps } from "@/components/studio/promo-card";
import type { FormTabId } from "@/config/genjutsu";

export interface StudioPanelProps {
  activeTab: FormTabId;
  promo: PromoCardProps;
  /** The fields for this surface. Everything around them is the same. */
  children: React.ReactNode;
  onSubmit: () => void;
  /** Whichever validation message should be reported, if any. */
  message?: string;
  errorId: string;
  cost?: { list?: number; net?: number };
  /** Portalled extras — a hover preview, say — rendered outside the form. */
  aside?: React.ReactNode;
}

/**
 * The shell every video surface shares: the three route tabs, the model card,
 * a scroller for the fields, and a footer that keeps Generate on screen however
 * long the form gets.
 *
 * Extracted once the second and third surfaces arrived. The three differ only
 * in the fields between the promo card and the footer, and in the schema behind
 * them — everything here was identical on all three, and keeping three copies
 * would have meant fixing every panel bug three times.
 *
 * The error line lives above the button rather than beside its field: the
 * scroller moves and the footer does not, so a message next to a control could
 * be reported somewhere the reader cannot see.
 */
export function StudioPanel({
  activeTab,
  promo,
  children,
  onSubmit,
  message,
  errorId,
  cost,
  aside,
}: StudioPanelProps) {
  return (
    <div className="hidden max-h-full min-h-0 min-w-0 flex-col self-start overflow-hidden rounded-q-500 border border-q-hairline bg-q-panel md:flex">
      <FormTabs active={activeTab} />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex min-h-0 shrink-0 flex-col overflow-hidden"
      >
        <div className="hf-scrollbar-none flex max-h-[calc(100vh-16rem)] shrink-0 flex-col gap-4 overflow-x-visible overflow-y-auto p-2">
          <PromoCard {...promo} />
          <div className="flex flex-col">{children}</div>
        </div>

        <div className="relative w-full shrink-0 space-y-2 rounded-b-q-500 px-2 py-3">
          {message !== undefined && (
            <p
              id={errorId}
              role="alert"
              className="px-1 text-q-label-xs text-q-danger"
            >
              {message}
            </p>
          )}
          <GenerateButton list={cost?.list} net={cost?.net} />
        </div>
      </form>

      {aside}
    </div>
  );
}
