import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BadgeDollarSign,
  Bell,
  Bot,
  Building2,
  CreditCard,
  Database,
  HardDrive,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ActivityFeed } from "@/components/platform/ActivityFeed";
import { DonutChart } from "@/components/platform/DonutChart";
import { FounderBriefCard } from "@/components/platform/FounderBriefCard";
import { HealthProbeList } from "@/components/platform/HealthProbeList";
import { MetricCard, MetricGrid } from "@/components/platform/MetricCard";
import { NotificationList } from "@/components/platform/NotificationList";
import { QuickActions } from "@/components/platform/QuickActions";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { UsageMeter } from "@/components/platform/UsageMeter";
import { platformQuickActions } from "@/config/platform-actions";
import {
  useAiUsage,
  useDatabaseUsage,
  usePlatformAudit,
  usePlatformNotifications,
  usePlatformSnapshot,
  useStorageUsage,
} from "@/hooks/usePlatform";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/")({
  head: () => ({
    meta: [
      { title: "Mission Control · Axiom Platform" },
      {
        name: "description",
        content:
          "Executive overview of Axiom platform revenue, workspace adoption, engagement and infrastructure health.",
      },
    ],
  }),
  component: PlatformOverview,
});

function PlatformOverview() {
  const { permissions } = usePlatformAuth();
  const { data, isPending } = usePlatformSnapshot();
  const storage = useStorageUsage();
  const database = useDatabaseUsage();
  const ai = useAiUsage();
  const audit = usePlatformAudit({ limit: 10 });
  const notifications = usePlatformNotifications();

  const currency = data?.currency ?? "USD";
  const money = (value: number | undefined) =>
    value === undefined ? "—" : formatCurrency(value, currency, true);
  const count = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value));

  const dbProbe = data?.probes.find((probe) => probe.id === "database");
  const apiProbe = data?.probes.find((probe) => probe.id === "api");

  const segments = data
    ? [
        { label: "Premium", value: data.tenants.premium },
        { label: "Trialing", value: data.tenants.trialing },
        {
          label: "Active (no paid plan)",
          value: Math.max(data.tenants.active - data.tenants.premium, 0),
        },
        { label: "Suspended", value: data.tenants.suspended },
      ].filter((point) => point.value > 0)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Mission control"
        title="Executive overview"
        description="Revenue, adoption, engagement and infrastructure across every Axiom workspace."
      />

      {/* Executive overview ------------------------------------------------ */}
      <MetricGrid loading={isPending} skeletonCount={8}>
        <MetricCard
          label="Monthly revenue"
          value={money(data?.revenue.monthToDate)}
          hint={`MRR ${money(data?.revenue.mrr)}`}
          icon={BadgeDollarSign}
          tone="primary"
          delta={{
            value: data?.revenue.monthOverMonthPercent ?? null,
            label: data?.revenue.monthOverMonthPercent == null ? "no prior month" : "vs last month",
          }}
          series={data?.revenue.byMonth ?? []}
        />
        <MetricCard
          label="Annual revenue"
          value={money(data?.revenue.yearToDate)}
          hint={`ARR ${money(data?.revenue.arr)}`}
          icon={CreditCard}
        />
        <MetricCard
          label="Active businesses"
          value={count(data?.tenants.active)}
          hint={`${count(data?.tenants.total)} total workspaces`}
          icon={Building2}
          tone="success"
          delta={{ value: data?.tenants.newLast30Days ?? null, label: "new in 30 days" }}
          series={data?.signups ?? []}
        />
        <MetricCard
          label="Trial businesses"
          value={count(data?.tenants.trialing)}
          hint="Evaluating Axiom"
          icon={Sparkles}
          delta={{ value: data?.tenants.newLast7Days ?? null, label: "new in 7 days" }}
        />
        <MetricCard
          label="Premium businesses"
          value={count(data?.tenants.premium)}
          hint="Paid, non-trial subscriptions"
          icon={ShieldCheck}
          tone="success"
        />
        <MetricCard
          label="Pending payments"
          value={count(data?.revenue.pendingCount)}
          hint={`${money(data?.revenue.pendingAmount)} awaiting review`}
          icon={Receipt}
          tone="warning"
        />
        <MetricCard
          label="Daily active users"
          value={count(data?.users.dailyActive)}
          hint={`${count(data?.users.monthlyActive)} monthly active`}
          icon={Users}
          delta={{ value: data?.users.dailyActiveChange ?? null, label: "vs yesterday" }}
          series={data?.users.dailyActiveSeries ?? []}
        />
        <MetricCard
          label="Platform health"
          value={formatPercent(data?.health.uptimePercent ?? null)}
          hint={
            data?.health.errorRate == null
              ? "Uptime provider not connected"
              : `${formatPercent(data.health.errorRate, 2)} error rate`
          }
          icon={Activity}
        />
      </MetricGrid>

      {/* Founder brief + quick actions ------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FounderBriefCard brief={data?.brief} loading={isPending} compact className="lg:col-span-2" />
        <SectionCard title="Quick actions" description="Jump to what needs a decision">
          <QuickActions
            actions={platformQuickActions({
              pendingPayments: data?.pendingPayments,
              openSupport: data?.openSupportRequests,
              trialBusinesses: data?.tenants.trialing,
            })}
            permissions={permissions}
            className="sm:grid-cols-1"
          />
        </SectionCard>
      </div>

      {/* Revenue ---------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Monthly revenue"
          description="Approved collections per month"
          className="lg:col-span-2"
        >
          <TrendChart
            data={data?.revenue.byMonth ?? []}
            valueFormatter={(value) => formatCurrency(value, currency, true)}
          />
        </SectionCard>
        <SectionCard title="Revenue by plan" description="Approved payments to date">
          <BreakdownBars
            data={data?.revenue.byPlan ?? []}
            valueFormatter={(value) => formatCurrency(value, currency, true)}
          />
        </SectionCard>
      </div>

      {/* Businesses + engagement ------------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Business segments" description="Lifecycle distribution">
          <DonutChart
            data={segments}
            centerValue={count(data?.tenants.total)}
            centerLabel="Workspaces"
            emptyMessage="No workspaces provisioned yet."
          />
        </SectionCard>
        <SectionCard
          title="Business health"
          description="Derived from workspace activity"
          action={
            <span className="text-xs text-muted-foreground">
              Stickiness {formatPercent(data?.users.stickiness ?? null, 0)}
            </span>
          }
        >
          <DonutChart
            data={(data?.healthBands ?? []).map((band) => ({
              label: band.label,
              value: band.tenants,
            }))}
            emptyMessage="No health signal recorded yet."
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Daily active users" description="Distinct workspace members per day">
          <TrendChart data={data?.users.dailyActiveSeries ?? []} />
        </SectionCard>
        <SectionCard title="Monthly active users" description="Rolling monthly reach">
          <TrendChart data={data?.users.monthlyActiveSeries ?? []} />
        </SectionCard>
      </div>

      {/* Infrastructure --------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Platform health" description="Live dependency probes" className="lg:col-span-2">
          <HealthProbeList probes={data?.probes ?? []} />
        </SectionCard>
        <div className="grid gap-4">
          <MetricCard
            label="Database status"
            value={dbProbe?.latencyMs == null ? "—" : `${dbProbe.latencyMs} ms`}
            hint={dbProbe?.detail ?? "Awaiting probe"}
            icon={Database}
            footer={`${count(database.data?.totalRows)} rows tracked`}
            loading={isPending}
          />
          <MetricCard
            label="API status"
            value={apiProbe?.latencyMs == null ? "—" : `${apiProbe.latencyMs} ms`}
            hint={apiProbe?.detail ?? "Awaiting probe"}
            icon={Activity}
            loading={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="AI usage"
          description="Workspace generation and assistant traffic"
          action={<Bot className="size-4 text-muted-foreground" />}
        >
          <UsageMeter
            items={(ai.data?.byFeature ?? []).map((point) => ({
              label: point.label,
              value: point.value,
            }))}
            emptyMessage="No AI requests metered yet."
          />
          <p className="mt-4 text-xs text-muted-foreground">
            {formatNumber(ai.data?.requests ?? 0)} requests ·{" "}
            {formatNumber(ai.data?.inputTokens ?? 0)} in /{" "}
            {formatNumber(ai.data?.outputTokens ?? 0)} out tokens · cost{" "}
            {ai.data?.estimatedCost == null
              ? "not metered"
              : formatCurrency(ai.data.estimatedCost, ai.data.currency, true)}
          </p>
        </SectionCard>

        <SectionCard
          title="Storage usage"
          description="Provisioned buckets"
          action={<HardDrive className="size-4 text-muted-foreground" />}
        >
          <UsageMeter
            items={(storage.data ?? []).map((bucket) => ({
              label: bucket.name,
              value: bucket.fileSizeLimit ?? 0,
              formattedValue: bucket.fileSizeLimit
                ? `${formatNumber(bucket.fileSizeLimit / 1_048_576)} MB limit`
                : "no limit",
              detail: bucket.isPublic ? "Public bucket" : "Private bucket",
            }))}
            emptyMessage="No storage buckets provisioned yet."
          />
        </SectionCard>
      </div>

      {/* Activity + notifications ----------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent activity" description="Immutable platform audit trail">
          <ActivityFeed rows={audit.data} loading={audit.isPending} limit={8} />
        </SectionCard>
        <SectionCard
          title="Notifications"
          description="Signals that need an operator"
          action={<Bell className="size-4 text-muted-foreground" />}
        >
          <NotificationList
            notifications={notifications.data}
            loading={notifications.isPending}
            limit={6}
          />
        </SectionCard>
      </div>
    </>
  );
}
