"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/studio/auth-gate";
import { GenerateForm } from "@/components/studio/generate-form";
import { StudioPane } from "@/components/studio/studio-pane";
import type { PaneTab } from "@/config/genjutsu";
import type { VideoGenerationValues } from "@/schemas/video-generation";

/**
 * Composition root for the studio. It holds only what both columns need to
 * agree on: which tab the pane is showing (the form's promo card can switch
 * it), and whether the sign-in gate is up.
 *
 * The active model is not here — it lives in the URL, so choosing one is a
 * navigation and every model stays deep-linkable.
 */
export function GenjutsuStudio({ modelId }: { modelId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<PaneTab>("library");
  const [gate, setGate] = useState(false);

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
           * Reached only once the panel validates. Signed out there is nowhere
           * to send it, so the gate stands in for the generation call.
           */
          void values;
          setGate(true);
        }}
      />

      <StudioPane tab={tab} onTabChange={setTab} onGate={() => setGate(true)} />

      {gate ? <AuthGate onClose={() => setGate(false)} /> : null}
    </div>
  );
}
