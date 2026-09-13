import type { IconName } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { Wordmark } from "@/components/layout/wordmark";

const COLUMNS: { heading: string; items: string[] }[] = [
  {
    heading: "Create",
    items: ["Image", "Video", "Audio", "Effects", "Canvas", "Edit"],
  },
  {
    heading: "Products",
    items: [
      "Cinema Studio",
      "Marketing Studio",
      "Supercomputer",
      "3D Jutsu",
      "MCP",
      "Plugins",
    ],
  },
  {
    heading: "Learn",
    items: ["Academy", "Community", "Contests", "Originals", "Help center"],
  },
  {
    heading: "Company",
    items: ["Enterprise", "Pricing", "Terms", "Privacy", "Cookie Notice"],
  },
];

/*
 * Lucide v1 removed brand marks, and the design system forbids reconstructing
 * a logo it does not have the file for. Each channel therefore gets a neutral
 * in-system glyph and carries its name in the accessible label, which is what
 * a screen reader announces anyway.
 */
const SOCIAL: { icon: IconName; label: string }[] = [
  { icon: "camera", label: "Instagram" },
  { icon: "at-sign", label: "X" },
  { icon: "play-circle", label: "YouTube" },
  { icon: "code-xml", label: "GitHub" },
];

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-panel">
      <div className="mx-auto grid max-w-[var(--max-content)] gap-8 px-8 py-12 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Wordmark className="text-[18px]" />
          <p className="mt-3 max-w-60 text-body-sm text-muted">
            AI-native creative suite for image, video and voice.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIAL.map((channel) => (
              <IconButton
                key={channel.label}
                icon={channel.icon}
                label={channel.label}
                size="sm"
                variant="solid"
              />
            ))}
          </div>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <div className="text-label font-semibold text-secondary uppercase">
              {column.heading}
            </div>
            <div className="mt-3.5 flex flex-col gap-2.25">
              {column.items.map((item) => (
                <span
                  key={item}
                  className="cursor-pointer text-body-sm text-muted hover:text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto max-w-[var(--max-content)] px-8 py-4.5 text-caption text-disabled">
          © 2026 Higgsfield, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
