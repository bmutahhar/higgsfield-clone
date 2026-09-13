"use client";

import { useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";

import { ImageFeed } from "@/components/feed/image-feed";
import { Composer } from "@/components/image-studio/composer";
import { FEED_ITEMS } from "@/config/image-studio";
import {
  fetchGeneration,
  requestGeneration,
} from "@/services/image-generation";
import type { FeedCell, GenerationJob } from "@/types/generation.types";

/** How often a running job is asked whether it has landed. */
const POLL_MS = 600;

/*
 * The image studio: the canvas and the composer, and the generation flow that
 * joins them.
 *
 * The split of ownership is the point. Which jobs this session started is
 * client state and lives here. What each job has produced is server state and
 * lives in React Query — one query per job, so each image resolves on its own
 * clock rather than the batch appearing all at once.
 *
 * Nothing is copied between the two: the cells handed to the feed are derived
 * from the jobs and their query results on every render, so there is no second
 * copy of the truth to fall out of step.
 */
export interface ImageStudioProps {
  /** Which model the composer opens on, resolved from the URL by the route. */
  modelId: string;
}

export function ImageStudio({ modelId }: ImageStudioProps) {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [history, setHistory] = useState(FEED_ITEMS);

  const { mutate: generate } = useMutation({
    mutationFn: requestGeneration,
    // Newest first, the way the live feed stacks them.
    onSuccess: (accepted) => {
      setJobs((prev) => [...accepted, ...prev]);
    },
  });

  const results = useQueries({
    queries: jobs.map((job) => ({
      queryKey: ["generation", job.id],
      queryFn: () => fetchGeneration(job.id),
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

  const cells: FeedCell[] = [
    ...jobs.map((job, index) => {
      const status = results[index]?.data;
      return {
        id: job.id,
        w: job.w,
        h: job.h,
        item:
          status?.status === "ready"
            ? {
                id: job.id,
                src: status.asset.url,
                w: job.w,
                h: job.h,
                prompt: job.prompt,
              }
            : null,
      };
    }),
    ...history.map((item) => ({
      id: item.id,
      w: item.w,
      h: item.h,
      item,
    })),
  ];

  function remove(ids: string[]) {
    setJobs((prev) => prev.filter((job) => !ids.includes(job.id)));
    setHistory((prev) => prev.filter((item) => !ids.includes(item.id)));
  }

  return (
    <>
      <ImageFeed cells={cells} onRemove={remove} />
      <Composer modelId={modelId} onGenerate={generate} />
    </>
  );
}
