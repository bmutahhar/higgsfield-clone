"use client";

import { useState } from "react";

import { HowItWorks } from "@/components/studio/how-it-works";
import { MotionLibrary } from "@/components/studio/motion-library";
import { PaneToolbar } from "@/components/studio/pane-toolbar";
import { PresetLightbox } from "@/components/studio/preset-lightbox";
import { QTabs } from "@/components/studio/q-tabs";
import { VideoHistory } from "@/components/studio/video-history";
import { PANE_TABS, type PaneTab } from "@/config/genjutsu";
import type { Preset } from "@/config/presets";
import type { Generation } from "@/types/generation.types";

/**
 * The right column. Owns which tab is showing and which preset — if any — is
 * expanded.
 *
 * `How it works` fills the pane and must not scroll, while the library does, so
 * the scroll container is applied per tab rather than wrapped around all three.
 */
export function StudioPane({
  tab,
  onTabChange,
  generations,
  onRecreate,
  tabs = PANE_TABS,
  empty,
  library,
}: {
  tab: PaneTab;
  onTabChange: (next: PaneTab) => void;
  /** This studio's own output, newest first. Rendered by the History tab. */
  generations: Generation[];
  /**
   * Load a preset's recipe into the form. Signed out this still opens the
   * sign-in dialog — the studio decides which, because it is the part that
   * knows whether there is a user.
   */
  onRecreate: (preset: Preset) => void;
  /**
   * Which tabs this surface offers. Only Genjutsu has a preset library, so the
   * set is a prop rather than a constant.
   */
  tabs?: readonly (typeof PANE_TABS)[number][];
  /**
   * What History shows before anything exists. Genjutsu leaves it blank; the
   * edit and motion surfaces explain themselves instead.
   */
  empty?: React.ReactNode;
  /** The library tab's contents, on the one surface that has a library. */
  library?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<Preset | null>(null);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [zoom, setZoom] = useState(5);

  return (
    <div className="relative flex size-full min-h-0 flex-1 flex-col">
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-q-500 border border-q-default">
        {/* The pane's ground: a masked dot lattice, not a flat fill. */}
        <div
          aria-hidden
          className="q-dot-grid pointer-events-none absolute inset-0 -z-10"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-4">
          <header className="flex items-center justify-between self-stretch pt-2 pb-3">
            <QTabs
              label="Page view"
              items={tabs.map((t) => ({
                id: t.id,
                label: t.label,
                icon: t.icon,
              }))}
              value={tab}
              onValueChange={(id) => onTabChange(id as PaneTab)}
              surface="bare"
              className="shrink-0"
            />

            <PaneToolbar
              visible={tab === "history"}
              layout={layout}
              onLayoutChange={setLayout}
              zoom={zoom}
              onZoomChange={setZoom}
            />
          </header>

          {tab === "how" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <HowItWorks />
            </div>
          ) : (
            <div className="hf-scrollbar-none min-h-0 flex-1 overflow-y-auto">
              {tab === "history" ? (
                <VideoHistory
                  generations={generations}
                  zoom={zoom}
                  layout={layout}
                  empty={empty}
                />
              ) : (
                (library ?? (
                  <MotionLibrary onOpen={setExpanded} onRecreate={onRecreate} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {expanded ? (
        <PresetLightbox
          preset={expanded}
          onClose={() => setExpanded(null)}
          onRecreate={() => {
            // Closed first, so the form it just filled is the thing you see.
            setExpanded(null);
            onRecreate(expanded);
          }}
        />
      ) : null}
    </div>
  );
}
