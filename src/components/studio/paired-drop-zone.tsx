"use client";

import { useEffect, useMemo, useState } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { GlassBadge } from "@/components/studio/glass-badge";
import { cn } from "@/lib/cn";

export interface PairedSlot {
  title: string;
  /** Two lines; the break is explicit and part of the layout. */
  hint: string;
  icon: IconName;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  invalid?: boolean;
}

/**
 * Motion Control's two inputs, framed as one object.
 *
 * They sit in a single bordered container rather than stacking as separate
 * cards, because they are halves of one instruction: this motion, that
 * performer. Splitting them visually would invite filling in only one, which
 * the schema rejects anyway.
 *
 * Each tile is a `<label>` wrapping a visually-hidden input covering the whole
 * area, so the click target, the focus ring and the accessible name are one
 * thing with no handler at all.
 */
export function PairedDropZone({ slots }: { slots: [PairedSlot, PairedSlot] }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-q-500 border border-q-hairline p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      {slots.map((slot) => (
        <Slot key={slot.title} {...slot} />
      ))}
    </div>
  );
}

function Slot({
  title,
  hint,
  icon,
  accept,
  file,
  onFileChange,
  invalid,
}: PairedSlot) {
  /*
   * One object URL, created and revoked together in the same effect. Splitting
   * those across a memo and a cleanup is what broke the other zone's previews:
   * React re-runs an effect without recomputing a memo.
   */
  const key = file
    ? `${file.name}:${String(file.size)}:${String(file.lastModified)}`
    : "";
  const [preview, setPreview] = useState<string | null>(null);
  const isVideo = useMemo(() => file?.type.startsWith("video"), [file]);

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);

    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      className={cn(
        "relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-q-400 bg-q-card transition-colors duration-150 motion-reduce:transition-none",
        file
          ? "border border-q-hairline"
          : "border border-dashed border-q-default",
        invalid === true && "border-q-danger/50",
      )}
    >
      <label className="absolute inset-0 size-full cursor-pointer">
        <span className="hf-sr-only">{title}</span>
        <input
          type="file"
          accept={accept}
          aria-invalid={invalid}
          className="hf-sr-only"
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </label>

      {preview !== null ? (
        <>
          {isVideo === true ? (
            <video
              src={preview}
              preload="metadata"
              muted
              playsInline
              aria-hidden
              className="size-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={preview} className="size-full object-cover" />
          )}
          <button
            type="button"
            aria-label={`Remove ${title}`}
            onClick={() => onFileChange(null)}
            className="absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-q-subtle bg-q-card-strong text-q-fg opacity-0 shadow-q-glass transition-opacity duration-150 outline-none hover:bg-q-raised focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none [div:hover>&]:opacity-100"
          >
            <Icon name="x" size={12} />
          </button>
        </>
      ) : (
        <div className="pointer-events-none flex flex-col items-center gap-2 px-2 text-center">
          <GlassBadge className="size-8">
            <Icon name={icon} size={14} />
          </GlassBadge>
          <p className="text-q-label-xs font-medium text-q-fg">{title}</p>
          <p className="text-q-label-xs whitespace-pre-line text-q-muted">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
