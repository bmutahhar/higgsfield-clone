"use client";

import { AUDIO_RANGES } from "@/config/audio";

const SCALE = ["Angry", "Neutral", "Happy"];

/**
 * The one control on this panel with a physical metaphor.
 *
 * The handle is deliberately taller than the track and overhangs it — that
 * overhang is the whole effect, so the track must never be given
 * `overflow-hidden`.
 */
export function MoodFader({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const { min, max, step } = AUDIO_RANGES.mood;
  const pct = ((value - min) / (max - min)) * 100;
  const label = value < -0.33 ? "Angry" : value > 0.33 ? "Happy" : "Neutral";

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="relative flex h-7 w-full cursor-pointer items-center rounded-q-200 bg-q-w-05 p-0.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label="Mood"
          /* Announce the word, not the number — "0.42" tells nobody anything. */
          aria-valuetext={label}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 rounded-q-200 bg-[linear-gradient(90deg,#e7412b_0%,#f08a2c_55%,#ffffff_100%)]"
          style={{ width: `${String(pct)}%` }}
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center justify-between px-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="size-1 rounded-[1px] bg-q-w-10" />
          ))}
        </span>

        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 z-1 block h-7.5 w-5.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-q-100 border-[0.5px] border-black/15 bg-white active:cursor-grabbing"
          style={{ left: `${String(pct)}%` }}
        >
          <span className="pointer-events-none absolute bottom-[11.5px] left-[7.5px] h-1.5 w-px bg-black/10" />
          <span className="pointer-events-none absolute bottom-[11.5px] left-[11.5px] h-1.5 w-px bg-black/10" />
        </span>
      </label>

      <div className="flex w-full items-center justify-between gap-1 px-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
        {SCALE.map((name) => (
          <span key={name} className="truncate">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
