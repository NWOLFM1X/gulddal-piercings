import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SanityLive } from "@/sanity/lib/live";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { SiteSettings } from "@/types";
import { siteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({
    query: siteSettingsQuery,
    stega: false,
  });
  const settings = data as SiteSettings;
  const title = settings?.title || "Gulddal Piercings";
  const description =
    settings?.description ||
    "Professionelle piercinger i trygge og hygiejniske rammer. Book din tid online.";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${title}`,
    },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "da_DK",
      siteName: title,
      title,
      description,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: settings } = await sanityFetch({ query: siteSettingsQuery });
  const site = settings as SiteSettings;

  return (
    <html
      lang="da"
      className={`${poppins.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-soft min-h-full flex flex-col">
        <Header settings={site} />
        <main className="flex-1">{children}</main>
        <Footer settings={site} />
        <SanityLive />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
