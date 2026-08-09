-- 1) Remove unclaimed placeholder staff records so no one can claim them.
delete from public.platform_employees where user_id is null and is_seed = true;

-- 2) Signed-in users must not be able to call platform security-definer helpers directly.
revoke execute on function public.is_platform_staff() from authenticated, anon, public;
revoke execute on function public.platform_role_key() from authenticated, anon, public;
revoke execute on function public.has_platform_permission(text) from authenticated, anon, public;

-- 3) Tenant admins must not be able to modify their own membership row (self-escalation).
drop policy if exists "memberships insert" on public.memberships;
drop policy if exists "memberships update" on public.memberships;
drop policy if exists "memberships delete" on public.memberships;

create policy "memberships insert" on public.memberships
for insert to authenticated
with check (
  public.has_tenant_role(tenant_id, array['owner','admin'])
  and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  and user_id <> auth.uid()
);

create policy "memberships update" on public.memberships
for update to authenticated
using (
  public.has_tenant_role(tenant_id, array['owner','admin'])
  and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  and user_id <> auth.uid()
)
with check (
  public.has_tenant_role(tenant_id, array['owner','admin'])
  and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  and user_id <> auth.uid()
);

create policy "memberships delete" on public.memberships
for delete to authenticated
using (
  public.has_tenant_role(tenant_id, array['owner','admin'])
  and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  and user_id <> auth.uid()
);