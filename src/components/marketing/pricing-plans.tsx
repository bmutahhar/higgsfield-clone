"use client";

import { useState } from "react";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { Tag } from "@/components/core/tag";
import { SegmentedControl } from "@/components/navigation/segmented-control";
import { cn } from "@/lib/cn";

/*
 * PLACEHOLDER COMMERCIALS. Plan names, prices and credit amounts are the
 * design system's own invention — see the CAVEATS section of the design
 * project's readme. Replace before this is shown to anyone as real pricing.
 */
interface Plan {
  name: string;
  price: string;
  credits: string;
  cta: string;
  features: string[];
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    credits: "150 credits / mo",
    cta: "Start free",
    features: ["Watermarked 720p", "Standard queue", "Community gallery"],
  },
  {
    name: "Creator",
    price: "$9",
    credits: "1,500 credits / mo",
    cta: "Choose Creator",
    features: [
      "1080p, no watermark",
      "Priority queue",
      "All viral presets",
      "Commercial use",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    credits: "6,000 credits / mo",
    cta: "Choose Pro",
    features: [
      "4K upscale",
      "Genjutsu + Seedance 2.5",
      "Marketing Studio",
      "Plugins (After Effects)",
    ],
    featured: true,
  },
  {
    name: "Ultimate",
    price: "$99",
    credits: "24,000 credits / mo",
    cta: "Choose Ultimate",
    features: [
      "Everything in Pro",
      "Supercomputer agent",
      "Team seats",
      "API + MCP access",
    ],
  },
];

export function PricingPlans() {
  const [cycle, setCycle] = useState("yearly");

  return (
    <section className="mx-auto max-w-[var(--max-content)] px-8 pt-18 text-center">
      <div className="hf-eyebrow mb-3.5">Pricing</div>
      <h1 className="text-display-2 uppercase">Pick your pace</h1>
      <p className="mx-auto mt-3.5 max-w-130 text-body-lg text-muted">
        Every plan runs on the full model catalogue. Credits are the only
        difference.
      </p>

      <div className="mt-6.5 flex justify-center">
        <SegmentedControl
          value={cycle}
          onChange={setCycle}
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly · −40%" },
          ]}
        />
      </div>

      <div className="mt-10 grid gap-3.5 text-left sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col gap-4 rounded-card border p-5.5",
              plan.featured
                ? "border-accent-ring bg-raised shadow-e2"
                : "border-hairline bg-card",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-h3">{plan.name}</span>
              {plan.featured && <Badge>Most popular</Badge>}
            </div>
            <div>
              <span className="font-display text-[40px]/1 font-semibold tracking-[-0.03em]">
                {plan.price}
              </span>
              <span className="ml-1.5 text-body-sm text-muted">/ mo</span>
              <div className="mt-2 font-mono text-mono text-lime">
                {plan.credits}
              </div>
            </div>
            <Button
              fullWidth
              pill
              variant={plan.featured ? "primary" : "secondary"}
            >
              {plan.cta}
            </Button>
            <div className="mt-1 flex flex-col gap-2.5">
              {plan.features.map((feature) => (
                <span
                  key={feature}
                  className="flex items-start gap-2.25 text-body-sm text-secondary"
                >
                  <Icon name="check" size={15} className="mt-0.5 text-lime" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Tag icon="shield">Commercial rights on paid plans</Tag>
        <Tag icon="credit-card">Cancel anytime</Tag>
        <Tag icon="building-2">Enterprise invoicing</Tag>
      </div>
    </section>
  );
}
