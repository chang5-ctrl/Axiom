import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { usePlatformSnapshot } from "@/hooks/usePlatform";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/revenue")({
  component: RevenuePage,
});

function RevenuePage() {
  const { data } = usePlatformSnapshot();
  const currency = data?.currency ?? "USD";
  const money = (value: number | undefined) =>
    value === undefined ? "—" : formatCurrency(value, currency);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Revenue"
        description="Recurring revenue, collections and plan mix across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={money(data?.revenue.mrr)} tone="primary" />
        <StatCard label="ARR" value={money(data?.revenue.arr)} />
        <StatCard label="Month to date" value={money(data?.revenue.monthToDate)} hint="Approved payments" />
        <StatCard label="Year to date" value={money(data?.revenue.yearToDate)} />
        <StatCard label="Last 30 days" value={money(data?.revenue.last30Days)} />
        <StatCard label="Lifetime collected" value={money(data?.revenue.lifetime)} />
        <StatCard
          label="Pending revenue"
          value={money(data?.revenue.pendingAmount)}
          hint={`${data ? formatNumber(data.revenue.pendingCount) : "—"} submissions`}
          tone="warning"
        />
        <StatCard
          label="Subscribers"
          value={
            data
              ? `${formatNumber(data.revenue.monthlySubscribers)} / ${formatNumber(data.revenue.annualSubscribers)}`
              : "—"
          }
          hint="Monthly / annual billing"
        />
      </div>

      <SectionCard title="Revenue trend" description="Approved payments per month">
        <TrendChart
          data={data?.revenue.byMonth ?? []}
          height={300}
          valueFormatter={(value) => formatCurrency(value, currency, true)}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue by plan">
          <BreakdownBars
            data={data?.revenue.byPlan ?? []}
            valueFormatter={(value) => formatCurrency(value, currency, true)}
          />
        </SectionCard>
        <SectionCard title="Revenue by industry">
          <BreakdownBars
            data={data?.revenue.byIndustry ?? []}
            valueFormatter={(value) => formatCurrency(value, currency, true)}
          />
        </SectionCard>
      </div>
    </>
  );
}
