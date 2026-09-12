import type { Metadata } from "next";

import {
  CorporationTaxCalculator,
  SalaryDividendCalculator,
  SelfEmployedCalculator,
  TakeHomeCalculator,
  VatCalculator,
} from "@/components/calculators/calculators";
import { CtaBand, PageHero } from "@/components/marketing/sections";
import { Alert } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { getTaxYear, REGION_DISCLAIMER } from "@/lib/tax/rates";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "UK tax calculators",
  description:
    "Free UK tax calculators: Corporation Tax with marginal relief, VAT, self-employed tax, take-home pay and salary versus dividends for director-shareholders.",
  canonicalPath: "/resources/calculators",
});

const calculators = [
  { id: "corporation-tax", label: "Corporation Tax" },
  { id: "vat", label: "VAT" },
  { id: "self-employed", label: "Self-employed" },
  { id: "take-home", label: "Take-home pay" },
  { id: "salary-dividend", label: "Salary vs dividends" },
];

export default function CalculatorsPage() {
  const config = getTaxYear();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Calculators", path: "/resources/calculators" },
        ])}
      />

      <PageHero
        eyebrow="Calculators"
        title="UK tax calculators."
        lead={`Five estimators built on a single, dated set of ${config.label} UK rates — so you can always see which tax year a figure comes from. Everything is calculated in your browser: nothing you type is sent to us or to anyone else.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Calculators" },
        ]}
      >
        <nav aria-label="Jump to a calculator">
          <ul className="flex flex-wrap gap-2">
            {calculators.map((calculator) => (
              <li key={calculator.id}>
                <a
                  href={`#${calculator.id}`}
                  className="inline-flex rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-line transition-colors hover:text-brand-700 hover:ring-brand-300"
                >
                  {calculator.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      <Section tone="surface">
        <Container>
          <Alert tone="warning" className="mb-10">
            <strong className="font-semibold">
              These are estimates, not advice.
            </strong>{" "}
            They use the rates shown and assume a straightforward set of
            circumstances. {REGION_DISCLAIMER} Tax rules change — always check
            the current position on GOV.UK or with an accountant before acting
            on a figure.
          </Alert>

          <div className="flex flex-col gap-8">
            <div id="corporation-tax">
              <CorporationTaxCalculator />
            </div>
            <div id="vat">
              <VatCalculator />
            </div>
            <div id="self-employed">
              <SelfEmployedCalculator />
            </div>
            <div id="take-home">
              <TakeHomeCalculator />
            </div>
            <div id="salary-dividend">
              <SalaryDividendCalculator />
            </div>
          </div>

          <div className="mt-10 rounded-card bg-white p-6 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <Icon name="shield" className="h-4.5 w-4.5 text-brand-700" />
              How these calculators work
            </h2>
            <div className="mt-3 grid gap-x-8 gap-y-3 text-sm leading-relaxed text-muted sm:grid-cols-2">
              <p>
                <strong className="font-medium text-ink-soft">
                  Nothing leaves your browser.
                </strong>{" "}
                The figures you enter are never sent to a server and are not
                recorded in analytics. We only record that a calculator was
                used, never what was typed into it.
              </p>
              <p>
                <strong className="font-medium text-ink-soft">
                  One source of rates.
                </strong>{" "}
                Every rate, threshold and allowance comes from a single dated
                configuration file, so when rates change at a Budget every
                calculator updates together and none of them silently goes
                stale.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Want a personalised calculation?"
        body="These give you a ballpark. A free 30-minute consultation gives you a number for your actual position, with the planning options that go with it."
        primaryLabel="Get a Personalised Estimate"
      />
    </>
  );
}
