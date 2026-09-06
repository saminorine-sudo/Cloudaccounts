import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand, PageHero } from "@/components/marketing/sections";
import { Icon } from "@/components/ui/icon";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { formatDateShort } from "@/lib/format";
import { getGuides } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description:
    "Practical checklists and explainers for UK business owners — starting a limited company, switching accountants and keeping proper records.",
  canonicalPath: "/resources/guides",
});

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides", path: "/resources/guides" },
        ])}
      />

      <PageHero
        eyebrow="Guides"
        title="Practical checklists, not gated PDFs."
        lead="The things that come up once and matter a lot: setting a company up properly, moving accountants, keeping records that stand up. No email address required."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Guides" },
        ]}
      />

      <Section tone="surface">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, index) => (
              <Reveal as="li" key={guide.id} delay={index * 60}>
                <Link href={`/resources/guides/${guide.slug}`}>
                  <Card
                    interactive
                    className="flex h-full flex-col p-6 hover:ring-brand-200"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{guide.format}</Badge>
                      <Badge tone="neutral">{guide.audience}</Badge>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-ink">
                      {guide.title}
                    </h2>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                      {guide.summary}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-xs text-muted">
                        {guide.sections.length} sections · updated{" "}
                        {formatDateShort(guide.updatedAt)}
                      </span>
                      <Icon
                        name="arrow-right"
                        className="h-4 w-4 text-brand-600"
                      />
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title="Want this applied to your business?"
        body="A free 30-minute consultation covers far more ground than a checklist can."
      />
    </>
  );
}
