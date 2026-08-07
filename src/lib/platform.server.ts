/**
 * Platform control-centre data layer (server only).
 *
 * Everything here runs with the service role because platform analytics are
 * cross-tenant by definition and tenant RLS deliberately hides other
 * workspaces. Every entry point is therefore guarded by `assertPlatformAdmin`,
 * which re-verifies the caller against `platform_admins` using their own
 * (RLS-bound) client before any privileged read happens.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import type {
  AiUsagePeriod,
  BusinessHealthBand,
  DatabaseUsage,
  FeatureFlag,
  FounderBrief,
  HealthProbe,
  IndustryMix,
  MetricPoint,
  ModuleAdoption,
  PaymentDecision,
  PlatformAnnouncement,
  PlatformAuditRow,
  PlatformNotification,
  PlatformPaymentRow,
  PlatformSnapshot,
  PlatformSubscriptionRow,
  PlatformTenantDetail,
  PlatformTenantRow,
  StorageBucketUsage,
  SupportRequestRow,
  TimeSeriesPoint,
} from "@/types/platform";

type UserClient = SupabaseClient<Database>;

/**
 * Analytics reads are bounded so a large platform can never pull an unbounded
 * result set into a worker. Beyond this point aggregates move to SQL views.
 */
const MAX_ANALYTICS_ROWS = 5000;

const DAY_MS = 86_400_000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

function dayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function monthKey(value: string): string {
  return new Date(value).toISOString().slice(0, 7);
}

function emptySeries(days: number): TimeSeriesPoint[] {
  return Array.from({ length: days }, (_, index) => ({
    date: dayKey(daysAgo(days - 1 - index)),
    value: 0,
  }));
}

function seriesFrom(dates: string[], days: number): TimeSeriesPoint[] {
  const buckets = new Map(emptySeries(days).map((point) => [point.date, 0]));
  for (const date of dates) {
    const key = dayKey(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, value]) => ({ date, value }));
}

function tally<T>(rows: T[], pick: (row: T) => string | null | undefined): MetricPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Verifies the caller is a platform administrator using their own RLS client. */
export async function assertPlatformAdmin(supabase: UserClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to verify platform access");
  if (!data) throw new Error("Forbidden: platform administrators only");
}

export async function isPlatformAdmin(supabase: UserClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

/** Records an immutable audit entry for an administrative action. */
export async function recordPlatformAudit(input: {
  actorId: string;
  action: string;
  tenantId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: JsonRecord | undefined;
}): Promise<void> {
  await supabaseAdmin.from("audit_logs").insert({
    tenant_id: input.tenantId ?? null,
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: (input.metadata ?? {}) as never,
  });
}

/* ------------------------------------------------------------------ snapshot */

export async function loadPlatformSnapshot(): Promise<PlatformSnapshot> {
  const probeStart = Date.now();

  const [
    tenantsRes,
    membershipsRes,
    subscriptionsRes,
    plansRes,
    paymentsRes,
    businessRes,
    tenantModulesRes,
    modulesRes,
    auditRes,
    supportRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("tenants")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin
      .from("memberships")
      .select("user_id, tenant_id, status, created_at")
      .limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin
      .from("subscriptions")
      .select("id, tenant_id, plan_id, status, billing_cycle, created_at, current_period_end")
      .limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin.from("plans").select("id, key, name, price_monthly, price_yearly, currency"),
    supabaseAdmin
      .from("payments")
      .select("id, tenant_id, amount, currency, status, created_at, plan_id")
      .limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin.from("business_profiles").select("tenant_id, industry").limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin.from("tenant_modules").select("tenant_id, module_key, enabled").limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin.from("modules").select("key, name, category"),
    supabaseAdmin
      .from("audit_logs")
      .select("tenant_id, actor_id, created_at, action")
      .gte("created_at", daysAgo(30).toISOString())
      .limit(MAX_ANALYTICS_ROWS),
    supabaseAdmin.from("support_requests").select("id, status").eq("status", "open"),
  ]);

  const databaseLatencyMs = Date.now() - probeStart;

  const tenants = tenantsRes.data ?? [];
  const memberships = membershipsRes.data ?? [];
  const subscriptions = subscriptionsRes.data ?? [];
  const plans = plansRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const businesses = businessRes.data ?? [];
  const tenantModules = tenantModulesRes.data ?? [];
  const modules = modulesRes.data ?? [];
  const audit = auditRes.data ?? [];

  const currency = plans[0]?.currency ?? "USD";
  const planById = new Map(plans.map((plan) => [plan.id, plan]));
  const industryByTenant = new Map(businesses.map((row) => [row.tenant_id, row.industry]));

  const yesterday = dayKey(daysAgo(1));
  const since7 = daysAgo(7).getTime();
  const since30 = daysAgo(30).getTime();

  /* tenants ------------------------------------------------------------- */
  const premiumPlanKeys = new Set(
    plans.filter((plan) => Number(plan.price_monthly) > 0).map((plan) => plan.id),
  );
  const activeSubscriptionByTenant = new Map(
    subscriptions
      .filter((row) => row.status === "active" || row.status === "trialing")
      .map((row) => [row.tenant_id, row]),
  );

  const tenantMetrics = {
    total: tenants.length,
    active: tenants.filter((row) => row.status === "active").length,
    trialing: tenants.filter((row) => row.status === "trial").length,
    suspended: tenants.filter((row) => row.status === "suspended").length,
    premium: [...activeSubscriptionByTenant.values()].filter(
      (row) => row.status === "active" && row.plan_id && premiumPlanKeys.has(row.plan_id),
    ).length,
    newLast7Days: tenants.filter((row) => new Date(row.created_at).getTime() >= since7).length,
    newLast30Days: tenants.filter((row) => new Date(row.created_at).getTime() >= since30).length,
    newYesterday: tenants.filter((row) => dayKey(row.created_at) === yesterday).length,
  };

  /* users --------------------------------------------------------------- */
  const uniqueUsers = new Set(memberships.map((row) => row.user_id));
  const actorsByDay = new Map<string, Set<string>>();
  for (const row of audit) {
    if (!row.actor_id) continue;
    const key = dayKey(row.created_at);
    if (!actorsByDay.has(key)) actorsByDay.set(key, new Set());
    actorsByDay.get(key)?.add(row.actor_id);
  }
  const dailyActiveSeries = emptySeries(30).map((point) => ({
    date: point.date,
    value: actorsByDay.get(point.date)?.size ?? 0,
  }));
  const monthlyActive = new Set(audit.map((row) => row.actor_id).filter(Boolean)).size;
  const monthlyActiveSeries = dailyActiveSeries.map((point, index) => ({
    date: point.date,
    value: new Set(
      audit
        .filter((row) => {
          const age = new Date(point.date).getTime() - new Date(row.created_at).getTime();
          return age >= 0 && age <= 30 * DAY_MS;
        })
        .map((row) => row.actor_id)
        .filter(Boolean),
    ).size || (index === dailyActiveSeries.length - 1 ? monthlyActive : 0),
  }));

  const userMetrics = {
    total: uniqueUsers.size,
    dailyActive: dailyActiveSeries.at(-1)?.value ?? 0,
    monthlyActive,
    newLast30Days: memberships.filter((row) => new Date(row.created_at).getTime() >= since30).length,
    dailyActiveSeries,
    monthlyActiveSeries,
  };

  /* revenue ------------------------------------------------------------- */
  const approved = payments.filter((row) => row.status === "approved");
  const pending = payments.filter((row) => row.status === "pending");
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

  const sum = (rows: typeof approved) => rows.reduce((total, row) => total + Number(row.amount ?? 0), 0);

  const monthlyValueOf = (planId: string | null, cycle: string): number => {
    const plan = planId ? planById.get(planId) : undefined;
    if (!plan) return 0;
    return cycle === "yearly" ? Number(plan.price_yearly) / 12 : Number(plan.price_monthly);
  };

  const activeSubs = subscriptions.filter((row) => row.status === "active");
  const mrr = activeSubs.reduce(
    (total, row) => total + monthlyValueOf(row.plan_id, row.billing_cycle),
    0,
  );

  const revenueByMonth = new Map<string, number>();
  for (const payment of approved) {
    const key = monthKey(payment.created_at);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(payment.amount ?? 0));
  }

  const revenueByPlan = new Map<string, number>();
  for (const payment of approved) {
    const plan = payment.plan_id ? planById.get(payment.plan_id) : undefined;
    const label = plan?.name ?? "Unassigned";
    revenueByPlan.set(label, (revenueByPlan.get(label) ?? 0) + Number(payment.amount ?? 0));
  }

  const revenueByIndustry = new Map<string, number>();
  for (const payment of approved) {
    const label = industryByTenant.get(payment.tenant_id) ?? "Unspecified";
    revenueByIndustry.set(label, (revenueByIndustry.get(label) ?? 0) + Number(payment.amount ?? 0));
  }

  const revenue = {
    currency,
    mrr,
    arr: mrr * 12,
    monthToDate: sum(approved.filter((row) => new Date(row.created_at) >= monthStart)),
    last30Days: sum(approved.filter((row) => new Date(row.created_at).getTime() >= since30)),
    yearToDate: sum(approved.filter((row) => new Date(row.created_at) >= yearStart)),
    lifetime: sum(approved),
    pendingAmount: sum(pending),
    pendingCount: pending.length,
    collectedYesterday: sum(approved.filter((row) => dayKey(row.created_at) === yesterday)),
    monthlySubscribers: activeSubs.filter((row) => row.billing_cycle !== "yearly").length,
    annualSubscribers: activeSubs.filter((row) => row.billing_cycle === "yearly").length,
    byMonth: [...revenueByMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, value]) => ({ date, value })),
    byPlan: [...revenueByPlan.entries()].map(([label, value]) => ({ label, value })),
    byIndustry: [...revenueByIndustry.entries()].map(([label, value]) => ({ label, value })),
  };

  /* subscriptions -------------------------------------------------------- */
  const byPlan = new Map<string, { tenants: number; monthlyValue: number }>();
  for (const row of subscriptions) {
    const plan = row.plan_id ? planById.get(row.plan_id) : undefined;
    const label = plan?.name ?? "Unassigned";
    const current = byPlan.get(label) ?? { tenants: 0, monthlyValue: 0 };
    current.tenants += 1;
    if (row.status === "active") {
      current.monthlyValue += monthlyValueOf(row.plan_id, row.billing_cycle);
    }
    byPlan.set(label, current);
  }

  const subscriptionMetrics = {
    total: subscriptions.length,
    byStatus: tally(subscriptions, (row) => row.status),
    byPlan: [...byPlan.entries()].map(([plan, value]) => ({ plan, ...value })),
    upgradesYesterday: subscriptions.filter(
      (row) => dayKey(row.created_at) === yesterday && row.status === "active",
    ).length,
  };

  /* modules -------------------------------------------------------------- */
  const moduleMeta = new Map(modules.map((row) => [row.key, row]));
  const activations = new Map<string, number>();
  for (const row of tenantModules) {
    if (!row.enabled) continue;
    activations.set(row.module_key, (activations.get(row.module_key) ?? 0) + 1);
  }
  const moduleAdoption: ModuleAdoption[] = modules
    .map((module) => {
      const count = activations.get(module.key) ?? 0;
      return {
        key: module.key,
        name: module.name,
        category: moduleMeta.get(module.key)?.category ?? "general",
        activations: count,
        adoptionRate: tenantMetrics.total ? (count / tenantMetrics.total) * 100 : 0,
      };
    })
    .sort((a, b) => b.activations - a.activations);

  /* industries ------------------------------------------------------------ */
  const industryCounts = tally(businesses, (row) => row.industry);
  const industries: IndustryMix[] = industryCounts.map((entry) => ({
    industry: entry.label,
    tenants: entry.value,
    share: tenantMetrics.total ? (entry.value / tenantMetrics.total) * 100 : 0,
  }));

  /* business health -------------------------------------------------------- */
  const lastActivityByTenant = new Map<string, number>();
  for (const row of audit) {
    if (!row.tenant_id) continue;
    const stamp = new Date(row.created_at).getTime();
    if (stamp > (lastActivityByTenant.get(row.tenant_id) ?? 0)) {
      lastActivityByTenant.set(row.tenant_id, stamp);
    }
  }
  const bandCounts = { healthy: 0, watch: 0, "at-risk": 0, dormant: 0 };
  for (const tenant of tenants) {
    const last = lastActivityByTenant.get(tenant.id) ?? new Date(tenant.created_at).getTime();
    const idleDays = Math.floor((Date.now() - last) / DAY_MS);
    if (idleDays <= 7) bandCounts.healthy += 1;
    else if (idleDays <= 14) bandCounts.watch += 1;
    else if (idleDays <= 30) bandCounts["at-risk"] += 1;
    else bandCounts.dormant += 1;
  }
  const healthBands: BusinessHealthBand[] = [
    { band: "healthy", label: "Healthy", tenants: bandCounts.healthy, description: "Active within 7 days" },
    { band: "watch", label: "Watch", tenants: bandCounts.watch, description: "Last active 8–14 days ago" },
    { band: "at-risk", label: "At risk", tenants: bandCounts["at-risk"], description: "Last active 15–30 days ago" },
    { band: "dormant", label: "Dormant", tenants: bandCounts.dormant, description: "No activity for over 30 days" },
  ];

  /* health ---------------------------------------------------------------- */
  const health = {
    databaseLatencyMs,
    apiLatencyMs: databaseLatencyMs,
    errorRate: null,
    uptimePercent: null,
    checkedAt: new Date().toISOString(),
  };

  const probes: HealthProbe[] = [
    {
      id: "database",
      label: "Database",
      status: databaseLatencyMs < 1500 ? "operational" : "degraded",
      latencyMs: databaseLatencyMs,
      detail: "Measured on the last analytics read",
    },
    {
      id: "api",
      label: "Data API",
      status: tenantsRes.error ? "down" : "operational",
      latencyMs: databaseLatencyMs,
      detail: tenantsRes.error?.message ?? "Serving platform queries",
    },
    {
      id: "auth",
      label: "Authentication",
      status: "operational",
      latencyMs: null,
      detail: "Sessions issued and verified on every request",
    },
    {
      id: "storage",
      label: "Storage",
      status: "unmonitored",
      latencyMs: null,
      detail: "No buckets provisioned yet",
    },
    {
      id: "workers",
      label: "Background workers",
      status: "unmonitored",
      latencyMs: null,
      detail: "No worker runtime connected",
    },
    {
      id: "queues",
      label: "Queues",
      status: "unmonitored",
      latencyMs: null,
      detail: "No queue backend connected",
    },
  ];

  /* founder brief ---------------------------------------------------------- */
  const brief = buildFounderBrief({
    newTenants: tenantMetrics.newYesterday,
    upgrades: subscriptionMetrics.upgradesYesterday,
    revenueYesterday: revenue.collectedYesterday,
    currency,
    uptimePercent: health.uptimePercent,
    industries,
    modules: moduleAdoption,
    dormant: bandCounts["at-risk"] + bandCounts.dormant,
    pendingCount: revenue.pendingCount,
    pendingAmount: revenue.pendingAmount,
  });

  return {
    generatedAt: new Date().toISOString(),
    currency,
    tenants: tenantMetrics,
    users: userMetrics,
    revenue,
    subscriptions: subscriptionMetrics,
    modules: moduleAdoption,
    industries,
    health,
    probes,
    healthBands,
    signups: seriesFrom(
      tenants.map((row) => row.created_at),
      30,
    ),
    activity: seriesFrom(
      audit.map((row) => row.created_at),
      30,
    ),
    brief,
    pendingPayments: revenue.pendingCount,
    openSupportRequests: supportRes.data?.length ?? 0,
  };
}

function buildFounderBrief(input: {
  newTenants: number;
  upgrades: number;
  revenueYesterday: number;
  currency: string;
  uptimePercent: number | null;
  industries: IndustryMix[];
  modules: ModuleAdoption[];
  dormant: number;
  pendingCount: number;
  pendingAmount: number;
}): FounderBrief {
  const hour = new Date().getUTCHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency,
    maximumFractionDigits: 0,
  });

  const headlines: FounderBrief["headlines"] = [
    {
      label: "New businesses",
      value: `${input.newTenants >= 0 ? "+" : ""}${input.newTenants}`,
      tone: input.newTenants > 0 ? "positive" : "neutral",
    },
    {
      label: "Plan activations",
      value: `${input.upgrades >= 0 ? "+" : ""}${input.upgrades}`,
      tone: input.upgrades > 0 ? "positive" : "neutral",
    },
    {
      label: "Revenue collected",
      value: money.format(input.revenueYesterday),
      tone: input.revenueYesterday > 0 ? "positive" : "neutral",
    },
    {
      label: "Payments awaiting review",
      value: `${input.pendingCount}`,
      tone: input.pendingCount > 0 ? "warning" : "neutral",
    },
  ];

  const narrative: string[] = [];
  narrative.push(
    input.newTenants > 0
      ? `${input.newTenants} business${input.newTenants === 1 ? "" : "es"} joined the platform yesterday.`
      : "No new businesses joined yesterday.",
  );
  if (input.revenueYesterday > 0) {
    narrative.push(`${money.format(input.revenueYesterday)} in payments was approved yesterday.`);
  }
  if (input.pendingCount > 0) {
    narrative.push(
      `${money.format(input.pendingAmount)} across ${input.pendingCount} submission${input.pendingCount === 1 ? "" : "s"} is waiting on your review.`,
    );
  }

  const recommendations: string[] = [];
  const topIndustry = input.industries[0];
  if (topIndustry) {
    recommendations.push(
      `${topIndustry.industry} is your largest segment at ${topIndustry.share.toFixed(0)}% of workspaces.`,
    );
  }
  const topModule = input.modules.find((module) => module.activations > 0);
  if (topModule) {
    recommendations.push(
      `${topModule.name} is the most activated module (${topModule.activations} workspaces).`,
    );
  }
  if (input.dormant > 0) {
    recommendations.push(
      `${input.dormant} workspace${input.dormant === 1 ? " has" : "s have"} been inactive for more than 14 days — worth a re-engagement touch.`,
    );
  }
  if (input.pendingCount > 0) {
    recommendations.push("Clear pending payments to activate subscriptions without delay.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Nothing needs your attention right now.");
  }

  return {
    forDate: dayKey(daysAgo(1)),
    greeting,
    headlines,
    narrative,
    recommendations,
  };
}

/* ------------------------------------------------------------------ tenants */

export async function listPlatformTenants(filters: {
  search?: string | undefined;
  status?: string | undefined;
  industry?: string | undefined;
  plan?: string | undefined;
  limit?: number | undefined;
}): Promise<PlatformTenantRow[]> {
  const limit = Math.min(filters.limit ?? 200, 500);

  let query = supabaseAdmin
    .from("tenants")
    .select("id, name, slug, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status as never);
  if (filters.search) {
    // Escaped to a safe token set before it reaches PostgREST filter grammar.
    const term = filters.search.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (term) query = query.ilike("name", `%${term}%`);
  }

  const { data: tenants, error } = await query;
  if (error) throw new Error(error.message);
  const rows = tenants ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const [businesses, memberships, subscriptions, plans] = await Promise.all([
    supabaseAdmin.from("business_profiles").select("tenant_id, industry").in("tenant_id", ids),
    supabaseAdmin.from("memberships").select("tenant_id, status").in("tenant_id", ids),
    supabaseAdmin
      .from("subscriptions")
      .select("tenant_id, plan_id, status, current_period_end, created_at")
      .in("tenant_id", ids)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("plans").select("id, key, name"),
  ]);

  const planById = new Map((plans.data ?? []).map((plan) => [plan.id, plan]));
  const industryBy = new Map((businesses.data ?? []).map((row) => [row.tenant_id, row.industry]));
  const memberCount = new Map<string, number>();
  for (const row of memberships.data ?? []) {
    if (row.status !== "active") continue;
    memberCount.set(row.tenant_id, (memberCount.get(row.tenant_id) ?? 0) + 1);
  }
  type SubscriptionRow = NonNullable<typeof subscriptions.data>[number];
  const subBy = new Map<string, SubscriptionRow>();
  for (const row of subscriptions.data ?? []) {
    if (!subBy.has(row.tenant_id)) subBy.set(row.tenant_id, row);
  }

  const mapped: PlatformTenantRow[] = rows.map((row) => {
    const subscription = subBy.get(row.id);
    const plan = subscription?.plan_id ? planById.get(subscription.plan_id) : undefined;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      industry: industryBy.get(row.id) ?? null,
      members: memberCount.get(row.id) ?? 0,
      planName: plan?.name ?? null,
      planKey: plan?.key ?? null,
      subscriptionStatus: subscription?.status ?? null,
      trialEndsAt: subscription?.status === "trialing" ? subscription.current_period_end : null,
      createdAt: row.created_at,
    };
  });

  return mapped.filter((row) => {
    if (filters.industry && filters.industry !== "all" && row.industry !== filters.industry) return false;
    if (filters.plan && filters.plan !== "all" && row.planKey !== filters.plan) return false;
    return true;
  });
}

export async function loadTenantDetail(tenantId: string): Promise<PlatformTenantDetail | null> {
  const [tenant] = await listTenantsByIds([tenantId]);
  if (!tenant) return null;

  const [modulesRes, paymentsRes, auditRes] = await Promise.all([
    supabaseAdmin.from("tenant_modules").select("module_key, enabled").eq("tenant_id", tenantId),
    listPlatformPayments({ tenantId, limit: 20 }),
    listPlatformAuditLogs({ tenantId, limit: 20 }),
  ]);

  return {
    tenant,
    modules: (modulesRes.data ?? []).map((row) => ({ key: row.module_key, enabled: row.enabled })),
    payments: paymentsRes,
    audit: auditRes,
    lastActivityAt: auditRes[0]?.createdAt ?? null,
    customerDataVisible: false,
  };
}

async function listTenantsByIds(ids: string[]): Promise<PlatformTenantRow[]> {
  const { data } = await supabaseAdmin.from("tenants").select("id").in("id", ids);
  if (!data || data.length === 0) return [];
  const all = await listPlatformTenants({ limit: 500 });
  return all.filter((row) => ids.includes(row.id));
}

/* ------------------------------------------------------------ subscriptions */

export async function listPlatformSubscriptions(): Promise<PlatformSubscriptionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select(
      "id, tenant_id, status, billing_cycle, current_period_end, created_at, plan:plans(name, price_monthly, price_yearly, currency), tenant:tenants(name)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const plan = row.plan as { name: string; price_monthly: number; price_yearly: number; currency: string } | null;
    const monthlyValue = plan
      ? row.billing_cycle === "yearly"
        ? Number(plan.price_yearly) / 12
        : Number(plan.price_monthly)
      : 0;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      tenantName: (row.tenant as { name: string } | null)?.name ?? "Unknown",
      planName: plan?.name ?? "Unassigned",
      status: row.status,
      billingCycle: row.billing_cycle,
      monthlyValue,
      currency: plan?.currency ?? "USD",
      periodEnd: row.current_period_end,
      createdAt: row.created_at,
    };
  });
}

/* ---------------------------------------------------------------- payments */

export async function listPlatformPayments(filters: {
  status?: string | undefined;
  tenantId?: string | undefined;
  limit?: number | undefined;
}): Promise<PlatformPaymentRow[]> {
  let query = supabaseAdmin
    .from("payments")
    .select(
      "id, tenant_id, amount, currency, status, method, reference, receipt_url, review_notes, notes, created_at, plan:plans(name), tenant:tenants(name)",
    )
    .order("created_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 200, 500));

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status as never);
  if (filters.tenantId) query = query.eq("tenant_id", filters.tenantId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: (row.tenant as { name: string } | null)?.name ?? "Unknown",
    planName: (row.plan as { name: string } | null)?.name ?? null,
    amount: Number(row.amount ?? 0),
    currency: row.currency,
    status: row.status,
    method: row.method,
    reference: row.reference,
    receiptUrl: row.receipt_url,
    reviewNotes: row.review_notes,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

/**
 * Reviews a payment submission.
 *
 * Approval activates the tenant's subscription for the paid plan and writes an
 * immutable audit entry. Invoice and receipt generation hang off this same
 * transition once a document service exists — no gateway is involved.
 */
export async function reviewPayment(input: {
  actorId: string;
  paymentId: string;
  decision: PaymentDecision;
  notes?: string | undefined;
}): Promise<{ status: string }> {
  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .select("id, tenant_id, plan_id, amount, currency, subscription_id, status")
    .eq("id", input.paymentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!payment) throw new Error("Payment not found");

  const status =
    input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "pending";

  const { error: updateError } = await supabaseAdmin
    .from("payments")
    .update({
      status: status as never,
      review_notes: input.notes ?? null,
      reviewed_by: input.actorId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.paymentId);

  if (updateError) throw new Error(updateError.message);

  if (input.decision === "approve") {
    const periodEnd = new Date(Date.now() + 30 * DAY_MS).toISOString();
    if (payment.subscription_id) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active" as never, current_period_end: periodEnd })
        .eq("id", payment.subscription_id);
    } else if (payment.plan_id) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active" as never, plan_id: payment.plan_id, current_period_end: periodEnd })
        .eq("tenant_id", payment.tenant_id);
    }
  }

  await recordPlatformAudit({
    actorId: input.actorId,
    tenantId: payment.tenant_id,
    action: `payment.${input.decision.replace("-", "_")}`,
    entityType: "payment",
    entityId: payment.id,
    metadata: { amount: payment.amount, currency: payment.currency, notes: input.notes ?? null },
  });

  return { status };
}

/* ------------------------------------------------------------- audit / logs */

export async function listPlatformAuditLogs(filters: {
  tenantId?: string | undefined;
  action?: string | undefined;
  limit?: number | undefined;
}): Promise<PlatformAuditRow[]> {
  let query = supabaseAdmin
    .from("audit_logs")
    .select("id, tenant_id, actor_id, action, entity_type, entity_id, metadata, created_at, tenant:tenants(name)")
    .order("created_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 100, 500));

  if (filters.tenantId) query = query.eq("tenant_id", filters.tenantId);
  if (filters.action) query = query.ilike("action", `${filters.action.replace(/[^a-z0-9._]/gi, "")}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: (row.tenant as { name: string } | null)?.name ?? null,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorId: row.actor_id,
    metadata: (row.metadata ?? {}) as JsonRecord,
    createdAt: row.created_at,
  }));
}

/* ---------------------------------------------------------- feature flags */

export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  const [flagsRes, overridesRes] = await Promise.all([
    supabaseAdmin.from("platform_feature_flags").select("*").order("key"),
    supabaseAdmin
      .from("tenant_feature_flags")
      .select("flag_key, is_enabled, tenant_id, tenant:tenants(name)"),
  ]);

  const overrides = overridesRes.data ?? [];

  return (flagsRes.data ?? []).map((flag) => ({
    key: flag.key,
    label: flag.label,
    description: flag.description,
    isEnabled: flag.is_enabled,
    rollout: (flag.rollout ?? {}) as JsonRecord,
    updatedAt: flag.updated_at,
    overrides: overrides
      .filter((row) => row.flag_key === flag.key)
      .map((row) => ({
        tenantId: row.tenant_id,
        tenantName: (row.tenant as { name: string } | null)?.name ?? "Unknown",
        isEnabled: row.is_enabled,
      })),
  }));
}

export async function upsertFeatureFlag(input: {
  actorId: string;
  key: string;
  label: string;
  description?: string | undefined;
  isEnabled: boolean;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("platform_feature_flags").upsert({
    key: input.key,
    label: input.label,
    description: input.description ?? null,
    is_enabled: input.isEnabled,
  });
  if (error) throw new Error(error.message);

  await recordPlatformAudit({
    actorId: input.actorId,
    action: input.isEnabled ? "feature_flag.enabled" : "feature_flag.disabled",
    entityType: "feature_flag",
    entityId: input.key,
    metadata: { label: input.label },
  });
}

export async function setTenantFeatureFlag(input: {
  actorId: string;
  tenantId: string;
  flagKey: string;
  isEnabled: boolean;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tenant_feature_flags")
    .upsert(
      { tenant_id: input.tenantId, flag_key: input.flagKey, is_enabled: input.isEnabled },
      { onConflict: "tenant_id,flag_key" },
    );
  if (error) throw new Error(error.message);

  await recordPlatformAudit({
    actorId: input.actorId,
    tenantId: input.tenantId,
    action: "feature_flag.tenant_override",
    entityType: "feature_flag",
    entityId: input.flagKey,
    metadata: { enabled: input.isEnabled },
  });
}

/* ----------------------------------------------------------- announcements */

export async function listAnnouncements(): Promise<PlatformAnnouncement[]> {
  const { data, error } = await supabaseAdmin
    .from("platform_announcements")
    .select("id, title, body, audience, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    audience: row.audience,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }));
}

export async function createAnnouncement(input: {
  actorId: string;
  title: string;
  body: string;
  audience: string;
  publish: boolean;
}): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("platform_announcements")
    .insert({
      title: input.title,
      body: input.body,
      audience: input.audience,
      created_by: input.actorId,
      published_at: input.publish ? new Date().toISOString() : null,
    })
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);

  await recordPlatformAudit({
    actorId: input.actorId,
    action: input.publish ? "announcement.published" : "announcement.drafted",
    entityType: "announcement",
    entityId: data?.id ?? null,
    metadata: { title: input.title, audience: input.audience },
  });
}

/* ----------------------------------------------------------------- support */

export async function listSupportRequests(status?: string): Promise<SupportRequestRow[]> {
  let query = supabaseAdmin
    .from("support_requests")
    .select("id, tenant_id, subject, body, status, priority, created_at, resolved_at, tenant:tenants(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: (row.tenant as { name: string } | null)?.name ?? null,
    subject: row.subject,
    body: row.body,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  }));
}

export async function updateSupportRequest(input: {
  actorId: string;
  id: string;
  status: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("support_requests")
    .update({
      status: input.status,
      resolved_at: input.status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  await recordPlatformAudit({
    actorId: input.actorId,
    action: `support.${input.status}`,
    entityType: "support_request",
    entityId: input.id,
  });
}

/* -------------------------------------------------- infrastructure surfaces */

export async function loadDatabaseUsage(): Promise<DatabaseUsage> {
  const tables = [
    "tenants",
    "memberships",
    "subscriptions",
    "payments",
    "audit_logs",
    "business_profiles",
    "tenant_modules",
    "support_requests",
  ] as const;

  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      return { table, rows: count ?? 0 };
    }),
  );

  return { tables: counts, totalRows: counts.reduce((total, row) => total + row.rows, 0) };
}

export async function loadStorageUsage(): Promise<StorageBucketUsage[]> {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) return [];
  return (data ?? []).map((bucket) => ({
    id: bucket.id,
    name: bucket.name,
    isPublic: bucket.public,
    fileSizeLimit: bucket.file_size_limit ?? null,
    createdAt: bucket.created_at,
  }));
}

/**
 * AI telemetry. No metering provider is wired up yet, so this returns `null`
 * rather than zeros that would read as "we measured nothing happening".
 */
export async function loadAiUsage(): Promise<AiUsagePeriod | null> {
  return null;
}

export async function loadPlatformNotifications(): Promise<PlatformNotification[]> {
  const [payments, support] = await Promise.all([
    listPlatformPayments({ status: "pending", limit: 20 }),
    listSupportRequests("open"),
  ]);

  const notifications: PlatformNotification[] = [];

  for (const payment of payments) {
    notifications.push({
      id: `payment-${payment.id}`,
      title: `Payment awaiting review — ${payment.tenantName}`,
      detail: `${payment.currency} ${payment.amount.toLocaleString()}${payment.reference ? ` · ref ${payment.reference}` : ""}`,
      tone: "warning",
      createdAt: payment.createdAt,
    });
  }

  for (const request of support) {
    notifications.push({
      id: `support-${request.id}`,
      title: `Open support request — ${request.tenantName ?? "Unknown"}`,
      detail: request.subject,
      tone: request.priority === "high" ? "warning" : "neutral",
      createdAt: request.createdAt,
    });
  }

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
