import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

/*
 * Three ways an audio token can silently do nothing, and a test for each:
 *
 *   1. Declared in q-studio.css but never projected into @theme — the utility
 *      class compiles to nothing at all.
 *   2. Projected but not registered in cn.ts — tailwind-merge cannot tell a
 *      custom font-size from a custom colour (both are `text-*`) and drops one
 *      of them on the floor.
 *   3. Present as a near-duplicate of a token the studio layer already had,
 *      which is the drift CLAUDE.md warns about.
 *
 * None of the three produces a build error or a console warning.
 */
const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const tokens = read("./q-studio.css");
const globals = read("../../app/globals.css");

describe("audio tokens", () => {
  it.each([
    ["--q-bg-section", "--color-q-section"],
    ["--q-text-on-brand", "--color-q-on-brand"],
  ])("declares %s and projects it as %s", (variable, projection) => {
    expect(tokens).toContain(`${variable}:`);
    expect(globals).toContain(`${projection}: var(${variable})`);
  });

  it.each([
    ["q-accent-2xl", "40px", "48px", "-1.6px", "700"],
    ["q-heading-sm", "24px", "28px", "-0.4px", "500"],
    ["q-body-lg", "18px", "28px", "normal", "500"],
    ["q-body-md", "16px", "24px", "normal", "500"],
    ["q-cta", "18px", "24px", "-0.4px", "600"],
  ])("projects text-%s at %s/%s", (name, size, line, tracking, weight) => {
    expect(globals).toContain(`--text-${name}: ${size}`);
    expect(globals).toContain(`--text-${name}--line-height: ${line}`);
    expect(globals).toContain(`--text-${name}--font-weight: ${weight}`);
    if (tracking !== "normal") {
      expect(globals).toContain(`--text-${name}--letter-spacing: ${tracking}`);
    }
  });

  /*
   * Registration in cn.ts. Without it tailwind-merge cannot tell a custom
   * font-size from a custom colour — both are `text-*` — and silently drops
   * one. Asserting the size survives beside a colour is the only way to see it.
   */
  it.each([
    "text-q-accent-2xl",
    "text-q-heading-sm",
    "text-q-body-lg",
    "text-q-body-md",
    "text-q-cta",
  ])("keeps %s when merged with a colour", (size) => {
    expect(cn(size, "text-q-soft")).toBe(`${size} text-q-soft`);
  });

  /* The CTA fill is a utility, not inline styles: it is two stacked gradients. */
  it("defines the audio CTA fill from existing brand tokens", () => {
    expect(tokens).toContain(".q-cta-audio");
    expect(tokens).toContain("var(--q-brand-lime-hi)");
  });

  /* Spec §4.1: --q-bg-plan keeps its name but stops holding its own literal. */
  it("makes --q-bg-plan an alias of --q-bg-section", () => {
    expect(tokens).toContain("--q-bg-plan: var(--q-bg-section)");
  });
});
