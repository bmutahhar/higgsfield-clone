"use client";

import { useState } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";

export type ControlSize = "sm" | "md" | "lg";

const CONTROL_HEIGHT: Record<ControlSize, string> = {
  sm: "var(--control-sm)",
  md: "var(--control-md)",
  lg: "var(--control-lg)",
};

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  iconLeft?: IconName;
  /** Trailing readout — rendered in mono, as every number in the system is. */
  suffix?: ReactNode;
  size?: ControlSize;
  wrapperStyle?: CSSProperties;
}

/** Focus switches the border to solid lime and adds the lime ring. */
export function Input({
  label,
  hint,
  error,
  iconLeft,
  suffix,
  size = "md",
  style,
  wrapperStyle,
  ...rest
}: InputProps) {
  const [focus, setFocus] = useState(false);

  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        ...wrapperStyle,
      }}
    >
      {label && (
        <span
          style={{
            font: "var(--fw-medium) var(--fs-body-sm)/1 var(--font-ui)",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: CONTROL_HEIGHT[size],
          padding: "0 12px",
          background: "var(--surface-input)",
          borderRadius: "var(--r-control)",
          border: `1px solid ${
            error
              ? "var(--status-danger)"
              : focus
                ? "var(--border-focus)"
                : "var(--border-input)"
          }`,
          boxShadow: focus && !error ? "var(--ring-focus)" : "none",
          transition: "var(--t-control)",
        }}
      >
        {iconLeft && (
          <Icon
            name={iconLeft}
            size={16}
            style={{ color: "var(--text-muted)" }}
          />
        )}
        <input
          aria-invalid={error ? true : undefined}
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            font: "var(--text-body)",
            ...style,
          }}
          {...rest}
        />
        {suffix && (
          <span className="hf-mono" style={{ color: "var(--text-muted)" }}>
            {suffix}
          </span>
        )}
      </span>
      {(hint ?? error) && (
        <span
          style={{
            font: "var(--fw-regular) var(--fs-caption)/1.3 var(--font-ui)",
            color: error ? "var(--status-danger)" : "var(--text-muted)",
          }}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
