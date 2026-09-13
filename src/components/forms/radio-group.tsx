"use client";

import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";

import type { SelectOption } from "@/components/forms/select";

export interface RadioGroupProps {
  options?: SelectOption[];
  value?: string;
  onChange?: (next: string) => void;
  label?: ReactNode;
  direction?: "row" | "column";
  style?: CSSProperties;
}

/* Real radio inputs, so arrow-key roving and grouping come from the platform. */
export function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  direction = "column",
  style,
}: RadioGroupProps) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={typeof label === "string" ? label : undefined}
      style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}
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
      <div
        style={{
          display: "flex",
          flexDirection: direction,
          gap: direction === "row" ? 20 : 10,
        }}
      >
        {options.map((option) => {
          const opt =
            typeof option === "string"
              ? { value: option, label: option }
              : option;
          const on = opt.value === value;
          return (
            <label
              key={opt.value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                className="hf-sr-only"
                name={name}
                value={opt.value}
                checked={on}
                onChange={() => onChange?.(opt.value)}
              />
              <span
                aria-hidden="true"
                style={{
                  width: 18,
                  height: 18,
                  flex: "0 0 auto",
                  borderRadius: "50%",
                  border: `1px solid ${on ? "var(--accent-solid)" : "var(--border-input)"}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "var(--t-control)",
                }}
              >
                {on && (
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "var(--accent-solid)",
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  font: "var(--text-body-sm)",
                  color: on ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
