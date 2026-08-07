import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { FounderBriefCard } from "@/components/platform/FounderBriefCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { BreakdownBars, TrendChart } from "@/components/platform/TrendChart";
import { usePlatformSnapshot } from "@/hooks/usePlatform";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/super-admin/brief")({
  component: FounderBriefPage,
});

function FounderBriefPage() {
  const { data, isPending } = usePlatformSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Executive"
        title="Founder daily brief"
        description="A narrative summary of yesterday's platform movement, generated from live analytics."
        actions={
          <span className="text-xs text-muted-foreground">
            {data ? `Generated ${formatDateTime(data.generatedAt)}` : "Generating…"}
          </span>
        }
      />

      <FounderBriefCard brief={data?.brief} loading={isPending} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="New businesses" description="Sign-ups per day, last 30 days">
          <TrendChart data={data?.signups ?? []} variant="bar" />
        </SectionCard>
        <SectionCard title="Workspace activity" description="Recorded events per day">
          <TrendChart data={data?.activity ?? []} />
        </SectionCard>
        <SectionCard title="Industry mix" description="Where growth is coming from">
          <BreakdownBars
            data={(data?.industries ?? []).map((item) => ({
              label: item.industry,
              value: item.tenants,
            }))}
          />
        </SectionCard>
        <SectionCard title="Module adoption" description="Enabled workspaces per module">
          <BreakdownBars
            data={(data?.modules ?? []).map((item) => ({
              label: item.name,
              value: item.activations,
            }))}
          />
        </SectionCard>
      </div>
    </>
  );
}
