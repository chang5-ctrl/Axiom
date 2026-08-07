-- 1) Hard, constraint-level guard against membership privilege escalation
create or replace function public.enforce_membership_role_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _actor uuid := auth.uid();
  _tenant_has_owner boolean;
  _resolved_role_key text;
begin
  -- Keep role_id and role_key consistent so role assignment cannot be spoofed.
  if new.role_id is not null then
    select r.key into _resolved_role_key
    from public.roles r
    where r.id = new.role_id
      and (r.tenant_id is null or r.tenant_id = new.tenant_id);

    if _resolved_role_key is null then
      raise exception 'Invalid role for this workspace';
    end if;

    if _resolved_role_key <> new.role_key then
      raise exception 'Role mismatch: role_key must match the assigned role';
    end if;
  end if;

  -- Trusted server-side paths (service_role / SECURITY DEFINER provisioning) have no auth.uid().
  if _actor is null then
    return new;
  end if;

  select exists (
    select 1 from public.memberships m
    where m.tenant_id = new.tenant_id
      and m.role_key = 'owner'
      and m.status = 'active'
  ) into _tenant_has_owner;

  -- Only an existing active owner may grant or modify the owner role.
  if new.role_key = 'owner'
     and _tenant_has_owner
     and not public.has_tenant_role(new.tenant_id, array['owner'], _actor) then
    raise exception 'Only a workspace owner can grant the owner role';
  end if;

  if tg_op = 'UPDATE' then
    if old.role_key = 'owner'
       and not public.has_tenant_role(old.tenant_id, array['owner'], _actor) then
      raise exception 'Only a workspace owner can modify an owner membership';
    end if;

    -- Nobody may change their own role or status.
    if new.user_id = _actor
       and (new.role_key is distinct from old.role_key
            or new.role_id is distinct from old.role_id
            or new.status is distinct from old.status) then
      raise exception 'You cannot change your own role';
    end if;

    if new.tenant_id is distinct from old.tenant_id or new.user_id is distinct from old.user_id then
      raise exception 'Membership tenant and user cannot be reassigned';
    end if;
  end if;

  if tg_op = 'INSERT' and new.user_id = _actor and new.role_key = 'owner' and _tenant_has_owner then
    raise exception 'You cannot grant yourself the owner role';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_membership_role_integrity on public.memberships;
create trigger enforce_membership_role_integrity
before insert or update on public.memberships
for each row execute function public.enforce_membership_role_integrity();

revoke all on function public.enforce_membership_role_integrity() from public, anon, authenticated;

-- 2) Explicit, tightly scoped delete rule for tenants
drop policy if exists "tenants delete" on public.tenants;
create policy "tenants delete"
on public.tenants
for delete
to authenticated
using (public.has_tenant_role(id, array['owner']) or public.is_platform_admin());

grant delete on public.tenants to authenticated;