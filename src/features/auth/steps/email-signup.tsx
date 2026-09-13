"use client";

import { useAuth } from "@/features/auth/auth-context";
import { EmailForm } from "@/features/auth/steps/email-form";
import { StepHeader } from "@/features/auth/steps/step-header";

export function EmailSignupStep() {
  const { signUpWithEmail, goTo } = useAuth();

  return (
    <>
      <StepHeader
        title="Create an account"
        subtitle="Sign up and generate for free"
      />
      <EmailForm
        submitLabel="Continue with Email"
        onSubmit={({ email, password }) => signUpWithEmail(email, password)}
      />
      <div className="mt-4">
        <div className="text-center text-xs text-q-soft md:text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              goTo("login");
            }}
            className="text-q-body underline"
          >
            Log in
          </button>
        </div>
      </div>
    </>
  );
}
