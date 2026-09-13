"use client";

import { useRef, useState } from "react";

import { AudioSettingRow } from "@/components/audio-studio/setting-row";
import { Icon } from "@/components/core/icon";
import { QPopover } from "@/components/overlays/q-popover";
import { useDismiss } from "@/components/overlays/use-dismiss";
import { LANGUAGES } from "@/config/audio";
import { cn } from "@/lib/cn";

/**
 * The Translate tab's language row.
 *
 * The same listbox as the model popover, minus the group heading and the
 * descriptions — a language has a flag and a name and nothing else worth
 * showing.
 */
export function LanguagePopover({
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

  const selected = LANGUAGES.find((language) => language.id === value);
  const term = query.trim().toLowerCase();
  const matches = LANGUAGES.filter((language) =>
    language.name.toLowerCase().includes(term),
  );

  return (
    <>
      <AudioSettingRow
        ref={anchor}
        stacked
        label="Language"
        value={
          <>
            <span aria-hidden className="text-base leading-none">
              {selected?.flag}
            </span>
            <span className="truncate">{selected?.name ?? "Pick one"}</span>
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
              aria-label="Search languages"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-q-menu font-normal text-q-fg outline-none placeholder:text-q-soft"
            />
          </div>

          <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-none p-3 pt-2">
            {matches.length === 0 ? (
              <p className="px-1.5 py-2 text-q-caption-l text-q-soft">
                No language matches “{query}”.
              </p>
            ) : (
              matches.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => {
                    onChange(language.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-q-300 px-2 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                    language.id === value ? "bg-q-w-05" : "hover:bg-q-w-05",
                  )}
                >
                  <span aria-hidden className="text-base leading-none">
                    {language.flag}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-q-caption-l font-medium text-q-fg">
                    {language.name}
                  </span>
                  {language.id === value && (
                    <Icon
                      name="check"
                      size={20}
                      className="shrink-0 text-q-brand"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </QPopover>
    </>
  );
}
