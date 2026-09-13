"use client";

import { useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "outline" | "glass" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const BTN_SIZES: Record<
  ButtonSize,
  { h: string; px: number; fs: number; gap: number; icon: number }
> = {
  sm: { h: "var(--control-sm)", px: 12, fs: 12, gap: 6, icon: 14 },
  md: { h: "var(--control-md)", px: 16, fs: 13, gap: 8, icon: 16 },
  lg: { h: "var(--control-lg)", px: 22, fs: 15, gap: 8, icon: 18 },
  xl: { h: "var(--control-xl)", px: 28, fs: 16, gap: 10, icon: 20 },
};

const BTN_VARIANTS: Record<
  ButtonVariant,
  { bg: string; fg: string; bd: string; hover: string }
> = {
  primary: {
    bg: "var(--accent-solid)",
    fg: "var(--text-on-accent)",
    bd: "transparent",
    hover: "var(--accent-solid-hover)",
  },
  secondary: {
    bg: "var(--n-4)",
    fg: "var(--text-primary)",
    bd: "var(--border-hairline)",
    hover: "var(--n-5)",
  },
  ghost: {
    bg: "transparent",
    fg: "var(--text-secondary)",
    bd: "transparent",
    hover: "var(--surface-hover)",
  },
  outline: {
    bg: "transparent",
    fg: "var(--text-primary)",
    bd: "var(--border-strong)",
    hover: "var(--surface-hover)",
  },
  glass: {
    bg: "rgba(255,255,255,.10)",
    fg: "var(--text-primary)",
    bd: "var(--w-16)",
    hover: "rgba(255,255,255,.18)",
  },
  danger: {
    bg: "var(--status-danger)",
    fg: "#FFFFFF",
    bd: "transparent",
    hover: "#FF6666",
  },
};

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fully rounded. Use on marketing CTAs and over-media controls. */
  pill?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Render as another element, e.g. "a". */
  as?: ElementType;
  style?: CSSProperties;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

/**
 * Primary action control. Pill for marketing CTAs, 10px radius in product.
 * Press is a scale, never a ripple; hover is one step lighter, never a hue change.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  as,
  style,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const s = BTN_SIZES[size];
  const v = BTN_VARIANTS[variant];
  const off = disabled || loading;
  const Tag: ElementType = as ?? "button";

  return (
    <Tag
      disabled={Tag === "button" ? off : undefined}
      aria-busy={loading || undefined}
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
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${String(s.px)}px`,
        font: `var(--fw-medium) ${String(s.fs)}px/1 var(--font-ui)`,
        letterSpacing: "-.005em",
        color: v.fg,
        background: off ? "var(--n-4)" : hover ? v.hover : v.bg,
        border: `1px solid ${off ? "var(--border-hairline)" : v.bd}`,
        borderRadius: pill ? "var(--r-pill)" : "var(--r-control)",
        cursor: off ? "not-allowed" : "pointer",
        opacity: off ? 0.45 : 1,
        transform: down && !off ? "scale(var(--press-scale))" : "scale(1)",
        transition: "var(--t-control)",
        whiteSpace: "nowrap",
        userSelect: "none",
        textDecoration: "none",
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <ButtonSpinner size={s.icon} />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={s.icon} />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={s.icon} /> : null}
    </Tag>
  );
}

function ButtonSpinner({ size }: { size: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flex: "0 0 auto",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        animation: "hf-spin .7s var(--ease-linear) infinite",
      }}
    />
  );
}
