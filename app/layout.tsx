import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SITE } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title.fr,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description.fr,
  keywords: [...SITE.keywords.fr, ...SITE.keywords.en],
  alternates: {
    canonical: "/",
    languages: { fr: "/", en: "/" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title.fr,
    description: SITE.description.fr,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title.fr,
    description: SITE.description.fr,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description.fr,
  applicationCategory: "MapApplication",
  inLanguage: ["fr", "en"],
  keywords: SITE.keywords.fr.join(", "),
  isAccessibleForFree: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.defaultLocale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
