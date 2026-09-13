import {
  Archivo,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";

import { RouteProgress } from "@/components/layout/route-progress";
import { MobileTabBar } from "@/components/marketing/mobile-tab-bar";
import { PromoBanner } from "@/components/marketing/promo-banner";
import { SiteHeader } from "@/components/marketing/site-header";
import { AuthProvider } from "@/features/auth/auth-context";
import { readSession } from "@/server/auth/current-user.server";

import type { Metadata, Viewport } from "next";

import "./globals.css";

/*
 * The design system documents Archivo and JetBrains Mono as flagged
 * substitutes for Higgsfield's licensed faces — see the CAVEATS section of the
 * design project's readme. Swap the family here when the real files arrive;
 * the CSS variable names are what the token layer consumes.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

/*
 * The studio surfaces run on their own faces. Unlike the pair above these are
 * not substitutes — Inter and Space Grotesk are what the live generation pages
 * actually use — so the studio token layer can be exact. Only q-* utilities
 * consume them; the marketing layer stays on Archivo.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Higgsfield",
  description: "AI-native creative suite.",
};

export const viewport: Viewport = {
  themeColor: "#030304",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /*
   * Read here rather than inside the provider: the session cookie is httpOnly,
   * so only the server can see it, and seeding the provider from here is what
   * stops the header painting signed-out and then correcting itself.
   */
  const user = await readSession();

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrainsMono.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      {/*
       * One chrome for the whole site. The live site keeps the main navbar on
       * every surface including the generation pages — there is no icon rail
       * anywhere — so the banner and header live here rather than in a
       * per-group layout.
       *
       * The body itself does not scroll: each route group owns its scroll
       * container, which lets the studio routes size to the viewport while
       * content pages scroll normally.
       */}
      <body className="flex h-dvh flex-col overflow-hidden">
        {/*
         * AuthProvider wraps the whole app, including the studio layout's own
         * QueryProvider. The two nest and neither needs the other — React
         * Query stays scoped to the generation surfaces on purpose, so the
         * marketing pages do not pay for a client they never read.
         */}
        <AuthProvider initialUser={user}>
          <PromoBanner />
          <RouteProgress />
          <SiteHeader />
          {children}
          {/* Below md the header's link row is gone and this carries
              navigation in its place. See mobile-tab-bar.tsx. */}
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
