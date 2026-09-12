import type { Metadata } from "next";

import {
  CtaBand,
  FaqSection,
  PageHero,
  ServiceCards,
} from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { getAudiences, getFaqs, getServices } from "@/lib/content";
import { AudienceCards } from "@/components/marketing/sections";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Accountancy services",
  description:
    "Accounting, Corporation Tax, bookkeeping, VAT, payroll and business advisory services for UK businesses. Fixed monthly fees and a named accountant.",
  canonicalPath: "/services",
});

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function ServicesPage() {
  const [services, audiences, faqs] = await Promise.all([
    getServices(),
    getAudiences(),
    getFaqs({ category: "services" }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHero
        eyebrow="Services"
        title="Everything you need to stay financially organised."
        lead="Six services that fit together. Most clients take a combination, and because one team handles all of it, the same set of records feeds your bookkeeping, VAT, payroll, accounts and tax return."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/book-consultation" size="lg">
            Book a Free Consultation
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary" size="lg" withArrow>
            See pricing
          </ButtonLink>
        </div>
      </PageHero>

      <Section tone="surface">
        <Container>
          <ServiceCards services={services} />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Who we help"
            title="Not sure which services you need?"
            lead="Start from your business structure instead. Each page sets out what that kind of business typically needs and why."
          />
          <div className="mt-12">
            <AudienceCards audiences={audiences} />
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <FaqSection faqs={faqs} name="services-faq" />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
