"use client";

import type { CSSProperties, ReactNode } from "react";

import { Icon } from "@/components/core/icon";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}

/* Real checkbox behind the styled box — see the note in switch.tsx. */
export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  style,
}: CheckboxProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
    >
      <input
        type="checkbox"
        className="hf-sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          flex: "0 0 auto",
          borderRadius: "var(--r-6)",
          background: checked ? "var(--accent-solid)" : "transparent",
          border: `1px solid ${checked ? "transparent" : "var(--border-input)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--n-0)",
          transition: "var(--t-control)",
        }}
      >
        {checked && <Icon name="check" size={13} strokeWidth={3} />}
      </span>
      {label && (
        <span
          style={{
            font: "var(--text-body-sm)",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
