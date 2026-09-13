import { Icon } from "@/components/core/icon";
import type { FaqItem } from "@/config/pricing-faq.constants";
import { cn } from "@/lib/cn";

/*
 * Native <details>, as the live site uses — keep it.
 *
 * Items are independent: several can be open at once, and opening one does not
 * close its neighbour. That is what <details> does by default, so the correct
 * implementation is the one with no JavaScript in it.
 *
 * The body animates on `grid-template-rows` rather than `height`, which needs
 * no measurement pass and no inline styles (the live site drives height from
 * JS). `interpolate-size` would let `height: auto` animate directly, but the
 * grid trick works everywhere today.
 */
/*
 * The mobile surface restyles the same accordion rather than reusing it as-is:
 * a darker card, a tighter radius, 8px gaps and a bolder, smaller question.
 * One component, two skins — the behaviour is identical.
 */
export function FaqList({
  items,
  variant = "desktop",
  className,
}: {
  items: FaqItem[];
  variant?: "desktop" | "mobile";
  className?: string;
}) {
  const mobile = variant === "mobile";
  return (
    <div
      className={cn(
        "flex w-full flex-col",
        mobile ? "gap-2" : "max-w-160 gap-3",
        className,
      )}
    >
      {items.map((item) => (
        <details
          key={item.q}
          className={cn(
            "group border border-q-hairline",
            mobile
              ? "rounded-q-300 bg-q-card p-3"
              : "rounded-q-200 bg-q-panel px-5 py-4",
            "[&::details-content]:transition-[block-size,content-visibility]",
            "[&::details-content]:duration-300 [&::details-content]:ease-out",
          )}
        >
          <summary
            className={cn(
              "flex w-full cursor-pointer list-none items-center justify-between text-left",
              mobile
                ? "text-sm leading-5 font-bold text-white"
                : "text-lg leading-[26px] font-semibold text-white",
              "[&::-webkit-details-marker]:hidden",
              "focus-visible:rounded-q-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-q-focus",
            )}
          >
            {item.q}
            <Icon
              name="chevron-down"
              size={20}
              className={cn(
                "shrink-0 text-q-soft",
                "transition-transform duration-300 ease-out motion-reduce:transition-none",
                "group-open:rotate-180",
              )}
            />
          </summary>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr] motion-reduce:transition-none">
            <div className="overflow-hidden">
              <p
                className={cn(
                  "whitespace-pre-line text-q-soft",
                  mobile
                    ? "pt-3 text-sm leading-5"
                    : "py-4 text-base leading-6",
                )}
              >
                {item.a}
              </p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
