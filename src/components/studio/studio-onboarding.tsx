export interface OnboardingStep {
  title: string;
  body: string;
  poster: string;
}

export interface StudioOnboardingProps {
  headline: string;
  steps: OnboardingStep[];
}

/**
 * What the Edit and Motion surfaces show in History before you have made
 * anything.
 *
 * Genjutsu leaves that canvas blank; these two explain themselves instead, and
 * the difference is deliberate on the reference — so `VideoHistory` takes its
 * empty state as a slot rather than assuming one of the two.
 */
export function StudioOnboarding({ headline, steps }: StudioOnboardingProps) {
  return (
    <section className="flex w-full flex-col self-start rounded-q-500 border border-q-hairline bg-q-panel px-8 py-24">
      <header className="mb-8 flex w-full items-center justify-center">
        <h1 className="text-center font-q-display text-q-accent-lg text-q-fg uppercase">
          {headline}
        </h1>
      </header>

      <ol className="grid gap-10 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col items-center">
            <figure className="relative mx-auto mb-4 aspect-[328/331] w-full max-w-82 overflow-hidden rounded-q-400 bg-q-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                loading="lazy"
                src={step.poster}
                className="size-full object-cover"
              />
            </figure>
            <span className="mx-auto rounded-q-150 bg-white/5 px-2 py-1 text-q-label-xs text-q-fg">
              Step {index + 1}
            </span>
            <h2 className="mt-2 mb-2 w-full text-center font-q-display text-q-brand-xxs text-q-fg uppercase">
              {step.title}
            </h2>
            <p className="w-full text-center text-q-body-sm text-q-muted">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
