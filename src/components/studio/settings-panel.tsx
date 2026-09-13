import type { ReactNode } from "react";

import { Badge } from "@/components/core/badge";
import { Select } from "@/components/forms/select";
import { Slider } from "@/components/forms/slider";
import { Switch } from "@/components/forms/switch";
import { SegmentedControl } from "@/components/navigation/segmented-control";

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-label font-semibold text-secondary uppercase">
      {children}
    </div>
  );
}

export interface SettingsPanelProps {
  model: string;
  onModelChange: (next: string) => void;
  ratio: string;
  onRatioChange: (next: string) => void;
  duration: number;
  onDurationChange: (next: number) => void;
  motion: number;
  onMotionChange: (next: number) => void;
  audio: boolean;
  onAudioChange: (next: boolean) => void;
}

/** Fixed 340px right rail. */
export function SettingsPanel({
  model,
  onModelChange,
  ratio,
  onRatioChange,
  duration,
  onDurationChange,
  motion,
  onMotionChange,
  audio,
  onAudioChange,
}: SettingsPanelProps) {
  return (
    <aside className="hf-scrollbar flex w-85 shrink-0 flex-col gap-[22px] overflow-y-auto border-l border-hairline bg-panel p-[18px]">
      <div>
        <PanelLabel>Model</PanelLabel>
        <Select
          options={["Seedance 2.5", "Higgsfield Genjutsu", "Nano Banana Pro"]}
          value={model}
          onChange={(e) => {
            onModelChange(e.target.value);
          }}
        />
        <div className="mt-2.5 flex items-center gap-1.5">
          <Badge tone="soft">Top</Badge>
          <span className="text-caption text-muted">
            Best motion fidelity, 1080p native.
          </span>
        </div>
      </div>

      <div>
        <PanelLabel>Format</PanelLabel>
        <SegmentedControl
          size="sm"
          value={ratio}
          onChange={onRatioChange}
          items={["9:16", "1:1", "16:9"]}
          className="w-full"
        />
        <div className="mt-4">
          <Slider
            label="Duration"
            min={2}
            max={10}
            value={duration}
            unit="s"
            onChange={(e) => {
              onDurationChange(Number(e.target.value));
            }}
          />
        </div>
        <div className="mt-4">
          <Slider
            label="Motion strength"
            min={0}
            max={100}
            value={motion}
            unit="%"
            onChange={(e) => {
              onMotionChange(Number(e.target.value));
            }}
          />
        </div>
      </div>

      <div>
        <PanelLabel>Output</PanelLabel>
        <div className="flex flex-col gap-3">
          <Switch
            checked={audio}
            onChange={(e) => {
              onAudioChange(e.target.checked);
            }}
            label="Generate audio"
          />
          <Switch defaultChecked label="Upscale to 4K" />
          <Switch label="Make project public" />
        </div>
      </div>

      <div className="mt-auto rounded-card bg-w-04 p-3.5 shadow-[var(--inset-hairline)]">
        <div className="flex justify-between text-body-sm text-secondary">
          <span>Estimated cost</span>
          <span className="font-mono text-mono text-primary">
            {duration * 10} credits
          </span>
        </div>
      </div>
    </aside>
  );
}
