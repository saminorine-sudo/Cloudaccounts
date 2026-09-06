# CloudAccounts

A public marketing website for a fictional UK accountancy firm, built as the
foundation for a larger platform (lead management → client portal → documents,
tasks and messaging).

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zod · Vitest

> **This is a demonstration build.** CloudAccounts is not a real business.
> Statistics, reviews, case studies, prices, team profiles and contact details
> are clearly-marked placeholders — see [Demo content](#demo-content).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; the site runs without any of it
npm run dev
```

| Command | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm test` | Vitest (88 tests) |

## Architecture

```
src/
  app/                    Routes, API handlers, sitemap, robots, OG image
  components/
    ui/                   Design system primitives
    layout/               Header, footer, mobile nav, sticky CTA
    marketing/            Page sections (hero, stats, pricing, FAQs, CTAs)
    forms/                Lead, contact and booking forms
    calculators/          Tax calculators
    consent/              Cookie consent
  content/                DEMO CONTENT — typed seed data
  lib/
    content/              Content repository (the Supabase seam)
    tax/                  Rates config + pure calculation engine
    validation/           Zod schemas, shared client and server
    server/               Store, notifications, rate limiting, spam checks
    booking/              Availability rules
  types/                  Shared content types
docs/DATA-MODEL.md        Planned database schema and RLS design
```

### Two seams for the database

No component imports `src/content` directly. Content reads go through
`src/lib/content/index.ts` and submission writes through
`src/lib/server/submissions.ts`. Both are already `async` and both are shaped
like the tables in [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md), so connecting
Supabase means replacing those function bodies — not touching pages.

### Content is data, not markup

Blog and guide bodies are stored as typed `ContentBlock` arrays rather than
HTML strings, and rendered through `components/ui/prose.tsx`. Nothing uses
`dangerouslySetInnerHTML` for user or CMS content, which removes stored XSS as
a class of bug from the future CMS.

## The tax calculators

Five estimators — Corporation Tax (with marginal relief), VAT, self-employed
tax, take-home pay, and salary versus dividends for director-shareholders.

**Every rate, threshold and allowance lives in one file:**
[`src/lib/tax/rates.ts`](src/lib/tax/rates.ts). No component contains a
hard-coded tax figure. A Budget change is a new dated `TaxYearConfig` and a
moved `DEFAULT_TAX_YEAR`.

Calculations run entirely in the browser. Figures the user enters are never
sent to the server and never reach analytics — the analytics layer records
only *that* a calculator was used.

### ⚠️ Rates need verifying before production

The 2026/27 figures were cross-checked across several independent UK tax
references, but **not** directly against GOV.UK, which was unreachable from
the build environment. `verifiedAgainstGovUk` is set to `false`.

Before going live, confirm each block against the primary sources listed at
the top of `rates.ts` and flip that flag. Note also that income tax bands
apply to **England, Wales and Northern Ireland only** — Scotland differs, and
the UI says so.

The engine has 45 unit tests covering band boundaries, the personal allowance
taper, dividend stacking, marginal relief, associated companies and short
accounting periods.

## Forms and API

Three endpoints — `/api/leads`, `/api/contact`, `/api/bookings`. Each one:

1. Rate limits by IP (5 per 10 minutes).
2. Rejects non-JSON and oversized bodies.
3. **Validates with Zod**, then runs spam heuristics.
4. Stores the record, then fires notifications with `Promise.allSettled` so a
   mail or webhook failure can never lose a submission.

Step 3's ordering matters and is covered by a regression test. Spam gets a
*success* response so bots learn nothing — which means checking it first would
swallow genuine validation errors and show a real user a false confirmation.
That was an actual bug found in testing.

Spam detection is a honeypot field plus a minimum time-to-submit. No
third-party service, no cookies, so it works before any consent decision.

Booking slots are re-authorised server-side against the consultation type's
configured availability. The client chooses a slot; the server decides whether
it exists.

## Privacy and consent

Nothing optional loads until the visitor chooses. Accept and reject carry
equal weight. Consent lives in a first-party cookie read through
`useSyncExternalStore`, so every consumer stays in step.

No third-party map, video or social embed is used anywhere, because those set
cookies on page load — before the visitor has had a chance to decide.

The legal pages are drafted templates carrying a visible notice. They must be
reviewed against how the business actually processes data, and checked against
current ICO guidance, before publication. A privacy policy does not by itself
make a site compliant.

## Accessibility

Audited with axe-core across 16 pages: **zero WCAG 2.1 A/AA violations.**

Semantic HTML throughout (the FAQ accordion is native `<details>`, so it works
without JavaScript), visible focus states, labelled and described form
controls, state never signalled by colour alone, and `prefers-reduced-motion`
honoured.

## Demo content

Every unverified figure is flagged in the UI and in the source. Placeholder
records carry `isDemo: true`, and `siteSettings.showDemoNotices` controls the
visible notices site-wide.

Deliberate omissions:

- **Professional qualifications and memberships are blank.** ACA, ACCA, CTA
  and professional body registration are regulated claims. The fields exist;
  they stay empty until verified.
- **No aggregate review structured data** is emitted, so unverified ratings
  cannot leak into search results.
- **Contact details are placeholders.** The phone number is in Ofcom's
  reserved-for-drama range and can never reach a real subscriber.

Before launch: replace the content, set `showDemoNotices` to `false`, and
confirm nothing invented survives.

## Not built yet

Deliberately out of scope for this release, and architected for rather than
stubbed: admin dashboard and CMS UI, authentication, the client portal,
document management, messaging, deadlines, and accounting-platform
integrations. See [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md).

No fake integrations were built. There is no mock Xero, QuickBooks or HMRC
connection pretending to work.
