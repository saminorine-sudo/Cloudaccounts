import type { Metadata } from "next";

import {
  AudienceCards,
  CtaBand,
  HowItWorks,
  PageHero,
} from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { getAudiences } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Who we help",
  description:
    "Accountants for UK sole traders, contractors, limited companies and growing businesses. Support shaped around your structure, not a standard package.",
  canonicalPath: "/who-we-help",
});

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function WhoWeHelpPage() {
  const audiences = await getAudiences();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Who We Help", path: "/who-we-help" },
        ])}
      />

      <PageHero
        eyebrow="Who we help"
        title="Support shaped around how you actually trade."
        lead="A sole trader filing one return and a business running payroll for twenty people need very different things. We start from what your structure actually requires."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Who We Help" }]}
      >
        <ButtonLink href="/book-consultation" size="lg">
          Book a Free Consultation
        </ButtonLink>
      </PageHero>

      <Section tone="surface">
        <Container>
          <AudienceCards audiences={audiences} />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Getting started takes one conversation."
            align="center"
          />
          <div className="mt-14">
            <HowItWorks />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
