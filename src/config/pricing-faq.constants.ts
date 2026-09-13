/*
 * The FAQ, extracted from the live page.
 *
 * It is not one list. The accordion swaps wholesale with the audience tab —
 * eight consumer questions on Individual, thirteen procurement-flavoured ones
 * on Business — and nothing in the section's own chrome hints at that. A build
 * that renders a single list looks right until someone clicks the other tab.
 */
export interface FaqItem {
  q: string;
  a: string;
}

const INDIVIDUAL: FaqItem[] = [
  {
    q: "How do credits work?",
    a: `Credits are the main cost unit for generating media. Each model (image, video, or animation) uses a specific number of credits per generation depending on model type, duration, and resolution.

Subscription credits do not roll over and expire at the end of each credit cycle.

For monthly plans, credits refresh on the same date each month based on your original purchase date. For annual plans, credits refresh every 30 days from the subscription start date.

New credits are added automatically at the start of each new credit cycle while your subscription is active.

Monthly credits are tied to your active subscription period. Unused subscription credits do not roll over to the next billing cycle and expire at the end of each month. New credits are refreshed automatically when your subscription renews.`,
  },
  {
    q: "Is my subscription automatically renewed?",
    a: "Yes. Your subscription renews automatically at the end of each billing cycle to ensure uninterrupted access. You can cancel anytime in your account settings - your plan will remain active until the end of the current period.",
  },
  {
    q: "How many images or videos can I generate?",
    a: "It depends on your plan and the models you use. Each plan includes an approximate number of generations per month - check the pricing table for model-specific details.",
  },
  {
    q: "How can I purchase extra credits?",
    a: "If you need more credits, you can upgrade your plan for a higher monthly limit or buy credit packs to generate more media without changing your current subscription. Purchased credits are added instantly and can be used across all supported models.",
  },
  {
    q: "How does Unlimited work?",
    a: `Unlimited lets you generate content without spending credits on supported models, resolutions, or quality tiers included in your plan. To ensure a smooth experience for everyone, we manage system resources dynamically:
Dynamic Speed Adjustment: Generation speed and concurrency may temporarily vary during periods of exceptionally high system load or peak traffic hours.
System Stability: Processing limits and concurrency may adjust dynamically during high load to maintain reliable platform performance for all users on unlimited plans.
Credit Mode: You can turn off Unlimited at any time to generate faster using credits. Simply switch to Credit Mode to bypass the standard queue and return to maximum speed instantly.
Fair Use: This feature is designed for personal, human use only - automation tools, credential sharing, or reselling access are strictly prohibited.
Account Review: If unusual activity is detected, Unlimited access may be temporarily paused for manual review by our Support Team and restored once normal usage is confirmed.`,
  },
  {
    q: "How does 365 Unlimited promo work?",
    a: `365 Unlimited promo gives you one year of unlimited generations on the specific models listed in each plan's card.
Your unlimited access for these models remains active every day for one full year from the moment of purchase.
These models remain available as long as your subscription is active.
If you cancel your subscription or switch to a lower plan that doesn't include 365 Unlimited, unlimited access stops immediately when your current plan ends.
If you upgrade, your unlimited access continues for the full 12 months.
The promo applies to both new users and existing active subscribers of eligible plans at the time of the promotion.
Every time the promo activates, all currently active subscribers of eligible plans automatically receive an additional 1-year extension of their unlimited access from the moment the promo starts.
For other models, the number of unlimited access days is specified on each model's icon on the pricing page.
Unlimited generations run in the standard queue, while credit-based generations always run in the priority queue.
Any signs of automation, scripting, or non-human activity can result in a temporary pause of your unlimited access for manual review. Access will be restored once normal usage is confirmed.
This policy exists to maintain reliability, speed, and fair access for everyone on unlimited plans.`,
  },
  {
    q: "Can I change my subscription after purchase?",
    a: "Yes. You can upgrade instantly at any time - the change takes effect immediately, and any credit difference is applied to your account. If you downgrade, the change will apply at the end of your current plan duration, and your existing plan will remain active until then.",
  },
  {
    q: "How much does it cost to use Higgsfield Supercomputer?",
    a: "Every plan Higgsfield Supercomputer runs shows the credit cost upfront — before anything renders. You approve the spend, then it generates. In addition to generation costs, credits are also used for text requests - the amount varies based on your prompt complexity and the LLM model you select",
  },
];

const BUSINESS: FaqItem[] = [
  {
    q: "How do I get started with a Team Plan?",
    a: "You can sign up directly on the website, invite members from the Team section, and manage credits from your account dashboard.",
  },
  {
    q: "Can I upgrade from Team to Enterprise later?",
    a: "Yes. You can start with a Team Plan and switch to Enterprise at any time. Our sales team will help with migration and custom setup.",
  },
  {
    q: "What support is included?",
    a: `Team Plan: Priority email support.
Enterprise Plan: Priority support with SLA, including faster response times and dedicated assistance.`,
  },
  {
    q: "What payment methods are available?",
    a: `Team Plan: Credit card payments with monthly or annual billing.
Enterprise Plan: Flexible options including credit card and invoice-based bank transfers.`,
  },
  {
    q: "Is there an admin dashboard?",
    a: `Yes. Both Team and Enterprise plans include centralized admin controls to manage credits, seats, and collaboration.
Enterprise adds advanced admin tools such as usage limiting per user and audit logs.`,
  },
  {
    q: "How secure is my data?",
    a: `Team Plan: Standard security with centralized access.
Enterprise Plan: Enterprise-grade security including Single Sign-On (SSO), compliance controls, and audit trails.`,
  },
  {
    q: "How many members can I add?",
    a: `Team Plan: Minimum 3, up to 15 members.
Enterprise Plan: Fully configurable seats, based on your needs.`,
  },
  {
    q: "Do my credits expire or reset?",
    a: `Monthly plans: Credits reset at the start of each new billing month (unused credits don't roll over).
Yearly plans: You receive a monthly credit allowance each month, and unused credits reset at the start of the next month.`,
  },
  {
    q: "What should I do if I need more credits?",
    a: `You can manually refill credits in the Team section of your account.
You can also enable auto top-up to avoid interruptions and run generations without restrictions.`,
  },
  {
    q: "Are collaboration features available?",
    a: `Yes. Both plans include shared assets and folders.
Additional collaboration features are in progress and will be released soon.`,
  },
  {
    q: "What features can I access?",
    a: `All features in Higgsfield are available.
Plans include upgraded concurrent jobs (16 for Team, configurable for Enterprise).`,
  },
  {
    q: "What is the main difference between the Team and Enterprise plans?",
    a: `The Team Plan is designed for small to mid-size teams (3-15 members) with a simple setup.
The Enterprise Plan offers configurable credits, seats, security, compliance, and integrations tailored for larger organizations.`,
  },
  {
    q: "How does billing work?",
    a: `Team Plans: Billed monthly or annually with centralized payment.
Enterprise Plans: Offer both card-based billing or invoice-based bank transfers.`,
  },
];

export const FAQ: Record<"individual" | "business", FaqItem[]> = {
  individual: INDIVIDUAL,
  business: BUSINESS,
};
