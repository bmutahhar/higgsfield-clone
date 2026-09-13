"use client";

import { type RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A popover that escapes its container.
 *
 * The form panel and every preset card clip their overflow, so any menu
 * anchored inside one gets sliced off at the panel edge. Rendering into a
 * portal with fixed positioning is the only way out — which is exactly what the
 * reference does, and why its menus live at the end of `<body>`.
 *
 * Position is measured from the trigger and re-measured on scroll and resize,
 * because the trigger sits inside a scrolling column and would otherwise drift
 * away from its menu.
 */
export function QPopover({
  anchorRef,
  open,
  children,
  width,
  className,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
  /** Used to keep the menu on screen when the trigger sits near an edge. */
  width: number;
  className?: string;
}) {
  const [pos, setPos] = useState<{
    bottom: number;
    left: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    /*
     * Nothing is cleared on close: the component already renders null when
     * closed, so a stale position is invisible. Keeping it also means a reopen
     * paints in the right place immediately whenever the trigger has not moved,
     * which is the common case; if it has, `place()` corrects it on the same
     * tick the effect runs.
     */
    if (!open) return;

    function place() {
      const node = anchorRef.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      const gap = 8;

      // Prefer the right of the trigger, the way the reference opens these;
      // fall back to its left when that would leave the viewport.
      const fitsRight = box.right + gap + width <= window.innerWidth - 8;
      const left = fitsRight
        ? box.right + gap
        : Math.max(8, box.left - gap - width);

      /*
       * Anchored by its bottom edge rather than its top, so the menu grows
       * upward out of a trigger near the foot of the column and `maxHeight`
       * alone keeps it on screen — no post-render measurement needed.
       */
      setPos({
        bottom: window.innerHeight - box.bottom,
        left,
        maxHeight: Math.max(120, box.bottom - 16),
      });
    }

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef, width]);

  if (!open || !pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        bottom: pos.bottom,
        left: pos.left,
        width,
        maxHeight: pos.maxHeight,
      }}
      className={`fixed z-1002 flex flex-col ${className ?? ""}`}
    >
      {children}
    </div>,
    document.body,
  );
}
