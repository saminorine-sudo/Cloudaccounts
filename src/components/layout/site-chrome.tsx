import { AnalyticsListener } from "@/components/analytics/analytics-listener";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/ui/prose";
import { getSiteSettings } from "@/lib/content";
import { organisationJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * The public site's header, footer and page-level furniture.
 *
 * Extracted from the layout so the global not-found page can render it too.
 * A 404 without navigation is a dead end, and unmatched URLs resolve above
 * the `(site)` route group where its layout no longer applies.
 *
 * The admin area deliberately does not use this — it has its own shell, which
 * is why the marketing routes live in a route group rather than at the root.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
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
    </>
  );
}
