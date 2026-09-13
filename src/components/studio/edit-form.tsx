"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Icon } from "@/components/core/icon";
import { DropZone } from "@/components/studio/drop-zone";
import { PromptBlock } from "@/components/studio/prompt-block";
import { readVideoDuration } from "@/components/studio/read-video-duration";
import { SettingRow } from "@/components/studio/setting-row";
import { StudioPanel } from "@/components/studio/studio-panel";
import { videoModelById } from "@/config/models";
import {
  BITRATE_DEFAULT,
  BITRATES,
  EDIT_COPY,
  EDIT_MODES,
  EDIT_PROMO,
  EDIT_RESOLUTION_DEFAULT,
  EDIT_RESOLUTIONS,
} from "@/config/video-edit";
import { cn } from "@/lib/cn";
import { videoEditSchema, type VideoEditValues } from "@/schemas/video-edit";

export interface EditFormProps {
  modelId: string;
  onChangeModel: () => void;
  onSubmit: (values: VideoEditValues) => void;
}

/**
 * The Edit Video panel.
 *
 * Shares the shell with the other two surfaces and differs only in its fields:
 * dashed zones, a prompt that is always open, and a settings row rather than a
 * single quality select.
 */
export function EditForm({ modelId, onChangeModel, onSubmit }: EditFormProps) {
  const errorId = useId();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VideoEditValues>({
    resolver: zodResolver(videoEditSchema),
    mode: "onSubmit",
    defaultValues: {
      mode: "prompt",
      modelId,
      prompt: "",
      referenceVideo: null,
      elements: [],
      resolution: EDIT_RESOLUTION_DEFAULT,
      bitrate: BITRATE_DEFAULT,
      audio: true,
    },
  });

  const mode = useWatch({ control, name: "mode" });
  const model = videoModelById(modelId);
  const resolutions = model?.resolutions ?? [...EDIT_RESOLUTIONS];

  /* The URL can change under us — a back button, a pasted link. */
  useEffect(() => {
    if (getValues("modelId") !== modelId) {
      setValue("modelId", modelId, { shouldValidate: false });
    }
  }, [modelId, getValues, setValue]);

  const [failedField, failure] = Object.entries(errors)[0] ?? [];
  const message = failure?.message;
  const describedBy = (field: string) =>
    failedField === field && message !== undefined ? errorId : undefined;

  return (
    <StudioPanel
      activeTab="edit"
      promo={{
        ...EDIT_PROMO,
        action: { label: "Change", icon: "pencil", onClick: onChangeModel },
      }}
      onSubmit={() => {
        void handleSubmit(onSubmit)();
      }}
      message={message}
      errorId={errorId}
      cost={{ list: model?.listCredits, net: model?.credits }}
    >
      {/*
        Two buttons, so a local control rather than a third QTabs variant. The
        active pill is a flat wash here, not the gradient the segmented control
        draws elsewhere.
      */}
      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <div
            role="tablist"
            aria-label="Edit method"
            className="grid grid-cols-2 gap-1 rounded-q-300 bg-q-w-05 p-1"
          >
            {EDIT_MODES.map((option) => {
              const active = option.id === field.value;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => field.onChange(option.id)}
                  className={cn(
                    "inline-flex h-8 items-center justify-center gap-2 rounded-q-200 text-q-caption-m transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-q-focus motion-reduce:transition-none",
                    active
                      ? "bg-white/10 text-q-fg"
                      : "text-q-idle-soft hover:text-q-fg",
                  )}
                >
                  <Icon name={option.icon} size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      />

      <div className="mt-2 flex flex-col gap-2">
        <Controller
          control={control}
          name="referenceVideo"
          render={({ field }) => (
            <DropZone
              variant="dashed"
              title={[EDIT_COPY.videoTitle, ""]}
              hint={EDIT_COPY.videoHint}
              icons={["video"]}
              accept="video/*"
              files={field.value ? [field.value.file] : []}
              onFilesChange={(files) => {
                const file = files[0];
                if (!file) {
                  field.onChange(null);
                  return;
                }
                field.onChange({ file, duration: null });
                void readVideoDuration(file).then((duration) => {
                  field.onChange({ file, duration });
                });
              }}
              onBlur={field.onBlur}
              invalid={errors.referenceVideo !== undefined}
              describedBy={describedBy("referenceVideo")}
            />
          )}
        />

        <Controller
          control={control}
          name="elements"
          render={({ field }) => (
            <DropZone
              variant="dashed"
              title={[EDIT_COPY.elementsTitle, ""]}
              hint={EDIT_COPY.elementsHint}
              icons={["image", "music"]}
              accept="image/*,audio/*"
              multiple
              files={field.value}
              onFilesChange={field.onChange}
              onBlur={field.onBlur}
              invalid={errors.elements !== undefined}
              describedBy={describedBy("elements")}
            />
          )}
        />

        <Controller
          control={control}
          name="audio"
          render={({ field: audio }) => (
            <Controller
              control={control}
              name="prompt"
              render={({ field: text }) => (
                <PromptBlock
                  value={text.value}
                  onValueChange={text.onChange}
                  onBlur={text.onBlur}
                  ref={text.ref}
                  placeholder={
                    mode === "draw"
                      ? EDIT_COPY.drawPlaceholder
                      : EDIT_COPY.promptPlaceholder
                  }
                  invalid={errors.prompt !== undefined}
                  describedBy={describedBy("prompt")}
                  audio={audio.value}
                  onAudioChange={audio.onChange}
                  onElements={() => {
                    /* The element picker is not built; focus the editor. */
                  }}
                />
              )}
            />
          )}
        />
      </div>

      <fieldset className="mt-3 grid grid-cols-[5rem_1fr] gap-2">
        <Controller
          control={control}
          name="resolution"
          render={({ field }) => (
            <SettingRow
              label="Resolution"
              layout="compact"
              value={field.value}
              options={resolutions}
              onChange={field.onChange}
              invalid={errors.resolution !== undefined}
              describedBy={describedBy("resolution")}
            />
          )}
        />
        <Controller
          control={control}
          name="bitrate"
          render={({ field }) => (
            <SettingRow
              label="Bitrate"
              layout="compact"
              accent
              icon="gauge"
              value={field.value}
              options={BITRATES}
              onChange={field.onChange}
            />
          )}
        />
      </fieldset>
    </StudioPanel>
  );
}
