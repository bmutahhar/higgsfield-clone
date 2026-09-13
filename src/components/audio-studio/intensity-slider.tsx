"use client";

/**
 * A slider that *is* the row: the fill sits inside the row's own box rather
 * than under a separate track.
 *
 * The input is visually hidden and stretched across the row, so pointer drags,
 * arrow keys, Home/End and screen-reader announcement all come from the
 * platform. Everything painted is a sibling of it.
 */
export function IntensitySlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <label className="relative flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden rounded-q-300 border border-q-subtle bg-q-w-05 px-3 transition-colors hover:border-q-default motion-reduce:transition-none">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />

      <span aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rounded-xs bg-q-w-20"
            /* One tick per tenth. A percentage cannot be a utility class. */
            style={{ left: `${String((index + 1) * 10)}%` }}
          />
        ))}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 rounded-q-300 bg-q-w-05 shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.05)]"
        /* The fill is a continuous percentage — the one thing here that
           genuinely cannot be expressed as a class. */
        style={{ width: `${String(pct)}%` }}
      />

      <span className="pointer-events-none relative z-10 flex items-center gap-1.5 text-q-menu whitespace-nowrap text-q-fg">
        {label}
      </span>
      <span className="pointer-events-none relative z-10 text-q-menu whitespace-nowrap text-q-fg tabular-nums">
        {format ? format(value) : value}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 block h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-q-w-80"
        style={{ left: `${String(pct)}%` }}
      />
    </label>
  );
}
