-- CloudAccounts — schema
--
-- Creates the content tables the public site reads, the submission tables the
-- forms write, and the identity foundation the access rules depend on.
--
-- Scope note: tables for the future client portal (documents, messages,
-- tasks, deadlines, invoices) are deliberately NOT created here. They are
-- designed in docs/DATA-MODEL.md and will land with the features that use
-- them — shipping untested, unused SQL now would be schema we cannot verify.
--
-- Row Level Security is enabled and policed in 0002_rls.sql. This file only
-- builds the shapes.

-- Supabase provides pgcrypto, which supplies gen_random_uuid().
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum (
  'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'STAFF', 'CLIENT'
);

create type public.lead_status as enum (
  'NEW', 'CONTACTED', 'CONSULTATION_BOOKED', 'PROPOSAL_SENT', 'WON', 'LOST'
);

create type public.appointment_status as enum (
  'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
);

create type public.post_status as enum ('draft', 'scheduled', 'published');

create type public.faq_category as enum (
  'general', 'pricing', 'services', 'switching', 'working-together'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

-- One row per authenticated user. `role` drives every access decision.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'CLIENT',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role lookups used by RLS policies.
--
-- SECURITY DEFINER with an empty search_path is essential: a policy on
-- `profiles` that selects from `profiles` would recurse forever. Running as
-- the definer bypasses RLS for this lookup only, and the pinned search_path
-- stops a caller shadowing `public` with their own schema.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
    and p.is_active
$$;

-- Anyone who works at the firm, as opposed to a client.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in
      ('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'STAFF'),
    false
  )
$$;

-- Can manage website content and lead data.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in ('SUPER_ADMIN', 'ADMIN'),
    false
  )
$$;

-- Creates a profile whenever a user signs up, so no authenticated user can
-- exist without a role. New users default to CLIENT — privilege is granted
-- deliberately, never by signing up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

-- Single row. The check constraint enforces that, so a second row cannot be
-- inserted by mistake and leave the site with ambiguous settings.
create table public.site_settings (
  id boolean primary key default true,
  name text not null,
  legal_name text not null,
  tagline text not null,
  description text not null,
  url text not null,
  locale text not null default 'en_GB',
  contact jsonb not null default '{}'::jsonb,
  socials jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  show_demo_notices boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id)
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
--
-- Every content table carries:
--   `key`      stable editorial identifier, unique, used by the seed for
--              idempotent upserts and by cross-table references
--   `is_demo`  true for unverified placeholder content, which the UI labels

create table public.site_stats (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  label text not null,
  note text,
  display_order integer not null default 0,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  question text not null,
  answer text not null,
  category public.faq_category not null default 'general',
  display_order integer not null default 0,
  is_published boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  title text not null,
  summary text not null,
  icon text not null,
  intro text not null,
  includes text[] not null default '{}',
  -- [{ problem, outcome }]
  outcomes jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  name text not null,
  audience text not null,
  -- Whole pounds per month. Never a float: money in a float is a bug waiting.
  price_monthly integer not null check (price_monthly >= 0),
  currency text not null default 'GBP',
  price_prefix text not null default 'From',
  price_suffix text not null default '/month',
  description text not null,
  features text[] not null default '{}',
  cta_label text not null,
  cta_href text not null,
  is_recommended boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audiences (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  title text not null,
  summary text not null,
  icon text not null,
  intro text not null,
  challenges text[] not null default '{}',
  -- [{ title, body }]
  support jsonb not null default '[]'::jsonb,
  recommended_plan_id uuid references public.pricing_plans (id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Join tables rather than arrays of slugs: a deleted service should not leave
-- a dangling reference behind in an audience or service record.
create table public.service_faqs (
  service_id uuid not null references public.services (id) on delete cascade,
  faq_id uuid not null references public.faqs (id) on delete cascade,
  display_order integer not null default 0,
  primary key (service_id, faq_id)
);

create table public.audience_services (
  audience_id uuid not null references public.audiences (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  display_order integer not null default 0,
  primary key (audience_id, service_id)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  quote text not null,
  name text not null,
  role text not null,
  company text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  photo_url text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  name text not null,
  role text not null,
  bio text not null,
  -- Regulated claims. Left empty until verified — see docs/DATA-MODEL.md.
  qualifications text[] not null default '{}',
  memberships text[] not null default '{}',
  focus text[] not null default '{}',
  email text,
  linkedin_url text,
  photo_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  title text not null,
  sector text not null,
  headline_metric text not null,
  headline_metric_label text not null,
  challenge text not null,
  solution text not null,
  result text not null,
  display_order integer not null default 0,
  is_published boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  -- Typed ContentBlock[] rather than an HTML string. Structure is what keeps
  -- rendering safe by default — see src/components/ui/prose.tsx.
  body jsonb not null default '[]'::jsonb,
  category_id uuid references public.blog_categories (id) on delete set null,
  author_id uuid references public.team_members (id) on delete set null,
  tags text[] not null default '{}',
  reading_minutes integer not null default 5,
  published_at date not null default current_date,
  updated_on date,
  status public.post_status not null default 'draft',
  is_featured boolean not null default false,
  seo jsonb not null default '{}'::jsonb,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The public blog index filters on exactly this pair, ordered by date.
create index blog_posts_live_idx
  on public.blog_posts (status, published_at desc);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  title text not null,
  summary text not null,
  format text not null,
  audience text not null,
  -- [{ heading, points[] }]
  sections jsonb not null default '[]'::jsonb,
  updated_on date not null default current_date,
  seo jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultation_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  slug text not null unique,
  name text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  mode text not null,
  price_label text not null,
  -- ISO weekday numbers, 1 = Monday … 5 = Friday.
  available_weekdays smallint[] not null default '{1,2,3,4,5}',
  -- 24-hour "HH:MM" slot starts.
  slot_times text[] not null default '{}',
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers for every content table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_stats', 'faqs', 'services', 'pricing_plans', 'audiences',
    'testimonials', 'team_members', 'case_studies', 'blog_categories',
    'blog_posts', 'guides', 'consultation_types'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  business_name text,
  business_type text not null,
  turnover text not null,
  services text[] not null default '{}',
  message text not null default '',
  preferred_contact text not null default 'either',
  source text not null default 'website',
  status public.lead_status not null default 'NEW',
  assigned_to_id uuid references public.profiles (id) on delete set null,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_created_idx on public.leads (status, created_at desc);
create index leads_assigned_idx on public.leads (assigned_to_id);
create index leads_email_idx on public.leads (lower(email));

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at desc);

-- Append-only. This is what the lead activity timeline reads.
create table public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  from_status public.lead_status,
  to_status public.lead_status not null,
  changed_by_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index lead_status_history_lead_idx
  on public.lead_status_history (lead_id, created_at desc);

-- Records every status transition automatically, so the timeline cannot be
-- bypassed by updating a lead directly.
create or replace function public.record_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_status_history (lead_id, from_status, to_status, changed_by_id)
    values (new.id, null, new.status, (select auth.uid()));
  elsif new.status is distinct from old.status then
    insert into public.lead_status_history (lead_id, from_status, to_status, changed_by_id)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger leads_record_status_change
  after insert or update of status on public.leads
  for each row execute function public.record_lead_status_change();

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_submissions_created_idx
  on public.contact_submissions (created_at desc);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  consultation_type_id uuid not null
    references public.consultation_types (id) on delete restrict,
  -- Date and local London time are stored separately because a slot is an
  -- editorial offering ("Tuesdays at 10:00"), not an instant. Converting to
  -- UTC here would silently shift every slot across a DST boundary.
  scheduled_on date not null,
  scheduled_at_time time not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  business_name text,
  notes text,
  status public.appointment_status not null default 'PENDING',
  lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The application also checks for a clash, but only this index can prevent
-- two people booking the same slot in a genuine race.
create unique index appointments_unique_slot
  on public.appointments (consultation_type_id, scheduled_on, scheduled_at_time)
  where status <> 'CANCELLED';

create index appointments_schedule_idx
  on public.appointments (scheduled_on, scheduled_at_time);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

-- Append-only: 0002_rls.sql grants no update or delete policy to anyone.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_resource_idx
  on public.audit_logs (resource_type, resource_id);
