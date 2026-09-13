import { describe, expect, it } from "vitest";

import { displayNameFromEmail } from "@/lib/auth/identity";

describe("displayNameFromEmail", () => {
  it.each([
    ["ada.lovelace@example.com", "Ada Lovelace"],
    ["grace_hopper@example.com", "Grace Hopper"],
    ["alan-turing@example.com", "Alan Turing"],
    ["demo@higgsfield.ai", "Demo"],
  ])("turns %s into %s", (email, expected) => {
    expect(displayNameFromEmail(email)).toBe(expected);
  });

  it("falls back when the local part is empty", () => {
    expect(displayNameFromEmail("@example.com")).toBe("Creator");
  });
});
