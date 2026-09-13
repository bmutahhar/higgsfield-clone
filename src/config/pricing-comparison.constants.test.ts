import { describe, expect, it } from "vitest";

import {
  COMPARISON,
  COMPARISON_PLANS,
  VISIBLE_ROWS,
} from "@/config/pricing-comparison.constants";

describe("comparison table data", () => {
  it("gives every row one value per plan column", () => {
    // The table is parsed from pipe-delimited text, so a missing or extra pipe
    // silently shifts a whole row's values one column left. This is the guard.
    for (const section of COMPARISON) {
      for (const row of section.rows) {
        expect(row.values, `${section.title} / ${row.label}`).toHaveLength(
          COMPARISON_PLANS.length,
        );
      }
    }
  });

  it("leaves no empty label or value", () => {
    for (const section of COMPARISON) {
      for (const row of section.rows) {
        expect(row.label.trim()).not.toBe("");
        for (const v of row.values) expect(v.trim()).not.toBe("");
      }
    }
  });

  it("never repeats a label inside a section", () => {
    // Labels are React keys; a duplicate silently drops a row.
    for (const section of COMPARISON) {
      const labels = section.rows.map((r) => r.label);
      expect(new Set(labels).size, section.title).toBe(labels.length);
    }
  });

  it("carries the six measured sections in order", () => {
    expect(COMPARISON.map((s) => s.title)).toEqual([
      "Video",
      "Image",
      "Lipsync Studio",
      "Character",
      "Credits & Usage",
      "Access & Features",
    ]);
  });

  it("puts Video and Image in the wide table and the rest in cards", () => {
    const table = COMPARISON.filter((s) => s.layout === "table");
    expect(table.map((s) => s.title)).toEqual(["Video", "Image"]);
    expect(COMPARISON.filter((s) => s.layout === "card")).toHaveLength(4);
  });

  it("collapses only the sections that have more than four rows", () => {
    // Measured on the live page: Character and Credits & Usage have exactly
    // two rows each and show no "View More".
    const collapsible = COMPARISON.filter(
      (s) => s.rows.length > VISIBLE_ROWS,
    ).map((s) => s.title);
    expect(collapsible).toEqual([
      "Video",
      "Image",
      "Lipsync Studio",
      "Access & Features",
    ]);
  });

  it("starts each section with its Concurrent Jobs or headline row", () => {
    for (const section of COMPARISON) {
      if (section.title === "Access & Features") continue;
      expect(section.rows[0].label, section.title).toMatch(
        /Concurrent Jobs|Credits/,
      );
    }
  });

  it("never lets Basic beat Max on a yes/no row", () => {
    const rank = (v: string) => (v === "YES" ? 1 : v === "NO" ? 0 : null);
    for (const section of COMPARISON) {
      for (const row of section.rows) {
        const [basic, , max] = row.values.map(rank);
        if (basic === null || max === null) continue;
        expect(basic <= max, `${section.title} / ${row.label}`).toBe(true);
      }
    }
  });

  it("holds the full catalogue, not a sample", () => {
    const total = COMPARISON.reduce((n, s) => n + s.rows.length, 0);
    expect(total).toBeGreaterThan(120);
  });
});
