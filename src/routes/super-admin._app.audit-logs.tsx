import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { usePlatformAudit } from "@/hooks/usePlatform";
import { formatDateTime } from "@/lib/format";
import type { PlatformAuditRow } from "@/types/platform";

export const Route = createFileRoute("/super-admin/_app/audit-logs")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { data, isPending } = usePlatformAudit({ limit: 200 });
  const columns: DataTableColumn<PlatformAuditRow>[] = [
    { header: "Action", accessor: "action" },
    { header: "Workspace", accessor: "tenantName", render: (row) => row.tenantName ?? "—" },
    { header: "Entity", accessor: "entityType", render: (row) => row.entityType ?? "—" },
    { header: "When", accessor: "createdAt", render: (row) => formatDateTime(row.createdAt) },
  ];
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Audit logs" description="Immutable record of privileged actions across the platform." />
      <PlatformPermissionGate permission="platform.audit.view">
        <SectionCard title="Recent entries" bodyClassName="p-0">
          <DataTable columns={columns} data={data ?? []} loading={isPending} emptyMessage="No audit entries recorded yet." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
