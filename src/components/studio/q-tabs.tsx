"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/**
 * The studio's segmented control. It appears three times on the Genjutsu page —
 * form mode, pane view and preset source — with only shape and fill differing,
 * so it is one component rather than three near-copies.
 *
 * The moving pill is a single absolutely-positioned element rather than a
 * background on the active tab: that is what lets it slide between positions.
 * Its offset is the one genuinely dynamic value here and rides a CSS custom
 * property, which is the exception the styling rules carve out.
 */

const list = cva(
  "relative flex items-center transition-colors motion-reduce:transition-none",
  {
    variants: {
      shape: {
        rounded: "rounded-q-300",
        pill: "rounded-q-full",
      },
      surface: {
        // Sunken track: the form-mode and preset-source variant.
        track: "border border-q-default bg-q-w-05 p-1",
        // Trackless: the pane header, where only the pill is drawn.
        bare: "p-0",
      },
      fill: { true: "w-full", false: "w-fit" },
    },
    defaultVariants: { shape: "rounded", surface: "track", fill: false },
  },
);

const tab = cva(
  "relative z-10 inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 border-0 bg-transparent px-2 text-q-caption-m whitespace-nowrap transition-colors duration-150 outline-none select-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-q-focus",
  {
    variants: {
      shape: { rounded: "rounded-q-200", pill: "rounded-q-full" },
      active: { true: "text-q-fg", false: "text-q-idle-soft hover:text-q-fg" },
      fill: { true: "flex-1", false: "" },
    },
    defaultVariants: { shape: "rounded", active: false, fill: false },
  },
);

export interface QTabItem {
  id: string;
  label: string;
  icon?: IconName;
}

interface QTabsProps extends VariantProps<typeof list> {
  items: QTabItem[];
  value: string;
  onValueChange: (id: string) => void;
  /** Accessible name for the tablist. */
  label: string;
  /** Fires with the hovered/focused item id, or null on leave. Drives previews. */
  onItemPeek?: (id: string | null) => void;
  className?: string;
}

export function QTabs({
  items,
  value,
  onValueChange,
  label,
  onItemPeek,
  shape,
  surface,
  fill,
  className,
}: QTabsProps) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    items.findIndex((i) => i.id === value),
  );

  /*
   * Measured geometry for the pill. A `fill` list needs no measurement — the
   * tabs are equal fractions — but a content-width list does, and the numbers
   * only exist after layout, so they are state rather than a render-time read.
   */
  const [box, setBox] = useState({ left: 0, width: 0 });
  const measure = useCallback(() => {
    const node = refs.current[index];
    if (!node) return;
    setBox({ left: node.offsetLeft, width: node.offsetWidth });
  }, [index]);

  useLayoutEffect(measure, [measure, items.length]);

  // Fonts landing late re-flow the labels, so re-measure once they settle.
  useEffect(() => {
    if (fill) return;
    const observer = new ResizeObserver(measure);
    for (const node of refs.current) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [fill, measure, items.length]);

  // Roving focus: arrows move selection, Home/End jump to the ends.
  function onKeyDown(event: React.KeyboardEvent) {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    let next = -1;
    if (delta) next = (index + delta + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const item = items[next];
    if (!item) return;
    onValueChange(item.id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseLeave={() => onItemPeek?.(null)}
      className={cn(list({ shape, surface, fill }), className)}
    >
      {/*
       * The pill. `fill` tabs are equal fractions, so the offset is a clean
       * index/count; otherwise it is measured against the active button.
       */}
      <span
        aria-hidden
        className={cn(
          "q-indicator pointer-events-none absolute top-1 bottom-1 left-1 transition-[translate,width] duration-200 ease-q-pop motion-reduce:transition-none",
          shape === "pill" ? "rounded-q-full" : "rounded-q-200",
          surface === "bare" && "inset-y-0 left-0",
        )}
        style={{
          width: fill
            ? `calc((100% - 0.5rem) / ${items.length})`
            : `${box.width}px`,
          translate: fill
            ? `calc(${index} * 100%)`
            : `${box.left - (surface === "bare" ? 0 : 4)}px`,
        }}
      />

      {items.map((item, i) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${uid}-${item.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            onMouseEnter={() => onItemPeek?.(item.id)}
            onFocus={() => onItemPeek?.(item.id)}
            className={tab({ shape, active, fill })}
          >
            {item.icon ? (
              <Icon name={item.icon} size={16} className="shrink-0" />
            ) : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
