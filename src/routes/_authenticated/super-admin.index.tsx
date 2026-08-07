import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BadgeDollarSign,
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
import { StatCard } from "@/components/common/StatCard";
import { FounderBriefCard } from "@/components/platform/FounderBriefCard";
import { HealthProbeList } from "@/components/platform/HealthProbeList";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformSnapshot, useStorageUsage } from "@/hooks/usePlatform";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/super-admin/")({
  component: PlatformOverview,
});

function PlatformOverview() {
  const { data, isPending } = usePlatformSnapshot();
  const storage = useStorageUsage();

  const currency = data?.currency ?? "USD";
  const money = (value: number | undefined) =>
    value === undefined ? "—" : formatCurrency(value, currency, true);
  const count = (value: number | undefined) =>
    value === undefined ? "—" : formatNumber(value);

  const dbProbe = data?.probes.find((probe) => probe.id === "database");
  const apiProbe = data?.probes.find((probe) => probe.id === "api");

  return (
    <>
      <PageHeader
        eyebrow="Mission control"
        title="Platform overview"
        description="Executive view of revenue, adoption and infrastructure across every Axiom workspace."
      />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[116px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Monthly revenue"
            value={money(data?.revenue.monthToDate)}
            hint={`MRR ${money(data?.revenue.mrr)}`}
            icon={BadgeDollarSign}
            tone="primary"
          />
          <StatCard
            label="Annual revenue"
            value={money(data?.revenue.yearToDate)}
            hint={`ARR ${money(data?.revenue.arr)}`}
            icon={CreditCard}
          />
          <StatCard
            label="Active businesses"
            value={count(data?.tenants.active)}
            hint={`${count(data?.tenants.total)} total workspaces`}
            icon={Building2}
            tone="success"
          />
          <StatCard
            label="Trial businesses"
            value={count(data?.tenants.trialing)}
            hint={`${count(data?.tenants.newLast30Days)} joined in 30 days`}
            icon={Sparkles}
          />
          <StatCard
            label="Premium businesses"
            value={count(data?.tenants.premium)}
            hint="Paid, non-trial subscriptions"
            icon={ShieldCheck}
          />
          <StatCard
            label="Pending payments"
            value={count(data?.revenue.pendingCount)}
            hint={`${money(data?.revenue.pendingAmount)} awaiting review`}
            icon={Receipt}
            tone="warning"
          />
          <StatCard
            label="Active users"
            value={count(data?.users.dailyActive)}
            hint={`${count(data?.users.monthlyActive)} monthly active`}
            icon={Users}
          />
          <StatCard
            label="Platform health"
            value={formatPercent(data?.health.uptimePercent ?? null)}
            hint={
              data?.health.errorRate === null || data?.health.errorRate === undefined
                ? "Uptime provider not connected"
                : `${formatPercent(data.health.errorRate, 2)} error rate`
            }
            icon={Activity}
          />
        </div>
      )}

      <FounderBriefCard brief={data?.brief} loading={isPending} compact />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Revenue trend"
          description="Approved payments per month"
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

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Infrastructure" description="Live probes" className="lg:col-span-2">
          <HealthProbeList probes={data?.probes ?? []} />
        </SectionCard>
        <div className="grid gap-4">
          <StatCard
            label="Database"
            value={dbProbe?.latencyMs === null || !dbProbe ? "—" : `${dbProbe.latencyMs} ms`}
            hint={dbProbe?.detail ?? "Awaiting probe"}
            icon={Database}
          />
          <StatCard
            label="API"
            value={apiProbe?.latencyMs === null || !apiProbe ? "—" : `${apiProbe.latencyMs} ms`}
            hint={apiProbe?.detail ?? "Awaiting probe"}
            icon={Activity}
          />
          <StatCard
            label="Storage"
            value={storage.data ? formatNumber(storage.data.length) : "—"}
            hint="Buckets provisioned"
            icon={HardDrive}
          />
        </div>
      </div>
    </>
  );
}
