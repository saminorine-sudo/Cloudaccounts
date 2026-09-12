import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CtaBand, FaqSection, PageHero } from "@/components/marketing/sections";
import { Icon } from "@/components/ui/icon";
import { Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { pricingDisclaimer, pricingNotes } from "@/content/pricing";
import { getFaqs, getPricingPlans, getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Fixed monthly accountancy fees for UK sole traders, limited companies and growing businesses. No tie-in period and no charge for asking a question.",
  canonicalPath: "/pricing",
});

const included = [
  {
    title: "Unlimited questions",
    body: "Ask as much as you like. We do not bill by the email, because clients who are afraid to ask make worse decisions.",
  },
  {
    title: "A named accountant",
    body: "The same person each time, who already knows how your business works.",
  },
  {
    title: "Deadline tracking",
    body: "Your filing dates are tracked and you are reminded well ahead of each one.",
  },
  {
    title: "Software included",
    body: "Cloud accounting set up and supported, or we work with what you already use.",
  },
  {
    title: "Free handover",
    body: "We deal with your previous accountant and the transfer of records at no extra cost.",
  },
  {
    title: "No tie-in",
    body: "A rolling monthly arrangement with a month's notice either way.",
  },
];

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function PricingPage() {
  const [plans, faqs, settings] = await Promise.all([
    getPricingPlans(),
    getFaqs({ category: "pricing" }),
    getSiteSettings(),
  ]);

  const allFaqs = [...faqs, ...(await getFaqs({ category: "switching" }))];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <JsonLd data={faqJsonLd(allFaqs)} />

      <PageHero
        eyebrow="Pricing"
        title="Fixed monthly fees, agreed in writing."
        lead="No hourly billing and no surprise invoices. Pick the plan that matches your structure — we confirm your exact fee after a short consultation, once we know your turnover, transaction volume and which services you need."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      />

      <Section tone="surface">
        <Container>
          <PricingTable
            plans={plans}
            notes={pricingNotes}
            disclaimer={pricingDisclaimer}
            showDisclaimer={settings.showDemoNotices}
          />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="In every plan"
            title="What you get regardless of which plan you're on."
            align="center"
          />

          <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => (
              <li key={item.title} className="flex gap-3">
                <Icon
                  name="check"
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  strokeWidth={2.2}
                />
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <FaqSection
            faqs={allFaqs}
            title="Questions about fees"
            name="pricing-faq"
          />
        </Container>
      </Section>

      <Section tone="white">
        <Container size="narrow">
          <Card className="p-7 sm:p-9">
            <SectionHeading
              eyebrow="Tailored quote"
              title="Get a fee for your business."
              lead="Tell us a little about how you trade and we'll send a fixed monthly fee within one working day. No obligation."
              as="h2"
            />
            <div className="mt-8">
              <LeadForm source="pricing-page" />
            </div>
          </Card>
        </Container>
      </Section>

      <CtaBand
        title="Rather talk it through?"
        body="Book a free 30-minute consultation and we'll give you a number on the call."
        primaryLabel="Book a Free Consultation"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </>
  );
}
