import { createFileRoute } from "@tanstack/react-router";
import { Activity, Building2, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DonutChart } from "@/components/platform/DonutChart";
import { MetricCard, MetricGrid } from "@/components/platform/MetricCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { usePlatformSnapshot } from "@/hooks/usePlatform";
import { formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/engagement")({
  head: () => ({
    meta: [
      { title: "Engagement · Axiom Platform" },
      {
        name: "description",
        content:
          "Daily and monthly active users, workspace health bands and module adoption across the Axiom platform.",
      },
    ],
  }),
  component: PlatformEngagement,
});

function PlatformEngagement() {
  const { data, isPending } = usePlatformSnapshot();
  const count = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value));

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Engagement"
        description="How much the platform is actually used: active members, workspace health and module adoption."
      />

      <MetricGrid loading={isPending} skeletonCount={4}>
        <MetricCard
          label="Daily active users"
          value={count(data?.users.dailyActive)}
          icon={Users}
          tone="primary"
          delta={{ value: data?.users.dailyActiveChange ?? null, label: "vs yesterday" }}
          series={data?.users.dailyActiveSeries ?? []}
        />
        <MetricCard
          label="Monthly active users"
          value={count(data?.users.monthlyActive)}
          icon={Users}
          hint={`${count(data?.users.total)} members total`}
          series={data?.users.monthlyActiveSeries ?? []}
        />
        <MetricCard
          label="Stickiness"
          value={formatPercent(data?.users.stickiness ?? null, 0)}
          hint="Daily active / monthly active"
          icon={Activity}
        />
        <MetricCard
          label="New members"
          value={count(data?.users.newLast30Days)}
          hint="Joined in the last 30 days"
          icon={Building2}
          tone="success"
        />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Daily active users" description="Distinct members per day">
          <TrendChart data={data?.users.dailyActiveSeries ?? []} />
        </SectionCard>
        <SectionCard title="Monthly active users" description="Rolling monthly reach">
          <TrendChart data={data?.users.monthlyActiveSeries ?? []} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Business health" description="Derived from workspace activity">
          <DonutChart
            data={(data?.healthBands ?? []).map((band) => ({
              label: band.label,
              value: band.tenants,
            }))}
            emptyMessage="No health signal recorded yet."
          />
        </SectionCard>
        <SectionCard title="Module adoption" description="Activations per module">
          <BreakdownBars
            data={(data?.modules ?? []).map((module) => ({
              label: module.name,
              value: module.activations,
            }))}
          />
        </SectionCard>
      </div>

      <SectionCard title="Workspace activity" description="Audited platform events per day">
        <TrendChart data={data?.activity ?? []} />
      </SectionCard>
    </>
  );
}
