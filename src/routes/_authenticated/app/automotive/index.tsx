import { createFileRoute } from "@tanstack/react-router";
import { Car, Users, BadgeDollarSign, Calendar, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useAutomotive";

export const Route = createFileRoute("/_authenticated/app/automotive/")({ component: AutomotiveIndex });

function AutomotiveIndex() {
  const { tenant } = useWorkspace();
  const { data: vehicles = [] } = useVehicles(tenant?.id ?? "", { perPage: 5 });

  const available = vehicles.filter((v: any) => v.status === "available").length;
  const reserved = vehicles.filter((v: any) => v.status === "reserved").length;
  const sold = vehicles.filter((v: any) => v.status === "sold").length;

  return (
    <>
      <PageHeader title="Automotive" description="Vehicle dealership management" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vehicles Available" value={available} icon={Car} />
        <StatCard label="Vehicles Reserved" value={reserved} icon={Calendar} />
        <StatCard label="Vehicles Sold" value={sold} icon={BadgeDollarSign} />
        <StatCard label="Revenue" value={"—"} icon={BadgeDollarSign} />
      </div>
      <Card className="panel p-6">
        <h3 className="text-lg font-semibold">Recent sales</h3>
        <p className="text-sm text-muted-foreground mt-2">Recent sales and customer activity will appear here.</p>
      </Card>
    </>
  );
}
