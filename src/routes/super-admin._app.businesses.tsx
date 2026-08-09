import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, PauseCircle, ShieldCheck, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DonutChart } from "@/components/platform/DonutChart";
import { MetricCard, MetricGrid } from "@/components/platform/MetricCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { Button } from "@/components/ui/button";
import { usePlatformSnapshot } from "@/hooks/usePlatform";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/businesses")({
  head: () => ({
    meta: [
      { title: "Businesses · Axiom Platform" },
      {
        name: "description",
        content:
          "Active, trial and premium business segments with industry mix and signup trend across Axiom workspaces.",
      },
    ],
  }),
  component: PlatformBusinesses,
});

function PlatformBusinesses() {
  const { data, isPending } = usePlatformSnapshot();
  const count = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value));

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
        eyebrow="Customers"
        title="Businesses"
        description="Segment the workspace base by lifecycle, plan tier and industry."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/super-admin/tenants">Open workspace directory</Link>
          </Button>
        }
      />

      <MetricGrid loading={isPending} skeletonCount={4}>
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
          tone="primary"
        />
        <MetricCard
          label="Suspended"
          value={count(data?.tenants.suspended)}
          hint="Access revoked or churned"
          icon={PauseCircle}
          tone="warning"
        />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Lifecycle mix" description="Share of workspaces per segment">
          <DonutChart
            data={segments}
            centerValue={count(data?.tenants.total)}
            centerLabel="Workspaces"
            emptyMessage="No workspaces provisioned yet."
          />
        </SectionCard>
        <SectionCard title="Industry mix" description="Workspaces per industry">
          <BreakdownBars
            data={(data?.industries ?? []).map((row) => ({
              label: row.industry,
              value: row.tenants,
            }))}
          />
        </SectionCard>
      </div>

      <SectionCard title="Signups" description="New workspaces provisioned per day">
        <TrendChart data={data?.signups ?? []} />
      </SectionCard>
    </>
  );
}
