import Image from "next/image";

import { cn } from "@/lib/cn";

export interface AvatarProps {
  src?: string;
  name?: string;
  /** Pixel box. */
  size?: number;
  /** Lime ring, for the signed-in user. */
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name = "",
  size = 32,
  ring = false,
  className,
}: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "H";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-n-5 font-semibold text-secondary",
        ring
          ? "shadow-[0_0_0_2px_var(--accent-solid)]"
          : "shadow-[inset_0_0_0_1px_var(--w-08)]",
        className,
      )}
      // Box and glyph scale with the numeric size prop, so they cannot be
      // classes. The design system sets the initial at 0.42 of the box.
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}
