import { describe, expect, it } from "vitest";

import { avatarHue, displayNameFromEmail } from "@/lib/auth/identity";

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

describe("avatarHue", () => {
  it("is deterministic", () => {
    expect(avatarHue("demo@higgsfield.ai")).toBe(
      avatarHue("demo@higgsfield.ai"),
    );
  });

  it("stays inside the hue circle", () => {
    for (const email of ["a@b.co", "zzz@yyy.io", "demo@higgsfield.ai"]) {
      const hue = avatarHue(email);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });
});
