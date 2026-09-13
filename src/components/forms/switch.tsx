"use client";

import type { CSSProperties, ReactNode } from "react";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  style?: CSSProperties;
}

/*
 * The design system styles a bare <span> and binds onClick to it, which is
 * unreachable by keyboard and carries no form semantics. The visual is
 * unchanged here, but it is driven by a real visually-hidden checkbox so the
 * control is focusable, announced, and submits with a form.
 */
export function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = "md",
  style,
}: SwitchProps) {
  const width = size === "sm" ? 34 : 44;
  const height = size === "sm" ? 20 : 26;
  const knob = height - 6;

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
        role="switch"
        className="hf-sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        aria-hidden="true"
        style={{
          width,
          height,
          flex: "0 0 auto",
          borderRadius: "var(--r-pill)",
          background: checked ? "var(--accent-solid)" : "var(--n-5)",
          border: `1px solid ${checked ? "transparent" : "var(--border-hairline)"}`,
          display: "inline-flex",
          alignItems: "center",
          padding: 2,
          transition: "var(--t-control)",
        }}
      >
        <span
          style={{
            width: knob,
            height: knob,
            borderRadius: "50%",
            background: checked ? "var(--n-0)" : "var(--n-11)",
            transform: `translateX(${String(checked ? width - knob - 6 : 0)}px)`,
            transition:
              "transform var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)",
          }}
        />
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
