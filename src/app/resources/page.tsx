import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand, PageHero } from "@/components/marketing/sections";
import { ArrowLink } from "@/components/ui/button";
import { Icon, IconTile, type UiIconName } from "@/components/ui/icon";
import { Badge, Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { formatDateShort } from "@/lib/format";
import { getBlogPosts, getGuides } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Resources",
  description:
    "Articles, practical guides and UK tax calculators for sole traders, contractors and limited companies from CloudAccounts.",
  canonicalPath: "/resources",
});

const sections: {
  href: string;
  icon: UiIconName;
  title: string;
  description: string;
}[] = [
  {
    href: "/resources/blog",
    icon: "ledger",
    title: "Blog",
    description:
      "Articles on tax, accounting and running a UK business — written to answer a question, not to hit a word count.",
  },
  {
    href: "/resources/guides",
    icon: "compass",
    title: "Guides",
    description:
      "Practical checklists and explainers for the things that come up once: incorporating, switching accountants, record keeping.",
  },
  {
    href: "/resources/calculators",
    icon: "calculator",
    title: "Calculators",
    description:
      "Corporation Tax, VAT, take-home pay and salary/dividend estimates, built on a single dated set of UK rates.",
  },
];

export default async function ResourcesPage() {
  const [posts, guides] = await Promise.all([
    getBlogPosts({ limit: 3 }),
    getGuides(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />

      <PageHero
        eyebrow="Resources"
        title="Useful things, written to actually be useful."
        lead="Articles, checklists and calculators for UK business owners. No gated PDFs, and nothing written purely to rank."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />

      <Section tone="surface">
        <Container>
          <ul className="grid gap-5 lg:grid-cols-3">
            {sections.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="group flex h-full flex-col rounded-card bg-white p-7 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
                >
                  <IconTile name={section.icon} />
                  <h2 className="mt-5 text-lg font-semibold text-ink">
                    {section.title}
                  </h2>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                    {section.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    Browse {section.title.toLowerCase()}
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

      <Section tone="white">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Latest" title="Recent articles" />
            <ArrowLink href="/resources/blog">All articles</ArrowLink>
          </div>

          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/resources/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
                >
                  <p className="text-xs text-muted">
                    {formatDateShort(post.publishedAt)} · {post.readingMinutes}{" "}
                    min read
                  </p>
                  <h3 className="mt-2.5 text-base font-semibold text-ink transition-colors group-hover:text-brand-800">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Guides" title="Practical checklists" />
            <ArrowLink href="/resources/guides">All guides</ArrowLink>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.map((guide) => (
              <li key={guide.id}>
                <Link href={`/resources/guides/${guide.slug}`}>
                  <Card interactive className="h-full p-6 hover:ring-brand-200">
                    <Badge tone="neutral">{guide.format}</Badge>
                    <h3 className="mt-4 text-base font-semibold text-ink">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {guide.summary}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title="Got a question the articles don't answer?"
        body="Book a free consultation and ask an accountant directly. No obligation attached."
      />
    </>
  );
}
