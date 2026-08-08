import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { useStorageUsage } from "@/hooks/usePlatform";
import { formatDate, formatNumber } from "@/lib/format";
import type { StorageBucketUsage } from "@/types/platform";

export const Route = createFileRoute("/super-admin/_app/storage")({
  component: StoragePage,
});

function StoragePage() {
  const { data, isPending } = useStorageUsage();
  const columns: DataTableColumn<StorageBucketUsage>[] = [
    { header: "Bucket", accessor: "name" },
    { header: "Visibility", accessor: "isPublic", render: (row) => (row.isPublic ? "Public" : "Private") },
    { header: "Size limit", accessor: "fileSizeLimit", render: (row) => (row.fileSizeLimit ? formatNumber(row.fileSizeLimit) : "—") },
    { header: "Created", accessor: "createdAt", render: (row) => formatDate(row.createdAt) },
  ];
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Storage" description="Buckets provisioned for workspace documents and media." />
      <PlatformPermissionGate permission="platform.storage.view">
        <SectionCard title="Buckets" bodyClassName="p-0">
          <DataTable columns={columns} data={data ?? []} loading={isPending} emptyMessage="No storage buckets provisioned yet." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
