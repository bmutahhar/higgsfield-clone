export interface GenerateButtonProps {
  disabled?: boolean;
}

/**
 * The primary call to action. The fill is a radial hot spot rather than a flat
 * brand wash, and the inset bottom shadow is what gives it its pressed-key
 * look — which is also why the label carries 2px of extra bottom padding, to
 * stay optically centred against it.
 */
export function GenerateButton({ disabled }: GenerateButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="q-cta-fill grid h-12 w-full grid-flow-col items-center justify-center gap-2 rounded-q-300 px-4 pb-0.5 text-base font-semibold text-q-inverse shadow-q-cta transition-transform duration-200 outline-none hover:not-disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-q-focus active:not-disabled:scale-97 active:not-disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-q-disabled disabled:bg-none disabled:text-q-disabled-fg disabled:shadow-none motion-reduce:transition-none"
    >
      Generate
    </button>
  );
}
