import { PromoBanner } from "@/components/marketing/promo-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/** Logged-out site: promo strip, sticky glass header, content, deep footer. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PromoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
