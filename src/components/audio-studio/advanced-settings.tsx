"use client";

import { useState } from "react";

import { AdvancedDial } from "@/components/audio-studio/advanced-dial";
import { IntensitySlider } from "@/components/audio-studio/intensity-slider";
import { MoodFader } from "@/components/audio-studio/mood-fader";
import { AudioSettingRow } from "@/components/audio-studio/setting-row";
import { Icon } from "@/components/core/icon";
import { QSwitch } from "@/components/forms/q-switch";
import {
  ADVANCED_DEFAULTS,
  AUDIO_RANGES,
  audioModelById,
  OUTPUT_FORMATS,
} from "@/config/audio";
import type { AdvancedFormValues } from "@/schemas/audio-generation";

/**
 * Everything behind the `Advanced settings` disclosure.
 *
 * Open is React state because it changes layout, not paint — the panel is not
 * mounted while closed, so a long form does not pay for controls nobody has
 * asked to see.
 */
export function AdvancedSettings({
  modelId,
  value,
  onChange,
}: {
  modelId: string;
  value: AdvancedFormValues;
  onChange: (next: AdvancedFormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const model = audioModelById(modelId);

  const set = <K extends keyof AdvancedFormValues>(
    key: K,
    next: AdvancedFormValues[K],
  ) => {
    onChange({ ...value, [key]: next });
  };

  /** A rate this model actually offers, so Reset cannot produce a reject. */
  const safeRate = (): AdvancedFormValues["sampleRate"] =>
    (model?.sampleRates.includes(ADVANCED_DEFAULTS.sampleRate)
      ? ADVANCED_DEFAULTS.sampleRate
      : (model?.sampleRates[0] ??
        ADVANCED_DEFAULTS.sampleRate)) as AdvancedFormValues["sampleRate"];

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="audio-advanced"
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="flex w-full shrink-0 items-center gap-2 rounded-q-300 p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-q-focus"
      >
        <Icon name="sliders-horizontal" size={16} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-q-menu text-q-fg">
          Advanced settings
        </span>
        <Icon
          name={open ? "chevron-down" : "chevron-right"}
          size={16}
          className="shrink-0"
        />
      </button>

      {open && (
        <div
          id="audio-advanced"
          className="flex w-full shrink-0 flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pl-0.5">
              <span className="px-0.5 text-q-caption-l font-medium text-q-soft">
                {model?.name ?? "Model"} controls
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...ADVANCED_DEFAULTS,
                    sampleRate: safeRate(),
                    outputFormat: ADVANCED_DEFAULTS.outputFormat,
                  } as AdvancedFormValues);
                }}
                className="flex h-6 shrink-0 items-center gap-1 rounded-q-150 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
              >
                <Icon name="rotate-ccw" size={12} className="shrink-0" />
                <span className="text-q-caption-l font-medium text-q-fg">
                  Reset
                </span>
              </button>
            </div>

            <IntensitySlider
              label="Expression intensity"
              value={value.intensity}
              {...AUDIO_RANGES.intensity}
              onChange={(next) => {
                set("intensity", next);
              }}
            />
          </div>

          <div className="flex w-full flex-col gap-3 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors hover:border-q-default motion-reduce:transition-none">
            <div className="flex items-center gap-1 px-0.5">
              <span className="text-q-caption-l font-medium text-q-soft">
                Mood
              </span>
              <span
                title="How the delivery leans, from angry to happy."
                className="flex size-4 shrink-0 items-center justify-center text-q-soft transition-colors hover:text-q-fg motion-reduce:transition-none"
              >
                <Icon name="info" size={14} />
              </span>
            </div>
            <MoodFader
              value={value.mood}
              onChange={(next) => {
                set("mood", next);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="px-1 text-q-caption-l font-medium text-q-soft">
              Audio settings
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex w-full items-stretch gap-2">
                <AdvancedDial
                  label="Speed"
                  value={value.speed}
                  {...AUDIO_RANGES.speed}
                  format={(v) => `${v.toFixed(1)}x`}
                  onChange={(next) => {
                    set("speed", next);
                  }}
                />
                <AdvancedDial
                  label="Pitch"
                  value={value.pitch}
                  {...AUDIO_RANGES.pitch}
                  format={(v) => String(v)}
                  onChange={(next) => {
                    set("pitch", next);
                  }}
                />
                <AdvancedDial
                  label="Volume"
                  value={value.volume}
                  {...AUDIO_RANGES.volume}
                  format={(v) => `${String(v)}%`}
                  onChange={(next) => {
                    set("volume", next);
                  }}
                />
              </div>

              <AudioSettingRow
                label="Output format"
                value={
                  <span className="flex items-center gap-1">
                    <Icon name="file-audio" size={16} className="shrink-0" />
                    {value.outputFormat}
                  </span>
                }
                onClick={() => {
                  const index = OUTPUT_FORMATS.indexOf(value.outputFormat);
                  set(
                    "outputFormat",
                    OUTPUT_FORMATS[(index + 1) % OUTPUT_FORMATS.length],
                  );
                }}
              />

              <AudioSettingRow
                label="Sample Rate"
                value={value.sampleRate}
                onClick={() => {
                  /* Only the rates this model offers, so cycling can never
                     land on a pairing the schema rejects. */
                  const rates = model?.sampleRates ?? [];
                  if (rates.length === 0) return;
                  const index = rates.indexOf(value.sampleRate);
                  set(
                    "sampleRate",
                    rates[
                      (index + 1) % rates.length
                    ] as AdvancedFormValues["sampleRate"],
                  );
                }}
              />
            </div>
          </div>

          <AudioSettingRow
            label="Save settings"
            trailing={
              <QSwitch
                checked={value.saveSettings}
                onCheckedChange={(next) => {
                  set("saveSettings", next);
                }}
                label="Save these settings for next time"
                size="md"
              />
            }
          />
        </div>
      )}
    </>
  );
}
