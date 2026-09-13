"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { Tag } from "@/components/core/tag";
import { MediaCard } from "@/components/display/media-card";
import { ProgressBar } from "@/components/display/progress-bar";
import { Spinner } from "@/components/display/spinner";
import { PromptComposer } from "@/components/forms/prompt-composer";
import { Toast } from "@/components/overlays/toast";
import { Tooltip } from "@/components/overlays/tooltip";
import { SettingsPanel } from "@/components/studio/settings-panel";
import { HERO, PRESETS } from "@/config/media";

interface Job {
  id: number;
  progress: number;
  done?: boolean;
  poster?: string;
  video?: string;
  name?: string;
}

const RENDER_MS = 2400;
const TICK_MS = 220;

/*
 * The generation surface: mode chips, results grid, the floating glass
 * composer and the 340px settings rail.
 *
 * The render is simulated — there is no backend — but the timers are cleaned
 * up on unmount so a navigation mid-render cannot leak an interval or set
 * state on an unmounted tree.
 */
export function VideoStudio() {
  const [prompt, setPrompt] = useState(
    "Handheld push-in through a rain-soaked arcade, neon reflections, 35mm",
  );
  const [model, setModel] = useState("Seedance 2.5");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [motion, setMotion] = useState(65);
  const [audio, setAudio] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const timers = useRef<{ tick?: number; done?: number }>({});

  useEffect(() => {
    const handles = timers.current;
    return () => {
      if (handles.tick) window.clearInterval(handles.tick);
      if (handles.done) window.clearTimeout(handles.done);
    };
  }, []);

  function run() {
    if (busy) return;
    setBusy(true);
    const id = Date.now();
    setJobs((current) => [{ id, progress: 0 }, ...current]);

    timers.current.tick = window.setInterval(() => {
      setJobs((current) =>
        current.map((job) =>
          job.id === id
            ? { ...job, progress: Math.min(100, job.progress + 12) }
            : job,
        ),
      );
    }, TICK_MS);

    timers.current.done = window.setTimeout(() => {
      if (timers.current.tick) window.clearInterval(timers.current.tick);
      const pick = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      setJobs((current) =>
        current.map((job) =>
          job.id === id
            ? {
                ...job,
                done: true,
                poster: pick?.poster,
                video: HERO[0]?.video,
                name: pick?.name,
              }
            : job,
        ),
      );
      setBusy(false);
      setToast({
        title: "Render complete",
        desc: `${model} · ${ratio} · ${String(duration)}s`,
      });
    }, RENDER_MS);
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2.5 border-b border-hairline px-6 py-3.5">
          <Tag icon="sparkles" selected onClick={() => undefined}>
            Text to video
          </Tag>
          <Tag icon="image" onClick={() => undefined}>
            Image to video
          </Tag>
          <Tag icon="clapperboard" onClick={() => undefined}>
            Video to video
          </Tag>
          <span className="flex-1" />
          <Tooltip label="Generation history">
            <IconButton icon="history" label="History" size="sm" />
          </Tooltip>
          <IconButton icon="layout-grid" label="Grid" size="sm" active />
        </div>

        <div className="hf-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-35">
          {jobs.length === 0 && (
            <div className="grid h-65 place-items-center rounded-panel bg-w-04 text-center shadow-[var(--inset-hairline)]">
              <div>
                <Icon
                  name="clapperboard"
                  size={28}
                  className="mx-auto text-disabled"
                />
                <div className="mt-3 text-h3 text-secondary">
                  Nothing rendered yet
                </div>
                <p className="mt-1.5 text-body-sm text-muted">
                  Write a prompt below and hit Generate.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[var(--grid-gap)]">
            {jobs.map((job) =>
              job.done ? (
                <MediaCard
                  key={job.id}
                  poster={job.poster}
                  video={job.video}
                  title={job.name}
                  meta={`${String(duration)}s · ${model}`}
                  ratio="16 / 9"
                  sizes="240px"
                  overlayActions={[
                    { icon: "download", label: "Download" },
                    { icon: "maximize-2", label: "Expand" },
                  ]}
                  action={
                    <Button size="sm" pill variant="glass">
                      Extend
                    </Button>
                  }
                />
              ) : (
                <div
                  key={job.id}
                  className="grid aspect-video place-items-center rounded-media bg-n-3 p-5 shadow-[var(--inset-hairline)]"
                >
                  <div className="w-full text-center">
                    <Spinner className="mx-auto" />
                    <div className="mt-3.5">
                      <ProgressBar value={job.progress} label="Rendering" />
                    </div>
                  </div>
                </div>
              ),
            )}

            {jobs.length > 0 &&
              PRESETS.slice(0, 5).map((preset, n) => (
                <MediaCard
                  key={preset.slug}
                  poster={preset.poster}
                  video={HERO[n % HERO.length]?.video}
                  title={preset.name}
                  meta={`5s · ${model}`}
                  ratio="16 / 9"
                  sizes="240px"
                  overlayActions={[{ icon: "download", label: "Download" }]}
                />
              ))}
          </div>
        </div>

        {/* The composer floats above the canvas with 24px side gutters rather
            than docking to the viewport edge. */}
        <div className="pointer-events-none relative -mt-29 px-6 pb-6">
          <div className="pointer-events-auto">
            <PromptComposer
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
              model={model}
              cost={duration * 10}
              busy={busy}
              references={[PRESETS[0]?.poster, PRESETS[4]?.poster].filter(
                (src): src is string => Boolean(src),
              )}
              onSubmit={run}
            />
          </div>
        </div>
      </div>

      <SettingsPanel
        model={model}
        onModelChange={setModel}
        ratio={ratio}
        onRatioChange={setRatio}
        duration={duration}
        onDurationChange={setDuration}
        motion={motion}
        onMotionChange={setMotion}
        audio={audio}
        onAudioChange={setAudio}
      />

      {toast && (
        <div className="fixed right-5 bottom-5 z-80">
          <Toast
            tone="success"
            title={toast.title}
            description={toast.desc}
            onClose={() => {
              setToast(null);
            }}
            action={
              <Button size="sm" variant="secondary">
                Open
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
