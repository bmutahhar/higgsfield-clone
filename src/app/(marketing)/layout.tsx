import { SiteFooter } from "@/components/marketing/site-footer";

/** Content pages: they scroll, and they carry the footer. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    /* data-page-scroll marks this as the group's page scroller, which is what
       the header watches to decide between its two sizes. */
    <div
      data-page-scroll
      className="hf-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
