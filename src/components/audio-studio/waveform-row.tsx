"use client";

import { useRef, useState } from "react";

import { Waveform } from "@/components/audio-studio/waveform";
import { ActionButton } from "@/components/core/action-button";
import { Icon } from "@/components/core/icon";
import { audioModelById, voiceById } from "@/config/audio";
import { useGenerationActions } from "@/hooks/use-generation-actions";
import type { Generation } from "@/types/generation.types";

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60))}:${String(whole % 60).padStart(2, "0")}`;
};

/**
 * One speech generation, as a full-width row.
 *
 * Three zones rather than a stack: voice and script on the left, the waveform
 * filling the middle, playback and provenance and actions on the right. The
 * voice leads because that is what the reference puts first — the script is
 * the secondary line, not the headline.
 *
 * The frame keeps its exact height from Processing through to Ready, so a
 * staggered batch lands without the column reflowing under the cursor.
 */
export function WaveformRow({ generation }: { generation: Generation }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const actions = useGenerationActions(generation);

  const ready = generation.status === "ready";
  const duration = ready ? (generation.duration ?? 0) : 0;
  const progress = duration > 0 ? elapsed / duration : 0;

  const voice =
    generation.settings.kind === "audio" &&
    generation.settings.values.mode === "tts"
      ? voiceById(
          (generation.settings.values as { voiceId?: string }).voiceId ?? "",
        )
      : undefined;

  const model = audioModelById(generation.modelId);

  return (
    <article className="flex w-full items-center gap-4 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors hover:border-q-default motion-reduce:transition-none">
      <div className="flex w-56 min-w-0 shrink-0 items-center gap-3">
        <span
          aria-hidden
          className="size-10 shrink-0 rounded-q-300"
          /* Two hex stops from the catalogue — no image to host and none to
             404. A continuous gradient cannot be a utility class. */
          style={{
            backgroundImage: voice
              ? `linear-gradient(135deg, ${voice.avatar[0]}, ${voice.avatar[1]})`
              : "linear-gradient(135deg, #4ade80, #0f9d58)",
          }}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-q-menu text-q-fg">
            {voice?.name ?? "Voice"}
          </span>
          <span className="truncate text-q-caption-l text-q-soft">
            {generation.prompt}
          </span>
        </span>
      </div>

      {ready ? (
        <Waveform
          id={generation.id}
          duration={duration}
          progress={progress}
          onSeek={(fraction) => {
            const element = audio.current;
            if (!element || !duration) return;
            element.currentTime = fraction * duration;
            setElapsed(fraction * duration);
          }}
        />
      ) : (
        <div className="h-10 min-w-0 flex-1 animate-pulse rounded-q-200 bg-q-w-05 motion-reduce:animate-none" />
      )}

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          aria-label={
            playing
              ? `Pause “${generation.prompt}”`
              : `Play “${generation.prompt}”`
          }
          onClick={() => {
            const element = audio.current;
            if (!element) return;
            if (playing) {
              element.pause();
              setPlaying(false);
              return;
            }
            /* Only one row plays at a time. Pausing every other audio element
               is cruder than a shared playback context and needs no shared
               state to go wrong. */
            document.querySelectorAll("audio").forEach((other) => {
              if (other !== element) other.pause();
            });
            void element.play();
            setPlaying(true);
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-q-full text-q-fg transition-colors outline-none hover:bg-q-w-08 focus-visible:ring-2 focus-visible:ring-q-focus disabled:opacity-40 motion-reduce:transition-none"
        >
          <Icon name={playing ? "pause" : "play"} size={16} />
        </button>

        <span className="shrink-0 text-q-caption-l text-q-soft tabular-nums">
          {ready
            ? `${clock(elapsed)} / ${clock(duration)}`
            : generation.status === "processing"
              ? "Processing…"
              : "Generating…"}
        </span>

        <span className="hidden shrink-0 items-center gap-1.5 text-q-caption-l text-q-fg @[52rem]:flex">
          <Icon name="audio-lines" size={14} className="text-q-muted" />
          {model?.name ?? generation.modelId}
        </span>

        {/* Always visible, not revealed on hover — the reference keeps them up. */}
        <span className="flex shrink-0 items-center gap-1">
          <ActionButton
            icon="heart"
            label={generation.liked ? "Unlike" : "Like"}
            onAction={actions.toggleLike}
          />
          <ActionButton
            icon="copy"
            label="Copy prompt"
            onAction={() => navigator.clipboard?.writeText(generation.prompt)}
          />
          <ActionButton
            icon="download"
            label="Download"
            onAction={actions.download}
          />
          <ActionButton
            icon="trash-2"
            label="Delete"
            onAction={actions.remove}
          />
        </span>
      </div>

      {ready && (
        <audio
          ref={audio}
          src={generation.src}
          preload="metadata"
          onTimeUpdate={(event) => {
            setElapsed(event.currentTarget.currentTime);
          }}
          onEnded={() => {
            setPlaying(false);
            setElapsed(0);
          }}
        />
      )}
    </article>
  );
}
