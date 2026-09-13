"use client";

import type { CSSProperties } from "react";

import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";

export interface PromptComposerProps {
  value?: string;
  onChange?: (next: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  /** Model label shown in the pill. */
  model?: string;
  /** Credit cost readout, rendered in mono. */
  cost?: number;
  /** Reference image URLs shown as 44px thumbs. */
  references?: string[];
  onAttach?: () => void;
  busy?: boolean;
  style?: CSSProperties;
}

/*
 * The product's signature control: a glass prompt bar with model pill,
 * references and credit cost. Blur is used here deliberately — the composer is
 * floating chrome, one of the few places the system allows it.
 */
export function PromptComposer({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Describe your shot…",
  model = "Seedance 2.5",
  cost,
  references = [],
  onAttach,
  busy = false,
  style,
}: PromptComposerProps) {
  return (
    <div
      style={{
        background: "var(--surface-glass)",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--r-panel)",
        padding: 12,
        boxShadow: "var(--shadow-3)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      {references.length > 0 && (
        <div style={{ display: "flex", gap: 8 }}>
          {references.map((src) => (
            <span
              key={src}
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--r-thumb)",
                overflow: "hidden",
                border: "1px solid var(--border-hairline)",
                background: "var(--n-4)",
              }}
            >
              {/* Reference thumbs are user-supplied and often blob:/data: URLs
                  from a local file pick, which next/image cannot optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </span>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="Prompt"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit?.();
        }}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
          color: "var(--text-primary)",
          font: "var(--fw-regular) var(--fs-body-lg)/1.45 var(--font-ui)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IconButton
          icon="paperclip"
          label="Attach reference"
          size="sm"
          onClick={onAttach}
        />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 28,
            padding: "0 10px",
            borderRadius: "var(--r-pill)",
            background: "var(--w-06)",
            border: "1px solid var(--border-hairline)",
            font: "var(--text-body-sm)",
            color: "var(--text-secondary)",
          }}
        >
          <Icon name="sparkles" size={14} style={{ color: "var(--hf-lime)" }} />
          {model}
        </span>
        <span style={{ flex: 1 }} />
        {cost !== undefined && (
          <span className="hf-mono" style={{ color: "var(--text-muted)" }}>
            {cost} credits
          </span>
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
