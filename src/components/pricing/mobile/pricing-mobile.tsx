"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { DiscountBadge } from "@/components/pricing/discount-badge";
import { FaqList } from "@/components/pricing/faq-list";
import { PlanOptionCard } from "@/components/pricing/mobile/plan-option-card";
import { PlanCta } from "@/components/pricing/plan-cta";
import { FAQ } from "@/config/pricing-faq.constants";
import {
  type IncludedCell,
  MOBILE_COPY,
  MOBILE_DEFAULT,
  MOBILE_INCLUDED,
  MOBILE_OPTIONS,
} from "@/config/pricing-mobile.constants";
import { PRICING_COPY } from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * The < 768px surface.
 *
 * This is not the desktop page reflowed — the live site unmounts one tree and
 * mounts a different one at exactly 768px. It is a standalone offer page: no
 * site header, no footer, its own close button, a fixed CTA bar, and a funnel
 * that narrows three plans and two billing periods down to three picks.
 *
 * `data-pricing-mobile` is what the chrome-hiding rule in q-studio.css keys
 * off. Both trees are in the DOM at once and CSS chooses between them, so the
 * marker alone is not enough — that rule is width-gated too.
 *
 * Layout is fluid with flat 12px gutters and no internal breakpoints: measured
 * identical at 375 and at 767, where the cards simply grow from 351 to 743.
 */
export function PricingMobile() {
  const [selected, setSelected] = useState(MOBILE_DEFAULT);
  const option =
    MOBILE_OPTIONS.find((o) => o.id === selected) ?? MOBILE_OPTIONS[0];

  return (
    <div
      data-pricing-mobile
      className="relative min-h-dvh overflow-x-clip bg-q-page"
    >
      <div className="flex w-full flex-col pb-28">
        {/* ------------------------------------------------------- top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-3 py-2">
          <button
            type="button"
            aria-label="Close"
            onClick={() => history.back()}
            className="flex size-8 items-center justify-center rounded-full bg-q-w-05 text-white backdrop-blur-md focus-visible:outline-2 focus-visible:outline-q-focus"
          >
            <Icon name="x" size={16} />
          </button>
          <span className="size-8" />
        </div>

        {/* ---------------------------------------------------------- hero */}
        <div className="relative h-70 w-full overflow-hidden">
          {/*
           * The live hero plays a looping video here. Without that asset the
           * scrim and the floor glow carry it; dropping a <video> in above
           * these two layers is the only change needed.
           */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.4)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(120%_100%_at_50%_100%,rgba(180,40,120,0.45)_0%,rgba(140,30,100,0.2)_60%,rgba(0,0,0,0)_100%)]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 select-none">
            <span className="inline-flex -skew-x-10 items-center bg-q-accent px-5 font-q-display text-[40px] leading-10 font-bold tracking-[-1.6px] text-q-inverse uppercase">
              <span className="skew-x-10">{MOBILE_COPY.heroBadge}</span>
            </span>
            <p className="mt-1 -skew-x-10 font-q-display text-[40px] leading-12 font-bold tracking-[-1.2px] text-white uppercase">
              <span className="inline-block skew-x-10">
                {MOBILE_COPY.heroLine}{" "}
                <span className="text-q-brand">{MOBILE_COPY.heroAccent}</span>
              </span>
            </p>
          </div>
        </div>

        {/* --------------------------------------------------- offer sheet */}
        <div className="relative z-1 -mt-8 flex flex-col overflow-hidden rounded-t-q-800 bg-q-page">
          <div className="flex items-center justify-center gap-1 px-3 pt-5">
            <Icon name="quote" size={24} className="text-q-w-20" />
            <p className="text-center">
              <span className="block text-xs leading-4 font-medium text-white">
                {MOBILE_COPY.trustTitle}
              </span>
              <span className="block text-xs leading-4 font-medium text-q-idle-soft">
                {MOBILE_COPY.trustSub}
              </span>
            </p>
            <Icon name="quote" size={24} className="scale-x-[-1] text-q-w-20" />
          </div>

          <div
            role="radiogroup"
            aria-label="Choose a plan"
            className="flex flex-col gap-3 px-3 pt-6"
          >
            {MOBILE_OPTIONS.map((o) => (
              <PlanOptionCard
                key={o.id}
                option={o}
                selected={o.id === selected}
                onSelect={() => setSelected(o.id)}
              />
            ))}
          </div>

          <p className="mt-4 px-4 pt-4 text-center text-xs leading-[18px] whitespace-pre-line text-q-soft">
            {PRICING_COPY.disclaimer}
          </p>
        </div>

        {/* ------------------------------------------------ what's included */}
        <section className="flex flex-col gap-5 px-3 pt-5 pb-10">
          <IncludedTable />
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center rounded-q-250 bg-q-w-10 text-sm leading-4 font-semibold text-white backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-q-focus"
          >
            {MOBILE_COPY.compareCta}
          </button>
        </section>

        {/* ----------------------------------------------------------- faq */}
        <section className="flex flex-col gap-6 px-3 py-12">
          <h2 className="text-center font-q-display text-[32px] leading-10 font-bold tracking-[-1.28px] text-white uppercase">
            {MOBILE_COPY.faqTitle}
          </h2>
          <FaqList items={FAQ.individual} variant="mobile" />
        </section>

        {/* ------------------------------------------------- sticky CTA bar */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-30 bg-gradient-to-t from-black via-black/70 to-transparent"
          />
          <div className="relative px-3 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
            <PlanCta tone="lime" size="lg" className="pointer-events-auto">
              {option.ctaLabel}
              {option.discount ? (
                <DiscountBadge>{option.discount}% OFF</DiscountBadge>
              ) : null}
            </PlanCta>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncludedTable() {
  return (
    <div className="flex items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex h-11 items-center py-3">
          <p className="text-sm leading-5 font-medium text-white">
            {MOBILE_COPY.includedTitle}
          </p>
        </div>
        {MOBILE_INCLUDED.map((r) => (
          <div key={r.label} className="flex h-10 items-center">
            <p className="text-sm leading-5 text-q-soft">{r.label}</p>
          </div>
        ))}
      </div>

      <Column title="Basic" cells={MOBILE_INCLUDED.map((r) => r.basic)} />
      {/* The recommended column is a tinted band, not just a bolder header. */}
      <Column title="Pro" highlight cells={MOBILE_INCLUDED.map((r) => r.pro)} />
    </div>
  );
}

function Column({
  title,
  cells,
  highlight,
}: {
  title: string;
  cells: IncludedCell[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-20 shrink-0 flex-col gap-2",
        highlight && "rounded-q-200 bg-[rgba(209,254,23,0.05)]",
      )}
    >
      <div className="flex h-11 items-center justify-center py-3">
        <p
          className={cn(
            "text-sm leading-5 font-medium",
            highlight ? "text-q-brand" : "text-white",
          )}
        >
          {title}
        </p>
      </div>
      {cells.map((cell, i) => (
        <div key={i} className="flex h-10 items-center justify-center">
          {typeof cell === "string" ? (
            <span className="text-sm leading-5 text-white">{cell}</span>
          ) : (
            <Icon
              name={cell ? "check" : "x"}
              size={20}
              className={cell ? "text-q-brand" : "text-q-soft"}
            />
          )}
        </div>
      ))}
    </div>
  );
}
