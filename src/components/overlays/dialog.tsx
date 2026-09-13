"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Max width in px. */
  width?: number;
  className?: string;
}

/*
 * Built on the native <dialog> element rather than the design system's plain
 * div. showModal() gives a focus trap, Escape-to-close, an inert background
 * and ::backdrop for free — all of which the div version lacked.
 */
export function Dialog({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  width = 460,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // A backdrop click reports the <dialog> itself as the target.
  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onClose?.();
  }

  return (
    <dialog
      ref={ref}
      onClick={handleClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      aria-label={typeof title === "string" ? title : undefined}
      className={cn(
        "m-auto w-full rounded-modal border border-hairline bg-panel p-6",
        "text-primary shadow-e4 backdrop:bg-transparent",
        "open:animate-pop-in motion-reduce:animate-none",
        className,
      )}
      // Max width is a numeric prop — cannot be a class.
      style={{ maxWidth: width }}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {title && <h3 className="text-h3">{title}</h3>}
          {description && (
            <p className="mt-1.5 text-body-sm text-muted">{description}</p>
          )}
        </div>
        {onClose && (
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} />
        )}
      </div>
      {children && <div className="mt-5">{children}</div>}
      {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
    </dialog>
  );
}
