"use client";

import { type RefObject, useEffect } from "react";

/**
 * Closes a popover on Escape or on a pointer press outside it. Shared by the
 * quality select, the model popover and the card overflow menu so all three
 * dismiss identically.
 */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  ...refs: RefObject<HTMLElement | null>[]
) {
  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }

    function onPointer(event: PointerEvent) {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);
}
