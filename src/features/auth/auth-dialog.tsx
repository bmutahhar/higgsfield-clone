"use client";

import { useEffect, useRef } from "react";

import { Icon } from "@/components/core/icon";
import { useAuth } from "@/features/auth/auth-context";
import { EmailLoginStep } from "@/features/auth/steps/email-login";
import { EmailSignupStep } from "@/features/auth/steps/email-signup";
import { ResetStep } from "@/features/auth/steps/reset";
import { RootStep } from "@/features/auth/steps/root";
import { cn } from "@/lib/cn";

/*
 * Built on the native <dialog> with showModal(): focus trap, Escape-to-close,
 * an inert background and ::backdrop all come from the platform. The live site
 * fakes inertness with `body { pointer-events: none }`, a Radix artifact we
 * neither need nor want.
 *
 * Geometry is the spec's three-breakpoint shell — 1120x720 at xl, 560x700 at
 * md, a 352x620 card below that. The media half does not render at all under
 * 1280px rather than shrinking.
 */
const CHROME_BUTTON =
  "absolute z-10 flex size-7 items-center justify-center rounded-2xl border border-q-w-04 bg-q-w-05 text-q-fg transition-colors hover:bg-q-w-10 focus-visible:ring-2 focus-visible:ring-q-focus focus-visible:outline-none motion-reduce:transition-none md:size-8";

export function AuthDialog() {
  const { open, closeAuth, canGoBack, goBack, step } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        /*
         * Escape fires `cancel`. Prevent the element closing itself so React
         * state stays the single source of truth for whether it is open.
         */
        event.preventDefault();
        closeAuth();
      }}
      onClick={(event) => {
        // A backdrop click reports the <dialog> itself as the target.
        if (event.target === ref.current) closeAuth();
      }}
      aria-labelledby="auth-step-title"
      className={cn(
        "h-155 max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-88 overflow-hidden p-0",
        "rounded-q-500 border border-q-hairline bg-q-panel text-q-body shadow-q-dialog outline-none",
        "backdrop:bg-q-scrim",
        "md:h-175 md:max-h-[calc(100dvh-48px)] md:w-140 md:max-w-[calc(100vw-48px)] md:rounded-q-600",
        "xl:h-[min(720px,calc(100dvh-64px))] xl:w-280 xl:max-w-[calc(100vw-64px)]",
        "open:animate-q-dialog-in open:flex motion-reduce:animate-none",
      )}
    >
      {canGoBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={goBack}
          className={cn(
            CHROME_BUTTON,
            "top-3 left-3 md:top-5 md:left-5 xl:left-[calc(50%+1.25rem)]",
          )}
        >
          <Icon name="arrow-left" size={16} />
        </button>
      )}

      <button
        type="button"
        aria-label="Close"
        onClick={closeAuth}
        className={cn(CHROME_BUTTON, "top-3 right-3 md:top-5 md:right-5")}
      >
        <Icon name="x" size={16} />
      </button>

      {/* The media half. Task 12 fills it; below xl it does not render. */}
      <div className="hidden min-h-0 w-1/2 p-2 pr-0 xl:block" />

      <div className="hf-scrollbar-none flex flex-1 flex-col items-center overflow-y-auto px-5 py-6 md:px-22 md:py-8">
        <div className="w-full">
          {step === "root" && <RootStep />}
          {step === "signup" && <EmailSignupStep />}
          {step === "login" && <EmailLoginStep />}
          {step === "reset" && <ResetStep />}
        </div>
      </div>
    </dialog>
  );
}
