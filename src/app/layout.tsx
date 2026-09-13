import { Archivo, JetBrains_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Higgsfield",
  description: "AI-native creative suite.",
};

export const viewport: Viewport = {
  themeColor: "#030304",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="hf-scrollbar flex min-h-full flex-col">{children}</body>
    </html>
  );
}
