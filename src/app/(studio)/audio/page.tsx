import { AudioStudio } from "@/components/audio-studio/audio-studio";
import { AUDIO_TABS, type AudioMode } from "@/config/audio";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Over & Voice Translation | Higgsfield",
  description:
    "Turn a script into lifelike speech, swap the voice on a take you already have, or dub a clip into another language.",
};

/**
 * The audio studio. Routing only — it resolves the opening tab and hands off.
 *
 * There is no `?model=` here, unlike `/ai/video`: the reference deep-links no
 * model on this surface, so inventing one would be a divergence. `?tab=` is
 * different — the header's hover menu links straight to each of the three
 * tabs, and without it those rows would all land on Text to Speech.
 */
export default async function AudioStudioPage(props: PageProps<"/audio">) {
  const { tab } = await props.searchParams;
  const requested = Array.isArray(tab) ? tab[0] : tab;
  /* An unknown or absent tab opens on speech rather than rendering nothing,
     so a hand-edited URL degrades instead of breaking. */
  const known = AUDIO_TABS.some((entry) => entry.id === requested);

  return <AudioStudio initialMode={known ? (requested as AudioMode) : "tts"} />;
}
