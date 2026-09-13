"use client";

import { useMemo, useRef, useState } from "react";

import { Icon } from "@/components/core/icon";
import { QPopover } from "@/components/studio/q-popover";
import { useDismiss } from "@/components/studio/use-dismiss";
import { type GenModel, VIDEO_MODELS } from "@/config/models";
import { cn } from "@/lib/cn";

/**
 * The model popover. Wider than the form column so the capability chips fit on
 * one line, opening to the right for the same reason the quality menu does.
 *
 * Choosing a model is a navigation, not local state: the URL's `model` param is
 * what the page reads, which keeps every model deep-linkable and the back
 * button meaningful. The caller supplies `onSelect` to perform that push.
 */
export function GenjutsuModelSelect({
  modelId,
  onSelect,
}: {
  modelId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  // Portalled out of the panel, so dismissal watches the menu as well as the row.
  useDismiss(open, () => setOpen(false), root, menu);

  const active = VIDEO_MODELS.find((m) => m.id === modelId);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VIDEO_MODELS;
    return VIDEO_MODELS.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div ref={root} className="relative w-full">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Model"
        onClick={() => setOpen((v) => !v)}
        className="grid h-[54px] w-full grid-cols-[1fr_auto] items-center gap-2 rounded-q-300 bg-q-w-05 px-3 py-2 text-left transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
      >
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span className="text-q-caption-m text-q-muted">Model</span>
          <span className="truncate text-q-label-sm font-medium text-q-fg">
            {active?.name ?? "Select a model"}
          </span>
        </span>
        <Icon
          name="chevron-right"
          size={16}
          className="shrink-0 text-q-muted"
        />
      </button>

      <QPopover anchorRef={trigger} open={open} width={400}>
        <div
          ref={menu}
          role="dialog"
          aria-label="Choose a model"
          className="relative flex min-h-0 flex-col overflow-hidden rounded-q-500 border border-q-hairline bg-q-panel/95 backdrop-blur-[32px]"
        >
          {/* Decorative wash. Purely atmospheric — it carries no information. */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-9 w-full rounded-[317px] bg-[rgba(139,213,244,0.24)] blur-[50px]"
          />

          <div className="relative z-10 shrink-0 p-3 pb-2">
            <label className="flex h-9 items-center gap-2 rounded-q-200 bg-q-w-05 px-2.5">
              <Icon name="search" size={16} className="shrink-0 text-q-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search models"
                className="min-w-0 flex-1 border-0 bg-transparent text-q-label-sm text-q-fg outline-none placeholder:text-q-muted"
              />
            </label>
          </div>

          <div className="hf-scrollbar-none relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
            <div className="flex items-center gap-1.5 px-3 pt-2 pb-2">
              <Icon name="sparkle" size={14} className="text-q-muted" />
              <p className="flex-1 text-q-label-xs font-medium text-q-muted">
                {query ? "Results" : "Featured models"}
              </p>
            </div>

            <div className="flex flex-col gap-1 px-3">
              {matches.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  selected={model.id === modelId}
                  onSelect={() => {
                    onSelect(model.id);
                    setOpen(false);
                  }}
                />
              ))}
              {matches.length === 0 ? (
                <p className="px-1.5 py-6 text-center text-q-label-xs text-q-muted">
                  No models match that search.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </QPopover>
    </div>
  );
}

function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: GenModel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-q-300 py-1.5 pr-3 pl-1.5 text-start transition-colors duration-150 outline-none hover:bg-q-w-05 focus-visible:bg-q-w-05 motion-reduce:transition-none",
        selected && "bg-q-w-05",
      )}
    >
      <span
        className={cn(
          "mr-2 flex size-10 shrink-0 items-center justify-center rounded-q-200 bg-q-w-05 shadow-[inset_0_2px_3px_rgba(255,255,255,0.03)]",
          selected ? "text-q-brand" : "text-q-muted",
        )}
      >
        <Icon name={model.icon} size={16} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-q-label-xs font-medium text-white">
            {model.name}
          </span>
          {model.badge ? (
            <span
              className={cn(
                "inline-block -skew-x-12 rounded-q-100 px-1.5 font-q-display text-[10px] font-bold uppercase",
                model.badge === "Top"
                  ? "q-badge-top text-white"
                  : "bg-q-accent text-q-inverse",
              )}
            >
              {model.badge}
            </span>
          ) : null}
        </span>

        <span className="flex gap-1 overflow-hidden">
          {model.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-q-100 bg-q-w-05 px-1 py-0.5 text-[10px] font-medium text-q-muted"
            >
              {chip}
            </span>
          ))}
        </span>
      </span>

      <span className="size-5 shrink-0 text-q-fg">
        {selected ? <Icon name="check" size={16} /> : null}
      </span>
    </button>
  );
}
