export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = { [key: string]: JsonValue };

/**
 * Platform (super admin) domain types.
 *
 * These interfaces are the contract between the platform control centre UI and
 * its data providers. Values that no provider reports yet are typed as
 * nullable rather than filled with invented numbers, so components render an
 * honest state today and live data the moment a provider is connected.
 */

export interface MetricPoint {
  label: string;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TenantMetrics {
  total: number;
  active: number;
  trialing: number;
  suspended: number;
  premium: number;
  newLast7Days: number;
  newLast30Days: number;
  newYesterday: number;
}

export interface UserMetrics {
  total: number;
  dailyActive: number;
  monthlyActive: number;
  newLast30Days: number;
  dailyActiveSeries: TimeSeriesPoint[];
  monthlyActiveSeries: TimeSeriesPoint[];
  /** DAU/MAU stickiness percentage; null until activity is recorded. */
  stickiness: number | null;
  /** Day-over-day change in daily active users. */
  dailyActiveChange: number;
}

export interface RevenueMetrics {
  currency: string;
  mrr: number;
  arr: number;
  monthToDate: number;
  previousMonth: number;
  /** Month-over-month collection growth; null without a comparable month. */
  monthOverMonthPercent: number | null;
  last30Days: number;
  yearToDate: number;
  lifetime: number;
  pendingAmount: number;
  pendingCount: number;
  collectedYesterday: number;
  monthlySubscribers: number;
  annualSubscribers: number;
  byMonth: TimeSeriesPoint[];
  byPlan: MetricPoint[];
  byIndustry: MetricPoint[];
}


export interface SubscriptionMetrics {
  total: number;
  byStatus: MetricPoint[];
  byPlan: { plan: string; tenants: number; monthlyValue: number }[];
  upgradesYesterday: number;
}

export interface ModuleAdoption {
  key: string;
  name: string;
  category: string;
  activations: number;
  adoptionRate: number;
}

export interface IndustryMix {
  industry: string;
  tenants: number;
  share: number;
}

export interface BusinessHealthBand {
  band: "healthy" | "watch" | "at-risk" | "dormant";
  label: string;
  tenants: number;
  description: string;
}

export interface SystemHealth {
  databaseLatencyMs: number | null;
  apiLatencyMs: number | null;
  errorRate: number | null;
  uptimePercent: number | null;
  checkedAt: string;
}

/** A single monitored dependency. `status` is derived from real probes only. */
export interface HealthProbe {
  id: string;
  label: string;
  status: "operational" | "degraded" | "down" | "unmonitored";
  latencyMs: number | null;
  detail: string;
}

export interface DatabaseUsage {
  tables: { table: string; rows: number }[];
  totalRows: number;
}

export interface StorageBucketUsage {
  id: string;
  name: string;
  isPublic: boolean;
  fileSizeLimit: number | null;
  createdAt: string;
}

export interface AiUsagePeriod {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number | null;
  currency: string;
  byFeature: MetricPoint[];
  series: TimeSeriesPoint[];
}

export interface FounderBriefItem {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "warning";
}

export interface FounderBrief {
  forDate: string;
  greeting: string;
  headlines: FounderBriefItem[];
  narrative: string[];
  recommendations: string[];
}

export interface PlatformSnapshot {
  generatedAt: string;
  currency: string;
  tenants: TenantMetrics;
  users: UserMetrics;
  revenue: RevenueMetrics;
  subscriptions: SubscriptionMetrics;
  modules: ModuleAdoption[];
  industries: IndustryMix[];
  health: SystemHealth;
  probes: HealthProbe[];
  healthBands: BusinessHealthBand[];
  signups: TimeSeriesPoint[];
  activity: TimeSeriesPoint[];
  brief: FounderBrief;
  pendingPayments: number;
  openSupportRequests: number;
}

export interface PlatformTenantRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  industry: string | null;
  members: number;
  planName: string | null;
  planKey: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

export interface PlatformTenantDetail {
  tenant: PlatformTenantRow;
  modules: { key: string; enabled: boolean }[];
  payments: PlatformPaymentRow[];
  audit: PlatformAuditRow[];
  lastActivityAt: string | null;
  /** Customer records are never exposed to platform staff by default. */
  customerDataVisible: false;
}

export interface PlatformSubscriptionRow {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  status: string;
  billingCycle: string;
  monthlyValue: number;
  currency: string;
  periodEnd: string | null;
  createdAt: string;
}

export interface PlatformPaymentRow {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  reference: string | null;
  receiptUrl: string | null;
  reviewNotes: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PlatformAuditRow {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  metadata: JsonRecord;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string | null;
  isEnabled: boolean;
  rollout: JsonRecord;
  overrides: { tenantId: string; tenantName: string; isEnabled: boolean }[];
  updatedAt: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface SupportRequestRow {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  subject: string;
  body: string | null;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt: string | null;
}

export type PaymentDecision = "approve" | "reject" | "request-info";

export interface PlatformNotification {
  id: string;
  title: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
  createdAt: string;
}
