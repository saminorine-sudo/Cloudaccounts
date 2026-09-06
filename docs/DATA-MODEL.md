# Data model

The planned Postgres/Supabase schema. Nothing here is implemented yet — the
site currently reads content from typed modules in `src/content` and holds
form submissions in process memory. This document is the target the current
seams were designed against, so connecting the database is a matter of
replacing two module bodies rather than reshaping the application.

## The two seams

Everything that will become a database read or write already goes through one
of two modules:

| Seam | Module | Becomes |
| --- | --- | --- |
| Content reads | `src/lib/content/index.ts` | `select` queries |
| Submission writes | `src/lib/server/submissions.ts` | `insert` queries |

Both are already `async` and neither is imported by a component directly, so
swapping the implementation does not ripple outwards. `src/content/*` is
imported only by the content repository, which makes it easy to verify nothing
bypasses the seam.

## Tables

### Content (CMS-managed)

| Table | Notes |
| --- | --- |
| `site_settings` | Single row. Name, contact details, socials, `show_demo_notices`. |
| `seo_settings` | Per-path title, description, canonical, OG image, noindex. |
| `services` | `slug`, copy, `icon`, `includes[]`, `outcomes` (jsonb), `display_order`, `is_active`. |
| `audiences` | Customer segments. Same shape as services plus recommended service slugs and plan. |
| `pricing_plans` | `price_monthly` in whole pounds, `is_recommended`, `display_order`. |
| `pricing_features` | Optional normalisation of `pricing_plans.features[]` if features need reordering independently. |
| `site_stats` | Homepage trust figures. `is_demo` drives the visible placeholder notice. |
| `testimonials` | `rating`, `is_featured`, `photo_url`, `is_demo`. |
| `team_members` | `qualifications[]` and `memberships[]` are **empty by default** — regulated claims, populate only when verified. |
| `case_studies` | `headline_metric`, challenge/solution/result, `is_published`, `is_demo`. |
| `faqs` | `category`, `display_order`, `is_published`. |
| `blog_posts` | `body` stored as a jsonb array of typed content blocks, never HTML. `status`, `published_at`. |
| `blog_categories`, `blog_tags` | Plus a `blog_post_tags` join table. |
| `guides` | `sections` as jsonb. |
| `calculator_settings` | Tax year configuration, mirroring `src/lib/tax/rates.ts`. |
| `consultation_types` | Duration, mode, available weekdays, slot times. |

**Why `body` is jsonb blocks, not HTML.** Storing structured blocks means the
renderer never needs `dangerouslySetInnerHTML`, so stored XSS is not a
possible bug in the CMS. See `src/types/content.ts` (`ContentBlock`) and
`src/components/ui/prose.tsx`.

### Lead and appointment management

| Table | Notes |
| --- | --- |
| `leads` | Status enum: `NEW`, `CONTACTED`, `CONSULTATION_BOOKED`, `PROPOSAL_SENT`, `WON`, `LOST`. `assigned_to_id`, `follow_up_at`, `source`. |
| `lead_notes` | Free-text notes with author and timestamp. |
| `lead_status_history` | Append-only. Every status change with who made it and when — this is what the lead detail timeline reads. |
| `contact_submissions` | Contact form messages. |
| `appointments` | Status enum: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`. |
| `appointment_types` | Foreign key target for `appointments`, sourced from `consultation_types`. |

**Required constraint.** `appointments` needs a unique index on
`(appointment_type_id, date, time) WHERE status <> 'CANCELLED'`. The
application-level check in `isSlotTaken` cannot prevent two people booking the
same slot concurrently — only the database can.

### Identity and access

| Table | Notes |
| --- | --- |
| `users` | Supabase `auth.users`. |
| `profiles` | One row per user, `user_id` FK. Display name, phone, avatar. |
| `roles` | `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`, `STAFF`, `CLIENT`. |
| `user_roles` | Join table — a user may hold more than one role. |
| `companies` | Client businesses. |
| `clients` | Links a `company` to the `users` who may access it, and to an assigned accountant. |
| `staff` | Internal team records, linked to `team_members` for the public site. |

### Future client portal

| Table | Notes |
| --- | --- |
| `documents` | Storage object path, `client_id`, uploader, `reviewed_at`. Never a public URL — see below. |
| `document_requests` | What the accountant has asked the client to provide. |
| `tasks` | `TODO`, `IN_PROGRESS`, `WAITING_FOR_CLIENT`, `COMPLETED`, `OVERDUE`. |
| `deadlines` | Type, due date, assigned accountant, reminder schedule. |
| `message_threads`, `messages` | Thread per client; messages carry sender, body, `read_at`, attachments. |
| `notifications` | In-app notification queue, per user. |
| `audit_logs` | Append-only. See below. |

## Row Level Security

RLS must be enabled on **every** table. Client data isolation cannot depend on
application code — a single missed check in a route handler would expose one
client's records to another.

Shape of the policies:

- **Public content** (`services`, `pricing_plans`, `blog_posts`, …): anonymous
  `SELECT` allowed where the row is active/published; writes restricted to
  `ADMIN` and `SUPER_ADMIN`.
- **Leads and appointments**: no anonymous read at all. Inserts arrive through
  the API routes using the service role. `SELECT` for `ADMIN`, `SUPER_ADMIN`
  and the assigned `STAFF` member.
- **Client-owned data** (`documents`, `tasks`, `messages`, `deadlines`,
  `invoices`): a client may only reach rows whose `client_id` resolves to
  their own user. Something equivalent to:

  ```sql
  create policy "clients read own documents"
  on documents for select
  using (
    client_id in (
      select c.id from clients c
      where c.user_id = auth.uid()
    )
  );
  ```

- **Accountants**: access limited to clients explicitly assigned to them, not
  all clients.
- **Audit logs**: readable by `SUPER_ADMIN` only. Never exposed to clients, and
  no `UPDATE` or `DELETE` policy for anyone — the log is append-only.

Every policy needs a test that proves the negative case: that client A cannot
read client B's rows. A policy that has only been tested with the happy path
has not been tested.

## Document storage

Client documents are financial records and must not sit behind guessable
public URLs. Use a private storage bucket, serve files through short-lived
signed URLs generated after an authorisation check, and record every download
in `audit_logs`. Validate file type and size on the server, and treat uploads
as untrusted until scanned.

## Audit logging

Record: actor, action, resource type, resource id, timestamp, and request
metadata where lawful and proportionate. Log at minimum — login, document
upload/download/delete, client create/update, permission change, lead update,
appointment change, and any admin action.

Because the log may itself contain personal data, retention needs to be
defined alongside the privacy policy rather than kept indefinitely by default.
