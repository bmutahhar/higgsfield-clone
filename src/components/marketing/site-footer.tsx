import type { IconName } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { Wordmark } from "@/components/layout/wordmark";
import { FOOTER_COLUMNS } from "@/config/site";

/*
 * Lucide v1 removed brand marks, and the design system forbids reconstructing
 * a logo it has no file for. Each channel gets a neutral in-system glyph and
 * names the platform in its accessible label.
 */
const SOCIAL: { icon: IconName; label: string }[] = [
  { icon: "camera", label: "Instagram" },
  { icon: "at-sign", label: "X" },
  { icon: "play-circle", label: "YouTube" },
  { icon: "code-xml", label: "GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-hairline bg-panel">
      <div className="px-4 py-12 lg:px-6">
        <h2 className="text-display-3 uppercase">AI-native creative suite</h2>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="xl:col-span-1">
            <Wordmark className="text-body-lg" />
            <p className="mt-3 max-w-60 text-body-sm text-muted">
              A workflow layer over many generative models for image, video and
              voice.
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

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="text-label font-semibold text-secondary uppercase">
                {column.heading}
              </div>
              <div className="mt-3.5 flex flex-col gap-2.25">
                {column.items.map((item) => (
                  <span
                    key={item}
                    className="cursor-pointer text-body-sm text-muted transition-colors duration-[140ms] hover:text-primary motion-reduce:duration-0"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="flex flex-wrap items-center gap-4 px-4 py-4 text-caption text-disabled lg:px-6">
          <span>© 2026 Higgsfield, Inc. All rights reserved.</span>
          <span className="flex-1" />
          <span className="cursor-pointer hover:text-muted">Terms</span>
          <span className="cursor-pointer hover:text-muted">Privacy</span>
          <span className="cursor-pointer hover:text-muted">Cookie Notice</span>
        </div>
      </div>
    </footer>
  );
}
