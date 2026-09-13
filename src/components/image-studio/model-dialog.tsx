"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { ModelBadge } from "@/components/image-studio/model-badge";
import { PILL_CLASS } from "@/components/image-studio/setting-pill";
import { Dropdown } from "@/components/overlays/dropdown";
import {
  IMAGE_MODELS,
  type ImageModel,
  MODEL_SECTIONS,
} from "@/config/image-studio";
import { cn } from "@/lib/cn";

export interface ModelDialogProps {
  value: ImageModel;
  onChange: (next: ImageModel) => void;
}

const PANEL_W = 400;
const PANEL_H = 640;

function matches(model: ImageModel, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return (
    model.name.toLowerCase().includes(q) ||
    model.description.toLowerCase().includes(q)
  );
}

/*
 * Pattern B: the model picker.
 *
 * Unlike the setting menus this one is a dialog, not a listbox — it owns a
 * search field, which a listbox may not contain. The panel height is fixed:
 * upstream keeps it at 640px whether it is listing thirty-three models or
 * none, so filtering never makes the surface jump.
 */
export function ModelDialog({ value, onChange }: ModelDialogProps) {
  const [query, setQuery] = useState("");

  const sections = MODEL_SECTIONS.map((section) => ({
    ...section,
    items: section.models
      .map((id) => IMAGE_MODELS.find((m) => m.id === id))
      .filter((m): m is ImageModel => m !== undefined)
      .filter((m) => matches(m, query)),
  })).filter((section) => section.items.length > 0);

  return (
    <Dropdown
      label="Select model"
      role="dialog"
      width={PANEL_W}
      height={PANEL_H}
      align="start"
      triggerClassName={cn(PILL_CLASS, "group w-40 justify-center gap-2")}
      panelClassName={cn(
        "flex flex-col overflow-hidden rounded-q-400 p-0 shadow-none",
        "border border-q-hairline bg-q-card/95 backdrop-blur-[32px]",
      )}
      trigger={
        <>
          <Icon name={value.icon} size={16} className="text-q-brand" />
          <span className="truncate">{value.name}</span>
          <Icon
            name="chevron-right"
            size={16}
            className="text-q-idle transition-colors group-hover:text-q-brand"
          />
        </>
      }
    >
      {(close) => {
        const dismiss = () => {
          setQuery("");
          close();
        };

        return (
          <>
            <label className="flex h-[42px] shrink-0 cursor-text items-center gap-2 border-b border-b-q-hairline px-1.5 py-0.5">
              <Icon name="search" size={20} className="ml-1.5 text-q-soft" />
              <input
                type="text"
                value={query}
                autoFocus
                placeholder="Search..."
                aria-label="Search models"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                className="min-w-0 flex-1 bg-transparent text-q-body-sm outline-none placeholder:text-q-idle"
              />
            </label>

            <div className="hf-scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
              {sections.length === 0 ? (
                <p className="px-3 py-4 text-center text-q-body-sm text-q-idle">
                  No models found
                </p>
              ) : (
                sections.map((section) => (
                  <section key={section.label} className="pb-1">
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      <Icon
                        name={section.icon}
                        size={14}
                        className="text-q-soft"
                      />
                      <span className="text-q-body-sm">{section.label}</span>
                    </div>
                    <div className="flex flex-col gap-1 px-3">
                      {section.items.map((model) => {
                        const selected = model.id === value.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              onChange(model);
                              dismiss();
                            }}
                            className={cn(
                              "flex w-full items-center rounded-q-300 py-1.5 pr-3 pl-1.5 text-start",
                              "transition-colors hover:bg-q-w-05 focus-visible:bg-q-w-05 focus-visible:outline-none",
                              selected && "bg-q-w-05",
                            )}
                          >
                            <span className="mr-2 flex size-10 shrink-0 items-center justify-center rounded-q-200 bg-q-w-05 text-q-brand shadow-[inset_0_2px_3px_rgba(255,255,255,0.03)]">
                              <Icon name={model.icon} size={16} />
                            </span>

                            <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="text-q-label-xs font-medium text-white">
                                  {model.name}
                                </span>
                                {model.badge && (
                                  <ModelBadge label={model.badge} />
                                )}
                              </span>
                              <span className="text-[10px] leading-[14px] text-q-soft">
                                {model.description}
                              </span>
                            </span>

                            {selected && (
                              <Icon
                                name="check"
                                size={20}
                                className="ml-2 shrink-0 text-q-brand"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </>
        );
      }}
    </Dropdown>
  );
}
