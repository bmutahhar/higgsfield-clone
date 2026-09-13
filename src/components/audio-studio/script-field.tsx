"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/core/icon";
import { cn } from "@/lib/cn";
import { serialiseScript } from "@/lib/script-tokens";

/**
 * The script editor.
 *
 * A `contenteditable` rather than a textarea, because `@` mentions render as
 * chips. All the real logic — flattening the HTML back to the string the
 * schema validates — lives in `lib/script-tokens.ts`, tested, so this
 * component is markup and one event handler.
 */
export function ScriptField({
  value,
  onChange,
  attachments,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Names of what is attached to this form — all the typeahead can offer. */
  attachments: readonly string[];
  invalid?: boolean;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const [mentioning, setMentioning] = useState(false);

  return (
    <section
      className={cn(
        "relative flex h-40 w-full shrink-0 flex-col gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors focus-within:border-q-default motion-reduce:transition-none",
        invalid && "border-q-danger",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-q-menu text-q-soft">Script</span>
        <span
          title="Write what the voice should say, word for word."
          className="flex size-4.5 shrink-0 items-center justify-center text-q-soft transition-colors hover:text-q-fg motion-reduce:transition-none"
        >
          <Icon name="info" size={18} />
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label="Script"
          onInput={(event) => {
            const text = serialiseScript(event.currentTarget.innerHTML);
            onChange(text);
            /* An `@` still being typed — the token runs to the caret. */
            setMentioning(/(^|\s)@[^\s@]*$/.test(text));
          }}
          className="minimal-scrollbar size-full cursor-text [scrollbar-gutter:stable] overflow-y-auto text-q-caption-l font-normal text-q-fg outline-none"
        />

        {value.length === 0 && (
          <p className="pointer-events-none absolute top-0 left-0 text-q-caption-l font-normal whitespace-pre-line text-q-soft select-none">
            {
              "Write exactly what the voice will read out loud.\nType @ to reference attachments"
            }
          </p>
        )}

        {mentioning && attachments.length > 0 && (
          <ul
            aria-label="Attachments"
            className="q-menu-surface absolute bottom-0 left-0 z-30 w-full overflow-hidden rounded-q-200"
          >
            {attachments.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    const next = value.replace(
                      /(^|\s)@[^\s@]*$/,
                      `$1@${name} `,
                    );
                    onChange(next);
                    if (editor.current) editor.current.textContent = next;
                    setMentioning(false);
                  }}
                  className="flex w-full items-center px-2 py-1.5 text-left text-q-caption-l text-q-fg hover:bg-q-w-05"
                >
                  @{name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
