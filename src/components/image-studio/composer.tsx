"use client";

import { useEffect, useId, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Icon } from "@/components/core/icon";
import { BatchStepper } from "@/components/forms/batch-stepper";
import { GenerateCta } from "@/components/image-studio/generate-cta";
import { ModelDialog } from "@/components/image-studio/model-dialog";
import { PromptEditor } from "@/components/image-studio/prompt-editor";
import { ScrollRail } from "@/components/image-studio/scroll-rail";
import { PILL_CLASS } from "@/components/image-studio/setting-pill";
import { SettingPopover } from "@/components/image-studio/setting-popover";
import {
  ASPECT_RATIOS,
  BACKGROUNDS,
  MAX_BATCH,
  modelById,
  QUALITIES,
  RESOLUTIONS,
} from "@/config/image-studio";
import { cn } from "@/lib/cn";
import {
  imageGenerationSchema,
  type ImageGenerationValues,
} from "@/schemas/image-generation";
import type { ComposerDraft } from "@/types/generation.types";

export interface ComposerProps {
  /**
   * Which model the bar opens on. Resolved from the URL by the route, so the
   * header's hover menu can deep-link straight into a model.
   */
  modelId: string;
  /**
   * A recipe to load, sent by Recreate or Reuse on a tile. Merged over
   * whatever is currently in the bar, so a draft without a prompt leaves the
   * written one alone.
   */
  draft?: ComposerDraft | null;
  /** Called with validated values. Wire to the generation service. */
  onGenerate?: (values: ImageGenerationValues) => void;
}

/*
 * The image studio's composer: a floating panel pinned to the bottom of the
 * canvas, capped at 1120px and centred.
 *
 * Two rings on purpose — a 2px outer shell at 26px radius over a 24px form —
 * which is what gives the bar its inlaid edge. The form's border is brand lime
 * at 5%, not a white hairline.
 *
 * Hidden below `md`: the live studio has no mobile composer, it has a bottom
 * tab bar that routes elsewhere.
 *
 * Every control is a form field rather than a piece of local state, so the
 * whole bar validates as one object against `imageGenerationSchema`. The
 * settings are custom popovers rather than native inputs, which is why they go
 * through `Controller` instead of `register`.
 */
export function Composer({ modelId, draft, onGenerate }: ComposerProps) {
  const errorId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<ImageGenerationValues>({
    resolver: zodResolver(imageGenerationSchema),
    /*
     * Validate on submit, not on change. The live Generate button stays live
     * on an empty prompt and says nothing until you press it, and an error
     * that appears while you are still typing the first word is worse than
     * useless.
     */
    mode: "onSubmit",
    defaultValues: {
      prompt: "",
      modelId,
      aspectRatio: "Auto",
      quality: "High",
      /*
       * Safe against any preselected model: every model in the catalogue
       * renders at 2K, so arriving on one from a deep link never starts the
       * form on a pairing `imageGenerationSchema` would reject.
       */
      resolution: "2K",
      background: "Auto",
      batch: 1,
    },
  });

  /*
   * Recreate, arriving from a tile.
   *
   * A whole-form reset rather than field-by-field `setValue`: a recipe is one
   * object, and `reset` also clears an error left over from a failed submit.
   * Merging over the current values is what lets Reuse send the settings
   * without a prompt and leave whatever is already written.
   *
   * Keyed on the draft's identity, which is new on every press — so recreating
   * the same tile twice works, and StrictMode's double-invoked effects are
   * harmless because the reset is idempotent.
   *
   * The model is left to the form here, not pushed to the URL: this bar reads
   * every option off its own field, so nothing downstream is looking at the
   * route. The video panel is the opposite and does the opposite.
   */
  useEffect(() => {
    if (draft?.kind !== "image") return;
    reset({ ...getValues(), ...draft.values });
    /*
     * Deferred a tick. `reset` re-registers the fields, so focusing in the
     * same turn asks for a ref the reset is in the middle of replacing and
     * the caret never lands — verified in the browser, not assumed.
     */
    const landing = setTimeout(() => {
      setFocus("prompt");
    }, 0);
    return () => {
      clearTimeout(landing);
    };
  }, [draft, reset, getValues, setFocus]);

  /*
   * `useWatch` rather than the `watch()` returned by useForm: watch() is a
   * fresh function every render, which the React Compiler cannot memoize, so
   * it bails out of optimising this whole component. These subscribe to one
   * field each and re-render only when that field moves.
   */
  const model = modelById(useWatch({ control, name: "modelId" }));
  const resolution = useWatch({ control, name: "resolution" });
  const batch = useWatch({ control, name: "batch" });
  const tier = model.price[resolution];

  const message = errors.prompt?.message ?? errors.resolution?.message;

  return (
    <div className="q-composer-sheen fixed bottom-4 left-1/2 z-50 hidden w-full max-w-[1120px] -translate-x-1/2 flex-col items-center justify-center rounded-[26px] bg-q-composer p-0.5 md:flex">
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit((values) => onGenerate?.(values))(event);
        }}
        className={cn(
          "w-full rounded-q-600 border p-5.5 backdrop-blur-[10.45px]",
          message === undefined ? "border-q-accent-05" : "border-q-danger/50",
        )}
      >
        <fieldset className="relative z-2 flex min-w-0 gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hf-sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
              {/*
                Optically centred against the 40px editor row rather than
                boxed to it — the live button carries the same 5.5px lift.
              */}
              <button
                type="button"
                aria-label="Add reference image"
                onClick={() => {
                  fileRef.current?.click();
                }}
                className="relative -top-[5.5px] flex size-8 shrink-0 items-center justify-center self-start rounded-q-250 border border-q-accent-10 bg-[#1b1b1b] text-white transition-colors hover:bg-q-accent-05 hover:text-q-accent focus-visible:ring-2 focus-visible:ring-q-accent/50 focus-visible:outline-none"
              >
                <Icon name="plus" size={16} />
              </button>

              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="prompt"
                  render={({ field }) => (
                    <PromptEditor
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      invalid={errors.prompt !== undefined}
                      describedBy={message === undefined ? undefined : errorId}
                    />
                  )}
                />
              </div>
            </div>

            {message !== undefined && (
              <p
                id={errorId}
                role="alert"
                className="pl-11 text-q-caption-xs font-normal text-q-danger"
              >
                {message}
              </p>
            )}

            <div className="flex h-10 min-w-0 items-center gap-2">
              <Controller
                control={control}
                name="modelId"
                render={({ field }) => (
                  <ModelDialog
                    value={modelById(field.value)}
                    onChange={(next) => {
                      field.onChange(next.id);
                      /*
                       * A model that does not offer the current resolution
                       * falls back to its own first, rather than leaving the
                       * pill showing something unbuyable.
                       */
                      if (!next.resolutions.includes(resolution)) {
                        setValue("resolution", next.resolutions[0], {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />

              <ScrollRail>
                <Controller
                  control={control}
                  name="aspectRatio"
                  render={({ field }) => (
                    <SettingPopover
                      title="Aspect ratio"
                      icon="maximize"
                      value={field.value}
                      onChange={field.onChange}
                      width={200}
                      options={ASPECT_RATIOS.map((ratio) => ({
                        id: ratio.id,
                        icon: "maximize" as const,
                        ratio:
                          ratio.w && ratio.h
                            ? { w: ratio.w, h: ratio.h }
                            : undefined,
                      }))}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="quality"
                  render={({ field }) => (
                    <SettingPopover
                      title="Select quality"
                      icon="gem"
                      value={field.value}
                      onChange={field.onChange}
                      width={300}
                      options={QUALITIES}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="resolution"
                  render={({ field }) => (
                    <SettingPopover
                      title="Select resolution"
                      icon="gem"
                      value={field.value}
                      onChange={field.onChange}
                      width={300}
                      options={model.resolutions.map((id) => ({
                        id,
                        description: RESOLUTIONS[id],
                      }))}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="background"
                  render={({ field }) => (
                    <SettingPopover
                      title="Select background"
                      icon="scan"
                      value={field.value}
                      onChange={field.onChange}
                      width={240}
                      options={BACKGROUNDS}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="batch"
                  render={({ field }) => (
                    <BatchStepper
                      value={field.value}
                      max={MAX_BATCH}
                      onChange={field.onChange}
                      /* The composer's own control shape, which the stepper
                         no longer assumes — the audio panel draws a different
                         one around the same buttons. */
                      className={PILL_CLASS}
                    />
                  )}
                />
              </ScrollRail>
            </div>
          </div>

          <aside className="relative z-20 flex h-21 items-end justify-end gap-3 self-end">
            <GenerateCta list={tier.list * batch} net={tier.net * batch} />
          </aside>
        </fieldset>
      </form>
    </div>
  );
}
