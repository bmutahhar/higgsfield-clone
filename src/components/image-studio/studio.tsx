"use client";

import { useEffect } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";

import { ImageFeed } from "@/components/feed/image-feed";
import { StudioEmptyState } from "@/components/feed/studio-empty-state";
import { Composer } from "@/components/image-studio/composer";
import { useAuth } from "@/features/auth/auth-context";
import {
  fetchGeneration,
  requestGeneration,
} from "@/services/image-generation";
import {
  useGenerationsOfKind,
  useGenerationStore,
} from "@/stores/generation-store";

/*
 * How often a running job is asked whether it has landed. Kept below the
 * server's per-image stagger so images in a batch are seen arriving one by
 * one rather than in a clump — see `generation-jobs.server.ts`.
 */
const POLL_MS = 300;

/*
 * The image studio: the canvas and the composer, and the generation flow that
 * joins them.
 *
 * Generations live in the shared store, not here — the same store the video
 * and audio studios will write to. This component only starts them and reads
 * back the ones of its own kind.
 *
 * React Query is the transport, not the record: one query per running job,
 * polling until it lands and then writing the asset into the store. That way
 * each image resolves on its own clock rather than the batch appearing at
 * once, and there is still exactly one copy of what exists.
 */
export interface ImageStudioProps {
  /** Which model the composer opens on, resolved from the URL by the route. */
  modelId: string;
}

export function ImageStudio({ modelId }: ImageStudioProps) {
  const { user, openAuth } = useAuth();

  const generations = useGenerationsOfKind("image");
  // Actions never change identity, so selecting them needs no shallow compare.
  const enqueue = useGenerationStore((state) => state.enqueue);
  const applyStatus = useGenerationStore((state) => state.applyStatus);
  const holdRequest = useGenerationStore((state) => state.holdRequest);
  const takeRequest = useGenerationStore((state) => state.takeRequest);
  /*
   * What Recreate on a tile hands over. Read here rather than in the composer
   * so this component stays the one that knows the store.
   */
  const draft = useGenerationStore((state) => state.draft);

  const { mutate: generate } = useMutation({
    mutationFn: requestGeneration,
    /*
     * The submitted values arrive as the mutation's second argument, so the
     * recipe stored against each image is the one that was actually sent.
     * This used to record the route's model instead, which meant changing the
     * model in the composer and generating credited the wrong one.
     */
    onSuccess: (accepted, values) => {
      enqueue({ kind: "image", values }, accepted);
    },
  });

  /*
   * Picking up where signing in left off.
   *
   * Submitting while signed out parks the validated values and opens the
   * dialog; the moment a user exists, that request runs on its own. `mutate`
   * is referentially stable and `takeRequest` clears as it reads, so this
   * fires exactly once per parked request — including under StrictMode, which
   * runs every effect twice in development.
   */
  useEffect(() => {
    if (!user) return;
    const held = takeRequest();
    if (held?.kind === "image") generate(held.values);
  }, [user, takeRequest, generate]);

  /*
   * One query per running job. Resolved generations drop out of this list, so
   * their queries unmount and stop — nothing polls an image that has landed.
   */
  const pending = generations.filter(
    (generation) => generation.status !== "ready",
  );

  useQueries({
    queries: pending.map((generation) => ({
      queryKey: ["generation", generation.id],
      /*
       * The write into the store lives here rather than in an effect: this is
       * the only place that knows what the service just said, and an effect
       * would re-derive the same fact one render later. `applyStatus` ignores
       * a report that changes nothing, so polling four times a second costs
       * nothing until the phase actually moves.
       */
      queryFn: async () => {
        const status = await fetchGeneration(generation.id);
        applyStatus(generation.id, status);
        return status;
      },
      // Stop the moment this one lands; the others keep going.
      refetchInterval: (query: { state: { data?: { status: string } } }) =>
        query.state.data?.status === "ready" ? false : POLL_MS,
      /*
       * Keep polling while the tab is in the background, which React Query
       * does not do by default. The work finishes on the server whether or
       * not anyone is watching, so switching away mid-batch and coming back
       * should show finished images — not tiles that only start moving again
       * once they are looked at.
       */
      refetchIntervalInBackground: true,
    })),
  });

  /*
   * Signed out there is nothing of yours to show, and the live studio puts a
   * hero here rather than someone else's generations. The composer stays, and
   * submitting from it opens the dialog.
   *
   * This return sits below every hook above — the store selectors, useMutation
   * and useQueries all run unconditionally — because returning earlier would
   * change the hook order across the signed-in/signed-out transition and React
   * would throw.
   */
  if (!user) {
    return (
      <>
        <StudioEmptyState />
        <Composer
          modelId={modelId}
          draft={draft}
          /*
           * The values arrive already validated, so an empty prompt still
           * fails in the composer rather than asking someone to sign in
           * before finding out they submitted nothing.
           */
          onGenerate={(values) => {
            holdRequest({ kind: "image", values });
            openAuth("signup");
          }}
        />
      </>
    );
  }

  return (
    <>
      <ImageFeed generations={generations} />
      <Composer modelId={modelId} draft={draft} onGenerate={generate} />
    </>
  );
}
