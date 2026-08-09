import { createFileRoute } from "@tanstack/react-router";
import { Bot, Coins, Gauge, MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard, MetricGrid } from "@/components/platform/MetricCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { TrendChart } from "@/components/platform/TrendChart";
import { UsageMeter } from "@/components/platform/UsageMeter";
import { useAiUsage } from "@/hooks/usePlatform";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/ai-usage")({
  head: () => ({
    meta: [
      { title: "AI Usage · Axiom Platform" },
      {
        name: "description",
        content:
          "Metered AI requests, token consumption and estimated cost for Axiom workspace generation and assistants.",
      },
    ],
  }),
  component: PlatformAiUsage,
});

function PlatformAiUsage() {
  const { data, isPending } = useAiUsage();

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure"
        title="AI usage"
        description="Requests, tokens and cost for every AI-assisted capability on the platform."
      />

      <MetricGrid loading={isPending} skeletonCount={4}>
        <MetricCard
          label="Requests"
          value={formatNumber(data?.requests ?? 0)}
          icon={Bot}
          tone="primary"
          series={data?.series ?? []}
        />
        <MetricCard
          label="Input tokens"
          value={formatNumber(data?.inputTokens ?? 0, true)}
          icon={MessageSquare}
        />
        <MetricCard
          label="Output tokens"
          value={formatNumber(data?.outputTokens ?? 0, true)}
          icon={Gauge}
        />
        <MetricCard
          label="Estimated cost"
          value={
            data?.estimatedCost == null
              ? "—"
              : formatCurrency(data.estimatedCost, data.currency, true)
          }
          hint={data?.estimatedCost == null ? "Cost metering not connected" : "Current period"}
          icon={Coins}
        />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Requests over time" description="Metered AI calls" className="lg:col-span-2">
          <TrendChart data={data?.series ?? []} />
        </SectionCard>
        <SectionCard title="Usage by feature" description="Where AI is being consumed">
          <UsageMeter
            items={(data?.byFeature ?? []).map((point) => ({
              label: point.label,
              value: point.value,
            }))}
            emptyMessage="No AI requests metered yet."
          />
        </SectionCard>
      </div>
    </>
  );
}
