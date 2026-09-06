import type { Metadata } from "next";

import { CtaBand, PageHero } from "@/components/marketing/sections";
import { Avatar } from "@/components/ui/avatar";
import { DemoNotice } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { getSiteSettings, getTeamMembers } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Our team",
  description:
    "Meet the CloudAccounts team — the accountants, bookkeepers and payroll specialists who look after our clients.",
  canonicalPath: "/team",
});

export default async function TeamPage() {
  const [team, settings] = await Promise.all([
    getTeamMembers(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ])}
      />

      <PageHero
        eyebrow="Our team"
        title="The people who'd look after your accounts."
        lead="Every client gets a named accountant. You deal with the same person each time, and they already know how your business works."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Team" }]}
      />

      <Section tone="surface">
        <Container>
          {settings.showDemoNotices ? (
            <DemoNotice className="mb-10">
              <strong className="font-semibold">Placeholder profiles.</strong>{" "}
              The people below are illustrative. Professional qualifications and
              memberships are deliberately left blank — those are regulated
              claims and will only be published once verified.
            </DemoNotice>
          ) : null}

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <Reveal as="li" key={member.id} delay={index * 50}>
                <Card className="flex h-full flex-col overflow-hidden">
                  {/* Portrait area. Uses an initials monogram until real
                      photography is supplied — generic stock portraits would
                      misrepresent who works here. */}
                  <div className="flex aspect-4/3 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100/60">
                    <div className="h-24 w-24">
                      <Avatar
                        name={member.name}
                        photoUrl={member.photoUrl}
                        size="xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold text-ink">
                      {member.name}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-brand-700">
                      {member.role}
                    </p>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                      {member.bio}
                    </p>

                    {member.focus.length > 0 ? (
                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {member.focus.map((area) => (
                          <li key={area}>
                            <Badge tone="neutral">{area}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {/* Rendered only when real credentials exist. */}
                    {member.qualifications.length > 0 ||
                    member.memberships.length > 0 ? (
                      <dl className="mt-5 border-t border-line pt-4 text-sm">
                        {member.qualifications.length > 0 ? (
                          <div>
                            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Qualifications
                            </dt>
                            <dd className="mt-1 text-ink-soft">
                              {member.qualifications.join(", ")}
                            </dd>
                          </div>
                        ) : null}
                        {member.memberships.length > 0 ? (
                          <div className="mt-3">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Memberships
                            </dt>
                            <dd className="mt-1 text-ink-soft">
                              {member.memberships.join(", ")}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}

                    {member.email || member.linkedinUrl ? (
                      <div className="mt-5 flex gap-2 border-t border-line pt-4">
                        {member.email ? (
                          <a
                            href={`mailto:${member.email}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted ring-1 ring-line transition-colors hover:text-brand-700"
                          >
                            <Icon
                              name="mail"
                              className="h-4 w-4"
                              title={`Email ${member.name}`}
                            />
                          </a>
                        ) : null}
                        {member.linkedinUrl ? (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted ring-1 ring-line transition-colors hover:text-brand-700"
                          >
                            <Icon
                              name="linkedin"
                              className="h-4 w-4"
                              title={`${member.name} on LinkedIn`}
                            />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title="Talk to one of the team."
        body="Book a free 30-minute consultation with the person who would look after your accounts."
      />
    </>
  );
}
