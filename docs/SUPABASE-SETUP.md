# Connecting Supabase

The site runs without a database: content comes from `src/content` and form
submissions are held in memory. This guide connects a real project.

Nothing here needs to happen before you can work on the site — but a
**production** server refuses to start without it, so enquiries cannot be
silently lost. (`ALLOW_UNCONFIGURED_PRODUCTION=true` overrides that
deliberately, for a content-only preview.)

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Choose the London (`eu-west-2`) region — the clients are UK businesses and
   keeping personal data in the UK is one less thing to explain in the privacy
   policy.
3. Save the database password somewhere safe.

## 2. Run the migrations

In the dashboard, open **SQL Editor** and run these in order:

1. `supabase/migrations/0001_schema.sql` — tables, enums, triggers, indexes
2. `supabase/migrations/0002_rls.sql` — Row Level Security

Or with the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Do not skip `0002`. Migration `0001` creates the tables but leaves them
readable by anyone with the anon key; `0002` is what locks them down.

## 3. Add the environment variables

Copy `.env.example` to `.env.local` and fill in, from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

The anon key is safe in the browser — that is the point of the RLS policies.
The **service role key bypasses RLS completely**: keep it out of anything
prefixed `NEXT_PUBLIC_`, out of client components, and out of the repository.

## 4. Seed the demo content

```bash
npm run db:seed
```

This reads the typed modules in `src/content` and upserts them, so the content
files stay the single source of truth and the seed can be re-run safely after
editing them.

Restart the dev server. It now reads from Supabase — `contentSource()` in
`src/lib/content` reports which source is live.

## 5. Create your first administrator

Everyone who signs up becomes a `CLIENT`. Promote yourself once, from the SQL
Editor, after signing up through Supabase Auth:

```sql
update public.profiles
set role = 'SUPER_ADMIN'
where email = 'you@example.com';
```

After that, role changes go through `public.set_user_role(user_id, role)`,
which refuses non-administrators and writes to the audit log. A signed-in user
has no privilege on the `role` column at all, so nobody can promote
themselves.

## Testing the security rules

The access rules are asserted against a real PostgreSQL instance:

```bash
npm run db:test
```

This builds a throwaway database, applies a shim for the parts Supabase
provides (the `auth` schema, the PostgREST roles, and Supabase's default
grants), runs both migrations, then asserts 24 properties — including that
anonymous visitors cannot read leads, that a client cannot read another
client's profile, that a user cannot promote themselves, and that the same
consultation slot cannot be booked twice.

It never touches your Supabase project. It needs a local PostgreSQL server:

```bash
sudo apt-get install -y postgresql
sudo pg_ctlcluster 16 main start
```

## How the application uses the database

Three clients, with deliberately different trust levels
(`src/lib/supabase/clients.ts`):

| Client | Key | Used for |
| --- | --- | --- |
| `publicClient()` | anon | Public content reads. Subject to RLS. |
| `adminClient()` | service role | Server-side form writes. Bypasses RLS. |
| *(authenticated)* | user session | Lands with the admin area. |

**Public reads carry no cookies.** Reading cookies would opt every marketing
page into dynamic rendering; instead content is fetched anonymously and the
pages stay prerendered, refreshing on the hour via `export const revalidate`.

**Form writes use the service role** rather than granting `anon` insert
rights. Granting inserts to `anon` would also expose the REST API to anyone
with the public key. The route handlers validate first and then write with
elevated privilege, so the trust boundary is the route handler.

### Failure behaviour

Once configured, a failed query **throws** rather than falling back to the
local content modules. Serving placeholder prices during a database outage
would be worse than serving an error. The fallback covers "no project yet",
not "the database is down".

## Regenerating types

`src/lib/supabase/database.types.ts` is hand-written to match the migrations.
Once the project exists, replace it with generated types so that schema drift
becomes a compile error:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
```

The mappers in `src/lib/supabase/mappers.ts` are where any mismatch will
surface, and they have unit tests covering null columns, wrong-typed jsonb and
Postgres date formats.

## Not yet created

Tables for the client portal — documents, messages, tasks, deadlines,
invoices — are designed in [`DATA-MODEL.md`](DATA-MODEL.md) but deliberately
not created. Shipping unused SQL means shipping schema nobody has exercised.
They land with the features that use them.
