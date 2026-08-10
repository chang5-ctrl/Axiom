import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useAutomotive";
import type { AutomotiveVehicle } from "@/types/automotive";

export const Route = createFileRoute("/_authenticated/app/automotive/vehicles")({
  component: VehiclesPage,
  head: () => ({
    meta: [
      { title: "Vehicle inventory · Rocdwels AI Automotive" },
      { name: "description", content: "Manage your dealership vehicle inventory in Rocdwels AI." },
      { property: "og:title", content: "Vehicle inventory · Rocdwels AI Automotive" },
      { property: "og:description", content: "Track stock, pricing and vehicle status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const columns: DataTableColumn<AutomotiveVehicle>[] = [
  { header: "VIN", accessor: "vin" },
  { header: "Stock #", accessor: "stock_number" },
  { header: "Make", accessor: "make" },
  { header: "Model", accessor: "model" },
  { header: "Year", accessor: "year" },
  { header: "Price", accessor: "price" },
  { header: "Status", accessor: "status" },
];

function VehiclesPage() {
  const { tenant } = useWorkspace();
  const { data: vehicles = [], isLoading } = useVehicles(tenant?.id ?? "", { perPage: 25 });

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage vehicle inventory"
        actions={
          <Button>
            <Plus className="size-4" /> Add vehicle
          </Button>
        }
      />
      <div className="panel p-4">
        <DataTable
          columns={columns}
          data={vehicles}
          loading={isLoading}
          emptyMessage="No vehicles in inventory yet."
        />
      </div>
    </>
  );
}
