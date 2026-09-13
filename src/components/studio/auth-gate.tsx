"use client";

import { useEffect, useRef } from "react";

import { Icon } from "@/components/core/icon";

/*
 * Neutral glyphs rather than vendor marks: the icon set carries no brand logos,
 * and reproducing someone's trademark for a button that does not authenticate
 * would be wrong on both counts.
 */
const PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: "globe" },
  { id: "apple", label: "Continue with Apple", icon: "key-round" },
  { id: "email", label: "Continue with Email", icon: "mail" },
] as const;

/**
 * What a signed-out visitor gets instead of a generation.
 *
 * Presentational only: it opens, traps focus and closes. None of the provider
 * buttons authenticate — wiring them is a separate piece of work, and a control
 * that looks live but silently does nothing is worse than one that says so.
 */
export function AuthGate({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[3002] flex items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80"
      />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        tabIndex={-1}
        className="relative grid max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-88 grid-rows-1 overflow-hidden rounded-q-500 border border-q-hairline bg-q-panel outline-none md:h-175 md:max-h-[calc(100dvh-48px)] md:w-140 md:max-w-none md:grid-cols-2 xl:w-280"
      >
        {/* Promo half. Decorative on small screens, so it drops out entirely. */}
        <div className="relative hidden overflow-hidden bg-q-card md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-q-card-strong to-q-page" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="inline-flex items-center gap-1.5 rounded-q-full bg-q-w-08 px-2.5 py-1 text-q-caption-xs text-q-fg uppercase">
              Genjutsu
            </span>
            <p className="mt-3 font-q-display text-q-accent-sm text-q-fg uppercase">
              One take, every version
            </p>
            <p className="mt-1 text-q-body-sm text-q-muted">
              Sign in to generate with your own footage.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-q-w-05 text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-10 focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none"
          >
            <Icon name="x" size={18} />
          </button>

          <h2
            id="auth-gate-title"
            className="text-center text-xl font-semibold text-q-fg"
          >
            Sign in to generate
          </h2>
          <p className="-mt-2 text-center text-q-body-sm text-q-muted">
            Generation needs an account. Everything else here is free to browse.
          </p>

          <div className="flex w-full flex-col gap-2">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                disabled
                title="Authentication is not wired up in this build"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-q-300 bg-q-w-05 text-q-label-sm font-medium text-q-fg transition-colors duration-150 outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                <Icon name={provider.icon} size={16} />
                {provider.label}
              </button>
            ))}
          </div>

          <p className="text-center text-q-label-xs text-q-dim">
            This is a front-end clone — no account is created and nothing is
            sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
