import { QueryProvider } from "@/components/layout/query-provider";

/**
 * Generation surfaces. These fill the space under the chrome exactly and
 * manage their own internal scrolling, so there is no page scroll and no
 * footer — matching the live studio pages.
 *
 * The ground is `--q-bg-page`, not the marketing `--surface-page`: the live
 * studio forces a lighter near-black on html/body for these routes only. The
 * site header already sits on the same value, so painting it here covers
 * everything below the chrome and the seam is invisible.
 *
 * React Query is provided here rather than at the root: only the generation
 * surfaces have server state to cache, and the marketing pages should not pay
 * for a client they never read.
 */
export default function StudioLayout({ children }: LayoutProps<"/">) {
  return (
    <QueryProvider>
      <div className="flex min-h-0 flex-1 bg-q-page">{children}</div>
    </QueryProvider>
  );
}
