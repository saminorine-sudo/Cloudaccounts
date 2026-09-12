import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadForm } from "@/components/forms/lead-form";
import { CtaBand, PageHero } from "@/components/marketing/sections";
import { ArrowLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Icon, IconTile } from "@/components/ui/icon";
import { Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { getFaqs, getServiceBySlug, getServices } from "@/lib/content";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  serviceJsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return buildMetadata(service.seo);
}

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [allServices, faqs] = await Promise.all([
    getServices(),
    getFaqs({ ids: service.faqIds }),
  ]);

  const otherServices = allServices.filter((item) => item.slug !== service.slug);

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: service.title,
          description: service.summary,
          path: `/services/${service.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />
      {faqs.length > 0 ? <JsonLd data={faqJsonLd(faqs)} /> : null}

      <PageHero
        eyebrow="Service"
        title={service.title}
        lead={service.intro}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="What's included"
                title={`What ${service.title.toLowerCase()} covers`}
                as="h2"
              />

              <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon
                      name="check"
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600"
                      strokeWidth={2.2}
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-14 text-display-sm">
                The problems this solves
              </h2>
              <dl className="mt-7 flex flex-col divide-y divide-line border-t border-line">
                {service.outcomes.map((outcome) => (
                  <div key={outcome.problem} className="grid gap-2 py-5 sm:grid-cols-2 sm:gap-8">
                    <dt className="flex items-start gap-2.5 text-[0.9375rem] font-medium text-ink">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                      {outcome.problem}
                    </dt>
                    <dd className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-muted sm:pl-4">
                      <Icon
                        name="arrow-right"
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      />
                      {outcome.outcome}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="p-6">
                <IconTile name={service.icon} />
                <h2 className="mt-5 text-lg font-semibold text-ink">
                  Talk to us about {service.title.toLowerCase()}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  A free 30-minute consultation. We&rsquo;ll tell you what we
                  would do and what it would cost, with no obligation.
                </p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <Link
                    href="/book-consultation"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-brand-800"
                    data-analytics={`service-${service.slug}-book`}
                  >
                    Book a Free Consultation
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-[0.9375rem] font-medium text-ink ring-1 ring-line transition-colors hover:ring-brand-300"
                  >
                    See pricing
                  </Link>
                </div>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-sm font-semibold text-ink">
                  Other services
                </h2>
                <ul className="mt-3.5 flex flex-col gap-2.5">
                  {otherServices.map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={`/services/${other.slug}`}
                        className="group flex items-center justify-between gap-3 text-sm text-ink-soft transition-colors hover:text-brand-700"
                      >
                        {other.title}
                        <Icon
                          name="arrow-right"
                          className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {faqs.length > 0 ? (
        <Section tone="white">
          <Container size="narrow">
            <SectionHeading
              eyebrow="FAQs"
              title="Common questions"
              align="center"
            />
            <Accordion
              name={`${service.slug}-faq`}
              items={faqs.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
              }))}
              className="mt-10 border-t border-line"
            />
            <p className="mt-8 text-center">
              <ArrowLink href="/contact">Ask us something else</ArrowLink>
            </p>
          </Container>
        </Section>
      ) : null}

      <Section tone="surface">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Get a quote"
            title={`Tell us about your ${service.title.toLowerCase()} needs`}
            lead="A few details and we'll come back with a fixed monthly fee within one working day."
            align="center"
          />
          <div className="mt-10">
            <LeadForm source={`service-${service.slug}`} compact />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
