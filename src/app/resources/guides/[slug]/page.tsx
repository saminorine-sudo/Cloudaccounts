import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaBand, PageHero } from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { formatDate } from "@/lib/format";
import { getGuideBySlug, getGuides } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  return buildMetadata(guide.seo);
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const others = (await getGuides()).filter((item) => item.slug !== guide.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides", path: "/resources/guides" },
          { name: guide.title, path: `/resources/guides/${guide.slug}` },
        ])}
      />

      <PageHero
        eyebrow={guide.format}
        title={guide.title}
        lead={guide.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Guides", href: "/resources/guides" },
          { label: guide.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="neutral">For {guide.audience.toLowerCase()}</Badge>
          <span className="text-xs text-muted">
            Updated {formatDate(guide.updatedAt)}
          </span>
        </div>
      </PageHero>

      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
            <div className="min-w-0 max-w-3xl">
              <ol className="flex flex-col gap-10">
                {guide.sections.map((section, index) => (
                  <li key={section.heading}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-semibold text-ink">
                        {section.heading}
                      </h2>
                    </div>

                    <ul className="mt-4 flex flex-col gap-3 pl-10">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <Icon
                            name="check"
                            className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600"
                            strokeWidth={2.2}
                          />
                          <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              <Card tone="mint" className="mt-12 p-6">
                <h2 className="text-base font-semibold text-brand-900">
                  General guidance, not advice
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-brand-900/80">
                  This guide describes general UK practice. Requirements change
                  and the right answer depends on your circumstances — check
                  the current position on GOV.UK or ask us before acting on it.
                </p>
              </Card>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-ink">
                  Want help with this?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  We do this every week. A free consultation will save you
                  working it out yourself.
                </p>
                <ButtonLink
                  href="/book-consultation"
                  size="sm"
                  className="mt-4 w-full"
                  data-analytics={`guide-${guide.slug}-cta`}
                >
                  Book a Free Consultation
                </ButtonLink>
              </Card>

              {others.length > 0 ? (
                <Card className="p-5">
                  <h2 className="text-sm font-semibold text-ink">
                    Other guides
                  </h2>
                  <ul className="mt-3.5 flex flex-col gap-2.5">
                    {others.map((other) => (
                      <li key={other.slug}>
                        <Link
                          href={`/resources/guides/${other.slug}`}
                          className="group flex items-start justify-between gap-3 text-sm text-ink-soft transition-colors hover:text-brand-700"
                        >
                          {other.title}
                          <Icon
                            name="arrow-right"
                            className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
