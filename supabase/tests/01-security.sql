-- Security assertions for the RLS policies.
--
-- Run with `npm run db:test` (see supabase/tests/run.sh). Every block raises
-- an exception on failure, so with ON_ERROR_STOP the script fails loudly on
-- the first broken rule.
--
-- These test the claims the privacy policy and the data model make:
-- anonymous visitors cannot reach enquiry data, clients cannot reach staff
-- data, nobody can promote themselves, and a slot cannot be double booked.
--
-- Each block impersonates a PostgREST role with `set local role`, which is
-- scoped to the block's implicit transaction. The superuser running the
-- script bypasses RLS entirely, so testing without `set local role` would
-- prove nothing.

\set ON_ERROR_STOP on

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'client@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'staff@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.com'),
  ('44444444-4444-4444-4444-444444444444', 'super@example.com')
on conflict (id) do nothing;

-- The handle_new_user trigger created a CLIENT profile for each. Promote
-- three of them directly (as superuser, bypassing the guarded RPC).
update public.profiles set role = 'STAFF'
  where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set role = 'ADMIN'
  where id = '33333333-3333-3333-3333-333333333333';
update public.profiles set role = 'SUPER_ADMIN'
  where id = '44444444-4444-4444-4444-444444444444';

insert into public.consultation_types
  (key, slug, name, description, duration_minutes, mode, price_label, slot_times)
values
  ('t-free', 'free-consultation', 'Free Consultation', 'Test', 30,
   'Video call', 'Free', '{09:00,10:00}')
on conflict (key) do nothing;

insert into public.blog_categories (key, slug, name) values ('c-tax', 'tax', 'Tax')
on conflict (key) do nothing;

insert into public.blog_posts (key, slug, title, excerpt, status, published_at)
values
  ('p-live', 'live-post', 'Live', 'Published', 'published', current_date - 1),
  ('p-draft', 'draft-post', 'Draft', 'Unpublished', 'draft', current_date - 1),
  ('p-future', 'future-post', 'Future', 'Scheduled', 'published', current_date + 30)
on conflict (key) do nothing;

insert into public.faqs (key, question, answer, is_published) values
  ('f-live', 'Live question', 'Answer', true),
  ('f-hidden', 'Hidden question', 'Answer', false)
on conflict (key) do nothing;

insert into public.leads
  (first_name, last_name, email, business_type, turnover)
values ('Test', 'Lead', 'lead@example.com', 'limited-company', '100k-250k')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Runs `statement` as `role_name` (optionally as a signed-in user) and
-- reports whether access was refused — either by a missing grant
-- (insufficient_privilege) or by an RLS policy returning no rows.
create or replace function public.denied_to(
  statement text,
  role_name text,
  user_id uuid default null
)
returns boolean
language plpgsql
as $$
declare
  row_count integer;
begin
  execute format('set local role %I', role_name);
  if user_id is not null then
    perform set_config(
      'request.jwt.claims',
      json_build_object('sub', user_id)::text,
      true
    );
  else
    perform set_config('request.jwt.claims', '', true);
  end if;

  execute format('select count(*) from (%s) probe', statement) into row_count;
  return row_count = 0;
exception
  when insufficient_privilege then return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Anonymous visitors
-- ---------------------------------------------------------------------------

do $$
begin
  if not public.denied_to('select id from public.leads', 'anon') then
    raise exception 'FAIL: anonymous visitors can read leads';
  end if;
  raise notice 'pass  anon cannot read leads';
end;
$$;

do $$
begin
  if not public.denied_to('select id from public.contact_submissions', 'anon') then
    raise exception 'FAIL: anonymous visitors can read contact submissions';
  end if;
  raise notice 'pass  anon cannot read contact submissions';
end;
$$;

do $$
begin
  if not public.denied_to('select id from public.appointments', 'anon') then
    raise exception 'FAIL: anonymous visitors can read appointments';
  end if;
  raise notice 'pass  anon cannot read appointments';
end;
$$;

do $$
begin
  if not public.denied_to('select id from public.profiles', 'anon') then
    raise exception 'FAIL: anonymous visitors can read profiles';
  end if;
  raise notice 'pass  anon cannot read profiles';
end;
$$;

-- Writing must go through the API routes, never straight to the REST API.
do $$
declare
  blocked boolean := false;
begin
  set local role anon;
  begin
    insert into public.leads (first_name, last_name, email, business_type, turnover)
    values ('Mallory', 'Attacker', 'bad@example.com', 'other', 'under-50k');
  exception
    when insufficient_privilege then blocked := true;
    when others then blocked := true;
  end;
  if not blocked then
    raise exception 'FAIL: anonymous visitors can insert leads directly';
  end if;
  raise notice 'pass  anon cannot insert leads directly';
end;
$$;

-- ---------------------------------------------------------------------------
-- Published content visibility
-- ---------------------------------------------------------------------------

do $$
begin
  if public.denied_to(
       'select id from public.blog_posts where key = ''p-live''', 'anon') then
    raise exception 'FAIL: anonymous visitors cannot read a published post';
  end if;
  raise notice 'pass  anon can read published posts';
end;
$$;

do $$
begin
  if not public.denied_to(
       'select id from public.blog_posts where key = ''p-draft''', 'anon') then
    raise exception 'FAIL: anonymous visitors can read draft posts';
  end if;
  raise notice 'pass  anon cannot read drafts';
end;
$$;

do $$
begin
  if not public.denied_to(
       'select id from public.blog_posts where key = ''p-future''', 'anon') then
    raise exception 'FAIL: anonymous visitors can read a scheduled future post';
  end if;
  raise notice 'pass  anon cannot read scheduled posts before their date';
end;
$$;

do $$
begin
  if not public.denied_to(
       'select id from public.faqs where key = ''f-hidden''', 'anon') then
    raise exception 'FAIL: anonymous visitors can read unpublished FAQs';
  end if;
  raise notice 'pass  anon cannot read unpublished FAQs';
end;
$$;

do $$
begin
  if public.denied_to(
       'select id from public.faqs where key = ''f-live''', 'anon') then
    raise exception 'FAIL: anonymous visitors cannot read published FAQs';
  end if;
  raise notice 'pass  anon can read published FAQs';
end;
$$;

-- Content is read-only to the public.
do $$
declare
  blocked boolean := false;
begin
  set local role anon;
  begin
    update public.faqs set answer = 'defaced' where key = 'f-live';
  exception when others then blocked := true;
  end;
  if not blocked then
    raise exception 'FAIL: anonymous visitors can edit content';
  end if;
  raise notice 'pass  anon cannot edit content';
end;
$$;

-- ---------------------------------------------------------------------------
-- Clients versus staff
-- ---------------------------------------------------------------------------

do $$
begin
  if not public.denied_to(
       'select id from public.leads', 'authenticated',
       '11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: a CLIENT can read leads';
  end if;
  raise notice 'pass  CLIENT cannot read leads';
end;
$$;

do $$
begin
  if public.denied_to(
       'select id from public.leads', 'authenticated',
       '22222222-2222-2222-2222-222222222222') then
    raise exception 'FAIL: a STAFF member cannot read leads';
  end if;
  raise notice 'pass  STAFF can read leads';
end;
$$;

do $$
begin
  if not public.denied_to(
       'select id from public.audit_logs', 'authenticated',
       '33333333-3333-3333-3333-333333333333') then
    raise exception 'FAIL: an ADMIN can read the audit log';
  end if;
  raise notice 'pass  ADMIN cannot read the audit log';
end;
$$;

-- A client may read their own profile and nobody else's.
do $$
begin
  if public.denied_to(
       'select id from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
       'authenticated', '11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: a CLIENT cannot read their own profile';
  end if;
  raise notice 'pass  CLIENT can read own profile';
end;
$$;

do $$
begin
  if not public.denied_to(
       'select id from public.profiles where id = ''22222222-2222-2222-2222-222222222222''',
       'authenticated', '11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: a CLIENT can read another user''s profile';
  end if;
  raise notice 'pass  CLIENT cannot read another profile';
end;
$$;

-- ---------------------------------------------------------------------------
-- Privilege escalation
-- ---------------------------------------------------------------------------

-- The column-level grant is what stops this: the RLS policy permits updating
-- your own row, but `role` was never granted to `authenticated` at all.
do $$
declare
  blocked boolean := false;
  final_role public.user_role;
begin
  set local role authenticated;
  perform set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111"}',
    true
  );
  begin
    update public.profiles set role = 'SUPER_ADMIN'
      where id = '11111111-1111-1111-1111-111111111111';
  exception when others then blocked := true;
  end;
  reset role;

  select role into final_role from public.profiles
    where id = '11111111-1111-1111-1111-111111111111';

  if not blocked or final_role <> 'CLIENT' then
    raise exception 'FAIL: a user promoted themselves to %', final_role;
  end if;
  raise notice 'pass  a user cannot change their own role';
end;
$$;

-- but they can still edit their own details
do $$
declare
  stored text;
begin
  set local role authenticated;
  perform set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111"}',
    true
  );
  update public.profiles set full_name = 'Sarah Mitchell'
    where id = '11111111-1111-1111-1111-111111111111';
  reset role;

  select full_name into stored from public.profiles
    where id = '11111111-1111-1111-1111-111111111111';
  if stored is distinct from 'Sarah Mitchell' then
    raise exception 'FAIL: a user cannot edit their own name';
  end if;
  raise notice 'pass  a user can edit their own details';
end;
$$;

do $$
declare
  blocked boolean := false;
begin
  set local role authenticated;
  perform set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111"}',
    true
  );
  begin
    perform public.set_user_role(
      '11111111-1111-1111-1111-111111111111', 'ADMIN'
    );
  exception when others then blocked := true;
  end;
  reset role;
  if not blocked then
    raise exception 'FAIL: a CLIENT can call set_user_role';
  end if;
  raise notice 'pass  set_user_role refuses a non-administrator';
end;
$$;

do $$
declare
  granted public.user_role;
begin
  set local role authenticated;
  perform set_config(
    'request.jwt.claims',
    '{"sub":"33333333-3333-3333-3333-333333333333"}',
    true
  );
  perform public.set_user_role(
    '11111111-1111-1111-1111-111111111111', 'ACCOUNTANT'
  );
  reset role;

  select role into granted from public.profiles
    where id = '11111111-1111-1111-1111-111111111111';
  if granted <> 'ACCOUNTANT' then
    raise exception 'FAIL: an ADMIN could not grant a role (got %)', granted;
  end if;
  raise notice 'pass  an ADMIN can grant a role';
end;
$$;

-- Restore the fixture for any later run.
update public.profiles set role = 'CLIENT'
  where id = '11111111-1111-1111-1111-111111111111';

-- ---------------------------------------------------------------------------
-- Booking integrity
-- ---------------------------------------------------------------------------

do $$
declare
  type_id uuid;
  blocked boolean := false;
begin
  select id into type_id from public.consultation_types where key = 't-free';

  insert into public.appointments
    (consultation_type_id, scheduled_on, scheduled_at_time,
     first_name, last_name, email)
  values (type_id, current_date + 3, '09:00', 'First', 'Booker', 'a@example.com');

  begin
    insert into public.appointments
      (consultation_type_id, scheduled_on, scheduled_at_time,
       first_name, last_name, email)
    values (type_id, current_date + 3, '09:00', 'Second', 'Booker', 'b@example.com');
  exception when unique_violation then blocked := true;
  end;

  if not blocked then
    raise exception 'FAIL: the same slot was booked twice';
  end if;
  raise notice 'pass  a slot cannot be booked twice';
end;
$$;

-- Cancelling must release the slot, otherwise a cancellation blocks the diary
-- forever.
do $$
declare
  type_id uuid;
begin
  select id into type_id from public.consultation_types where key = 't-free';

  update public.appointments set status = 'CANCELLED'
    where consultation_type_id = type_id
      and scheduled_on = current_date + 3
      and scheduled_at_time = '09:00';

  insert into public.appointments
    (consultation_type_id, scheduled_on, scheduled_at_time,
     first_name, last_name, email)
  values (type_id, current_date + 3, '09:00', 'Third', 'Booker', 'c@example.com');

  raise notice 'pass  a cancelled slot becomes bookable again';
end;
$$;

-- ---------------------------------------------------------------------------
-- Lead status history
-- ---------------------------------------------------------------------------

-- The variable is named `target_lead` rather than `lead_id`: a PL/pgSQL
-- variable sharing a name with a column makes the reference ambiguous.
do $$
declare
  target_lead uuid;
  entries integer;
begin
  select id into target_lead from public.leads
    where email = 'lead@example.com' limit 1;

  select count(*) into entries from public.lead_status_history
    where lead_id = target_lead;
  if entries <> 1 then
    raise exception 'FAIL: creating a lead did not record its initial status (% entries)', entries;
  end if;

  update public.leads set status = 'CONTACTED' where id = target_lead;
  update public.leads set status = 'WON' where id = target_lead;

  select count(*) into entries from public.lead_status_history
    where lead_id = target_lead;
  if entries <> 3 then
    raise exception 'FAIL: status transitions were not recorded (% entries)', entries;
  end if;

  -- A no-op update must not create a phantom entry.
  update public.leads set status = 'WON' where id = target_lead;
  select count(*) into entries from public.lead_status_history
    where lead_id = target_lead;
  if entries <> 3 then
    raise exception 'FAIL: an unchanged status was recorded as a transition';
  end if;

  raise notice 'pass  lead status history records every real transition';
end;
$$;

-- The timeline must not be editable after the fact.
do $$
declare
  blocked boolean := false;
begin
  set local role authenticated;
  perform set_config(
    'request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222"}',
    true
  );
  begin
    update public.lead_status_history set to_status = 'LOST';
  exception when others then blocked := true;
  end;
  reset role;
  if not blocked then
    raise exception 'FAIL: staff can rewrite the lead status history';
  end if;
  raise notice 'pass  lead status history is append-only';
end;
$$;

drop function public.denied_to(text, text, uuid);

select 'All security assertions passed.' as result;
