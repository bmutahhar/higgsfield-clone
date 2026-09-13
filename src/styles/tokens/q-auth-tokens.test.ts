import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/*
 * A token that exists but is never projected into the Tailwind theme produces
 * a class that silently does nothing — no build error, no console warning,
 * just an unstyled element. This pins both halves together.
 */
const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const tokens = read("./q-studio.css");
const globals = read("../../app/globals.css");

describe("auth tokens", () => {
  it.each([
    ["--q-divider", "--color-q-divider"],
    ["--q-btn-solid", "--color-q-solid"],
    ["--q-scrim", "--color-q-scrim"],
    ["--q-shadow-dialog", "--shadow-q-dialog"],
  ])("defines %s and projects it as %s", (variable, projection) => {
    expect(tokens).toContain(`${variable}:`);
    expect(globals).toContain(`${projection}: var(${variable})`);
  });

  it("ships the attention shake with a reduced-motion opt-out", () => {
    expect(tokens).toContain("@keyframes q-attention-shake");
    expect(tokens).toContain(".animate-q-attention-shake");
    expect(tokens).toContain("prefers-reduced-motion: reduce");
  });
});
