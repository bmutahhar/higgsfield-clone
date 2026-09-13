"use client";

import type { CSSProperties } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

export type { IconName };

export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "play", "sparkles", "wand-2"). */
  name: IconName;
  /** Pixel box. Product uses 16 / 20 / 24. */
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: CSSProperties;
}

/*
 * Lucide is a documented SUBSTITUTE for Higgsfield's in-house glyph set — see
 * the ICONOGRAPHY section of the design project's readme. Stroke 1.75 matches
 * the product's hairline feel.
 *
 * The design system loads Lucide from unpkg at runtime via an injected script
 * tag. That is replaced here by the lucide-react package: no third-party
 * request, no global, and each glyph is code-split by DynamicIcon. The prop
 * contract is unchanged, so swapping in the real glyph set later still only
 * touches this file.
 */
export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
}: IconProps) {
  return (
    <DynamicIcon
      name={name}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      aria-hidden="true"
      style={{ flex: "0 0 auto", ...style }}
    />
  );
}
