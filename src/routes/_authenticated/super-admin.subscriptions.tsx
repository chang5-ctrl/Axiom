import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars } from "@/components/platform/TrendChart";
import { usePlatformSnapshot, usePlatformSubscriptions } from "@/hooks/usePlatform";
import { formatCurrency, formatDate, formatNumber, titleCase } from "@/lib/format";
import type { PlatformSubscriptionRow } from "@/types/platform";

export const Route = createFileRoute("/_authenticated/super-admin/subscriptions")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const snapshot = usePlatformSnapshot();
  const { data, isPending } = usePlatformSubscriptions();
  const currency = snapshot.data?.currency ?? "USD";

  const columns: DataTableColumn<PlatformSubscriptionRow>[] = [
    { header: "Business", accessor: "tenantName" },
    { header: "Plan", accessor: "planName" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Cycle", accessor: "billingCycle", render: (row) => titleCase(row.billingCycle) },
    {
      header: "Monthly value",
      accessor: "monthlyValue",
      render: (row) => formatCurrency(row.monthlyValue, row.currency),
    },
    { header: "Renews", accessor: "periodEnd", render: (row) => formatDate(row.periodEnd) },
    { header: "Started", accessor: "createdAt", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Subscriptions"
        description="Every workspace subscription, its plan and contribution to recurring revenue."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Subscriptions"
          value={snapshot.data ? formatNumber(snapshot.data.subscriptions.total) : "—"}
        />
        <StatCard
          label="MRR"
          value={snapshot.data ? formatCurrency(snapshot.data.revenue.mrr, currency, true) : "—"}
          tone="primary"
        />
        <StatCard
          label="Monthly billing"
          value={snapshot.data ? formatNumber(snapshot.data.revenue.monthlySubscribers) : "—"}
        />
        <StatCard
          label="Annual billing"
          value={snapshot.data ? formatNumber(snapshot.data.revenue.annualSubscribers) : "—"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="By status">
          <BreakdownBars data={snapshot.data?.subscriptions.byStatus ?? []} />
        </SectionCard>
        <SectionCard title="Monthly value by plan">
          <BreakdownBars
            data={(snapshot.data?.subscriptions.byPlan ?? []).map((item) => ({
              label: item.plan,
              value: item.monthlyValue,
            }))}
            valueFormatter={(value) => formatCurrency(value, currency, true)}
          />
        </SectionCard>
      </div>

      <SectionCard title="All subscriptions" bodyClassName="p-0">
        <DataTable
          columns={columns}
          data={data ?? []}
          loading={isPending}
          emptyMessage="No subscriptions recorded yet."
        />
      </SectionCard>
    </>
  );
}
