import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { LeadForm } from "@/components/forms/lead-form";
import { PageHero } from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Card, Container, Section, SectionHeading } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact us",
  description:
    "Get in touch with CloudAccounts. Call, email or send an enquiry and we'll reply within one working day. Free consultations available.",
  canonicalPath: "/contact",
});

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contact } = settings;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <PageHero
        eyebrow="Contact"
        title="Get in touch."
        lead="Call us, email us, or send an enquiry below. We reply within one working day — and there is no charge for asking a question, whether you are a client or not."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section tone="surface">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
            {/* Contact details */}
            <div className="flex flex-col gap-5">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-ink">
                  Contact details
                </h2>

                {/*
                  A list with headings rather than a <dl>: the icon tile has to
                  sit alongside the label, and a <dl> may only contain
                  <dt>/<dd> pairs (optionally in a single <div>), so the icon
                  would break the list semantics.
                */}
                <ul className="mt-5 flex flex-col gap-5">
                  <li className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <Icon name="phone" className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Phone
                      </h3>
                      <p className="mt-0.5">
                        <a
                          href={contact.phoneHref}
                          className="text-base font-medium text-ink transition-colors hover:text-brand-700"
                          data-analytics="contact-page-phone"
                        >
                          {contact.phone}
                        </a>
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <Icon name="mail" className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Email
                      </h3>
                      <p className="mt-0.5">
                        <a
                          href={`mailto:${contact.email}`}
                          className="break-all text-base font-medium text-ink transition-colors hover:text-brand-700"
                          data-analytics="contact-page-email"
                        >
                          {contact.email}
                        </a>
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <Icon name="pin" className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Office
                      </h3>
                      <address className="mt-0.5 text-[0.9375rem] not-italic leading-relaxed text-ink-soft">
                        {contact.addressLines.slice(1).map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                        <span className="block">{contact.postcode}</span>
                      </address>
                    </div>
                  </li>

                  <li className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <Icon name="clock" className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Opening hours
                      </h3>
                      <ul className="mt-1 flex flex-col gap-1">
                        {contact.openingHours.map((entry) => (
                          <li
                            key={entry.label}
                            className="flex flex-wrap gap-x-2 text-sm text-ink-soft"
                          >
                            <span className="text-muted">{entry.label}</span>
                            <span className="font-medium">{entry.hours}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>

                {settings.showDemoNotices && contact.addressNote ? (
                  <DemoNotice className="mt-6">
                    <strong className="font-semibold">
                      Placeholder contact details.
                    </strong>{" "}
                    {contact.addressNote} The phone number uses a range reserved
                    for examples and is not a working line.
                  </DemoNotice>
                ) : null}
              </Card>

              <Card className="overflow-hidden">
                <MapPanel
                  lat={contact.mapLat}
                  lng={contact.mapLng}
                  isDemo={settings.showDemoNotices}
                />
              </Card>

              <Card tone="mint" className="p-6">
                <h2 className="text-base font-semibold text-brand-900">
                  Rather book a time?
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-brand-900/80">
                  Pick a slot that suits you for a free 30-minute consultation.
                  No obligation and nothing to prepare.
                </p>
                <ButtonLink
                  href="/book-consultation"
                  className="mt-4"
                  data-analytics="contact-page-book"
                >
                  Book a Free Consultation
                </ButtonLink>
              </Card>
            </div>

            {/* Message form */}
            <div>
              <Card className="p-6 sm:p-8">
                <SectionHeading
                  eyebrow="Send a message"
                  title="Ask us anything"
                  lead="A general question, a second opinion, or something you would rather sanity-check before acting on it."
                  as="h2"
                />
                <div className="mt-8">
                  <ContactForm />
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="white" id="quote">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Get a quote"
            title="Or get a tailored quote."
            lead="Tell us a bit more about your business and we'll come back with a fixed monthly fee within one working day."
            align="center"
          />
          <div className="mt-10">
            <LeadForm source="contact-page" />
          </div>
        </Container>
      </Section>
    </>
  );
}

/**
 * Map placeholder.
 *
 * A third-party map embed sets cookies and would need to load before the user
 * has made a consent choice, so it is not embedded by default. Once a map
 * provider is chosen, load it only when marketing/analytics consent allows —
 * or use a static, cookie-free map image. Until then this shows the location
 * honestly and links out on demand.
 */
function MapPanel({
  lat,
  lng,
  isDemo,
}: {
  lat: number;
  lng: number;
  isDemo: boolean;
}) {
  return (
    <div>
      <div
        aria-hidden="true"
        className="relative flex h-44 items-center justify-center overflow-hidden bg-brand-50"
      >
        {/* Abstract street grid — decorative, no third-party requests. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#16653418_1px,transparent_1px),linear-gradient(to_bottom,#16653418_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_46%,#16653422_46%,#16653422_50%,transparent_50%)]" />
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-white shadow-lift">
          <Icon name="pin" className="h-5 w-5" />
        </span>
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed text-muted">
          {isDemo
            ? "An interactive map is not embedded on this demonstration site. A third-party map would set cookies before a consent choice has been made, so it will be added behind the consent layer once a provider is chosen."
            : "We're a short walk from the nearest Underground station."}
        </p>
        <Link
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Open in maps
          <Icon name="external" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
