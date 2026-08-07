-- Payment review workflow fields
alter table public.payments
  add column if not exists plan_id uuid references public.plans(id),
  add column if not exists receipt_url text,
  add column if not exists review_notes text;

-- ---------------------------------------------------------------- feature flags
create table if not exists public.platform_feature_flags (
  key text primary key,
  label text not null,
  description text,
  is_enabled boolean not null default false,
  rollout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_feature_flags to authenticated;
grant all on public.platform_feature_flags to service_role;

alter table public.platform_feature_flags enable row level security;

create policy "feature flags read" on public.platform_feature_flags
  for select to authenticated using (true);

create policy "feature flags admin write" on public.platform_feature_flags
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create trigger set_updated_at_platform_feature_flags
before update on public.platform_feature_flags
for each row execute function public.set_updated_at();

create table if not exists public.tenant_feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  flag_key text not null references public.platform_feature_flags(key) on delete cascade,
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, flag_key)
);

grant select on public.tenant_feature_flags to authenticated;
grant all on public.tenant_feature_flags to service_role;

alter table public.tenant_feature_flags enable row level security;

create policy "tenant feature flags read" on public.tenant_feature_flags
  for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());

create policy "tenant feature flags admin write" on public.tenant_feature_flags
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create trigger set_updated_at_tenant_feature_flags
before update on public.tenant_feature_flags
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- announcements
create table if not exists public.platform_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all',
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_announcements to authenticated;
grant all on public.platform_announcements to service_role;

alter table public.platform_announcements enable row level security;

create policy "announcements read" on public.platform_announcements
  for select to authenticated
  using (published_at is not null or public.is_platform_admin());

create policy "announcements admin write" on public.platform_announcements
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create trigger set_updated_at_platform_announcements
before update on public.platform_announcements
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- support inbox
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  subject text not null,
  body text,
  status text not null default 'open',
  priority text not null default 'normal',
  created_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert on public.support_requests to authenticated;
grant all on public.support_requests to service_role;

alter table public.support_requests enable row level security;

create policy "support requests read" on public.support_requests
  for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());

create policy "support requests member insert" on public.support_requests
  for insert to authenticated
  with check (created_by = auth.uid() and public.is_tenant_member(tenant_id));

create policy "support requests admin write" on public.support_requests
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create trigger set_updated_at_support_requests
before update on public.support_requests
for each row execute function public.set_updated_at();

create index if not exists support_requests_status_idx on public.support_requests(status, created_at desc);
create index if not exists payments_status_idx on public.payments(status, created_at desc);
create index if not exists tenants_created_at_idx on public.tenants(created_at desc);