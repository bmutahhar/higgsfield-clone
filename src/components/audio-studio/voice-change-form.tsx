"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AudioCta } from "@/components/audio-studio/audio-cta";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
  voiceChangeDefaults,
} from "@/schemas/audio-generation";

/** A zone holds at most one file here, so the array/File edge is bridged once. */
const one = (file: File | null) => (file ? [file] : []);

export function VoiceChangeForm({
  onSubmit,
}: {
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    mode: "onSubmit",
    defaultValues: voiceChangeDefaults(),
  });

  const voice = useWatch({ control, name: "voice" });
  const clip = useWatch({ control, name: "clip" });
  const ready = Boolean(voice) && Boolean(clip);

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
          name="voice"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Pick a voice"
              hint="Choose a preset or an uploaded voice"
              badge="Required"
              max={1}
              files={one(field.value)}
              onFilesChange={(files) => {
                field.onChange(files[0] ?? null);
              }}
              invalid={Boolean(fieldState.error)}
              pickers={[
                {
                  icon: "audio-lines",
                  accept: "audio/*",
                  label: "Pick a voice",
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="clip"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Add your clip"
              hint="Upload the video to change its voice"
              badge="Required"
              max={1}
              files={one(field.value)}
              onFilesChange={(files) => {
                field.onChange(files[0] ?? null);
              }}
              invalid={Boolean(fieldState.error)}
              pickers={[
                {
                  icon: "clapperboard",
                  accept: "video/*",
                  label: "Pick a clip",
                },
                { icon: "upload", accept: "video/*", label: "Upload a clip" },
              ]}
            />
          )}
        />
      </div>

      <AudioCta
        disabled={!ready}
        cost={ready ? audioCost("voice-change", "", 1) : null}
      />
    </form>
  );
}
