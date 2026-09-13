"use client";

import { useAuth } from "@/features/auth/auth-context";
import { EmailForm } from "@/features/auth/steps/email-form";
import { StepHeader } from "@/features/auth/steps/step-header";

export function EmailLoginStep() {
  const { logInWithEmail, goTo } = useAuth();

  return (
    <>
      <StepHeader
        title="Log in to Higgsfield AI"
        subtitle="Enter your account and continue creating"
      />
      <EmailForm
        submitLabel="Log in"
        onSubmit={({ email, password }) => logInWithEmail(email, password)}
      />
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-q-soft md:text-sm">
          <button
            type="button"
            onClick={() => {
              goTo("reset");
            }}
            className="transition-colors hover:text-q-body motion-reduce:transition-none"
          >
            Forgot password?
          </button>
          <span>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                goTo("signup");
              }}
              className="text-q-body underline"
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
