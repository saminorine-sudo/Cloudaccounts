import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { getSiteSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of use",
  description:
    "The terms on which you may use the CloudAccounts website, including the limits of the information and calculators provided.",
  canonicalPath: "/terms",
});

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage
      title="Terms of use"
      lead="The terms on which this website is made available, and the limits of what it provides."
      updatedAt="2026-09-01"
      showTemplateNotice={settings.showDemoNotices}
      sections={[
        {
          heading: "About these terms",
          paragraphs: [
            "These terms govern your use of this website. By using the site you accept them. If you do not accept them, please do not use the site.",
            "These terms cover the website only. Engaging us to provide accountancy services is a separate matter governed by a written engagement letter, which will always take precedence over anything on this website.",
          ],
        },
        {
          heading: "The information on this site is general",
          paragraphs: [
            "Articles, guides, FAQs and calculators on this site provide general information about UK accounting and tax. They are not advice, they are not tailored to your circumstances, and they must not be relied on as a substitute for professional advice.",
            "Nothing on this website creates a client relationship. That begins only when we have agreed an engagement in writing and completed the client identification checks required of accountancy firms.",
          ],
        },
        {
          heading: "Calculators and estimates",
          paragraphs: [
            "The calculators produce estimates using the rates and assumptions displayed alongside each result. They deliberately ignore many factors that affect a real tax position, including reliefs, allowances, losses, other income and individual circumstances.",
            "Tax rates and thresholds change, and figures shown may not reflect the most recent changes. Always confirm the current position on GOV.UK or with an accountant before relying on any number produced here.",
            "Income tax figures in the calculators use the rates and bands for England, Wales and Northern Ireland. Scotland sets different rates and bands.",
          ],
        },
        {
          heading: "Accuracy and availability",
          paragraphs: [
            "We take care to keep the site accurate and current, but we do not warrant that it is free from errors or that it will always be available. We may change, suspend or withdraw any part of it without notice.",
          ],
        },
        {
          heading: "Links to other sites",
          paragraphs: [
            "Where we link to other websites, including GOV.UK and the ICO, those links are provided for convenience. We are not responsible for the content of external sites.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The content, design and code of this website belong to us or our licensors. You may view, download and print pages for your own use. You may not republish or reproduce material from this site commercially without our permission.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "You must not misuse this website. In particular, you must not attempt to gain unauthorised access to it, submit false information through its forms, use automated means to submit forms, or take any action that places an unreasonable load on the service.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "To the fullest extent permitted by law, we exclude liability for any loss arising from reliance on information published on this website. Nothing in these terms excludes or limits liability where it would be unlawful to do so, including liability for death or personal injury caused by negligence, or for fraud.",
            "The precise liability provisions will be settled with a legal adviser before this site is published.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute arising from them.",
          ],
        },
      ]}
    />
  );
}
