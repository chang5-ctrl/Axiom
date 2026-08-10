import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useWorkspace } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useAutomotive";
import type { AutomotiveReservation } from "@/types/automotive";

export const Route = createFileRoute("/_authenticated/app/automotive/reservations")({
  component: ReservationsPage,
  head: () => ({
    meta: [
      { title: "Reservations · Rocdwels AI Automotive" },
      { name: "description", content: "Vehicle reservations and holds for your dealership." },
      { property: "og:title", content: "Reservations · Rocdwels AI Automotive" },
      { property: "og:description", content: "Manage active vehicle reservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const columns: DataTableColumn<AutomotiveReservation>[] = [
  { header: "Vehicle", accessor: "vehicle_id" },
  { header: "Customer", accessor: "customer_id" },
  { header: "Reserved on", accessor: "reservation_date" },
  { header: "Status", accessor: "status" },
];

function ReservationsPage() {
  const { tenant } = useWorkspace();
  const { data: reservations = [], isLoading } = useReservations(tenant?.id ?? "");

  return (
    <>
      <PageHeader title="Reservations" description="Vehicle reservations" />
      <div className="panel p-4">
        <DataTable
          columns={columns}
          data={reservations}
          loading={isLoading}
          emptyMessage="No reservations yet."
        />
      </div>
    </>
  );
}
