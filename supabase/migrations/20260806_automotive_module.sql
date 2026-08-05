-- Migration: Add Automotive module tables, enums, policies and module/permission seeds
begin;

-- Enum types
create type if not exists public.automotive_vehicle_status as enum ('available','reserved','sold','incoming');
create type if not exists public.automotive_reservation_status as enum ('active','expired','completed','cancelled');
create type if not exists public.automotive_customer_status as enum ('lead','customer','returning');

-- Vehicles table
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
create unique index if not exists idx_automotive_vehicles_vin on public.automotive_vehicles(lower(vin));

-- Customers table
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
create index if not exists idx_automotive_customers_phone on public.automotive_customers(lower(phone));
create index if not exists idx_automotive_customers_email on public.automotive_customers(lower(email));

-- Sales table
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

-- Reservations table
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

-- Triggers for updated_at
do $$
declare t text;
begin
  foreach t in array[
    'automotive_vehicles','automotive_customers','automotive_sales','automotive_reservations'
  ]
  loop
    execute format('create trigger set_updated_at_%1$s before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Permissions (module-specific)
insert into public.permissions (key, module, action, description)
values
  ('automotive.vehicles.view','automotive','view','View vehicles'),
  ('automotive.vehicles.create','automotive','create','Create vehicles'),
  ('automotive.vehicles.edit','automotive','edit','Edit vehicles'),
  ('automotive.vehicles.delete','automotive','delete','Delete vehicles'),
  ('automotive.customers.manage','automotive','manage','Manage customers'),
  ('automotive.sales.manage','automotive','manage','Manage sales'),
  ('automotive.reservations.manage','automotive','manage','Manage reservations'),
  ('automotive.reports.view','automotive','view','View automotive reports')
on conflict (key) do nothing;

-- Module registry entry
insert into public.modules (key, name, description, icon, category, version, is_active, is_system, sort_order, display_order)
values
  ('automotive','Automotive Management','Vehicle dealership management','Car','industry','1.0.0',true,false,100,100)
on conflict (key) do nothing;

-- RLS: tenant-scoped access
-- Vehicles
drop policy if exists "automotive vehicles select" on public.automotive_vehicles;
create policy "automotive vehicles select" on public.automotive_vehicles
  for select to authenticated using (public.is_platform_admin() OR public.is_tenant_member(tenant_id));
create policy "automotive vehicles insert" on public.automotive_vehicles
  for insert to authenticated with check (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));
create policy "automotive vehicles update" on public.automotive_vehicles
  for update to authenticated using (public.is_platform_admin() OR public.is_tenant_member(tenant_id)) with check (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));
create policy "automotive vehicles delete" on public.automotive_vehicles
  for delete to authenticated using (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin']));

-- Customers
drop policy if exists "automotive customers select" on public.automotive_customers;
create policy "automotive customers select" on public.automotive_customers
  for select to authenticated using (public.is_platform_admin() OR public.is_tenant_member(tenant_id));
create policy "automotive customers manage" on public.automotive_customers
  for all to authenticated using (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales'])) with check (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

-- Sales
drop policy if exists "automotive sales select" on public.automotive_sales;
create policy "automotive sales select" on public.automotive_sales
  for select to authenticated using (public.is_platform_admin() OR public.is_tenant_member(tenant_id));
create policy "automotive sales manage" on public.automotive_sales
  for all to authenticated using (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales'])) with check (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

-- Reservations
drop policy if exists "automotive reservations select" on public.automotive_reservations;
create policy "automotive reservations select" on public.automotive_reservations
  for select to authenticated using (public.is_platform_admin() OR public.is_tenant_member(tenant_id));
create policy "automotive reservations manage" on public.automotive_reservations
  for all to authenticated using (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales'])) with check (public.is_platform_admin() OR public.has_tenant_role(tenant_id, array['owner','admin','manager','sales']));

commit;
