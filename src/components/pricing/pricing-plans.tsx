"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import {
  type Audience,
  AudienceTabs,
} from "@/components/pricing/audience-tabs";
import { BillingSwitch } from "@/components/pricing/billing-switch";
import { BusinessCard } from "@/components/pricing/business-card";
import { FaqList } from "@/components/pricing/faq-list";
import { PlanCard } from "@/components/pricing/plan-card";
import { PlanCta } from "@/components/pricing/plan-cta";
import { FAQ } from "@/config/pricing-faq.constants";
import {
  type BillingPeriod,
  BUSINESS_PLANS,
  PLANS,
  PRICING_COPY,
} from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

const PANEL_ID = "pricing-plans";

/*
 * The plan section: heading, the two controls, the grid, and the small print.
 *
 * Billing period lives here because three cards and (later) the comparison
 * table all read it. Credit tier does not — that is per-card, so it stays in
 * PlanCard and moving one slider leaves the others alone.
 */
export function PricingPlans() {
  const [audience, setAudience] = useState<Audience>("individual");
  const [annual, setAnnual] = useState(true);
  const period: BillingPeriod = annual ? "annual" : "monthly";

  return (
    <section className="flex w-full flex-col items-center">
      {/*
       * px-4 below xl, flush at xl. Above 1280 the 1064px column is
       * narrower than the container anyway, so the gutter would only
       * eat into the cards.
       */}
      <div className="flex w-full max-w-[var(--q-pricing-column)] flex-col gap-10 px-4 pt-6 xl:px-0">
        <header className="flex flex-col gap-3">
          <h1 className="text-q-title text-white">{PRICING_COPY.title}</h1>
          <p className="text-q-body-sm font-medium text-q-soft">
            {PRICING_COPY.subtitle}
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <AudienceTabs
              value={audience}
              onChange={setAudience}
              panelId={PANEL_ID}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector("#find-best-plan")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center gap-1 border-q-default text-q-body",
                  "rounded-q-250 border px-3 py-2 text-xs leading-4 font-medium",
                  "hover:bg-q-w-05 active:opacity-[0.88]",
                  "transition-[background-color,border-color] duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-focus",
                )}
              >
                <Icon name="shrink" size={16} />
                Not sure which plan?
              </button>

              <BillingSwitch annual={annual} onChange={setAnnual} />
            </div>
          </div>

          <div
            id={PANEL_ID}
            role="tabpanel"
            aria-labelledby={`${PANEL_ID}-tab-${audience}`}
            className="flex flex-col gap-5"
          >
            {audience === "individual" ? (
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
                {PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} period={period} />
                ))}
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
                {BUSINESS_PLANS.map((plan) => (
                  <BusinessCard key={plan.id} plan={plan} period={period} />
                ))}
              </div>
            )}
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {PRICING_COPY.helpLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs leading-[18px] text-q-soft transition-colors hover:text-q-body"
              >
                {link.label}
                <Icon name="arrow-up-right" size={12} />
              </a>
            ))}
          </nav>

          <p className="flex flex-col gap-1 px-2 text-center text-xs leading-[18px] whitespace-pre-line text-q-soft">
            {PRICING_COPY.disclaimer}
          </p>
        </div>

        {/*
         * The FAQ swaps with the audience tab rather than staying put — eight
         * consumer questions against thirteen procurement ones. It lives here,
         * under the same state, for that reason.
         */}
        <section className="flex flex-col items-center gap-8 pt-15 pb-10">
          <h2 className="text-center text-4xl leading-11 font-bold text-white">
            Frequently Asked Questions
          </h2>
          <FaqList items={FAQ[audience]} />
        </section>

        <div className="hidden items-center justify-center gap-4 sm:flex">
          <p className="text-q-body-sm font-medium text-white">
            Are you ready?
          </p>
          <PlanCta
            tone="lime"
            className="w-auto px-2.5"
            onClick={() =>
              document
                .querySelector("#pricing-plans")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            Choose your plan
          </PlanCta>
        </div>
      </div>
    </section>
  );
}
