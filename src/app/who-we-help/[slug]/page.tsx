import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadForm } from "@/components/forms/lead-form";
import { CtaBand, PageHero } from "@/components/marketing/sections";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Icon, IconTile } from "@/components/ui/icon";
import { Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { pricingDisclaimer } from "@/content/pricing";
import {
  getAudienceBySlug,
  getAudiences,
  getPricingPlanBySlug,
  getServices,
  getSiteSettings,
} from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const audiences = await getAudiences();
  return audiences.map((audience) => ({ slug: audience.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const audience = await getAudienceBySlug(slug);
  if (!audience) return {};
  return buildMetadata(audience.seo);
}

export default async function AudiencePage({ params }: Props) {
  const { slug } = await params;
  const audience = await getAudienceBySlug(slug);
  if (!audience) notFound();

  const [allServices, plan, settings] = await Promise.all([
    getServices(),
    getPricingPlanBySlug(audience.recommendedPlanSlug),
    getSiteSettings(),
  ]);

  const recommended = allServices.filter((service) =>
    audience.recommendedServiceSlugs.includes(service.slug),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Who We Help", path: "/who-we-help" },
          { name: audience.title, path: `/who-we-help/${audience.slug}` },
        ])}
      />

      <PageHero
        eyebrow="Who we help"
        title={`Accountants for ${audience.title.toLowerCase()}`}
        lead={audience.intro}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Who We Help", href: "/who-we-help" },
          { label: audience.title },
        ]}
      />

      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="What we hear"
                title="The problems that bring people to us"
                as="h2"
              />
              <ul className="mt-8 flex flex-col gap-3">
                {audience.challenges.map((challenge) => (
                  <li
                    key={challenge}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-line"
                  >
                    <Icon
                      name="warning"
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600"
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                      {challenge}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading
                eyebrow="How we help"
                title="What we do about it"
                as="h2"
              />
              <dl className="mt-8 flex flex-col gap-6">
                {audience.support.map((item) => (
                  <div key={item.title}>
                    <dt className="flex items-center gap-2.5 text-base font-semibold text-ink">
                      <Icon
                        name="check"
                        className="h-4.5 w-4.5 text-brand-600"
                        strokeWidth={2.2}
                      />
                      {item.title}
                    </dt>
                    <dd className="mt-2 pl-7 text-[0.9375rem] leading-relaxed text-muted">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Recommended services"
            title={`What ${audience.title.toLowerCase()} usually need`}
            lead="A starting point, not a fixed package. We confirm the right mix on the consultation."
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
                >
                  <IconTile name={service.icon} />
                  <h3 className="mt-5 text-base font-semibold text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {service.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    Learn more
                    <Icon
                      name="arrow-right"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {plan ? (
        <Section tone="surface">
          <Container size="narrow">
            <SectionHeading
              eyebrow="Pricing"
              title="Where most start"
              lead={`${audience.title} usually begin on our ${plan.name} plan. Your confirmed fee depends on turnover, transaction volume and which services you need.`}
              align="center"
            />
            <div className="mt-10">
              <PricingTable
                plans={[plan]}
                disclaimer={pricingDisclaimer}
                showDisclaimer={settings.showDemoNotices}
              />
            </div>
            <p className="mt-8 text-center">
              <Link
                href="/pricing"
                className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Compare all plans
              </Link>
            </p>
          </Container>
        </Section>
      ) : null}

      <Section tone="white">
        <Container size="narrow">
          <Card className="p-7 sm:p-9">
            <SectionHeading
              eyebrow="Get a quote"
              title={`Tell us about your business`}
              lead="A few details and we'll come back with a fixed monthly fee within one working day."
              as="h2"
            />
            <div className="mt-8">
              <LeadForm source={`audience-${audience.slug}`} compact />
            </div>
          </Card>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
