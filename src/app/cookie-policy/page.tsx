import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { getSiteSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cookie policy",
  description:
    "What cookies this website sets, which are optional, and how to change your preferences at any time.",
  canonicalPath: "/cookie-policy",
});

export default async function CookiePolicyPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage
      title="Cookie policy"
      lead="What this site stores on your device, what is optional, and how to change your mind."
      updatedAt="2026-09-01"
      showTemplateNotice={settings.showDemoNotices}
      includeCookiePreferences
      sections={[
        {
          heading: "The short version",
          paragraphs: [
            "This site sets one strictly necessary cookie to remember your cookie choice. Nothing optional is loaded until you actively choose to allow it. Rejecting optional cookies is as easy as accepting them, and the site works fully either way.",
          ],
        },
        {
          heading: "Strictly necessary cookies",
          paragraphs: [
            "These are required for the site to function and do not need your consent under UK rules. They cannot be switched off.",
          ],
          bullets: [
            "ca_consent — stores which cookie categories you have allowed, so you are not asked on every page. Expires after six months, at which point we ask again.",
            "Any cookies set by our hosting provider strictly for security and load balancing.",
          ],
        },
        {
          heading: "Analytics cookies (optional, off by default)",
          paragraphs: [
            "If you allow analytics, we use them to understand which pages and tools people find useful so we can improve them. This is aggregate usage information about the website, not about you personally.",
            "Nothing you enter into a form or a calculator is sent to analytics. Financial figures typed into the calculators never leave your browser at all.",
            "No analytics provider is loaded on this demonstration build. The specific provider and the cookies it sets will be named here before the site goes live.",
          ],
        },
        {
          heading: "Marketing cookies (optional, off by default)",
          paragraphs: [
            "These would be used to measure whether advertising leads to enquiries. They are off unless you turn them on, and no marketing technology is currently loaded on this site.",
          ],
        },
        {
          heading: "How we ask for consent",
          paragraphs: [
            "We ask before setting anything optional. There is no implied consent from continuing to browse or scrolling the page, accepting and rejecting are given equal prominence, and no optional script runs before you decide.",
            "We ask again after six months, and again if we introduce a new category of cookie.",
          ],
        },
        {
          heading: "Third-party embeds",
          paragraphs: [
            "We do not embed a third-party map, video player or social widget on this site, because those typically set cookies as soon as the page loads — before you have had a chance to choose. If any is added in future it will be loaded only after the relevant consent has been given.",
          ],
        },
        {
          heading: "Browser controls",
          paragraphs: [
            "You can also block or delete cookies through your browser settings, and most browsers let you refuse them entirely. Blocking strictly necessary cookies may stop parts of this site working correctly.",
          ],
        },
      ]}
    />
  );
}
