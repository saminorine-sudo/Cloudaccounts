import type { Metadata } from "next";
import Link from "next/link";

import {
  CaseStudies,
  CtaBand,
  PageHero,
  StatsBand,
  WhyUs,
} from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import {
  getCaseStudies,
  getSiteSettings,
  getSiteStats,
  getTeamMembers,
} from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About us",
  description:
    "CloudAccounts is a London-based accountancy firm supporting UK sole traders, contractors and limited companies with accounting, tax and business advice.",
  canonicalPath: "/about",
});

const values = [
  {
    title: "Say it plainly",
    body: "If a client cannot repeat back what we told them, we have not explained it. Technical accuracy and plain language are not in tension.",
  },
  {
    title: "Early beats correct-but-late",
    body: "A rough number in October is worth more than an exact one in March. We front-load the conversations that can still change the outcome.",
  },
  {
    title: "No surprises",
    body: "Fees agreed in writing, deadlines flagged early, and bad news delivered as soon as we know it rather than when it is unavoidable.",
  },
  {
    title: "Own the whole chain",
    body: "Bookkeeping, VAT, payroll and accounts share one set of records. Splitting them across firms is where errors and blame live.",
  },
];

export default async function AboutPage() {
  const [settings, stats, team, caseStudies] = await Promise.all([
    getSiteSettings(),
    getSiteStats(),
    getTeamMembers(),
    getCaseStudies(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHero
        eyebrow="About"
        title="An accountancy firm built around explaining things."
        lead="CloudAccounts was started by people who had spent years watching clients receive technically correct accounts that nobody had bothered to talk them through. We thought the second part was the job."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="Why the firm exists"
                as="h2"
              />
              <div className="prose-ca mt-7">
                <p>
                  Most small businesses do not have a finance function. They
                  have an owner who is very good at the thing the business
                  actually does, and a set of obligations that arrive whether
                  or not anyone has time for them.
                </p>
                <p>
                  The traditional model handles the obligations and stops there.
                  Accounts get filed, a tax bill appears, and the owner is no
                  better informed about their own business than they were twelve
                  months earlier. That is compliance done properly and advice
                  not done at all.
                </p>
                <p>
                  We built CloudAccounts around the other half. Compliance is
                  the baseline and it has to be right — but the value sits in
                  the conversations either side of it: what the numbers mean,
                  what to do before the year ends, whether the next hire is
                  affordable.
                </p>
                <p>
                  In practice that means fixed fees so clients are not charged
                  for asking, a named accountant so they are not re-explaining
                  their business every time, and a mid-year review so planning
                  happens while it can still make a difference.
                </p>
              </div>

              <h2 className="mt-14 text-display-sm">How we work</h2>
              <div className="prose-ca mt-6">
                <p>
                  We work with cloud accounting software and set it up properly
                  at onboarding, because good records are what every other
                  number depends on. Most of our work happens over video call
                  and email, and our clients are spread across the UK rather
                  than clustered around one office.
                </p>
                <p>
                  We keep bookkeeping, VAT, payroll and year-end within one
                  team. When those are split between different firms, errors
                  fall into the gaps and nobody owns them.
                </p>
              </div>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">Our mission</h2>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">
                  To make sure every business we work with understands its own
                  numbers well enough to make better decisions with them.
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">
                  Qualifications and regulation
                </h2>
                {settings.showDemoNotices ? (
                  <Alert tone="demo" className="mt-3.5">
                    This demonstration site does not state any professional
                    qualifications, memberships or regulatory registrations.
                    Those are regulated claims and will only be published once
                    verified. The CMS has fields ready for them.
                  </Alert>
                ) : (
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">
                    Details of our professional memberships and regulatory
                    registrations are available on request.
                  </p>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">
                  Meet the team
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {team.slice(0, 6).map((member) => (
                    <li key={member.id}>
                      <Avatar
                        name={member.name}
                        photoUrl={member.photoUrl}
                        size="sm"
                      />
                    </li>
                  ))}
                </ul>
                <Link
                  href="/team"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  See the whole team
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      <StatsBand stats={stats} showDemoNotice={settings.showDemoNotices} />

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Our values"
            title="Four things we hold ourselves to."
          />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <li key={value.title} className="border-l-2 border-brand-500 pl-5">
                <h3 className="text-lg font-semibold text-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Why CloudAccounts"
            title="What working with us is like."
          />
          <div className="mt-12">
            <WhyUs />
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeading eyebrow="Case studies" title="The kind of work we do." />
          <div className="mt-12">
            <CaseStudies
              caseStudies={caseStudies}
              showDemoNotice={settings.showDemoNotices}
            />
          </div>
        </Container>
      </Section>

      <Section tone="surface" spacing="tight">
        <Container className="flex flex-col items-center gap-6 text-center">
          <SectionHeading
            title="Talk to Our Team"
            lead="A free 30-minute consultation with the person who would actually look after your accounts."
            align="center"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book-consultation" size="lg">
              Book a Free Consultation
            </ButtonLink>
            <ButtonLink href="/team" variant="secondary" size="lg" withArrow>
              Meet the team
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
