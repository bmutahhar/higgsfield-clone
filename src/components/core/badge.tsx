import type { CSSProperties, ReactNode } from "react";

/** Badges are one word, uppercase: NEW, TOP, PRO. */
export type BadgeTone =
  "accent" | "soft" | "neutral" | "outline" | "glass" | "sand";

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string; bd: string }> = {
  accent: {
    bg: "var(--accent-solid)",
    fg: "var(--text-on-accent)",
    bd: "transparent",
  },
  soft: {
    bg: "var(--accent-soft)",
    fg: "var(--hf-lime)",
    bd: "var(--accent-ring)",
  },
  neutral: {
    bg: "var(--w-08)",
    fg: "var(--text-secondary)",
    bd: "transparent",
  },
  outline: {
    bg: "transparent",
    fg: "var(--text-secondary)",
    bd: "var(--border-strong)",
  },
  glass: { bg: "rgba(0,0,0,.55)", fg: "#fff", bd: "var(--w-16)" },
  sand: { bg: "var(--hf-sand)", fg: "var(--n-0)", bd: "transparent" },
};

export interface BadgeProps {
  children?: ReactNode;
  tone?: BadgeTone;
  uppercase?: boolean;
  style?: CSSProperties;
}

export function Badge({
  children,
  tone = "accent",
  uppercase = true,
  style,
}: BadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        height: 20,
        padding: "0 8px",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: "var(--r-pill)",
        font: "var(--fw-semibold) var(--fs-micro)/1 var(--font-ui)",
        letterSpacing: uppercase ? ".06em" : "0",
        textTransform: uppercase ? "uppercase" : "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
