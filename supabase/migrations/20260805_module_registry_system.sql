-- ============ MODULE REGISTRY ============
-- This system allows unlimited modules to be added without changing the core application.
-- Every tenant can have a different combination of enabled modules.

-- Modules available on the platform
create table public.module_registry (
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

create index module_registry_category_idx on public.module_registry(category);
create index module_registry_is_active_idx on public.module_registry(is_active);

grant select on public.module_registry to authenticated, anon;
grant all on public.module_registry to service_role;
alter table public.module_registry enable row level security;

create policy "module registry read" on public.module_registry for select using (
  is_active or public.is_platform_admin()
);

-- Tenant module configuration
create table public.tenant_module_registry (
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

create index tenant_module_registry_tenant_idx on public.tenant_module_registry(tenant_id);
create index tenant_module_registry_enabled_idx on public.tenant_module_registry(is_enabled);

grant select, insert, update, delete on public.tenant_module_registry to authenticated;
grant all on public.tenant_module_registry to service_role;
alter table public.tenant_module_registry enable row level security;

create policy "tenant module registry read" on public.tenant_module_registry 
  for select to authenticated using (
    public.is_tenant_member(tenant_id) or public.is_platform_admin()
  );

create policy "tenant module registry manage" on public.tenant_module_registry 
  for all to authenticated using (
    public.has_tenant_role(tenant_id, array['owner', 'admin']) or public.is_platform_admin()
  ) with check (
    public.has_tenant_role(tenant_id, array['owner', 'admin']) or public.is_platform_admin()
  );

-- Add updated_at trigger
create trigger set_updated_at_module_registry before update on public.module_registry
  for each row execute function public.set_updated_at();

create trigger set_updated_at_tenant_module_registry before update on public.tenant_module_registry
  for each row execute function public.set_updated_at();

-- ============ HELPER FUNCTIONS ============

-- Check if a module is enabled for a tenant
create or replace function public.is_module_enabled(
  _tenant_id uuid,
  _module_key text,
  _user_id uuid default auth.uid()
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

-- Get all enabled modules for a tenant
create or replace function public.get_tenant_enabled_modules(_tenant_id uuid)
returns table (module_id uuid, module_key text, name text, icon text, category text)
language sql
stable
security definer
set search_path = public as $$
  select
    mr.id,
    mr.key,
    mr.name,
    mr.icon,
    mr.category
  from public.module_registry mr
  join public.tenant_module_registry tmr on tmr.module_key = mr.key
  where tmr.tenant_id = _tenant_id and tmr.is_enabled = true
  order by mr.display_order asc;
$$;

-- ============ SEED: MODULE REGISTRY ============
insert into public.module_registry (
  key, name, description, icon, category, version, is_system, is_active, display_order, metadata
) values
  -- Core
  ('dashboard', 'Dashboard', 'Workspace overview and KPIs', 'LayoutDashboard', 'core', '1.0.0', true, true, 0, '{"status": "production"}'),
  ('settings', 'Settings', 'Workspace configuration', 'Settings', 'core', '1.0.0', true, true, 1, '{"status": "production"}'),
  
  -- Business Operations
  ('crm', 'CRM', 'Leads, contacts, and pipeline management', 'Users', 'operations', '1.0.0', false, true, 10, '{"status": "coming_soon"}'),
  ('inventory', 'Inventory', 'Stock, warehouses, and movements', 'Package', 'operations', '1.0.0', false, true, 11, '{"status": "coming_soon"}'),
  ('sales', 'Sales', 'Orders, invoices, and fulfillment', 'ShoppingCart', 'operations', '1.0.0', false, true, 12, '{"status": "coming_soon"}'),
  ('projects', 'Projects', 'Tasks, milestones, and time tracking', 'KanbanSquare', 'operations', '1.0.0', false, true, 13, '{"status": "coming_soon"}'),
  
  -- Finance & Admin
  ('accounting', 'Accounting', 'Ledger, invoicing, and financial reporting', 'Calculator', 'finance', '1.0.0', false, true, 20, '{"status": "coming_soon"}'),
  ('payroll', 'Payroll', 'Salaries, benefits, and payslips', 'Wallet', 'finance', '1.0.0', false, true, 21, '{"status": "coming_soon"}'),
  
  -- People Management
  ('hr', 'HR', 'Employees, hiring, and performance', 'Users2', 'people', '1.0.0', false, true, 30, '{"status": "coming_soon"}'),
  ('staff', 'Staff', 'Team members and permissions', 'UserCheck', 'people', '1.0.0', false, true, 31, '{"status": "coming_soon"}'),
  
  -- Knowledge & Communication
  ('documents', 'Documents', 'File storage and collaboration', 'FileText', 'knowledge', '1.0.0', false, true, 40, '{"status": "coming_soon"}'),
  ('calendar', 'Calendar', 'Events, meetings, and scheduling', 'Calendar', 'knowledge', '1.0.0', false, true, 41, '{"status": "coming_soon"}'),
  ('notifications', 'Notifications', 'Alerts and system notifications', 'Bell', 'knowledge', '1.0.0', false, true, 42, '{"status": "coming_soon"}'),
  
  -- Reporting & Analytics
  ('reports', 'Reports', 'Custom reports and dashboards', 'BarChart3', 'analytics', '1.0.0', false, true, 50, '{"status": "coming_soon"}'),
  ('analytics', 'Analytics', 'Business intelligence and metrics', 'TrendingUp', 'analytics', '1.0.0', false, true, 51, '{"status": "coming_soon"}'),
  
  -- Customer Management
  ('customers', 'Customers', 'Customer database and profiles', 'Users', 'sales', '1.0.0', false, true, 60, '{"status": "coming_soon"}'),
  
  -- Vertical Solutions
  ('vehicle-management', 'Vehicle Management', 'Vehicle inventory and dealership operations', 'Car', 'vertical', '1.0.0', false, true, 70, '{"status": "coming_soon"}'),
  ('restaurant-pos', 'Restaurant POS', 'Menu, tables, orders, and kitchen management', 'UtensilsCrossed', 'vertical', '1.0.0', false, true, 71, '{"status": "coming_soon"}'),
  ('education', 'Education', 'Students, classes, and grades', 'GraduationCap', 'vertical', '1.0.0', false, true, 72, '{"status": "coming_soon"}'),
  ('healthcare', 'Healthcare', 'Patients, appointments, and medical records', 'HeartPulse', 'vertical', '1.0.0', false, true, 73, '{"status": "coming_soon"}'),
  ('construction', 'Construction', 'Projects, materials, and crew management', 'HardHat', 'vertical', '1.0.0', false, true, 74, '{"status": "coming_soon"}'),
  ('legal', 'Legal Practice', 'Cases, clients, and billable hours', 'Scale', 'vertical', '1.0.0', false, true, 75, '{"status": "coming_soon"}')
on conflict do nothing;

-- ============ SEED: TENANT MODULE DEFAULTS ============
-- When a tenant is created via create_tenant_workspace, enable core modules automatically
-- This is handled in the PL/pgSQL function, but we seed defaults here for reference
