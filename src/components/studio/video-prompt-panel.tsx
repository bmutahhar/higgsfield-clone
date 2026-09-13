"use client";

import { useState } from "react";
import Image from "next/image";

import { Icon } from "@/components/core/icon";
import { ModelPicker } from "@/components/studio/model-picker";
import { OptionPill } from "@/components/studio/option-pill";
import { PRESETS } from "@/config/media";
import { ASPECT_RATIOS, BITRATES, VIDEO_MODELS } from "@/config/models";
import { cn } from "@/lib/cn";

const MODES = ["Create Video", "Edit Video", "Motion Control"] as const;
const SOURCES = ["References", "Extend Video"] as const;

/**
 * The video studio's prompt panel: a fixed left rail, not a floating bar.
 * Every control below the prompt is a dropdown, and the model picker drives
 * the others — duration and resolution options come from the chosen model.
 */
export function VideoPromptPanel() {
  const [mode, setMode] = useState<string>(MODES[0]);
  const [source, setSource] = useState<string>(SOURCES[0]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(VIDEO_MODELS[0]);
  const [duration, setDuration] = useState("5s");
  const [aspect, setAspect] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [bitrate, setBitrate] = useState("High");
  const [audio, setAudio] = useState(true);

  const preset = PRESETS[4];

  // Switching model can invalidate the current duration/resolution, so the
  // dependent controls are reconciled rather than left showing a stale value.
  function selectModel(next: typeof model) {
    setModel(next);
    const durations = next.durations ?? [5];
    if (!durations.includes(Number(duration.replace("s", "")))) {
      setDuration(`${String(durations[0])}s`);
    }
    const resolutions = next.resolutions ?? ["1080p"];
    if (!resolutions.includes(resolution)) setResolution(resolutions[0]);
  }

  return (
    <aside className="hf-scrollbar flex w-85 shrink-0 flex-col gap-3 overflow-y-auto border-r border-hairline bg-page p-3">
      <div className="flex gap-4 border-b border-hairline">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
            }}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors duration-[140ms]",
              "focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0",
              mode === item
                ? "text-primary"
                : "text-muted hover:text-secondary",
            )}
          >
            {item}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full",
                mode === item ? "bg-accent" : "bg-transparent",
              )}
            />
          </button>
        ))}
      </div>

      <div className="relative aspect-16/10 overflow-hidden rounded-card border border-hairline bg-n-3">
        {preset && (
          <Image
            src={preset.poster}
            alt=""
            fill
            sizes="340px"
            className="object-cover"
          />
        )}
        <span className="absolute inset-0 bg-[image:var(--scrim-bottom)]" />
        <button
          type="button"
          className="absolute top-2.5 right-2.5 inline-flex h-7 items-center gap-1.5 rounded-full border border-w-16 bg-black/45 px-2.5 text-[12px] text-white backdrop-blur-sm transition-colors hover:bg-black/65"
        >
          <Icon name="pencil" size={12} />
          Change
        </button>
        <span className="absolute bottom-2.5 left-3">
          <span className="block text-[17px] font-bold tracking-[-0.01em] text-lime">
            GENERAL
          </span>
          <span className="mt-0.5 block text-[12px] text-w-80">
            {model.name}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-control bg-w-06 p-1">
        {SOURCES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={source === item}
            onClick={() => {
              setSource(item);
            }}
            className={cn(
              "h-8 rounded-lg text-[13px] font-medium transition-colors duration-[140ms]",
              "focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0",
              source === item
                ? "bg-n-5 text-primary"
                : "text-muted hover:text-secondary",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="flex flex-col items-center gap-2 rounded-card border border-hairline bg-w-04 px-3 py-6 transition-colors hover:border-strong focus-visible:shadow-ring focus-visible:outline-none"
      >
        <span className="flex gap-1.5">
          {(["image", "film", "music"] as const).map((glyph) => (
            <span
              key={glyph}
              className="flex size-7 items-center justify-center rounded-lg bg-w-06 text-muted"
            >
              <Icon name={glyph} size={14} />
            </span>
          ))}
        </span>
        <span className="text-[13px] text-secondary">Add references</span>
        <span className="text-[12px] text-muted">Image, Video or Audio</span>
      </button>

      <div className="rounded-card border border-hairline bg-w-04 p-3">
        <div className="text-[12px] text-secondary">Prompt</div>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          rows={4}
          aria-label="Prompt"
          placeholder="Describe the visual change you want — e.g., “Make it snow” or “Make it nighttime”. Add reference images or elements using @…"
          className="mt-1.5 w-full resize-none bg-transparent text-[13px]/[1.5] text-primary outline-none placeholder:text-muted"
        />
        <div className="mt-1 flex gap-1.5">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-w-06 px-2 text-[12px] text-secondary transition-colors hover:bg-w-12"
          >
            <Icon name="at-sign" size={12} />
            Elements
          </button>
          <button
            type="button"
            aria-pressed={audio}
            onClick={() => {
              setAudio(!audio);
            }}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[12px] transition-colors",
              audio ? "bg-w-06 text-secondary" : "bg-w-04 text-muted",
            )}
          >
            <Icon name={audio ? "volume-2" : "volume-off"} size={12} />
            {audio ? "On" : "Off"}
          </button>
        </div>
      </div>

      <ModelPicker
        models={VIDEO_MODELS}
        value={model}
        onChange={selectModel}
        variant="row"
      />

      <div className="grid grid-cols-3 gap-1.5">
        <OptionPill
          icon="clock"
          label="Duration"
          value={duration}
          options={(model.durations ?? [5]).map((d) => `${String(d)}s`)}
          onChange={setDuration}
        />
        <OptionPill
          icon="ratio"
          label="Aspect ratio"
          value={aspect}
          options={ASPECT_RATIOS.filter((r) => r !== "Auto")}
          onChange={setAspect}
        />
        <OptionPill
          icon="monitor"
          label="Resolution"
          value={resolution}
          options={model.resolutions ?? ["1080p"]}
          onChange={setResolution}
        />
      </div>

      <OptionPill
        icon="gauge"
        label="Bitrate"
        value={bitrate}
        options={BITRATES}
        onChange={setBitrate}
        variant="row"
      />

      <button
        type="button"
        className="mt-auto flex h-12 items-center justify-center gap-2 rounded-control bg-accent text-[14px] font-semibold text-on-accent transition-colors duration-[140ms] hover:bg-accent-hover focus-visible:shadow-ring focus-visible:outline-none active:scale-[0.99] motion-reduce:duration-0"
      >
        Generate
        <Icon name="sparkles" size={14} />
        {model.listCredits && (
          <span className="font-mono text-[12px] line-through opacity-55">
            {model.listCredits}
          </span>
        )}
        <span className="font-mono text-[13px]">{model.credits}</span>
      </button>
    </aside>
  );
}
