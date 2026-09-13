"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AdvancedSettings } from "@/components/audio-studio/advanced-settings";
import { AudioCta } from "@/components/audio-studio/audio-cta";
import { AudioModelPopover } from "@/components/audio-studio/audio-model-popover";
import { ScriptField } from "@/components/audio-studio/script-field";
import { AudioSettingRow } from "@/components/audio-studio/setting-row";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { BatchStepper } from "@/components/forms/batch-stepper";
import {
  MAX_ATTACHMENTS,
  MAX_BATCH,
  VOICE_DETAILS_MAX_LENGTH,
} from "@/config/audio";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
  ttsDefaults,
} from "@/schemas/audio-generation";

export function TtsForm({
  modelId,
  onModelChange,
  onSubmit,
}: {
  modelId: string;
  onModelChange: (id: string) => void;
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit, setValue } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    /*
     * Validate on submit. The live Generate button says nothing until pressed;
     * an error that appears while you are still attaching your first file is
     * worse than useless.
     */
    mode: "onSubmit",
    defaultValues: ttsDefaults(modelId),
  });

  const script = useWatch({ control, name: "script" });
  const batch = useWatch({ control, name: "batch" });
  const attachments = useWatch({ control, name: "attachments" });

  /*
   * The gate is the script, confirmed against the reference: filling Voice
   * details alone leaves Generate disabled.
   */
  const ready = typeof script === "string" && script.trim().length > 0;
  const files = (attachments as File[] | undefined) ?? [];

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3"
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="attachments"
          render={({ field }) => (
            <UploadZone
              title="Upload media"
              hint="Up to 3 Voices/Audios or Image"
              badge="Optional"
              max={MAX_ATTACHMENTS}
              files={field.value ?? []}
              onFilesChange={field.onChange}
              pickers={[
                {
                  icon: "audio-lines",
                  accept: "audio/*",
                  label: "Add a voice",
                },
                { icon: "music", accept: "audio/*", label: "Add audio" },
                { icon: "image", accept: "image/*", label: "Add an image" },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="script"
          render={({ field, fieldState }) => (
            <ScriptField
              value={field.value ?? ""}
              onChange={field.onChange}
              attachments={files.map((file) => file.name)}
              invalid={Boolean(fieldState.error)}
            />
          )}
        />

        <AudioModelPopover
          value={modelId}
          onChange={(id) => {
            onModelChange(id);
            setValue("modelId", id);
            /* Re-derive the advanced block so the new model's sample-rate
               range applies — otherwise the schema rejects a pairing the
               panel is still showing. */
            setValue("advanced", ttsDefaults(id).advanced);
          }}
        />

        <Controller
          control={control}
          name="batch"
          render={({ field }) => (
            <AudioSettingRow
              label="Batch size"
              className="hidden md:flex"
              trailing={
                <BatchStepper
                  max={MAX_BATCH}
                  value={field.value ?? 1}
                  onChange={field.onChange}
                />
              }
            />
          )}
        />

        <Controller
          control={control}
          name="voiceDetails"
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? "";
            return (
              <section className="relative flex w-full shrink-0 flex-col gap-1 rounded-q-300 border border-q-subtle bg-q-w-05 p-3 transition-colors focus-within:border-q-default motion-reduce:transition-none">
                <span className="pointer-events-none absolute top-1.5 right-1.5 rounded-q-300 bg-q-w-05 px-2 py-1 text-q-caption-xs font-medium tracking-normal text-q-soft">
                  Optional
                </span>
                <label
                  htmlFor="audio-voice-details"
                  className="text-q-menu text-q-soft"
                >
                  Voice details
                </label>
                <textarea
                  id="audio-voice-details"
                  rows={3}
                  maxLength={VOICE_DETAILS_MAX_LENGTH}
                  value={value}
                  onChange={field.onChange}
                  placeholder="e.g. Young female voice with british accent, soft and loud. Excited, giggling"
                  /* The gutter trick: the scrollbar sits in the padding
                     rather than shortening the text. */
                  className="minimal-scrollbar -mr-2 w-[calc(100%+8px)] resize-none [scrollbar-gutter:stable] overflow-y-auto bg-transparent pr-1 text-q-caption-l font-normal text-q-fg outline-none placeholder:text-q-soft"
                />
                <span className="mt-0.5 self-end text-q-caption-xs font-medium tracking-normal text-q-w-40 tabular-nums">
                  {value.length} / {VOICE_DETAILS_MAX_LENGTH}
                </span>
              </section>
            );
          }}
        />

        <Controller
          control={control}
          name="advanced"
          render={({ field }) => (
            <AdvancedSettings
              modelId={modelId}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="batch"
        render={({ field }) => (
          <AudioCta
            disabled={!ready}
            cost={ready ? audioCost("tts", modelId, batch ?? 1) : null}
            leading={
              <div className="flex h-14 items-center rounded-q-300 border border-q-subtle bg-q-w-05 px-3">
                {/* No ceiling here: the reference shows a bare count in the
                    footer and the limit only in the row. */}
                <BatchStepper
                  showMax={false}
                  max={MAX_BATCH}
                  value={field.value ?? 1}
                  onChange={field.onChange}
                />
              </div>
            }
          />
        )}
      />
    </form>
  );
}
