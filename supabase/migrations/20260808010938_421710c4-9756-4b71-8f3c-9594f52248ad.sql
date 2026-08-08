-- Recreate helpers as strictly self-scoped for signed-in callers.
drop policy "platform staff read roles" on public.platform_roles;
drop policy "platform staff read permissions" on public.platform_permissions;
drop policy "platform staff read role permissions" on public.platform_role_permissions;
drop policy "platform staff read directory" on public.platform_employees;
drop policy "platform owner inserts employees" on public.platform_employees;
drop policy "platform owner updates employees" on public.platform_employees;
drop policy "platform owner deletes employees" on public.platform_employees;
drop policy "platform staff read login history" on public.platform_login_events;

drop function if exists public.is_platform_staff(uuid);
drop function if exists public.platform_role_key(uuid);
drop function if exists public.has_platform_permission(text, uuid);

-- Self-only helpers (safe for signed-in callers: reveal nothing about others).
create or replace function public.is_platform_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_employees
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.platform_role_key()
returns text language sql stable security definer set search_path = public as $$
  select role_key from public.platform_employees
  where user_id = auth.uid() and status = 'active' limit 1;
$$;

create or replace function public.has_platform_permission(_permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.platform_employees e
    join public.platform_role_permissions rp on rp.role_key = e.role_key
    where e.user_id = auth.uid()
      and e.status = 'active'
      and rp.permission_key = _permission
  );
$$;

-- Trusted server-side variants: service_role only.
create or replace function public.has_platform_permission_for(_permission text, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.platform_employees e
    join public.platform_role_permissions rp on rp.role_key = e.role_key
    where e.user_id = _user_id
      and e.status = 'active'
      and rp.permission_key = _permission
  );
$$;

revoke all on function public.is_platform_staff() from public, anon;
revoke all on function public.platform_role_key() from public, anon;
revoke all on function public.has_platform_permission(text) from public, anon;
revoke all on function public.has_platform_permission_for(text, uuid) from public, anon, authenticated;
grant execute on function public.is_platform_staff() to authenticated, service_role;
grant execute on function public.platform_role_key() to authenticated, service_role;
grant execute on function public.has_platform_permission(text) to authenticated, service_role;
grant execute on function public.has_platform_permission_for(text, uuid) to service_role;

create policy "platform staff read roles" on public.platform_roles
  for select to authenticated using (public.is_platform_staff());
create policy "platform staff read permissions" on public.platform_permissions
  for select to authenticated using (public.is_platform_staff());
create policy "platform staff read role permissions" on public.platform_role_permissions
  for select to authenticated using (public.is_platform_staff());

create policy "platform staff read directory" on public.platform_employees
  for select to authenticated
  using (user_id = auth.uid() or public.has_platform_permission('platform.employees.view'));

create policy "platform owner inserts employees" on public.platform_employees
  for insert to authenticated
  with check (public.has_platform_permission('platform.employees.manage'));

create policy "platform owner updates employees" on public.platform_employees
  for update to authenticated
  using (public.has_platform_permission('platform.employees.manage'))
  with check (public.has_platform_permission('platform.employees.manage'));

create policy "platform owner deletes employees" on public.platform_employees
  for delete to authenticated
  using (public.has_platform_permission('platform.employees.manage'));

create policy "platform staff read login history" on public.platform_login_events
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_platform_permission('platform.employees.view')
    or public.has_platform_permission('platform.security.view')
  );
