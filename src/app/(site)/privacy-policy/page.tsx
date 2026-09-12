import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { getSiteSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "How CloudAccounts collects, uses and protects personal information submitted through this website.",
  canonicalPath: "/privacy-policy",
});

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage
      title="Privacy policy"
      lead="What personal information this website collects, why, and what you can do about it."
      updatedAt="2026-09-01"
      showTemplateNotice={settings.showDemoNotices}
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            `${settings.legalName} operates this website. Where we decide why and how your personal information is used, we are the data controller for that information.`,
            "The details of the legal entity, its registered address and any data protection registration will be stated here before the site is published.",
          ],
        },
        {
          heading: "What we collect",
          paragraphs: [
            "We only collect information you actively give us. This site does not attempt to identify visitors who do not contact us.",
          ],
          bullets: [
            "Enquiry and quote forms: your name, email address, phone number if you provide one, business name, business type, estimated turnover, the services you are interested in, your message and your preferred contact method.",
            "Contact form: your name, email address, phone number if provided, subject and message.",
            "Consultation bookings: your name, email address, phone number if provided, business name, the date and time you selected, and any notes you add.",
            "Technical information handled by our hosting provider in the course of serving the site, such as IP address in server logs and for rate limiting.",
            "Analytics information, but only if you have given consent — see the cookie policy.",
          ],
        },
        {
          heading: "What we do not collect",
          paragraphs: [
            "The tax calculators on this site run entirely in your browser. The figures you enter — profits, salary, turnover, dividends — are never transmitted to us, are not stored, and are not sent to any analytics provider. We record only that a calculator was used, never what was entered into it.",
          ],
        },
        {
          heading: "Why we use it, and our lawful basis",
          bullets: [
            "To respond to your enquiry, quote request or booking. Lawful basis: taking steps at your request prior to entering into a contract, and our legitimate interest in responding to people who contact us.",
            "To send you an acknowledgement confirming we received your message. Lawful basis: legitimate interests.",
            "To keep our website secure and prevent abuse, including rate limiting and spam filtering. Lawful basis: legitimate interests.",
            "To measure how the website is used, where you have consented. Lawful basis: consent.",
          ],
        },
        {
          heading: "Who we share it with",
          paragraphs: [
            "We do not sell your personal information and we do not share it for anyone else's marketing.",
            "We use service providers who process information on our behalf and only on our instructions: a hosting provider, a transactional email provider to deliver acknowledgements and notifications, and — where you have consented — an analytics provider. Each provider used will be named here before publication.",
            "We may disclose information where we are required to do so by law.",
          ],
        },
        {
          heading: "Where your information is held",
          paragraphs: [
            "Our providers may process information outside the UK. Where they do, we rely on appropriate safeguards such as UK adequacy regulations or the International Data Transfer Agreement. The specific arrangements will be set out here once providers are confirmed.",
          ],
        },
        {
          heading: "How long we keep it",
          paragraphs: [
            "Enquiries that do not become client relationships are kept only as long as needed to deal with them and to keep a record of what was said, and are then deleted.",
            "Where you become a client, information is retained under our client engagement terms and for the periods required of accountancy firms by law and by professional obligations. Those periods will be stated here.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Under UK data protection law you have rights over your personal information. These include the right to be told what we hold and to receive a copy of it, to have inaccurate information corrected, to ask us to delete it, to ask us to restrict how we use it, to object to processing based on legitimate interests, to receive certain information in a portable format, and to withdraw consent at any time where we rely on consent.",
            "To exercise any of these, contact us through the contact page. We will respond within one month.",
            "If you are unhappy with how we have handled your information you can complain to the Information Commissioner's Office at ico.org.uk. We would ask you to raise it with us first so we have the chance to put it right.",
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "The site is served over HTTPS. Form submissions are validated on the server, rate limited and protected against automated abuse. Access to enquiry data is restricted to those who need it.",
            "No system is completely secure, and we will not claim otherwise. If a breach occurs that is likely to result in a risk to your rights and freedoms, we will report it as the law requires.",
          ],
        },
        {
          heading: "Children",
          paragraphs: [
            "This website is aimed at businesses and is not directed at children. We do not knowingly collect information about anyone under 18.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "If we change how we handle personal information we will update this page and change the date at the top. Significant changes will be brought to your attention.",
          ],
        },
      ]}
    />
  );
}
