"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

import { Badge } from "@/components/core/badge";
import type { IconName } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/cn";

export interface MediaOverlayAction {
  icon: IconName;
  label: string;
  onClick?: () => void;
}

export interface MediaCardProps {
  poster?: string;
  /** Muted loop that cross-fades in on hover — the product's signature motion. */
  video?: string;
  title?: string;
  /** Metadata line, rendered in mono. */
  meta?: string;
  badge?: string;
  /** Aspect ratios carry meaning: 3/4 presets, 16/9 renders, 1/1 thumbs, 9/16 social. */
  ratio?: string;
  action?: ReactNode;
  overlayActions?: MediaOverlayAction[];
  onClick?: () => void;
  className?: string;
  sizes?: string;
}

/*
 * Nothing is letterboxed — everything is object-cover. Type over media always
 * sits on a scrim; controls become glass capsules.
 *
 * Client-only because the poster→video cross-fade has to call play()/pause()
 * on the element. That is a DOM side effect, not styling: every visual state
 * here is a group-hover variant, so hovering causes no re-render.
 */
export function MediaCard({
  poster,
  video,
  title,
  meta,
  badge,
  ratio = "1 / 1",
  action,
  overlayActions = [],
  onClick,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function play() {
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {
      /* autoplay can be refused; the poster stays up */
    });
  }

  function stop() {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  return (
    <figure
      onClick={onClick}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
      className={cn(
        "group relative m-0 overflow-hidden rounded-media border border-hairline bg-n-3",
        onClick && "cursor-pointer",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {poster && (
        <Image
          src={poster}
          alt={title ?? ""}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-transform duration-[640ms] ease-out",
            "group-hover:scale-[1.04] motion-reduce:transition-none",
          )}
        />
      )}

      {video && (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          className={cn(
            "absolute inset-0 size-full object-cover opacity-0",
            "transition-opacity duration-[220ms] ease-snap",
            "group-hover:opacity-100 motion-reduce:transition-none",
          )}
        />
      )}

      {/* Two scrims cross-fade rather than one changing gradient, since a
          gradient is not an animatable property. */}
      <span className="absolute inset-0 bg-[image:var(--scrim-bottom)] transition-opacity duration-[140ms] group-hover:opacity-0" />
      <span className="absolute inset-0 bg-[image:var(--scrim-hover)] opacity-0 transition-opacity duration-[140ms] group-hover:opacity-100" />

      {badge && (
        <span className="absolute top-2.5 left-2.5">
          <Badge tone="glass">{badge}</Badge>
        </span>
      )}

      {overlayActions.length > 0 && (
        <span className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 transition-opacity duration-[140ms] group-hover:opacity-100 focus-within:opacity-100">
          {overlayActions.map((a) => (
            <IconButton
              key={a.icon}
              icon={a.icon}
              label={a.label}
              size="sm"
              variant="glass"
              onClick={a.onClick}
            />
          ))}
        </span>
      )}

      {(title ?? meta ?? action) && (
        <figcaption className="absolute right-3 bottom-3 left-3 flex items-end gap-2.5">
          <span className="min-w-0 flex-1">
            {title && (
              <span className="line-clamp-2 text-body/[1.25] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,.5)]">
                {title}
              </span>
            )}
            {meta && (
              <span className="mt-[3px] block truncate font-mono text-mono text-w-80">
                {meta}
              </span>
            )}
          </span>
          {action && (
            <span className="hidden min-w-0 shrink-0 group-hover:block">
              {action}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
