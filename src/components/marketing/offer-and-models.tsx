import Image from "next/image";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { HERO } from "@/config/media";
import { MODEL_TILES } from "@/config/site";

const OFFER_POINTS = [
  "Get unlimited Nano Banana Pro",
  "Unlock your extra discount",
  "Access to Seedance 2.5",
];

/** Offer card on the left, a 3x2 grid of model entry points on the right. */
export function OfferAndModels() {
  return (
    <section className="grid gap-3 px-4 pt-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] lg:px-6">
      <div className="relative flex min-h-55 flex-col justify-center overflow-hidden rounded-card border border-hairline p-7">
        {HERO[0] && (
          <Image
            src={HERO[0].poster}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        )}
        <span className="absolute inset-0 bg-linear-to-r from-page/92 via-page/70 to-page/30" />
        <div className="relative">
          <h2 className="text-h1/[1.05] font-bold uppercase">
            Sign up and get your
            <br />
            <span className="text-lime">extra discount</span>
          </h2>
          <ul className="mt-4 flex flex-col gap-1.5">
            {OFFER_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-body-sm text-secondary"
              >
                <Icon name="check" size={14} className="text-lime" />
                {point}
              </li>
            ))}
          </ul>
          <Button pill size="lg" className="mt-6">
            Sign up and get your discount
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MODEL_TILES.map((tile) => (
          <button
            key={tile.name}
            type="button"
            className="flex flex-col rounded-card border border-hairline bg-card p-3.5 text-left transition-colors duration-[140ms] ease-snap hover:border-strong focus-visible:shadow-ring focus-visible:outline-none motion-reduce:duration-0"
          >
            <span className="flex items-center justify-between">
              <Icon name={tile.icon} size={18} className="text-lime" />
              {tile.kind && (
                <span className="inline-flex items-center gap-1 rounded-md bg-w-06 px-1.5 py-0.5 text-[10px] text-muted">
                  <Icon
                    name={tile.kind === "Image" ? "image" : "clapperboard"}
                    size={11}
                  />
                  {tile.kind}
                </span>
              )}
            </span>
            <span className="mt-3 flex items-center gap-2">
              <span className="truncate text-body-sm font-semibold text-primary">
                {tile.name}
              </span>
              {tile.badge && (
                <Badge
                  tone={tile.badge === "New" ? "soft" : "accent"}
                  className="h-4 shrink-0 px-1.5"
                >
                  {tile.badge}
                </Badge>
              )}
            </span>
            <span className="mt-1.5 text-caption text-muted">{tile.blurb}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
