import type { Metadata } from "next";

import { PricingTable } from "@/components/marketing/pricing-table";
import {
  AudienceCards,
  CaseStudies,
  CtaBand,
  FaqSection,
  Hero,
  HowItWorks,
  ServiceCards,
  StatsBand,
  Testimonials,
  WhyUs,
} from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { pricingDisclaimer, pricingNotes } from "@/content/pricing";
import {
  getAudiences,
  getCaseStudies,
  getFaqs,
  getPricingPlans,
  getServices,
  getSiteSettings,
  getSiteStats,
  getTestimonials,
} from "@/lib/content";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Accountants for UK businesses",
  description:
    "Accounting, tax, bookkeeping, VAT and payroll support for UK sole traders, contractors and limited companies. Fixed monthly fees and a named accountant. Book a free consultation.",
  canonicalPath: "/",
});

export default async function HomePage() {
  const [
    settings,
    stats,
    services,
    audiences,
    testimonials,
    caseStudies,
    plans,
    faqs,
  ] = await Promise.all([
    getSiteSettings(),
    getSiteStats(),
    getServices(),
    getAudiences(),
    getTestimonials({ featuredOnly: true, limit: 3 }),
    getCaseStudies(),
    getPricingPlans(),
    getFaqs({ limit: 6 }),
  ]);

  const demo = settings.showDemoNotices;

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />

      <Hero />

      <StatsBand stats={stats} showDemoNotice={demo} />

      <Section tone="surface" id="services">
        <Container>
          <SectionHeading
            eyebrow="Services"
            title="Everything you need to stay financially organised."
            lead="Compliance handled properly, and the planning conversations that actually change the outcome — from one team working off one set of records."
          />
          <div className="mt-12">
            <ServiceCards services={services} />
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Who we help"
            title="Support shaped around how you actually trade."
            lead="A sole trader and a business with twenty staff need different things. We start from what your structure requires rather than a standard package."
          />
          <div className="mt-12">
            <AudienceCards audiences={audiences} />
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Why CloudAccounts"
            title="What working with us is actually like."
            lead="Not claims about being the best. Just the things clients tell us made the difference when they moved."
          />
          <div className="mt-12">
            <WhyUs />
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to get started."
            align="center"
          />
          <div className="mt-14">
            <HowItWorks />
          </div>
          <div className="mt-12 flex justify-center">
            <ButtonLink
              href="/book-consultation"
              size="lg"
              data-analytics="how-it-works-cta"
            >
              Get Started
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Fixed monthly fees, agreed in writing."
            lead="Pick the plan that matches your structure. Your quote is confirmed after a consultation, once we know your turnover, transaction volume and which services you need."
            align="center"
          />
          <div className="mt-12">
            <PricingTable
              plans={plans}
              notes={pricingNotes}
              disclaimer={pricingDisclaimer}
              showDisclaimer={demo}
            />
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Case studies"
            title="The kind of work we do."
            lead="Three scenarios that show what changes when the numbers stop being an annual event."
          />
          <div className="mt-12">
            <CaseStudies caseStudies={caseStudies} showDemoNotice={demo} />
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Client feedback"
            title="What our clients say."
          />
          <div className="mt-12">
            <Testimonials testimonials={testimonials} showDemoNotice={demo} />
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <FaqSection
            faqs={faqs}
            lead="The questions we get asked most often. If yours is not here, ask us directly — we will give you a straight answer."
            name="home-faq"
          />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
