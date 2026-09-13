import { ButtonLink } from "@/components/core/button-link";

/**
 * The one full-lime panel on the page. Black type on lime, never white — and
 * it holds a headline, not a text block.
 */
export function AgentBanner() {
  return (
    <section className="px-4 pt-16 lg:px-6">
      <div className="relative overflow-hidden rounded-panel bg-accent px-8 py-16 text-center text-n-0">
        <h2 className="text-display-3 uppercase">Supercomputer</h2>
        <p className="mx-auto mt-3 max-w-140 text-body-lg text-n-0/75">
          One superagent for your entire creative stack
        </p>
        <div className="mt-7 flex justify-center">
          <ButtonLink
            href="/"
            pill
            size="lg"
            className="border-transparent bg-n-0 text-primary hover:bg-n-2 hover:text-primary"
          >
            Try Supercomputer
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
