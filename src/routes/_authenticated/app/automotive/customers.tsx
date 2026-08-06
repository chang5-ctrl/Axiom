import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useWorkspace } from "@/hooks/useAuth";
import { useCustomers } from "@/hooks/useAutomotive";
import type { AutomotiveCustomer } from "@/types/automotive";

export const Route = createFileRoute("/_authenticated/app/automotive/customers")({
  component: CustomersPage,
  head: () => ({
    meta: [
      { title: "Customers · Axiom Automotive" },
      { name: "description", content: "Customer profiles and sales leads for your dealership." },
      { property: "og:title", content: "Customers · Axiom Automotive" },
      { property: "og:description", content: "Track dealership customers and leads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const columns: DataTableColumn<AutomotiveCustomer>[] = [
  { header: "First name", accessor: "first_name" },
  { header: "Last name", accessor: "last_name" },
  { header: "Phone", accessor: "phone" },
  { header: "Email", accessor: "email" },
  { header: "Status", accessor: "status" },
];

function CustomersPage() {
  const { tenant } = useWorkspace();
  const { data: customers = [], isLoading } = useCustomers(tenant?.id ?? "");

  return (
    <>
      <PageHeader title="Customers" description="Customer profiles and leads" />
      <div className="panel p-4">
        <DataTable
          columns={columns}
          data={customers}
          loading={isLoading}
          emptyMessage="No customers yet."
        />
      </div>
    </>
  );
}
