"use client";

import { useId } from "react";

/**
 * The collapsible prompt.
 *
 * Two details carry it. The switch is a real checkbox behind a styled span, so
 * it is tabbable, toggles on Space and announces itself without any JavaScript.
 * The collapse animates `grid-template-rows` from `0fr` to `1fr`, which is the
 * only way to transition to a content-derived height — a max-height guess would
 * either clip a long prompt or ease against dead space.
 */
export function PromptField({
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  onBlur,
  placeholder,
  invalid,
  describedBy,
  ref,
}: {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  value: string;
  onValueChange: (next: string) => void;
  onBlur?: () => void;
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  /** Lets the form move focus here when this field is the one that failed. */
  ref?: React.Ref<HTMLTextAreaElement>;
}) {
  const id = useId();

  return (
    <div className="flex flex-col self-stretch overflow-hidden rounded-q-300">
      <div className="flex h-10 items-center justify-between gap-2 self-stretch bg-q-w-05 px-3">
        <label
          htmlFor={id}
          className="cursor-pointer text-q-label-sm font-medium text-q-muted"
        >
          Prompt
        </label>

        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          aria-label="Toggle prompt"
          className="peer hf-sr-only"
        />
        {/*
         * A label, not a div with a handler: clicking it toggles the input
         * natively, so there is no click plumbing and no state whose only job
         * is to pick a class. The thumb is a child, so its variant has to be
         * addressed through the track — `peer-checked:` alone only reaches
         * siblings.
         */}
        <label
          htmlFor={id}
          className="relative h-4 w-7 shrink-0 cursor-pointer rounded-q-full bg-q-switch-off transition-colors duration-150 peer-checked:bg-q-accent peer-focus-visible:ring-2 peer-focus-visible:ring-q-focus motion-reduce:transition-none peer-checked:[&>span]:translate-x-3"
        >
          <span className="absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-150 motion-reduce:transition-none" />
        </label>
      </div>

      <div
        className={`grid w-full transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          enabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden" inert={!enabled}>
          <textarea
            ref={ref}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-label="Prompt"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="hf-scrollbar-none h-40 w-full resize-none rounded-b-q-300 border-0 bg-q-w-05 p-3 text-q-body-sm text-q-fg outline-none placeholder:text-q-soft focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
