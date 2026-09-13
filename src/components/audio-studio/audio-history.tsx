"use client";

import { DubTile } from "@/components/audio-studio/dub-tile";
import { WaveformRow } from "@/components/audio-studio/waveform-row";
import type { AudioMode } from "@/config/audio";
import type { Generation } from "@/types/generation.types";

/**
 * A calendar-day heading, in the reader's own locale.
 *
 * Grouping is by local day rather than UTC: a generation made at 11pm should
 * file under the day the person making it was living in.
 */
function dayKey(ms: number): string {
  const date = new Date(ms);
  return `${String(date.getFullYear())}-${String(date.getMonth())}-${String(date.getDate())}`;
}

function dayLabel(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The History tab.
 *
 * Two renderers, not one. Speech has no aspect ratio and a waveform wants the
 * width, so it is a list of full-width rows grouped under date headings; the
 * two modes that hand back a video are a grid of 3:4 tiles. The mode on the
 * generation's own settings is what picks between them.
 */
export function AudioHistory({
  mode,
  generations,
  onGate,
  signedIn,
}: {
  mode: AudioMode;
  /** Already filtered to this tab and sorted newest first. */
  generations: Generation[];
  onGate: () => void;
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
        <p className="text-q-body-md text-q-soft">
          Your generations live here once you sign in.
        </p>
        <button
          type="button"
          onClick={onGate}
          className="text-q-caption-l font-medium text-q-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-q-focus"
        >
          Sign in to see your history
        </button>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center text-center">
        <p className="text-q-body-md text-q-soft">Nothing generated yet.</p>
      </div>
    );
  }

  if (mode !== "tts") {
    return (
      <div className="@container">
        {/*
          Tiles hold their width rather than stretching, so a short row is
          left-aligned instead of two enormous tiles filling the pane.
        */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(0,28rem))] gap-1">
          {generations.map((generation) => (
            <DubTile key={generation.id} generation={generation} />
          ))}
        </div>
      </div>
    );
  }

  /* Speech: grouped by day, newest group first. */
  const groups: { key: string; label: string; items: Generation[] }[] = [];
  for (const generation of generations) {
    const key = dayKey(generation.createdAt);
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(generation);
    else
      groups.push({
        key,
        label: dayLabel(generation.createdAt),
        items: [generation],
      });
  }

  return (
    <div className="@container flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-3">
          <h3 className="text-q-heading-sm text-q-fg">{group.label}</h3>
          <div className="flex flex-col gap-2">
            {group.items.map((generation) => (
              <WaveformRow key={generation.id} generation={generation} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
