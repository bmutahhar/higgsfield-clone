"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";

import { AudioPane } from "@/components/audio-studio/audio-pane";
import { AudioPanel } from "@/components/audio-studio/audio-panel";
import { TranslateForm } from "@/components/audio-studio/translate-form";
import { TtsForm } from "@/components/audio-studio/tts-form";
import { VoiceChangeForm } from "@/components/audio-studio/voice-change-form";
import { type AudioMode, DEFAULT_AUDIO_MODEL_ID } from "@/config/audio";
import { useAuth } from "@/features/auth/auth-context";
import type { AudioGenerationValues } from "@/schemas/audio-generation";
import { requestAudioGeneration } from "@/services/audio-generation";
import { fetchGeneration } from "@/services/image-generation";
import {
  useGenerationsOfKind,
  useGenerationStore,
} from "@/stores/generation-store";

/*
 * How often a running job is asked whether it has landed. Between the image
 * studio's 300ms and the video studio's 600ms, in proportion to the work: an
 * audio job takes about four seconds.
 */
const POLL_MS = 500;

/*
 * Composition root for the audio studio.
 *
 * It holds only what both columns must agree on — the active mode, since the
 * pane's copy and its renderer both follow it, and the pane tab, since
 * submitting switches to History.
 *
 * The model is state rather than a URL parameter: `/audio` deep-links no model
 * on the reference, so putting one in would be a divergence dressed up as a
 * feature. The tab *is* in the URL, because the header's hover menu links to
 * each one.
 */
export function AudioStudio({
  initialMode = "tts",
}: {
  /** Resolved from `?tab=` by the route, so the nav menu can deep-link a tab. */
  initialMode?: AudioMode;
}) {
  const { user, openAuth } = useAuth();
  const [mode, setMode] = useState<AudioMode>(initialMode);
  const [modelId, setModelId] = useState(DEFAULT_AUDIO_MODEL_ID);
  const [paneTab, setPaneTab] = useState<"history" | "how">("how");

  const generations = useGenerationsOfKind("audio");
  // Actions never change identity, so selecting them needs no shallow compare.
  const enqueue = useGenerationStore((state) => state.enqueue);
  const applyStatus = useGenerationStore((state) => state.applyStatus);
  const holdRequest = useGenerationStore((state) => state.holdRequest);
  const takeRequest = useGenerationStore((state) => state.takeRequest);

  const { mutate: generate } = useMutation({
    mutationFn: requestAudioGeneration,
    onSuccess: (accepted, values) => {
      enqueue({ kind: "audio", values }, accepted);
      // Send them where the work actually appears.
      setPaneTab("history");
    },
  });

  /*
   * Picking up where signing in left off. `takeRequest` clears as it reads, so
   * this fires once per parked request even under StrictMode's double effects.
   */
  useEffect(() => {
    if (!user) return;
    const held = takeRequest();
    if (held?.kind === "audio") generate(held.values);
  }, [user, takeRequest, generate]);

  /*
   * One query per running job. A job that has landed drops out of this list,
   * so its query unmounts and stops — nothing polls finished work.
   */
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
      /* The work finishes whether or not anyone is watching. */
      refetchIntervalInBackground: true,
    })),
  });

  /*
   * This tab's own output, newest first. All three modes file under one kind,
   * so the pane would otherwise show a Translate tile in the speech list — the
   * mode on each record's settings is what separates them.
   */
  const forThisTab = generations
    .filter(
      (generation) =>
        generation.settings.kind === "audio" &&
        generation.settings.values.mode === mode,
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  const submit = (values: AudioGenerationValues) => {
    /*
     * Values arrive already validated, so submitting signed out still fails on
     * an empty script in the panel rather than asking someone to sign in only
     * to discover they submitted nothing.
     */
    if (!user) {
      holdRequest({ kind: "audio", values });
      openAuth("signup");
      return;
    }
    generate(values);
  };

  return (
    <div className="relative grid size-full min-h-0 grid-cols-[1fr] px-4 md:grid-cols-[max-content_1fr]">
      <AudioPanel mode={mode} onModeChange={setMode}>
        {mode === "tts" ? (
          <TtsForm
            modelId={modelId}
            onModelChange={setModelId}
            onSubmit={submit}
          />
        ) : mode === "voice-change" ? (
          <VoiceChangeForm onSubmit={submit} />
        ) : (
          <TranslateForm onSubmit={submit} />
        )}
      </AudioPanel>

      <AudioPane
        tab={paneTab}
        onTabChange={setPaneTab}
        mode={mode}
        generations={forThisTab}
        signedIn={Boolean(user)}
        onGate={() => {
          openAuth("signup");
        }}
      />
    </div>
  );
}
