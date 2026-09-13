import { Hero } from "@/components/marketing/hero";
import {
  AgentBanner,
  CommunityStrip,
  FeatureSplit,
  ModelStrip,
  PresetWall,
} from "@/components/marketing/landing-sections";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Higgsfield — AI-native creative suite",
  description:
    "Create images, videos, and voice content from text prompts or references.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ModelStrip />
      <PresetWall />
      <FeatureSplit />
      <CommunityStrip />
      <AgentBanner />
    </>
  );
}
