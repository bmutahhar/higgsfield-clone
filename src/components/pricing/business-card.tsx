"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import { ModelRow } from "@/components/pricing/model-row";
import { PlanCta } from "@/components/pricing/plan-cta";
import { SeatStepper } from "@/components/pricing/seat-stepper";
import { useAnimatedNumber } from "@/components/pricing/use-animated-number";
import {
  type BillingPeriod,
  businessDerived,
  type BusinessPlan,
  formatCredits,
} from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

const GROUND: Record<BusinessPlan["tone"], string> = {
  team: "q-plan-team",
  scale: "q-plan-scale",
  enterprise: "q-plan-enterprise",
};

const CTA_TONE = {
  team: "white",
  scale: "blue",
  enterprise: "white",
} as const;

interface BusinessCardProps {
  plan: BusinessPlan;
  period: BillingPeriod;
  className?: string;
}

export function BusinessCard({ plan, period, className }: BusinessCardProps) {
  const [seats, setSeats] = useState(plan.seats?.default ?? 0);
  const credits = plan.seats ? seats * plan.seats.creditsPerSeat : 0;
  const shownCredits = useAnimatedNumber(credits);
  const derived = businessDerived(credits);
  const annual = period === "annual";
  const isEnterprise = plan.id === "enterprise";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-q-400 px-0.5 pb-0.5",
        /*
         * Enterprise inverts: a white shell with the dark card inset inside
         * it, and the "Experts' choice" label printed on the shell itself.
         * It is the only light surface on the page.
         */
        isEnterprise &&
          "overflow-hidden border border-black/6 bg-white shadow-[0_8px_24px_0_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {isEnterprise ? (
        <p className="flex items-center justify-center gap-1 py-1.5 text-xs leading-4 font-semibold text-[#1a1a1a]">
          <Icon name="sparkles" size={12} />
          Experts&rsquo; choice
        </p>
      ) : null}

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          isEnterprise ? "rounded-q-400" : "rounded-q-500",
          GROUND[plan.tone],
        )}
      >
        <div
          aria-hidden
          className="q-hairline-plan-diag pointer-events-none absolute inset-0 rounded-[inherit]"
        />

        <div className="relative flex h-full flex-col">
          {/* ------------------------------------------------------ header */}
          <div className="flex flex-col gap-3 px-4 pt-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-q-display text-q-plan text-white uppercase">
                  {plan.name}
                </span>
                {plan.discount ? (
                  <DiscountBadge tone={plan.discount.tone}>
                    {plan.discount.percent}% OFF
                  </DiscountBadge>
                ) : null}
                {plan.bestValue ? (
                  <DiscountBadge tone="best">Best value</DiscountBadge>
                ) : null}
              </div>
              <p className="text-q-caption-l text-q-soft">{plan.tagline}</p>
            </div>

            {/* -------------------------------------------- credits block */}
            <div className="flex flex-col gap-1.5 rounded-q-300 bg-q-w-05 p-3">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" size={16} className="text-white" />
                <span className="text-sm leading-5 font-semibold text-white tabular-nums">
                  {plan.creditsFixed
                    ? plan.creditsFixed.headline
                    : plan.creditsLabel(shownCredits)}
                </span>
              </div>
              <div className="flex flex-col gap-1 pl-7">
                {plan.creditsFixed ? (
                  plan.creditsFixed.rows.map((row) => (
                    <span
                      key={row}
                      className="text-xs leading-4 font-medium text-q-soft"
                    >
                      {row}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="text-xs leading-4 font-medium text-q-soft">
                      = {formatCredits(plan.seats!.creditsPerSeat)} credits per
                      seat/mo
                    </span>
                    <span className="text-xs leading-4 font-medium text-q-soft">
                      = {formatCredits(derived.images)} Nano Banana Pro images
                    </span>
                    <span className="text-xs leading-4 font-medium text-q-soft">
                      ~ {formatCredits(derived.videos)} Kling 3.0 videos
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------- price */}
            {plan.pricePerSeat ? (
              <div className="flex items-end gap-1">
                {annual ? (
                  <span
                    className={cn(
                      "font-q-display text-q-plan uppercase",
                      /* Team strikes in grey, Scale in pink. Not a typo. */
                      plan.tone === "team" ? "text-q-dim" : "text-q-pink",
                    )}
                  >
                    ${plan.pricePerSeat.monthly}
                  </span>
                ) : null}
                <span className="font-q-display text-q-price text-white uppercase">
                  $
                  {annual
                    ? plan.pricePerSeat.annual
                    : plan.pricePerSeat.monthly}
                </span>
                <span className="pb-1 text-xs leading-4 text-q-soft">
                  per seat/mo {annual ? "· annual" : "· monthly"}
                </span>
              </div>
            ) : (
              <span className="font-q-display text-q-price text-white uppercase">
                Let&rsquo;s talk
              </span>
            )}
          </div>

          {/* -------------------------------------------------------- body */}
          <div className="flex flex-1 flex-col gap-4 p-3">
            <div className="flex flex-col rounded-q-300 bg-q-w-05">
              <PlanCta tone={CTA_TONE[plan.tone]}>{plan.ctaLabel}</PlanCta>
              {/*
               * Enterprise prints a partner note here; the two priced plans
               * print the annual saving. The row keeps its height either way,
               * so the three cards' CTAs stay on one line.
               */}
              <div className="flex items-center justify-center gap-1 p-2 text-xs leading-4 text-q-soft">
                {plan.ctaNote}
                {!plan.ctaNote && annual && plan.annualSaving ? (
                  <>
                    <span className="font-semibold text-white">
                      Save ${plan.annualSaving}
                    </span>
                    compared to monthly
                  </>
                ) : null}
                {!plan.ctaNote && !(annual && plan.annualSaving) ? (
                  <span aria-hidden className="opacity-0">
                    &mdash;
                  </span>
                ) : null}
              </div>
            </div>

            {plan.seats ? (
              <SeatStepper
                value={seats}
                min={plan.seats.min}
                max={plan.seats.max}
                onChange={setSeats}
              />
            ) : null}

            <div className="flex flex-col gap-3 pt-1">
              <ul className="flex flex-col gap-2 p-1">
                <BusinessRow label={plan.membersLabel} />
                {plan.features.map((feature) => (
                  <BusinessRow key={feature} label={feature} />
                ))}
              </ul>

              <div className="flex flex-col gap-1 rounded-q-300 bg-q-w-05 px-3 pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="infinity" size={16} className="text-q-brand" />
                    <span className="text-xs leading-4 font-semibold tracking-[0.02em] text-white uppercase">
                      {plan.unlimited.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs leading-4 text-q-soft transition-colors hover:text-q-body focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-q-focus"
                  >
                    Learn more
                  </button>
                </div>
                <div className="flex flex-col">
                  {plan.unlimited.rows.map((row, index) => (
                    <ModelRow
                      key={row.name}
                      row={row}
                      divided={index < plan.unlimited.rows.length - 1}
                    />
                  ))}
                </div>
              </div>

              {plan.sections.map((section) => (
                <ul key={section.title} className="flex flex-col gap-2 p-1">
                  <li className="text-xs leading-4 font-medium text-q-soft">
                    {section.title}
                  </li>
                  {section.rows.map((row) => (
                    <BusinessRow key={row} label={row} />
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-1">
      <Icon name="check" size={16} className="text-q-brand" />
      <span className="text-xs leading-4 text-white">{label}</span>
    </li>
  );
}
