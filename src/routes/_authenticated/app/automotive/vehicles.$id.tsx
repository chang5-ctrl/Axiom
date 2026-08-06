import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { useVehicle } from "@/hooks/useAutomotive";
import { useWorkspace } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/automotive/vehicles/$id")({
  component: VehicleDetail,
  head: () => ({
    meta: [
      { title: "Vehicle details · Axiom Automotive" },
      { name: "description", content: "Full specification and status for a single vehicle." },
      { property: "og:title", content: "Vehicle details · Axiom Automotive" },
      { property: "og:description", content: "Inspect vehicle specification, pricing and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const { tenant } = useWorkspace();
  const { data: vehicle } = useVehicle(tenant?.id ?? "", id);

  return (
    <>
      <PageHeader
        title={vehicle?.vin ?? "Vehicle"}
        description={
          vehicle?.make ? `${vehicle.make} ${vehicle.model ?? ""}`.trim() : "Vehicle details"
        }
      />
      <Card className="panel p-4">
        <pre className="overflow-auto text-sm">{JSON.stringify(vehicle, null, 2)}</pre>
      </Card>
    </>
  );
}
