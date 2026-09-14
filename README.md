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
| `npm test` | Vitest (148 tests) |
| `npm run db:seed` | Load `src/content` into Supabase |
| `npm run db:sql` | Emit that same content as SQL, to paste into the dashboard |
| `npm run db:test` | Run migrations + security assertions on a local Postgres |

The site runs with no database at all — see [Data](#data).

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

## Data

Supabase (Postgres) with Row Level Security. Full setup, including migrations
and seeding, is in [`docs/SUPABASE-SETUP.md`](docs/SUPABASE-SETUP.md).

**The site runs without it.** With no credentials configured, content is read
from the typed modules in `src/content` and submissions are held in memory, so
you can work on the whole site before creating a project. A *production*
server refuses to start in that state rather than silently dropping enquiries.

Everything funnels through two modules — `src/lib/content/index.ts` for reads
and `src/lib/server/submissions.ts` for writes. No component imports
`src/content` directly, which is what made swapping the storage layer a
two-file change.

Three clients with different trust levels: anonymous for public content
(cookie-free, so pages stay prerendered), service-role for server-side form
writes, and a session client for the admin area when it arrives.

Once configured, a failed query throws rather than falling back to local
content — showing placeholder prices during an outage would be worse than
showing an error.

### Security rules are tested, not asserted

`npm run db:test` builds a throwaway PostgreSQL database, applies a shim for
the pieces Supabase provides, runs both migrations and then checks **24
properties** — among them: anonymous visitors cannot read leads, contact
submissions, appointments or profiles; drafts and future-dated posts stay
invisible; a client cannot read another client's profile; a user cannot
promote themselves (the `role` column is not granted to `authenticated` at
all, so RLS is not the only thing standing in the way); the same consultation
slot cannot be booked twice; and the lead status timeline is append-only.

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

## Security headers

Set in `next.config.ts` and verified against a running production server:
CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` and HSTS. `X-Powered-By` is turned off, and `/admin`
additionally sends `Cache-Control: no-store`.

**On `script-src`, stated plainly:** it allows inline scripts. A strict
`script-src` needs a per-request nonce, and a nonce needs dynamic rendering —
it would turn every prerendered marketing page into a per-request render. That
is a poor trade here, because the application has no HTML injection surface:
content is stored as typed blocks and rendered through React, and the only
`dangerouslySetInnerHTML` emits JSON-LD with `<` escaped. The CSP earns its
place through `frame-ancestors`, `form-action` (an injected form cannot post
enquiry data elsewhere), `base-uri`, `object-src` and `connect-src` instead.
`unsafe-eval` is added in development only, where React needs it.

## Performance

Measured over the wire against a production build, not estimated:

| | JS | CSS | Fonts | Total |
| --- | --- | --- | --- | --- |
| Homepage | 155 KB | 12 KB | 77 KB | 291 KB |
| Calculators | 169 KB | 12 KB | 77 KB | 304 KB |

No images ship at all — the hero, icons and avatars are markup and SVG.

Measuring this found Zod being bundled into **every** marketing page,
including pages with no form, because the client components imported their
option lists from the same module as the schemas and Next shares a chunk
across a route segment. The lists moved to a dependency-free
`lib/validation/options.ts`; the client never validates anyway, since the
server is the only thing that decides. That removed 104 KB — 40% of the
homepage's JavaScript.

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

## Admin area (`/admin`)

Dashboard, lead pipeline with search, status filters and pagination, a lead
detail page with status changes, notes, follow-up dates and a combined
activity timeline, plus appointment and enquiry management.

Staff sign in with email and password at `/admin/login`. An unconfigured
production server still refuses outright, and `ADMIN_DEV_PREVIEW=true` opens
the screens locally against the in-memory store — it requires a non-production
build as well, so setting it on a deployed site does nothing.

**Authenticated is not authorised.** Every signup becomes a `CLIENT`, so a
client's own valid credentials would otherwise open a session here. The role
is read from the database on every request — never from the token, because a
JWT issued before a role was revoked stays valid until it expires — and a
non-staff sign-in is ended immediately rather than left dormant. Sign-in
failures all return one message, so the form cannot be used to discover which
addresses have accounts.

The `next` parameter on the sign-in URL is validated against an allowlist of
paths beneath `/admin`. Unchecked, it would be an open redirect, and a
phishing link that starts on the real domain is the convincing kind.

### A layout is not an authorization boundary

A Next.js layout that refuses to render `children` does **not** stop the page
component from running. The page still renders and its output is still
serialized into the RSC payload — so a layout-only gate shows a denial screen
while shipping the data behind it. That was found by grepping a real
production response, not reasoned about.

Authorization therefore lives in `src/lib/admin/data.ts`, a data access layer
that authorises before every read; each page refuses for itself as well, so a
denied response contains a denial rather than a page of records. Every server
action calls `requireAdminAccess()` too, because actions are reachable by
direct POST and the form that rendered them proves nothing.

## Not built yet

Deliberately out of scope, and architected for rather than stubbed: the CMS
editing UI, the client portal, document management, messaging, deadlines, and
accounting-platform integrations. See
[`docs/DATA-MODEL.md`](docs/DATA-MODEL.md).

The database foundation those need — roles, profiles, the audit log, and the
policies that enforce them — is in place and tested. Portal tables
(documents, messages, tasks, deadlines, invoices) are designed but not
created, because shipping SQL nothing exercises means shipping schema nobody
has verified.

No fake integrations were built. There is no mock Xero, QuickBooks or HMRC
connection pretending to work.
