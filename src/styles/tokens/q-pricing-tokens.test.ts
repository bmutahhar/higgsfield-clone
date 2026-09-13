import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

/*
 * Three ways a pricing token can silently do nothing, and a test for each:
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

describe("pricing tokens", () => {
  it.each([
    ["--q-brand-pink", "--color-q-pink"],
    ["--q-brand-blue", "--color-q-blue"],
    ["--q-info", "--color-q-info"],
    ["--q-bg-plan", "--color-q-ground"],
    ["--q-w-03", "--color-q-w-03"],
    ["--q-w-06", "--color-q-w-06"],
    ["--q-w-14", "--color-q-w-14"],
    ["--q-w-30", "--color-q-w-30"],
    ["--q-w-40", "--color-q-w-40"],
    ["--q-r-700", "--radius-q-700"],
    ["--q-r-800", "--radius-q-800"],
    ["--q-shadow-key", "--shadow-q-key"],
    ["--q-shadow-plan", "--shadow-q-plan"],
    ["--q-glow-slider", "--shadow-q-slider"],
    ["--q-ease-swap", "--ease-q-swap"],
    ["--q-ease-slot", "--ease-q-slot"],
  ])("declares %s and projects it as %s", (variable, projection) => {
    expect(tokens).toContain(`${variable}:`);
    expect(globals).toContain(`${projection}: var(${variable})`);
  });

  /*
   * The measured values. If the live site moves, these are what change — and
   * a diff here is the signal to re-measure rather than to nudge a component.
   */
  it.each([
    ["--q-brand-pink", "#ff005b"],
    ["--q-brand-blue", "#0256fe"],
    /*
     * #18191c is pinned under --q-bg-section, not --q-bg-plan. The audio
     * surface measured the same colour and gave it the name it actually has;
     * --q-bg-plan now aliases it. The literal is still guarded, and there is
     * still exactly one of it — which is the property this block is for.
     */
    ["--q-bg-section", "#18191c"],
    ["--q-info", "#9ce6f3"],
  ])("pins %s to its measured value %s", (variable, value) => {
    expect(tokens).toMatch(new RegExp(`${variable}:\\s*${value}`));
  });

  it("reuses the studio white ladder rather than re-declaring it", () => {
    // 0.05 / 0.1 / 0.2 already exist as --q-w-05/10/20. A second spelling of
    // any of them is the drift this layer is supposed to prevent.
    const declarations = tokens.match(/--q-w-\d+:/g) ?? [];
    expect(new Set(declarations).size).toBe(declarations.length);
  });
});

describe("pricing type and radius survive tailwind-merge", () => {
  /*
   * Each pair is a genuine conflict only if cn() knows both halves are the
   * same class group. Unregistered, `text-q-price` and `text-q-pink` look
   * identical to tailwind-merge and the first is dropped.
   */
  it.each([
    ["text-q-price", "text-q-plan"],
    ["text-q-title", "text-q-badge"],
    ["rounded-q-700", "rounded-q-800"],
    ["shadow-q-key", "shadow-q-plan"],
  ])("resolves %s against %s to the last one", (first, second) => {
    expect(cn(first, second)).toBe(second);
  });

  it("keeps a font-size and a colour that share the text- prefix", () => {
    expect(cn("text-q-price", "text-q-pink")).toBe("text-q-price text-q-pink");
  });

  it("lets a caller override the plan card's radius", () => {
    expect(cn("rounded-q-500 bg-q-ground", "rounded-q-800")).toBe(
      "bg-q-ground rounded-q-800",
    );
  });
});

describe("no token name is registered in two Tailwind namespaces", () => {
  /*
   * This caught a live bug. `--color-q-plan` (the card ground) and
   * `--text-q-plan` (the plan-name type step) were both declared, so
   * `text-q-plan` resolved to the *colour* — the plan name rendered at the
   * inherited size in near-black on a near-black card, and the card lost 5px
   * of height. No build error, no warning, and invisible in a diff.
   *
   * `--color-*` and `--text-*` are the only pair that can collide: they are
   * the two namespaces that both answer to a `text-` utility.
   */
  const names = (prefix: string) =>
    new Set(
      [...globals.matchAll(new RegExp(`--${prefix}-(q-[\\w-]+?):`, "g"))].map(
        (match) => match[1],
      ),
    );

  it("keeps --color-q-* and --text-q-* disjoint", () => {
    const colours = names("color");
    const sizes = [...names("text")].filter(
      // Tailwind's own per-step modifiers are not separate tokens.
      (name) => !/-(line-height|letter-spacing|font-weight)$/.test(name),
    );
    expect(sizes.filter((name) => colours.has(name))).toEqual([]);
  });
});

describe("pricing CSS that cannot be a utility", () => {
  it.each([
    ".q-hairline-plan",
    ".q-promo-texture",
    ".q-plan-basic",
    ".q-plan-pro",
    ".q-plan-max",
    ".q-cta-lime",
    ".q-cta-pink",
    ".q-cta-blue",
    ".q-badge-best",
  ])("ships %s", (selector) => {
    expect(tokens).toContain(selector);
  });

  it("masks the plan hairline to its 1px edge", () => {
    // Without the exclude mask the gradient fills the whole card instead of
    // its border, which reads as a washed-out panel rather than a lit edge.
    const block = tokens.slice(tokens.indexOf(".q-hairline-plan"));
    expect(block).toContain("content-box exclude");
    expect(block).toContain("-webkit-mask-composite: xor");
  });

  it("gives the swap stage both perspective and preserve-3d", () => {
    // rotateY without a perspective ancestor flattens to a skew; without
    // preserve-3d the translate3d depth is ignored. Both or neither.
    expect(tokens).toContain("perspective: 72rem");
    expect(tokens).toContain("transform-style: preserve-3d");
  });

  it("opts every pricing animation out of reduced motion", () => {
    const reduced = tokens.slice(tokens.lastIndexOf("prefers-reduced-motion"));
    for (const cls of [
      ".q-soft-enter",
      ".q-shell-enter",
      ".q-chip-enter",
      ".q-swap-enter",
      ".q-swap-exit",
    ]) {
      expect(reduced).toContain(cls);
    }
  });
});
