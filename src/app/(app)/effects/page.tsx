import { PresetGrid } from "@/components/effects/preset-grid";
import { HERO, PRESETS } from "@/config/media";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Effects · Higgsfield",
  description: "Viral video presets. Pick one, drop in a reference.",
};

const CATEGORIES = [
  "All",
  "Camera",
  "Transform",
  "Character",
  "Destruction",
  "Fashion",
];

export default function EffectsPage() {
  return (
    <div className="px-6 pt-6 pb-16">
      <div className="mb-5 flex items-end gap-5">
        <div>
          <div className="hf-eyebrow mb-2">Presets</div>
          <h1 className="text-h1">Higgsfield Effects</h1>
          <p className="mt-2 max-w-130 text-body text-muted">
            Viral video presets. Pick one, drop in a reference, and it recreates
            the motion with your subject.
          </p>
        </div>
        <span className="flex-1" />
      </div>

      <PresetGrid
        presets={PRESETS}
        clips={HERO}
        categories={CATEGORIES}
        meta="Effect · 5s"
        newCount={2}
      />
    </div>
  );
}
