import Image from "next/image";

import { Badge } from "@/components/core/badge";
import { Icon } from "@/components/core/icon";
import type { IconName } from "@/components/core/icon";
import { cn } from "@/lib/cn";

export type ModelKind = "Video" | "Image" | "Audio" | "Agent";

const KIND_GLYPH: Record<ModelKind, IconName> = {
  Video: "clapperboard",
  Image: "image",
  Audio: "audio-lines",
  Agent: "bot",
};

export interface ModelCardProps {
  name: string;
  blurb?: string;
  kind?: ModelKind;
  badge?: string;
  poster?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/*
 * Selection draws a 1px lime border — never a lime fill, which is reserved for
 * actions.
 */
export function ModelCard({
  name,
  blurb,
  kind = "Video",
  badge,
  poster,
  selected = false,
  onClick,
  className,
}: ModelCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-[116px] cursor-pointer flex-col justify-end overflow-hidden",
        "rounded-card border p-3.5 text-left transition-colors duration-[140ms] ease-snap",
        "focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0",
        poster ? "bg-n-3" : "bg-card",
        selected ? "border-accent" : "border-hairline hover:border-strong",
        className,
      )}
    >
      {poster && (
        <>
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-[640ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
          />
          <span className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-black/25" />
        </>
      )}

      <span className="relative flex items-center gap-2">
        <span className="text-h4/[1.2] font-semibold tracking-[-0.01em] text-white">
          {name}
        </span>
        {badge && <Badge>{badge}</Badge>}
      </span>

      {blurb && (
        <span className="relative mt-1 text-body-sm text-w-80">{blurb}</span>
      )}

      <span className="relative mt-2.5 inline-flex items-center gap-[5px] text-muted">
        <Icon name={KIND_GLYPH[kind]} size={14} />
        <span className="font-mono text-mono">{kind}</span>
      </span>
    </button>
  );
}
