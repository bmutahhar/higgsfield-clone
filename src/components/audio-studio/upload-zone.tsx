"use client";

import { useId } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface UploadPicker {
  icon: IconName;
  accept: string;
  /** Named for a reader who meets the chip without the surrounding copy. */
  label: string;
}

export interface UploadZoneProps {
  title: string;
  hint: string;
  badge: "Optional" | "Required";
  /** One chip per accepted kind; each opens a picker filtered to its own. */
  pickers: readonly UploadPicker[];
  files: File[];
  onFilesChange: (next: File[]) => void;
  max: number;
  invalid?: boolean;
}

/**
 * The dashed drop zone, shared by every tab.
 *
 * The dashed border is an SVG rect rather than `border-dashed`: CSS dashes do
 * not corner-join cleanly at a 16px radius — they bunch and leave a seam,
 * which is plainly visible against a 160px box — and the reference's do.
 *
 * Each chip is its own file input rather than one combined picker, matching
 * the reference: clicking the image chip should offer images, not everything.
 */
export function UploadZone({
  title,
  hint,
  badge,
  pickers,
  files,
  onFilesChange,
  max,
  invalid,
}: UploadZoneProps) {
  const baseId = useId();

  const accept = (incoming: FileList | null) => {
    if (!incoming) return;
    onFilesChange([...files, ...Array.from(incoming)].slice(0, max));
  };

  /* Filled: the name replaces the hint, so the box reports what it holds. */
  const shown =
    files.length === 0
      ? hint
      : files.length === 1
        ? files[0].name
        : `${String(files.length)} attachments`;

  return (
    <div className="relative shrink-0">
      <div
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          accept(event.dataTransfer.files);
        }}
        className={cn(
          "group relative flex min-h-40 w-full shrink-0 flex-col items-center justify-center gap-3 rounded-q-400 bg-q-w-05 px-4 pt-6 pb-5 transition-colors hover:bg-q-w-08 motion-reduce:transition-none",
          invalid && "ring-1 ring-q-danger",
        )}
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        >
          <rect
            x="0.75"
            y="0.75"
            rx="15.25"
            ry="15.25"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            /* Inset by half the stroke so the dash sits inside the box; a
               percentage in the attribute cannot account for the stroke. */
            style={{
              width: "calc(100% - 1.5px)",
              height: "calc(100% - 1.5px)",
            }}
          />
        </svg>

        <div className="flex items-start">
          {pickers.map((picker, index) => (
            <span key={picker.label} className={index > 0 ? "-ml-2" : ""}>
              <input
                id={`${baseId}-${String(index)}`}
                type="file"
                accept={picker.accept}
                multiple={max > 1}
                className="hf-sr-only peer"
                onChange={(event) => {
                  accept(event.target.files);
                  // Let the same file be picked twice in a row.
                  event.target.value = "";
                }}
              />
              <label
                htmlFor={`${baseId}-${String(index)}`}
                aria-label={picker.label}
                className="flex size-10 cursor-pointer items-center justify-center rounded-q-full bg-q-card-strong text-q-fg shadow-q-badge transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-q-focus hover:scale-105 motion-reduce:transition-none"
              >
                <Icon name={picker.icon} size={17} />
              </label>
            </span>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-1 text-center">
          <span className="text-q-body-md text-q-fg">{title}</span>
          <span className="w-full truncate text-q-menu text-q-soft">
            {shown}
          </span>
        </div>
      </div>

      <span className="pointer-events-none absolute top-1.5 right-1.5 rounded-q-300 bg-q-w-05 px-2 py-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
        {badge}
      </span>
    </div>
  );
}
