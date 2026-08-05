import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Table } from "@/components/ui/table";
import { useWorkspace } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/automotive/sales")({ component: SalesPage });

function SalesPage() {
  const { tenant } = useWorkspace();

  return (
    <>
      <PageHeader title="Sales" description="Sales records" />
      <div className="panel p-4">
        <Table columns={[{ Header: "Vehicle", accessor: "vehicle_id" }, { Header: "Customer", accessor: "customer_id" }, { Header: "Price", accessor: "sale_price" } ] as any} data={[]} loading={false} />
      </div>
    </>
  );
}
