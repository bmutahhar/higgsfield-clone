"use client";

import { AUDIO_TABS, type AudioMode } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The left column's frame: the card, the three tabs, and a slot for whichever
 * form is showing.
 *
 * Not `StudioPanel`. That shell belongs to the video surfaces — it carries
 * their route tabs and their promo card, sits on a 20px radius, and hides
 * outright below `md`. This panel is 24px, its tabs are in-panel state rather
 * than links, it has no promo, and below `md` it becomes a full-screen sheet
 * instead of disappearing. Sharing them would have meant a component with two
 * of everything.
 *
 * The tab is real state — it swaps the whole form body, which no CSS selector
 * can express. Everything else here is paint, so it is classes.
 */
export function AudioPanel({
  mode,
  onModeChange,
  children,
}: {
  mode: AudioMode;
  onModeChange: (next: AudioMode) => void;
  children: React.ReactNode;
}) {
  return (
    <aside className="flex h-full min-h-0 w-85.5 shrink-0 flex-col pb-4">
      <div className="flex max-h-full min-h-0 flex-col overflow-hidden rounded-q-600 border border-q-subtle bg-q-panel">
        <div
          role="tablist"
          aria-label="Audio mode"
          className="mx-3 flex min-w-0 shrink-0 justify-between border-b border-q-card px-2 pt-3"
        >
          {AUDIO_TABS.map((tab) => {
            const active = tab.id === mode;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`audio-tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`audio-panel-${tab.id}`}
                /* Roving tabindex: one stop for the whole set, as ARIA wants. */
                tabIndex={active ? 0 : -1}
                onClick={() => {
                  onModeChange(tab.id);
                }}
                onKeyDown={(event) => {
                  const delta =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (delta === 0) return;
                  event.preventDefault();
                  const index = AUDIO_TABS.findIndex((t) => t.id === mode);
                  const next =
                    AUDIO_TABS[
                      (index + delta + AUDIO_TABS.length) % AUDIO_TABS.length
                    ];
                  onModeChange(next.id);
                  document.getElementById(`audio-tab-${next.id}`)?.focus();
                }}
                className={cn(
                  "flex h-9 shrink-0 items-start border-b-2 text-q-caption-l font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                  active
                    ? "border-b-white text-q-fg"
                    : "border-b-transparent text-q-idle hover:text-q-fg",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/*
          The panel owns both halves of the ARIA pairing. Keying it on the mode
          remounts the form on every tab change, which is what stops one tab's
          field values leaking into the next one's.
        */}
        <div
          key={mode}
          role="tabpanel"
          id={`audio-panel-${mode}`}
          aria-labelledby={`audio-tab-${mode}`}
          className="flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
