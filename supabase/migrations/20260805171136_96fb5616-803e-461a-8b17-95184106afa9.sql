revoke execute on function public.has_permission(uuid, text, uuid) from authenticated;

create or replace function public.create_tenant_workspace(
  _name text,
  _description text default null,
  _industry text default null,
  _phone text default null,
  _full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _email text;
  _slug text;
  _base text;
  _n int := 0;
  _tenant_id uuid;
  _owner_role uuid;
  _plan uuid;
  _sub uuid;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(_name), '') = '' then
    raise exception 'Business name is required';
  end if;

  select email into _email from auth.users where id = _uid;

  _base := nullif(regexp_replace(lower(trim(_name)), '[^a-z0-9]+', '-', 'g'), '');
  _base := trim(both '-' from coalesce(_base, 'workspace'));
  _slug := _base;
  while exists (select 1 from public.tenants where slug = _slug) loop
    _n := _n + 1;
    _slug := _base || '-' || _n::text;
  end loop;

  insert into public.profiles (id, full_name, email, phone)
  values (_uid, _full_name, _email, _phone)
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        email = coalesce(excluded.email, public.profiles.email);

  insert into public.tenants (name, slug, owner_id, status)
  values (trim(_name), _slug, _uid, 'trial')
  returning id into _tenant_id;

  select id into _owner_role from public.roles where tenant_id is null and key = 'owner';

  insert into public.memberships (tenant_id, user_id, role_id, role_key, status)
  values (_tenant_id, _uid, _owner_role, 'owner', 'active');

  insert into public.business_profiles (tenant_id, legal_name, description, industry, phone, email)
  values (_tenant_id, trim(_name), _description, _industry, _phone, _email);

  select id into _plan from public.plans where key = 'starter';
  if _plan is not null then
    insert into public.subscriptions (tenant_id, plan_id, status, current_period_end)
    values (_tenant_id, _plan, 'trialing', now() + interval '14 days')
    returning id into _sub;
  end if;

  insert into public.tenant_modules (tenant_id, module_key, enabled)
  select _tenant_id, key, true from public.modules where is_core;

  insert into public.audit_logs (tenant_id, actor_id, action, entity_type, entity_id, metadata)
  values (_tenant_id, _uid, 'tenant.created', 'tenant', _tenant_id::text, jsonb_build_object('slug', _slug));

  return _tenant_id;
end;
$$;

revoke execute on function public.create_tenant_workspace(text, text, text, text, text) from anon, public;
grant execute on function public.create_tenant_workspace(text, text, text, text, text) to authenticated;