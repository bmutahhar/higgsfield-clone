"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { CreditSlider } from "@/components/pricing/credit-slider";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import { FeatureList } from "@/components/pricing/feature-list";
import { PlanCta } from "@/components/pricing/plan-cta";
import { SeedancePanel } from "@/components/pricing/seedance-panel";
import { UnlimitedPanel } from "@/components/pricing/unlimited-panel";
import { useAnimatedNumber } from "@/components/pricing/use-animated-number";
import {
  type BillingPeriod,
  cadenceFor,
  currentPrice,
  discountFor,
  formatCredits,
  type Plan,
  strikePrice,
} from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/* The frame ground and the CTA fill are the only things the tone decides. */
const FRAME: Record<Plan["tone"], string> = {
  basic: "q-plan-basic",
  pro: "q-plan-pro",
  max: "q-plan-max shadow-q-plan",
};

const CTA_TONE = {
  basic: "white",
  pro: "lime",
  max: "pink",
} as const;

interface PlanCardProps {
  plan: Plan;
  period: BillingPeriod;
  className?: string;
}

export function PlanCard({ plan, period, className }: PlanCardProps) {
  /*
   * Tier is card-local: moving Pro's slider must not move Max's. The billing
   * period is the opposite — it is page state, passed in.
   */
  const [tierIndex, setTierIndex] = useState(0);
  const tier = plan.tiers[tierIndex];

  const credits = useAnimatedNumber(tier.credits);
  const struck = strikePrice(tier, period);
  const price = currentPrice(tier, period);
  const discount = discountFor(tier, period);
  const saving = period === "annual" ? tier.annualSaving : undefined;

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-q-500",
          FRAME[plan.tone],
        )}
      >
        {/* The gradient hairline. Not a border — see .q-hairline-plan. */}
        <div
          aria-hidden
          className="q-hairline-plan pointer-events-none absolute inset-0 rounded-[inherit]"
        />

        <div className="relative flex h-full flex-col">
          {/* ---------------------------------------------------- header */}
          <div className="flex flex-col gap-3 px-4 pt-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-q-display text-q-plan text-white uppercase">
                  {plan.name}
                </span>
                {discount ? (
                  <DiscountBadge>{discount}% OFF</DiscountBadge>
                ) : null}
                {plan.bestValue ? (
                  <DiscountBadge tone="best">Best value</DiscountBadge>
                ) : null}
              </div>
              <p className="text-q-caption-l text-q-idle-soft">
                {plan.tagline}
              </p>
            </div>

            {/* ---------------------------------------------- credits box */}
            <div className="flex h-34 flex-col justify-between rounded-q-300 bg-q-w-05 p-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Icon name="sparkles" size={16} className="text-white" />
                  <span className="h-5 text-sm leading-5 font-semibold text-white tabular-nums">
                    {formatCredits(credits)} credits/mo.
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-7">
                  <div className="text-xs leading-4 font-medium text-q-idle-soft">
                    = {tier.imageGens} Nano Banana Pro Generations
                  </div>
                  <div className="text-xs leading-4 font-medium text-q-idle-soft">
                    ~ {tier.videoGens} {plan.videoModel} videos
                  </div>
                </div>
              </div>

              {plan.tiers.length > 1 ? (
                <CreditSlider
                  stops={plan.tiers.map((t) => t.credits)}
                  value={tierIndex}
                  onChange={setTierIndex}
                  label={`${plan.name} credits per month`}
                />
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-q-200 border border-q-subtle px-2 py-2.5">
                  <Icon name="check" size={16} className="text-q-idle-soft" />
                  <span className="text-q-caption-l font-medium text-q-idle-soft">
                    Fixed amount of {formatCredits(tier.credits)} credits/mo
                  </span>
                </div>
              )}
            </div>

            {/* ------------------------------------------------ price row */}
            <div className="flex items-end gap-1">
              {struck ? (
                /*
                 * A drawn bar, not `line-through`: it is 2px, full-width, and
                 * rotated -8deg so it rakes across the number the same way
                 * every badge on this page is skewed. text-decoration can do
                 * none of those three.
                 */
                <span className="relative font-q-display text-q-plan text-q-pink uppercase">
                  ${struck}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-1/2 h-0.5 -rotate-8 bg-q-pink"
                  />
                </span>
              ) : null}
              <span className="font-q-display text-q-price text-white uppercase">
                ${price}
              </span>
              <span className="pb-0.5 text-q-caption-l text-q-idle-soft">
                {cadenceFor(tier, period)}
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------- body */}
          <div className="flex flex-1 flex-col gap-4 p-3">
            <div className="flex flex-col rounded-q-300 border border-q-subtle bg-q-w-05">
              <PlanCta tone={CTA_TONE[plan.tone]}>{plan.ctaLabel}</PlanCta>
              {/*
               * The savings strip is 12/16, not the 12/18 the tagline and
               * cadence use. The two are a pixel apart and this strip is what
               * makes an annual card taller than a monthly one.
               */}
              {period === "annual" && (saving || plan.noSavingLabel) ? (
                <div className="flex items-center justify-center gap-1 p-2 text-xs leading-4 text-q-idle-soft">
                  {saving ? (
                    <>
                      <span className="font-semibold text-white">
                        Save ${saving}
                      </span>
                      compared to monthly
                    </>
                  ) : (
                    plan.noSavingLabel
                  )}
                </div>
              ) : null}
            </div>

            <UnlimitedPanel
              rows={plan.unlimited[period]}
              footer={plan.unlimitedFooter}
              dimmed={plan.id === "basic"}
            />

            <SeedancePanel seedance={plan.seedance} />

            <FeatureList features={plan.features[period]} />
          </div>
        </div>
      </div>
    </div>
  );
}
