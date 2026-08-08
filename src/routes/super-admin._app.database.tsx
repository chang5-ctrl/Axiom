import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { useDatabaseUsage } from "@/hooks/usePlatform";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/database")({
  component: DatabasePage,
});

function DatabasePage() {
  const { data, isPending } = useDatabaseUsage();
  const columns: DataTableColumn<{ table: string; rows: number }>[] = [
    { header: "Table", accessor: "table" },
    { header: "Rows", accessor: "rows", render: (row) => formatNumber(row.rows) },
  ];
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Database" description="Row volume across platform-owned tables." />
      <PlatformPermissionGate permission="platform.database.view">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Tracked tables" value={formatNumber(data?.tables.length ?? 0)} />
          <StatCard label="Total rows" value={formatNumber(data?.totalRows ?? 0)} tone="primary" />
        </div>
        <SectionCard title="Tables" bodyClassName="p-0">
          <DataTable columns={columns} data={data?.tables ?? []} loading={isPending} emptyMessage="No table metrics available." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
