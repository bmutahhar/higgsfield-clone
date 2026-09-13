"use client";

import { AudioSheetHeader } from "@/components/audio-studio/audio-sheet-header";
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
    /*
     * One element, two shapes. Below `md` the panel fills the viewport as a
     * sheet; at `md` it becomes the 342px column with its own card. A second
     * component tree would have drifted from this one by the first change to
     * either side.
     */
    <aside className="fixed inset-0 z-50 flex flex-col bg-q-page md:relative md:inset-auto md:z-auto md:h-full md:min-h-0 md:w-85.5 md:shrink-0 md:flex-col md:bg-transparent md:pb-4">
      <AudioSheetHeader />

      <div className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-none md:rounded-q-600 md:border md:border-q-subtle md:bg-q-panel">
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
                  /*
                   * `text-q-menu` (14/20), not `text-q-caption-l` (12/18) —
                   * the live tab row is 14px and the caption ramp is two
                   * steps too small for it.
                   */
                  "flex h-9 shrink-0 items-start border-b-2 text-q-menu whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
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
