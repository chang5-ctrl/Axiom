import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Input } from "@/components/ui/input";
import { usePlatformTenants } from "@/hooks/usePlatform";
import { formatDate, formatNumber } from "@/lib/format";
import type { PlatformTenantRow } from "@/types/platform";

export const Route = createFileRoute("/super-admin/_app/tenants")({
  component: TenantsPage,
});

function TenantsPage() {
  const [search, setSearch] = useState("");
  const { data, isPending } = usePlatformTenants(search ? { search } : {});

  const columns: DataTableColumn<PlatformTenantRow>[] = [
    { header: "Workspace", accessor: "name" },
    { header: "Industry", accessor: "industry", render: (row) => row.industry ?? "—" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Plan", accessor: "planName", render: (row) => row.planName ?? "—" },
    { header: "Members", accessor: "members", render: (row) => formatNumber(row.members) },
    { header: "Created", accessor: "createdAt", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Workspaces"
        description="Every business workspace on the platform. Customer records inside a workspace are never exposed here."
      />
      <PlatformPermissionGate permission="platform.tenants.view">
        <SectionCard
          title="Directory"
          bodyClassName="p-0"
          actions={
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or slug"
              className="h-9 w-56"
            />
          }
        >
          <DataTable columns={columns} data={data ?? []} loading={isPending} emptyMessage="No workspaces match this search." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
