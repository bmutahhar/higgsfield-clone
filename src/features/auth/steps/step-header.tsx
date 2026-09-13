import { LogoMark } from "@/components/layout/logo-mark";

/**
 * The mark, title and subtitle every step opens with. The ids are what the
 * dialog's aria-labelledby points at, so each step re-announces on arrival.
 *
 * The reset step has no subtitle at all — the live dialog omits it rather
 * than leaving an empty line — so `subtitle` is optional and the element is
 * not rendered when it is absent.
 */
export function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-4 text-center md:mb-10">
      <span className="flex w-full justify-center">
        <LogoMark className="size-8 text-q-accent" />
      </span>
      <div className="flex flex-col gap-3">
        <h1
          id="auth-step-title"
          className="text-[30px] leading-9 font-semibold text-balance"
        >
          {title}
        </h1>
        {subtitle && (
          <p id="auth-step-subtitle" className="text-sm text-q-soft">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
