import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  DM_Sans,
  Dancing_Script,
  Playfair_Display,
  Quicksand,
  Special_Elite,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });
const dm = DM_Sans({ variable: "--font-dm", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });
const special = Special_Elite({ variable: "--font-special", subsets: ["latin"], weight: "400" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "A Little Universe Made For You 💗", template: "%s" },
  description: "A tiny, magical birthday universe — made with a little extra effort.",
  openGraph: {
    title: "A Little Universe Made For You 💗",
    description: "Someone made a little something for you...",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff1f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [playfair, dm, caveat, dancing, cormorant, quicksand, special].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={`${fonts} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
