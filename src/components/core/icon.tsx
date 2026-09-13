import { DynamicIcon, type IconName } from "lucide-react/dynamic";

import { cn } from "@/lib/cn";

export type { IconName };

export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "play", "sparkles", "wand-2"). */
  name: IconName;
  /** Pixel box. Product uses 16 / 20 / 24. */
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/*
 * Lucide is a documented SUBSTITUTE for Higgsfield's in-house glyph set — see
 * the ICONOGRAPHY section of the design project's readme. Stroke 1.75 matches
 * the product's hairline feel.
 *
 * The design system loads Lucide from unpkg at runtime via an injected script
 * tag. That is replaced here by the lucide-react package: no third-party
 * request, no window global, and each glyph is code-split by DynamicIcon.
 * Glyphs draw in currentColor, so colour comes from the parent's text utility.
 */
export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
}: IconProps) {
  return (
    <DynamicIcon
      name={name}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    />
  );
}
