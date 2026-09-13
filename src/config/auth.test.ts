import { describe, expect, it } from "vitest";

import {
  AUTH_SLIDES,
  MOCK_USER,
  mockLatency,
  SLIDE_DURATION_MS,
  SOCIAL_PROVIDERS,
} from "@/config/auth";
import { isValidEmail, passwordIssue } from "@/lib/auth/validate";

describe("auth config", () => {
  it("seeds a mock user that its own validators accept", () => {
    expect(isValidEmail(MOCK_USER.email)).toBe(true);
    expect(passwordIssue(MOCK_USER.password)).toBeNull();
  });

  it("offers exactly the three observed social providers", () => {
    expect(SOCIAL_PROVIDERS.map((provider) => provider.id)).toEqual([
      "google",
      "apple",
      "microsoft",
    ]);
  });

  it("carries the four carousel slides at the measured 5s cadence", () => {
    expect(AUTH_SLIDES).toHaveLength(4);
    expect(SLIDE_DURATION_MS).toBe(5000);
  });

  it("gives every slide an https source on an allow-listed host", () => {
    for (const slide of AUTH_SLIDES) {
      expect(slide.media.src).toMatch(/^https:\/\//);
      expect(slide.media.src).toContain("higgsfield.ai");
      expect(slide.label.length).toBeGreaterThan(0);
      expect(slide.title).toBe(slide.title.toUpperCase());
    }
  });

  it("skips its own latency under test", async () => {
    const started = Date.now();
    await mockLatency();
    expect(Date.now() - started).toBeLessThan(50);
  });
});
