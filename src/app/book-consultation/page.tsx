import type { Metadata } from "next";

import {
  BookingForm,
  type DayAvailability,
} from "@/components/forms/booking-form";
import { PageHero } from "@/components/marketing/sections";
import { Icon } from "@/components/ui/icon";
import { Card, Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import {
  availableDates,
  availableSlotsFor,
  toIsoDate,
} from "@/lib/booking/availability";
import { getConsultationTypes, getSiteSettings } from "@/lib/content";
import { formatDayLabel } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book a free consultation",
  description:
    "Book a free 30-minute consultation with a CloudAccounts accountant. No obligation — we'll tell you what we'd do and what it would cost.",
  canonicalPath: "/book-consultation",
});

/**
 * Availability is derived from today's date, so the page is regenerated
 * hourly rather than cached indefinitely. Computing it on the server keeps
 * the date list identical across hydration and keeps date maths out of the
 * client bundle.
 */
export const revalidate = 3600;

const reassurances = [
  {
    icon: "clock" as const,
    title: "30 minutes, no preparation",
    body: "Turn up as you are. We'll ask about how you trade and what is not working.",
  },
  {
    icon: "tag" as const,
    title: "Free, with no obligation",
    body: "It is not a sales call with a deadline attached. If we are not the right fit we will say so.",
  },
  {
    icon: "handshake" as const,
    title: "You'll leave with a number",
    body: "We follow up with a written quote covering exactly what is included.",
  },
];

export default async function BookConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; plan?: string }>;
}) {
  const [types, settings, params] = await Promise.all([
    getConsultationTypes(),
    getSiteSettings(),
    searchParams,
  ]);

  const today = new Date();
  const availability: Record<string, DayAvailability[]> = {};

  for (const type of types) {
    availability[type.slug] = availableDates(type, today).map((date) => {
      const iso = toIsoDate(date);
      return {
        date: iso,
        label: formatDayLabel(date),
        slots: availableSlotsFor(type, iso, today),
      };
    });
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book a consultation", path: "/book-consultation" },
        ])}
      />

      <PageHero
        eyebrow="Book a consultation"
        title="Book a free consultation."
        lead="Thirty minutes with an accountant, at a time that suits you. We'll tell you what we would do for your business and what it would cost — with no obligation either way."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Book a consultation" },
        ]}
      />

      <Section tone="surface">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
            <div>
              <BookingForm
                consultationTypes={types}
                availability={availability}
                initialTypeSlug={params.type}
              />
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">
                  What to expect
                </h2>
                <ul className="mt-5 flex flex-col gap-5">
                  {reassurances.map((item) => (
                    <li key={item.title} className="flex gap-3.5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon name={item.icon} className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card tone="mint" className="p-6">
                <h2 className="text-base font-semibold text-brand-900">
                  Prefer to call?
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-brand-900/80">
                  If a slot below does not work, call us and we&rsquo;ll find a
                  time that does.
                </p>
                <a
                  href={settings.contact.phoneHref}
                  className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-brand-800 hover:text-brand-900"
                  data-analytics="booking-page-phone"
                >
                  <Icon name="phone" className="h-4.5 w-4.5" />
                  {settings.contact.phone}
                </a>
              </Card>

              {settings.showDemoNotices ? (
                <Card className="p-5">
                  <p className="text-xs leading-relaxed text-muted">
                    <strong className="font-semibold text-ink-soft">
                      Demonstration booking.
                    </strong>{" "}
                    Slots come from a simple weekday and time configuration
                    rather than a live calendar, and submissions are stored in
                    memory only. Connecting a booking provider replaces the
                    availability source without changing this interface.
                  </p>
                </Card>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
