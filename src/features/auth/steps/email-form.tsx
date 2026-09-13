"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { AuthRequestError } from "@/services/auth-client";

/*
 * All three email steps share this shell. Disabling the <fieldset> during
 * submit is the entire loading state — it greys, pulses and blocks input, with
 * no spinner anywhere, which is what the live dialog does.
 *
 * Each field is a grid whose third row is reserved for its error, so an error
 * appearing never shifts the form.
 *
 * Note border-2: the inputs are twice the weight of the provider buttons, and
 * getting that wrong is visible at a glance.
 */
const FIELD =
  "h-13 w-full rounded-q-300 border-2 border-q-w-10 bg-transparent px-4 text-base font-medium text-q-soft transition placeholder:text-q-soft focus:border-q-fg focus:text-q-body focus:outline-none motion-reduce:transition-none";

const SUBMIT =
  "h-13 w-full cursor-pointer rounded-q-300 bg-q-solid text-base font-medium text-q-body transition-colors hover:bg-q-card-strong focus-visible:bg-q-card-strong focus-visible:ring-2 focus-visible:ring-q-focus focus-visible:outline-none disabled:cursor-wait disabled:bg-q-disabled disabled:text-q-disabled-fg motion-reduce:transition-none";

/*
 * FormData.get returns string | File. Stringifying a File would silently yield
 * "[object File]" and post it as a password, so anything that is not already a
 * string is treated as absent.
 */
function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

export interface EmailFormProps {
  submitLabel: string;
  withPassword?: boolean;
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
}

export function EmailForm({
  submitLabel,
  withPassword = true,
  onSubmit,
}: EmailFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        email: field(data, "email"),
        password: field(data, "password"),
      });
    } catch (cause) {
      setError(
        cause instanceof AuthRequestError
          ? { message: cause.message, field: cause.field }
          : { message: "Something went wrong. Try again." },
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      className="w-full"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <fieldset
        disabled={pending}
        className="relative flex w-full flex-col gap-3 disabled:animate-pulse disabled:cursor-wait motion-reduce:disabled:animate-none"
      >
        <div className="grid w-full grid-rows-[0_auto_auto]">
          <label htmlFor="auth-email" className="invisible opacity-0">
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            placeholder="Email"
            required
            autoFocus
            autoComplete="email"
            aria-invalid={error?.field === "email"}
            className={FIELD}
          />
          {error?.field === "email" && (
            <p className="pt-1.5 text-xs leading-4 text-q-danger">
              {error.message}
            </p>
          )}
        </div>

        {withPassword && (
          <div className="grid w-full grid-rows-[0_auto_auto]">
            <label htmlFor="auth-password" className="invisible opacity-0">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete="current-password"
              aria-invalid={error?.field === "password"}
              className={FIELD}
            />
            {error?.field === "password" && (
              <p className="pt-1.5 text-xs leading-4 text-q-danger">
                {error.message}
              </p>
            )}
          </div>
        )}

        {error && !error.field && (
          <p role="alert" className="text-xs leading-4 text-q-danger">
            {error.message}
          </p>
        )}

        <button type="submit" className={SUBMIT}>
          {submitLabel}
        </button>
      </fieldset>
    </form>
  );
}
