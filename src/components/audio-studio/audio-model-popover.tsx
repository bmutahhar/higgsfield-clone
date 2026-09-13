"use client";

import { useRef, useState } from "react";

import { AudioSettingRow } from "@/components/audio-studio/setting-row";
import { Icon } from "@/components/core/icon";
import { QPopover } from "@/components/overlays/q-popover";
import { useDismiss } from "@/components/overlays/use-dismiss";
import { AUDIO_MODELS, audioModelById } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The Model row and its searchable list.
 *
 * Width is pinned to the trigger's 316px, which is what the reference does and
 * what keeps the popover from reading as a detached menu.
 */
export function AudioModelPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useDismiss(
    open,
    () => {
      setOpen(false);
      anchor.current?.focus();
    },
    anchor,
    panel,
  );

  const selected = audioModelById(value);
  const term = query.trim().toLowerCase();
  const matches = AUDIO_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(term) ||
      model.description.toLowerCase().includes(term),
  );

  return (
    <>
      <AudioSettingRow
        ref={anchor}
        stacked
        label="Model"
        value={
          <>
            <span className="truncate">{selected?.name ?? "Pick a model"}</span>
            <Icon
              name="audio-lines"
              size={14}
              className="shrink-0 text-q-brand"
            />
          </>
        }
        onClick={() => {
          setOpen((current) => !current);
        }}
      />

      <QPopover anchorRef={anchor} open={open} width={316}>
        <div ref={panel}>
          <div className="flex shrink-0 items-center gap-2 border-b border-q-card px-3">
            <Icon name="search" size={20} className="shrink-0 text-q-soft" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search..."
              aria-label="Search models"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-q-menu font-normal text-q-fg outline-none placeholder:text-q-soft"
            />
          </div>

          <div className="flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-none p-3 pt-2">
            <div className="flex items-center gap-1.5 px-1.5">
              <Icon name="sparkles" size={16} className="shrink-0 text-q-fg" />
              <span className="text-q-caption-l font-medium text-q-soft">
                Featured models
              </span>
            </div>

            {matches.length === 0 ? (
              <p className="px-1.5 py-2 text-q-caption-l text-q-soft">
                No model matches “{query}”.
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {matches.map((model) => {
                  const active = model.id === value;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onChange(model.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-q-300 py-1.5 pr-2 pl-1.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                        active ? "bg-q-w-05" : "hover:bg-q-w-05",
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-q-200 bg-q-w-05 shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.05)]">
                        <Icon
                          name="audio-lines"
                          size={16}
                          className={active ? "text-q-brand" : "text-q-fg"}
                        />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-0.5">
                        <span className="truncate text-q-caption-l font-medium text-q-fg">
                          {model.name}
                        </span>
                        <span className="truncate text-q-caption-xs font-normal tracking-normal text-q-soft">
                          {model.description}
                        </span>
                      </span>
                      {active && (
                        <Icon
                          name="check"
                          size={20}
                          className="shrink-0 text-q-brand"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </QPopover>
    </>
  );
}
