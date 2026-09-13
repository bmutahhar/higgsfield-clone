import { Button } from "@/components/core/button";
import { cn } from "@/lib/cn";

/** Feature banner over a drawn blueprint grid — no image binaries are vendored. */
export function CanvasBanner() {
  return (
    <section className="px-4 pt-16 lg:px-6">
      <div className="relative flex min-h-75 items-center overflow-hidden rounded-panel border border-hairline bg-n-2 px-8 py-14">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 opacity-50",
            "[background-image:linear-gradient(var(--w-04)_1px,transparent_1px),linear-gradient(90deg,var(--w-04)_1px,transparent_1px)]",
            "[background-size:32px_32px]",
          )}
        />
        <div className="relative">
          <div className="hf-eyebrow mb-3">New feature</div>
          <h2 className="text-display-3 uppercase">
            One canvas.
            <br />
            Every workflow.
          </h2>
          <p className="mt-4 max-w-115 text-body text-secondary">
            Moodboard, chain workflows and share with your team — all on one
            canvas.
          </p>
          <Button pill size="lg" className="mt-6" iconRight="arrow-right">
            Try Canvas
          </Button>
        </div>
      </div>
    </section>
  );
}
