"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";

export interface TagProps {
  children?: ReactNode;
  /** Lucide icon name shown before the label. */
  icon?: IconName;
  selected?: boolean;
  onRemove?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  style?: CSSProperties;
}

/**
 * Selection inverts to a white fill with black text — it is never a lime fill,
 * which is reserved for actions.
 */
export function Tag({
  children,
  icon,
  selected = false,
  onRemove,
  onClick,
  style,
}: TagProps) {
  const [hover, setHover] = useState(false);
  const interactive = Boolean(onClick);

  return (
    <span
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? selected : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e as unknown as MouseEvent);
        }
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 10px",
        background: selected
          ? "var(--n-12)"
          : hover && interactive
            ? "var(--surface-active)"
            : "var(--w-06)",
        color: selected ? "var(--n-0)" : "var(--text-secondary)",
        border: `1px solid ${selected ? "transparent" : "var(--border-hairline)"}`,
        borderRadius: "var(--r-chip)",
        font: "var(--fw-medium) var(--fs-body-sm)/1 var(--font-ui)",
        cursor: interactive ? "pointer" : "default",
        transition: "var(--t-control)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove(e as unknown as MouseEvent);
            }
          }}
          style={{ display: "inline-flex", opacity: 0.6, cursor: "pointer" }}
        >
          <Icon name="x" size={12} />
        </span>
      )}
    </span>
  );
}
