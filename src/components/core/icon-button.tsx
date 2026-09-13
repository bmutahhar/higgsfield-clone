"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { Icon, type IconName } from "@/components/core/icon";

export type IconButtonVariant = "ghost" | "solid" | "glass" | "accent";
export type IconButtonSize = "sm" | "md" | "lg";

const IB_SIZES: Record<IconButtonSize, { box: number; glyph: number }> = {
  sm: { box: 28, glyph: 16 },
  md: { box: 36, glyph: 20 },
  lg: { box: 44, glyph: 22 },
};

const IB_VARIANTS: Record<
  IconButtonVariant,
  { bg: string; fg: string; hover: string; bd: string }
> = {
  ghost: {
    bg: "transparent",
    fg: "var(--text-secondary)",
    hover: "var(--surface-hover)",
    bd: "transparent",
  },
  solid: {
    bg: "var(--n-4)",
    fg: "var(--text-primary)",
    hover: "var(--n-5)",
    bd: "var(--border-hairline)",
  },
  glass: {
    bg: "rgba(0,0,0,.45)",
    fg: "#fff",
    hover: "rgba(0,0,0,.66)",
    bd: "var(--w-16)",
  },
  accent: {
    bg: "var(--accent-solid)",
    fg: "var(--text-on-accent)",
    hover: "var(--accent-solid-hover)",
    bd: "transparent",
  },
};

export interface IconButtonProps {
  icon: IconName;
  /** Accessible label — required, also used as the native tooltip. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  pill?: boolean;
  active?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

/** Where a control floats over media it becomes a glass capsule, not a scrim. */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  pill = true,
  active = false,
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const s = IB_SIZES[size];
  const v = IB_VARIANTS[variant];

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      disabled={disabled}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
        setDown(false);
      }}
      onMouseDown={() => {
        setDown(true);
      }}
      onMouseUp={() => {
        setDown(false);
      }}
      style={{
        width: s.box,
        height: s.box,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active
          ? "var(--surface-active)"
          : hover && !disabled
            ? v.hover
            : v.bg,
        color: active ? "var(--text-primary)" : v.fg,
        border: `1px solid ${v.bd}`,
        borderRadius: pill ? "var(--r-pill)" : "var(--r-control)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transform: down && !disabled ? "scale(var(--press-scale))" : "scale(1)",
        transition: "var(--t-control)",
        padding: 0,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={s.glyph} />
    </button>
  );
}
