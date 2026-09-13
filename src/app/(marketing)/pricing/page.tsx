import { PricingPlans } from "@/components/marketing/pricing-plans";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing · Higgsfield",
  description: "Every plan runs on the full model catalogue.",
};

export default function PricingPage() {
  return <PricingPlans />;
}
