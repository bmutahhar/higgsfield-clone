"use client";

import { useState } from "react";

import { AudioPanel } from "@/components/audio-studio/audio-panel";
import { UploadZone } from "@/components/audio-studio/upload-zone";
import {
  type AudioMode,
  DEFAULT_AUDIO_MODEL_ID,
  MAX_ATTACHMENTS,
} from "@/config/audio";

/*
 * Composition root for the audio studio.
 *
 * It holds only what both columns must agree on — the active mode, since the
 * pane's copy and its renderer both follow it, and the pane tab, since
 * submitting switches to History.
 *
 * The model is state rather than a URL parameter: `/audio` takes no `?model=`
 * on the reference, so putting one in would be a divergence dressed up as a
 * feature. The video studio does the opposite because its tabs are routes.
 */
export function AudioStudio({
  initialMode = "tts",
}: {
  /** Resolved from `?tab=` by the route, so the nav menu can deep-link a tab. */
  initialMode?: AudioMode;
}) {
  const [mode, setMode] = useState<AudioMode>(initialMode);
  const [modelId] = useState(DEFAULT_AUDIO_MODEL_ID);
  const [attachments, setAttachments] = useState<File[]>([]);

  return (
    <div className="relative grid size-full min-h-0 grid-cols-[1fr] px-4 md:grid-cols-[max-content_1fr]">
      <AudioPanel mode={mode} onModeChange={setMode}>
        <form className="hf-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-3 pt-3">
          <div
            role="tabpanel"
            id={`audio-panel-${mode}`}
            aria-labelledby={`audio-tab-${mode}`}
            className="flex flex-col gap-3"
          >
            {/* Tasks 10-12 fill the rest. */}
            <UploadZone
              title="Upload media"
              hint="Up to 3 Voices/Audios or Image"
              badge="Optional"
              max={MAX_ATTACHMENTS}
              files={attachments}
              onFilesChange={setAttachments}
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
            <p className="text-q-caption-l text-q-soft">
              {mode} fields land here. Model: {modelId}
            </p>
          </div>
        </form>
      </AudioPanel>

      <div className="relative size-full">{/* Tasks 13-14 fill this. */}</div>
    </div>
  );
}
