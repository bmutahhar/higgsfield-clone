import { AgentBanner } from "@/components/marketing/agent-banner";
import { CanvasBanner } from "@/components/marketing/canvas-banner";
import { CommunityGrid } from "@/components/marketing/community-grid";
import { EffectsWall } from "@/components/marketing/effects-wall";
import { FeatureCloud } from "@/components/marketing/feature-cloud";
import { FeatureSplit } from "@/components/marketing/landing-sections";
import { McpBanner } from "@/components/marketing/mcp-banner";
import { OfferAndModels } from "@/components/marketing/offer-and-models";
import { PromoRail } from "@/components/marketing/promo-rail";
import { ShowcaseRow } from "@/components/marketing/showcase-row";
import { SHOWCASES } from "@/config/site";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Higgsfield AI — AI-native creative suite",
  description:
    "A workflow layer over many generative models for image, video and voice.",
};

/*
 * Home page, following the live site's section order: promo rail, offer and
 * model entry points, the MCP lockup, the effects wall, the Genjutsu feature
 * split, model showcases, community, and the feature tail above the footer.
 */
export default function HomePage() {
  return (
    <>
      <div className="pt-4" />
      <PromoRail />
      <OfferAndModels />
      <McpBanner />
      <EffectsWall />
      <FeatureSplit />
      {SHOWCASES.slice(0, 2).map((showcase) => (
        <ShowcaseRow key={showcase.title} {...showcase} />
      ))}
      <CommunityGrid />
      <AgentBanner />
      <CanvasBanner />
      {SHOWCASES.slice(2).map((showcase) => (
        <ShowcaseRow key={showcase.title} {...showcase} />
      ))}
      <FeatureCloud />
    </>
  );
}
