import { type BillingPeriod, PLANS } from "@/config/pricing.constants";

/*
 * The < 768px surface offers three picks, not three plans: Basic Monthly,
 * Pro Annual and Pro Monthly. It is a checkout funnel, so it narrows the
 * choice rather than presenting the full matrix.
 *
 * The live page A/B tests the numbers — two loads minutes apart served
 * "$5 / 70 credits" and "$9 / 120 credits" for the same Basic option, and
 * shifted Pro between its 600 and 900 credit tiers. Freezing either variant
 * would bake one arm of someone else's experiment into our source. These
 * options therefore derive from the same PLANS matrix the desktop cards use,
 * so the two surfaces can never disagree with each other.
 */
export interface MobileOption {
  id: string;
  label: string;
  period: BillingPeriod;
  ribbon?: { text: string; tone: "lime" | "pink" };
  discount?: number;
  price: number;
  strike?: number;
  cadence: string;
  rows: { label: string; included: boolean }[];
  /** Revealed by "Learn more"; the label flips to "Hide". */
  extraRows: { label: string; included: boolean }[];
  ctaLabel: string;
}

const basic = PLANS[0];
const pro = PLANS[1];

const row = (label: string, included = true) => ({ label, included });

export const MOBILE_OPTIONS: MobileOption[] = [
  {
    id: "basic-monthly",
    label: "Basic Monthly",
    period: "monthly",
    ribbon: { text: "Most Popular", tone: "lime" },
    price: basic.tiers[0].monthly,
    cadence: `$${basic.tiers[0].monthly}, billed monthly`,
    rows: [
      row(`${basic.tiers[0].credits} credits/mo.`),
      row(`${basic.tiers[0].imageGens} Nano Banana Pro gens/mo.`),
      row("No unlimited models", false),
    ],
    extraRows: [
      row("Access to selected models only"),
      row("Up to 2 parallel generations"),
    ],
    ctaLabel: "Get Basic Plan",
  },
  {
    id: "pro-annual",
    label: "Pro Annual",
    period: "annual",
    ribbon: { text: "Best Value", tone: "pink" },
    discount: pro.tiers[0].annualDiscount,
    price: pro.tiers[0].annual,
    strike: pro.tiers[0].monthly,
    cadence: `$${pro.tiers[0].annual}/month, billed annually`,
    rows: [
      row(`${pro.tiers[0].credits} credits/mo.`),
      row(`${pro.tiers[0].imageGens} Nano Banana Pro gens/mo.`),
      row("7 Unlimited models"),
    ],
    extraRows: [
      row("Access to all models"),
      row("Up to 3 Videos, 4 Images"),
      row("Nano Banana 2. 7-day Unlimited"),
    ],
    ctaLabel: "Get Pro Plan",
  },
  {
    id: "pro-monthly",
    label: "Pro Monthly",
    period: "monthly",
    price: pro.tiers[0].monthly,
    cadence: `$${pro.tiers[0].monthly}, billed monthly`,
    rows: [
      row(`${pro.tiers[0].credits} credits/mo.`),
      row(`${pro.tiers[0].imageGens} Nano Banana Pro gens/mo.`),
      row("7 Unlimited models"),
    ],
    extraRows: [row("Access to all models"), row("Up to 3 Videos, 4 Images")],
    ctaLabel: "Get Pro Plan",
  },
];

/** Pro Annual is pre-selected, as on the live page. */
export const MOBILE_DEFAULT = "pro-annual";

/*
 * The "What's included" mini-table. Two columns only — Basic against Pro —
 * with the Pro column tinted, because the funnel is steering you to one of
 * them rather than presenting a neutral comparison.
 */
export type IncludedCell = string | boolean;

export const MOBILE_INCLUDED: {
  label: string;
  basic: IncludedCell;
  pro: IncludedCell;
}[] = [
  { label: "Video parallel generations", basic: "2", pro: "3" },
  { label: "Image parallel generations", basic: "2", pro: "4" },
  { label: "Soul 2.0 free generations", basic: false, pro: "5,000" },
  { label: "Seedance 2.5", basic: false, pro: true },
  { label: "Seedance 2.0", basic: false, pro: true },
  { label: "Access to unlimited marketplace", basic: false, pro: true },
  { label: "7-day unlimited Kling 3.0", basic: false, pro: true },
  { label: "7-day unlimited Nano Banana 2", basic: false, pro: true },
  { label: "7-day unlimited Nano Banana Pro", basic: false, pro: false },
  { label: "Lowest cost per credit", basic: false, pro: false },
];

export const MOBILE_COPY = {
  heroBadge: "21% OFF",
  heroLine: "Special",
  heroAccent: "Offer",
  trustTitle: "Highest Trustpilot.com rating.",
  trustSub: "Among all leading GenAI companies.",
  includedTitle: "What’s included",
  compareCta: "See full comparison",
  faqTitle: "Frequently Asked Questions",
} as const;
