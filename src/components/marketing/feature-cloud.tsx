import { FEATURE_TAGS } from "@/config/site";

/** The long tail of feature entry points the live page lists above the footer. */
export function FeatureCloud() {
  return (
    <section className="px-4 pt-16 lg:px-6">
      <h2 className="text-h2 uppercase">Explore more AI features</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {FEATURE_TAGS.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-8 cursor-pointer items-center rounded-full border border-hairline bg-w-06 px-3.5 text-body-sm text-secondary transition-colors duration-[140ms] hover:border-strong hover:text-primary motion-reduce:duration-0"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
