-- 1. Automotive module tables with RLS ENABLED
do $$ begin
  if not exists (select 1 from pg_type where typname = 'automotive_vehicle_status') then
    create type public.automotive_vehicle_status as enum ('available','reserved','sold','incoming');
  end if;
  if not exists (select 1 from pg_type where typname = 'automotive_reservation_status') then
    create type public.automotive_reservation_status as enum ('active','expired','completed','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'automotive_customer_status') then
    create type public.automotive_customer_status as enum ('lead','customer','returning');
  end if;
end $$;

create table if not exists public.automotive_vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vin text not null,
  stock_number text,
  make text,
  model text,
  year int,
  trim text,
  engine text,
  transmission text,
  fuel_type text,
  mileage int,
  exterior_color text,
  interior_color text,
  price numeric(12,2),
  purchase_price numeric(12,2),
  status public.automotive_vehicle_status not null default 'available',
  images jsonb not null default '[]'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_automotive_vehicles_tenant on public.automotive_vehicles(tenant_id);
create unique index if not exists idx_automotive_vehicles_vin on public.automotive_vehicles(tenant_id, lower(vin));

create table if not exists public.automotive_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  address text,
  preferred_vehicle text,
  notes text,
  status public.automotive_customer_status not null default 'lead',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_automotive_customers_tenant on public.automotive_customers(tenant_id);

create table if not exists public.automotive_sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid references public.automotive_vehicles(id) on delete set null,
  customer_id uuid references public.automotive_customers(id) on delete set null,
  sales_person_id uuid references auth.users(id) on delete set null,
  sale_price numeric(12,2),
  deposit numeric(12,2),
  balance numeric(12,2),
  payment_status text,
  delivery_status text,
  sale_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_automotive_sales_tenant on public.automotive_sales(tenant_id);
create index if not exists idx_automotive_sales_vehicle on public.automotive_sales(vehicle_id);

create table if not exists public.automotive_reservations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid not null references public.automotive_vehicles(id) on delete cascade,
  customer_id uuid not null references public.automotive_customers(id) on delete cascade,
  reserved_by uuid references auth.users(id) on delete set null,
  reservation_date timestamptz not null default now(),
  expiry_date timestamptz,
  status public.automotive_reservation_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_automotive_reservations_tenant on public.automotive_reservations(tenant_id);
create index if not exists idx_automotive_reservations_vehicle on public.automotive_reservations(vehicle_id);

-- Grants: authenticated only; RLS scopes rows. No anon access.
revoke all on public.automotive_vehicles from anon;
revoke all on public.automotive_customers from anon;
revoke all on public.automotive_sales from anon;
revoke all on public.automotive_reservations from anon;

grant select, insert, update, delete on public.automotive_vehicles to authenticated;
grant select, insert, update, delete on public.automotive_customers to authenticated;
grant select, insert, update, delete on public.automotive_sales to authenticated;
grant select, insert, update, delete on public.automotive_reservations to authenticated;
grant all on public.automotive_vehicles to service_role;
grant all on public.automotive_customers to service_role;
grant all on public.automotive_sales to service_role;
grant all on public.automotive_reservations to service_role;

-- ENABLE row level security (the missing step)
alter table public.automotive_vehicles enable row level security;
alter table public.automotive_customers enable row level security;
alter table public.automotive_sales enable row level security;
alter table public.automotive_reservations enable row level security;

-- updated_at triggers
drop trigger if exists set_updated_at_automotive_vehicles on public.automotive_vehicles;
create trigger set_updated_at_automotive_vehicles before update on public.automotive_vehicles
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_automotive_customers on public.automotive_customers;
create trigger set_updated_at_automotive_customers before update on public.automotive_customers
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_automotive_sales on public.automotive_sales;
create trigger set_updated_at_automotive_sales before update on public.automotive_sales
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_automotive_reservations on public.automotive_reservations;
create trigger set_updated_at_automotive_reservations before update on public.automotive_reservations
  for each row execute function public.set_updated_at();

-- Tenant-scoped policies
drop policy if exists "automotive vehicles select" on public.automotive_vehicles;
create policy "automotive vehicles select" on public.automotive_vehicles
  for select to authenticated using (public.is_platform_admin() or public.is_tenant_member(tenant_id));
drop policy if exists "automotive vehicles insert" on public.automotive_vehicles;
create policy "automotive vehicles insert" on public.automotive_vehicles
  for insert to authenticated with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));
drop policy if exists "automotive vehicles update" on public.automotive_vehicles;
create policy "automotive vehicles update" on public.automotive_vehicles
  for update to authenticated
  using (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));
drop policy if exists "automotive vehicles delete" on public.automotive_vehicles;
create policy "automotive vehicles delete" on public.automotive_vehicles
  for delete to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin']));

drop policy if exists "automotive customers select" on public.automotive_customers;
create policy "automotive customers select" on public.automotive_customers
  for select to authenticated using (public.is_platform_admin() or public.is_tenant_member(tenant_id));
drop policy if exists "automotive customers manage" on public.automotive_customers;
create policy "automotive customers manage" on public.automotive_customers
  for all to authenticated
  using (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

drop policy if exists "automotive sales select" on public.automotive_sales;
create policy "automotive sales select" on public.automotive_sales
  for select to authenticated using (public.is_platform_admin() or public.is_tenant_member(tenant_id));
drop policy if exists "automotive sales manage" on public.automotive_sales;
create policy "automotive sales manage" on public.automotive_sales
  for all to authenticated
  using (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

drop policy if exists "automotive reservations select" on public.automotive_reservations;
create policy "automotive reservations select" on public.automotive_reservations
  for select to authenticated using (public.is_platform_admin() or public.is_tenant_member(tenant_id));
drop policy if exists "automotive reservations manage" on public.automotive_reservations;
create policy "automotive reservations manage" on public.automotive_reservations
  for all to authenticated
  using (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

-- 2. Prevent privilege escalation through memberships
drop policy if exists "memberships manage" on public.memberships;

create policy "memberships insert" on public.memberships
  for insert to authenticated
  with check (
    public.has_tenant_role(tenant_id, array['owner','admin'])
    and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  );

create policy "memberships update" on public.memberships
  for update to authenticated
  using (
    public.has_tenant_role(tenant_id, array['owner','admin'])
    and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  )
  with check (
    public.has_tenant_role(tenant_id, array['owner','admin'])
    and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  );

create policy "memberships delete" on public.memberships
  for delete to authenticated
  using (
    public.has_tenant_role(tenant_id, array['owner','admin'])
    and (role_key <> 'owner' or public.has_tenant_role(tenant_id, array['owner']))
  );

-- 3. Workspace provisioning: not directly callable by signed-in users
create or replace function public.provision_tenant_workspace(
  _user_id uuid,
  _name text,
  _description text default null,
  _industry text default null,
  _phone text default null,
  _full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  _uid uuid := _user_id;
  _email text;
  _slug text;
  _base text;
  _n int := 0;
  _tenant_id uuid;
  _owner_role uuid;
  _plan uuid;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(_name), '') = '' then
    raise exception 'Business name is required';
  end if;

  select email into _email from auth.users where id = _uid;
  if _email is null then
    raise exception 'Unknown user';
  end if;

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
    values (_tenant_id, _plan, 'trialing', now() + interval '14 days');
  end if;

  insert into public.tenant_modules (tenant_id, module_key, enabled)
  select _tenant_id, key, true from public.modules where is_core;

  insert into public.audit_logs (tenant_id, actor_id, action, entity_type, entity_id, metadata)
  values (_tenant_id, _uid, 'tenant.created', 'tenant', _tenant_id::text, jsonb_build_object('slug', _slug));

  return _tenant_id;
end;
$function$;

revoke all on function public.provision_tenant_workspace(uuid, text, text, text, text, text) from public;
revoke all on function public.provision_tenant_workspace(uuid, text, text, text, text, text) from anon;
revoke all on function public.provision_tenant_workspace(uuid, text, text, text, text, text) from authenticated;
grant execute on function public.provision_tenant_workspace(uuid, text, text, text, text, text) to service_role;

drop function if exists public.create_tenant_workspace(text, text, text, text, text);