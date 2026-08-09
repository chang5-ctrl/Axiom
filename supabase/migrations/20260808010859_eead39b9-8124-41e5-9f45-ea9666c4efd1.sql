-- ============================================================
-- Platform (internal staff) identity + RBAC
-- Completely separate from tenant memberships/roles.
-- ============================================================

create type public.platform_employee_status as enum ('invited', 'active', 'suspended');

-- Roles -------------------------------------------------------
create table public.platform_roles (
  key text primary key,
  name text not null,
  description text,
  level integer not null default 0,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_permissions (
  key text primary key,
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.platform_role_permissions (
  role_key text not null references public.platform_roles(key) on delete cascade,
  permission_key text not null references public.platform_permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

-- Employees ---------------------------------------------------
create table public.platform_employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  full_name text,
  department text,
  role_key text not null references public.platform_roles(key),
  status public.platform_employee_status not null default 'invited',
  is_seed boolean not null default false,
  must_change_password boolean not null default false,
  avatar_url text,
  last_login_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index platform_employees_role_idx on public.platform_employees(role_key);
create index platform_employees_status_idx on public.platform_employees(status);

create table public.platform_login_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.platform_employees(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index platform_login_events_employee_idx on public.platform_login_events(employee_id, created_at desc);

-- Grants ------------------------------------------------------
grant select on public.platform_roles to authenticated;
grant all on public.platform_roles to service_role;
grant select on public.platform_permissions to authenticated;
grant all on public.platform_permissions to service_role;
grant select on public.platform_role_permissions to authenticated;
grant all on public.platform_role_permissions to service_role;
grant select on public.platform_employees to authenticated;
grant all on public.platform_employees to service_role;
grant select on public.platform_login_events to authenticated;
grant all on public.platform_login_events to service_role;

-- Helper functions --------------------------------------------
create or replace function public.is_platform_staff(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_employees
    where user_id = _user_id and status = 'active'
  );
$$;

create or replace function public.platform_role_key(_user_id uuid default auth.uid())
returns text language sql stable security definer set search_path = public as $$
  select role_key from public.platform_employees
  where user_id = _user_id and status = 'active' limit 1;
$$;

create or replace function public.has_platform_permission(_permission text, _user_id uuid default auth.uid())
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

-- Existing platform-admin gate now also honours platform staff roles.
create or replace function public.is_platform_admin(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = _user_id)
      or exists (
        select 1 from public.platform_employees
        where user_id = _user_id
          and status = 'active'
          and role_key in ('platform_owner', 'super_admin')
      );
$$;

revoke all on function public.is_platform_staff(uuid) from public, anon;
revoke all on function public.platform_role_key(uuid) from public, anon;
revoke all on function public.has_platform_permission(text, uuid) from public, anon;
grant execute on function public.is_platform_staff(uuid) to authenticated, service_role;
grant execute on function public.platform_role_key(uuid) to authenticated, service_role;
grant execute on function public.has_platform_permission(text, uuid) to authenticated, service_role;

-- RLS ---------------------------------------------------------
alter table public.platform_roles enable row level security;
alter table public.platform_permissions enable row level security;
alter table public.platform_role_permissions enable row level security;
alter table public.platform_employees enable row level security;
alter table public.platform_login_events enable row level security;

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

create trigger set_updated_at_platform_roles before update on public.platform_roles
  for each row execute function public.set_updated_at();
create trigger set_updated_at_platform_employees before update on public.platform_employees
  for each row execute function public.set_updated_at();

-- ============================================================
-- Seed roles, permissions and role mappings
-- ============================================================
insert into public.platform_roles (key, name, description, level) values
  ('platform_owner',     'Platform Owner',        'Full control of the platform, including internal staff administration.', 100),
  ('super_admin',        'Super Administrator',   'Full operational control of the platform excluding staff administration.', 90),
  ('operations_manager', 'Operations Manager',    'Runs day-to-day workspace operations, support and communications.', 70),
  ('finance_admin',      'Finance Administrator', 'Owns revenue, subscriptions and payment verification.', 70),
  ('support_engineer',   'Support Engineer',      'Handles workspace support requests and customer issues.', 50),
  ('developer',          'Developer',             'Infrastructure, feature flags and technical diagnostics.', 50),
  ('security_auditor',   'Security Auditor',      'Read-only access to audit trails, logs and security posture.', 40);

insert into public.platform_permissions (key, module, action, description) values
  ('platform.overview.view',       'overview',      'view',   'View the executive overview'),
  ('platform.brief.view',          'brief',         'view',   'View the founder daily brief'),
  ('platform.revenue.view',        'revenue',       'view',   'View revenue analytics'),
  ('platform.subscriptions.view',  'subscriptions', 'view',   'View subscriptions'),
  ('platform.payments.view',       'payments',      'view',   'View payment submissions'),
  ('platform.payments.review',     'payments',      'review', 'Approve or reject payment submissions'),
  ('platform.tenants.view',        'tenants',       'view',   'View workspaces'),
  ('platform.tenants.manage',      'tenants',       'manage', 'Perform workspace support actions'),
  ('platform.analytics.view',      'analytics',     'view',   'View platform analytics'),
  ('platform.modules.view',        'modules',       'view',   'View module adoption'),
  ('platform.ai.view',             'ai',            'view',   'View AI usage'),
  ('platform.storage.view',        'storage',       'view',   'View storage usage'),
  ('platform.database.view',       'database',      'view',   'View database usage'),
  ('platform.health.view',         'health',        'view',   'View system health'),
  ('platform.logs.view',           'logs',          'view',   'View platform logs'),
  ('platform.audit.view',          'audit',         'view',   'View audit logs'),
  ('platform.notifications.view',  'notifications', 'view',   'View platform notifications'),
  ('platform.announcements.view',  'announcements', 'view',   'View announcements'),
  ('platform.announcements.manage','announcements', 'manage', 'Publish announcements'),
  ('platform.support.view',        'support',       'view',   'View support requests'),
  ('platform.support.manage',      'support',       'manage', 'Update support requests'),
  ('platform.flags.view',          'flags',         'view',   'View feature flags'),
  ('platform.flags.manage',        'flags',         'manage', 'Change feature flags'),
  ('platform.settings.view',       'settings',      'view',   'View platform settings'),
  ('platform.settings.manage',     'settings',      'manage', 'Change platform settings'),
  ('platform.employees.view',      'employees',     'view',   'View internal staff directory'),
  ('platform.employees.manage',    'employees',     'manage', 'Invite, suspend and re-role internal staff'),
  ('platform.security.view',       'security',      'view',   'View security posture');

-- Platform Owner: everything
insert into public.platform_role_permissions (role_key, permission_key)
select 'platform_owner', key from public.platform_permissions;

-- Super Administrator: everything except staff administration
insert into public.platform_role_permissions (role_key, permission_key)
select 'super_admin', key from public.platform_permissions
where key not in ('platform.employees.manage');

insert into public.platform_role_permissions (role_key, permission_key) values
  ('operations_manager', 'platform.overview.view'),
  ('operations_manager', 'platform.brief.view'),
  ('operations_manager', 'platform.tenants.view'),
  ('operations_manager', 'platform.tenants.manage'),
  ('operations_manager', 'platform.support.view'),
  ('operations_manager', 'platform.support.manage'),
  ('operations_manager', 'platform.notifications.view'),
  ('operations_manager', 'platform.announcements.view'),
  ('operations_manager', 'platform.announcements.manage'),
  ('operations_manager', 'platform.modules.view'),
  ('operations_manager', 'platform.analytics.view'),
  ('operations_manager', 'platform.health.view'),

  ('finance_admin', 'platform.overview.view'),
  ('finance_admin', 'platform.brief.view'),
  ('finance_admin', 'platform.revenue.view'),
  ('finance_admin', 'platform.subscriptions.view'),
  ('finance_admin', 'platform.payments.view'),
  ('finance_admin', 'platform.payments.review'),
  ('finance_admin', 'platform.tenants.view'),
  ('finance_admin', 'platform.analytics.view'),
  ('finance_admin', 'platform.audit.view'),

  ('support_engineer', 'platform.overview.view'),
  ('support_engineer', 'platform.support.view'),
  ('support_engineer', 'platform.support.manage'),
  ('support_engineer', 'platform.tenants.view'),
  ('support_engineer', 'platform.notifications.view'),
  ('support_engineer', 'platform.health.view'),

  ('developer', 'platform.overview.view'),
  ('developer', 'platform.health.view'),
  ('developer', 'platform.database.view'),
  ('developer', 'platform.storage.view'),
  ('developer', 'platform.logs.view'),
  ('developer', 'platform.ai.view'),
  ('developer', 'platform.modules.view'),
  ('developer', 'platform.analytics.view'),
  ('developer', 'platform.flags.view'),
  ('developer', 'platform.flags.manage'),

  ('security_auditor', 'platform.overview.view'),
  ('security_auditor', 'platform.audit.view'),
  ('security_auditor', 'platform.logs.view'),
  ('security_auditor', 'platform.security.view'),
  ('security_auditor', 'platform.health.view'),
  ('security_auditor', 'platform.employees.view');

-- ============================================================
-- Development-only seed staff records (auth users are created
-- separately by the development seeding endpoint).
-- ============================================================
insert into public.platform_employees (email, full_name, department, role_key, status, is_seed, must_change_password) values
  ('owner@rocdwels.local',      'Rocdwels Owner',        'Executive',   'platform_owner',     'invited', true, true),
  ('superadmin@rocdwels.local', 'Rocdwels Super Admin',  'Platform',    'super_admin',        'invited', true, true),
  ('operations@rocdwels.local', 'Rocdwels Operations',   'Operations',  'operations_manager', 'invited', true, true),
  ('finance@rocdwels.local',    'Rocdwels Finance',      'Finance',     'finance_admin',      'invited', true, true),
  ('support@rocdwels.local',    'Rocdwels Support',      'Support',     'support_engineer',   'invited', true, true),
  ('developer@rocdwels.local',  'Rocdwels Developer',    'Engineering', 'developer',          'invited', true, true),
  ('auditor@rocdwels.local',    'Rocdwels Auditor',      'Security',    'security_auditor',   'invited', true, true);
