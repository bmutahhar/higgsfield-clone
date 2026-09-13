import { Button } from "@/components/core/button";
import { cn } from "@/lib/cn";

/**
 * Centred lockup on a perspective grid. The grid is drawn in CSS rather than
 * shipped as an image — no binaries are vendored in this project.
 */
export function McpBanner() {
  return (
    <section className="px-4 pt-4 lg:px-6">
      <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-panel border border-hairline bg-n-1 px-6 py-16">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 opacity-40",
            "[background-image:linear-gradient(var(--w-06)_1px,transparent_1px),linear-gradient(90deg,var(--w-06)_1px,transparent_1px)]",
            "[background-size:56px_56px]",
            "[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]",
          )}
        />
        <div className="relative text-center">
          <p className="text-body text-secondary">Higgsfield MCP with</p>
          <h2 className="mt-2 text-display-2 tracking-[-0.02em] uppercase">
            GPT-6 Astra
          </h2>
          <p className="mx-auto mt-4 max-w-125 text-body text-muted">
            Build games, motion graphics and interactive 3D experiences.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button pill size="lg" iconLeft="plug">
              Install Higgsfield plugin
            </Button>
            <Button pill size="lg" variant="glass" iconLeft="compass">
              Explore use cases
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
