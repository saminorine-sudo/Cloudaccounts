-- Supabase compatibility shim — FOR LOCAL TESTING ONLY.
--
-- Recreates the parts of a Supabase project that the migrations depend on, so
-- they can be run and their security rules asserted against a plain
-- PostgreSQL instance. This file is never applied to a real project: Supabase
-- provides all of it already.
--
-- It deliberately reproduces Supabase's *default privileges* too, because
-- those are what 0002_rls.sql has to revoke. Testing against a database
-- without them would let a missing REVOKE pass unnoticed.

create schema if not exists auth;

-- The roles PostgREST switches into per request.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;

-- Minimal stand-in for auth.users. Only the columns the migrations touch.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Supabase derives the current user id from the request's JWT claims. Tests
-- impersonate a user by setting `request.jwt.claims` directly.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;

grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase's default privileges: every new table in `public` is granted to
-- the request roles. This is exactly what the RLS migration must undo.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
