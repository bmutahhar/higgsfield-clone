import type { ReactNode, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> {
  label?: ReactNode;
  hint?: ReactNode;
  /** Show a mono character counter. Requires maxLength. */
  counter?: boolean;
  className?: string;
  textareaClassName?: string;
}

export function Textarea({
  label,
  hint,
  counter,
  maxLength,
  rows = 4,
  value,
  className,
  textareaClassName,
  ...rest
}: TextareaProps) {
  const length = typeof value === "string" ? value.length : undefined;

  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-body-sm font-medium text-secondary">{label}</span>
      )}
      <textarea
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={cn(
          "resize-y rounded-control border border-input-border bg-input px-3 py-2.5",
          "text-body text-primary outline-none placeholder:text-muted",
          "transition-[border-color,box-shadow] duration-[140ms] ease-snap",
          // Border only. A ring around a field you are typing in is noise.
          "focus:border-lime motion-reduce:duration-0",
          textareaClassName,
        )}
        {...rest}
      />
      {(hint ?? counter) && (
        <span className="flex justify-between text-caption text-muted">
          <span>{hint}</span>
          {counter && maxLength ? (
            <span className="font-mono text-mono">
              {length ?? 0}/{maxLength}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );
}
