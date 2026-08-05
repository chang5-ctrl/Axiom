import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useAutomotive";

export const Route = createFileRoute("/_authenticated/app/automotive/vehicles")({ component: VehiclesPage });

function VehiclesPage() {
  const { tenant } = useWorkspace();
  const { data: vehicles = [], isLoading } = useVehicles(tenant?.id ?? "", { perPage: 25 });

  const columns = [
    { Header: "VIN", accessor: "vin" },
    { Header: "Stock #", accessor: "stock_number" },
    { Header: "Make", accessor: "make" },
    { Header: "Model", accessor: "model" },
    { Header: "Year", accessor: "year" },
    { Header: "Price", accessor: "price" },
    { Header: "Status", accessor: "status" },
    { Header: "Actions", accessor: "actions" },
  ];

  return (
    <>
      <PageHeader title="Vehicles" description="Manage vehicle inventory" actions={<Button><Plus className="size-4" /> Add vehicle</Button>} />
      <div className="panel p-4">
        <Table columns={columns as any} data={vehicles as any} loading={isLoading} />
      </div>
    </>
  );
}
