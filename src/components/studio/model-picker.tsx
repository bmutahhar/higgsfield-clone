"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/core/icon";
import { Dropdown, DropdownItem } from "@/components/overlays/dropdown";
import type { GenModel } from "@/config/models";
import { cn } from "@/lib/cn";

export interface ModelPickerProps {
  models: GenModel[];
  value: GenModel;
  onChange: (next: GenModel) => void;
  /** "row" is the video panel's full-width control; "pill" is the image bar's. */
  variant?: "row" | "pill";
}

function ModelRow({ model, selected }: { model: GenModel; selected: boolean }) {
  return (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-w-06 text-muted">
        <Icon name={model.icon} size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] text-primary">
            {model.name}
          </span>
          {model.badge && (
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 text-[9px] font-bold uppercase",
                model.badge === "New"
                  ? "bg-lime/20 text-lime"
                  : "bg-accent text-on-accent",
              )}
            >
              {model.badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {model.chips.map((chip) => (
            <span
              key={chip}
              className="font-mono text-[10px] whitespace-nowrap text-muted"
            >
              {chip}
            </span>
          ))}
        </span>
      </span>
      {selected && (
        <Icon name="check" size={14} className="shrink-0 text-lime" />
      )}
    </>
  );
}

/** Searchable picker with a featured section, mirroring the live control. */
export function ModelPicker({
  models,
  value,
  onChange,
  variant = "row",
}: ModelPickerProps) {
  const [query, setQuery] = useState("");

  const { featured, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? models.filter((m) => m.name.toLowerCase().includes(q))
      : models;
    return {
      featured: matched.filter((m) => m.featured),
      rest: matched.filter((m) => !m.featured),
    };
  }, [models, query]);

  return (
    <Dropdown
      label="Model"
      width={300}
      panelClassName="p-0"
      triggerClassName={cn(
        "flex items-center gap-2 rounded-lg border border-hairline bg-w-06",
        "transition-colors duration-[140ms] ease-snap motion-reduce:duration-0",
        "hover:border-strong focus-visible:shadow-ring focus-visible:outline-none",
        variant === "row"
          ? "h-11 w-full px-2.5 text-left"
          : "h-8 px-2.5 text-[13px]",
      )}
      trigger={
        variant === "row" ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-muted">Model</span>
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[13px] text-primary">
                  {value.name}
                </span>
                <Icon name={value.icon} size={12} className="text-lime" />
              </span>
            </span>
            <Icon name="chevron-right" size={14} className="text-muted" />
          </>
        ) : (
          <>
            <Icon name={value.icon} size={13} className="text-lime" />
            <span className="text-primary">{value.name}</span>
            <Icon name="chevron-down" size={12} className="text-muted" />
          </>
        )
      }
    >
      {(close) => (
        <>
          <div className="sticky top-0 flex items-center gap-2 border-b border-hairline bg-n-2 px-3 py-2.5">
            <Icon name="search" size={14} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search…"
              aria-label="Search models"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-primary outline-none placeholder:text-muted"
            />
          </div>

          <div className="p-1.5">
            {featured.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 pt-1 pb-2 text-[11px] text-muted">
                <Icon name="sparkles" size={11} className="text-lime" />
                Featured models
              </div>
            )}
            {featured.map((model) => (
              <DropdownItem
                key={model.id}
                selected={model.id === value.id}
                onSelect={() => {
                  onChange(model);
                  close();
                }}
              >
                <ModelRow model={model} selected={model.id === value.id} />
              </DropdownItem>
            ))}

            {rest.length > 0 && featured.length > 0 && (
              <div className="mt-1 border-t border-hairline pt-1.5" />
            )}
            {rest.map((model) => (
              <DropdownItem
                key={model.id}
                selected={model.id === value.id}
                onSelect={() => {
                  onChange(model);
                  close();
                }}
              >
                <ModelRow model={model} selected={model.id === value.id} />
              </DropdownItem>
            ))}

            {featured.length === 0 && rest.length === 0 && (
              <p className="px-2.5 py-6 text-center text-[13px] text-muted">
                No models match “{query}”.
              </p>
            )}
          </div>
        </>
      )}
    </Dropdown>
  );
}
