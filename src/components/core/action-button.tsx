"use client";

import { useEffect, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

/**
 * The measured tile-rail button: 32px, black at 40% over a light blur.
 *
 * Exported so a rail can extend it rather than restate it — the geometry is
 * transcribed from the live surface and should move in one place if it moves
 * at all.
 */
export const ROUND_ACTION =
  "pointer-events-auto flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:bg-black/65 focus-visible:outline-none";

/** How long the confirmation holds before the button returns to its glyph. */
const HOLD_MS = 1600;

type Outcome = "idle" | "done" | "failed";

const SETTLED: Record<
  Exclude<Outcome, "idle">,
  { icon: IconName; className: string }
> = {
  done: { icon: "check", className: "text-q-brand" },
  failed: { icon: "circle-alert", className: "text-q-danger" },
};

export interface ActionButtonProps {
  icon: IconName;
  /** The accessible name. Wrap the button in a `Tooltip` to show it too. */
  label: string;
  /** Awaited, so the button can say whether it worked. */
  onAction: () => void | Promise<void>;
  /**
   * Present when the button toggles rather than fires: drives `aria-pressed`
   * and fills the glyph.
   */
  pressed?: boolean;
  size?: number;
  className?: string;
}

/**
 * One thing you can do to a generation.
 *
 * Actions here are asynchronous and invisible — a copy reaches the clipboard,
 * a download reaches the disk — so the button reports the outcome itself for
 * about a second and a half. Without that, copying an image is completely
 * silent and the only way to know it worked is to go and paste.
 */
export function ActionButton({
  icon,
  label,
  onAction,
  pressed,
  size = 16,
  className,
}: ActionButtonProps) {
  /*
   * The one piece of React state on a tile, and it earns its place: this is
   * the *outcome* of a call, which no CSS selector can express. Hover, press,
   * focus and `pressed` itself all stay CSS, as `CLAUDE.md` requires.
   */
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A tile can be deleted while its own action is still in flight.
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function settle(next: Exclude<Outcome, "idle">) {
    setOutcome(next);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOutcome("idle");
    }, HOLD_MS);
  }

  const settled = outcome === "idle" ? null : SETTLED[outcome];

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={() => {
        try {
          const running = onAction();
          /*
           * A synchronous action has nothing to wait for and nothing to
           * report — Recreate and Like have already happened by the time this
           * returns, and flashing a tick at them would be noise.
           */
          if (!(running instanceof Promise)) return;
          void running.then(
            () => {
              settle("done");
            },
            () => {
              settle("failed");
            },
          );
        } catch {
          settle("failed");
        }
      }}
      className={cn(className ?? ROUND_ACTION, settled?.className)}
    >
      <Icon
        name={settled?.icon ?? icon}
        size={size}
        // A filled glyph is what reads as "liked" at 16px.
        className={
          pressed === true && settled === null ? "fill-current" : undefined
        }
      />
    </button>
  );
}
