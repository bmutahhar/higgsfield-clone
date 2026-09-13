"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { GlassBadge } from "@/components/studio/glass-badge";
import { cn } from "@/lib/cn";

export interface DropZoneProps {
  title: [string, string];
  /** Shown while the zone is empty; an attached zone shows the media itself. */
  hint: string;
  /** One badge per icon; several overlap into a stack. */
  icons: IconName[];
  accept: string;
  multiple?: boolean;
  /** Controlled: this zone owns no file state of its own. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * An upload target, bound to a form field.
 *
 * Empty, the whole tile is one control: a transparent button stretched across
 * it so the click area, the focus ring and the accessible name are all the same
 * thing, with the badge stack and label underneath as decoration.
 *
 * Filled, it becomes a list — and the stretched button has to go, because a
 * full-bleed click target sitting over per-item remove buttons would swallow
 * them. An explicit Add control takes its place.
 *
 * Drag state is the one thing here that genuinely needs React: there is no CSS
 * selector for "a file is currently over this element".
 */
export function DropZone({
  title,
  hint,
  icons,
  accept,
  multiple,
  files,
  onFilesChange,
  onBlur,
  invalid,
  describedBy,
}: DropZoneProps) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const label = `${title[0]} ${title[1]}`;
  const filled = files.length > 0;

  function accepted(list: FileList) {
    const next = [...list];
    onFilesChange(multiple ? [...files, ...next] : next.slice(0, 1));
    onBlur?.();
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-3 self-stretch rounded-q-300 bg-q-w-05 p-1">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length)
            accepted(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 self-stretch overflow-hidden rounded-q-200 p-4 transition-colors duration-150 motion-reduce:transition-none",
          filled ? "min-h-40" : "h-40",
          dragging ? "bg-q-accent-10" : "bg-transparent",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-q-200 border transition-colors duration-150 motion-reduce:transition-none",
            dragging
              ? "border-q-accent"
              : invalid
                ? "border-q-danger/50"
                : "border-transparent",
          )}
        />

        <input
          ref={input}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hf-sr-only"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => {
            if (event.target.files?.length) accepted(event.target.files);
            // Let the same file be picked again after a remove.
            event.target.value = "";
          }}
        />

        {!filled && (
          <button
            type="button"
            aria-label={label}
            onClick={() => input.current?.click()}
            onBlur={onBlur}
            className="absolute inset-0 z-10 rounded-[inherit] outline-none focus-visible:ring-1 focus-visible:ring-q-focus focus-visible:ring-inset"
          />
        )}

        {filled ? (
          <FilledState
            files={files}
            multiple={multiple}
            onRemove={(index) => {
              onFilesChange(files.filter((_, i) => i !== index));
              onBlur?.();
            }}
            onAdd={() => input.current?.click()}
            label={label}
          />
        ) : (
          <>
            <span className="isolate flex items-center">
              {icons.map((icon, i) => (
                <GlassBadge
                  key={icon}
                  className={cn(
                    i === 1 && "z-2 -ml-2",
                    i === 2 && "z-3 -ml-2",
                    i === 0 && "z-1",
                  )}
                >
                  <Icon name={icon} size={16} />
                </GlassBadge>
              ))}
            </span>

            <span className="pointer-events-none flex w-full flex-col items-center gap-1.5 text-center">
              <span className="text-center text-q-label-sm font-semibold text-q-fg">
                {title[0]}
                <br />
                {title[1]}
              </span>
              <span className="text-q-label-xs text-q-muted">{hint}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * What an attached zone looks like.
 *
 * The two zones diverge here. A reference clip is one thing, so it gets one
 * card, tilted and white-edged like a photo dropped on the panel — the tilt is
 * what says "this is your material" rather than "this is a form field". The
 * character images are a set, so they get a row of square tiles with the add
 * control leading it, which keeps adding a second image in the same place as
 * adding the first.
 */
function FilledState({
  files,
  multiple,
  onRemove,
  onAdd,
  label,
}: {
  files: File[];
  multiple?: boolean;
  onRemove: (index: number) => void;
  onAdd: () => void;
  label: string;
}) {
  /*
   * Object URLs are a manual allocation: each pins its blob in memory until it
   * is revoked. Derived rather than held in state — storing them would render
   * once without previews and again with them — and released together whenever
   * the list changes.
   */
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(
    () => () => {
      for (const url of previews) URL.revokeObjectURL(url);
    },
    [previews],
  );

  if (!multiple) {
    const file = files[0];
    const preview = previews[0];
    if (!file || preview === undefined) return null;

    return (
      <div className="relative z-10 flex w-full items-center justify-center">
        <figure className="group/card relative w-[82%] -rotate-3 rounded-q-300 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          {/*
            A video element rather than an image: the browser paints the first
            frame once metadata loads, which costs no decode of our own and
            needs no poster we would have to generate.
          */}
          <video
            src={preview}
            preload="metadata"
            muted
            playsInline
            aria-label={file.name}
            className="block aspect-video w-full rounded-[0.5rem] object-cover"
          />
          <RemoveButton
            label={`Remove ${file.name}`}
            onClick={() => onRemove(0)}
          />
        </figure>
      </div>
    );
  }

  return (
    <ul className="relative z-10 flex w-full flex-wrap items-center justify-center gap-2">
      {/*
        The add tile leads the row rather than trailing it, so the control does
        not move further away with every image attached.
      */}
      <li>
        <button
          type="button"
          aria-label={label}
          onClick={onAdd}
          className="flex size-14 items-center justify-center rounded-q-300 bg-q-w-05 text-q-muted transition-colors duration-150 outline-none hover:bg-q-w-08 hover:text-q-fg focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-q-w-08">
            <Icon name="plus" size={14} />
          </span>
        </button>
      </li>

      {files.map((file, i) => (
        <li key={`${file.name}-${String(i)}`} className="group/thumb relative">
          <span className="block size-14 overflow-hidden rounded-q-300 bg-q-card">
            {previews[i] !== undefined && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={previews[i]}
                className="size-full object-cover"
              />
            )}
          </span>
          <RemoveButton
            label={`Remove ${file.name}`}
            onClick={() => onRemove(i)}
          />
        </li>
      ))}
    </ul>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-q-subtle bg-q-card-strong text-q-fg opacity-0 shadow-q-glass transition-[opacity,background-color] duration-150 outline-none group-hover/card:opacity-100 group-hover/thumb:opacity-100 hover:bg-q-raised focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
    >
      <Icon name="x" size={12} />
    </button>
  );
}
