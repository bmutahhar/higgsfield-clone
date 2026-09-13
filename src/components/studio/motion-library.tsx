"use client";

import { useState } from "react";

import { QTabs } from "@/components/navigation/q-tabs";
import { PresetCard } from "@/components/studio/preset-card";
import { HERO } from "@/config/genjutsu";
import {
  type Preset,
  PRESET_SOURCES,
  presetsFor,
  type PresetSource,
} from "@/config/presets";

/**
 * The library tab: an introductory hero, then a masonry of examples split by
 * who made them.
 *
 * The source tabs stick to the top of the scroller rather than the pane, so the
 * hero scrolls away but the switch stays reachable no matter how far down the
 * grid you are.
 */
export function MotionLibrary({
  onOpen,
  onRecreate,
}: {
  onOpen: (preset: Preset) => void;
  onRecreate: (preset: Preset) => void;
}) {
  const [source, setSource] = useState<PresetSource>("community");
  const presets = presetsFor(source);

  return (
    <section className="flex w-full flex-col self-stretch">
      <div className="flex flex-col items-center justify-center gap-8 self-stretch px-3 pt-6 pb-12 md:px-0">
        <div className="relative aspect-video w-full max-w-160 overflow-hidden rounded-q-500 bg-q-card md:h-90 md:w-160 md:max-w-none">
          <video
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster={HERO.poster}
            src={HERO.video}
            aria-label="Genjutsu example"
            className="size-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-q-display [font-feature-settings:'ss04'] text-q-accent-xl text-white uppercase [text-shadow:0_4px_12px_rgba(21,45,59,0.08)]">
            {HERO.headline}
          </h1>
          <p className="max-w-137 text-center text-q-body-sm text-white/50">
            {HERO.blurb}
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-30 flex shrink-0 justify-center px-3 py-2">
        <QTabs
          label="Preset source"
          items={PRESET_SOURCES.map((s) => ({
            id: s.id,
            label: s.label,
            icon: s.icon === "users" ? "users" : "infinity",
          }))}
          value={source}
          onValueChange={(id) => setSource(id as PresetSource)}
          shape="pill"
          surface="bare"
        />
      </div>

      <div className="w-full columns-2 gap-4 p-3 md:columns-3 xl:columns-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onOpen={onOpen}
            onRecreate={onRecreate}
          />
        ))}
      </div>
    </section>
  );
}
