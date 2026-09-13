"use client";

import { Icon } from "@/components/core/icon";
import { QSwitch } from "@/components/studio/q-switch";

export interface PromptBlockProps {
  value: string;
  onValueChange: (next: string) => void;
  onBlur?: () => void;
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
  audio: boolean;
  onAudioChange: (next: boolean) => void;
  /** Opens the element picker. Focuses the editor until that is built. */
  onElements: () => void;
}

/**
 * The Edit surface's prompt: always open, unlike Genjutsu's, because an edit
 * with nothing said about it is not a request.
 *
 * The label sits inside the field rather than above it, so the block reads as
 * one object; the editor is padded to clear it rather than the label being
 * given a row of its own, which is what keeps the field its full height.
 */
export function PromptBlock({
  value,
  onValueChange,
  onBlur,
  placeholder,
  invalid,
  describedBy,
  ref,
  audio,
  onAudioChange,
  onElements,
}: PromptBlockProps) {
  return (
    <div className="flex max-h-64 min-h-40 w-full flex-col self-stretch">
      <div className="relative flex-1 overflow-hidden rounded-t-q-300 border border-q-hairline bg-q-card">
        <p className="pointer-events-none absolute top-3 left-3 text-q-label-sm font-medium text-q-muted">
          Prompt
        </p>
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-label="Prompt"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="hf-scrollbar-none size-full resize-none border-0 bg-transparent p-3 pt-9 text-q-body-sm text-q-fg outline-none placeholder:text-q-soft focus:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-b-q-300 border border-t-0 border-q-hairline bg-q-card p-3 pt-2">
        <button
          type="button"
          onClick={onElements}
          className="inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-q-200 bg-q-panel px-1.5 py-1 text-q-label-xs text-q-fg transition-colors duration-150 outline-none select-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
        >
          <Icon name="at-sign" size={14} />
          Elements
        </button>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-q-200 bg-q-panel px-1.5 py-1">
          <Icon
            name={audio ? "volume-2" : "volume-off"}
            size={14}
            className="text-q-fg"
          />
          <span className="text-q-caption-m font-medium text-q-fg">
            {audio ? "On" : "Off"}
          </span>
          <QSwitch
            checked={audio}
            onCheckedChange={onAudioChange}
            label="Generate audio"
          />
        </span>
      </div>
    </div>
  );
}
