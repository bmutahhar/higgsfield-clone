"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { GenerateForm } from "@/components/studio/generate-form";
import { StudioPane } from "@/components/studio/studio-pane";
import type { PaneTab } from "@/config/genjutsu";
import { useAuth } from "@/features/auth/auth-context";
import type { VideoGenerationValues } from "@/schemas/video-generation";

/**
 * Composition root for the studio. It holds only what both columns need to
 * agree on: which tab the pane is showing (the form's promo card can switch
 * it). The sign-in dialog is global, so nothing about it is held here.
 *
 * The active model is not here — it lives in the URL, so choosing one is a
 * navigation and every model stays deep-linkable.
 */
export function GenjutsuStudio({ modelId }: { modelId: string }) {
  const router = useRouter();
  const { user, openAuth } = useAuth();
  const [tab, setTab] = useState<PaneTab>("library");

  return (
    // `w-full` is load-bearing: the studio layout is a flex row, so without it
    // the grid shrinks to its content and the pane loses ~400px.
    <div className="relative mx-auto grid w-full max-w-480 min-w-0 grid-cols-[1fr] gap-2 px-4 pb-2 md:grid-cols-[20rem_1fr]">
      <GenerateForm
        modelId={modelId}
        onModelChange={(id) => router.push(`/ai/video?model=${id}`)}
        onHowItWorks={() => setTab("how")}
        onSubmit={(values: VideoGenerationValues) => {
          /*
           * Reached only once the panel validates. Generation is not built in
           * this clone; signed out, the dialog is the honest next step.
           */
          void values;
          if (!user) openAuth("signup");
        }}
      />

      <StudioPane
        tab={tab}
        onTabChange={setTab}
        onGate={() => {
          openAuth("signup");
        }}
      />
    </div>
  );
}
