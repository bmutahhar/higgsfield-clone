import { cn } from "@/lib/cn";

export interface LogoMarkProps {
  size?: number;
  className?: string;
}

/*
 * Original placeholder mark occupying the same 26px slot as the live site's
 * logo. The design system's no-reconstruction rule means no attempt is made to
 * redraw Higgsfield's actual glyph — swap this file for the real asset.
 */
export function LogoMark({ size = 26, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="0.75"
        y="0.75"
        width="18.5"
        height="18.5"
        rx="5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path
        d="M6 13.5V6.5M14 13.5V6.5M6 10h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
