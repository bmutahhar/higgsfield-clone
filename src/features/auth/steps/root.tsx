"use client";

import { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/core/icon";
import { SOCIAL_PROVIDERS } from "@/config/auth";
import { useAuth } from "@/features/auth/auth-context";
import { ProviderMark } from "@/features/auth/provider-mark";
import { StepHeader } from "@/features/auth/steps/step-header";
import { cn } from "@/lib/cn";

/*
 * Login and Sign up open this same screen. The only difference is the consent
 * checkbox, which login mode omits entirely.
 *
 * The hover on these buttons is a border change only — no fill, no lift. The
 * focus-visible ring is ours: the live buttons have none, which is a defect
 * rather than a detail worth reproducing.
 */
const PROVIDER_BUTTON =
  "flex items-center justify-center gap-2 rounded-q-300 border border-q-w-10 py-3.5 text-center text-sm font-semibold text-q-body transition-colors hover:border-q-fg focus-visible:border-q-fg focus-visible:ring-2 focus-visible:ring-q-focus focus-visible:outline-none disabled:opacity-60 motion-reduce:transition-none md:py-5";

export function RootStep() {
  const { signupMode, signInWithProvider, goTo, status } = useAuth();
  /*
   * Genuine app state: `agreed` gates submission and `blocked` drives an
   * announcement, so neither is merely visual. The checked *appearance* is
   * still CSS — a real visually-hidden input driving peer-checked:.
   */
  const [agreed, setAgreed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  function guard(action: () => void) {
    if (signupMode && !agreed) {
      setBlocked(true);
      return;
    }
    action();
  }

  return (
    <>
      <StepHeader
        title="Welcome to Higgsfield"
        subtitle="Sign up and generate for free"
      />

      <div className="flex w-full flex-col gap-3">
        {/* A notice, not a CTA. It is a div on the live site and stays one. */}
        <div className="flex items-center justify-center gap-2.5 rounded-q-300 bg-q-accent-10 p-3 text-sm font-medium text-q-brand">
          <Icon name="gift" size={20} className="shrink-0" />
          Sign up and get an additional discount
        </div>

        <div className="flex flex-col gap-3">
          {SOCIAL_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled={status === "pending"}
              onClick={() => {
                guard(() => void signInWithProvider(provider.id));
              }}
              className={PROVIDER_BUTTON}
            >
              <ProviderMark provider={provider.id} />
              {provider.label}
            </button>
          ))}
        </div>

        {/* Bare text, no rules either side. */}
        <div className="flex w-full items-center justify-center">
          <span className="text-center text-xs text-q-disabled-fg">OR</span>
        </div>

        <button
          type="button"
          disabled={status === "pending"}
          onClick={() => {
            guard(() => {
              goTo(signupMode ? "signup" : "login");
            });
          }}
          className={PROVIDER_BUTTON}
        >
          <Icon name="mail" size={20} />
          Continue with Email
        </button>

        {signupMode && (
          <div className="mt-1 flex w-full flex-col gap-2">
            <label
              className={cn(
                "flex w-full cursor-pointer items-center gap-3",
                "max-md:rounded-q-300 max-md:border max-md:border-q-w-10 max-md:p-3",
                blocked && "animate-q-attention-shake",
              )}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={agreed}
                aria-invalid={blocked}
                aria-describedby="auth-consent-error"
                onChange={(event) => {
                  setAgreed(event.target.checked);
                  setBlocked(false);
                }}
              />
              {/*
               * The tick is a descendant of this span, not a sibling of the
               * input, so `peer-checked:block` on the tick itself would never
               * match — peer variants compile to a sibling combinator. The
               * descendant variant on the box is what reaches it.
               */}
              <span className="flex size-4.5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-q-w-10 transition peer-checked:border-transparent peer-checked:bg-q-accent motion-reduce:transition-none peer-checked:[&_svg]:opacity-100">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  className="size-3 text-q-modal opacity-0 transition-opacity motion-reduce:transition-none"
                >
                  <path
                    d="M2.5 6.2 4.8 8.5 9.5 3.8"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-left text-xs leading-4 text-q-fg">
                I agree to the{" "}
                <Link
                  href="/terms-of-use-agreement"
                  target="_blank"
                  className="font-medium underline"
                >
                  Terms of Use
                </Link>
                , acknowledge the{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="font-medium underline"
                >
                  Privacy Policy
                </Link>
                , and confirm I&apos;m at least 18 years old.
              </span>
            </label>

            {/* Always rendered, so appearing does not shift the layout. */}
            <p
              id="auth-consent-error"
              aria-hidden={!blocked}
              className={cn(
                "text-xs leading-4 text-q-brand",
                !blocked && "invisible",
              )}
            >
              * Please agree to the Terms of Use to continue
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-q-divider pt-4">
          <Icon
            name="cloud"
            size={18}
            strokeWidth={2}
            className="text-q-soft"
          />
          <p className="text-center text-sm font-medium text-q-soft">
            SSO available on{" "}
            <Link href="/pricing" className="underline">
              Scale and Enterprise
            </Link>{" "}
            plans
          </p>
        </div>
      </div>
    </>
  );
}
