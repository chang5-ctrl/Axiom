create table if not exists public.module_registry (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  icon text,
  category text not null default 'other',
  version text not null default '1.0.0',
  is_system boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 999,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists module_registry_category_idx on public.module_registry(category);
create index if not exists module_registry_is_active_idx on public.module_registry(is_active);

grant select on public.module_registry to anon, authenticated;
grant all on public.module_registry to service_role;
alter table public.module_registry enable row level security;

drop policy if exists "module registry read" on public.module_registry;
create policy "module registry read" on public.module_registry
  for select using (is_active or public.is_platform_admin());

create table if not exists public.tenant_module_registry (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_key text not null references public.module_registry(key) on delete cascade,
  is_enabled boolean not null default false,
  enabled_at timestamptz,
  enabled_by uuid references auth.users(id) on delete set null,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_key)
);

create index if not exists tenant_module_registry_tenant_idx on public.tenant_module_registry(tenant_id);
create index if not exists tenant_module_registry_enabled_idx on public.tenant_module_registry(is_enabled);

revoke all on public.tenant_module_registry from anon;
grant select, insert, update, delete on public.tenant_module_registry to authenticated;
grant all on public.tenant_module_registry to service_role;
alter table public.tenant_module_registry enable row level security;

drop policy if exists "tenant module registry read" on public.tenant_module_registry;
create policy "tenant module registry read" on public.tenant_module_registry
  for select to authenticated using (
    public.is_tenant_member(tenant_id) or public.is_platform_admin()
  );

drop policy if exists "tenant module registry manage" on public.tenant_module_registry;
create policy "tenant module registry manage" on public.tenant_module_registry
  for all to authenticated using (
    public.has_tenant_role(tenant_id, array['owner','admin']) or public.is_platform_admin()
  ) with check (
    public.has_tenant_role(tenant_id, array['owner','admin']) or public.is_platform_admin()
  );

drop trigger if exists set_updated_at_module_registry on public.module_registry;
create trigger set_updated_at_module_registry before update on public.module_registry
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_tenant_module_registry on public.tenant_module_registry;
create trigger set_updated_at_tenant_module_registry before update on public.tenant_module_registry
  for each row execute function public.set_updated_at();

insert into public.module_registry (
  key, name, description, icon, category, version, is_system, is_active, display_order, metadata
) values
  ('dashboard', 'Dashboard', 'Workspace overview and KPIs', 'LayoutDashboard', 'core', '1.0.0', true, true, 0, '{"status": "production"}'),
  ('settings', 'Settings', 'Workspace configuration', 'Settings', 'core', '1.0.0', true, true, 1, '{"status": "production"}'),
  ('crm', 'CRM', 'Leads, contacts, and pipeline management', 'Users', 'operations', '1.0.0', false, true, 10, '{"status": "coming_soon"}'),
  ('inventory', 'Inventory', 'Stock, warehouses, and movements', 'Package', 'operations', '1.0.0', false, true, 11, '{"status": "coming_soon"}'),
  ('sales', 'Sales', 'Orders, invoices, and fulfillment', 'ShoppingCart', 'operations', '1.0.0', false, true, 12, '{"status": "coming_soon"}'),
  ('projects', 'Projects', 'Tasks, milestones, and time tracking', 'KanbanSquare', 'operations', '1.0.0', false, true, 13, '{"status": "coming_soon"}'),
  ('accounting', 'Accounting', 'Ledger, invoicing, and financial reporting', 'Calculator', 'finance', '1.0.0', false, true, 20, '{"status": "coming_soon"}'),
  ('payroll', 'Payroll', 'Salaries, benefits, and payslips', 'Wallet', 'finance', '1.0.0', false, true, 21, '{"status": "coming_soon"}'),
  ('hr', 'HR', 'Employees, hiring, and performance', 'Users2', 'people', '1.0.0', false, true, 30, '{"status": "coming_soon"}'),
  ('staff', 'Staff', 'Team members and permissions', 'UserCheck', 'people', '1.0.0', false, true, 31, '{"status": "coming_soon"}'),
  ('documents', 'Documents', 'File storage and collaboration', 'FileText', 'knowledge', '1.0.0', false, true, 40, '{"status": "coming_soon"}'),
  ('calendar', 'Calendar', 'Events, meetings, and scheduling', 'Calendar', 'knowledge', '1.0.0', false, true, 41, '{"status": "coming_soon"}'),
  ('notifications', 'Notifications', 'Alerts and system notifications', 'Bell', 'knowledge', '1.0.0', false, true, 42, '{"status": "coming_soon"}'),
  ('reports', 'Reports', 'Custom reports and dashboards', 'BarChart3', 'analytics', '1.0.0', false, true, 50, '{"status": "coming_soon"}'),
  ('analytics', 'Analytics', 'Business intelligence and metrics', 'TrendingUp', 'analytics', '1.0.0', false, true, 51, '{"status": "coming_soon"}'),
  ('automotive', 'Automotive Management', 'Vehicle dealership management', 'Car', 'industry', '1.0.0', false, true, 60, '{"status": "production"}')
on conflict (key) do nothing;

create or replace function public.is_module_enabled(
  _tenant_id uuid,
  _module_key text
)
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select exists (
    select 1 from public.tenant_module_registry
    where tenant_id = _tenant_id
      and module_key = _module_key
      and is_enabled = true
  );
$$;

create or replace function public.get_tenant_enabled_modules(_tenant_id uuid)
returns table (module_id uuid, module_key text, name text, icon text, category text)
language sql
stable
security definer
set search_path = public as $$
  select mr.id, mr.key, mr.name, mr.icon, mr.category
  from public.module_registry mr
  join public.tenant_module_registry tmr on tmr.module_key = mr.key
  where tmr.tenant_id = _tenant_id and tmr.is_enabled = true
  order by mr.display_order asc;
$$;

revoke all on function public.is_module_enabled(uuid, text) from public, anon, authenticated;
grant execute on function public.is_module_enabled(uuid, text) to service_role;
revoke all on function public.get_tenant_enabled_modules(uuid) from public, anon, authenticated;
grant execute on function public.get_tenant_enabled_modules(uuid) to service_role;