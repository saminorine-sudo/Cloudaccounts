import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans } from "next/font/google";

import "./globals.css";

import { AnalyticsListener } from "@/components/analytics/analytics-listener";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/ui/prose";
import { getSiteSettings } from "@/lib/content";
import { SITE_URL, organisationJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * Inter for body copy, Instrument Sans for display headings.
 *
 * Two families with distinct roles rather than one used everywhere: the
 * headline face has more character at large sizes, and Inter stays highly
 * legible at 16–18px. Both are self-hosted by `next/font`, so there is no
 * render-blocking request to a font CDN and no layout shift.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CloudAccounts — Accountants for UK businesses",
    template: "%s | CloudAccounts",
  },
  description:
    "Accounting, tax, bookkeeping, VAT and payroll support for UK sole traders, contractors and limited companies. Book a free consultation.",
  applicationName: "CloudAccounts",
  authors: [{ name: "CloudAccounts" }],
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: "CloudAccounts",
    locale: "en_GB",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${instrumentSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-surface antialiased">
        <JsonLd data={organisationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />

        <SiteHeader
          phone={settings.contact.phone}
          phoneHref={settings.contact.phoneHref}
        />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter settings={settings} />

        {/* Extra bottom room so the sticky mobile bar never covers the footer. */}
        <div className="h-16 lg:hidden" aria-hidden="true" />

        <MobileCtaBar phoneHref={settings.contact.phoneHref} />
        <CookieConsent />
        <AnalyticsListener />
      </body>
    </html>
  );
}
