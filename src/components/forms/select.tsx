"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode, SelectHTMLAttributes } from "react";

import { Icon } from "@/components/core/icon";
import type { ControlSize } from "@/components/forms/input";

export type SelectOption = string | { value: string; label: string };

const CONTROL_HEIGHT: Record<ControlSize, string> = {
  sm: "var(--control-sm)",
  md: "var(--control-md)",
  lg: "var(--control-lg)",
};

function normalize(option: SelectOption): { value: string; label: string } {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: ReactNode;
  options?: SelectOption[];
  size?: ControlSize;
  wrapperStyle?: CSSProperties;
}

export function Select({
  label,
  options = [],
  value,
  onChange,
  size = "md",
  style,
  wrapperStyle,
  ...rest
}: SelectProps) {
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
          position: "relative",
          display: "flex",
          alignItems: "center",
          height: CONTROL_HEIGHT[size],
          background: "var(--surface-input)",
          borderRadius: "var(--r-control)",
          border: `1px solid ${focus ? "var(--border-focus)" : "var(--border-input)"}`,
          transition: "var(--t-control)",
        }}
      >
        <select
          value={value}
          onChange={onChange}
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            flex: 1,
            height: "100%",
            padding: "0 34px 0 12px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            font: "var(--text-body)",
            cursor: "pointer",
            ...style,
          }}
          {...rest}
        >
          {options.map((option) => {
            const opt = normalize(option);
            return (
              <option
                key={opt.value}
                value={opt.value}
                style={{ background: "var(--n-3)" }}
              >
                {opt.label}
              </option>
            );
          })}
        </select>
        <Icon
          name="chevron-down"
          size={16}
          style={{
            position: "absolute",
            right: 10,
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
      </span>
    </label>
  );
}
