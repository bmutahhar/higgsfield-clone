import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/core/button";
import { IconButton } from "@/components/core/icon-button";
import { Tag } from "@/components/core/tag";
import { Avatar } from "@/components/display/avatar";
import { Card } from "@/components/display/card";
import { ProjectPlayer } from "@/components/project/project-player";
import { HERO, PRESETS } from "@/config/media";

const RECIPE: [string, string][] = [
  ["Model", "Seedance 2.5"],
  ["Aspect", "9:16"],
  ["Duration", "5s"],
  ["Seed", "482910"],
  ["Motion", "65%"],
  ["Audio", "On"],
];

const TAGS = ["cinematic", "dance", "warehouse", "anamorphic", "red"];

export function generateStaticParams() {
  return PRESETS.map((preset) => ({ slug: preset.slug }));
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const preset = PRESETS.find((p) => p.slug === slug);
  if (!preset) notFound();

  const hero = HERO[2];

  return (
    <div className="px-6 pt-4 pb-16">
      <div className="mb-4 flex items-center gap-2.5">
        <Link href="/">
          <IconButton icon="arrow-left" label="Back" size="sm" tabIndex={-1} />
        </Link>
        <span className="text-body-sm text-muted">
          Community / Higgsfield Studio
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <ProjectPlayer
            poster={hero?.poster ?? preset.poster}
            video={hero?.video}
          />

          <div className="mt-4.5 flex items-center gap-3.5">
            <Avatar name="Higgsfield Studio" size={36} ring />
            <div>
              <div className="text-h3">{preset.name}</div>
              <div className="mt-[3px] text-caption text-muted">
                Higgsfield Studio · Public · 2 days ago
              </div>
            </div>
            <span className="flex-1" />
            <Button variant="secondary" iconLeft="heart" size="sm">
              1.2k
            </Button>
            <Button variant="secondary" iconLeft="share-2" size="sm">
              Share
            </Button>
            <Button pill iconLeft="wand-2">
              Remix this
            </Button>
          </div>

          <div className="mt-6">
            <div className="hf-eyebrow mb-3">Shots in this project</div>
            <div className="grid grid-cols-6 gap-2.5">
              {PRESETS.slice(0, 6).map((shot) => (
                <span
                  key={shot.slug}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-thumb shadow-[var(--inset-hairline)]"
                >
                  <Image
                    src={shot.poster}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card padding="sm">
            <div className="hf-eyebrow mb-2.5">Prompt</div>
            <p className="text-body-sm text-secondary">
              Slow orbit around a dancer in a flooded warehouse, red practicals,
              volumetric haze, anamorphic flares, 35mm.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" iconLeft="copy">
                Copy
              </Button>
              <Button variant="ghost" size="sm" iconLeft="wand-2">
                Use prompt
              </Button>
            </div>
          </Card>

          <Card padding="sm">
            <div className="hf-eyebrow mb-2.5">Recipe</div>
            {RECIPE.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between border-t border-hairline py-[7px]"
              >
                <span className="text-body-sm text-muted">{key}</span>
                <span className="font-mono text-mono text-primary">
                  {value}
                </span>
              </div>
            ))}
          </Card>

          <Card padding="sm">
            <div className="hf-eyebrow mb-2.5">Tags</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
