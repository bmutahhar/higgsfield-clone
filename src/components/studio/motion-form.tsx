"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { GenjutsuModelSelect } from "@/components/studio/genjutsu-model-select";
import { PairedDropZone } from "@/components/studio/paired-drop-zone";
import { readVideoDuration } from "@/components/studio/read-video-duration";
import { SceneControlCard } from "@/components/studio/scene-control-card";
import { SettingRow } from "@/components/studio/setting-row";
import { StudioPanel } from "@/components/studio/studio-panel";
import { videoModelById } from "@/config/models";
import {
  MOTION_COPY,
  MOTION_PROMO,
  MOTION_QUALITIES,
  MOTION_QUALITY_DEFAULT,
} from "@/config/video-motion";
import {
  videoMotionSchema,
  type VideoMotionValues,
} from "@/schemas/video-motion";

export interface MotionFormProps {
  modelId: string;
  onModelChange: (id: string) => void;
  onHowItWorks: () => void;
  onSubmit: (values: VideoMotionValues) => void;
}

/**
 * The Motion Control panel.
 *
 * Its two inputs are framed as one object because they are halves of a single
 * instruction — this motion, that performer — and the schema requires both.
 */
export function MotionForm({
  modelId,
  onModelChange,
  onHowItWorks,
  onSubmit,
}: MotionFormProps) {
  const errorId = useId();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VideoMotionValues>({
    resolver: zodResolver(videoMotionSchema),
    mode: "onSubmit",
    defaultValues: {
      modelId,
      quality: MOTION_QUALITY_DEFAULT,
      motionVideo: null,
      characterImage: null,
      sceneControl: true,
      sceneSource: "image",
    },
  });

  const model = videoModelById(modelId);
  const qualities = model?.resolutions ?? [...MOTION_QUALITIES];

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
      activeTab="motion"
      promo={{
        ...MOTION_PROMO,
        action: { label: "How it works", onClick: onHowItWorks },
      }}
      onSubmit={() => {
        void handleSubmit(onSubmit)();
      }}
      message={message}
      errorId={errorId}
      cost={{ list: model?.listCredits, net: model?.credits }}
    >
      <Controller
        control={control}
        name="motionVideo"
        render={({ field: motion }) => (
          <Controller
            control={control}
            name="characterImage"
            render={({ field: character }) => (
              <PairedDropZone
                slots={[
                  {
                    title: MOTION_COPY.motionTitle,
                    hint: MOTION_COPY.motionHint,
                    icon: "video",
                    accept: "video/*",
                    file: motion.value?.file ?? null,
                    invalid: errors.motionVideo !== undefined,
                    onFileChange: (file) => {
                      if (!file) {
                        motion.onChange(null);
                        return;
                      }
                      motion.onChange({ file, duration: null });
                      void readVideoDuration(file).then((duration) => {
                        motion.onChange({ file, duration });
                      });
                    },
                  },
                  {
                    title: MOTION_COPY.characterTitle,
                    hint: MOTION_COPY.characterHint,
                    icon: "user-round",
                    accept: "image/*",
                    file: character.value,
                    invalid: errors.characterImage !== undefined,
                    onFileChange: character.onChange,
                  },
                ]}
              />
            )}
          />
        )}
      />

      <div className="mt-2">
        <GenjutsuModelSelect modelId={modelId} onSelect={onModelChange} />
      </div>

      <Controller
        control={control}
        name="quality"
        render={({ field }) => (
          <SettingRow
            className="mt-2"
            label="Quality"
            bordered
            value={field.value}
            options={qualities}
            onChange={field.onChange}
            invalid={errors.quality !== undefined}
            describedBy={describedBy("quality")}
          />
        )}
      />

      <div className="mt-2">
        <Controller
          control={control}
          name="sceneControl"
          render={({ field: enabled }) => (
            <Controller
              control={control}
              name="sceneSource"
              render={({ field: source }) => (
                <SceneControlCard
                  enabled={enabled.value}
                  onEnabledChange={enabled.onChange}
                  source={source.value}
                  onSourceChange={source.onChange}
                />
              )}
            />
          )}
        />
      </div>
    </StudioPanel>
  );
}
