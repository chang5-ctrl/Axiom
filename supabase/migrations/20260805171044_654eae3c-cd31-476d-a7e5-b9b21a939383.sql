-- ============ ENUMS ============
create type public.tenant_status as enum ('active','suspended','trial','cancelled');
create type public.membership_status as enum ('active','invited','suspended');
create type public.subscription_status as enum ('trialing','active','past_due','cancelled','expired');
create type public.payment_status as enum ('pending','approved','rejected','expired');

-- ============ UTIL ============
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ============ TENANTS ============
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.tenant_status not null default 'trial',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.tenants to authenticated;
grant all on public.tenants to service_role;
alter table public.tenants enable row level security;

-- ============ ROLES / PERMISSIONS ============
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  level int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index roles_scope_key_idx on public.roles (coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), key);
grant select, insert, update, delete on public.roles to authenticated;
grant all on public.roles to service_role;
alter table public.roles enable row level security;

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null default 'core',
  action text not null,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.permissions to authenticated;
grant all on public.permissions to service_role;
alter table public.permissions enable row level security;

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
grant select, insert, delete on public.role_permissions to authenticated;
grant all on public.role_permissions to service_role;
alter table public.role_permissions enable row level security;

-- ============ MEMBERSHIPS ============
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  role_key text not null default 'owner',
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
grant select, insert, update, delete on public.memberships to authenticated;
grant all on public.memberships to service_role;
alter table public.memberships enable row level security;

-- ============ PLATFORM ADMINS ============
create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select on public.platform_admins to authenticated;
grant all on public.platform_admins to service_role;
alter table public.platform_admins enable row level security;

-- ============ SECURITY DEFINER HELPERS ============
create or replace function public.is_platform_admin(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = _user_id);
$$;

create or replace function public.is_tenant_member(_tenant_id uuid, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = _tenant_id and user_id = _user_id and status = 'active'
  );
$$;

create or replace function public.has_tenant_role(_tenant_id uuid, _roles text[], _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = _tenant_id and user_id = _user_id
      and status = 'active' and role_key = any(_roles)
  );
$$;

create or replace function public.has_permission(_tenant_id uuid, _permission text, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    join public.permissions p on p.id = rp.permission_id
    where m.tenant_id = _tenant_id and m.user_id = _user_id
      and m.status = 'active' and p.key = _permission
  );
$$;

create or replace function public.my_tenant_ids(_user_id uuid default auth.uid())
returns setof uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.memberships where user_id = _user_id and status = 'active';
$$;

-- ============ BUSINESS PROFILES ============
create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  legal_name text,
  description text,
  industry text,
  employee_count text,
  website text,
  phone text,
  email text,
  address text,
  country text,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  logo_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.business_profiles to authenticated;
grant all on public.business_profiles to service_role;
alter table public.business_profiles enable row level security;

-- ============ PLANS / SUBSCRIPTIONS / PAYMENTS ============
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  price_monthly numeric(12,2) not null default 0,
  price_yearly numeric(12,2) not null default 0,
  currency text not null default 'USD',
  max_users int,
  max_modules int,
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.plans to authenticated, anon;
grant all on public.plans to service_role;
alter table public.plans enable row level security;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status public.subscription_status not null default 'trialing',
  billing_cycle text not null default 'monthly',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_tenant_idx on public.subscriptions(tenant_id);
grant select, insert, update on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  method text,
  reference text,
  notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_tenant_idx on public.payments(tenant_id);
grant select, insert, update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;

-- ============ MODULES ============
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  icon text,
  category text,
  is_active boolean not null default false,
  is_core boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.modules to authenticated;
grant all on public.modules to service_role;
alter table public.modules enable row level security;

create table public.tenant_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_key text not null references public.modules(key) on delete cascade,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_key)
);
grant select, insert, update, delete on public.tenant_modules to authenticated;
grant all on public.tenant_modules to service_role;
alter table public.tenant_modules enable row level security;

-- ============ SETTINGS ============
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  scope text not null default 'tenant',
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index settings_scope_idx on public.settings (coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), key);
grant select, insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;

-- ============ AUDIT LOGS ============
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index audit_logs_tenant_idx on public.audit_logs(tenant_id, created_at desc);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;

-- ============ POLICIES ============
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_platform_admin());
create policy "own profile write" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "tenants read" on public.tenants for select to authenticated using (public.is_tenant_member(id) or public.is_platform_admin());
create policy "tenants insert" on public.tenants for insert to authenticated with check (owner_id = auth.uid());
create policy "tenants update" on public.tenants for update to authenticated using (public.has_tenant_role(id, array['owner','admin']) or public.is_platform_admin());

create policy "roles read" on public.roles for select to authenticated using (tenant_id is null or public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "roles manage" on public.roles for all to authenticated using (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin'])) with check (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "permissions read" on public.permissions for select to authenticated using (true);

create policy "role_permissions read" on public.role_permissions for select to authenticated using (
  exists (select 1 from public.roles r where r.id = role_id and (r.tenant_id is null or public.is_tenant_member(r.tenant_id)))
);
create policy "role_permissions manage" on public.role_permissions for all to authenticated using (
  exists (select 1 from public.roles r where r.id = role_id and r.tenant_id is not null and public.has_tenant_role(r.tenant_id, array['owner','admin']))
) with check (
  exists (select 1 from public.roles r where r.id = role_id and r.tenant_id is not null and public.has_tenant_role(r.tenant_id, array['owner','admin']))
);

create policy "memberships read" on public.memberships for select to authenticated using (user_id = auth.uid() or public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "memberships manage" on public.memberships for all to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "platform admins read" on public.platform_admins for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());

create policy "business profiles read" on public.business_profiles for select to authenticated using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "business profiles insert" on public.business_profiles for insert to authenticated with check (public.has_tenant_role(tenant_id, array['owner','admin']));
create policy "business profiles update" on public.business_profiles for update to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "plans read" on public.plans for select using (is_active or public.is_platform_admin());

create policy "subscriptions read" on public.subscriptions for select to authenticated using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "subscriptions manage" on public.subscriptions for all to authenticated using (public.has_tenant_role(tenant_id, array['owner']) or public.is_platform_admin()) with check (public.has_tenant_role(tenant_id, array['owner']) or public.is_platform_admin());

create policy "payments read" on public.payments for select to authenticated using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "payments manage" on public.payments for all to authenticated using (public.has_tenant_role(tenant_id, array['owner']) or public.is_platform_admin()) with check (public.has_tenant_role(tenant_id, array['owner']) or public.is_platform_admin());

create policy "modules read" on public.modules for select to authenticated using (true);

create policy "tenant modules read" on public.tenant_modules for select to authenticated using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "tenant modules manage" on public.tenant_modules for all to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "settings read" on public.settings for select to authenticated using (tenant_id is null or public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "settings manage" on public.settings for all to authenticated using (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin'])) with check (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "audit logs read" on public.audit_logs for select to authenticated using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy "audit logs insert" on public.audit_logs for insert to authenticated with check (actor_id = auth.uid() and (tenant_id is null or public.is_tenant_member(tenant_id)));

-- ============ UPDATED_AT TRIGGERS ============
do $$
declare t text;
begin
  foreach t in array array['profiles','tenants','roles','memberships','business_profiles','plans','subscriptions','payments','modules','tenant_modules','settings']
  loop
    execute format('create trigger set_updated_at_%1$s before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ============ SEED: PERMISSIONS ============
insert into public.permissions (key, module, action, description) values
  ('core.tenant.view','core','view','View workspace details'),
  ('core.tenant.manage','core','manage','Update workspace settings'),
  ('core.members.view','core','view','View members'),
  ('core.members.manage','core','manage','Invite and manage members'),
  ('core.roles.view','core','view','View roles'),
  ('core.roles.manage','core','manage','Create and edit roles'),
  ('core.billing.view','core','view','View billing and subscription'),
  ('core.billing.manage','core','manage','Manage subscription and payments'),
  ('core.settings.view','core','view','View settings'),
  ('core.settings.manage','core','manage','Manage settings'),
  ('core.audit.view','core','view','View audit logs'),
  ('core.modules.view','core','view','View modules'),
  ('core.modules.manage','core','manage','Enable and configure modules');

-- ============ SEED: SYSTEM ROLE TEMPLATES ============
insert into public.roles (tenant_id, key, name, description, is_system, level) values
  (null,'owner','Owner','Full control of the workspace including billing',true,0),
  (null,'admin','Admin','Manages the workspace, members and modules',true,10),
  (null,'manager','Manager','Oversees operations and team output',true,20),
  (null,'sales','Sales','Works with customers, quotes and orders',true,30),
  (null,'accountant','Accountant','Handles finance, invoicing and reporting',true,30),
  (null,'hr','HR','Manages people, hiring and payroll data',true,30);

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.tenant_id is null and r.key = 'owner'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key <> 'core.billing.manage'
where r.tenant_id is null and r.key = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.action = 'view'
where r.tenant_id is null and r.key in ('manager','sales','accountant','hr')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key in ('core.billing.view','core.billing.manage')
where r.tenant_id is null and r.key = 'accountant'
on conflict do nothing;

-- ============ SEED: PLANS ============
insert into public.plans (key, name, description, price_monthly, price_yearly, max_users, max_modules, features, sort_order) values
  ('starter','Starter','For small teams getting organised',29,290,5,3,'["Up to 5 users","3 modules","Email support","Audit log (30 days)"]'::jsonb,1),
  ('growth','Growth','For growing businesses that need more depth',79,790,20,8,'["Up to 20 users","8 modules","Priority support","Custom roles","Audit log (1 year)"]'::jsonb,2),
  ('business','Business','For established multi-team operations',199,1990,100,null,'["Up to 100 users","Unlimited modules","Advanced permissions","API access","Dedicated onboarding"]'::jsonb,3),
  ('enterprise','Enterprise','Tailored deployments with dedicated support',0,0,null,null,'["Unlimited users","Unlimited modules","SSO & MFA","Custom SLA","Dedicated success manager"]'::jsonb,4);

-- ============ SEED: MODULE REGISTRY ============
insert into public.modules (key, name, description, icon, category, is_active, is_core, sort_order) values
  ('dashboard','Dashboard','Workspace overview and KPIs','LayoutDashboard','core',true,true,0),
  ('inventory','Inventory','Stock, warehouses and movements','Package','operations',false,false,10),
  ('crm','CRM','Leads, contacts and pipeline','Users','sales',false,false,20),
  ('accounting','Accounting','Ledger, invoicing and reporting','Calculator','finance',false,false,30),
  ('payroll','Payroll','Salaries, benefits and payslips','Wallet','people',false,false,40),
  ('projects','Projects','Tasks, milestones and time tracking','KanbanSquare','operations',false,false,50),
  ('dealership','Vehicle Dealership','Vehicles, test drives and deals','Car','vertical',false,false,60),
  ('hospital','Hospital','Patients, appointments and wards','HeartPulse','vertical',false,false,70),
  ('restaurant','Restaurant','Menus, tables and orders','UtensilsCrossed','vertical',false,false,80),
  ('construction','Construction','Sites, materials and progress','HardHat','vertical',false,false,90),
  ('lawfirm','Law Firm','Matters, clients and billable hours','Scale','vertical',false,false,100),
  ('school','School','Students, classes and grades','GraduationCap','vertical',false,false,110);
