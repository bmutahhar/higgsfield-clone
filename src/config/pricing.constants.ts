/*
 * Pricing, as measured on https://higgsfield.ai/pricing by driving every
 * slider stop against both billing modes.
 * See docs/superpowers/specs/2026-09-13-pricing-page-design.md §13.
 *
 * Two rules here are not guessable from looking at one card:
 *
 *   1. The discount percentage is per *tier*, not per plan. MAX reads
 *      25% / 27% / 30% as its slider rises.
 *   2. Monthly is not always undiscounted. MAX tiers 2 and 3 carry an intro
 *      price in monthly mode and say "Billed monthly, renews at $158".
 *      Pro never does.
 *
 * Everything a card renders comes from here. A component that hard-codes a
 * price, a saving or a feature string is a bug.
 */

export type BillingPeriod = "monthly" | "annual";

/*
 * Four badge tones, measured — not two. Getting these wrong is subtle and
 * everywhere: "7-day unlimited" is a *solid lime chip with dark ink*, while
 * "Full access" is lime ink on a 14% lime wash, and the resolution chips
 * ("2K", "4K", "1080p") sit a full step brighter than the refusals.
 */
export type BadgeTone =
  | "unlimited" // solid lime, dark ink — the headline grant
  | "spec" // white/20, white ink — a resolution or quality figure
  | "muted" // white/10, white/50 ink — "No access", "No unlimited"
  | "access"; // lime/14 wash, lime ink — "Full access"

export interface RowBadge {
  label: string;
  tone: BadgeTone;
}

/** Feature-row badges are the skewed chips, not the square row badges. */
export type FeatureBadgeTone = "pink" | "lime";

/** One row inside the "unlimited & free gens" or Seedance panel. */
export interface ModelRow {
  name: string;
  badges: RowBadge[];
  /** false dims the row: the plan does not include this model. */
  included: boolean;
}

/** One row of the flat feature list at the foot of a card. */
export interface FeatureRow {
  label: string;
  /**
   * `on`   — included, white ink
   * `off`  — not on this plan, 30% ink, cross glyph
   * `info` — the single pale-blue row ("Access to Supercomputer")
   */
  state: "on" | "off" | "info";
  badge?: { label: string; tone: FeatureBadgeTone };
  /** Rows that open an explainer are buttons, not spans, on the live site. */
  interactive?: boolean;
}

export interface CreditTier {
  credits: number;
  /** List price per month when billed monthly. */
  monthly: number;
  /** Intro price in monthly mode, where one exists (MAX tiers 2 and 3). */
  monthlyIntro?: number;
  /** Badge percentage shown beside the plan name in monthly mode. */
  monthlyDiscount?: number;
  /** Price per month when billed annually. */
  annual: number;
  /** Badge percentage shown in annual mode. */
  annualDiscount?: number;
  /** Dollars saved across a year versus paying monthly. */
  annualSaving?: number;
  /** "= N Nano Banana Pro Generations" */
  imageGens: number;
  /** "~ N <videoModel> videos" */
  videoGens: number;
}

export interface Plan {
  id: "basic" | "pro" | "max";
  name: string;
  tagline: string;
  /** Drives the frame gradient and the CTA fill. */
  tone: "basic" | "pro" | "max";
  ctaLabel: string;
  /** MAX alone carries the blue "Best value" chip. */
  bestValue?: boolean;
  /** Names the second derived line under the credit count. */
  videoModel: string;
  tiers: CreditTier[];
  /** Copy under the CTA in annual mode when there is nothing to save. */
  noSavingLabel?: string;
  unlimited: Record<BillingPeriod, ModelRow[]>;
  /** PRO/MAX link out to the full list; BASIC has no footer row. */
  unlimitedFooter?: string;
  seedance: {
    title: string;
    subtitle: string;
    tone: "locked" | "included";
    rows: ModelRow[];
  };
  features: Record<BillingPeriod, FeatureRow[]>;
}

const unlimited = (label: string): RowBadge => ({ label, tone: "unlimited" });
const spec = (label: string): RowBadge => ({ label, tone: "spec" });
const muted = (label: string): RowBadge => ({ label, tone: "muted" });
const access = (label: string): RowBadge => ({ label, tone: "access" });
const chip = (label: string, tone: FeatureBadgeTone = "lime") => ({
  label,
  tone,
});

/* The four feature rows every plan shares, in order. */
const SHARED_TAIL: FeatureRow[] = [
  { label: "Early access to advanced AI features", state: "on" },
  { label: "Access to unlimited marketplace", state: "on" },
  { label: "Lowest cost per credit", state: "on" },
];

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For first-time AI creators",
    tone: "basic",
    ctaLabel: "Get Basic",
    videoModel: "Seedance 2.0 Fast",
    noSavingLabel: "No difference compared to monthly",
    tiers: [
      {
        credits: 120,
        monthly: 9,
        annual: 9,
        imageGens: 60,
        videoGens: 7,
      },
    ],
    unlimited: {
      annual: [
        { name: "Nano Banana Pro", badges: [], included: false },
        { name: "Nano Banana 2", badges: [], included: false },
        { name: "Kling 3.0", badges: [], included: false },
        { name: "No other unlimited models", badges: [], included: false },
      ],
      monthly: [
        { name: "Nano Banana Pro", badges: [], included: false },
        { name: "Nano Banana 2", badges: [], included: false },
        { name: "No other unlimited models", badges: [], included: false },
      ],
    },
    seedance: {
      title: "No access to Seedance 2.5",
      subtitle: "Available from Pro plan",
      tone: "locked",
      rows: [
        {
          name: "Seedance 2.5",
          badges: [muted("No access")],
          included: false,
        },
        {
          name: "Seedance 2.0",
          badges: [muted("No access")],
          included: false,
        },
      ],
    },
    features: {
      annual: [
        {
          label: "Parallel generations: up to 2 Videos, 2 Images",
          state: "on",
          interactive: true,
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to Seedance 2.0 Fast & 2.0 Mini", state: "on" },
        {
          label: "Access to selected models & features",
          state: "on",
          interactive: true,
        },
        { label: "Early access to advanced AI features", state: "off" },
        { label: "Access to unlimited marketplace", state: "off" },
        { label: "Lowest cost per credit", state: "off" },
      ],
      monthly: [
        {
          label: "Parallel generations: up to 2 Videos, 2 Images",
          state: "on",
          interactive: true,
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to Seedance 2.0 Fast & 2.0 Mini", state: "on" },
        {
          label: "Access to selected models & features",
          state: "on",
          interactive: true,
        },
        { label: "Early access to advanced AI features", state: "off" },
        { label: "Access to unlimited marketplace", state: "off" },
        { label: "Lowest cost per credit", state: "off" },
      ],
    },
  },

  {
    id: "pro",
    name: "Pro",
    tagline: "For everyday AI creation",
    tone: "pro",
    ctaLabel: "Get Pro",
    videoModel: "Seedance 2.0",
    tiers: [
      {
        credits: 600,
        monthly: 29,
        annual: 23,
        annualDiscount: 21,
        annualSaving: 72,
        imageGens: 300,
        videoGens: 27,
      },
      {
        credits: 900,
        monthly: 43,
        annual: 34,
        annualDiscount: 21,
        annualSaving: 108,
        imageGens: 450,
        videoGens: 40,
      },
    ],
    unlimitedFooter: "7 unlimited & free generation models",
    unlimited: {
      annual: [
        {
          name: "Nano Banana Pro",
          badges: [muted("No unlimited")],
          included: false,
        },
        {
          name: "Nano Banana 2",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Kling 3.0",
          badges: [unlimited("7-day unlimited")],
          included: true,
        },
      ],
      monthly: [
        {
          name: "Nano Banana Pro",
          badges: [muted("No unlimited")],
          included: false,
        },
        {
          name: "Nano Banana 2",
          badges: [muted("No unlimited")],
          included: false,
        },
      ],
    },
    seedance: {
      title: "Access to Seedance models",
      subtitle: "Full line-up included",
      tone: "included",
      rows: [
        {
          name: "Seedance 2.5",
          badges: [spec("1080p"), access("Full access")],
          included: true,
        },
        {
          name: "Seedance 2.0",
          badges: [spec("4K"), access("Full access")],
          included: true,
        },
      ],
    },
    features: {
      annual: [
        {
          label: "Unlimited paid parallel generations",
          state: "on",
          badge: chip("New", "pink"),
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to all Seedance models", state: "on" },
        {
          label: "Access to all models & features",
          state: "on",
          interactive: true,
        },
        ...SHARED_TAIL,
      ],
      monthly: [
        {
          label: "Parallel generations: up to 3 Videos, 4 Images",
          state: "on",
          interactive: true,
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to all Seedance models", state: "on" },
        {
          label: "Access to all models & features",
          state: "on",
          interactive: true,
        },
        ...SHARED_TAIL,
      ],
    },
  },

  {
    id: "max",
    name: "Max",
    tagline: "For ambitious AI projects",
    tone: "max",
    ctaLabel: "Get Max",
    bestValue: true,
    videoModel: "Seedance 2.0",
    tiers: [
      {
        credits: 1800,
        monthly: 79,
        annual: 59,
        annualDiscount: 25,
        annualSaving: 240,
        imageGens: 900,
        videoGens: 80,
      },
      {
        credits: 3600,
        monthly: 158,
        monthlyIntro: 139,
        monthlyDiscount: 12,
        annual: 115,
        annualDiscount: 27,
        annualSaving: 516,
        imageGens: 1800,
        videoGens: 160,
      },
      {
        credits: 5400,
        monthly: 237,
        monthlyIntro: 199,
        monthlyDiscount: 16,
        annual: 165,
        annualDiscount: 30,
        annualSaving: 864,
        imageGens: 2700,
        videoGens: 240,
      },
    ],
    unlimitedFooter: "7 unlimited & free generation models",
    unlimited: {
      annual: [
        {
          name: "Nano Banana Pro",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Nano Banana 2",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Kling 3.0",
          badges: [unlimited("7-day unlimited")],
          included: true,
        },
      ],
      monthly: [
        {
          name: "Nano Banana Pro",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Nano Banana 2",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
      ],
    },
    seedance: {
      title: "Access to Seedance models",
      subtitle: "Full line-up included",
      tone: "included",
      rows: [
        {
          name: "Seedance 2.5",
          badges: [spec("1080p"), access("Full access")],
          included: true,
        },
        {
          name: "Seedance 2.0",
          badges: [spec("4K"), access("Full access")],
          included: true,
        },
      ],
    },
    features: {
      annual: [
        {
          label: "Unlimited paid parallel generations",
          state: "on",
          badge: chip("New", "pink"),
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to all Seedance models", state: "on" },
        {
          label: "Access to all models & features",
          state: "on",
          interactive: true,
        },
        { label: "Early access to advanced AI features", state: "on" },
        { label: "Access to unlimited marketplace", state: "on" },
        {
          label: "Lowest cost per credit",
          state: "on",
          badge: chip("60% CHEAPER"),
        },
      ],
      monthly: [
        {
          label: "Unlimited paid parallel generations",
          state: "on",
          badge: chip("New", "pink"),
        },
        { label: "Access to Supercomputer", state: "info" },
        { label: "Access to all Seedance models", state: "on" },
        {
          label: "Access to all models & features",
          state: "on",
          interactive: true,
        },
        { label: "Early access to advanced AI features", state: "on" },
        { label: "Access to unlimited marketplace", state: "on" },
        {
          label: "Lowest cost per credit",
          state: "on",
          badge: chip("50% CHEAPER"),
        },
      ],
    },
  },
];

/* ---------------------------------------------------------------- Business */

/*
 * The business cards are not a restyle of the individual ones. They swap the
 * credit slider for a seat stepper, carry three extra sections (admin,
 * security, unlimited models), and re-colour: Team's discount badge is lime
 * with a grey strike-through, Scale's is pink with a pink strike. Their
 * hairline runs 225deg rather than straight down.
 */
export interface BusinessSection {
  title: string;
  rows: string[];
}

export interface BusinessPlan {
  id: "team" | "scale" | "enterprise";
  name: string;
  tagline: string;
  tone: "team" | "scale" | "enterprise";
  ctaLabel: string;
  /** Enterprise says "Contact sales" and shows a partner note under it. */
  ctaNote?: string;
  bestValue?: boolean;
  discount?: { percent: number; tone: "lime" | "pink" };
  /** Enterprise has no stepper and no arithmetic. */
  seats?: { min: number; max: number; default: number; creditsPerSeat: number };
  pricePerSeat?: { monthly: number; annual: number };
  annualSaving?: number;
  /** "5,000 credits in total/mo" vs "12,500 credits/mo" — the copy differs. */
  creditsLabel: (credits: number) => string;
  /** Enterprise replaces the whole credits block with fixed copy. */
  creditsFixed?: { headline: string; rows: string[] };
  membersLabel: string;
  features: string[];
  unlimited: { title: string; rows: ModelRow[] };
  sections: BusinessSection[];
}

/* Every business plan shares these five. */
const BUSINESS_FEATURES = [
  "Access to all features & models",
  "Shared workspace & credit pool for your team",
  "Early access to advanced AI features",
  "Access to Seedance 2.5",
  "Access to Supercomputer",
];

const SECURITY: BusinessSection = {
  title: "Security & Compliance",
  rows: [
    "Indemnification",
    "No training on your data",
    "SOC 2 security (coming soon)",
    "Personal AI Educator",
  ],
};

export const BUSINESS_PLANS: BusinessPlan[] = [
  {
    id: "team",
    name: "Team",
    tagline: "For agencies and small teams to create faster",
    tone: "team",
    ctaLabel: "Get Team Annual",
    discount: { percent: 18, tone: "lime" },
    seats: { min: 2, max: 9, default: 5, creditsPerSeat: 1000 },
    pricePerSeat: { monthly: 79, annual: 65 },
    annualSaving: 168,
    creditsLabel: (credits) => `${formatCredits(credits)} credits in total/mo`,
    membersLabel: "2 to 9 members in one shared workspace",
    features: BUSINESS_FEATURES,
    unlimited: {
      title: "Unlimited models",
      rows: [
        {
          name: "Nano Banana Pro",
          badges: [muted("No unlimited")],
          included: false,
        },
        {
          name: "Seedream 5.0 Pro",
          badges: [muted("No unlimited")],
          included: false,
        },
        { name: "Kling 3.0", badges: [muted("No unlimited")], included: false },
      ],
    },
    sections: [
      {
        title: "Admin & Control",
        rows: [
          "Basic analytics & priority support",
          "Admin spend control",
          "Priority queue",
          "SSO",
          "Delegated top-up access",
        ],
      },
      SECURITY,
    ],
  },

  {
    id: "scale",
    name: "Scale",
    tagline: "Designed for growing creative teams",
    tone: "scale",
    ctaLabel: "Get Scale Annual",
    bestValue: true,
    discount: { percent: 30, tone: "pink" },
    seats: { min: 5, max: 15, default: 5, creditsPerSeat: 2500 },
    pricePerSeat: { monthly: 215, annual: 150 },
    annualSaving: 228,
    creditsLabel: (credits) => `${formatCredits(credits)} credits/mo`,
    membersLabel: "5 to 15 members in one shared workspace",
    features: BUSINESS_FEATURES,
    unlimited: {
      title: "Unlimited models",
      rows: [
        {
          name: "Nano Banana Pro",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Seedream 5.0 Pro",
          badges: [spec("2K"), unlimited("7-day unlimited")],
          included: true,
        },
        {
          name: "Kling 3.0",
          badges: [unlimited("7-day unlimited")],
          included: true,
        },
      ],
    },
    sections: [
      {
        title: "Admin & Control",
        rows: [
          "Detailed analytics & priority support",
          "Admin spend control",
          "Priority queue for faster task processing",
          "Basic SSO",
          "Delegated top-up access",
        ],
      },
      SECURITY,
    ],
  },

  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations needing personalisation & security",
    tone: "enterprise",
    ctaLabel: "Contact sales",
    ctaNote: "Best offers for Higgsfield\u2019s partners",
    creditsLabel: () => "Custom credits per seat/mo",
    creditsFixed: {
      headline: "Custom credits per seat/mo",
      rows: [
        "= Unlimited seats",
        "= Custom model access",
        "= Volume rollover credits",
      ],
    },
    membersLabel: "Unlimited members & Dedicated capacity (SLA)",
    features: BUSINESS_FEATURES,
    unlimited: {
      title: "Unlimited resources",
      rows: [
        {
          name: "Volume discounts per model",
          badges: [access("Included")],
          included: true,
        },
        {
          name: "Custom credits per seat",
          badges: [access("Included")],
          included: true,
        },
        {
          name: "Unlimited number of seats",
          badges: [access("Included")],
          included: true,
        },
        {
          name: "Custom capacity & SLA",
          badges: [access("Included")],
          included: true,
        },
      ],
    },
    sections: [
      {
        title: "Admin & Control",
        rows: [
          "Detailed analytics & priority support",
          "Admin spend control",
          "Priority queue for faster task processing",
          "Custom SSO",
          "Delegated top-up access",
        ],
      },
      SECURITY,
    ],
  },
];

/**
 * The two derived lines under a business plan's credit total. Both fall out of
 * the total, not the seat count: an image costs 2 credits and a Kling 3.0
 * video about 6, which is what reproduces the live "2,500 images / 833 videos"
 * at five Team seats.
 */
export function businessDerived(credits: number) {
  return {
    images: Math.round(credits / 2),
    videos: Math.floor(credits / 6),
  };
}

/* --------------------------------------------------------------- Page copy */

export const PRICING_COPY = {
  title: "Upgrade your plan",
  subtitle:
    "Lock better prices with upgrade or scale your creativity maximizing your current plan",
  helpLinks: [
    {
      label: "How do Higgsfield plans work?",
      href: "/creator-hub/help-center/plans-and-subscriptions/how-do-higgsfield-plans-work",
    },
    {
      label: "What are Unlimited models?",
      href: "/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them",
    },
  ],
  disclaimer:
    "Unlimited models and Free Generations on plans are accessible only via higgsfield.ai and are not accessible on MCP/CLI, Canvas or Supercomputer.\nPrices exclude VAT and local taxes, calculated at checkout. Unlimited usage may be subject to dynamic speed adjustment.",
} as const;

/* -------------------------------------------------------------- Formatting */

/**
 * Thousands separators, matching the live site: credit counts read "1,800"
 * while generation counts under them read "1800". Only the former is grouped.
 */
export const formatCredits = (value: number) => value.toLocaleString("en-US");

/** The tier a plan shows when the page first paints. */
export const defaultTierIndex = 0;

/**
 * The struck price, where the card shows one. Annual always strikes the
 * monthly list price; monthly only strikes when there is an intro price.
 */
export function strikePrice(
  tier: CreditTier,
  period: BillingPeriod,
): number | null {
  if (period === "annual")
    return tier.annual < tier.monthly ? tier.monthly : null;
  return tier.monthlyIntro ? tier.monthly : null;
}

/** The price actually charged. */
export function currentPrice(tier: CreditTier, period: BillingPeriod): number {
  if (period === "annual") return tier.annual;
  return tier.monthlyIntro ?? tier.monthly;
}

/** The badge percentage beside the plan name, if any. */
export function discountFor(
  tier: CreditTier,
  period: BillingPeriod,
): number | undefined {
  return period === "annual" ? tier.annualDiscount : tier.monthlyDiscount;
}

/** The cadence line under the price. */
export function cadenceFor(tier: CreditTier, period: BillingPeriod): string {
  if (period === "annual") return "per month, billed annually";
  if (tier.monthlyIntro) return `Billed monthly, renews at $${tier.monthly}`;
  return "Billed monthly";
}
