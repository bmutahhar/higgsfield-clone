import { describe, expect, it } from "vitest";

import { FAQ } from "@/config/pricing-faq.constants";
import {
  MOBILE_DEFAULT,
  MOBILE_INCLUDED,
  MOBILE_OPTIONS,
} from "@/config/pricing-mobile.constants";
import { PLANS } from "@/config/pricing.constants";

const option = (id: string) => MOBILE_OPTIONS.find((o) => o.id === id)!;
const plan = (id: string) => PLANS.find((p) => p.id === id)!;

describe("the mobile funnel derives from the desktop matrix", () => {
  /*
   * The live page A/B tests these numbers, so the only defensible source is
   * the plan matrix itself. If someone hard-codes a price into the mobile
   * options, the two surfaces start disagreeing and this fails.
   */
  it("prices Basic Monthly from the Basic plan", () => {
    expect(option("basic-monthly").price).toBe(plan("basic").tiers[0].monthly);
  });

  it("prices both Pro picks from the same Pro tier", () => {
    const tier = plan("pro").tiers[0];
    expect(option("pro-annual").price).toBe(tier.annual);
    expect(option("pro-annual").strike).toBe(tier.monthly);
    expect(option("pro-monthly").price).toBe(tier.monthly);
    expect(option("pro-annual").discount).toBe(tier.annualDiscount);
  });

  it("strikes a price only where there is a saving", () => {
    expect(option("pro-annual").strike).toBeDefined();
    expect(option("basic-monthly").strike).toBeUndefined();
    expect(option("pro-monthly").strike).toBeUndefined();
  });

  it("quotes credits and generations straight from the tier", () => {
    const tier = plan("pro").tiers[0];
    const rows = option("pro-annual").rows.map((r) => r.label);
    expect(rows[0]).toBe(`${tier.credits} credits/mo.`);
    expect(rows[1]).toBe(`${tier.imageGens} Nano Banana Pro gens/mo.`);
  });

  it("offers exactly three picks with Pro Annual pre-selected", () => {
    expect(MOBILE_OPTIONS).toHaveLength(3);
    expect(MOBILE_OPTIONS.some((o) => o.id === MOBILE_DEFAULT)).toBe(true);
    expect(MOBILE_DEFAULT).toBe("pro-annual");
  });

  it("gives at most one pick each ribbon tone", () => {
    const tones = MOBILE_OPTIONS.map((o) => o.ribbon?.tone).filter(Boolean);
    expect(new Set(tones).size).toBe(tones.length);
  });
});

describe("the mobile included table", () => {
  it("keeps Basic strictly no better than Pro on every row", () => {
    // A funnel steering to Pro must never show Basic winning a row.
    for (const r of MOBILE_INCLUDED) {
      if (typeof r.basic === "boolean" && typeof r.pro === "boolean") {
        expect(r.basic && !r.pro).toBe(false);
      }
    }
  });

  it("marks Nano Banana Pro unlimited as absent from both", () => {
    // Pro does not get it — only Max does. Easy row to get generous with.
    const row = MOBILE_INCLUDED.find((r) =>
      r.label.includes("Nano Banana Pro"),
    )!;
    expect(row.basic).toBe(false);
    expect(row.pro).toBe(false);
  });
});

describe("the FAQ is audience-specific", () => {
  it("serves a different list per tab", () => {
    expect(FAQ.individual).not.toHaveLength(FAQ.business.length);
    const overlap = FAQ.individual.filter((i) =>
      FAQ.business.some((b) => b.q === i.q),
    );
    expect(overlap).toEqual([]);
  });

  it("answers every question it asks", () => {
    for (const list of [FAQ.individual, FAQ.business]) {
      for (const item of list) {
        expect(item.q.length).toBeGreaterThan(0);
        expect(item.a.length).toBeGreaterThan(0);
      }
    }
  });
});
