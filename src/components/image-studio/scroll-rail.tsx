"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export interface ScrollRailProps {
  children: ReactNode;
}

const NUDGE = 200;

/*
 * The settings row, which scrolls horizontally once the pills outgrow it.
 *
 * The two edge arrows are driven by scroll position, not by hover: each is
 * hidden outright when there is nothing left to scroll to in its direction.
 * That is state a stylesheet cannot derive, which is the one thing here that
 * earns a `useState`.
 */
export function ScrollRail({ children }: ScrollRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft < max - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => {
      observer.disconnect();
    };
  }, [measure]);

  const nudge = (delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative max-w-full min-w-0 flex-1">
      <div
        ref={ref}
        onScroll={measure}
        className="hf-scrollbar-none max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-none"
      >
        <div className="flex w-max min-w-full items-center gap-2">
          {children}
        </div>
      </div>

      <RailArrow
        side="left"
        shown={edges.left}
        onClick={() => {
          nudge(-NUDGE);
        }}
      />
      <RailArrow
        side="right"
        shown={edges.right}
        onClick={() => {
          nudge(NUDGE);
        }}
      />
    </div>
  );
}

function RailArrow({
  side,
  shown,
  onClick,
}: {
  side: "left" | "right";
  shown: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Scroll settings ${side}`}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 flex size-4 -translate-y-1/2 items-center justify-center rounded-full",
        "text-white/45 transition hover:text-white/70 focus-visible:text-white/70 focus-visible:outline-none",
        side === "left" ? "-left-2" : "-right-2",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon
        name={side === "left" ? "chevron-left" : "chevron-right"}
        size={12}
      />
    </button>
  );
}
