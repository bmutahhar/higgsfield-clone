"use client";

import { AudioHistory } from "@/components/audio-studio/audio-history";
import { AudioHowItWorks } from "@/components/audio-studio/audio-how-it-works";
import { Icon } from "@/components/core/icon";
import { QTabs } from "@/components/navigation/q-tabs";
import type { AudioMode } from "@/config/audio";
import type { Generation } from "@/types/generation.types";

export type AudioPaneTab = "history" | "how";

/**
 * The right column.
 *
 * Unlike the video studio's pane this is not a card — no border, no dot grid.
 * The toolbar floats above the scroller and the scroller is padded to clear
 * it, so content passes under the controls rather than pushing them down.
 */
export function AudioPane({
  tab,
  onTabChange,
  mode,
  generations,
  onGate,
  signedIn,
}: {
  tab: AudioPaneTab;
  onTabChange: (next: AudioPaneTab) => void;
  mode: AudioMode;
  generations: Generation[];
  onGate: () => void;
  signedIn: boolean;
}) {
  return (
    <div className="relative hidden size-full md:block">
      <div className="absolute top-0 right-0 left-6 z-1 pb-3">
        <div className="relative flex w-full items-center justify-between">
          <QTabs
            label="Pane view"
            surface="bare"
            className="shrink-0"
            value={tab}
            onValueChange={(id) => {
              onTabChange(id as AudioPaneTab);
            }}
            items={[
              { id: "history", label: "History", icon: "folder" },
              { id: "how", label: "How it works", icon: "book-open" },
            ]}
          />

          {tab === "history" && (
            <div className="flex w-max flex-row items-center gap-3">
              {/*
                The reference also shows an unlabelled toggle to the left of
                Filters, on the two video tabs only. What it does is unresolved
                — see spec §6.3.3 — so it is omitted entirely rather than drawn
                with a behaviour we invented for it.
              */}
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-q-250 border border-q-subtle bg-q-panel px-2.5 text-q-soft transition-colors outline-none hover:text-q-fg focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
              >
                <Icon
                  name="sliders-horizontal"
                  size={16}
                  className="shrink-0"
                />
                <span className="text-q-caption-l font-medium">Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 left-6 overflow-hidden pt-14.5">
        <div className="hf-scrollbar-none size-full overflow-y-auto overscroll-none pb-4">
          {tab === "how" ? (
            <AudioHowItWorks mode={mode} />
          ) : (
            <AudioHistory
              mode={mode}
              generations={generations}
              onGate={onGate}
              signedIn={signedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
