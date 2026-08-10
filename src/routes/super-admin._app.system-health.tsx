import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { HealthProbeList } from "@/components/platform/HealthProbeList";
import { SectionCard } from "@/components/platform/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformSnapshot } from "@/hooks/usePlatform";
import { formatDateTime, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/system-health")({
  component: SystemHealthPage,
});

function SystemHealthPage() {
  const { data, isPending } = usePlatformSnapshot();
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="System health" description="Live probes against the services Rocdwels AI depends on." />
      <PlatformPermissionGate permission="platform.health.view">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Database latency" value={data?.health.databaseLatencyMs != null ? `${data.health.databaseLatencyMs} ms` : "—"} />
          <StatCard label="API latency" value={data?.health.apiLatencyMs != null ? `${data.health.apiLatencyMs} ms` : "—"} />
          <StatCard label="Error rate" value={formatPercent(data?.health.errorRate ?? null)} />
          <StatCard label="Checked" value={data ? formatDateTime(data.health.checkedAt) : "—"} />
        </div>
        <SectionCard title="Monitored dependencies">
          {isPending ? <Skeleton className="h-32 w-full" /> : <HealthProbeList probes={data?.probes ?? []} />}
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
