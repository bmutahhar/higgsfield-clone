import { Icon } from "@/components/core/icon";
import { ModelRow } from "@/components/pricing/model-row";
import type { Plan } from "@/config/pricing.constants";
import { cn } from "@/lib/cn";

/*
 * The Seedance panel, in its two states.
 *
 * `locked` (Basic) is a flat charcoal card that says what you do not get.
 * `included` (Pro, Max) is the page's one photographic surface: a thirteen-stop
 * blue that dives to near-black at 46% and comes back up to a bright rim at
 * the floor, an edge light down both sides, and a screen-blended photo at 30%.
 * Together they read as a lit horizon — which is the point, and which a
 * two-stop blue fade does not achieve.
 *
 * The live site's photo layer is one of its own assets. Until we have an
 * equivalent the gradient carries it alone; drop a file in and render the
 * <img> layer to close the gap. See the asset list in the spec.
 */
interface SeedancePanelProps {
  seedance: Plan["seedance"];
  className?: string;
}

export function SeedancePanel({ seedance, className }: SeedancePanelProps) {
  const included = seedance.tone === "included";

  return (
    <div
      className={cn(
        "relative isolate flex flex-col gap-1.5 rounded-q-400 border-q-subtle",
        "overflow-hidden border px-2 pt-2 pb-3",
        !included && "bg-q-card-strong",
        className,
      )}
    >
      {included ? (
        <>
          <div
            aria-hidden
            className="q-seedance-sky pointer-events-none absolute inset-0 rounded-[inherit]"
          />
          <div
            aria-hidden
            className="q-seedance-edge pointer-events-none absolute inset-0 rounded-[inherit]"
          />
        </>
      ) : null}

      <div className="relative flex items-center gap-3 p-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={cn(
              "font-q-display text-base leading-5 font-bold tracking-[-0.04em] uppercase",
              included ? "text-white" : "text-q-idle-soft",
            )}
          >
            {seedance.title}
          </span>
          <span
            className={cn(
              "text-xs leading-[18px] font-medium",
              included ? "text-q-idle-soft" : "text-q-w-30",
            )}
          >
            {seedance.subtitle}
          </span>
        </div>
        <span className="q-glyph-disc relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full">
          <Icon name="clapperboard" size={16} className="text-white" />
        </span>
      </div>

      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-q-200 px-3",
          included ? "bg-q-w-15" : "bg-q-w-05 backdrop-blur-[4px]",
        )}
      >
        {seedance.rows.map((row, index) => (
          <ModelRow
            key={row.name}
            row={row}
            divided={index < seedance.rows.length - 1}
            className="gap-2"
          />
        ))}
      </div>
    </div>
  );
}
