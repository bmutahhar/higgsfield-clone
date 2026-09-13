"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  /** Show a mono character counter. Requires maxLength. */
  counter?: boolean;
  wrapperStyle?: CSSProperties;
}

export function Textarea({
  label,
  hint,
  counter,
  maxLength,
  rows = 4,
  style,
  wrapperStyle,
  value,
  onChange,
  ...rest
}: TextareaProps) {
  const [focus, setFocus] = useState(false);
  const length = typeof value === "string" ? value.length : undefined;

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
      <textarea
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
        style={{
          resize: "vertical",
          padding: "10px 12px",
          background: "var(--surface-input)",
          border: `1px solid ${focus ? "var(--border-focus)" : "var(--border-input)"}`,
          boxShadow: focus ? "var(--ring-focus)" : "none",
          borderRadius: "var(--r-control)",
          color: "var(--text-primary)",
          font: "var(--text-body)",
          outline: "none",
          transition: "var(--t-control)",
          ...style,
        }}
        {...rest}
      />
      {(hint ?? counter) && (
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            font: "var(--fw-regular) var(--fs-caption)/1.3 var(--font-ui)",
            color: "var(--text-muted)",
          }}
        >
          <span>{hint}</span>
          {counter && maxLength ? (
            <span className="hf-mono">
              {length ?? 0}/{maxLength}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );
}
