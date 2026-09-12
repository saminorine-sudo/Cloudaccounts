-- CloudAccounts — Row Level Security
--
-- Two rules this file exists to enforce:
--
--   1. Nothing anonymous can read an enquiry, a booking or a person's
--      details. The public site reads published content and nothing else.
--   2. Privilege is never self-granted. A signed-in user cannot change their
--      own role, even though they can edit their own profile.
--
-- Supabase's default privileges hand every new table in `public` to the
-- `anon` and `authenticated` roles, so this file REVOKES everything first and
-- grants back only what each role genuinely needs. Starting from deny is the
-- only version of this that stays correct when a table is added later and
-- someone forgets to write a policy.
--
-- `service_role` intentionally keeps its grants and bypasses RLS. The API
-- route handlers use it to write submissions server-side, after their own
-- validation — that is why `anon` needs no insert permission anywhere.

-- ---------------------------------------------------------------------------
-- Start from nothing
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Role helpers are safe to call: each only reports on the caller.
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'site_settings', 'site_stats', 'faqs', 'services',
    'pricing_plans', 'audiences', 'service_faqs', 'audience_services',
    'testimonials', 'team_members', 'case_studies', 'blog_categories',
    'blog_posts', 'guides', 'consultation_types', 'leads', 'lead_notes',
    'lead_status_history', 'contact_submissions', 'appointments', 'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    -- Applies RLS to the table owner too, so a definer function cannot
    -- accidentally sidestep a policy.
    execute format('alter table public.%I force row level security', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public content
-- ---------------------------------------------------------------------------
--
-- Readable by anyone; writable only by admins. The published/active flag is
-- part of the read policy, so an unpublished draft is invisible to the public
-- site even if a query forgets to filter.

do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'site_stats', 'faqs', 'services', 'pricing_plans',
    'audiences', 'service_faqs', 'audience_services', 'testimonials',
    'team_members', 'case_studies', 'blog_categories', 'blog_posts',
    'guides', 'consultation_types'
  ]
  loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);

    execute format(
      'create policy %I on public.%I for insert to authenticated
         with check (public.is_admin())',
      t || '_admin_insert', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated
         using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_update', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated
         using (public.is_admin())',
      t || '_admin_delete', t
    );
  end loop;
end;
$$;

-- Read policies. Tables with a visibility flag expose only live rows to the
-- public, while admins can see everything so the CMS can edit drafts.
create policy site_settings_read on public.site_settings
  for select to anon, authenticated using (true);

create policy site_stats_read on public.site_stats
  for select to anon, authenticated using (true);

create policy blog_categories_read on public.blog_categories
  for select to anon, authenticated using (true);

create policy service_faqs_read on public.service_faqs
  for select to anon, authenticated using (true);

create policy audience_services_read on public.audience_services
  for select to anon, authenticated using (true);

create policy testimonials_read on public.testimonials
  for select to anon, authenticated using (true);

create policy guides_read on public.guides
  for select to anon, authenticated using (true);

create policy faqs_read on public.faqs
  for select to anon, authenticated
  using (is_published or public.is_admin());

create policy services_read on public.services
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy pricing_plans_read on public.pricing_plans
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy audiences_read on public.audiences
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy team_members_read on public.team_members
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy case_studies_read on public.case_studies
  for select to anon, authenticated
  using (is_published or public.is_admin());

create policy consultation_types_read on public.consultation_types
  for select to anon, authenticated
  using (is_active or public.is_admin());

-- A scheduled post must stay invisible until its publication date, otherwise
-- scheduling is decorative.
create policy blog_posts_read on public.blog_posts
  for select to anon, authenticated
  using (
    (status = 'published' and published_at <= current_date)
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

grant select on public.profiles to authenticated;

-- Column-level grant: a user may edit their own details but has no privilege
-- on `role` or `is_active` at all. This is what makes self-escalation
-- impossible — an RLS policy alone cannot restrict which columns an update
-- touches, so the grant has to do it.
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

create policy profiles_read_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or public.is_staff());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Role changes go through this function rather than a direct update, so the
-- privilege check lives in one auditable place.
create or replace function public.set_user_role(
  target_user_id uuid,
  new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an administrator may change a user role';
  end if;

  -- Stops the last administrator removing their own access and locking
  -- everyone out of the admin area.
  if target_user_id = (select auth.uid()) and new_role not in ('SUPER_ADMIN', 'ADMIN') then
    raise exception 'You cannot remove your own administrator role';
  end if;

  update public.profiles set role = new_role where id = target_user_id;

  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (
    (select auth.uid()),
    'role.changed',
    'profile',
    target_user_id::text,
    jsonb_build_object('new_role', new_role)
  );
end;
$$;

grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- ---------------------------------------------------------------------------
-- Leads, enquiries and bookings
-- ---------------------------------------------------------------------------
--
-- No grant to `anon` anywhere below. The public site never reads this data,
-- and it never writes it directly either — submissions go through the API
-- routes, which validate first and then use the service role.

grant select, update on public.leads to authenticated;
grant select, insert on public.lead_notes to authenticated;
grant select on public.lead_status_history to authenticated;
grant select, update on public.contact_submissions to authenticated;
grant select, update on public.appointments to authenticated;

create policy leads_staff_read on public.leads
  for select to authenticated using (public.is_staff());

create policy leads_staff_update on public.leads
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy lead_notes_staff_read on public.lead_notes
  for select to authenticated using (public.is_staff());

create policy lead_notes_staff_insert on public.lead_notes
  for insert to authenticated
  with check (public.is_staff() and author_id = (select auth.uid()));

-- Read-only to everyone: rows are written by the trigger in 0001, so the
-- activity timeline cannot be rewritten after the fact.
create policy lead_status_history_staff_read on public.lead_status_history
  for select to authenticated using (public.is_staff());

create policy contact_submissions_staff_read on public.contact_submissions
  for select to authenticated using (public.is_staff());

create policy contact_submissions_staff_update on public.contact_submissions
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy appointments_staff_read on public.appointments
  for select to authenticated using (public.is_staff());

create policy appointments_staff_update on public.appointments
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
--
-- Readable by super administrators only, and append-only for everyone: there
-- is deliberately no update or delete policy, so even a super administrator
-- cannot quietly edit the record of what happened.

grant select on public.audit_logs to authenticated;

create policy audit_logs_super_admin_read on public.audit_logs
  for select to authenticated
  using (public.current_user_role() = 'SUPER_ADMIN');
