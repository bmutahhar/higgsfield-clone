"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import type { Ref } from "react";

export interface PromptEditorProps {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  name?: string;
  invalid?: boolean;
  /** Id of the element describing the current error, if any. */
  describedBy?: string;
  /** Forwarded so the form layer can focus the field when it fails. */
  ref?: Ref<HTMLTextAreaElement>;
}

/*
 * The prompt field.
 *
 * Upstream is a `contenteditable` div with a hand-built placeholder element.
 * A textarea gets to the same picture and is better behaved: real IME and
 * undo, real form participation, and `::placeholder` for free. The surface
 * holds plain text, so nothing is lost.
 *
 * Growth matches the live bar exactly — a floor of 40px (which is two lines'
 * worth, so one and two lines look identical) and a ceiling of 112px, after
 * which it scrolls.
 */
export function PromptEditor({
  value,
  onChange,
  onBlur,
  name,
  invalid = false,
  describedBy,
  ref,
}: PromptEditorProps) {
  const inner = useRef<HTMLTextAreaElement>(null);

  /*
   * Two owners for one node: the height effect below needs it, and the form
   * needs it to focus the field on a failed submit. A callback ref feeds both
   * rather than making either give theirs up.
   */
  const attach = useCallback(
    (node: HTMLTextAreaElement | null) => {
      inner.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    // Height is the measured content height, which no class can express. The
    // min/max clamps stay in CSS so they remain one source of truth.
    el.style.height = "auto";
    el.style.height = `${String(el.scrollHeight)}px`;
  }, [value]);

  return (
    <textarea
      ref={attach}
      name={name}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      onKeyDown={(event) => {
        /*
         * Enter generates and Shift+Enter breaks the line — the prompt-box
         * convention. `isComposing` is the guard that matters: an IME fires
         * Enter to accept a candidate, and submitting there would eat the
         * word someone was still choosing.
         */
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.nativeEvent.isComposing
        ) {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }
      }}
      rows={1}
      aria-label="Prompt"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder="Describe the scene you imagine"
      className="hf-scrollbar-none block max-h-28 min-h-10 w-full resize-none bg-transparent py-0 text-q-body-sm text-q-body outline-none placeholder:text-q-idle"
    />
  );
}
