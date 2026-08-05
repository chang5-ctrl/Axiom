import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Table } from "@/components/ui/table";
import { useWorkspace } from "@/hooks/useAuth";
import { useCreateReservation } from "@/hooks/useAutomotive";

export const Route = createFileRoute("/_authenticated/app/automotive/reservations")({ component: ReservationsPage });

function ReservationsPage() {
  const { tenant } = useWorkspace();
  const createRes = useCreateReservation(tenant?.id ?? "");

  return (
    <>
      <PageHeader title="Reservations" description="Vehicle reservations" />
      <div className="panel p-4">
        <Table columns={[{ Header: "Vehicle", accessor: "vehicle_id" }, { Header: "Customer", accessor: "customer_id" }, { Header: "Status", accessor: "status" } ] as any} data={[]} loading={false} />
      </div>
    </>
  );
}
