import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { useVehicle } from "@/hooks/useAutomotive";
import { useWorkspace } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/automotive/vehicles/$vehicleId")({ component: VehicleDetail });

function VehicleDetail() {
  const { vehicleId } = useParams() as { vehicleId: string };
  const { tenant } = useWorkspace();
  const { data: vehicle } = useVehicle(tenant?.id ?? "", vehicleId);

  return (
    <>
      <PageHeader title={vehicle?.vin ?? "Vehicle"} description={vehicle?.make ? `${vehicle.make} ${vehicle.model}` : "Vehicle details"} />
      <Card className="panel p-4">
        <pre className="text-sm">{JSON.stringify(vehicle, null, 2)}</pre>
      </Card>
    </>
  );
}
