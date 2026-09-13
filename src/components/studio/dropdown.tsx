"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

export interface DropdownProps {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  triggerClassName?: string;
  panelClassName?: string;
  /** Panel width in px. Needed up front so it can be positioned before paint. */
  width?: number;
  label: string;
}

interface Position {
  top: number;
  left: number;
  maxHeight: number;
  /** Anchored by its bottom edge, so the panel grows upward. */
  flip: boolean;
}

const GAP = 8;
const MARGIN = 12;

/*
 * Popover used by every control in the generation bars.
 *
 * Rendered through a portal rather than positioned inside the trigger's
 * parent: both bars live in scroll containers (the video rail scrolls, the
 * image bar sits in one), and an absolutely positioned panel is clipped by any
 * ancestor with overflow. Fixed positioning off the trigger rect escapes that,
 * and lets the panel flip above the trigger when there is no room below.
 */
export function Dropdown({
  trigger,
  children,
  align = "start",
  triggerClassName,
  panelClassName,
  width = 240,
  label,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - GAP - MARGIN;
      const above = r.top - GAP - MARGIN;
      const openUp = below < 220 && above > below;

      setPos({
        top: openUp ? r.top - GAP : r.bottom + GAP,
        left:
          align === "end"
            ? Math.max(
                MARGIN,
                Math.min(r.right - width, window.innerWidth - width - MARGIN),
              )
            : Math.max(
                MARGIN,
                Math.min(r.left, window.innerWidth - width - MARGIN),
              ),
        maxHeight: Math.max(160, openUp ? above : below),
        flip: openUp,
      });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align, width]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const panel =
    open && pos !== null ? (
      /*
       * Two elements on purpose. The outer one owns the fixed position and the
       * upward flip; the inner one owns the entrance animation.
       *
       * They cannot be the same element: --animate-pop-in ends on
       * `transform: none` with a `both` fill-mode, and a filling animation
       * outranks an inline style, so it silently erased the flip transform.
       */
      <div
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          width,
          transform: pos.flip ? "translateY(-100%)" : undefined,
        }}
        className="z-100"
      >
        <div
          ref={panelRef}
          id={panelId}
          role="listbox"
          aria-label={label}
          style={{ maxHeight: pos.maxHeight }}
          className={cn(
            "overflow-y-auto rounded-panel border border-hairline bg-n-2 p-1.5 shadow-e4",
            "hf-scrollbar animate-pop-in motion-reduce:animate-none",
            panelClassName,
          )}
        >
          {children(() => {
            setOpen(false);
          })}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => {
          setOpen((v) => !v);
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </>
  );
}

export interface DropdownItemProps {
  selected?: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}

export function DropdownItem({
  selected = false,
  onSelect,
  children,
  className,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
        "text-[13px] transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
        "focus-visible:shadow-ring focus-visible:outline-none",
        selected ? "bg-w-08 text-primary" : "text-secondary hover:bg-w-06",
        className,
      )}
    >
      {children}
    </button>
  );
}
