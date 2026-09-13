import { CountdownBanner } from "@/components/pricing/countdown-banner";
import { PricingPlans } from "@/components/pricing/pricing-plans";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing plans — Higgsfield AI Video & Image Generator",
  description:
    "Lock better prices with upgrade or scale your creativity maximizing your current plan.",
};

/*
 * `--q-pricing-column` is the whole page's spine: the banner, the plan grid,
 * the configurator and the comparison table all centre on the same 1064px,
 * while the container itself grows to 1440. Set it once here rather than
 * repeating a max-width on five sections.
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-q-page">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-2 px-4 py-8">
        <CountdownBanner
          eyebrow="Extra discount"
          headlineAccent="Nano Banana Pro, Nano Banana 2 & Kling 3.0 Unlimited"
          headline="Sign up and get your additional discount"
          body="Get Nano Banana 2 & Pro Unlimited on Ultra plan for 7 days with Special 30% discount"
          cta="Sign up and get your discount"
        />
        <PricingPlans />
      </div>
    </div>
  );
}
