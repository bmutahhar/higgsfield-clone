"use client";

import { useState } from "react";

import { Icon } from "@/components/core/icon";
import { ModelPicker } from "@/components/studio/model-picker";
import { OptionPill } from "@/components/studio/option-pill";
import { ASPECT_RATIOS, IMAGE_MODELS, IMAGE_QUALITY } from "@/config/models";

const MAX_BATCH = 4;

/**
 * The image studio's composer: a floating bar over the canvas, not a rail.
 * Same dropdown primitives as the video panel, laid out horizontally.
 */
export function ImageComposer() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(IMAGE_MODELS[0]);
  const [aspect, setAspect] = useState("Auto");
  const [quality, setQuality] = useState("High");
  const [resolution, setResolution] = useState("2K");
  const [style, setStyle] = useState("Auto");
  const [batch, setBatch] = useState(1);

  function selectModel(next: typeof model) {
    setModel(next);
    const resolutions = next.resolutions ?? ["2K"];
    if (!resolutions.includes(resolution)) setResolution(resolutions[0]);
  }

  const cost = (model.credits * batch).toFixed(1).replace(/\.0$/, "");
  const listCost = model.listCredits
    ? (model.listCredits * batch).toFixed(1).replace(/\.0$/, "")
    : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto mx-auto max-w-4xl rounded-panel border border-hairline bg-glass p-3 shadow-e3 backdrop-blur-[20px] backdrop-saturate-[1.4]">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            aria-label="Add reference"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-w-06 text-secondary transition-colors hover:bg-w-12 focus-visible:shadow-ring focus-visible:outline-none"
          >
            <Icon name="plus" size={15} />
          </button>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            rows={1}
            aria-label="Prompt"
            placeholder="Describe the scene you imagine"
            className="min-h-8 flex-1 resize-none bg-transparent py-1 text-[14px] text-primary outline-none placeholder:text-muted"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <ModelPicker
            models={IMAGE_MODELS}
            value={model}
            onChange={selectModel}
            variant="pill"
          />
          <OptionPill
            icon="ratio"
            label="Aspect ratio"
            value={aspect}
            options={ASPECT_RATIOS}
            onChange={setAspect}
          />
          <OptionPill
            icon="sparkle"
            label="Quality"
            value={quality}
            options={IMAGE_QUALITY}
            onChange={setQuality}
          />
          <OptionPill
            icon="monitor"
            label="Resolution"
            value={resolution}
            options={model.resolutions ?? ["2K"]}
            onChange={setResolution}
          />
          <OptionPill
            icon="palette"
            label="Style"
            value={style}
            options={["Auto", "Photoreal", "Cinematic", "Illustration"]}
            onChange={setStyle}
          />

          {/* Batch size is a stepper on the live bar, not a dropdown. */}
          <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-hairline bg-w-06 px-1.5">
            <button
              type="button"
              aria-label="Fewer images"
              disabled={batch <= 1}
              onClick={() => {
                setBatch((n) => Math.max(1, n - 1));
              }}
              className="flex size-5 items-center justify-center rounded text-muted transition-colors hover:text-primary disabled:opacity-35"
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="font-mono text-[12px] text-primary">
              {batch}/{MAX_BATCH}
            </span>
            <button
              type="button"
              aria-label="More images"
              disabled={batch >= MAX_BATCH}
              onClick={() => {
                setBatch((n) => Math.min(MAX_BATCH, n + 1));
              }}
              className="flex size-5 items-center justify-center rounded text-muted transition-colors hover:text-primary disabled:opacity-35"
            >
              <Icon name="plus" size={12} />
            </button>
          </div>

          <span className="flex-1" />

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-control bg-accent px-4 text-[14px] font-semibold text-on-accent transition-colors duration-[140ms] hover:bg-accent-hover focus-visible:shadow-ring focus-visible:outline-none active:scale-[0.99] motion-reduce:duration-0"
          >
            Generate
            <Icon name="sparkles" size={14} />
            {listCost && (
              <span className="font-mono text-[12px] line-through opacity-55">
                {listCost}
              </span>
            )}
            <span className="font-mono text-[13px]">{cost}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
