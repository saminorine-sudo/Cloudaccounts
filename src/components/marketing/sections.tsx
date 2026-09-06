import Link from "next/link";

import { HeroVisual } from "@/components/marketing/hero-visual";
import { ArrowLink, ButtonLink } from "@/components/ui/button";
import { DemoNotice, Rating } from "@/components/ui/feedback";
import { Icon, IconTile, type UiIconName } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import {
  Badge,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { CountUp, Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/prose";
import { cn } from "@/lib/utils";
import type {
  Audience,
  CaseStudy,
  Faq,
  Service,
  SiteStat,
  Testimonial,
} from "@/types/content";

/* -------------------------------------------------------------------------- */
/* Homepage hero                                                              */
/* -------------------------------------------------------------------------- */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Very subtle grid, masked out towards the bottom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Badge className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Taking on new clients for the 2026/27 year
            </Badge>

            <h1 className="text-display-xl">
              Accounting that helps your business{" "}
              <span className="text-brand-700">move forward.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              Straightforward accounting, tax and business support for UK
              businesses that want clarity, confidence and room to grow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/book-consultation"
                size="lg"
                data-analytics="hero-book"
              >
                Book a Free Consultation
              </ButtonLink>
              <ButtonLink
                href="/services"
                variant="secondary"
                size="lg"
                withArrow
              >
                Explore Our Services
              </ButtonLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                "No tie-in period",
                "Fixed monthly fees",
                "A named accountant",
              ].map((point) => (
                <li
                  key={point}
                  className="inline-flex items-center gap-2 text-sm text-ink-soft"
                >
                  <Icon name="check" className="h-4 w-4 text-brand-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pl-4">
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Inner page hero                                                            */
/* -------------------------------------------------------------------------- */

export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        isDark ? "border-white/10 bg-brand-800" : "border-line bg-white",
      )}
    >
      {!isDark ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_10%_0%,#f0fdf4,transparent)]"
        />
      ) : null}

      <Container className="relative py-12 sm:py-16">
        {breadcrumbs ? (
          <Breadcrumbs
            items={breadcrumbs}
            tone={isDark ? "dark" : "light"}
            className="mb-6"
          />
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-brand-300" : "text-brand-700",
              )}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              "mt-3 text-display-lg",
              isDark && "text-white",
            )}
          >
            {title}
          </h1>

          {lead ? (
            <p
              className={cn(
                "mt-5 text-lg leading-relaxed",
                isDark ? "text-brand-100/85" : "text-muted",
              )}
            >
              {lead}
            </p>
          ) : null}

          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export function StatsBand({
  stats,
  showDemoNotice,
}: {
  stats: SiteStat[];
  showDemoNotice: boolean;
}) {
  return (
    <Section tone="dark" spacing="tight">
      <Container>
        {/*
          A <dl> may only contain <dt>/<dd> pairs, optionally wrapped in a
          single <div>. The Reveal wrapper IS that div — nesting another one
          inside it would put the <dt> two levels deep and break the list
          semantics for screen readers.
        */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.id}
              delay={index * 60}
              className="border-l-2 border-brand-500/60 pl-4"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <CountUp
                  value={stat.value}
                  className="block font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                />
                <span className="mt-1.5 block text-sm text-brand-100/80">
                  {stat.label}
                </span>
                {stat.note ? (
                  <span className="mt-1 block text-xs text-brand-100/70">
                    {stat.note}
                  </span>
                ) : null}
              </dd>
            </Reveal>
          ))}
        </dl>

        {showDemoNotice ? (
          <p className="mt-10 flex items-start gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-brand-100/75">
            <Icon name="info" className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              Illustrative demo figures. These are placeholder values used
              during development and have not been verified — they are not
              statements of the firm&rsquo;s actual performance.
            </span>
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <Reveal as="li" key={service.id} delay={index * 50}>
          <Card
            interactive
            className="group flex h-full flex-col p-6 hover:ring-brand-200"
          >
            <IconTile name={service.icon} />
            <h3 className="mt-5 text-lg font-semibold text-ink">
              {service.title}
            </h3>
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">
              {service.summary}
            </p>
            <ArrowLink
              href={`/services/${service.slug}`}
              className="mt-5"
            >
              Learn more
            </ArrowLink>
          </Card>
        </Reveal>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Audiences                                                                  */
/* -------------------------------------------------------------------------- */

export function AudienceCards({ audiences }: { audiences: Audience[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {audiences.map((audience, index) => (
        <Reveal as="li" key={audience.id} delay={index * 50}>
          <Link
            href={`/who-we-help/${audience.slug}`}
            className="group flex h-full flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
          >
            <IconTile name={audience.icon} />
            <h3 className="mt-5 text-lg font-semibold text-ink">
              {audience.title}
            </h3>
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">
              {audience.summary}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
              View support
              <Icon
                name="arrow-right"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Why CloudAccounts                                                          */
/* -------------------------------------------------------------------------- */

const benefits: { icon: UiIconName; title: string; body: string }[] = [
  {
    icon: "compass",
    title: "Clear advice",
    body: "We explain things in plain English. If an answer needs a technical term, we tell you what it means rather than assuming you already know.",
  },
  {
    icon: "spark",
    title: "Proactive support",
    body: "Telling you what already happened is the easy part. We review your position while there is still time to change the outcome.",
  },
  {
    icon: "chart",
    title: "Modern technology",
    body: "Cloud accounting, receipt capture and bank feeds, set up properly, so the admin takes minutes a week instead of evenings.",
  },
  {
    icon: "people",
    title: "Personal service",
    body: "You get a named accountant who knows your business, not a shared inbox and a different person each time.",
  },
  {
    icon: "briefcase",
    title: "Business-focused",
    body: "Compliance is the baseline. What we care about is whether you can read your own numbers and act on them.",
  },
  {
    icon: "tag",
    title: "Transparent pricing",
    body: "A fixed monthly fee agreed in writing up front. No hourly billing, and no charge for asking a question.",
  },
];

export function WhyUs() {
  return (
    <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map((benefit, index) => (
        <Reveal as="li" key={benefit.title} delay={index * 40}>
          <div className="flex gap-4">
            <IconTile name={benefit.icon} className="shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-ink">
                {benefit.title}
              </h3>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                {benefit.body}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    number: "01",
    title: "Tell us about your business",
    body: "A short conversation about how you trade, what you have in place and what is not working. No forms to complete beforehand.",
  },
  {
    number: "02",
    title: "Get a tailored accounting plan",
    body: "We set out exactly which services you need, what each one covers and what it costs — in writing, before you commit to anything.",
  },
  {
    number: "03",
    title: "Get back to running your business",
    body: "We handle the onboarding, including the handover from your current accountant, and take the filing calendar off your desk.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-8 md:grid-cols-3">
      {steps.map((step, index) => (
        <Reveal as="li" key={step.number} delay={index * 80}>
          <div className="relative">
            {/* Connector rule between steps on wide screens. */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-14 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-line md:block"
              />
            ) : null}

            <span className="relative inline-flex h-10 items-center justify-center rounded-full bg-brand-700 px-4 font-display text-sm font-bold tracking-wider text-white">
              {step.number}
            </span>

            <h3 className="mt-5 text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              {step.body}
            </p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export function Testimonials({
  testimonials,
  showDemoNotice,
}: {
  testimonials: Testimonial[];
  showDemoNotice: boolean;
}) {
  return (
    <>
      {showDemoNotice ? (
        <DemoNotice className="mb-8">
          <strong className="font-semibold">Placeholder reviews.</strong> The
          quotes below were written for development and are not from real
          clients. They will be replaced with reviews the firm holds permission
          to publish.
        </DemoNotice>
      ) : null}

      <ul className="grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal as="li" key={testimonial.id} delay={index * 60}>
            <Card className="flex h-full flex-col p-6">
              <Icon
                name="quote"
                strokeWidth={0}
                className="h-7 w-7 fill-brand-200 text-brand-200"
              />
              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                {testimonial.quote}
              </blockquote>

              <footer className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <Avatar
                  name={testimonial.name}
                  photoUrl={testimonial.photoUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {testimonial.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
                <Rating value={testimonial.rating} />
              </footer>
            </Card>
          </Reveal>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Case studies                                                               */
/* -------------------------------------------------------------------------- */

export function CaseStudies({
  caseStudies,
  showDemoNotice,
}: {
  caseStudies: CaseStudy[];
  showDemoNotice: boolean;
}) {
  return (
    <>
      {showDemoNotice ? (
        <DemoNotice className="mb-8">
          <strong className="font-semibold">Illustrative scenarios.</strong>{" "}
          These describe the kind of work we do. They are not documented
          outcomes for real clients and the figures are not verified results.
        </DemoNotice>
      ) : null}

      <ul className="grid gap-5 lg:grid-cols-3">
        {caseStudies.map((study, index) => (
          <Reveal as="li" key={study.id} delay={index * 60}>
            <Card className="flex h-full flex-col overflow-hidden">
              <div className="border-b border-line bg-brand-50/60 p-6">
                <Badge tone="neutral" className="bg-white">
                  {study.sector}
                </Badge>
                <p className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-800">
                  {study.headlineMetric}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {study.headlineMetricLabel}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <h3 className="text-base font-semibold text-ink">
                  {study.title}
                </h3>

                <dl className="flex flex-col gap-3 text-sm">
                  {[
                    { term: "Challenge", detail: study.challenge },
                    { term: "Solution", detail: study.solution },
                    { term: "Result", detail: study.result },
                  ].map((row) => (
                    <div key={row.term}>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                        {row.term}
                      </dt>
                      <dd className="mt-1 leading-relaxed text-muted">
                        {row.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          </Reveal>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQs                                                                       */
/* -------------------------------------------------------------------------- */

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  lead,
  name = "faq",
}: {
  faqs: Faq[];
  title?: string;
  lead?: string;
  name?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
      <div>
        <SectionHeading eyebrow="FAQs" title={title} lead={lead} />
        <div className="mt-7">
          <ArrowLink href="/contact">Ask us something else</ArrowLink>
        </div>
      </div>

      <Accordion
        name={name}
        items={faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        }))}
        className="border-t border-line"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

export function CtaBand({
  title = "Let's talk about your business.",
  body = "A free 30-minute consultation. We will tell you what we would do, what it would cost, and whether we are the right fit — with no obligation either way.",
  primaryLabel = "Book a Free Consultation",
  primaryHref = "/book-consultation",
  secondaryLabel = "Send an enquiry",
  secondaryHref = "/contact",
}: {
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Section tone="white" spacing="default">
      <Container>
        <div className="relative overflow-hidden rounded-card bg-brand-800 px-6 py-12 sm:px-12 sm:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_auto]">
            <div className="max-w-xl">
              <h2 className="text-display-sm text-white">{title}</h2>
              <p className="mt-4 text-base leading-relaxed text-brand-100/80">
                {body}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ButtonLink
                href={primaryHref}
                variant="onDark"
                size="lg"
                data-analytics="cta-band-primary"
              >
                {primaryLabel}
              </ButtonLink>
              <ButtonLink
                href={secondaryHref}
                variant="onDarkGhost"
                size="lg"
              >
                {secondaryLabel}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
