import { createFileRoute } from "@tanstack/react-router";

import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Button } from "@/components/ui/button";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { useSupportRequests, useUpdateSupportStatus } from "@/hooks/usePlatform";
import { formatDate, titleCase } from "@/lib/format";
import type { SupportRequestRow } from "@/types/platform";

export const Route = createFileRoute("/super-admin/_app/support")({
  component: SupportPage,
});

function SupportPage() {
  const { data, isPending } = useSupportRequests();
  const update = useUpdateSupportStatus();
  const { can } = usePlatformAuth();

  const columns: DataTableColumn<SupportRequestRow>[] = [
    { header: "Subject", accessor: "subject" },
    { header: "Workspace", accessor: "tenantName", render: (row) => row.tenantName ?? "—" },
    { header: "Priority", accessor: "priority", render: (row) => titleCase(row.priority) },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Opened", accessor: "createdAt", render: (row) => formatDate(row.createdAt) },
    {
      header: "Action",
      accessor: "id",
      render: (row) =>
        can("platform.support.manage") && row.status !== "resolved" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={update.isPending}
            onClick={() =>
              update.mutate(
                { id: row.id, status: row.status === "open" ? "pending" : "resolved" },
                { onSuccess: () => toast.success("Support request updated") },
              )
            }
          >
            {row.status === "open" ? "Take" : "Resolve"}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Customers" title="Support" description="Requests raised by workspace owners and their teams." />
      <PlatformPermissionGate permission="platform.support.view">
        <SectionCard title="Queue" bodyClassName="p-0">
          <DataTable columns={columns} data={data ?? []} loading={isPending} emptyMessage="No support requests." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
