"use client";

import { QSwitch } from "@/components/forms/q-switch";
import {
  MOTION_COPY,
  SCENE_SOURCES,
  type SceneSource,
} from "@/config/video-motion";
import { cn } from "@/lib/cn";

export interface SceneControlCardProps {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  source: SceneSource;
  onSourceChange: (next: SceneSource) => void;
}

/**
 * Where the background comes from.
 *
 * The source picker stays mounted and dimmed when the mode is off rather than
 * unmounting: the card keeps its height, so turning the switch does not make
 * everything below it jump. `inert` is what stops the dimmed control being
 * reachable by keyboard while it means nothing.
 */
export function SceneControlCard({
  enabled,
  onEnabledChange,
  source,
  onSourceChange,
}: SceneControlCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-q-300 border border-q-hairline bg-q-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-q-label-sm font-medium text-q-fg">
          {MOTION_COPY.sceneControlLabel}
        </span>
        <QSwitch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          label={MOTION_COPY.sceneControlLabel}
          size="md"
        />
      </div>

      <div
        inert={!enabled}
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          enabled ? "opacity-100" : "opacity-40",
        )}
      >
        <div
          role="radiogroup"
          aria-label="Background source"
          className="grid grid-cols-2 gap-1 rounded-q-300 bg-q-w-05 p-1"
        >
          {SCENE_SOURCES.map((option) => {
            const active = option.id === source;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSourceChange(option.id)}
                className={cn(
                  "relative h-8 rounded-q-200 text-q-caption-m transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                  active
                    ? "bg-white/10 text-q-fg"
                    : "text-q-idle-soft hover:text-q-fg",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-q-label-xs text-q-muted">
        {MOTION_COPY.sceneControlHelp}
      </p>
    </div>
  );
}
