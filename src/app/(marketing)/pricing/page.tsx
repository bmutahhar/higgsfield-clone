import { CountdownBanner } from "@/components/pricing/countdown-banner";
import { PricingMobile } from "@/components/pricing/mobile/pricing-mobile";
import { PricingPlans } from "@/components/pricing/pricing-plans";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing plans — Higgsfield AI Video & Image Generator",
  description:
    "Lock better prices with upgrade or scale your creativity maximizing your current plan.",
};

/*
 * Two trees, one route.
 *
 * At exactly 768px the live site stops being responsive and starts being a
 * different page: below it, `.pricing-page` unmounts and a standalone offer
 * surface mounts in its place — no site chrome, its own close button, a
 * narrowed three-option funnel and a fixed CTA bar. Nothing about the desktop
 * layout reflows into it.
 *
 * We render both and let CSS choose, rather than branching on a media-query
 * hook. That costs duplicate markup but buys three things a hook cannot: the
 * server renders the right one, there is no first-paint flash of the wrong
 * tree, and it still works with JS disabled. The cost is that both trees exist
 * in the DOM at once, which is why the chrome-hiding rule in q-studio.css is
 * gated on width as well as on the mobile tree's own marker.
 *
 * `--q-pricing-column` is the desktop page's spine: banner, plan grid,
 * configurator and comparison table all centre on the same 1064px while the
 * container grows to 1440. Set once here rather than on five sections.
 */
export default function PricingPage() {
  return (
    <>
      <div className="md:hidden">
        <PricingMobile />
      </div>

      <div className="hidden min-h-screen bg-q-page md:block">
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
    </>
  );
}
