"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { DropZone } from "@/components/studio/drop-zone";
import { FormTabs } from "@/components/studio/form-tabs";
import { GenerateButton } from "@/components/studio/generate-button";
import { GenjutsuModelSelect } from "@/components/studio/genjutsu-model-select";
import { ModePreview } from "@/components/studio/mode-preview";
import { PromoCard } from "@/components/studio/promo-card";
import { PromptField } from "@/components/studio/prompt-field";
import { QSelect } from "@/components/studio/q-select";
import { QTabs } from "@/components/studio/q-tabs";
import { readVideoDuration } from "@/components/studio/read-video-duration";
import { type GenjutsuMode, MODE_ORDER, MODES } from "@/config/genjutsu";
import { GENJUTSU_QUALITY, videoModelById } from "@/config/models";
import {
  videoGenerationSchema,
  type VideoGenerationValues,
} from "@/schemas/video-generation";

export interface GenerateFormProps {
  /** Resolved from `?model=` by the route, so a model is deep-linkable. */
  modelId: string;
  onModelChange: (id: string) => void;
  onHowItWorks: () => void;
  /** Called with validated values only. */
  onSubmit: (values: VideoGenerationValues) => void;
}

/**
 * The left column: everything that describes a generation, plus the button that
 * would start one.
 *
 * Every control is a form field rather than a piece of local state, so the
 * panel validates as one object against `videoGenerationSchema` — the same
 * contract the image composer uses. The controls are custom (segmented tabs,
 * drop zones, popover selects), none of them native inputs, which is why they
 * all go through `Controller` rather than `register`.
 *
 * Mode is still the panel's centre of gravity: switching it rewrites both drop
 * zones, the image cap and the prompt placeholder at once. That copy lives in
 * one record keyed by mode, and the cap is enforced by the schema rather than
 * restated here.
 */
export function GenerateForm({
  modelId,
  onModelChange,
  onHowItWorks,
  onSubmit,
}: GenerateFormProps) {
  const errorId = useId();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VideoGenerationValues>({
    resolver: zodResolver(videoGenerationSchema),
    /*
     * Validate on submit. The live Generate button stays live on an empty form
     * and says nothing until pressed; an error that appears while you are still
     * attaching your first clip is worse than useless.
     */
    mode: "onSubmit",
    defaultValues: {
      mode: "motion",
      modelId,
      quality: "720p",
      promptEnabled: false,
      prompt: "",
      referenceVideo: null,
      referenceImages: [],
    },
  });

  /*
   * One field each, so a change to the prompt does not re-render the drop
   * zones. `watch()` would be a new function every render and would stop the
   * React Compiler optimising this component at all.
   */
  const mode = useWatch({ control, name: "mode" });
  const quality = useWatch({ control, name: "quality" });
  const copy = MODES[mode];
  const model = videoModelById(modelId);
  const qualities = model?.resolutions ?? [...GENJUTSU_QUALITY];

  /* The URL can change under us — a back button, a pasted link. */
  useEffect(() => {
    if (getValues("modelId") !== modelId) {
      setValue("modelId", modelId, { shouldValidate: false });
    }
  }, [modelId, getValues, setValue]);

  // The preview is a portal pinned to a measured tab, so it needs coordinates.
  const [peek, setPeek] = useState<GenjutsuMode | null>(null);
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);

  const peeked = peek ? MODES[peek] : null;

  const onPeek = useCallback((id: string | null) => {
    if (!id) {
      setPeek(null);
      return;
    }
    const box = tabsRef.current?.getBoundingClientRect();
    if (box) setAnchor({ top: box.top + box.height / 2, left: box.right + 12 });
    setPeek(id as GenjutsuMode);
  }, []);

  /*
   * One message, pinned above the button rather than beside its control: the
   * panel scrolls and the footer does not, so an error next to a field could
   * be reported somewhere the reader cannot see.
   */
  /*
   * Whatever failed, not a hand-picked list of fields.
   *
   * Naming the fields individually meant a failure on any other one — `mode`,
   * `modelId` — rendered nothing at all: the form would refuse to submit and
   * say nothing about why. Reading the error map itself means a rule can never
   * be added to the schema without the panel being able to report it.
   */
  const [failedField, failure] = Object.entries(errors)[0] ?? [];
  const message = failure?.message;

  return (
    <div className="hidden max-h-full min-h-0 min-w-0 flex-col self-start overflow-hidden rounded-q-500 border border-q-hairline bg-q-panel md:flex">
      <FormTabs />

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="flex min-h-0 shrink-0 flex-col overflow-hidden"
      >
        <div className="hf-scrollbar-none flex max-h-[calc(100vh-16rem)] shrink-0 flex-col gap-4 overflow-x-visible overflow-y-auto p-2">
          <PromoCard onHowItWorks={onHowItWorks} />

          <div className="flex flex-col">
            <div ref={tabsRef}>
              <Controller
                control={control}
                name="mode"
                render={({ field }) => (
                  <QTabs
                    label="Generation mode"
                    items={MODE_ORDER.map((id) => ({
                      id,
                      label: MODES[id].label,
                      icon:
                        MODES[id].icon === "swap" ? "replace" : "circle-dashed",
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    onItemPeek={onPeek}
                    fill
                  />
                )}
              />
            </div>

            <div className="relative mt-2 flex flex-col gap-2">
              <Controller
                control={control}
                name="referenceVideo"
                render={({ field }) => (
                  <DropZone
                    title={copy.videoTitle}
                    hint={copy.videoHint}
                    icons={["video"]}
                    accept="video/*"
                    files={field.value ? [field.value.file] : []}
                    onFilesChange={(files) => {
                      const file = files[0];
                      if (!file) {
                        field.onChange(null);
                        return;
                      }
                      /*
                       * Land the file immediately and fill the duration in when
                       * the decode returns — waiting would leave the zone empty
                       * for a beat after an obviously successful pick.
                       */
                      field.onChange({ file, duration: null });
                      void readVideoDuration(file).then((duration) => {
                        field.onChange({ file, duration });
                      });
                    }}
                    onBlur={field.onBlur}
                    invalid={errors.referenceVideo !== undefined}
                    describedBy={
                      failedField === "referenceVideo" && message !== undefined
                        ? errorId
                        : undefined
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name="referenceImages"
                render={({ field }) => (
                  <DropZone
                    title={copy.imageTitle}
                    hint={`Up to ${String(copy.imageLimit)} images`}
                    icons={["user-round", "shirt", "package"]}
                    accept="image/*"
                    multiple
                    files={field.value}
                    onFilesChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={errors.referenceImages !== undefined}
                    describedBy={
                      failedField === "referenceImages" && message !== undefined
                        ? errorId
                        : undefined
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name="promptEnabled"
                render={({ field: toggle }) => (
                  <Controller
                    control={control}
                    name="prompt"
                    render={({ field: text }) => (
                      <PromptField
                        enabled={toggle.value}
                        onEnabledChange={toggle.onChange}
                        value={text.value}
                        onValueChange={text.onChange}
                        onBlur={text.onBlur}
                        ref={text.ref}
                        placeholder={copy.promptPlaceholder}
                        invalid={errors.prompt !== undefined}
                        describedBy={
                          failedField === "prompt" && message !== undefined
                            ? errorId
                            : undefined
                        }
                      />
                    )}
                  />
                )}
              />
            </div>

            <div className="mt-3 flex flex-col self-stretch md:mt-4">
              <GenjutsuModelSelect
                modelId={modelId}
                onSelect={(id) => {
                  setValue("modelId", id, { shouldValidate: false });
                  /*
                   * A model that does not offer the current quality falls back
                   * to its own first, rather than leaving the pill showing
                   * something the model cannot render.
                   */
                  const next = videoModelById(id);
                  const supported = next?.resolutions;
                  if (supported && !supported.includes(quality)) {
                    setValue("quality", supported[0] ?? GENJUTSU_QUALITY[0], {
                      shouldValidate: true,
                    });
                  }
                  onModelChange(id);
                }}
              />
            </div>

            <Controller
              control={control}
              name="quality"
              render={({ field }) => (
                <QSelect
                  label="Quality"
                  name={field.name}
                  value={field.value}
                  options={qualities}
                  onChange={field.onChange}
                  invalid={errors.quality !== undefined}
                  describedBy={
                    failedField === "quality" && message !== undefined
                      ? errorId
                      : undefined
                  }
                  className="mt-2"
                />
              )}
            />
          </div>
        </div>

        <div className="relative w-full shrink-0 space-y-2 rounded-b-q-500 px-2 py-3">
          {message !== undefined && (
            <p
              id={errorId}
              role="alert"
              className="px-1 text-q-label-xs text-q-danger"
            >
              {message}
            </p>
          )}
          <GenerateButton />
        </div>
      </form>

      <ModePreview
        mode={peeked}
        open={Boolean(peeked)}
        top={anchor.top}
        left={anchor.left}
      />
    </div>
  );
}
