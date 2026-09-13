"use client";

import { useState } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { EmailForm } from "@/features/auth/steps/email-form";
import { StepHeader } from "@/features/auth/steps/step-header";

export function ResetStep() {
  const { requestReset, goBack } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    return (
      <>
        <StepHeader title="Reset Your Password" />
        <div className="flex w-full flex-col gap-4 text-center">
          {/*
           * Deliberately non-committal: the endpoint answers the same whether
           * or not the address exists, and so does this copy. Saying "we sent
           * you a code" would leak which addresses are registered.
           */}
          <p className="text-sm text-q-soft">
            If that address has an account, we&apos;ve sent a code to{" "}
            <span className="font-medium text-q-body">{sentTo}</span>.
          </p>
          <button
            type="button"
            onClick={goBack}
            className="text-sm text-q-body underline"
          >
            Back to log in
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* No subtitle on this step — the live dialog omits it entirely. */}
      <StepHeader title="Reset Your Password" />
      <EmailForm
        submitLabel="Send code"
        withPassword={false}
        onSubmit={async ({ email }) => {
          await requestReset(email);
          setSentTo(email);
        }}
      />
    </>
  );
}
