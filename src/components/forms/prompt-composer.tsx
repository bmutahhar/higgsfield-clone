import type { KeyboardEvent, TextareaHTMLAttributes } from "react";

import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/cn";

export interface PromptComposerProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "rows"
> {
  onSubmit?: () => void;
  /** Model label shown in the pill. */
  model?: string;
  /** Credit cost readout, rendered in mono. */
  cost?: number;
  /** Reference image URLs shown as 44px thumbs. */
  references?: string[];
  onAttach?: () => void;
  busy?: boolean;
  className?: string;
}

/*
 * The product's signature control: a glass prompt bar with model pill,
 * references and credit cost. Blur is used here deliberately — the composer is
 * floating chrome, one of the few places the system allows it.
 */
export function PromptComposer({
  placeholder = "Describe your shot…",
  model = "Seedance 2.5",
  cost,
  references = [],
  onAttach,
  onSubmit,
  busy = false,
  className,
  onKeyDown,
  ...rest
}: PromptComposerProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(e);
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit?.();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-panel border border-hairline bg-glass p-3",
        "shadow-e3 backdrop-blur-[20px] backdrop-saturate-[1.4]",
        className,
      )}
    >
      {references.length > 0 && (
        <div className="flex gap-2">
          {references.map((src) => (
            <span
              key={src}
              className="size-11 overflow-hidden rounded-thumb border border-hairline bg-n-4"
            >
              {/* Reference thumbs are user-supplied and often blob:/data: URLs
                  from a local file pick, which next/image cannot optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="block size-full object-cover" />
            </span>
          ))}
        </div>
      )}

      <textarea
        placeholder={placeholder}
        aria-label="Prompt"
        rows={2}
        onKeyDown={handleKeyDown}
        className={cn(
          "resize-none border-none bg-transparent text-body-lg/[1.45] text-primary",
          "outline-none placeholder:text-muted",
        )}
        {...rest}
      />

      <div className="flex items-center gap-2">
        <IconButton
          icon="paperclip"
          label="Attach reference"
          size="sm"
          onClick={onAttach}
        />
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-hairline bg-w-06 px-2.5 text-body-sm text-secondary">
          <Icon name="sparkles" size={14} className="text-lime" />
          {model}
        </span>
        <span className="flex-1" />
        {cost !== undefined && (
          <span className="font-mono text-mono text-muted">{cost} credits</span>
        )}
        <Button
          size="sm"
          pill
          iconRight={busy ? undefined : "arrow-up"}
          loading={busy}
          onClick={onSubmit}
        >
          Generate
        </Button>
      </div>
    </div>
  );
}
