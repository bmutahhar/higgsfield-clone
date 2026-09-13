/**
 * Generation surfaces. These fill the space under the chrome exactly and
 * manage their own internal scrolling, so there is no page scroll and no
 * footer — matching the live studio pages.
 */
export default function StudioLayout({ children }: LayoutProps<"/">) {
  return <div className="flex min-h-0 flex-1">{children}</div>;
}
