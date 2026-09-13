import { describe, expect, it } from "vitest";

import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  passwordIssue,
} from "@/lib/auth/validate";

describe("isValidEmail", () => {
  it.each([
    "demo@higgsfield.ai",
    "a.b-c+tag@sub.domain.co.uk",
    "  padded@example.com  ",
  ])("accepts %s", (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each(["", "not-an-email", "no@domain", "@example.com", "a b@c.com"])(
    "rejects %s",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});

describe("passwordIssue", () => {
  it("accepts a password at the minimum length", () => {
    expect(passwordIssue("a".repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });

  it("rejects one character short and says the minimum", () => {
    expect(passwordIssue("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  });
});
