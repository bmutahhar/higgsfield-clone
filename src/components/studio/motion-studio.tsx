"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";

import { MotionForm } from "@/components/studio/motion-form";
import { StudioOnboarding } from "@/components/studio/studio-onboarding";
import { StudioPane } from "@/components/studio/studio-pane";
import { PANE_TABS, type PaneTab } from "@/config/genjutsu";
import { MOTION_ONBOARDING } from "@/config/video-motion";
import { useAuth } from "@/features/auth/auth-context";
import { fetchGeneration } from "@/services/image-generation";
import { requestVideoMotion } from "@/services/video-motion";
import {
  useGenerationsOfKind,
  useGenerationStore,
} from "@/stores/generation-store";

/* Slower than the image studio's poll: one job, seconds long. See genjutsu-studio. */
const POLL_MS = 600;

/** This surface has no preset library, so its pane offers two tabs. */
const TABS = PANE_TABS.filter((tab) => tab.id !== "library");

/**
 * Composition root for the Motion Control surface.
 *
 * Identical flow to the other two studios — validated submit, one query per
 * running job, results into the shared store — because motion transfer is a
 * generation like any other and belongs in the same history.
 */
export function MotionStudio({ modelId }: { modelId: string }) {
  const { user, openAuth } = useAuth();
  const [tab, setTab] = useState<PaneTab>("history");

  const generations = useGenerationsOfKind("video");
  const enqueue = useGenerationStore((state) => state.enqueue);
  const applyStatus = useGenerationStore((state) => state.applyStatus);
  const holdRequest = useGenerationStore((state) => state.holdRequest);
  const takeRequest = useGenerationStore((state) => state.takeRequest);

  const { mutate: generate } = useMutation({
    mutationFn: requestVideoMotion,
    onSuccess: (accepted, values) => {
      enqueue({ kind: "video-motion", values }, accepted);
      setTab("history");
    },
  });

  /* Picking up where signing in left off; `takeRequest` clears as it reads. */
  useEffect(() => {
    if (!user) return;
    const held = takeRequest();
    if (held?.kind === "video-motion") generate(held.values);
  }, [user, takeRequest, generate]);

  const pending = generations.filter(
    (generation) => generation.status !== "ready",
  );

  useQueries({
    queries: pending.map((generation) => ({
      queryKey: ["generation", generation.id],
      queryFn: async () => {
        const status = await fetchGeneration(generation.id);
        applyStatus(generation.id, status);
        return status;
      },
      refetchInterval: (query: { state: { data?: { status: string } } }) =>
        query.state.data?.status === "ready" ? false : POLL_MS,
      refetchIntervalInBackground: true,
    })),
  });

  return (
    <div className="relative mx-auto grid w-full max-w-480 min-w-0 grid-cols-[1fr] gap-2 px-4 pb-2 md:grid-cols-[20rem_1fr]">
      <MotionForm
        modelId={modelId}
        onModelChange={(id) => {
          window.history.pushState(null, "", `/ai/video/motion?model=${id}`);
        }}
        onHowItWorks={() => setTab("how")}
        onSubmit={(values) => {
          if (!user) {
            holdRequest({ kind: "video-motion", values });
            openAuth("signup");
            return;
          }
          generate(values);
        }}
      />

      <StudioPane
        tab={tab}
        onTabChange={setTab}
        tabs={TABS}
        generations={user ? generations : []}
        empty={<StudioOnboarding {...MOTION_ONBOARDING} />}
        onRecreate={() => {
          openAuth("signup");
        }}
      />
    </div>
  );
}
