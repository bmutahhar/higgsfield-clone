"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { GlassBadge } from "@/components/studio/glass-badge";
import { cn } from "@/lib/cn";

export interface DropZoneProps {
  title: [string, string];
  /** Shown while the zone is empty. */
  hint: string;
  /** Replaces `hint` once something is attached — a count, a duration. */
  filledHint?: string;
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
  filledHint,
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

      {filled && filledHint !== undefined && (
        <p className="w-full px-2 pb-1 text-center text-q-label-xs text-q-muted">
          {filledHint}
        </p>
      )}
    </div>
  );
}

/**
 * What an attached zone looks like. Images get a thumbnail grid; a single clip
 * gets a name chip, since a poster frame would need a decode we do not
 * otherwise need.
 *
 * Provisional: the reference site gates this behind a sign-in, so the layout
 * is built from the studio's own vocabulary rather than measured off it.
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
   * is revoked. Derived rather than held in state — putting them in state would
   * mean rendering once with no previews and again with them, and the effect
   * that set them would fire on every list change for no benefit. The effect
   * below exists only to release the previous batch.
   *
   * Images only; a video preview would cost a decode we do not otherwise need.
   */
  const previews = useMemo(
    () => (multiple ? files.map((file) => URL.createObjectURL(file)) : []),
    [files, multiple],
  );

  useEffect(
    () => () => {
      for (const url of previews) URL.revokeObjectURL(url);
    },
    [previews],
  );

  return (
    <div className="relative z-10 flex w-full flex-col gap-2">
      {multiple ? (
        <ul className="grid grid-cols-4 gap-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${String(i)}`}
              className="group/thumb relative"
            >
              <span className="block aspect-square overflow-hidden rounded-q-150 bg-q-card">
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
      ) : (
        files.map((file, i) => (
          <div
            key={file.name}
            className="relative flex items-center gap-2 rounded-q-200 bg-q-card px-2.5 py-2"
          >
            <Icon name="film" size={16} className="shrink-0 text-q-muted" />
            <span className="min-w-0 flex-1 truncate text-q-label-xs text-q-fg">
              {file.name}
            </span>
            <RemoveButton
              label={`Remove ${file.name}`}
              onClick={() => onRemove(i)}
            />
          </div>
        ))
      )}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-8 items-center justify-center gap-1.5 self-center rounded-q-200 bg-q-w-05 px-3 text-q-label-xs text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
      >
        <Icon name="plus" size={14} />
        {multiple ? "Add more" : label}
      </button>
    </div>
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
      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-q-subtle bg-q-card-strong text-q-fg shadow-q-glass transition-colors duration-150 outline-none hover:bg-q-raised focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
    >
      <Icon name="x" size={12} />
    </button>
  );
}
