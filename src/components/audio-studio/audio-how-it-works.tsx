import {
  LanguageShowcase,
  PanelPreview,
  SwapShowcase,
  VoiceShowcase,
} from "@/components/audio-studio/how-it-works-media";
import type { AudioMode } from "@/config/audio";
import type { AudioCardMedia } from "@/config/audio-copy";
import { AUDIO_COPY } from "@/config/audio-copy";

/**
 * The pane's default tab.
 *
 * A container query, not a media query: the card reflows on its own width,
 * which is what keeps it correct with the 342px panel open beside it.
 */
const MEDIA: Record<AudioCardMedia, () => React.JSX.Element> = {
  voices: VoiceShowcase,
  panel: PanelPreview,
  swap: SwapShowcase,
  languages: LanguageShowcase,
};

export function AudioHowItWorks({ mode }: { mode: AudioMode }) {
  const copy = AUDIO_COPY[mode];

  return (
    <div className="@container w-full overflow-hidden rounded-q-300 border border-q-subtle bg-q-panel">
      <div className="flex min-h-160 flex-col px-8 pt-10.5 pb-8 @max-[640px]:px-4 @max-[640px]:pt-7">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-center font-q-display [font-feature-settings:'ss04'] text-q-accent-2xl text-q-fg uppercase @max-[640px]:text-[28px]">
            {copy.headline}
          </h2>
          <p className="text-center text-q-body-lg text-q-soft">{copy.sub}</p>
        </div>

        <div className="mt-9.5 flex w-full flex-col gap-5 @[640px]:flex-row">
          {copy.cards.map((card) => (
            <div
              key={card.title}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-q-600 border border-q-card bg-q-section px-4 pt-5 pb-4"
            >
              <div className="flex w-full flex-col gap-2 px-2">
                <h3 className="text-q-heading-sm text-q-fg">{card.title}</h3>
                {/*
                  text-q-muted is #828282 here, deliberately — not the #898a8b
                  the panel's labels use. Both greys appear on this page.
                */}
                <p className="text-q-body-md text-q-muted">{card.body}</p>
              </div>
              <div className="relative h-75 w-full overflow-hidden rounded-q-300">
                {MEDIA[card.media]()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
