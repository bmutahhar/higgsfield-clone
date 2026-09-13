"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueries } from "@tanstack/react-query";

import { GenerateForm } from "@/components/studio/generate-form";
import { StudioPane } from "@/components/studio/studio-pane";
import type { PaneTab } from "@/config/genjutsu";
import { GENJUTSU_QUALITY_DEFAULT } from "@/config/models";
import type { Preset } from "@/config/presets";
import { useAuth } from "@/features/auth/auth-context";
import { fetchGeneration } from "@/services/image-generation";
import { requestVideoGeneration } from "@/services/video-generation";
import {
  useGenerationsOfKind,
  useGenerationStore,
} from "@/stores/generation-store";

/*
 * How often a running clip is asked whether it has landed.
 *
 * Slower than the image studio's 300ms: that interval exists to catch a
 * staggered batch arriving one image at a time, and a video request is a
 * single job that takes seconds. Polling four times a second for seven
 * seconds would be two dozen requests to learn one thing.
 */
const POLL_MS = 600;

/*
 * Composition root for the video studio.
 *
 * It holds only what both columns must agree on — which pane tab is showing,
 * since the form's promo card can switch it — and owns the generation flow
 * that joins them.
 *
 * Generations live in the shared store, the same one the image studio writes
 * to, so the library will read across both without merging anything. React
 * Query is the transport and not the record: one query per running job,
 * polling until it lands and then writing the asset into the store.
 *
 * The active model is not state here. It lives in the URL, which keeps every
 * model deep-linkable and the back button meaningful.
 */
export function GenjutsuStudio({ modelId }: { modelId: string }) {
  const router = useRouter();
  const { user, openAuth } = useAuth();
  const [tab, setTab] = useState<PaneTab>("library");

  const generations = useGenerationsOfKind("video");
  // Actions never change identity, so selecting them needs no shallow compare.
  const enqueue = useGenerationStore((state) => state.enqueue);
  const applyStatus = useGenerationStore((state) => state.applyStatus);
  const holdRequest = useGenerationStore((state) => state.holdRequest);
  const takeRequest = useGenerationStore((state) => state.takeRequest);
  const loadDraft = useGenerationStore((state) => state.loadDraft);
  const draft = useGenerationStore((state) => state.draft);

  const { mutate: generate } = useMutation({
    mutationFn: requestVideoGeneration,
    /*
     * The submitted values arrive as the mutation's second argument, so the
     * recipe stored against the clip is the one that was actually sent — and,
     * because this store is never serialised, that includes the reference
     * files themselves. Recreating a clip you made this session brings its
     * attachments back with it.
     */
    onSuccess: (accepted, values) => {
      enqueue({ kind: "video", values }, accepted);
      // Send them where the work actually appears; the library hides it.
      setTab("history");
    },
  });

  /*
   * A recreated clip names a model, and on this surface the model lives in
   * the URL rather than in the form — the panel derives its quality options
   * from the route. So the draft's model is pushed here and the panel's own
   * URL-sync effect lands it in the field, which leaves exactly one writer
   * for it instead of two racing.
   *
   * `replace` rather than `push`: filling the form is not a navigation, and
   * the back button should not be walking through recipes.
   */
  useEffect(() => {
    if (draft?.kind !== "video") return;
    const next = draft.values.modelId;
    if (next !== undefined && next !== modelId) {
      router.replace(`/ai/video?model=${next}`);
    }
  }, [draft, modelId, router]);

  /*
   * Picking up where signing in left off. Submitting while signed out parks
   * the validated values and opens the dialog; the moment a user exists, that
   * request runs on its own. `takeRequest` clears as it reads, so this fires
   * once per parked request even under StrictMode's double-invoked effects.
   */
  useEffect(() => {
    if (!user) return;
    const held = takeRequest();
    if (held?.kind === "video") generate(held.values);
  }, [user, takeRequest, generate]);

  /*
   * One query per running job. A clip that has landed drops out of this list,
   * so its query unmounts and stops — nothing polls finished work.
   */
  const pending = generations.filter(
    (generation) => generation.status !== "ready",
  );

  useQueries({
    queries: pending.map((generation) => ({
      queryKey: ["generation", generation.id],
      /*
       * The store write lives here rather than in an effect: this is the only
       * place that knows what the service just said, and an effect would
       * re-derive the same fact a render later. `applyStatus` ignores a report
       * that changes nothing, so polling costs nothing until a phase moves.
       */
      queryFn: async () => {
        const status = await fetchGeneration(generation.id);
        applyStatus(generation.id, status);
        return status;
      },
      refetchInterval: (query: { state: { data?: { status: string } } }) =>
        query.state.data?.status === "ready" ? false : POLL_MS,
      /*
       * Keep polling in a background tab. The work finishes on the server
       * whether or not anyone is watching, so coming back mid-render should
       * show a finished clip rather than a tile that only resumes once looked
       * at.
       */
      refetchIntervalInBackground: true,
    })),
  });

  return (
    <div className="relative mx-auto grid w-full max-w-480 min-w-0 grid-cols-[1fr] gap-2 px-4 pb-2 md:grid-cols-[20rem_1fr]">
      <GenerateForm
        modelId={modelId}
        draft={draft}
        onModelChange={(id) => {
          router.push(`/ai/video?model=${id}`);
        }}
        onHowItWorks={() => setTab("how")}
        /*
         * Values arrive already validated, so submitting signed out still
         * fails on an empty prompt in the panel rather than asking someone to
         * sign in only to discover they submitted nothing.
         */
        onSubmit={(values) => {
          if (!user) {
            holdRequest({ kind: "video", values });
            openAuth("signup");
            return;
          }
          generate(values);
        }}
      />

      <StudioPane
        tab={tab}
        onTabChange={setTab}
        /*
         * Signed out there is no history of yours to show, and the live studio
         * leaves the canvas blank rather than filling it with someone else's
         * work. The seeded back catalogue belongs to a signed-in session.
         */
        generations={user ? generations : []}
        /*
         * A preset is a recipe like any other, so recreating one fills the
         * panel instead of doing nothing. Signed out it still gates: there is
         * no history to put it beside and the generation could not run.
         */
        onRecreate={(preset: Preset) => {
          if (!user) {
            openAuth("signup");
            return;
          }
          loadDraft({
            kind: "video",
            values: {
              mode: preset.mode,
              modelId: "genjutsu",
              quality: GENJUTSU_QUALITY_DEFAULT,
              promptEnabled: true,
              prompt: preset.prompt,
              // `preset.model` is a display string, not a catalogue id, and a
              // preset carries no files — only the idea.
              referenceVideo: null,
              referenceImages: [],
            },
          });
        }}
      />
    </div>
  );
}
