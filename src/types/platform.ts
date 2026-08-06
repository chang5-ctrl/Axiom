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
  newLast7Days: number;
  newLast30Days: number;
  newYesterday: number;
}

export interface UserMetrics {
  total: number;
  dailyActive: number;
  monthlyActive: number;
  newLast30Days: number;
}

export interface RevenueMetrics {
  currency: string;
  monthToDate: number;
  last30Days: number;
  lifetime: number;
  pendingAmount: number;
  pendingCount: number;
  collectedYesterday: number;
  byMonth: TimeSeriesPoint[];
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
  authLatencyMs: number | null;
  errorRate: number | null;
  uptimePercent: number | null;
  checkedAt: string;
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
  /** Requests recorded for the period. Zero is a real value, not a placeholder. */
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
  headlines: FounderBriefItem[];
  narrative: string[];
  recommendations: string[];
}

export interface PlatformSnapshot {
  generatedAt: string;
  tenants: TenantMetrics;
  users: UserMetrics;
  revenue: RevenueMetrics;
  subscriptions: SubscriptionMetrics;
  modules: ModuleAdoption[];
  industries: IndustryMix[];
  health: SystemHealth;
  healthBands: BusinessHealthBand[];
  signups: TimeSeriesPoint[];
  activity: TimeSeriesPoint[];
  brief: FounderBrief;
}

export interface PlatformTenantRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  industry: string | null;
  members: number;
  planName: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface PlatformSubscriptionRow {
  id: string;
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
  tenantName: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  reference: string | null;
  createdAt: string;
}

export interface PlatformAuditRow {
  id: string;
  tenantName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string | null;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "owners" | "admins";
  publishedAt: string;
}

export interface SupportRequestRow {
  id: string;
  tenantName: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "normal" | "high";
  createdAt: string;
}
