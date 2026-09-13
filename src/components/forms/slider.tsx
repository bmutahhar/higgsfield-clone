"use client";

import type { CSSProperties, ReactNode } from "react";

export interface SliderProps {
  label?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (next: number) => void;
  /** Suffix on the mono readout, e.g. "s" or "%". */
  unit?: string;
  style?: CSSProperties;
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  onChange,
  unit,
  style,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {(label ?? unit !== undefined) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              font: "var(--fw-medium) var(--fs-body-sm)/1 var(--font-ui)",
              color: "var(--text-secondary)",
            }}
          >
            {label}
          </span>
          <span className="hf-mono" style={{ color: "var(--text-primary)" }}>
            {value}
            {unit}
          </span>
        </div>
      )}
      <input
        className="hf-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={typeof label === "string" ? label : undefined}
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{
          width: "100%",
          height: 4,
          borderRadius: "var(--r-pill)",
          background: `linear-gradient(to right, var(--accent-solid) 0%, var(--accent-solid) ${String(pct)}%, var(--n-5) ${String(pct)}%, var(--n-5) 100%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
