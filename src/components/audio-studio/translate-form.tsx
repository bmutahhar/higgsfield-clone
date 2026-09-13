"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AudioCta } from "@/components/audio-studio/audio-cta";
import { LanguagePopover } from "@/components/audio-studio/language-popover";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import { audioCost } from "@/lib/audio-cost";
import {
  audioGenerationSchema,
  type AudioGenerationValues,
  translateDefaults,
} from "@/schemas/audio-generation";

const one = (file: File | null) => (file ? [file] : []);

export function TranslateForm({
  onSubmit,
}: {
  onSubmit: (values: AudioGenerationValues) => void;
}) {
  const { control, handleSubmit } = useForm<AudioGenerationValues>({
    resolver: zodResolver(audioGenerationSchema),
    mode: "onSubmit",
    defaultValues: translateDefaults(),
  });

  const clip = useWatch({ control, name: "clip" });
  const ready = Boolean(clip);

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
          name="clip"
          render={({ field, fieldState }) => (
            <UploadZone
              title="Add your clip"
              hint="Upload the video you want to dub"
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

        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <LanguagePopover
              value={field.value ?? "en"}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <AudioCta
        disabled={!ready}
        cost={ready ? audioCost("translate", "", 1) : null}
      />
    </form>
  );
}
