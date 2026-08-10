import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import type { AutomotiveSale } from "@/types/automotive";

export const Route = createFileRoute("/_authenticated/app/automotive/sales")({
  component: SalesPage,
  head: () => ({
    meta: [
      { title: "Sales · Rocdwels AI Automotive" },
      { name: "description", content: "Vehicle sales records and delivery status." },
      { property: "og:title", content: "Sales · Rocdwels AI Automotive" },
      { property: "og:description", content: "Review dealership sales and payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const columns: DataTableColumn<AutomotiveSale>[] = [
  { header: "Vehicle", accessor: "vehicle_id" },
  { header: "Customer", accessor: "customer_id" },
  { header: "Price", accessor: "sale_price" },
  { header: "Payment", accessor: "payment_status" },
];

function SalesPage() {
  return (
    <>
      <PageHeader title="Sales" description="Sales records" />
      <div className="panel p-4">
        <DataTable
          columns={columns}
          data={[] as AutomotiveSale[]}
          emptyMessage="No sales recorded yet."
        />
      </div>
    </>
  );
}
