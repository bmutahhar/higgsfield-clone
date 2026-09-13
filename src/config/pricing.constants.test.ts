import { describe, expect, it } from "vitest";

import {
  type BillingPeriod,
  BUSINESS_PLANS,
  cadenceFor,
  currentPrice,
  discountFor,
  PLANS,
  strikePrice,
} from "@/config/pricing.constants";

const plan = (id: string) => PLANS.find((p) => p.id === id)!;
const tier = (id: string, index: number) => plan(id).tiers[index];

describe("price selection", () => {
  /*
   * The whole matrix from the spec, row for row. If the live site moves, this
   * is the test that fails first — and it fails with the number that changed
   * rather than with a screenshot diff.
   */
  it.each<[string, number, BillingPeriod, number, number | null, string]>([
    // plan, tier, period, charged, struck, cadence
    ["basic", 0, "monthly", 9, null, "Billed monthly"],
    ["basic", 0, "annual", 9, null, "per month, billed annually"],
    ["pro", 0, "monthly", 29, null, "Billed monthly"],
    ["pro", 0, "annual", 23, 29, "per month, billed annually"],
    ["pro", 1, "monthly", 43, null, "Billed monthly"],
    ["pro", 1, "annual", 34, 43, "per month, billed annually"],
    ["max", 0, "monthly", 79, null, "Billed monthly"],
    ["max", 0, "annual", 59, 79, "per month, billed annually"],
    ["max", 1, "monthly", 139, 158, "Billed monthly, renews at $158"],
    ["max", 1, "annual", 115, 158, "per month, billed annually"],
    ["max", 2, "monthly", 199, 237, "Billed monthly, renews at $237"],
    ["max", 2, "annual", 165, 237, "per month, billed annually"],
  ])(
    "%s tier %i on %s charges $%i",
    (id, index, period, charged, struck, cadence) => {
      const t = tier(id, index);
      expect(currentPrice(t, period)).toBe(charged);
      expect(strikePrice(t, period)).toBe(struck);
      expect(cadenceFor(t, period)).toBe(cadence);
    },
  );

  it("never strikes Basic: its annual price equals its monthly one", () => {
    expect(strikePrice(tier("basic", 0), "annual")).toBeNull();
    expect(plan("basic").noSavingLabel).toBe(
      "No difference compared to monthly",
    );
  });
});

describe("discount badges", () => {
  it("varies the annual percentage per tier, not per plan", () => {
    // The easiest thing to get wrong: reading 25% off one MAX card and
    // hard-coding it for all three tiers.
    const percentages = plan("max").tiers.map((t) => discountFor(t, "annual"));
    expect(percentages).toEqual([25, 27, 30]);
  });

  it("keeps Pro's annual percentage flat across its two tiers", () => {
    expect(plan("pro").tiers.map((t) => discountFor(t, "annual"))).toEqual([
      21, 21,
    ]);
  });

  it("shows a monthly badge only where an intro price exists", () => {
    expect(plan("max").tiers.map((t) => discountFor(t, "monthly"))).toEqual([
      undefined,
      12,
      16,
    ]);
    expect(plan("pro").tiers.map((t) => discountFor(t, "monthly"))).toEqual([
      undefined,
      undefined,
    ]);
  });
});

describe("annual savings are internally consistent", () => {
  it.each(["pro", "max"])(
    "%s: saving equals twelve months of the difference",
    (id) => {
      for (const t of plan(id).tiers) {
        expect(t.annualSaving).toBe((t.monthly - t.annual) * 12);
      }
    },
  );
});

describe("content shape", () => {
  it("gives Basic a shorter unlimited list in monthly than in annual", () => {
    // Card height changes with the billing mode because of exactly this.
    const basic = plan("basic");
    expect(basic.unlimited.annual).toHaveLength(4);
    expect(basic.unlimited.monthly).toHaveLength(3);
  });

  it("upgrades Pro's parallel generations on the annual plan", () => {
    expect(plan("pro").features.annual[0].label).toBe(
      "Unlimited paid parallel generations",
    );
    expect(plan("pro").features.monthly[0].label).toBe(
      "Parallel generations: up to 3 Videos, 4 Images",
    );
  });

  it("swaps Max's cheaper-per-credit badge with the billing mode", () => {
    const last = (period: BillingPeriod) =>
      plan("max").features[period].at(-1)?.badge?.label;
    expect(last("annual")).toBe("60% CHEAPER");
    expect(last("monthly")).toBe("50% CHEAPER");
  });

  it("marks exactly one feature row per plan as info-coloured", () => {
    for (const p of PLANS) {
      for (const period of ["monthly", "annual"] as const) {
        const info = p.features[period].filter((f) => f.state === "info");
        expect(info).toHaveLength(1);
        expect(info[0].label).toBe("Access to Supercomputer");
      }
    }
  });

  it("gives only Max the Best value chip", () => {
    expect(PLANS.filter((p) => p.bestValue).map((p) => p.id)).toEqual(["max"]);
  });
});

describe("business plans", () => {
  it("prices seats at the measured rates", () => {
    const team = BUSINESS_PLANS.find((p) => p.id === "team")!;
    const scale = BUSINESS_PLANS.find((p) => p.id === "scale")!;
    expect(team.seats).toEqual({
      min: 2,
      max: 9,
      default: 5,
      creditsPerSeat: 1000,
    });
    expect(scale.seats).toEqual({
      min: 5,
      max: 15,
      default: 5,
      creditsPerSeat: 2500,
    });
    expect(team.pricePerSeat).toEqual({ monthly: 79, annual: 65 });
    expect(scale.pricePerSeat).toEqual({ monthly: 215, annual: 150 });
  });

  it("leaves Enterprise without a stepper or a price", () => {
    const enterprise = BUSINESS_PLANS.find((p) => p.id === "enterprise")!;
    expect(enterprise.seats).toBeUndefined();
    expect(enterprise.pricePerSeat).toBeUndefined();
    expect(enterprise.ctaLabel).toBe("Contact sales");
  });

  it("keeps every default seat count inside its own range", () => {
    for (const p of BUSINESS_PLANS) {
      if (!p.seats) continue;
      expect(p.seats.default).toBeGreaterThanOrEqual(p.seats.min);
      expect(p.seats.default).toBeLessThanOrEqual(p.seats.max);
    }
  });
});
