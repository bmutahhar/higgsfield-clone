import { Icon } from "@/components/core/icon";
import { AUDIO_MODELS, LANGUAGES, type Voice, VOICES } from "@/config/audio";

/*
 * The illustrations inside the How-it-works cards.
 *
 * Built from the catalogue rather than from screenshots: the voices, models
 * and languages shown here are the same records the panel offers, so the
 * picture cannot drift from the product the way a flat asset would. Nothing
 * here is interactive — these are pictures, and every one is `aria-hidden`
 * because the heading above each card already says what it is.
 */

/** One voice, as the reference draws it: a pill with an avatar and a name. */
function VoicePill({ voice, className }: { voice: Voice; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-3 rounded-q-full border border-white/10 bg-black/40 py-2 pr-6 pl-2 backdrop-blur-sm ${className ?? ""}`}
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-q-full text-white"
        /* Two hex stops from the catalogue. A continuous gradient cannot be a
           utility class, and an image would be one more thing to host. */
        style={{
          backgroundImage: `linear-gradient(135deg, ${voice.avatar[0]}, ${voice.avatar[1]})`,
        }}
      >
        <Icon name="audio-lines" size={22} />
      </span>
      <span className="flex flex-col">
        <span className="text-q-heading-sm text-white">{voice.name}</span>
        <span className="text-q-caption-l text-white/60">{voice.register}</span>
      </span>
    </div>
  );
}

/**
 * The voice carousel, mid-scroll.
 *
 * Deliberately overflowing its frame and unevenly spaced — the reference shows
 * a strip caught between positions, and a tidy centred row would read as a
 * list of three rather than a library you are scrolling through.
 */
export function VoiceShowcase() {
  const [first, second, third, fourth] = VOICES;
  const model = AUDIO_MODELS[0];

  return (
    <div
      aria-hidden
      className="bg-q-secondary relative size-full overflow-hidden rounded-q-300"
    >
      {/* The brand glow the cards sit on. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(209,254,23,0.55),transparent_62%)]" />

      <div className="absolute inset-0 flex flex-col justify-center gap-3">
        <VoicePill voice={first} className="-ml-6 scale-90 opacity-70" />
        <VoicePill voice={second} className="ml-10 shadow-q-avatar" />
        <VoicePill voice={third} className="-ml-10 scale-90 opacity-70" />
        <VoicePill voice={fourth} className="ml-16 scale-75 opacity-50" />
      </div>

      <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-q-full bg-black/55 px-2.5 py-1.5 text-q-caption-l text-white backdrop-blur-sm">
        <Icon name="audio-lines" size={14} className="text-q-brand" />
        {model.name}
      </span>
    </div>
  );
}

/** A read-only miniature of the panel, so the card shows what it describes. */
export function PanelPreview() {
  const model = AUDIO_MODELS[0];
  const dials: [string, string][] = [
    ["Speed", "1.0"],
    ["Pitch", "1.7"],
    ["Volume", "1.8"],
  ];

  return (
    <div
      aria-hidden
      className="bg-q-secondary relative size-full overflow-hidden rounded-q-300 p-4"
    >
      <div className="flex h-full flex-col gap-3">
        <p className="line-clamp-3 text-q-body-md text-q-fg">
          Warm, calm male voice, unhurried pace, slight gravel — like a
          late-night nature documentary narrator. Thoughtful pauses between
          sentences.
        </p>

        <div className="flex items-center justify-between gap-2 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2">
          <span className="flex flex-col gap-0.5">
            <span className="text-q-caption-l text-q-soft">Model</span>
            <span className="flex items-center gap-1 text-q-menu text-q-fg">
              {model.name}
              <Icon name="audio-lines" size={14} className="text-q-brand" />
            </span>
          </span>
          <Icon name="chevron-right" size={16} className="text-q-fg" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {dials.map(([label, value]) => (
            <span
              key={label}
              className="flex items-center justify-between gap-2 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-q-menu"
            >
              <span className="text-q-fg">{label}</span>
              <span className="flex items-center gap-2">
                <span className="h-4 w-px bg-q-w-50" />
                <span className="text-q-fg tabular-nums">{value}</span>
              </span>
            </span>
          ))}

          <span className="flex items-center justify-between gap-2 rounded-q-300 border border-q-subtle bg-q-w-05 px-3 py-2 text-q-menu">
            <span className="text-q-fg">Batch size</span>
            <span className="flex items-center gap-1 text-q-fg">
              <Icon name="minus" size={14} />
              <span className="tabular-nums">1/4</span>
              <Icon name="plus" size={14} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Two voices and the arrow between them — what Voice Change actually does. */
export function SwapShowcase() {
  const [from, , , to] = VOICES;

  return (
    <div
      aria-hidden
      className="bg-q-secondary relative size-full overflow-hidden rounded-q-300"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(209,254,23,0.4),transparent_65%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <VoicePill voice={from} className="opacity-60" />
        <span className="flex size-10 items-center justify-center rounded-q-full bg-black/55 text-q-brand backdrop-blur-sm">
          <Icon name="arrow-down" size={20} />
        </span>
        <VoicePill voice={to} className="shadow-q-avatar" />
      </div>
    </div>
  );
}

/** The languages a clip can be dubbed into, as a grid of flags. */
export function LanguageShowcase() {
  return (
    <div
      aria-hidden
      className="bg-q-secondary relative size-full overflow-hidden rounded-q-300 p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(209,254,23,0.32),transparent_66%)]" />
      <div className="relative flex size-full flex-wrap content-center justify-center gap-2">
        {LANGUAGES.map((language) => (
          <span
            key={language.id}
            className="flex items-center gap-2 rounded-q-full border border-white/10 bg-black/40 px-3 py-2 text-q-menu text-white backdrop-blur-sm"
          >
            <span className="text-base leading-none">{language.flag}</span>
            {language.name}
          </span>
        ))}
      </div>
    </div>
  );
}
